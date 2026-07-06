import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Sparkles, Camera } from "lucide-react";

const blogPosts = [
  {
    category: "Profile Tips",
    title: "15+ Tinder Bios for Engineers, Gamers & Nerds",
    description: "Smart, geeky, and actually attractive. Copy-paste bios that work for tech guys, gamers, and introverts.",
    href: "/blog/best-tinder-bios-for-engineers-and-nerds",
    isNew: true,
  },
  {
    category: "Conversation",
    title: "How to Reply to 'Hey' on Bumble",
    description: "She messaged first, but it's boring. 10 copy-paste replies that actually save the conversation.",
    href: "/blog/how-to-reply-to-hey-on-bumble",
    isNew: true,
  },
  {
    category: "Technical Guide",
    title: "Why Am I Getting No Matches?",
    description: "Diagnose the real reasons your dating profile is not getting matches and what to fix first.",
    href: "/blog/why-am-i-getting-no-matches",
    isNew: true,
  },
  {
    category: "Technical Guide",
    title: "Am I Shadowbanned on Tinder? (2026 Test)",
    description: "Getting 0 matches might mean a shadowban. Here's how to check and what to do about it.",
    href: "/blog/tinder-shadowban-test-2026",
    isNew: true,
  },
  {
    category: "Profile Tips",
    title: "How to Write a Tinder Bio That Works",
    description: "A practical guide to writing a bio that gets matches, not eye rolls.",
    href: "/tinder-bio-guide",
  },
  {
    category: "Profile Tips",
    title: "Best Hinge Prompts for Men",
    description: "The prompts that actually get responses, with examples you can adapt.",
    href: "/hinge-prompts-men",
  },
  {
    category: "Profile Tips",
    title: "Best Hinge Prompts for Women",
    description: "Stand out from generic profiles with prompts that spark real conversations.",
    href: "/hinge-prompts-women",
  },
  {
    category: "Conversation",
    title: "Bumble Opener Lines That Work",
    description: "First message ideas that get responses, not silence.",
    href: "/bumble-opener-lines",
  },
  {
    category: "Photo Tips",
    title: "Dating App Photo Guide",
    description: "What photos work best and how to order them for maximum matches.",
    href: "/dating-app-photos",
  },
  {
    category: "Profile Tips",
    title: "Hinge Profile Tips",
    description: "Optimize every section of your Hinge profile for better results.",
    href: "/hinge-profile-tips",
  },
  {
    category: "Profile Tips",
    title: "Bumble Bio Examples",
    description: "Bio examples for Bumble that actually get right swipes.",
    href: "/bumble-bio-examples",
  },
  {
    category: "Photo Tips",
    title: "Tinder Photo Order Guide",
    description: "The science of which photo goes first and why it matters.",
    href: "/tinder-photo-order",
  },
  {
    category: "Conversation",
    title: "What to Text After Matching",
    description: "Move from match to date with the right opening message.",
    href: "/what-to-text-after-matching",
  },
  {
    category: "Conversation",
    title: "How to Revive a Dead Conversation",
    description: "Bring back matches who stopped responding.",
    href: "/revive-dead-conversation",
  },
];

export default function Blog() {
  useEffect(() => {
    document.title = "Dating Tips & Guides | SwipeBetter Blog";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Expert dating app tips, profile guides, and conversation strategies. Learn how to get more matches on Tinder, Bumble, and Hinge.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Expert dating app tips, profile guides, and conversation strategies. Learn how to get more matches on Tinder, Bumble, and Hinge.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Dating Tips & Guides
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expert advice to improve your dating app profiles, photos, and conversations.
          </p>
        </header>

        <Card className="border-primary/50 bg-primary/5 mb-10">
          <CardContent className="py-8 text-center space-y-4">
            <Sparkles className="w-10 h-10 text-primary mx-auto" />
            <h2 className="text-xl font-bold">Get Your Free Profile Score</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Find out if your profile is working. Upload a screenshot and get instant AI feedback.
            </p>
            <Link href="/fix-profile">
              <Button size="lg" className="mt-2" data-testid="button-cta-top">
                <Camera className="w-5 h-5 mr-2" />
                Get Free Score
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {blogPosts.map((post, index) => (
            <Link key={index} href={post.href}>
              <Card className="hover-elevate cursor-pointer transition-all">
                <CardContent className="py-5 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-primary uppercase tracking-wide">
                        {post.category}
                      </span>
                      {post.isNew && (
                        <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-0.5 rounded">
                          NEW
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">{post.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <footer className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground mb-4">
            Want personalized help instead of general tips?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/fix-profile">
              <Button>
                <Camera className="w-4 h-4 mr-2" />
                Analyze My Profile
              </Button>
            </Link>
            <Link href="/fix-reply">
              <Button variant="outline">
                Fix My Reply
              </Button>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
