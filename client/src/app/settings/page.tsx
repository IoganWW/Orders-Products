'use client';

import React, { lazy, Suspense } from 'react';
import AuthWrapper from '@/components/Auth/AuthWrapper';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import PageSkeleton from '@/components/UI/PageSkeleton';

const SettingsPageContent = lazy(() => import('@/components/Pages/SettingPageContent'));

export default function SettingsPage() {
  return (
    <ErrorBoundary>
      <AuthWrapper>
        <Suspense fallback={<PageSkeleton />}>
          <SettingsPageContent />
        </Suspense>
      </AuthWrapper>
    </ErrorBoundary>
  );
}