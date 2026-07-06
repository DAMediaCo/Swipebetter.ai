import fs from "node:fs";

type Check = {
  label: string;
  ok: boolean;
  detail: string;
};

type AppStoreMetadata = {
  appName?: string;
  subtitle?: string;
  promotionalText?: string;
  description?: string;
  keywords?: string;
  supportUrl?: string;
  privacyUrl?: string;
  marketingUrl?: string;
  termsUrl?: string;
  refundPolicyUrl?: string;
  reviewNotes?: string;
  inAppPurchases?: Array<{ productId?: string; price?: string }>;
  screenshots?: string[];
};

type ScreenshotManifest = {
  bundleId?: string;
  screenshots?: Array<{
    file?: string;
    title?: string;
    status?: string;
    bytes?: number;
    width?: number;
    height?: number;
  }>;
};

const requiredEnv = [
  "APPLE_DEVELOPMENT_TEAM",
  "APPLE_APP_ID",
  "APPLE_BUNDLE_ID",
  "APPLE_IAP_ISSUER_ID",
  "APPLE_IAP_KEY_ID",
  "APPLE_IAP_PRIVATE_KEY",
  "APPLE_IAP_TEST_TRANSACTION_ID",
  "APPLE_IAP_TEST_PRODUCT_ID",
  "SWIPEBETTER_SESSION_COOKIE",
  "APP_REVIEW_ACCESS_NOTES",
];

const expectedProducts = new Map([
  ["ai.swipebetter.starter", "$3.99"],
  ["ai.swipebetter.unlimited.monthly", "$16.99"],
  ["ai.swipebetter.unlimited.annual", "$104.99"],
]);
const screenshotManifestPath = "artifacts/ios-app-store-screenshots/manifest.json";
const expectedBundleId = "ai.swipebetter.app";
const minimumScreenshotBytes = 50_000;
const minimumScreenshotWidth = 1_000;
const minimumScreenshotHeight = 2_000;

function present(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

function readJson<T>(path: string): T {
  return JSON.parse(fs.readFileSync(path, "utf8")) as T;
}

function charCount(value: string): number {
  return [...value].length;
}

function metadataChecks(): Check[] {
  const metadata = readJson<AppStoreMetadata>("ios/SwipeBetter/AppStoreMetadata.json");

  const products = new Map((metadata.inAppPurchases || []).map((item) => [item.productId, item.price]));
  const urls = [metadata.supportUrl, metadata.privacyUrl, metadata.marketingUrl, metadata.termsUrl, metadata.refundPolicyUrl].filter(Boolean);

  return [
    {
      label: "App Store metadata text limits",
      ok: Boolean(
        metadata.appName && charCount(metadata.appName) <= 30
          && metadata.subtitle && charCount(metadata.subtitle) <= 30
          && metadata.promotionalText && charCount(metadata.promotionalText) <= 170
          && metadata.description && charCount(metadata.description) <= 4000
          && metadata.keywords && Buffer.byteLength(metadata.keywords, "utf8") <= 100
      ),
      detail: "App name, subtitle, promo text, description, and keywords must fit App Store limits.",
    },
    {
      label: "App Store public URLs",
      ok: urls.length === 5 && urls.every((url) => /^https:\/\/swipebetter\.ai(?:\/|$)/.test(url || "")),
      detail: "Support, privacy, marketing, terms, and refund URLs must be SwipeBetter HTTPS URLs.",
    },
    {
      label: "App Store review notes",
      ok: Boolean(metadata.reviewNotes?.includes("sandbox Apple ID") && metadata.reviewNotes.includes("does not overlay")),
      detail: "Review notes must explain sandbox purchase testing and the privacy-safe extension workflow.",
    },
    {
      label: "In-app purchase metadata",
      ok: Array.from(expectedProducts).every(([productId, price]) => products.get(productId) === price),
      detail: "IAP metadata must include Starter, Unlimited Monthly, and Unlimited Annual with iOS prices.",
    },
    {
      label: "Screenshot plan",
      ok: Array.isArray(metadata.screenshots) && metadata.screenshots.length >= 5,
      detail: "At least five App Store screenshot targets must be planned.",
    },
  ];
}

function screenshotManifestChecks(): Check[] {
  const metadata = readJson<AppStoreMetadata>("ios/SwipeBetter/AppStoreMetadata.json");
  const expectedTitles = metadata.screenshots || [];

  if (!fs.existsSync(screenshotManifestPath)) {
    return [{
      label: "Captured App Store screenshots",
      ok: false,
      detail: `Run npm run capture:ios-screenshots before submission. Missing ${screenshotManifestPath}.`,
    }];
  }

  const manifest = readJson<ScreenshotManifest>(screenshotManifestPath);
  const screenshots = manifest.screenshots || [];
  const titles = new Set(screenshots.map((item) => item.title));
  const missingTitles = expectedTitles.filter((title) => !titles.has(title));
  const invalidFiles = screenshots.filter((item) => {
    if (!item.file || item.status !== "captured") {
      return true;
    }

    const path = `artifacts/ios-app-store-screenshots/${item.file}`;
    return !fs.existsSync(path)
      || (item.bytes || 0) < minimumScreenshotBytes
      || (item.width || 0) < minimumScreenshotWidth
      || (item.height || 0) < minimumScreenshotHeight;
  });

  return [
    {
      label: "App Store screenshot manifest",
      ok: manifest.bundleId === expectedBundleId
        && screenshots.length >= 5
        && missingTitles.length === 0
        && invalidFiles.length === 0,
      detail: missingTitles.length
        ? `Missing captured screenshot titles: ${missingTitles.join(", ")}`
        : "Every metadata screenshot target must be captured as a real high-resolution PNG.",
    },
  ];
}

async function livePublicUrlChecks(): Promise<Check[]> {
  const metadata = readJson<{
    supportUrl?: string;
    privacyUrl?: string;
    marketingUrl?: string;
    termsUrl?: string;
    refundPolicyUrl?: string;
  }>("ios/SwipeBetter/AppStoreMetadata.json");

  const urls: Array<[string, string | undefined]> = [
    ["Marketing URL", metadata.marketingUrl],
    ["Support URL", metadata.supportUrl],
    ["Privacy URL", metadata.privacyUrl],
    ["Terms URL", metadata.termsUrl],
    ["Refund policy URL", metadata.refundPolicyUrl],
  ];
  const checks: Check[] = [];

  for (const [label, url] of urls) {
    if (!url || !/^https:\/\/swipebetter\.ai(?:\/|$)/.test(url)) {
      checks.push({
        label: `Live ${label}`,
        ok: false,
        detail: `${label} must be a SwipeBetter HTTPS URL.`,
      });
      continue;
    }

    try {
      const response = await fetch(url, { redirect: "follow" });
      checks.push({
        label: `Live ${label}`,
        ok: response.ok,
        detail: `${url} returned HTTP ${response.status}.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      checks.push({
        label: `Live ${label}`,
        ok: false,
        detail: `${url} could not be reached: ${message}`,
      });
    }
  }

  return checks;
}

function envChecks(): Check[] {
  return requiredEnv.map((name) => ({
    label: `Environment: ${name}`,
    ok: present(name),
    detail: `${name} must be set in the shell running the final submission preflight.`,
  }));
}

function artifactChecks(): Check[] {
  return [
    {
      label: "Signed release archive command",
      ok: fs.existsSync("scripts/ios-release-preflight.sh"),
      detail: "Run npm run check:ios-release after Apple signing values are set.",
    },
    {
      label: "Live entitlement sync command",
      ok: fs.existsSync("scripts/ios-entitlement-sync-preflight.ts"),
      detail: "Run npm run check:ios-entitlement-sync after a real sandbox purchase exists.",
    },
  ];
}

async function main() {
  const checks = [
    ...metadataChecks(),
    ...screenshotManifestChecks(),
    ...(await livePublicUrlChecks()),
    ...envChecks(),
    ...artifactChecks(),
  ];

  const failed = checks.filter((check) => !check.ok);

  for (const check of checks) {
    console.log(`${check.ok ? "PASS" : "MISSING"} ${check.label}`);
    if (!check.ok) {
      console.log(`  ${check.detail}`);
    }
  }

  if (failed.length) {
    console.error(`iOS submission preflight blocked: ${failed.length} item(s) missing.`);
    process.exit(1);
  }

  console.log("iOS submission preflight passed.");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`iOS submission preflight errored: ${message}`);
  process.exit(1);
});
