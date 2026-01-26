import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, useSubscription, useCredits, useCustomerPortal, useLogout } from "@/lib/auth";
import { 
  Crown,
  CreditCard,
  LogOut,
  User,
  Mail,
  ExternalLink,
  Sparkles
} from "lucide-react";

export default function Account() {
  const [, setLocation] = useLocation();
  const { data: authData, isLoading: authLoading } = useAuth();
  const { data: subscriptionData, isLoading: subLoading } = useSubscription();
  const { data: creditsData } = useCredits();
  const portalMutation = useCustomerPortal();
  const logoutMutation = useLogout();
  const user = authData?.user;

  useEffect(() => {
    document.title = "Account | SwipeBetter";
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/auth");
    }
  }, [authLoading, user, setLocation]);

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const subscription = subscriptionData?.subscription;
  const isSubscribed = subscription?.status === "active";
  const isPaidUser = subscriptionData?.isPaidUser;
  const oneTimeCredits = creditsData?.credits ?? 0;
  const canManageBilling = isSubscribed && !!subscription?.stripeCustomerId;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Your Account</h1>
          <p className="text-muted-foreground">
            Manage your profile and subscription
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{user.email}</span>
            </div>
            {user.firstName && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {user.firstName} {user.lastName || ""}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSubscribed ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro Member
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  You have unlimited access to all features.
                </p>
                {subscriptionData?.subscription?.currentPeriodEnd && (
                  <p className="text-sm text-muted-foreground">
                    Renews on {formatDate(subscriptionData.subscription.currentPeriodEnd)}
                  </p>
                )}
              </div>
            ) : isPaidUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {oneTimeCredits} Credit{oneTimeCredits !== 1 ? "s" : ""} Remaining
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use your credits to unlock full profile or reply analyses.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You're on the free plan. Upgrade to unlock full results.
                </p>
                <Button 
                  onClick={() => setLocation("/pricing")}
                  className="w-full"
                  data-testid="button-upgrade"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </div>
            )}

            {canManageBilling && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
                data-testid="button-manage-subscription"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {portalMutation.isPending ? "Loading..." : "Manage Subscription"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {logoutMutation.isPending ? "Logging out..." : "Log Out"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
