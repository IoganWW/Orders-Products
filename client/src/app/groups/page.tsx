'use client';

import React, { lazy, Suspense } from 'react';
import AuthWrapper from '@/components/Auth/AuthWrapper';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import PageSkeleton from '@/components/UI/PageSkeleton';

const GroupsPageContent = lazy(() => import('@/app/groups/page'));

export default function GroupsPage() {
  return (
    <AuthWrapper>
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <GroupsPageContent />
        </Suspense>
      </ErrorBoundary>
    </AuthWrapper>
  );
}