import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadAnalysis } from "@/lib/analysisStorage";
import { trackPreviewViewed, trackEvent } from "@/lib/analytics";
import { useEntitlement, useCustomerPortal, useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { 
  Clipboard, 
  Check,
  TrendingUp,
  Sparkles,
  Lock,
  Settings,
  Unlock,
  Clock,
  Camera,
  FileText,
  MessageCircle,
  Share2
} from "lucide-react";

interface ProfileAnalysisData {
  overallScore: number;
  bioSuggestions: string | string[];
  photoFeedback: string | string[];
  improvements: string | string[];
  firstTip?: string;
}

// Helper function to extract the first improvement tip
function getFirstTip(improvements: string | string[]): string {
  // Check if improvements is empty or is the old placeholder text
  if (!improvements) return "";
  
  const isPlaceholder = (text: string): boolean => {
    return text.includes("[Upgrade to unlock") || 
           text.includes("upgrade to unlock") ||
           text.includes("Upgrade to see");
  };
  
  if (Array.isArray(improvements) && improvements.length > 0) {
    const first = improvements[0];
    if (!isPlaceholder(first)) return first;
    return "";
  }
  
  if (typeof improvements === 'string') {
    if (isPlaceholder(improvements)) return "";
    
    const lines = improvements.split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (isPlaceholder(line)) continue;
      const match = line.match(/^\d+\.\s*(.+)/);
      if (match) return match[1];
      if (line.trim()) return line.trim();
    }
  }
  return "";
}

// Color-coded score breakdown with progress bar
function ScoreBreakdown({ 
  label, 
  icon, 
  score 
}: { 
  label: string; 
  icon: React.ReactNode; 
  score: number;
}) {
  // Color coding: red <50, orange 50-75, green 75+
  const getScoreColor = (s: number): string => {
    if (s < 50) return "text-red-500";
    if (s < 75) return "text-orange-500";
    return "text-green-500";
  };
  
  const getProgressColor = (s: number): string => {
    if (s < 50) return "[&>div]:bg-red-500";
    if (s < 75) return "[&>div]:bg-orange-500";
    return "[&>div]:bg-green-500";
  };

  return (
    <div className="flex items-center gap-3">
      <div className="text-foreground/70">{icon}</div>
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-foreground/90">{label}</span>
          <span className={getScoreColor(score)}>{score}/100</span>
        </div>
        <Progress value={score} className={`h-2 ${getProgressColor(score)}`} />
      </div>
    </div>
  );
}

// Blurred section with overlay unlock button
function BlurredSection({ 
  title, 
  content,
  isLoggedIn
}: { 
  title: string; 
  content: string | string[];
  isLoggedIn: boolean;
}) {
  const getContentLines = (): string[] => {
    if (!content) return [];
    if (Array.isArray(content)) {
      return content.slice(0, 4);
    }
    if (typeof content === 'string') {
      return content.split('\n').filter(line => line.trim()).slice(0, 4);
    }
    return [];
  };

  const lines = getContentLines();
  
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="blur-[5px] select-none pointer-events-none space-y-2 min-h-[80px]">
          {lines.length > 0 ? (
            lines.map((line, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                {line.substring(0, 100)}
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
        <div className="absolute inset-0 flex items-center justify-center bg-background/30">
          <Link href={isLoggedIn ? "/fix-profile/upgrade" : "/auth"}>
            <Button variant="secondary" size="sm" data-testid={`button-unlock-${title.toLowerCase().replace(/ /g, "-")}`}>
              <Unlock className="w-4 h-4 mr-2" />
              Unlock to Reveal
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
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

  const [shareClicked, setShareClicked] = useState(false);
  const shareResult = async () => {
    const score = result?.overallScore || 0;
    const shareText = `I got my dating profile analyzed by AI! Score: ${score}/100. Get your free profile audit: https://swipebetter.ai`;
    await navigator.clipboard.writeText(shareText);
    setShareClicked(true);
    toast({
      description: "Copied! Share it with your friends.",
    });
    setTimeout(() => setShareClicked(false), 2000);
  };

  const parseBioSuggestions = (content: string | string[] | undefined): string[] => {
    if (!content) return [];
    
    // Helper to clean a single bio text
    const cleanBioText = (text: string): string => {
      let cleaned = text.trim();
      // Remove "**Alternative X**" or "**Option X**" patterns
      cleaned = cleaned.replace(/^\*\*\s*(Alternative|Option)\s*\d+\s*\*\*[:\s]*/i, '');
      // Remove "Alternative X:" or "Option X:" without markdown
      cleaned = cleaned.replace(/^(Alternative|Option)\s*\d+[:\s]*/i, '');
      // Remove any remaining ** markdown
      cleaned = cleaned.replace(/\*\*/g, '');
      // Remove surrounding quotes (single or double)
      cleaned = cleaned.replace(/^['"""']+/, '').replace(/['"""']+$/, '');
      return cleaned.trim();
    };
    
    if (Array.isArray(content)) {
      return content
        .filter(item => typeof item === 'string' && item.trim())
        .map(cleanBioText)
        .filter(item => item.length > 0);
    }
    
    if (typeof content !== 'string') {
      return [];
    }
    
    const lines = content.split('\n').filter(line => line.trim());
    const bios: string[] = [];
    let currentBio = '';
    
    for (const line of lines) {
      // Check for numbered items or "Alternative X" headers
      const numberedMatch = line.match(/^\d+\.\s*(.+)/);
      const altMatch = line.match(/^\*?\*?\s*(Alternative|Option)\s*\d+\s*\*?\*?[:\s]*(.*)/i);
      
      if (altMatch) {
        if (currentBio) {
          bios.push(cleanBioText(currentBio));
        }
        currentBio = altMatch[2] || '';
      } else if (numberedMatch) {
        if (currentBio) {
          bios.push(cleanBioText(currentBio));
        }
        currentBio = numberedMatch[1];
      } else if (currentBio || bios.length === 0) {
        currentBio += ' ' + line.trim();
      }
    }
    
    if (currentBio) {
      bios.push(cleanBioText(currentBio));
    }
    
    if (bios.length === 0 && content.trim()) {
      bios.push(cleanBioText(content));
    }
    
    return bios.filter(bio => bio.length > 0);
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
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-orange-500 mb-1">
                  {result.overallScore}
                </div>
                <p className="text-muted-foreground text-sm">out of 100</p>
                <p className="text-sm font-medium mt-2">
                  Top {Math.max(5, 100 - result.overallScore)}% of Profiles
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shareResult}
                  className="mt-3"
                  data-testid="button-share-result"
                >
                  {shareClicked ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-1.5" />
                      Share Result
                    </>
                  )}
                </Button>
              </div>
              
              <div className="space-y-3">
                <ScoreBreakdown 
                  label="Photos" 
                  icon={<Camera className="w-4 h-4" />}
                  score={Math.min(100, Math.max(20, result.overallScore + 8))} 
                />
                <ScoreBreakdown 
                  label="Bio" 
                  icon={<FileText className="w-4 h-4" />}
                  score={Math.min(100, Math.max(20, result.overallScore - 5))} 
                />
                <ScoreBreakdown 
                  label="Conversation Starters" 
                  icon={<MessageCircle className="w-4 h-4" />}
                  score={Math.min(100, Math.max(20, result.overallScore - 3))} 
                />
              </div>

            </CardContent>
          </Card>

          {!isPro && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Your #1 Issue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20" data-testid="text-first-tip">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="text-sm leading-relaxed">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      }}
                    >
                      {result.firstTip || getFirstTip(result.improvements) || "Run a new analysis to see your personalized improvement tip"}
                    </ReactMarkdown>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Unlock your report to see all recommendations
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-6 text-center">
                  <Link href={isLoggedIn ? "/fix-profile/upgrade" : "/auth"}>
                    <Button 
                      size="lg" 
                      className="w-full text-lg py-6" 
                      data-testid="button-unlock-main"
                      onClick={() => trackEvent('click_unlock_main')}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      {isLoggedIn ? "Unlock Full Report" : "Sign up free to unlock"}
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-3">
                    See bio rewrites, photo feedback & actionable tips
                  </p>
                </CardContent>
              </Card>

              <BlurredSection 
                title="Bio Suggestions" 
                content={result.bioSuggestions}
                isLoggedIn={isLoggedIn}
              />
              
              <BlurredSection 
                title="Photo Feedback" 
                content={result.photoFeedback}
                isLoggedIn={isLoggedIn}
              />
              
              <BlurredSection 
                title="More Improvements" 
                content={result.improvements}
                isLoggedIn={isLoggedIn}
              />
            </>
          )}

          {isPro && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bio Options</h3>
                {parseBioSuggestions(result.bioSuggestions).map((bio, index) => (
                  <Card 
                    key={index} 
                    className="hover-elevate cursor-pointer"
                    onClick={() => copyBio(bio, index)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-primary">Option {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyBio(bio, index);
                          }}
                          data-testid={`button-copy-bio-${index}`}
                        >
                          {copiedBioIndex === index ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <Clipboard className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-foreground/90 leading-relaxed">{bio}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

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
          )}

          <div className="flex gap-3 pt-4">
            <Link href="/fix-profile" className="flex-1">
              <Button
                variant="outline"
                className="w-full"
                data-testid="button-analyze-another"
                onClick={() => trackEvent('click_analyze_new')}
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
        <div className="text-foreground/90 leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-p:text-foreground/90 prose-ul:my-2 prose-li:my-0 prose-li:text-foreground/90 prose-strong:text-foreground">
          <ReactMarkdown>{contentString}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}

