"use client";

import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  Compass,
  Award,
  Users,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  Globe,
  Hotel,
  Bus,
  Phone,
  Mail,
  Building,
} from "lucide-react";

export default function PublicAboutPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-emerald-500 selection:text-white">
      {/* ============================================================
          1. HERO HEADER SECTION
          ============================================================ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0F172A] via-[#111827] to-[#0F172A] border-b border-slate-800 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>About GojiTrip • Verified Travel Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Empowering Authentic Travel Across{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Nepal & Beyond
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            GojiTrip is an AI-powered pocket travel companion designed to provide verified routes, authentic homestays, accurate bus fares, certified mountain guides, and real-time highway insights.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              to="/pages/routes"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-xl shadow-emerald-900/30 transition-all flex items-center space-x-2"
            >
              <span>Explore Verified Routes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/pages/hotels"
              className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              Find Partner Stays
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. IMPACT STATISTICS BAR
          ============================================================ */}
      <section className="py-10 bg-[#131C30] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">100%</div>
              <div className="text-xs font-semibold text-slate-300">Ground-Verified Routes</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-400">500+</div>
              <div className="text-xs font-semibold text-slate-300">Hotels & Partner Stays</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400">50+</div>
              <div className="text-xs font-semibold text-slate-300">Certified Mountain Guides</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400">24/7</div>
              <div className="text-xs font-semibold text-slate-300">Real-Time Highway Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          3. OUR STORY & MISSION
          ============================================================ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Building className="w-4 h-4" />
              <span>Our Story & Vision</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Solving the Problem of Unverified Travel Data
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed">
              Travelers exploring Nepal's breathtaking landscapes often face inconsistent bus schedules, unverified hotel pricing, lack of fuel station info, and difficulty contacting certified local guides.
            </p>

            <p className="text-slate-300 text-sm leading-relaxed">
              GojiTrip was created to solve this challenge. By combining modern AI route planning with ground-level verification from certified content team members, we ensure every detail on GojiTrip is authentic, actionable, and 100% reliable.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-200 font-medium">
                  Zero Empty Pages Strategy — every listing has active photos, pricing, and contact details.
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-200 font-medium">
                  Direct connection with local homestays, certified pilots, river captains, and drivers.
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-200 font-medium">
                  Comprehensive highway route intelligence including fuel stops, tolls, and elevation.
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-800 aspect-[4/3] relative group">
              <img
                src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80"
                alt="Nepal Himalayan Landscape"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10">
                <div className="text-xs font-bold text-emerald-400">Authentic Nepal Journeys</div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Connecting Pokhara, Mustang, Annapurna, Muktinath & Kathmandu
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. CORE PILLARS GRID
          ============================================================ */}
      <section className="py-16 bg-[#111827] border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Why GojiTrip Stands Out</h2>
            <p className="text-slate-400 text-xs">
              Built with precision for seamless travel planning across mountain highways and heritage routes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#182238]/80 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">100% Ground Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All data entries undergo a strict 3-tier approval workflow (Creator &rarr; Reviewer &rarr; Admin Approval).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#182238]/80 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Certified Tour Guides</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct access to licensed trekking guides, tandem paragliding pilots, and river captains with verified credentials.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#182238]/80 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Interactive Highway Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Detailed route elevation profiles, distance markers, fuel stops, and road condition updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. CONTACT & TEAM CTA
          ============================================================ */}
      <section className="py-20 max-w-5xl mx-auto px-4 text-center space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#182238] to-[#0F172A] border border-slate-800 space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <HeartHandshake className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Have Questions or Want to Partner with GojiTrip?
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Whether you are a hotel owner, transport operator, licensed trekking guide, or traveler — we would love to connect with you.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-300 pt-2">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>support@gojitrip.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>+977-9800000000</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>www.gojitrip.com</span>
            </div>
          </div>

          <div className="pt-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition-all"
            >
              <span>Access GojiTrip CMS Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
