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
        "He's pretty cute, but I'd argue I'm better company. Want to find out?",
        "He's a great conversation starter, but you seem way more interesting.",
        "Thanks! Maybe we can all grab a coffee sometime - he loves people watching.",
      ],
      witty: [
        "Thanks! He's my wingman. Fair warning though, he gets jealous easily.",
        "That's actually how he gets all the dates, I just hold the leash.",
        "He says thanks! He also wants to know if you're a belly rub person or a fetch person.",
      ],
      confident: [
        "Thanks! He's the best. Let's grab coffee this week - I know a dog-friendly spot.",
        "Appreciate that. So what's your deal? I'm curious about you.",
        "He's got good taste. Let's skip the small talk - what are you doing this weekend?",
      ],
    },
  },
  {
    title: "Restarting Dead Convo",
    conversation: "Last message (3 days ago): Her: Yeah that sounds fun!",
    replies: {
      flirty: [
        "Hey stranger. Been thinking about that conversation we started. Want to pick up where we left off?",
        "I owe you a better reply than silence. Let me make it up to you - coffee this week?",
        "Missing our chats. Any chance you're free to grab a drink and catch up properly?",
      ],
      witty: [
        "Plot twist: I'm back. Did you think you got rid of me that easily?",
        "My phone was on airplane mode for 3 days. Just kidding, I'm terrible at texting. How was your week?",
        "I just found this message hiding in my notifications. Quick, let's pretend it hasn't been 3 days.",
      ],
      confident: [
        "Hey. Life got busy but I didn't forget about you. Let's actually make plans this time.",
        "I'm bad at texting but great in person. Let me prove it - when are you free?",
        "Still interested? Good. Let's grab drinks this Friday and actually meet.",
      ],
    },
  },
  {
    title: "Setting Up a Date",
    conversation: "Her: I'd be down to grab coffee sometime!",
    replies: {
      flirty: [
        "Love that energy. There's a cute spot downtown - Saturday afternoon? I'll save you a seat.",
        "It's a date then. Saturday at 3? I know just the place with the best vibes.",
        "Finally! I've been waiting for you to say that. How's Friday evening sound?",
      ],
      witty: [
        "Sometime? That's too vague for my coffee addiction. How about Saturday at 2?",
        "Perfect! There's this place that makes lattes so good they should be illegal. Saturday work?",
        "Coffee sounds like the perfect excuse to hear more of your terrible puns. Friday afternoon?",
      ],
      confident: [
        "Great. Saturday, 3pm, Blue Bottle on Main Street. I'll be the one who looks even better in person.",
        "Perfect. Let's do Friday at 5. I'll text you the address. Looking forward to it.",
        "Done. Saturday afternoon works. I'll pick the spot and send you details tomorrow.",
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
                        <Check className="w-4 h-4 text-primary" />
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
