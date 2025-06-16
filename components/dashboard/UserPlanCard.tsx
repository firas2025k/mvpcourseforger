// components/dashboard/UserPlanCard.tsx
'use client'; // This directive makes this a Client Component

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import ManageSubscriptionButton from './ManageSubscriptionButton';

// Define the props that this component will receive
interface UserPlanCardProps {
  userPlan: {
    name: string;
    coursesRemaining: number;
    courseLimit: number; // Added to calculate progress
    coursesCreated: number; // Added to calculate progress
  };
  hasActivePaidSubscription: boolean;
  ManageSubscriptionButton?: React.ComponentType; // Or specific component for manage button
}

export default function UserPlanCard({ userPlan, hasActivePaidSubscription, ManageSubscriptionButton }: UserPlanCardProps) {
  const router = useRouter();
  const { name, coursesRemaining, courseLimit, coursesCreated } = userPlan;
  const progress = ((courseLimit - coursesRemaining) / courseLimit) * 100; // Percentage of courses used
  const isLimitReached = coursesRemaining <= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">User Plan</CardTitle>
        <Crown className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-lg font-bold">{name}</div>
        <p className="text-xs text-muted-foreground">
          {`${coursesRemaining} / ${courseLimit} course${courseLimit === 1 ? '' : 's'} remaining`}
        </p>
        <Progress
          value={progress}
          className={`mt-2 w-full ${isLimitReached ? 'bg-red-500' : 'bg-gray-200'}`} // Background color
          data-state={isLimitReached ? 'limit-reached' : 'normal'} // Custom state for styling
        />
        {/* Apply custom styles via a parent wrapper */}
        <style jsx>{`
          [data-state='limit-reached'] [role='progressbar'] {
            background-color: #ef4444; /* Red when limit reached */
          }
          [data-state='normal'] [role='progressbar'] {
            background-color: #9333ea; /* Purple when normal */
          }
        `}</style>
        {/* Render ManageSubscriptionButton when hasActivePaidSubscription is true */}
        {hasActivePaidSubscription && ManageSubscriptionButton && <ManageSubscriptionButton />}
        {/* Button to redirect to pricing page, shown if no active paid subscription */}
        {!hasActivePaidSubscription && (
          <Button
            className="w-full mt-4"
            onClick={() => router.push('/pricing')}
          >
            View Pricing Plans
          </Button>
        )}
      </CardContent>
    </Card>
  );
}