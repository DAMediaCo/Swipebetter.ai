import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCredits, useCheckReplyAccess, useSubscription } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { saveAnalysis } from "@/lib/analysisStorage";
import { trackAnalysisStarted } from "@/lib/analytics";
import { Link, useLocation } from "wouter";
import { 
  Sparkles, 
  Heart,
  Flame,
  Loader2,
  Shield,
  Trash2,
  HelpCircle,
  Camera,
  X,
  Target,
  Unlock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const heroTones = [
  { id: "witty", label: "Witty", icon: Sparkles },
  { id: "flirty", label: "Flirty", icon: Heart },
  { id: "direct", label: "Direct", icon: Flame },
];

const goalOptions = [
  { id: "first_impression", label: "First Impression" },
  { id: "keep_going", label: "Keep Conversation Going" },
  { id: "ask_out", label: "Ask Them Out" },
  { id: "revive", label: "Revive Dead Chat" },
];

export function ReplyAssistant() {
  const { planTier, credits, hasUnlimitedAccess, refreshCredits, isLoading: creditsLoading } = useCredits();
  const { data: subscriptionData, isLoading: subscriptionLoading } = useSubscription();
  const checkAccessMutation = useCheckReplyAccess();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [conversationText, setConversationText] = useState("");
  const [heroTone, setHeroTone] = useState("witty");
  const [goal, setGoal] = useState<string>("");
  const [isEnm, setIsEnm] = useState(false);
  const [uploadedScreenshot, setUploadedScreenshot] = useState<string | null>(null);
  
  // Check for pro access using multiple sources for robustness
  const isSubscribedViaSubscription = subscriptionData?.subscription?.status === "active";
  const isPaidViaSubscription = subscriptionData?.isPaidUser;
  const canGenerate = hasUnlimitedAccess || isSubscribedViaSubscription || isPaidViaSubscription || credits > 0;
  const isLoadingAccess = creditsLoading && subscriptionLoading;

  const ocrMutation = useMutation({
    mutationFn: async (screenshot: string) => {
      const response = await apiRequest("POST", "/api/ocr", { screenshot });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.text) {
        setConversationText(prev => prev ? `${prev}\n\n${data.text}` : data.text);
        toast({
          title: "Text extracted",
          description: "The conversation text has been added to the input.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Failed to extract text",
        description: "Please try again or paste the text manually.",
        variant: "destructive",
      });
    },
  });

  const heroAnalyzeMutation = useMutation({
    mutationFn: async () => {
      // For non-unlimited users, check and deduct credit first
      if (!hasUnlimitedAccess) {
        const accessResult = await checkAccessMutation.mutateAsync(true);
        if (accessResult.access !== 'granted') {
          throw new Error('402: Payment required');
        }
      }
      
      trackAnalysisStarted("reply");
      const selectedTone = heroTone === "direct" ? "confident" : heroTone;
      const response = await apiRequest("POST", "/api/analyze-reply", {
        tone: selectedTone,
        goal: goal || undefined,
        conversationText: conversationText.trim(),
        enm: isEnm,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.parsed) {
        saveAnalysis('reply', data.parsed);
        refreshCredits();
        setLocation('/fix-reply/results');
      }
    },
    onError: (error: any) => {
      if (error.message?.includes("402")) {
        toast({
          title: "Credits required",
          description: "Get credits to use this feature.",
          variant: "destructive",
        });
        setLocation('/pricing?returnTo=/dashboard?tab=reply');
      } else if (error.message?.includes("403")) {
        toast({
          title: "Access denied",
          description: "Please try again or contact support.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis failed",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUploadedScreenshot(base64);
      ocrMutation.mutate(base64);
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleHeroSubmit = () => {
    if (!conversationText.trim()) {
      toast({
        title: "Please paste a message",
        description: "Enter the conversation text to generate replies.",
        variant: "destructive",
      });
      return;
    }
    heroAnalyzeMutation.mutate();
  };

  const removeScreenshot = () => {
    setUploadedScreenshot(null);
  };

  return (
    <div className="space-y-6">
      {!isLoadingAccess && !canGenerate && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-4 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-sm">Credits required</p>
              <p className="text-xs text-muted-foreground">
                {planTier === 'free' && "Get 1 credit for $3 or go unlimited"}
                {planTier === 'starter' && "Get more credits to continue"}
              </p>
            </div>
            <Link href="/pricing?returnTo=/dashboard?tab=reply">
              <Button size="sm" data-testid="button-upgrade-banner-reply">
                <Unlock className="w-4 h-4 mr-1" />
                Get Credits
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
      
      {canGenerate && !hasUnlimitedAccess && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="py-3 flex items-center gap-3">
            <Unlock className="w-4 h-4 text-green-500" />
            <p className="text-sm">
              <span className="font-medium">{credits} credit{credits !== 1 ? 's' : ''}</span>
              <span className="text-muted-foreground"> remaining - 1 credit per reply</span>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            What's your goal?
          </label>
          <Select value={goal} onValueChange={setGoal}>
            <SelectTrigger 
              className="w-full bg-card"
              data-testid="select-goal"
            >
              <SelectValue placeholder="Select your conversation goal..." />
            </SelectTrigger>
            <SelectContent>
              {goalOptions.map((option) => (
                <SelectItem key={option.id} value={option.id} data-testid={`option-goal-${option.id}`}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Paste the conversation</label>
          <div className="relative">
            <Textarea
              value={conversationText}
              onChange={(e) => setConversationText(e.target.value)}
              placeholder="Paste their message or upload a screenshot..."
              className="h-48 bg-card rounded-2xl border border-border/50 p-4 pr-14 text-base resize-none"
              data-testid="textarea-conversation"
            />
            <div className="absolute right-3 top-3 flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-screenshot-upload"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={ocrMutation.isPending}
                    className="h-10 w-10 rounded-full bg-muted/80 hover:bg-muted"
                    data-testid="button-upload-screenshot"
                  >
                    {ocrMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload chat screenshot</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          {uploadedScreenshot && (
            <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <img 
                src={uploadedScreenshot} 
                alt="Uploaded screenshot" 
                className="h-12 w-12 object-cover rounded"
              />
              <span className="text-sm text-muted-foreground flex-1">
                {ocrMutation.isPending ? "Extracting text..." : "Screenshot processed"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeScreenshot}
                className="h-8 w-8"
                data-testid="button-remove-screenshot"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3 text-green-500" />
            <span>Private & Secure - images are never stored</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
          <Checkbox
            id="enm-toggle-reply"
            checked={isEnm}
            onCheckedChange={(checked) => setIsEnm(checked === true)}
            data-testid="checkbox-enm-reply"
          />
          <label 
            htmlFor="enm-toggle-reply" 
            className="text-sm font-medium cursor-pointer flex-1"
          >
            This is an ENM/Poly conversation
          </label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Selecting this helps us tailor your replies for ethical non-monogamy contexts.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Choose your tone</label>
          <div className="flex flex-wrap gap-3">
            {heroTones.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setHeroTone(t.id)}
                  className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all flex items-center gap-1.5 ${
                    heroTone === t.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                  data-testid={`button-hero-tone-${t.id}`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
        
        <Button 
          size="lg" 
          onClick={handleHeroSubmit}
          disabled={heroAnalyzeMutation.isPending || !conversationText.trim() || !canGenerate}
          className="w-full py-6 font-bold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
          data-testid="button-generate-replies"
        >
          {heroAnalyzeMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : !canGenerate ? (
            <>
              <Unlock className="w-5 h-5 mr-2" />
              Get Credits to Generate
            </>
          ) : hasUnlimitedAccess ? (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Replies
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Replies (1 Credit)
            </>
          )}
        </Button>
      </div>
      
      <div className="bg-muted/50 rounded-xl p-4 backdrop-blur-sm flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4 text-green-500" />
          <span>Private & Secure</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trash2 className="w-4 h-4 text-green-500" />
          <span>Data deleted after analysis</span>
        </div>
      </div>
    </div>
  );
}
