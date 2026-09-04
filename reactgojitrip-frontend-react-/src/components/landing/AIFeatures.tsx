"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Route,
  Building2,
  Utensils,
  Landmark,
  Fuel,
  Bus,
  ArrowRight,
  ChevronRight,
  Star,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Compass,
  MapPin
} from "lucide-react";

interface EcosystemService {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: React.ElementType;
  gradient: string;
  borderHover: string;
  badgeBg: string;
  badgeText: string;
  stats: string;
  highlights: string[];
  ctaLabel: string;
  path: string;
}

const services: EcosystemService[] = [
  {
    id: "routes",
    badge: "Highway Corridors",
    title: "Smart Highway Route Planner",
    subtitle: "AI-mapped routes with road conditions & live stops",
    desc: "Discover complete highway corridors between starting cities and destinations with live traffic, elevation profiles, weather alerts, and optimal driving times.",
    icon: Route,
    gradient: "from-blue-600 to-indigo-600",
    borderHover: "hover:border-blue-400 hover:shadow-blue-500/20",
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-700",
    stats: "500+ Verified Corridors",
    highlights: ["Live Road & Terrain Quality", "Optimal Driving Time & Speeds", "Scenic Stopovers & Fuel Stations"],
    ctaLabel: "Explore Route Planner",
    path: "/pages/routes",
  },
  {
    id: "hotels",
    badge: "Stays & Resorts",
    title: "Verified Hotels & Local Homestays",
    subtitle: "Handpicked accommodations with best rate guarantee",
    desc: "Browse luxury mountain resorts, lakeside boutique hotels, and authentic local homestays verified for safety, hygiene, parking, and traveler comfort.",
    icon: Building2,
    gradient: "from-emerald-600 to-teal-600",
    borderHover: "hover:border-emerald-400 hover:shadow-emerald-500/20",
    badgeBg: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-700",
    stats: "1,200+ Verified Stays",
    highlights: ["Best Price & Rating Match", "24/7 Check-in & Free Parking", "Authentic Local Homestays"],
    ctaLabel: "Browse Hotels & Stays",
    path: "/pages/hotels",
  },
  {
    id: "food",
    badge: "Regional Dining",
    title: "Authentic Food & Highway Dining",
    subtitle: "Discover regional delicacies, roadside tea & top cafes",
    desc: "Taste regional Nepalese & Indian cuisines, highway dining stops, specialty coffee houses, and clean family-friendly eateries along your travel route.",
    icon: Utensils,
    gradient: "from-amber-500 to-orange-600",
    borderHover: "hover:border-amber-400 hover:shadow-amber-500/20",
    badgeBg: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-700",
    stats: "650+ Cafes & Eateries",
    highlights: ["Verified Hygiene Ratings", "Regional Dishes & Local Teas", "Highway Pitstop Recommended"],
    ctaLabel: "Find Restaurants & Cafes",
    path: "/pages/restaurants",
  },
  {
    id: "famous-places",
    badge: "Sightseeing & Heritage",
    title: "Famous Attractions & Landmarks",
    subtitle: "Sacred temples, mountain viewpoints & historic sites",
    desc: "Uncover iconic sightseeing landmarks, world heritage temples, panoramic mountain overlooks, and hidden cultural gems along every journey.",
    icon: Landmark,
    gradient: "from-purple-600 to-violet-600",
    borderHover: "hover:border-purple-400 hover:shadow-purple-500/20",
    badgeBg: "bg-purple-50 border-purple-200",
    badgeText: "text-purple-700",
    stats: "850+ Famous Landmarks",
    highlights: ["Interactive OpenStreetMap Location", "Best Visiting Season & Ticket Fee", "Visitor Etiquette & Guidelines"],
    ctaLabel: "Discover Famous Places",
    path: "/pages/famous-places",
  },
  {
    id: "fuel",
    badge: "24/7 Fuel & EV Hubs",
    title: "Fuel & EV Fast Charging Network",
    subtitle: "Mapped 24/7 petrol stations & EV superchargers",
    desc: "Never run low on energy. Map verified 24/7 petrol & diesel stations, fast EV charging hubs, restrooms, and emergency repair bays across highway routes.",
    icon: Fuel,
    gradient: "from-cyan-500 to-blue-600",
    borderHover: "hover:border-cyan-400 hover:shadow-cyan-500/20",
    badgeBg: "bg-cyan-50 border-cyan-200",
    badgeText: "text-cyan-700",
    stats: "300+ Mapped Fuel Hubs",
    highlights: ["60kW-120kW EV Superchargers", "24/7 Restrooms & Convenience Marts", "Emergency Repair & Air Pumps"],
    ctaLabel: "Locate Fuel & EV Stations",
    path: "/pages/fuel-stations",
  },
  {
    id: "transport",
    badge: "Transport & Guides",
    title: "Local Transport & Certified Guides",
    subtitle: "Express bus tickets, bike rentals & tour experts",
    desc: "Book express AC buses, private taxis, motorcycle rentals, or connect with certified mountain guides and local tour experts for seamless travel.",
    icon: Bus,
    gradient: "from-rose-500 to-pink-600",
    borderHover: "hover:border-rose-400 hover:shadow-rose-500/20",
    badgeBg: "bg-rose-50 border-rose-200",
    badgeText: "text-rose-700",
    stats: "400+ Transport Options",
    highlights: ["Instant Ticket E-Vouchers", "Self-Drive Car & Bike Rentals", "Certified Mountain & Trek Guides"],
    ctaLabel: "Book Transport & Guides",
    path: "/pages/transport",
  },
];

export default function AIFeatures() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="relative py-16 md:py-28 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white">
      
      {/* AMBIENT GLOW BACKGROUND ACCENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/5 rounded-full blur-[140px]" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* ====================================================
            HEADER
        ==================================================== */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-blue-500/10">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>GojiTrip Travel Ecosystem</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight mb-4">
            Everything You Need For Your <span className="bg-gradient-to-r from-blue-400 via-teal-400 to-purple-400 bg-clip-text text-transparent">Perfect Journey</span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            From smart highway corridor mapping and verified homestays to regional food pitstops and 24/7 EV charging — GojiTrip powers every phase of your adventure.
          </p>
        </div>

        {/* ====================================================
            6 SERVICE PILLARS GRID
        ==================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((s) => {
            const Icon = s.icon;
            const isHovered = hoveredId === s.id;

            return (
              <div
                key={s.id}
                onMouseEnter={() => setHoveredId(s.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => navigate(s.path)}
                className={`group relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-7 shadow-xl ${s.borderHover} transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col justify-between`}
              >
                {/* TOP HEADER */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    {/* ICON CONTAINER */}
                    <div className={`w-14 h-14 bg-gradient-to-br ${s.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={26} strokeWidth={1.8} />
                    </div>

                    {/* BADGE */}
                    <span className={`px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wider border ${s.badgeBg} ${s.badgeText}`}>
                      {s.badge}
                    </span>
                  </div>

                  {/* TITLE & SUBTITLE */}
                  <h3 className="text-xl font-extrabold text-white mb-1.5 group-hover:text-blue-400 transition-colors flex items-center justify-between">
                    <span>{s.title}</span>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </h3>

                  <p className="text-xs font-semibold text-slate-400 mb-4">
                    {s.subtitle}
                  </p>

                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                    {s.desc}
                  </p>

                  {/* HIGHLIGHTS CHECKLIST */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-slate-800/80">
                    {s.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BOTTOM FOOTER */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                    <ShieldCheck size={14} className="text-blue-400" />
                    <span>{s.stats}</span>
                  </div>

                  <span className="text-xs font-bold text-blue-400 group-hover:text-blue-300 flex items-center gap-1 group-hover:underline">
                    <span>{s.ctaLabel}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ====================================================
            BOTTOM SUMMARY STATS BANNER
        ==================================================== */}
        <div className="mt-16 bg-gradient-to-r from-blue-900/60 via-purple-900/40 to-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="p-3.5 bg-blue-500/20 rounded-2xl border border-blue-400/30 shrink-0 hidden sm:block">
              <Sparkles className="w-7 h-7 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-white">Explore the complete GojiTrip travel directory</h4>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">Access verified hotels, regional food spots, scenic landmarks, and transport tickets across Nepal & India.</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/pages/routes")}
            className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] shrink-0"
          >
            <Compass size={16} />
            <span>Launch Complete Directory</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </section>
  );
}