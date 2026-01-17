import { Quote } from "lucide-react";
import { Card } from "@/components/ui/card";

const testimonials = [
  {
    quote: "I actually changed my first pic like the AI said and got 3 matches today. The bio rewrite was surprisingly good.",
    author: "Early Beta Tester",
    platform: "Tinder"
  },
  {
    quote: "The photo order suggestions were spot on. Moved my group photo to the end and saw way more likes.",
    author: "Hinge User",
    platform: "Hinge"
  },
  {
    quote: "Wasn't expecting much but the feedback was actually brutally honest. Fixed my bio and it's working.",
    author: "Bumble User",
    platform: "Bumble"
  }
];

export function RedditSocialProof() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="p-5 flex flex-col gap-3">
            <Quote className="w-6 h-6 text-primary/40" />
            <p className="text-sm text-foreground leading-relaxed flex-1">
              "{testimonial.quote}"
            </p>
            <div className="pt-2 border-t border-border">
              <p className="text-sm font-medium text-foreground">{testimonial.author}</p>
              <p className="text-xs text-muted-foreground">{testimonial.platform}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
