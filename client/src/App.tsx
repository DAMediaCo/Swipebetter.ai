import { Switch, Route, useLocation } from "wouter";
import { useEffect, useRef } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileNav } from "@/components/MobileNav";
import { DesktopNav } from "@/components/DesktopNav";
import { initGA, trackPageView } from "@/lib/analytics";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import ProfileFix from "@/pages/ProfileFix";
import ProfileUpload from "@/pages/ProfileUpload";
import ProfileResults from "@/pages/ProfileResults";
import ProfileUpgrade from "@/pages/ProfileUpgrade";
import ReplyFix from "@/pages/ReplyFix";
import ReplyResults from "@/pages/ReplyResults";
import ReplyUpgrade from "@/pages/ReplyUpgrade";
import Pricing from "@/pages/Pricing";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import TinderBioGuide from "@/pages/TinderBioGuide";
import HingePromptsMen from "@/pages/HingePromptsMen";
import HingePromptsWomen from "@/pages/HingePromptsWomen";
import BumbleOpenerLines from "@/pages/BumbleOpenerLines";
import DatingAppPhotos from "@/pages/DatingAppPhotos";
import HingeProfileTips from "@/pages/HingeProfileTips";
import BumbleBioExamples from "@/pages/BumbleBioExamples";
import TinderPhotoOrder from "@/pages/TinderPhotoOrder";
import WhatToTextAfterMatching from "@/pages/WhatToTextAfterMatching";
import ReviveDeadConversation from "@/pages/ReviveDeadConversation";
import AdminLogin from "@/pages/AdminLogin";
import AdminPromoCodes from "@/pages/AdminPromoCodes";
import RedeemPromo from "@/pages/RedeemPromo";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import CookiePolicy from "@/pages/CookiePolicy";
import RefundPolicy from "@/pages/RefundPolicy";
import Disclaimer from "@/pages/Disclaimer";
import Contact from "@/pages/Contact";
import AcceptableUse from "@/pages/AcceptableUse";
import NotFound from "@/pages/not-found";
import { LegalFooter } from "@/components/LegalFooter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/fix-profile" component={ProfileFix} />
      <Route path="/fix-profile/upload" component={ProfileUpload} />
      <Route path="/fix-profile/results" component={ProfileResults} />
      <Route path="/fix-profile/upgrade" component={ProfileUpgrade} />
      <Route path="/fix-reply" component={ReplyFix} />
      <Route path="/fix-reply/results" component={ReplyResults} />
      <Route path="/fix-reply/upgrade" component={ReplyUpgrade} />
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
      <Route path="/admin/promo-codes" component={AdminPromoCodes} />
      <Route path="/redeem" component={RedeemPromo} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/cookie-policy" component={CookiePolicy} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/contact" component={Contact} />
      <Route path="/acceptable-use" component={AcceptableUse} />
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
          <Router />
        </main>
        <LegalFooter />
        <MobileNav />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
