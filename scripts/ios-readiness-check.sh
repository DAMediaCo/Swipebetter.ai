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
if [[ "$REQUESTS_OPEN_ACCESS" != "true" ]]; then
  echo "Keyboard RequestsOpenAccess must stay true so iOS offers the Full Access control." >&2
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

function pngInfo(path) {
  const buffer = fs.readFileSync(path);
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error(`${path} is not a PNG`);
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    colorType: buffer.readUInt8(25),
  };
}

function pointsToPixels(size, scale) {
  return Math.round(Number.parseFloat(size.split("x")[0]) * Number.parseInt(scale, 10));
}

const project = fs.readFileSync("ios/SwipeBetter/project.yml", "utf8");
for (const bundleId of [
  "PRODUCT_BUNDLE_IDENTIFIER: app.replit.swipebetter",
  "PRODUCT_BUNDLE_IDENTIFIER: app.replit.swipebetter.share",
  "PRODUCT_BUNDLE_IDENTIFIER: app.replit.swipebetter.keyboard",
  "PRODUCT_BUNDLE_IDENTIFIER: app.replit.swipebetter.uitests",
]) {
  assertIncludes(project, bundleId, "project.yml bundle ID contract");
}
assertIncludes(project, "IPHONEOS_DEPLOYMENT_TARGET: \"17.0\"", "iOS deployment target");
assertIncludes(project, "TARGETED_DEVICE_FAMILY: \"1\"", "iPhone-only target family");
assertIncludes(project, "SwipeBetterUITests:", "native UI test target");
assertIncludes(project, "type: bundle.ui-testing", "native UI test target");

const pbxproj = fs.readFileSync("ios/SwipeBetter/SwipeBetter.xcodeproj/project.pbxproj", "utf8");
if (pbxproj.includes('TARGETED_DEVICE_FAMILY = "1,2"')) {
  throw new Error("Xcode project must stay iPhone-only until iPad is designed and smoke-tested");
}

const appInfo = readPlist("ios/SwipeBetter/SwipeBetterApp/Info.plist");
assertEqual(appInfo.CFBundleDisplayName, "SwipeBetter", "main app display name");
assertEqual(appInfo.ITSAppUsesNonExemptEncryption, false, "export compliance declaration");
assertEqual(appInfo.UIRequiresFullScreen, true, "main app full-screen posture");
const urlScheme = appInfo.CFBundleURLTypes?.[0]?.CFBundleURLSchemes?.[0];
assertEqual(urlScheme, "swipebetter", "main app URL scheme");
assertEqual(appInfo.NSPhotoLibraryUsageDescription, "SwipeBetter uses selected screenshots to analyze dating profiles and chats.", "photo library purpose string");

const appIconSetPath = "ios/SwipeBetter/SwipeBetterApp/Resources/Assets.xcassets/AppIcon.appiconset";
const appIconSet = JSON.parse(fs.readFileSync(`${appIconSetPath}/Contents.json`, "utf8"));
const iconEntries = appIconSet.images || [];
if (!iconEntries.some((entry) => entry.idiom === "ios-marketing" && entry.size === "1024x1024" && entry.scale === "1x")) {
  throw new Error("App icon set must include a 1024x1024 ios-marketing icon");
}
for (const entry of iconEntries) {
  if (!entry.filename) {
    throw new Error(`App icon set has an entry without a filename: ${JSON.stringify(entry)}`);
  }
  const path = `${appIconSetPath}/${entry.filename}`;
  const info = pngInfo(path);
  const expectedPixels = pointsToPixels(entry.size, entry.scale);
  assertEqual(info.width, expectedPixels, `${entry.filename} width`);
  assertEqual(info.height, expectedPixels, `${entry.filename} height`);
  if (info.colorType === 4 || info.colorType === 6) {
    throw new Error(`${entry.filename} must not include an alpha channel`);
  }
}

const shareInfo = readPlist("ios/SwipeBetter/ShareExtension/Info.plist");
assertEqual(shareInfo.NSExtension?.NSExtensionPointIdentifier, "com.apple.share-services", "share extension point");
const shareActivationRule = shareInfo.NSExtension?.NSExtensionAttributes?.NSExtensionActivationRule;
assertEqual(shareActivationRule?.NSExtensionActivationSupportsText, true, "share text support");
assertEqual(shareActivationRule?.NSExtensionActivationSupportsImageWithMaxCount, 10, "share image max count");

const keyboardInfo = readPlist("ios/SwipeBetter/KeyboardExtension/Info.plist");
assertEqual(keyboardInfo.NSExtension?.NSExtensionPointIdentifier, "com.apple.keyboard-service", "keyboard extension point");
assertEqual(keyboardInfo.NSExtension?.NSExtensionAttributes?.RequestsOpenAccess, true, "keyboard open access");

const appEntitlements = readPlist("ios/SwipeBetter/SwipeBetterApp/SwipeBetter.entitlements");
assertIncludes(appEntitlements["com.apple.developer.applesignin"] || [], "Default", "Sign in with Apple entitlement");
assertIncludes(appEntitlements["com.apple.security.application-groups"] || [], "group.ai.swipebetter.shared", "main app app group");

const shareEntitlements = readPlist("ios/SwipeBetter/ShareExtension/SwipeBetterShare.entitlements");
assertIncludes(shareEntitlements["com.apple.security.application-groups"] || [], "group.ai.swipebetter.shared", "share extension app group");

const keyboardEntitlements = readPlist("ios/SwipeBetter/KeyboardExtension/SwipeBetterKeyboard.entitlements");
const keyboardEntitlementKeys = Object.keys(keyboardEntitlements);
if (keyboardEntitlementKeys.length !== 1 || keyboardEntitlementKeys[0] !== "com.apple.security.application-groups") {
  throw new Error("Keyboard extension may only use the app-group entitlement required by SwipeBetter Snap");
}
const keyboardAppGroups = keyboardEntitlements["com.apple.security.application-groups"] || [];
if (keyboardAppGroups.length !== 1 || keyboardAppGroups[0] !== "group.ai.swipebetter.shared") {
  throw new Error("Keyboard extension must share only the SwipeBetter app group");
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
  "public let hasAccess: Bool?",
  "public let isUnlimited: Bool?",
]) {
  assertIncludes(shared, expected, "Swift shared configuration");
}
for (const expected of [
  "clearAll()",
  "try? FileManager.default.removeItem(at: directoryURL)",
  "removeDirectoryIfEmpty(directoryURL)",
  "let cleanText = text?.trimmingCharacters(in: .whitespacesAndNewlines)",
  "guard cleanText?.isEmpty == false || !images.isEmpty else",
  "SwipeBetterImageProcessor",
  "maxPixelDimension: CGFloat = 1800",
  "normalizedJPEGData(from data: Data)",
  "let normalizedImages = images.compactMap(SwipeBetterImageProcessor.normalizedJPEGData(from:))",
  "try prepareImportDirectory(directoryURL)",
  "options: [.atomic, .completeFileProtection]",
  "resourceValues.isExcludedFromBackup = true",
  ".protectionKey: FileProtectionType.complete",
]) {
  assertIncludes(shared, expected, "shared import cleanup contract");
}

const snapShared = fs.readFileSync("ios/SwipeBetter/Shared/Sources/SwipeBetterSnapShared.swift", "utf8");
for (const expected of [
  'appGroupId = "group.ai.swipebetter.shared"',
  'payloadKey = "swipeBetterSnapPayload"',
  "maxAge: TimeInterval = 30 * 60",
]) {
  assertIncludes(snapShared, expected, "SwipeBetter Snap shared-state contract");
}

const snapIntent = fs.readFileSync("ios/SwipeBetter/SwipeBetterApp/Sources/SwipeBetterSnapIntent.swift", "utf8");
for (const expected of [
  "CreateRepliesFromScreenshotIntent",
  "inputConnectionBehavior: .connectToPreviousIntentResult",
  'tone: "flirty"',
  'goal: "keep_going"',
  "Array(replies.prefix(3))",
]) {
  assertIncludes(snapIntent, expected, "SwipeBetter Snap intent contract");
}

const authSchema = fs.readFileSync("shared/models/auth.ts", "utf8");
assertIncludes(authSchema, 'id: varchar("id").primaryKey().default(sql`gen_random_uuid()`)', "user ID UUID contract");

const authRoutes = fs.readFileSync("server/auth.ts", "utf8");
for (const expected of [
  'process.env.APPLE_CLIENT_ID',
  'process.env.APPLE_BUNDLE_ID || "app.replit.swipebetter"',
  '"app.replit.swipebetter"',
]) {
  assertIncludes(authRoutes, expected, "native Apple Sign In audience contract");
}
for (const expected of [
  ".select({ id: users.id })",
  ".where(eq(users.id, userId))",
  'res.clearCookie("connect.sid")',
  'res.status(401).json({ message: "Unauthorized" })',
]) {
  assertIncludes(authRoutes, expected, "deleted account stale session contract");
}
for (const disallowed of [
  "host.exp.Exponent",
  "com.swipebetter.app",
  "ai.swipebetter.app",
]) {
  if (authRoutes.includes(disallowed)) {
    throw new Error(`Native Apple Sign In must not accept dev audience: ${disallowed}`);
  }
}

const purchaseStore = fs.readFileSync("ios/SwipeBetter/SwipeBetterApp/Sources/PurchaseStore.swift", "utf8");
for (const expected of [
  "userId.flatMap(UUID.init(uuidString:))",
  "guard let accountToken = userId.flatMap(UUID.init(uuidString:)) else",
  "Sign in again before buying an App Store plan.",
  ".appAccountToken(accountToken)",
  "appAccountToken: transaction.appAccountToken?.uuidString",
  "var isLoadingProducts = false",
  "var purchasingProductId: String?",
  "var isRestoringPurchases = false",
  "Some App Store products are unavailable. Try again shortly.",
  "syncCurrentEntitlements(api: SwipeBetterAPI, reportingFailures: Bool = false) async throws -> Int",
  "firstSyncError = firstSyncError ?? error",
  "No active App Store purchases found.",
  "try await syncCurrentEntitlements(api: api, reportingFailures: true)",
]) {
  assertIncludes(purchaseStore, expected, "Apple purchase UX contract");
}

const appModel = fs.readFileSync("ios/SwipeBetter/SwipeBetterApp/Sources/AppModel.swift", "utf8");
const logoutMatch = appModel.match(/func logout\(\) async \{[\s\S]*?\n  \}/);
if (!logoutMatch) {
  throw new Error("Could not find logout implementation");
}
assertIncludes(logoutMatch[0], "clearLocalAccountState()", "logout privacy cleanup contract");
const deleteMatch = appModel.match(/func deleteAccount\(\) async \{[\s\S]*?\n  \}/);
if (!deleteMatch) {
  throw new Error("Could not find delete account implementation");
}
assertIncludes(deleteMatch[0], "clearLocalAccountState()", "delete account privacy cleanup contract");
const clearStateMatch = appModel.match(/private func clearLocalAccountState\(\) \{[\s\S]*?\n  \}/);
if (!clearStateMatch) {
  throw new Error("Could not find local account state cleanup implementation");
}
for (const expected of [
  'pendingImportText = ""',
  "pendingImportImages = []",
  "requestedTabIdentifier = nil",
  "purchases.resetTransientState()",
  "importRevision += 1",
  "deepLinkRevision += 1",
  "SharedImportStore.clearAll()",
]) {
  assertIncludes(clearStateMatch[0], expected, "local account privacy cleanup contract");
}
for (const expected of [
  "try? await purchases.syncCurrentEntitlements(api: api)",
  "try await purchases.restorePurchases(api: api)",
  "func startPurchaseUpdates()",
  "func stopPurchaseUpdates()",
  "purchaseUpdatesTask?.cancel()",
  "purchaseUpdatesTask = nil",
  "SwipeBetterImageProcessor.normalizedJPEGData(from: data)",
  "func consumePendingImport()",
  "func handleDeepLink(_ url: URL)",
  'first(where: { $0.name == "text" })',
  "pendingImportText = String(deepLinkText.prefix(5000))",
  'requestedTabIdentifier = tabIdentifierForPendingImport(defaultingTo: "replies")',
  "deepLinkRevision += 1",
]) {
  assertIncludes(appModel, expected, "Apple restore sync contract");
}
const refreshAfterAuthMatch = appModel.match(/private func refreshAfterAuth\(\) async \{[\s\S]*?\n  \}/);
if (!refreshAfterAuthMatch) {
  throw new Error("Could not find refreshAfterAuth implementation");
}
assertIncludes(refreshAfterAuthMatch[0], "startPurchaseUpdates()", "purchase listener restart after auth contract");
assertIncludes(clearStateMatch[0], "stopPurchaseUpdates()", "purchase listener privacy cleanup contract");

const rootView = fs.readFileSync("ios/SwipeBetter/SwipeBetterApp/Sources/RootView.swift", "utf8");
for (const expected of [
  '"root.tabView"',
  '"auth.emailField"',
  '"auth.passwordField"',
  '"auth.appleSignInButton"',
  '"audit.addScreenshotsButton"',
  '"audit.runButton"',
  '"replies.conversationEditor"',
  '"replies.generateButton"',
  '"history.list"',
  '"account.restorePurchasesButton"',
  '"account.manageSubscriptionButton"',
  '"account.deleteAccountButton"',
  '"account.logoutButton"',
  "ProfileAuditView(isActive: selectedTab == .audit)",
  "ReplyAssistantView(isActive: selectedTab == .replies)",
  "SignInWithAppleButton(.continue)",
  'Link("Terms", destination: authURL("/terms"))',
  'Link("Privacy", destination: authURL("/privacy"))',
  'Link("Support", destination: authURL("/contact"))',
  'Label("iOS pricing includes Apple purchase fees.", systemImage: "info.circle")',
  'Text("Starter $3.99, Unlimited $16.99/month, Annual $104.99/year.")',
  'Text("iOS purchases are billed by Apple. Web Stripe checkout is intentionally not shown inside the app.")',
  'Label("Reload Plans", systemImage: "arrow.clockwise")',
  "model.purchases.purchasingProductId == product.id",
  'Label("Restore Purchases", systemImage: "arrow.clockwise.circle")',
  "model.purchases.isRestoringPurchases",
  'Label("Manage Subscription", systemImage: "creditcard")',
  "SwipeBetterImageProcessor.normalizedJPEGData(from: data)",
  "routeToPendingImportIfNeeded()",
  "routeToRequestedTabIfNeeded()",
  ".onChange(of: model.deepLinkRevision)",
  ".onChange(of: model.isSignedIn)",
  ".onChange(of: isActive)",
  "guard model.isSignedIn else { return }",
  "guard isActive else { return }",
  "model.consumePendingImport()",
  "model.credits?.isUnlimited == true",
  "model.me?.proActive == true",
  "selectedTab = model.pendingImportText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? .audit : .replies",
]) {
  assertIncludes(rootView, expected, "iOS App Review UI contract");
}
if (/checkout|stripe/i.test(rootView.replace("Web Stripe checkout is intentionally not shown inside the app.", ""))) {
  throw new Error("iOS app UI must not expose web Stripe checkout paths");
}

const appEntry = fs.readFileSync("ios/SwipeBetter/SwipeBetterApp/Sources/SwipeBetterApp.swift", "utf8");
for (const expected of [
  '"-SWIPEBETTER_UI_TESTING"',
  '"-SWIPEBETTER_APP_STORE_SCREENSHOTS"',
  "configureForAppStoreScreenshots()",
  "await model.bootstrap()",
]) {
  assertIncludes(appEntry, expected, "native UI testing launch contract");
}

const uiTests = fs.readFileSync("ios/SwipeBetter/SwipeBetterUITests/Sources/SwipeBetterUITests.swift", "utf8");
for (const expected of [
  "XCUIApplication()",
  'app.launchArguments.append("-SWIPEBETTER_UI_TESTING")',
  'app.launchArguments.append("-SWIPEBETTER_APP_STORE_SCREENSHOTS")',
  'app.launchArguments.append("-SWIPEBETTER_SCREENSHOT_TAB")',
  '"auth.emailField"',
  '"auth.passwordField"',
  '"auth.loginButton"',
  '"auth.appleSignInButton"',
  '"auth.createAccountButton"',
  '"auth.promoCodeField"',
  '"account.restorePurchasesButton"',
  '"account.manageSubscriptionButton"',
]) {
  assertIncludes(uiTests, expected, "native UI smoke test contract");
}

const uiTestScript = fs.readFileSync("scripts/ios-ui-tests.sh", "utf8");
for (const expected of [
  'BOOT_TIMEOUT_SECONDS="${IOS_TEST_BOOT_TIMEOUT_SECONDS:-360}"',
  'TEST_TIMEOUT_SECONDS="${IOS_TEST_TIMEOUT_SECONDS:-1200}"',
  'ALLOW_INFRASTRUCTURE_FAILURE="${IOS_TEST_ALLOW_INFRASTRUCTURE_FAILURE:-0}"',
  'xcrun simctl bootstatus "$SIMULATOR_ID" -b',
  "Simulator boot hit a non-blocking GitHub infrastructure timeout for UI tests.",
  'with_timeout "$TEST_TIMEOUT_SECONDS" xcodebuild',
]) {
  assertIncludes(uiTestScript, expected, "native UI test runner timeout contract");
}

const shareExtension = fs.readFileSync("ios/SwipeBetter/ShareExtension/Sources/ShareViewController.swift", "utf8");
for (const expected of [
  '"share.statusLabel"',
  "Array(images.prefix(10))",
  'statusLabel.text = "Opening SwipeBetter..."',
  'URL(string: "swipebetter://import")',
]) {
  assertIncludes(shareExtension, expected, "share extension import contract");
}

const keyboardExtension = fs.readFileSync("ios/SwipeBetter/KeyboardExtension/Sources/KeyboardViewController.swift", "utf8");
const keyboardReplyComposer = fs.readFileSync("ios/SwipeBetter/KeyboardExtension/Sources/KeyboardReplyComposer.swift", "utf8");
for (const expected of [
  "private var nextKeyboardButton: UIButton?",
  "nextKeyboardButton?.isHidden = !needsInputModeSwitchKey",
  'next.accessibilityIdentifier = "keyboard.nextKeyboardButton"',
  "advanceToNextInputMode()",
  'coach.accessibilityIdentifier = "keyboard.coachChatButton"',
  'paste.accessibilityIdentifier = "keyboard.pasteChatButton"',
  "guard hasFullAccess else",
  "UIPasteboard.general.string",
  "KeyboardReplyComposer.reply",
  'components.scheme = "swipebetter"',
  'components.host = "replies"',
  'URLQueryItem(name: "text", value: context)',
  "textDocumentProxy.documentContextBeforeInput",
  "textDocumentProxy.documentContextAfterInput",
  "String(combined.suffix(1600))",
  "textDocumentProxy.insertText",
]) {
  assertIncludes(keyboardExtension, expected, "keyboard extension privacy contract");
}
for (const expected of [
  '"keyboard.warmReplyButton"',
  '"keyboard.confidentReplyButton"',
  '"keyboard.askOutReplyButton"',
  "if text.contains(\"taco\")",
  "if text.contains(\"busy\")",
]) {
  assertIncludes(keyboardReplyComposer, expected, "context-aware keyboard reply contract");
}

const smokeScript = fs.readFileSync("scripts/ios-simulator-smoke.sh", "utf8");
for (const expected of [
  'SETTLE_SECONDS="${IOS_SMOKE_SETTLE_SECONDS:-5}"',
  'MIN_SCREENSHOT_BYTES="${IOS_SMOKE_MIN_SCREENSHOT_BYTES:-50000}"',
  "Smoke screenshot attempt $attempt looked blank or incomplete",
]) {
  assertIncludes(smokeScript, expected, "iOS simulator smoke visual-readiness contract");
}

const screenshotScript = fs.readFileSync("scripts/ios-app-store-screenshots.sh", "utf8");
for (const expected of [
  'OUTPUT_DIR="${IOS_SCREENSHOT_OUTPUT_DIR:-artifacts/ios-app-store-screenshots}"',
  'xcrun simctl launch "$SIMULATOR_ID" "$BUNDLE_ID" -SWIPEBETTER_UI_TESTING',
  "-SWIPEBETTER_APP_STORE_SCREENSHOTS",
  "-SWIPEBETTER_SCREENSHOT_TAB audit",
  "-SWIPEBETTER_SCREENSHOT_TAB auditResult",
  "-SWIPEBETTER_SCREENSHOT_TAB replies",
  "-SWIPEBETTER_SCREENSHOT_TAB account",
  "01-auth-login.png",
  "02-profile-audit-picker.png",
  "03-profile-audit-result.png",
  "04-reply-coach.png",
  "05-account-billing.png",
  "manifest.json",
  'status: "captured"',
  "Sign in with Apple and email login",
  "Profile Audit screenshot picker and credit status",
  "Profile Audit result with score and first fix",
  "Reply Coach input and generated replies",
  "Account screen with Apple billing controls",
]) {
  assertIncludes(screenshotScript, expected, "App Store screenshot capture contract");
}
if (screenshotScript.includes("requiredLater")) {
  throw new Error("App Store screenshot capture must not leave required screenshots as placeholders");
}

for (const expected of [
  "SwipeBetterScreenshotFixtures",
  "Lead with the lake photo",
  "Tacos sound good. Are you free Thursday?",
  "demo@swipebetter.ai",
]) {
  assertIncludes(rootView + appModel, expected, "deterministic App Store screenshot fixture contract");
}

const gitignore = fs.readFileSync(".gitignore", "utf8");
if (!/^artifacts\/?$/m.test(gitignore)) {
  throw new Error(".gitignore must exclude generated App Store screenshot artifacts");
}

const releaseScript = fs.readFileSync("scripts/ios-release-preflight.sh", "utf8");
for (const expected of [
  "require_env APPLE_DEVELOPMENT_TEAM",
  "require_env APPLE_APP_ID",
  "npm run check:apple-iap-config",
  "DEVELOPMENT_TEAM=\"$APPLE_DEVELOPMENT_TEAM\"",
  "CODE_SIGN_STYLE=Automatic",
  "-allowProvisioningUpdates",
  "xcodebuild \\",
  "-exportArchive",
]) {
  assertIncludes(releaseScript, expected, "signed iOS release preflight contract");
}

const iosReadinessWorkflow = fs.readFileSync(".github/workflows/ios-readiness.yml", "utf8");
for (const expected of [
  "Run iOS readiness checks",
  "concurrency:",
  "cancel-in-progress: true",
  "Run native iOS UI tests",
  "github.ref == 'refs/heads/main' || github.event_name == 'workflow_dispatch'",
  "npm run test:ios-ui",
  "Run iOS simulator smoke",
  "github.ref == 'refs/heads/main' || github.event_name == 'workflow_dispatch'",
]) {
  assertIncludes(iosReadinessWorkflow, expected, "iOS CI gate contract");
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
if (packageJson.scripts?.["test:ios-ui"] !== "scripts/ios-ui-tests.sh") {
  throw new Error("package.json must expose scripts/ios-ui-tests.sh as test:ios-ui");
}
if (packageJson.scripts?.["check:ios-release"] !== "scripts/ios-release-preflight.sh") {
  throw new Error("package.json must expose scripts/ios-release-preflight.sh as check:ios-release");
}
if (packageJson.scripts?.["check:ios-entitlement-sync"] !== "tsx scripts/ios-entitlement-sync-preflight.ts") {
  throw new Error("package.json must expose scripts/ios-entitlement-sync-preflight.ts as check:ios-entitlement-sync");
}
if (packageJson.scripts?.["check:ios-submission"] !== "tsx scripts/ios-submission-preflight.ts") {
  throw new Error("package.json must expose scripts/ios-submission-preflight.ts as check:ios-submission");
}
if (packageJson.scripts?.["capture:ios-screenshots"] !== "scripts/ios-app-store-screenshots.sh") {
  throw new Error("package.json must expose scripts/ios-app-store-screenshots.sh as capture:ios-screenshots");
}

const entitlementSyncPreflight = fs.readFileSync("scripts/ios-entitlement-sync-preflight.ts", "utf8");
for (const expected of [
  "APPLE_IAP_TEST_TRANSACTION_ID",
  "APPLE_IAP_TEST_PRODUCT_ID",
  "SWIPEBETTER_SESSION_COOKIE",
  "IOS_ENTITLEMENT_ALLOW_ALREADY_PROCESSED",
  "currentUserId(sessionCookie)",
  'fetch(appUrl("/api/auth/user")',
  "appAccountToken",
  "/api/ios/iap/transactions",
  "Entitlement sync returned processed=false",
  "Unlimited product did not grant unlimited planTier",
  "Starter product did not return numeric credits",
  "Live iOS entitlement sync preflight passed.",
]) {
  assertIncludes(entitlementSyncPreflight, expected, "live iOS entitlement sync preflight contract");
}

const submissionPreflight = fs.readFileSync("scripts/ios-submission-preflight.ts", "utf8");
for (const expected of [
  "APPLE_DEVELOPMENT_TEAM",
  "APPLE_APP_ID",
  "APPLE_IAP_TEST_TRANSACTION_ID",
  "SWIPEBETTER_SESSION_COOKIE",
  "APP_REVIEW_ACCESS_NOTES",
  "App Store metadata text limits",
  "App Store screenshot manifest",
  "Run npm run capture:ios-screenshots before submission",
  "minimumScreenshotWidth",
  "Environment shape: APPLE_DEVELOPMENT_TEAM",
  "Environment shape: APPLE_IAP_PRIVATE_KEY",
  "Environment shape: SWIPEBETTER_SESSION_COOKIE",
  "placeholderPattern",
  "Live entitlement sync command",
  "iOS submission preflight blocked",
]) {
  assertIncludes(submissionPreflight, expected, "final iOS submission preflight contract");
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
  "AppleIapOwnershipError",
  "getAppleTransactionUserId(transactionId: string, originalTransactionId?: string | null)",
  "eq(iosTransactions.transactionId, transactionId)",
  "eq(iosTransactions.originalTransactionId, originalTransactionId)",
  ".onConflictDoNothing({ target: iosTransactions.transactionId })",
  "stripeSubscriptionPreservesAccess(existing as any)",
  'planTier: "unlimited"',
  "Apple transaction is already linked to another account",
  "Apple subscription is already linked to another account",
  "${iosTransactions.originalTransactionId} = ${data.originalTransactionId}",
  "AND ${iosTransactions.userId} != ${data.userId}",
  "isAppleSubscriptionProduct(data.productId)",
  "AND ${iosTransactions.productId} LIKE 'ai.swipebetter.unlimited%'",
]) {
  assertIncludes(storage, expected, "iOS transaction storage contract");
}

const appleIap = fs.readFileSync("server/appleIap.ts", "utf8");
for (const expected of [
  "AppleIapOwnershipError",
  "createAppStoreConnectApiToken",
  "appleAppAccountTokensMatch",
  "export type AppStoreConnectApiTokenConfig",
  "isAppleSubscriptionProduct(transaction.productId) && !transaction.expiresDate",
  "Apple subscription transaction is missing an expiration date",
  "Apple subscription transaction is expired",
  "stripeSubscriptionPreservesAccess",
]) {
  assertIncludes(appleIap, expected, "iOS Apple transaction validation contract");
}

const routes = fs.readFileSync("server/routes.ts", "utf8");
for (const expected of [
  "AppleIapOwnershipError",
  "AppleIapValidationError",
  "normalizedAppleAppAccountToken(transaction.appAccountToken)",
  "Apple transaction is missing account token",
  "appAccountToken: z.string().uuid().optional()",
  "Requested Apple account token does not match session user",
  "appleAppAccountTokensMatch(transaction.appAccountToken, requested.appAccountToken)",
  "Apple account token request mismatch",
  "resolveAppleNotificationUser(transaction)",
  "accountTokenMismatch",
  'action: "account_token_mismatch"',
  'return res.status(409).json({ error: error.message });',
  'action: "ownership_conflict"',
  'return res.status(400).json({ error: error.message });',
  "hasAccess: isUnlimited || credits > 0",
  "isUnlimited",
]) {
  assertIncludes(routes, expected, "iOS Apple validation route contract");
}
const validationCatchCount = (routes.match(/error instanceof AppleIapValidationError/g) || []).length;
if (validationCatchCount < 2) {
  throw new Error("Both iOS IAP transaction and notification routes must catch AppleIapValidationError");
}

const appleIapPreflight = fs.readFileSync("scripts/apple-iap-preflight.ts", "utf8");
for (const expected of [
  "APPLE_APP_ID",
  "createAppStoreConnectApiToken({ issuerId, keyId, privateKey })",
  "decodedAppStoreConnectToken.payload.bid",
  "serverApiToken",
  "verifyAppStoreConnectProducts(appStoreConnectToken, appId, bundleId)",
  "https://api.appstoreconnect.apple.com",
  "/v1/apps/${appId}/inAppPurchasesV2?limit=200",
  "/v1/apps/${appId}/subscriptionGroups?limit=200",
  "/v1/subscriptionGroups/${group.id}/subscriptions?limit=200",
  "Missing App Store Connect products",
]) {
  assertIncludes(appleIapPreflight, expected, "Apple IAP preflight App Store Connect contract");
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
  "termsUrl",
  "refundPolicyUrl",
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

for (const field of ["supportUrl", "privacyUrl", "marketingUrl", "termsUrl", "refundPolicyUrl"]) {
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
