import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, MessageSquare, ArrowLeft, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function ReviveDeadConversation() {
  useEffect(() => {
    document.title = "How to Revive a Dead Dating App Conversation";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn how to revive dead dating app conversations with examples that actually get responses. Save those stalled matches.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Learn how to revive dead dating app conversations with examples that actually get responses. Save those stalled matches.';
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
            How to Revive a Dead Dating App Conversation
          </h1>
          <p className="text-lg text-muted-foreground">
            What to say when a conversation stalls and how to get things moving again.
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
          <section>
            <p className="text-lg leading-relaxed">
              You were having a great conversation, then suddenly nothing. No response for days. It happens to everyone, and it doesn't always mean they're not interested. People get busy, forget to reply, or just didn't know what to say.
            </p>
            <p className="leading-relaxed">
              The good news is that dead conversations can often be revived with the right approach. The key is being low-pressure, giving them an easy way to re-engage, and not making it weird.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Why Conversations Die</h2>
            <p className="leading-relaxed">
              Understanding why conversations stall helps you respond better. Common reasons include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>They got busy and forgot to respond</li>
              <li>Your last message was hard to answer or didn't ask anything</li>
              <li>The conversation felt like an interview, not a chat</li>
              <li>They're talking to multiple people and you got lost in the shuffle</li>
              <li>They weren't sure what to say next</li>
            </ul>
            <p className="leading-relaxed mt-4">
              Notice that most of these aren't rejection. They're just friction that needs a little push to overcome.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">How to Revive a Dead Conversation</h2>
            
            <h3 className="text-xl font-semibold mt-8 mb-4 text-foreground">The Casual Check-In</h3>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="leading-relaxed">
                  After a few days of silence, send something light that doesn't make them feel bad for not responding:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>"Hey! How'd that [thing they mentioned] go?"</li>
                  <li>"Random question: [low-stakes question related to earlier conversation]?"</li>
                  <li>"Hope your week is going well! Any exciting plans?"</li>
                </ul>
              </CardContent>
            </Card>

            <h3 className="text-xl font-semibold mt-8 mb-4 text-foreground">The Callback</h3>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="leading-relaxed">
                  Reference something from your earlier conversation:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>"I just tried that restaurant you mentioned. You were right about the tacos!"</li>
                  <li>"Saw something that reminded me of our conversation about [topic]..."</li>
                  <li>"Update: I finally watched that show you recommended. Verdict: you have good taste."</li>
                </ul>
              </CardContent>
            </Card>

            <h3 className="text-xl font-semibold mt-8 mb-4 text-foreground">The Direct Approach</h3>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="leading-relaxed">
                  Sometimes being direct is the best approach:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>"Hey, I know we got a bit lost in the shuffle. Want to grab coffee this week?"</li>
                  <li>"I feel like our conversation faded. Still interested in meeting up sometime?"</li>
                  <li>"Life gets busy! Still want to continue this chat or should I take the hint?"</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Revival Examples: What Works</h2>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Awkward</p>
                      <p className="text-foreground/80 italic">"Hello?? Did you forget about me?"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">Better</p>
                      <p className="italic">"Hey! Hope you had a good week. Any chance you want to continue this conversation over coffee?"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Passive aggressive</p>
                      <p className="text-foreground/80 italic">"Guess you're not interested then..."</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">Better</p>
                      <p className="italic">"Hey! Thought of you when I saw [relevant thing]. Hope you're doing well!"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">When to Move On</h2>
            <p className="leading-relaxed">
              One follow-up message is reasonable. If they don't respond to that either, it's time to move on. Sending multiple messages without a response crosses into annoying territory.
            </p>
            <p className="leading-relaxed">
              Signs it's not worth reviving:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>They've never responded enthusiastically</li>
              <li>You've already sent one unanswered follow-up</li>
              <li>Their responses were always short or one-word</li>
              <li>It's been more than 2 weeks</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Preventing Conversations from Dying</h2>
            <p className="leading-relaxed">
              Prevention is better than revival. Here's how to keep conversations going:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Always end messages with questions or something easy to respond to</li>
              <li>Move to meeting up within 5-10 messages. Long text conversations lose steam</li>
              <li>Share things about yourself, don't just ask questions</li>
              <li>Match their energy and response length</li>
              <li>If texting feels stale, suggest a phone call or video chat</li>
            </ul>
          </section>

          <section className="my-12">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-8 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Stuck on What to Say?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Upload your conversation screenshot and get AI-powered suggestions to revive it.
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
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 text-foreground">How long should I wait before following up?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  3-5 days is usually a good window. Long enough that you're not being pushy, short enough that they still remember the conversation.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">Should I apologize for double texting?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  No. One follow-up is normal and nothing to apologize for. Just be casual about it.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">What if they respond but seem less interested?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Suggest meeting up. If they're interested, they'll make it happen. If not, you have your answer.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-8 mt-12">
            <p className="text-foreground/80 leading-relaxed">
              Dead conversations happen to everyone. The key is being casual, giving them an easy out, and knowing when to move on. For more help with messaging, try our <Link href="/fix-reply" className="text-primary underline">reply helper</Link>. And if you want more quality matches to start with, check out our <Link href="/fix-profile" className="text-primary underline">profile analyzer</Link>.
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
