import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Camera, ArrowLeft, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function HingeProfileTips() {
  useEffect(() => {
    document.title = "Hinge Profile Tips to Get More Matches";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Complete Hinge profile tips guide with advice on photos, prompts, and settings to maximize your matches.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Complete Hinge profile tips guide with advice on photos, prompts, and settings to maximize your matches.';
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
            Hinge Profile Tips: Everything You Need to Get More Matches
          </h1>
          <p className="text-lg text-muted-foreground">
            A complete guide to building a Hinge profile that stands out and starts real conversations.
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
          <section>
            <p className="text-lg leading-relaxed">
              Hinge is designed to be deleted, which means it rewards profiles that lead to real connections. Unlike swipe-heavy apps, Hinge gives you more space to show your personality through photos, prompts, and profile details. But most people don't use that space well.
            </p>
            <p className="leading-relaxed">
              This guide covers everything you need to optimize your Hinge profile: from choosing the right photos to writing prompts that get responses to using the app's features to your advantage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Hinge Photo Strategy</h2>
            <p className="leading-relaxed">
              You get six photo slots on Hinge, and the order matters. Your first photo should be a clear, well-lit headshot with a genuine expression. This is what people see first in their feed.
            </p>
            <p className="leading-relaxed">
              The remaining photos should show variety: a full body shot, an activity photo, something with friends, and something that hints at your interests. Avoid all selfies, all group shots, or all travel photos. Mix it up.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Lead with your face, not an activity or scenery shot</li>
              <li>Include at least one full body photo</li>
              <li>Show yourself doing things you actually enjoy</li>
              <li>Avoid sunglasses in more than one photo</li>
              <li>No photos with other people cropped out</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Prompt Selection and Answers</h2>
            <p className="leading-relaxed">
              Prompts are where Hinge profiles succeed or fail. You have three chances to show personality and give someone a reason to message you. The key is being specific and leaving conversation hooks.
            </p>
            <div className="space-y-4 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Too vague</p>
                      <p className="text-foreground/80 italic">"I'm looking for someone who can make me laugh"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">Specific and memorable</p>
                      <p className="italic">"I'm looking for someone to try every taco spot in the city with. I have a spreadsheet and strong opinions."</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <p className="leading-relaxed mt-4">
              Choose prompts that work well together. One about what you're looking for, one about your personality or interests, and one that invites conversation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Profile Details That Matter</h2>
            <p className="leading-relaxed">
              Don't skip the basics. Height, job, education, and location all matter to people filtering matches. Leaving them blank means you might get filtered out before anyone sees your prompts.
            </p>
            <p className="leading-relaxed">
              The "Vitals" section (drinking, smoking, politics, etc.) also helps with compatibility filtering. Being honest here saves everyone time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Common Hinge Profile Mistakes</h2>
            <p className="leading-relaxed">
              <strong className="text-foreground">Generic prompts.</strong> Answers that could apply to anyone don't help you stand out.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">Bad photo order.</strong> Your best photo should be first. Period.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">No conversation hooks.</strong> Every prompt should make it easy for someone to message you about something specific.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">Negative energy.</strong> Profiles focused on what you don't want come across as jaded. Focus on what you're excited about instead.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">Incomplete profiles.</strong> Empty sections make you look like you're not taking it seriously.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Using Hinge Features Effectively</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-foreground">Voice prompts:</strong> A short audio clip can set you apart. Keep it natural and under 10 seconds.</li>
              <li><strong className="text-foreground">Video prompts:</strong> If comfortable on camera, these get more engagement than photos alone.</li>
              <li><strong className="text-foreground">Roses:</strong> Save these for profiles you really like. They signal extra interest.</li>
              <li><strong className="text-foreground">Standouts:</strong> Check these daily for compatible matches you might have missed.</li>
            </ul>
          </section>

          <section className="my-12">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-8 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Want Personalized Hinge Profile Feedback?</h3>
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
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 text-foreground">How long does it take to see results from profile changes?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Give it at least a week. Hinge's algorithm needs time to show your profile to new people after significant changes.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">Should I pay for Hinge+?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Not necessary for most people. Focus on your profile quality first. Premium features help more when your profile is already working.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-8 mt-12">
            <p className="text-foreground/80 leading-relaxed">
              A great Hinge profile shows who you are clearly and makes it easy to start a conversation. For personalized feedback, try our <Link href="/fix-profile" className="text-primary underline">profile analyzer</Link>. Once you're matching, our <Link href="/fix-reply" className="text-primary underline">reply helper</Link> can help you keep conversations going.
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
