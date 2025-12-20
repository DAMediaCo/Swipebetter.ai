import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, MessageSquare, ArrowLeft, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function WhatToTextAfterMatching() {
  useEffect(() => {
    document.title = "What to Text After Matching on Dating Apps";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn what to text after matching on dating apps with examples that start real conversations, not dead ends.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Learn what to text after matching on dating apps with examples that start real conversations, not dead ends.';
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
            What to Text After Matching on Dating Apps
          </h1>
          <p className="text-lg text-muted-foreground">
            First message tips that actually work, plus examples for every situation.
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <p className="text-lg leading-relaxed">
              You matched with someone you're excited about. Now what? For most people, this is where things stall. They either send something so boring it gets ignored or overthink it so much they never message at all.
            </p>
            <p className="leading-relaxed">
              The truth is, first messages don't need to be perfect. They just need to be easy to respond to and show that you actually looked at their profile. Here's how to do that consistently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Why Most First Messages Fail</h2>
            <p className="leading-relaxed">
              "Hey" and "How are you?" fail because they put all the work on the other person. There's nothing to respond to. It's the texting equivalent of walking up to someone at a party and just staring at them.
            </p>
            <p className="leading-relaxed">
              On the other extreme, overly long or tryhard messages can feel overwhelming. The sweet spot is short, specific, and easy to answer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">First Message Examples That Work</h2>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Reference something from their profile</p>
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Generic</p>
                      <p className="text-muted-foreground italic">"Hey! How's your weekend going?"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">Specific</p>
                      <p className="italic">"That hiking photo looks amazing! Where was that taken?"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Ask about an interest</p>
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Generic</p>
                      <p className="text-muted-foreground italic">"So you like music?"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">Specific</p>
                      <p className="italic">"I saw you're into live music. What's the best concert you've been to recently?"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Be playful about a shared interest</p>
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Generic</p>
                      <p className="text-muted-foreground italic">"Cool, we both like coffee"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">Specific</p>
                      <p className="italic">"Another coffee person! Important question: oat milk or regular?"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">First Message Framework</h2>
            <p className="leading-relaxed mb-4">
              If you're stuck, use this simple formula:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li><strong>Notice something specific</strong> from their profile (photo, prompt, bio detail)</li>
              <li><strong>Make a brief comment or observation</strong> about it</li>
              <li><strong>Ask an easy question</strong> related to that thing</li>
            </ol>
            <p className="leading-relaxed mt-4">
              That's it. You don't need a perfect opener. You just need something that shows you paid attention and gives them an easy way to respond.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">What to Do When Their Profile Is Minimal</h2>
            <p className="leading-relaxed">
              Sometimes profiles don't give you much to work with. In that case, go for something light and low-pressure:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>"Your photos look fun but very mysterious. What's something random I should know about you?"</li>
              <li>"I'm curious, what made you swipe right?"</li>
              <li>"Tell me something good that happened to you this week"</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Common First Message Mistakes</h2>
            <p className="leading-relaxed">
              <strong>Opening with compliments about looks.</strong> "You're beautiful" is boring and can feel shallow. Comment on something they chose, not their genetics.
            </p>
            <p className="leading-relaxed">
              <strong>Asking interview questions.</strong> "What do you do for work?" is fine eventually, but it's not a great opener.
            </p>
            <p className="leading-relaxed">
              <strong>Being too casual too soon.</strong> Save the extreme casualness for after you've established rapport.
            </p>
            <p className="leading-relaxed">
              <strong>Waiting too long to message.</strong> Match momentum fades fast. Message within 24 hours if you're interested.
            </p>
          </section>

          <section className="my-12">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-8 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Not Sure What to Text?</h3>
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
                <h3 className="font-semibold mb-2">How long should I wait to message after matching?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Within 24 hours is ideal. Waiting too long can make it awkward or make them forget why they matched with you.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Should I use the same opener for everyone?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Personalized messages get better responses. But having a few go-to templates that you customize is perfectly fine.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">What if they don't respond?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Don't take it personally. People get busy, matches expire, timing isn't always right. Move on and try again with someone new.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-8 mt-12">
            <p className="text-muted-foreground leading-relaxed">
              Good first messages are specific, easy to respond to, and show you actually looked at their profile. For more help with messages, try our <Link href="/fix-reply" className="text-primary underline">reply helper</Link>. And if you want to improve your profile to get more matches in the first place, check out our <Link href="/fix-profile" className="text-primary underline">profile analyzer</Link>.
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
