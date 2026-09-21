import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getToken } from '@/lib/api';
import { getStoredUser, isAdminUser, logoutUser, UserProfile } from '@/lib/auth';
import { ShieldAlert, LogOut, Home } from 'lucide-react';

/**
 * AuthGuard — wraps pages that require authentication and administrator permissions.
 * If no token is found, redirects to /auth/login immediately.
 * If the user is a customer/traveler, denies access to the CMS admin panel.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(getStoredUser());

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate(`/auth/login?next=${encodeURIComponent(location.pathname)}`, { replace: true });
      return;
    }

    const user = getStoredUser();
    setUserProfile(user);

    if (!isAdminUser(user)) {
      setIsUnauthorized(true);
      setChecking(false);
    } else {
      setIsUnauthorized(false);
      setChecking(false);
    }
  }, [location.pathname, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-rose-500/10 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-md w-full bg-[#111827] border border-rose-500/30 rounded-3xl p-7 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-white tracking-tight">Admin Privileges Required</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Your account (<span className="text-white font-semibold">{userProfile?.email || userProfile?.username || 'Customer'}</span>) is signed in as a traveler / customer. Access to the GojiTrip CMS Admin Panel is restricted to administrators only.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Back to GojiTrip Travel</span>
            </Link>

            <button
              onClick={async () => {
                await logoutUser();
                navigate('/auth/login', { replace: true });
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign In as Admin</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
