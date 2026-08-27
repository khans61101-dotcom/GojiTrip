import React from "react";
import { Link } from "react-router-dom";
import { cmsStore } from "@/lib/cms-store";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Bus,
  MapPin,
  Hotel,
  Home,
  UtensilsCrossed,
  Compass,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  FileEdit,
  Globe,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Plus,
  User,
  Sparkles,
  Layers,
  Activity,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = React.useState(cmsStore.getStats());
  const [logs, setLogs] = React.useState(cmsStore.getWorkflowLogs());
  const [homestaysCount, setHomestaysCount] = React.useState(
    cmsStore.getHotels().filter((h) => h.propertyType === "Homestay").length
  );

  React.useEffect(() => {
    const updateStats = () => {
      setStats(cmsStore.getStats());
      setLogs(cmsStore.getWorkflowLogs());
      setHomestaysCount(
        cmsStore.getHotels().filter((h) => h.propertyType === "Homestay").length
      );
    };

    updateStats();
    const unsubscribe = cmsStore.subscribe(updateStats);
    return unsubscribe;
  }, []);

  const statCards = [
    {
      label: "Total Verified Entries",
      count: stats.totalEntries,
      icon: TrendingUp,
      color: "from-blue-500 to-indigo-600",
      subtext: "Across all 8 travel modules",
    },
    {
      label: "Draft Mode",
      count: stats.draftCount,
      icon: FileEdit,
      color: "from-amber-500 to-orange-600",
      subtext: "Awaiting final review",
    },
    {
      label: "Under Review",
      count: stats.underReviewCount,
      icon: Clock,
      color: "from-indigo-500 to-purple-600",
      subtext: "In approval workflow",
    },
    {
      label: "Approved",
      count: stats.approvedCount,
      icon: CheckCircle2,
      color: "from-teal-500 to-emerald-600",
      subtext: "Ready for publish",
    },
    {
      label: "Published (Live App)",
      count: stats.publishedCount,
      icon: Globe,
      color: "from-emerald-500 to-green-600",
      subtext: "Live on GojiTrip app",
    },
  ];

  const modules = [
    {
      name: "Transport Vehicles & Operators",
      desc: "Jeeps, 4x4s, buses, flight routes & departure schedules",
      count: stats.transportsCount,
      icon: Bus,
      href: "/transport",
      color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    },
    {
      name: "Mountain Routes & Trails",
      desc: "Distances, road surface conditions, ATMs & emergency stops",
      count: stats.routesCount,
      icon: MapPin,
      href: "/routes",
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    },
    {
      name: "Hotels & Mountain Resorts",
      desc: "Verified lodges, luxury resorts, check-in times & room rates",
      count: stats.hotelsCount,
      icon: Hotel,
      href: "/hotels",
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
    {
      name: "Village Homestays",
      desc: "Authentic local host stays, village contact info & cultural stays",
      count: homestaysCount,
      icon: Home,
      href: "/homestays",
      color: "text-teal-400 border-teal-500/30 bg-teal-500/10",
    },
    {
      name: "Thakali & Regional Dining",
      desc: "Local eateries, Thakali set prices & operating hours",
      count: stats.restaurantsCount,
      icon: UtensilsCrossed,
      href: "/restaurants",
      color: "text-orange-400 border-orange-500/30 bg-orange-500/10",
    },
    {
      name: "Activities & Experiences",
      desc: "Trekking expeditions, paragliding & heritage experiences",
      count: stats.activitiesCount,
      icon: Compass,
      href: "/activities",
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    },
    {
      name: "Certified Local Guides",
      desc: "Licensed trekking guides, languages & contact directory",
      count: stats.guidesCount,
      icon: User,
      href: "/guides",
      color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
    },
    {
      name: "Verified Media Asset Library",
      desc: "Deduplicated photo gallery assets for all travel modules",
      count: stats.mediaCount,
      icon: ImageIcon,
      href: "/media",
      color: "text-pink-400 border-pink-500/30 bg-pink-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#0F172A] to-slate-900 border border-emerald-500/30 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/40 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              GojiTrip Official Data Management Pipeline
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Nepal Travel CMS Command Center
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-2 max-w-2xl leading-relaxed">
              Verify, edit, and publish authentic Nepal travel records. Manage transport operators, mountain routes, village homestays, hotels, Thakali restaurants, and adventure activities in real time.
            </p>
          </div>

          {/* Quick Action Hub */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
            <span className="text-[10px] uppercase font-black text-slate-400 px-2 block w-full">Quick Add Content</span>
            <Link
              to="/hotels"
              className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Hotel</span>
            </Link>
            <Link
              to="/homestays"
              className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Homestay</span>
            </Link>
            <Link
              to="/transport"
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Transport</span>
            </Link>
            <Link
              to="/routes"
              className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Route</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={idx}
              className="bg-[#111827] p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {st.label}
                </span>
                <div className={`p-2 rounded-xl bg-gradient-to-tr ${st.color} text-white shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-white">{st.count}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{st.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Content Management Modules</span>
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            {modules.length} Modules Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <Link
                key={idx}
                to={mod.href}
                className="group bg-[#111827] p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all hover:translate-y-[-2px] flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl border ${mod.color} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {mod.count} Items
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {mod.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {mod.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Approval Audit Trail Activity Stream */}
      <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Recent Data Approval & Workflow Audit Logs</span>
          </h2>
          <Link to="/workflow" className="text-xs text-emerald-400 hover:underline font-bold">
            View Approval Center →
          </Link>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No recent workflow activity logs.</p>
        ) : (
          <div className="space-y-3">
            {logs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-extrabold uppercase">
                    {log.entityType}
                  </span>
                  <div>
                    <span className="font-bold text-slate-200">{log.entityTitle}</span>
                    <span className="text-slate-400 ml-2">by {log.changedByName}</span>
                    {log.comment && (
                      <div className="text-[11px] text-slate-400 italic mt-0.5">
                        "{log.comment}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <StatusBadge status={log.previousStatus} interactive={false} />
                  <span className="text-slate-500">→</span>
                  <StatusBadge status={log.newStatus} interactive={false} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
