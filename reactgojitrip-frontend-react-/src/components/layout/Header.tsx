import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cmsStore } from '@/lib/cms-store';
import { RoleType } from '@/types/cms';
import { ShieldCheck, UserCheck, Edit3, RotateCcw, Search, Sparkles, LogOut } from 'lucide-react';
import { logoutUser } from '@/lib/auth';


export const Header: React.FC = () => {
  const [role, setRole] = React.useState<RoleType>('Admin');
  const [username, setUsername] = React.useState<string>('Goji Admin');
  const navigate = useNavigate();

  React.useEffect(() => {
    setRole(cmsStore.getRole());
    const unsubscribe = cmsStore.subscribe(() => {
      setRole(cmsStore.getRole());
    });
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gojitrip_username');
      if (stored) setUsername(stored);
    }
  }, []);

  const handleRoleChange = (newRole: RoleType) => {
    cmsStore.setRole(newRole);
  };

  const handleResetData = () => {
    if (confirm('Reset CMS database to fresh Nepal travel sample data?')) {
      cmsStore.resetToDefaults();
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/auth/login');
  };

  const getRoleIcon = (r: RoleType) => {
    switch (r) {
      case 'Admin':
        return <ShieldCheck className="w-4 h-4 text-emerald-400 mr-1.5" />;
      case 'Reviewer':
        return <UserCheck className="w-4 h-4 text-indigo-400 mr-1.5" />;
      case 'Content Creator':
        return <Edit3 className="w-4 h-4 text-amber-400 mr-1.5" />;
    }
  };

  const initials = username
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between">
      {/* Search Input */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search transport, routes, hotels, restaurants, media..."
          className="w-full bg-[#182238] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-500"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Verification Status Pill */}
        <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
          <span>GojiTrip Travel Verification Active</span>
        </div>

        {/* Role Selector */}
        <div className="flex items-center bg-[#182238] border border-slate-700 rounded-xl p-1">
          <span className="text-[11px] font-semibold text-slate-400 px-2.5 uppercase tracking-wider hidden sm:inline">Role:</span>
          {(['Content Creator', 'Reviewer', 'Admin'] as RoleType[]).map(r => (
            <button
              key={r}
              onClick={() => handleRoleChange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center transition-all ${
                role === r
                  ? 'bg-slate-800 text-white shadow border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {getRoleIcon(r)}
              {r}
            </button>
          ))}
        </div>

        {/* Reset Database Button */}
        <button
          onClick={handleResetData}
          title="Reset CMS to original sample dataset"
          className="p-2 rounded-xl bg-[#182238] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* User Profile + Logout */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-emerald-900/30">
            {initials}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-200">{username}</div>
            <div className="text-[10px] text-emerald-400 font-medium">{role}</div>
          </div>
          <button
            onClick={handleLogout}
            id="header-logout-btn"
            title="Sign out"
            className="p-2 rounded-xl bg-[#182238] hover:bg-red-900/40 text-slate-400 hover:text-red-400 border border-slate-700/80 hover:border-red-700/60 transition-all ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
