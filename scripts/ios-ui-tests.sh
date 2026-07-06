#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

PROJECT="ios/SwipeBetter/SwipeBetter.xcodeproj"
SCHEME="SwipeBetter"
SIMULATOR_NAME="${IOS_TEST_SIMULATOR_NAME:-iPhone 17 Pro}"
DERIVED_DATA="${IOS_TEST_DERIVED_DATA:-$(mktemp -d /tmp/swipebetter-ios-ui-tests.XXXXXX)}"
DEVICES_JSON="$(mktemp /tmp/swipebetter-ios-ui-test-devices.XXXXXX.json)"

cleanup() {
  rm -f "$DEVICES_JSON"
}
trap cleanup EXIT

if [[ -n "${IOS_TEST_DESTINATION:-}" ]]; then
  DESTINATION="$IOS_TEST_DESTINATION"
else
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
  DESTINATION="platform=iOS Simulator,id=$SIMULATOR_ID"
  echo "Using simulator: $SIMULATOR_LABEL [$SIMULATOR_ID]"
fi

echo "Running native iOS UI tests..."
echo "Using simulator destination: $DESTINATION"

xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -destination "$DESTINATION" \
  -configuration Debug \
  -derivedDataPath "$DERIVED_DATA" \
  CODE_SIGNING_ALLOWED=NO \
  test

echo "Native iOS UI tests passed."
