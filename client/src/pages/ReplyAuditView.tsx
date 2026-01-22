import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  MessageCircle, 
  Calendar,
  Clipboard,
  Check
} from "lucide-react";

interface ReplyAnalysis {
  id: number;
  userId: string;
  tone: string;
  conversationContext: string | null;
  suggestedReplies: string[] | null;
  createdAt: string;
}

export default function ReplyAuditView() {
  const [, params] = useRoute("/audit/reply/:id");
  const [, setLocation] = useLocation();
  const { data: authData, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const user = authData?.user;
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const analysisId = params?.id;

  useEffect(() => {
    document.title = "Reply Results | SwipeBetter";
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/auth');
    }
  }, [authLoading, user, setLocation]);

  const { data: analysis, isLoading, error } = useQuery<ReplyAnalysis>({
    queryKey: ['/api/analyses/reply', analysisId],
    enabled: !!analysisId && !!user,
  });

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast({
      description: "Reply copied to clipboard",
    });
    setTimeout(() => setCopiedIndex(null), 2000);
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
          <h1 className="text-2xl font-bold mb-4">Reply Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This reply analysis may have been deleted or you don't have access to it.
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
            <h1 className="text-xl font-bold">Reply Suggestions</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {formatDate(analysis.createdAt)}
            </div>
          </div>
        </div>

        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="capitalize">{analysis.tone}</Badge>
            </div>
          </CardContent>
        </Card>

        {analysis.conversationContext && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Conversation Context</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90">{analysis.conversationContext}</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Suggested Replies</h3>
          {analysis.suggestedReplies?.map((reply, index) => (
            <Card 
              key={index} 
              className="hover-elevate cursor-pointer"
              onClick={() => copyToClipboard(reply, index)}
            >
              <CardContent className="py-4 flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-foreground/90 leading-relaxed">{reply}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(reply, index);
                  }}
                  data-testid={`button-copy-reply-${index}`}
                >
                  {copiedIndex === index ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Clipboard className="w-4 h-4" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Link href="/dashboard?tab=reply">
            <Button variant="outline" className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Generate New Reply
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
