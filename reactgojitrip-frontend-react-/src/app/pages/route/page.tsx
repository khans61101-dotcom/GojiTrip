"use client";

import "@/styles/pages/route/route.css";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { SafeImage } from "@/components/common/SafeImage";
import { apiRequest, planRoute, type RouteSearchData, type RouteStop } from "@/lib/api";
import { cmsStore } from "@/lib/cms-store";
import type { RouteEntry, RoutePOI, EmergencyContact } from "@/types/cms";
import AddRouteModal from "@/components/common/AddRouteModal";
import {
  MapPin,
  Search,
  Star,
  Navigation,
  Clock,
  X,
  ChevronRight,
  Fuel,
  Zap,
  Stethoscope,
  ShieldAlert,
  CreditCard,
  Camera,
  Utensils,
  Hotel,
  Bus,
  Compass,
  Mountain,
  Phone,
  AlertTriangle,
  Route as RouteIcon,
  LocateFixed,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

/* ============================================================
   ACTION CATEGORIES
============================================================ */

type ActionCategory = {
  key: "hotels" | "restaurants" | "transport" | "places" | "fuel" | "famous-places";
  label: string;
  path: string;
  icon: React.ElementType;
};

const actionCategories: ActionCategory[] = [
  { key: "hotels", label: "Hotels", path: "/pages/hotels", icon: Hotel },
  { key: "restaurants", label: "Restaurants", path: "/pages/restaurants", icon: Utensils },
  { key: "transport", label: "Transport", path: "/pages/transport", icon: Bus },
  { key: "places", label: "Guides & Treks", path: "/pages/guides", icon: Compass },
  { key: "fuel", label: "Fuel & EV", path: "/pages/fuel-stations", icon: Fuel },
  { key: "famous-places", label: "Attractions", path: "/pages/famous-places", icon: Star },
];

/* ============================================================
   TIMELINE STOP TYPE
============================================================ */

type TimelineStop = RouteStop & {
  sequence: number;
  isSource: boolean;
  isDestination: boolean;
  isViaStop?: boolean;
  badgeLabel?: string;
  badgeBg?: string;
  color?: string;
  distanceKm?: string;
  travelTime?: string;
};

interface PlaceSuggestion {
  placeId: string;
  name: string;
  address: string;
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80";

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function RoutePage() {
  /* ----------------------------------------------------------
     STATE: DB ROUTES & SELECTION
  ---------------------------------------------------------- */
  const [dbRoutes, setDbRoutes] = useState<RouteEntry[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  /* ----------------------------------------------------------
     STATE: CUSTOM ROUTE SEARCH & TIMELINE
  ---------------------------------------------------------- */
  const [sourceSearch, setSourceSearch] = useState("");
  const [destSearch, setDestSearch] = useState("");
  const [sourceSuggestions, setSourceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  const [routeSearch, setRouteSearch] = useState<RouteSearchData | null>(null);
  const [apiStops, setApiStops] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [routeDistance, setRouteDistance] = useState<number | string | undefined>();
  const [routeDuration, setRouteDuration] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------------------------------------
     STATE: POI FILTER & ADD STOP MODAL
  ---------------------------------------------------------- */
  const [activePoiTab, setActivePoiTab] = useState<string>("all");
  const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);
  const [selectedStopName, setSelectedStopName] = useState("");
  const [nextStop, setNextStop] = useState<RouteStop | null>(null);

  /* ==========================================================
     LOAD DB ROUTES
  ========================================================== */
  const fetchDbRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const storeRoutes = cmsStore.getRoutes();

      const response = await apiRequest<RouteEntry[] | { data?: RouteEntry[] }>("/routes").catch(() => null);

      let fetched: RouteEntry[] = [];
      if (Array.isArray(response)) {
        fetched = response;
      } else if (response && Array.isArray((response as any).data)) {
        fetched = (response as any).data;
      }

      const combined = fetched.length > 0 ? fetched : storeRoutes;
      setDbRoutes(combined);

      if (combined.length > 0) {
        setSelectedRouteId((prev) => prev || combined[0].id);
      }
    } catch (err) {
      console.error("Fetch DB routes error:", err);
      const storeRoutes = cmsStore.getRoutes();
      setDbRoutes(storeRoutes);
      if (storeRoutes.length > 0) {
        setSelectedRouteId(storeRoutes[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDbRoutes();
  }, [fetchDbRoutes]);

  /* ==========================================================
     ACTIVE ROUTE ENTRY
  ========================================================== */
  const activeDbRoute = useMemo<RouteEntry | null>(() => {
    if (!selectedRouteId) return dbRoutes[0] || null;
    return dbRoutes.find((r) => r.id === selectedRouteId) || dbRoutes[0] || null;
  }, [dbRoutes, selectedRouteId]);

  /* ==========================================================
     TIMELINE STOPS COMPUTATION (DB ROUTE OR SEARCHED ROUTE)
  ========================================================== */
  const timelineStops = useMemo<TimelineStop[]>(() => {
    // 1. Custom Searched Route Timeline
    if (routeSearch) {
      const srcName = routeSearch.source?.name || "Origin";
      const dstName = routeSearch.destination?.name || "Destination";

      const sourceStop: TimelineStop = {
        id: "src-1",
        name: srcName,
        type: "source",
        subtitle: "Start your journey from here",
        address: (routeSearch.source as any)?.address || srcName,
        details: "Starting Point",
        sequence: 1,
        isSource: true,
        isDestination: false,
        badgeLabel: "START",
        color: "bg-blue-600",
        badgeBg: "bg-blue-50 text-blue-600",
        distanceKm: "0 km",
        travelTime: "0h 00m",
      };

      const destStop: TimelineStop = {
        id: "dst-1",
        name: dstName,
        type: "destination",
        subtitle: "Your final destination",
        address: (routeSearch.destination as any)?.address || dstName,
        details: "Final Destination",
        sequence: apiStops.length + 2,
        isSource: false,
        isDestination: true,
        badgeLabel: "DESTINATION",
        color: "bg-red-500",
        badgeBg: "bg-red-50 text-red-600",
        distanceKm: routeDistance ? `${routeDistance} km` : "End",
        travelTime: routeDuration || "End",
      };

      const intermediates: TimelineStop[] = apiStops.map((stop, idx) => ({
        ...stop,
        sequence: idx + 2,
        isSource: false,
        isDestination: false,
        badgeLabel: stop.type === "food" ? "FOOD STOP" : stop.type === "fuel" ? "FUEL STOP" : "RECOMMENDED STOP",
        color: stop.type === "food" ? "bg-orange-500" : stop.type === "fuel" ? "bg-yellow-500" : "bg-emerald-600",
        badgeBg: "bg-emerald-50 text-emerald-600",
        distanceKm: `~${((idx + 1) * 45).toFixed(0)} km`,
        travelTime: `~${(idx + 1) * 1.2}h`,
      }));

      return [sourceStop, ...intermediates, destStop];
    }

    // 2. DB Active Route Timeline
    if (activeDbRoute) {
      const srcName = activeDbRoute.origin || "Origin";
      const dstName = activeDbRoute.destination || "Destination";
      const totalKm = activeDbRoute.totalDistanceKm || 100;

      const stopsList: TimelineStop[] = [];

      // Start Stop
      stopsList.push({
        id: `db-src-${activeDbRoute.id}`,
        name: srcName,
        type: "source",
        subtitle: "Start your journey",
        address: `${srcName} Departure Point`,
        details: `Corridor start along ${activeDbRoute.routeName}. Road condition: ${activeDbRoute.roadCondition}.`,
        sequence: 1,
        isSource: true,
        isDestination: false,
        badgeLabel: "START",
        color: "bg-blue-600",
        badgeBg: "bg-blue-50 text-blue-600",
        distanceKm: "0 km",
        travelTime: "0h 00m",
      });

      // Intermediate Stops from Recommended & Viewpoints
      const rawIntermediates = [
        ...(activeDbRoute.recommendedStops || []),
        ...(activeDbRoute.viewpoints || []),
        ...(activeDbRoute.restaurants || []),
      ];

      if (rawIntermediates.length > 0) {
        rawIntermediates.forEach((poi, index) => {
          const stepKm = Math.round((totalKm / (rawIntermediates.length + 1)) * (index + 1));
          stopsList.push({
            id: poi.id || `poi-${index}`,
            name: poi.name || `Waypoint ${index + 1}`,
            type: poi.category === "Restaurant" ? "food" : poi.category === "Fuel Station" ? "fuel" : "rest",
            subtitle: poi.location || "Recommended highway stop",
            address: poi.details || poi.location || "Nepal Scenic Corridor",
            details: poi.details || `Key waypoint on ${activeDbRoute.routeName}.`,
            sequence: index + 2,
            isSource: false,
            isDestination: false,
            badgeLabel: poi.category === "Restaurant" ? "FOOD STOP" : poi.category === "Viewpoint" ? "VIEWPOINT" : "REST STOP",
            color: poi.category === "Restaurant" ? "bg-orange-500" : poi.category === "Viewpoint" ? "bg-purple-600" : "bg-emerald-600",
            badgeBg: "bg-emerald-50 text-emerald-600",
            distanceKm: `${stepKm} km`,
            travelTime: `~${Math.round(stepKm / 40)}h`,
          });
        });
      } else {
        // Fallback default waypoint if none in DB
        const midpointKm = Math.round(totalKm / 2);
        stopsList.push({
          id: `mid-${activeDbRoute.id}`,
          name: `${srcName} - ${dstName} Highway Hub`,
          type: "rest",
          subtitle: "Central Rest & Refreshment Stop",
          address: `Highway junction between ${srcName} and ${dstName}`,
          details: `Service hub featuring fuel stations, restaurants, and repair facilities.`,
          sequence: 2,
          isSource: false,
          isDestination: false,
          badgeLabel: "HIGHWAY HUB",
          color: "bg-emerald-600",
          badgeBg: "bg-emerald-50 text-emerald-600",
          distanceKm: `${midpointKm} km`,
          travelTime: `~${(midpointKm / 40).toFixed(1)}h`,
        });
      }

      // Final Destination Stop
      stopsList.push({
        id: `db-dst-${activeDbRoute.id}`,
        name: dstName,
        type: "destination",
        subtitle: "Final Destination",
        address: `${dstName} Arrival Terminal`,
        details: `Arrival point for ${activeDbRoute.routeName}. Total distance: ${totalKm} km.`,
        sequence: stopsList.length + 1,
        isSource: false,
        isDestination: true,
        badgeLabel: "DESTINATION",
        color: "bg-red-500",
        badgeBg: "bg-red-50 text-red-600",
        distanceKm: `${totalKm} km`,
        travelTime: activeDbRoute.estimatedTravelTime || "End",
      });

      return stopsList;
    }

    return [];
  }, [routeSearch, apiStops, routeDistance, routeDuration, activeDbRoute]);

  /* ==========================================================
     ALL POIS COMBINED FROM ACTIVE DB ROUTE
  ========================================================== */
  const allRoutePois = useMemo(() => {
    if (!activeDbRoute) return [];
    return [
      ...(activeDbRoute.fuelStations || []).map((p) => ({ ...p, catType: "fuel", catLabel: "Fuel Station", icon: Fuel, color: "text-yellow-500" })),
      ...(activeDbRoute.evChargingStations || []).map((p) => ({ ...p, catType: "ev", catLabel: "EV Station", icon: Zap, color: "text-emerald-500" })),
      ...(activeDbRoute.medicalCentres || []).map((p) => ({ ...p, catType: "medical", catLabel: "Medical Centre", icon: Stethoscope, color: "text-red-500" })),
      ...(activeDbRoute.policePosts || []).map((p) => ({ ...p, catType: "police", catLabel: "Police Checkpost", icon: ShieldAlert, color: "text-blue-500" })),
      ...(activeDbRoute.atms || []).map((p) => ({ ...p, catType: "atm", catLabel: "ATM", icon: CreditCard, color: "text-purple-500" })),
      ...(activeDbRoute.viewpoints || []).map((p) => ({ ...p, catType: "viewpoint", catLabel: "Viewpoint", icon: Camera, color: "text-indigo-500" })),
      ...(activeDbRoute.restaurants || []).map((p) => ({ ...p, catType: "restaurant", catLabel: "Restaurant", icon: Utensils, color: "text-orange-500" })),
      ...(activeDbRoute.touristAttractions || []).map((p) => ({ ...p, catType: "attraction", catLabel: "Attraction", icon: Mountain, color: "text-cyan-500" })),
    ];
  }, [activeDbRoute]);

  const filteredPois = useMemo(() => {
    if (activePoiTab === "all") return allRoutePois;
    return allRoutePois.filter((p) => p.catType === activePoiTab);
  }, [allRoutePois, activePoiTab]);

  /* ==========================================================
     SEARCH CUSTOM ROUTE HANDLER
  ========================================================== */
  const handleCustomSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceSearch.trim() || !destSearch.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const searchData: RouteSearchData = {
        source: { name: sourceSearch.trim(), placeId: "src-1", address: sourceSearch.trim(), latitude: 0, longitude: 0 },
        destination: { name: destSearch.trim(), placeId: "dst-1", address: destSearch.trim(), latitude: 0, longitude: 0 },
        date: new Date().toISOString().split("T")[0],
        travellers: 2,
      };

      setRouteSearch(searchData);

      const response = await planRoute(searchData).catch(() => null);
      if (response && Array.isArray(response.stops)) {
        setApiStops(response.stops);
        setRouteDistance(response.distance);
        setRouteDuration(response.duration);
      } else {
        setApiStops([]);
        setRouteDistance("Custom Route");
        setRouteDuration("Direct");
      }
    } catch (err) {
      console.error("Custom route error:", err);
      setError("Unable to calculate route for specified locations.");
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     SERVICE BUTTON CLICK HANDLER
  ========================================================== */
  const handleServiceClick = (stopName: string, categoryPath: string, catKey: string) => {
    const params = new URLSearchParams();
    params.set("location", stopName);
    params.set("routeStop", stopName);
    params.set("category", catKey);
    if (activeDbRoute) {
      params.set("source", activeDbRoute.origin);
      params.set("destination", activeDbRoute.destination);
    }
    window.location.href = `${categoryPath}?${params.toString()}`;
  };

  /* ==========================================================
     UI RENDER
  ========================================================== */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* =====================================================
          HEADER HERO & SEARCH BAR
      ===================================================== */}
      <section className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white pt-14 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ✨ REAL-TIME ROUTE INTELLIGENCE & HIGHWAY ANALYSIS
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Nepal Highway & Route Analysis
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Select any database route below or search custom locations to inspect live step-by-step stops, altitude profiles, emergency helplines, and connected services.
          </p>

          {/* SEARCH FORM */}
          <form onSubmit={handleCustomSearch} className="max-w-3xl mx-auto pt-4">
            <div className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/20 flex flex-col sm:flex-row items-center gap-3 text-slate-800">
              <div className="relative flex-1 w-full">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                <input
                  type="text"
                  placeholder="Starting point (e.g. Kathmandu, Pokhara)..."
                  value={sourceSearch}
                  onChange={(e) => setSourceSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="hidden sm:block text-slate-400 font-bold">➔</div>

              <div className="relative flex-1 w-full">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                <input
                  type="text"
                  placeholder="Destination (e.g. Muktinath, Chitwan)..."
                  value={destSearch}
                  onChange={(e) => setDestSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all whitespace-nowrap"
              >
                Analyze Custom Route
              </button>
            </div>
          </form>

          {/* DB ROUTE SELECTOR TABS */}
          {dbRoutes.length > 0 && (
            <div className="pt-6">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Available Database Routes ({dbRoutes.length}):
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
                {dbRoutes.map((r) => {
                  const isActive = !routeSearch && activeDbRoute?.id === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setRouteSearch(null);
                        setSelectedRouteId(r.id);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center space-x-1.5 ${
                        isActive
                          ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105"
                          : "bg-white/10 text-slate-200 border-white/15 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      <RouteIcon className="w-3.5 h-3.5" />
                      <span>{r.routeName || `${r.origin} → ${r.destination}`}</span>
                      <span className="text-[10px] opacity-75">({r.totalDistanceKm} km)</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          COMPLETE ROUTE ANALYSIS TIMELINE SECTION
      ===================================================== */}
      <section id="complete-route-analysis" className="max-w-5xl mx-auto px-4 -mt-10 relative z-10">
        {/* ROUTE HEADER SUMMARY CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-extrabold text-[10px] uppercase tracking-wider">
                  {routeSearch ? "Custom Searched Corridor" : "Verified Nepal Highway Corridor"}
                </span>
                {activeDbRoute?.roadCondition && (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider">
                    {activeDbRoute.roadCondition}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {routeSearch
                  ? `${routeSearch.source.name} ➔ ${routeSearch.destination.name}`
                  : activeDbRoute?.routeName || `${activeDbRoute?.origin} ➔ ${activeDbRoute?.destination}`}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/80 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Total Distance</div>
                <div className="text-sm font-extrabold text-slate-800">
                  {routeSearch ? (routeDistance ? `${routeDistance} km` : "N/A") : `${activeDbRoute?.totalDistanceKm || 0} km`}
                </div>
              </div>

              <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/80 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Estimated Duration</div>
                <div className="text-sm font-extrabold text-slate-800">
                  {routeSearch ? (routeDuration || "N/A") : activeDbRoute?.estimatedTravelTime || "N/A"}
                </div>
              </div>

              {activeDbRoute?.imageUrl && (
                <div className="w-16 h-12 rounded-xl overflow-hidden shadow-sm border border-slate-200 shrink-0">
                  <SafeImage src={activeDbRoute.imageUrl} fallbackSrc={DEFAULT_IMAGE} alt="Route" width={64} height={48} className="object-cover w-full h-full" />
                </div>
              )}
            </div>
          </div>

          {/* WEATHER SUMMARY */}
          {activeDbRoute?.weatherSummary && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start space-x-3 text-amber-900 text-xs">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Highway Weather & Travel Advisory: </span>
                <span>{activeDbRoute.weatherSummary}</span>
              </div>
            </div>
          )}

          {/* STEP-BY-STEP TIMELINE LIST */}
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <RouteIcon className="w-5 h-5 text-emerald-600" />
                <span>Step-by-Step Route Sequence</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {timelineStops.length} Waypoints Identified
              </span>
            </div>

            <div className="space-y-6">
              {timelineStops.map((stop) => (
                <div key={stop.id} className="flex gap-4 items-start group">
                  {/* Sequence Marker Circle */}
                  <div className={`w-9 h-9 rounded-full ${stop.color} text-white font-extrabold text-xs flex items-center justify-center shadow-md shrink-0 mt-1 ring-4 ring-white`}>
                    {stop.sequence < 10 ? `0${stop.sequence}` : stop.sequence}
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-400 transition-colors space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-extrabold text-base sm:text-lg text-slate-900">
                        {stop.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${stop.badgeBg}`}>
                          {stop.badgeLabel}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {stop.distanceKm} ({stop.travelTime})
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {stop.details || stop.subtitle || stop.address}
                    </p>

                    {/* QUICK ACTION CATEGORY BUTTONS FOR EACH STOP */}
                    <div className="pt-3 border-t border-slate-200/60 flex flex-wrap gap-2">
                      {actionCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <button
                            key={cat.key}
                            type="button"
                            onClick={() => handleServiceClick(stop.name, cat.path, cat.key)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all flex items-center space-x-1.5 shadow-sm"
                          >
                            <Icon className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* POI CATEGORY TABS & CARDS */}
        {allRoutePois.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 mb-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Points of Interest Along This Highway
                </h3>
                <p className="text-xs text-slate-500">
                  Fuel stations, EV chargers, emergency medical clinics, ATMs, and viewpoints.
                </p>
              </div>

              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-full">
                {filteredPois.length} Available POIs
              </span>
            </div>

            {/* POI Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActivePoiTab("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activePoiTab === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                All POIs ({allRoutePois.length})
              </button>
              <button
                type="button"
                onClick={() => setActivePoiTab("fuel")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activePoiTab === "fuel" ? "bg-yellow-500 text-white border-yellow-500" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                ⛽ Fuel ({allRoutePois.filter((p) => p.catType === "fuel").length})
              </button>
              <button
                type="button"
                onClick={() => setActivePoiTab("ev")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activePoiTab === "ev" ? "bg-emerald-500 text-white border-emerald-500" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                ⚡ EV Chargers ({allRoutePois.filter((p) => p.catType === "ev").length})
              </button>
              <button
                type="button"
                onClick={() => setActivePoiTab("medical")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activePoiTab === "medical" ? "bg-red-500 text-white border-red-500" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                🩺 Medical ({allRoutePois.filter((p) => p.catType === "medical").length})
              </button>
              <button
                type="button"
                onClick={() => setActivePoiTab("police")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activePoiTab === "police" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                👮 Police ({allRoutePois.filter((p) => p.catType === "police").length})
              </button>
              <button
                type="button"
                onClick={() => setActivePoiTab("atm")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activePoiTab === "atm" ? "bg-purple-600 text-white border-purple-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                💳 ATMs ({allRoutePois.filter((p) => p.catType === "atm").length})
              </button>
            </div>

            {/* POI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPois.map((poi, idx) => {
                const Icon = poi.icon;
                return (
                  <div key={idx} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 transition-all flex items-start space-x-3">
                    <div className={`w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm ${poi.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                          {poi.catLabel}
                        </span>
                      </div>
                      <h5 className="font-extrabold text-sm text-slate-900 truncate mt-0.5">
                        {poi.name}
                      </h5>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        📍 {poi.location}
                      </p>
                      {poi.contactNumber && (
                        <a
                          href={`tel:${poi.contactNumber}`}
                          className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-600 hover:underline mt-2"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{poi.contactNumber}</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EMERGENCY CONTACTS BOX */}
        {activeDbRoute?.emergencyContacts && activeDbRoute.emergencyContacts.length > 0 && (
          <div className="bg-red-50/80 border border-red-200 rounded-3xl p-6 shadow-md mb-8">
            <div className="flex items-center space-x-2 text-red-700 font-extrabold text-base mb-3">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <span>Highway Emergency & Police Helplines</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeDbRoute.emergencyContacts.map((contact, idx) => (
                <div key={idx} className="bg-white p-3.5 rounded-2xl border border-red-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{contact.title}</div>
                    <div className="text-[10px] text-slate-500">{contact.location}</div>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1 hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{contact.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
