import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, MessageSquare, ArrowLeft, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function BumbleOpenerLines() {
  useEffect(() => {
    document.title = "Best Bumble Opener Lines That Get Responses";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn the best Bumble opener lines with examples that actually get responses. Stop sending "Hey" and start real conversations.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Learn the best Bumble opener lines with examples that actually get responses. Stop sending "Hey" and start real conversations.';
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
            Best Bumble Opener Lines That Actually Get Responses
          </h1>
          <p className="text-lg text-muted-foreground">
            What to say first on Bumble (and what to avoid) to start conversations that go somewhere.
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <p className="text-lg leading-relaxed">
              On Bumble, women make the first move. But with a 24-hour window and plenty of matches to choose from, most openers get ignored. The problem isn't that people are picky. It's that most first messages don't give anyone a reason to respond.
            </p>
            <p className="leading-relaxed">
              A good opener does three things: it shows you looked at their profile, it's easy to respond to, and it feels like the start of a conversation, not an interview question. Here's how to do that.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Why Most Bumble Openers Fail</h2>
            <p className="leading-relaxed">
              "Hey" and "Hi, how are you?" fail because they put all the effort on the other person. There's nothing to respond to. It feels like small talk, and small talk is boring.
            </p>
            <p className="leading-relaxed">
              On the other end, super long or overly clever messages can feel like too much too soon. The sweet spot is short, specific, and easy to respond to.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Bumble Opener Examples: What Works</h2>
            <p className="leading-relaxed mb-6">
              The best openers reference something specific from their profile. Here's what that looks like:
            </p>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Generic</p>
                      <p className="text-muted-foreground italic">"Hey! How's your week going?"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">Specific</p>
                      <p className="italic">"I saw you went to Japan! What was the best thing you ate there?"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Generic</p>
                      <p className="text-muted-foreground italic">"You seem cool, what do you do for fun?"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">Specific</p>
                      <p className="italic">"Okay I need to know, is that a golden retriever or a lab? Also, does he/she have an Instagram?"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Generic</p>
                      <p className="text-muted-foreground italic">"Your profile is really interesting!"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">Specific</p>
                      <p className="italic">"Wait, you make your own pasta? I've tried twice and somehow ended up with soup both times. What's your secret?"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Opener Formulas That Work</h2>
            <p className="leading-relaxed mb-4">
              If you're stuck, try one of these formats:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>The specific question:</strong> "I saw [detail from profile]. [Question about it]?"</li>
              <li><strong>The playful challenge:</strong> "Okay, I have to ask... [light opinion/question]"</li>
              <li><strong>The shared interest:</strong> "Another [hobby] person! [Follow-up question]"</li>
              <li><strong>The compliment + question:</strong> "That [photo/detail] is great. [Question about it]?"</li>
            </ul>
            <p className="leading-relaxed mt-4">
              If their profile doesn't give you much to work with, that's okay. A simple observation or light question still beats "Hey."
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Common Bumble Opener Mistakes</h2>
            <p className="leading-relaxed">
              <strong>Being too generic.</strong> If your opener could work for anyone, it probably won't work for anyone.
            </p>
            <p className="leading-relaxed">
              <strong>Overthinking it.</strong> You don't need a perfect line. You just need something easy to respond to.
            </p>
            <p className="leading-relaxed">
              <strong>Making it about yourself.</strong> Save your stories for the conversation. The opener should focus on them.
            </p>
            <p className="leading-relaxed">
              <strong>Being too forward too fast.</strong> Keep it friendly. There's plenty of time to flirt once you're actually talking.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">What to Do When Their Profile Is Empty</h2>
            <p className="leading-relaxed">
              Sometimes profiles don't give you much. In that case, go with something light and playful:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>"Okay, I'll start: coffee or tea, and why is it the right answer?"</li>
              <li>"Your photos look fun but tell me nothing. What's the most random fact about you?"</li>
              <li>"I'm taking a chance here with no bio info. Pizza topping opinions, go."</li>
            </ul>
            <p className="leading-relaxed mt-4">
              These work because they're low-pressure and give them something easy to answer.
            </p>
          </section>

          <section className="my-12">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-8 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Not Sure What to Say Next?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Upload your conversation screenshot and get AI-powered reply suggestions.
                </p>
                <Link href="/fix-reply">
                  <Button size="lg" className="mt-2" data-testid="button-cta-fix-reply">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Fix My Reply
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Does the opener really matter that much?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes and no. A great opener won't save a bad profile, but a bad opener can kill a good match. It's the difference between starting a conversation and getting ghosted.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Should I use the same opener for everyone?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ideally, no. Personalized openers get better responses. But if you're short on time, have a few go-to options that work for most profiles.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">What if they don't respond?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Don't take it personally. People get busy, matches expire, or the timing wasn't right. Move on and try again with someone new.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-8 mt-12">
            <p className="text-muted-foreground leading-relaxed">
              Good openers are specific, easy to respond to, and feel like the start of a real conversation. If you want help improving your profile to get more matches in the first place, try our <Link href="/fix-profile" className="text-primary underline">profile analyzer</Link>. For help with ongoing conversations, our <Link href="/fix-reply" className="text-primary underline">reply tool</Link> has you covered.
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
