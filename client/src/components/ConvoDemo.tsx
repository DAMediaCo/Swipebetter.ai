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
    "We should pick one and go together. Are you free this weekend?",
    "I could show you my favorite one, but you'll have to rate the view.",
    "Sounds like we need to plan a hike. Saturday or Sunday better for you?",
  ],
  witty: [
    "I can help with that. My fee is one trail snack.",
    "Then I have a strong case for picking your next trail.",
    "We should test one together. How serious are you about post-hike food?",
  ],
  confident: [
    "Let's go this weekend. Is Saturday good for you?",
    "I know a good one. Want to check it out together?",
    "Let's make a plan. Which day works better for you?",
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
