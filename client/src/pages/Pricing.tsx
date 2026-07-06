import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, useSubscription, useCheckout, useCustomerPortal } from "@/lib/auth";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { 
  Check, 
  Sparkles, 
  Crown,
  Zap,
  Shield,
  Star,
  Lock,
  Clock,
  RefreshCcw
} from "lucide-react";
import { SiVisa, SiMastercard, SiAmericanexpress } from "react-icons/si";

interface Price {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: { interval: string } | null;
  metadata: Record<string, string>;
}

interface Product {
  id: string;
  name: string;
  description: string;
  metadata: Record<string, string>;
  prices: Price[];
}

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { data: authData, isLoading: authLoading } = useAuth();
  const { data: subscriptionData, isLoading: subLoading } = useSubscription();
  const checkoutMutation = useCheckout();
  const portalMutation = useCustomerPortal();
  const user = authData?.user;
  
  // Get returnTo from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('returnTo') || undefined;

  useEffect(() => {
    document.title = "SwipeBetter Pricing | AI Dating Profile Audit Plans";
  }, []);

  const { data: productsData, isLoading: productsLoading } = useQuery<{ data: Product[] }>({
    queryKey: ["/api/products-with-prices"],
  });

  const products = productsData?.data || [];
  
  // Find prices across all products
  const allPrices: Price[] = products.flatMap(p => p.prices || []);
  const monthlyPrice = allPrices.find(p => p.recurring?.interval === "month");
  const annualPrice = allPrices.find(p => p.recurring?.interval === "year");
  const oneTimePrice = allPrices.find(p => !p.recurring);

  const isSubscribed = subscriptionData?.subscription?.status === "active";

  const handleCheckout = (priceId: string) => {
    if (!user) {
      setLocation("/auth");
      return;
    }
    checkoutMutation.mutate({ priceId, returnTo });
  };

  const unlimitedFeatures = [
    "Unlimited profile analyses",
    "Unlimited reply suggestions",
    "All dating platforms supported",
    "Advanced AI feedback",
  ];

  const oneTimeFeatures = [
    "One full Fix Profile OR Fix Reply",
    "Full results unlocked",
    "Copy buttons enabled",
    "No expiration",
    "No subscription required",
  ];

  if (authLoading || subLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 pt-2 pb-8">
        <div className="text-center mb-6 space-y-2">
          <Badge variant="secondary" className="px-4 py-1.5">
            <Crown className="w-3.5 h-3.5 mr-1.5" />
            SwipeBetter Pro
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold">
            Unlock Your Full Dating Profile Audit
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Get the detailed photo feedback, bio rewrites, prompt fixes, and reply suggestions behind your score.
          </p>
          <p className="text-sm text-muted-foreground">
            Start with one audit or go unlimited for profiles, photos, bios, and replies.
          </p>
        </div>

        {isSubscribed ? (
          <Card className="mb-8">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">You're a Pro Member!</h2>
              <p className="text-muted-foreground">
                You have unlimited access to all features.
              </p>
              <Button
                variant="outline"
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
                data-testid="button-manage-subscription"
              >
                Manage Subscription
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-4 mb-6 items-stretch">
            <Card className="flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
              <CardHeader className="text-center pb-2">
                <div className="h-6" />
                <CardTitle className="text-xl">Starter Audit</CardTitle>
                <p className="text-sm text-muted-foreground">One-time profile or reply fix</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 text-center pt-4">
                <div className="mb-3">
                  <span className="text-4xl font-bold">$3</span>
                  <span className="text-muted-foreground"> one-time</span>
                </div>
                <ul className="text-sm space-y-1 text-left flex-1">
                  {oneTimeFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full py-5 mt-4 font-bold shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => {
                    console.log("Selected plan: starter");
                    if (oneTimePrice) handleCheckout(oneTimePrice.id);
                  }}
                  disabled={checkoutMutation.isPending || !oneTimePrice}
                  data-testid="button-checkout-onetime"
                >
                  {checkoutMutation.isPending ? "Loading..." : "Get Starter Audit"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary border-2 relative overflow-visible flex flex-col md:scale-105 md:z-10 shadow-lg shadow-primary/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1.5">
                  <Star className="w-3.5 h-3.5 mr-1.5" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-2 pt-8">
                <CardTitle className="text-xl">Unlimited Monthly</CardTitle>
                <p className="text-sm text-muted-foreground">Cancel anytime</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 text-center pt-4">
                <div className="mb-3">
                  <span className="text-4xl font-bold">$13</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="text-sm space-y-1 text-left flex-1">
                  {unlimitedFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full py-5 mt-4 font-bold shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => {
                    console.log("Selected plan: monthly");
                    if (monthlyPrice) handleCheckout(monthlyPrice.id);
                  }}
                  disabled={checkoutMutation.isPending || !monthlyPrice}
                  data-testid="button-checkout-monthly"
                >
                  {checkoutMutation.isPending ? "Loading..." : "Get Monthly"}
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
              <CardHeader className="text-center pb-2">
                <Badge variant="secondary" className="mx-auto mb-2 h-6 flex items-center">Best Value</Badge>
                <CardTitle className="text-xl">Unlimited Annual</CardTitle>
                <p className="text-sm text-muted-foreground">Best savings</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 text-center pt-4">
                <div className="mb-3">
                  <span className="text-4xl font-bold">$79</span>
                  <span className="text-muted-foreground">/year</span>
                  <p className="text-sm text-primary font-medium mt-1">
                    Save 49% - $6.58/mo billed annually
                  </p>
                </div>
                <ul className="text-sm space-y-1 text-left flex-1">
                  {unlimitedFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full py-5 mt-4 font-bold shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => {
                    console.log("Selected plan: annual");
                    if (annualPrice) handleCheckout(annualPrice.id);
                  }}
                  disabled={checkoutMutation.isPending || !annualPrice}
                  data-testid="button-checkout-annual"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {checkoutMutation.isPending ? "Loading..." : "Get Annual"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {!isSubscribed && !user && (
          <div className="text-center mt-4">
            <Link 
              href="/auth" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors" 
              data-testid="link-free-signup"
              onClick={() => console.log("[Event]", "click_downgrade_signup", { timestamp: new Date().toISOString() })}
            >
              Not ready to upgrade? <span className="underline">Create a free account</span> to save your results.
            </Link>
          </div>
        )}

        {!isSubscribed && (
          <div className="mt-8 max-w-2xl mx-auto bg-muted/50 rounded-xl p-4">
            <div className="flex items-center justify-center gap-3">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Guaranteed safe & secure checkout via Stripe</span>
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
              <SiVisa className="w-10 h-6 text-muted-foreground" />
              <SiMastercard className="w-10 h-6 text-muted-foreground" />
              <SiAmericanexpress className="w-10 h-6 text-muted-foreground" />
            </div>
          </div>
        )}

        {!isSubscribed && (
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-xl font-bold text-center mb-8">Frequently Asked Questions</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <RefreshCcw className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Is this a subscription?</h4>
                <p className="text-sm text-muted-foreground">
                  Starter is one-time. Monthly/Annual are subscriptions you can cancel anytime.
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">What if I'm not happy?</h4>
                <p className="text-sm text-muted-foreground">
                  If something looks wrong with your report, contact support and we will review it.
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">How fast is it?</h4>
                <p className="text-sm text-muted-foreground">
                  You get your analysis instantly after uploading your screenshots.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-border text-center space-y-4">
          <p className="text-muted-foreground">Ready to try it out?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/fix-profile">
              <Button variant="outline" data-testid="link-fix-profile">
                Fix My Profile
              </Button>
            </Link>
            <Link href="/fix-reply">
              <Button variant="outline" data-testid="link-fix-reply">
                Fix My Reply
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
