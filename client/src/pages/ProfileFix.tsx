import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrustBar } from "@/components/TrustBar";
import { PrivacyFAQ } from "@/components/PrivacyFAQ";
import { BeforeAfterBio } from "@/components/BeforeAfterBio";
import { ExampleResults } from "@/components/ExampleResults";
import { HowItWorks } from "@/components/HowItWorks";
import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { 
  Upload,
  ArrowDown,
  HelpCircle,
  CloudUpload
} from "lucide-react";
import { SiTinder } from "react-icons/si";
import { StepIndicator } from "@/components/StepIndicator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const platforms = ["Tinder", "Hinge", "Bumble", "Grindr", "Coffee Meets Bagel", "Other"];
const genders = ["Man", "Woman", "Non-binary"];
const intents = ["Relationship", "Casual Dating", "Friendship", "Not Sure"];

export default function ProfileFix() {
  const { data: authData, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const user = authData?.user;

  useEffect(() => {
    document.title = "Fix Your Profile | SwipeBetter";
  }, []);

  const [step, setStep] = useState(0);
  const [platform, setPlatform] = useState(() => sessionStorage.getItem("profile_platform") || "");
  const [gender, setGender] = useState(() => sessionStorage.getItem("profile_gender") || "");
  const [intent, setIntent] = useState(() => sessionStorage.getItem("profile_intent") || "");
  const [isEnm, setIsEnm] = useState(() => sessionStorage.getItem("profile_enm") === "true");

  const canProceed = () => {
    if (step === 1) return platform && gender;
    if (step === 2) return intent;
    return false;
  };

  const scrollToExamples = () => {
    document.getElementById('example-results')?.scrollIntoView({ behavior: 'smooth' });
  };

  const startAnalysis = () => {
    if (!user) {
      setLocation('/auth');
      return;
    }
    setStep(1);
  };

  const continueToUpload = () => {
    sessionStorage.setItem("profile_platform", platform);
    sessionStorage.setItem("profile_gender", gender);
    sessionStorage.setItem("profile_intent", intent);
    sessionStorage.setItem("profile_enm", isEnm ? "true" : "false");
    setLocation("/fix-profile/upload");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    );
  }

  if (step === 0) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 space-y-12">
          <section className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Fix Your Dating Profile.<br />
              <span className="text-primary">Get More Matches.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload screenshots. Get a score, photo feedback, and a better bio in minutes.
            </p>
            
            <div 
              onClick={startAnalysis}
              className="max-w-xl mx-auto p-8 border-2 border-dashed border-muted-foreground/30 rounded-xl bg-slate-50 dark:bg-slate-900/50 cursor-pointer transition-all duration-200 hover:border-primary hover:bg-slate-100 dark:hover:bg-slate-800/50 group"
              data-testid="button-start-upload"
            >
              <div className="flex flex-col items-center gap-3">
                <CloudUpload className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="text-lg font-medium">Drag & drop screenshots here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Upload 3-6 screenshots of your photos, bio, and prompts.
              </p>
              <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <SiTinder className="w-4 h-4" />
                  <span>Tinder</span>
                </div>
                <span className="text-muted-foreground/40">|</span>
                <span>Hinge</span>
                <span className="text-muted-foreground/40">|</span>
                <span>Bumble</span>
                <span className="text-muted-foreground/40">|</span>
                <span className="text-muted-foreground/60">+ more</span>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={scrollToExamples}
              className="text-muted-foreground"
              data-testid="button-see-examples"
            >
              See Example Results
              <ArrowDown className="w-4 h-4 ml-2" />
            </Button>
            
            <div className="pt-2">
              <div className="inline-block bg-slate-50 dark:bg-slate-900/50 rounded-lg px-6 py-4">
                <TrustBar />
              </div>
            </div>
          </section>

          <section>
            <HowItWorks variant="profile" />
          </section>

          <section>
            <ExampleResults />
          </section>

          <section>
            <BeforeAfterBio />
          </section>

          <section>
            <PrivacyFAQ />
          </section>

          <section className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 text-center">
            <p className="text-muted-foreground mb-4">Need help with replies instead?</p>
            <Link href="/fix-reply">
              <Button 
                className="bg-white dark:bg-slate-800 text-foreground shadow-md hover:shadow-lg transition-shadow border border-border"
                data-testid="link-fix-reply-cross"
              >
                Try Fix My Reply
              </Button>
            </Link>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepIndicator 
          steps={["Details", "Upload", "Results"]} 
          currentStep={1} 
        />

        <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl p-4 mb-6">
          <TrustBar />
        </div>

        <Card className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">
              {step === 1 && "About You"}
              {step === 2 && "What Are You Looking For?"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {step === 1 && "Help us personalize your feedback"}
              {step === 2 && "We'll tailor suggestions to your goals"}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-4">
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Dating Platform</label>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((p) => (
                      <Button
                        key={p}
                        variant={platform === p ? "default" : "outline"}
                        onClick={() => setPlatform(p)}
                        className="rounded-full"
                        data-testid={`button-platform-${p.toLowerCase().replace(/ /g, "-")}`}
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium">I identify as</label>
                  <div className="flex flex-wrap gap-2">
                    {genders.map((g) => (
                      <Button
                        key={g}
                        variant={gender === g ? "default" : "outline"}
                        onClick={() => setGender(g)}
                        className="rounded-full"
                        data-testid={`button-gender-${g.toLowerCase().replace(/ /g, "-")}`}
                      >
                        {g}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Checkbox
                    id="enm-toggle"
                    checked={isEnm}
                    onCheckedChange={(checked) => setIsEnm(checked === true)}
                    data-testid="checkbox-enm"
                  />
                  <label 
                    htmlFor="enm-toggle" 
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    This is an ENM/Poly profile
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Selecting this helps us tailor your feedback for ethical non-monogamy profiles.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Looking for</label>
                <div className="flex flex-wrap gap-2">
                  {intents.map((i) => (
                    <Button
                      key={i}
                      variant={intent === i ? "default" : "outline"}
                      onClick={() => setIntent(i)}
                      className="rounded-full"
                      data-testid={`button-intent-${i.toLowerCase().replace(/ /g, "-")}`}
                    >
                      {i}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <PrivacyFAQ />
        </div>
      </div>

      {step >= 1 && step <= 2 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-bottom">
          <div className="max-w-2xl mx-auto space-y-2">
            {step === 1 && (!platform || !gender) && (
              <p className="text-sm text-muted-foreground text-center">
                Select a platform and identity to continue.
              </p>
            )}
            <Button
              onClick={() => {
                if (step === 1) {
                  setStep(2);
                } else {
                  continueToUpload();
                }
              }}
              disabled={!canProceed()}
              className="w-full py-6"
              data-testid="button-next-step"
            >
              {step === 2 ? "Continue to Upload" : "Continue"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
