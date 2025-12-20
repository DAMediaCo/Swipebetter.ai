import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileNav } from "@/components/MobileNav";
import { DesktopNav } from "@/components/DesktopNav";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import ProfileFix from "@/pages/ProfileFix";
import ProfileResults from "@/pages/ProfileResults";
import ProfileUpgrade from "@/pages/ProfileUpgrade";
import ReplyFix from "@/pages/ReplyFix";
import ReplyResults from "@/pages/ReplyResults";
import ReplyUpgrade from "@/pages/ReplyUpgrade";
import Pricing from "@/pages/Pricing";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import NotFound from "@/pages/not-found";

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
      <Route path="/pricing" component={Pricing} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DesktopNav />
        <main className="pb-16 md:pb-0">
          <Router />
        </main>
        <MobileNav />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
