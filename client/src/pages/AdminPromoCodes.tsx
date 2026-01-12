import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Trash2, 
  LogOut, 
  Ticket, 
  Loader2,
  Copy,
  Check
} from "lucide-react";

interface PromoCode {
  id: number;
  code: string;
  credits: number;
  maxRedemptions: number | null;
  currentRedemptions: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPromoCodes() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const [newCode, setNewCode] = useState("");
  const [credits, setCredits] = useState(3);
  const [maxRedemptions, setMaxRedemptions] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);

  const { data: isAdmin, isLoading: checkingAuth } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/check"],
    staleTime: 1000 * 60,
  });

  const { data: codes, isLoading } = useQuery<PromoCode[]>({
    queryKey: ["/api/admin/promo-codes"],
    enabled: !!isAdmin?.isAdmin,
  });

  useEffect(() => {
    if (!checkingAuth && !isAdmin?.isAdmin) {
      setLocation("/admin");
    }
  }, [checkingAuth, isAdmin, setLocation]);

  const createCode = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/promo-codes", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create code");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      setNewCode("");
      setCredits(3);
      setMaxRedemptions("");
      setExpiresAt("");
      setCreating(false);
      toast({ title: "Promo code created" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to create code", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const toggleCode = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/promo-codes/${id}`, { isActive });
      if (!response.ok) throw new Error("Failed to update code");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
    },
  });

  const deleteCode = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/promo-codes/${id}`);
      if (!response.ok) throw new Error("Failed to delete code");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      toast({ title: "Promo code deleted" });
    },
  });

  const handleLogout = async () => {
    await apiRequest("POST", "/api/admin/logout");
    setLocation("/admin");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createCode.mutate({
      code: newCode.toUpperCase(),
      credits,
      maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
      expiresAt: expiresAt || null,
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (checkingAuth || isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Ticket className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Promo Codes</h1>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline" data-testid="button-back-dashboard">
              Back to Dashboard
            </Button>
          </Link>
          <Button variant="outline" onClick={handleLogout} data-testid="button-admin-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="FRIEND2024"
                    required
                    data-testid="input-promo-code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits to Grant</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    value={credits}
                    onChange={(e) => setCredits(parseInt(e.target.value) || 3)}
                    data-testid="input-promo-credits"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRedemptions">Max Redemptions (optional)</Label>
                  <Input
                    id="maxRedemptions"
                    type="number"
                    min="1"
                    value={maxRedemptions}
                    onChange={(e) => setMaxRedemptions(e.target.value)}
                    placeholder="Unlimited"
                    data-testid="input-promo-max"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires (optional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    data-testid="input-promo-expires"
                  />
                </div>
              </div>
              <Button type="submit" disabled={createCode.isPending} data-testid="button-create-promo">
                {createCode.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Code
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {!codes || codes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No promo codes yet. Create one above!
              </p>
            ) : (
              <div className="space-y-3">
                {codes.map((code) => (
                  <div 
                    key={code.id} 
                    className="flex items-center justify-between gap-4 p-4 border rounded-md flex-wrap"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyCode(code.code)}
                        data-testid={`button-copy-${code.code}`}
                      >
                        {copiedCode === code.code ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <span className="font-mono font-semibold">{code.code}</span>
                      <Badge variant={code.isActive ? "default" : "secondary"}>
                        {code.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {code.credits} credits
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {code.currentRedemptions}{code.maxRedemptions ? `/${code.maxRedemptions}` : ""} used
                      </span>
                      {code.expiresAt && (
                        <span className="text-sm text-muted-foreground">
                          Expires: {new Date(code.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={code.isActive}
                        onCheckedChange={(checked) => toggleCode.mutate({ id: code.id, isActive: checked })}
                        data-testid={`switch-${code.code}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCode.mutate(code.id)}
                        disabled={deleteCode.isPending}
                        data-testid={`button-delete-${code.code}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
