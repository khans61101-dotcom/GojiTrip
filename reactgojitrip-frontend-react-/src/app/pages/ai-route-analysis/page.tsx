"use client";

import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  MapPin,
  Compass,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Fuel,
  CloudSun,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Car,
  Navigation,
  Clock,
  Layers
} from "lucide-react";

export default function AIRouteAnalysisPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const source = searchParams.get("source") || "Kathmandu";
  const destination = searchParams.get("destination") || "Pokhara";

  const [activeTab, setActiveTab] = useState<"corridor" | "road" | "fuel" | "scenic">("corridor");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      
      {/* ==========================================
          HERO & HEADER
      ========================================== */}
      <div className="bg-gradient-to-b from-purple-950/80 via-slate-900 to-slate-950 border-b border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <span className="cursor-pointer hover:text-purple-400" onClick={() => navigate("/")}>Home</span>
            <ChevronRight size={12} />
            <span className="text-purple-400 font-semibold">Step 02 • AI Route Analysis Engine</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold rounded-full w-fit mb-3">
            <Sparkles size={14} />
            <span>Step 02 of 04 • Live Route Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            AI Route Corridor & Terrain Analysis
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
            Live AI inspection of road conditions, elevation, fuel/EV charging intervals, weather alerts, and scenic stop recommendations for <strong className="text-purple-400">{source} ➔ {destination}</strong>.
          </p>
        </div>
      </div>

      {/* ==========================================
          ROUTE CORRIDOR SUMMARY BANNER
      ========================================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-2xl mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Corridor Route</div>
              <div className="text-sm font-bold text-white mt-1">{source} ➔ {destination}</div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Estimated Distance</div>
              <div className="text-sm font-bold text-purple-400 mt-1">205 Km (6.5 Hrs)</div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Highway Quality</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">Good (Multi-lane / Paved)</div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Fuel & EV Hubs</div>
              <div className="text-sm font-bold text-amber-400 mt-1">12 Stations On Route</div>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
          {[
            { id: "corridor", label: "Corridor & Terrain", icon: Layers },
            { id: "road", label: "Road & Weather Alerts", icon: CloudSun },
            { id: "fuel", label: "Fuel & EV Stations", icon: Fuel },
            { id: "scenic", label: "Scenic Viewpoints", icon: Compass },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  active
                    ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAIN ANALYSIS CONTENT (2 COLS) */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === "corridor" && (
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="text-purple-400" size={20} />
                  <span>Terrain & Elevation Profile</span>
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  The corridor between {source} and {destination} transitions from valley highway ridges into scenic river basins. Road grade averages 3.2% incline with paved asphalt and well-maintained bypass sections.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Peak Elevation</div>
                    <div className="text-sm font-bold text-white mt-1">1,400 meters ASL</div>
                  </div>
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Bypass Corridors</div>
                    <div className="text-sm font-bold text-emerald-400 mt-1">Mugling & Trishuli Bypass</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "road" && (
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CloudSun className="text-amber-400" size={20} />
                  <span>Live Road & Weather Monitoring</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                    <CheckCircle2 className="text-emerald-400 mt-0.5 shrink-0" size={18} />
                    <div>
                      <div className="text-xs font-bold text-emerald-400">Clear Traffic Flow</div>
                      <div className="text-xs text-slate-300 mt-0.5">No major delays reported along the highway corridor today.</div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="text-amber-400 mt-0.5 shrink-0" size={18} />
                    <div>
                      <div className="text-xs font-bold text-amber-400">Minor Hillside Maintenance</div>
                      <div className="text-xs text-slate-300 mt-0.5">Single-lane speed restriction for 2 km near Naubise valley.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "fuel" && (
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Fuel className="text-blue-400" size={20} />
                  <span>Fuel Stations & EV Superchargers</span>
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  12 verified petrol depots and fast EV charging hubs spaced every 20-30 km along the route corridor.
                </p>

                <div className="space-y-2.5">
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-white font-bold">NOC Highway Fuel Hub (Km 45)</span>
                    <span className="text-blue-400 font-semibold">Petrol, Diesel & EV Fast Charger</span>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-white font-bold">Himalayan Charging Park (Km 92)</span>
                    <span className="text-emerald-400 font-semibold">120kW Supercharger + Cafe</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "scenic" && (
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="text-emerald-400" size={20} />
                  <span>Scenic Viewpoints & Rest Stops</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-xs font-bold text-purple-400">Trishuli River Overlook</div>
                    <div className="text-xs text-slate-400 mt-1">Famous roadside tea hub with river rafting views.</div>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-xs font-bold text-amber-400">Bandipur Ridge Panorama</div>
                    <div className="text-xs text-slate-400 mt-1">High elevation scenic spot overlooking Annapurna ranges.</div>
                  </div>
                </div>
              </div>
            )}

            {/* NEXT STEP ACTION CTA */}
            <div className="pt-4">
              <button
                onClick={() => navigate(`/pages/famous-places?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`)}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-base rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-purple-600/20 transition-all transform hover:scale-[1.01]"
              >
                <Compass size={18} />
                <span>Proceed to Step 03 • Smart Recommendations</span>
                <ArrowRight size={18} />
              </button>
            </div>

          </div>

          {/* SIDEBAR SUMMARY (1 COL) */}
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h4 className="text-white font-bold text-base border-b border-slate-800 pb-3">AI Engine Score</h4>
              <div className="text-center py-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-4xl font-black text-purple-400">9.4 / 10</div>
                <div className="text-xs text-slate-400 mt-1">Route Safety & Comfort Rating</div>
              </div>
              
              <button
                onClick={() => navigate("/pages/routes")}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Navigation size={15} />
                <span>Open Full Route Map</span>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
