import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Camera, ArrowLeft, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function TinderBioGuide() {
  useEffect(() => {
    document.title = "How to Write a Tinder Bio That Gets Matches";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn how to write a Tinder bio that actually works, with real examples, tips, and common mistakes to avoid.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Learn how to write a Tinder bio that actually works, with real examples, tips, and common mistakes to avoid.';
      document.head.appendChild(meta);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      meta.content = 'How to Write a Tinder Bio That Gets Matches';
      document.head.appendChild(meta);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      meta.content = 'Learn how to write a Tinder bio that actually works, with real examples, tips, and common mistakes to avoid.';
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
            How to Write a Tinder Bio That Actually Works
          </h1>
          <p className="text-lg text-muted-foreground">
            A practical guide to writing a bio that gets matches, not eye rolls.
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
          <section>
            <p className="text-lg leading-relaxed">
              Most Tinder bios don't work. Not because people aren't interesting, but because they don't know how to translate who they are into a few lines of text. The result? Generic phrases, awkward jokes, or bios so vague they could describe anyone.
            </p>
            <p className="leading-relaxed">
              The good news is that writing a bio that actually gets matches isn't about being the funniest person or having the most exciting life. It's about clarity, authenticity, and giving someone a reason to swipe right and start a conversation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">What a Good Tinder Bio Actually Does</h2>
            <p className="leading-relaxed">
              A good bio serves three purposes. First, it shows your personality. Not a list of traits, but a genuine sense of who you are. Second, it provides easy conversation hooks. Something specific that makes it easy for someone to message you. Third, it sets expectations. Whether you're looking for something serious or casual, the right bio attracts the right people.
            </p>
            <p className="leading-relaxed">
              Think of your bio as a conversation starter, not a resume. You don't need to list everything about yourself. You just need to give people enough to feel like they know what they're getting into.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Tinder Bio Length: What Actually Works</h2>
            <p className="leading-relaxed">
              Short bios (1-2 lines) work well when your photos are strong and do most of the talking. A quick, punchy line can be effective if it's genuinely clever or intriguing.
            </p>
            <p className="leading-relaxed">
              Medium-length bios (3-5 lines) tend to perform best for most people. They give you enough space to show personality without overwhelming anyone. This is the sweet spot.
            </p>
            <p className="leading-relaxed">
              Longer bios can work if you're looking for something specific or want to filter heavily. But be careful. More words doesn't mean better. Every sentence should earn its place.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Good Tinder Bio Examples: Before and After</h2>
            <p className="leading-relaxed mb-6">
              Here's what the difference looks like in practice. These aren't templates to copy. They're examples of how small changes make a big difference.
            </p>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Before</p>
                      <p className="text-muted-foreground italic">"I love to laugh and have fun. Looking for my partner in crime."</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">After</p>
                      <p className="italic">"Software engineer by day, terrible cook by night. Currently accepting applications for someone to teach me how to make pasta that doesn't stick together."</p>
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
                      <p className="text-muted-foreground italic">"Just ask."</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">After</p>
                      <p className="italic">"Marketing manager, weekend hiker, weeknight Netflix binger. Ask me about the best trail near the city or my controversial take on pineapple pizza."</p>
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
                      <p className="text-muted-foreground italic">"Looking for someone real. No games."</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">After</p>
                      <p className="italic">"Teacher who reads too many books and watches too much basketball. Looking for someone who wants to grab coffee and talk about absolutely nothing important."</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <p className="leading-relaxed mt-6">
              Notice the pattern? The "after" versions are specific, show personality, and give someone an easy way to start a conversation. If you want personalized feedback on your own bio, you can <Link href="/fix-profile" className="text-primary underline">get your profile analyzed here</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Common Tinder Bio Mistakes</h2>
            <p className="leading-relaxed">
              <strong className="text-foreground">Trying too hard to be funny.</strong> Humor is great, but forced jokes fall flat. If a line doesn't come naturally, leave it out. Genuine beats clever every time.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">Listing traits instead of showing them.</strong> Saying you're "funny and adventurous" tells someone nothing. Showing it through a specific detail or story is much more effective.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">Inside jokes no one understands.</strong> References that only make sense to you (or a small group) don't translate. Keep it accessible.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">Being negative.</strong> Bios that focus on what you don't want ("no drama," "swipe left if...") come across as bitter. Focus on what you're looking for instead.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">A Simple Tinder Bio Framework</h2>
            <p className="leading-relaxed mb-4">
              If you're stuck, try this simple structure:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li><strong className="text-foreground">One sentence about what you do or who you are.</strong> Keep it simple and real.</li>
              <li><strong className="text-foreground">One sentence about your interests or lifestyle.</strong> Something specific that shows personality.</li>
              <li><strong className="text-foreground">One light hook or invitation.</strong> Give someone an easy way to message you.</li>
            </ol>
            <p className="leading-relaxed mt-4">
              That's it. You don't need more than this. The goal isn't to tell your life story. It's to start a conversation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">When to Rewrite Your Bio</h2>
            <p className="leading-relaxed">
              If you're getting fewer matches than expected, your bio might be the problem. This is especially true if your photos are solid but conversations aren't starting.
            </p>
            <p className="leading-relaxed">
              Dead conversations after matching often mean your bio didn't give people anything to talk about. Adding specific hooks can fix this.
            </p>
            <p className="leading-relaxed">
              If your profile feels outdated or no longer represents you, it's time for a refresh. Your bio should reflect who you are now, not who you were a year ago.
            </p>
          </section>

          <section className="my-12">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-8 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Want Personalized Feedback on Your Tinder Bio?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Upload your profile screenshots and get AI-powered feedback tailored to you.
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
                <h3 className="font-semibold mb-2 text-foreground">Does this advice work for other dating apps?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Yes. The principles here apply to Hinge, Bumble, and most other dating apps. The format might differ slightly (Hinge uses prompts instead of a bio), but the core ideas about clarity, specificity, and conversation hooks remain the same.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">Should I mention my hobbies?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Only if they're specific and interesting. "I like music" says nothing. "I've seen the same band live four times" says a lot. Pick one or two things that actually reveal something about you.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">How often should I update my bio?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Every few months, or whenever your life changes significantly. If you're not getting results, try testing different versions. Small tweaks can make a big difference.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-8 mt-12">
            <p className="text-foreground/80 leading-relaxed">
              Writing a good Tinder bio takes a bit of thought, but it's not complicated. Be specific, be genuine, and give people something to talk about. If you want more help, our <Link href="/fix-profile" className="text-primary underline">profile analysis tool</Link> can give you personalized suggestions. And if you're matching but struggling with conversations, check out our <Link href="/fix-reply" className="text-primary underline">reply helper</Link> for message ideas.
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
