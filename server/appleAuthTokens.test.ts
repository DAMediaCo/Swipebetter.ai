import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import {
  decryptAppleRefreshToken,
  encryptAppleRefreshToken,
  exchangeAppleAuthorizationCode,
  revokeAppleAuthorization,
  type AppleTokenConfig,
} from "./appleAuthTokens";

const { privateKey } = crypto.generateKeyPairSync("ec", {
  namedCurve: "P-256",
  privateKeyEncoding: { format: "pem", type: "pkcs8" },
  publicKeyEncoding: { format: "pem", type: "spki" },
});

const config: AppleTokenConfig = {
  teamId: "TESTTEAM01",
  keyId: "TESTKEY001",
  privateKey,
  encryptionKey: crypto.randomBytes(32).toString("base64"),
};

test("Apple refresh tokens are encrypted and authenticated", () => {
  const encrypted = encryptAppleRefreshToken("private-refresh-token", config);

  assert.ok(encrypted.startsWith("v1."));
  assert.ok(!encrypted.includes("private-refresh-token"));
  assert.equal(decryptAppleRefreshToken(encrypted, config), "private-refresh-token");

  const tampered = `${encrypted.slice(0, -1)}${encrypted.endsWith("A") ? "B" : "A"}`;
  assert.throws(() => decryptAppleRefreshToken(tampered, config));
});

test("Apple authorization exchange stores only the encrypted refresh token", async () => {
  const encrypted = await exchangeAppleAuthorizationCode(
    "one-time-code",
    "app.replit.swipebetter",
    undefined,
    config,
    {
      async exchange(code, options) {
        assert.equal(code, "one-time-code");
        assert.equal(options.clientID, "app.replit.swipebetter");
        assert.ok(options.clientSecret.split(".").length === 3);
        return { refresh_token: "refresh-from-apple" };
      },
      async revoke() {},
    },
  );

  assert.ok(!encrypted.includes("refresh-from-apple"));
  assert.equal(decryptAppleRefreshToken(encrypted, config), "refresh-from-apple");
});

test("Apple account deletion decrypts and revokes the refresh token", async () => {
  const encrypted = encryptAppleRefreshToken("refresh-to-revoke", config);
  let revoked = false;

  await revokeAppleAuthorization(
    encrypted,
    "app.replit.swipebetter",
    config,
    {
      async exchange() {
        return {};
      },
      async revoke(token, options) {
        revoked = true;
        assert.equal(token, "refresh-to-revoke");
        assert.equal(options.clientID, "app.replit.swipebetter");
        assert.equal(options.tokenTypeHint, "refresh_token");
      },
    },
  );

  assert.equal(revoked, true);
});
