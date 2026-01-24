import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { 
  ArrowLeft, 
  Camera, 
  FileText, 
  Sparkles, 
  Calendar,
  TrendingUp
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// Helper to clean text from various formats
const cleanText = (text: string): string => {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^\*\*\s*(Alternative|Option)\s*\d+\s*\*\*[:\s]*/i, '');
  cleaned = cleaned.replace(/^(Alternative|Option)\s*\d+[:\s]*/i, '');
  cleaned = cleaned.replace(/^\d+[\.\)]\s*/, '');
  cleaned = cleaned.replace(/\*\*/g, '');
  cleaned = cleaned.replace(/^['"""']+/, '').replace(/['"""']+$/, '');
  cleaned = cleaned.replace(/^\{|\}$/g, '');
  return cleaned.trim();
};

// Try to parse JSON if content looks like JSON
const tryParseJson = (content: string): string[] | null => {
  const trimmed = content.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(item => typeof item === 'string' ? item : JSON.stringify(item));
      }
      if (typeof parsed === 'object' && parsed !== null) {
        return Object.values(parsed).map(item => typeof item === 'string' ? item : JSON.stringify(item));
      }
    } catch {
      // Not valid JSON
    }
  }
  return null;
};

// Parse content into array for list display
const parseContentToList = (content: string | null): string[] => {
  if (!content) return [];
  
  // Strip markdown code block markers
  let cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  
  // Remove leading/trailing braces if it looks like a malformed object
  if (cleaned.startsWith('{') && !cleaned.startsWith('{"') && !cleaned.startsWith('{ "')) {
    cleaned = cleaned.replace(/^\{|\}$/g, '');
  }
  
  const jsonParsed = tryParseJson(cleaned);
  if (jsonParsed && jsonParsed.length > 0) {
    return jsonParsed.map(cleanText).filter(item => item.length > 0);
  }
  
  // Try parsing as object with numeric keys
  try {
    const obj = JSON.parse(cleaned);
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      const values = Object.values(obj).filter(v => typeof v === 'string') as string[];
      if (values.length > 0) {
        return values.map(cleanText).filter(item => item.length > 0);
      }
    }
  } catch {
    // Continue with text parsing
  }
  
  const lines = cleaned.split('\n').filter(line => line.trim());
  const items: string[] = [];
  
  for (const line of lines) {
    // Split by commas if line contains multiple quoted items
    if (line.includes('",') || line.includes('", ')) {
      const parts = line.split(/",\s*"/).map(s => s.replace(/^["'\s]+|["'\s]+$/g, ''));
      for (const part of parts) {
        const cleanedPart = cleanText(part);
        if (cleanedPart.length > 0) {
          items.push(cleanedPart);
        }
      }
    } else {
      const cleanedLine = cleanText(line);
      if (cleanedLine.length > 0) {
        items.push(cleanedLine);
      }
    }
  }
  
  return items;
};

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
    queryKey: ['/api/analyses/profile', analysisId],
    enabled: !!analysisId && !!user,
  });

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

        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Bio Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid="text-bio-suggestions" className="space-y-4">
              {parseContentToList(analysis.bioSuggestions).length > 0 ? (
                parseContentToList(analysis.bioSuggestions).map((bio, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <span className="text-xs font-medium text-primary mb-1 block">Option {index + 1}</span>
                    <p className="text-foreground/90 leading-relaxed text-sm">{bio}</p>
                  </div>
                ))
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{analysis.bioSuggestions || "No suggestions available."}</ReactMarkdown>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Photo Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm dark:prose-invert max-w-none prose-strong:text-foreground prose-strong:font-semibold prose-p:text-foreground/90 prose-li:text-foreground/90 prose-headings:text-foreground" 
              data-testid="text-photo-feedback"
            >
              <ReactMarkdown>{analysis.photoFeedback || "No feedback available."}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid="text-improvements">
              {parseContentToList(analysis.improvements).length > 0 ? (
                <ul className="space-y-3">
                  {parseContentToList(analysis.improvements).map((improvement, index) => (
                    <li key={index} className="flex gap-3 text-foreground/90 leading-relaxed text-sm">
                      <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{analysis.improvements || "No improvements available."}</ReactMarkdown>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
