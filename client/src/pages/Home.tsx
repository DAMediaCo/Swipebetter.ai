import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Camera, MessageSquare, TrendingUp, Shield, Zap, Check } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { TestimonialsRotator } from "@/components/TestimonialsRotator";

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
            Get More Matches. Say the Right Thing.{" "}
            <span className="text-primary">Look Better Doing It.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            AI-powered feedback for your dating profile and replies. Private, fast, and built to actually help.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/fix-profile">
              <Button size="lg" className="text-lg px-8 py-6 touch-target" data-testid="button-fix-profile-hero">
                <Camera className="w-5 h-5 mr-2" />
                Fix My Profile
              </Button>
            </Link>
            <Link href="/fix-reply">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 touch-target" data-testid="button-fix-reply-hero">
                <MessageSquare className="w-5 h-5 mr-2" />
                Fix My Reply
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground pt-4 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Your screenshots are private and secure
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
        <TestimonialsRotator />
        <p className="text-sm text-muted-foreground text-center mt-8 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          Your screenshots are private and deleted after processing.
        </p>
      </section>

      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to Get More Matches?
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Join thousands of users who have improved their dating profiles with AI-powered feedback.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/fix-profile">
              <Button size="lg" className="text-lg px-8 py-6" data-testid="button-start-profile">
                <Camera className="w-5 h-5 mr-2" />
                Fix My Profile
              </Button>
            </Link>
            <Link href="/fix-reply">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" data-testid="button-start-reply">
                <MessageSquare className="w-5 h-5 mr-2" />
                Fix My Reply
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold">SwipeBetter.ai</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered feedback for your dating profile and replies.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/fix-profile" className="hover-elevate">Fix My Profile</Link>
                </li>
                <li>
                  <Link href="/fix-reply" className="hover-elevate">Fix My Reply</Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover-elevate">Pricing</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Dating Tips</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/hinge-prompts-men" className="hover-elevate">Hinge Prompts for Men</Link>
                </li>
                <li>
                  <Link href="/hinge-prompts-women" className="hover-elevate">Hinge Prompts for Women</Link>
                </li>
                <li>
                  <Link href="/tinder-bio-guide" className="hover-elevate">Tinder Bio Guide</Link>
                </li>
                <li>
                  <Link href="/bumble-opener-lines" className="hover-elevate">Bumble Opener Lines</Link>
                </li>
                <li>
                  <Link href="/dating-app-photos" className="hover-elevate">Dating App Photos</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Your screenshots are private and deleted after processing.</p>
            <p>© {new Date().getFullYear()} SwipeBetter.ai</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
