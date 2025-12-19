import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "./queryClient";

export interface User {
  id: string;
  email: string | null;
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
  subscription: Subscription | null;
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
  }>({
    queryKey: ["/api/subscription"],
    staleTime: 1000 * 60,
  });
}

export function useCheckout() {
  return useMutation({
    mutationFn: async (priceId: string) => {
      const response = await apiRequest("POST", "/api/checkout", { priceId });
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

export function logout() {
  window.location.href = "/api/auth/logout";
}

export function login() {
  window.location.href = "/api/auth/login";
}
