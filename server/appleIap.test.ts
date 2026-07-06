import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";
import jwt from "jsonwebtoken";
import {
  APPLE_IAP_PRODUCT_CONFIG,
  AppleIapOwnershipError,
  AppleIapValidationError,
  appleAppAccountTokenMatchesUser,
  classifyAppleNotification,
  createAppleServerApiToken,
  decodeAppleJwsPayload,
  getAppleIapProductConfig,
  isAppleIapProduct,
  isAppleSubscriptionProduct,
  isRenewingAppleNotification,
  normalizedAppleAppAccountToken,
  shouldExpireAppleTransaction,
  stripeSubscriptionPreservesAccess,
  validateAppleTransaction,
  type AppleTransactionPayload,
} from "./appleIap";

const now = Date.UTC(2026, 0, 1);

function transaction(overrides: Partial<AppleTransactionPayload> = {}): AppleTransactionPayload {
  return {
    transactionId: "1000000000000001",
    productId: "ai.swipebetter.unlimited.monthly",
    bundleId: "ai.swipebetter.app",
    expiresDate: now + 60_000,
    ...overrides,
  };
}

function unsignedJws(payload: Record<string, unknown>): string {
  const encodedHeader = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedHeader}.${encodedPayload}.`;
}

test("Apple IAP product config matches shipped iOS pricing", () => {
  assert.deepEqual(APPLE_IAP_PRODUCT_CONFIG["ai.swipebetter.starter"], {
    tier: "starter",
    credits: 1,
    planType: "starter",
    priceCents: 399,
  });
  assert.equal(APPLE_IAP_PRODUCT_CONFIG["ai.swipebetter.unlimited.monthly"].priceCents, 1699);
  assert.equal(APPLE_IAP_PRODUCT_CONFIG["ai.swipebetter.unlimited.annual"].priceCents, 10499);
});

test("Apple ownership conflicts use a dedicated error", () => {
  const error = new AppleIapOwnershipError("Apple transaction is already linked to another account");
  assert.equal(error.name, "AppleIapOwnershipError");
  assert.equal(error.message, "Apple transaction is already linked to another account");
});

test("Apple IAP product helpers reject unknown product IDs", () => {
  assert.equal(isAppleIapProduct("ai.swipebetter.starter"), true);
  assert.equal(isAppleSubscriptionProduct("ai.swipebetter.unlimited.annual"), true);
  assert.equal(isAppleSubscriptionProduct("ai.swipebetter.starter"), false);
  assert.throws(() => getAppleIapProductConfig("not.a.real.product"), /Unsupported Apple product ID/);
});

test("validateAppleTransaction enforces bundle and product identity", () => {
  assert.doesNotThrow(() => validateAppleTransaction(transaction(), "ai.swipebetter.unlimited.monthly", { now }));
  assert.throws(
    () => validateAppleTransaction(transaction({ bundleId: "ai.other.app" }), "ai.swipebetter.unlimited.monthly", { now }),
    (error) => error instanceof AppleIapValidationError && /bundle mismatch/.test(error.message)
  );
  assert.throws(
    () => validateAppleTransaction(transaction(), "ai.swipebetter.unlimited.annual", { now }),
    (error) => error instanceof AppleIapValidationError && /product mismatch/.test(error.message)
  );
});

test("validateAppleTransaction rejects expired subscriptions unless explicitly allowed", () => {
  const expired = transaction({ expiresDate: now - 60_000 });
  assert.throws(
    () => validateAppleTransaction(expired, "ai.swipebetter.unlimited.monthly", { now }),
    (error) => error instanceof AppleIapValidationError && /subscription transaction is expired/.test(error.message)
  );
  assert.doesNotThrow(() => validateAppleTransaction(expired, "ai.swipebetter.unlimited.monthly", { now, allowExpired: true }));
});

test("validateAppleTransaction requires subscription expiration dates", () => {
  assert.throws(
    () => validateAppleTransaction(transaction({ expiresDate: undefined }), "ai.swipebetter.unlimited.monthly", { now }),
    (error) => error instanceof AppleIapValidationError && /missing an expiration date/.test(error.message)
  );
  assert.doesNotThrow(() => validateAppleTransaction(transaction({
    productId: "ai.swipebetter.starter",
    expiresDate: undefined,
  }), "ai.swipebetter.starter", { now }));
});

test("Apple app account tokens are normalized before user matching", () => {
  const userId = "A2C13A6C-882E-4C22-8788-0D44559F8418";

  assert.equal(
    normalizedAppleAppAccountToken("  A2C13A6C-882E-4C22-8788-0D44559F8418  "),
    "a2c13a6c-882e-4c22-8788-0d44559f8418"
  );
  assert.equal(appleAppAccountTokenMatchesUser(undefined, userId), true);
  assert.equal(appleAppAccountTokenMatchesUser("", userId), true);
  assert.equal(appleAppAccountTokenMatchesUser("a2c13a6c-882e-4c22-8788-0d44559f8418", userId), true);
  assert.equal(appleAppAccountTokenMatchesUser("d0c13a6c-882e-4c22-8788-0d44559f8418", userId), false);
});

test("active Stripe subscriptions preserve access during Apple expiry handling", () => {
  assert.equal(stripeSubscriptionPreservesAccess({
    stripeSubscriptionId: "sub_active",
    status: "active",
  }), true);
  assert.equal(stripeSubscriptionPreservesAccess({
    stripeSubscriptionId: "sub_trial",
    status: "trialing",
  }), true);
  assert.equal(stripeSubscriptionPreservesAccess({
    stripeSubscriptionId: "sub_canceled",
    status: "canceled",
  }), false);
  assert.equal(stripeSubscriptionPreservesAccess({
    stripeSubscriptionId: null,
    status: "active",
  }), false);
});

test("authenticated purchase sync can detect missing Apple app account tokens", () => {
  assert.equal(normalizedAppleAppAccountToken(undefined), undefined);
  assert.equal(normalizedAppleAppAccountToken("   "), undefined);
});

test("decodeAppleJwsPayload decodes payloads and rejects malformed input", () => {
  assert.deepEqual(
    decodeAppleJwsPayload<{ transactionId: string; productId: string }>(unsignedJws({
      transactionId: "1000000000000001",
      productId: "ai.swipebetter.starter",
    })),
    {
      transactionId: "1000000000000001",
      productId: "ai.swipebetter.starter",
    }
  );
  assert.throws(() => decodeAppleJwsPayload("not-a-jws"), /Invalid Apple signed payload/);
  assert.throws(() => decodeAppleJwsPayload("header.%%%%.signature"), /Invalid Apple signed payload/);
});

test("createAppleServerApiToken creates the App Store Server API claims", () => {
  const { privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const token = createAppleServerApiToken({
    issuerId: "00000000-0000-0000-0000-000000000000",
    keyId: "ABC123DEFG",
    bundleId: "ai.swipebetter.app",
    privateKey: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
  });
  const decoded = jwt.decode(token, { complete: true }) as {
    header?: { alg?: string; kid?: string };
    payload?: { aud?: string; bid?: string; iss?: string };
  } | null;

  assert.equal(decoded?.header?.alg, "ES256");
  assert.equal(decoded?.header?.kid, "ABC123DEFG");
  assert.equal(decoded?.payload?.aud, "appstoreconnect-v1");
  assert.equal(decoded?.payload?.bid, "ai.swipebetter.app");
  assert.equal(decoded?.payload?.iss, "00000000-0000-0000-0000-000000000000");
});

test("shouldExpireAppleTransaction only expires from Apple-fetched facts", () => {
  assert.equal(shouldExpireAppleTransaction("EXPIRED", transaction({ expiresDate: now + 60_000 }), now), false);
  assert.equal(shouldExpireAppleTransaction("DID_FAIL_TO_RENEW", transaction({ expiresDate: now - 60_000 }), now), true);
  assert.equal(shouldExpireAppleTransaction("REFUND", transaction({ expiresDate: now + 60_000 }), now), false);
  assert.equal(shouldExpireAppleTransaction("REFUND", transaction({ revocationDate: now - 1 }), now), true);
});

test("isRenewingAppleNotification recognizes entitlement-granting notifications", () => {
  assert.equal(isRenewingAppleNotification("SUBSCRIBED"), true);
  assert.equal(isRenewingAppleNotification("DID_RENEW"), true);
  assert.equal(isRenewingAppleNotification("DID_RECOVER"), true);
  assert.equal(isRenewingAppleNotification("OFFER_REDEEMED"), true);
  assert.equal(isRenewingAppleNotification("DID_CHANGE_RENEWAL_STATUS"), false);
  assert.equal(isRenewingAppleNotification(undefined), false);
});

test("classifyAppleNotification prioritizes expiration before renewal", () => {
  assert.equal(classifyAppleNotification("DID_RENEW", transaction(), now), "renewed");
  assert.equal(classifyAppleNotification("SUBSCRIBED", transaction(), now), "renewed");
  assert.equal(classifyAppleNotification("EXPIRED", transaction({ expiresDate: now - 60_000 }), now), "expired");
  assert.equal(classifyAppleNotification("DID_RENEW", transaction({ revocationDate: now - 1 }), now), "expired");
  assert.equal(classifyAppleNotification("DID_CHANGE_RENEWAL_STATUS", transaction(), now), "acknowledged");
  assert.equal(classifyAppleNotification(undefined, transaction(), now), "acknowledged");
});
