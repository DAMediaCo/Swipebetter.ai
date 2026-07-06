import fs from "node:fs";

type Check = {
  label: string;
  ok: boolean;
  detail: string;
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
  const metadata = readJson<{
    appName?: string;
    subtitle?: string;
    promotionalText?: string;
    description?: string;
    keywords?: string;
    supportUrl?: string;
    privacyUrl?: string;
    marketingUrl?: string;
    reviewNotes?: string;
    inAppPurchases?: Array<{ productId?: string; price?: string }>;
    screenshots?: string[];
  }>("ios/SwipeBetter/AppStoreMetadata.json");

  const products = new Map((metadata.inAppPurchases || []).map((item) => [item.productId, item.price]));
  const urls = [metadata.supportUrl, metadata.privacyUrl, metadata.marketingUrl].filter(Boolean);

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
      ok: urls.length === 3 && urls.every((url) => /^https:\/\/swipebetter\.ai\//.test(url || "") || url === "https://swipebetter.ai"),
      detail: "Support, privacy, and marketing URLs must be live SwipeBetter HTTPS URLs.",
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

function main() {
  const checks = [
    ...metadataChecks(),
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

main();
