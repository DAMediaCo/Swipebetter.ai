import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSubscription } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { saveAnalysis } from "@/lib/analysisStorage";
import { trackAnalysisStarted } from "@/lib/analytics";
import { Link, useLocation } from "wouter";
import { 
  Sparkles, 
  Heart,
  Flame,
  Smile,
  Loader2,
  Shield,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

const heroTones = [
  { id: "witty", label: "Witty", icon: Sparkles },
  { id: "flirty", label: "Flirty", icon: Heart },
  { id: "direct", label: "Direct", icon: Flame },
];

export function ReplyAssistant() {
  const { data: subscriptionData } = useSubscription();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [conversationText, setConversationText] = useState("");
  const [heroTone, setHeroTone] = useState("witty");

  const heroAnalyzeMutation = useMutation({
    mutationFn: async () => {
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

  return (
    <div className="space-y-6">
      {!subscriptionData?.canAnalyze && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-4 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-sm">Pro subscription required</p>
              <p className="text-xs text-muted-foreground">Subscribe to access AI-powered replies</p>
            </div>
            <Link href="/pricing">
              <Button size="sm" data-testid="button-upgrade-banner-reply">Subscribe</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Paste the conversation</label>
          <Textarea
            value={conversationText}
            onChange={(e) => setConversationText(e.target.value)}
            placeholder="Paste your match's message here... (e.g. 'What's your favorite travel spot?')"
            className="h-48 bg-white dark:bg-slate-900 rounded-2xl border border-border/50 p-4 text-base resize-none"
            data-testid="textarea-conversation"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Choose your tone</label>
          <div className="flex flex-wrap gap-3">
            {heroTones.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setHeroTone(t.id)}
                  className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all flex items-center gap-1.5 ${
                    heroTone === t.id
                      ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-800 text-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                  data-testid={`button-hero-tone-${t.id}`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
        
        <Button 
          size="lg" 
          onClick={handleHeroSubmit}
          disabled={heroAnalyzeMutation.isPending || !conversationText.trim() || !subscriptionData?.canAnalyze}
          className="w-full py-6 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold shadow-lg hover:shadow-xl transition-shadow border-0 disabled:opacity-50"
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
      
      <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl p-4 backdrop-blur-sm flex flex-wrap items-center justify-center gap-4">
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
  );
}
