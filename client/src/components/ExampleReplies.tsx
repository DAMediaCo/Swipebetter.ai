import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TonePicker } from "./TonePicker";
import { Check, Copy, MessageSquare } from "lucide-react";

interface Scenario {
  title: string;
  conversation: string;
  replies: Record<string, string[]>;
}

const scenarios: Scenario[] = [
  {
    title: "After Matching",
    conversation: "Her: We matched! I love your dog in that photo.",
    replies: {
      flirty: [
        "He gets most of the credit for my matches. What's your dog's name?",
        "Thanks. He's cute, but I'm a little less needy.",
        "He'd probably approve of you. Want to grab coffee with us sometime?",
      ],
      witty: [
        "That's actually his profile. I just manage the account.",
        "He says thanks. His ego is going to be unbearable now.",
        "He did insist on approving all my photos.",
      ],
      confident: [
        "Thanks. Want to join us for coffee this week?",
        "He's the best. Do you have any pets?",
        "Thanks. What are you up to this weekend?",
      ],
    },
  },
  {
    title: "Restarting Dead Convo",
    conversation: "Last message (3 days ago): Her: Yeah that sounds fun!",
    replies: {
      flirty: [
        "I dropped the ball on replying. Still up for it?",
        "Late reply, but yes, I'd still like to do that.",
        "I meant to answer this sooner. Are you free this week?",
      ],
      witty: [
        "Three business days later, I have returned.",
        "Apparently I reply on a very relaxed schedule. How was your week?",
        "A little late, but I agree. When are you free?",
      ],
      confident: [
        "Sorry for the slow reply. Want to make a plan this week?",
        "I'm still interested. Are you free Friday?",
        "Let's pick this back up. What day works for you?",
      ],
    },
  },
  {
    title: "Setting Up a Date",
    conversation: "Her: I'd be down to grab coffee sometime!",
    replies: {
      flirty: [
        "I'd like that. Are you free Saturday afternoon?",
        "Good, because I was hoping you'd say yes. How's Friday?",
        "Let's do it. When are you free?",
      ],
      witty: [
        "\"Sometime\" is pretty open-ended. Saturday?",
        "Perfect. Important question: coffee snob or normal person?",
        "I'm in. Friday afternoon work?",
      ],
      confident: [
        "Great. Are you free Saturday afternoon?",
        "Perfect. Let's do Friday at 5 if that works for you.",
        "Sounds good. Pick a day and we'll make it happen.",
      ],
    },
  },
];

export function ExampleReplies() {
  const [tone, setTone] = useState("flirty");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6" id="example-replies">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Example Reply Sets</h2>
        <p className="text-muted-foreground">See how different tones work in common scenarios</p>
      </div>

      <TonePicker selectedTone={tone} onSelect={setTone} />

      <div className="space-y-4">
        {scenarios.map((scenario, sIndex) => (
          <Card key={sIndex}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                {scenario.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                {scenario.conversation}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {scenario.replies[tone]?.map((reply, rIndex) => {
                const key = `${sIndex}-${rIndex}`;
                return (
                  <div
                    key={rIndex}
                    className="p-3 bg-primary/5 rounded-md border border-primary/20 flex items-start gap-2"
                  >
                    <p className="text-sm flex-1">{reply}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(reply, key)}
                      data-testid={`button-copy-example-${sIndex}-${rIndex}`}
                    >
                      {copiedKey === key ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
