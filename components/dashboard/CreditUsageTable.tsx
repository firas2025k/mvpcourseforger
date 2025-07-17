"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Activity,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Search,
  Filter,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CreditTransaction {
  id: string;
  type: "purchase" | "consumption" | "adjustment";
  amount: number;
  related_entity_id: string | null;
  description: string | null;
  created_at: string;
}

interface CreditUsageTableProps {
  initialTransactions: CreditTransaction[];
  totalTransactions: number;
  currentPage: number;
  totalPages: number;
  typeFilter: string;
  searchQuery: string;
}

export default function CreditUsageTable({
  initialTransactions,
  totalTransactions,
  currentPage,
  totalPages,
  typeFilter,
  searchQuery,
}: CreditUsageTableProps) {
  const [transactions, setTransactions] =
    useState<CreditTransaction[]>(initialTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localTypeFilter, setLocalTypeFilter] = useState(typeFilter);

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case "consumption":
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case "adjustment":
        return <Settings className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-slate-600" />;
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (type === "purchase" || amount > 0) {
      return "text-green-600 dark:text-green-400";
    } else if (type === "consumption" || amount < 0) {
      return "text-red-600 dark:text-red-400";
    }
    return "text-blue-600 dark:text-blue-400";
  };

  const getTransactionBadgeVariant = (type: string) => {
    switch (type) {
      case "purchase":
        return "default" as const;
      case "consumption":
        return "destructive" as const;
      case "adjustment":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const refreshTransactions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        type: localTypeFilter,
        search: localSearchQuery,
      });

      const response = await fetch(`/api/user/credit-transactions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportTransactions = async () => {
    try {
      const params = new URLSearchParams({
        type: localTypeFilter,
        search: localSearchQuery,
        export: "true",
      });

      const response = await fetch(`/api/user/credit-transactions?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `credit-transactions-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting transactions:", error);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams({
      page: "1",
      type: localTypeFilter,
      search: localSearchQuery,
    });
    window.location.href = `/dashboard/credit?${params}`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const limit = 20;
  const offset = (currentPage - 1) * limit;

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <Input
                  placeholder="Search transactions..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={localTypeFilter} onValueChange={setLocalTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="purchase">Purchases</SelectItem>
                <SelectItem value="consumption">Consumption</SelectItem>
                <SelectItem value="adjustment">Adjustments</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleSearch}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={exportTransactions}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshTransactions}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <>
              <div className="rounded-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.type)}
                            <Badge
                              variant={getTransactionBadgeVariant(
                                transaction.type
                              )}
                            >
                              {transaction.type.charAt(0).toUpperCase() +
                                transaction.type.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                              {transaction.description || "No description"}
                            </p>
                            {transaction.related_entity_id && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                ID: {transaction.related_entity_id.slice(0, 8)}
                                ...
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-bold ${getTransactionColor(
                              transaction.type,
                              transaction.amount
                            )}`}
                          >
                            {transaction.amount > 0 ? "+" : ""}
                            {transaction.amount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {offset + 1} to{" "}
                    {Math.min(offset + limit, totalTransactions)} of{" "}
                    {totalTransactions} transactions
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      asChild
                    >
                      <Link
                        href={`/dashboard/credit?page=${
                          currentPage - 1
                        }&type=${localTypeFilter}&search=${localSearchQuery}`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Link>
                    </Button>
                    <span className="text-sm font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                      {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      asChild
                    >
                      <Link
                        href={`/dashboard/credit?page=${
                          currentPage + 1
                        }&type=${localTypeFilter}&search=${localSearchQuery}`}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full blur-2xl opacity-20"></div>
                <Activity className="relative h-16 w-16 text-slate-400 dark:text-slate-500 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                No Transactions Found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {localSearchQuery || localTypeFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "You haven't made any credit transactions yet."}
              </p>
              {!localSearchQuery && localTypeFilter === "all" && (
                <Button
                  asChild
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                >
                  <Link
                    href="/dashboard/credits/purchase"
                    className="flex items-center gap-2"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Purchase Credits
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
