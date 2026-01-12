import { useEffect, useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  LogOut, 
  Ticket,
  DollarSign,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Gift,
  CreditCard,
  Clock,
  Activity
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

type BillingStatus = 'subscription' | 'one_time' | 'refunded' | 'chargeback' | 'trial' | 'comped' | 'free';
type UserState = 'New User' | 'Active Today' | 'Active This Week' | 'Dormant 7+ Days' | 'Dormant 30+ Days' | 'Never Used';

interface UserDetail {
  id: string;
  email: string;
  createdAt: string;
  lastActiveAt: string | null;
  billingStatus: BillingStatus;
  creditsSource: string;
  creditsTotal: number;
  creditsUsed: number;
  creditsRemaining: number;
  lifetimeSpendCents: number;
  lastPaymentAt: string | null;
  userState: UserState;
}

interface UserStats {
  totalUsers: number;
  stats: {
    revenueUsers: number;
    compedUsers: number;
    neverConverted: number;
    activeLast7Days: number;
    hasCredits: number;
    newUsers: number;
  };
  userDetails: UserDetail[];
}

type FilterType = 'all' | 'revenue' | 'comped' | 'never_converted' | 'active_7_days' | 'has_credits' | 'new_users';
type SortField = 'createdAt' | 'lastActiveAt' | 'lifetimeSpendCents' | 'creditsRemaining';
type SortDirection = 'asc' | 'desc';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    if (!stats?.userDetails) return [];
    
    let filtered = stats.userDetails;

    if (searchQuery) {
      filtered = filtered.filter(u => 
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (activeFilter) {
      case 'revenue':
        filtered = filtered.filter(u => u.billingStatus === 'subscription' || u.billingStatus === 'one_time');
        break;
      case 'comped':
        filtered = filtered.filter(u => 
          u.billingStatus === 'comped' || 
          ['promo', 'admin_grant', 'referral', 'migration'].includes(u.creditsSource)
        );
        break;
      case 'never_converted':
        filtered = filtered.filter(u => u.lifetimeSpendCents === 0);
        break;
      case 'active_7_days':
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(u => u.lastActiveAt && new Date(u.lastActiveAt) > sevenDaysAgo);
        break;
      case 'has_credits':
        filtered = filtered.filter(u => u.creditsRemaining > 0);
        break;
      case 'new_users':
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        filtered = filtered.filter(u => new Date(u.createdAt) > oneDayAgo);
        break;
    }

    filtered.sort((a, b) => {
      let aVal: number | string | null;
      let bVal: number | string | null;

      switch (sortField) {
        case 'createdAt':
          aVal = a.createdAt;
          bVal = b.createdAt;
          break;
        case 'lastActiveAt':
          aVal = a.lastActiveAt || '';
          bVal = b.lastActiveAt || '';
          break;
        case 'lifetimeSpendCents':
          aVal = a.lifetimeSpendCents;
          bVal = b.lifetimeSpendCents;
          break;
        case 'creditsRemaining':
          aVal = a.creditsRemaining;
          bVal = b.creditsRemaining;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      return sortDirection === 'asc' 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return filtered;
  }, [stats?.userDetails, searchQuery, activeFilter, sortField, sortDirection]);

  const formatCurrency = (cents: number) => {
    if (cents === 0) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MMM d, yyyy');
  };

  const formatRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return null;
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  };

  const getBillingBadgeStyle = (status: BillingStatus) => {
    switch (status) {
      case 'subscription':
      case 'one_time':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'trial':
      case 'comped':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'refunded':
      case 'chargeback':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const getBillingLabel = (status: BillingStatus) => {
    switch (status) {
      case 'subscription': return 'Subscription';
      case 'one_time': return 'One-Time';
      case 'refunded': return 'Refunded';
      case 'chargeback': return 'Chargeback';
      case 'trial': return 'Trial';
      case 'comped': return 'Comped';
      default: return 'Free';
    }
  };

  const getCreditsSourceLabel = (source: string) => {
    switch (source) {
      case 'purchased': return 'Purchased';
      case 'trial': return 'Trial';
      case 'promo': return 'Promo';
      case 'admin_grant': return 'Admin';
      case 'referral': return 'Referral';
      case 'migration': return 'Migration';
      default: return 'None';
    }
  };

  const getUserStateBadgeStyle = (state: UserState) => {
    switch (state) {
      case 'Active Today':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'Active This Week':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'New User':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case 'Dormant 7+ Days':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'Dormant 30+ Days':
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 ml-1" />
      : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  if (checkingAuth || isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const filterButtons: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All Users', count: stats?.totalUsers || 0 },
    { key: 'revenue', label: 'Revenue', count: stats?.stats.revenueUsers || 0 },
    { key: 'comped', label: 'Comped/Promo', count: stats?.stats.compedUsers || 0 },
    { key: 'never_converted', label: 'Never Converted', count: stats?.stats.neverConverted || 0 },
    { key: 'active_7_days', label: 'Active 7 Days', count: stats?.stats.activeLast7Days || 0 },
    { key: 'has_credits', label: 'Has Credits', count: stats?.stats.hasCredits || 0 },
    { key: 'new_users', label: 'New Users', count: stats?.stats.newUsers || 0 },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold" data-testid="text-total-users">
                {stats?.totalUsers || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold text-green-600" data-testid="text-revenue-users">
                {stats?.stats.revenueUsers || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Comped</CardTitle>
              <Gift className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold text-blue-600" data-testid="text-comped-users">
                {stats?.stats.compedUsers || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Active 7d</CardTitle>
              <Activity className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold text-emerald-600" data-testid="text-active-users">
                {stats?.stats.activeLast7Days || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Has Credits</CardTitle>
              <CreditCard className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold text-amber-600" data-testid="text-has-credits">
                {stats?.stats.hasCredits || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">New (24h)</CardTitle>
              <Clock className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold text-purple-600" data-testid="text-new-users">
                {stats?.stats.newUsers || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-4">
              <CardTitle className="text-lg">Users</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 max-w-sm"
                  data-testid="input-search-email"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {filterButtons.map((btn) => (
                  <Button
                    key={btn.key}
                    variant={activeFilter === btn.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(btn.key)}
                    data-testid={`filter-${btn.key}`}
                  >
                    {btn.label} ({btn.count})
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAndSortedUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No users match your criteria.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                      <th 
                        className="text-left py-3 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => handleSort('createdAt')}
                      >
                        <span className="flex items-center">
                          Date Joined
                          <SortIcon field="createdAt" />
                        </span>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Billing</th>
                      <th 
                        className="text-left py-3 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => handleSort('creditsRemaining')}
                      >
                        <span className="flex items-center">
                          Credits
                          <SortIcon field="creditsRemaining" />
                        </span>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Source</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">User State</th>
                      <th 
                        className="text-right py-3 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => handleSort('lifetimeSpendCents')}
                      >
                        <span className="flex items-center justify-end">
                          Lifetime Spend
                          <SortIcon field="lifetimeSpendCents" />
                        </span>
                      </th>
                      <th 
                        className="text-left py-3 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => handleSort('lastActiveAt')}
                      >
                        <span className="flex items-center">
                          Last Active
                          <SortIcon field="lastActiveAt" />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedUsers.map((user) => (
                      <tr key={user.id} className="border-b last:border-0" data-testid={`row-user-${user.id}`}>
                        <td className="py-3 px-2">
                          <span className="text-sm font-medium">{user.email}</span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex flex-col">
                            <span className="text-sm">{formatDate(user.createdAt)}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(user.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge 
                            variant="outline"
                            className={getBillingBadgeStyle(user.billingStatus)}
                          >
                            {getBillingLabel(user.billingStatus)}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <span className={user.creditsRemaining === 0 ? 'text-muted-foreground' : 'font-medium'}>
                            {user.creditsRemaining}/{user.creditsTotal}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="text-xs">
                            {getCreditsSourceLabel(user.creditsSource)}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <Badge 
                            variant="outline"
                            className={getUserStateBadgeStyle(user.userState)}
                          >
                            {user.userState}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={user.lifetimeSpendCents > 0 ? 'font-medium text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                            {formatCurrency(user.lifetimeSpendCents)}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {user.lastActiveAt ? (
                            <div className="flex flex-col">
                              <span className="text-sm">{formatDate(user.lastActiveAt)}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(user.lastActiveAt)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
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
