import assert from "node:assert/strict";
import test from "node:test";
import {
  APPLE_IAP_PRODUCT_CONFIG,
  classifyAppleNotification,
  getAppleIapProductConfig,
  isAppleIapProduct,
  isAppleSubscriptionProduct,
  isRenewingAppleNotification,
  shouldExpireAppleTransaction,
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
    /bundle mismatch/
  );
  assert.throws(
    () => validateAppleTransaction(transaction(), "ai.swipebetter.unlimited.annual", { now }),
    /product mismatch/
  );
});

test("validateAppleTransaction rejects expired subscriptions unless explicitly allowed", () => {
  const expired = transaction({ expiresDate: now - 60_000 });
  assert.throws(
    () => validateAppleTransaction(expired, "ai.swipebetter.unlimited.monthly", { now }),
    /subscription transaction is expired/
  );
  assert.doesNotThrow(() => validateAppleTransaction(expired, "ai.swipebetter.unlimited.monthly", { now, allowExpired: true }));
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
