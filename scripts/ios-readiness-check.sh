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
