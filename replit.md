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
  - `users` and `sessions` - Replit Auth integration (mandatory)
  - `profileAnalyses` - Stores profile improvement requests and results
  - `replyAnalyses` - Stores reply generation requests and results
  - `userSubscriptions` - Tracks free usage and Stripe subscription status

### Authentication
- **Provider**: Replit Auth via OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Implementation**: Located in `server/replit_integrations/auth/`

### Key Routes
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