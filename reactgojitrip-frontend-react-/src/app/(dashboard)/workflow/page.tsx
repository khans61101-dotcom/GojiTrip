'use client';

import React from 'react';
import { listWorkflowLogs, updateWorkflowStatus, WorkflowLogRecord } from '@/lib/api';
import { ApprovalStatus } from '@/types/cms';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CheckSquare, Clock, FileEdit, CheckCircle2, Globe, UserCheck, MessageSquare, ShieldCheck, ChevronRight } from 'lucide-react';

export default function WorkflowPage() {
  const [logs, setLogs] = React.useState<WorkflowLogRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<ApprovalStatus>('Under Review');
  const [reviewComment, setReviewComment] = React.useState('');
  const [selected, setSelected] = React.useState<WorkflowLogRecord | null>(null);
  const [updating, setUpdating] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listWorkflowLogs();
      setLogs(data);
      if (!selected && data.length > 0) setSelected(data[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow logs');
    } finally {
      setLoading(false);
    }
  }, [selected]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = logs.filter(l => l.newStatus === activeTab || l.previousStatus === activeTab);

  const handleUpdateStatus = async (newStatus: ApprovalStatus) => {
    if (!selected) return;
    setUpdating(true);
    setError(null);
    setSuccess(null);
    try {
      await updateWorkflowStatus(selected.entityType, selected.entityId, {
        status: newStatus,
        comment: reviewComment || undefined,
        changed_by_role: 'Admin',
        changed_by_name: 'Goji Admin',
      });
      setSuccess(`Status updated to ${newStatus}.`);
      setReviewComment('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workflow status');
    } finally {
      setUpdating(false);
    }
  };

  const tabCount = (st: ApprovalStatus) => logs.filter(l => l.newStatus === st || l.previousStatus === st).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckSquare className="w-4 h-4" />
            <span>Quality Control & Content Verification</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Data Approval Workflow Center</h1>
          <p className="text-slate-400 text-xs mt-1">Backend-driven workflow logs and status transitions.</p>
        </div>
      </div>

      {(error || success) && (
        <div className={`p-3 rounded-xl text-xs border ${error ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
          {error || success}
        </div>
      )}

      <div className="glass-panel p-5 rounded-3xl border border-slate-800 bg-gradient-to-r from-[#111827] via-[#182238] to-[#111827]">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300"><div className="font-bold flex items-center mb-1"><FileEdit className="w-4 h-4 mr-1.5" /> 1. Draft</div></div>
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300"><div className="font-bold flex items-center mb-1"><Clock className="w-4 h-4 mr-1.5" /> 2. Under Review</div></div>
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300"><div className="font-bold flex items-center mb-1"><CheckCircle2 className="w-4 h-4 mr-1.5" /> 3. Approved</div></div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"><div className="font-bold flex items-center mb-1"><Globe className="w-4 h-4 mr-1.5" /> 4. Published</div></div>
        </div>
      </div>

      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {(['Under Review', 'Draft', 'Approved', 'Published'] as ApprovalStatus[]).map(st => (
          <button
            key={st}
            onClick={() => {
              setActiveTab(st);
              setSelected(logs.find(l => l.newStatus === st || l.previousStatus === st) || null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${activeTab === st ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-950/40' : 'bg-[#182238] text-slate-400 border border-slate-700/80'}`}
          >
            {st === 'Draft' ? <FileEdit className="w-3.5 h-3.5 mr-1" /> : st === 'Under Review' ? <Clock className="w-3.5 h-3.5 mr-1" /> : st === 'Approved' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <Globe className="w-3.5 h-3.5 mr-1" />}
            <span>{st}</span>
            <span className="px-2 py-0.5 rounded-full bg-black/30 text-[10px]">{tabCount(st)}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="glass-panel p-8 text-center text-slate-400 text-xs rounded-2xl border border-slate-800">Loading workflow logs...</div>
          ) : filtered.length === 0 ? (
            <div className="glass-panel p-8 text-center text-slate-400 text-xs rounded-2xl border border-slate-800">No items found for "{activeTab}".</div>
          ) : (
            filtered.map(log => {
              const isSelected = selected?.id === log.id;
              return (
                <div key={log.id} onClick={() => setSelected(log)} className={`p-4 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'bg-[#182238] border-emerald-500/80 shadow-md' : 'glass-panel border-slate-800 hover:border-slate-700'}`}>
                  <div className="flex items-start justify-between">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-bold">{log.entityType}</span>
                    <StatusBadge status={log.newStatus as ApprovalStatus} interactive={false} />
                  </div>
                  <h3 className="font-bold text-xs text-white mt-2">{log.entityTitle}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{log.comment || `${log.previousStatus} -> ${log.newStatus}`}</p>
                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>By {log.changedByName}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="lg:col-span-7">
          {selected ? (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">{selected.entityType}</span>
                  <StatusBadge status={selected.newStatus as ApprovalStatus} interactive={false} />
                </div>
                <h2 className="text-xl font-extrabold text-white mt-2">{selected.entityTitle}</h2>
                <p className="text-xs text-slate-400 mt-1">{selected.previousStatus} {'->'} {selected.newStatus}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#131C30] border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-slate-200 flex items-center"><ShieldCheck className="w-4 h-4 text-emerald-400 mr-1.5" /> Workflow checks</div>
                <div className="text-slate-300 space-y-1 pl-5">
                  <div>• Status changes are persisted in the backend</div>
                  <div>• Logs are available from `/api/v1/workflow/logs`</div>
                  <div>• Transport and content entries share the same approval API</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 items-center">
                  <MessageSquare className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Reviewer Audit Comment
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter verification notes or reasons for approval/rejection..."
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  className="w-full bg-[#182238] border border-slate-700/80 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-2 justify-end">
                <button disabled={updating} onClick={() => handleUpdateStatus('Draft')} className="px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-xs">Return to Draft</button>
                <button disabled={updating} onClick={() => handleUpdateStatus('Under Review')} className="px-3.5 py-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold text-xs">Submit for Review</button>
                <button disabled={updating} onClick={() => handleUpdateStatus('Approved')} className="px-3.5 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold text-xs">Approve Entry</button>
                <button disabled={updating} onClick={() => handleUpdateStatus('Published')} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center space-x-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{updating ? 'Publishing...' : 'Publish to Live App'}</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
