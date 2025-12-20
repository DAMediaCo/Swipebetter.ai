import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepIndicator } from "@/components/StepIndicator";
import { loadAnalysis } from "@/lib/analysisStorage";
import { 
  ArrowLeft, 
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
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/fix-reply">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="w-9" />
        </div>

        <StepIndicator 
          steps={["Analyze", "Results", "Upgrade"]} 
          currentStep={2} 
        />

        <div className="space-y-6">
          {result.conversationContext && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Conversation Context</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{result.conversationContext}</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Suggested Replies</h3>
            {result.suggestedReplies?.map((reply, index) => (
              <Card key={index} className="hover-elevate cursor-pointer" onClick={() => copyToClipboard(reply, index)}>
                <CardContent className="py-4 flex items-start gap-4">
                  <div className="flex-1">
                    <p className="leading-relaxed">{reply}</p>
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

          <div className="flex gap-3">
            <Link href="/fix-reply" className="flex-1">
              <Button
                variant="outline"
                className="w-full"
                data-testid="button-try-another"
              >
                Try Another Reply
              </Button>
            </Link>
            <Link href="/fix-reply/upgrade" className="flex-1">
              <Button
                className="w-full"
                data-testid="button-upgrade"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
