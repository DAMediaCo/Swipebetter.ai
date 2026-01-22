import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Camera, ArrowLeft, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function HingePromptsMen() {
  useEffect(() => {
    document.title = "Best Hinge Prompts for Men in 2024";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover the best Hinge prompts for men with real examples and tips to get more matches and better conversations.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Discover the best Hinge prompts for men with real examples and tips to get more matches and better conversations.';
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
            Best Hinge Prompts for Men That Actually Get Responses
          </h1>
          <p className="text-lg text-muted-foreground">
            The prompts that work, the ones that don't, and how to write answers that start conversations.
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
          <section>
            <p className="text-lg leading-relaxed">
              Hinge prompts are your chance to show personality beyond your photos. But most men either pick the wrong prompts or give answers so generic they blend into every other profile. The result? Fewer likes and even fewer messages.
            </p>
            <p className="leading-relaxed">
              The good news is that with a few adjustments, your prompts can become genuine conversation starters. This guide covers which prompts to choose, how to answer them, and the mistakes that tank most profiles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Why Hinge Prompts Matter More Than You Think</h2>
            <p className="leading-relaxed">
              Unlike Tinder's single bio, Hinge gives you three prompts. That's three opportunities to show who you are and give someone a reason to reach out. Women on Hinge can like specific prompts, making it easier for them to start conversations.
            </p>
            <p className="leading-relaxed">
              But this also means weak prompts hurt you more. If all three answers are boring, you've wasted your best chance to stand out. The profiles that perform best use prompts strategically, not randomly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">The Best Hinge Prompts for Men</h2>
            <p className="leading-relaxed mb-4">
              Not all prompts are created equal. Here are the ones that consistently perform well:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-foreground">"I'm looking for..."</strong> - Sets clear expectations and filters for compatibility.</li>
              <li><strong className="text-foreground">"A life goal of mine..."</strong> - Shows ambition without bragging.</li>
              <li><strong className="text-foreground">"The way to win me over is..."</strong> - Invites engagement and gives an easy opener.</li>
              <li><strong className="text-foreground">"I geek out on..."</strong> - Reveals genuine interests in a relatable way.</li>
              <li><strong className="text-foreground">"My simple pleasures..."</strong> - Shows you appreciate the little things.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Hinge Prompt Examples: Before and After</h2>
            <p className="leading-relaxed mb-6">
              Here's what transforming a weak answer into a strong one looks like:
            </p>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-foreground/80 mb-3">Prompt: "I'm looking for..."</p>
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Before</p>
                      <p className="text-foreground/80 italic">"Someone who doesn't take themselves too seriously"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">After</p>
                      <p className="italic">"Someone to explore new restaurants with and debate whether the appetizer or dessert was better"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-foreground/80 mb-3">Prompt: "The way to win me over is..."</p>
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Before</p>
                      <p className="text-foreground/80 italic">"Good conversation and a sense of humor"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">After</p>
                      <p className="italic">"Send me a song recommendation. If it's good, I'll share my coffee shop tier list"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-foreground/80 mb-3">Prompt: "I geek out on..."</p>
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Before</p>
                      <p className="text-foreground/80 italic">"Sports and music"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">After</p>
                      <p className="italic">"NBA trade rumors and perfecting my homemade pizza dough (currently on attempt #47)"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <p className="leading-relaxed mt-6">
              Notice the difference? Specific details beat generic statements every time. If you want tailored feedback on your own prompts, <Link href="/fix-profile" className="text-primary underline">get your profile analyzed here</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Common Hinge Prompt Mistakes</h2>
            <p className="leading-relaxed">
              <strong className="text-foreground">Being too vague.</strong> "I love music" tells someone nothing. "I've been to 15 concerts this year" tells a story.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">Using all three prompts the same way.</strong> Variety matters. Mix serious with playful, interests with goals.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">Self-deprecating humor overdone.</strong> One joke about being bad at something is fine. Three makes you seem insecure.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">Leaving no conversation hook.</strong> Great answers make it easy to respond. Give people something to ask about.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Simple Framework for Hinge Prompts</h2>
            <p className="leading-relaxed mb-4">
              Use this structure for each prompt answer:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li><strong className="text-foreground">One prompt about what you're looking for.</strong> Be specific but not demanding.</li>
              <li><strong className="text-foreground">One prompt showing personality or interests.</strong> Make it specific and memorable.</li>
              <li><strong className="text-foreground">One prompt that invites engagement.</strong> Give them an easy way to message you.</li>
            </ol>
          </section>

          <section className="my-12">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-8 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Want Personalized Hinge Prompt Feedback?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Upload your profile screenshots and get AI-powered suggestions for better prompts.
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
                <h3 className="font-semibold mb-2 text-foreground">Should I use humor in all my prompts?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  No. Mix it up. One funny answer is great, but showing depth matters too. Balance humor with genuine interests or goals.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">How often should I change my prompts?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  If you're not getting the results you want after 1-2 weeks, try new answers. Testing different approaches is key.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">Do prompts matter more than photos?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Photos get you noticed, but prompts get you messages. Both matter, but strong prompts are what turn a like into a conversation.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-8 mt-12">
            <p className="text-foreground/80 leading-relaxed">
              Great Hinge prompts aren't about being clever. They're about being specific and giving someone a reason to reach out. For more personalized help, try our <Link href="/fix-profile" className="text-primary underline">profile analyzer</Link>. And if you're matching but struggling with what to say, check out our <Link href="/fix-reply" className="text-primary underline">reply suggestions</Link>.
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
