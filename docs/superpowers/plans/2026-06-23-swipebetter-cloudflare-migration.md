# SwipeBetter Cloudflare Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move SwipeBetter safely away from Replit by making GitHub the source of truth, Cloudflare Pages the frontend host, and then migrating or replacing every Replit-dependent backend path before shutting Replit down.

**Architecture:** Use a staged release. First preserve and push the exact current Replit code to GitHub, then run Cloudflare Pages as a verified frontend with a temporary `/api/*` proxy to Replit, then migrate backend dependencies one at a time. Final domain cutover and Replit shutdown happen only after smoke tests prove auth, checkout, AI/profile tools, admin, webhooks, and SEO routes work on the new setup.

**Tech Stack:** React, Vite, Express, Postgres, Drizzle, Stripe, Resend, OpenAI/XAI, Cloudflare Pages, Pages Functions, Wrangler, GitHub.

---

## Current Known State

- Local repo path: `/Users/davidmiller/Documents/South Florida Web Design/Swipe-Better`
- GitHub remote: `https://github.com/damediacoadmin/Swipebetter.ai`
- Cloudflare Pages project created: `swipebetter-ai`
- Current Pages URL: `https://swipebetter-ai.pages.dev`
- Cloudflare backend Worker shell created: `https://swipebetter-api.millerd79.workers.dev`
- Existing Replit backend URL used for bridge testing: `https://swipebetter.replit.app`
- Pages custom domains added on 2026-06-23: `swipebetter.ai` and `www.swipebetter.ai`; both remained `pending` after polling.
- Current domain `swipebetter.ai` is already on Cloudflare nameservers but still routes to the old Replit/Google backend (`via: 1.1 google`).
- `www.swipebetter.ai` still does not resolve.
- Current Wrangler OAuth token can attach Pages domains but cannot read/edit DNS records; DNS records API returns `403 Authentication error`.
- `npm run build` passes.
- `npm run check` fails on existing TypeScript errors in nav typing and Replit/Stripe integration files.
- A temporary Pages Function proxy exists locally at `functions/api/[[path]].js`, forwarding `/api/*` to Replit. This is a bridge only, not the final Replit removal.
- Cloudflare Containers access check failed on 2026-06-23: current account needs Workers Paid plan access before the containerized backend can be rolled out.

## File Structure

- `client/public/_redirects`: SPA fallback for Cloudflare Pages deep links.
- `functions/api/[[path]].js`: temporary Cloudflare Pages Function proxy from `/api/*` to Replit.
- `wrangler.jsonc`: Cloudflare Pages project config.
- `server/stripeClient.ts`: replace Replit Stripe connector with direct Stripe credentials.
- `server/index.ts`: remove Replit domain assumptions, add configurable production app URL and CORS origins.
- `server/email.ts`: ensure password reset and transactional links use `APP_URL=https://swipebetter.ai`.
- `server/auth.ts`: verify secure cookie, proxy, and same-site behavior after domain cutover.
- `server/routes.ts`: verify checkout success/cancel URL generation and Stripe webhook assumptions.
- `shared/models/*`: preserve existing DB shape while moving DB host or connection method.
- `docs/superpowers/plans/2026-06-23-swipebetter-cloudflare-migration.md`: this plan.

---

### Task 1: Freeze Current Replit Source And Reconcile With GitHub

**Files:**
- Inspect: Replit app `Swipe Better`
- Inspect: Replit app `Swipe Better App`
- Modify only if needed: local repo files under `/Users/davidmiller/Documents/South Florida Web Design/Swipe-Better`

- [ ] **Step 1: Confirm which Replit app is production**

Use Replit listing or the Replit dashboard and identify which app currently serves `https://swipebetter.replit.app` and `https://swipebetter.ai`.

Expected production candidate from current inspection:

```text
Swipe Better
Updated: 2026-04-14
```

Expected older candidate from current inspection:

```text
Swipe Better App
Updated: 2026-02-10
```

- [ ] **Step 2: Export or pull the production Replit source**

Use the Replit dashboard export/download or Git integration. Save the export outside the repo first:

```bash
mkdir -p /Users/davidmiller/Downloads/swipebetter-migration-backups
```

Expected: a fresh Replit source export exists in `/Users/davidmiller/Downloads/swipebetter-migration-backups`.

- [ ] **Step 3: Compare fresh Replit source to the local repo**

If the export is a zip:

```bash
cd /Users/davidmiller/Downloads/swipebetter-migration-backups
unzip -q Swipe-Better-current.zip -d Swipe-Better-current
diff -qr Swipe-Better-current/Swipe-Better "/Users/davidmiller/Documents/South Florida Web Design/Swipe-Better" \
  -x node_modules \
  -x dist \
  -x .git \
  -x .local
```

Expected: any differences are listed explicitly. If the fresh Replit export has newer app code, copy those source changes into the local repo before any GitHub push.

- [ ] **Step 4: Verify GitHub remote**

```bash
cd "/Users/davidmiller/Documents/South Florida Web Design/Swipe-Better"
git remote -v
git fetch origin
git status --short
git branch -vv
```

Expected:

```text
origin  https://github.com/damediacoadmin/Swipebetter.ai (fetch)
origin  https://github.com/damediacoadmin/Swipebetter.ai (push)
```

- [ ] **Step 5: Commit the source backup and Cloudflare bridge files**

Do not commit `node_modules`, `dist`, `.local`, or secrets.

```bash
cd "/Users/davidmiller/Documents/South Florida Web Design/Swipe-Better"
git status --short
git add client/public/_redirects functions/api/[[path]].js wrangler.jsonc docs/superpowers/plans/2026-06-23-swipebetter-cloudflare-migration.md
git -c user.name="David Miller" -c user.email="davidmiller@users.noreply.github.com" commit -m "chore: add Cloudflare Pages migration bridge"
```

Expected: commit succeeds and includes only safe migration/config files.

- [ ] **Step 6: Push to GitHub before moving anything off Replit**

```bash
cd "/Users/davidmiller/Documents/South Florida Web Design/Swipe-Better"
git push origin main
git log -1 --oneline
```

Expected: GitHub `main` contains the exact code that will be deployed or migrated. This is the hard gate: do not disconnect Replit before this passes.

---

### Task 2: Make Cloudflare Pages Frontend Production-Ready

**Files:**
- Modify: `client/public/_redirects`
- Modify: `wrangler.jsonc`
- Inspect: `client/index.html`
- Inspect: `client/public/sitemap.xml`
- Inspect: `client/public/robots.txt`

- [ ] **Step 1: Keep SPA fallback**

`client/public/_redirects` must contain:

```text
/* /index.html 200
```

Expected: direct routes such as `/pricing` and `/profile-fix` return the React app.

- [ ] **Step 2: Verify Cloudflare config**

`wrangler.jsonc` must contain:

```json
{
  "name": "swipebetter-ai",
  "pages_build_output_dir": "./dist/public",
  "compatibility_date": "2026-06-23"
}
```

- [ ] **Step 3: Build**

```bash
cd "/Users/davidmiller/Documents/South Florida Web Design/Swipe-Better"
npm ci
npm run build
```

Expected:

```text
✓ built
```

- [ ] **Step 4: Deploy to Cloudflare Pages**

```bash
cd "/Users/davidmiller/Documents/South Florida Web Design/Swipe-Better"
npx wrangler pages deploy dist/public --project-name=swipebetter-ai --commit-dirty=true
```

Expected: deployment completes and prints a `*.swipebetter-ai.pages.dev` URL.

- [ ] **Step 5: Smoke static routes**

```bash
curl --tlsv1.2 -I https://swipebetter-ai.pages.dev/
curl --tlsv1.2 -I https://swipebetter-ai.pages.dev/pricing
curl --tlsv1.2 -I https://swipebetter-ai.pages.dev/profile-fix
```

Expected for all:

```text
HTTP/2 200
content-type: text/html; charset=utf-8
```

---

### Task 3: Keep The Temporary API Bridge Until Backend Migration Is Complete

**Files:**
- Modify: `functions/api/[[path]].js`

- [ ] **Step 1: Keep the Replit bridge explicit**

`functions/api/[[path]].js` must contain:

```js
const BACKEND_ORIGIN = "https://swipebetter.replit.app";

export async function onRequest({ request }) {
  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(incomingUrl.pathname + incomingUrl.search, BACKEND_ORIGIN);
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("origin");
  headers.set("x-forwarded-host", incomingUrl.host);
  headers.set("x-forwarded-proto", "https");

  const upstreamRequest = new Request(upstreamUrl, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });

  const upstreamResponse = await fetch(upstreamRequest);
  const responseHeaders = new Headers(upstreamResponse.headers);
  const location = responseHeaders.get("location");

  if (location?.startsWith(BACKEND_ORIGIN)) {
    responseHeaders.set("location", location.replace(BACKEND_ORIGIN, incomingUrl.origin));
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}
```

- [ ] **Step 2: Deploy and verify API bridge**

```bash
cd "/Users/davidmiller/Documents/South Florida Web Design/Swipe-Better"
npm run build
npx wrangler pages deploy dist/public --project-name=swipebetter-ai --commit-dirty=true
curl --tlsv1.2 -s https://swipebetter-ai.pages.dev/api/auth/user
curl --tlsv1.2 -s https://swipebetter-ai.pages.dev/api/products-with-prices | head -c 200
```

Expected:

```text
{"user":null}
```

The products endpoint should return JSON containing product or price data.

- [ ] **Step 3: Do not treat the bridge as final**

This bridge still depends on Replit. It exists only so Cloudflare Pages can be tested safely before backend migration.

Commit after verification:

```bash
git add client/public/_redirects functions/api/[[path]].js wrangler.jsonc
git -c user.name="David Miller" -c user.email="davidmiller@users.noreply.github.com" commit -m "chore: deploy Cloudflare Pages frontend bridge"
git push origin main
```

---

### Task 4: Remove Replit-Specific Backend Dependencies

**Files:**
- Modify: `server/stripeClient.ts`
- Modify: `server/index.ts`
- Modify: `server/email.ts`
- Modify: `server/routes.ts`

- [ ] **Step 1: Replace Replit Stripe connector with direct Stripe env vars**

Replace `server/stripeClient.ts` with:

```ts
import Stripe from "stripe";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

export async function getUncachableStripeClient() {
  return new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2025-11-17.clover",
  });
}

export async function getStripePublishableKey() {
  return requireEnv("STRIPE_PUBLISHABLE_KEY");
}

export async function getStripeSecretKey() {
  return requireEnv("STRIPE_SECRET_KEY");
}

let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import("stripe-replit-sync");

    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: requireEnv("DATABASE_URL"),
        max: 2,
      },
      stripeSecretKey: requireEnv("STRIPE_SECRET_KEY"),
    });
  }
  return stripeSync;
}
```

- [ ] **Step 2: Add production app URL helper**

In `server/index.ts`, add near the top:

```ts
const appUrl = process.env.APP_URL || "https://swipebetter.ai";
```

Replace:

```ts
const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
```

With:

```ts
const webhookBaseUrl = appUrl;
```

- [ ] **Step 3: Update CORS origins**

In `server/index.ts`, replace `allowedOrigins` with:

```ts
const allowedOrigins = [
  "https://swipebetter.ai",
  "https://www.swipebetter.ai",
  "https://swipebetter-ai.pages.dev",
  "https://swipebetter.replit.app",
];
```

Keep the Replit origins until the final shutdown.

- [ ] **Step 4: Ensure email links use production URL**

In `server/email.ts`, set production env during deploy:

```text
APP_URL=https://swipebetter.ai
RESEND_FROM_EMAIL=noreply@swipebetter.ai
```

No code change is required if `server/email.ts` already prioritizes `process.env.APP_URL`.

- [ ] **Step 5: Typecheck the Stripe migration**

```bash
npm run check
```

Expected: the previous Stripe API-version TypeScript error is gone. Remaining TypeScript errors must be listed and fixed before final backend cutover.

- [ ] **Step 6: Commit and push**

```bash
git add server/stripeClient.ts server/index.ts server/email.ts server/routes.ts
git -c user.name="David Miller" -c user.email="davidmiller@users.noreply.github.com" commit -m "refactor: remove Replit Stripe domain assumptions"
git push origin main
```

---

### Task 5: Build The Cloudflare Container Backend

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`
- Create: `cloudflare/backend-worker.js`
- Create: `wrangler.backend.jsonc`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `functions/api/[[path]].js`
- Modify: `wrangler.jsonc`
- Modify: `.env.production.example`

- [ ] **Step 1: Use Cloudflare Containers for the existing backend**

Use Cloudflare Pages only for frontend and lightweight functions. Do not force the current Express backend into Pages Functions in one shot. The current backend uses Express, sessions, Postgres TCP, Stripe, Resend, AI clients, `bcrypt`, `sharp`, and `stripe-replit-sync`; that is not a clean edge-runtime lift.

Hard prerequisite: Cloudflare Containers require Workers Paid plan access. Verify before final backend rollout:

```bash
npx wrangler containers list -c wrangler.backend.jsonc
```

Expected before rollout:

```text
No authorization error.
```

Observed blocker on 2026-06-23:

```text
Unauthorized: You do not have access to Cloudflare Containers. Deploying containers requires the Workers Paid plan.
```

Use this target architecture:

```text
Frontend: Cloudflare Pages project `swipebetter-ai`
Backend: Cloudflare Workers + Containers project `swipebetter-api`
API routing: Pages Function `/api/*` proxies to `SWIPEBETTER_API_ORIGIN`
Temporary API origin: `https://swipebetter.replit.app`
Final API origin after backend smoke: `https://api.swipebetter.ai`
```

- [ ] **Step 2: Add container deployment files**

Required files:

```text
Dockerfile
.dockerignore
cloudflare/backend-worker.js
wrangler.backend.jsonc
```

The backend worker must route requests to a single named container instance:

```js
const container = env.SWIPEBETTER_API.getByName("primary");
await container.startAndWaitForPorts({
  ports: [5000],
  startOptions: { envVars: containerEnv(env) },
});
return container.fetch(request);
```

Expected dry-run:

```bash
npx wrangler deploy -c wrangler.backend.jsonc --dry-run --containers-rollout=none
```

Expected output includes:

```text
env.SWIPEBETTER_API (SwipeBetterApi) Durable Object
The following containers are available:
- swipebetter-api-swipebetterapi
--dry-run: exiting now.
```

- [ ] **Step 3: Configure required env vars**

Set these on the backend host:

```text
NODE_ENV=production
APP_URL=https://swipebetter.ai
PORT=5000
DATABASE_URL=<production postgres url>
SESSION_SECRET=<existing session secret or rotated planned value>
JWT_SECRET=<existing jwt secret or same value as session if current app expects it>
STRIPE_SECRET_KEY=<stripe secret key>
STRIPE_PUBLISHABLE_KEY=<stripe publishable key>
STRIPE_WEBHOOK_SECRET=<stripe webhook secret after endpoint is created>
RESEND_API_KEY=<resend api key>
RESEND_FROM_EMAIL=noreply@swipebetter.ai
AI_INTEGRATIONS_OPENAI_API_KEY=<openai-compatible key if still used>
AI_INTEGRATIONS_OPENAI_BASE_URL=<base url if still used>
XAI_API_KEY=<xai key if still used>
APPLE_CLIENT_ID=<apple login client id if enabled>
GOOGLE_CLIENT_ID=<google login client id if enabled>
ADMIN_EMAIL=<admin email>
ADMIN_PASSWORD=<admin password>
```

Use `.env.production.example` as the checklist. Do not commit real values.

- [ ] **Step 4: Build or deploy the container image**

If Docker is available locally:

```bash
docker build -t swipebetter-api:local .
```

If Docker is not available locally, use Cloudflare's container command from an environment with Docker available:

```bash
npx wrangler containers build . -t swipebetter-api:latest
```

Expected: image build completes. If Docker is missing, document that as a local environment blocker, not an application code blocker.

- [ ] **Step 5: Migrate database carefully**

Before changing the app:

```bash
pg_dump "$OLD_DATABASE_URL" > /Users/davidmiller/Downloads/swipebetter-migration-backups/swipebetter-pre-cutover.sql
psql "$NEW_DATABASE_URL" < /Users/davidmiller/Downloads/swipebetter-migration-backups/swipebetter-pre-cutover.sql
```

Expected: restore completes with no fatal errors. If the current DB is already external and will remain the same, skip restore and document that `DATABASE_URL` is unchanged.

- [ ] **Step 6: Deploy backend Worker and container**

Deploy only after secrets are configured:

```bash
npx wrangler deploy -c wrangler.backend.jsonc --containers-rollout=gradual --keep-vars
```

If the service will use `api.swipebetter.ai`, attach that custom domain to the Worker after deploy.

- [ ] **Step 7: Run backend smoke on new host**

Replace `<backend-url>` with the new backend URL:

```bash
curl -s <backend-url>/api/auth/user
curl -s <backend-url>/api/products-with-prices | head -c 200
curl -I <backend-url>/
```

Expected:

```text
{"user":null}
```

Products endpoint returns JSON. Root route returns HTML or a known health response.

- [ ] **Step 8: Point Cloudflare Pages proxy to the new backend**

In `wrangler.jsonc`, replace:

```json
"SWIPEBETTER_API_ORIGIN": "https://swipebetter.replit.app"
```

With:

```json
"SWIPEBETTER_API_ORIGIN": "https://api.swipebetter.ai"
```

Deploy:

```bash
npm run build
npx wrangler pages deploy dist/public --project-name=swipebetter-ai --commit-dirty=true
```

- [ ] **Step 9: Verify no API path uses Replit**

```bash
curl --tlsv1.2 -s -D - https://swipebetter-ai.pages.dev/api/auth/user -o -
curl --tlsv1.2 -s -D - https://swipebetter-ai.pages.dev/api/products-with-prices -o - | head -c 2000
```

Expected headers should no longer contain:

```text
via: 1.1 google
```

Expected body for auth:

```text
{"user":null}
```

- [ ] **Step 10: Commit and push backend host switch**

```bash
git add wrangler.jsonc functions/api/[[path]].js
git -c user.name="David Miller" -c user.email="davidmiller@users.noreply.github.com" commit -m "chore: switch API proxy off Replit"
git push origin main
```

---

### Task 6: Stripe, Auth, Admin, And AI Smoke Tests

**Files:**
- Inspect/modify if failures occur: `server/routes.ts`, `server/auth.ts`, `client/src/lib/queryClient.ts`, `client/src/lib/auth.ts`

- [ ] **Step 1: Auth smoke**

Use a test account, not a real customer account:

```text
Open https://swipebetter-ai.pages.dev/auth
Create test user or log in.
Open account/dashboard page.
Log out.
Log back in.
```

Expected: session cookie persists on the Pages domain and `/api/auth/user` returns the logged-in user.

- [ ] **Step 2: Product smoke**

```bash
curl --tlsv1.2 -s https://swipebetter-ai.pages.dev/api/products-with-prices | head -c 500
```

Expected: JSON includes active Stripe products and prices.

- [ ] **Step 3: Checkout smoke**

Use Stripe test mode first if possible:

```text
Open https://swipebetter-ai.pages.dev/pricing
Click each checkout button until Stripe checkout opens.
Confirm success_url starts with https://swipebetter-ai.pages.dev or https://swipebetter.ai after domain cutover.
Do not run a live charge unless explicitly approved.
```

Expected: Stripe checkout opens and returns to the expected frontend URL.

- [ ] **Step 4: AI/profile tool smoke**

```text
Open https://swipebetter-ai.pages.dev/profile-fix
Submit a small test profile input.
Confirm the analysis job starts.
Confirm the status polling endpoint returns JSON.
Confirm the result page loads.
```

Expected: no HTML response from API endpoints; all API responses are JSON.

- [ ] **Step 5: Admin smoke**

```text
Open https://swipebetter-ai.pages.dev/admin-login
Log in with admin credentials.
Open dashboard and promo code pages.
Log out.
```

Expected: admin session works and promo code CRUD calls return JSON.

- [ ] **Step 6: Webhook smoke**

Use Stripe CLI or dashboard test event against the new webhook URL:

```text
https://<new-backend-host>/api/stripe/webhook
```

Expected: webhook returns `200` for valid signed events and updates subscription or credit records.

---

### Task 7: Domain Cutover

**Files:**
- Cloudflare dashboard or Cloudflare API
- No code changes unless smoke fails

- [ ] **Step 1: Attach custom domains to Pages**

In Cloudflare dashboard:

```text
Workers & Pages
swipebetter-ai
Custom domains
Add swipebetter.ai
Add www.swipebetter.ai
```

Expected: Cloudflare creates or asks for the required DNS records.

Current status from 2026-06-23:

```text
swipebetter.ai added to Pages project; status pending
www.swipebetter.ai added to Pages project; status pending
DNS records cannot be read or edited by the current Wrangler OAuth token
```

The remaining domain work needs Cloudflare dashboard DNS access or an API token with DNS edit permission.

- [ ] **Step 2: DNS target**

Expected final DNS:

```text
swipebetter.ai      -> Cloudflare Pages custom domain
www.swipebetter.ai  -> Cloudflare Pages custom domain or redirect to apex
```

Do not leave apex routed to the old Replit/Google backend after cutover.

- [ ] **Step 3: Verify apex and www**

```bash
dig +short NS swipebetter.ai
dig +short A swipebetter.ai
dig +short CNAME www.swipebetter.ai
curl -I https://swipebetter.ai/
curl -I https://swipebetter.ai/pricing
curl -s https://swipebetter.ai/api/auth/user
curl -I https://www.swipebetter.ai/
```

Expected:

```text
HTTP/2 200
{"user":null}
```

Expected `server` header should be Cloudflare. After final backend migration, API responses should not show Replit/Google backend headers.

- [ ] **Step 4: Update Stripe URLs**

In Stripe dashboard:

```text
Success URL: https://swipebetter.ai/checkout/success?session_id={CHECKOUT_SESSION_ID}
Cancel URL: https://swipebetter.ai/pricing
Webhook URL: https://<new-backend-host>/api/stripe/webhook
```

Expected: Stripe sends events to the new backend and customer checkout returns to `swipebetter.ai`.

- [ ] **Step 5: Update OAuth callback URLs**

If Google or Apple login is enabled, update allowed redirect/callback domains to include:

```text
https://swipebetter.ai
https://www.swipebetter.ai
```

Expected: OAuth login works from production domain.

---

### Task 8: Replit Shutdown Gate

**Files:**
- No code changes

- [ ] **Step 1: Run final production smoke on `swipebetter.ai`**

```bash
curl -I https://swipebetter.ai/
curl -I https://swipebetter.ai/pricing
curl -s https://swipebetter.ai/api/auth/user
curl -s https://swipebetter.ai/api/products-with-prices | head -c 200
```

Expected:

```text
HTTP/2 200
{"user":null}
```

- [ ] **Step 2: Confirm backend headers are not Replit**

```bash
curl -s -D - https://swipebetter.ai/api/auth/user -o /dev/null
```

Expected after full backend migration:

```text
No "via: 1.1 google"
No "replit" backend dependency
```

- [ ] **Step 3: Keep Replit running for rollback window**

Keep Replit app active for at least 48 hours after domain cutover.

Rollback command path:

```text
Cloudflare DNS or Pages custom domain can be pointed back to the old Replit target if a critical issue appears.
```

- [ ] **Step 4: Archive Replit only after rollback window**

Only after 48 hours with clean logs and successful checkout/auth/tool usage:

```text
Remove Replit deployment.
Remove Replit-specific env vars.
Remove temporary Replit API proxy code.
Commit and push cleanup.
```

Final cleanup commit:

```bash
git add functions/api/[[path]].js server/stripeClient.ts server/index.ts server/email.ts server/routes.ts
git -c user.name="David Miller" -c user.email="davidmiller@users.noreply.github.com" commit -m "chore: remove Replit migration bridge"
git push origin main
```

---

## Self-Review

- Spec coverage: The plan includes the requested GitHub-before-move gate, Cloudflare Pages frontend setup, temporary API bridge, backend Replit dependency removal, final backend host decision, domain cutover, and shutdown gate.
- Placeholder scan: No implementation step depends on an undefined placeholder except intentionally marked operator-supplied secrets and the future backend host URL.
- Type consistency: File paths and commands match the current repository layout inspected during planning.
- Safest constraint: Do not point `swipebetter.ai` away from Replit until GitHub push, Pages smoke, API smoke, backend smoke, Stripe smoke, auth smoke, and rollback plan all pass.
