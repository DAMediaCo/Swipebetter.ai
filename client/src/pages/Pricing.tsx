import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, useSubscription, useCheckout, useCustomerPortal, login } from "@/lib/auth";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Crown,
  Zap,
  Shield
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
  const { data: authData, isLoading: authLoading } = useAuth();
  const { data: subscriptionData, isLoading: subLoading } = useSubscription();
  const checkoutMutation = useCheckout();
  const portalMutation = useCustomerPortal();
  const user = authData?.user;

  const { data: productsData, isLoading: productsLoading } = useQuery<{ data: Product[] }>({
    queryKey: ["/api/products-with-prices"],
  });

  const products = productsData?.data || [];
  const mainProduct = products[0];
  const monthlyPrice = mainProduct?.prices.find(p => p.recurring?.interval === "month");
  const annualPrice = mainProduct?.prices.find(p => p.recurring?.interval === "year");

  const isSubscribed = subscriptionData?.subscription?.status === "active";

  const handleCheckout = (priceId: string) => {
    if (!user) {
      login();
      return;
    }
    checkoutMutation.mutate(priceId);
  };

  const features = [
    "Unlimited profile analyses",
    "Unlimited reply suggestions",
    "All dating platforms supported",
    "Advanced AI feedback",
    "Priority support",
    "Profile score tracking",
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
      <div className="max-w-3xl mx-auto px-4 py-8">
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
            Upgrade Your Dating Game
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Get unlimited AI-powered profile feedback and reply suggestions.
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
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">Monthly</CardTitle>
                <p className="text-sm text-muted-foreground">Cancel anytime</p>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <span className="text-4xl font-bold">
                    ${monthlyPrice ? (monthlyPrice.unit_amount / 100).toFixed(2) : "7.99"}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <Button
                  className="w-full py-6"
                  variant="outline"
                  onClick={() => monthlyPrice && handleCheckout(monthlyPrice.id)}
                  disabled={checkoutMutation.isPending || !monthlyPrice}
                  data-testid="button-checkout-monthly"
                >
                  {checkoutMutation.isPending ? "Loading..." : "Get Monthly"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                Save 38%
              </div>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">Annual</CardTitle>
                <p className="text-sm text-muted-foreground">Best value</p>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <span className="text-4xl font-bold">
                    ${annualPrice ? (annualPrice.unit_amount / 100).toFixed(0) : "59"}
                  </span>
                  <span className="text-muted-foreground">/year</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Just ${annualPrice ? (annualPrice.unit_amount / 100 / 12).toFixed(2) : "4.92"}/mo
                  </p>
                </div>
                <Button
                  className="w-full py-6"
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Everything in Pro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {!isSubscribed && (
          <div className="mt-8 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Secure payment via Stripe</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Cancel anytime. No questions asked.
            </p>
          </div>
        )}

        {!isSubscribed && subscriptionData && (
          <Card className="mt-8 bg-muted/50">
            <CardContent className="py-4 text-center">
              <p className="text-sm">
                <strong>{subscriptionData.freeAnalysesRemaining}</strong> free analyses remaining
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
