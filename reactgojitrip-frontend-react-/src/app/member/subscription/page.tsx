import React, { useState, useEffect } from 'react';
import { useMemberAuth } from '@/lib/member-auth';
import { cmsStore } from '@/lib/cms-store';
import { SubscriptionPlan } from '@/types/cms';
import {
  CreditCard,
  Crown,
  CheckCircle2,
  Sparkles,
  Calendar,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Layers,
  Check,
} from 'lucide-react';

export default function MemberSubscriptionPage() {
  const { member, updateProfile } = useMemberAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<string>('ALL');
  const [successNotice, setSuccessNotice] = useState('');

  useEffect(() => {
    setPlans(cmsStore.getSubscriptions());
    const unsub = cmsStore.subscribe(() => {
      setPlans(cmsStore.getSubscriptions());
    });
    return unsub;
  }, []);

  if (!member) return null;

  // Filter plans relevant to member's category or Combo plans
  const relevantPlans = plans.filter((p) => {
    if (p.status !== 'Active') return false;
    const matchesCategory =
      p.targetAudience === member.category || p.targetAudience === 'Combo';
    const matchesCycle =
      selectedCycle === 'ALL' || p.billingCycle === selectedCycle;
    return matchesCategory && matchesCycle;
  });

  const handleActivatePlan = (plan: SubscriptionPlan) => {
    const days = plan.billingCycle === 'Yearly' ? 365 : plan.billingCycle === 'Quarterly' ? 90 : 30;
    const newExpiry = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

    updateProfile(member.id, {
      subscribedPlanId: plan.id,
      subscribedPlanName: plan.name,
      subscriptionStatus: 'Active',
      subscriptionExpiry: newExpiry,
    });

    setSuccessNotice(`Successfully upgraded to "${plan.name}"! Your subscription is active until ${newExpiry}.`);
    setTimeout(() => setSuccessNotice(''), 6000);
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div>
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <CreditCard className="w-4 h-4" />
          <span>Membership & Monetization</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">
          My Partner Subscription
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your current active pass, features, and explore higher tier packages for your business category.
        </p>
      </div>

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* ========================================================
          CURRENT ACTIVE PASS STATUS CARD
      ======================================================== */}
      <div className="rounded-3xl bg-gradient-to-r from-[#111A2E] via-[#0F172A] to-[#14233C] border border-slate-800 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
                Current Active Pass
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-300 font-bold">{member.category} Module</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {member.subscribedPlanName || `${member.category} Pro Pass`}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>
                  Valid until: <strong className="text-white">{member.subscriptionExpiry || '2027-09-30'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Verified Partner Network</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>0% Commission Direct Payments</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#182238]/90 border border-slate-700/80 text-center shrink-0 sm:w-56 space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Subscription Status
            </span>
            <div className="text-lg font-black text-emerald-400 uppercase">
              {member.subscriptionStatus || 'Active'}
            </div>
            <p className="text-[11px] text-slate-400">All features unlocked</p>
          </div>
        </div>
      </div>

      {/* ========================================================
          AVAILABLE UPGRADE / RENEWAL TIERS
      ======================================================== */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">
              Available Plans for {member.category} & Combo
            </h3>
            <p className="text-xs text-slate-400">
              Select or upgrade your membership pass anytime.
            </p>
          </div>

          {/* Billing Cycle Filter */}
          <div className="inline-flex p-1 bg-[#0F172A] border border-slate-800 rounded-2xl self-start sm:self-auto">
            {['ALL', 'Monthly', 'Quarterly', 'Yearly'].map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setSelectedCycle(cycle)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCycle === cycle
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cycle}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relevantPlans.map((plan) => {
            const isCurrent = member.subscribedPlanId === plan.id;
            const isPopular = Boolean(plan.isPopular);

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 transition flex flex-col justify-between border relative ${
                  isCurrent
                    ? 'bg-gradient-to-b from-[#111C2E] to-[#0F172A] border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl'
                    : isPopular
                    ? 'bg-[#0F172A] border-emerald-500/50 shadow-lg'
                    : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.badgeText && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                    {plan.badgeText}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#182238] border border-slate-700 text-slate-300 text-[10px] font-extrabold uppercase tracking-wider">
                      {plan.targetAudience}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400">
                      {plan.billingCycle}
                    </span>
                  </div>

                  <h4 className="text-xl font-black text-white tracking-tight">
                    {plan.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-baseline gap-1">
                    <span className="text-xs text-slate-400 font-bold">{plan.currency}</span>
                    <span className="text-3xl font-black text-white">
                      {plan.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      / {plan.billingCycle}
                    </span>
                  </div>

                  {/* Feature list */}
                  <div className="mt-5 space-y-2">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Perks Included:
                    </p>
                    <ul className="space-y-1.5">
                      {(plan.features || []).map((f, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-800/80">
                  {isCurrent ? (
                    <div className="py-2.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Current Active Pass</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleActivatePlan(plan)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs shadow-md shadow-emerald-900/20 transition flex items-center justify-center space-x-1.5"
                    >
                      <span>Switch to this Pass</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
