import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Camera, ArrowLeft, ArrowRight, AlertTriangle, CheckCircle, XCircle, Eye } from "lucide-react";

export default function TinderShadowbanTest() {
  useEffect(() => {
    document.title = "Am I Shadowbanned on Tinder? How to Check (2026 Guide) | SwipeBetter";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Getting 0 matches on Tinder might mean a shadowban. Learn how to test if you are shadowbanned, what causes it, and how to reset your account.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Getting 0 matches on Tinder might mean a shadowban. Learn how to test if you are shadowbanned, what causes it, and how to reset your account.';
      document.head.appendChild(meta);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      meta.content = 'Am I Shadowbanned on Tinder? How to Check (2026 Guide)';
      document.head.appendChild(meta);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      meta.content = 'Getting 0 matches on Tinder? It might be a shadowban. Learn how to check and what to do about it.';
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
            Am I Shadowbanned on Tinder? How to Check (2026 Guide)
          </h1>
          <p className="text-lg text-muted-foreground">
            Getting 0 matches might mean a shadowban. Here's how to diagnose the problem.
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <p className="text-lg leading-relaxed">
              You've been swiping for days. Maybe weeks. And you're getting nothing. Not just fewer matches than usual - literally zero. If this sounds familiar, you might be dealing with a Tinder shadowban.
            </p>
            <p className="leading-relaxed">
              A shadowban is different from a regular ban. When you're shadowbanned, Tinder doesn't tell you anything is wrong. Your account looks normal. You can still swipe. But your profile is essentially invisible to other users. You're swiping into the void.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">What Is a Tinder Shadowban?</h2>
            <p className="leading-relaxed">
              A shadowban is when Tinder restricts your account without officially banning you. Your profile still exists, and you can use the app, but:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
              <li>Your profile is rarely (or never) shown to other users</li>
              <li>Even if someone swipes right on you, you might not match</li>
              <li>Your messages might not be delivered</li>
              <li>You won't receive any notification that anything is wrong</li>
            </ul>
            <p className="leading-relaxed mt-4">
              Tinder uses shadowbans instead of outright bans for borderline violations. It's their way of punishing users without triggering appeals or refund requests.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              How to Test If You're Shadowbanned
            </h2>
            <p className="leading-relaxed mb-4">
              There's no official way to confirm a shadowban, but these tests can help you figure out what's happening:
            </p>

            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Test 1: The Match Drought</h3>
                  <p className="text-muted-foreground">
                    If you were getting regular matches and suddenly dropped to zero (not fewer - zero) for 1-2 weeks straight, that's a strong indicator. Normal algorithm fluctuations cause dips, not complete shutoffs.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Test 2: The Super Like Test</h3>
                  <p className="text-muted-foreground">
                    Use a Super Like on someone who seems active (recently updated photos, Spotify currently playing). If they don't match or respond within a few days despite being a reasonable match, your profile might not be reaching them.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Test 3: The Friend Test</h3>
                  <p className="text-muted-foreground">
                    Ask a friend to create a new account in your area and swipe until they either see you or run out of profiles. If they go through hundreds of profiles without seeing you, you're likely shadowbanned.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Test 4: Check Your Tinder Gold Queue</h3>
                  <p className="text-muted-foreground">
                    If you have Tinder Gold or Platinum, check the "Likes You" section. If it's been completely empty for an extended period when it used to have activity, that's another signal.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="my-12">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-8 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Get Your Free Profile Score</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Not shadowbanned? Then your profile might just need work. Find out what's wrong.
                </p>
                <Link href="/fix-profile">
                  <Button size="lg" className="mt-2" data-testid="button-cta-mid">
                    <Camera className="w-5 h-5 mr-2" />
                    Get Free Score
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              Signs You're Shadowbanned
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Zero matches for 1-2+ weeks</p>
                  <p className="text-sm text-muted-foreground">Not fewer matches - literally zero, despite active swiping.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Messages not being delivered</p>
                  <p className="text-sm text-muted-foreground">Existing matches stop responding, or new matches never reply.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Running out of profiles quickly</p>
                  <p className="text-sm text-muted-foreground">If you hit "there's no one new around you" in a populated area, something's wrong.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Super Likes going nowhere</p>
                  <p className="text-sm text-muted-foreground">Super Likes usually get at least some response. Zero activity is suspicious.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">What Causes a Shadowban?</h2>
            <p className="leading-relaxed">
              Tinder doesn't publish their rules, but these behaviors commonly trigger shadowbans:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mt-4">
              <li><strong>Being reported multiple times</strong> - Even false reports add up</li>
              <li><strong>Resetting your account too often</strong> - Tinder tracks device IDs and phone numbers</li>
              <li><strong>Using banned photos</strong> - Shirtless bathroom selfies, group photos where it's unclear who you are</li>
              <li><strong>Copy-paste messages</strong> - Sending the same opener to everyone can flag you as spam</li>
              <li><strong>Third-party apps</strong> - Bots, auto-swipers, or any app that accesses Tinder's API</li>
              <li><strong>Inappropriate messages</strong> - Even if reported by just one person</li>
              <li><strong>Using the same phone number after being banned</strong> - The ban follows the number, not the account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary" />
              How to Reset Your Tinder Account Properly
            </h2>
            <p className="leading-relaxed mb-4">
              If you're shadowbanned, the only reliable fix is a complete reset. Here's how to do it right:
            </p>

            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Step 1: Delete Your Account</h3>
                  <p className="text-muted-foreground">
                    Go to Settings in Tinder, scroll down, and select "Delete Account." Don't just delete the app - actually delete the account through the settings.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Step 2: Wait at Least 3 Months</h3>
                  <p className="text-muted-foreground">
                    Tinder retains data for about 3 months. Creating a new account too soon will just link to your old shadowbanned profile. Yes, 3 months is a long time. That's the reality.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Step 3: Use a New Phone Number</h3>
                  <p className="text-muted-foreground">
                    Get a new phone number (prepaid SIM works). Tinder tracks phone numbers aggressively. Using the same number will likely result in another shadowban.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Step 4: New Photos and Bio</h3>
                  <p className="text-muted-foreground">
                    Don't reuse your old photos. Tinder uses image recognition to link accounts. Take new photos and write a new bio.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Step 5: Reset Device Advertising ID</h3>
                  <p className="text-muted-foreground">
                    On iPhone: Settings &gt; Privacy &gt; Tracking &gt; Reset Advertising Identifier. On Android: Settings &gt; Google &gt; Ads &gt; Reset Advertising ID. This helps prevent device-level tracking.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Maybe You're Not Shadowbanned</h2>
            <p className="leading-relaxed">
              Before going through a full reset, consider that your profile might just need work. Many people assume they're shadowbanned when the real problem is:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mt-4">
              <li><strong>Bad photos</strong> - Poor lighting, group photos, or low quality images</li>
              <li><strong>Empty or weak bio</strong> - Gives people no reason to swipe right</li>
              <li><strong>Location issues</strong> - Small population area or traveling in a saturated market</li>
              <li><strong>Algorithm placement</strong> - New accounts get boosted, then normalize</li>
              <li><strong>Swiping habits</strong> - Swiping right on everyone tanks your score</li>
            </ul>
          </section>

          <section className="my-12">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-8 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Not Banned? Then Your Profile Is Just Weak.</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Get your free profile score and find out exactly what's holding you back.
                </p>
                <Link href="/fix-profile">
                  <Button size="lg" className="mt-2" data-testid="button-cta-bottom">
                    <Camera className="w-5 h-5 mr-2" />
                    Get Free Score
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Can I appeal a shadowban?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tinder doesn't officially acknowledge shadowbans, so there's nothing to appeal. Contacting support rarely helps because they'll just say your account is "working normally."
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Does paying for Tinder Gold/Platinum help?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  No. If you're shadowbanned, paying won't fix it. You'll just be paying for an invisible profile. Save your money until you've confirmed your account is working.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">How long does a shadowban last?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  There's no set duration. Some people report bans lifting after a few weeks. Others seem permanent. The only reliable fix is a complete reset with new credentials.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Can I use Bumble or Hinge instead?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes. Match Group owns Tinder but their sister apps have separate ban systems. If Tinder isn't working for you, other apps might be worth trying while you wait out a reset period.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-8 mt-12">
            <p className="text-muted-foreground leading-relaxed">
              A shadowban is frustrating, but it's diagnosable. If you've confirmed you're banned, a full reset is your only option. If you're not sure, start by getting your <Link href="/fix-profile" className="text-primary underline">profile analyzed</Link> - the problem might be simpler than you think.
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
