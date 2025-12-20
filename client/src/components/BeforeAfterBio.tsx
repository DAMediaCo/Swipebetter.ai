import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, ArrowRight } from "lucide-react";

const bioExamples = [
  {
    before: "Just a guy looking for someone cool. I like music and food. Hit me up.",
    after: "Music producer by day, home chef by night. Always hunting for the best tacos in the city. Looking for someone who appreciates a good vinyl collection and isn't afraid of spicy food. Let's cook something up together.",
  },
  {
    before: "I work hard and play hard. Looking for my partner in crime.",
    after: "Marketing lead who actually leaves the office by 6. Weekends are for hiking trails, farmers markets, and trying to perfect my cold brew recipe. Seeking someone who wants to split a dessert and actually explore the city.",
  },
  {
    before: "Just here to see what happens. Swipe right if you're interesting.",
    after: "Curious about everything from documentary films to why my houseplants keep dying. I tell great stories, make excellent playlists, and always know the best coffee spots. Looking for someone who can hold their own in a conversation.",
  },
];

export function BeforeAfterBio() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Before vs After Bio Rewrites</h2>
        <p className="text-muted-foreground">See how we transform boring bios into match magnets</p>
      </div>
      
      <div className="space-y-4">
        {bioExamples.map((example, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase text-muted-foreground bg-muted px-2 py-1 rounded">Before</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed p-3 bg-muted/30 rounded-md">
                    {example.before}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase text-primary bg-primary/10 px-2 py-1 rounded">After</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(example.after, index)}
                      data-testid={`button-copy-bio-${index}`}
                    >
                      {copiedIndex === index ? (
                        <><Check className="w-4 h-4 mr-1" /> Copied</>
                      ) : (
                        <><Copy className="w-4 h-4 mr-1" /> Copy</>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm leading-relaxed p-3 bg-primary/5 rounded-md border border-primary/20">
                    {example.after}
                  </p>
                </div>
              </div>
              <div className="hidden md:flex justify-center mt-2">
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
