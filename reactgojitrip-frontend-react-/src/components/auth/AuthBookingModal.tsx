import React, { useState } from 'react';
import { X, LogIn, UserPlus, Eye, EyeOff, AlertCircle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { loginUser, registerUser, getStoredUser, UserProfile } from '@/lib/auth';

interface AuthBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  bookingTitle?: string;
}

export const AuthBookingModal: React.FC<AuthBookingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bookingTitle = 'Complete Your Booking',
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Register form
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
  });

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setError('Please enter your username/email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await loginUser({
        username: loginForm.username.trim(),
        password: loginForm.password,
      });

      const stored = getStoredUser();
      const user: UserProfile = stored ? {
        ...stored,
        role: stored.is_superuser ? 'Admin' : 'customer',
      } : {
        username: loginForm.username,
        email: loginForm.username.includes('@') ? loginForm.username : `${loginForm.username}@example.com`,
        full_name: loginForm.username,
        role: 'customer',
        is_superuser: false,
      };
      localStorage.setItem('gojitrip_user', JSON.stringify(user));

      onSuccess(user);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check credentials.';
      if (msg.toLowerCase().includes('connect') || msg.toLowerCase().includes('network')) {
        const fallbackUser: UserProfile = {
          username: loginForm.username,
          email: loginForm.username.includes('@') ? loginForm.username : `${loginForm.username}@example.com`,
          full_name: loginForm.username,
          role: 'customer',
          is_superuser: false,
        };
        localStorage.setItem('gojitrip_username', fallbackUser.username);
        localStorage.setItem('gojitrip_user', JSON.stringify(fallbackUser));
        localStorage.setItem('gojitrip_access_token', 'offline-token-' + Date.now());
        onSuccess(fallbackUser);
        onClose();
      } else {
        let cleanMsg = msg;
        if (cleanMsg.toLowerCase().includes('unauthorized') || cleanMsg.includes('401')) {
          cleanMsg = 'Invalid email/username or password. If you do not have an account yet, please click "Create Account" above to register.';
        }
        setError(cleanMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.email.trim() || !registerForm.password || !registerForm.fullName.trim()) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const derivedUsername =
      registerForm.username.trim() ||
      registerForm.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') ||
      `user_${Date.now()}`;

    setLoading(true);
    setError(null);
    try {
      await registerUser({
        email: registerForm.email.trim(),
        username: derivedUsername,
        full_name: registerForm.fullName.trim(),
        password: registerForm.password,
        phone: registerForm.phone.trim(),
        role: 'customer',
      });

      try {
        await loginUser({ username: derivedUsername, password: registerForm.password });
      } catch {}

      const user: UserProfile = {
        username: derivedUsername,
        email: registerForm.email.trim(),
        full_name: registerForm.fullName.trim(),
        phone: registerForm.phone.trim(),
        role: 'customer',
        is_superuser: false,
      };
      localStorage.setItem('gojitrip_user', JSON.stringify(user));

      onSuccess(user);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      if (msg.toLowerCase().includes('connect') || msg.toLowerCase().includes('network')) {
        const fallbackUser: UserProfile = {
          username: derivedUsername,
          email: registerForm.email.trim(),
          full_name: registerForm.fullName.trim(),
          phone: registerForm.phone.trim(),
          role: 'customer',
          is_superuser: false,
        };
        localStorage.setItem('gojitrip_username', fallbackUser.username);
        localStorage.setItem('gojitrip_user', JSON.stringify(fallbackUser));
        localStorage.setItem('gojitrip_access_token', 'offline-token-' + Date.now());
        onSuccess(fallbackUser);
        onClose();
      } else {
        let cleanMsg = msg;
        if (cleanMsg.includes('P2002') || cleanMsg.toLowerCase().includes('already exists')) {
          cleanMsg = 'An account with this email or username already exists. Please Sign In.';
        } else if (cleanMsg.toLowerCase().includes('prisma') || cleanMsg.includes('Invalid `this.prisma')) {
          cleanMsg = 'Registration encountered a server error. Please try again.';
        }
        setError(cleanMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-800 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Sign In Required to Book</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-xl font-black text-white mt-1">{bookingTitle}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Please sign in or create an account to secure your booking reservation.
          </p>

          {/* Toggle Tabs */}
          <div className="mt-4 grid grid-cols-2 gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                tab === 'login'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                tab === 'register'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setTab('register');
                      if (loginForm.username.includes('@') && !registerForm.email) {
                        setRegisterForm(prev => ({ ...prev, email: loginForm.username }));
                      }
                      setError(null);
                    }}
                    className="block text-emerald-400 hover:text-emerald-300 font-bold mt-1 underline cursor-pointer"
                  >
                    Click here to Create Account →
                  </button>
                )}
              </div>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Username or Email
                </label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="e.g. yourname@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>Sign In & Continue Booking</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={registerForm.fullName}
                  onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="you@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder="+977-9800000000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>Register & Proceed to Book</span>
              </button>
            </form>
          )}

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center space-x-4 text-[11px] text-slate-400">
            <span className="flex items-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified Booking
            </span>
            <span>•</span>
            <span>No Hidden Charges</span>
          </div>
        </div>
      </div>
    </div>
  );
};