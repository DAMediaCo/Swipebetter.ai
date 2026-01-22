import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, XCircle, Zap, ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ToolsLayout } from "@/components/ToolsLayout";

function updateMetaTag(selector: string, attribute: string, content: string) {
  let tag = document.querySelector(selector);
  if (tag) {
    tag.setAttribute(attribute, content);
  } else {
    const meta = document.createElement('meta');
    if (selector.includes('property=')) {
      meta.setAttribute('property', selector.match(/property="([^"]+)"/)?.[1] || '');
    } else if (selector.includes('name=')) {
      meta.name = selector.match(/name="([^"]+)"/)?.[1] || '';
    }
    meta.content = content;
    document.head.appendChild(meta);
  }
}

export default function TinderBioGenerator() {
  useEffect(() => {
    document.title = "Best Free Tinder Bio Generator 2026 | SwipeBetter AI";
    
    updateMetaTag('meta[name="description"]', 'content', 'Generate the perfect Tinder bio with our free AI tool. Get 5 custom bio options tailored to your personality in seconds.');
    updateMetaTag('meta[property="og:title"]', 'content', 'Best Free Tinder Bio Generator 2026 | SwipeBetter AI');
    updateMetaTag('meta[property="og:description"]', 'content', 'Generate the perfect Tinder bio with our free AI tool. Get 5 custom bio options tailored to your personality in seconds.');
    updateMetaTag('meta[property="og:url"]', 'content', 'https://swipebetter.ai/tools/tinder-bio-generator');
  }, []);

  const faqItems = [
    {
      question: "How long should a Tinder bio be?",
      answer: "The ideal Tinder bio is 3-5 lines (about 100-150 characters). Short enough to read at a glance, but long enough to show personality. Our AI generates bios optimized for this sweet spot."
    },
    {
      question: "What makes a good Tinder bio?",
      answer: "A good Tinder bio has three elements: personality (not a list of traits), conversation hooks (something specific to message about), and clarity about what you're looking for. Generic bios like 'I love to laugh' don't work."
    },
    {
      question: "Should I use humor in my Tinder bio?",
      answer: "Humor works great IF it's natural to you. Forced jokes fall flat. Our AI analyzes your input and creates bios that match your authentic voice, whether that's funny, genuine, or adventurous."
    }
  ];

  return (
    <ToolsLayout>
      <header className="text-center mb-12">
        <Badge variant="secondary" className="px-4 py-1.5 border-primary/30 mb-6">
          <Zap className="w-3.5 h-3.5 mr-1.5 text-primary" />
          Free AI Tool
        </Badge>
        
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight text-foreground">
          The #1 AI Tinder Bio Generator
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
          Stop staring at a blank bio. Our AI creates personalized, swipe-worthy bios in seconds.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Before vs After: Real Bio Transformation</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-destructive" />
                <span className="font-semibold text-destructive">Before</span>
              </div>
              <div className="bg-background/50 rounded-lg p-4 border">
                <p className="text-foreground/80 italic">
                  "I love to travel, laugh, and have a good time. Looking for my partner in crime. Swipe right if you like adventures!"
                </p>
              </div>
              <p className="text-sm text-foreground/70 mt-3">
                Generic, overused phrases. No personality. Zero conversation hooks.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">After (AI Generated)</span>
              </div>
              <div className="bg-background/50 rounded-lg p-4 border border-primary/20">
                <p className="text-foreground/80 italic">
                  "Mechanical engineer who makes espresso martinis stronger than my dad's handshake. Currently training for a half marathon (read: walking briskly). Looking for someone to explore farmers markets with on Sunday mornings."
                </p>
              </div>
              <p className="text-sm text-foreground/70 mt-3">
                Specific details, humor, clear interests. Easy to start a conversation.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Upload Your Profile</h3>
              <p className="text-sm text-foreground/80">
                Screenshot your current dating profile or describe yourself briefly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2 text-foreground">AI Analyzes Your Style</h3>
              <p className="text-sm text-foreground/80">
                Our AI identifies your personality traits and optimal bio approach.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Get 5 Custom Bios</h3>
              <p className="text-sm text-foreground/80">
                Receive multiple bio options tailored to your voice and goals.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="text-center mb-16">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <CardContent className="py-10">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3 text-foreground">Ready to Transform Your Bio?</h2>
            <p className="text-foreground/80 mb-6 max-w-md mx-auto">
              Get 5 custom-written Tinder bios based on your personality and goals.
            </p>
            <Link href="/fix-profile">
              <Button size="lg" className="text-lg px-8 py-6 shadow-lg shadow-primary/25" data-testid="button-generate-bios">
                <Sparkles className="w-5 h-5 mr-2" />
                Generate 5 Custom Bios
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-foreground/60 mt-4">
              Free score included. No credit card required.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Frequently Asked Questions</h2>
        
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-foreground">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/80">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </ToolsLayout>
  );
}
