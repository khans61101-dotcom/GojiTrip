import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ShieldCheck, AlertCircle, CheckCircle2, Loader2, Home } from 'lucide-react';
import { registerUser } from '@/lib/auth';

interface FormState {
  email: string;
  username: string;
  full_name: string;
  password: string;
  confirm_password: string;
}

const initialForm: FormState = {
  email: '',
  username: '',
  full_name: '',
  password: '',
  confirm_password: '',
};

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const map = [
    { label: '', color: '' },
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Fair', color: 'bg-amber-500' },
    { label: 'Good', color: 'bg-blue-500' },
    { label: 'Strong', color: 'bg-emerald-500' },
  ];
  return { score, ...(map[score] ?? map[0]) };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(form.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const validate = (): string | null => {
    if (!form.email.trim()) return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address.';
    if (!form.username.trim()) return 'Username is required.';
    if (form.username.length < 3) return 'Username must be at least 3 characters.';
    if (!form.password) return 'Password is required.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirm_password) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError(null);
    try {
      await registerUser({
        email: form.email,
        username: form.username,
        full_name: form.full_name || undefined,
        password: form.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/auth/login'), 2200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Top Left Navigation Button */}
      <div className="absolute top-6 left-6 z-30">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-xl backdrop-blur-md group"
        >
          <Home className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>← Back to Home</span>
        </Link>
      </div>
      {/* Animated background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-teal-900/10 blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-md py-8">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-2xl shadow-indigo-900/60 mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">GojiTrip CMS</h1>
          <p className="text-slate-400 text-sm mt-1">Create your staff account</p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="relative bg-gradient-to-b from-slate-900/90 to-[#0f1829]/90 backdrop-blur-xl border border-emerald-700/50 rounded-3xl p-10 shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Account Created!</h2>
            <p className="text-slate-400 text-sm">Redirecting you to the login page...</p>
          </div>
        ) : (
          /* Card */
          <div className="relative bg-gradient-to-b from-slate-900/90 to-[#0f1829]/90 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl">
            {/* Subtle top line accent */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent rounded-full" />

            <div className="mb-7">
              <h2 className="text-xl font-bold text-white">Create your account</h2>
              <p className="text-slate-400 text-sm mt-1">Fill in your details to get started</p>
            </div>

            {error && (
              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 mb-5 text-sm text-red-300">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
              {/* Email */}
              <div>
                <label htmlFor="register-email" className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@gojitrip.com"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 transition-all disabled:opacity-50"
                />
              </div>

              {/* Username */}
              <div>
                <label htmlFor="register-username" className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Username <span className="text-red-400">*</span>
                </label>
                <input
                  id="register-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="e.g. rahul_cms"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 transition-all disabled:opacity-50"
                />
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="register-fullname" className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Full Name <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  id="register-fullname"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 transition-all disabled:opacity-50"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="register-password" className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    disabled={loading}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-800/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength bar */}
                {form.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength.score ? strength.color : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    {strength.label && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Strength: <span className="font-semibold text-slate-300">{strength.label}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="register-confirm-password" className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="register-confirm-password"
                    name="confirm_password"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    disabled={loading}
                    className={`w-full px-4 py-3 pr-12 rounded-xl bg-slate-800/70 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50 ${
                      form.confirm_password.length > 0
                        ? form.password === form.confirm_password
                          ? 'border-emerald-500/60'
                          : 'border-red-500/60'
                        : 'border-slate-700/80'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    tabIndex={-1}
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.confirm_password.length > 0 && form.password !== form.confirm_password && (
                  <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Submit */}
              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-indigo-900/40 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-[#0f1829] text-slate-500">Already have an account?</span>
              </div>
            </div>

            <Link
              to="/auth/login"
              id="go-to-login-link"
              className="flex items-center justify-center w-full py-3 rounded-xl border border-slate-700/80 bg-slate-800/40 hover:bg-slate-800/70 text-slate-300 hover:text-white text-sm font-semibold transition-all"
            >
              Sign In Instead
            </Link>
          </div>
        )}

        <p className="text-center text-xs text-slate-600 mt-6">
          © {new Date().getFullYear()} GojiTrip · Internal Staff Only
        </p>
      </div>
    </div>
  );
}
