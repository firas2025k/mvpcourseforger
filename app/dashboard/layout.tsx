

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Suspense } from 'react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="w-full h-10 bg-muted animate-pulse" />}>
        {children}
      </Suspense>
    </DashboardLayout>
  );
}
