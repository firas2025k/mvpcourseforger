"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Coins,
  Search,
  Filter,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface CreditTransaction {
  id: string;
  userId: string;
  userName: string;
  type: "purchase" | "consumption" | "adjustment";
  amount: number;
  relatedEntityId: string | null;
  description: string | null;
  createdAt: string;
}

interface CreditAnalytics {
  totalPurchased: number;
  totalConsumed: number;
  totalAdjustments: number;
  byPlan: Record<string, { purchased: number; consumed: number; adjustments: number }>;
  dailyActivity: Record<string, { purchased: number; consumed: number }>;
  balancesByPlan: Record<string, { totalCredits: number; userCount: number }>;
}

export default function CreditSystemManagement() {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [analytics, setAnalytics] = useState<CreditAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Bulk operations state
  const [bulkUserIds, setBulkUserIds] = useState("");
  const [bulkAmount, setBulkAmount] = useState("");
  const [bulkDescription, setBulkDescription] = useState("");
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const fetchCreditData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "50",
        search: searchTerm,
        type: typeFilter,
        dateFrom,
        dateTo,
      });

      const response = await fetch(`/api/admin/credits?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch credit data");
      }

      const data = await response.json();
      setTransactions(data.transactions);
      setAnalytics(data.analytics);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching credit data:", error);
      toast.error("Failed to fetch credit data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditData();
  }, [currentPage, searchTerm, typeFilter, dateFrom, dateTo]);

  const handleBulkOperation = async () => {
    if (!bulkUserIds.trim() || !bulkAmount) {
      toast.error("Please provide user IDs and amount");
      return;
    }

    setIsBulkLoading(true);
    try {
      const userIds = bulkUserIds.split('\n').map(id => id.trim()).filter(id => id);
      const amount = parseInt(bulkAmount);

      const response = await fetch("/api/admin/credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "bulk_credit_adjustment",
          userIds,
          amount,
          description: bulkDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to perform bulk operation");
      }

      const data = await response.json();
      const successCount = data.results.filter((r: any) => r.success).length;
      const failureCount = data.results.filter((r: any) => !r.success).length;

      toast.success(`Bulk operation completed: ${successCount} successful, ${failureCount} failed`);
      
      // Reset form
      setBulkUserIds("");
      setBulkAmount("");
      setBulkDescription("");
      
      // Refresh data
      fetchCreditData();
    } catch (error) {
      console.error("Error performing bulk operation:", error);
      toast.error("Failed to perform bulk operation");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTransactionBadgeVariant = (type: string) => {
    switch (type) {
      case "purchase":
        return "default";
      case "consumption":
        return "destructive";
      case "adjustment":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <Plus className="h-3 w-3" />;
      case "consumption":
        return <Minus className="h-3 w-3" />;
      case "adjustment":
        return <BarChart3 className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Coins className="h-8 w-8 text-yellow-600" />
            Credit System Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Monitor credit transactions, analytics, and bulk operations
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Bulk Operations
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Bulk Credit Operations</DialogTitle>
              <DialogDescription>
                Add or remove credits for multiple users at once
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="userIds">User IDs (one per line)</Label>
                <Textarea
                  id="userIds"
                  placeholder="Enter user IDs, one per line..."
                  value={bulkUserIds}
                  onChange={(e) => setBulkUserIds(e.target.value)}
                  rows={5}
                />
              </div>
              <div>
                <Label htmlFor="amount">Credit Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount (positive to add, negative to remove)"
                  value={bulkAmount}
                  onChange={(e) => setBulkAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="Reason for credit adjustment..."
                  value={bulkDescription}
                  onChange={(e) => setBulkDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleBulkOperation}
                disabled={isBulkLoading}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                {isBulkLoading ? "Processing..." : "Apply Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Credit Analytics
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10"></div>
              <CardHeader className="relative pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Total Purchased
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.totalPurchased.toLocaleString()}
                </div>
                <p className="text-xs text-slate-600">credits purchased</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10"></div>
              <CardHeader className="relative pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Total Consumed
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-red-600">
                  {analytics.totalConsumed.toLocaleString()}
                </div>
                <p className="text-xs text-slate-600">credits consumed</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10"></div>
              <CardHeader className="relative pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  Total Adjustments
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.totalAdjustments.toLocaleString()}
                </div>
                <p className="text-xs text-slate-600">admin adjustments</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10"></div>
              <CardHeader className="relative pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-yellow-600">
                  {Object.values(analytics.balancesByPlan).reduce((sum, plan) => sum + plan.totalCredits, 0).toLocaleString()}
                </div>
                <p className="text-xs text-slate-600">total credits in system</p>
              </CardContent>
            </Card>
          </div>

          {/* Plan Breakdown */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Credit Usage by Plan</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(analytics.byPlan).map(([planName, data]) => (
                <Card key={planName}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{planName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Purchased:</span>
                      <span className="font-medium">{data.purchased.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Consumed:</span>
                      <span className="font-medium">{data.consumed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Adjustments:</span>
                      <span className="font-medium">{data.adjustments.toLocaleString()}</span>
                    </div>
                    {analytics.balancesByPlan[planName] && (
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="text-yellow-600">Current:</span>
                        <span className="font-medium">{analytics.balancesByPlan[planName].totalCredits.toLocaleString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Transaction Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="consumption">Consumption</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Date To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={fetchCreditData} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Credit Transactions ({transactions.length})</span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.userName}</div>
                            <div className="text-sm text-slate-500 truncate max-w-[200px]">
                              {transaction.userId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTransactionBadgeVariant(transaction.type)}>
                            <div className="flex items-center gap-1">
                              {getTransactionIcon(transaction.type)}
                              {transaction.type}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium ${
                            transaction.amount > 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            {transaction.amount > 0 ? "+" : ""}{transaction.amount.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[300px] truncate">
                            {transaction.description || "No description"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDate(transaction.createdAt)}
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

