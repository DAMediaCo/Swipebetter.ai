import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { History, ChevronRight, TrendingUp, TrendingDown, Minus, User, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

interface ProfileAnalysis {
  id: number;
  platform: string;
  overallScore: number | null;
  createdAt: string;
}

interface ReplyAnalysis {
  id: number;
  tone: string;
  conversationContext: string | null;
  createdAt: string;
}

interface CombinedAnalysis {
  id: number;
  type: 'profile' | 'reply';
  label: string;
  sublabel: string;
  score?: number | null;
  createdAt: string;
}

export function RecentAudits() {
  const [, setLocation] = useLocation();
  
  const { data: profileAnalyses, isLoading: profileLoading } = useQuery<ProfileAnalysis[]>({
    queryKey: ["/api/analyses/profile"],
  });
  
  const { data: replyAnalyses, isLoading: replyLoading } = useQuery<ReplyAnalysis[]>({
    queryKey: ["/api/analyses/reply"],
  });
  
  const isLoading = profileLoading || replyLoading;
  
  // Combine and sort by date
  const combinedAnalyses: CombinedAnalysis[] = [
    ...(profileAnalyses || []).map(a => ({
      id: a.id,
      type: 'profile' as const,
      label: a.platform,
      sublabel: 'Profile Audit',
      score: a.overallScore,
      createdAt: a.createdAt,
    })),
    ...(replyAnalyses || []).map(a => ({
      id: a.id,
      type: 'reply' as const,
      label: a.tone ? `${a.tone.charAt(0).toUpperCase()}${a.tone.slice(1)} Reply` : 'Reply',
      sublabel: a.conversationContext ? a.conversationContext.slice(0, 40) + (a.conversationContext.length > 40 ? '...' : '') : 'Reply Assistant',
      createdAt: a.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
   .slice(0, 10);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreIcon = (score: number | null, prevScore?: number | null) => {
    if (score === null || prevScore === null || prevScore === undefined) {
      return null;
    }
    if (score > prevScore) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (score < prevScore) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const handleViewAudit = (analysis: CombinedAnalysis) => {
    if (analysis.type === 'profile') {
      setLocation(`/audit/${analysis.id}`);
    } else {
      setLocation(`/audit/reply/${analysis.id}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Recent Audits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (combinedAnalyses.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Recent Audits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-4">
            No audits yet. Run your first analysis above!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Recent Audits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {combinedAnalyses.map((analysis) => (
            <button
              key={`${analysis.type}-${analysis.id}`}
              onClick={() => handleViewAudit(analysis)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate transition-colors text-left group"
              data-testid={`audit-item-${analysis.type}-${analysis.id}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${analysis.type === 'profile' ? 'bg-primary/10' : 'bg-green-500/10'}`}>
                  {analysis.type === 'profile' ? (
                    <User className="w-4 h-4 text-primary" />
                  ) : (
                    <MessageCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{analysis.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(analysis.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {analysis.type === 'profile' && analysis.score !== undefined && (
                  <span className={`text-lg font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score ?? "—"}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
