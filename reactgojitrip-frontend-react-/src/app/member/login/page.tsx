import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemberAuth, getAllMembers } from '@/lib/member-auth';
import {
  LogIn,
  ArrowRight,
  ShieldCheck,
  Home,
  Truck,
  UtensilsCrossed,
  Layers,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function MemberLoginPage() {
  const { login } = useMemberAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your member email address.');
      return;
    }

    setIsLoading(true);
    const res = login(email);
    setIsLoading(false);

    if (res.success) {
      navigate('/member/dashboard');
    } else {
      setError(res.error || 'Login failed. Please check your email.');
    }
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setError('');
    setIsLoading(true);
    const res = login(demoEmail);
    setIsLoading(false);
    if (res.success) {
      navigate('/member/dashboard');
    } else {
      setError(res.error || 'Failed to login with demo account.');
    }
  };

  const demoAccounts = [
    {
      category: 'Home & Homestays',
      name: 'Sujata Thakali',
      business: 'Annapurna Eco Lodge & Homestay',
      email: 'demo.homestay@gojitrip.com',
      icon: Home,
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20',
      badge: 'Stays Host',
    },
    {
      category: 'Traveling',
      name: 'Bikash Gurung',
      business: 'Gurung Mountain 4x4 Fleet',
      email: 'demo.travel@gojitrip.com',
      icon: Truck,
      color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20',
      badge: 'Transport Operator',
    },
    {
      category: 'Restaurant',
      name: 'Rohan Shrestha',
      business: 'Himalayan Sherpa Kitchen',
      email: 'demo.restaurant@gojitrip.com',
      icon: UtensilsCrossed,
      color: 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
      badge: 'Dining Partner',
    },
    {
      category: 'Combo',
      name: 'Dipendra Lama',
      business: 'Everest Panorama Resort, Fleet & Cafe',
      email: 'demo.combo@gojitrip.com',
      icon: Layers,
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20',
      badge: 'All-In-One Partner',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-500/25">
              G
            </div>
            <span className="text-2xl font-black tracking-tight text-white">GojiTrip</span>
          </Link>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
              Partner & Member Portal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Sign In to Manage Your Listings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Manage your Home & Homestays, Traveling Fleets, or Restaurants directly from your private partner dashboard.
          </p>
        </div>

        {/* Main Login Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-[#0F172A]/90 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Member Registered Email</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. yourname@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#182238] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/30 transition flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Accessing Portal...' : 'Sign In to Member Portal'}</span>
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant 1-Click Demo Logins</span>
              </span>
              <span className="text-[10px] text-slate-500">Pick any role below</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickDemoLogin(acc.email)}
                    className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 ${acc.color}`}
                  >
                    <div className="p-2 rounded-xl bg-slate-900/60 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black truncate">{acc.category}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-white/90 truncate">{acc.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{acc.email}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Register Prompt */}
          <div className="pt-4 border-t border-slate-800/80 text-center flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-medium">
              Don't have a partner account yet?
            </span>
            <Link
              to="/member/register"
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline"
            >
              <span>Register Your Business</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Back to Site Links */}
        <div className="flex items-center justify-center space-x-6 text-xs text-slate-500 font-semibold">
          <Link to="/" className="hover:text-slate-300 transition">
            ← Back to GojiTrip Home
          </Link>
          <span>•</span>
          <Link to="/membership" className="hover:text-slate-300 transition">
            Explore Membership Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
