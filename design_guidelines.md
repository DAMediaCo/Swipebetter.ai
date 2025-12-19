# SwipeBetter.ai Design Guidelines

## Design Approach: Mobile-First Consumer Experience

**Reference Strategy:** Draw inspiration from modern dating apps (Tinder, Hinge) for familiarity, combined with Linear's clean typography and Stripe's trust-building simplicity. This creates an approachable, professional tool that feels native to the dating app ecosystem.

**Core Principle:** One-handed iPhone use drives every decision. Large tap targets, thumb-friendly zones, and progressive disclosure.

---

## Typography System

**Font Stack:** Inter via Google Fonts CDN
- Headings: 700 weight (Bold)
- Body: 400 weight (Regular)
- Accent/CTA: 600 weight (Semibold)

**Scale (Mobile-First):**
- Page Title: text-3xl (30px)
- Section Heading: text-2xl (24px)
- Tool Step Title: text-xl (20px)
- Body Text: text-base (16px)
- Small/Meta: text-sm (14px)
- Button Text: text-lg font-semibold (18px)

**Desktop Adjustments:** Scale up by one size (e.g., text-3xl → text-4xl for page titles)

---

## Layout & Spacing System

**Container Strategy:**
- Mobile: px-4 (16px horizontal padding)
- Desktop: max-w-5xl mx-auto px-8

**Consistent Spacing Units:** Use Tailwind's 4, 6, 8, 12, 16, 20 for vertical rhythm
- Between steps: space-y-8
- Between form fields: space-y-6
- Component internal padding: p-6
- Section spacing: py-12 (mobile), py-20 (desktop)

**Thumb Zone Optimization:**
- Bottom 25% of viewport = primary action zone
- Sticky bottom CTAs on mobile with safe area padding
- Minimum touch target: 44x44px (use p-4 on buttons)

---

## Component Library

### Navigation
- Mobile: Fixed bottom tab bar (Home, Profile Fix, Reply Fix) with icons from Heroicons
- Desktop: Top horizontal nav, centered, max-w-7xl

### Upload Component
- Large dropzone: min-h-48, border-2 border-dashed, rounded-xl
- Camera icon (Heroicons: camera) centered with "Upload Screenshot" text below
- Thumbnail grid after upload: grid grid-cols-2 gap-4, each with remove button (x-circle icon)

### Form Controls
**Selector Buttons (Platform, Gender, Intent, Tone):**
- Horizontal pill group on mobile: flex gap-2 overflow-x-auto
- Each pill: px-6 py-3 rounded-full border-2
- Selected state: border-2 (use JavaScript to toggle)
- Label: text-base font-semibold

**Primary CTA:**
- Mobile: fixed bottom-0 w-full p-4 with inner button
- Button style: w-full py-4 rounded-xl text-lg font-semibold
- Loading state: animated pulse with "Generating..." text

### Results Display
**Output Cards:**
- Each result section: rounded-2xl border p-6 space-y-4
- Title: text-lg font-semibold
- Content: text-base leading-relaxed
- Copy button: Top-right absolute, using Heroicons clipboard icon

**Multiple Results Layout:**
- Single column on mobile: space-y-6
- Grid on desktop: grid md:grid-cols-2 gap-6

### Progress Indicators
- Step counter: "Step 1 of 3" in text-sm at top
- Visual dots: flex gap-2 with rounded-full w-2 h-2 indicators

---

## Page-Specific Layouts

### Homepage (SEO Landing)
- Hero: Full viewport (min-h-screen) with centered content
- Headline: text-4xl md:text-5xl font-bold, max-w-2xl
- Subheading: text-xl, max-w-xl
- CTA: Large button "Fix My Profile Free" + secondary "See How It Works"
- Features Section: 3-column grid (stack on mobile) with icons, titles, descriptions
- Social Proof: Testimonial cards in 2-column grid
- Pricing Section: 2 pricing cards side-by-side (stack mobile)

### Tool Pages (/fix-profile, /fix-reply)
**Structure:**
1. Brief intro section: py-8, text-center, max-w-2xl mx-auto
2. Tool interface: Card-style container (rounded-2xl, shadow-lg, p-8)
3. Step-by-step flow within card
4. Results appear below tool on submission

**Mobile Flow:** Each step takes full viewport width, smooth transitions between steps

### SEO Content Pages
- Article-style layout: max-w-prose mx-auto
- Typography hierarchy: H1 (text-4xl), H2 (text-2xl), H3 (text-xl)
- Embedded tool UI at relevant points (not gated)
- Generous line-height: leading-relaxed

---

## Platform-Specific Pages
Each platform page (/fix-hinge-profile, etc.) includes:
- Platform logo/name in hero
- Platform-specific tips in sidebar or cards
- Customized form with platform pre-selected

---

## Images

**Homepage Hero:** 
Large background image showing a dating app interface (screenshot mockup) with subtle overlay. Place heading and CTA on top with blurred button backgrounds (backdrop-blur-md bg-white/10).

**Feature Section Icons:**
Use Heroicons for: sparkles (AI), photo (screenshots), chat-bubble-left-right (messaging)

**SEO Pages:**
Relevant screenshot examples placed inline with content, rounded-lg shadow

---

## Mobile-First Patterns

**One-Hand Accessibility:**
- All primary actions in bottom third
- No top-right corner interactions
- Swipe gestures not required

**Progressive Disclosure:**
- Show one step at a time on mobile
- Collapse completed steps
- Clear "Next" / "Back" navigation

**Performance:**
- Lazy load result sections
- Skeleton screens during AI generation (rounded rectangles pulsing)
- Optimistic UI updates

---

## Trust & Conversion Elements

**Microcopy Placement:**
- Under upload: "Your screenshots are private and deleted after processing"
- Near CTA: "No credit card required for free trial"
- Pricing: "Cancel anytime" badge

**Social Proof Indicators:**
- "10,000+ profiles improved" in hero
- Star ratings from users (if available)

---

## Accessibility

- Minimum font size: 16px (text-base)
- Focus states: ring-2 ring-offset-2 on all interactive elements
- Aria labels on icon-only buttons
- Color contrast: Ensure 4.5:1 ratio minimum (will be set with color scheme)