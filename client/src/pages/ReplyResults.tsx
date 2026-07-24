import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadAnalysis } from "@/lib/analysisStorage";
import { trackPreviewViewed } from "@/lib/analytics";
import { copyTextToClipboard } from "@/lib/clipboard";
import { 
  Clipboard, 
  Check,
  Sparkles
} from "lucide-react";

interface ReplyAnalysisData {
  conversationContext: string;
  suggestedReplies: string[];
}

export default function ReplyResults() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<ReplyAnalysisData | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const data = loadAnalysis<ReplyAnalysisData>('reply');
    if (!data) {
      setLocation('/fix-reply');
      return;
    }
    setResult(data);
    trackPreviewViewed("reply");
  }, [setLocation]);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const copyToClipboard = async (text: string, index: number) => {
    const copied = await copyTextToClipboard(text);
    if (!copied) return;
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center mb-6">Your Reply Suggestions</h1>

        <div className="flex justify-center mb-4">
          <Badge variant="default" className="bg-primary/10 text-primary border-primary/20" data-testid="badge-full-access">
            <Check className="w-3 h-3 mr-1" />
            Full Results Unlocked
          </Badge>
        </div>

        <div className="space-y-6">
          {result.conversationContext && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Conversation Context</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90 leading-relaxed break-words">{result.conversationContext}</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Suggested Replies</h3>
            {result.suggestedReplies?.map((reply, index) => (
              <Card 
                key={index} 
                className="overflow-hidden"
              >
                <CardContent className="py-4 flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex-1 min-w-0 break-words prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-p:leading-relaxed prose-p:text-foreground/90">
                    <ReactMarkdown>{reply}</ReactMarkdown>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="self-end shrink-0 gap-2 sm:self-start"
                    onClick={() => copyToClipboard(reply, index)}
                    aria-label={copiedIndex === index ? `Reply ${index + 1} copied` : `Copy reply ${index + 1}`}
                    title={copiedIndex === index ? "Copied" : "Copy reply"}
                    data-testid={`button-copy-reply-${index}`}
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-4 h-4 text-primary" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-4 h-4" />
                        Copy reply
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard?tab=reply" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full"
                  data-testid="button-try-another"
                >
                  Try Another Conversation
                </Button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <Button
                  className="w-full"
                  data-testid="button-back-dashboard"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
