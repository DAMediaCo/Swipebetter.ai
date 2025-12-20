import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TonePicker } from "./TonePicker";
import { Check, Copy, Sparkles } from "lucide-react";

const sampleConversation = `Her: Hey! I saw you're into hiking too. What's your favorite trail?

Me: There's this great one in the mountains about an hour from the city. The views are amazing.

Her: That sounds nice! I've been wanting to explore more trails lately.`;

const replysByTone: Record<string, string[]> = {
  flirty: [
    "Well, I know the perfect trail with an incredible sunset view... but it's way better with company.",
    "I'd love to show you my favorite spot. The view is almost as nice as this conversation.",
    "There's this hidden waterfall I've been wanting to share with someone special. Interested?",
  ],
  witty: [
    "Sounds like you need a hiking buddy who knows all the secret viewpoints! I happen to know a few...",
    "Perfect timing! I was just planning my next adventure. Want to be my expedition partner?",
    "We should totally go together! I'll bring the snacks, you bring the good vibes. Deal?",
  ],
  confident: [
    "Let's make it happen. This Saturday, I'll take you to the best trail in the area. You in?",
    "I know exactly where to go. Grab your hiking boots - I'll plan the whole thing.",
    "Perfect. Let's do Sunday morning. I'll send you the details. Trust me, you'll love it.",
  ],
};

export function ConvoDemo() {
  const [tone, setTone] = useState("flirty");
  const [showReplies, setShowReplies] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleGenerate = () => {
    setShowReplies(true);
  };

  const replies = replysByTone[tone] || replysByTone.flirty;

  return (
    <div className="space-y-6" id="reply-demo">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Try It Out</h2>
        <p className="text-muted-foreground">See how we generate replies based on your conversation</p>
      </div>

      <div className="space-y-4">
        <TonePicker selectedTone={tone} onSelect={setTone} />

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={sampleConversation}
                readOnly
                className="min-h-[200px] text-sm resize-none"
                data-testid="textarea-demo-convo"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Suggested Replies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!showReplies ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Button onClick={handleGenerate} data-testid="button-demo-generate">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Replies
                  </Button>
                </div>
              ) : (
                replies.map((reply, index) => (
                  <div
                    key={index}
                    className="p-3 bg-primary/5 rounded-md border border-primary/20 flex items-start gap-2"
                  >
                    <p className="text-sm flex-1">{reply}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(reply, index)}
                      data-testid={`button-copy-demo-reply-${index}`}
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
