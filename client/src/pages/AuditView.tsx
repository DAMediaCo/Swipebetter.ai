import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth, useCredits, useUnlockReport } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Camera, 
  FileText, 
  Sparkles, 
  Lock,
  Calendar,
  Unlock,
  Loader2
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ProfileAnalysis {
  id: number;
  userId: string;
  platform: string;
  gender?: string;
  intent?: string;
  overallScore: number | null;
  bioSuggestions: string | null;
  photoFeedback: string | null;
  improvements: string | null;
  createdAt: string;
}

export default function AuditView() {
  const [, params] = useRoute("/audit/:id");
  const [, setLocation] = useLocation();
  const { data: authData, isLoading: authLoading } = useAuth();
  const { planTier, credits, hasUnlimitedAccess, reportsUnlocked, refreshCredits } = useCredits();
  const unlockMutation = useUnlockReport();
  const { toast } = useToast();
  const user = authData?.user;
  const [isUnlocking, setIsUnlocking] = useState(false);
  
  const analysisId = params?.id;
  const reportId = analysisId ? String(analysisId) : '';
  const isReportUnlocked = reportsUnlocked.includes(reportId);

  useEffect(() => {
    document.title = "Audit Results | SwipeBetter";
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/auth');
    }
  }, [authLoading, user, setLocation]);

  const { data: analysis, isLoading, error, refetch: refetchAnalysis } = useQuery<ProfileAnalysis>({
    queryKey: ['/api/analyses/profile', analysisId],
    enabled: !!analysisId && !!user,
  });

  const canAccessFullReport = hasUnlimitedAccess || isReportUnlocked;

  const isLocked = (content: string | null) => {
    return content === "[Upgrade to unlock]";
  };

  const handleUnlock = async () => {
    if (!reportId) return;
    
    setIsUnlocking(true);
    try {
      const result = await unlockMutation.mutateAsync(reportId);
      if (result.access === 'granted') {
        toast({
          title: "Report unlocked",
          description: result.reason === 'credit_used' 
            ? `1 credit used. ${result.creditsRemaining} remaining.`
            : "You have full access to this report.",
        });
        await refreshCredits();
        await queryClient.invalidateQueries({ queryKey: ['/api/analyses/profile', analysisId] });
        await refetchAnalysis();
      }
    } catch (error: any) {
      if (error.message?.includes("402")) {
        setLocation('/pricing');
      } else {
        toast({
          title: "Failed to unlock",
          description: "Please try again or contact support.",
          variant: "destructive",
        });
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  const getUnlockButtonContent = () => {
    if (isUnlocking) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Unlocking...
        </>
      );
    }
    if (credits > 0) {
      return (
        <>
          <Unlock className="w-4 h-4 mr-2" />
          Use 1 Credit to Unlock
        </>
      );
    }
    return (
      <>
        <Lock className="w-4 h-4 mr-2" />
        Get Credits to Unlock
      </>
    );
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-48 w-full mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Audit Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This audit may have been deleted or you don't have access to it.
          </p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Audit Results</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {formatDate(analysis.createdAt)}
            </div>
          </div>
        </div>

        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline">{analysis.platform}</Badge>
              <div className="text-right">
                <span className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore ?? "—"}
                </span>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLocked(analysis.bioSuggestions) ? (
          <Card className="mb-4 relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Bio Suggestions
                <Lock className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="blur-sm select-none">
                <p>Your bio needs some work. Here are 5 suggestions to make it more engaging and authentic...</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-card/80">
                {credits > 0 ? (
                  <Button 
                    onClick={handleUnlock} 
                    disabled={isUnlocking}
                    data-testid="button-unlock-bio"
                  >
                    {getUnlockButtonContent()}
                  </Button>
                ) : (
                  <Link href="/pricing">
                    <Button data-testid="button-unlock-bio">
                      {getUnlockButtonContent()}
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Bio Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none" data-testid="text-bio-suggestions">
                <ReactMarkdown>{analysis.bioSuggestions || "No suggestions available."}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        {isLocked(analysis.photoFeedback) ? (
          <Card className="mb-4 relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Photo Feedback
                <Lock className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="blur-sm select-none">
                <p>Your photos could use some improvements. The lighting in your first photo is good but...</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-card/80">
                {credits > 0 ? (
                  <Button 
                    onClick={handleUnlock} 
                    disabled={isUnlocking}
                    data-testid="button-unlock-photos"
                  >
                    {getUnlockButtonContent()}
                  </Button>
                ) : (
                  <Link href="/pricing">
                    <Button data-testid="button-unlock-photos">
                      {getUnlockButtonContent()}
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Photo Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none" data-testid="text-photo-feedback">
                <ReactMarkdown>{analysis.photoFeedback || "No feedback available."}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        {isLocked(analysis.improvements) ? (
          <Card className="mb-4 relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Improvements
                <Lock className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="blur-sm select-none">
                <p>1. Add more variety to your photos...</p>
                <p>2. Update your bio to be more specific...</p>
                <p>3. Consider adding prompts that show personality...</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-card/80">
                {credits > 0 ? (
                  <Button 
                    onClick={handleUnlock} 
                    disabled={isUnlocking}
                    data-testid="button-unlock-improvements"
                  >
                    {getUnlockButtonContent()}
                  </Button>
                ) : (
                  <Link href="/pricing">
                    <Button data-testid="button-unlock-improvements">
                      {getUnlockButtonContent()}
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Improvements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none" data-testid="text-improvements">
                <ReactMarkdown>{analysis.improvements || "No improvements available."}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        {!canAccessFullReport && isLocked(analysis.bioSuggestions) && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-2">
              {credits > 0 
                ? `You have ${credits} credit${credits > 1 ? 's' : ''} available`
                : "Get credits to unlock full reports"
              }
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {planTier === 'free' && "Start with 1 credit for $3 or go unlimited"}
              {planTier === 'starter' && credits > 0 && "Use your credit above to unlock this report"}
              {planTier === 'starter' && credits === 0 && "Get more credits or upgrade to unlimited"}
            </p>
            {credits === 0 && (
              <Link href="/pricing">
                <Button size="lg" data-testid="button-upgrade">
                  View Pricing
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
