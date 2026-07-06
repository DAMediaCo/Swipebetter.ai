import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense, useEffect, useRef } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileNav } from "@/components/MobileNav";
import { DesktopNav } from "@/components/DesktopNav";
import { initGA, trackPageView } from "@/lib/analytics";
import { LegalFooter } from "@/components/LegalFooter";

const Home = lazy(() => import("@/pages/Home"));
const Auth = lazy(() => import("@/pages/Auth"));
const ProfileFix = lazy(() => import("@/pages/ProfileFix"));
const ProfileResults = lazy(() => import("@/pages/ProfileResults"));
const ProfileUpgrade = lazy(() => import("@/pages/ProfileUpgrade"));
const ReplyFix = lazy(() => import("@/pages/ReplyFix"));
const ReplyResults = lazy(() => import("@/pages/ReplyResults"));
const ReplyUpgrade = lazy(() => import("@/pages/ReplyUpgrade"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const CheckoutSuccess = lazy(() => import("@/pages/CheckoutSuccess"));
const TinderBioGuide = lazy(() => import("@/pages/TinderBioGuide"));
const HingePromptsMen = lazy(() => import("@/pages/HingePromptsMen"));
const HingePromptsWomen = lazy(() => import("@/pages/HingePromptsWomen"));
const BumbleOpenerLines = lazy(() => import("@/pages/BumbleOpenerLines"));
const DatingAppPhotos = lazy(() => import("@/pages/DatingAppPhotos"));
const HingeProfileTips = lazy(() => import("@/pages/HingeProfileTips"));
const BumbleBioExamples = lazy(() => import("@/pages/BumbleBioExamples"));
const TinderPhotoOrder = lazy(() => import("@/pages/TinderPhotoOrder"));
const WhatToTextAfterMatching = lazy(() => import("@/pages/WhatToTextAfterMatching"));
const ReviveDeadConversation = lazy(() => import("@/pages/ReviveDeadConversation"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminPromoCodes = lazy(() => import("@/pages/AdminPromoCodes"));
const RedeemPromo = lazy(() => import("@/pages/RedeemPromo"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("@/pages/CookiePolicy"));
const RefundPolicy = lazy(() => import("@/pages/RefundPolicy"));
const Disclaimer = lazy(() => import("@/pages/Disclaimer"));
const Contact = lazy(() => import("@/pages/Contact"));
const AcceptableUse = lazy(() => import("@/pages/AcceptableUse"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Account = lazy(() => import("@/pages/Account"));
const AuditView = lazy(() => import("@/pages/AuditView"));
const ReplyAuditView = lazy(() => import("@/pages/ReplyAuditView"));
const TinderBiosForEngineers = lazy(() => import("@/pages/TinderBiosForEngineers"));
const HowToReplyToHeyOnBumble = lazy(() => import("@/pages/HowToReplyToHeyOnBumble"));
const TinderShadowbanTest = lazy(() => import("@/pages/TinderShadowbanTest"));
const Blog = lazy(() => import("@/pages/Blog"));
const WhyNoMatches = lazy(() => import("@/pages/WhyNoMatches"));
const TinderBioGenerator = lazy(() => import("@/pages/tools/TinderBioGenerator"));
const HingePromptWriter = lazy(() => import("@/pages/tools/HingePromptWriter"));
const DatingPhotoAnalyzer = lazy(() => import("@/pages/tools/DatingPhotoAnalyzer"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/fix-profile" component={ProfileFix} />
      <Route path="/fix-profile/results" component={ProfileResults} />
      <Route path="/fix-profile/upgrade" component={ProfileUpgrade} />
      <Route path="/fix-reply" component={ReplyFix} />
      <Route path="/fix-reply/results" component={ReplyResults} />
      <Route path="/fix-reply/upgrade" component={ReplyUpgrade} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/tinder-bio-guide" component={TinderBioGuide} />
      <Route path="/hinge-prompts-men" component={HingePromptsMen} />
      <Route path="/hinge-prompts-women" component={HingePromptsWomen} />
      <Route path="/bumble-opener-lines" component={BumbleOpenerLines} />
      <Route path="/dating-app-photos" component={DatingAppPhotos} />
      <Route path="/hinge-profile-tips" component={HingeProfileTips} />
      <Route path="/bumble-bio-examples" component={BumbleBioExamples} />
      <Route path="/tinder-photo-order" component={TinderPhotoOrder} />
      <Route path="/what-to-text-after-matching" component={WhatToTextAfterMatching} />
      <Route path="/revive-dead-conversation" component={ReviveDeadConversation} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/promo-codes" component={AdminPromoCodes} />
      <Route path="/redeem" component={RedeemPromo} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/cookie-policy" component={CookiePolicy} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/contact" component={Contact} />
      <Route path="/acceptable-use" component={AcceptableUse} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/account" component={Account} />
      <Route path="/audit/:id" component={AuditView} />
      <Route path="/audit/reply/:id" component={ReplyAuditView} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/why-am-i-getting-no-matches" component={WhyNoMatches} />
      <Route path="/blog/best-tinder-bios-for-engineers-and-nerds" component={TinderBiosForEngineers} />
      <Route path="/blog/how-to-reply-to-hey-on-bumble" component={HowToReplyToHeyOnBumble} />
      <Route path="/blog/tinder-shadowban-test-2026" component={TinderShadowbanTest} />
      <Route path="/tools/tinder-bio-generator" component={TinderBioGenerator} />
      <Route path="/tools/tinder-bio-generator.html" component={TinderBioGenerator} />
      <Route path="/tools/hinge-prompt-writer" component={HingePromptWriter} />
      <Route path="/tools/hinge-prompt-writer.html" component={HingePromptWriter} />
      <Route path="/tools/dating-photo-analyzer" component={DatingPhotoAnalyzer} />
      <Route path="/tools/dating-photo-analyzer.html" component={DatingPhotoAnalyzer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function PageViewTracker() {
  const [location] = useLocation();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    // Scroll to top on every route change
    window.scrollTo(0, 0);
    
    // Skip tracking on first load since gtag config sends automatic page_view
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    
    // Small delay to allow page title to update after route change
    const timeout = setTimeout(() => {
      const title = document.title || "SwipeBetter.ai";
      trackPageView(location, title);
    }, 100);
    return () => clearTimeout(timeout);
  }, [location]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PageViewTracker />
        <DesktopNav />
        <main className="pb-16 md:pb-0">
          <Suspense fallback={<div className="min-h-screen" />}>
            <Router />
          </Suspense>
        </main>
        <LegalFooter />
        <MobileNav />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
