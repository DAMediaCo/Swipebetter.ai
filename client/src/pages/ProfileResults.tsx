import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadAnalysis } from "@/lib/analysisStorage";
import { trackPreviewViewed } from "@/lib/analytics";
import { useEntitlement, useCustomerPortal, useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Clipboard, 
  Check,
  TrendingUp,
  Sparkles,
  Lock,
  Settings,
  Unlock
} from "lucide-react";

interface ProfileAnalysisData {
  overallScore: number;
  bioSuggestions: string | string[];
  photoFeedback: string | string[];
  improvements: string | string[];
}

export default function ProfileResults() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<ProfileAnalysisData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedBioIndex, setCopiedBioIndex] = useState<number | null>(null);
  const { data: authData } = useAuth();
  const { isPro, proActive, planType, isLoading: entitlementLoading, refreshEntitlement } = useEntitlement();
  const customerPortal = useCustomerPortal();
  const { toast } = useToast();
  
  const isLoggedIn = !!authData?.user;

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

  const copyToClipboard = async (text: string | string[], field: string) => {
    if (!isPro) return;
    const textString = Array.isArray(text) ? text.join('\n\n') : String(text || '');
    await navigator.clipboard.writeText(textString);
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
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold">Your Profile Score is Ready</h1>
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
              Free Preview
            </Badge>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-bold text-orange-500 mb-2">
                {result.overallScore}
              </div>
              <p className="text-muted-foreground">Overall Profile Score</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span className="text-sm">Room for improvement!</span>
              </div>
            </CardContent>
          </Card>


          {isPro ? (
            <>
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
                        className="flex-shrink-0"
                        data-testid={`button-copy-bio-${index}`}
                      >
                        {copiedBioIndex === index ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Clipboard className="w-4 h-4" />
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
              />

              <ResultCard
                title="Top Improvements"
                content={result.improvements}
                onCopy={() => copyToClipboard(result.improvements, "improvements")}
                copied={copiedField === "improvements"}
              />
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Key Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FirstImprovementCard improvements={result.improvements} />
                </CardContent>
              </Card>

              <div className="relative">
                <div className="space-y-6 locked-content">
                  <LockedCard 
                    title="Bio Suggestions" 
                    teaser="3 custom bio rewrites ready for you"
                    realContent={result.bioSuggestions}
                  />
                  <LockedCard 
                    title="Photo Feedback" 
                    teaser="Specific feedback on each of your photos"
                    realContent={result.photoFeedback}
                  />
                  <LockedCard 
                    title="More Improvements" 
                    teaser="Prioritized list of changes to make"
                    realContent={result.improvements}
                    skipFirst={true}
                  />
                </div>

                <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px] rounded-lg">
                  <div className="text-center px-6 py-8 max-w-sm">
                    <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {isLoggedIn ? "Unlock Your Full Report" : "See Your Full Report"}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Get personalized bio rewrites, photo tips, and a complete improvement plan.
                    </p>
                    <Link href={isLoggedIn ? "/fix-profile/upgrade" : "/auth"}>
                      <Button size="lg" className="w-full" data-testid="button-unlock-full-report">
                        <Sparkles className="w-5 h-5 mr-2" />
                        {isLoggedIn ? "Unlock Full Report" : "Sign up free to see full report"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
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
                  {isPro ? 'Upgrade' : 'Unlock Full Report'}
                </Button>
              </Link>
            )}
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
}: {
  title: string;
  content: string | string[];
  onCopy: () => void;
  copied: boolean;
}) {
  const contentString = Array.isArray(content) 
    ? content.join('\n\n') 
    : (typeof content === 'string' ? content : String(content || ''));
  
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCopy}
          data-testid={`button-copy-${title.toLowerCase().replace(/ /g, "-")}`}
        >
          {copied ? (
            <Check className="w-4 h-4 text-primary" />
          ) : (
            <Clipboard className="w-4 h-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0">
          <ReactMarkdown>{contentString}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}

function FirstImprovementCard({ improvements }: { improvements: string | string[] }) {
  const getFirstImprovement = (): string => {
    if (Array.isArray(improvements) && improvements.length > 0) {
      return improvements[0];
    }
    if (typeof improvements === 'string') {
      const lines = improvements.split('\n').filter(line => line.trim());
      for (const line of lines) {
        const match = line.match(/^\d+\.\s*(.+)/);
        if (match) return match[1];
        if (line.trim()) return line.trim();
      }
    }
    return "Your profile has room for improvement - unlock full report for details.";
  };

  return (
    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
      <p className="text-sm leading-relaxed">{getFirstImprovement()}</p>
    </div>
  );
}

function LockedCard({ 
  title, 
  teaser,
  realContent,
  skipFirst = false 
}: { 
  title: string; 
  teaser: string;
  realContent?: string | string[];
  skipFirst?: boolean;
}) {
  const getBlurredLines = (): string[] => {
    if (!realContent) return [];
    
    let items: string[] = [];
    if (Array.isArray(realContent)) {
      items = realContent;
    } else if (typeof realContent === 'string') {
      items = realContent.split('\n').filter(line => line.trim());
    }
    
    if (skipFirst && items.length > 0) {
      items = items.slice(1);
    }
    
    return items.slice(0, 4);
  };

  const blurredLines = getBlurredLines();
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <Lock className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="blur-[6px] select-none pointer-events-none space-y-2">
          {blurredLines.length > 0 ? (
            blurredLines.map((line, i) => (
              <p key={i} className="text-sm text-muted-foreground truncate">
                {line.substring(0, 80)}...
              </p>
            ))
          ) : (
            <>
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-4/5" />
              <div className="h-4 bg-muted rounded w-3/5" />
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">{teaser}</p>
      </CardContent>
    </Card>
  );
}
