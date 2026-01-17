# SwipeBetter Mobile App Specification

Use this prompt to create a React Native mobile app that connects to an existing backend.

---

## App Overview

SwipeBetter is a dating profile improvement app that uses AI to help users optimize their dating profiles and craft better conversation replies. The mobile app should connect to an existing backend API.

**Backend API Base URL**: `https://swipebetter.replit.app` (update with your actual deployed URL)

---

## Authentication

The backend uses session-based authentication with cookies. The app needs to:
- Store session cookies after login
- Send cookies with every API request
- Handle 401 responses by redirecting to login

### Auth Endpoints

**Sign Up**
- `POST /api/auth/signup`
- Body: `{ "email": "string", "password": "string" }`
- Returns: `{ "id": number, "email": "string" }`

**Login**
- `POST /api/auth/login`
- Body: `{ "email": "string", "password": "string" }`
- Returns: `{ "id": number, "email": "string" }`

**Logout**
- `POST /api/auth/logout`

**Get Current User**
- `GET /api/auth/user`
- Returns: `{ "id": number, "email": "string" }` or 401 if not authenticated

---

## Core Screens

### 1. Auth Screens
- **Login Screen**: Email and password fields, login button, link to signup
- **Signup Screen**: Email and password fields, signup button, link to login

### 2. Dashboard
- Main screen after login
- Segmented toggle at top to switch between "Profile Optimizer" and "Reply Assistant"
- Show remaining credits prominently
- Display subscription status

**Get Subscription Status**
- `GET /api/subscription`
- Returns: `{ "hasActiveSubscription": boolean, "creditsRemaining": number, "stripeCustomerId": string | null }`

### 3. Profile Optimizer Flow

**Step 1: Upload Screenshots**
- Allow user to upload 1-5 images from camera roll
- Image preview carousel
- Continue button

**Step 2: Select Preferences**
- Platform dropdown: "Tinder", "Hinge", "Bumble", "Grindr", "Coffee Meets Bagel", "Other"
- Gender dropdown: "Man", "Woman", "Non-binary"
- Intent dropdown: "Relationship", "Casual Dating", "Friendship", "Not Sure"
- Optional toggle: "Ethical Non-Monogamy (ENM)" checkbox

**Step 3: Analyze**
- Submit for AI analysis
- Show loading state

**Endpoint**
- `POST /api/profile-analysis`
- Body: `{ "platform": string, "gender": string, "intent": string, "enm": boolean, "screenshots": string[] }` (screenshots are base64 encoded)
- Returns: `{ "id": number, "result": string, "createdAt": string }`

**Step 4: Results**
- Display AI analysis result (formatted text)
- Option to start new analysis

### 4. Reply Assistant Flow

**Step 1: Input Conversation**
- Text area for pasting conversation
- OR camera button to upload screenshot for OCR
- If screenshot uploaded, call OCR endpoint first

**OCR Endpoint**
- `POST /api/ocr`
- Body: `{ "screenshot": string }` (base64 encoded)
- Returns: `{ "text": string }`

**Step 2: Select Options**
- Tone dropdown: "flirty", "witty", "confident", "thoughtful"
- Goal dropdown with labels:
  - "first_impression" = "First Impression"
  - "keep_going" = "Keep Conversation Going"
  - "ask_out" = "Ask Them Out"
  - "revive" = "Revive Dead Chat"

**Step 3: Generate Replies**
- Submit for AI analysis
- Show loading state

**Endpoint**
- `POST /api/reply-analysis`
- Body: `{ "conversationText": string, "tone": string, "goal": string, "screenshots": string[] }`
- Returns: `{ "id": number, "result": string, "createdAt": string }`

**Step 4: Results**
- Display 3 AI-generated reply suggestions
- Copy button for each reply

### 5. Pricing/Subscription Screen

**Get Available Plans**
- `GET /api/stripe/products`
- Returns array of Stripe products with prices

**Create Checkout Session**
- `POST /api/create-checkout-session`
- Body: `{ "priceId": "string" }`
- Returns: `{ "url": string }`
- Open the URL in an in-app browser for Stripe Checkout

**Manage Subscription**
- `POST /api/create-portal-session`
- Returns: `{ "url": string }`
- Open URL for Stripe Customer Portal

---

## Design Guidelines

### Colors
- Primary gradient: Pink (#EC4899) to Red (#EF4444)
- Background: White/light gray
- Text: Dark gray for primary, medium gray for secondary
- Success: Green
- Warning: Amber/Yellow

### Typography
- Clean, modern sans-serif font
- Large touch-friendly buttons (minimum 44x44px tap targets)

### Layout
- Mobile-first design
- Sticky bottom CTAs on multi-step flows
- Card-based layouts for results
- Progress indicators for multi-step wizards

### Branding
- App name: SwipeBetter
- Tagline: "AI-powered dating profile improvement"
- No emojis - use icons instead (Lucide icon style)

---

## Key User Flows

### New User Flow
1. Open app -> See login screen
2. Tap "Sign up" -> Create account
3. Land on Dashboard -> See 0 credits
4. Tap "Get Credits" -> Go to Pricing
5. Purchase credits -> Return to Dashboard
6. Use Profile Optimizer or Reply Assistant

### Returning User Flow
1. Open app -> Auto-login via stored session
2. Land on Dashboard -> See remaining credits
3. Use tools or purchase more credits

---

## Error Handling

- Show user-friendly error messages
- Handle network errors gracefully
- Show "No credits remaining" message when user tries to analyze without credits
- Redirect to login on 401 responses

---

## Image Upload Requirements

- Max 5 screenshots for Profile Optimizer
- Max 3 screenshots for Reply Assistant  
- Max 10MB per image
- Convert images to base64 before sending to API
- Show upload progress indicator

---

## Notes

- The backend handles all AI processing - the mobile app just sends requests and displays results
- Session cookies must persist between app launches
- Test on both iOS and Android via Expo Go before publishing
