import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Ticket, Loader2, CheckCircle, Sparkles, ArrowLeft } from "lucide-react";

export default function RedeemPromo() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ credits: number; message: string } | null>(null);
  const { data: authData, isLoading: authLoading } = useAuth();
  const user = authData?.user;
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setLocation("/auth");
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest("POST", "/api/redeem-promo", { code: code.trim() });
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data);
        queryClient.invalidateQueries({ queryKey: ["/api/me"] });
        queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      } else {
        toast({
          title: "Couldn't redeem code",
          description: data.error || "Invalid promo code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-6 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Code Redeemed!</h1>
              <p className="text-muted-foreground">{success.message}</p>
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
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="absolute top-4 left-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Redeem Promo Code</CardTitle>
          <CardDescription>
            Enter your promo code to get free analyses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!user && !authLoading ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Please sign in first to redeem your code
              </p>
              <Link href="/auth">
                <Button className="w-full" data-testid="button-sign-in">
                  Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Promo Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="FRIEND2024"
                  required
                  className="text-center font-mono text-lg uppercase"
                  data-testid="input-promo-code"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !code.trim()}
                data-testid="button-redeem"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Redeem Code
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
