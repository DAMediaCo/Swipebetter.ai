import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Camera, ArrowLeft, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function BumbleBioExamples() {
  useEffect(() => {
    document.title = "Bumble Bio Examples That Get Right Swipes";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Find the best Bumble bio examples with templates you can customize. Stand out and get more quality matches.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Find the best Bumble bio examples with templates you can customize. Stand out and get more quality matches.';
      document.head.appendChild(meta);
    }
  }, []);

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
            Bumble Bio Examples That Actually Get Right Swipes
          </h1>
          <p className="text-lg text-muted-foreground">
            Real examples, templates, and tips for writing a Bumble bio that stands out.
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
          <section>
            <p className="text-lg leading-relaxed">
              Your Bumble bio has one job: give someone a reason to swipe right and then a reason to message you. Most bios fail at both. They're either too generic to stand out or so vague there's nothing to talk about.
            </p>
            <p className="leading-relaxed">
              This guide includes real examples that work, broken down by style, plus templates you can customize and common mistakes to avoid.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">What Makes a Bumble Bio Work</h2>
            <p className="leading-relaxed">
              Good Bumble bios share three traits. They show personality rather than listing traits. They include specific details that feel real. And they give someone an easy conversation starter.
            </p>
            <p className="leading-relaxed">
              You don't need to be the funniest or most interesting person. You just need to be specific about who you actually are.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Bumble Bio Examples by Style</h2>
            
            <h3 className="text-xl font-semibold mt-8 mb-4 text-foreground">The Casual and Confident</h3>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="italic leading-relaxed">
                  "Product designer. Weekend hiker. Weeknight chef who makes exactly three dishes really well. Looking for someone to share a bottle of wine and opinions about which streaming show is most overrated."
                </p>
              </CardContent>
            </Card>

            <h3 className="text-xl font-semibold mt-8 mb-4 text-foreground">The Playful</h3>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="italic leading-relaxed">
                  "Will text back quickly, remember your food order, and pretend to be interested in your work stories. Looking for someone who appreciates dad jokes and doesn't mind that I talk to my plants."
                </p>
              </CardContent>
            </Card>

            <h3 className="text-xl font-semibold mt-8 mb-4 text-foreground">The Direct</h3>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="italic leading-relaxed">
                  "Lawyer by day, amateur baker by weekend. Looking for something real. Into long conversations, good food, and people who actually follow through on plans. Message me about your favorite coffee shop."
                </p>
              </CardContent>
            </Card>

            <h3 className="text-xl font-semibold mt-8 mb-4 text-foreground">The Minimal but Memorable</h3>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="italic leading-relaxed">
                  "Excellent at parallel parking. Terrible at mini golf. Somewhere in between at everything else."
                </p>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Before and After Bio Transformations</h2>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Before</p>
                      <p className="text-foreground/80 italic">"Just looking to meet new people and see what happens. Love to travel and try new things."</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">After</p>
                      <p className="italic">"Recently back from two weeks in Portugal and still dreaming about those pasteis de nata. Looking for someone to explore the city's best brunch spots with. Bonus points if you have strong coffee opinions."</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Before</p>
                      <p className="text-foreground/80 italic">"6'1 if that matters. Work in finance. Gym and sports."</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">After</p>
                      <p className="italic">"Finance by day, basketball league by night. Currently on a mission to find the city's best espresso martini. 6'1 for the height-curious."</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <p className="leading-relaxed mt-6">
              The "after" versions use specific details that create conversation opportunities. For personalized feedback on your bio, <Link href="/fix-profile" className="text-primary underline">get your profile analyzed</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Common Bumble Bio Mistakes</h2>
            <p className="leading-relaxed">
              <strong className="text-foreground">Being too generic.</strong> "Love to laugh, travel, and try new things" describes everyone. Be specific.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">Listing height and job only.</strong> These are facts, not personality. Add something with character.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">Self-deprecating overload.</strong> One self-aware joke is charming. Three makes you seem insecure.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">No conversation hooks.</strong> If someone doesn't know what to message you about, they won't message at all.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Bio Templates You Can Customize</h2>
            <div className="space-y-4 ml-4">
              <p className="leading-relaxed">
                <strong className="text-foreground">Template 1:</strong> "[Job/role]. [Hobby that shows personality]. Looking for [specific type of connection or activity]."
              </p>
              <p className="leading-relaxed">
                <strong className="text-foreground">Template 2:</strong> "[Fun fact]. [Another fun fact]. [Invitation to connect over something specific]."
              </p>
              <p className="leading-relaxed">
                <strong className="text-foreground">Template 3:</strong> "Will [positive trait in dating]. Looking for [what you want]. [Specific hook or question]."
              </p>
            </div>
          </section>

          <section className="my-12">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-8 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Want Personalized Bumble Bio Feedback?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Upload your profile screenshots and get AI-powered suggestions.
                </p>
                <Link href="/fix-profile">
                  <Button size="lg" className="mt-2" data-testid="button-cta-fix-profile">
                    <Camera className="w-5 h-5 mr-2" />
                    Fix My Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 text-foreground">How long should my Bumble bio be?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  2-4 sentences is ideal. Long enough to show personality, short enough to read quickly.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">Should I include my Instagram?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Only if it adds value and you're active on it. An empty or private Instagram doesn't help.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-8 mt-12">
            <p className="text-foreground/80 leading-relaxed">
              A good Bumble bio is specific, shows personality, and makes it easy to start a conversation. For more help, try our <Link href="/fix-profile" className="text-primary underline">profile analyzer</Link>. If you're matching but struggling with replies, our <Link href="/fix-reply" className="text-primary underline">reply helper</Link> can assist.
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
                  Fix My Profile
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
