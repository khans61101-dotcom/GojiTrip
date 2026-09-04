"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Wallet,
  Users,
  Car,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Clock,
  Navigation,
  ChevronRight,
  Info
} from "lucide-react";

export default function TripPlannerPage() {
  const navigate = useNavigate();

  const [source, setSource] = useState("Kathmandu");
  const [destination, setDestination] = useState("Pokhara");
  const [days, setDays] = useState(4);
  const [budget, setBudget] = useState("Comfort");
  const [groupSize, setGroupSize] = useState("2 Travelers (Couple)");
  const [travelMode, setTravelMode] = useState("Private Car / Taxi");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("source", source);
    params.set("destination", destination);
    params.set("days", String(days));
    params.set("budget", budget);
    params.set("group", groupSize);
    params.set("mode", travelMode);
    params.set("date", startDate);

    navigate(`/pages/routes?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      
      {/* ==========================================
          HERO & BREADCRUMB
      ========================================== */}
      <div className="bg-gradient-to-b from-blue-950/80 via-slate-900 to-slate-950 border-b border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <span className="cursor-pointer hover:text-blue-400" onClick={() => navigate("/")}>Home</span>
            <ChevronRight size={12} />
            <span className="text-blue-400 font-semibold">Step 01 • Trip Planner</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-full w-fit mb-3">
            <Sparkles size={14} />
            <span>Step 01 of 04 • Trip Preference Setup</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Enter Your Trip Preferences
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
            Configure your starting point, destination, budget, group size, and travel mode. Our AI engine will craft a customized itinerary and route map for you.
          </p>
        </div>
      </div>

      {/* ==========================================
          MAIN FORM & SUMMARY CONTAINER
      ========================================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT FORM (2 COLS) */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
            <form onSubmit={handleGeneratePlan} className="space-y-6">
              
              {/* SOURCE & DESTINATION */}
              <div>
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <MapPin className="text-blue-400" size={18} />
                  <span>Route Locations</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Starting City / Origin</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        placeholder="e.g. Kathmandu, Delhi, Bhopal"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Destination City</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="e.g. Pokhara, Agra, Indore"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* DATES & DURATION */}
              <div>
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Calendar className="text-purple-400" size={18} />
                  <span>Dates & Duration</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Departure Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Number of Days ({days} Days)</label>
                    <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <input
                        type="range"
                        min={1}
                        max={15}
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-blue-400 px-2 py-1 bg-blue-500/10 rounded-lg shrink-0">
                        {days} Days
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BUDGET & GROUP SIZE */}
              <div>
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Wallet className="text-amber-400" size={18} />
                  <span>Budget & Group Preference</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Budget Comfort Level</label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-blue-500"
                    >
                      <option value="Economy">Economy (Backpacker Friendly)</option>
                      <option value="Comfort">Comfort (Standard Mid-range)</option>
                      <option value="Luxury">Luxury (Premium Resorts & Cabs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Travel Group Type</label>
                    <select
                      value={groupSize}
                      onChange={(e) => setGroupSize(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-blue-500"
                    >
                      <option value="1 Solo Traveler">Solo Traveler</option>
                      <option value="2 Travelers (Couple)">Couple / 2 Travelers</option>
                      <option value="3-5 Friends / Family">Small Group (3-5 People)</option>
                      <option value="6+ Large Tour Group">Large Group (6+ People)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TRAVEL MODE */}
              <div>
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Car className="text-emerald-400" size={18} />
                  <span>Preferred Travel Mode</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    "Private Car / Taxi",
                    "Motorcycle / Bike",
                    "Tourist Bus",
                    "Self-Drive Rental"
                  ].map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setTravelMode(mode)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 text-center ${
                        travelMode === mode
                          ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-md"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Car size={16} />
                      <span>{mode}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-base rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 transition-all transform hover:scale-[1.01]"
                >
                  <Sparkles size={18} />
                  <span>Generate AI Itinerary & Route Plan</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT SUMMARY SIDEBAR (1 COL) */}
          <div className="space-y-6">
            
            {/* LIVE TRIP PREVIEW */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-white font-bold text-base border-b border-slate-800 pb-3 flex items-center gap-2">
                <Compass size={18} className="text-blue-400" />
                <span>Trip Overview Summary</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Route Corridor</span>
                  <span className="text-white font-bold">{source} ➔ {destination}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Trip Duration</span>
                  <span className="text-blue-400 font-bold">{days} Days</span>
                </div>

                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Budget Level</span>
                  <span className="text-amber-400 font-bold">{budget}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Group Size</span>
                  <span className="text-purple-400 font-bold">{groupSize}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Transport Mode</span>
                  <span className="text-emerald-400 font-bold">{travelMode}</span>
                </div>
              </div>
            </div>

            {/* WHAT HAPPENS NEXT CARD */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Info size={14} className="text-blue-400" />
                <span>What Happens Next?</span>
              </h4>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>Step 02: AI analyzes road, weather & fuel stops.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>Step 03: Select curated hotels, cafes & famous spots.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>Step 04: Lock transport tickets & activities in 1 click.</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
