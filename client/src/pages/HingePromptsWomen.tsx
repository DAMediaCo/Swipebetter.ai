import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Camera, ArrowLeft, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function HingePromptsWomen() {
  useEffect(() => {
    document.title = "Best Hinge Prompts for Women in 2024";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Find the best Hinge prompts for women with examples that attract quality matches and spark real conversations.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Find the best Hinge prompts for women with examples that attract quality matches and spark real conversations.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <article className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Best Hinge Prompts for Women That Attract Quality Matches
          </h1>
          <p className="text-lg text-muted-foreground">
            How to choose prompts and write answers that filter for the connections you actually want.
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <p className="text-lg leading-relaxed">
              Women on Hinge often get plenty of likes but not enough quality messages. The problem usually isn't a lack of interest. It's that most profiles don't give people enough to work with. Generic prompts lead to generic openers like "Hey" or "You're pretty."
            </p>
            <p className="leading-relaxed">
              The right prompts do two things: they show your personality clearly and they make it easy for someone to send a thoughtful first message. This guide shows you how to pick the right prompts and write answers that attract better matches.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">What Makes a Good Hinge Prompt for Women</h2>
            <p className="leading-relaxed">
              The best prompts accomplish three things. First, they reveal something real about you, not just surface-level facts. Second, they filter for compatibility by showing what you value. Third, they give someone a clear entry point for conversation.
            </p>
            <p className="leading-relaxed">
              You're not trying to appeal to everyone. You're trying to appeal strongly to the right people. That means being specific, even if it means some people won't relate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Top Hinge Prompts for Women</h2>
            <p className="leading-relaxed mb-4">
              These prompts consistently lead to better conversations:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>"I'm looking for..."</strong> - Clear expectations attract the right people.</li>
              <li><strong>"Together we could..."</strong> - Paints a picture of what dating you might look like.</li>
              <li><strong>"The way to win me over is..."</strong> - Tells them exactly how to impress you.</li>
              <li><strong>"My simple pleasures..."</strong> - Shows you're easy to please and appreciate small things.</li>
              <li><strong>"I'm convinced that..."</strong> - Reveals personality through opinions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Hinge Prompt Examples: Before and After</h2>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Prompt: "Together we could..."</p>
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Before</p>
                      <p className="text-muted-foreground italic">"Have adventures and make memories"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">After</p>
                      <p className="italic">"Spend Sunday mornings at the farmers market and argue about which vendor has the best croissants"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Prompt: "The way to win me over is..."</p>
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Before</p>
                      <p className="text-muted-foreground italic">"Make me laugh"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">After</p>
                      <p className="italic">"Remember what I mentioned in passing and bring it up later. Also, strong opinions about TV shows"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Prompt: "I'm convinced that..."</p>
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Before</p>
                      <p className="text-muted-foreground italic">"Everything happens for a reason"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">After</p>
                      <p className="italic">"Oat milk is overrated, morning people have it figured out, and the best tacos are from trucks not restaurants"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <p className="leading-relaxed mt-6">
              The after examples are specific and give someone multiple things to respond to. Want personalized suggestions? <Link href="/fix-profile" className="text-primary underline">Get your profile analyzed</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Common Mistakes Women Make on Hinge</h2>
            <p className="leading-relaxed">
              <strong>Being too vague.</strong> "Love to travel" doesn't stand out. "Spent three weeks in Japan learning to make ramen" does.
            </p>
            <p className="leading-relaxed">
              <strong>Not giving conversation hooks.</strong> If someone can't think of what to say after reading your prompt, you've made their job too hard.
            </p>
            <p className="leading-relaxed">
              <strong>Using all prompts for humor.</strong> Funny is great, but showing some depth matters too. Balance wit with substance.
            </p>
            <p className="leading-relaxed">
              <strong>Playing it safe.</strong> Generic answers attract generic people. Having a clear point of view helps you find compatible matches faster.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Simple Hinge Prompt Strategy</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li><strong>One prompt about what you want.</strong> Be honest about the connection you're seeking.</li>
              <li><strong>One prompt showing interests or lifestyle.</strong> Paint a picture of what spending time with you looks like.</li>
              <li><strong>One prompt with a hook.</strong> Give them something specific to comment on or ask about.</li>
            </ol>
          </section>

          <section className="my-12">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-8 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Want Personalized Hinge Prompt Feedback?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Upload your profile screenshots and get AI-powered suggestions tailored to you.
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
            <h2 className="text-2xl font-bold mt-10 mb-4">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Should I mention what I'm looking for directly?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes. Being clear about wanting something serious (or casual) saves everyone time and attracts people who want the same thing.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">How personal should I get?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Personal enough to be memorable, but save the deep stuff for actual conversations. Think first-date appropriate, not therapy session.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-8 mt-12">
            <p className="text-muted-foreground leading-relaxed">
              The best Hinge profiles feel like you already know something about the person before matching. For more help, try our <Link href="/fix-profile" className="text-primary underline">profile analyzer</Link>. If you're getting matches but conversations die, our <Link href="/fix-reply" className="text-primary underline">reply helper</Link> can help with that too.
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
