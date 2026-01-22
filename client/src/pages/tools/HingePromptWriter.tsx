import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, ArrowRight, MessageCircle, Heart } from "lucide-react";
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

export default function HingePromptWriter() {
  useEffect(() => {
    document.title = "Hinge Prompt Answer Generator | Funny & Witty AI";
    
    updateMetaTag('meta[name="description"]', 'content', 'Generate witty, original Hinge prompt answers with AI. Perfect responses for "Dating me is like...", "Two truths and a lie", and more.');
    updateMetaTag('meta[property="og:title"]', 'content', 'Hinge Prompt Answer Generator | Funny & Witty AI');
    updateMetaTag('meta[property="og:description"]', 'content', 'Generate witty, original Hinge prompt answers with AI. Perfect responses for Dating me is like, Two truths and a lie, and more.');
    updateMetaTag('meta[property="og:url"]', 'content', 'https://swipebetter.ai/tools/hinge-prompt-writer');
  }, []);

  const faqItems = [
    {
      question: "Which Hinge prompts get the most likes?",
      answer: "Prompts that invite conversation work best: 'Two truths and a lie', 'Dating me is like...', and 'I bet you can't...' give matches an easy way to respond. Avoid generic prompts like 'I'm looking for...' which don't spark interaction."
    },
    {
      question: "Should Hinge prompts be funny or serious?",
      answer: "A mix works best. Lead with one witty/playful prompt, include one that shows genuine personality, and one that hints at what you're looking for. Pure humor can seem like you're not serious about dating."
    },
    {
      question: "How long should Hinge prompt answers be?",
      answer: "2-3 sentences is ideal. Long enough to show personality, short enough to read at a glance. Our AI generates answers optimized for engagement, not word count."
    }
  ];

  const examplePrompts = [
    {
      prompt: "Dating me is like...",
      answer: "Subscribing to a podcast that's 60% cooking experiments, 30% random historical facts, and 10% wondering if the plants are still alive."
    },
    {
      prompt: "Two truths and a lie",
      answer: "I've been to 23 countries. I can solve a Rubik's cube in under 2 minutes. I once accidentally got on the wrong flight."
    },
    {
      prompt: "I bet you can't...",
      answer: "Beat me at naming obscure 90s one-hit wonders. My Spotify Wrapped is basically a time capsule."
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
          Stuck on Hinge? Generate Witty Prompt Answers Instantly.
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
          Our AI writes Hinge prompts that actually get comments and likes, not eye rolls.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Example Hinge Prompts</h2>
        
        <div className="space-y-4">
          {examplePrompts.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 px-4 py-3 border-b border-primary/10">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-rose-400" />
                    <span className="font-medium text-foreground/90 text-sm">{item.prompt}</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-foreground/80 leading-relaxed">
                    {item.answer}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-sm text-foreground/60">
                    <Heart className="w-4 h-4" />
                    <span>AI-generated example</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Why Generic Prompts Don't Work</h2>
        
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-destructive mb-3 text-foreground">Common Mistakes</h3>
                <ul className="space-y-2 text-foreground/80">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">-</span>
                    "Looking for my partner in crime"
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">-</span>
                    "I love adventures and good food"
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">-</span>
                    "Not here for hookups"
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">-</span>
                    "Ask me anything"
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-primary mb-3 text-foreground">What Works Instead</h3>
                <ul className="space-y-2 text-foreground/80">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">+</span>
                    Specific details about your life
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">+</span>
                    Humor that shows personality
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">+</span>
                    Easy conversation starters
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">+</span>
                    Genuine interests, not clichés
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="text-center mb-16">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <CardContent className="py-10">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3 text-foreground">Get Custom Hinge Prompts</h2>
            <p className="text-foreground/80 mb-6 max-w-md mx-auto">
              Upload your profile and get AI-written prompts tailored to your personality.
            </p>
            <Link href="/fix-profile">
              <Button size="lg" className="text-lg px-8 py-6 shadow-lg shadow-primary/25" data-testid="button-write-prompts">
                <Sparkles className="w-5 h-5 mr-2" />
                Write My Prompts
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-foreground/60 mt-4">
              Free score included. Works with any Hinge profile.
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
