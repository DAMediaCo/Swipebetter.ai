import jwt from "jsonwebtoken";
import {
  createAppleServerApiToken,
  decodeAppleJwsPayload,
  validateAppleTransaction,
  type AppleTransactionPayload,
} from "../server/appleIap";

const expectedBundleId = "ai.swipebetter.app";
const expectedProductIds = [
  "ai.swipebetter.starter",
  "ai.swipebetter.unlimited.monthly",
  "ai.swipebetter.unlimited.annual",
];

type AppStoreConnectResource<TAttributes extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  type: string;
  attributes?: TAttributes;
};

type AppStoreConnectList<TAttributes extends Record<string, unknown> = Record<string, unknown>> = {
  data?: AppStoreConnectResource<TAttributes>[];
  links?: {
    next?: string;
  };
};

type AppStoreConnectSingle<TAttributes extends Record<string, unknown> = Record<string, unknown>> = {
  data?: AppStoreConnectResource<TAttributes>;
};

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

async function fetchAppStoreConnect<T>(token: string, pathOrUrl: string): Promise<T> {
  const url = pathOrUrl.startsWith("https://")
    ? pathOrUrl
    : `https://api.appstoreconnect.apple.com${pathOrUrl}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`App Store Connect request failed: HTTP ${response.status} ${await response.text()}`);
  }

  return response.json() as Promise<T>;
}

async function fetchAllAppStoreConnectResources<TAttributes extends Record<string, unknown>>(
  token: string,
  path: string
): Promise<AppStoreConnectResource<TAttributes>[]> {
  let next: string | undefined = path;
  const resources: AppStoreConnectResource<TAttributes>[] = [];

  while (next) {
    const page = await fetchAppStoreConnect<AppStoreConnectList<TAttributes>>(token, next);
    resources.push(...(page.data || []));
    next = page.links?.next;
  }

  return resources;
}

async function verifyAppStoreConnectProducts(token: string, appId: string, bundleId: string) {
  const app = await fetchAppStoreConnect<AppStoreConnectSingle<{ bundleId?: string; name?: string }>>(
    token,
    `/v1/apps/${appId}`
  );

  if (app.data?.attributes?.bundleId !== bundleId) {
    throw new Error(`App Store Connect app bundle mismatch: expected ${bundleId}, got ${app.data?.attributes?.bundleId || "unknown"}`);
  }

  const products = new Set<string>();
  const oneTimePurchases = await fetchAllAppStoreConnectResources<{ productId?: string }>(
    token,
    `/v1/apps/${appId}/inAppPurchasesV2?limit=200`
  );
  for (const purchase of oneTimePurchases) {
    if (purchase.attributes?.productId) {
      products.add(purchase.attributes.productId);
    }
  }

  const subscriptionGroups = await fetchAllAppStoreConnectResources(token, `/v1/apps/${appId}/subscriptionGroups?limit=200`);
  for (const group of subscriptionGroups) {
    const subscriptions = await fetchAllAppStoreConnectResources<{ productId?: string }>(
      token,
      `/v1/subscriptionGroups/${group.id}/subscriptions?limit=200`
    );
    for (const subscription of subscriptions) {
      if (subscription.attributes?.productId) {
        products.add(subscription.attributes.productId);
      }
    }
  }

  const missing = expectedProductIds.filter((productId) => !products.has(productId));
  if (missing.length) {
    throw new Error(`Missing App Store Connect products: ${missing.join(", ")}`);
  }

  console.log(`App Store Connect app matched bundle ID ${bundleId}.`);
  console.log(`App Store Connect products found: ${expectedProductIds.join(", ")}`);
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

  const appId = process.env.APPLE_APP_ID?.trim();
  if (!appId) {
    console.log("No APPLE_APP_ID set; skipped App Store Connect product lookup.");
  } else {
    await verifyAppStoreConnectProducts(token, appId, bundleId);
  }

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
