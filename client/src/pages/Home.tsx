import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Camera, MessageSquare, TrendingUp, Shield, Zap, Heart, Star, Check } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { data: authData } = useAuth();
  const user = authData?.user;

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <Badge variant="secondary" className="px-4 py-1.5">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            AI-Powered Dating Profile Coach
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Get More Matches with{" "}
            <span className="text-primary">AI-Powered</span> Profile Feedback
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Upload your dating profile screenshots and get instant, actionable suggestions to improve your bio, photos, and conversation game.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <Link href="/fix-profile">
                <Button size="lg" className="text-lg px-8 py-6 touch-target" data-testid="button-fix-profile-hero">
                  <Camera className="w-5 h-5 mr-2" />
                  Fix My Profile
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button size="lg" className="text-lg px-8 py-6 touch-target" data-testid="button-get-started">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
              </Link>
            )}
            <Link href="/fix-reply">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 touch-target" data-testid="button-fix-reply-hero">
                <MessageSquare className="w-5 h-5 mr-2" />
                Fix My Reply
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground pt-4 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            3 free analyses, no credit card required
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Three simple steps to transform your dating profile
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-8 pb-6 px-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Camera className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">1. Upload Screenshots</h3>
                <p className="text-sm text-muted-foreground">
                  Take screenshots of your dating profile from any app - Tinder, Hinge, Bumble, or others.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-8 pb-6 px-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">2. Get AI Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes your profile and provides specific, actionable feedback instantly.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-8 pb-6 px-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <TrendingUp className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">3. Get More Matches</h3>
                <p className="text-sm text-muted-foreground">
                  Apply the suggestions and watch your match rate improve significantly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold">Two Powerful Tools</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Everything you need to improve your dating app success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8">
                  <Camera className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">Profile Fix</h3>
                  <p className="text-muted-foreground mb-6">
                    Get AI-powered feedback on your bio, photos, and overall profile appeal.
                  </p>
                  <ul className="space-y-2 text-sm mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Bio rewrite suggestions
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Photo order optimization
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Profile score rating
                    </li>
                  </ul>
                  <Link href="/fix-profile">
                    <Button className="w-full" data-testid="button-try-profile-fix">
                      Try Profile Fix
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-accent/40 to-accent/10 p-8">
                  <MessageSquare className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">Reply Fix</h3>
                  <p className="text-muted-foreground mb-6">
                    Get perfect reply suggestions based on your conversation context.
                  </p>
                  <ul className="space-y-2 text-sm mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Multiple tone options
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Context-aware replies
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Copy & paste ready
                    </li>
                  </ul>
                  <Link href="/fix-reply">
                    <Button variant="outline" className="w-full" data-testid="button-try-reply-fix">
                      Try Reply Fix
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-6 h-6 fill-primary text-primary" />
            ))}
          </div>
          <blockquote className="text-xl md:text-2xl font-medium italic">
            "I went from barely getting any matches to having multiple conversations every day. The bio suggestions were exactly what I needed."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Alex M.</p>
              <p className="text-sm text-muted-foreground">SwipeBetter User</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to Get More Matches?
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Join thousands of users who have improved their dating profiles with AI-powered feedback.
          </p>
          {user ? (
            <Link href="/fix-profile">
              <Button size="lg" className="text-lg px-8 py-6" data-testid="button-start-now">
                <Zap className="w-5 h-5 mr-2" />
                Start Now
              </Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button size="lg" className="text-lg px-8 py-6" data-testid="button-start-free">
                <Zap className="w-5 h-5 mr-2" />
                Start Free
              </Button>
            </Link>
          )}
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>SwipeBetter.ai</span>
          </div>
          <p>Your screenshots are private and deleted after processing.</p>
        </div>
      </footer>
    </div>
  );
}
