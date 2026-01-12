import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  UserCheck, 
  UserX, 
  LogOut, 
  Ticket,
  DollarSign,
  CreditCard
} from "lucide-react";

interface UserStats {
  totalUsers: number;
  freeUsers: number;
  paidUsers: number;
  paidUserDetails: Array<{
    id: string;
    email: string;
    planType: string | null;
    status: string | null;
    priceId: string | null;
    amount: number | null;
    currency: string | null;
    oneTimeCredits: number | null;
  }>;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  const { data: isAdmin, isLoading: checkingAuth } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/check"],
    staleTime: 1000 * 60,
  });

  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/admin/user-stats"],
    enabled: !!isAdmin?.isAdmin,
  });

  useEffect(() => {
    if (!checkingAuth && !isAdmin?.isAdmin) {
      setLocation("/admin");
    }
  }, [checkingAuth, isAdmin, setLocation]);

  const handleLogout = async () => {
    await apiRequest("POST", "/api/admin/logout");
    setLocation("/admin");
  };

  const formatAmount = (amount: number | null, currency: string | null) => {
    if (!amount) return "N/A";
    const value = amount / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency?.toUpperCase() || 'USD',
    }).format(value);
  };

  const getPlanLabel = (planType: string | null, credits: number | null) => {
    if (planType === 'monthly') return 'Monthly';
    if (planType === 'annual') return 'Annual';
    if (planType === 'starter') return 'Starter Fix';
    if ((credits || 0) > 0) return `${credits} Credits`;
    return 'Unknown';
  };

  if (checkingAuth || isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/promo-codes">
              <Button variant="outline" data-testid="button-promo-codes">
                <Ticket className="w-4 h-4 mr-2" />
                Promo Codes
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout} data-testid="button-admin-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-total-users">
                {stats?.totalUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Paid Users
              </CardTitle>
              <UserCheck className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600" data-testid="text-paid-users">
                {stats?.paidUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Free Users
              </CardTitle>
              <UserX className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-free-users">
                {stats?.freeUsers || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Paid Users Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!stats?.paidUserDetails || stats.paidUserDetails.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No paid users yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Plan</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.paidUserDetails.map((user) => (
                      <tr key={user.id} className="border-b last:border-0" data-testid={`row-user-${user.id}`}>
                        <td className="py-3 px-2">
                          <span className="text-sm">{user.email}</span>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline">
                            {getPlanLabel(user.planType, user.oneTimeCredits)}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'secondary'}
                            className={user.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                          >
                            {user.status || (user.oneTimeCredits ? 'Credits' : 'Inactive')}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className="flex items-center justify-end gap-1">
                            <DollarSign className="w-3 h-3 text-muted-foreground" />
                            {formatAmount(user.amount, user.currency)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
