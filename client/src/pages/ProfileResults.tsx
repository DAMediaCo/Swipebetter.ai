import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadAnalysis } from "@/lib/analysisStorage";
import { trackPreviewViewed } from "@/lib/analytics";
import { useEntitlement, useCustomerPortal } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
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
  const [copiedBioIndex, setCopiedBioIndex] = useState<number | null>(null);
  const { isPro, proActive, planType, isLoading: entitlementLoading, refreshEntitlement } = useEntitlement();
  const customerPortal = useCustomerPortal();
  const { toast } = useToast();

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

  const copyBio = async (bioText: string, index: number) => {
    if (!isPro) return;
    await navigator.clipboard.writeText(bioText);
    setCopiedBioIndex(index);
    toast({
      description: "Bio copied. Paste into your dating app.",
    });
    setTimeout(() => setCopiedBioIndex(null), 2000);
  };

  const parseBioSuggestions = (content: string | string[] | undefined): string[] => {
    if (!content) return [];
    
    if (Array.isArray(content)) {
      return content.filter(item => typeof item === 'string' && item.trim());
    }
    
    if (typeof content !== 'string') {
      return [];
    }
    
    const lines = content.split('\n').filter(line => line.trim());
    const bios: string[] = [];
    let currentBio = '';
    
    for (const line of lines) {
      const numberedMatch = line.match(/^\d+\.\s*(.+)/);
      if (numberedMatch) {
        if (currentBio) {
          bios.push(currentBio.trim());
        }
        currentBio = numberedMatch[1];
      } else if (currentBio) {
        currentBio += ' ' + line.trim();
      }
    }
    
    if (currentBio) {
      bios.push(currentBio.trim());
    }
    
    if (bios.length === 0 && content.trim()) {
      bios.push(content.trim());
    }
    
    return bios;
  };

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-2">
          <Link href="/fix-profile">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Your Results</h1>
          <div className="w-9" />
        </div>

        <div className="flex justify-center mb-6">
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Bio Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {parseBioSuggestions(result.bioSuggestions).map((bio, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 rounded-md bg-muted/50"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed text-muted-foreground">{bio}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyBio(bio, index)}
                    disabled={!isPro}
                    className="flex-shrink-0"
                    data-testid={`button-copy-bio-${index}`}
                  >
                    {copiedBioIndex === index ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : isPro ? (
                      <Clipboard className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

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
        <div className="text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
