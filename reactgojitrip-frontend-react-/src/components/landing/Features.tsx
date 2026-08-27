"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  Hotel,
  UtensilsCrossed,
  Bus,
  Users,
  Calculator,
  CloudSun,
  Car,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  Thermometer,
  CloudRain,
  Wind,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

// ============================================================
// ENGINE CARD INTERFACE
// ============================================================

interface Engine {
  id: string;
  icon: React.ElementType;
  title: string;
  badge: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  link?: string;
  isModal?: "budget" | "weather";
  list: string[];
  description: string;
}

const engines: Engine[] = [
  {
    id: "route",
    icon: Compass,
    title: "AI Route Intelligence",
    badge: "Core Engine",
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    iconBg: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600",
    borderColor: "hover:border-emerald-500/50",
    link: "/pages/routes",
    description: "Analyzes fastest highways, elevation, toll costs, and road conditions.",
    list: ["Multi-stop waypoint routing", "Elevation profile analysis", "Real-time road advisories"],
  },
  {
    id: "hotel",
    icon: Hotel,
    title: "Smart Hotel & Stay Discovery",
    badge: "Stay Engine",
    gradient: "from-blue-500/10 via-cyan-500/5 to-transparent",
    iconBg: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    borderColor: "hover:border-blue-500/50",
    link: "/pages/hotels",
    description: "Verified mountain lodges, family homestays, and luxury lake resorts.",
    list: ["Verified pricing & ratings", "Local homestay connects", "Instant contact details"],
  },
  {
    id: "restaurant",
    icon: UtensilsCrossed,
    title: "Highway Restaurant Discovery",
    badge: "Dining Engine",
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    iconBg: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-600",
    borderColor: "hover:border-amber-500/50",
    link: "/pages/restaurants",
    description: "Authentic local eateries, highway dhabas, cafes, and Thakali kitchens.",
    list: ["Authentic Nepali & Thakali food", "Clean highway rest stops", "Verified hygiene ratings"],
  },
  {
    id: "vehicle",
    icon: Car,
    title: "Commercial Vehicle Rental",
    badge: "Jeep & Cab",
    gradient: "from-indigo-500/10 via-purple-500/5 to-transparent",
    iconBg: "bg-indigo-50 border-indigo-200",
    iconColor: "text-indigo-600",
    borderColor: "hover:border-indigo-500/50",
    link: "/pages/transport",
    description: "Book 4x4 Mahindra Jeeps, HiAce Tempo Travellers, and private cabs.",
    list: ["Mustang 4x4 Jeep hire", "Pokhara & Kathmandu cabs", "Fixed route driver rates"],
  },
  {
    id: "guide",
    icon: Users,
    title: "Certified Local Tour Guides",
    badge: "Guide Engine",
    gradient: "from-teal-500/10 via-emerald-500/5 to-transparent",
    iconBg: "bg-teal-50 border-teal-200",
    iconColor: "text-teal-600",
    borderColor: "hover:border-teal-500/50",
    link: "/pages/guides",
    description: "Licensed trekking guides, tandem paragliding pilots & river captains.",
    list: ["Licensed Sherpa guides", "Paragliding tandem pilots", "Multilingual experts"],
  },
  {
    id: "transport",
    icon: Bus,
    title: "Public Bus Transport",
    badge: "Bus Engine",
    gradient: "from-cyan-500/10 via-blue-500/5 to-transparent",
    iconBg: "bg-cyan-50 border-cyan-200",
    iconColor: "text-cyan-600",
    borderColor: "hover:border-cyan-500/50",
    link: "/pages/transport",
    description: "Tourist bus schedules, Deluxe AC sleeper coaches & local bus routes.",
    list: ["Kathmandu-Pokhara tourist bus", "Transparent fare estimates", "Daily departure times"],
  },
  {
    id: "budget",
    icon: Calculator,
    title: "Interactive Budget Calculator",
    badge: "Calculator",
    gradient: "from-green-500/10 via-emerald-500/5 to-transparent",
    iconBg: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    borderColor: "hover:border-green-500/50",
    isModal: "budget",
    description: "Calculate total NPR trip costs including fuel, stays, food, and permits.",
    list: ["Instant NPR expense breakdown", "Permit & entry fee estimator", "Per-person cost split"],
  },
  {
    id: "weather",
    icon: CloudSun,
    title: "Weather & Mountain Forecast",
    badge: "Live Alert",
    gradient: "from-sky-500/10 via-blue-500/5 to-transparent",
    iconBg: "bg-sky-50 border-sky-200",
    iconColor: "text-sky-600",
    borderColor: "hover:border-sky-500/50",
    isModal: "weather",
    description: "Real-time highway weather, rain probability, and high-altitude snow alerts.",
    list: ["Kathmandu & Pokhara weather", "Mustang & Muktinath altitude temp", "Highway rain & snow alerts"],
  },
];

// ============================================================
// MAIN FEATURES COMPONENT
// ============================================================

export default function Features() {
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [weatherModalOpen, setWeatherModalOpen] = useState(false);

  // Budget Calculator State
  const [days, setDays] = useState(3);
  const [pax, setPax] = useState(2);
  const [stayType, setStayType] = useState<"budget" | "standard" | "luxury">("standard");
  const [travelType, setTravelType] = useState<"bus" | "jeep" | "flight">("jeep");

  // Calculated estimates in NPR
  const stayCostPerNight = stayType === "budget" ? 1500 : stayType === "standard" ? 3500 : 8500;
  const foodCostPerDay = 1200;
  const transportCostPerPerson = travelType === "bus" ? 1200 : travelType === "jeep" ? 4500 : 12500;

  const totalStay = stayCostPerNight * (days - 1) * Math.ceil(pax / 2);
  const totalFood = foodCostPerDay * days * pax;
  const totalTransport = transportCostPerPerson * pax;
  const totalEstimatedNpr = totalStay + totalFood + totalTransport;

  return (
    <section id="features" className="py-20 md:py-28 bg-slate-900 text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span>Under the Hood</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-red-400">AI Travel Expert</span>
          </h2>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Eight specialized AI engines work together on every route you plan to give you verified pricing, authentic stays, mountain guides, and highway safety insights.
          </p>
        </div>

        {/* 8 Engines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {engines.map((eng) => {
            const Icon = eng.icon;
            return (
              <div
                key={eng.id}
                className={`group relative rounded-2xl bg-[#182238]/90 border border-slate-800 p-6 flex flex-col justify-between transition-all duration-300 ${eng.borderColor} hover:-translate-y-1 shadow-xl hover:shadow-2xl overflow-hidden`}
              >
                {/* Gradient background overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${eng.gradient} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />

                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-md ${eng.iconBg} ${eng.iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {eng.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-extrabold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {eng.title}
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    {eng.description}
                  </p>

                  {/* Itemized List */}
                  <ul className="space-y-1.5 mb-6 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                    {eng.list.map((item, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Action Button */}
                {eng.link ? (
                  <Link
                    to={eng.link}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-blue-600 hover:text-white border border-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center justify-center space-x-1.5 shadow-md group-hover:border-blue-500/50"
                  >
                    <span>Launch {eng.title.split(" ")[0]} Engine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (eng.isModal === "budget") setBudgetModalOpen(true);
                      if (eng.isModal === "weather") setWeatherModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md"
                  >
                    <span>Open {eng.title.split(" ")[0]} Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          INTERACTIVE MODAL 1: BUDGET CALCULATOR
          ============================================================ */}
      {budgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-[#182238] flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm text-white">Nepal Trip Budget Estimator</h3>
              </div>
              <button
                onClick={() => setBudgetModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Number of Days</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={days}
                    onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Number of Travellers</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={pax}
                    onChange={(e) => setPax(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Stay / Accommodation Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "budget", label: "Homestay / Hostel", rate: "NPR 1,500/night" },
                    { id: "standard", label: "3★ Hotel / Resort", rate: "NPR 3,500/night" },
                    { id: "luxury", label: "Luxury Lake Lodge", rate: "NPR 8,500/night" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStayType(s.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        stayType === s.id
                          ? "bg-emerald-500/20 border-emerald-500 text-white font-bold"
                          : "bg-[#182238] border-slate-700 text-slate-400"
                      }`}
                    >
                      <div className="text-[11px] font-bold">{s.label}</div>
                      <div className="text-[9px] opacity-80 mt-0.5">{s.rate}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Transport Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "bus", label: "Tourist Bus", cost: "NPR 1,200/pax" },
                    { id: "jeep", label: "4x4 Scorpio Jeep", cost: "NPR 4,500/pax" },
                    { id: "flight", label: "Mountain Flight", cost: "NPR 12,500/pax" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTravelType(t.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        travelType === t.id
                          ? "bg-emerald-500/20 border-emerald-500 text-white font-bold"
                          : "bg-[#182238] border-slate-700 text-slate-400"
                      }`}
                    >
                      <div className="text-[11px] font-bold">{t.label}</div>
                      <div className="text-[9px] opacity-80 mt-0.5">{t.cost}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Itemized Calculation Summary Box */}
              <div className="p-4 rounded-2xl bg-[#182238] border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Accommodation ({days - 1} Nights):</span>
                  <span className="font-bold text-white">NPR {totalStay.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Food & Meals ({days} Days):</span>
                  <span className="font-bold text-white">NPR {totalFood.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transport Fares ({pax} Pax):</span>
                  <span className="font-bold text-white">NPR {totalTransport.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
                  <span className="font-extrabold text-white text-sm">Estimated Total Expense:</span>
                  <span className="font-extrabold text-emerald-400 text-base">
                    NPR {totalEstimatedNpr.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-[#131C30] flex justify-between items-center">
              <span className="text-[10px] text-slate-400">
                Avg per person: NPR {Math.round(totalEstimatedNpr / pax).toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => setBudgetModalOpen(false)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          INTERACTIVE MODAL 2: LIVE WEATHER FORECAST
          ============================================================ */}
      {weatherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-[#182238] flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <CloudSun className="w-5 h-5 text-sky-400" />
                <h3 className="font-extrabold text-sm text-white">Nepal Highway Weather & Mountain Forecast</h3>
              </div>
              <button
                onClick={() => setWeatherModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Kathmandu */}
                <div className="p-3.5 rounded-2xl bg-[#182238] border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Kathmandu Valley</span>
                    <span className="text-emerald-400 font-bold">24°C</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Clear Sky & Pleasant Breeze</p>
                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center"><CloudRain className="w-3 h-3 mr-1 text-cyan-400" /> 10% Rain</span>
                    <span className="flex items-center"><Wind className="w-3 h-3 mr-1 text-slate-300" /> 8 km/h</span>
                  </div>
                </div>

                {/* Pokhara */}
                <div className="p-3.5 rounded-2xl bg-[#182238] border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Pokhara Lakeside</span>
                    <span className="text-amber-400 font-bold">22°C</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Partly Cloudy • Great Paragliding</p>
                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center"><CloudRain className="w-3 h-3 mr-1 text-cyan-400" /> 15% Rain</span>
                    <span className="flex items-center"><Wind className="w-3 h-3 mr-1 text-slate-300" /> 10 km/h</span>
                  </div>
                </div>

                {/* Mustang Jomsom */}
                <div className="p-3.5 rounded-2xl bg-[#182238] border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Jomsom / Mustang</span>
                    <span className="text-cyan-400 font-bold">14°C</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">High Wind Advisory after 11 AM</p>
                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center"><CloudRain className="w-3 h-3 mr-1 text-cyan-400" /> 5% Rain</span>
                    <span className="flex items-center"><Wind className="w-3 h-3 mr-1 text-amber-400" /> 28 km/h</span>
                  </div>
                </div>

                {/* Muktinath */}
                <div className="p-3.5 rounded-2xl bg-[#182238] border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Muktinath (3,710m)</span>
                    <span className="text-indigo-400 font-bold">8°C</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Cold & Clear Mountain Air</p>
                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center"><CloudRain className="w-3 h-3 mr-1 text-cyan-400" /> 0% Snow</span>
                    <span className="flex items-center"><Wind className="w-3 h-3 mr-1 text-slate-300" /> 18 km/h</span>
                  </div>
                </div>
              </div>

              {/* Highway Advisory Alert */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-300 text-xs">Highway Travel Advisory</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">
                    Prithvi Highway (Kathmandu-Pokhara) is clear. Jomsom valley winds increase significantly after 11:00 AM. Early morning travel is recommended.
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-[#131C30] flex justify-end">
              <button
                type="button"
                onClick={() => setWeatherModalOpen(false)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs"
              >
                Close Weather Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
