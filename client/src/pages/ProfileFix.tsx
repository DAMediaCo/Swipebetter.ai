import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrustBar } from "@/components/TrustBar";
import { PrivacyFAQ } from "@/components/PrivacyFAQ";
import { BeforeAfterBio } from "@/components/BeforeAfterBio";
import { ExampleResults } from "@/components/ExampleResults";
import { HowItWorks } from "@/components/HowItWorks";
import { ImageUpload } from "@/components/ImageUpload";
import { useAuth, useSubscription } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { saveAnalysis } from "@/lib/analysisStorage";
import { trackAnalysisStarted } from "@/lib/analytics";
import { Link, useLocation } from "wouter";
import { 
  ArrowDown,
  HelpCircle,
  CloudUpload,
  Sparkles,
  Loader2
} from "lucide-react";
import { SiTinder } from "react-icons/si";
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
    document.title = "Fix Your Profile | SwipeBetter";
  }, []);

  const [showDashboard, setShowDashboard] = useState(false);
  const [platform, setPlatform] = useState("");
  const [gender, setGender] = useState("");
  const [intent, setIntent] = useState("");
  const [isEnm, setIsEnm] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const scrollToExamples = () => {
    document.getElementById('example-results')?.scrollIntoView({ behavior: 'smooth' });
  };

  const startAnalysis = () => {
    if (!user) {
      setLocation('/auth');
      return;
    }
    setShowDashboard(true);
  };

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

  const preferencesComplete = platform && gender && intent;
  const canAnalyze = preferencesComplete && images.length > 0; // Allow all logged-in users (freemium)

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    );
  }

  if (!showDashboard) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 space-y-12">
          <section className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Fix Your Dating Profile.<br />
              <span className="text-primary">Get More Matches.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload screenshots. Get a score, photo feedback, and a better bio in minutes.
            </p>
            
            <div 
              onClick={startAnalysis}
              className="max-w-xl mx-auto p-8 border-2 border-dashed border-muted-foreground/30 rounded-xl bg-slate-50 dark:bg-slate-900/50 cursor-pointer transition-all duration-200 hover:border-primary hover:bg-slate-100 dark:hover:bg-slate-800/50 group"
              data-testid="button-start-upload"
            >
              <div className="flex flex-col items-center gap-3">
                <CloudUpload className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="text-lg font-medium">Drag & drop screenshots here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Upload 3-6 screenshots of your photos, bio, and prompts.
              </p>
              <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <SiTinder className="w-4 h-4" />
                  <span>Tinder</span>
                </div>
                <span className="text-muted-foreground/40">|</span>
                <span>Hinge</span>
                <span className="text-muted-foreground/40">|</span>
                <span>Bumble</span>
                <span className="text-muted-foreground/40">|</span>
                <span className="text-muted-foreground/60">+ more</span>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={scrollToExamples}
              className="text-muted-foreground"
              data-testid="button-see-examples"
            >
              See Example Results
              <ArrowDown className="w-4 h-4 ml-2" />
            </Button>
            
            <div className="pt-2">
              <div className="inline-block bg-slate-50 dark:bg-slate-900/50 rounded-lg px-6 py-4">
                <TrustBar />
              </div>
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

          <section className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 text-center">
            <p className="text-muted-foreground mb-4">Need help with replies instead?</p>
            <Link href="/fix-reply">
              <Button 
                className="bg-white dark:bg-slate-800 text-foreground shadow-md hover:shadow-lg transition-shadow border border-border"
                data-testid="link-fix-reply-cross"
              >
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
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">Fix Your Profile</h1>
          <p className="text-sm text-muted-foreground">Tell us about yourself and upload your screenshots</p>
        </div>

        {!subscriptionData?.canAnalyze && (
          <Card className="border-primary/50 bg-primary/5">
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

        <Card className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">1. Your Goals</CardTitle>
            <p className="text-sm text-muted-foreground">Help us personalize your feedback</p>
          </CardHeader>
          
          <CardContent className="space-y-5 pt-2">
            <div className="space-y-2">
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
            
            <div className="space-y-2">
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

            <div className="space-y-2">
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
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">2. Upload Screenshots</CardTitle>
            <p className="text-sm text-muted-foreground">Upload screenshots of your dating profile</p>
          </CardHeader>
          
          <CardContent className="pt-2">
            <ImageUpload images={images} onChange={setImages} maxImages={5} />
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-slate-400 mb-2">Compatible with all major apps</p>
          <div className="flex items-center justify-center gap-4 text-slate-400">
            <div className="flex items-center gap-1">
              <SiTinder className="w-4 h-4" />
              <span className="text-xs">Tinder</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-xs">Hinge</span>
            <span className="text-slate-300">|</span>
            <span className="text-xs">Bumble</span>
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={() => analyzeMutation.mutate()}
            disabled={!canAnalyze || analyzeMutation.isPending}
            className="w-full py-6 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold shadow-md hover:shadow-lg transition-shadow"
            data-testid="button-analyze"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze My Profile
              </>
            )}
          </Button>
          {!preferencesComplete && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Select all preferences to continue
            </p>
          )}
          {preferencesComplete && images.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Upload at least 1 screenshot to continue
            </p>
          )}
        </div>

        <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl p-4 mt-6">
          <TrustBar />
        </div>
      </div>
    </div>
  );
}
