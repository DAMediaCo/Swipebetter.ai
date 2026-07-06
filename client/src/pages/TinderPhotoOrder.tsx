import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Camera, ArrowLeft, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function TinderPhotoOrder() {
  useEffect(() => {
    document.title = "Best Tinder Photo Order | Which Picture Goes First";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn which Tinder photo should go first, which photos to move or remove, and how to order your dating profile pictures.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Learn which Tinder photo should go first, which photos to move or remove, and how to order your dating profile pictures.';
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
            Best Tinder Photo Order: Which Picture Goes First?
          </h1>
          <p className="text-lg text-muted-foreground">
            How to arrange your photos so people actually swipe right.
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
          <section>
            <p className="text-lg leading-relaxed">
              Most people spend time choosing their Tinder photos but almost no time thinking about the order. That's a mistake. Your first photo determines whether someone looks at the rest of your profile. The second and third photos determine whether they swipe right.
            </p>
            <p className="leading-relaxed">
              Photo order isn't just about leading with your best shot. It's about telling a story and building interest. This guide shows you exactly how to arrange your photos for maximum impact.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Why Photo Order Matters</h2>
            <p className="leading-relaxed">
              The average person spends less than a second looking at a profile before deciding to swipe. Your first photo needs to stop the scroll and earn a closer look. But it doesn't stop there.
            </p>
            <p className="leading-relaxed">
              Once someone starts looking, each photo either builds interest or loses it. A bad photo in slot three can tank an otherwise great profile. The order creates a narrative, and the narrative either works or it doesn't.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">The Optimal Tinder Photo Order</h2>
            
            <div className="space-y-6 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2 text-foreground">Photo 1: The Hook</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    A clear, well-lit headshot or upper body shot. Your face should be the focus. Genuine smile, good lighting, simple background. This is the only photo most people see, so make it count.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2 text-foreground">Photo 2: The Full Picture</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    A full body shot in a natural setting. This shows how you carry yourself and gives more context. Should still be well-lit with a clear view of you.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2 text-foreground">Photo 3: The Lifestyle</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    An activity photo showing you doing something you enjoy. This hints at what dating you might look like. Make sure you're still recognizable in the shot.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2 text-foreground">Photo 4: The Social Proof</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    A photo with friends or in a social setting. Shows you have a life and people enjoy being around you. Make sure you're clearly identifiable in the group.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2 text-foreground">Photo 5-6: The Bonus</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    Travel photos, pet photos, or anything else that shows personality. These should add variety without repeating what earlier photos showed.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">What to Avoid in Each Slot</h2>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Photo 1 Mistakes</p>
                      <p className="text-foreground/80">Sunglasses, group photo, scenery with you tiny, heavily filtered, too far away</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">Photo 1 Right</p>
                      <p>Clear face, natural light, genuine expression, just you, simple background</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">General Mistakes</p>
                      <p className="text-foreground/80">Multiple selfies in a row, all indoor or all outdoor, same outfit in every photo</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">Better Approach</p>
                      <p>Mix of settings, different outfits, variety of candid and posed shots</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Common Photo Order Mistakes</h2>
            <p className="leading-relaxed">
              <strong className="text-foreground">Leading with a group photo.</strong> No one wants to guess which person you are.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">Putting the best photo last.</strong> Most people don't scroll that far. Front-load your best content.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">Having similar photos back-to-back.</strong> If photos 2 and 3 look similar, one should go.
            </p>
            <p className="leading-relaxed">
              <strong className="text-foreground">Ending with a bad photo.</strong> The last photo is the last impression. Don't end on a low note.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Testing and Optimizing</h2>
            <p className="leading-relaxed">
              If you're not getting the results you want, try swapping your first two photos. Sometimes a different lead photo makes a huge difference. Tinder's Smart Photos feature can also help by automatically showing your best-performing photo first.
            </p>
            <p className="leading-relaxed">
              Track your match rate before and after changes. Give each new order at least a week before making more changes.
            </p>
          </section>

          <section className="my-12">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-8 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Want Expert Feedback on Your Photo Order?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Upload your profile screenshots and get AI-powered suggestions.
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
                <h3 className="font-semibold mb-2 text-foreground">Should I use Tinder's Smart Photos?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  It can help, but start with a deliberately chosen order first. Smart Photos works better when all your photos are already good.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">How many photos should I have?</h3>
                <p className="text-foreground/80 leading-relaxed">
                  4-6 is ideal. Enough variety to show who you are, not so many that you dilute quality.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-8 mt-12">
            <p className="text-foreground/80 leading-relaxed">
              The right photo order can significantly increase your match rate. For personalized feedback, try our <Link href="/fix-profile" className="text-primary underline">profile analyzer</Link>. And when you're ready to turn matches into conversations, our <Link href="/fix-reply" className="text-primary underline">reply helper</Link> can assist.
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
