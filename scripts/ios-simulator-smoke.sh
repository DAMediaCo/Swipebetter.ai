#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

PROJECT="ios/SwipeBetter/SwipeBetter.xcodeproj"
SCHEME="SwipeBetter"
BUNDLE_ID="ai.swipebetter.app"
SIMULATOR_NAME="${IOS_SMOKE_SIMULATOR_NAME:-iPhone SE (3rd generation)}"
DERIVED_DATA="${IOS_SMOKE_DERIVED_DATA:-$(mktemp -d /tmp/swipebetter-ios-smoke-derived.XXXXXX)}"
ARTIFACT_DIR="${IOS_SMOKE_ARTIFACT_DIR:-/tmp/swipebetter-ios-smoke}"
SCREENSHOT_PATH="$ARTIFACT_DIR/swipebetter-ios-smoke-$(date +%Y%m%d%H%M%S).png"
SUMMARY_PATH="$ARTIFACT_DIR/smoke-summary.txt"
DEVICES_JSON="$(mktemp /tmp/swipebetter-ios-devices.XXXXXX.json)"

cleanup() {
  rm -f "$DEVICES_JSON"
}
trap cleanup EXIT

mkdir -p "$ARTIFACT_DIR"

echo "Selecting iOS simulator..."
xcrun simctl list devices available -j > "$DEVICES_JSON"
SIMULATOR_SELECTION="$(
  node -e '
    const fs = require("fs");
    const devicesPath = process.argv[1];
    const preferredName = process.argv[2];
    const data = JSON.parse(fs.readFileSync(devicesPath, "utf8"));
    const devices = Object.values(data.devices || {})
      .flat()
      .filter((device) => device.isAvailable && /^iPhone/.test(device.name));
    const chosen = devices.find((device) => device.name === preferredName)
      || devices.find((device) => /^iPhone SE\b/.test(device.name))
      || devices.find((device) => device.state === "Booted")
      || devices[0];
    if (!chosen) {
      process.exit(2);
    }
    process.stdout.write(`${chosen.udid}\t${chosen.name} (${chosen.state})`);
  ' "$DEVICES_JSON" "$SIMULATOR_NAME"
)"

if [[ -z "$SIMULATOR_SELECTION" ]]; then
  echo "No available iPhone simulator found." >&2
  exit 1
fi

SIMULATOR_ID="${SIMULATOR_SELECTION%%$'\t'*}"
SIMULATOR_LABEL="${SIMULATOR_SELECTION#*$'\t'}"
echo "Using simulator: $SIMULATOR_LABEL [$SIMULATOR_ID]"

echo "Booting simulator..."
xcrun simctl boot "$SIMULATOR_ID" >/dev/null 2>&1 || true
xcrun simctl bootstatus "$SIMULATOR_ID" -b

echo "Building simulator app..."
xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -destination "id=$SIMULATOR_ID" \
  -configuration Debug \
  -derivedDataPath "$DERIVED_DATA" \
  -quiet \
  build

APP_PATH="$DERIVED_DATA/Build/Products/Debug-iphonesimulator/SwipeBetter.app"
if [[ ! -d "$APP_PATH" ]]; then
  echo "Built app not found at $APP_PATH" >&2
  exit 1
fi

echo "Installing app..."
xcrun simctl uninstall "$SIMULATOR_ID" "$BUNDLE_ID" >/dev/null 2>&1 || true
xcrun simctl install "$SIMULATOR_ID" "$APP_PATH"

echo "Launching app..."
LAUNCH_OUTPUT="$(xcrun simctl launch "$SIMULATOR_ID" "$BUNDLE_ID")"
echo "$LAUNCH_OUTPUT"
if [[ "$LAUNCH_OUTPUT" != *"$BUNDLE_ID"* ]]; then
  echo "Launch output did not include $BUNDLE_ID" >&2
  exit 1
fi

sleep 2

echo "Capturing smoke screenshot..."
xcrun simctl io "$SIMULATOR_ID" screenshot "$SCREENSHOT_PATH"
if [[ ! -s "$SCREENSHOT_PATH" ]]; then
  echo "Smoke screenshot was not created." >&2
  exit 1
fi

SCREENSHOT_BYTES="$(wc -c < "$SCREENSHOT_PATH" | tr -d ' ')"
SCREENSHOT_WIDTH="$(sips -g pixelWidth "$SCREENSHOT_PATH" 2>/dev/null | awk '/pixelWidth/ { print $2 }')"
SCREENSHOT_HEIGHT="$(sips -g pixelHeight "$SCREENSHOT_PATH" 2>/dev/null | awk '/pixelHeight/ { print $2 }')"

if [[ "${SCREENSHOT_BYTES:-0}" -lt 10000 ]]; then
  echo "Smoke screenshot is suspiciously small: ${SCREENSHOT_BYTES:-0} bytes." >&2
  exit 1
fi

if [[ "${SCREENSHOT_WIDTH:-0}" -lt 300 || "${SCREENSHOT_HEIGHT:-0}" -lt 500 ]]; then
  echo "Smoke screenshot dimensions look wrong: ${SCREENSHOT_WIDTH:-0}x${SCREENSHOT_HEIGHT:-0}." >&2
  exit 1
fi

xcrun simctl terminate "$SIMULATOR_ID" "$BUNDLE_ID" >/dev/null 2>&1 || true

cat > "$SUMMARY_PATH" <<SUMMARY
iOS simulator smoke passed.
Simulator: $SIMULATOR_LABEL [$SIMULATOR_ID]
Bundle ID: $BUNDLE_ID
Screenshot: $SCREENSHOT_PATH
Screenshot bytes: $SCREENSHOT_BYTES
Screenshot dimensions: ${SCREENSHOT_WIDTH}x${SCREENSHOT_HEIGHT}
SUMMARY

echo "iOS simulator smoke passed."
echo "Screenshot: $SCREENSHOT_PATH"
echo "Screenshot dimensions: ${SCREENSHOT_WIDTH}x${SCREENSHOT_HEIGHT}"
echo "Summary: $SUMMARY_PATH"
