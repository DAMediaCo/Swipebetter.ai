import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/ImageUpload";
import { TrustBar } from "@/components/TrustBar";
import { PrivacyNote } from "@/components/PrivacyNote";
import { PrivacyFAQ } from "@/components/PrivacyFAQ";
import { ConvoDemo } from "@/components/ConvoDemo";
import { ExampleReplies } from "@/components/ExampleReplies";
import { HowItWorks } from "@/components/HowItWorks";
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
  Brain,
  ArrowDown
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

  const [step, setStep] = useState(0);
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
              Fix Your Reply.<br />
              <span className="text-primary">Keep the Conversation Going.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Paste the chat. Pick a tone. Get 3 replies that sound like you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg" 
                onClick={startAnalysis}
                className="py-6 px-8"
                data-testid="button-start-paste"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Paste Conversation
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={scrollToDemo}
                className="py-6 px-8"
                data-testid="button-see-reply-examples"
              >
                See Reply Examples
                <ArrowDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="pt-4">
              <TrustBar />
            </div>
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

      {step >= 1 && step <= 2 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-bottom">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Button
              onClick={() => {
                if (step < 2) {
                  setStep(step + 1);
                } else {
                  analyzeMutation.mutate();
                }
              }}
              disabled={!canProceed() || analyzeMutation.isPending || (step === 2 && !subscriptionData?.canAnalyze)}
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
