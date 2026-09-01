"use client";

import "@/styles/pages/route/route.css";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SafeImage } from "@/components/common/SafeImage";
import { InteractiveMap, type MapMarkerItem } from "@/components/common/InteractiveMap";
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
  Plus,
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
  ArrowLeft,
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
  const navigate = useNavigate();
  /* ----------------------------------------------------------
     STATE: DB ROUTES & SELECTION
  ---------------------------------------------------------- */
  const [dbRoutes, setDbRoutes] = useState<RouteEntry[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedMapMarkerId, setSelectedMapMarkerId] = useState<string | null>(null);

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
     STATE: SESSION ROUTE EXTENSIONS (USER-ADDED EXTENDED STOPS)
  ---------------------------------------------------------- */
  interface SessionExtension {
    id: string;
    name: string;
    distKm: number;
    addedAt: string;
  }
  const [routeExtensions, setRouteExtensions] = useState<SessionExtension[]>([]);
  const [newExtensionInput, setNewExtensionInput] = useState("");

  /* Reset extensions when route or search changes */
  useEffect(() => {
    setRouteExtensions([]);
  }, [selectedRouteId, routeSearch]);

  const handleAddExtension = (e?: React.FormEvent, customName?: string, customKm?: number) => {
    if (e) e.preventDefault();
    const nameToAdd = (customName || newExtensionInput).trim();
    if (!nameToAdd) return;

    if (routeExtensions.some((ext) => ext.name.toLowerCase() === nameToAdd.toLowerCase())) {
      setNewExtensionInput("");
      return;
    }

    const dist = customKm || Math.floor(Math.random() * 30) + 45;
    const newExt: SessionExtension = {
      id: `ext-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: nameToAdd,
      distKm: dist,
      addedAt: new Date().toISOString(),
    };

    setRouteExtensions((prev) => [...prev, newExt]);
    setNewExtensionInput("");
  };

  const handleRemoveExtension = (idToRemove: string) => {
    setRouteExtensions((prev) => prev.filter((e) => e.id !== idToRemove));
  };

  /* ----------------------------------------------------------
     STATE: POI FILTER & SEARCH PARAMS
  ---------------------------------------------------------- */
  const [activePoiTab, setActivePoiTab] = useState<string>("all");
  const [searchParams] = useSearchParams();

  /* ==========================================================
     LOAD DB ROUTES & AUTO-POPULATE SEARCH FROM URL PARAMS
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

      const combinedRaw = [...storeRoutes, ...fetched];
      const seenKeys = new Set<string>();
      const uniqueRoutes: RouteEntry[] = [];

      for (const r of combinedRaw) {
        const key = String(r.id || r.routeName || `${r.origin}-${r.destination}`).toLowerCase().trim();
        if (key && !seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueRoutes.push(r);
        }
      }

      setDbRoutes(uniqueRoutes);

      if (uniqueRoutes.length > 0) {
        setSelectedRouteId((prev) => prev || uniqueRoutes[0].id);
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

  // Read URL search params from Hero component redirect or Card clicks
  useEffect(() => {
    const idParam = searchParams.get("id") || searchParams.get("routeId") || searchParams.get("selectedId");
    const nameParam = searchParams.get("name") || searchParams.get("title");
    const srcParam = searchParams.get("source") || searchParams.get("origin") || searchParams.get("from");
    const dstParam = searchParams.get("destination") || searchParams.get("to");

    if (dbRoutes.length > 0) {
      let matched: RouteEntry | undefined;

      if (idParam) {
        matched = dbRoutes.find((r) => String(r.id) === String(idParam));
      }

      if (!matched && nameParam) {
        const lowerName = nameParam.toLowerCase();
        matched = dbRoutes.find((r) =>
          r.routeName.toLowerCase().includes(lowerName) ||
          lowerName.includes(r.routeName.toLowerCase()) ||
          `${r.origin} to ${r.destination}`.toLowerCase().includes(lowerName)
        );
      }

      if (!matched && (srcParam || dstParam)) {
        const srcLower = (srcParam || "").toLowerCase();
        const dstLower = (dstParam || "").toLowerCase();
        matched = dbRoutes.find((r) =>
          (srcLower && (r.origin.toLowerCase().includes(srcLower) || r.routeName.toLowerCase().includes(srcLower))) ||
          (dstLower && (r.destination.toLowerCase().includes(dstLower) || r.routeName.toLowerCase().includes(dstLower)))
        );
      }

      if (matched) {
        setSelectedRouteId(matched.id);
        setRouteSearch(null);
      } else if (srcParam || dstParam) {
        if (srcParam) setSourceSearch(srcParam);
        if (dstParam) setDestSearch(dstParam);

        const srcName = srcParam || "Kathmandu";
        const dstName = dstParam || "Pokhara";

        const searchData: RouteSearchData = {
          source: { name: srcName, placeId: "src-1", address: srcName, latitude: 0, longitude: 0 },
          destination: { name: dstName, placeId: "dst-1", address: dstName, latitude: 0, longitude: 0 },
          date: searchParams.get("date") || new Date().toISOString().split("T")[0],
          travellers: Number(searchParams.get("travellers")) || 1,
        };
        setRouteSearch(searchData);
      }
    }
  }, [searchParams, dbRoutes]);

  /* ==========================================================
     ACTIVE ROUTE ENTRY
  ========================================================== */
  const activeDbRoute = useMemo<RouteEntry | null>(() => {
    if (!selectedRouteId) return dbRoutes[0] || null;
    return dbRoutes.find((r) => r.id === selectedRouteId) || dbRoutes[0] || null;
  }, [dbRoutes, selectedRouteId]);

/* ==========================================================
   ROUTE CORRIDOR INTERMEDIATE LOCATIONS DATABASE
========================================================== */
const ROUTE_CORRIDOR_INTERMEDIATES: Record<string, Array<{ name: string; type: string; details: string; distPct: number }>> = {
  "bhopal-indore": [
    { name: "Sehore", type: "rest", details: "Sehore Highway Junction & Refreshment Rest Stop", distPct: 0.2 },
    { name: "Ashta", type: "food", details: "Ashta Highway Service Hub & Food Restaurants", distPct: 0.4 },
    { name: "Sonkatch", type: "fuel", details: "Sonkatch Fuel & Travel Service Point", distPct: 0.65 },
    { name: "Dewas", type: "place", details: "Dewas Hilltop Temple & Highway Bypass Hub", distPct: 0.8 },
  ],
  "punjab-goa": [
    { name: "Ludhiana & Chandigarh", type: "rest", details: "Punjab Central Transport & Highway Hub", distPct: 0.1 },
    { name: "Delhi NCR Corridor", type: "rest", details: "Capital Highway Transit Corridor", distPct: 0.25 },
    { name: "Jaipur Highway Hub", type: "place", details: "Rajasthan Heritage Waypoint & Tourist Stop", distPct: 0.4 },
    { name: "Udaipur Lake Corridor", type: "place", details: "Scenic Lake City Travel Stop", distPct: 0.55 },
    { name: "Ahmedabad Express Hub", type: "fuel", details: "Gujarat Expressway Fuel & Rest Stop", distPct: 0.7 },
    { name: "Mumbai-Pune Expressway", type: "rest", details: "Coastal Highway Transit Stop", distPct: 0.85 },
  ],
  "kathmandu-pokhara": [
    { name: "Naubise Junction", type: "rest", details: "Kathmandu Valley Exit & Highway Hub", distPct: 0.15 },
    { name: "Malekhu", type: "food", details: "Malekhu Riverside Fish & Refreshment Stop", distPct: 0.35 },
    { name: "Mugling Junction", type: "rest", details: "Trishuli River Bridge Highway Hub", distPct: 0.55 },
    { name: "Dumre / Bandipur", type: "place", details: "Bandipur Hillside Heritage & Viewpoint Stop", distPct: 0.7 },
    { name: "Damauli Town", type: "fuel", details: "Tanahun Service & Fuel Station Stop", distPct: 0.85 },
  ],
  "kathmandu-chitwan": [
    { name: "Naubise Junction", type: "rest", details: "Highway Transit Point", distPct: 0.15 },
    { name: "Malekhu", type: "food", details: "Refreshment & Food Stop", distPct: 0.35 },
    { name: "Mugling Junction", type: "rest", details: "Trishuli Junction", distPct: 0.55 },
    { name: "Kurintar / Manakamana", type: "place", details: "Manakamana Cable Car & Pilgrimage Hub", distPct: 0.7 },
    { name: "Bharatpur Gateway", type: "fuel", details: "Chitwan Entrance Fuel & Service Hub", distPct: 0.88 },
  ],
  "pokhara-muktinath": [
    { name: "Kusma", type: "place", details: "Suspension Bridge & Adventure Hub", distPct: 0.3 },
    { name: "Beni", type: "rest", details: "Myagdi River Junction & Mustang Gateway", distPct: 0.45 },
    { name: "Tatopani", type: "place", details: "Natural Hot Springs Rest Stop", distPct: 0.6 },
    { name: "Ghasa", type: "rest", details: "Mustang Checkpost & Pine Forest Corridor", distPct: 0.75 },
    { name: "Jomsom", type: "place", details: "Apple Orchards & Mountain Airport Hub", distPct: 0.88 },
    { name: "Kagbeni", type: "place", details: "Sacred River Confluence & Ancient Village", distPct: 0.95 },
  ],
  "delhi-jaipur": [
    { name: "Gurgaon / Manesar", type: "rest", details: "Millennium City Corridor", distPct: 0.15 },
    { name: "Dharuhera", type: "fuel", details: "Highway Fuel & Fast Charger Station", distPct: 0.3 },
    { name: "Neemrana", type: "place", details: "Neemrana Fort Heritage Stop", distPct: 0.5 },
    { name: "Kotputli", type: "rest", details: "Kotputli Highway Junction", distPct: 0.7 },
    { name: "Shahpura", type: "food", details: "Shahpura Food Court & Rest Area", distPct: 0.85 },
  ],
};

  /* ==========================================================
     TIMELINE STOPS COMPUTATION (DB ROUTE OR SEARCHED ROUTE)
  ========================================================== */
  const timelineStops = useMemo<TimelineStop[]>(() => {
    // 1. Custom Searched Route Timeline
    if (routeSearch) {
      const srcName = routeSearch.source?.name || "Origin";
      const dstName = routeSearch.destination?.name || "Destination";

      const key = `${srcName.toLowerCase()}-${dstName.toLowerCase()}`;
      const revKey = `${dstName.toLowerCase()}-${srcName.toLowerCase()}`;
      const preMapped = ROUTE_CORRIDOR_INTERMEDIATES[key] || ROUTE_CORRIDOR_INTERMEDIATES[revKey];

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
        sequence: (preMapped?.length || apiStops.length) + 2,
        isSource: false,
        isDestination: true,
        badgeLabel: "DESTINATION",
        color: "bg-red-500",
        badgeBg: "bg-red-50 text-red-600",
        distanceKm: routeDistance ? `${routeDistance} km` : "End",
        travelTime: routeDuration || "End",
      };

      if (preMapped && preMapped.length > 0) {
        const totalKmVal = parseFloat(String(routeDistance || "200")) || 200;
        const intermediates: TimelineStop[] = preMapped.map((item, idx) => {
          const stepKm = Math.round(totalKmVal * item.distPct);
          return {
            id: `searched-mid-${idx}`,
            name: item.name,
            type: item.type as any,
            subtitle: `Intermediate Corridor Stop`,
            address: `${item.name} Highway Station`,
            details: `${item.details}. Click below to explore local hotels, restaurants & attractions.`,
            sequence: idx + 2,
            isSource: false,
            isDestination: false,
            badgeLabel: item.type === "food" ? "FOOD STOP" : item.type === "fuel" ? "FUEL STOP" : item.type === "place" ? "ATTRACTION" : "HIGHWAY HUB",
            color: item.type === "food" ? "bg-orange-500" : item.type === "fuel" ? "bg-amber-500" : item.type === "place" ? "bg-purple-600" : "bg-emerald-600",
            badgeBg: "bg-emerald-50 text-emerald-600",
            distanceKm: `~${stepKm} km`,
            travelTime: `~${(stepKm / 45).toFixed(1)}h`,
          };
        });
        return [sourceStop, ...intermediates, destStop];
      }

      const intermediates: TimelineStop[] = apiStops.map((stop, idx) => ({
        ...stop,
        sequence: idx + 2,
        isSource: false,
        isDestination: false,
        badgeLabel: stop.type === "food" ? "FOOD STOP" : stop.type === "fuel" ? "FUEL STOP" : "RECOMMENDED STOP",
        color: stop.type === "food" ? "bg-orange-500" : stop.type === "fuel" ? "bg-amber-500" : "bg-emerald-600",
        badgeBg: "bg-emerald-50 text-emerald-600",
        distanceKm: `~${((idx + 1) * 45).toFixed(0)} km`,
        travelTime: `~${(idx + 1) * 1.2}h`,
      }));

      return [sourceStop, ...intermediates, destStop];
    }

    // 2. DB Active Route Timeline with Full Corridor Intermediate Locations
    if (activeDbRoute) {
      const srcName = activeDbRoute.origin || "Origin";
      const dstName = activeDbRoute.destination || "Destination";
      const totalKm = activeDbRoute.totalDistanceKm || 200;

      const key = `${srcName.toLowerCase()}-${dstName.toLowerCase()}`;
      const revKey = `${dstName.toLowerCase()}-${srcName.toLowerCase()}`;

      let corridorIntermediates = ROUTE_CORRIDOR_INTERMEDIATES[key] || ROUTE_CORRIDOR_INTERMEDIATES[revKey];

      if (!corridorIntermediates || corridorIntermediates.length === 0) {
        const rawIntermediates = [
          ...(activeDbRoute.recommendedStops || []),
          ...(activeDbRoute.viewpoints || []),
          ...(activeDbRoute.restaurants || []),
        ];

        if (rawIntermediates.length > 0) {
          corridorIntermediates = rawIntermediates.map((poi, idx) => ({
            name: poi.name || `Waypoint ${idx + 1}`,
            type: poi.category === "Restaurant" ? "food" : poi.category === "Fuel Station" ? "fuel" : "rest",
            details: poi.details || poi.location || `Key waypoint on ${activeDbRoute.routeName}.`,
            distPct: (idx + 1) / (rawIntermediates.length + 1),
          }));
        } else {
          corridorIntermediates = [
            {
              name: `${srcName} - ${dstName} Highway Hub`,
              type: "rest",
              details: `Service hub featuring fuel stations, restaurants, and repair facilities.`,
              distPct: 0.5,
            },
          ];
        }
      }

      const stopsList: TimelineStop[] = [];

      // Start Stop
      stopsList.push({
        id: `db-src-${activeDbRoute.id}`,
        name: srcName,
        type: "source",
        subtitle: "Start your journey",
        address: `${srcName} Departure Point`,
        details: `Corridor start along ${activeDbRoute.routeName}. Road condition: ${activeDbRoute.roadCondition || "Smooth Asphalt"}.`,
        sequence: 1,
        isSource: true,
        isDestination: false,
        badgeLabel: "START",
        color: "bg-blue-600",
        badgeBg: "bg-blue-50 text-blue-600",
        distanceKm: "0 km",
        travelTime: "0h 00m",
      });

      // Intermediate Corridor Stops
      corridorIntermediates.forEach((item, index) => {
        const stepKm = Math.round(totalKm * item.distPct);
        const hours = (stepKm / 45).toFixed(1);

        stopsList.push({
          id: `db-mid-${index}-${activeDbRoute.id}`,
          name: item.name,
          type: item.type as any,
          subtitle: `Intermediate Waypoint on ${activeDbRoute.routeName}`,
          address: `${item.name} Highway Corridor`,
          details: `${item.details}. Available services: Hotels, Restaurants, Fuel & EV Stations, and Local Attractions.`,
          sequence: index + 2,
          isSource: false,
          isDestination: false,
          badgeLabel: item.type === "food" ? "FOOD STOP" : item.type === "fuel" ? "FUEL STOP" : item.type === "place" ? "ATTRACTION" : "HIGHWAY HUB",
          color: item.type === "food" ? "bg-orange-500" : item.type === "fuel" ? "bg-amber-500" : item.type === "place" ? "bg-purple-600" : "bg-emerald-600",
          badgeBg: "bg-emerald-50 text-emerald-600",
          distanceKm: `${stepKm} km`,
          travelTime: `~${hours}h`,
        });
      });

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

      // Appending Session Route Extensions if any!
      if (routeExtensions.length > 0) {
        const origDstIndex = stopsList.length - 1;
        let baseKm = totalKm;
        if (origDstIndex >= 0) {
          stopsList[origDstIndex] = {
            ...stopsList[origDstIndex],
            isDestination: false,
            badgeLabel: "CORRIDOR WAYPOINT",
            color: "bg-emerald-600",
            badgeBg: "bg-emerald-50 text-emerald-600",
            subtitle: "Original Corridor Destination",
            details: `${stopsList[origDstIndex].name} (Original Corridor Terminal). Extended further to custom session stops below.`,
          };
          baseKm = parseFloat(String(stopsList[origDstIndex].distanceKm).replace(/[^0-9.]/g, "")) || totalKm;
        }

        let cumKm = baseKm;
        routeExtensions.forEach((ext, extIdx) => {
          cumKm += ext.distKm;
          const isFinalExt = extIdx === routeExtensions.length - 1;
          const hours = (cumKm / 45).toFixed(1);

          stopsList.push({
            id: ext.id,
            name: ext.name,
            type: "destination",
            subtitle: isFinalExt ? "Session Extended Destination" : `Extended Stop #${extIdx + 1}`,
            address: `${ext.name} (Custom Session Stop)`,
            details: `Custom user extension beyond original route. (Session plan only - Not saved to database).`,
            sequence: stopsList.length + 1,
            isSource: false,
            isDestination: isFinalExt,
            badgeLabel: isFinalExt ? "SESSION DESTINATION" : `EXTENDED STOP #${extIdx + 1}`,
            color: isFinalExt ? "bg-purple-600" : "bg-indigo-600",
            badgeBg: isFinalExt ? "bg-purple-50 text-purple-600" : "bg-indigo-50 text-indigo-600",
            distanceKm: `${cumKm} km`,
            travelTime: `~${hours}h`,
            isExtension: true,
          } as any);
        });
      }

      return stopsList;
    }

    return [];
  }, [routeSearch, apiStops, routeDistance, routeDuration, activeDbRoute, routeExtensions]);

  /* ==========================================================
     MAP MARKER ITEMS FROM TIMELINE STOPS
  ========================================================== */
  const mapItems = useMemo<MapMarkerItem[]>(() => {
    return timelineStops.map((stop, idx) => ({
      id: String(stop.id || `stop-${idx}`),
      name: stop.name,
      location: stop.address || stop.subtitle || stop.name,
      priceTag: stop.badgeLabel || `#${stop.sequence}`,
      category: stop.isSource ? "transport" : stop.isDestination ? "hotel" : "place",
      lat: (stop as any).lat || (stop as any).latitude,
      lng: (stop as any).lng || (stop as any).longitude,
    }));
  }, [timelineStops]);

  /* ==========================================================
     EXTENSION CALCULATIONS (CURRENT DESTINATION & SUGGESTIONS)
  ========================================================== */
  const currentDestinationName = useMemo(() => {
    if (routeExtensions.length > 0) {
      return routeExtensions[routeExtensions.length - 1].name;
    }
    if (routeSearch) return routeSearch.destination.name;
    return activeDbRoute?.destination || "Destination";
  }, [routeExtensions, routeSearch, activeDbRoute]);

  const activeTotalDistance = useMemo(() => {
    if (timelineStops.length > 0) {
      const last = timelineStops[timelineStops.length - 1];
      return last?.distanceKm || `${activeDbRoute?.totalDistanceKm || 0} km`;
    }
    return `${activeDbRoute?.totalDistanceKm || 0} km`;
  }, [timelineStops, activeDbRoute]);

  const activeTotalDuration = useMemo(() => {
    if (timelineStops.length > 0) {
      const last = timelineStops[timelineStops.length - 1];
      return last?.travelTime || activeDbRoute?.estimatedTravelTime || "N/A";
    }
    return activeDbRoute?.estimatedTravelTime || "N/A";
  }, [timelineStops, activeDbRoute]);

  const extensionSuggestions = useMemo(() => {
    const nameLower = currentDestinationName.toLowerCase();
    if (nameLower.includes("indore")) {
      return [
        { name: "Ujjain", distKm: 55 },
        { name: "Omkareshwar", distKm: 77 },
        { name: "Ratlam", distKm: 135 },
        { name: "Mandav", distKm: 95 },
      ];
    }
    if (nameLower.includes("pokhara")) {
      return [
        { name: "Muktinath", distKm: 170 },
        { name: "Chitwan", distKm: 145 },
        { name: "Bandipur", distKm: 75 },
        { name: "Jomsom", distKm: 155 },
      ];
    }
    if (nameLower.includes("kathmandu")) {
      return [
        { name: "Nagarkot", distKm: 32 },
        { name: "Bhaktapur", distKm: 15 },
        { name: "Pokhara", distKm: 200 },
        { name: "Chitwan", distKm: 170 },
      ];
    }
    if (nameLower.includes("goa")) {
      return [
        { name: "Gokarna", distKm: 140 },
        { name: "Dudhsagar Waterfalls", distKm: 45 },
        { name: "Karwar", distKm: 65 },
      ];
    }
    if (nameLower.includes("jaipur")) {
      return [
        { name: "Ajmer & Pushkar", distKm: 135 },
        { name: "Udaipur", distKm: 390 },
        { name: "Jodhpur", distKm: 330 },
      ];
    }
    return [
      { name: `${currentDestinationName} North Bypass`, distKm: 25 },
      { name: `${currentDestinationName} Scenic Viewpoint`, distKm: 40 },
    ];
  }, [currentDestinationName]);

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
      <section className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white pt-8 pb-20 px-4">
        {/* TOP LEFT BACK BUTTON */}
        <div className="max-w-7xl mx-auto flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all shadow-md backdrop-blur-md hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span>← Back</span>
          </button>
        </div>

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

          {/* SCALABLE DB ROUTE SELECTOR FOR 1 TO 100+ ROUTES */}
          {dbRoutes.length > 0 && (
            <div className="pt-6 max-w-4xl mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2 text-xs font-bold text-slate-300">
                <div className="flex items-center space-x-2">
                  <RouteIcon className="w-4 h-4 text-emerald-400" />
                  <span>Available Database Corridors ({dbRoutes.length})</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Select corridor from dropdown or scroll quick pills
                </div>
              </div>

              {/* DROPDOWN SELECT MENU FOR EASY NAVIGATION OF MULTIPLE ROUTES */}
              <div className="relative max-w-md mx-auto">
                <select
                  value={routeSearch ? "" : activeDbRoute?.id || ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      setRouteSearch(null);
                      setSelectedRouteId(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer shadow-lg backdrop-blur-md"
                >
                  {routeSearch && <option value="" disabled className="bg-slate-900 text-white">-- Custom Search Active --</option>}
                  {dbRoutes.map((r, i) => (
                    <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                      #{i + 1} {r.routeName || `${r.origin} → ${r.destination}`} ({r.totalDistanceKm} km - {r.roadCondition})
                    </option>
                  ))}
                </select>
              </div>

              {/* HORIZONTAL SCROLLING QUICK SWITCH PILLS WITH NAVIGATION BUTTONS */}
              <div className="relative flex items-center group">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("db-route-pills-container");
                    if (el) el.scrollBy({ left: -200, behavior: "smooth" });
                  }}
                  className="hidden sm:flex shrink-0 w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white items-center justify-center text-xs shadow-md mr-1 transition-all"
                  aria-label="Scroll left"
                >
                  ‹
                </button>

                <div
                  id="db-route-pills-container"
                  className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1 px-1 scrollbar-none scroll-smooth w-full"
                >
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
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center space-x-1.5 shrink-0 ${
                          isActive
                            ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105"
                            : "bg-white/10 text-slate-200 border-white/15 hover:bg-white/20 hover:text-white"
                        }`}
                      >
                        <RouteIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{r.routeName || `${r.origin} → ${r.destination}`}</span>
                        <span className="text-[10px] opacity-75">({r.totalDistanceKm} km)</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("db-route-pills-container");
                    if (el) el.scrollBy({ left: 200, behavior: "smooth" });
                  }}
                  className="hidden sm:flex shrink-0 w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white items-center justify-center text-xs shadow-md ml-1 transition-all"
                  aria-label="Scroll right"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          SPLIT LAYOUT: LEFT ROUTE DETAILS & RIGHT INTERACTIVE MAP
      ===================================================== */}
      <section id="complete-route-analysis" className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: ROUTE HEADER SUMMARY, TIMELINE STOPS, POIS & HELPLINES */}
          <div className="lg:col-span-7 space-y-6">
            {/* ROUTE HEADER SUMMARY CARD */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
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
                      ? `${routeSearch.source.name} ➔ ${currentDestinationName}`
                      : `${activeDbRoute?.origin || "Origin"} ➔ ${currentDestinationName}`}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/80 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Total Distance</div>
                    <div className="text-sm font-extrabold text-emerald-600">
                      {activeTotalDistance}
                    </div>
                  </div>

                  <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/80 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Estimated Duration</div>
                    <div className="text-sm font-extrabold text-slate-800">
                      {activeTotalDuration}
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
                            {(stop as any).isExtension && (
                              <button
                                type="button"
                                onClick={() => handleRemoveExtension(stop.id)}
                                className="px-2 py-0.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] flex items-center space-x-1 border border-red-200 transition-colors mr-1 shadow-sm"
                                title="Remove custom extension stop"
                              >
                                <X className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            )}
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

                {/* ========================================================
                    INTERACTIVE ROUTE EXTENSION PANEL (SESSION ONLY)
                ======================================================== */}
                <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-xl space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shrink-0">
                        <Navigation className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center space-x-1.5">
                          <span>Extend Route Beyond {currentDestinationName}</span>
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        </h4>
                        <p className="text-[11px] text-slate-300">
                          Want to travel further past <strong className="text-emerald-400 font-bold">{currentDestinationName}</strong>? Add your next stop to extend your trip route.
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] uppercase tracking-wider shrink-0">
                      🔒 Session Extension (Not saved in DB)
                    </span>
                  </div>

                  {/* INPUT & BUTTON */}
                  <form onSubmit={handleAddExtension} className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <MapPin className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={newExtensionInput}
                        onChange={(e) => setNewExtensionInput(e.target.value)}
                        placeholder={`Type next destination beyond ${currentDestinationName} (e.g. Ujjain, Ratlam, Muktinath...)`}
                        className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!newExtensionInput.trim()}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 shrink-0 shadow-lg shadow-indigo-600/30 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Extend Route</span>
                    </button>
                  </form>

                  {/* QUICK SUGGESTIONS CHIPS */}
                  {extensionSuggestions.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                        <Compass className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Quick Suggested Extension Destinations from {currentDestinationName}:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {extensionSuggestions.map((sugg) => (
                          <button
                            key={sugg.name}
                            type="button"
                            onClick={() => handleAddExtension(undefined, sugg.name, sugg.distKm)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1 shadow-sm cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-emerald-400" />
                            <span>{sugg.name}</span>
                            <span className="text-[10px] text-indigo-400 font-semibold">(+{sugg.distKm} km)</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {routeExtensions.length > 0 && (
                    <div className="pt-2 flex items-center justify-between text-xs text-indigo-300 font-semibold border-t border-slate-800">
                      <span>{routeExtensions.length} Custom Extension Stop(s) Active in Session</span>
                      <button
                        type="button"
                        onClick={() => setRouteExtensions([])}
                        className="text-red-400 hover:text-red-300 font-bold text-[11px] underline cursor-pointer"
                      >
                        Reset Extensions
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* POI CATEGORY TABS & CARDS */}
            {allRoutePois.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="bg-red-50/80 border border-red-200 rounded-3xl p-6 shadow-md">
                <div className="flex items-center space-x-2 text-red-700 font-extrabold text-base mb-3">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <span>Highway Emergency & Police Helplines</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>

          {/* RIGHT COLUMN: STICKY INTERACTIVE MAP WITH ROUTE POLYLINE */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Interactive Route Map</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {timelineStops.length} Waypoints Connected Along Corridor
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-extrabold text-[11px] rounded-full">
                  Live Map View
                </span>
              </div>

              {/* Leaflet Map Canvas Box */}
              <div className="w-full h-[540px] rounded-2xl overflow-hidden shadow-inner border border-slate-200 relative">
                <InteractiveMap
                  items={mapItems}
                  drawPolyline={true}
                  selectedId={selectedMapMarkerId}
                  onMarkerClick={(id) => setSelectedMapMarkerId(id)}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block animate-pulse" />
                  <span className="font-semibold text-slate-700">Route Path Connected</span>
                </div>
                <span className="font-extrabold text-blue-700">
                  {routeSearch ? (routeDistance ? `${routeDistance} km` : "Custom Corridor") : `${activeDbRoute?.totalDistanceKm || 0} km`}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
