import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

/**
 * LayoutShell — conditionally renders Sidebar + Header for dashboard routes.
 * Auth routes (/auth/*) get a clean full-screen layout with no chrome.
 */
export function LayoutShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith('/auth');

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
