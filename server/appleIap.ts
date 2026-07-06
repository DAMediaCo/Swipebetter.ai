export const APPLE_IAP_PRODUCT_IDS = [
  "ai.swipebetter.starter",
  "ai.swipebetter.unlimited.monthly",
  "ai.swipebetter.unlimited.annual",
] as const;

export type AppleIapProductId = typeof APPLE_IAP_PRODUCT_IDS[number];

export type AppleIapProductConfig = {
  tier: "starter" | "unlimited";
  credits: number;
  planType: "starter" | "monthly" | "annual";
  priceCents: number;
};

export const APPLE_IAP_PRODUCTS = new Set<string>(APPLE_IAP_PRODUCT_IDS);

export const APPLE_SUBSCRIPTION_PRODUCTS = new Set<string>([
  "ai.swipebetter.unlimited.monthly",
  "ai.swipebetter.unlimited.annual",
]);

export const APPLE_IAP_PRODUCT_CONFIG: Record<AppleIapProductId, AppleIapProductConfig> = {
  "ai.swipebetter.starter": {
    tier: "starter",
    credits: 1,
    planType: "starter",
    priceCents: 399,
  },
  "ai.swipebetter.unlimited.monthly": {
    tier: "unlimited",
    credits: 0,
    planType: "monthly",
    priceCents: 1699,
  },
  "ai.swipebetter.unlimited.annual": {
    tier: "unlimited",
    credits: 0,
    planType: "annual",
    priceCents: 10499,
  },
};

export type AppleTransactionPayload = {
  transactionId: string;
  originalTransactionId?: string;
  productId: string;
  bundleId: string;
  purchaseDate?: number;
  expiresDate?: number;
  revocationDate?: number;
  appAccountToken?: string;
  environment?: string;
};

export type AppleIapNotificationAction = "expired" | "renewed" | "acknowledged";

export function isAppleIapProduct(productId: string): productId is AppleIapProductId {
  return APPLE_IAP_PRODUCTS.has(productId);
}

export function isAppleSubscriptionProduct(productId: string): boolean {
  return APPLE_SUBSCRIPTION_PRODUCTS.has(productId);
}

export function getAppleIapProductConfig(productId: string): AppleIapProductConfig {
  if (!isAppleIapProduct(productId)) {
    throw new Error(`Unsupported Apple product ID: ${productId}`);
  }
  return APPLE_IAP_PRODUCT_CONFIG[productId];
}

export function validateAppleTransaction(
  transaction: AppleTransactionPayload,
  requestedProductId?: string,
  options: { allowExpired?: boolean; expectedBundleId?: string; now?: number } = {}
) {
  const expectedBundleId = options.expectedBundleId || process.env.APPLE_BUNDLE_ID || "ai.swipebetter.app";
  const now = options.now ?? Date.now();

  if (transaction.bundleId !== expectedBundleId) {
    throw new Error("Apple transaction bundle mismatch");
  }
  if (requestedProductId && transaction.productId !== requestedProductId) {
    throw new Error("Apple product mismatch");
  }
  if (!isAppleIapProduct(transaction.productId)) {
    throw new Error("Unsupported Apple product");
  }
  if (!options.allowExpired && transaction.expiresDate && Number(transaction.expiresDate) < now && isAppleSubscriptionProduct(transaction.productId)) {
    throw new Error("Apple subscription transaction is expired");
  }
}

export function shouldExpireAppleTransaction(
  type: string | undefined,
  transaction: AppleTransactionPayload,
  now = Date.now()
): boolean {
  if (transaction.revocationDate) return true;

  const transactionExpired = transaction.expiresDate ? Number(transaction.expiresDate) < now : false;
  return (type === "EXPIRED" || type === "GRACE_PERIOD_EXPIRED" || type === "DID_FAIL_TO_RENEW")
    && transactionExpired;
}

export function isRenewingAppleNotification(type?: string): boolean {
  return type === "SUBSCRIBED"
    || type === "DID_RENEW"
    || type === "DID_RECOVER"
    || type === "OFFER_REDEEMED";
}

export function classifyAppleNotification(
  type: string | undefined,
  transaction: AppleTransactionPayload,
  now = Date.now()
): AppleIapNotificationAction {
  if (shouldExpireAppleTransaction(type, transaction, now)) {
    return "expired";
  }

  if (isRenewingAppleNotification(type)) {
    return "renewed";
  }

  return "acknowledged";
}
