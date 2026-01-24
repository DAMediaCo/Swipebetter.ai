import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import { TrustBar } from "@/components/TrustBar";
import { PrivacyNote } from "@/components/PrivacyNote";
import { PrivacyFAQ } from "@/components/PrivacyFAQ";
import { ConvoDemo } from "@/components/ConvoDemo";
import { ExampleReplies } from "@/components/ExampleReplies";
import { HowItWorks } from "@/components/HowItWorks";
import { useAuth, useCredits, useCheckReplyAccess } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { saveAnalysis } from "@/lib/analysisStorage";
import { trackAnalysisStarted } from "@/lib/analytics";
import { Link, useLocation } from "wouter";
import { 
  Sparkles, 
  Heart,
  Flame,
  Smile,
  Brain,
  ArrowDown,
  HelpCircle,
  Loader2,
  Shield,
  Trash2,
  Unlock
} from "lucide-react";
import { StepIndicator } from "@/components/StepIndicator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

const tones = [
  { id: "flirty", label: "Flirty", icon: Heart },
  { id: "witty", label: "Witty", icon: Smile },
  { id: "confident", label: "Confident", icon: Flame },
  { id: "thoughtful", label: "Thoughtful", icon: Brain },
];

const heroTones = [
  { id: "witty", label: "Witty", icon: Sparkles },
  { id: "flirty", label: "Flirty", icon: Heart },
  { id: "direct", label: "Direct", icon: Flame },
];

export default function ReplyFix() {
  const { data: authData, isLoading: authLoading } = useAuth();
  const { credits, hasUnlimitedAccess, refreshCredits, isLoading: creditsLoading, planTier } = useCredits();
  const checkAccessMutation = useCheckReplyAccess();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const user = authData?.user;
  const canGenerate = hasUnlimitedAccess || credits > 0;

  useEffect(() => {
    document.title = "Fix Your Reply | SwipeBetter";
  }, []);

  const [step, setStep] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [tone, setTone] = useState("");
  const [isEnm, setIsEnm] = useState(false);
  const [conversationText, setConversationText] = useState("");
  const [heroTone, setHeroTone] = useState("witty");

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      // For non-unlimited users, check and deduct credit first
      if (!hasUnlimitedAccess) {
        const accessResult = await checkAccessMutation.mutateAsync(true);
        if (accessResult.access !== 'granted') {
          throw new Error('402: Payment required');
        }
      }
      
      trackAnalysisStarted("reply");
      const response = await apiRequest("POST", "/api/analyze-reply", {
        tone,
        screenshots: images,
        enm: isEnm,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.parsed) {
        saveAnalysis('reply', data.parsed);
        refreshCredits();
        setLocation('/fix-reply/results');
      }
    },
    onError: (error: any) => {
      if (error.message?.includes("402")) {
        toast({
          title: "Credits required",
          description: "Get credits to use this feature.",
          variant: "destructive",
        });
        setLocation('/pricing');
      } else if (error.message?.includes("403")) {
        toast({
          title: "Access denied",
          description: "Please try again or contact support.",
          variant: "destructive",
        });
        setLocation('/pricing');
      } else {
        toast({
          title: "Analysis failed",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const canProceed = () => {
    if (step === 1) return images.length > 0;
    if (step === 2) return tone;
    return false;
  };

  const scrollToDemo = () => {
    document.getElementById('reply-demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const startAnalysis = () => {
    if (!user) {
      setLocation('/auth');
      return;
    }
    setStep(1);
  };

  const heroAnalyzeMutation = useMutation({
    mutationFn: async () => {
      // For non-unlimited users, check and deduct credit first
      if (!hasUnlimitedAccess) {
        const accessResult = await checkAccessMutation.mutateAsync(true);
        if (accessResult.access !== 'granted') {
          throw new Error('402: Payment required');
        }
      }
      
      trackAnalysisStarted("reply");
      const selectedTone = heroTone === "direct" ? "confident" : heroTone;
      const response = await apiRequest("POST", "/api/analyze-reply", {
        tone: selectedTone,
        conversationText: conversationText.trim(),
        enm: false,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.parsed) {
        saveAnalysis('reply', data.parsed);
        refreshCredits();
        setLocation('/fix-reply/results');
      }
    },
    onError: (error: any) => {
      if (error.message?.includes("402")) {
        toast({
          title: "Credits required",
          description: "Get credits to use this feature.",
          variant: "destructive",
        });
        setLocation('/pricing');
      } else if (error.message?.includes("403")) {
        toast({
          title: "Access denied",
          description: "Please try again or contact support.",
          variant: "destructive",
        });
        setLocation('/pricing');
      } else {
        toast({
          title: "Analysis failed",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleHeroSubmit = () => {
    if (!user) {
      setLocation('/auth');
      return;
    }
    if (!conversationText.trim()) {
      toast({
        title: "Please paste a message",
        description: "Enter the conversation text to generate replies.",
        variant: "destructive",
      });
      return;
    }
    heroAnalyzeMutation.mutate();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    );
  }

  if (step === 0) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-8 space-y-12">
          <section className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Fix Your Reply.<br />
              <span className="text-primary">Keep the Conversation Going.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Paste the chat. Pick a tone. Get 3 replies that sound like you.
            </p>
            
            <div className="max-w-2xl mx-auto space-y-4">
              <Textarea
                value={conversationText}
                onChange={(e) => setConversationText(e.target.value)}
                placeholder="Paste your match's message here... (e.g. 'What's your favorite travel spot?')"
                className="h-48 bg-muted/50 rounded-2xl border border-border/50 p-6 text-base resize-none"
                data-testid="textarea-conversation"
              />
              
              <div className="flex flex-wrap justify-center gap-3">
                {heroTones.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setHeroTone(t.id)}
                      className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all flex items-center gap-1.5 ${
                        heroTone === t.id
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                      data-testid={`button-hero-tone-${t.id}`}
                    >
                      <Icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
              
              <Button 
                size="lg" 
                onClick={handleHeroSubmit}
                disabled={heroAnalyzeMutation.isPending || !conversationText.trim()}
                className="w-full py-6 font-bold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                data-testid="button-generate-replies"
              >
                {heroAnalyzeMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Replies
                  </>
                )}
              </Button>
            </div>
            
            <div className="pt-4 flex justify-center">
              <div className="bg-muted/50 rounded-xl p-4 backdrop-blur-sm inline-flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Private & Secure</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trash2 className="w-4 h-4 text-green-500" />
                  <span>Data deleted after analysis</span>
                </div>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={scrollToDemo}
              className="text-muted-foreground"
              data-testid="button-see-reply-examples"
            >
              See Reply Examples
              <ArrowDown className="w-4 h-4 ml-2" />
            </Button>
          </section>

          <section>
            <HowItWorks variant="reply" />
          </section>

          <section>
            <ConvoDemo />
          </section>

          <section>
            <ExampleReplies />
          </section>

          <section>
            <PrivacyFAQ />
          </section>

          <section className="bg-muted/50 rounded-2xl p-8 text-center">
            <p className="text-muted-foreground mb-4">Need help with your profile instead?</p>
            <Link href="/fix-profile">
              <Button 
                className="bg-card text-foreground shadow-md hover:shadow-lg transition-shadow border border-border"
                data-testid="link-fix-profile-cross"
              >
                Try Fix My Profile
              </Button>
            </Link>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepIndicator 
          steps={["Paste", "Results", "Upgrade"]} 
          currentStep={1} 
        />

        <div className="mb-6">
          <TrustBar />
        </div>

        {!creditsLoading && !canGenerate && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="py-4 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-sm">Credits required</p>
                <p className="text-xs text-muted-foreground">Get credits to access AI-powered analysis</p>
              </div>
              <Link href="/pricing">
                <Button size="sm" data-testid="button-upgrade-banner">
                  <Unlock className="w-4 h-4 mr-1" />
                  Get Credits
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">
              {step === 1 && "Upload Conversation"}
              {step === 2 && "Choose Your Tone"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {step === 1 && "Screenshot the conversation you need help with"}
              {step === 2 && "How do you want your reply to sound?"}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-4">
            {step === 1 && (
              <div className="space-y-4">
                <ImageUpload images={images} onChange={setImages} maxImages={3} />
                
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Checkbox
                    id="enm-toggle"
                    checked={isEnm}
                    onCheckedChange={(checked) => setIsEnm(checked === true)}
                    data-testid="checkbox-enm"
                  />
                  <label 
                    htmlFor="enm-toggle" 
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    This is an ENM/Poly conversation
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Selecting this helps us tailor your replies for ethical non-monogamy contexts.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <PrivacyNote />
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-2 gap-3">
                {tones.map((t) => {
                  const Icon = t.icon;
                  const isSelected = tone === t.id;
                  return (
                    <Button
                      key={t.id}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => setTone(t.id)}
                      className="h-auto py-6 flex flex-col gap-2"
                      data-testid={`button-tone-${t.id}`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? "" : "text-muted-foreground"}`} />
                      <span className="font-semibold">{t.label}</span>
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <PrivacyFAQ />
        </div>
      </div>

      {step >= 1 && step <= 2 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-bottom">
          <div className="max-w-2xl mx-auto space-y-2">
            {step === 1 && images.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                Upload at least 1 screenshot to continue.
              </p>
            )}
            <Button
              onClick={() => {
                if (step < 2) {
                  setStep(step + 1);
                } else {
                  analyzeMutation.mutate();
                }
              }}
              disabled={!canProceed() || analyzeMutation.isPending || (step === 2 && !canGenerate)}
              className="w-full py-6"
              data-testid="button-next-step"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : step === 2 ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Replies
                </>
              ) : (
                "Choose Tone"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
