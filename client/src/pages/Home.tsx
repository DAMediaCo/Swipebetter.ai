import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Camera, MessageSquare, TrendingUp, Shield, Check, AlertTriangle, XCircle, Zap, Search, Pencil, Eye, MessageCircle, ArrowRight, Lock } from "lucide-react";
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
    document.title = "AI Dating Profile Audit | SwipeBetter.ai";
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
    <div className="flex flex-col min-h-screen bg-background">
      <section className="relative flex items-center px-4 pt-8 pb-12 md:pt-16 md:pb-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl opacity-50" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="space-y-5 md:space-y-6 text-center md:text-left order-1">
              <Badge variant="secondary" className="px-4 py-1.5 border-primary/30">
                <Zap className="w-3.5 h-3.5 mr-1.5 text-primary" />
                AI-Powered Profile Analysis
              </Badge>
              
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.15]">
                Is Your Profile{" "}
                <span className="text-primary">Holding You Back?</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Stop guessing. Start dating. Get a professional AI audit with a 0-100 score and actionable improvements.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
                <Link href="/fix-profile" onClick={() => handleToolClick("profile")}>
                  <Button size="lg" className="text-lg px-8 py-6 touch-target shadow-lg shadow-primary/25" data-testid="button-fix-profile-hero">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get My Free Score
                  </Button>
                </Link>
                <a href="#example-feedback">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6 touch-target border-primary/30 hover:bg-primary/10" data-testid="button-see-example-hero">
                    See Example Report
                  </Button>
                </a>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-primary" />
                  100% Private
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-primary" />
                  Works with Tinder, Hinge, Bumble & more
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-center order-2 md:order-2">
              <div className="relative" role="img" aria-label="Profile report card showing AI analysis with score">
                <div className="w-72 md:w-80 bg-card rounded-2xl border border-border shadow-2xl shadow-primary/10 p-5 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Profile Audit Report</span>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">AI Analysis</Badge>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-4 border-amber-500/50 mb-3">
                      <span className="text-4xl font-bold text-amber-500">64</span>
                      <span className="text-lg text-amber-500/70">/100</span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                    <p className="text-xs text-amber-500">Room for improvement</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-medium">Photos</span>
                      </div>
                      <Badge variant="outline" className="text-xs border-destructive/30 text-destructive">Needs Work</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Bio</span>
                      </div>
                      <Badge variant="outline" className="text-xs border-green-500/30 text-green-500">Excellent</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium">First Impression</span>
                      </div>
                      <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-500">Average</Badge>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-primary/15 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold">Your Dating Toolkit</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Four AI-powered tools to transform your dating game
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="hover-elevate transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">The Deep Dive Audit</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI scans your profile for red flags. Get a precise 0-100 score and objective feedback.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Pencil className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">The Bio Architect</h3>
                    <p className="text-sm text-muted-foreground">
                      Writer's block is over. Generate 5 custom, witty bios tailored to your specific vibe in seconds.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Vibe Check (Photo Analysis)</h3>
                    <p className="text-sm text-muted-foreground">
                      Data-driven photo scoring. See exactly how your photos rate on 'Trust,' 'Attractiveness,' and 'Intelligence.'
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">The Rizz Assistant</h3>
                    <p className="text-sm text-muted-foreground">
                      Never send a boring text again. Upload a screenshot and let AI craft the perfect reply.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-12 md:py-16 px-4 bg-card/50 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Start for free. Pay only for what you need.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border">
              <CardContent className="pt-6 pb-6 px-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-1">The Scan</h3>
                  <p className="text-sm text-muted-foreground mb-4">See where you stand.</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">Free</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm">Instant 0-100 Profile Score</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm">Red Flag Detection</span>
                  </li>
                  <li className="flex items-center gap-3 opacity-50">
                    <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">Detailed Feedback</span>
                  </li>
                  <li className="flex items-center gap-3 opacity-50">
                    <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">Bio Suggestions</span>
                  </li>
                </ul>
                
                <Link href="/fix-profile" onClick={() => handleToolClick("profile")}>
                  <Button variant="outline" className="w-full border-primary/30" data-testid="button-pricing-free">
                    Get My Free Score
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="border-primary/50 shadow-lg shadow-primary/20 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
                  Best Value
                </Badge>
              </div>
              <CardContent className="pt-8 pb-6 px-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-1">Starter Fix</h3>
                  <p className="text-sm text-muted-foreground mb-4">Perfect for a quick profile refresh.</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-primary">$3</span>
                    <span className="text-muted-foreground">one-time</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm">Unlock Full Audit Report</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm">See the 'Why' behind your score</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm">5 AI-Generated Custom Bios</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm">Photo Analysis for 1 Profile</span>
                  </li>
                </ul>
                
                <Link href="/pricing">
                  <Button className="w-full" data-testid="button-pricing-starter">
                    Fix My Profile ($3)
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="border-border">
              <CardContent className="pt-6 pb-6 px-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-1">Unlimited</h3>
                  <p className="text-sm text-muted-foreground mb-4">For serious daters who want results fast.</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">$12</span>
                    <span className="text-muted-foreground">/ month</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm">Unlimited Profile Audits</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm">Unlimited Bio Generation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm font-medium">Rizz Assistant (Chat Help)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm">Deep Dive Photo Analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm">Priority Processing</span>
                  </li>
                </ul>
                
                <Link href="/pricing">
                  <Button variant="outline" className="w-full border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10" data-testid="button-pricing-unlimited">
                    Go Unlimited
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="example-feedback" className="py-10 md:py-14 px-4 bg-card/50 border-y border-border scroll-mt-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Example AI Analysis</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              See what kind of actionable insights you will get
            </p>
          </div>
          
          <div className="bg-card rounded-2xl border border-border shadow-lg p-6 md:p-8">
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
                <p className="text-base">Your first photo has unclear lighting and facial expression, reducing trust signals.</p>
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
            <h2 className="text-2xl md:text-3xl font-bold">Two Powerful Tools</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Everything you need to optimize your dating app success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="overflow-hidden border-border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-primary/15 to-primary/5 p-8">
                  <Camera className="w-12 h-12 text-primary mb-4" aria-label="Icon for profile audit" />
                  <h3 className="text-xl font-bold mb-2">Profile Audit</h3>
                  <p className="text-muted-foreground mb-6">
                    Get AI-powered analysis of your bio, photos, and overall profile appeal with a 0-100 score.
                  </p>
                  <ul className="space-y-2 text-sm mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Professional 0-100 score
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Bio optimization suggestions
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Photo order recommendations
                    </li>
                  </ul>
                  <Link href="/fix-profile" onClick={() => handleToolClick("profile")}>
                    <Button className="w-full" data-testid="button-try-profile-fix">
                      Get My Score
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-accent/40 to-accent/10 p-8">
                  <MessageSquare className="w-12 h-12 text-primary mb-4" aria-label="Icon for reply assistant" />
                  <h3 className="text-xl font-bold mb-2">Reply Assistant</h3>
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
                    <Button variant="outline" className="w-full border-primary/30 hover:bg-primary/10" data-testid="button-try-reply-fix">
                      Try Reply Assistant
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 px-4 bg-card/50 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Three simple steps to optimize your dating profile
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="text-center border-border">
              <CardContent className="pt-8 pb-6 px-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
                  <Camera className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">1. Upload Screenshots</h3>
                <p className="text-sm text-muted-foreground">
                  Take screenshots of your dating profile from any app - Tinder, Hinge, Bumble, Grindr, or others.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-border">
              <CardContent className="pt-8 pb-6 px-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">2. Get AI Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes your profile and provides a professional score with specific, actionable feedback.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-border">
              <CardContent className="pt-8 pb-6 px-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
                  <TrendingUp className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">3. Optimize Your Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Apply the suggestions to strengthen your profile and improve your match rate.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 px-4">
        <div className="text-center mb-6 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">What People Are Saying</h2>
        </div>
        <RedditSocialProof />
      </section>

      <section className="py-10 md:py-14 px-4 bg-gradient-to-br from-primary/10 via-background to-primary/5 border-y border-border">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to see your profile score?
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Get a professional AI audit in under a minute. See your 0-100 score and exactly what to improve.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/fix-profile" onClick={() => handleToolClick("profile")}>
              <Button size="lg" className="text-lg px-8 py-6 shadow-lg shadow-primary/25" data-testid="button-start-profile">
                <Sparkles className="w-5 h-5 mr-2" />
                Get My Free Score
              </Button>
            </Link>
            <Link href="/fix-reply" onClick={() => handleToolClick("reply")}>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10" data-testid="button-start-reply">
                <MessageSquare className="w-5 h-5 mr-2" />
                Try Reply Assistant
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
              <AccordionItem key={index} value={`item-${index}`} className="border-border">
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

      <section className="py-12 md:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold">Latest Dating Insights</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Expert tips and strategies to improve your dating success
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover-elevate transition-all">
              <CardContent className="pt-6 pb-6">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">Profile Tips</span>
                <h3 className="font-semibold text-lg mt-2 mb-2">Why You're Getting No Matches</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Stop guessing. Here is the data-driven reason your profile isn't performing and exactly how to fix it.
                </p>
                <a 
                  href="/blog/why-am-i-getting-no-matches.html" 
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  data-testid="link-blog-no-matches"
                >
                  Read Guide <ArrowRight className="w-4 h-4" />
                </a>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardContent className="pt-6 pb-6">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Coming Soon</span>
                <h3 className="font-semibold text-lg mt-2 mb-2">The Perfect First Message</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  What to say after matching to maximize your response rate and start great conversations.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  Coming Soon
                </span>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardContent className="pt-6 pb-6">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Coming Soon</span>
                <h3 className="font-semibold text-lg mt-2 mb-2">Photo Order That Works</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The science behind which photos to put first and how order affects your match rate.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  Coming Soon
                </span>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <a href="/blog/">
              <Button variant="outline" className="border-primary/30 hover:bg-primary/10" data-testid="button-view-all-blog">
                View All Articles <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 bg-card/80 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-bold text-lg">SwipeBetter</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              &copy; 2026 SwipeBetter.ai. All rights reserved.
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
