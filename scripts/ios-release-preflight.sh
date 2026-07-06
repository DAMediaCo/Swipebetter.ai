#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

PROJECT="ios/SwipeBetter/SwipeBetter.xcodeproj"
SCHEME="SwipeBetter"
ARCHIVE_PATH="${IOS_RELEASE_ARCHIVE_PATH:-/tmp/SwipeBetter-iOS-release.xcarchive}"
EXPORT_PATH="${IOS_RELEASE_EXPORT_PATH:-/tmp/SwipeBetter-iOS-export}"
EXPORT_OPTIONS="${IOS_EXPORT_OPTIONS_PLIST:-}"

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "$name is required for a real App Store/TestFlight release preflight." >&2
    exit 1
  fi
}

require_env APPLE_DEVELOPMENT_TEAM
require_env APPLE_APP_ID
require_env APPLE_IAP_ISSUER_ID
require_env APPLE_IAP_KEY_ID
require_env APPLE_IAP_PRIVATE_KEY

echo "Checking live Apple app and in-app purchase configuration..."
npm run check:apple-iap-config

echo "Archiving signed Release build for Apple team $APPLE_DEVELOPMENT_TEAM..."
rm -rf "$ARCHIVE_PATH"
xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -configuration Release \
  -destination "generic/platform=iOS" \
  -archivePath "$ARCHIVE_PATH" \
  DEVELOPMENT_TEAM="$APPLE_DEVELOPMENT_TEAM" \
  CODE_SIGN_STYLE=Automatic \
  -allowProvisioningUpdates \
  archive

if [[ -n "$EXPORT_OPTIONS" ]]; then
  echo "Exporting archive with $EXPORT_OPTIONS..."
  rm -rf "$EXPORT_PATH"
  xcodebuild \
    -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "$EXPORT_PATH" \
    -exportOptionsPlist "$EXPORT_OPTIONS" \
    -allowProvisioningUpdates
fi

echo "Signed iOS release preflight passed."
echo "Archive: $ARCHIVE_PATH"
if [[ -n "$EXPORT_OPTIONS" ]]; then
  echo "Export: $EXPORT_PATH"
fi
