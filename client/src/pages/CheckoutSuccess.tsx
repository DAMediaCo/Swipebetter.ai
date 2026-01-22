import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useEntitlement, useAuth } from "@/lib/auth";
import { trackPurchaseCompleted } from "@/lib/analytics";
import { CheckCircle, Sparkles, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [pollingEntitlement, setPollingEntitlement] = useState(false);
  const { isPro, refreshEntitlement } = useEntitlement();
  const { data: authData, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Get returnTo from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('returnTo');
  const sessionId = urlParams.get('session_id');

  useEffect(() => {
    // Wait for auth check to complete
    if (authLoading) return;
    
    const verifyCheckout = async () => {
      if (!sessionId) {
        setError("No session ID found");
        setVerifying(false);
        return;
      }

      // If user is not authenticated, the webhook will still process the payment
      // Show success and poll for entitlement anyway
      if (!authData?.user) {
        console.log("User not authenticated, skipping verify-checkout but payment was processed via webhook");
        setVerifying(false);
        // Still poll in case they log in
        setPollingEntitlement(true);
        await pollForEntitlement();
        setPollingEntitlement(false);
        
        if (returnTo) {
          setTimeout(() => {
            setLocation(returnTo);
          }, 1500);
        }
        return;
      }

      try {
        const response = await apiRequest("POST", "/api/verify-checkout", { sessionId });
        const data: VerifyCheckoutResponse = await response.json();
        
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
        queryClient.invalidateQueries({ queryKey: ["/api/me"] });
        
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
        
        setPollingEntitlement(true);
        await pollForEntitlement();
        setPollingEntitlement(false);
        
        // Auto-redirect if returnTo is specified
        if (returnTo) {
          setTimeout(() => {
            setLocation(returnTo);
          }, 1500);
        }
      } catch (err) {
        // Even if verify fails, the webhook processes the payment
        // Show success and continue
        console.error("Verify checkout failed, but webhook should have processed payment:", err);
        setVerifying(false);
        
        setPollingEntitlement(true);
        await pollForEntitlement();
        setPollingEntitlement(false);
        
        if (returnTo) {
          setTimeout(() => {
            setLocation(returnTo);
          }, 1500);
        }
      }
    };

    verifyCheckout();
  }, [returnTo, setLocation, authLoading, authData]);

  const pollForEntitlement = async () => {
    const delays = [500, 1000, 2000, 4000, 8000];
    
    for (const delay of delays) {
      const meResponse = await fetch("/api/me", { credentials: "include" });
      if (meResponse.ok) {
        const data = await meResponse.json();
        if (data.isPro) {
          await refreshEntitlement();
          return;
        }
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    await refreshEntitlement();
    
    toast({
      title: "Subscription activating",
      description: "Your subscription may take a moment to activate. Please refresh if needed.",
    });
  };

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
            {pollingEntitlement ? (
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            ) : (
              <CheckCircle className="w-10 h-10 text-primary" />
            )}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {pollingEntitlement ? "Activating..." : "Payment Successful!"}
            </h1>
            <p className="text-muted-foreground">
              {pollingEntitlement 
                ? "Setting up your access..."
                : returnTo 
                  ? "Redirecting you back to your results..."
                  : "Your purchase is complete. You now have full access."
              }
            </p>
          </div>

          {!pollingEntitlement && (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
