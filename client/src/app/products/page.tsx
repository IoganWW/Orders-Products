'use client';

import React, { lazy, Suspense } from 'react';
import AuthWrapper from '@/components/Auth/AuthWrapper';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import PageSkeleton from '@/components/UI/PageSkeleton';

const ProductsPageContent = lazy(() => import('@/app/products/page'));

export default function ProductsPage() {
  return (
    <AuthWrapper>
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <ProductsPageContent />
        </Suspense>
      </ErrorBoundary>
    </AuthWrapper>
  );
}
