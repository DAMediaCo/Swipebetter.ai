import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/ImageUpload";
import { TrustBar } from "@/components/TrustBar";
import { PrivacyNote } from "@/components/PrivacyNote";
import { PrivacyFAQ } from "@/components/PrivacyFAQ";
import { BeforeAfterBio } from "@/components/BeforeAfterBio";
import { ExampleResults } from "@/components/ExampleResults";
import { HowItWorks } from "@/components/HowItWorks";
import { useAuth, useSubscription } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { saveAnalysis } from "@/lib/analysisStorage";
import { trackAnalysisStarted } from "@/lib/analytics";
import { Link, useLocation } from "wouter";
import { 
  Sparkles, 
  ArrowLeft, 
  Camera,
  Upload,
  ArrowDown,
  HelpCircle
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

const platforms = ["Tinder", "Hinge", "Bumble", "Grindr", "Coffee Meets Bagel", "Other"];
const genders = ["Man", "Woman", "Non-binary"];
const intents = ["Relationship", "Casual Dating", "Friendship", "Not Sure"];

export default function ProfileFix() {
  const { data: authData, isLoading: authLoading } = useAuth();
  const { data: subscriptionData } = useSubscription();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const user = authData?.user;

  useEffect(() => {
    document.title = "Fix My Profile - SwipeBetter.ai";
  }, []);

  const [step, setStep] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [platform, setPlatform] = useState("");
  const [gender, setGender] = useState("");
  const [intent, setIntent] = useState("");
  const [isEnm, setIsEnm] = useState(false);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      trackAnalysisStarted("profile");
      const response = await apiRequest("POST", "/api/analyze-profile", {
        platform,
        gender,
        intent,
        screenshots: images,
        enm: isEnm,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.parsed) {
        saveAnalysis('profile', data.parsed);
        setLocation('/fix-profile/results');
      }
    },
    onError: (error: any) => {
      if (error.message?.includes("403")) {
        toast({
          title: "Subscription required",
          description: "Upgrade to Pro to use this feature.",
          variant: "destructive",
        });
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
    if (step === 2) return platform && gender;
    if (step === 3) return intent;
    return false;
  };

  const scrollToExamples = () => {
    document.getElementById('example-results')?.scrollIntoView({ behavior: 'smooth' });
  };

  const startAnalysis = () => {
    if (!user) {
      setLocation('/auth');
      return;
    }
    setStep(1);
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
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-16">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <section className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Fix Your Dating Profile.<br />
              <span className="text-primary">Get More Matches.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload screenshots. Get a score, photo feedback, and a better bio in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg" 
                onClick={startAnalysis}
                className="py-6 px-8"
                data-testid="button-start-upload"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Profile Screenshots
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={scrollToExamples}
                className="py-6 px-8"
                data-testid="button-see-examples"
              >
                See Example Results
                <ArrowDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="pt-4">
              <TrustBar />
            </div>
          </section>

          <section>
            <HowItWorks variant="profile" />
          </section>

          <section>
            <ExampleResults />
          </section>

          <section>
            <BeforeAfterBio />
          </section>

          <section>
            <PrivacyFAQ />
          </section>

          <section className="text-center py-8 border-t border-border">
            <p className="text-muted-foreground mb-4">Need help with replies instead?</p>
            <Link href="/fix-reply">
              <Button variant="outline" data-testid="link-fix-reply-cross">
                Try Fix My Reply
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
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setStep(step > 1 ? step - 1 : 0)}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="w-9" />
        </div>

        <div className="mb-6">
          <TrustBar />
        </div>

        {!subscriptionData?.canAnalyze && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="py-4 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-sm">Pro subscription required</p>
                <p className="text-xs text-muted-foreground">Subscribe to access AI-powered analysis</p>
              </div>
              <Link href="/pricing">
                <Button size="sm" data-testid="button-upgrade-banner">Subscribe</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">
              {step === 1 && "Upload Your Profile"}
              {step === 2 && "About You"}
              {step === 3 && "What Are You Looking For?"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {step === 1 && "Upload screenshots of your dating profile"}
              {step === 2 && "Help us personalize your feedback"}
              {step === 3 && "We'll tailor suggestions to your goals"}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-4">
            {step === 1 && (
              <div className="space-y-4">
                <ImageUpload images={images} onChange={setImages} maxImages={5} />
                
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
                    This is an ENM/Poly profile
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Selecting this helps us tailor your feedback for ethical non-monogamy profiles.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <PrivacyNote />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Dating Platform</label>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((p) => (
                      <Button
                        key={p}
                        variant={platform === p ? "default" : "outline"}
                        onClick={() => setPlatform(p)}
                        className="rounded-full"
                        data-testid={`button-platform-${p.toLowerCase().replace(/ /g, "-")}`}
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium">I identify as</label>
                  <div className="flex flex-wrap gap-2">
                    {genders.map((g) => (
                      <Button
                        key={g}
                        variant={gender === g ? "default" : "outline"}
                        onClick={() => setGender(g)}
                        className="rounded-full"
                        data-testid={`button-gender-${g.toLowerCase().replace(/ /g, "-")}`}
                      >
                        {g}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Looking for</label>
                <div className="flex flex-wrap gap-2">
                  {intents.map((i) => (
                    <Button
                      key={i}
                      variant={intent === i ? "default" : "outline"}
                      onClick={() => setIntent(i)}
                      className="rounded-full"
                      data-testid={`button-intent-${i.toLowerCase().replace(/ /g, "-")}`}
                    >
                      {i}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <PrivacyFAQ />
        </div>
      </div>

      {step >= 1 && step <= 3 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-bottom">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Button
              onClick={() => {
                if (step < 3) {
                  setStep(step + 1);
                } else {
                  analyzeMutation.mutate();
                }
              }}
              disabled={!canProceed() || analyzeMutation.isPending || (step === 3 && !subscriptionData?.canAnalyze)}
              className="flex-1 py-6"
              data-testid="button-next-step"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : step < 3 ? (
                "Next"
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze Profile
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
