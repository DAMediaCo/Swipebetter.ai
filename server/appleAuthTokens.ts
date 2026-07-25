import crypto from "node:crypto";
import appleSignin from "apple-signin-auth";

const ENVELOPE_VERSION = "v1";

export type AppleTokenConfig = {
  teamId: string;
  keyId: string;
  privateKey: string;
  encryptionKey: string;
};

type AppleTokenResponse = {
  refresh_token?: string;
  error?: string;
  error_description?: string;
};

type AppleTokenDependencies = {
  exchange: (
    code: string,
    options: {
      clientID: string;
      redirectUri: string;
      clientSecret: string;
    },
  ) => Promise<AppleTokenResponse>;
  revoke: (
    token: string,
    options: {
      clientID: string;
      clientSecret: string;
      tokenTypeHint: "refresh_token";
    },
  ) => Promise<unknown>;
};

const defaultDependencies: AppleTokenDependencies = {
  exchange: appleSignin.getAuthorizationToken,
  revoke: appleSignin.revokeAuthorizationToken,
};

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for Sign in with Apple account deletion`);
  }
  return value;
}

export function appleTokenConfigFromEnvironment(): AppleTokenConfig {
  return {
    teamId: required("APPLE_SIGN_IN_TEAM_ID"),
    keyId: required("APPLE_SIGN_IN_KEY_ID"),
    privateKey: required("APPLE_SIGN_IN_PRIVATE_KEY").replace(/\\n/g, "\n"),
    encryptionKey: required("APPLE_TOKEN_ENCRYPTION_KEY"),
  };
}

function encryptionKey(config: AppleTokenConfig): Buffer {
  const key = Buffer.from(config.encryptionKey, "base64");
  if (key.length !== 32) {
    throw new Error("APPLE_TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes");
  }
  return key;
}

function clientSecret(clientId: string, config: AppleTokenConfig): string {
  return appleSignin.getClientSecret({
    clientID: clientId,
    teamID: config.teamId,
    keyIdentifier: config.keyId,
    privateKey: config.privateKey,
    expAfter: 300,
  });
}

export function encryptAppleRefreshToken(
  refreshToken: string,
  config: AppleTokenConfig,
): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(config), iv);
  const ciphertext = Buffer.concat([
    cipher.update(refreshToken, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    ENVELOPE_VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decryptAppleRefreshToken(
  envelope: string,
  config: AppleTokenConfig,
): string {
  const [version, ivValue, tagValue, ciphertextValue, extra] = envelope.split(".");
  if (
    version !== ENVELOPE_VERSION
    || !ivValue
    || !tagValue
    || !ciphertextValue
    || extra !== undefined
  ) {
    throw new Error("Invalid encrypted Apple refresh token");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey(config),
    Buffer.from(ivValue, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export async function exchangeAppleAuthorizationCode(
  code: string,
  clientId: string,
  redirectUri?: string,
  config = appleTokenConfigFromEnvironment(),
  dependencies = defaultDependencies,
): Promise<string> {
  const response = await dependencies.exchange(code, {
    clientID: clientId,
    clientSecret: clientSecret(clientId, config),
    redirectUri: redirectUri || "",
  });

  if (!response.refresh_token) {
    const detail = response.error_description || response.error || "missing refresh token";
    throw new Error(`Apple authorization exchange failed: ${detail}`);
  }

  return encryptAppleRefreshToken(response.refresh_token, config);
}

export async function revokeAppleAuthorization(
  encryptedRefreshToken: string,
  clientId: string,
  config = appleTokenConfigFromEnvironment(),
  dependencies = defaultDependencies,
): Promise<void> {
  const refreshToken = decryptAppleRefreshToken(encryptedRefreshToken, config);
  const response = await dependencies.revoke(refreshToken, {
    clientID: clientId,
    clientSecret: clientSecret(clientId, config),
    tokenTypeHint: "refresh_token",
  });

  if (
    response
    && typeof response === "object"
    && "error" in response
    && typeof response.error === "string"
  ) {
    throw new Error(`Apple authorization revocation failed: ${response.error}`);
  }
}
