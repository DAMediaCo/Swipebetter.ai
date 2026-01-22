# SwipeBetter.ai

## Overview
SwipeBetter.ai is a mobile-first B2C web application that leverages AI to enhance users' dating profiles and message replies. It allows users to upload dating profile screenshots, specify preferences, and receive AI-driven suggestions for improving their bios, photos, and conversation starters. The application operates on a freemium model, offering initial free analyses before requiring a Pro subscription for continued access. The vision is to empower users to achieve more successful dating interactions through intelligent assistance.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript (Vite).
- **Routing**: Wouter.
- **State Management**: TanStack React Query.
- **UI**: shadcn/ui (built on Radix UI) and Tailwind CSS with custom dark, tech-inspired design tokens (electric cyan accents).
- **Design Principles**: Mobile-first, thumb-friendly touch targets (44x44px minimum), sticky bottom CTAs, and progressive disclosure.

### Backend
- **Runtime**: Node.js with Express.
- **Language**: TypeScript with ESM modules.
- **API**: RESTful endpoints (`/api/*`).
- **AI Integration**: OpenAI API via Replit AI Integrations for profile analysis, image analysis, and reply generation.
- **Build**: esbuild.

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM.
- **Schema**: `shared/schema.ts` defining `users`, `sessions`, `profileAnalyses`, `replyAnalyses`, `userSubscriptions`, and `password_reset_tokens` tables.

### Authentication
- Custom email/password authentication using bcrypt for hashing.
- PostgreSQL-backed sessions (`connect-pg-simple`).
- Supports JWT-based authentication for mobile, and social logins (Apple, Google).
- Includes password reset functionality via email (Resend provider).

### Key Features
- **Profile Analysis**: Multi-step wizard for AI-driven profile improvements.
- **Reply Generation**: Multi-step wizard for AI-driven message reply suggestions.
- **Freemium Model**: Free profile analysis with redacted detailed feedback; full content requires a subscription.
- **Subscription Management**: Stripe integration for payments and subscription lifecycle.
- **Mobile App Support**: Separate React Native/Expo app consuming the same backend API, with JWT authentication and social logins.
- **Admin Dashboard**: Protected route (`/admin/dashboard`) for user and subscription management, including billing and user state classification.
- **Audit History**: Users can view their last 10 profile analyses with paid/free redaction.
- **Reply Assistant**: Screenshot OCR for chat analysis and goal-oriented reply suggestions.

## External Dependencies

### Third-Party Services
- **Stripe**: Payment processing, subscription management, and customer portal.
- **Resend**: Email delivery for password reset functionality.

### AI Services
- **OpenAI API**: Used for all AI-powered analysis, image processing, and text generation tasks, accessed via Replit AI Integrations.

### Database
- **PostgreSQL**: Primary data store, accessed using `DATABASE_URL`.
- **Drizzle ORM**: Type-safe ORM for database interactions.

### Frontend Libraries
- **Radix UI**: Accessible component primitives.
- **Lucide React**: Icon library.
- **React Hook Form + Zod**: Form handling and validation.
- **Embla Carousel**: Image carousel.