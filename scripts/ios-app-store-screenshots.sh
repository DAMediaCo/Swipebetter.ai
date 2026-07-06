#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

PROJECT="ios/SwipeBetter/SwipeBetter.xcodeproj"
SCHEME="SwipeBetter"
BUNDLE_ID="ai.swipebetter.app"
SIMULATOR_NAME="${IOS_SCREENSHOT_SIMULATOR_NAME:-iPhone 17 Pro Max}"
DERIVED_DATA="${IOS_SCREENSHOT_DERIVED_DATA:-$(mktemp -d /tmp/swipebetter-ios-screenshots.XXXXXX)}"
OUTPUT_DIR="${IOS_SCREENSHOT_OUTPUT_DIR:-artifacts/ios-app-store-screenshots}"
DEVICES_JSON="$(mktemp /tmp/swipebetter-ios-screenshot-devices.XXXXXX.json)"
SETTLE_SECONDS="${IOS_SCREENSHOT_SETTLE_SECONDS:-5}"
MIN_SCREENSHOT_BYTES="${IOS_SCREENSHOT_MIN_BYTES:-50000}"
SIMCTL_TIMEOUT_SECONDS="${IOS_SCREENSHOT_SIMCTL_TIMEOUT_SECONDS:-120}"
BUILD_TIMEOUT_SECONDS="${IOS_SCREENSHOT_BUILD_TIMEOUT_SECONDS:-600}"
BOOT_TIMEOUT_SECONDS="${IOS_SCREENSHOT_BOOT_TIMEOUT_SECONDS:-360}"
AUTH_SCREENSHOT="$OUTPUT_DIR/01-auth-login.png"
MANIFEST_PATH="$OUTPUT_DIR/manifest.json"

cleanup() {
  rm -f "$DEVICES_JSON"
}
trap cleanup EXIT

with_timeout() {
  local timeout_seconds="$1"
  shift

  perl -e '
    my $timeout = shift @ARGV;
    my $pid = fork();
    die "fork failed\n" unless defined $pid;

    if ($pid == 0) {
      exec @ARGV or die "exec failed: $!\n";
    }

    local $SIG{ALRM} = sub {
      kill "TERM", $pid;
      sleep 2;
      kill "KILL", $pid;
      waitpid($pid, 0);
      exit 124;
    };

    alarm $timeout;
    waitpid($pid, 0);
    my $status = $?;
    exit($status == -1 ? 1 : ($status >> 8));
  ' "$timeout_seconds" "$@"
}

run_required() {
  local label="$1"
  local timeout_seconds="$2"
  shift 2

  if ! with_timeout "$timeout_seconds" "$@"; then
    echo "$label failed or timed out after ${timeout_seconds}s." >&2
    exit 1
  fi
}

mkdir -p "$OUTPUT_DIR"

echo "Selecting App Store screenshot simulator..."
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
      || devices.find((device) => device.name === "iPhone 17 Pro")
      || devices.find((device) => /Pro Max/.test(device.name))
      || devices.find((device) => /\bPro\b/.test(device.name))
      || devices.find((device) => device.state === "Booted")
      || devices[0];
    if (!chosen) {
      process.exit(2);
    }
    process.stdout.write(`${chosen.udid}\t${chosen.name}`);
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
with_timeout "$SIMCTL_TIMEOUT_SECONDS" xcrun simctl boot "$SIMULATOR_ID" >/dev/null 2>&1 || true
run_required "Waiting for simulator boot" "$BOOT_TIMEOUT_SECONDS" xcrun simctl bootstatus "$SIMULATOR_ID" -b

echo "Building screenshot app..."
run_required "Building screenshot app" "$BUILD_TIMEOUT_SECONDS" xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -destination "platform=iOS Simulator,id=$SIMULATOR_ID" \
  -configuration Debug \
  -derivedDataPath "$DERIVED_DATA" \
  CODE_SIGNING_ALLOWED=NO \
  -quiet \
  build

APP_PATH="$DERIVED_DATA/Build/Products/Debug-iphonesimulator/SwipeBetter.app"
if [[ ! -d "$APP_PATH" ]]; then
  echo "Built app not found at $APP_PATH" >&2
  exit 1
fi

echo "Installing app..."
with_timeout "$SIMCTL_TIMEOUT_SECONDS" xcrun simctl uninstall "$SIMULATOR_ID" "$BUNDLE_ID" >/dev/null 2>&1 || true
run_required "Installing app" "$SIMCTL_TIMEOUT_SECONDS" xcrun simctl install "$SIMULATOR_ID" "$APP_PATH"

echo "Launching deterministic auth screen..."
LAUNCH_OUTPUT="$(with_timeout "$SIMCTL_TIMEOUT_SECONDS" xcrun simctl launch "$SIMULATOR_ID" "$BUNDLE_ID" -SWIPEBETTER_UI_TESTING)"
echo "$LAUNCH_OUTPUT"
if [[ "$LAUNCH_OUTPUT" != *"$BUNDLE_ID"* ]]; then
  echo "Launch output did not include $BUNDLE_ID" >&2
  exit 1
fi

sleep "$SETTLE_SECONDS"

echo "Capturing 01-auth-login.png..."
run_required "Capturing auth screenshot" "$SIMCTL_TIMEOUT_SECONDS" xcrun simctl io "$SIMULATOR_ID" screenshot "$AUTH_SCREENSHOT"

SCREENSHOT_BYTES="$(wc -c < "$AUTH_SCREENSHOT" | tr -d ' ')"
SCREENSHOT_WIDTH="$(sips -g pixelWidth "$AUTH_SCREENSHOT" 2>/dev/null | awk '/pixelWidth/ { print $2 }')"
SCREENSHOT_HEIGHT="$(sips -g pixelHeight "$AUTH_SCREENSHOT" 2>/dev/null | awk '/pixelHeight/ { print $2 }')"

if [[ "${SCREENSHOT_BYTES:-0}" -lt "$MIN_SCREENSHOT_BYTES" ]]; then
  echo "App Store screenshot is suspiciously small: ${SCREENSHOT_BYTES:-0} bytes." >&2
  exit 1
fi

if [[ "${SCREENSHOT_WIDTH:-0}" -lt 1000 || "${SCREENSHOT_HEIGHT:-0}" -lt 2000 ]]; then
  echo "App Store screenshot dimensions look too small: ${SCREENSHOT_WIDTH:-0}x${SCREENSHOT_HEIGHT:-0}." >&2
  exit 1
fi

xcrun simctl terminate "$SIMULATOR_ID" "$BUNDLE_ID" >/dev/null 2>&1 || true

SCREENSHOT_OUTPUT_DIR="$OUTPUT_DIR" \
AUTH_SCREENSHOT_BYTES="$SCREENSHOT_BYTES" \
AUTH_SCREENSHOT_WIDTH="$SCREENSHOT_WIDTH" \
AUTH_SCREENSHOT_HEIGHT="$SCREENSHOT_HEIGHT" \
SIMULATOR_ID="$SIMULATOR_ID" \
SIMULATOR_LABEL="$SIMULATOR_LABEL" \
BUNDLE_ID="$BUNDLE_ID" \
node <<'NODE'
const fs = require("fs");
const path = require("path");

const outputDir = process.env.SCREENSHOT_OUTPUT_DIR;
const manifestPath = path.join(outputDir, "manifest.json");
const screenshots = [
  {
    file: "01-auth-login.png",
    title: "Sign in with Apple and email login",
    status: "captured",
    bytes: Number(process.env.AUTH_SCREENSHOT_BYTES),
    width: Number(process.env.AUTH_SCREENSHOT_WIDTH),
    height: Number(process.env.AUTH_SCREENSHOT_HEIGHT),
  },
  {
    file: "02-profile-audit-picker.png",
    title: "Profile Audit screenshot picker and credit status",
    status: "planned",
    requiredLater: true,
  },
  {
    file: "03-profile-audit-result.png",
    title: "Profile Audit result with score and first fix",
    status: "planned",
    requiredLater: true,
  },
  {
    file: "04-reply-coach.png",
    title: "Reply Coach input and generated replies",
    status: "planned",
    requiredLater: true,
  },
  {
    file: "05-account-billing.png",
    title: "Account screen with Apple billing controls",
    status: "planned",
    requiredLater: true,
  },
];

fs.writeFileSync(manifestPath, JSON.stringify({
  capturedAt: new Date().toISOString(),
  bundleId: process.env.BUNDLE_ID,
  simulator: {
    id: process.env.SIMULATOR_ID,
    label: process.env.SIMULATOR_LABEL,
  },
  screenshots,
}, null, 2) + "\n");
NODE

echo "App Store screenshot captured: $AUTH_SCREENSHOT"
echo "Screenshot manifest written: $MANIFEST_PATH"
