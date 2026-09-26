"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cmsStore } from "@/lib/cms-store";
import type { SubscriptionPlan, TargetAudience, SubscriberUser } from "@/types/cms";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import {
  Crown,
  Sparkles,
  ShieldCheck,
  Check,
  CheckCircle2,
  MapPin,
  CreditCard,
  ArrowRight,
  Phone,
  Mail,
  HelpCircle,
  Compass,
  Mountain,
  Hotel,
  Bus,
  Star,
  Zap,
  ArrowLeft,
  X,
  QrCode,
  Calendar,
  Users,
  Shield,
  HeartHandshake,
  Award,
  ChevronDown,
} from "lucide-react";

export default function PublicMembershipPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Audience & Cycle Filter tabs
  const [selectedAudience, setSelectedAudience] = useState<string>("ALL");
  const [selectedCycle, setSelectedCycle] = useState<"ALL" | "Monthly" | "Quarterly" | "Yearly" | "Lifetime">("ALL");

  // Subscribe Modal states
  const [selectedPlanForJoin, setSelectedPlanForJoin] = useState<SubscriptionPlan | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinForm, setJoinForm] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
    paymentMethod: "eSewa" as "eSewa" | "Khalti" | "Credit Card" | "Bank Transfer",
    autoRenew: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedSubscriber, setConfirmedSubscriber] = useState<SubscriberUser | null>(null);

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    const refreshData = () => {
      setPlans(cmsStore.getSubscriptions());
      setLoading(false);
    };

    refreshData();
    const unsubscribe = cmsStore.subscribe(refreshData);
    return unsubscribe;
  }, []);

  // Filter active plans
  const activePlans = plans.filter((p) => p.status === "Active");

  const filteredPlans = activePlans.filter((plan) => {
    const matchesAudience =
      selectedAudience === "ALL" || plan.targetAudience === selectedAudience;
    const matchesCycle =
      selectedCycle === "ALL" || plan.billingCycle === selectedCycle;
    return matchesAudience && matchesCycle;
  });

  const handleOpenJoinModal = (plan: SubscriptionPlan) => {
    setSelectedPlanForJoin(plan);
    setConfirmedSubscriber(null);
    setIsJoinModalOpen(true);
  };

  const handleConfirmSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForJoin) return;

    if (!joinForm.userName.trim() || !joinForm.userEmail.trim()) {
      alert("Please provide your full name and email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      let expiryDays = 30;
      if (selectedPlanForJoin.billingCycle === "Quarterly") expiryDays = 90;
      if (selectedPlanForJoin.billingCycle === "Yearly") expiryDays = 365;
      if (selectedPlanForJoin.billingCycle === "Lifetime") expiryDays = 3650;

      const expiryDate = new Date(now.getTime() + expiryDays * 86400000)
        .toISOString()
        .split("T")[0];

      const newSub = await cmsStore.saveSubscriber({
        planId: selectedPlanForJoin.id,
        planName: selectedPlanForJoin.name,
        userName: joinForm.userName.trim(),
        userEmail: joinForm.userEmail.trim(),
        userPhone: joinForm.userPhone.trim(),
        startDate: now.toISOString().split("T")[0],
        expiryDate,
        amountPaid: selectedPlanForJoin.price,
        currency: selectedPlanForJoin.currency,
        status: "Active",
        autoRenew: joinForm.autoRenew,
        paymentMethod: joinForm.paymentMethod,
      });

      // Increment subscriber count on plan
      await cmsStore.saveSubscription({
        ...selectedPlanForJoin,
        subscribersCount: (selectedPlanForJoin.subscribersCount || 0) + 1,
      });

      setConfirmedSubscriber(newSub);
    } catch (err) {
      console.error("Subscription failed:", err);
      alert("Unable to process membership. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Header />

      <main className="flex-1">
        {/* ======================================================
            1. HERO SECTION: MEMBERSHIP VALUE PROPOSITION
        ====================================================== */}
        <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-emerald-50/20 to-slate-50 border-b border-slate-200/80 overflow-hidden">
          {/* Subtle Ambient Backdrops */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
            {/* Top Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-extrabold uppercase tracking-wider shadow-sm">
              <Crown className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>GojiTrip Exclusive Member Pass • Nepal Corridors</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight">
              Unlock Nepal with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                VIP Member Benefits
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
              Join thousands of independent road trippers, trekkers, certified guides, and lodge owners. Enjoy guaranteed 10%–20% discounts on verified homestays, offline GPS trails, priority 4x4 Jeep seats, and 24/7 mountain safety dispatch.
            </p>

            {/* Trust Highlights Row */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Partner Network</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Offline GPS Corridors</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <Phone className="w-4 h-4 text-purple-600" />
                <span>24/7 Emergency Dispatch</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>0% Commission Booking</span>
              </div>
            </div>

            {/* Quick Member Panel Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/member/register"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Register as Partner / Member</span>
              </Link>
              <Link
                to="/member/login"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs shadow-sm transition-all flex items-center space-x-2"
              >
                <span>Member Portal Login</span>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </Link>
            </div>

            {/* Billing Cycle & Audience Switcher */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Audience Tabs */}
              <div className="inline-flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
                {[
                  { label: "All Categories", value: "ALL" },
                  { label: "Home & Homestays", value: "Home & Homestays" },
                  { label: "Traveling", value: "Traveling" },
                  { label: "Restaurant", value: "Restaurant" },
                  { label: "Combo", value: "Combo" },
                ].map((aud) => (
                  <button
                    key={aud.value}
                    type="button"
                    onClick={() => setSelectedAudience(aud.value)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedAudience === aud.value
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {aud.label}
                  </button>
                ))}
              </div>

              {/* Cycle Toggle */}
              <div className="inline-flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <button
                  type="button"
                  onClick={() => setSelectedCycle("ALL")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCycle === "ALL"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Cycles
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCycle("Monthly")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCycle === "Monthly"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCycle("Quarterly")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCycle === "Quarterly"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Quarterly
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCycle("Yearly")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedCycle === "Yearly"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Yearly</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            2. SUBSCRIPTION PRICING PLANS GRID
        ====================================================== */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Select Your Membership Tier
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Transparent pricing with no auto-bill surprises. Cancel, pause, or upgrade at any time.
            </p>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
              <p className="text-xs text-slate-500 mt-3 font-semibold">
                Loading verified membership passes...
              </p>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm">
              <Crown className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                No Plans in this Category
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Please select "All Members" or "All Cycles" to see available options.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedAudience("ALL");
                  setSelectedCycle("ALL");
                }}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {filteredPlans.map((plan) => {
                const isHighlight = Boolean(plan.isPopular);

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-[32px] p-7 transition-all flex flex-col justify-between border ${
                      isHighlight
                        ? "bg-gradient-to-b from-white via-emerald-50/30 to-white border-emerald-500 shadow-2xl shadow-emerald-900/10 ring-2 ring-emerald-500/20 lg:-translate-y-2"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-lg shadow-slate-200/50 hover:shadow-xl"
                    }`}
                  >
                    {/* Highlight Top Banner */}
                    {isHighlight && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{plan.badgeText || "Most Popular Choice"}</span>
                      </div>
                    )}

                    <div>
                      {/* Top Audience & Badge */}
                      <div className="flex items-center justify-between gap-2 mb-4 pt-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-extrabold uppercase tracking-wider">
                          {plan.targetAudience}
                        </span>

                        {!isHighlight && plan.badgeText && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                            {plan.badgeText}
                          </span>
                        )}

                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {plan.subscribersCount} Members Joined
                        </span>
                      </div>

                      {/* Plan Title & Description */}
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed min-h-[40px]">
                        {plan.description}
                      </p>

                      {/* Price Section */}
                      <div className="mt-6 pt-5 border-t border-slate-100 flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-slate-500">
                          {plan.currency}
                        </span>
                        <span className="text-4xl font-black text-slate-950 tracking-tight">
                          {plan.price.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          / {plan.billingCycle}
                        </span>

                        {plan.discountPercentage ? (
                          <span className="ml-auto text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                            {plan.discountPercentage}% OFF STAYS
                          </span>
                        ) : null}
                      </div>

                      {/* Features List */}
                      <div className="mt-6 space-y-3">
                        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                          What's Included:
                        </p>
                        <ul className="space-y-2.5">
                          {(plan.features || []).map((feat, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2.5 text-xs font-medium text-slate-700"
                            >
                              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                              <span className="leading-snug">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* CTA Join Button */}
                    <div className="mt-8 pt-5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenJoinModal(plan)}
                        className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 group cursor-pointer ${
                          isHighlight
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/30 hover:shadow-xl active:scale-98"
                            : "bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg active:scale-98"
                        }`}
                      >
                        <span>Join as Member</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </button>
                      <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
                        Instant digital membership card • Safe Nepal checkout
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ======================================================
            3. MEMBER DETAILS: WHY JOIN GOJITRIP MEMBERSHIP?
        ====================================================== */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200/80">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Member Privileges & Real Perks</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Designed Specially For Nepal Road Trippers
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                GojiTrip is more than a booking platform. Our verified membership passes empower you to travel safely with local privileges and direct host connections.
              </p>
            </div>

            {/* Feature Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Offline GPS Highway & Trek Corridors
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Download rich GPS route profiles with elevation curves, petrol stations, EV charging points, and landslide risk warnings that work seamlessly when cellular network drops in upper Mustang, Manang, and Solukhumbu.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Hotel className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Guaranteed 10%–20% Direct Stays Discount
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Show your active GojiTrip Digital Member Pass on arrival at partner teahouses, boutique resorts, and traditional Gurung & Thakali homestays for instant price deductions with zero hassle.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  24/7 Mountain Emergency & Safety Line
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Members get direct WhatsApp SOS hotline access connected with local police posts, 4x4 Jeep rescue operators, and certified helicopter dispatch coordinators across the Himalayas.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Direct Contact with Certified Guides
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Skip third-party agency markups. Communicate directly with government-licensed mountain guides, rescue rafting captains, and FAI-certified tandem pilots registered in our directory.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Bus className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Priority 4x4 Jeep & Transport Booking
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Get priority window-seat allocations and guaranteed luggage allowances on rugged Himalayan routes like Pokhara to Jomsom/Muktinath and Kathmandu to Syabrubesi.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Host & Guide Business Empowerment
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Are you a local lodge owner or trek guide? Membership grants a Verified Host Badge, top ranking in search corridors, and 100% direct traveler inquiries with 0% platform commission.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            4. HOW MEMBERSHIP WORKS: 3 EASY STEPS
        ====================================================== */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              How It Works in 3 Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Start enjoying VIP Nepal travel privileges in less than 2 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md shadow-emerald-600/20">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Choose Your Pass
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Select the plan that fits your itinerary—whether you are taking a weekend road trip, trekking for a month, or running a local tourism business.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3 relative">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md shadow-teal-600/20">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Get Instant Digital Pass
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive your unique Member ID with QR verification badge immediately. Keep it on your phone or Apple/Google Wallet.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3 relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md shadow-blue-600/20">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Show & Save Across Nepal
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Flash your Member Pass at partner stays, download offline trail maps, and contact emergency dispatch anytime during your journey.
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================
            5. FREQUENTLY ASKED QUESTIONS (FAQ)
        ====================================================== */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100/60 border-t border-slate-200">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Got Questions?</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Everything you need to know about GojiTrip membership benefits.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: "How do I claim my member discount at hotels and homestays?",
                  a: "Simply show your GojiTrip Digital Member Pass (available on this page or in your email) upon check-in. Partner homestays and hotels will verify your active pass and apply your 10%–20% discount directly on your bill.",
                },
                {
                  q: "Does the membership pass work when there is no internet connection?",
                  a: "Yes! Your Member ID and offline GPS route maps can be downloaded and stored on your smartphone. They work without active cellular signals throughout high-altitude remote regions.",
                },
                {
                  q: "What payment methods are supported for membership passes?",
                  a: "We support instant local payments via eSewa, Khalti, Nepalese Bank Transfers, as well as international Credit and Debit Cards (Visa, Mastercard).",
                },
                {
                  q: "Can I cancel or pause my subscription anytime?",
                  a: "Absolutely. There are no lock-in contracts. You can manage or cancel your auto-renewal at any time with a single click, and your benefits remain active until the end of your current paid billing period.",
                },
                {
                  q: "I am a local guide or lodge owner. How does the partner pass help me?",
                  a: "The Partner Pass grants you a 'Verified Partner Badge' on GojiTrip's public directory. Travelers searching routes will see your direct WhatsApp number and lodge listings with zero commission deducted from your guest fees.",
                },
              ].map((faq, index) => {
                const isOpen = openFaqIndex === index;

                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:text-emerald-600 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isOpen ? "rotate-180 text-emerald-600" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ======================================================
            6. BOTTOM CTA
        ====================================================== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950 text-white relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <Crown className="w-7 h-7" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Explore Nepal Like a VIP?
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Pick your pass today and enjoy instant direct discounts, offline maps, and safety assistance across the Himalayas.
            </p>

            <div className="pt-2">
              <a
                href="#top"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <span>Choose Your Membership Pass</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ======================================================
          JOIN AS MEMBER MODAL / DIGITAL PASS PREVIEW
      ====================================================== */}
      {isJoinModalOpen && selectedPlanForJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider">
                  {confirmedSubscriber ? "Your Digital Member Pass" : "Activate Membership"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsJoinModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {confirmedSubscriber ? (
                /* ================= CONFIRMATION & DIGITAL CARD ================= */
                <div className="space-y-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-slate-900">
                      Welcome to GojiTrip VIP, {confirmedSubscriber.userName}!
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Your membership is now active. Show this digital pass at any verified Nepal partner stay or service.
                    </p>
                  </div>

                  {/* Digital Pass Card UI */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white border border-emerald-500/40 shadow-xl text-left relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5" />
                          <span>GojiTrip Verified Pass</span>
                        </div>
                        <h5 className="text-base font-black text-white mt-0.5">
                          {confirmedSubscriber.planName}
                        </h5>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                        ACTIVE
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Member Name
                        </div>
                        <div className="font-bold text-white text-sm truncate">
                          {confirmedSubscriber.userName}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Member ID
                        </div>
                        <div className="font-mono text-emerald-400 font-bold text-sm">
                          {confirmedSubscriber.id}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Valid Through
                        </div>
                        <div className="font-medium text-slate-200">
                          {confirmedSubscriber.expiryDate}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Payment Status
                        </div>
                        <div className="font-bold text-emerald-400">
                          Verified Paid
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Show at partner check-in</span>
                      <span className="font-mono text-[10px]">Nepal Corridors</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsJoinModalOpen(false)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* ================= JOIN CHECKOUT FORM ================= */
                <form onSubmit={handleConfirmSubscription} className="space-y-4">
                  {/* Selected Plan Summary Banner */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                        Selected Membership Tier
                      </div>
                      <h4 className="text-base font-black text-slate-900 mt-0.5">
                        {selectedPlanForJoin.name}
                      </h4>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {selectedPlanForJoin.currency} {selectedPlanForJoin.price.toLocaleString()} / {selectedPlanForJoin.billingCycle}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-white border border-emerald-300 text-emerald-700 text-xs font-extrabold">
                      {selectedPlanForJoin.targetAudience}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Poudel"
                      value={joinForm.userName}
                      onChange={(e) =>
                        setJoinForm({ ...joinForm, userName: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={joinForm.userEmail}
                        onChange={(e) =>
                          setJoinForm({ ...joinForm, userEmail: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+977-98..."
                        value={joinForm.userPhone}
                        onChange={(e) =>
                          setJoinForm({ ...joinForm, userPhone: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {[
                        { label: "eSewa Wallet", value: "eSewa" },
                        { label: "Khalti Wallet", value: "Khalti" },
                        { label: "Debit / Credit Card", value: "Credit Card" },
                        { label: "Nepal Bank Transfer", value: "Bank Transfer" },
                      ].map((pm) => (
                        <button
                          key={pm.value}
                          type="button"
                          onClick={() =>
                            setJoinForm({
                              ...joinForm,
                              paymentMethod: pm.value as any,
                            })
                          }
                          className={`p-2.5 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between ${
                            joinForm.paymentMethod === pm.value
                              ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span>{pm.label}</span>
                          {joinForm.paymentMethod === pm.value && (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto-renew checkbox */}
                  <div className="pt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
                      <input
                        type="checkbox"
                        checked={joinForm.autoRenew}
                        onChange={(e) =>
                          setJoinForm({ ...joinForm, autoRenew: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Enable automatic renewal (cancel anytime)</span>
                    </label>
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-4 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 active:scale-98 disabled:opacity-60"
                    >
                      {isSubmitting
                        ? "Activating Your Pass..."
                        : `Activate Pass (${selectedPlanForJoin.currency} ${selectedPlanForJoin.price.toLocaleString()})`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Public Footer */}
      <Footer />
    </div>
  );
}
