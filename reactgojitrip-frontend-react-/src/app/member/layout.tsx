import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useMemberAuth } from '@/lib/member-auth';
import {
  Home,
  Truck,
  UtensilsCrossed,
  LayoutDashboard,
  CreditCard,
  LogOut,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  User,
  Building2,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

export default function MemberLayout() {
  const { member, isAuthenticated, logout } = useMemberAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // If not authenticated, redirect to login
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/member/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!member) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const category = member.category;
  const canManageHomestays = category === 'Home & Homestays' || category === 'Combo';
  const canManageTraveling = category === 'Traveling' || category === 'Combo';
  const canManageRestaurants = category === 'Restaurant' || category === 'Combo';

  const navItems = [
    {
      label: 'Dashboard',
      path: '/member/dashboard',
      icon: LayoutDashboard,
      show: true,
      badge: null,
    },
    {
      label: 'Home & Homestays',
      path: '/member/homestays',
      icon: Home,
      show: canManageHomestays,
      badge: 'Stays',
    },
    {
      label: 'Traveling & Fleet',
      path: '/member/traveling',
      icon: Truck,
      show: canManageTraveling,
      badge: 'Travel',
    },
    {
      label: 'Restaurants & Dining',
      path: '/member/restaurants',
      icon: UtensilsCrossed,
      show: canManageRestaurants,
      badge: 'Food',
    },
    {
      label: 'My Subscription',
      path: '/member/subscription',
      icon: CreditCard,
      show: true,
      badge: member.subscriptionStatus || 'Active',
    },
  ].filter((item) => item.show);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Home & Homestays':
        return 'from-amber-500 to-orange-500 text-amber-300 border-amber-500/30';
      case 'Traveling':
        return 'from-blue-500 to-cyan-500 text-cyan-300 border-cyan-500/30';
      case 'Restaurant':
        return 'from-rose-500 to-pink-500 text-rose-300 border-rose-500/30';
      case 'Combo':
      default:
        return 'from-emerald-500 to-teal-500 text-emerald-300 border-emerald-500/30';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/member/login');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col md:flex-row">
      {/* ========================================================
          MOBILE TOP BAR
      ======================================================== */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0F172A] border-b border-slate-800">
        <Link to="/member/dashboard" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-emerald-500/20">
            G
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white">GojiTrip</span>
            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Partner
            </span>
          </div>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ========================================================
          SIDEBAR (Desktop & Mobile drawer)
      ======================================================== */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-[#0F172A] border-r border-slate-800 shrink-0 flex flex-col justify-between`}
      >
        <div>
          {/* Brand & Member Info */}
          <div className="p-5 border-b border-slate-800/80">
            <Link to="/member/dashboard" className="hidden md:flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-emerald-500/20">
                G
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base tracking-tight text-white">GojiTrip</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Partner
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Member Portal</p>
              </div>
            </Link>

            {/* Current Member Profile Summary */}
            <div className="mt-5 p-3 rounded-2xl bg-[#182238] border border-slate-700/60">
              <div className="flex items-center space-x-3">
                <img
                  src={
                    member.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=10b981&color=fff`
                  }
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{member.name}</p>
                  <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{member.businessName}</span>
                  </p>
                </div>
              </div>

              {/* Category Badge */}
              <div className="mt-2.5 pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Module:
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border bg-gradient-to-r ${getCategoryColor(
                    category
                  )} bg-opacity-10`}
                >
                  {category}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <p className="px-3 pt-2 pb-1.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Management Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800/80 space-y-1">
          <Link
            to="/membership"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Pricing Page</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </Link>

          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>GojiTrip Public Site</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition mt-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Portal</span>
          </button>
        </div>
      </aside>

      {/* ========================================================
          MAIN CONTENT AREA
      ======================================================== */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#0B0F17]">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
