import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cmsStore } from "@/lib/cms-store";
import {
  LayoutDashboard,
  Bus,
  MapPin,
  Hotel,
  UtensilsCrossed,
  Compass,
  Image as ImageIcon,
  CheckSquare,
  Mountain,
  Sparkles,
  Users,
  User,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const [stats, setStats] = React.useState(cmsStore.getStats());

  React.useEffect(() => {
    setStats(cmsStore.getStats());
    const unsubscribe = cmsStore.subscribe(() => {
      setStats(cmsStore.getStats());
    });
    return unsubscribe;
  }, []);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
      label: "Transport Module",
      href: "/transport",
      icon: Bus,
      badge: stats.transportsCount,
    },
    {
      label: "Route Management",
      href: "/routes",
      icon: MapPin,
      badge: stats.routesCount,
    },
    {
      label: "Hotels & Homestays",
      href: "/hotels",
      icon: Hotel,
      badge: stats.hotelsCount,
    },
    {
      label: "Restaurants",
      href: "/restaurants",
      icon: UtensilsCrossed,
      badge: stats.restaurantsCount,
    },
    {
      label: "Activities",
      href: "/activities",
      icon: Compass,
      badge: stats.activitiesCount,
    },
    { label: "Guides", href: "/guides", icon: User, badge: stats.guidesCount },
    {
      label: "Media Library",
      href: "/media",
      icon: ImageIcon,
      badge: stats.mediaCount,
    },
    {
      label: "Data Approval Workflow",
      href: "/workflow",
      icon: CheckSquare,
      badge: stats.underReviewCount + stats.draftCount,
      highlight: true,
    },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/80">
          <img
            src="/logo/gojitriplogo.png"
            alt="GojiTrip Logo"
            className="h-9 w-auto object-contain bg-white p-1.5 rounded-xl shadow-sm"
          />
          <span className="text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
            Admin CMS
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Content Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400"}`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.highlight && item.badge > 0
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                        : isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
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

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#182238] to-[#111827] border border-slate-800 text-left">
          <div className="flex items-center text-xs font-bold text-emerald-400 mb-1">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Zero Empty Pages Strategy
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Log, verify, and publish real travel data so GojiTrip launches fully
            loaded with authentic Nepal routes.
          </p>
        </div>
      </div>
    </aside>
  );
};
