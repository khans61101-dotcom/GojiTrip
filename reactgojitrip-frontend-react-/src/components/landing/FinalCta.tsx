"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Compass, ShieldCheck, Route as RouteIcon, MapPin } from "lucide-react";

export default function FinalCta() {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white overflow-hidden shadow-2xl">
      
      {/* AMBIENT BACKGROUND GLOW & DECORATIVE SPARKLES */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        
        {/* BADGE */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-extrabold uppercase tracking-wider mb-6 shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Start Your Unforgettable Journey</span>
        </div>

        {/* HEADING & SUBHEADING */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
          Ready for Your <span className="bg-gradient-to-r from-amber-300 via-white to-sky-200 bg-clip-text text-transparent">Next Adventure?</span>
        </h2>

        <p className="text-base sm:text-lg md:text-xl text-blue-100/90 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
          Plan your dream route in seconds with intelligent AI recommendations, verified hotels, regional food spots, and 24/7 transport tickets.
        </p>

        {/* INTERACTIVE ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-12">
          
          {/* PRIMARY BUTTON - TRIP PLANNER */}
          <button
            onClick={() => navigate("/pages/trip-planner")}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-blue-700 font-extrabold text-base sm:text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.03] flex items-center justify-center gap-2.5 shrink-0 group"
          >
            <Compass className="w-5 h-5 text-blue-600" />
            <span>Start Planning Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* SECONDARY BUTTON - FAMOUS PLACES */}
          <button
            onClick={() => navigate("/pages/famous-places")}
            className="w-full sm:w-auto px-7 py-4 bg-blue-900/40 hover:bg-blue-900/60 border border-white/30 text-white font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2 shrink-0 backdrop-blur-md"
          >
            <MapPin className="w-4 h-4 text-amber-300" />
            <span>Explore Famous Places</span>
          </button>
        </div>

        {/* TRUST METRICS */}
        <div className="pt-8 border-t border-white/10 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-blue-100">
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Verified Corridors</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <RouteIcon className="w-4 h-4 text-amber-300" />
            <span>500+ Active Routes</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-300" />
            <span>AI Powered Engine</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Compass className="w-4 h-4 text-purple-300" />
            <span>Instant Itinerary</span>
          </div>
        </div>

      </div>
    </section>
  );
}
