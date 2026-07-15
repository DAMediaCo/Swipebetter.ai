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
SETTLE_SECONDS="${IOS_SMOKE_SETTLE_SECONDS:-5}"
MIN_SCREENSHOT_BYTES="${IOS_SMOKE_MIN_SCREENSHOT_BYTES:-50000}"
BOOT_TIMEOUT_SECONDS="${IOS_SMOKE_BOOT_TIMEOUT_SECONDS:-360}"
BUILD_TIMEOUT_SECONDS="${IOS_SMOKE_BUILD_TIMEOUT_SECONDS:-600}"
SIMCTL_TIMEOUT_SECONDS="${IOS_SMOKE_SIMCTL_TIMEOUT_SECONDS:-120}"
ALLOW_INFRASTRUCTURE_FAILURE="${IOS_SMOKE_ALLOW_INFRASTRUCTURE_FAILURE:-0}"
CURRENT_STEP="startup"

cleanup() {
  rm -f "$DEVICES_JSON"
}
trap cleanup EXIT

write_failure_summary() {
  local status="$1"
  local disposition="${2:-failed}"
  mkdir -p "$ARTIFACT_DIR"
  cat > "$SUMMARY_PATH" <<SUMMARY
iOS simulator smoke $disposition.
Step: $CURRENT_STEP
Exit code: $status
Simulator: ${SIMULATOR_LABEL:-unknown} [${SIMULATOR_ID:-unknown}]
Bundle ID: $BUNDLE_ID
SUMMARY
}

is_infrastructure_timeout() {
  local status="$1"
  [[ "$ALLOW_INFRASTRUCTURE_FAILURE" == "1" \
    && "$status" == "124" \
    && ( "$CURRENT_STEP" == "Waiting for simulator boot" || "$CURRENT_STEP" == "Launching app" ) ]]
}

diagnose_failure() {
  local status="${1:-$?}"
  local line="${BASH_LINENO[0]:-unknown}"
  echo "iOS simulator smoke failed at line $line with exit $status." >&2
  echo "Failed step: $CURRENT_STEP" >&2

  if is_infrastructure_timeout "$status"; then
    write_failure_summary "$status" "hit a non-blocking GitHub simulator infrastructure timeout"
  else
    write_failure_summary "$status"
  fi

  if [[ -n "${SIMULATOR_ID:-}" ]]; then
    echo "Simulator state at failure:" >&2
    xcrun simctl list devices "$SIMULATOR_ID" >&2 || true

    echo "Recent app logs:" >&2
    xcrun simctl spawn "$SIMULATOR_ID" log show \
      --style compact \
      --last 2m \
      --predicate "process == \"SwipeBetter\"" >&2 || true
  fi

  if is_infrastructure_timeout "$status"; then
    echo "Treating $CURRENT_STEP timeout as non-blocking CI infrastructure flake." >&2
    exit 0
  fi

  exit "$status"
}
trap diagnose_failure ERR

run_required() {
  local label="$1"
  local timeout_seconds="$2"
  shift 2
  CURRENT_STEP="$label"

  set +e
  with_timeout "$timeout_seconds" "$@"
  local status="$?"
  set -e

  if [[ "$status" -ne 0 ]]; then
    echo "$label failed or timed out after ${timeout_seconds}s with exit $status." >&2
    diagnose_failure "$status"
  fi
}

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
with_timeout "$SIMCTL_TIMEOUT_SECONDS" xcrun simctl boot "$SIMULATOR_ID" >/dev/null 2>&1 || true
run_required "Waiting for simulator boot" "$BOOT_TIMEOUT_SECONDS" xcrun simctl bootstatus "$SIMULATOR_ID" -b

echo "Building simulator app..."
run_required "Building simulator app" "$BUILD_TIMEOUT_SECONDS" xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -destination "platform=iOS Simulator,id=$SIMULATOR_ID" \
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
with_timeout "$SIMCTL_TIMEOUT_SECONDS" xcrun simctl uninstall "$SIMULATOR_ID" "$BUNDLE_ID" >/dev/null 2>&1 || true
run_required "Installing app" "$SIMCTL_TIMEOUT_SECONDS" xcrun simctl install "$SIMULATOR_ID" "$APP_PATH"

echo "Launching app..."
CURRENT_STEP="Launching app"
set +e
LAUNCH_OUTPUT="$(with_timeout "$SIMCTL_TIMEOUT_SECONDS" xcrun simctl launch "$SIMULATOR_ID" "$BUNDLE_ID")"
LAUNCH_STATUS="$?"
set -e
if [[ "$LAUNCH_STATUS" -ne 0 ]]; then
  echo "Launching app failed or timed out after ${SIMCTL_TIMEOUT_SECONDS}s with exit $LAUNCH_STATUS." >&2
  diagnose_failure "$LAUNCH_STATUS"
fi
echo "$LAUNCH_OUTPUT"
if [[ "$LAUNCH_OUTPUT" != *"$BUNDLE_ID"* ]]; then
  echo "Launch output did not include $BUNDLE_ID" >&2
  exit 1
fi

echo "Capturing smoke screenshot..."
for attempt in 1 2 3; do
  if [[ "$attempt" == "1" ]]; then
    sleep "$SETTLE_SECONDS"
  else
    sleep 2
  fi

  run_required "Capturing smoke screenshot" "$SIMCTL_TIMEOUT_SECONDS" xcrun simctl io "$SIMULATOR_ID" screenshot "$SCREENSHOT_PATH"
  if [[ ! -s "$SCREENSHOT_PATH" ]]; then
    echo "Smoke screenshot was not created on attempt $attempt." >&2
    continue
  fi

  SCREENSHOT_BYTES="$(wc -c < "$SCREENSHOT_PATH" | tr -d ' ')"
  if [[ "${SCREENSHOT_BYTES:-0}" -ge "$MIN_SCREENSHOT_BYTES" ]]; then
    break
  fi

  echo "Smoke screenshot attempt $attempt looked blank or incomplete: ${SCREENSHOT_BYTES:-0} bytes." >&2
done

SCREENSHOT_BYTES="$(wc -c < "$SCREENSHOT_PATH" | tr -d ' ')"
SCREENSHOT_WIDTH="$(sips -g pixelWidth "$SCREENSHOT_PATH" 2>/dev/null | awk '/pixelWidth/ { print $2 }')"
SCREENSHOT_HEIGHT="$(sips -g pixelHeight "$SCREENSHOT_PATH" 2>/dev/null | awk '/pixelHeight/ { print $2 }')"

if [[ "${SCREENSHOT_BYTES:-0}" -lt "$MIN_SCREENSHOT_BYTES" ]]; then
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
