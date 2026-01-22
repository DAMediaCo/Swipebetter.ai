import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, MessageCircle, ArrowLeft, ArrowRight, Copy, Zap, Heart, Laugh } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const replyCategories = [
  {
    category: "Funny Replies",
    icon: "funny",
    description: "Light, playful responses that show personality without trying too hard.",
    replies: [
      {
        text: "Hey! That's my line. Now we're stuck in a loop.",
        why: "Self-aware humor about the awkwardness of the situation. Shows you have a sense of humor without being mean about her opener."
      },
      {
        text: "Hey back! I appreciate you breaking the ice. I'll handle the conversation from here.",
        why: "Takes control in a confident but friendly way. Shows you're not bothered by the simple opener and you're ready to lead."
      },
      {
        text: "Hey! Bold choice. I respect a woman who commits to the classics.",
        why: "Playful teasing that's clearly a joke. The word 'respect' keeps it positive instead of critical."
      },
    ]
  },
  {
    category: "Smooth Replies",
    icon: "smooth",
    description: "Confident responses that transition naturally into conversation.",
    replies: [
      {
        text: "Hey yourself. I noticed [something specific from her profile]. Tell me more about that.",
        why: "Immediately moves past the 'hey' and into a real conversation. Shows you actually looked at her profile."
      },
      {
        text: "Hey! Okay I'll start - what's the best thing that happened to you this week?",
        why: "Takes initiative without making a big deal about the opener. Gives her something interesting to respond to."
      },
      {
        text: "Hey! Quick question: [relevant question about her photos/bio]?",
        why: "Cuts straight to engagement. Shows you're interested in getting to know her, not playing games."
      },
    ]
  },
  {
    category: "Bold Replies",
    icon: "bold",
    description: "Confident, direct responses for when you want to stand out.",
    replies: [
      {
        text: "Hey! I'll forgive the opener if you tell me your most controversial opinion.",
        why: "Playfully calls out the basic opener while immediately making things interesting. High risk, high reward."
      },
      {
        text: "Hey! Strong opener. I'm giving it a 6/10. You can improve your score over coffee.",
        why: "Confident and forward. Only use this if your profile backs up the confidence."
      },
      {
        text: "Hey! I accept. When are you free this week?",
        why: "Skips the small talk entirely. Works best when there's clear mutual interest based on profiles."
      },
      {
        text: "Hey is how I greet my coworkers. Try again?",
        why: "Direct challenge that can work with the right person. Use carefully - it can come across as demanding."
      },
    ]
  },
];

export default function HowToReplyToHeyOnBumble() {
  const { toast } = useToast();

  useEffect(() => {
    document.title = "How to Reply to 'Hey' on Bumble: 10 Responses That Actually Work | SwipeBetter";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', "She messaged first but it's boring. Here are 10 copy-paste replies to 'hey' on Bumble that save the conversation, from funny to bold.");
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = "She messaged first but it's boring. Here are 10 copy-paste replies to 'hey' on Bumble that save the conversation, from funny to bold.";
      document.head.appendChild(meta);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      meta.content = "How to Reply to 'Hey' on Bumble: 10 Responses That Work";
      document.head.appendChild(meta);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      meta.content = "Copy-paste replies to 'hey' on Bumble that save boring conversations. From funny to bold.";
      document.head.appendChild(meta);
    }
  }, []);

  const copyReply = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Reply copied to clipboard",
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
            How to Reply to "Hey" on Bumble: 10 Responses That Actually Work
          </h1>
          <p className="text-lg text-muted-foreground">
            She messaged first, but it's boring. Here's how to save the conversation.
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
          <section>
            <p className="text-lg leading-relaxed">
              You matched with someone you're actually interested in. She messaged first (thanks, Bumble). And then... "Hey."
            </p>
            <p className="leading-relaxed">
              It's not her fault. Coming up with openers is hard, and Bumble puts the pressure on women to go first. Most default to "hey" because it's safe. But now you're stuck with the task of turning three letters into an actual conversation.
            </p>
            <p className="leading-relaxed">
              Good news: this is actually an opportunity. Most guys either respond with their own boring "hey" or get weirdly aggressive about it. Stand out by being normal, funny, or interesting. Here's how.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Why "Hey" Isn't a Red Flag</h2>
            <p className="leading-relaxed">
              Before we get into responses, let's clear something up: "hey" doesn't mean she's not interested. It usually means she:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-foreground/80">
              <li>Didn't know what to say but wanted to keep the match alive</li>
              <li>Is testing to see if you're interesting enough to invest more effort</li>
              <li>Is messaging multiple people and conserving energy</li>
              <li>Just isn't great at openers (most people aren't)</li>
            </ul>
            <p className="leading-relaxed mt-4">
              Your job is to make the conversation easy and fun. Don't punish her for a weak opener. Carry the load for a bit and see if she picks up.
            </p>
          </section>

          <section className="my-12">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-8 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Get Your Free Profile Score</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Not getting matches in the first place? Your profile might be the problem. Get instant AI feedback.
                </p>
                <Link href="/fix-profile">
                  <Button size="lg" className="mt-2" data-testid="button-cta-mid">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get Free Score
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          {replyCategories.map((category, categoryIndex) => (
            <section key={categoryIndex}>
              <h2 className="text-2xl font-bold mt-10 mb-2 text-foreground flex items-center gap-2">
                {category.icon === "funny" && <Laugh className="w-6 h-6 text-primary" />}
                {category.icon === "smooth" && <Heart className="w-6 h-6 text-primary" />}
                {category.icon === "bold" && <Zap className="w-6 h-6 text-primary" />}
                {category.category}
              </h2>
              <p className="text-foreground/80 mb-4">{category.description}</p>
              <div className="space-y-4">
                {category.replies.map((reply, replyIndex) => (
                  <Card 
                    key={replyIndex} 
                    className="hover-elevate cursor-pointer"
                    onClick={() => copyReply(reply.text)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <p className="font-medium text-foreground">"{reply.text}"</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyReply(reply.text);
                          }}
                          data-testid={`button-copy-reply-${categoryIndex}-${replyIndex}`}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-foreground/80">
                        <strong className="text-foreground">Why it works:</strong> {reply.why}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">What NOT to Do</h2>
            <p className="leading-relaxed">
              <strong className="text-foreground">Don't reply with just "Hey" back.</strong> You're now both stuck. Someone has to make the first real move, and since she already messaged, it's your turn.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">Don't lecture her about bad openers.</strong> Nothing kills attraction faster than "Is that really the best you could do?" You're not her dating coach.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">Don't overthink it.</strong> She swiped right on you. She messaged. She's interested enough. Just be normal and interesting.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">The Real Strategy</h2>
            <p className="leading-relaxed">
              The best response to "hey" is one that:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4 text-foreground">
              <li><strong className="text-foreground">Acknowledges the message</strong> without making it awkward</li>
              <li><strong className="text-foreground">Gives her something to respond to</strong> (a question or hook)</li>
              <li><strong className="text-foreground">Shows your personality</strong> in some small way</li>
            </ol>
            <p className="leading-relaxed mt-4">
              That's it. You don't need the perfect line. You need to move the conversation forward in a way that's easy for her to engage with.
            </p>
          </section>

          <section className="my-12">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-8 text-center space-y-4">
                <MessageCircle className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Stuck in a Chat? Let AI Help</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Our Rizz Assistant analyzes your conversation and suggests the perfect reply for any situation.
                </p>
                <Link href="/fix-reply">
                  <Button size="lg" className="mt-2" data-testid="button-cta-rizz">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Try Rizz Assistant
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 text-foreground">What if she doesn't respond to my reply?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Give it 24-48 hours, then try one more message. If nothing after that, move on. Some matches just don't go anywhere, and that's normal.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">Should I use a pickup line?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Generally no. Pickup lines work better as openers than responses. When replying to "hey," something conversational usually works better than something cheesy.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">How long should I wait to respond?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Don't play games. Respond when you see it and have time to write a real response. Playing hard to get over text just kills momentum.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-8 mt-12">
            <p className="text-foreground/80 leading-relaxed">
              A "hey" is just the start of a conversation, not a reflection of how interested she is. Pick a response that fits your style, don't overthink it, and move things forward. If you're consistently struggling with conversations, our <Link href="/fix-reply" className="text-primary underline">Rizz Assistant</Link> can help you figure out what to say next.
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
