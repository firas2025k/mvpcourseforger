// components/UserPlanCard.tsx
'use client'; // This directive makes this a Client Component

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Adjust path if necessary
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Adjust path if necessary
import { Crown } from 'lucide-react'; // Make sure you have lucide-react installed

// Define the props that this component will receive
interface UserPlanCardProps {
  userPlan: {
    name: string;
    coursesRemaining: number;
    // Add any other properties of userPlan you use
  };
  hasActivePaidSubscription: boolean;
  // If you have a ManageSubscriptionButton, you might pass its props or logic here too
  ManageSubscriptionButton?: React.ComponentType; // Or specific component for manage button
}

export default function UserPlanCard({ userPlan, hasActivePaidSubscription, ManageSubscriptionButton }: UserPlanCardProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">User Plan</CardTitle>
        <Crown className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-lg font-bold">{userPlan.name}</div>
        <p className="text-xs text-muted-foreground">
          {`${userPlan.coursesRemaining} course${userPlan.coursesRemaining === 1 ? '' : 's'} remaining`}
        </p>
        {/* Render ManageSubscriptionButton if provided and applicable */}
        {hasActivePaidSubscription && ManageSubscriptionButton && <ManageSubscriptionButton />}

        {/* Button to redirect to pricing page, shown if no active paid subscription */}
        {!hasActivePaidSubscription && (
          <Button
            className="w-full mt-4" // `w-full` makes it full width, `mt-4` adds top margin for spacing
            onClick={() => router.push('/pricing')} // Redirect to the /pricing route
          >
            View Pricing Plans
          </Button>
        )}
      </CardContent>
    </Card>
  );
}