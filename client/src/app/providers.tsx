// client/src/app/providers.tsx
'use client';

import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { store } from '@/store';
import { initializeAuth } from '@/store/slices/authSlice';

function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Инициализируем авторизацию при загрузке приложения
    store.dispatch(initializeAuth());
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Provider>
  );
}