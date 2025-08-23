import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css/animate.min.css';
import './globals.css';
import MainLayout from '@/components/Layout/MainLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Orders & Products - Management System',
  description: 'SPA application for managing orders and products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <MainLayout>
              {children}
            </MainLayout>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}