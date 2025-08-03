"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface Subscription {
  id: string;
  userId: string;
  userName: string;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  plan: {
    id: string;
    name: string;
    priceInCents: number;
    courseLimit: number;
    maxChapters: number;
    maxLessonsPerChapter: number;
    maxPresentations: number;
    maxSlidesPerPresentation: number;
    creditAmount: number;
  } | null;
}

interface PlanPerformance {
  name: string;
  priceInCents: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  revenue: number;
}

interface FailedPayment {
  id: string;
  userId: string;
  userName: string;
  stripeSubscriptionId: string;
  currentPeriodEnd: string | null;
  planName: string;
  planPrice: number;
}

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [planPerformance, setPlanPerformance] = useState<PlanPerformance[]>([]);
  const [failedPayments, setFailedPayments] = useState<FailedPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        status: statusFilter,
        plan: planFilter,
      });

      const response = await fetch(`/api/admin/subscriptions?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }

      const data = await response.json();
      setSubscriptions(data.subscriptions);
      setPlanPerformance(data.planPerformance);
      setFailedPayments(data.failedPayments);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to fetch subscriptions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [currentPage, statusFilter, planFilter]);

  const handleSubscriptionAction = async (subscriptionId: string, action: string) => {
    setIsActionLoading(true);
    try {
      const response = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to perform action");
      }

      toast.success("Action completed successfully");
      fetchSubscriptions(); // Refresh the subscription list
    } catch (error) {
      console.error("Error performing action:", error);
      toast.error("Failed to perform action");
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const isExpiringSoon = (endDate: string | null) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-green-600" />
            Subscription Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Monitor subscriptions, failed payments, and plan performance
          </p>
        </div>
      </div>

      {/* Plan Performance Analytics */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          Plan Performance
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {planPerformance.map((plan) => (
            <Card key={plan.name} className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10"></div>
              <CardHeader className="relative pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(plan.priceInCents)}/mo
                </div>
              </CardHeader>
              <CardContent className="relative space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Active:</span>
                  <span className="font-medium">{plan.activeSubscriptions}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Total:</span>
                  <span className="font-medium">{plan.totalSubscriptions}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Monthly Revenue:</span>
                  <span className="font-medium text-green-600">
                    {formatPrice(plan.revenue)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Failed Payments */}
      {failedPayments.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Failed Payments Requiring Attention ({failedPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {failedPayments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border"
                >
                  <div>
                    <div className="font-medium">{payment.userName}</div>
                    <div className="text-sm text-slate-600">
                      {payment.planName} - {formatPrice(payment.planPrice)}/mo
                    </div>
                    <div className="text-xs text-red-600">
                      Period ended: {formatDate(payment.currentPeriodEnd)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Contact User
                  </Button>
                </div>
              ))}
              {failedPayments.length > 5 && (
                <div className="text-center text-sm text-slate-600">
                  And {failedPayments.length - 5} more failed payments...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Plan</label>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="ultimate">Ultimate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button onClick={fetchSubscriptions} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions ({subscriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Next Billing</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{subscription.userName}</div>
                            <div className="text-sm text-slate-500 truncate max-w-[200px]">
                              {subscription.userId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <Badge variant="secondary">
                              {subscription.plan?.name || "Unknown"}
                            </Badge>
                            {subscription.plan && (
                              <div className="text-xs text-slate-500 mt-1">
                                {formatPrice(subscription.plan.priceInCents)}/mo
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge
                              variant={subscription.isActive ? "default" : "destructive"}
                            >
                              {subscription.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {subscription.currentPeriodEnd && isExpiringSoon(subscription.currentPeriodEnd) && (
                              <Badge variant="outline" className="text-orange-600 border-orange-200">
                                Expiring Soon
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDate(subscription.startDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {subscription.currentPeriodEnd ? (
                              <span className={isExpiringSoon(subscription.currentPeriodEnd) ? "text-orange-600 font-medium" : ""}>
                                {formatDate(subscription.currentPeriodEnd)}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-green-600" />
                            <span className="font-medium text-green-600">
                              {subscription.plan ? formatPrice(subscription.plan.priceInCents) : "$0.00"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {subscription.isActive ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleSubscriptionAction(subscription.id, "deactivate")}
                                disabled={isActionLoading}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleSubscriptionAction(subscription.id, "activate")}
                                disabled={isActionLoading}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Activate
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-slate-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

