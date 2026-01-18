import { useState, useEffect } from "react";
import { useLocation, Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles, Loader2 } from "lucide-react";
import { SiApple } from "react-icons/si";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, signup, isLoggingIn, isSigningUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [appleClientId, setAppleClientId] = useState<string | null>(null);
  const searchString = useSearch();

  // Fetch Apple Client ID on mount
  useEffect(() => {
    fetch("/api/auth/apple-client-id")
      .then(res => res.json())
      .then(data => {
        if (data.clientId) {
          setAppleClientId(data.clientId);
        }
      })
      .catch(() => {
        // Apple Sign In not configured
      });
  }, []);

  // Handle error from Apple Sign In callback
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const error = params.get("error");
    if (error) {
      const errorMessages: Record<string, string> = {
        missing_token: "Sign in was cancelled or failed. Please try again.",
        invalid_token: "Sign in verification failed. Please try again.",
        invalid_state: "Sign in session expired. Please try again.",
        email_required: "Email is required to create an account.",
        session_error: "Failed to create session. Please try again.",
        unknown: "An unexpected error occurred. Please try again.",
      };
      toast({
        title: "Sign in failed",
        description: errorMessages[error] || "An error occurred during sign in.",
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, "", "/auth");
    }
  }, [searchString, toast]);

  const handleAppleSignIn = async () => {
    if (!appleClientId) return;
    
    try {
      // Get state from server to prevent CSRF
      const initResponse = await fetch("/api/auth/apple/init", { 
        method: "POST",
        credentials: "include",
      });
      if (!initResponse.ok) {
        toast({
          title: "Sign in failed",
          description: "Failed to initialize Apple Sign In. Please try again.",
          variant: "destructive",
        });
        return;
      }
      const { state } = await initResponse.json();
      
      const redirectUri = `${window.location.origin}/api/auth/apple/callback`;
      
      const appleAuthUrl = new URL("https://appleid.apple.com/auth/authorize");
      appleAuthUrl.searchParams.set("client_id", appleClientId);
      appleAuthUrl.searchParams.set("redirect_uri", redirectUri);
      appleAuthUrl.searchParams.set("response_type", "code id_token");
      appleAuthUrl.searchParams.set("response_mode", "form_post");
      appleAuthUrl.searchParams.set("scope", "name email");
      appleAuthUrl.searchParams.set("state", state);
      
      window.location.href = appleAuthUrl.toString();
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isSignUp) {
        const result = await signup({ email, password, firstName: firstName || undefined, promoCode: promoCode.trim() || undefined });
        let description = "Welcome to SwipeBetter!";
        if (promoCode.trim()) {
          if (result.promoApplied) {
            description = `Welcome! You got ${result.promoCredits} free credits from your promo code.`;
          } else {
            description = "Welcome! (Note: The promo code was invalid or expired)";
          }
        }
        toast({
          title: "Account created",
          description,
        });
      } else {
        await login({ email, password });
        toast({
          title: "Welcome back",
          description: "You're now logged in.",
        });
      }
      setLocation("/dashboard");
    } catch (error: any) {
      const message = error?.message || "Something went wrong";
      toast({
        title: isSignUp ? "Signup failed" : "Login failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const isLoading = isLoggingIn || isSigningUp;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? "Create your account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Start improving your dating profile today" 
              : "Sign in to continue to SwipeBetter"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="firstName">First name (optional)</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  data-testid="input-first-name"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && (
                  <Link href="/forgot-password">
                    <span className="text-sm text-primary hover:underline cursor-pointer" data-testid="link-forgot-password">
                      Forgot password?
                    </span>
                  </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? "At least 8 characters" : "Your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isSignUp ? 8 : 1}
                data-testid="input-password"
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="promoCode">Promo Code (optional)</Label>
                <Input
                  id="promoCode"
                  type="text"
                  placeholder="FRIEND2024"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="uppercase"
                  data-testid="input-promo-code"
                />
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
              data-testid="button-submit-auth"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {appleClientId && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleAppleSignIn}
              data-testid="button-apple-sign-in"
            >
              <SiApple className="w-5 h-5 mr-2" />
              Sign in with Apple
            </Button>
          )}
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-toggle-auth-mode"
            >
              {isSignUp 
                ? "Already have an account? Sign in" 
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
