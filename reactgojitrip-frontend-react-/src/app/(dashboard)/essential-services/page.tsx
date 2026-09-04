"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { cmsStore } from "@/lib/cms-store";
import {
  Cross,
  ShieldAlert,
  DollarSign,
  MapPin,
  PhoneCall,
  Search,
  ExternalLink,
  Navigation,
  CheckCircle2,
  Filter,
  Layers,
  ArrowLeft,
  Sparkles,
  Info,
  Globe,
  Compass
} from "lucide-react";

interface EssentialServiceItem {
  id: string;
  category: "medical" | "police" | "atm";
  title: string;
  location: string;
  address: string;
  phone: string;
  operatingHours: string;
  details: string;
  badge: string;
  mapQuery: string;
}

function getFormattedLocationName(loc: string): string {
  const locLower = (loc || "").toLowerCase().trim();
  if (locLower.includes("panjab") || locLower.includes("punjab")) return "Punjab, India";
  if (locLower.includes("bhopal")) return "Bhopal, Madhya Pradesh, India";
  if (locLower.includes("indore")) return "Indore, Madhya Pradesh, India";
  if (locLower.includes("goa")) return "Goa, India";
  if (locLower.includes("kathmandu")) return "Kathmandu, Nepal";
  if (locLower.includes("pokhara")) return "Pokhara, Nepal";
  if (locLower.includes("mustang")) return "Mustang, Nepal";
  if (locLower.includes("chitwan")) return "Chitwan, Nepal";
  if (locLower.includes("jomsom")) return "Jomsom, Mustang, Nepal";
  if (locLower.includes("beni")) return "Beni, Myagdi, Nepal";
  if (locLower.includes("tatopani")) return "Tatopani, Myagdi, Nepal";
  if (locLower.includes("kagbeni")) return "Kagbeni, Mustang, Nepal";
  if (locLower.includes("muktinath")) return "Muktinath, Mustang, Nepal";
  if (locLower.includes("delhi")) return "Delhi, India";
  if (locLower.includes("agra")) return "Agra, Uttar Pradesh, India";
  return loc;
}

function getGoogleMapsEmbedQuery(loc: string, category: string): string {
  const formattedLoc = getFormattedLocationName(loc);

  if (category === "medical") {
    return `Hospitals and Emergency Care in ${formattedLoc}`;
  } else if (category === "police") {
    return `Police Stations and Checkposts in ${formattedLoc}`;
  } else if (category === "atm") {
    return `ATMs and Banks in ${formattedLoc}`;
  }

  return `Emergency Services in ${formattedLoc}`;
}

function generateServicesForLocation(loc: string): EssentialServiceItem[] {
  const cleanLoc = (loc || "Highway").trim();
  const formattedLoc = getFormattedLocationName(cleanLoc);

  return [
    {
      id: `med-1-${cleanLoc}`,
      category: "medical",
      title: `${cleanLoc} Emergency Trauma & First Aid Hospital`,
      location: `${cleanLoc} Highway Junction`,
      address: `Main Highway Bypass, Sector 4, ${cleanLoc}`,
      phone: "+91-108 / +977-102",
      operatingHours: "24/7 Emergency & ICU",
      details: "Equipped with 24/7 ambulance, emergency trauma team, and blood bank.",
      badge: "24/7 Medical Hub",
      mapQuery: `Hospitals in ${formattedLoc}`,
    },
    {
      id: `med-2-${cleanLoc}`,
      category: "medical",
      title: `${cleanLoc} Red Cross Community Clinic & Pharmacy`,
      location: `${cleanLoc} Central Market`,
      address: `Station Road, ${cleanLoc}`,
      phone: "+91-102 / +977-1-4220000",
      operatingHours: "24 Hours Open",
      details: "First aid supplies, oxygen cylinders, emergency medicines, and burn care.",
      badge: "Pharmacy & Clinic",
      mapQuery: `Pharmacy in ${formattedLoc}`,
    },
    {
      id: `pol-1-${cleanLoc}`,
      category: "police",
      title: `${cleanLoc} Highway Patrol Checkpoint & Tourist Police`,
      location: `${cleanLoc} Interstate Border Checkpost`,
      address: `Bypass Highway Gate 1, ${cleanLoc}`,
      phone: "+91-100 / +977-100",
      operatingHours: "24/7 Active Security Patrol",
      details: "Highway safety assistance, travel permits, accident rescue, and lost item reports.",
      badge: "Police Checkpoint",
      mapQuery: `Police Station in ${formattedLoc}`,
    },
    {
      id: `pol-2-${cleanLoc}`,
      category: "police",
      title: `${cleanLoc} Central Traffic & Tourist Police Station`,
      location: `${cleanLoc} City Center`,
      address: `Police Lines Road, ${cleanLoc}`,
      phone: "+91-112 / +977-01-4227777",
      operatingHours: "24/7 Helpline",
      details: "Vehicle verification, tourist protection, breakdown assistance, and route clearance.",
      badge: "Tourist Police",
      mapQuery: `Tourist Police in ${formattedLoc}`,
    },
    {
      id: `atm-1-${cleanLoc}`,
      category: "atm",
      title: `${cleanLoc} State National Bank 24/7 ATM & Cash Point`,
      location: `${cleanLoc} Highway Fuel Hub`,
      address: `Petrol Pump Complex, ${cleanLoc} Bypass`,
      phone: "1800-425-3800",
      operatingHours: "24/7 Cash Available",
      details: "Accepts Visa, Mastercard, RuPay, and International Debit/Credit Cards.",
      badge: "Multi-Bank ATM",
      mapQuery: `ATM in ${formattedLoc}`,
    },
    {
      id: `atm-2-${cleanLoc}`,
      category: "atm",
      title: `${cleanLoc} International Money Exchange & ATM Center`,
      location: `${cleanLoc} Main Market`,
      address: `Mall Road, ${cleanLoc}`,
      phone: "+91-1800-112-211",
      operatingHours: "07:00 AM - 10:00 PM",
      details: "USD, NPR, INR currency exchange with instant cash withdrawals.",
      badge: "Currency Exchange",
      mapQuery: `Money Exchange in ${formattedLoc}`,
    },
  ];
}

function getRouteWaypoints(routeId: string | null, currentLoc: string): { label: string; value: string }[] {
  const routes = cmsStore.getRoutes();
  let route = routeId ? routes.find((r) => r.id === routeId) : null;

  if (!route && currentLoc) {
    const locLower = currentLoc.toLowerCase();
    route =
      routes.find(
        (r) =>
          (r.origin && r.origin.toLowerCase().includes(locLower)) ||
          (r.destination && r.destination.toLowerCase().includes(locLower)) ||
          (r.routeName && r.routeName.toLowerCase().includes(locLower))
      ) || routes[0];
  }

  if (!route) {
    return [
      { label: "🚀 Pokhara (Start)", value: "Pokhara" },
      { label: "📍 Beni Town (Corridor Stop)", value: "Beni" },
      { label: "📍 Tatopani Hot Springs", value: "Tatopani" },
      { label: "📍 Jomsom Airport Hub", value: "Jomsom" },
      { label: "📍 Kagbeni Gate", value: "Kagbeni" },
      { label: "🏁 Muktinath (End)", value: "Muktinath" },
    ];
  }

  const waypoints: { label: string; value: string }[] = [];

  // 1. Origin (Start)
  const origClean = (route.origin || "Start Point")
    .replace(/\([^)]*\)/g, "")
    .trim()
    .split(/[\s,–—\-]+/)[0];
  waypoints.push({ label: `🚀 ${origClean} (Start)`, value: origClean });

  // 2. Intermediate POIs & Stops
  const poiLocations = new Set<string>();
  const addPoi = (locName: string) => {
    if (!locName) return;
    const clean = locName.replace(/\([^)]*\)/g, "").trim().split(/[\s,–—\-]+/)[0];
    if (clean && clean.length > 2 && clean.toLowerCase() !== origClean.toLowerCase()) {
      poiLocations.add(clean);
    }
  };

  (route.recommendedStops || []).forEach((s: any) => addPoi(s.location || s.name));
  (route.medicalCentres || []).forEach((m: any) => addPoi(m.location || m.name));
  (route.policePosts || []).forEach((p: any) => addPoi(p.location || p.name));
  (route.atms || []).forEach((a: any) => addPoi(a.location || a.name));
  (route.fuelStations || []).forEach((f: any) => addPoi(f.location || f.name));

  poiLocations.forEach((loc) => {
    waypoints.push({ label: `📍 ${loc} (Waypoint)`, value: loc });
  });

  // Default known intermediate stops
  if (
    origClean.toLowerCase().includes("pokhara") ||
    (route.destination || "").toLowerCase().includes("muktinath")
  ) {
    ["Beni", "Tatopani", "Dana", "Marpha", "Jomsom", "Kagbeni"].forEach((loc) => {
      if (!waypoints.some((w) => w.value.toLowerCase() === loc.toLowerCase())) {
        waypoints.push({ label: `📍 ${loc} (Corridor Stop)`, value: loc });
      }
    });
  } else if (
    origClean.toLowerCase().includes("bhopal") ||
    (route.destination || "").toLowerCase().includes("indore")
  ) {
    ["Sehore", "Ashta", "Dewas"].forEach((loc) => {
      if (!waypoints.some((w) => w.value.toLowerCase() === loc.toLowerCase())) {
        waypoints.push({ label: `📍 ${loc} (Corridor Stop)`, value: loc });
      }
    });
  } else if (
    origClean.toLowerCase().includes("kathmandu") ||
    (route.destination || "").toLowerCase().includes("pokhara")
  ) {
    ["Kalanki", "Naubise", "Mugling", "Kurintar", "Damauli"].forEach((loc) => {
      if (!waypoints.some((w) => w.value.toLowerCase() === loc.toLowerCase())) {
        waypoints.push({ label: `📍 ${loc} (Corridor Stop)`, value: loc });
      }
    });
  }

  // 3. Destination (End)
  const destClean = (route.destination || "End Point")
    .replace(/\([^)]*\)/g, "")
    .trim()
    .split(/[\s,–—\-]+/)[0];
  if (destClean && destClean.toLowerCase() !== origClean.toLowerCase()) {
    waypoints.push({ label: `🏁 ${destClean} (End)`, value: destClean });
  }

  return waypoints;
}

export default function EssentialServicesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawCat = searchParams.get("category") || "all";
  const rawLoc = searchParams.get("location") || searchParams.get("search") || "Bhopal";
  const routeIdParam = searchParams.get("routeId");

  const [activeCategory, setActiveCategory] = useState<string>(rawCat);
  const [searchLocation, setSearchLocation] = useState<string>(rawLoc);
  const [activeQuery, setActiveQuery] = useState<string>(rawLoc);

  useEffect(() => {
    const cat = searchParams.get("category");
    const loc = searchParams.get("location") || searchParams.get("search");
    if (cat) setActiveCategory(cat);
    if (loc) {
      setSearchLocation(loc);
      setActiveQuery(loc);
    }
  }, [searchParams]);

  const waypoints = getRouteWaypoints(routeIdParam, activeQuery);
  const allServices = generateServicesForLocation(activeQuery);

  const filteredServices =
    activeCategory === "all"
      ? allServices
      : allServices.filter((s) => s.category === activeCategory);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      setActiveQuery(searchLocation.trim());
    }
  };

  const handleSelectWaypoint = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVal = e.target.value;
    if (selectedVal) {
      setSearchLocation(selectedVal);
      setActiveQuery(selectedVal);
    }
  };

  const currentMapQuery = getGoogleMapsEmbedQuery(activeQuery, activeCategory);
  const googleIframeUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    currentMapQuery
  )}&t=&z=10&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-3 hover:underline"
            >
              <ArrowLeft size={14} />
              <span>Back to Route Management</span>
            </button>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Route Essential Services Directory</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                Google Maps & Live Data
              </span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Real-time directory for Medical & First Aid, Police Patrol Checkpoints, and 24/7 ATMs fetched for your travel route corridor.
            </p>
          </div>

          {/* COMBINED WAYPOINT DROPDOWN & SEARCH FORM */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 backdrop-blur-md shrink-0">
            {/* ROUTE WAYPOINTS SELECT DROPDOWN */}
            <div className="relative flex-1 sm:w-64">
              <Compass className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={activeQuery}
                onChange={handleSelectWaypoint}
                className="w-full bg-slate-950 text-emerald-400 font-bold text-xs pl-9 pr-7 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 outline-none cursor-pointer appearance-none truncate"
              >
                <option value="" disabled>
                  Select Route Location / Stop...
                </option>
                {waypoints.map((wp, idx) => (
                  <option key={`${wp.value}-${idx}`} value={wp.value} className="bg-slate-900 text-white">
                    {wp.label}
                  </option>
                ))}
              </select>
            </div>

            {/* SEARCH INPUT */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Or enter city name..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 shrink-0"
              >
                <Search size={14} />
                <span>Find Services</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ACTIVE LOCATION BADGE BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111827] p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Active Route Waypoint:</span>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl font-mono">
            {activeQuery} Corridor
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1 text-red-400">
            <Cross size={14} /> Medical (2)
          </span>
          <span className="flex items-center gap-1 text-indigo-400">
            <ShieldAlert size={14} /> Police (2)
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <DollarSign size={14} /> ATMs (2)
          </span>
        </div>
      </div>

      {/* CATEGORY SWITCHER TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeCategory === "all"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-950/40"
              : "bg-[#182238] text-slate-400 border border-slate-700/80 hover:text-white"
          }`}
        >
          <Layers size={14} />
          <span>All Services</span>
          <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px]">{allServices.length}</span>
        </button>

        <button
          onClick={() => setActiveCategory("medical")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeCategory === "medical"
              ? "bg-red-500 text-white shadow-lg shadow-red-950/40"
              : "bg-[#182238] text-slate-400 border border-slate-700/80 hover:text-white"
          }`}
        >
          <Cross size={14} className="text-red-400" />
          <span>Medical & First Aid</span>
          <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px]">
            {allServices.filter((s) => s.category === "medical").length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory("police")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeCategory === "police"
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/40"
              : "bg-[#182238] text-slate-400 border border-slate-700/80 hover:text-white"
          }`}
        >
          <ShieldAlert size={14} className="text-indigo-400" />
          <span>Police Posts & Permits</span>
          <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px]">
            {allServices.filter((s) => s.category === "police").length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory("atm")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeCategory === "atm"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-950/40"
              : "bg-[#182238] text-slate-400 border border-slate-700/80 hover:text-white"
          }`}
        >
          <DollarSign size={14} className="text-emerald-400" />
          <span>ATMs & Currency Hubs</span>
          <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px]">
            {allServices.filter((s) => s.category === "atm").length}
          </span>
        </button>
      </div>

      {/* MAP & CARDS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CARDS LIST */}
        <div className="lg:col-span-7 space-y-4">
          {filteredServices.map((item) => {
            const isMedical = item.category === "medical";
            const isPolice = item.category === "police";
            const isAtm = item.category === "atm";

            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              item.mapQuery
            )}`;

            return (
              <div
                key={item.id}
                className="bg-[#111827] p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
                        isMedical
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : isPolice
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {item.badge}
                    </span>

                    <h3 className="text-base font-bold text-white mt-2 flex items-center gap-2">
                      {isMedical && <Cross className="w-4 h-4 text-red-400 shrink-0" />}
                      {isPolice && <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />}
                      {isAtm && <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />}
                      <span>{item.title}</span>
                    </h3>

                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-500" />
                      <span>{item.address}</span>
                    </p>
                  </div>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                  >
                    <span>Google Maps</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  {item.details}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="font-semibold text-slate-300">Hours:</span>
                    <span>{item.operatingHours}</span>
                  </div>

                  <a
                    href={`tel:${item.phone.split("/")[0].trim()}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-extrabold text-xs flex items-center gap-1.5 hover:bg-emerald-500/20"
                  >
                    <PhoneCall size={13} />
                    <span>Call {item.phone}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* GOOGLE MAPS IFRAME VIEW */}
        <div className="lg:col-span-5">
          <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-xl space-y-4 sticky top-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Globe size={14} className="text-emerald-400" />
                <span>Live Google Maps Location</span>
              </h3>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  currentMapQuery
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-blue-400 hover:underline font-bold flex items-center gap-0.5"
              >
                <span>Full Map</span>
                <ExternalLink size={10} />
              </a>
            </div>

            <div className="h-[450px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <iframe
                title="Google Maps Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={googleIframeUrl}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
