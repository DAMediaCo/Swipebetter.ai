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
  ArrowLeft, 
  Check, 
  Sparkles, 
  Crown,
  Zap,
  Shield,
  Star
} from "lucide-react";

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

  useEffect(() => {
    document.title = "Pricing - SwipeBetter.ai";
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
    checkoutMutation.mutate(priceId);
  };

  const unlimitedFeatures = [
    "Unlimited profile analyses",
    "Unlimited reply suggestions",
    "All dating platforms supported",
    "Advanced AI feedback",
    "Priority support",
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12 space-y-4">
          <Badge variant="secondary" className="px-4 py-1.5">
            <Crown className="w-3.5 h-3.5 mr-1.5" />
            SwipeBetter Pro
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold">
            Unlock Your Full Results
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Choose the plan that works best for you.
          </p>
          <p className="text-sm text-muted-foreground">
            Most users upgrade to Unlimited after their first fix.
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
          <div className="grid md:grid-cols-3 gap-6 mb-8 items-stretch">
            <Card className="flex flex-col">
              <CardHeader className="text-center pb-2">
                <div className="h-6" />
                <CardTitle className="text-xl">Starter Fix</CardTitle>
                <p className="text-sm text-muted-foreground">One-time purchase</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-muted-foreground"> one-time</span>
                  <p className="text-sm text-transparent mt-1">placeholder</p>
                </div>
                <ul className="text-sm space-y-2 text-left flex-1">
                  {oneTimeFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full py-6 mt-6"
                  variant="outline"
                  onClick={() => oneTimePrice && handleCheckout(oneTimePrice.id)}
                  disabled={checkoutMutation.isPending || !oneTimePrice}
                  data-testid="button-checkout-onetime"
                >
                  {checkoutMutation.isPending ? "Loading..." : "Get Starter Fix"}
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader className="text-center pb-2">
                <Badge variant="secondary" className="mx-auto mb-2 h-6 flex items-center">Most Flexible</Badge>
                <CardTitle className="text-xl">Unlimited Monthly</CardTitle>
                <p className="text-sm text-muted-foreground">Cancel anytime</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-muted-foreground">/month</span>
                  <p className="text-sm text-transparent mt-1">placeholder</p>
                </div>
                <ul className="text-sm space-y-2 text-left flex-1">
                  {unlimitedFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full py-6 mt-6"
                  variant="outline"
                  onClick={() => monthlyPrice && handleCheckout(monthlyPrice.id)}
                  disabled={checkoutMutation.isPending || !monthlyPrice}
                  data-testid="button-checkout-monthly"
                >
                  {checkoutMutation.isPending ? "Loading..." : "Get Monthly"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary border-2 relative overflow-visible flex flex-col md:scale-105 md:z-10 shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1.5">
                  <Star className="w-3.5 h-3.5 mr-1.5" />
                  Best Value
                </Badge>
              </div>
              <CardHeader className="text-center pb-2 pt-8">
                <CardTitle className="text-xl">Unlimited Annual</CardTitle>
                <p className="text-sm text-muted-foreground">Best savings</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-muted-foreground">/year</span>
                  <p className="text-sm text-primary font-medium mt-1">
                    Save 57% – $8.25/mo billed annually
                  </p>
                </div>
                <ul className="text-sm space-y-2 text-left flex-1">
                  {unlimitedFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full py-6 mt-6"
                  onClick={() => annualPrice && handleCheckout(annualPrice.id)}
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

        {!isSubscribed && (
          <div className="mt-8 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Secure payment via Stripe</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Cancel subscriptions anytime. No questions asked.
            </p>
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
