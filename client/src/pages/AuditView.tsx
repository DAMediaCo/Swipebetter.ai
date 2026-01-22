import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth, useSubscription } from "@/lib/auth";
import { 
  ArrowLeft, 
  Camera, 
  FileText, 
  Sparkles, 
  Lock,
  Calendar
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
  const { data: subscriptionData } = useSubscription();
  const user = authData?.user;
  
  const analysisId = params?.id;

  useEffect(() => {
    document.title = "Audit Results | SwipeBetter";
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/auth');
    }
  }, [authLoading, user, setLocation]);

  const { data: analysis, isLoading, error } = useQuery<ProfileAnalysis>({
    queryKey: [`/api/analyses/profile/${analysisId}`],
    enabled: !!analysisId && !!user,
  });

  const isPro = subscriptionData?.isPaidUser || false;

  const isLocked = (content: string | null) => {
    return content === "[Upgrade to unlock]";
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
                <Link href="/pricing">
                  <Button data-testid="button-unlock-bio">
                    <Lock className="w-4 h-4 mr-2" />
                    Unlock Full Report
                  </Button>
                </Link>
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
                <Link href="/pricing">
                  <Button data-testid="button-unlock-photos">
                    <Lock className="w-4 h-4 mr-2" />
                    Unlock Full Report
                  </Button>
                </Link>
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
                <Link href="/pricing">
                  <Button data-testid="button-unlock-improvements">
                    <Lock className="w-4 h-4 mr-2" />
                    Unlock Full Report
                  </Button>
                </Link>
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

        {!isPro && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">
              Upgrade to unlock the full detailed report
            </p>
            <Link href="/pricing">
              <Button size="lg" data-testid="button-upgrade">
                Upgrade Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
