#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

PROJECT="ios/SwipeBetter/SwipeBetter.xcodeproj"
SCHEME="SwipeBetter"
DESTINATION="${IOS_DESTINATION:-generic/platform=iOS Simulator}"
STOREKIT="ios/SwipeBetter/Configuration.storekit"
PRIVACY="ios/SwipeBetter/Shared/Resources/PrivacyInfo.xcprivacy"
KEYBOARD_PLIST="ios/SwipeBetter/KeyboardExtension/Info.plist"
METADATA="ios/SwipeBetter/AppStoreMetadata.json"

echo "Checking plist files..."
plutil -lint \
  ios/SwipeBetter/SwipeBetterApp/Info.plist \
  ios/SwipeBetter/ShareExtension/Info.plist \
  "$KEYBOARD_PLIST" \
  "$PRIVACY" >/dev/null

echo "Checking keyboard privacy posture..."
REQUESTS_OPEN_ACCESS="$(/usr/libexec/PlistBuddy -c 'Print :NSExtension:NSExtensionAttributes:RequestsOpenAccess' "$KEYBOARD_PLIST")"
if [[ "$REQUESTS_OPEN_ACCESS" != "false" ]]; then
  echo "Keyboard RequestsOpenAccess must stay false for App Review/privacy." >&2
  exit 1
fi

echo "Checking native identifiers, app groups, and privacy contract..."
node <<'NODE'
const fs = require("fs");
const { execFileSync } = require("child_process");

function readPlist(path) {
  return JSON.parse(execFileSync("plutil", ["-convert", "json", "-o", "-", path], { encoding: "utf8" }));
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label} drifted: expected ${expected}, got ${actual}`);
  }
}

function assertIncludes(haystack, needle, label) {
  if (!haystack.includes(needle)) {
    throw new Error(`${label} missing ${needle}`);
  }
}

const project = fs.readFileSync("ios/SwipeBetter/project.yml", "utf8");
for (const bundleId of [
  "PRODUCT_BUNDLE_IDENTIFIER: ai.swipebetter.app",
  "PRODUCT_BUNDLE_IDENTIFIER: ai.swipebetter.app.share",
  "PRODUCT_BUNDLE_IDENTIFIER: ai.swipebetter.app.keyboard",
]) {
  assertIncludes(project, bundleId, "project.yml bundle ID contract");
}
assertIncludes(project, "IPHONEOS_DEPLOYMENT_TARGET: \"17.0\"", "iOS deployment target");

const appInfo = readPlist("ios/SwipeBetter/SwipeBetterApp/Info.plist");
assertEqual(appInfo.CFBundleDisplayName, "SwipeBetter", "main app display name");
assertEqual(appInfo.UIRequiresFullScreen, true, "main app full-screen posture");
const urlScheme = appInfo.CFBundleURLTypes?.[0]?.CFBundleURLSchemes?.[0];
assertEqual(urlScheme, "swipebetter", "main app URL scheme");
assertEqual(appInfo.NSPhotoLibraryUsageDescription, "SwipeBetter uses selected screenshots to analyze dating profiles and chats.", "photo library purpose string");

const shareInfo = readPlist("ios/SwipeBetter/ShareExtension/Info.plist");
assertEqual(shareInfo.NSExtension?.NSExtensionPointIdentifier, "com.apple.share-services", "share extension point");
const shareActivationRule = shareInfo.NSExtension?.NSExtensionAttributes?.NSExtensionActivationRule;
assertEqual(shareActivationRule?.NSExtensionActivationSupportsText, true, "share text support");
assertEqual(shareActivationRule?.NSExtensionActivationSupportsImageWithMaxCount, 10, "share image max count");

const keyboardInfo = readPlist("ios/SwipeBetter/KeyboardExtension/Info.plist");
assertEqual(keyboardInfo.NSExtension?.NSExtensionPointIdentifier, "com.apple.keyboard-service", "keyboard extension point");
assertEqual(keyboardInfo.NSExtension?.NSExtensionAttributes?.RequestsOpenAccess, false, "keyboard open access");

const appEntitlements = readPlist("ios/SwipeBetter/SwipeBetterApp/SwipeBetter.entitlements");
assertIncludes(appEntitlements["com.apple.developer.applesignin"] || [], "Default", "Sign in with Apple entitlement");
assertIncludes(appEntitlements["com.apple.security.application-groups"] || [], "group.ai.swipebetter.shared", "main app app group");

const shareEntitlements = readPlist("ios/SwipeBetter/ShareExtension/SwipeBetterShare.entitlements");
assertIncludes(shareEntitlements["com.apple.security.application-groups"] || [], "group.ai.swipebetter.shared", "share extension app group");

const keyboardEntitlements = readPlist("ios/SwipeBetter/KeyboardExtension/SwipeBetterKeyboard.entitlements");
if (Object.keys(keyboardEntitlements).length !== 0) {
  throw new Error("Keyboard extension entitlements must stay empty while RequestsOpenAccess is false");
}

const privacy = readPlist("ios/SwipeBetter/Shared/Resources/PrivacyInfo.xcprivacy");
assertEqual(privacy.NSPrivacyTracking, false, "privacy manifest tracking flag");
if ((privacy.NSPrivacyTrackingDomains || []).length !== 0) {
  throw new Error("Privacy manifest tracking domains must stay empty");
}
const collectedTypes = new Set((privacy.NSPrivacyCollectedDataTypes || []).map((item) => item.NSPrivacyCollectedDataType));
for (const type of [
  "NSPrivacyCollectedDataTypeEmailAddress",
  "NSPrivacyCollectedDataTypeUserID",
  "NSPrivacyCollectedDataTypePhotosorVideos",
  "NSPrivacyCollectedDataTypeOtherUserContent",
]) {
  if (!collectedTypes.has(type)) {
    throw new Error(`Privacy manifest missing collected data type: ${type}`);
  }
}

const shared = fs.readFileSync("ios/SwipeBetter/Shared/Sources/SwipeBetterShared.swift", "utf8");
for (const expected of [
  'apiBaseURL = URL(string: "https://swipebetter.ai")!',
  'appGroupId = "group.ai.swipebetter.shared"',
  'starterProductId = "ai.swipebetter.starter"',
  'monthlyProductId = "ai.swipebetter.unlimited.monthly"',
  'annualProductId = "ai.swipebetter.unlimited.annual"',
]) {
  assertIncludes(shared, expected, "Swift shared configuration");
}
for (const expected of [
  "clearAll()",
  "try? FileManager.default.removeItem(at: directoryURL)",
  "removeDirectoryIfEmpty(directoryURL)",
]) {
  assertIncludes(shared, expected, "shared import cleanup contract");
}

const authSchema = fs.readFileSync("shared/models/auth.ts", "utf8");
assertIncludes(authSchema, 'id: varchar("id").primaryKey().default(sql`gen_random_uuid()`)', "user ID UUID contract");

const purchaseStore = fs.readFileSync("ios/SwipeBetter/SwipeBetterApp/Sources/PurchaseStore.swift", "utf8");
for (const expected of [
  "userId.flatMap(UUID.init(uuidString:))",
  ".appAccountToken(accountToken)",
]) {
  assertIncludes(purchaseStore, expected, "Apple app account token contract");
}

const appModel = fs.readFileSync("ios/SwipeBetter/SwipeBetterApp/Sources/AppModel.swift", "utf8");
const logoutMatch = appModel.match(/func logout\(\) async \{[\s\S]*?\n  \}/);
if (!logoutMatch) {
  throw new Error("Could not find logout implementation");
}
for (const expected of [
  'pendingImportText = ""',
  "pendingImportImages = []",
  "importRevision += 1",
  "SharedImportStore.clearAll()",
]) {
  assertIncludes(logoutMatch[0], expected, "logout privacy cleanup contract");
}
NODE

echo "Checking StoreKit product IDs and iOS prices..."
node <<'NODE'
const fs = require("fs");
const storekit = JSON.parse(fs.readFileSync("ios/SwipeBetter/Configuration.storekit", "utf8"));
const expected = new Map([
  ["ai.swipebetter.starter", "3.99"],
  ["ai.swipebetter.unlimited.monthly", "16.99"],
  ["ai.swipebetter.unlimited.annual", "104.99"],
]);

for (const product of storekit.products || []) {
  expected.delete(product.productID);
  if (product.productID === "ai.swipebetter.starter" && product.displayPrice !== "3.99") {
    throw new Error(`Starter price drifted: ${product.displayPrice}`);
  }
}

for (const group of storekit.subscriptionGroups || []) {
  for (const subscription of group.subscriptions || []) {
    const wanted = expected.get(subscription.productID);
    if (wanted && subscription.displayPrice !== wanted) {
      throw new Error(`${subscription.productID} price drifted: ${subscription.displayPrice}`);
    }
    expected.delete(subscription.productID);
  }
}

if (expected.size) {
  throw new Error(`Missing StoreKit products: ${Array.from(expected.keys()).join(", ")}`);
}
NODE

echo "Checking iOS transaction database contract..."
node <<'NODE'
const fs = require("fs");

function assertIncludes(haystack, needle, label) {
  if (!haystack.includes(needle)) {
    throw new Error(`${label} missing ${needle}`);
  }
}

const migrationPath = "scripts/sql/2026-07-05-add-ios-transactions.sql";
const migration = fs.readFileSync(migrationPath, "utf8").replace(/\s+/g, " ").trim();
for (const expected of [
  "CREATE TABLE IF NOT EXISTS ios_transactions",
  "id serial PRIMARY KEY",
  "transaction_id varchar(128) NOT NULL UNIQUE",
  "original_transaction_id varchar(128)",
  "user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE",
  "product_id varchar(128) NOT NULL",
  "environment varchar(32) NOT NULL",
  "purchase_date timestamp",
  "expires_date timestamp",
  "created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP",
  "CREATE INDEX IF NOT EXISTS idx_ios_transactions_user_id ON ios_transactions(user_id)",
  "CREATE INDEX IF NOT EXISTS idx_ios_transactions_original_transaction_id ON ios_transactions(original_transaction_id)",
]) {
  assertIncludes(migration, expected, "iOS transaction migration");
}

const schema = fs.readFileSync("shared/models/swipebetter.ts", "utf8");
for (const expected of [
  'iosTransactions = pgTable("ios_transactions"',
  'transactionId: varchar("transaction_id", { length: 128 }).notNull().unique()',
  'originalTransactionId: varchar("original_transaction_id", { length: 128 })',
  'userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" })',
  'productId: varchar("product_id", { length: 128 }).notNull()',
  'environment: varchar("environment", { length: 32 }).notNull()',
  'purchaseDate: timestamp("purchase_date")',
  'expiresDate: timestamp("expires_date")',
  'createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()',
  "export type IosTransaction = typeof iosTransactions.$inferSelect",
]) {
  assertIncludes(schema, expected, "shared iOS transaction schema");
}

const storage = fs.readFileSync("server/storage.ts", "utf8");
for (const expected of [
  "getAppleTransactionUserId(transactionId: string, originalTransactionId?: string | null)",
  "eq(iosTransactions.transactionId, transactionId)",
  "eq(iosTransactions.originalTransactionId, originalTransactionId)",
  ".onConflictDoNothing({ target: iosTransactions.transactionId })",
  "isAppleSubscriptionProduct(data.productId)",
  "AND ${iosTransactions.productId} LIKE 'ai.swipebetter.unlimited%'",
]) {
  assertIncludes(storage, expected, "iOS transaction storage contract");
}

const routes = fs.readFileSync("server/routes.ts", "utf8");
for (const expected of [
  "AppleIapValidationError",
  'return res.status(400).json({ error: error.message });',
]) {
  assertIncludes(routes, expected, "iOS Apple validation route contract");
}
const validationCatchCount = (routes.match(/error instanceof AppleIapValidationError/g) || []).length;
if (validationCatchCount < 2) {
  throw new Error("Both iOS IAP transaction and notification routes must catch AppleIapValidationError");
}
NODE

echo "Checking App Store metadata package..."
node <<'NODE'
const fs = require("fs");

const metadata = JSON.parse(fs.readFileSync("ios/SwipeBetter/AppStoreMetadata.json", "utf8"));
const requiredStrings = [
  "appName",
  "subtitle",
  "promotionalText",
  "description",
  "keywords",
  "supportUrl",
  "privacyUrl",
  "marketingUrl",
  "reviewNotes",
];

for (const field of requiredStrings) {
  if (typeof metadata[field] !== "string" || metadata[field].trim() === "") {
    throw new Error(`Missing App Store metadata field: ${field}`);
  }
}

function charLimit(field, limit) {
  if ([...metadata[field]].length > limit) {
    throw new Error(`${field} exceeds ${limit} characters`);
  }
}

charLimit("appName", 30);
charLimit("subtitle", 30);
charLimit("promotionalText", 170);
charLimit("description", 4000);

if (Buffer.byteLength(metadata.keywords, "utf8") > 100) {
  throw new Error("keywords exceeds 100 bytes");
}

if (/,\s/.test(metadata.keywords)) {
  throw new Error("keywords should be comma-separated without spaces");
}

for (const field of ["supportUrl", "privacyUrl", "marketingUrl"]) {
  if (!/^https:\/\//.test(metadata[field])) {
    throw new Error(`${field} must be a full https URL`);
  }
}

const expectedProducts = new Map([
  ["ai.swipebetter.starter", "$3.99"],
  ["ai.swipebetter.unlimited.monthly", "$16.99"],
  ["ai.swipebetter.unlimited.annual", "$104.99"],
]);

if (!Array.isArray(metadata.inAppPurchases)) {
  throw new Error("inAppPurchases must be an array");
}

for (const item of metadata.inAppPurchases) {
  if (!expectedProducts.has(item.productId)) {
    throw new Error(`Unexpected in-app purchase product: ${item.productId}`);
  }
  if (item.price !== expectedProducts.get(item.productId)) {
    throw new Error(`In-app purchase price drifted for ${item.productId}`);
  }
  if ([...(item.displayName || "")].length > 30) {
    throw new Error(`IAP display name exceeds 30 characters: ${item.productId}`);
  }
  if ([...(item.description || "")].length > 45) {
    throw new Error(`IAP description exceeds 45 characters: ${item.productId}`);
  }
  expectedProducts.delete(item.productId);
}

if (expectedProducts.size) {
  throw new Error(`Missing IAP metadata: ${Array.from(expectedProducts.keys()).join(", ")}`);
}

if (!Array.isArray(metadata.screenshots) || metadata.screenshots.length < 5) {
  throw new Error("At least five screenshot targets are required");
}
NODE

echo "Running TypeScript check..."
npm run check

echo "Running Apple IAP regression tests..."
npm run test:ios-iap

echo "Running production build..."
npm run build

echo "Building iOS app and extensions..."
echo "Using simulator destination: $DESTINATION"
xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -destination "$DESTINATION" \
  -configuration Debug \
  CODE_SIGNING_ALLOWED=NO \
  build

echo "Archiving Release iOS build without signing..."
ARCHIVE_PATH="/tmp/SwipeBetter-iOS-readiness.xcarchive"
rm -rf "$ARCHIVE_PATH"
xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -configuration Release \
  -destination "generic/platform=iOS" \
  CODE_SIGNING_ALLOWED=NO \
  archive \
  -archivePath "$ARCHIVE_PATH"

echo "iOS readiness checks passed."
