# SwipeBetter iOS App Store Readiness

Use this as the release checklist for the native iOS app, Share Extension, Keyboard Extension, Apple purchases, and backend entitlement sync.

## Current App Values

- App bundle ID: `ai.swipebetter.app`
- Share Extension bundle ID: `ai.swipebetter.app.share`
- Keyboard Extension bundle ID: `ai.swipebetter.app.keyboard`
- App Group: `group.ai.swipebetter.shared`
- URL scheme: `swipebetter://import`
- Minimum iOS: `17.0`
- Version/build: `1.0` / `1`

## Apple IAP Products

- Starter Pack: `ai.swipebetter.starter` at `$3.99`
- Unlimited Monthly: `ai.swipebetter.unlimited.monthly` at `$16.99/month`
- Unlimited Annual: `ai.swipebetter.unlimited.annual` at `$104.99/year`

These prices intentionally include the iOS-only Apple fee increase.

## App Store Connect Setup

- Create the app record for `ai.swipebetter.app`.
- Create bundle IDs for the app, Share Extension, and Keyboard Extension.
- Enable Sign in with Apple for the main app bundle.
- Enable App Groups for the app and Share Extension using `group.ai.swipebetter.shared`.
- Keep the Keyboard Extension without Full Access unless a future feature absolutely requires it.
- Create the three IAP products above with matching product IDs and prices.
- Create an App Store Server API key and set these backend secrets:
  - `APPLE_IAP_ISSUER_ID`
  - `APPLE_IAP_KEY_ID`
  - `APPLE_IAP_PRIVATE_KEY`
  - `APPLE_BUNDLE_ID=ai.swipebetter.app`
- Configure App Store Server Notifications to call `/api/ios/iap/notifications`.

## Required Pre-TestFlight Checks

Run from the repo root:

```bash
scripts/ios-readiness-check.sh
```

The script verifies:

- iOS plist and privacy manifest syntax.
- Keyboard `RequestsOpenAccess=false`.
- StoreKit product IDs and iOS prices.
- TypeScript compile.
- Production web/server build.
- iOS simulator build for the app plus both extensions.

## Sandbox QA

- Sign up with email and Apple sign-in.
- Confirm Forgot Password opens and sends the reset request.
- Buy Starter Pack in StoreKit sandbox and confirm one credit appears.
- Buy Monthly in StoreKit sandbox and confirm plan becomes Unlimited.
- Restore purchases after logout/login and confirm entitlement sync.
- Send an App Store Server Notification sandbox renewal and confirm the backend keeps Unlimited active.
- Cancel/expire a sandbox subscription and confirm Unlimited is removed only after Apple shows expiration.
- Share a profile screenshot into SwipeBetter and confirm the app opens on Profile Audit.
- Share chat text/screenshot into SwipeBetter and confirm the app opens on Reply Coach.
- Enable the custom keyboard and confirm it does not ask for Full Access.
- Confirm account deletion signs the user out and removes account data.

## Manual App Review Notes

- The app does not overlay or read other apps directly. iOS does not allow that for App Store apps.
- The Share Extension imports user-selected screenshots/text into SwipeBetter.
- The Keyboard Extension inserts safe reply starters and opens SwipeBetter for full analysis.
- Web Stripe checkout is intentionally hidden inside the iOS app; iOS purchases use Apple IAP.
- Screenshots and chat/profile content are used only for app functionality.
