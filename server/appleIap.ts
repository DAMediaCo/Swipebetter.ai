import jwt from "jsonwebtoken";

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

export type AppleServerApiTokenConfig = {
  issuerId: string;
  keyId: string;
  bundleId: string;
  privateKey: string;
};

export type AppStoreConnectApiTokenConfig = {
  issuerId: string;
  keyId: string;
  privateKey: string;
};

export class AppleIapValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppleIapValidationError";
  }
}

export class AppleIapOwnershipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppleIapOwnershipError";
  }
}

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
  const expectedBundleId = options.expectedBundleId || process.env.APPLE_BUNDLE_ID || "app.replit.swipebetter";
  const now = options.now ?? Date.now();

  if (transaction.bundleId !== expectedBundleId) {
    throw new AppleIapValidationError("Apple transaction bundle mismatch");
  }
  if (requestedProductId && transaction.productId !== requestedProductId) {
    throw new AppleIapValidationError("Apple product mismatch");
  }
  if (!isAppleIapProduct(transaction.productId)) {
    throw new AppleIapValidationError("Unsupported Apple product");
  }
  if (isAppleSubscriptionProduct(transaction.productId) && !transaction.expiresDate) {
    throw new AppleIapValidationError("Apple subscription transaction is missing an expiration date");
  }
  if (!options.allowExpired && transaction.expiresDate && Number(transaction.expiresDate) < now && isAppleSubscriptionProduct(transaction.productId)) {
    throw new AppleIapValidationError("Apple subscription transaction is expired");
  }
}

export function normalizedAppleAppAccountToken(token?: string | null): string | undefined {
  const normalized = token?.trim().toLowerCase();
  return normalized || undefined;
}

export function appleAppAccountTokenMatchesUser(token: string | undefined | null, userId: string): boolean {
  const normalizedToken = normalizedAppleAppAccountToken(token);
  return !normalizedToken || normalizedToken === userId.toLowerCase();
}

export function appleAppAccountTokensMatch(
  transactionToken: string | undefined | null,
  requestedToken: string | undefined | null
): boolean {
  const normalizedTransactionToken = normalizedAppleAppAccountToken(transactionToken);
  const normalizedRequestedToken = normalizedAppleAppAccountToken(requestedToken);
  return Boolean(
    normalizedTransactionToken
      && normalizedRequestedToken
      && normalizedTransactionToken === normalizedRequestedToken
  );
}

export function stripeSubscriptionPreservesAccess(subscription: {
  stripeSubscriptionId?: string | null;
  status?: string | null;
}): boolean {
  return Boolean(
    subscription.stripeSubscriptionId
      && (subscription.status === "active" || subscription.status === "trialing")
  );
}

export function decodeAppleJwsPayload<T extends Record<string, any>>(jws: string): T {
  const parts = jws.split(".");
  if (parts.length < 2 || !parts[1]) {
    throw new Error("Invalid Apple signed payload");
  }

  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as T;
  } catch {
    throw new Error("Invalid Apple signed payload");
  }
}

export function createAppleServerApiToken(config: AppleServerApiTokenConfig): string {
  return jwt.sign(
    { bid: config.bundleId },
    config.privateKey,
    {
      algorithm: "ES256",
      audience: "appstoreconnect-v1",
      issuer: config.issuerId,
      keyid: config.keyId,
      expiresIn: "5m",
    }
  );
}

export function createAppStoreConnectApiToken(config: AppStoreConnectApiTokenConfig): string {
  return jwt.sign(
    {},
    config.privateKey,
    {
      algorithm: "ES256",
      audience: "appstoreconnect-v1",
      issuer: config.issuerId,
      keyid: config.keyId,
      expiresIn: "5m",
    }
  );
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
