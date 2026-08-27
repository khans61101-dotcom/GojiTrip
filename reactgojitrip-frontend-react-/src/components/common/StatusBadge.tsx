'use client';

import React from 'react';
import { ApprovalStatus } from '@/types/cms';
import { updateWorkflowStatus } from '@/lib/api';
import { cmsStore } from '@/lib/cms-store';
import { CheckCircle2, Clock, FileEdit, Globe, ChevronDown } from 'lucide-react';

interface StatusBadgeProps {
  status: ApprovalStatus;
  entityType?: 'Transport' | 'Route' | 'Hotel' | 'Restaurant' | 'Activity' | 'Guide';
  entityId?: string;
  interactive?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  entityType,
  entityId,
  interactive = true,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const getBadgeStyle = (s: ApprovalStatus) => {
    switch (s) {
      case 'Draft':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Under Review':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'Approved':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Published':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  const getIcon = (s: ApprovalStatus) => {
    switch (s) {
      case 'Draft':
        return <FileEdit className="w-3.5 h-3.5 mr-1" />;
      case 'Under Review':
        return <Clock className="w-3.5 h-3.5 mr-1 animate-pulse" />;
      case 'Approved':
        return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      case 'Published':
        return <Globe className="w-3.5 h-3.5 mr-1" />;
    }
  };

  const handleStatusChange = async (newStatus: ApprovalStatus) => {
    if (entityType && entityId) {
      setIsUpdating(true);
      try {
        // Update reactive store & localStorage immediately
        cmsStore.updateStatus(entityType, entityId, newStatus);

        // Sync with backend API silently
        await updateWorkflowStatus(entityType, entityId, {
          status: newStatus,
          comment: `Status updated to ${newStatus} via CMS inline action`,
          changed_by_role: 'Admin',
          changed_by_name: 'Goji Admin',
        }).catch((err) => console.warn("Backend workflow update warning:", err));
      } catch (err) {
        console.error("Failed to update status:", err);
      } finally {
        setIsUpdating(false);
      }
    }
    setIsOpen(false);
  };

  if (!interactive || !entityType || !entityId) {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(status)}`}>
        {getIcon(status)}
        {status}
      </span>
    );
  }

  const statuses: ApprovalStatus[] = ['Draft', 'Under Review', 'Approved', 'Published'];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer hover:opacity-90 ${getBadgeStyle(status)}`}
        disabled={isUpdating}
      >
        {getIcon(status)}
        <span>{status}</span>
        <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-1 w-44 rounded-lg bg-[#182238] border border-slate-700/80 shadow-2xl z-50 py-1 overflow-hidden"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700/50">
            Change Approval Workflow
          </div>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={isUpdating}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center transition-colors ${
                s === status ? 'bg-slate-700/50 font-bold text-white' : 'text-slate-300 hover:bg-slate-700/30'
              }`}
            >
              {getIcon(s)}
              <span className="ml-1">{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
