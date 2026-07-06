const SITE_URL = "https://swipebetter.ai";
const DEFAULT_IMAGE = `${SITE_URL}/og/swipebetter-preview-v3.png`;

export const INDEXABLE_ROUTES = [
  "/",
  "/pricing",
  "/blog",
  "/tools/tinder-bio-generator",
  "/tools/hinge-prompt-writer",
  "/tools/dating-photo-analyzer",
  "/fix-profile",
  "/fix-reply",
  "/blog/why-am-i-getting-no-matches",
  "/blog/best-tinder-bios-for-engineers-and-nerds",
  "/blog/how-to-reply-to-hey-on-bumble",
  "/blog/tinder-shadowban-test-2026",
  "/tinder-bio-guide",
  "/hinge-prompts-men",
  "/hinge-prompts-women",
  "/bumble-opener-lines",
  "/dating-app-photos",
  "/hinge-profile-tips",
  "/bumble-bio-examples",
  "/tinder-photo-order",
  "/what-to-text-after-matching",
  "/revive-dead-conversation",
  "/terms",
  "/privacy",
  "/cookie-policy",
  "/refund-policy",
  "/disclaimer",
  "/contact",
  "/acceptable-use",
];

export const NOINDEX_STATIC_ROUTES = [
  "/auth",
  "/forgot-password",
  "/reset-password",
  "/account",
  "/dashboard",
  "/admin",
  "/admin/dashboard",
  "/admin/promo-codes",
  "/redeem",
  "/checkout/success",
  "/fix-profile/results",
  "/fix-profile/upgrade",
  "/fix-reply/results",
  "/fix-reply/upgrade",
];

const ROUTE_META = {
  "/": {
    title: "AI Dating Profile Audit for Tinder, Hinge & Bumble",
    description: "Upload dating profile screenshots for an AI audit with a 0-100 score, photo feedback, bio and prompt rewrites, and reply help.",
    h1: "AI Dating Profile Audit",
    intro: "Analyze your dating profile for weak photos, generic bios, unclear prompts, and reply mistakes across Tinder, Hinge, Bumble, and more.",
    type: "software",
  },
  "/pricing": {
    title: "SwipeBetter Pricing | AI Dating Profile Audit Plans",
    description: "Choose a SwipeBetter plan for AI dating profile audits, photo feedback, bio rewrites, Hinge prompt fixes, and reply suggestions.",
    h1: "SwipeBetter Pricing",
    intro: "Compare plans for unlocking your full dating profile audit, photo feedback, bio rewrites, prompt fixes, and AI reply suggestions.",
    type: "software",
  },
  "/blog": {
    title: "Dating Tips & Guides | SwipeBetter Blog",
    description: "Expert dating app tips, profile guides, and conversation strategies to get more matches on Tinder, Bumble, and Hinge.",
    h1: "Dating Tips & Guides",
    intro: "Practical guides for better dating app photos, stronger bios, sharper Hinge prompts, and replies that keep conversations moving.",
    type: "collection",
  },
  "/tools/tinder-bio-generator": {
    title: "AI Tinder Bio Generator | Dating Bio Writer",
    description: "Generate Tinder bio ideas that sound specific, natural, and easy to reply to for Tinder, Hinge, Bumble, and other dating apps.",
    h1: "AI Tinder Bio Generator",
    intro: "Create dating bio options that use real details, avoid cliches, and give matches an easy reason to start a conversation.",
    type: "software",
  },
  "/tools/hinge-prompt-writer": {
    title: "AI Hinge Prompt Writer | Answer Generator",
    description: "Write Hinge prompt answers that sound specific, natural, and easy to comment on for Dating me is like, Two truths, and more.",
    h1: "AI Hinge Prompt Writer",
    intro: "Turn flat Hinge answers into specific, conversational prompts with details that make it easier for matches to reply.",
    type: "software",
  },
  "/tools/dating-photo-analyzer": {
    title: "AI Dating Photo Analyzer | Rate Tinder & Hinge Photos",
    description: "Analyze dating profile photos for lighting, expression, trust signals, variety, and photo order before uploading to Tinder or Hinge.",
    h1: "AI Dating Photo Analyzer",
    intro: "Review your dating photos for first-photo strength, expression, lighting, authenticity, variety, and lineup order before you upload them.",
    type: "software",
  },
  "/fix-profile": {
    title: "AI Dating Profile Analyzer | Tinder, Hinge & Bumble Audit",
    description: "Upload profile screenshots for a private AI audit with a 0-100 score, photo feedback, bio rewrites, and Hinge prompt fixes.",
    h1: "AI Dating Profile Analyzer",
    intro: "Upload profile screenshots and get a private AI audit with a score, photo notes, bio rewrites, prompt feedback, and specific fixes.",
    type: "software",
  },
  "/fix-reply": {
    title: "AI Dating Reply Generator | Tinder, Hinge & Bumble",
    description: "Paste a dating app conversation and get reply suggestions that sound playful, confident, flirty, or thoughtful.",
    h1: "AI Dating Reply Generator",
    intro: "Generate context-aware replies for Tinder, Hinge, Bumble, and other dating app conversations without sounding generic.",
    type: "software",
  },
  "/blog/why-am-i-getting-no-matches": {
    title: "Why Am I Getting No Matches? Dating Profile Fix Guide",
    description: "Learn why you are getting no matches on Tinder, Bumble, or Hinge and how to fix your photos, bio, prompts, and swipe behavior.",
    h1: "Why Am I Getting No Matches?",
    intro: "A practical diagnosis for dating app profiles that get views but no matches, with fixes for photos, bios, prompts, and app behavior.",
    type: "article",
  },
  "/blog/best-tinder-bios-for-engineers-and-nerds": {
    title: "15+ Tinder Bios for Engineers, Gamers & Nerds That Work",
    description: "Copy and adapt smart Tinder bios for engineers, gamers, nerds, and introverts that show personality without sounding awkward.",
    h1: "Tinder Bios for Engineers, Gamers & Nerds",
    intro: "Examples and patterns for writing a Tinder bio that feels specific, funny, and attractive without hiding what makes you interesting.",
    type: "article",
  },
  "/blog/how-to-reply-to-hey-on-bumble": {
    title: "How to Reply to Hey on Bumble | 10 Responses That Work",
    description: "Use these playful, confident replies when someone opens with hey on Bumble and you want to keep the conversation alive.",
    h1: "How to Reply to Hey on Bumble",
    intro: "Low-effort openers are common. These response patterns help you answer simply while still moving the conversation forward.",
    type: "article",
  },
  "/blog/tinder-shadowban-test-2026": {
    title: "Tinder Shadowban Test 2026 | Signs, Checks & Fixes",
    description: "Check if you might be shadowbanned on Tinder, understand the warning signs, and learn what to fix before blaming the algorithm.",
    h1: "Tinder Shadowban Test 2026",
    intro: "Use these checks to separate a possible Tinder shadowban from the more common problem: weak photos, prompts, or profile positioning.",
    type: "article",
  },
  "/tinder-bio-guide": {
    title: "How to Write a Tinder Bio That Gets Matches",
    description: "Write a Tinder bio that shows personality, avoids cliches, and gives matches an easy way to start a conversation.",
    h1: "How to Write a Tinder Bio That Works",
    intro: "A practical Tinder bio guide with structure, examples, mistakes to avoid, and prompts for writing something that sounds like you.",
    type: "article",
  },
  "/hinge-prompts-men": {
    title: "Best Hinge Prompts for Men | Examples That Get Replies",
    description: "Hinge prompt examples for men that show personality, invite replies, and avoid generic one-line answers.",
    h1: "Best Hinge Prompts for Men",
    intro: "Use specific Hinge prompt answers that communicate taste, humor, intent, and personality without sounding forced.",
    type: "article",
  },
  "/hinge-prompts-women": {
    title: "Best Hinge Prompts for Women | Standout Answer Examples",
    description: "Hinge prompt examples for women that feel specific, confident, and easy for better matches to respond to.",
    h1: "Best Hinge Prompts for Women",
    intro: "Examples and frameworks for Hinge prompts that filter for better conversations instead of collecting low-effort likes.",
    type: "article",
  },
  "/bumble-opener-lines": {
    title: "Bumble Opener Lines That Get Responses",
    description: "Use these Bumble opener examples to start better conversations without sounding generic, intense, or boring.",
    h1: "Bumble Opener Lines That Work",
    intro: "Opening lines for Bumble that feel easy to send, easy to answer, and specific enough to avoid the usual dead chat.",
    type: "article",
  },
  "/dating-app-photos": {
    title: "Dating App Photo Guide | Best Photos for Tinder & Hinge",
    description: "Learn what dating app photos work best, which mistakes hurt matches, and how to order your profile photos.",
    h1: "Dating App Photo Guide",
    intro: "A guide to choosing dating app photos with better lighting, expression, trust signals, variety, and profile order.",
    type: "article",
  },
  "/hinge-profile-tips": {
    title: "Hinge Profile Tips for Photos, Prompts & Replies",
    description: "Improve your Hinge profile with practical tips for photos, prompts, profile details, settings, and conversation-friendly signals.",
    h1: "Hinge Profile Tips",
    intro: "Improve each part of your Hinge profile so your photos, prompts, details, and reply signals work together.",
    type: "article",
  },
  "/bumble-bio-examples": {
    title: "Bumble Bio Examples | Bios That Get Right Swipes",
    description: "Use these Bumble bio examples and writing tips to sound confident, specific, and easy to message.",
    h1: "Bumble Bio Examples",
    intro: "Bumble bios that show personality, avoid empty adjectives, and give your match a clear conversational hook.",
    type: "article",
  },
  "/tinder-photo-order": {
    title: "Best Tinder Photo Order | Which Picture Goes First",
    description: "Learn which Tinder photo should go first, which photos to move or remove, and how to order your dating profile pictures.",
    h1: "Best Tinder Photo Order",
    intro: "Your first Tinder photo earns attention, but the full lineup builds trust. Use this guide to order your photos more strategically.",
    type: "article",
  },
  "/what-to-text-after-matching": {
    title: "What to Text After Matching | Dating App Opener Guide",
    description: "Learn what to text after matching on Tinder, Bumble, or Hinge with openers that move toward a real conversation.",
    h1: "What to Text After Matching",
    intro: "Message examples and frameworks for turning a new dating app match into an actual conversation without overthinking it.",
    type: "article",
  },
  "/revive-dead-conversation": {
    title: "How to Revive a Dead Dating App Conversation",
    description: "Learn how to revive dead dating app conversations with examples that actually get responses from stalled matches.",
    h1: "How to Revive a Dead Dating App Conversation",
    intro: "Use casual callbacks, clean follow-ups, and direct resets to restart a stalled dating app conversation without sounding needy.",
    type: "article",
  },
  "/terms": legal("Terms of Service", "Read the SwipeBetter.ai terms of service for use of the AI dating profile audit and reply tools."),
  "/privacy": legal("Privacy Policy", "Read how SwipeBetter.ai handles account data, uploaded screenshots, payment data, and privacy choices."),
  "/cookie-policy": legal("Cookie Policy", "Learn how SwipeBetter.ai uses cookies, analytics, and similar technologies."),
  "/refund-policy": legal("Refund Policy", "Read the SwipeBetter.ai refund policy for credits, subscriptions, and digital purchases."),
  "/disclaimer": legal("Disclaimer", "Read the SwipeBetter.ai disclaimer for AI-generated dating profile feedback and messaging suggestions."),
  "/contact": {
    title: "Contact SwipeBetter.ai",
    description: "Contact SwipeBetter.ai for support, billing questions, product feedback, or privacy requests.",
    h1: "Contact SwipeBetter.ai",
    intro: "Contact SwipeBetter.ai for account support, billing questions, product feedback, or privacy requests.",
    type: "page",
  },
  "/acceptable-use": legal("Acceptable Use Policy", "Read the SwipeBetter.ai acceptable use policy for responsible use of AI dating tools."),
};

const noindexMeta = {
  title: "SwipeBetter Account | SwipeBetter.ai",
  description: "Sign in to SwipeBetter.ai to manage your account, profile audits, credits, and AI dating tools.",
  h1: "SwipeBetter Account",
  intro: "This account page is available for users but is not intended to appear in search results.",
  type: "utility",
  noindex: true,
};

export function normalizePath(pathname) {
  if (!pathname) return "/";
  let path = pathname.split("?")[0].split("#")[0] || "/";
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  if (path.endsWith(".html")) path = path.slice(0, -5);
  return path || "/";
}

export function routeMetaForPath(pathname) {
  const path = normalizePath(pathname);
  if (ROUTE_META[path]) return { ...ROUTE_META[path], path, noindex: false };
  if (NOINDEX_STATIC_ROUTES.includes(path) || isNoindexPrefix(path)) {
    return { ...noindexMeta, path, noindex: true };
  }
  return {
    title: "Page Not Found | SwipeBetter.ai",
    description: "The requested SwipeBetter.ai page could not be found.",
    h1: "Page Not Found",
    intro: "This page is not available and should not appear in search results.",
    type: "utility",
    path,
    noindex: true,
  };
}

export function canonicalPath(pathname) {
  return routeMetaForPath(pathname).path;
}

export function canonicalUrl(pathname) {
  const path = canonicalPath(pathname);
  return `${SITE_URL}${path === "/" ? "/" : path}`;
}

export function isNoindexPath(pathname) {
  return routeMetaForPath(pathname).noindex === true;
}

export function redirectTargetForPath(pathname) {
  const normalized = normalizePath(pathname);
  if (pathname.endsWith(".html") && ROUTE_META[normalized]) return normalized;
  if (pathname.length > 1 && pathname.endsWith("/") && ROUTE_META[normalized]) return normalized;
  return null;
}

export function publicOutputPath(pathname) {
  const path = normalizePath(pathname);
  if (path === "/") return "index.html";
  return `${path.slice(1)}/index.html`;
}

export function generateSitemapXml() {
  const urls = INDEXABLE_ROUTES.map((path) => {
    const priority = path === "/" ? "1.0" : path.startsWith("/tools/") || path.startsWith("/fix-") ? "0.9" : "0.7";
    const changefreq = path === "/" || path === "/blog" || path.startsWith("/fix-") ? "weekly" : "monthly";
    return [
      "  <url>",
      `    <loc>${canonicalUrl(path)}</loc>`,
      `    <priority>${priority}</priority>`,
      `    <changefreq>${changefreq}</changefreq>`,
      "  </url>",
    ].join("\n");
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function renderSeoHtml(html, pathname) {
  const meta = routeMetaForPath(pathname);
  let output = html
    .replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, "")
    .replace(/<meta\s+name=["']title["'][^>]*>/gi, "")
    .replace(/<meta\s+name=["']robots["'][^>]*>/gi, "")
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, "")
    .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, "")
    .replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "");

  output = output.replace("<head>", `<head>\n${buildHeadTags(meta)}`);
  output = replaceRootContent(output, buildFallbackContent(meta));
  return output;
}

function legal(h1, description) {
  return {
    title: `${h1} | SwipeBetter.ai`,
    description,
    h1,
    intro: description,
    type: "legal",
  };
}

function isNoindexPrefix(pathname) {
  return ["/api", "/audit/", "/admin/", "/checkout/", "/dashboard", "/account", "/reset-password"]
    .some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

function buildHeadTags(meta) {
  const url = canonicalUrl(meta.path);
  const robots = meta.noindex
    ? '<meta name="robots" content="noindex, nofollow">'
    : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">';

  return [
    `    <title>${escapeHtml(meta.title)}</title>`,
    `    <meta name="title" content="${escapeHtml(meta.title)}">`,
    `    <meta name="description" content="${escapeHtml(meta.description)}">`,
    `    ${robots}`,
    `    <link rel="canonical" href="${url}">`,
    '    <meta property="og:type" content="website">',
    `    <meta property="og:url" content="${url}">`,
    '    <meta property="og:site_name" content="SwipeBetter">',
    `    <meta property="og:title" content="${escapeHtml(meta.title)}">`,
    `    <meta property="og:description" content="${escapeHtml(meta.description)}">`,
    `    <meta property="og:image" content="${DEFAULT_IMAGE}">`,
    '    <meta property="og:image:width" content="1200">',
    '    <meta property="og:image:height" content="630">',
    `    <meta property="og:image:alt" content="${escapeHtml(meta.h1)}">`,
    '    <meta name="twitter:card" content="summary_large_image">',
    `    <meta name="twitter:title" content="${escapeHtml(meta.title)}">`,
    `    <meta name="twitter:description" content="${escapeHtml(meta.description)}">`,
    `    <meta name="twitter:image" content="${DEFAULT_IMAGE}">`,
    `    <meta name="twitter:image:alt" content="${escapeHtml(meta.h1)}">`,
    `    <script type="application/ld+json">${JSON.stringify(schemaForMeta(meta))}</script>`,
  ].join("\n") + "\n";
}

function buildFallbackContent(meta) {
  const links = [
    ["/fix-profile", "AI profile audit"],
    ["/tools/tinder-bio-generator", "Tinder bio generator"],
    ["/tools/hinge-prompt-writer", "Hinge prompt writer"],
    ["/tools/dating-photo-analyzer", "Dating photo analyzer"],
    ["/blog", "Dating guides"],
  ];

  return `<!--seo-root-start-->
    <main class="seo-fallback" style="max-width: 760px; margin: 0 auto; padding: 48px 20px; font-family: Inter, system-ui, sans-serif; line-height: 1.6;">
      <p style="margin: 0 0 16px;"><a href="/" style="color: inherit; font-weight: 700; text-decoration: none;">SwipeBetter.ai</a></p>
      <h1 style="font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.05; margin: 0 0 18px;">${escapeHtml(meta.h1)}</h1>
      <p style="font-size: 1.125rem; margin: 0 0 28px;">${escapeHtml(meta.intro)}</p>
      <nav aria-label="Popular SwipeBetter pages">
        <ul style="display: flex; flex-wrap: wrap; gap: 12px; list-style: none; padding: 0; margin: 0;">
          ${links.map(([href, label]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`).join("")}
        </ul>
      </nav>
    </main><!--seo-root-end-->`;
}

function replaceRootContent(html, content) {
  const withExistingSeoRoot = html.replace(
    /<div id=["']root["']>[\s\S]*?<!--seo-root-end-->\s*<\/div>/i,
    `<div id="root">${content}</div>`,
  );
  if (withExistingSeoRoot !== html) return withExistingSeoRoot;

  return html.replace(/<div id=["']root["']>\s*<\/div>/i, `<div id="root">${content}</div>`);
}

function schemaForMeta(meta) {
  const url = canonicalUrl(meta.path);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SwipeBetter", item: `${SITE_URL}/` },
      ...(meta.path === "/" ? [] : [{ "@type": "ListItem", position: 2, name: meta.h1, item: url }]),
    ],
  };

  if (meta.type === "article") {
    return [{
      "@context": "https://schema.org",
      "@type": "Article",
      headline: meta.h1,
      description: meta.description,
      url,
      image: DEFAULT_IMAGE,
      author: { "@type": "Organization", name: "SwipeBetter" },
      publisher: {
        "@type": "Organization",
        name: "SwipeBetter",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/android-chrome-192x192.png` },
      },
      dateModified: "2026-07-05",
    }, breadcrumb];
  }

  if (meta.type === "software") {
    return [{
      "@context": "https://schema.org",
      "@type": ["SoftwareApplication", "WebApplication"],
      name: meta.h1,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      url,
      description: meta.description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    }, breadcrumb];
  }

  return [{
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: meta.h1,
    description: meta.description,
    url,
    isPartOf: { "@type": "WebSite", name: "SwipeBetter", url: SITE_URL },
  }, breadcrumb];
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
