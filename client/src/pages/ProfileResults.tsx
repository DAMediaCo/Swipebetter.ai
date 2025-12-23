import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StepIndicator } from "@/components/StepIndicator";
import { loadAnalysis } from "@/lib/analysisStorage";
import { trackPreviewViewed } from "@/lib/analytics";
import { useEntitlement, useCustomerPortal } from "@/lib/auth";
import { 
  ArrowLeft, 
  Clipboard, 
  Check,
  TrendingUp,
  Sparkles,
  Lock,
  Settings
} from "lucide-react";

interface ProfileAnalysisData {
  overallScore: number;
  bioSuggestions: string;
  photoFeedback: string;
  improvements: string;
}

export default function ProfileResults() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<ProfileAnalysisData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { isPro, proActive, planType, isLoading: entitlementLoading, refreshEntitlement } = useEntitlement();
  const customerPortal = useCustomerPortal();

  useEffect(() => {
    const data = loadAnalysis<ProfileAnalysisData>('profile');
    if (!data) {
      setLocation('/fix-profile');
      return;
    }
    setResult(data);
    trackPreviewViewed("profile");
  }, [setLocation]);

  useEffect(() => {
    if (!entitlementLoading && !isPro) {
      refreshEntitlement();
    }
  }, [entitlementLoading]);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const copyToClipboard = async (text: string, field: string) => {
    if (!isPro) return;
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/fix-profile">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="w-9" />
        </div>

        <StepIndicator 
          steps={["Upload", "Results", "Upgrade"]} 
          currentStep={2} 
        />

        <div className="flex justify-center mb-4">
          {isPro ? (
            <Badge variant="default" className="bg-primary/10 text-primary border-primary/20" data-testid="badge-full-access">
              <Check className="w-3 h-3 mr-1" />
              {planType === 'starter' ? 'Starter Fix' : planType === 'annual' ? 'Annual Member' : planType === 'monthly' ? 'Monthly Member' : 'Full Results Unlocked'}
            </Badge>
          ) : (
            <Badge variant="secondary" data-testid="badge-preview">
              <Lock className="w-3 h-3 mr-1" />
              Preview Mode
            </Badge>
          )}
        </div>

        {!isPro && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground">
                Upgrade to unlock full bio rewrites, photo order, and copy buttons.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                {result.overallScore}
              </div>
              <p className="text-muted-foreground">Overall Profile Score</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm">Room for improvement!</span>
              </div>
            </CardContent>
          </Card>

          <ResultCard
            title="Bio Suggestions"
            content={result.bioSuggestions}
            onCopy={() => copyToClipboard(result.bioSuggestions, "bio")}
            copied={copiedField === "bio"}
            canCopy={isPro}
          />

          <ResultCard
            title="Photo Feedback"
            content={result.photoFeedback}
            onCopy={() => copyToClipboard(result.photoFeedback, "photo")}
            copied={copiedField === "photo"}
            canCopy={isPro}
          />

          <ResultCard
            title="Top Improvements"
            content={result.improvements}
            onCopy={() => copyToClipboard(result.improvements, "improvements")}
            copied={copiedField === "improvements"}
            canCopy={isPro}
          />

          <div className="space-y-3">
            {!isPro && (
              <p className="text-sm text-muted-foreground text-center">
                Unlock the full report in seconds.
              </p>
            )}
            <div className="flex gap-3">
              <Link href="/fix-profile" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full"
                  data-testid="button-analyze-another"
                >
                  Analyze Another Profile
                </Button>
              </Link>
              {isPro && proActive ? (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => customerPortal.mutate()}
                  disabled={customerPortal.isPending}
                  data-testid="button-manage-subscription"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Subscription
                </Button>
              ) : (
                <Link href="/fix-profile/upgrade" className="flex-1">
                  <Button
                    className="w-full"
                    data-testid="button-upgrade"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({
  title,
  content,
  onCopy,
  copied,
  canCopy,
}: {
  title: string;
  content: string;
  onCopy: () => void;
  copied: boolean;
  canCopy: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCopy}
          disabled={!canCopy}
          data-testid={`button-copy-${title.toLowerCase().replace(/ /g, "-")}`}
        >
          {copied ? (
            <Check className="w-4 h-4 text-primary" />
          ) : canCopy ? (
            <Clipboard className="w-4 h-4" />
          ) : (
            <Lock className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
      </CardContent>
    </Card>
  );
}
