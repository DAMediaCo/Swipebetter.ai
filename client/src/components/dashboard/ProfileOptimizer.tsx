import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustBar } from "@/components/TrustBar";
import { ImageUpload } from "@/components/ImageUpload";
import { useSubscription, useCredits } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { saveAnalysis } from "@/lib/analysisStorage";
import { trackAnalysisStarted } from "@/lib/analytics";
import { Link, useLocation } from "wouter";
import { 
  HelpCircle,
  Sparkles,
  Loader2,
  Unlock
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

export function ProfileOptimizer() {
  const { data: subscriptionData } = useSubscription();
  const { planTier, credits, hasUnlimitedAccess, isLoading: creditsLoading } = useCredits();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [platform, setPlatform] = useState("");
  const [gender, setGender] = useState("");
  const [intent, setIntent] = useState("");
  const [isEnm, setIsEnm] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const analyzeButtonRef = useRef<HTMLDivElement>(null);
  
  const canGenerate = hasUnlimitedAccess || credits > 0;

  useEffect(() => {
    if (images.length > 0 && analyzeButtonRef.current) {
      setTimeout(() => {
        analyzeButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [images.length]);

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
      // Invalidate the analyses cache so Recent Audits updates
      queryClient.invalidateQueries({ queryKey: ["/api/analyses/profile"] });
      
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
  const canAnalyze = preferencesComplete && images.length > 0 && subscriptionData?.canAnalyze;

  return (
    <div className="space-y-6">
      {!creditsLoading && !canGenerate && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-4 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-sm">Credits required</p>
              <p className="text-xs text-muted-foreground">
                {planTier === 'free' && "Get 1 credit for $3 or go unlimited"}
                {planTier === 'starter' && "Get more credits to continue"}
              </p>
            </div>
            <Link href="/pricing?returnTo=/dashboard?tab=profile">
              <Button size="sm" data-testid="button-upgrade-banner">
                <Unlock className="w-4 h-4 mr-1" />
                Get Credits
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
      
      {canGenerate && !hasUnlimitedAccess && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="py-3 flex items-center gap-3">
            <Unlock className="w-4 h-4 text-green-500" />
            <p className="text-sm">
              <span className="font-medium">{credits} credit{credits !== 1 ? 's' : ''}</span>
              <span className="text-muted-foreground"> remaining - 1 credit per profile</span>
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card shadow-sm rounded-2xl">
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
              id="enm-toggle-profile"
              checked={isEnm}
              onCheckedChange={(checked) => setIsEnm(checked === true)}
              data-testid="checkbox-enm"
            />
            <label 
              htmlFor="enm-toggle-profile" 
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

      <Card className="bg-card shadow-sm rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">2. Upload Screenshots</CardTitle>
          <p className="text-sm text-muted-foreground">Upload screenshots of your dating profile</p>
        </CardHeader>
        
        <CardContent className="pt-2">
          <ImageUpload images={images} onChange={setImages} maxImages={10} />
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

      <div className="pt-4" ref={analyzeButtonRef}>
        <Button
          onClick={() => analyzeMutation.mutate()}
          disabled={!canAnalyze || analyzeMutation.isPending}
          className="w-full py-6 font-bold shadow-md hover:shadow-lg transition-shadow"
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
        {preferencesComplete && images.length > 0 && !subscriptionData?.canAnalyze && (
          <p className="text-sm text-muted-foreground text-center mt-2">
            Credits required to analyze your profile
          </p>
        )}
      </div>

      <div className="bg-muted/50 rounded-xl p-4 mt-6">
        <TrustBar />
      </div>
    </div>
  );
}
