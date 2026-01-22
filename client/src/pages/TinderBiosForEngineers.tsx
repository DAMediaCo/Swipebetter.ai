import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Camera, ArrowLeft, ArrowRight, Copy, Gamepad2, Code, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const engineerBios = [
  {
    category: "The Self-Aware Engineer",
    bios: [
      "Software engineer. Yes, I can fix your printer. No, I won't.",
      "Debug code by day, debug my dating life by night. One is going better than the other.",
      "I write code that works on the first try. Just kidding, that never happens.",
      "Engineer who explains things without using the word 'basically' challenge: impossible.",
    ]
  },
  {
    category: "The Gamer",
    bios: [
      "Top 500 in Overwatch. Top 0 in texting back. Working on it.",
      "Looking for a co-op partner for life. Must be okay with me yelling at my screen occasionally.",
      "Diamond in League, Bronze in cooking. Teach me to make something other than ramen.",
      "I'll carry you in games but you'll have to carry the conversation.",
    ]
  },
  {
    category: "The Nerdy But Charming",
    bios: [
      "I have strong opinions about keyboard switches and no one to share them with.",
      "Looking for someone who appreciates that I named my WiFi network 'Pretty Fly for a Wi-Fi.'",
      "Into board games, bad puns, and spending too much money on hobbies I'll abandon in 6 months.",
      "I know way too much about Star Wars lore. Consider this a warning or a selling point.",
    ]
  },
  {
    category: "The Introvert's Honest Approach",
    bios: [
      "Introvert who will talk your ear off once I'm comfortable. The warm-up period is approximately 3 dates.",
      "I'd rather be at home with my cat, but here I am trying. That has to count for something.",
      "Small talk terrifies me but deep conversations about the universe at 2am? That's my thing.",
      "Looking for someone who understands that 'let's stay in' is a romantic gesture.",
    ]
  }
];

export default function TinderBiosForEngineers() {
  const { toast } = useToast();

  useEffect(() => {
    document.title = "15+ Best Tinder Bios for Engineers, Gamers & Nerds (2026) | SwipeBetter";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Copy-paste Tinder bios for engineers, gamers, and introverts. Smart, geeky bios that actually get matches. Stop being boring.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Copy-paste Tinder bios for engineers, gamers, and introverts. Smart, geeky bios that actually get matches. Stop being boring.';
      document.head.appendChild(meta);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      meta.content = '15+ Best Tinder Bios for Engineers, Gamers & Nerds';
      document.head.appendChild(meta);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      meta.content = 'Copy-paste Tinder bios for engineers, gamers, and introverts. Smart, geeky bios that actually get matches.';
      document.head.appendChild(meta);
    }
  }, []);

  const copyBio = (bio: string) => {
    navigator.clipboard.writeText(bio);
    toast({
      description: "Bio copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen">
      <article className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            15+ Tinder Bios for Engineers, Gamers & Nerds That Actually Work
          </h1>
          <p className="text-lg text-muted-foreground">
            Smart, geeky, and actually attractive. Stop being boring.
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <p className="text-lg leading-relaxed">
              Let's be honest: most engineer and gamer bios are terrible. Either they're trying way too hard to be quirky, or they're so bland that nobody can tell you apart from the other 500 software developers in the stack.
            </p>
            <p className="leading-relaxed">
              The key is leaning into your interests without making them your entire personality. Being a gamer or engineer is interesting. Making it your whole identity is not. The best bios show you're self-aware, have a sense of humor about yourself, and are actually looking for a real connection.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Why Most Nerd Bios Fail</h2>
            <p className="leading-relaxed">
              The problem isn't being nerdy. It's being boring about it. "I like video games and coding" tells someone nothing. Everyone in tech likes those things. What makes you different?
            </p>
            <p className="leading-relaxed">
              The best bios take something specific and make it relatable or funny. Instead of listing hobbies, show personality through how you talk about them.
            </p>
          </section>

          <section className="my-12">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-8 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Get Your Free Profile Score</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Find out if your profile is working. Upload a screenshot and get instant AI feedback.
                </p>
                <Link href="/fix-profile">
                  <Button size="lg" className="mt-2" data-testid="button-cta-mid">
                    <Camera className="w-5 h-5 mr-2" />
                    Get Free Score
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          {engineerBios.map((category, categoryIndex) => (
            <section key={categoryIndex}>
              <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2">
                {category.category === "The Gamer" && <Gamepad2 className="w-6 h-6 text-primary" />}
                {category.category === "The Self-Aware Engineer" && <Code className="w-6 h-6 text-primary" />}
                {category.category === "The Nerdy But Charming" && <Brain className="w-6 h-6 text-primary" />}
                {category.category}
              </h2>
              <div className="space-y-3">
                {category.bios.map((bio, bioIndex) => (
                  <Card 
                    key={bioIndex} 
                    className="hover-elevate cursor-pointer"
                    onClick={() => copyBio(bio)}
                  >
                    <CardContent className="py-4 flex items-center justify-between gap-4">
                      <p className="italic text-foreground/90">{bio}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyBio(bio);
                        }}
                        data-testid={`button-copy-bio-${categoryIndex}-${bioIndex}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">How to Customize These for Yourself</h2>
            <p className="leading-relaxed">
              These bios work as starting points, but the best results come from personalizing them. Swap out the specific games, hobbies, or references for your own. The structure and tone matter more than the exact words.
            </p>
            <p className="leading-relaxed">
              For example, if you don't play Overwatch, replace it with whatever game you're actually good at. The joke still works. Authenticity beats copying every time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">What to Avoid</h2>
            <p className="leading-relaxed">
              <strong>Don't list your tech stack.</strong> "Proficient in Python, JavaScript, and SQL" is a resume, not a dating profile.
            </p>
            <p className="leading-relaxed">
              <strong>Skip the Rick and Morty quotes.</strong> Having good taste in shows is fine. Making it your whole personality is not.
            </p>
            <p className="leading-relaxed">
              <strong>Avoid the "I'm awkward" disclaimer.</strong> Everyone's a little awkward. Announcing it upfront just makes it a bigger deal than it needs to be.
            </p>
          </section>

          <section className="my-12">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-8 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Want a Custom Bio Written for You?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Our AI Bio Architect analyzes your profile and creates personalized bios that match your style.
                </p>
                <Link href="/fix-profile">
                  <Button size="lg" className="mt-2" data-testid="button-cta-bio-architect">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Try AI Bio Architect
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Should I mention I'm an engineer in my bio?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes, but don't make it the focus. Your job is one aspect of who you are. Mentioning it casually or with humor works better than leading with your LinkedIn headline.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Is it bad to mention gaming?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Not at all. Gaming is a massive hobby and plenty of people find it attractive. The key is how you mention it. Self-aware humor works. "I'm a gamer" with nothing else doesn't.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Do these work for Hinge and Bumble too?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The tone and style translate, but you might need to adapt them to fit prompt formats on Hinge. The core idea of being specific and self-aware works everywhere.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-8 mt-12">
            <p className="text-muted-foreground leading-relaxed">
              Being nerdy isn't a dating disadvantage. Being boring is. Pick a bio that feels like you, customize it, and don't take yourself too seriously. If you want more personalized help, our <Link href="/fix-profile" className="text-primary underline">AI profile analyzer</Link> can give you specific feedback on your entire profile.
            </p>
          </section>
        </div>

        <footer className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex gap-4">
              <Link href="/fix-profile">
                <Button variant="outline" size="sm">
                  Get Free Score
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/fix-reply">
                <Button variant="outline" size="sm">
                  Fix My Reply
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
