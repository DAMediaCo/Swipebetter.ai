import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { History, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLocation } from "wouter";

interface ProfileAnalysis {
  id: number;
  platform: string;
  overallScore: number | null;
  createdAt: string;
}

export function RecentAudits() {
  const [, setLocation] = useLocation();
  
  const { data: analyses, isLoading } = useQuery<ProfileAnalysis[]>({
    queryKey: ["/api/analyses/profile"],
  });

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

  const handleViewAudit = (analysisId: number) => {
    setLocation(`/audit/${analysisId}`);
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

  if (!analyses || analyses.length === 0) {
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
            No audits yet. Run your first profile audit above!
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
          {analyses.slice(0, 10).map((analysis, index) => {
            const prevScore = analyses[index + 1]?.overallScore;
            return (
              <button
                key={analysis.id}
                onClick={() => handleViewAudit(analysis.id)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate transition-colors text-left group"
                data-testid={`audit-item-${analysis.id}`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{analysis.platform}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(analysis.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {getScoreIcon(analysis.overallScore, prevScore)}
                    <span className={`text-lg font-bold ${getScoreColor(analysis.overallScore)}`}>
                      {analysis.overallScore ?? "—"}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
