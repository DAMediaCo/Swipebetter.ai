import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "./queryClient";

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

export interface Subscription {
  id: number;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  plan: string | null;
  status: string;
  freeAnalysesUsed: number;
  currentPeriodEnd: string | null;
}

export interface AuthData {
  user: User | null;
}

export function useAuth() {
  return useQuery<AuthData>({
    queryKey: ["/api/auth/user"],
    staleTime: 1000 * 60 * 5,
  });
}

export function useSubscription() {
  return useQuery<{
    subscription: Subscription | null;
    canAnalyze: boolean;
    freeAnalysesRemaining: number;
    isPaidUser: boolean;
  }>({
    queryKey: ["/api/subscription"],
    staleTime: 1000 * 60,
  });
}

export interface EntitlementData {
  user: User | null;
  isPro: boolean;
  proActive: boolean;
  planType: "monthly" | "annual" | "starter" | null;
  subscriptionStatus: string | null;
  oneTimeCredits: number;
}

export function useEntitlement() {
  const query = useQuery<EntitlementData>({
    queryKey: ["/api/me"],
    staleTime: 1000 * 30,
  });
  
  const refreshEntitlement = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/me"] });
    await queryClient.refetchQueries({ queryKey: ["/api/me"] });
  };

  return {
    ...query,
    isPro: query.data?.isPro ?? false,
    proActive: query.data?.proActive ?? false,
    planType: query.data?.planType ?? null,
    refreshEntitlement,
  };
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], { user: null });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });
}

export function useCheckout() {
  return useMutation({
    mutationFn: async ({ priceId, returnTo }: { priceId: string; returnTo?: string }) => {
      const response = await apiRequest("POST", "/api/checkout", { priceId, returnTo });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });
}

export function useCustomerPortal() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/customer-portal");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });
}

// Credit & Subscription System (Tripwire Model)
export interface CreditStatus {
  planTier: 'free' | 'starter' | 'unlimited';
  credits: number;
  reportsUnlocked: string[];
  isSuperUser?: boolean;
}

export function useCredits() {
  const query = useQuery<CreditStatus>({
    queryKey: ["/api/credits"],
    staleTime: 1000 * 30,
  });

  const refreshCredits = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
  };

  // isLoading is true only during initial load with no cached data
  // isPending is true when query is fetching (including refetches)
  // We consider it "loading" if we don't have data yet
  const isLoading = query.isLoading || query.isPending || !query.data;

  return {
    ...query,
    isLoading,
    planTier: query.data?.planTier ?? 'free',
    credits: query.data?.credits ?? 0,
    reportsUnlocked: query.data?.reportsUnlocked ?? [],
    hasUnlimitedAccess: query.data?.planTier === 'unlimited' || query.data?.isSuperUser === true,
    isSuperUser: query.data?.isSuperUser === true,
    hasCredits: (query.data?.credits ?? 0) > 0,
    refreshCredits,
  };
}

export function useUnlockReport() {
  return useMutation({
    mutationFn: async (reportId: string) => {
      const response = await apiRequest("POST", "/api/unlock-report", { reportId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
    },
  });
}

export function useCheckReplyAccess() {
  return useMutation({
    mutationFn: async (deductCredit: boolean = true) => {
      const response = await apiRequest("POST", "/api/check-reply-access", { deductCredit });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
    },
  });
}
