import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Camera, MessageSquare, TrendingUp, Shield, Check, Trash2, UserX, Star, Smartphone } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { TestimonialsRotator } from "@/components/TestimonialsRotator";
import { trackToolEntry } from "@/lib/analytics";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  const { data: authData } = useAuth();
  const user = authData?.user;
  const [location] = useLocation();

  useEffect(() => {
    document.title = "AI Dating Profile Review | Fix Tinder, Hinge & Bumble Profiles";
  }, []);

  const handleToolClick = (toolType: "profile" | "reply") => {
    trackToolEntry(toolType, location);
  };

  const faqItems = [
    {
      question: "Is SwipeBetter private?",
      answer: "Yes. Your screenshots are processed to generate feedback and are deleted after processing."
    },
    {
      question: "Do you store my screenshots?",
      answer: "No. Screenshots are deleted after processing. We do not build public profiles from your uploads."
    },
    {
      question: "Which apps does this work with?",
      answer: "Any app where you can screenshot your profile or chat, including Tinder, Hinge, Bumble, Grindr, and more."
    },
    {
      question: "Do I need an account?",
      answer: "No account is required to use SwipeBetter."
    },
    {
      question: "Does this guarantee more matches?",
      answer: "No. Results vary, but we aim to improve your odds with clear, actionable suggestions."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center px-4 py-12 md:py-16 bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-6 text-center md:text-left">
              <p className="text-xs uppercase tracking-widest text-muted-foreground flex items-center justify-center md:justify-start gap-1.5">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                Trusted by 10,000+ Daters
              </p>
              
              <Badge variant="secondary" className="px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                AI-Powered Dating Profile Coach
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                <span className="text-primary">Get More Matches.</span> Say the Right Thing.{" "}
                Look Better Doing It.
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                AI-powered feedback for your dating profile and replies. Private, fast, and built to actually help.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
                <Link href="/fix-profile" onClick={() => handleToolClick("profile")}>
                  <Button size="lg" className="text-lg px-8 py-6 touch-target shadow-lg shadow-primary/25" data-testid="button-fix-profile-hero">
                    <Camera className="w-5 h-5 mr-2" />
                    Fix My Profile
                  </Button>
                </Link>
                <Link href="/fix-reply" onClick={() => handleToolClick("reply")}>
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6 touch-target" data-testid="button-fix-reply-hero">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Fix My Reply
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-muted-foreground pt-2">
                <span className="flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  Screenshots deleted after processing
                </span>
                <span className="hidden sm:inline text-muted-foreground/50">|</span>
                <span className="flex items-center gap-1.5">
                  <UserX className="w-4 h-4" />
                  <strong className="font-semibold">No account required</strong>
                </span>
                <span className="hidden sm:inline text-muted-foreground/50">|</span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Works with Tinder, Hinge, Bumble, and more
                </span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center justify-center">
              <div className="relative">
                <div className="w-64 h-[520px] bg-card rounded-[2.5rem] border-4 border-border shadow-2xl shadow-black/10 dark:shadow-black/30 p-3 flex flex-col">
                  <div className="w-20 h-5 bg-border rounded-full mx-auto mb-3" />
                  <div className="flex-1 bg-muted/50 rounded-[1.5rem] flex flex-col items-center justify-center gap-4 p-4">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                      <Smartphone className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-center">Your Profile Analysis</p>
                    <div className="w-full space-y-2">
                      <div className="h-2 bg-primary/30 rounded-full w-full" />
                      <div className="h-2 bg-primary/20 rounded-full w-4/5" />
                      <div className="h-2 bg-primary/10 rounded-full w-3/5" />
                    </div>
                    <div className="mt-4 text-center">
                      <div className="text-3xl font-bold text-primary">87/100</div>
                      <p className="text-xs text-muted-foreground">Profile Score</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary/20 rounded-full blur-xl" />
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-accent/30 rounded-full blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Example AI Feedback</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              See what kind of actionable insights you will get
            </p>
          </div>
          
          <div className="bg-card rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20 p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-6 items-start">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-4 border-primary flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-primary">41</span>
                </div>
                <p className="text-sm font-semibold">Profile Score</p>
                <p className="text-xs text-muted-foreground">out of 100</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Top Issue</span>
                </div>
                <p className="text-base">Your first photo reads as low trust. Facial expression unclear and lighting is dim.</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Suggested Fix</span>
                </div>
                <p className="text-base">Move your clearest solo photo to #1 and shorten your bio to 2 punchy lines.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Three simple steps to transform your dating profile
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-8 pb-6 px-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Camera className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">1. Upload Screenshots</h3>
                <p className="text-sm text-muted-foreground">
                  Take screenshots of your dating profile from any app - Tinder, Hinge, Bumble, Grindr, or others.
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
                <h3 className="text-lg font-semibold">3. Improve Your Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Apply the suggestions to strengthen your profile and messaging.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Two Powerful Tools</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Everything you need to improve your dating app success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
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
                  <Link href="/fix-profile" onClick={() => handleToolClick("profile")}>
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
                  <Link href="/fix-reply" onClick={() => handleToolClick("reply")}>
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

      <section className="py-10 md:py-14 px-4">
        <TestimonialsRotator />
        <p className="text-sm text-muted-foreground text-center mt-6 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          Your screenshots are private and deleted after processing.
        </p>
      </section>

      <section className="py-10 md:py-14 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to improve your matches?
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Get actionable feedback in under a minute. No account required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/fix-profile" onClick={() => handleToolClick("profile")}>
              <Button size="lg" className="text-lg px-8 py-6" data-testid="button-start-profile">
                <Camera className="w-5 h-5 mr-2" />
                Fix My Profile
              </Button>
            </Link>
            <Link href="/fix-reply" onClick={() => handleToolClick("reply")}>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" data-testid="button-start-reply">
                <MessageSquare className="w-5 h-5 mr-2" />
                Fix My Reply
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">FAQ</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left" data-testid={`faq-trigger-${index}`}>
                  {item.question}
                </AccordionTrigger>
                <AccordionContent data-testid={`faq-content-${index}`}>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
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
              <h4 className="font-semibold mb-4">Profile Tips</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/tinder-bio-guide" className="hover-elevate">Tinder Bio Guide</Link>
                </li>
                <li>
                  <Link href="/hinge-prompts-men" className="hover-elevate">Hinge Prompts for Men</Link>
                </li>
                <li>
                  <Link href="/hinge-prompts-women" className="hover-elevate">Hinge Prompts for Women</Link>
                </li>
                <li>
                  <Link href="/bumble-bio-examples" className="hover-elevate">Bumble Bio Examples</Link>
                </li>
                <li>
                  <Link href="/dating-app-photos" className="hover-elevate">Dating App Photos</Link>
                </li>
                <li>
                  <Link href="/hinge-profile-tips" className="hover-elevate">Hinge Profile Tips</Link>
                </li>
                <li>
                  <Link href="/tinder-photo-order" className="hover-elevate">Tinder Photo Order</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Messaging Tips</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/bumble-opener-lines" className="hover-elevate">Bumble Opener Lines</Link>
                </li>
                <li>
                  <Link href="/what-to-text-after-matching" className="hover-elevate">What to Text After Matching</Link>
                </li>
                <li>
                  <Link href="/revive-dead-conversation" className="hover-elevate">Revive Dead Conversations</Link>
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
