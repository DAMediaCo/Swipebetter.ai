import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { queryClient } from "@/lib/queryClient";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";

export default function CheckoutSuccess() {
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
  }, []);

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
