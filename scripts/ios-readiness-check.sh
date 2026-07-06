#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

PROJECT="ios/SwipeBetter/SwipeBetter.xcodeproj"
SCHEME="SwipeBetter"
DESTINATION="${IOS_DESTINATION:-platform=iOS Simulator,name=iPhone 17 Pro,OS=26.4.1}"
STOREKIT="ios/SwipeBetter/Configuration.storekit"
PRIVACY="ios/SwipeBetter/Shared/Resources/PrivacyInfo.xcprivacy"
KEYBOARD_PLIST="ios/SwipeBetter/KeyboardExtension/Info.plist"

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

echo "Running TypeScript check..."
npm run check

echo "Running production build..."
npm run build

echo "Building iOS app and extensions..."
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
