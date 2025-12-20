import { Upload, Sparkles, Heart } from "lucide-react";

interface HowItWorksProps {
  variant?: "profile" | "reply";
}

export function HowItWorks({ variant = "profile" }: HowItWorksProps) {
  const profileSteps = [
    {
      icon: Upload,
      title: "Upload Screenshots",
      description: "Take screenshots of your dating profile and upload them here.",
    },
    {
      icon: Sparkles,
      title: "Get AI Analysis",
      description: "Our AI reviews your photos, bio, and prompts for improvements.",
    },
    {
      icon: Heart,
      title: "Get More Matches",
      description: "Apply the changes and start getting better quality matches.",
    },
  ];

  const replySteps = [
    {
      icon: Upload,
      title: "Paste Conversation",
      description: "Screenshot or describe the conversation you need help with.",
    },
    {
      icon: Sparkles,
      title: "Pick a Tone",
      description: "Choose playful, flirty, or confident based on your style.",
    },
    {
      icon: Heart,
      title: "Send & Connect",
      description: "Copy a reply that sounds like you and keep the spark going.",
    },
  ];

  const steps = variant === "profile" ? profileSteps : replySteps;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">How It Works</h2>
        <p className="text-muted-foreground">Three simple steps to better results</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <step.icon className="w-7 h-7 text-primary" />
            </div>
            <div className="relative">
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl font-bold text-muted/30">
                {index + 1}
              </span>
              <h3 className="font-semibold">{step.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
