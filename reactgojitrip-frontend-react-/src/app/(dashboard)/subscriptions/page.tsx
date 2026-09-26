"use client";

import React, { useState, useEffect } from "react";
import { cmsStore } from "@/lib/cms-store";
import type {
  SubscriptionPlan,
  SubscriptionBillingCycle,
  SubscriptionStatus,
  TargetAudience,
  SubscriberUser,
} from "@/types/cms";
import {
  CreditCard,
  Plus,
  Search,
  Check,
  X,
  Edit2,
  Trash2,
  Users,
  DollarSign,
  Crown,
  Sparkles,
  ShieldCheck,
  Calendar,
  Filter,
  RefreshCw,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  Tag,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const BILLING_CYCLES: SubscriptionBillingCycle[] = [
  "Monthly",
  "Quarterly",
  "Yearly",
  "Lifetime",
];

const TARGET_AUDIENCES: TargetAudience[] = [
  "Home & Homestays",
  "Traveling",
  "Restaurant",
  "Combo",
];

const DEFAULT_FEATURE_SUGGESTIONS = [
  "Unlimited offline GPS Nepal route & trail downloads",
  "10% direct discount on verified Homestays & Teahouses",
  "Real-time landslide & monsoon road blockage alerts",
  "24/7 WhatsApp emergency rescue support line",
  "Verified Guide Badge on GojiTrip public directory",
  "Top 10 Featured ranking badge in destination search",
  "Direct commission-free room bookings with 0% fee",
  "Free priority EV fast charging access at partner hubs",
  "Emergency mountain rescue & helicopter dispatch coordination",
];

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberUser[]>([]);
  const [activeTab, setActiveTab] = useState<"plans" | "subscribers">("plans");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filters for Plans
  const [searchQuery, setSearchQuery] = useState("");
  const [cycleFilter, setCycleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [audienceFilter, setAudienceFilter] = useState<string>("ALL");

  // Filters for Subscribers
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [subscriberStatusFilter, setSubscriberStatusFilter] = useState<string>("ALL");

  // Modal states for Plan CRUD
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan> | null>(null);
  const [newFeatureInput, setNewFeatureInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state for manual subscriber
  const [isSubscriberModalOpen, setIsSubscriberModalOpen] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState<Partial<SubscriberUser>>({
    userName: "",
    userEmail: "",
    userPhone: "",
    planId: "",
    planName: "",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    amountPaid: 1499,
    currency: "NPR",
    status: "Active",
    autoRenew: true,
    paymentMethod: "eSewa",
  });

  const refreshData = () => {
    setPlans(cmsStore.getSubscriptions());
    setSubscribers(cmsStore.getSubscribers());
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = cmsStore.subscribe(refreshData);
    return unsubscribe;
  }, []);

  // Filtered Plans
  const filteredPlans = plans.filter((plan) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      plan.name.toLowerCase().includes(q) ||
      plan.code.toLowerCase().includes(q) ||
      plan.description.toLowerCase().includes(q);

    const matchesCycle = cycleFilter === "ALL" || plan.billingCycle === cycleFilter;
    const matchesStatus = statusFilter === "ALL" || plan.status === statusFilter;
    const matchesAudience = audienceFilter === "ALL" || plan.targetAudience === audienceFilter;

    return matchesSearch && matchesCycle && matchesStatus && matchesAudience;
  });

  // Filtered Subscribers
  const filteredSubscribers = subscribers.filter((sub) => {
    const q = subscriberSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      sub.userName.toLowerCase().includes(q) ||
      sub.userEmail.toLowerCase().includes(q) ||
      sub.userPhone.toLowerCase().includes(q) ||
      sub.planName.toLowerCase().includes(q);

    const matchesStatus =
      subscriberStatusFilter === "ALL" || sub.status === subscriberStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // KPI Metrics Calculation
  const totalPlansCount = plans.length;
  const activePlansCount = plans.filter((p) => p.status === "Active").length;
  const totalSubscribersCount = subscribers.length;
  const activeSubscribersCount = subscribers.filter((s) => s.status === "Active").length;

  // Approximate Monthly Revenue (MRR)
  const estimatedMRR = subscribers.reduce((acc, sub) => {
    if (sub.status !== "Active") return acc;
    const plan = plans.find((p) => p.id === sub.planId);
    if (!plan) return acc + (sub.amountPaid || 0) / 12;
    if (plan.billingCycle === "Monthly") return acc + plan.price;
    if (plan.billingCycle === "Quarterly") return acc + plan.price / 3;
    if (plan.billingCycle === "Yearly") return acc + plan.price / 12;
    return acc;
  }, 0);

  const mostPopularPlan = plans.reduce<SubscriptionPlan | null>((prev, cur) => {
    if (!prev) return cur;
    return cur.subscribersCount > prev.subscribersCount ? cur : prev;
  }, null);

  // ==========================================================
  // PLAN CRUD HANDLERS
  // ==========================================================

  const handleOpenCreateModal = () => {
    setEditingPlan({
      name: "",
      code: "",
      description: "",
      price: 1999,
      currency: "NPR",
      billingCycle: "Monthly",
      targetAudience: "Home & Homestays",
      features: [
        "Unlimited offline GPS Nepal route & trail downloads",
        "10% direct discount on verified Homestays & Teahouses",
        "24/7 WhatsApp emergency support line",
      ],
      discountPercentage: 0,
      maxBookings: undefined,
      badgeText: "",
      isPopular: false,
      status: "Active",
      subscribersCount: 0,
    });
    setNewFeatureInput("");
    setIsPlanModalOpen(true);
  };

  const handleOpenEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan({
      ...plan,
      features: [...(plan.features || [])],
    });
    setNewFeatureInput("");
    setIsPlanModalOpen(true);
  };

  const handleAddFeature = (featureToAdd?: string) => {
    const text = (featureToAdd || newFeatureInput).trim();
    if (!text || !editingPlan) return;

    const currentFeatures = editingPlan.features || [];
    if (!currentFeatures.includes(text)) {
      setEditingPlan({
        ...editingPlan,
        features: [...currentFeatures, text],
      });
    }
    setNewFeatureInput("");
  };

  const handleRemoveFeature = (index: number) => {
    if (!editingPlan) return;
    const currentFeatures = [...(editingPlan.features || [])];
    currentFeatures.splice(index, 1);
    setEditingPlan({
      ...editingPlan,
      features: currentFeatures,
    });
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    if (!editingPlan.name?.trim()) {
      alert("Please provide a plan name.");
      return;
    }

    if (editingPlan.price === undefined || editingPlan.price < 0) {
      alert("Please enter a valid plan price.");
      return;
    }

    if (!editingPlan.features || editingPlan.features.length === 0) {
      alert("Please add at least one feature perk to the plan.");
      return;
    }

    setIsSubmitting(true);
    try {
      await cmsStore.saveSubscription({
        ...editingPlan,
        name: editingPlan.name.trim(),
        code: (editingPlan.code || editingPlan.name.replace(/\s+/g, "_")).toUpperCase(),
      });
      setIsPlanModalOpen(false);
      setEditingPlan(null);
    } catch (err) {
      console.error("Failed to save plan:", err);
      alert("Failed to save subscription plan. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the plan "${name}"? This action cannot be undone.`)) {
      await cmsStore.deleteSubscription(id);
    }
  };

  const handleTogglePlanStatus = async (id: string) => {
    await cmsStore.toggleSubscriptionStatus(id);
  };

  // ==========================================================
  // SUBSCRIBER ACTIONS
  // ==========================================================

  const handleOpenAddSubscriberModal = () => {
    const defaultPlan = plans[0];
    setNewSubscriber({
      userName: "",
      userEmail: "",
      userPhone: "",
      planId: defaultPlan?.id || "",
      planName: defaultPlan?.name || "Nepal Explorer Pass",
      startDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      amountPaid: defaultPlan?.price || 1499,
      currency: defaultPlan?.currency || "NPR",
      status: "Active",
      autoRenew: true,
      paymentMethod: "eSewa",
    });
    setIsSubscriberModalOpen(true);
  };

  const handleSaveSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubscriber.userName || !newSubscriber.userEmail) {
      alert("Please provide member name and email.");
      return;
    }

    await cmsStore.saveSubscriber(newSubscriber);
    setIsSubscriberModalOpen(false);
  };

  const handleExtendSubscriber = async (id: string, name: string) => {
    if (confirm(`Extend subscription for "${name}" by 30 days?`)) {
      await cmsStore.extendSubscriber(id, 30);
    }
  };

  const handleCancelSubscriber = async (id: string, name: string) => {
    if (confirm(`Cancel active membership for "${name}"?`)) {
      await cmsStore.cancelSubscriber(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ======================================================
          HEADER BAR
      ====================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            <span>Monetization & Memberships</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Subscription Management
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Create, price, and manage travel membership tiers, partner passes, perks, and active Nepal subscribers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {activeTab === "plans" ? (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Subscription Plan</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddSubscriberModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member Manually</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================
          KPI METRIC SUMMARY CARDS
      ====================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Plans */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-[#0F172A]/70 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Plans
            </p>
            <h3 className="text-2xl font-black text-white mt-1">
              {totalPlansCount}
            </h3>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
              {activePlansCount} Active in Catalogue
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-[#0F172A]/70 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Subscribers
            </p>
            <h3 className="text-2xl font-black text-white mt-1">
              {activeSubscribersCount}
            </h3>
            <p className="text-[11px] text-blue-400 font-semibold mt-0.5">
              Across Nepal & Worldwide
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Est. Monthly Revenue (MRR) */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-[#0F172A]/70 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Est. Monthly MRR
            </p>
            <h3 className="text-2xl font-black text-white mt-1">
              NPR {Math.round(estimatedMRR).toLocaleString()}
            </h3>
            <p className="text-[11px] text-amber-400 font-semibold mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Recurring Revenue
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Most Popular Plan */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-[#0F172A]/70 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Top Tier
            </p>
            <h3 className="text-base font-extrabold text-white mt-1 truncate max-w-[150px]">
              {mostPopularPlan ? mostPopularPlan.name : "None"}
            </h3>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
              {mostPopularPlan ? `${mostPopularPlan.subscribersCount} Members` : "0 Members"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Crown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ======================================================
          NAV TABS (PLANS VS SUBSCRIBERS)
      ====================================================== */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("plans")}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === "plans"
              ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Subscription Plans ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("subscribers")}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === "subscribers"
              ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Subscribers ({subscribers.length})</span>
        </button>
      </div>

      {/* ======================================================
          TAB 1: SUBSCRIPTION PLANS (CRUD)
      ====================================================== */}
      {activeTab === "plans" && (
        <div className="space-y-5">
          {/* Filters & Search Toolbar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-[#0F172A]/70 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search plan name, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#182238] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Billing Cycle Filter */}
              <select
                value={cycleFilter}
                onChange={(e) => setCycleFilter(e.target.value)}
                className="bg-[#182238] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Cycles</option>
                {BILLING_CYCLES.map((cycle) => (
                  <option key={cycle} value={cycle}>
                    {cycle}
                  </option>
                ))}
              </select>

              {/* Target Audience Filter */}
              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className="bg-[#182238] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Audiences</option>
                {TARGET_AUDIENCES.map((aud) => (
                  <option key={aud} value={aud}>
                    {aud}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#182238] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>

              {/* Grid / Table Toggle */}
              <div className="flex items-center bg-[#182238] border border-slate-700/80 rounded-xl p-1 ml-auto">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-emerald-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Grid Cards View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "table"
                      ? "bg-emerald-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Table View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filteredPlans.length === 0 && (
            <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800">
              <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No Subscription Plans Found</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                No subscription plans match your search and filter criteria. You can create a new tier or adjust the filters.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition"
              >
                Create New Plan
              </button>
            </div>
          )}

          {/* ==================== GRID VIEW ==================== */}
          {viewMode === "grid" && filteredPlans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPlans.map((plan) => {
                const isActive = plan.status === "Active";

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl border transition-all flex flex-col justify-between overflow-hidden ${
                      plan.isPopular
                        ? "bg-gradient-to-b from-[#182238] to-[#0F172A] border-emerald-500/50 shadow-xl shadow-emerald-950/20"
                        : "bg-[#0F172A]/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Header Badges */}
                    <div className="p-6 pb-4">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              isActive
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {plan.status}
                          </span>

                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-semibold border border-slate-700">
                            {plan.targetAudience}
                          </span>
                        </div>

                        {plan.badgeText && (
                          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3" />
                            {plan.badgeText}
                          </span>
                        )}
                      </div>

                      {/* Plan Title & Code */}
                      <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                        {plan.name}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-500 font-semibold mt-0.5">
                        CODE: {plan.code}
                      </p>

                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {plan.description}
                      </p>

                      {/* Pricing Display */}
                      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-slate-400">
                          {plan.currency}
                        </span>
                        <span className="text-3xl font-black text-white tracking-tight">
                          {plan.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          / {plan.billingCycle}
                        </span>

                        {plan.discountPercentage ? (
                          <span className="ml-auto text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                            {plan.discountPercentage}% OFF
                          </span>
                        ) : null}
                      </div>

                      {/* Features List */}
                      <div className="mt-5 space-y-2.5">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Features & Perks:
                        </p>
                        <ul className="space-y-2">
                          {(plan.features || []).map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2.5 text-xs text-slate-300"
                            >
                              <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                              <span className="line-clamp-2 leading-snug">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-semibold text-slate-300">
                          {plan.subscribersCount}
                        </span>
                        <span className="text-[11px]">subscribers</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Toggle Status */}
                        <button
                          onClick={() => handleTogglePlanStatus(plan.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            isActive
                              ? "bg-slate-800 text-slate-400 hover:text-amber-300 hover:bg-slate-700"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                          }`}
                          title={isActive ? "Deactivate Plan" : "Activate Plan"}
                        >
                          {isActive ? "Pause" : "Activate"}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(plan)}
                          className="p-1.5 bg-[#182238] border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500 rounded-lg transition"
                          title="Edit Plan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeletePlan(plan.id, plan.name)}
                          className="p-1.5 bg-[#182238] border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 rounded-lg transition"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ==================== TABLE VIEW ==================== */}
          {viewMode === "table" && filteredPlans.length > 0 && (
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#131C30] text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <th className="py-3 px-4">Plan Name & Code</th>
                      <th className="py-3 px-4">Price / Cycle</th>
                      <th className="py-3 px-4">Audience</th>
                      <th className="py-3 px-4">Features</th>
                      <th className="py-3 px-4 text-center">Subscribers</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-xs">
                    {filteredPlans.map((plan) => {
                      const isActive = plan.status === "Active";

                      return (
                        <tr
                          key={plan.id}
                          className="hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{plan.name}</span>
                                  {plan.isPopular && (
                                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                  )}
                                </div>
                                <div className="text-[10px] font-mono text-slate-500">
                                  {plan.code}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-bold text-white">
                            {plan.currency} {plan.price.toLocaleString()}
                            <span className="text-[11px] font-normal text-slate-400 ml-1">
                              / {plan.billingCycle}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                              {plan.targetAudience}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                            {plan.features?.join(", ") || "None"}
                          </td>

                          <td className="py-3 px-4 text-center font-bold text-emerald-400">
                            {plan.subscribersCount}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isActive
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : "bg-slate-800 text-slate-400 border border-slate-700"
                              }`}
                            >
                              {plan.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleTogglePlanStatus(plan.id)}
                                className={`px-2 py-1 rounded text-[11px] font-semibold ${
                                  isActive
                                    ? "text-slate-400 hover:text-white"
                                    : "text-emerald-400 hover:text-emerald-300"
                                }`}
                              >
                                {isActive ? "Pause" : "Resume"}
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(plan)}
                                className="p-1 text-slate-400 hover:text-white rounded"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePlan(plan.id, plan.name)}
                                className="p-1 text-slate-400 hover:text-rose-400 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================
          TAB 2: SUBSCRIBERS / ACTIVE MEMBERS
      ====================================================== */}
      {activeTab === "subscribers" && (
        <div className="space-y-5">
          {/* Subscriber Toolbar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-[#0F172A]/70 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search member by name, email, phone..."
                value={subscriberSearch}
                onChange={(e) => setSubscriberSearch(e.target.value)}
                className="w-full bg-[#182238] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={subscriberStatusFilter}
                onChange={(e) => setSubscriberStatusFilter(e.target.value)}
                className="bg-[#182238] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#131C30] text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="py-3 px-4">Member Name & Contact</th>
                    <th className="py-3 px-4">Subscription Plan</th>
                    <th className="py-3 px-4">Started On</th>
                    <th className="py-3 px-4">Expires On</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Auto-Renew</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs">
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        No subscribers found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((sub) => {
                      const isActive = sub.status === "Active";

                      return (
                        <tr
                          key={sub.id}
                          className="hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">
                              {sub.userName}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-500" />
                                {sub.userEmail}
                              </span>
                              {sub.userPhone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-500" />
                                  {sub.userPhone}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-semibold text-emerald-400">
                              {sub.planName}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-slate-300">
                            {sub.startDate}
                          </td>

                          <td className="py-3 px-4 font-semibold text-white">
                            {sub.expiryDate}
                          </td>

                          <td className="py-3 px-4 font-bold text-white">
                            {sub.currency} {sub.amountPaid.toLocaleString()}
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                              {sub.paymentMethod}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {sub.autoRenew ? (
                              <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                                <CheckCircle2 className="w-3 h-3" /> Yes
                              </span>
                            ) : (
                              <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                                <XCircle className="w-3 h-3" /> No
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sub.status === "Active"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : sub.status === "Expired"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleExtendSubscriber(sub.id, sub.userName)}
                                className="px-2 py-1 rounded bg-[#182238] border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500 text-[11px] font-semibold transition"
                                title="Add 30 Days"
                              >
                                +30 Days
                              </button>

                              {isActive && (
                                <button
                                  onClick={() => handleCancelSubscriber(sub.id, sub.userName)}
                                  className="px-2 py-1 rounded bg-[#182238] border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 text-[11px] transition"
                                  title="Cancel Membership"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          CREATE / EDIT SUBSCRIPTION PLAN MODAL
      ====================================================== */}
      {isPlanModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#131C30]">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {editingPlan.id ? "Edit Subscription Plan" : "Create New Subscription Plan"}
                </h3>
              </div>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSavePlan} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Plan Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nepal Explorer Pass"
                    value={editingPlan.name || ""}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, name: e.target.value })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Plan Code */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Plan Code (Unique identifier)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NEPAL_EXPLORER"
                    value={editingPlan.code || ""}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        code: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short summary of who this plan is for and key value proposition..."
                  value={editingPlan.description || ""}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, description: e.target.value })
                  }
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Pricing, Currency & Cycle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Price *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingPlan.price ?? ""}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, price: Number(e.target.value) })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Currency
                  </label>
                  <select
                    value={editingPlan.currency || "NPR"}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, currency: e.target.value })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="NPR">NPR (Nepalese Rupee)</option>
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Billing Cycle
                  </label>
                  <select
                    value={editingPlan.billingCycle || "Monthly"}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        billingCycle: e.target.value as SubscriptionBillingCycle,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {BILLING_CYCLES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Audience & Status & Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Target Audience
                  </label>
                  <select
                    value={editingPlan.targetAudience || "Home & Homestays"}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        targetAudience: e.target.value as TargetAudience,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {TARGET_AUDIENCES.map((aud) => (
                      <option key={aud} value={aud}>
                        {aud}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={editingPlan.status || "Active"}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        status: e.target.value as SubscriptionStatus,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Discount % (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={editingPlan.discountPercentage ?? 0}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        discountPercentage: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Badge Text & Popular Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Badge Text (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Most Popular, Best Value, VIP"
                    value={editingPlan.badgeText || ""}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, badgeText: e.target.value })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-4 sm:pt-6">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(editingPlan.isPopular)}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, isPopular: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 bg-slate-800"
                    />
                    <span className="text-xs font-semibold text-slate-300">
                      Highlight as Recommended / Popular Tier
                    </span>
                  </label>
                </div>
              </div>

              {/* Feature Perks Builder */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Features & Perks List *</span>
                  <span className="text-slate-500 text-[10px] font-normal lowercase">
                    {editingPlan.features?.length || 0} features added
                  </span>
                </label>

                {/* Input with Add button */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a new perk and click Add or press Enter..."
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    className="flex-1 bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddFeature()}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition"
                  >
                    Add
                  </button>
                </div>

                {/* Suggested template perks */}
                <div className="space-y-1 mt-1">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Quick Suggestion Templates (Click to add):
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {DEFAULT_FEATURE_SUGGESTIONS.map((feat, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddFeature(feat)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 border border-slate-700 transition"
                      >
                        + {feat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features currently added */}
                <div className="space-y-1.5 mt-3">
                  {(editingPlan.features || []).map((feat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/50 border border-slate-700/80 text-xs text-slate-200"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                        title="Remove perk"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5"
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <span>{editingPlan.id ? "Update Plan" : "Create Plan"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          ADD MANUAL SUBSCRIBER MODAL
      ====================================================== */}
      {isSubscriberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#131C30]">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Add Member / Subscriber
                </h3>
              </div>
              <button
                onClick={() => setIsSubscriberModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubscriber} className="p-6 space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Member Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bikash Thapa"
                  value={newSubscriber.userName || ""}
                  onChange={(e) =>
                    setNewSubscriber({ ...newSubscriber, userName: e.target.value })
                  }
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="bikash@example.com"
                    value={newSubscriber.userEmail || ""}
                    onChange={(e) =>
                      setNewSubscriber({ ...newSubscriber, userEmail: e.target.value })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+977-98..."
                    value={newSubscriber.userPhone || ""}
                    onChange={(e) =>
                      setNewSubscriber({ ...newSubscriber, userPhone: e.target.value })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Plan Selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Assigned Subscription Plan
                </label>
                <select
                  value={newSubscriber.planId || ""}
                  onChange={(e) => {
                    const sel = plans.find((p) => p.id === e.target.value);
                    if (sel) {
                      setNewSubscriber({
                        ...newSubscriber,
                        planId: sel.id,
                        planName: sel.name,
                        amountPaid: sel.price,
                        currency: sel.currency,
                      });
                    }
                  }}
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.currency} {p.price.toLocaleString()} / {p.billingCycle})
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newSubscriber.startDate || ""}
                    onChange={(e) =>
                      setNewSubscriber({ ...newSubscriber, startDate: e.target.value })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newSubscriber.expiryDate || ""}
                    onChange={(e) =>
                      setNewSubscriber({ ...newSubscriber, expiryDate: e.target.value })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Payment Method & Auto-Renew */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Payment Method
                  </label>
                  <select
                    value={newSubscriber.paymentMethod || "eSewa"}
                    onChange={(e) =>
                      setNewSubscriber({
                        ...newSubscriber,
                        paymentMethod: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="eSewa">eSewa</option>
                    <option value="Khalti">Khalti</option>
                    <option value="Credit Card">Credit / Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div className="pt-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(newSubscriber.autoRenew)}
                      onChange={(e) =>
                        setNewSubscriber({
                          ...newSubscriber,
                          autoRenew: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-slate-700 text-emerald-500 bg-slate-800"
                    />
                    <span className="text-xs font-semibold text-slate-300">
                      Auto-renew Enabled
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSubscriberModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
