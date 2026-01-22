import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StepIndicator } from "@/components/StepIndicator";
import { ArrowLeft, Sparkles, Check, Crown } from "lucide-react";
import { loadAnalysis } from "@/lib/analysisStorage";
import { trackPaywallViewed } from "@/lib/analytics";

export default function ReplyUpgrade() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const analysis = loadAnalysis('reply');
    if (!analysis) {
      setLocation('/fix-reply');
      return;
    }

    trackPaywallViewed("reply");

    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, [setLocation]);

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/fix-reply">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="w-9" />
        </div>

        <StepIndicator 
          steps={["Paste", "Results", "Upgrade"]} 
          currentStep={3} 
        />

        <Card className="mb-6">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Unlock Pro Features</h1>
            <p className="text-muted-foreground">
              Get unlimited reply suggestions and never run out of conversation starters.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="py-6 space-y-4">
            <h2 className="font-semibold text-lg">Pro Benefits</h2>
            <ul className="space-y-3">
              {[
                "Unlimited reply suggestions",
                "Unlimited profile analyses",
                "Multiple tone options",
                "Priority AI processing",
                "First message generator",
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href="/fix-reply/results" className="flex-1">
            <Button
              variant="outline"
              className="w-full"
              data-testid="button-back-to-results"
            >
              Back to Results
            </Button>
          </Link>
          <Link href="/pricing?returnTo=/fix-reply/results" className="flex-1">
            <Button
              className="w-full"
              data-testid="button-unlock-now"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Unlock Full Results
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
