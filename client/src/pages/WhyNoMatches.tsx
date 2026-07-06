import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Camera, MessageSquare, Sparkles } from "lucide-react";

export default function WhyNoMatches() {
  useEffect(() => {
    document.title = "Why Am I Getting No Matches? Dating Profile Fix Guide";

    const description = "Learn why you are getting no matches on Tinder, Bumble, or Hinge and how to fix your photos, bio, prompts, and swipe behavior.";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = description;
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

        <header className="mb-10">
          <div className="text-sm text-primary font-medium mb-3">Profile Diagnosis</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Why Am I Getting No Matches?
          </h1>
          <p className="text-lg text-muted-foreground">
            If your dating profile is getting no matches, do not guess. Most profiles fail for one of four reasons:
            the first photo is weak, the profile gives people nothing to respond to, your swipe behavior is hurting
            distribution, or your app settings are too narrow.
          </p>
        </header>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Start With Your First Photo</h2>
          <p className="text-foreground/80 mb-4">
            Your first photo does most of the work. If it is blurry, dark, far away, heavily filtered, or hard to read
            in one second, people swipe before your bio gets a chance. Lead with a clear face, natural expression,
            good lighting, and a background that does not distract.
          </p>

          <Card className="border-primary/40 bg-primary/5 my-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Camera className="w-6 h-6 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Quick photo test</h3>
                  <p className="text-foreground/80 mb-0">
                    Cover your name and bio. If the first photo alone does not make the person look clear, approachable,
                    and interesting, fix the photo order before touching anything else.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Your Bio Might Be Too Generic</h2>
          <p className="text-foreground/80 mb-4">
            Empty lines like "just ask", "love to travel", or "fluent in sarcasm" do not give matches much to work
            with. A stronger bio includes one specific detail, one signal of lifestyle, and one easy conversation hook.
          </p>

          <div className="grid md:grid-cols-2 gap-4 my-8">
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-5">
                <p className="font-medium text-sm text-destructive mb-2">Weak</p>
                <p className="text-sm text-foreground/80 mb-0">"Work hard, play hard. Ask me anything."</p>
              </CardContent>
            </Card>
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-5">
                <p className="font-medium text-sm text-primary mb-2">Better</p>
                <p className="text-sm text-foreground/80 mb-0">
                  "Weekend coffee snob, beginner pickleball menace, and always looking for the best taco spot."
                </p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Your Prompts Are Not Creating Openings</h2>
          <p className="text-foreground/80 mb-4">
            On Hinge and Bumble, prompts should make replying easy. If every answer is vague, self-serious, or only
            attractive to you, matches have to do too much work. Give them something specific to ask about.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Your Swipe Behavior Can Hurt You</h2>
          <p className="text-foreground/80 mb-4">
            Swiping right on everyone can lower profile quality signals. Swiping too narrowly can starve the app of
            data. Keep your radius realistic, use current photos, and avoid deleting/recreating accounts repeatedly.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">What to Fix First</h2>
          <ol className="space-y-3 text-foreground/80">
            <li>Replace or reorder your first photo.</li>
            <li>Rewrite your bio with one specific hook.</li>
            <li>Change prompts that only say what everyone else says.</li>
            <li>Check age, distance, and dealbreaker filters.</li>
            <li>Send better opening messages when matches do come in.</li>
          </ol>

          <Card className="border-primary/50 bg-primary/5 my-10">
            <CardContent className="p-6 text-center space-y-4">
              <Sparkles className="w-10 h-10 text-primary mx-auto" />
              <h2 className="text-xl font-bold">Get a Clear Profile Diagnosis</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                SwipeBetter scores your photos, bio, and prompts so you know exactly what is blocking matches.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/fix-profile">
                  <Button size="lg" data-testid="button-fix-profile">
                    <Camera className="w-5 h-5 mr-2" />
                    Fix My Profile
                  </Button>
                </Link>
                <Link href="/fix-reply">
                  <Button size="lg" variant="outline" data-testid="button-fix-reply">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Fix My Reply
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Does no matches mean I am shadowbanned?</h3>
              <p className="text-foreground/80 mb-0">
                Usually no. A weak first photo, generic prompts, or poor app settings are more common than a true
                shadowban.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-foreground">How long should I wait before changing my profile?</h3>
              <p className="text-foreground/80 mb-0">
                If you get little or no activity after a week of normal use, improve your lead photo and bio before
                making major account changes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-foreground">What is the fastest fix?</h3>
              <p className="text-foreground/80 mb-0">
                Improve the first photo. Then add one specific bio detail that makes it easy for someone to message you.
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
