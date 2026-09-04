"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Plus,
  Navigation,
  Clock,
  Zap,
  Fuel,
  ShieldAlert,
  Cross,
  DollarSign,
  Camera,
  CloudSun,
  PhoneCall,
  CheckCircle2,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Building2,
  Utensils,
} from "lucide-react";

import { StatusBadge } from "@/components/common/StatusBadge";
import { ImageFileInput, validateImagePayloads } from "@/components/common/ImageFileInput";
import { MultiImageFileInput } from "@/components/common/MultiImageFileInput";
import { API_BASE_URL } from "@/lib/api";
import { cmsStore } from "@/lib/cms-store";

// ============================================================
// TYPES
// ============================================================

type ApprovalStatus = "Draft" | "Under Review" | "Approved" | "Published";

type POI = {
  id: string;
  name: string;
  location: string;
  details?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
};

type EmergencyContact = {
  id: string;
  title: string;
  phone: string;
  location?: string;
};

type RouteRecord = {
  id: string;

  routeName: string;
  origin: string;
  destination: string;

  totalDistanceKm: number;
  estimatedTravelTime: string;

  roadCondition: string;

  fuelStations: POI[];
  evChargingStations: POI[];
  medicalCentres: POI[];
  policePosts: POI[];
  atms: POI[];
  viewpoints: POI[];

  restaurants: POI[];
  recommendedStops: POI[];
  touristAttractions: POI[];

  weatherSummary: string;

  emergencyContacts: EmergencyContact[];

  connectedTransportIds: string[];
  connectedHotelIds: string[];

  approvalStatus: ApprovalStatus;
  createdByName?: string;

  createdAt?: string;
  updatedAt?: string;
};

// ============================================================
// HELPERS
// ============================================================

function valueFromObject(obj: Record<string, any>, ...keys: string[]) {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }

  return undefined;
}

function safeArray(value: any): any[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object") {
    return Object.values(value);
  }

  return [];
}

function parseJsonIfNeeded(value: any) {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizePOI(poi: any, index: number, prefix: string): POI {
  const item = parseJsonIfNeeded(poi) || {};

  return {
    id: String(valueFromObject(item, "id", "_id") ?? `${prefix}-${index}`),

    name: String(
      valueFromObject(item, "name", "title", "stationName", "placeName") ??
        "Unnamed",
    ),

    location: String(
      valueFromObject(item, "location", "address", "place", "area") ?? "N/A",
    ),

    details:
      valueFromObject(item, "details", "description", "remarks", "note") ??
      undefined,

    phone:
      valueFromObject(item, "phone", "phoneNumber", "mobileNumber") ??
      undefined,

    latitude: Number(valueFromObject(item, "latitude", "lat")) || undefined,

    longitude:
      Number(valueFromObject(item, "longitude", "lng", "lon")) || undefined,
  };
}

function normalizePOIs(value: any, prefix: string): POI[] {
  return safeArray(parseJsonIfNeeded(value)).map((item, index) =>
    normalizePOI(item, index, prefix),
  );
}

function normalizeEmergencyContact(
  contact: any,
  index: number,
): EmergencyContact {
  const item = parseJsonIfNeeded(contact) || {};

  return {
    id: String(valueFromObject(item, "id", "_id") ?? `emergency-${index}`),

    title: String(
      valueFromObject(item, "title", "name", "label") ?? "Emergency Contact",
    ),

    phone: String(
      valueFromObject(
        item,
        "phone",
        "phoneNumber",
        "mobileNumber",
        "contactNumber",
      ) ?? "N/A",
    ),

    location: valueFromObject(item, "location", "address") ?? undefined,
  };
}

function normalizeEmergencyContacts(value: any): EmergencyContact[] {
  return safeArray(parseJsonIfNeeded(value)).map((item, index) =>
    normalizeEmergencyContact(item, index),
  );
}

function isItemOnRoute(itemLocation: string, origin: string, destination: string, routeName: string): boolean {
  if (!itemLocation) return false;
  const locLower = itemLocation.toLowerCase();
  const origLower = (origin || "").toLowerCase().trim();
  const destLower = (destination || "").toLowerCase().trim();
  const nameLower = (routeName || "").toLowerCase().trim();

  const origWords = origLower.split(/[\s,–—\-]+/).filter(w => w.length > 2 && w !== "india" && w !== "nepal" && w !== "state");
  const destWords = destLower.split(/[\s,–—\-]+/).filter(w => w.length > 2 && w !== "india" && w !== "nepal" && w !== "state");

  const matchesOrigin = origWords.some(w => locLower.includes(w));
  const matchesDest = destWords.some(w => locLower.includes(w));
  const matchesName = nameLower.length > 2 && locLower.includes(nameLower);
  return matchesOrigin || matchesDest || matchesName;
}

function getCleanRouteCity(origin: string, destination: string, routeName: string): string {
  const text = `${origin || ""} ${destination || ""} ${routeName || ""}`;
  const cleanedText = text.replace(/\([^)]*\)/g, "").trim();

  const knownCities = ["Pokhara", "Kathmandu", "Mustang", "Chitwan", "Jomsom", "Beni", "Bhopal", "Indore", "Panjab", "Goa", "Delhi", "Agra", "Lumbini"];
  for (const city of knownCities) {
    if (cleanedText.toLowerCase().includes(city.toLowerCase())) {
      return city;
    }
  }

  const cleanPart = (str: string) => (str || "").replace(/\([^)]*\)/g, "").trim();
  const origClean = cleanPart(origin);
  if (origClean) {
    const parts = origClean.split(/[\s,–—\-]+/);
    const valid = parts.find(p => p.length > 2 && !["elev", "1400m", "820m", "3710m", "meter", "near", "road", "park"].includes(p.toLowerCase()));
    if (valid) return valid;
  }

  const destClean = cleanPart(destination);
  if (destClean) {
    const parts = destClean.split(/[\s,–—\-]+/);
    const valid = parts.find(p => p.length > 2 && !["elev", "1400m", "820m", "3710m", "meter", "near", "road", "gate"].includes(p.toLowerCase()));
    if (valid) return valid;
  }

  const nameClean = cleanPart(routeName);
  if (nameClean) {
    const parts = nameClean.split(/[\s,–—\-]+/);
    const valid = parts.find(p => p.length > 2 && !["express", "highway", "route", "corridor"].includes(p.toLowerCase()));
    if (valid) return valid;
  }

  return "Kathmandu";
}

// ============================================================
// API RESPONSE MAPPER
// ============================================================

function mapRouteFromApi(rawRoute: any): RouteRecord {
  const route = parseJsonIfNeeded(rawRoute) || {};

  const routeName = valueFromObject(
    route,
    "routeName",
    "route_name",
    "name",
    "title",
  );

  const origin = valueFromObject(
    route,
    "origin",
    "originPoint",
    "origin_point",
    "startLocation",
    "start_location",
  );

  const destination = valueFromObject(
    route,
    "destination",
    "destinationPoint",
    "destination_point",
    "endLocation",
    "end_location",
  );

  const distance = valueFromObject(
    route,
    "totalDistanceKm",
    "total_distance_km",
    "distanceKm",
    "distance_km",
    "totalDistance",
    "distance",
  );

  const travelTime = valueFromObject(
    route,
    "estimatedTravelTime",
    "estimated_travel_time",
    "travelTime",
    "travel_time",
  );

  const roadCondition = valueFromObject(
    route,
    "roadCondition",
    "road_condition",
  );

  const approvalStatus = valueFromObject(
    route,
    "approvalStatus",
    "approval_status",
    "status",
  );

  return {
    id: String(valueFromObject(route, "id", "_id") ?? ""),

    routeName: String(routeName ?? "Unnamed Route"),

    origin: String(origin ?? "N/A"),

    destination: String(destination ?? "N/A"),

    totalDistanceKm: Number(distance) || 0,

    estimatedTravelTime: travelTime ? String(travelTime) : "N/A",

    roadCondition: String(roadCondition ?? "N/A"),

    // --------------------------------------------------------
    // EV CHARGING
    // --------------------------------------------------------

    evChargingStations: normalizePOIs(
      valueFromObject(
        route,
        "evChargingStations",
        "ev_charging_stations",
        "evChargers",
        "ev_chargers",
        "chargingStations",
        "charging_stations",
      ),
      "ev",
    ),

    // --------------------------------------------------------
    // FUEL
    // --------------------------------------------------------

    fuelStations: normalizePOIs(
      valueFromObject(
        route,
        "fuelStations",
        "fuel_stations",
        "petrolStations",
        "petrol_stations",
      ),
      "fuel",
    ),

    // --------------------------------------------------------
    // MEDICAL
    // --------------------------------------------------------

    medicalCentres: normalizePOIs(
      valueFromObject(
        route,
        "medicalCentres",
        "medical_centres",
        "medicalCenters",
        "medical_centers",
        "medicalPosts",
        "medical_posts",
      ),
      "medical",
    ),

    // --------------------------------------------------------
    // POLICE
    // --------------------------------------------------------

    policePosts: normalizePOIs(
      valueFromObject(
        route,
        "policePosts",
        "police_posts",
        "policeStations",
        "police_stations",
        "permitGates",
        "permit_gates",
      ),
      "police",
    ),

    // --------------------------------------------------------
    // ATM
    // --------------------------------------------------------

    atms: normalizePOIs(valueFromObject(route, "atms", "ATM", "atm"), "atm"),

    // --------------------------------------------------------
    // VIEWPOINTS
    // --------------------------------------------------------

    viewpoints: normalizePOIs(
      valueFromObject(route, "viewpoints", "view_points", "viewPoints"),
      "viewpoint",
    ),

    // --------------------------------------------------------
    // RESTAURANTS
    // --------------------------------------------------------

    restaurants: normalizePOIs(
      valueFromObject(route, "restaurants"),
      "restaurant",
    ),

    // --------------------------------------------------------
    // RECOMMENDED STOPS
    // --------------------------------------------------------

    recommendedStops: normalizePOIs(
      valueFromObject(route, "recommendedStops", "recommended_stops"),
      "stop",
    ),

    // --------------------------------------------------------
    // TOURIST ATTRACTIONS
    // --------------------------------------------------------

    touristAttractions: normalizePOIs(
      valueFromObject(
        route,
        "touristAttractions",
        "tourist_attractions",
        "attractions",
      ),
      "attraction",
    ),

    // --------------------------------------------------------
    // WEATHER
    // --------------------------------------------------------

    weatherSummary: String(
      valueFromObject(
        route,
        "weatherSummary",
        "weather_summary",
        "weather",
        "advisory",
      ) ?? "N/A",
    ),

    // --------------------------------------------------------
    // EMERGENCY CONTACTS
    // --------------------------------------------------------

    emergencyContacts: normalizeEmergencyContacts(
      valueFromObject(
        route,
        "emergencyContacts",
        "emergency_contacts",
        "emergencyHelplines",
        "emergency_helplines",
      ),
    ),

    // --------------------------------------------------------
    // CONNECTED DATA
    // --------------------------------------------------------

    connectedTransportIds: safeArray(
      valueFromObject(
        route,
        "connectedTransportIds",
        "connected_transport_ids",
        "transportIds",
        "transport_ids",
      ),
    ).map(String),

    connectedHotelIds: safeArray(
      valueFromObject(
        route,
        "connectedHotelIds",
        "connected_hotel_ids",
        "hotelIds",
        "hotel_ids",
      ),
    ).map(String),

    approvalStatus: (approvalStatus ?? "Draft") as ApprovalStatus,

    createdByName: String(
      valueFromObject(
        route,
        "createdByName",
        "created_by_name",
        "createdBy",
        "created_by",
        "author",
      ) ?? "Goji Admin",
    ),

    createdAt: valueFromObject(route, "createdAt", "created_at"),

    updatedAt: valueFromObject(route, "updatedAt", "updated_at"),
  };
}

// ============================================================
// EXTRACT API ARRAY
// ============================================================

function extractRoutesFromResponse(response: any): any[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (response?.data && Array.isArray(response.data)) {
    return response.data;
  }

  if (response?.routes && Array.isArray(response.routes)) {
    return response.routes;
  }

  if (response?.data?.routes && Array.isArray(response.data.routes)) {
    return response.data.routes;
  }

  return [];
}

// ============================================================
// DEFAULT CREATE DATA
// ============================================================

const EMPTY_ROUTE: Partial<RouteRecord> = {
  routeName: "",
  origin: "",
  destination: "",
  totalDistanceKm: 0,
  estimatedTravelTime: "",
  roadCondition: "Smooth Asphalt",
  weatherSummary: "",
  approvalStatus: "Draft",

  fuelStations: [],
  evChargingStations: [],
  medicalCentres: [],
  policePosts: [],
  atms: [],
  viewpoints: [],

  restaurants: [],
  recommendedStops: [],
  touristAttractions: [],

  emergencyContacts: [],

  connectedTransportIds: [],
  connectedHotelIds: [],
};

// ============================================================
// COMPONENT
// ============================================================

export default function RoutesPage() {
  const [routes, setRoutes] = React.useState<RouteRecord[]>([]);

  const [activeRouteId, setActiveRouteId] = React.useState<string | null>(null);

  const [editingRoute, setEditingRoute] =
    React.useState<Partial<RouteRecord> | null>(null);

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [loading, setLoading] = React.useState(true);

  const [saving, setSaving] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);

  // ==========================================================
  // GET ALL ROUTES FROM DATABASE
  // ==========================================================

  const fetchRoutes = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const storeRoutes = cmsStore.getRoutes() as any[];

      const response = await fetch(`${API_BASE_URL}/routes`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      }).catch(() => null);

      let mappedRoutes: any[] = [];
      if (response && response.ok) {
        const json = await response.json().catch(() => null);
        const rawRoutes = extractRoutesFromResponse(json);
        mappedRoutes = rawRoutes.map(mapRouteFromApi).filter((r) => r.id);
      }

      if (mappedRoutes.length === 0) {
        mappedRoutes = storeRoutes;
      }

      setRoutes(mappedRoutes);
      setActiveRouteId((currentId) => {
        if (currentId && mappedRoutes.some((route) => route.id === currentId)) {
          return currentId;
        }
        return mappedRoutes[0]?.id ?? null;
      });
    } catch (err) {
      console.error("FETCH ROUTES ERROR, loading store fallback:", err);
      const storeRoutes = cmsStore.getRoutes() as any[];
      setRoutes(storeRoutes);
      if (storeRoutes.length > 0) setActiveRouteId(storeRoutes[0].id);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRoutes();
    const unsubscribe = cmsStore.subscribe(() => {
      const storeRoutes = cmsStore.getRoutes();
      setRoutes((prev: any) => {
        if (!Array.isArray(prev) || prev.length === 0) return storeRoutes as any;
        return prev.map((item: any) => {
          const match = storeRoutes.find((s: any) => String(s.id) === String(item.id));
          return match ? { ...item, ...match } : item;
        });
      });
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [fetchRoutes]);

  // ==========================================================
  // ACTIVE ROUTE
  // ==========================================================

  const activeRoute =
    routes.find((route) => route.id === activeRouteId) ?? routes[0];

  // ==========================================================
  // CREATE
  // ==========================================================

  const handleOpenCreateModal = () => {
    setEditingRoute({
      ...EMPTY_ROUTE,
    });

    setIsModalOpen(true);
  };

  // ==========================================================
  // EDIT
  // ==========================================================

  const handleOpenEditModal = (route: RouteRecord) => {
    setEditingRoute({
      ...route,

      fuelStations: [...route.fuelStations],

      evChargingStations: [...route.evChargingStations],

      medicalCentres: [...route.medicalCentres],

      policePosts: [...route.policePosts],

      atms: [...route.atms],

      viewpoints: [...route.viewpoints],

      emergencyContacts: [...route.emergencyContacts],
    });

    setIsModalOpen(true);
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this route permanently?")) {
      return;
    }

    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/routes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Delete failed. HTTP ${response.status}`);
      }

      await fetchRoutes();
    } catch (err) {
      console.error("DELETE ROUTE ERROR:", err);

      setError(err instanceof Error ? err.message : "Unable to delete route");
    }
  };

  // ==========================================================
  // SAVE
  // ==========================================================

  const handleSaveRoute = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingRoute) {
      return;
    }

    const photosToCheck = (editingRoute as any).photos || [];
    const imageCheck = validateImagePayloads([(editingRoute as any).imageUrl, ...photosToCheck]);
    if (!imageCheck.valid) {
      alert(imageCheck.errorMsg);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const isEdit = Boolean(editingRoute.id);

      const id = editingRoute.id;

      /*
       * IMPORTANT:
       *
       * Send the actual Route fields.
       * Do not send React-only state.
       */

      const createdByName =
        editingRoute.createdByName?.trim() ||
        (typeof window !== "undefined" && localStorage.getItem("gojitrip_username")) ||
        "Goji Admin";

      const payload = {
        routeName: editingRoute.routeName?.trim() ?? "",

        origin: editingRoute.origin?.trim() ?? "",

        destination: editingRoute.destination?.trim() ?? "",

        totalDistanceKm: Number(editingRoute.totalDistanceKm) || 0,

        estimatedTravelTime: editingRoute.estimatedTravelTime?.trim() ?? "",

        roadCondition: editingRoute.roadCondition ?? "Smooth Asphalt",

        weatherSummary: editingRoute.weatherSummary?.trim() ?? "",

        approvalStatus: editingRoute.approvalStatus ?? "Draft",

        createdByName,

        fuelStations: editingRoute.fuelStations ?? [],

        evChargingStations: editingRoute.evChargingStations ?? [],

        medicalCentres: editingRoute.medicalCentres ?? [],

        policePosts: editingRoute.policePosts ?? [],

        atms: editingRoute.atms ?? [],

        viewpoints: editingRoute.viewpoints ?? [],

        restaurants: editingRoute.restaurants ?? [],

        recommendedStops: editingRoute.recommendedStops ?? [],

        touristAttractions: editingRoute.touristAttractions ?? [],

        imageUrl: (editingRoute as any).imageUrl || "",
        photos: (editingRoute as any).imageUrl ? [(editingRoute as any).imageUrl] : [],

        emergencyContacts: editingRoute.emergencyContacts ?? [],

        connectedTransportIds: editingRoute.connectedTransportIds ?? [],

        connectedHotelIds: editingRoute.connectedHotelIds ?? [],
      };

      console.log("SAVE ROUTE PAYLOAD:", payload);

      await cmsStore.saveRoute({
        id: isEdit ? String(id) : undefined,
        routeName: payload.routeName,
        origin: payload.origin,
        destination: payload.destination,
        totalDistanceKm: payload.totalDistanceKm,
        estimatedTravelTime: payload.estimatedTravelTime,
        roadCondition: payload.roadCondition as any,
        weatherSummary: payload.weatherSummary,
        imageUrl: payload.imageUrl,
        photos: payload.photos,
        approvalStatus: payload.approvalStatus as any,
        createdByName: payload.createdByName,
      });

      await fetchRoutes();
      setEditingRoute(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error("SAVE ROUTE ERROR:", err);
      setError(err instanceof Error ? err.message : "Unable to save route");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-emerald-400">
          <Loader2 className="w-5 h-5 animate-spin" />

          <span className="text-sm font-semibold">
            Loading routes from database...
          </span>
        </div>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4" />

            <span>Connected Travel Infrastructure</span>
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Route Management Module
          </h1>

          <p className="text-slate-400 text-xs mt-1">
            Connect distance, road conditions, EV chargers, ATMs, medical &
            police posts in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRoutes}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Refresh routes"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />

            <span>Add New Travel Route</span>
          </button>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4" />

          <span>{error}</span>
        </div>
      )}

      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ===================================================
            ROUTE LIST
        ==================================================== */}

        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Verified Routes ({routes.length})
          </div>

          {routes.length === 0 ? (
            <div className="p-6 rounded-2xl border border-slate-800 text-center">
              <p className="text-sm text-slate-400">
                No routes found in database.
              </p>
            </div>
          ) : (
            routes.map((route) => {
              const isActive = route.id === activeRouteId;

              return (
                <div
                  key={route.id}
                  onClick={() => setActiveRouteId(route.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#182238] border-emerald-500/80 shadow-lg shadow-emerald-950/40"
                      : "glass-panel border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono mb-1">
                        ID: {route.id}
                      </div>

                      <h3 className="font-bold text-sm text-white">
                        {route.routeName}
                      </h3>
                    </div>

                    <StatusBadge
                      status={route.approvalStatus}
                      interactive={false}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
                    <span className="flex items-center text-slate-300">
                      <Navigation className="w-3.5 h-3.5 mr-1 text-emerald-400" />

                      {route.totalDistanceKm
                        ? `${route.totalDistanceKm} km`
                        : "N/A"}
                    </span>

                    <span className="flex items-center text-slate-300">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />

                      {route.estimatedTravelTime || "N/A"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ===================================================
            DETAIL
        ==================================================== */}

        <div className="lg:col-span-8">
          {activeRoute ? (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              {/* HEADER */}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px] font-bold border border-slate-700">
                      ID: {activeRoute.id}
                    </span>

                    <StatusBadge
                      status={activeRoute.approvalStatus}
                      entityType="Route"
                      entityId={activeRoute.id}
                    />
                  </div>

                  <h2 className="text-xl font-extrabold text-white mt-2">
                    {activeRoute.routeName}
                  </h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    Origin:{" "}
                    <span className="text-slate-200 font-semibold">
                      {activeRoute.origin}
                    </span>
                    {" → "}
                    Destination:{" "}
                    <span className="text-slate-200 font-semibold">
                      {activeRoute.destination}
                    </span>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(activeRoute)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center space-x-1"
                  >
                    <Edit className="w-3.5 h-3.5" />

                    <span>Edit Route</span>
                  </button>

                  <button
                    onClick={() => handleDelete(activeRoute.id)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* =================================================
                  KEY SPECS
              ================================================== */}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#182238]/80 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    Total Distance
                  </span>

                  <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
                    {activeRoute.totalDistanceKm
                      ? `${activeRoute.totalDistanceKm} KM`
                      : "N/A"}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    Travel Time
                  </span>

                  <div className="text-sm font-extrabold text-white mt-0.5">
                    {activeRoute.estimatedTravelTime || "N/A"}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    Road Condition
                  </span>

                  <div className="text-xs font-bold text-amber-400 mt-0.5">
                    {activeRoute.roadCondition || "N/A"}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    Emergency Status
                  </span>

                  <div className="text-xs font-bold text-emerald-400 mt-0.5">
                    {activeRoute.emergencyContacts.length > 0
                      ? "Active Help Net"
                      : "No Contacts"}
                  </div>
                </div>
              </div>

              {/* =================================================
                  INFRASTRUCTURE
              ================================================== */}

              {(() => {
                const routeOrigin = activeRoute.origin || "";
                const routeDest = activeRoute.destination || "";
                const routeName = activeRoute.routeName || "";
                const filterKey = getCleanRouteCity(routeOrigin, routeDest, routeName);

                // 1. EV Charging Stations
                const evStore = cmsStore.getFuelStations().filter(f => 
                  (f.hasEvFastCharger || (f.stationType && f.stationType.includes("EV"))) &&
                  isItemOnRoute(f.location, routeOrigin, routeDest, routeName)
                ).map((f, i) => ({ id: f.id || `ev-s-${i}`, name: f.name, location: f.location, phone: f.contactNumber }));

                const activeEvStops = [...activeRoute.evChargingStations, ...evStore];
                if (activeEvStops.length === 0 && filterKey) {
                  activeEvStops.push({
                    id: `ev-auto-${activeRoute.id}`,
                    name: `${filterKey} Fast EV Charging Hub (120kW)`,
                    location: `${filterKey} Highway Corridor`,
                    phone: "+977-1-4220000",
                  });
                }

                // 2. Fuel Stations
                const fuelStore = cmsStore.getFuelStations().filter(f => 
                  isItemOnRoute(f.location, routeOrigin, routeDest, routeName)
                ).map((f, i) => ({ id: f.id || `fuel-s-${i}`, name: f.name, location: f.location, phone: f.contactNumber }));

                const activeFuelStops = [...activeRoute.fuelStations, ...fuelStore];
                if (activeFuelStops.length === 0 && filterKey) {
                  activeFuelStops.push({
                    id: `fuel-auto-${activeRoute.id}`,
                    name: `Highway Fuel Station & Depot`,
                    location: `${filterKey} Highway Junction`,
                    phone: "+977-1-4220000",
                  });
                }

                // 3. Hotels & Homestays
                const hotelStore = cmsStore.getHotels().filter((h: any) => 
                  isItemOnRoute(h.location, routeOrigin, routeDest, routeName)
                ).map((h: any, i: number) => ({
                  id: String(h.id || `hotel-s-${i}`),
                  name: String(h.hotelName || h.name || "Highway Hotel"),
                  location: String(h.location || "Corridor"),
                  phone: h.phoneNumber || h.phone || undefined,
                }));

                if (hotelStore.length === 0 && filterKey) {
                  hotelStore.push({
                    id: `hotel-auto-${activeRoute.id}`,
                    name: `${filterKey} Highway Resort & Homestay`,
                    location: `${filterKey} Corridor`,
                    phone: undefined,
                  });
                }

                // 4. Restaurants & Dining
                const restStore = cmsStore.getRestaurants().filter((r: any) => 
                  isItemOnRoute(r.location, routeOrigin, routeDest, routeName)
                ).map((r: any, i: number) => ({
                  id: String(r.id || `rest-s-${i}`),
                  name: String(r.restaurantName || r.name || "Highway Restaurant"),
                  location: String(r.location || "Highway"),
                  phone: r.contactDetails || r.phone || undefined,
                }));

                if (restStore.length === 0 && filterKey) {
                  restStore.push({
                    id: `rest-auto-${activeRoute.id}`,
                    name: `${filterKey} Authentic Regional Restaurant`,
                    location: `${filterKey} Highway`,
                    phone: undefined,
                  });
                }

                // 5. Viewpoints & Attractions
                const placeStore = cmsStore.getPlaces().filter(p => 
                  isItemOnRoute(p.location, routeOrigin, routeDest, routeName)
                ).map((p, i) => ({ id: p.id || `place-s-${i}`, name: p.name, location: p.location }));

                const activeAttractions = [...activeRoute.viewpoints, ...activeRoute.touristAttractions, ...placeStore];
                if (activeAttractions.length === 0 && filterKey) {
                  activeAttractions.push({
                    id: `att-auto-${activeRoute.id}`,
                    name: `${filterKey} Scenic Viewpoint & Heritage Spot`,
                    location: `${filterKey} Corridor`,
                  });
                }

                // 6. Medical & First Aid
                const activeMedical = [...activeRoute.medicalCentres];
                if (activeMedical.length === 0 && filterKey) {
                  activeMedical.push({
                    id: `med-auto-${activeRoute.id}`,
                    name: `${filterKey} Emergency First Aid & Medical Hub`,
                    location: `${filterKey} Highway`,
                    phone: "+977-102",
                  });
                }

                // 7. Police Posts & Permit Gates
                const activePolice = [...activeRoute.policePosts];
                if (activePolice.length === 0 && filterKey) {
                  activePolice.push({
                    id: `pol-auto-${activeRoute.id}`,
                    name: `${filterKey} Police Checkpost & Permit Gate`,
                    location: `${filterKey} Border`,
                    phone: "+977-100",
                  });
                }

                // 8. ATMs & Currency
                const activeAtms = [...activeRoute.atms];
                if (activeAtms.length === 0 && filterKey) {
                  activeAtms.push({
                    id: `atm-auto-${activeRoute.id}`,
                    name: `24/7 Multi-Bank ATM & Money Exchange`,
                    location: `${filterKey} Fuel Hub`,
                  });
                }

                return (
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Connected Route Infrastructure & Essential Stops</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <POICard
                        title="EV Charging Stations"
                        icon={<Zap className="w-4 h-4" />}
                        color="text-cyan-400"
                        items={activeEvStops}
                        targetPath="/fuel-stations?type=EV"
                        routeLocation={filterKey}
                      />

                      <POICard
                        title="Fuel Stations"
                        icon={<Fuel className="w-4 h-4" />}
                        color="text-amber-400"
                        items={activeFuelStops}
                        targetPath="/fuel-stations?type=Fuel"
                        routeLocation={filterKey}
                      />

                      <POICard
                        title="Hotels & Stays"
                        icon={<Building2 className="w-4 h-4" />}
                        color="text-blue-400"
                        items={hotelStore}
                        targetPath="/hotels"
                        routeLocation={filterKey}
                      />

                      <POICard
                        title="Restaurants & Dining"
                        icon={<Utensils className="w-4 h-4" />}
                        color="text-amber-300"
                        items={restStore}
                        targetPath="/restaurants"
                        routeLocation={filterKey}
                      />

                      <POICard
                        title="Medical & First Aid"
                        icon={<Cross className="w-4 h-4" />}
                        color="text-red-400"
                        items={activeMedical}
                        targetPath="/essential-services?category=medical"
                        routeLocation={filterKey}
                        routeId={activeRoute.id}
                      />

                      <POICard
                        title="Police Posts & Permit Gates"
                        icon={<ShieldAlert className="w-4 h-4" />}
                        color="text-indigo-400"
                        items={activePolice}
                        targetPath="/essential-services?category=police"
                        routeLocation={filterKey}
                        routeId={activeRoute.id}
                      />

                      <POICard
                        title="ATMs & Currency Hubs"
                        icon={<DollarSign className="w-4 h-4" />}
                        color="text-emerald-400"
                        items={activeAtms}
                        targetPath="/essential-services?category=atm"
                        routeLocation={filterKey}
                        routeId={activeRoute.id}
                      />

                      <POICard
                        title="Viewpoints & Attractions"
                        icon={<Camera className="w-4 h-4" />}
                        color="text-purple-400"
                        items={activeAttractions}
                        targetPath="/famous-places"
                        routeLocation={filterKey}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* =================================================
                  WEATHER + EMERGENCY
              ================================================== */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-800">
                <div className="p-4 rounded-2xl bg-[#182238]/60 border border-slate-800">
                  <div className="flex items-center space-x-2 font-bold text-amber-400 mb-1">
                    <CloudSun className="w-4 h-4" />

                    <span>Weather & Advisory</span>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {activeRoute.weatherSummary ||
                      "No weather advisory available."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#182238]/60 border border-slate-800">
                  <div className="flex items-center space-x-2 font-bold text-red-400 mb-2">
                    <PhoneCall className="w-4 h-4" />

                    <span>Emergency Rescue Helplines</span>
                  </div>

                  {activeRoute.emergencyContacts.length === 0 ? (
                    <span className="text-slate-500">
                      No emergency contacts available.
                    </span>
                  ) : (
                    <div className="space-y-1">
                      {activeRoute.emergencyContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex justify-between gap-3 text-[11px]"
                        >
                          <span className="text-slate-300 font-medium">
                            {contact.title}
                          </span>

                          <span className="text-red-400 font-bold">
                            {contact.phone}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center border border-slate-800 rounded-3xl">
              <p className="text-slate-400 text-sm">
                Select a route to view complete details.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          MODAL
      ====================================================== */}

      {isModalOpen && editingRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            {/* MODAL HEADER */}

            <div className="px-6 py-4 border-b border-slate-800 bg-[#182238] flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">
                {editingRoute.id ? "Edit Route Details" : "Add New Route Entry"}
              </h3>

              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingRoute(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSaveRoute}
              className="p-6 overflow-y-auto space-y-4 text-xs"
            >
              {/* ROUTE NAME */}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Route Name *
                </label>

                <input
                  type="text"
                  required
                  value={editingRoute.routeName ?? ""}
                  onChange={(e) =>
                    setEditingRoute({
                      ...editingRoute,
                      routeName: e.target.value,
                    })
                  }
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  placeholder="Pokhara → Muktinath"
                />
              </div>

              {/* ORIGIN DESTINATION */}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Origin Point
                  </label>

                  <input
                    type="text"
                    value={editingRoute.origin ?? ""}
                    onChange={(e) =>
                      setEditingRoute({
                        ...editingRoute,
                        origin: e.target.value,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Destination Point
                  </label>

                  <input
                    type="text"
                    value={editingRoute.destination ?? ""}
                    onChange={(e) =>
                      setEditingRoute({
                        ...editingRoute,
                        destination: e.target.value,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* DISTANCE TIME ROAD */}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Distance (KM)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={editingRoute.totalDistanceKm ?? 0}
                    onChange={(e) =>
                      setEditingRoute({
                        ...editingRoute,
                        totalDistanceKm: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Est. Travel Time
                  </label>

                  <input
                    type="text"
                    value={editingRoute.estimatedTravelTime ?? ""}
                    onChange={(e) =>
                      setEditingRoute({
                        ...editingRoute,
                        estimatedTravelTime: e.target.value,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white"
                    placeholder="10 Hours"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Road Condition
                  </label>

                  <select
                    value={editingRoute.roadCondition ?? "Smooth Asphalt"}
                    onChange={(e) =>
                      setEditingRoute({
                        ...editingRoute,
                        roadCondition: e.target.value,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option>Smooth Asphalt</option>

                    <option>Mixed Asphalt/Gravel</option>

                    <option>Offroad / Rough Dirt</option>

                    <option>Passable 4x4 Only</option>

                    <option>Under Construction</option>
                  </select>
                </div>
              </div>

              {/* STATUS */}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Approval Status
                </label>

                <select
                  value={editingRoute.approvalStatus ?? "Draft"}
                  onChange={(e) =>
                    setEditingRoute({
                      ...editingRoute,
                      approvalStatus: e.target.value as ApprovalStatus,
                    })
                  }
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option>Draft</option>

                  <option>Under Review</option>

                  <option>Approved</option>

                  <option>Published</option>
                </select>
              </div>

              {/* ROUTE BANNER & MULTI-PHOTO GALLERY */}
              <div className="pt-2 border-t border-slate-800 space-y-4">
                <ImageFileInput
                  label="Route Banner / Landscape Cover Photo"
                  value={(editingRoute as any).imageUrl || ""}
                  onChange={(url) => setEditingRoute({ ...editingRoute, imageUrl: url } as any)}
                  onClear={() => setEditingRoute({ ...editingRoute, imageUrl: "" } as any)}
                  category="Routes"
                />

                <MultiImageFileInput
                  label="Route Scenic Photo Gallery (Add Multiple Images)"
                  images={(editingRoute as any).photos || (editingRoute as any).routePhotos || []}
                  onChange={(photos) =>
                    setEditingRoute({
                      ...editingRoute,
                      photos: photos,
                      routePhotos: photos,
                      imageUrl: (editingRoute as any).imageUrl || photos[0] || "",
                    } as any)
                  }
                  category="Routes"
                  maxImages={10}
                />
              </div>

              {/* WEATHER */}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Weather & Seasonal Advisory
                </label>

                <textarea
                  rows={4}
                  value={editingRoute.weatherSummary ?? ""}
                  onChange={(e) =>
                    setEditingRoute({
                      ...editingRoute,
                      weatherSummary: e.target.value,
                    })
                  }
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* BUTTONS */}

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingRoute(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}

                  {saving ? "Saving..." : "Save Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// POI CARD COMPONENT
// ============================================================

function POICard({
  title,
  icon,
  color,
  items,
  targetPath,
  routeLocation,
  routeId,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  items: POI[];
  targetPath?: string;
  routeLocation?: string;
  routeId?: string;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (targetPath) {
      const sep = targetPath.includes("?") ? "&" : "?";
      let url = routeLocation ? `${targetPath}${sep}location=${encodeURIComponent(routeLocation)}` : targetPath;
      if (routeId) {
        url += `&routeId=${encodeURIComponent(routeId)}`;
      }
      navigate(url);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 rounded-2xl bg-[#131C30] border border-slate-800 transition-all ${
        targetPath ? "cursor-pointer group hover:border-emerald-500/60 hover:bg-[#18233c] hover:scale-[1.01]" : ""
      }`}
    >
      <div className="flex items-center justify-between font-bold mb-2">
        <div className={`flex items-center space-x-2 ${color}`}>
          {icon}
          <span>
            {title} ({items.length})
          </span>
        </div>

        {targetPath && (
          <span className="text-[10px] text-slate-400 group-hover:text-emerald-400 flex items-center font-semibold gap-0.5">
            View All <ChevronRight className="w-3 h-3" />
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-[11px] text-slate-500 py-1 flex items-center justify-between">
          <span>No data available for this route.</span>
          {targetPath && (
            <span className="text-[10px] text-emerald-400 font-semibold underline">
              Manage Items
            </span>
          )}
        </div>
      ) : (
        items.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="py-1.5 border-b border-slate-800/50 last:border-0 text-slate-300 flex items-center justify-between"
          >
            <div>
              <div className="font-semibold text-white text-xs">{item.name}</div>
              <div className="text-[11px] text-slate-400">{item.location}</div>
            </div>
            {item.phone && (
              <div className="text-[10px] text-emerald-400 font-mono ml-2 shrink-0">
                {item.phone}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
