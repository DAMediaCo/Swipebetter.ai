# SwipeBetter.ai

## Overview

SwipeBetter.ai is a mobile-first B2C web application that helps users improve their dating profiles and generate better message replies using AI. Users upload screenshots of their dating profiles, select preferences, and receive AI-powered suggestions for improving their bio, photos, and conversation starters.

The application follows a freemium model with 3 free analyses before requiring a Pro subscription via Stripe.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for a dating-app inspired theme
- **Design Philosophy**: Mobile-first with thumb-friendly touch targets (44x44px minimum), sticky bottom CTAs, and progressive disclosure

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints under `/api/*`
- **AI Integration**: OpenAI API via Replit AI Integrations for profile analysis and reply generation
- **Build Process**: esbuild for server bundling, Vite for client bundling

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` exports models from `shared/models/*`
- **Key Tables**:
  - `users` - User accounts with email/password authentication
  - `sessions` - Express session storage
  - `profileAnalyses` - Stores profile improvement requests and results
  - `replyAnalyses` - Stores reply generation requests and results
  - `userSubscriptions` - Tracks free usage and Stripe subscription status

### Authentication
- **Provider**: Custom email/password authentication
- **Password Hashing**: bcrypt with 12 salt rounds
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Implementation**: Located in `server/auth.ts`
- **Routes**:
  - `POST /api/auth/signup` - Create new account
  - `POST /api/auth/login` - Sign in
  - `POST /api/auth/logout` - Sign out
  - `GET /api/auth/user` - Get current user

### Key Routes
- `/auth` - Login/signup page
- `/fix-profile` - Multi-step wizard for profile analysis
- `/fix-reply` - Multi-step wizard for reply generation
- `/pricing` - Subscription plans and checkout
- `/checkout/success` - Post-payment confirmation

## External Dependencies

### Third-Party Services
- **Stripe**: Payment processing and subscription management via Replit's Stripe connector
  - Managed webhooks for subscription lifecycle events
  - Customer portal for subscription management
  - Products and prices synced via `stripe-replit-sync`

### AI Services
- **OpenAI API**: Accessed through Replit AI Integrations
  - Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`
  - Used for image analysis (profile screenshots) and text generation (bio improvements, reply suggestions)

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries with schema defined in TypeScript

### Frontend Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **React Hook Form + Zod**: Form handling and validation
- **Embla Carousel**: Image carousel functionality

## Recent Changes (December 2024)

### GA4 Analytics Integration
- **Measurement ID**: G-GSBS999F1M
- **Implementation**: 
  - GA4 script in `client/index.html` head with automatic page_view on initial load
  - Manual tracking via `client/src/lib/analytics.ts` for SPA route changes
- **Tracked Events**:
  - `page_view` - Automatic on initial page load, manual tracking on SPA route changes via PageViewTracker component
  - `tool_entry` - When users navigate to /fix-profile or /fix-reply (with deduplication guard)
  - `analysis_started` - When user initiates profile or reply analysis
  - `preview_viewed` - When results page loads
  - `paywall_viewed` - When upgrade page loads
  - `purchase_completed` - Custom event with plan details
  - `purchase` - GA4 ecommerce event with transaction_id, value, currency, items array (includes item_id)
- **Debug Mode**: Add `?debug_mode=true` to URL to enable GA4 DebugView events and console logging
- **Purchase Tracking Flow**: Backend verifies Stripe payment_status === 'paid' via /api/verify-checkout and returns purchase data (plan_type, price, currency, transaction_id, price_id). CheckoutSuccess.tsx fires GA4 events only after backend verification confirms payment success.

### Input Validation
- Added Zod validation schemas for all API endpoints in `server/routes.ts`
- Profile analysis validates: platform (enum), gender (enum), intent (enum), screenshots (1-5 images, max 10MB each)
- Reply analysis validates: tone (enum), screenshots (1-3 images, max 10MB each)
- Checkout validates: priceId (must start with "price_")

### Security Limits
- **MAX_SCREENSHOTS**: 5 for profile analysis, 3 for reply analysis
- **MAX_SCREENSHOT_SIZE**: 10MB per base64-encoded image
- **Subscription Required**: Users must have an active Pro subscription to use analysis features (no free tier)

### Important Notes
- Frontend option values must exactly match Zod enum literals to avoid 400 errors
- Platform options: "Tinder", "Hinge", "Bumble", "Grindr", "Coffee Meets Bagel", "Other"
- ENM flag: Optional `enm: boolean` field for ethical non-monogamy profiles
- Gender options: "Man", "Woman", "Non-binary"
- Intent options: "Relationship", "Casual Dating", "Friendship", "Not Sure"
- Tone options: "flirty", "witty", "confident", "thoughtful"
- Goal options: "first_impression", "keep_going", "ask_out", "revive"

### Reply Assistant Features (January 2025)
- **Screenshot OCR**: Users can upload chat screenshots; GPT-4o vision extracts text automatically
  - Endpoint: `POST /api/ocr` with `screenshot` (base64 image)
  - Returns extracted conversation text for editing before analysis
- **Goal Selector**: Dropdown to specify conversation intent
  - Options: First Impression, Keep Conversation Going, Ask Them Out, Revive Dead Chat
  - Goal context is passed to AI prompt for more relevant suggestions
- **Updated UI**: Camera icon in textarea for screenshot upload, "Private & Secure" badge near upload area

### Admin Dashboard Overhaul (January 2025)
- **Route**: `/admin/dashboard` (protected by admin auth)
- **Schema Updates**:
  - `users.lastActiveAt` - Tracks when user last performed an analysis
  - `userSubscriptions.creditsSource` - Tracks origin of credits (none, purchased, trial, promo, admin_grant, referral, migration)
  - `userSubscriptions.lifetimeSpendCents` - Tracks total spend (for future Stripe sync)
  - `userSubscriptions.lastPaymentAt` - Tracks last payment timestamp

- **Billing Status Classification** (computed, not stored):
  - `subscription` - Has active Stripe subscription
  - `one_time` - Has payment but no active subscription
  - `trial` - No spend, credits from trial
  - `comped` - No spend, has credits from promo/admin/referral/migration
  - `free` - No spend, no credits

- **User State Classification** (computed from lastActiveAt and createdAt):
  - `New User` - Created in last 24 hours, no activity
  - `Active Today` - Last active today
  - `Active This Week` - Last active in 7 days
  - `Dormant 7+ Days` - Inactive 7-30 days
  - `Dormant 30+ Days` - Inactive 30+ days
  - `Never Used` - Never performed an analysis

- **Admin Table Columns**: Email, Date Joined, Billing, Credits (Remaining/Total), Credits Source, User State, Lifetime Spend, Last Active

- **Quick Filters**: All Users, Revenue, Comped/Promo, Never Converted, Active 7 Days, Has Credits, New Users

- **Features**: Email search, sortable columns (Date Joined, Credits, Lifetime Spend, Last Active)

### Freemium Model (January 2025)
- **Free Profile Analysis**: All logged-in users can run profile analysis for free
- **Gated Content**: Free users only see their Profile Score; detailed feedback (bio suggestions, photo feedback, improvements) is redacted server-side
- **Backend Security**: 
  - `/api/analyze-profile` returns redacted content for non-paid users
  - `/api/my-analyses` returns redacted historical data for non-paid users
  - Full content only returned when `isPaidUser` is true (active subscription OR one-time credits)
- **Frontend UX**: 
  - Score shown prominently with alert styling
  - Locked cards with blur effect for detailed sections
  - "Unlock Full Report & Suggestions" CTA prompts upgrade
- **Conversion Flow**: Users get hooked by seeing their score, then upgrade to access specific improvements

### Mobile App Support (January 2025)
- **Architecture**: Separate React Native/Expo app consuming the same backend API
- **Authentication**: JWT-based auth for mobile, session-based for web (both work in parallel)
- **Social Login Endpoints**:
  - `POST /api/auth/apple` - Sign in with Apple (verifies identity token, creates/links accounts)
  - `POST /api/auth/google` - Sign in with Google (verifies ID token, creates/links accounts)
  - `POST /api/auth/refresh` - Token refresh for mobile sessions
- **User Schema Updates**: Added `appleId` and `googleId` columns for social login
- **Payment Support**: Stripe React Native SDK handles Apple Pay / Google Pay
- **Environment Variables Required**:
  - `APPLE_CLIENT_ID` - Apple Services ID for token verification
  - `GOOGLE_CLIENT_ID` - Google OAuth client ID
  - `JWT_SECRET` - (optional, defaults to SESSION_SECRET)
- **API Spec**: See `MOBILE_APP_API_SPEC.md` for complete mobile integration documentation
- **Apple Sign In Audiences**: The `/api/auth/apple` endpoint accepts tokens from multiple audiences:
  - `APPLE_CLIENT_ID` (web Services ID)
  - `host.exp.Exponent` (Expo Go development)
  - `com.swipebetter.app` (production mobile bundle ID)
  - `app.replit.swipebetter` (TestFlight bundle ID)
- **Analyses Storage Endpoints** (for mobile app):
  - `POST /api/analyses/profile` - Save profile analysis results (requires auth)
  - `GET /api/analyses/profile` - Retrieve user's profile analysis history
  - `POST /api/analyses/reply` - Save reply analysis results (requires auth)
  - `GET /api/analyses/reply` - Retrieve user's reply analysis history
  - All endpoints support both session-based (web) and JWT-based (mobile) auth
  - Zod validation enforces enum values, screenshot limits, and array types
  - Reply POST accepts either screenshots OR conversationText
  - GET endpoints redact detailed content for non-paid users (score visible, feedback hidden)

### Password Reset Feature (January 2025)
- **Email Provider**: Resend (using user's own API key via RESEND_API_KEY secret)
- **Endpoints**:
  - `POST /api/auth/forgot-password` - Accepts email, generates secure token, sends reset email
  - `POST /api/auth/reset-password` - Accepts token + new password, validates and updates
- **Security**:
  - Tokens are 32-byte cryptographically secure (crypto.randomBytes)
  - Tokens expire after 1 hour
  - Tokens can only be used once (usedAt tracking)
  - Same response for valid/invalid emails (prevents email enumeration)
- **Frontend Routes**:
  - `/forgot-password` - Email input form
  - `/reset-password?token=xxx` - New password form
- **Database**: `password_reset_tokens` table with userId, token, expiresAt, usedAt
- **Environment**: Uses APP_URL for production reset links, REPLIT_DEV_DOMAIN for development

### Sign in with Apple (Web) - January 2025
- **Implementation**: OAuth 2.0 flow with Apple's authorization endpoint
- **Endpoints**:
  - `POST /api/auth/apple/init` - Generates and stores CSRF state in session
  - `POST /api/auth/apple/callback` - Handles Apple's form_post redirect with id_token
  - `GET /api/auth/apple-client-id` - Returns Apple Client ID for frontend
- **Security**:
  - CSRF protection via state parameter (stored in session, validated on callback)
  - Apple identity token verification using apple-signin-auth library
  - Account linking: existing users matched by appleId or email
- **Frontend**: "Sign in with Apple" button on Auth page (only shown when configured)
- **Apple Developer Portal Setup**:
  - Configure Services ID (APPLE_CLIENT_ID)
  - Add Return URLs: `https://swipebetter.ai/api/auth/apple/callback`
  - Add Domains: `swipebetter.ai`

### Navigation Improvements (January 2025)
- **Desktop**: Login button shown in header when not authenticated; user menu dropdown when authenticated
- **Mobile**: Bottom navigation includes Login/Logout option alongside Home and Dashboard

### Account Page (January 2025)
- **Route**: `/account` - Mobile-friendly account management page
- **Features**:
  - View profile info (email, name)
  - View subscription status (Pro Member, credits remaining, or free plan)
  - Upgrade to Pro button for free users
  - Manage Subscription button opens Stripe customer portal (for active subscribers)
  - Log out button
- **Data Sources**: Uses useAuth, useSubscription, and useEntitlement hooks
- **Access Control**: Redirects to /auth if user is not logged in
- **Navigation**: Account tab shown in mobile bottom nav only for authenticated users