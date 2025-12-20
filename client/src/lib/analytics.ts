declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export function initGA() {
}

function isDev() {
  return import.meta.env.DEV;
}

function isDebugMode() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("debug_mode") === "true";
}

export function track(eventName: string, params?: Record<string, unknown>) {
  const debugMode = isDebugMode();
  
  const eventParams = {
    ...params,
    ...(debugMode ? { debug_mode: true } : {}),
  };

  if (isDev() || debugMode) {
    console.log("[GA4]", eventName, eventParams);
  }

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
}

export function trackPageView(path: string, title: string) {
  track("page_view", {
    page_path: path,
    page_title: title,
  });
}

export function trackToolEntry(toolType: "profile" | "reply", sourcePage: string) {
  track("tool_entry", {
    tool_type: toolType,
    source_page: sourcePage,
  });
}

export function trackAnalysisStarted(toolType: "profile" | "reply") {
  track("analysis_started", {
    tool_type: toolType,
  });
}

export function trackPreviewViewed(toolType: "profile" | "reply") {
  track("preview_viewed", {
    tool_type: toolType,
  });
}

export function trackPaywallViewed(toolType: "profile" | "reply") {
  track("paywall_viewed", {
    tool_type: toolType,
  });
}


interface PurchaseParams {
  planType: "starter" | "monthly" | "annual";
  toolType: "profile" | "reply" | "both";
  price: number;
  transactionId: string;
  priceId: string;
}

export function trackPurchaseCompleted(params: PurchaseParams) {
  track("purchase_completed", {
    plan_type: params.planType,
    tool_type: params.toolType,
    price: params.price,
    currency: "USD",
  });

  const itemName =
    params.planType === "starter"
      ? "Starter Fix"
      : params.planType === "monthly"
        ? "Unlimited Monthly"
        : "Unlimited Annual";

  const itemCategory = params.planType === "starter" ? "one_time" : "subscription";

  track("purchase", {
    transaction_id: params.transactionId,
    value: params.price,
    currency: "USD",
    items: [
      {
        item_id: params.priceId,
        item_name: itemName,
        item_category: itemCategory,
        price: params.price,
        quantity: 1,
      },
    ],
  });
}

export function shouldTrackToolEntry(targetPath: string, currentPath: string): boolean {
  return targetPath !== currentPath;
}
