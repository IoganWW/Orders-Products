'use client';

import React from 'react';
import AuthWrapper from '@/components/Auth/AuthWrapper';

export default function GroupsPage() {
  return (
    <AuthWrapper>
        <div className="page fade-in">
            <div className="page__header px-5">
                <h1 className="page__title px-3">
                  Группы
                </h1>
            </div>
        </div>
    </AuthWrapper>
  );
}