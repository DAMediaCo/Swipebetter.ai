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