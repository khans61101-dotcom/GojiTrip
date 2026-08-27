"use client";

import React from "react";
import { ShieldCheck, Compass, MapPin, Award, Users, HeartHandshake, Sparkles, CheckCircle2 } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span>About GojiTrip</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Your Trusted AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-red-400">Pocket Travel Companion</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            GojiTrip is built to revolutionize how travelers explore Nepal and beyond. We combine authentic ground intelligence, verified local partners, and real-time highway insights into one seamless travel platform.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-blue-500/50 transition-all group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Verified Partners Only</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every hotel, homestay, bus operator, and trekking guide listed on GojiTrip is personally verified for safety and quality.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-blue-500/50 transition-all group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Highway & Route Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time route maps, distance breakdowns, fuel stations, toll details, and scenic stopovers across all major Nepal corridors.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-blue-500/50 transition-all group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Zero Empty Pages</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never show placeholder content. Every listing contains genuine contacts, authentic photos, and accurate pricing.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-blue-500/50 transition-all group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Empowering Local Guides</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct connection with licensed mountain guides, paragliding pilots, rafting captains, and local homestay owners.
            </p>
          </div>
        </div>

        {/* Impact Numbers */}
        <div className="mt-14 p-8 rounded-3xl bg-gradient-to-r from-slate-800/80 via-slate-800/40 to-slate-800/80 border border-slate-700/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-extrabold text-blue-400">100%</div>
            <div className="text-xs font-semibold text-slate-300 mt-1">Verified Routes</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-sky-400">500+</div>
            <div className="text-xs font-semibold text-slate-300 mt-1">Partner Hotels & Stays</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-red-400">50+</div>
            <div className="text-xs font-semibold text-slate-300 mt-1">Certified Tour Guides</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-indigo-400">24/7</div>
            <div className="text-xs font-semibold text-slate-300 mt-1">Real-Time Assistance</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
