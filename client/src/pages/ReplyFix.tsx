import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/ImageUpload";
import { TrustBar } from "@/components/TrustBar";
import { PrivacyNote } from "@/components/PrivacyNote";
import { PrivacyFAQ } from "@/components/PrivacyFAQ";
import { useAuth, useSubscription } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { saveAnalysis } from "@/lib/analysisStorage";
import { Link, useLocation } from "wouter";
import { 
  Sparkles, 
  ArrowLeft, 
  MessageSquare,
  Heart,
  Flame,
  Smile,
  Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const tones = [
  { id: "flirty", label: "Flirty", icon: Heart },
  { id: "witty", label: "Witty", icon: Smile },
  { id: "confident", label: "Confident", icon: Flame },
  { id: "thoughtful", label: "Thoughtful", icon: Brain },
];

export default function ReplyFix() {
  const { data: authData, isLoading: authLoading } = useAuth();
  const { data: subscriptionData } = useSubscription();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const user = authData?.user;

  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [tone, setTone] = useState("");

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/analyze-reply", {
        tone,
        screenshots: images,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.parsed) {
        saveAnalysis('reply', data.parsed);
        setLocation('/fix-reply/results');
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
    if (step === 2) return tone;
    return false;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <MessageSquare className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-xl font-bold">Sign in to Fix Your Replies</h2>
            <p className="text-muted-foreground">
              Get AI-generated reply suggestions for your dating conversations.
            </p>
            <Link href="/auth">
              <Button className="w-full" data-testid="button-login-reply">
                Sign In to Continue
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {[1, 2].map((i) => (
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

      {step <= 2 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-bottom">
          <div className="max-w-2xl mx-auto flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
                data-testid="button-back-step"
              >
                Back
              </Button>
            )}
            <Button
              onClick={() => {
                if (step < 2) {
                  setStep(step + 1);
                } else {
                  analyzeMutation.mutate();
                }
              }}
              disabled={!canProceed() || analyzeMutation.isPending || !subscriptionData?.canAnalyze}
              className="flex-1 py-6"
              data-testid="button-next-step"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                  Generating...
                </>
              ) : step < 2 ? (
                "Next"
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Replies
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
