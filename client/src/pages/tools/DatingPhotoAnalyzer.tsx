import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Zap, ArrowRight, Eye, Sun, Users, AlertTriangle, CheckCircle } from "lucide-react";
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

export default function DatingPhotoAnalyzer() {
  useEffect(() => {
    document.title = "AI Dating Photo Analyzer | Rate Tinder & Hinge Photos";
    
    updateMetaTag('meta[name="description"]', 'content', 'Analyze dating profile photos for lighting, expression, trust signals, variety, and photo order before you upload to Tinder, Hinge, or Bumble.');
    updateMetaTag('meta[property="og:title"]', 'content', 'AI Dating Photo Analyzer | Rate Tinder & Hinge Photos');
    updateMetaTag('meta[property="og:description"]', 'content', 'Analyze dating profile photos for lighting, expression, trust signals, variety, and photo order before you upload to Tinder, Hinge, or Bumble.');
    updateMetaTag('meta[property="og:url"]', 'content', 'https://swipebetter.ai/tools/dating-photo-analyzer');
  }, []);

  const faqItems = [
    {
      question: "What is a 'Trust Score' for dating photos?",
      answer: "Trust Score measures how authentic and approachable your photos appear. Factors include natural lighting, genuine smiles, relaxed posture, and avoiding heavily filtered or staged shots."
    },
    {
      question: "What photo should be first on my dating profile?",
      answer: "Your first photo should be a clear headshot with good lighting where your face is easy to see. Avoid sunglasses, group photos, distant shots, and photos where the strongest image is buried later."
    },
    {
      question: "How many photos should I have on my dating profile?",
      answer: "4-6 photos is optimal. Include: one clear headshot, one full-body shot, one showing an activity/hobby, and one social photo (with friends). Quality beats quantity."
    }
  ];

  const photoFactors = [
    {
      icon: Sun,
      title: "Lighting Quality",
      description: "Natural light usually reads better than flash. Soft, even lighting makes your face clearer and your profile feel more approachable.",
      good: "Outdoor golden hour, window light",
      bad: "Bathroom selfies, harsh flash"
    },
    {
      icon: Eye,
      title: "Eye Contact & Expression",
      description: "Direct eye contact and a genuine expression create a stronger first impression than stiff poses or unclear expressions.",
      good: "Natural smile, relaxed eyes",
      bad: "Duck face, intense stare, no smile"
    },
    {
      icon: Users,
      title: "The Trust Gap",
      description: "Photos that feel authentic usually build more trust than heavily filtered or overly staged Instagram-style shots.",
      good: "Candid moments, real activities",
      bad: "Heavily filtered, staged poses"
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
          AI Dating Photo Analyzer for Tinder, Hinge & Bumble
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
          Your first photo decides whether most people keep looking. Get feedback on lighting, expression, trust signals, variety, and photo order.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">What We Analyze</h2>
        
        <div className="space-y-6">
          {photoFactors.map((factor, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <factor.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 text-foreground">{factor.title}</h3>
                    <p className="text-foreground/80 mb-4">{factor.description}</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground/80">{factor.good}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground/80">{factor.bad}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Sample Photo Analysis</h2>
        
        <Card className="border-primary/30">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">78/100</div>
                <p className="text-sm text-foreground/80">Overall Photo Score</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-emerald-500 mb-2">85/100</div>
                <p className="text-sm text-foreground/80">Trust Score</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-amber-500 mb-2">71/100</div>
                <p className="text-sm text-foreground/80">Lighting Score</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-3 text-foreground">AI Recommendations:</h4>
              <ul className="space-y-2 text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  Move your headshot to position 1, it's currently buried at position 4
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  Photo 2 has harsh shadows, consider retaking with softer lighting
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  Add one full-body activity shot to show lifestyle
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="text-center mb-16">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <CardContent className="py-10">
            <Camera className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3 text-foreground">Ready to Analyze Your Photos?</h2>
            <p className="text-foreground/80 mb-6 max-w-md mx-auto">
              Get your personalized photo scores and recommendations in under 2 minutes.
            </p>
            <Link href="/fix-profile">
              <Button size="lg" className="text-lg px-8 py-6 shadow-lg shadow-primary/25" data-testid="button-analyze-photos">
                <Camera className="w-5 h-5 mr-2" />
                Analyze My Photos Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-foreground/60 mt-4">
              Free score included. Your photos are deleted after processing.
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
