import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemberAuth } from '@/lib/member-auth';
import { MemberCategory } from '@/types/cms';
import {
  UserPlus,
  ArrowRight,
  Home,
  Truck,
  UtensilsCrossed,
  Layers,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
} from 'lucide-react';

export default function MemberRegisterPage() {
  const { register } = useMemberAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState<MemberCategory>('Home & Homestays');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categoriesConfig: {
    type: MemberCategory;
    title: string;
    description: string;
    icon: any;
    accent: string;
    activeBorder: string;
    benefits: string[];
  }[] = [
    {
      type: 'Home & Homestays',
      title: 'Home & Homestays',
      description: 'For homestays, boutique mountain lodges, teahouses, and hotels across Nepal.',
      icon: Home,
      accent: 'text-amber-400 bg-amber-500/10',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5',
      benefits: ['List homestay rooms & seasonal rates', 'Direct guest WhatsApp calls', '0% booking fee'],
    },
    {
      type: 'Traveling',
      title: 'Traveling',
      description: 'For 4x4 Jeep operators, EV shuttle fleets, Scorpio drivers, and tourist bus routes.',
      icon: Truck,
      accent: 'text-cyan-400 bg-cyan-500/10',
      activeBorder: 'border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-500/5',
      benefits: ['List vehicles & departure schedules', 'Highway route booking leads', 'Seat availability status'],
    },
    {
      type: 'Restaurant',
      title: 'Restaurant',
      description: 'For highway restaurants, Thakali kitchens, organic cafes, and dining spots.',
      icon: UtensilsCrossed,
      accent: 'text-rose-400 bg-rose-500/10',
      activeBorder: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5',
      benefits: ['Showcase digital menu & specials', 'Interactive road trip meal pin', 'Direct table inquiries'],
    },
    {
      type: 'Combo',
      title: 'Combo (All-in-One)',
      description: 'For hospitality enterprises managing Stays, Transports, and Dining all under one roof.',
      icon: Layers,
      accent: 'text-emerald-400 bg-emerald-500/10',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5',
      benefits: ['All 3 modules unlocked', 'Unified partner dashboard', 'Maximum traveler visibility'],
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.businessName.trim()) {
      setError('Please fill in all required fields (Name, Business Name, Email, Phone).');
      return;
    }

    setIsLoading(true);
    const res = register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      businessName: formData.businessName,
      category,
      address: formData.address || 'Nepal',
    });
    setIsLoading(false);

    if (res.success) {
      navigate('/member/dashboard');
    } else {
      setError(res.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative w-full max-w-3xl space-y-6">
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
              Partner Registration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Join the GojiTrip Nepal Partner Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Choose your business category below. Each member receives a dedicated private portal to list and manage their properties, vehicles, or dining menus.
          </p>
        </div>

        {/* Registration Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-[#0F172A]/90 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Category Selection Cards */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>1. Select Your Business Category</span>
                <span className="text-[11px] text-emerald-400 font-bold lowercase">
                  * determines your panel tools
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categoriesConfig.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.type;

                  return (
                    <button
                      key={cat.type}
                      type="button"
                      onClick={() => setCategory(cat.type)}
                      className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                        isSelected
                          ? cat.activeBorder
                          : 'border-slate-800 bg-[#141E33] hover:border-slate-700'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2.5 mb-2">
                          <div className={`p-2 rounded-xl shrink-0 ${cat.accent}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-extrabold text-white">{cat.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                          {cat.description}
                        </p>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-slate-700/50">
                        {cat.benefits.map((b, i) => (
                          <div key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Member & Business Details */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider">
                2. Business & Contact Information
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Full Name (Host / Owner) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sujata Thakali"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Business / Listing Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annapurna Eco Lodge & Homestay"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sujata@annapurnalodge.np"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Mobile / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +977-9846012345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    City, Region or Highway Corridor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ghandruk, Pokhara, Prithvi Highway, Mustang"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/30 transition flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Creating Partner Account...' : `Register as ${category} Member`}</span>
            </button>
          </form>

          {/* Login Prompt */}
          <div className="pt-4 border-t border-slate-800/80 text-center flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-medium">
              Already registered as a partner?
            </span>
            <Link
              to="/member/login"
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline"
            >
              <span>Sign In to Member Portal</span>
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
            View Membership Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
