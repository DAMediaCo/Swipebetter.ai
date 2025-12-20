import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Camera, ArrowLeft, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function DatingAppPhotos() {
  useEffect(() => {
    document.title = "How to Choose Dating App Photos That Work";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn which photos work best on dating apps with tips for choosing, ordering, and improving your profile pictures.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Learn which photos work best on dating apps with tips for choosing, ordering, and improving your profile pictures.';
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
            How to Choose Dating App Photos That Actually Get Matches
          </h1>
          <p className="text-lg text-muted-foreground">
            What makes a good dating profile photo, how to order them, and common mistakes to avoid.
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <p className="text-lg leading-relaxed">
              Your photos are the most important part of your dating profile. Studies show that photos determine the majority of first impressions, and most people decide whether to swipe right within seconds. Yet most people choose their photos based on what they like, not what actually works.
            </p>
            <p className="leading-relaxed">
              This guide covers what makes a great dating app photo, how to order your pictures for maximum impact, and the mistakes that tank otherwise good profiles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">What Makes a Good Dating App Photo</h2>
            <p className="leading-relaxed">
              The best dating photos have a few things in common. They're clear and well-lit. You're the obvious focus of the image. Your face is visible and you look approachable. And they give a sense of who you are and what your life looks like.
            </p>
            <p className="leading-relaxed">
              Notice what's not on that list: professional quality, perfect lighting, or looking like a model. Authenticity beats perfection every time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">The Photo Order That Works</h2>
            <p className="leading-relaxed mb-4">
              Photo order matters more than most people think. Here's a structure that works:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li><strong>Lead photo:</strong> Clear headshot or upper body, good lighting, genuine smile. This is the first impression.</li>
              <li><strong>Full body photo:</strong> Shows how you carry yourself in a natural setting.</li>
              <li><strong>Activity or hobby photo:</strong> Shows you doing something you enjoy.</li>
              <li><strong>Social photo:</strong> With friends or in a group (but you should be clearly identifiable).</li>
              <li><strong>Interest photo:</strong> Travel, pet, or something that shows your personality.</li>
            </ol>
            <p className="leading-relaxed mt-4">
              You don't need exactly five photos, but this order front-loads your best content and tells a story about who you are.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Good vs Bad Photos: Examples</h2>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Lead Photo</p>
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Bad</p>
                      <p className="text-muted-foreground">Dark bar photo, multiple people, sunglasses, blurry, or heavily filtered</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">Good</p>
                      <p>Natural light, clear face, genuine expression, simple background, just you</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Activity Photo</p>
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Bad</p>
                      <p className="text-muted-foreground">Distant hiking shot where you're a tiny figure, gym selfie, holding a fish</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">Good</p>
                      <p>Cooking in your kitchen, playing with your dog, candid moment at an event</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Group Photo</p>
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-destructive mb-1">Bad</p>
                      <p className="text-muted-foreground">Can't tell which person you are, everyone is more attractive than you, too many people</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">Good</p>
                      <p>Small group, you're clearly the focus, everyone looks like they're having fun</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Common Photo Mistakes</h2>
            <p className="leading-relaxed">
              <strong>All selfies.</strong> One selfie is fine. Five selfies looks like you never do anything.
            </p>
            <p className="leading-relaxed">
              <strong>No variety.</strong> Multiple photos in the same location or outfit looks like they were all taken on the same day.
            </p>
            <p className="leading-relaxed">
              <strong>Sunglasses in every photo.</strong> People want to see your eyes. Limit sunglasses to one photo max.
            </p>
            <p className="leading-relaxed">
              <strong>Photos with exes cropped out.</strong> We can always tell. Just don't use them.
            </p>
            <p className="leading-relaxed">
              <strong>Old photos.</strong> Use recent photos that look like you right now. Surprises on the first date are not good.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4">Quick Photo Improvement Tips</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Natural light makes everyone look better. Take photos near windows or outdoors.</li>
              <li>Ask a friend to take candid photos instead of posing for selfies.</li>
              <li>Slight smiles with teeth showing are rated more attractive than serious faces.</li>
              <li>Wear colors that complement your skin tone, not just black and gray.</li>
              <li>Crop tightly enough that you're clearly the focus of each image.</li>
            </ul>
          </section>

          <section className="my-12">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-8 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Want Feedback on Your Dating Photos?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Upload your profile screenshots and get AI-powered suggestions for better photos.
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
            <h2 className="text-2xl font-bold mt-10 mb-4">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">How many photos should I have?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  4-6 is the sweet spot. Enough variety to show who you are, not so many that quality drops. Better to have 4 great photos than 6 mediocre ones.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Should I use professional photos?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  One professional headshot can work well as a lead photo, but too many looks staged. Mix professional with candid shots for the best results.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Do filters help or hurt?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Light editing is fine, but heavy filters make you look fake and set unrealistic expectations. Keep edits minimal and natural-looking.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-8 mt-12">
            <p className="text-muted-foreground leading-relaxed">
              Great photos are the foundation of a successful dating profile. For personalized feedback on your specific photos, try our <Link href="/fix-profile" className="text-primary underline">profile analyzer</Link>. And once you're getting matches, our <Link href="/fix-reply" className="text-primary underline">reply helper</Link> can help you keep conversations going.
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
