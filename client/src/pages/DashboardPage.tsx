import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, useCredits } from "@/lib/auth";
import { ProfileOptimizer } from "@/components/dashboard/ProfileOptimizer";
import { ReplyAssistant } from "@/components/dashboard/ReplyAssistant";
import { RecentAudits } from "@/components/dashboard/RecentAudits";
import { User, MessageCircle, History } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Tab = "profile" | "reply" | "history";

export default function DashboardPage() {
  const { data: authData, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const user = authData?.user;
  const { toast } = useToast();
  const { refreshCredits } = useCredits();

  const getInitialTab = (): Tab => {
    const params = new URLSearchParams(searchString);
    const tab = params.get("tab");
    if (tab === "reply") return "reply";
    if (tab === "history") return "history";
    return "profile";
  };

  const [activeTab, setActiveTab] = useState<Tab>(getInitialTab);

  useEffect(() => {
    document.title = "Dating AI Toolkit | SwipeBetter";
  }, []);

  // Verify payment if session_id is present in URL (fallback for webhook race condition)
  useEffect(() => {
    const verifyPaymentFromUrl = async () => {
      const params = new URLSearchParams(searchString);
      const sessionId = params.get("session_id");
      
      if (!sessionId || !user) return;
      
      const attemptVerification = async (): Promise<boolean> => {
        try {
          const response = await apiRequest("POST", "/api/verify-checkout", { sessionId });
          const data = await response.json();
          
          if (data.success) {
            queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
            queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
            queryClient.invalidateQueries({ queryKey: ["/api/me"] });
            refreshCredits();
            
            if (!data.alreadyProcessed) {
              toast({
                title: "Payment Successful!",
                description: "Your credits have been added.",
              });
            }
            
            window.history.replaceState({}, "", "/dashboard");
            return true;
          }
          return false;
        } catch {
          return false;
        }
      };
      
      // First attempt
      const firstAttemptSuccess = await attemptVerification();
      
      if (!firstAttemptSuccess) {
        // Wait 1500ms and retry once (in case DB/webhook is slow)
        await new Promise(resolve => setTimeout(resolve, 1500));
        const secondAttemptSuccess = await attemptVerification();
        
        if (!secondAttemptSuccess) {
          // Only show error if BOTH attempts fail
          toast({
            title: "Payment verification failed",
            description: "Please contact support if your credits were not added.",
            variant: "destructive",
          });
        }
      }
    };
    
    verifyPaymentFromUrl();
  }, [searchString, user, toast, refreshCredits]);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/auth');
    }
  }, [authLoading, user, setLocation]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    const newUrl = tab === "profile" ? "/dashboard" : `/dashboard?tab=${tab}`;
    window.history.replaceState({}, "", newUrl);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-1">Dating AI Toolkit</h1>
          <p className="text-sm text-muted-foreground">Switch between tools below</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-muted rounded-full p-1">
            <button
              onClick={() => handleTabChange("profile")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all ${
                activeTab === "profile"
                  ? "bg-card text-primary shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-profile"
            >
              <User className="w-4 h-4" />
              Profile Optimizer
            </button>
            <button
              onClick={() => handleTabChange("reply")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all ${
                activeTab === "reply"
                  ? "bg-card text-primary shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-reply"
            >
              <MessageCircle className="w-4 h-4" />
              Reply Assistant
            </button>
            <button
              onClick={() => handleTabChange("history")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all ${
                activeTab === "history"
                  ? "bg-card text-primary shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-history"
            >
              <History className="w-4 h-4" />
              Recent Audits
            </button>
          </div>
        </div>

        <div 
          key={activeTab}
          className="animate-in fade-in duration-200"
        >
          {activeTab === "profile" && <ProfileOptimizer />}
          {activeTab === "reply" && <ReplyAssistant />}
          {activeTab === "history" && <RecentAudits />}
        </div>
      </div>
    </div>
  );
}
