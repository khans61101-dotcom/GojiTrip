import React from 'react';
import { Link } from 'react-router-dom';
import { cmsStore } from '@/lib/cms-store';
import { StatusBadge } from '@/components/common/StatusBadge';
import { 
  Bus, 
  MapPin, 
  Hotel, 
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
  Plus
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = React.useState(cmsStore.getStats());
  const [logs, setLogs] = React.useState(cmsStore.getWorkflowLogs());

  React.useEffect(() => {
    setStats(cmsStore.getStats());
    setLogs(cmsStore.getWorkflowLogs());
    const unsubscribe = cmsStore.subscribe(() => {
      setStats(cmsStore.getStats());
      setLogs(cmsStore.getWorkflowLogs());
    });
    return unsubscribe;
  }, []);

  const statCards = [
    { label: 'Total Verified Entries', count: stats.totalEntries, icon: TrendingUp, color: 'from-blue-500 to-indigo-600' },
    { label: 'Draft Mode', count: stats.draftCount, icon: FileEdit, color: 'from-amber-500 to-orange-600' },
    { label: 'Under Review', count: stats.underReviewCount, icon: Clock, color: 'from-indigo-500 to-purple-600' },
    { label: 'Approved', count: stats.approvedCount, icon: CheckCircle2, color: 'from-teal-500 to-emerald-600' },
    { label: 'Published (Live App)', count: stats.publishedCount, icon: Globe, color: 'from-emerald-500 to-green-600' },
  ];

  const modules = [
    { name: 'Transport Vehicles & Operators', desc: 'Jeeps, EV shuttles, buses & local transport fares', count: stats.transportsCount, icon: Bus, href: '/transport' },
    { name: 'Mountain Routes & Trails', desc: 'Distances, road conditions & emergency contacts', count: stats.routesCount, icon: MapPin, href: '/routes' },
    { name: 'Hotels & Authentic Homestays', desc: 'Verified local accommodations & room rates', count: stats.hotelsCount, icon: Hotel, href: '/hotels' },
    { name: 'Thakali & Local Restaurants', desc: 'Cuisines, opening hours & dining prices', count: stats.restaurantsCount, icon: UtensilsCrossed, href: '/restaurants' },
    { name: 'Activities & Local Experiences', desc: 'Adventure guides, paragliding & heritage tours', count: stats.activitiesCount, icon: Compass, href: '/activities' },
    { name: 'Verified Media Library', desc: 'Authentic photos of routes, vehicles & stay options', count: stats.mediaCount, icon: ImageIcon, href: '/media' },
  ];

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#0F172A] to-slate-900 border border-emerald-500/20 p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              Nepal Verified Data Pipeline
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              GojiTrip Data Management Portal
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-2 max-w-2xl leading-relaxed">
              Log, review, and approve authentic Nepal travel data before the mobile app launches. Build a genuine database across transport operators, mountain routes, homestays, and regional activities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/transport"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Travel Data</span>
            </Link>
            <Link
              to="/workflow"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all flex items-center space-x-1.5"
            >
              <span>Review Queue ({stats.underReviewCount + stats.draftCount})</span>
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
              className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{st.label}</span>
                <div className={`p-2 rounded-xl bg-gradient-to-tr ${st.color} text-white shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white mt-3">{st.count}</div>
            </div>
          );
        })}
      </div>

      {/* Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Travel Modules & Database Sections</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <Link
                key={idx}
                to={mod.href}
                className="group glass-panel p-6 rounded-2xl border border-slate-800/90 hover:border-emerald-500/40 transition-all hover:translate-y-[-2px] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-[#182238] border border-slate-700/80 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {mod.count} Records
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {mod.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Manage Module</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Approval Audit Trail Activity Stream */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Recent Data Approval & Workflow Audit Logs</span>
          </h2>
          <Link to="/workflow" className="text-xs text-emerald-400 hover:underline font-semibold">
            View Approval Center →
          </Link>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No recent activity logs.</p>
        ) : (
          <div className="space-y-3">
            {logs.slice(0, 5).map(log => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-[#182238]/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-bold">
                    {log.entityType}
                  </span>
                  <div>
                    <span className="font-bold text-slate-200">{log.entityTitle}</span>
                    <span className="text-slate-400 ml-2">by {log.changedByName}</span>
                    {log.comment && <div className="text-[11px] text-slate-400 italic mt-0.5">"{log.comment}"</div>}
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
