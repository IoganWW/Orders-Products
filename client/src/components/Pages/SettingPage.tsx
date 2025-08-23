'use client';

import React, { lazy, Suspense } from 'react';
import AuthWrapper from '@/components/Auth/AuthWrapper';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import PageSkeleton from '@/components/UI/PageSkeleton';

const SettingsPageContent = lazy(() => import('@/app/settings/page'));

export default function SettingsPage() {
  return (
    <AuthWrapper>
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <SettingsPageContent />
        </Suspense>
      </ErrorBoundary>
    </AuthWrapper>
  );
}
