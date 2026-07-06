import jwt from "jsonwebtoken";
import {
  createAppleServerApiToken,
  decodeAppleJwsPayload,
  validateAppleTransaction,
  type AppleTransactionPayload,
} from "../server/appleIap";

const expectedBundleId = "ai.swipebetter.app";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function applePrivateKey(): string {
  return requireEnv("APPLE_IAP_PRIVATE_KEY").replace(/\\n/g, "\n");
}

async function fetchAppleTransaction(
  transactionId: string,
  token: string,
  bundleId: string
): Promise<{ environment: string; transaction: AppleTransactionPayload }> {
  const endpoints = [
    { environment: "Production", url: `https://api.storekit.itunes.apple.com/inApps/v1/transactions/${transactionId}` },
    { environment: "Sandbox", url: `https://api.storekit-sandbox.itunes.apple.com/inApps/v1/transactions/${transactionId}` },
  ];

  const failures: string[] = [];
  for (const endpoint of endpoints) {
    const response = await fetch(endpoint.url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      failures.push(`${endpoint.environment}: HTTP ${response.status}`);
      continue;
    }

    const body = await response.json() as { signedTransactionInfo?: string };
    if (!body.signedTransactionInfo) {
      throw new Error(`${endpoint.environment} response missing signedTransactionInfo`);
    }

    const transaction = decodeAppleJwsPayload<AppleTransactionPayload>(body.signedTransactionInfo);
    validateAppleTransaction(transaction, undefined, {
      allowExpired: true,
      expectedBundleId: bundleId,
    });

    return {
      environment: endpoint.environment,
      transaction: {
        ...transaction,
        environment: transaction.environment || endpoint.environment,
      },
    };
  }

  throw new Error(`Apple transaction probe failed (${failures.join("; ")})`);
}

async function main() {
  const issuerId = requireEnv("APPLE_IAP_ISSUER_ID");
  const keyId = requireEnv("APPLE_IAP_KEY_ID");
  const privateKey = applePrivateKey();
  const bundleId = process.env.APPLE_BUNDLE_ID?.trim() || expectedBundleId;

  if (bundleId !== expectedBundleId) {
    throw new Error(`APPLE_BUNDLE_ID must be ${expectedBundleId}; got ${bundleId}`);
  }

  const token = createAppleServerApiToken({ issuerId, keyId, bundleId, privateKey });
  const decoded = jwt.decode(token, { complete: true }) as {
    header?: { alg?: string; kid?: string };
    payload?: { aud?: string; bid?: string; iss?: string };
  } | null;

  if (decoded?.header?.alg !== "ES256" || decoded.header.kid !== keyId) {
    throw new Error("Apple server API token header is invalid");
  }
  if (
    decoded.payload?.aud !== "appstoreconnect-v1"
    || decoded.payload.bid !== bundleId
    || decoded.payload.iss !== issuerId
  ) {
    throw new Error("Apple server API token payload is invalid");
  }

  console.log("Apple IAP key can sign an App Store Server API token.");
  console.log(`Bundle ID: ${bundleId}`);
  console.log(`Key ID: ${keyId}`);

  const transactionId = process.env.APPLE_IAP_TEST_TRANSACTION_ID?.trim();
  if (!transactionId) {
    console.log("No APPLE_IAP_TEST_TRANSACTION_ID set; skipped live transaction probe.");
    return;
  }

  const result = await fetchAppleTransaction(transactionId, token, bundleId);
  console.log(`Apple transaction probe passed in ${result.environment}.`);
  console.log(`Product ID: ${result.transaction.productId}`);
  console.log(`Transaction ID: ${result.transaction.transactionId}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
