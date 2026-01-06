import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { ProfileOptimizer } from "@/components/dashboard/ProfileOptimizer";
import { ReplyAssistant } from "@/components/dashboard/ReplyAssistant";
import { User, MessageCircle } from "lucide-react";

type Tab = "profile" | "reply";

export default function DashboardPage() {
  const { data: authData, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const user = authData?.user;

  const getInitialTab = (): Tab => {
    const params = new URLSearchParams(searchString);
    const tab = params.get("tab");
    if (tab === "reply") return "reply";
    return "profile";
  };

  const [activeTab, setActiveTab] = useState<Tab>(getInitialTab);

  useEffect(() => {
    document.title = "Dating AI Toolkit | SwipeBetter";
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/auth');
    }
  }, [authLoading, user, setLocation]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    const newUrl = tab === "profile" ? "/dashboard" : "/dashboard?tab=reply";
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
          <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-full p-1">
            <button
              onClick={() => handleTabChange("profile")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all ${
                activeTab === "profile"
                  ? "bg-white dark:bg-slate-900 text-pink-600 shadow-md"
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
                  ? "bg-white dark:bg-slate-900 text-pink-600 shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-reply"
            >
              <MessageCircle className="w-4 h-4" />
              Reply Assistant
            </button>
          </div>
        </div>

        <div 
          key={activeTab}
          className="animate-in fade-in duration-200"
        >
          {activeTab === "profile" ? (
            <ProfileOptimizer />
          ) : (
            <ReplyAssistant />
          )}
        </div>
      </div>
    </div>
  );
}
