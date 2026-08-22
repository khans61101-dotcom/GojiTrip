import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getToken } from '@/lib/api';

/**
 * AuthGuard — wraps pages that require authentication.
 * If no token is found, redirects to /auth/login immediately.
 * Shows a loading spinner while checking auth status.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate(`/auth/login?next=${encodeURIComponent(location.pathname)}`, { replace: true });
    } else {
      setChecking(false);
    }
  }, [location.pathname, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
