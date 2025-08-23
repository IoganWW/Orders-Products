'use client';

import React, { lazy, Suspense } from 'react';
import AuthWrapper from '@/components/Auth/AuthWrapper';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import PageSkeleton from '@/components/UI/PageSkeleton';

const UsersPageContent = lazy(() => import('@/components/Pages/UsersPageContent'));

export default function SettingsPage() {
  return (
    <AuthWrapper>
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <UsersPageContent />
        </Suspense>
      </ErrorBoundary>
    </AuthWrapper>
  );
}