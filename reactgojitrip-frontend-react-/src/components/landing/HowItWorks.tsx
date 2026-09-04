"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Sparkles,
  Compass,
  TicketCheck,
  ArrowRight,
  CheckCircle2,
  Zap,
  ChevronRight,
  Route as RouteIcon
} from "lucide-react";

interface StepItem {
  number: string;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: {
    bg: string;
    border: string;
    text: string;
    gradient: string;
    glow: string;
    badgeBg: string;
  };
  items: string[];
  ctaLabel: string;
  ctaPath: string;
}

const steps: StepItem[] = [
  {
    number: "01",
    badge: "Step 01 • Setup",
    title: "Enter Your Trip",
    subtitle: "Define your travel preferences, starting location & destination.",
    icon: MapPin,
    color: {
      bg: "bg-blue-50/80",
      border: "border-blue-200 hover:border-blue-400",
      text: "text-blue-600",
      gradient: "from-blue-600 to-indigo-600",
      glow: "group-hover:shadow-blue-500/20",
      badgeBg: "bg-blue-100/80 text-blue-700",
    },
    items: [
      "Starting city & Destination",
      "Trip duration & Dates",
      "Total budget & Group size",
      "Travel mode & Pace",
    ],
    ctaLabel: "Start Planning",
    ctaPath: "/pages/trip-planner",
  },
  {
    number: "02",
    badge: "Step 02 • AI Engine",
    title: "AI Route Analysis",
    subtitle: "Our smart engine maps road conditions, live stops & fuel hubs.",
    icon: Sparkles,
    color: {
      bg: "bg-purple-50/80",
      border: "border-purple-200 hover:border-purple-400",
      text: "text-purple-600",
      gradient: "from-purple-600 to-violet-600",
      glow: "group-hover:shadow-purple-500/20",
      badgeBg: "bg-purple-100/80 text-purple-700",
    },
    items: [
      "Entire corridor mapping",
      "Live road & weather conditions",
      "Scenic stops & viewpoints",
      "Fuel stations & travel time",
    ],
    ctaLabel: "Explore Route Engine",
    ctaPath: "/pages/ai-route-analysis",
  },
  {
    number: "03",
    badge: "Step 03 • Curated",
    title: "Smart Recommendations",
    subtitle: "Handpicked hotels, restaurants & local tourist landmarks.",
    icon: Compass,
    color: {
      bg: "bg-amber-50/80",
      border: "border-amber-200 hover:border-amber-400",
      text: "text-amber-600",
      gradient: "from-amber-500 to-orange-600",
      glow: "group-hover:shadow-amber-500/20",
      badgeBg: "bg-amber-100/80 text-amber-700",
    },
    items: [
      "Verified hotels & homestays",
      "Authentic restaurants & cafes",
      "Famous heritage attractions",
      "Certified local guides",
    ],
    ctaLabel: "View Famous Places",
    ctaPath: "/pages/famous-places",
  },
  {
    number: "04",
    badge: "Step 04 • Instant",
    title: "Book Everything",
    subtitle: "Lock in transport, vehicle rentals & activities seamlessly.",
    icon: TicketCheck,
    color: {
      bg: "bg-emerald-50/80",
      border: "border-emerald-200 hover:border-emerald-400",
      text: "text-emerald-600",
      gradient: "from-emerald-600 to-teal-600",
      glow: "group-hover:shadow-emerald-500/20",
      badgeBg: "bg-emerald-100/80 text-emerald-700",
    },
    items: [
      "Bus & transport tickets",
      "Car & bike rentals",
      "Guide & tour packages",
      "Instant e-vouchers",
    ],
    ctaLabel: "Book Transport",
    ctaPath: "/pages/transport",
  },
];

export default function HowItWorks() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section id="how" className="py-16 md:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      
      {/* BACKGROUND DECORATIVE GLOW ACCENTS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ====================================================
            HEADER
        ==================================================== */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-600 text-xs font-bold tracking-wide uppercase mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>The Journey</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            From idea to itinerary in <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">four easy steps</span>
          </h2>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Every trip follows the same seamless route through GojiTrip&rsquo;s intelligent travel engine — enter your preferences, analyze the route, explore recommendations, and book everything in one place.
          </p>
        </div>

        {/* ====================================================
            STEP CARDS GRID WITH CONNECTED TIMELINE
        ==================================================== */}
        <div className="relative">
          
          {/* DESKTOP CONNECTING PROGRESS LINE */}
          <div className="hidden lg:block absolute top-[88px] left-[10%] right-[10%] h-1 bg-gradient-to-r from-blue-400 via-purple-400 via-amber-400 to-emerald-400 rounded-full opacity-30 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
            {steps.map((s, index) => {
              const Icon = s.icon;
              const isHovered = activeStep === index;

              return (
                <div
                  key={s.number}
                  onMouseEnter={() => setActiveStep(index)}
                  onMouseLeave={() => setActiveStep(null)}
                  onClick={() => navigate(s.ctaPath)}
                  className={`group relative bg-white rounded-3xl p-6 sm:p-7 border ${s.color.border} shadow-sm hover:shadow-xl ${s.color.glow} transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col justify-between`}
                >
                  {/* TOP HEADER WITHIN CARD */}
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      {/* ICON BOX */}
                      <div className={`w-14 h-14 rounded-2xl ${s.color.bg} flex items-center justify-center border border-slate-200/60 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className={`w-7 h-7 ${s.color.text}`} />
                      </div>

                      {/* STEP NUMBER BADGE */}
                      <div className={`px-3 py-1 rounded-xl ${s.color.badgeBg} text-xs font-black tracking-wider uppercase flex items-center gap-1`}>
                        <span>{s.badge}</span>
                      </div>
                    </div>

                    {/* CARD TITLE & SUBTITLE */}
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                      <span>{s.title}</span>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </h3>

                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
                      {s.subtitle}
                    </p>

                    {/* CHECKLIST ITEMS */}
                    <div className="space-y-2.5 mb-6 pt-4 border-t border-slate-100">
                      {s.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-start gap-2 text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                          <CheckCircle2 className={`w-4 h-4 ${s.color.text} shrink-0 mt-0.5`} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BOTTOM ACTION LINK */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className={`text-xs font-bold ${s.color.text} flex items-center gap-1.5 group-hover:underline`}>
                      <span>{s.ctaLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>

                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      0{index + 1}/04
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ====================================================
            BOTTOM CALL-TO-ACTION BANNER
        ==================================================== */}
        <div className="mt-16 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          
          {/* DECORATIVE LIGHT SPARKLE */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 hidden sm:flex">
              <Zap className="w-6 h-6 text-blue-400 animate-bounce" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-black text-white">Ready to plan your ultimate itinerary?</h4>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">Join thousands of travelers exploring top routes across Nepal & India.</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/pages/route")}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all transform hover:scale-[1.02] shrink-0"
          >
            <RouteIcon className="w-4 h-4" />
            <span>Create Itinerary Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
