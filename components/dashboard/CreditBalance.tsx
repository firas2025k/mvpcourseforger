// components/dashboard/CreditBalance.tsx
'use client';

import { useState, useEffect } from 'react';
import { Coins, Plus, AlertTriangle, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

interface CreditBalanceProps {
  initialCredits?: number;
  showTopUpButton?: boolean;
  compact?: boolean;
}

interface CreditTransaction {
  id: string;
  type: 'purchase' | 'consumption' | 'adjustment';
  amount: number;
  description: string;
  created_at: string;
}

export default function CreditBalance({ 
  initialCredits = 0, 
  showTopUpButton = true, 
  compact = false 
}: CreditBalanceProps) {
  const [credits, setCredits] = useState(initialCredits);
  const [isLoading, setIsLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<CreditTransaction[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  // Fetch current credit balance
  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/user/credits');
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits || 0);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  // Fetch recent transactions
  const fetchRecentTransactions = async () => {
    try {
      const response = await fetch('/api/user/credit-transactions?limit=5');
      if (response.ok) {
        const data = await response.json();
        setRecentTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching credit transactions:', error);
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    fetchCredits();
    
    // Refresh credits every 30 seconds
    const interval = setInterval(fetchCredits, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Load transactions when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      fetchRecentTransactions();
    }
  }, [isDropdownOpen]);

  // Credit status determination
  const getCreditStatus = (creditBalance: number) => {
    if (creditBalance >= 20) return { 
      status: 'good', 
      color: 'text-green-600 dark:text-green-400', 
      bgColor: 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      icon: Coins 
    };
    if (creditBalance >= 5) return { 
      status: 'low', 
      color: 'text-yellow-600 dark:text-yellow-400', 
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      icon: AlertTriangle 
    };
    return { 
      status: 'critical', 
      color: 'text-red-600 dark:text-red-400', 
      bgColor: 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: AlertTriangle 
    };
  };

  const creditStatus = getCreditStatus(credits);
  const StatusIcon = creditStatus.icon;

  // Handle quick top-up
  const handleQuickTopUp = async (creditAmount: number, priceId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-credit-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          credit_amount: creditAmount,
          success_url: `${window.location.origin}${window.location.pathname}?credit_purchase=success`,
          cancel_url: `${window.location.origin}${window.location.pathname}?credit_purchase=cancelled`,
        }),
      });

      if (response.ok) {
        const { checkout_url } = await response.json();
        window.location.href = checkout_url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating credit checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format transaction date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <StatusIcon className={`h-4 w-4 ${creditStatus.color}`} />
              <span className="text-sm font-medium">{credits}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Credit Balance: {credits} credits</p>
            <p className="text-xs text-muted-foreground">
              Status: {creditStatus.status === 'good' ? 'Good' : creditStatus.status === 'low' ? 'Low' : 'Critical'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Credit Balance Display */}
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`flex items-center gap-2 ${creditStatus.bgColor} ${creditStatus.color} hover:opacity-80 transition-opacity`}
          >
            <StatusIcon className="h-4 w-4" />
            <span className="font-medium">{credits}</span>
            <span className="text-xs opacity-75">credits</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Credit Balance: {credits}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Credit Status */}
          <div className="px-2 py-1">
            <div className={`text-xs p-2 rounded ${creditStatus.bgColor} ${creditStatus.color}`}>
              Status: {creditStatus.status === 'good' ? 'Sufficient Credits' : 
                      creditStatus.status === 'low' ? 'Running Low' : 'Critical - Top Up Needed'}
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          {/* Quick Top-Up Options */}
          <DropdownMenuLabel>Quick Top-Up</DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={() => handleQuickTopUp(100, 'price_100_credits')}
            disabled={isLoading}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Plus className="h-3 w-3" />
              100 Credits
            </span>
            <span className="text-xs text-muted-foreground">$9.99</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleQuickTopUp(500, 'price_500_credits')}
            disabled={isLoading}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Zap className="h-3 w-3" />
              500 Credits
            </span>
            <span className="text-xs text-muted-foreground">$39.99</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Recent Transactions */}
          <DropdownMenuLabel>Recent Activity</DropdownMenuLabel>
          {recentTransactions.length > 0 ? (
            recentTransactions.slice(0, 3).map((transaction) => (
              <DropdownMenuItem key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {transaction.type === 'purchase' ? (
                    <Plus className="h-3 w-3 text-green-600" />
                  ) : (
                    <Zap className="h-3 w-3 text-blue-600" />
                  )}
                  <div>
                    <div className="text-xs truncate max-w-32">{transaction.description}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</div>
                  </div>
                </div>
                <span className={`text-xs font-medium ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                </span>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>
              <span className="text-xs text-muted-foreground">No recent activity</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          {/* View All Link */}
          <DropdownMenuItem onClick={() => router.push('/dashboard/credits')}>
            <span className="text-xs">View All Transactions</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Top-Up Button */}
      {showTopUpButton && (
        <Button
          variant="default"
          size="sm"
          onClick={() => router.push('/dashboard/credits/purchase')}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Top Up
            </>
          )}
        </Button>
      )}
    </div>
  );
}

