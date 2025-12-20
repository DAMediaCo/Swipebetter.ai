import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { trackPurchaseCompleted } from "@/lib/analytics";
import { CheckCircle, Sparkles, ArrowRight, AlertCircle } from "lucide-react";

interface VerifyCheckoutResponse {
  success: boolean;
  status: string;
  purchase?: {
    plan_type: "starter" | "monthly" | "annual";
    price: number;
    currency: string;
    tool_type: "profile" | "reply" | "both";
    transaction_id: string;
    price_id: string;
    product_name: string;
  };
}

export default function CheckoutSuccess() {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyCheckout = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      
      if (!sessionId) {
        setError("No session ID found");
        setVerifying(false);
        return;
      }

      try {
        const response = await apiRequest("POST", "/api/verify-checkout", { sessionId });
        const data: VerifyCheckoutResponse = await response.json();
        
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
        
        if (data.purchase) {
          trackPurchaseCompleted({
            planType: data.purchase.plan_type,
            toolType: data.purchase.tool_type,
            price: data.purchase.price,
            transactionId: data.purchase.transaction_id,
            priceId: data.purchase.price_id,
          });
        }
        
        setVerifying(false);
      } catch (err) {
        setError("Failed to verify payment. Please contact support.");
        setVerifying(false);
      }
    };

    verifyCheckout();
  }, []);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-6 text-center space-y-6">
            <Skeleton className="w-20 h-20 rounded-full mx-auto" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-6 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Link href="/pricing">
              <Button variant="outline" className="w-full">Back to Pricing</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Welcome to Pro!</h1>
            <p className="text-muted-foreground">
              Your subscription is now active. You have unlimited access to all features.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Link href="/fix-profile">
              <Button className="w-full" data-testid="button-start-profile">
                <Sparkles className="w-5 h-5 mr-2" />
                Fix My Profile
              </Button>
            </Link>
            <Link href="/fix-reply">
              <Button variant="outline" className="w-full" data-testid="button-start-reply">
                Fix My Replies
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
