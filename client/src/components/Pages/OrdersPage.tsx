'use client';

import React, { lazy, Suspense } from 'react';
import AuthWrapper from '@/components/Auth/AuthWrapper';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import PageSkeleton from '@/components/UI/PageSkeleton';

const OrdersPageContent = lazy(() => import('@/app/orders/page'));

export default function OrdersPage() {
  return (
    <AuthWrapper>
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <OrdersPageContent />
        </Suspense>
      </ErrorBoundary>
    </AuthWrapper>
  );
}
