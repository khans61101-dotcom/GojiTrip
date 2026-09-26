import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  Compass,
  Building,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  Globe,
  Phone,
  Mail,
  ArrowLeft,
} from "lucide-react";
import Footer from "@/components/landing/Footer";

export default function PublicAboutPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      <div>
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white shadow-sm hover:shadow border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 hover:text-slate-900 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-emerald-600 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>

        {/* ============================================================
            1. HERO HEADER SECTION
            ============================================================ */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-slate-50 to-emerald-50/30 border-b border-slate-200/80 overflow-hidden mt-4">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>About GojiTrip • Verified Travel Portal</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Empowering Authentic Travel Across{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                Nepal & Beyond
              </span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
              GojiTrip is an AI-powered pocket travel companion designed to provide verified routes, authentic homestays, accurate bus fares, certified mountain guides, and real-time highway insights.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                to="/pages/routes"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center space-x-2 hover:scale-105 active:scale-95"
              >
                <span>Explore Verified Routes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/pages/hotels"
                className="px-6 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-sm shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                Find Partner Stays
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================
            2. IMPACT STATISTICS BAR
            ============================================================ */}
        <section className="py-10 bg-white border-b border-slate-200/80 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600">100%</div>
                <div className="text-xs font-semibold text-slate-600">Ground-Verified Routes</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-teal-600">500+</div>
                <div className="text-xs font-semibold text-slate-600">Hotels & Partner Stays</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-cyan-600">50+</div>
                <div className="text-xs font-semibold text-slate-600">Certified Mountain Guides</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600">24/7</div>
                <div className="text-xs font-semibold text-slate-600">Real-Time Highway Updates</div>
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
              <div className="inline-flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider bg-emerald-50 px-3.5 py-1.5 rounded-lg border border-emerald-200/80">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>Our Story & Vision</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Solving the Problem of Unverified Travel Data
              </h2>

              <p className="text-slate-600 text-sm leading-relaxed">
                Travelers exploring Nepal&apos;s breathtaking landscapes often face inconsistent bus schedules, unverified hotel pricing, lack of fuel station info, and difficulty contacting certified local guides.
              </p>

              <p className="text-slate-600 text-sm leading-relaxed">
                GojiTrip was created to solve this challenge. By combining modern AI route planning with ground-level verification from certified content team members, we ensure every detail on GojiTrip is authentic, actionable, and 100% reliable.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium">
                    Zero Empty Pages Strategy — every listing has active photos, pricing, and contact details.
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium">
                    Direct connection with local homestays, certified pilots, river captains, and drivers.
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium">
                    Comprehensive highway route intelligence including fuel stops, tolls, and elevation.
                  </span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-white aspect-[4/3] relative group">
                <img
                  src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80"
                  alt="Nepal Himalayan Landscape"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg">
                  <div className="text-xs font-bold text-emerald-700">Authentic Nepal Journeys</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
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
        <section className="py-16 bg-slate-100/70 border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">Why GojiTrip Stands Out</h2>
              <p className="text-slate-600 text-xs">
                Built with precision for seamless travel planning across mountain highways and heritage routes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">100% Ground Verification</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All data entries undergo a strict 3-tier approval workflow (Creator &rarr; Reviewer &rarr; Admin Approval).
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-400 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Certified Tour Guides</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Direct access to licensed trekking guides, tandem paragliding pilots, and river captains with verified credentials.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-400 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Interactive Highway Intelligence</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
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
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 border border-slate-200/90 space-y-6 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
              <HeartHandshake className="w-8 h-8" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Have Questions or Want to Partner with GojiTrip?
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Whether you are a hotel owner, transport operator, licensed trekking guide, or traveler — we would love to connect with you.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-700 pt-2">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>support@gojitrip.com</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>+977-9800000000</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>www.gojitrip.com</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
              >
                <span>Access GojiTrip CMS Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Global Footer with X Icon */}
      <Footer />
    </div>
  );
}