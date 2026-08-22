"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  MapPin,
  Hotel,
  Utensils,
  Bus,
  Map,
  Fuel,
  Star,
  Navigation,
  Loader2,
  Clock,
  ChevronRight,
  LocateFixed,
  Route as RouteIcon,
} from "lucide-react";

import { planRoute, type RouteSearchData, type RouteStop } from "@/lib/api";

import AddRouteModal from "@/components/common/AddRouteModal";

// ============================================================
// ACTION CATEGORIES
// ============================================================

type ActionCategory = {
  key:
    | "hotels"
    | "restaurants"
    | "transport"
    | "places"
    | "fuel"
    | "famous-places";

  label: string;
  path: string;
  icon: React.ElementType;
};

const actionCategories: ActionCategory[] = [
  {
    key: "hotels",
    label: "Hotels",
    path: "/pages/hotels",
    icon: Hotel,
  },
  {
    key: "restaurants",
    label: "Restaurants",
    path: "/pages/restaurants",
    icon: Utensils,
  },
  {
    key: "transport",
    label: "Transport",
    path: "/pages/transport",
    icon: Bus,
  },
  {
    key: "places",
    label: "Places",
    path: "/pages/guides",
    icon: Map,
  },
  {
    key: "fuel",
    label: "Fuel",
    path: "/pages/fuel-station",
    icon: Fuel,
  },
  {
    key: "famous-places",
    label: "Famous Places",
    path: "/pages/famous-places",
    icon: Star,
  },
];

// ============================================================
// TYPES
// ============================================================

type TimelineStop = RouteStop & {
  sequence: number;
  isSource: boolean;
  isDestination: boolean;
  isViaStop?: boolean;
};

type FlexibleRouteStop = Partial<RouteStop> & {
  name?: string;
  title?: string;

  lat?: string | number;
  lng?: string | number;

  lon?: string | number;

  latitude?: string | number;
  longitude?: string | number;

  address?: string;
  type?: string;
};

// ============================================================
// SAFE STRING
// ============================================================

function safeString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

// ============================================================
// NORMALIZE PLACE NAME
// ============================================================

function normalizePlaceName(value: unknown): string {
  return safeString(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[,\-]+$/g, "")
    .trim();
}

// ============================================================
// LATITUDE
// ============================================================

function getStopLatitude(stop: Partial<RouteStop>): string {
  const item = stop as FlexibleRouteStop;

  const latitude =
    item.lat ??
    item.latitude ??
    (item as any).location?.lat ??
    (item as any).coordinates?.lat;

  return safeString(latitude);
}

// ============================================================
// LONGITUDE
// ============================================================

function getStopLongitude(stop: Partial<RouteStop>): string {
  const item = stop as FlexibleRouteStop;

  const longitude =
    item.lng ??
    item.lon ??
    item.longitude ??
    (item as any).location?.lng ??
    (item as any).coordinates?.lng;

  return safeString(longitude);
}

// ============================================================
// STOP COLOR
// ============================================================

function getStopColor(
  type: RouteStop["type"],
  isSource: boolean,
  isDestination: boolean,
  isViaStop = false,
) {
  if (isSource) {
    return "bg-blue-600";
  }

  if (isDestination) {
    return "bg-red-500";
  }

  if (isViaStop) {
    return "bg-purple-600";
  }

  switch (type) {
    case "sightseeing":
      return "bg-purple-600";

    case "food":
      return "bg-orange-500";

    case "fuel":
      return "bg-yellow-500";

    case "rest":
      return "bg-green-600";

    case "hotel":
      return "bg-indigo-600";

    default:
      return "bg-blue-500";
  }
}

// ============================================================
// STOP LABEL
// ============================================================

function getStopLabel(
  type: RouteStop["type"],
  isSource: boolean,
  isDestination: boolean,
  isViaStop = false,
) {
  if (isSource) {
    return "START";
  }

  if (isDestination) {
    return "DESTINATION";
  }

  if (isViaStop) {
    return "VIA STOP";
  }

  switch (type) {
    case "sightseeing":
      return "NEXT STOP";

    case "food":
      return "FOOD STOP";

    case "fuel":
      return "FUEL STOP";

    case "rest":
      return "REST STOP";

    case "hotel":
      return "HOTEL";

    default:
      return "NEXT STOP";
  }
}

// ============================================================
// GET CONFIGURED INTERMEDIATE STOPS
// ============================================================

function getConfiguredIntermediateStops(
  search: RouteSearchData | null,
): FlexibleRouteStop[] {
  if (!search) {
    return [];
  }

  const possibleLists = [
    (search as any).intermediateStops,
    (search as any).viaStops,
    (search as any).waypoints,
  ];

  for (const list of possibleLists) {
    if (!Array.isArray(list)) {
      continue;
    }

    const validStops = list
      .map((item) => {
        if (typeof item === "string") {
          return {
            name: item,
          };
        }

        if (item && typeof item === "object") {
          const raw = item as any;

          return {
            ...raw,

            name: safeString(raw.name || raw.title || raw.locationName),
          };
        }

        return null;
      })
      .filter(
        (item): item is FlexibleRouteStop =>
          !!item && safeString(item.name).length > 0,
      );

    if (validStops.length > 0) {
      return validStops;
    }
  }

  return [];
}

// ============================================================
// CONVERT FLEXIBLE STOP -> ROUTE STOP
// ============================================================

function convertToRouteStop(
  stop: FlexibleRouteStop,
  fallbackId: string,
): RouteStop {
  return {
    ...(stop as RouteStop),

    id: safeString(stop.id) || fallbackId,

    name: safeString(stop.name || stop.title),

    type: (stop.type || "rest") as RouteStop["type"],

    address: safeString(stop.address || stop.name || stop.title),

    subtitle: safeString(stop.subtitle) || "Your next stop",

    details:
      safeString(stop.details) ||
      `Continue your journey through ${safeString(stop.name || stop.title)}.`,
  } as RouteStop;
}

// ============================================================
// COMPONENT
// ============================================================

export default function RouteTimeline() {
  // ==========================================================
  // STATE
  // ==========================================================

  const [routeSearch, setRouteSearch] = useState<RouteSearchData | null>(null);

  const [stops, setStops] = useState<RouteStop[]>([]);

  const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);

  const [selectedStopName, setSelectedStopName] = useState("");

  const [nextStop, setNextStop] = useState<RouteStop | null>(null);

  const [loading, setLoading] = useState(false);

  const [routeDistance, setRouteDistance] = useState<
    number | string | undefined
  >();

  const [routeDuration, setRouteDuration] = useState<string | undefined>();

  const [error, setError] = useState<string | null>(null);

  const routeSearchRef = useRef<RouteSearchData | null>(routeSearch);

  // ==========================================================
  // ROUTE SEARCH REF
  // ==========================================================

  useEffect(() => {
    routeSearchRef.current = routeSearch;
  }, [routeSearch]);

  // ==========================================================
  // GENERATE ROUTE
  // ==========================================================

  const generateRoute = async (search: RouteSearchData) => {
    setLoading(true);
    setError(null);

    setStops([]);
    setRouteDistance(undefined);
    setRouteDuration(undefined);

    try {
      console.log("====================================================");

      console.log("ROUTE TIMELINE: PLANNING ROUTE");

      console.log("SOURCE:", search.source);

      console.log("DESTINATION:", search.destination);

      console.log("VIA STOPS:", getConfiguredIntermediateStops(search));

      console.log("====================================================");

      const response = await planRoute(search);

      console.log("ROUTE API RESPONSE:", response);

      let generatedStops: RouteStop[] = [];

      // ------------------------------------------------------
      // API STOPS
      // ------------------------------------------------------

      if (Array.isArray(response?.stops) && response.stops.length > 0) {
        generatedStops = response.stops;
      }

      // ------------------------------------------------------
      // API ROUTE
      // ------------------------------------------------------
      else if (Array.isArray(response?.route) && response.route.length > 0) {
        generatedStops = response.route;
      }

      // ------------------------------------------------------
      // API INTERMEDIATE STOPS
      // ------------------------------------------------------
      else if (Array.isArray(response?.intermediateStops)) {
        generatedStops = response.intermediateStops;
      }

      // ------------------------------------------------------
      // NORMALIZE
      // ------------------------------------------------------

      const normalizedStops = generatedStops
        .filter((stop) => safeString(stop?.name).length > 0)
        .map(
          (stop) =>
            ({
              ...stop,

              name: safeString(stop.name),
            }) as RouteStop,
        );

      console.log("GENERATED STOPS:", normalizedStops);

      setStops(normalizedStops);

      setRouteDistance(response?.distance);

      setRouteDuration(response?.duration);
    } catch (routeError) {
      console.error("Route planning failed:", routeError);

      if (routeError instanceof Error) {
        setError(routeError.message);
      } else {
        setError("Unable to generate route.");
      }

      setStops([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOAD SAVED SEARCH
  // ==========================================================

  useEffect(() => {
    const savedRoute = sessionStorage.getItem("gojitrip_route_search");

    if (!savedRoute) {
      return;
    }

    try {
      const parsed = JSON.parse(savedRoute) as RouteSearchData;

      if (!parsed?.source?.name || !parsed?.destination?.name) {
        return;
      }

      console.log("LOADED SAVED ROUTE:", parsed);

      setRouteSearch(parsed);

      void generateRoute(parsed);
    } catch (loadError) {
      console.error("Unable to load saved route:", loadError);

      setError("Unable to load saved route.");
    }
  }, []);

  // ==========================================================
  // COMPLETE TIMELINE
  //
  // IMPORTANT:
  //
  // Source
  //    ↓
  // VIA STOPS
  //    ↓
  // GENERATED STOPS
  //    ↓
  // Destination
  // ==========================================================

  const timelineStops = useMemo<TimelineStop[]>(() => {
    if (!routeSearch) {
      return [];
    }

    const sourceName = safeString(routeSearch.source?.name);

    const destinationName = safeString(routeSearch.destination?.name);

    const sourceKey = normalizePlaceName(sourceName);

    const destinationKey = normalizePlaceName(destinationName);

    const configuredStops = getConfiguredIntermediateStops(routeSearch);

    const generatedStops = Array.isArray(stops) ? stops : [];

    // ======================================================
    // SOURCE
    // ======================================================

    const sourceStop = generatedStops.find(
      (stop) =>
        normalizePlaceName(stop.name) === sourceKey || stop.type === "source",
    );

    const finalSource: RouteStop = sourceStop
      ? {
          ...sourceStop,

          name: sourceName,

          type: "source",

          subtitle: "Start your trip from here",

          address:
            safeString(sourceStop.address) ||
            safeString((routeSearch.source as any)?.address) ||
            sourceName,
        }
      : ({
          id: "source",

          name: sourceName,

          type: "source",

          subtitle: "Start your trip from here",

          address:
            safeString((routeSearch.source as any)?.address) || sourceName,

          details: "Starting point",

          ...(routeSearch.source as any),
        } as RouteStop);

    // ======================================================
    // DESTINATION
    // ======================================================

    const destinationStop = generatedStops.find(
      (stop) =>
        normalizePlaceName(stop.name) === destinationKey ||
        stop.type === "destination",
    );

    const finalDestination: RouteStop = destinationStop
      ? {
          ...destinationStop,

          name: destinationName,

          type: "destination",

          subtitle: "Your final destination",

          address:
            safeString(destinationStop.address) ||
            safeString((routeSearch.destination as any)?.address) ||
            destinationName,
        }
      : ({
          id: "destination",

          name: destinationName,

          type: "destination",

          subtitle: "Your final destination",

          address:
            safeString((routeSearch.destination as any)?.address) ||
            destinationName,

          details: "Destination",

          ...(routeSearch.destination as any),
        } as RouteStop);

    // ======================================================
    // INTERMEDIATE
    // ======================================================

    const intermediate: RouteStop[] = [];

    const seen = new Set<string>();

    // ======================================================
    // CONFIGURED VIA STOPS
    // ======================================================

    for (let index = 0; index < configuredStops.length; index++) {
      const configured = configuredStops[index];

      const name = safeString(configured.name || configured.title);

      const key = normalizePlaceName(name);

      if (!key) {
        continue;
      }

      if (key === sourceKey || key === destinationKey) {
        continue;
      }

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);

      const routeStop = convertToRouteStop(configured, `via-${index + 1}`);

      intermediate.push({
        ...routeStop,

        name,

        type: "sightseeing",

        subtitle: "Selected route stop",

        details:
          safeString(routeStop.details) ||
          `Stop at ${name} before continuing to ${destinationName}.`,
      });
    }

    // ======================================================
    // GENERATED STOPS
    // ======================================================

    for (const stop of generatedStops) {
      const name = safeString(stop.name);

      const key = normalizePlaceName(name);

      if (!key) {
        continue;
      }

      if (key === sourceKey || key === destinationKey) {
        continue;
      }

      if (stop.type === "source" || stop.type === "destination") {
        continue;
      }

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);

      intermediate.push({
        ...stop,

        type: stop.type || "rest",

        subtitle: stop.subtitle || "Your next stop",

        details: stop.details || `Continue your journey through ${name}.`,
      });
    }

    // ======================================================
    // FINAL COMPLETE ROUTE
    // ======================================================

    const completeStops = [finalSource, ...intermediate, finalDestination];

    // ======================================================
    // ADD SEQUENCE
    // ======================================================

    return completeStops.map((stop, index) => {
      const isSource = index === 0;

      const isDestination = index === completeStops.length - 1;

      const isViaStop =
        !isSource &&
        !isDestination &&
        configuredStops.some(
          (via) =>
            normalizePlaceName(via.name || via.title) ===
            normalizePlaceName(stop.name),
        );

      return {
        ...stop,

        sequence: index + 1,

        isSource,

        isDestination,

        isViaStop,
      };
    });
  }, [routeSearch, stops]);

  // ==========================================================
  // FIND NEXT LOCATION
  //
  // IMPORTANT FIX:
  //
  // DO NOT search only inside `stops`.
  //
  // Use complete `timelineStops`:
  //
  // Pokhara
  //    ↓
  // Beni
  //    ↓
  // Tatopani
  //    ↓
  // Kathmandu
  // ==========================================================

  const findNextStop = (currentStopName: string): RouteStop | null => {
    const currentKey = normalizePlaceName(currentStopName);

    console.log("======================================");

    console.log("FIND NEXT LOCATION");

    console.log("CURRENT:", currentStopName);

    console.log(
      "TIMELINE:",
      timelineStops.map((item) => ({
        sequence: item.sequence,

        name: item.name,

        source: item.isSource,

        destination: item.isDestination,

        via: item.isViaStop,
      })),
    );

    console.log("======================================");

    if (!currentKey || timelineStops.length === 0) {
      return null;
    }

    // --------------------------------------------------------
    // FIND CURRENT STOP
    // --------------------------------------------------------

    const currentIndex = timelineStops.findIndex(
      (stop) => normalizePlaceName(stop.name) === currentKey,
    );

    console.log("CURRENT INDEX:", currentIndex);

    if (currentIndex === -1) {
      console.warn("Current location not found:", currentStopName);

      return null;
    }

    // --------------------------------------------------------
    // LAST LOCATION
    // --------------------------------------------------------

    if (currentIndex >= timelineStops.length - 1) {
      console.log("Current location is final destination.");

      return null;
    }

    // --------------------------------------------------------
    // NEXT LOCATION
    // --------------------------------------------------------

    const candidate = timelineStops[currentIndex + 1];

    if (!candidate) {
      return null;
    }

    // --------------------------------------------------------
    // SAFETY CHECK
    // --------------------------------------------------------

    if (normalizePlaceName(candidate.name) === currentKey) {
      return null;
    }

    console.log("NEXT LOCATION FOUND:", candidate);

    return {
      ...candidate,

      id: candidate.id || `next-${currentIndex + 1}`,
    } as RouteStop;
  };

  // ==========================================================
  // ADD ROUTE
  // ==========================================================

  const handleAddRoute = async (stop: RouteStop) => {
    if (!routeSearch || !stop?.name) {
      return;
    }

    const stopKey = normalizePlaceName(stop.name);

    const sourceKey = normalizePlaceName(routeSearch.source?.name);

    const destinationKey = normalizePlaceName(routeSearch.destination?.name);

    // ========================================================
    // DO NOT ADD SOURCE
    // ========================================================

    if (stopKey === sourceKey) {
      console.warn("Cannot add source as VIA stop.");

      setIsAddTripModalOpen(false);

      return;
    }

    // ========================================================
    // DESTINATION
    //
    // Destination is already part of route.
    // Do NOT duplicate it as VIA.
    // ========================================================

    if (stopKey === destinationKey) {
      console.log("Next location is destination. No VIA stop added.");

      setIsAddTripModalOpen(false);

      setNextStop(null);

      return;
    }

    // ========================================================
    // EXISTING VIA STOPS
    // ========================================================

    const existingViaStops = getConfiguredIntermediateStops(routeSearch);

    const alreadyExists = existingViaStops.some(
      (existingStop) =>
        normalizePlaceName(existingStop.name || existingStop.title) === stopKey,
    );

    if (alreadyExists) {
      console.log("Stop already exists:", stop.name);

      setIsAddTripModalOpen(false);

      setNextStop(null);

      return;
    }

    // ========================================================
    // ADD NEW VIA STOP
    // ========================================================

    const updatedViaStops = [
      ...(routeSearch.viaStops || []),

      {
        ...stop,

        type: "sightseeing",
      },
    ];

    const updatedRouteSearch = {
      ...routeSearch,

      viaStops: updatedViaStops,
    };

    console.log("======================================");

    console.log("ADDING NEW ROUTE STOP");

    console.log("CURRENT ROUTE:", routeSearch);

    console.log("ADDED STOP:", stop);

    console.log("UPDATED VIA STOPS:", updatedViaStops);

    console.log("======================================");

    // ========================================================
    // UPDATE STATE
    // ========================================================

    setRouteSearch(updatedRouteSearch);

    // ========================================================
    // SAVE SESSION
    // ========================================================

    sessionStorage.setItem(
      "gojitrip_route_search",
      JSON.stringify(updatedRouteSearch),
    );

    // ========================================================
    // CLOSE MODAL
    // ========================================================

    setIsAddTripModalOpen(false);

    setNextStop(null);

    // ========================================================
    // RECALCULATE ROUTE
    // ========================================================

    await generateRoute(updatedRouteSearch);
  };

  // ==========================================================
  // LISTEN FOR HERO SEARCH
  // ==========================================================

  useEffect(() => {
    const handleRouteSearch = (event: Event) => {
      const customEvent = event as CustomEvent<RouteSearchData>;

      if (!customEvent.detail) {
        return;
      }

      const newRoute = customEvent.detail;

      if (!newRoute?.source?.name || !newRoute?.destination?.name) {
        setError("Source and destination are required.");

        return;
      }

      console.log("======================================");

      console.log("NEW HERO ROUTE");

      console.log("SOURCE:", newRoute.source);

      console.log("DESTINATION:", newRoute.destination);

      console.log("VIA:", getConfiguredIntermediateStops(newRoute));

      console.log("======================================");

      setRouteSearch(newRoute);

      setError(null);

      setStops([]);

      setRouteDistance(undefined);

      setRouteDuration(undefined);

      setNextStop(null);

      sessionStorage.setItem("gojitrip_route_search", JSON.stringify(newRoute));

      void generateRoute(newRoute);
    };

    window.addEventListener("gojitrip:route-search", handleRouteSearch);

    return () => {
      window.removeEventListener("gojitrip:route-search", handleRouteSearch);
    };
  }, []);

  // ==========================================================
  // STOP SERVICE ACTION
  // ==========================================================

  const handleStopAction = (stop: TimelineStop, category: ActionCategory) => {
    const stopName = safeString(stop.name);

    if (!stopName) {
      return;
    }

    const latitude = getStopLatitude(stop);

    const longitude = getStopLongitude(stop);

    const address = safeString(stop.address) || stopName;

    const params = new URLSearchParams();

    params.set("location", stopName);

    params.set("routeStop", stopName);

    params.set("category", category.key);

    if (address) {
      params.set("address", address);
    }

    if (latitude) {
      params.set("lat", latitude);
    }

    if (longitude) {
      params.set("lng", longitude);
    }

    if (routeSearch) {
      params.set("source", safeString(routeSearch.source?.name));

      params.set("destination", safeString(routeSearch.destination?.name));
    }

    const targetUrl = `${category.path}?${params.toString()}`;

    console.log("OPEN SERVICE:", targetUrl);

    window.location.href = targetUrl;
  };

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  if (!routeSearch) {
    return (
      <section
        id="complete-route-analysis"
        className="py-12 md:py-20 bg-white text-slate-900"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              ✨ AI-POWERED ANALYSIS
            </span>

            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-950 mt-6 tracking-tighter">
              Complete Route Analysis
            </h2>

            <p className="text-base md:text-xl text-slate-600 mt-4 max-w-2xl mx-auto">
              Select your source and destination above and press{" "}
              <strong className="text-blue-600">Search Route</strong> to
              generate your complete journey.
            </p>

            <div className="mt-8 max-w-xl mx-auto p-6 rounded-2xl border border-blue-100 bg-blue-50/50">
              <RouteIcon size={32} className="mx-auto text-blue-600 mb-3" />

              <p className="text-sm text-slate-600">
                Your journey will show the starting point, selected via stops,
                villages, towns and final destination.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <section
      id="complete-route-analysis"
      className="py-10 md:py-20 bg-white text-slate-900 scroll-mt-20"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* ====================================================
            HEADER
        ===================================================== */}

        <div className="text-center mb-8 md:mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            ✨ AI-POWERED ROUTE JOURNEY
          </span>

          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-950 mt-5 md:mt-6 tracking-tighter">
            Complete Route Analysis
          </h2>

          <p className="text-base md:text-xl text-slate-600 mt-3 md:mt-4 max-w-2xl mx-auto">
            Follow your journey step by step from your source to destination.
          </p>

          {/* ROUTE SUMMARY */}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-semibold">
              📍 {routeSearch.source.name}
            </span>

            <ChevronRight size={18} className="text-slate-400" />

            <span className="px-4 py-2 rounded-full bg-red-50 text-red-600 font-semibold">
              🏁 {routeSearch.destination.name}
            </span>
          </div>

          {/* JOURNEY DETAILS */}

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:gap-3 text-xs text-slate-500">
            {routeSearch.date && (
              <>
                <span>
                  Journey:{" "}
                  <strong className="text-slate-700">{routeSearch.date}</strong>
                </span>

                <span className="hidden sm:inline">•</span>
              </>
            )}

            {routeSearch.travellers !== undefined && (
              <>
                <span>
                  Travellers:{" "}
                  <strong className="text-slate-700">
                    {routeSearch.travellers}
                  </strong>
                </span>

                <span className="hidden sm:inline">•</span>
              </>
            )}

            {routeDistance !== undefined && (
              <span>
                Distance:{" "}
                <strong className="text-slate-700">
                  {typeof routeDistance === "number"
                    ? `${routeDistance} km`
                    : routeDistance}
                </strong>
              </span>
            )}

            {routeDuration && (
              <>
                <span className="hidden sm:inline">•</span>

                <span className="inline-flex items-center gap-1">
                  <Clock size={13} />

                  <strong className="text-slate-700">{routeDuration}</strong>
                </span>
              </>
            )}
          </div>
        </div>

        {/* ====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="mb-8 flex items-center justify-center gap-3 py-5 px-4 rounded-2xl bg-blue-50 text-blue-600">
            <Loader2 size={20} className="animate-spin shrink-0" />

            <span className="font-semibold text-sm md:text-base text-center">
              Finding your selected route stops...
            </span>
          </div>
        )}

        {/* ====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mb-8 p-5 rounded-2xl border border-red-200 bg-red-50 text-red-700">
            <p className="font-bold">Unable to generate route</p>

            <p className="text-sm mt-1">{error}</p>

            <button
              type="button"
              onClick={() => void generateRoute(routeSearch)}
              className="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ====================================================
            JOURNEY OVERVIEW
        ===================================================== */}

        {!loading && !error && timelineStops.length > 0 && (
          <div className="mb-10 p-4 md:p-5 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-blue-600">
                  ROUTE JOURNEY
                </p>

                <p className="mt-1 text-sm md:text-base font-semibold text-slate-900">
                  {timelineStops.length} locations from{" "}
                  {routeSearch.source.name} to {routeSearch.destination.name}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <LocateFixed size={15} className="text-blue-600" />

                <span>Explore services at every stop</span>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            NO STOPS
        ===================================================== */}

        {!loading && !error && timelineStops.length === 0 && (
          <div className="p-8 text-center rounded-2xl border border-slate-200 bg-slate-50">
            <MapPin size={32} className="mx-auto text-slate-400 mb-3" />

            <h3 className="font-bold text-slate-900">No route stops found</h3>

            <p className="text-sm text-slate-500 mt-2">
              Try another source and destination.
            </p>
          </div>
        )}

        {/* ====================================================
            TIMELINE
        ===================================================== */}

        <div className="space-y-8 md:space-y-10">
          {timelineStops.map((stop, index) => {
            const isLast = index === timelineStops.length - 1;

            const markerColor = getStopColor(
              stop.type,
              stop.isSource,
              stop.isDestination,
              stop.isViaStop,
            );

            const label = getStopLabel(
              stop.type,
              stop.isSource,
              stop.isDestination,
              stop.isViaStop,
            );

            return (
              <div
                key={`${safeString(stop.id)}-${stop.name}-${index}`}
                className="grid grid-cols-[42px,1fr] md:grid-cols-[60px,1fr] gap-3 md:gap-6 items-stretch"
              >
                {/* TIMELINE MARKER */}

                <div className="flex flex-col items-center relative min-h-full">
                  <div
                    className={`
                        w-9 h-9 md:w-10 md:h-10
                        rounded-full
                        ${markerColor}
                        text-white
                        flex
                        items-center
                        justify-center
                        font-bold
                        text-xs md:text-sm
                        z-10
                        shadow-md
                        ring-4 ring-white
                      `}
                  >
                    {String(stop.sequence).padStart(2, "0")}
                  </div>

                  {!isLast && (
                    <div className="absolute top-9 md:top-10 bottom-[-40px] md:bottom-[-48px] w-px border-l-2 border-dotted border-blue-200" />
                  )}
                </div>

                {/* CONTENT */}

                <div className="flex flex-col gap-3 md:gap-4 pb-2">
                  {/* STOP CARD */}

                  <div
                    className={`
                        bg-white
                        p-4 md:p-6
                        rounded-2xl
                        border
                        shadow-sm
                        hover:shadow-md
                        transition-shadow
                        ${
                          stop.isSource
                            ? "border-blue-200"
                            : stop.isDestination
                              ? "border-red-200"
                              : stop.isViaStop
                                ? "border-purple-200"
                                : "border-slate-100"
                        }
                      `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        {/* TITLE */}

                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg md:text-xl font-bold text-slate-900 break-words">
                                {stop.name}
                              </h3>

                              <span
                                className={`
                                    text-[9px] md:text-[10px]
                                    uppercase
                                    tracking-wider
                                    font-bold
                                    px-2 py-1
                                    rounded-full
                                    ${
                                      stop.isDestination
                                        ? "bg-red-50 text-red-600"
                                        : stop.isSource
                                          ? "bg-blue-50 text-blue-600"
                                          : stop.isViaStop
                                            ? "bg-purple-50 text-purple-600"
                                            : "bg-slate-100 text-slate-600"
                                    }
                                  `}
                              >
                                {label}
                              </span>
                            </div>

                            {stop.isSource && (
                              <p className="text-blue-600 text-sm mt-1 font-medium">
                                Start your trip from this location
                              </p>
                            )}

                            {stop.isDestination && (
                              <p className="text-red-500 text-sm mt-1 font-medium">
                                Your final destination
                              </p>
                            )}

                            {stop.isViaStop && (
                              <p className="text-purple-600 text-sm mt-1 font-medium">
                                Selected stop on your route
                              </p>
                            )}

                            {!stop.isSource &&
                              !stop.isDestination &&
                              !stop.isViaStop && (
                                <p className="text-slate-500 text-sm mt-1">
                                  Your next stop along the route
                                </p>
                              )}
                          </div>
                        </div>

                        {/* ADDRESS */}

                        {stop.address && (
                          <p className="text-xs text-slate-500 mt-3 flex items-start gap-1">
                            <MapPin
                              size={13}
                              className="shrink-0 mt-0.5 text-blue-500"
                            />

                            <span>{stop.address}</span>
                          </p>
                        )}

                        {/* DETAILS */}

                        {stop.details && (
                          <p className="text-blue-600 text-xs md:text-sm font-semibold mt-3 bg-blue-50 px-3 py-2 rounded-lg inline-block">
                            {stop.details}
                          </p>
                        )}

                        {/* DISTANCE / TIME */}

                        {(stop.distanceFromPrevious ||
                          stop.durationFromPrevious) && (
                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                            {stop.distanceFromPrevious && (
                              <span>
                                From previous stop:{" "}
                                <strong className="text-slate-700">
                                  {stop.distanceFromPrevious}
                                </strong>
                              </span>
                            )}

                            {stop.durationFromPrevious && (
                              <span className="inline-flex items-center gap-1">
                                <Clock size={12} />

                                <strong className="text-slate-700">
                                  {stop.durationFromPrevious}
                                </strong>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* STOP SERVICES */}

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Explore at {stop.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {actionCategories.map((category) => {
                        const Icon = category.icon;

                        return (
                          <button
                            key={category.key}
                            type="button"
                            onClick={() => handleStopAction(stop, category)}
                            title={`${category.label} in ${stop.name}`}
                            className="group min-w-0 h-[72px] sm:h-20 flex flex-col items-center justify-center gap-1.5 bg-white border border-slate-200 rounded-xl md:rounded-2xl text-slate-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95 transition-all shadow-sm"
                          >
                            <Icon
                              size={18}
                              className="group-hover:scale-110 transition-transform"
                            />

                            <span className="text-[9px] sm:text-[10px] font-semibold text-center leading-tight px-1">
                              {category.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* =================================================
                          ROUTE BUTTONS
                      ================================================== */}

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {!stop.isDestination && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = findNextStop(stop.name);

                            console.log("ADD ROUTE CLICKED");

                            console.log("CURRENT:", stop.name);

                            console.log("NEXT:", next);

                            setSelectedStopName(stop.name);

                            setNextStop(next);

                            setIsAddTripModalOpen(true);
                          }}
                          className="py-2.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all shadow-sm"
                        >
                          + Add Route
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          console.log("Continue to trip:", stop.name);
                        }}
                        className={`py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm ${
                          stop.isDestination ? "col-span-2" : ""
                        }`}
                      >
                        Continue to Trip
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ====================================================
            ROUTE STATUS
        ===================================================== */}

        {timelineStops.length > 0 && (
          <div className="mt-10 md:mt-12 p-5 rounded-2xl border border-blue-100 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <Navigation size={22} className="text-blue-600 mt-0.5 shrink-0" />

              <div>
                <h3 className="font-bold text-slate-900">
                  Route Selected Successfully
                </h3>

                <p className="text-sm text-slate-600 mt-1">
                  Your journey from <strong>{routeSearch.source.name}</strong>{" "}
                  to <strong>{routeSearch.destination.name}</strong> is ready.
                </p>

                {timelineStops.length > 2 && (
                  <p className="text-xs text-slate-500 mt-2">
                    Route contains <strong>{timelineStops.length - 2}</strong>{" "}
                    intermediate locations.
                  </p>
                )}

                <p className="text-xs text-blue-600 mt-3 font-medium">
                  Select Hotels, Restaurants, Transport, Places, Fuel or Famous
                  Places under any stop to explore that exact location.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            ADD ROUTE MODAL
        ===================================================== */}

        <AddRouteModal
          isOpen={isAddTripModalOpen}
          onClose={() => {
            setIsAddTripModalOpen(false);

            setNextStop(null);
          }}
          stopName={selectedStopName}
          nextStop={nextStop}
          onAddRoute={handleAddRoute}
        />
      </div>
    </section>
  );
}
