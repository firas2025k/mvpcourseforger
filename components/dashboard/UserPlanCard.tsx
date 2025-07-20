// components/dashboard/UserPlanCard.tsx
'use client'; // This directive makes this a Client Component

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Coins, Plus, TrendingUp, AlertTriangle, Zap, ShoppingCart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ManageSubscriptionButton from './ManageSubscriptionButton';

// Define the props that this component will receive
interface UserPlanCardProps {
  userPlan: {
    name: string;
    coursesRemaining: number;
    courseLimit: number;
    coursesCreated: number;
    credits?: number; // New: current credit balance
  };
  hasActivePaidSubscription: boolean;
  ManageSubscriptionButton?: React.ComponentType;
}

interface CreditTransaction {
  id: string;
  type: 'purchase' | 'consumption' | 'adjustment';
  amount: number;
  description: string;
  created_at: string;
}

export default function UserPlanCard({ userPlan, hasActivePaidSubscription, ManageSubscriptionButton }: UserPlanCardProps) {
  const router = useRouter();
  const { name, coursesRemaining, courseLimit, coursesCreated, credits = 0 } = userPlan;
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<CreditTransaction[]>([]);
  const [showTransactions, setShowTransactions] = useState(false);
  
  const progress = ((courseLimit - coursesRemaining) / courseLimit) * 100;
  const isLimitReached = coursesRemaining <= 0;
  
  // Credit status determination
  const getCreditStatus = (creditBalance: number) => {
    if (creditBalance >= 20) return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-100', icon: Coins };
    if (creditBalance >= 5) return { status: 'low', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: AlertTriangle };
    return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertTriangle };
  };

  const creditStatus = getCreditStatus(credits);
  const StatusIcon = creditStatus.icon;

  // Fetch recent credit transactions
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        const response = await fetch('/api/user/credit-transactions?limit=3');
        if (response.ok) {
          const data = await response.json();
          setRecentTransactions(data.transactions || []);
        }
      } catch (error) {
        console.error('Error fetching credit transactions:', error);
      }
    };

    if (showTransactions) {
      fetchRecentTransactions();
    }
  }, [showTransactions]);

  // Handle credit top-up
  const handleTopUp = async () => {
    setIsLoadingCredits(true);
    try {
      // Redirect to credit purchase page or open modal
      router.push('/dashboard/credit/purchase');
    } catch (error) {
      console.error('Error initiating credit top-up:', error);
    } finally {
      setIsLoadingCredits(false);
    }
  };

  // Handle Stripe checkout for credits
  const handleQuickTopUp = async (creditAmount: number, priceId: string) => {
    setIsLoadingCredits(true);
    try {
      const response = await fetch('/api/stripe/create-credit-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          credit_amount: creditAmount,
          success_url: `${window.location.origin}/dashboard?credit_purchase=success`,
          cancel_url: `${window.location.origin}/dashboard?credit_purchase=cancelled`,
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
      // You might want to show a toast notification here
    } finally {
      setIsLoadingCredits(false);
    }
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Gradient background for visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"></div>
      
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">User Plan</CardTitle>
        <Crown className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        {/* Plan Information */}
        <div>
          <div className="text-lg font-bold">{name} Plan</div>
          
        </div>

        <Separator />

        {/* Credit Balance Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-4 w-4 ${creditStatus.color}`} />
              <span className="text-sm font-medium">Credits</span>
            </div>
            <Badge 
              variant="secondary" 
              className={`${creditStatus.bgColor} ${creditStatus.color} border-0`}
            >
              {credits} credits
            </Badge>
          </div>

          {/* Credit Status Message */}
          {creditStatus.status === 'critical' && (
            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-red-700 dark:text-red-400">
                Low credits! Top up to continue generating content.
              </span>
            </div>
          )}

          {creditStatus.status === 'low' && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-xs text-yellow-700 dark:text-yellow-400">
                Running low on credits. Consider topping up soon.
              </span>
            </div>
          )}

          {/* Quick Top-Up Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickTopUp(100, 'price_100_credits')} // Replace with actual price ID
              disabled={isLoadingCredits}
              className="flex items-center gap-1 text-xs"
            >
              <Plus className="h-3 w-3" />
              100 Credits
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickTopUp(500, 'price_500_credits')} // Replace with actual price ID
              disabled={isLoadingCredits}
              className="flex items-center gap-1 text-xs"
            >
              <Zap className="h-3 w-3" />
              500 Credits
            </Button>
          </div>

          {/* Main Top-Up Button */}
          <Button
            variant="default"
            size="sm"
            onClick={handleTopUp}
            disabled={isLoadingCredits}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isLoadingCredits ? 'Loading...' : 'Buy More Credits'}
          </Button>

          {/* Recent Transactions Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTransactions(!showTransactions)}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            {showTransactions ? 'Hide' : 'Show'} Recent Activity
          </Button>

          {/* Recent Transactions */}
          {showTransactions && (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {transaction.type === 'purchase' ? (
                        <Plus className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-blue-600" />
                      )}
                      <span className="truncate max-w-24">{transaction.description}</span>
                    </div>
                    <span className={`font-medium ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground text-center py-2">
                  No recent transactions
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Subscription Management */}
        <div className="space-y-2">
          {hasActivePaidSubscription && ManageSubscriptionButton && (
            <ManageSubscriptionButton />
          )}
          
          {!hasActivePaidSubscription && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/pricing')}
              className="w-full"
            >
              View Pricing Plans
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

