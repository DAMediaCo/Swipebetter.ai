const GA_MEASUREMENT_ID = "G-GSBS999F1M";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let isInitialized = false;

export function initGA() {
  if (isInitialized || typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  isInitialized = true;
}

function isDev() {
  return import.meta.env.DEV;
}

export function track(eventName: string, params?: Record<string, unknown>) {
  if (isDev()) {
    console.log("[GA4]", eventName, params);
  }

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
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

interface PendingPurchase {
  planType: "starter" | "monthly" | "annual";
  price: number;
  priceId: string;
  productName: string;
}

export function storePendingPurchase(data: PendingPurchase) {
  sessionStorage.setItem("pending_purchase", JSON.stringify(data));
}

export function retrievePendingPurchase(): PendingPurchase | null {
  const data = sessionStorage.getItem("pending_purchase");
  if (data) {
    sessionStorage.removeItem("pending_purchase");
    return JSON.parse(data);
  }
  return null;
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
