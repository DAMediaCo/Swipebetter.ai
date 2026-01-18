import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Camera, MessageSquare, TrendingUp, Shield, Check, AlertTriangle, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { RedditSocialProof } from "@/components/RedditSocialProof";
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
    document.title = "Swipe Better | AI Dating Profile Review & Bio Generator";
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
      <section className="relative flex items-center px-4 pt-6 pb-10 md:pt-8 md:pb-12 bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-3 md:space-y-4 text-center md:text-left order-1">
              <Badge variant="secondary" className="px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                AI-Powered Dating Profile Coach
              </Badge>
              
              <h1 className="text-4xl font-bold tracking-tight leading-[1.2] text-center md:text-left">
                Why Aren't You Getting Matches?{" "}
                <span className="text-primary">Let AI Roast Your Profile.</span>
              </h1>
              
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-center md:text-left">
                <Shield className="w-4 h-4 inline-block align-middle mr-1.5 -mt-0.5" />
                100% Private. Photos deleted immediately after analysis.
              </p>
              
              <p className="text-base md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Get brutally honest, data-driven feedback on your bio and photos. Stop guessing and start converting.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
                <Link href="/fix-profile" onClick={() => handleToolClick("profile")}>
                  <Button size="lg" className="text-lg px-8 py-6 touch-target shadow-lg shadow-primary/25" data-testid="button-fix-profile-hero">
                    <Camera className="w-5 h-5 mr-2" />
                    Analyze My Profile (Free)
                  </Button>
                </Link>
                <a href="#example-feedback">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6 touch-target" data-testid="button-see-example-hero">
                    <Sparkles className="w-5 h-5 mr-2" />
                    See an Example
                  </Button>
                </a>
              </div>
              
              <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1.5 pt-1">
                <Check className="w-4 h-4" />
                Works with Tinder, Hinge, Bumble, and more
              </p>
            </div>
            
            <div className="flex items-center justify-center order-2 md:order-2">
              <div className="relative" role="img" aria-label="Phone mockup showing AI analysis of a dating profile">
                <div className="w-48 h-[320px] md:w-72 md:h-[520px] bg-card rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-border shadow-2xl shadow-black/10 dark:shadow-black/30 p-2 md:p-3 flex flex-col">
                  <div className="w-14 md:w-20 h-4 md:h-5 bg-border rounded-full mx-auto mb-2 md:mb-3" />
                  <div className="flex-1 bg-muted/50 rounded-lg md:rounded-[1.5rem] flex flex-col gap-2 md:gap-3 p-2 md:p-4 overflow-hidden">
                    <div className="text-center">
                      <div className="text-2xl md:text-4xl font-bold text-orange-500">42/100</div>
                      <p className="text-[10px] md:text-xs text-muted-foreground">Profile Score</p>
                    </div>
                    
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded p-2 md:p-3">
                      <div className="flex items-center gap-1 md:gap-2 mb-1">
                        <XCircle className="w-3 h-3 md:w-4 md:h-4 text-orange-500 flex-shrink-0" />
                        <p className="text-[10px] md:text-sm font-semibold text-orange-600 dark:text-orange-400">Trust Issue</p>
                      </div>
                      <p className="text-[9px] md:text-xs text-muted-foreground leading-tight md:leading-relaxed hidden md:block">
                        Your main photo has poor lighting and sunglasses, which lowers trust by 40%.
                      </p>
                    </div>
                    
                    <div className="space-y-1.5 md:space-y-2 mt-auto">
                      <div>
                        <p className="text-[8px] md:text-[10px] text-muted-foreground mb-0.5">Photos</p>
                        <div className="flex items-center gap-1 md:gap-2">
                          <AlertTriangle className="w-2.5 h-2.5 md:w-3 md:h-3 text-orange-500" />
                          <div className="h-1.5 md:h-2 bg-orange-500/40 rounded-full flex-1" />
                        </div>
                      </div>
                      <div>
                        <p className="text-[8px] md:text-[10px] text-muted-foreground mb-0.5">Bio</p>
                        <div className="flex items-center gap-1 md:gap-2">
                          <AlertTriangle className="w-2.5 h-2.5 md:w-3 md:h-3 text-amber-500" />
                          <div className="h-1.5 md:h-2 bg-amber-500/30 rounded-full flex-1" />
                        </div>
                      </div>
                      <div>
                        <p className="text-[8px] md:text-[10px] text-muted-foreground mb-0.5">Conversation</p>
                        <div className="flex items-center gap-1 md:gap-2">
                          <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-500" />
                          <div className="h-1.5 md:h-2 bg-green-500/30 rounded-full flex-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-orange-500/20 rounded-full blur-xl" />
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-amber-500/30 rounded-full blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="example-feedback" className="py-7 md:py-10 px-4 bg-muted/30 scroll-mt-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-5 space-y-2">
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

      <section className="py-7 md:py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Two Powerful Tools</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Everything you need to improve your dating app success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8">
                  <Camera className="w-12 h-12 text-primary mb-4" aria-label="Icon for dating bio writer" />
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
            
            <Card className="overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-accent/40 to-accent/10 p-8">
                  <MessageSquare className="w-12 h-12 text-primary mb-4" aria-label="Icon for reply generator" />
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

      <section className="py-7 md:py-10 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6 space-y-2">
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

      <section className="py-7 md:py-10 px-4">
        <div className="text-center mb-6 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">What People Are Saying</h2>
        </div>
        <RedditSocialProof />
      </section>

      <section className="py-7 md:py-10 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to find out why you're not getting matches?
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Get brutally honest feedback in under a minute. No account required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/fix-profile" onClick={() => handleToolClick("profile")}>
              <Button size="lg" className="text-lg px-8 py-6" data-testid="button-start-profile">
                <Camera className="w-5 h-5 mr-2" />
                Analyze My Profile (Free)
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

      <section className="py-7 md:py-10 px-4">
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

      <footer className="py-8 px-4 bg-slate-50 dark:bg-slate-900/50 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-bold text-lg">SwipeBetter</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2026 SwipeBetter.ai. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
