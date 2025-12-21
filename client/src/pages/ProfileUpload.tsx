import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ImageUpload";
import { TrustBar } from "@/components/TrustBar";
import { PrivacyNote } from "@/components/PrivacyNote";
import { useAuth, useSubscription } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { saveAnalysis } from "@/lib/analysisStorage";
import { trackAnalysisStarted } from "@/lib/analytics";
import { Link, useLocation } from "wouter";
import { 
  Sparkles, 
  ArrowLeft, 
  Loader2
} from "lucide-react";
import { StepIndicator } from "@/components/StepIndicator";
import { useToast } from "@/hooks/use-toast";

export default function ProfileUpload() {
  const { data: authData } = useAuth();
  const { data: subscriptionData } = useSubscription();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const user = authData?.user;

  useEffect(() => {
    document.title = "Upload Profile - SwipeBetter.ai";
  }, []);

  const [images, setImages] = useState<string[]>([]);

  const storedPlatform = sessionStorage.getItem("profile_platform") || "";
  const storedGender = sessionStorage.getItem("profile_gender") || "";
  const storedIntent = sessionStorage.getItem("profile_intent") || "";
  const storedEnm = sessionStorage.getItem("profile_enm") === "true";

  useEffect(() => {
    if (!storedPlatform || !storedGender) {
      setLocation("/fix-profile");
    }
  }, [storedPlatform, storedGender, setLocation]);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      trackAnalysisStarted("profile");
      const response = await apiRequest("POST", "/api/analyze-profile", {
        platform: storedPlatform,
        gender: storedGender,
        intent: storedIntent,
        screenshots: images,
        enm: storedEnm,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.parsed) {
        saveAnalysis('profile', data.parsed);
        sessionStorage.removeItem("profile_platform");
        sessionStorage.removeItem("profile_gender");
        sessionStorage.removeItem("profile_intent");
        sessionStorage.removeItem("profile_enm");
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

  const canAnalyze = images.length > 0 && subscriptionData?.canAnalyze;

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/fix-profile">
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="w-9" />
        </div>

        <StepIndicator 
          steps={["Details", "Upload", "Results"]} 
          currentStep={2} 
        />

        <div className="mb-6">
          <TrustBar />
        </div>

        {storedPlatform && storedGender && (
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <Badge variant="secondary" data-testid="badge-platform">
              {storedPlatform}
            </Badge>
            <Badge variant="secondary" data-testid="badge-gender">
              {storedGender}
            </Badge>
            {storedIntent && (
              <Badge variant="secondary" data-testid="badge-intent">
                {storedIntent}
              </Badge>
            )}
            {storedEnm && (
              <Badge variant="secondary" data-testid="badge-enm">
                ENM/Poly
              </Badge>
            )}
          </div>
        )}

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
              Upload Your Profile
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload screenshots of your dating profile
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-4">
            <ImageUpload images={images} onChange={setImages} maxImages={5} />
            <PrivacyNote />
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-bottom">
        <div className="max-w-2xl mx-auto space-y-2">
          {images.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Upload at least 1 screenshot to continue.
            </p>
          )}
          <Button
            onClick={() => analyzeMutation.mutate()}
            disabled={!canAnalyze || analyzeMutation.isPending}
            className="w-full py-6"
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
        </div>
      </div>
    </div>
  );
}
