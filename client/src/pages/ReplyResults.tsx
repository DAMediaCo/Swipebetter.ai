import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadAnalysis } from "@/lib/analysisStorage";
import { trackPreviewViewed } from "@/lib/analytics";
import { useEntitlement, useCustomerPortal } from "@/lib/auth";
import { 
  Clipboard, 
  Check,
  Sparkles,
  Lock,
  Settings
} from "lucide-react";

interface ReplyAnalysisData {
  conversationContext: string;
  suggestedReplies: string[];
}

export default function ReplyResults() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<ReplyAnalysisData | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { isPro, proActive, planType, isLoading: entitlementLoading, refreshEntitlement } = useEntitlement();
  const customerPortal = useCustomerPortal();

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

  const copyToClipboard = async (text: string, index: number) => {
    if (!isPro) return;
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
        <h1 className="text-2xl font-bold text-center mb-6">Your Reply Suggestions</h1>

        <div className="flex justify-center mb-4">
          {isPro ? (
            <Badge variant="default" className="bg-primary/10 text-primary border-primary/20" data-testid="badge-full-access">
              <Check className="w-3 h-3 mr-1" />
              {planType === 'starter' ? 'Starter Fix' : planType === 'annual' ? 'Annual Member' : planType === 'monthly' ? 'Monthly Member' : 'Full Results Unlocked'}
            </Badge>
          ) : (
            <Badge variant="secondary" data-testid="badge-preview">
              <Lock className="w-3 h-3 mr-1" />
              Preview Mode
            </Badge>
          )}
        </div>

        {!isPro && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground">
                Upgrade to unlock all reply suggestions and copy buttons.
              </p>
            </CardContent>
          </Card>
        )}

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
              <Card 
                key={index} 
                className={isPro ? "hover-elevate cursor-pointer" : ""} 
                onClick={() => isPro && copyToClipboard(reply, index)}
              >
                <CardContent className="py-4 flex items-start gap-4">
                  <div className="flex-1 prose prose-sm dark:prose-invert max-w-none prose-p:my-1">
                    <ReactMarkdown>{reply}</ReactMarkdown>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(reply, index);
                    }}
                    disabled={!isPro}
                    data-testid={`button-copy-reply-${index}`}
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : isPro ? (
                      <Clipboard className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            {!isPro && (
              <p className="text-sm text-muted-foreground text-center">
                Unlock the full report in seconds.
              </p>
            )}
            <div className="flex gap-3">
              <Link href="/fix-reply" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full"
                  data-testid="button-try-another"
                >
                  Try Another Conversation
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
                <Link href="/fix-reply/upgrade" className="flex-1">
                  <Button
                    className="w-full"
                    data-testid="button-upgrade"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
