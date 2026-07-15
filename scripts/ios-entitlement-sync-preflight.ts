const expectedProductIds = new Set([
  "ai.swipebetter.starter",
  "ai.swipebetter.unlimited.monthly",
  "ai.swipebetter.unlimited.annual",
]);

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for live iOS entitlement sync preflight`);
  }
  return value;
}

function appUrl(path: string): string {
  const base = (process.env.APP_URL || "https://swipebetter.ai").replace(/\/$/, "");
  return `${base}${path}`;
}

async function readBody(response: Response): Promise<string> {
  const body = await response.text();
  return body.length > 1000 ? `${body.slice(0, 1000)}...` : body;
}

async function currentUserId(sessionCookie: string): Promise<string> {
  const response = await fetch(appUrl("/api/auth/user"), {
    headers: {
      Cookie: sessionCookie,
    },
  });

  if (!response.ok) {
    throw new Error(`Could not read authenticated user for entitlement sync: HTTP ${response.status} ${await readBody(response)}`);
  }

  const result = await response.json() as {
    user?: {
      id?: string;
    } | null;
  };

  if (!result.user?.id) {
    throw new Error("Authenticated session did not return a user ID for Apple appAccountToken verification.");
  }

  return result.user.id;
}

async function main() {
  const transactionId = requireEnv("APPLE_IAP_TEST_TRANSACTION_ID");
  const productId = requireEnv("APPLE_IAP_TEST_PRODUCT_ID");
  const sessionCookie = requireEnv("SWIPEBETTER_SESSION_COOKIE");
  const allowAlreadyProcessed = process.env.IOS_ENTITLEMENT_ALLOW_ALREADY_PROCESSED === "true";

  if (!expectedProductIds.has(productId)) {
    throw new Error(`APPLE_IAP_TEST_PRODUCT_ID must be one of: ${Array.from(expectedProductIds).join(", ")}`);
  }

  const appAccountToken = await currentUserId(sessionCookie);

  const response = await fetch(appUrl("/api/ios/iap/transactions"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({ transactionId, productId, appAccountToken }),
  });

  if (!response.ok) {
    throw new Error(`Entitlement sync failed: HTTP ${response.status} ${await readBody(response)}`);
  }

  const result = await response.json() as {
    success?: boolean;
    processed?: boolean;
    planTier?: string;
    credits?: number;
  };

  if (result.success !== true) {
    throw new Error(`Entitlement sync did not return success=true: ${JSON.stringify(result)}`);
  }
  if (result.processed !== true && !allowAlreadyProcessed) {
    throw new Error("Entitlement sync returned processed=false; use a fresh sandbox transaction or set IOS_ENTITLEMENT_ALLOW_ALREADY_PROCESSED=true for an idempotency check.");
  }
  if (productId.includes(".unlimited.") && result.planTier !== "unlimited") {
    throw new Error(`Unlimited product did not grant unlimited planTier: ${JSON.stringify(result)}`);
  }
  if (productId === "ai.swipebetter.starter" && typeof result.credits !== "number") {
    throw new Error(`Starter product did not return numeric credits: ${JSON.stringify(result)}`);
  }

  console.log("Live iOS entitlement sync preflight passed.");
  console.log(`Product ID: ${productId}`);
  console.log(`Transaction ID: ${transactionId}`);
  console.log("App account token: matched authenticated user.");
  console.log(`Processed: ${result.processed}`);
  console.log(`Plan tier: ${result.planTier || "unknown"}`);
  console.log(`Credits: ${typeof result.credits === "number" ? result.credits : "unknown"}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
