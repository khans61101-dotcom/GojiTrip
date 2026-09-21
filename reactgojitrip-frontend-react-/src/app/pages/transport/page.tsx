// TransportPage.tsx - Enhanced Local Search + Google Pickup Point Geocoding
"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { SafeImage } from "@/components/common/SafeImage";
import { apiRequest } from "@/lib/api";
import { cmsStore } from "@/lib/cms-store";
import YelpDetailModal, { YelpDetailData } from "@/components/common/YelpDetailModal";
import { InteractiveMap, MapMarkerItem } from "@/components/common/InteractiveMap";
import {
  Search, 
  Filter,
  Clock,
  Car,
  Bus,
  Bike,
  Users,
  Train,
  Plane,
  Ship,
  ArrowLeft,
  MapPin,
  Maximize2,
  Minimize2,
  Star,
  Globe,
  X,
  ChevronDown,
  SlidersHorizontal,
  Calendar,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

// ============= GOOGLE GEOCODING HELPERS =============
const GOOGLE_API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  "YOUR_GOOGLE_MAPS_API_KEY";

let _geocoder: any = null;
let _geocodeScriptPromise: Promise<void> | null = null;

const loadGoogleMapsScript = (): Promise<void> => {
  if (_geocodeScriptPromise) return _geocodeScriptPromise;

  _geocodeScriptPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if ((window as any).google?.maps?.Geocoder) return resolve();

    const existing = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Google Maps load failed"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps load failed"));
    document.head.appendChild(script);
  });

  return _geocodeScriptPromise;
};

const getGeocoder = (): any => {
  if (_geocoder) return _geocoder;
  _geocoder = new (window as any).google.maps.Geocoder();
  return _geocoder;
};

interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

const geocodeLocation = async (
  query: string
): Promise<GeocodeResult | null> => {
  if (!query.trim() || query.length < 3) return null;

  try {
    await loadGoogleMapsScript();
    const google = (window as any).google;
    if (!google?.maps?.Geocoder) return null;

    const geocoder = getGeocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ address: query }, (results: any, status: any) => {
        if (status === "OK" && results?.[0]) {
          const loc = results[0].geometry.location;
          resolve({
            lat: loc.lat(),
            lng: loc.lng(),
            formattedAddress: results[0].formatted_address,
          });
        } else {
          resolve(null);
        }
      });
    });
  } catch (err) {
    console.warn("Geocode failed:", err);
    return null;
  }
};

// ============= TYPES =============
interface BackendTransport {
  id: number | string;
  operatorName?: string;
  operator_name?: string;
  contactPerson?: string;
  contact_person?: string;
  mobileNumber?: string;
  mobile_number?: string;
  whatsAppNumber?: string;
  whatsappNumber?: string;
  whatsApp_number?: string;
  whatsapp_number?: string;
  vehicleType?: string;
  vehicle_type?: string;
  vehicleNumber?: string;
  vehicle_number?: string;
  seatCapacity?: number;
  seat_capacity?: number;
  route?: string;
  pickupPoint?: string;
  pickup_point?: string;
  departureTime?: string;
  departure_time?: string;
  fare?: number;
  currency?: string;
  luggagePolicy?: string;
  luggage_policy?: string;
  driverPhotoUrl?: string | null;
  driver_photo_url?: string | null;
  vehiclePhotos?: string[];
  vehicle_photos?: string[];
  licenceVerified?: boolean;
  licence_verified?: boolean;
  activeStatus?: string;
  active_status?: string;
  approvalStatus?: string;
  approval_status?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  createdByName?: string;
  created_by_name?: string;
  gpsCoordinates?: string;
  lat?: number;
  lng?: number;
}

type TransportType = "car" | "bus" | "train" | "bike" | "plane" | "ship";

interface TransportOption {
  id: string;
  type: TransportType;
  name: string;
  description: string;
  image: string;
  from: string;
  to: string;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  capacity: number;
  available: number;
  rating: number;
  provider: string;
  amenities: string[];
  lat?: number;
  lng?: number;
  /** Derived: departure hour (0-23) for time filter */
  departureHour?: number;
  /** Derived: searchable haystack */
  _searchText?: string;
}

interface FilterState {
  transportType: string[];
  sortBy: string;
  priceMin: number;
  priceMax: number;
  departureTimeSlot: "any" | "morning" | "afternoon" | "evening" | "night";
  operatorVerifiedOnly: boolean;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

/* -------------------------------------------------------
   Helper: Parse "HH:MM AM/PM" → hour (0-23)
------------------------------------------------------- */
function parseDepartureHour(timeStr?: string): number | undefined {
  if (!timeStr) return undefined;
  const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
  if (!match) return undefined;
  let hour = parseInt(match[1], 10);
  const ampm = (match[3] || "").toUpperCase();
  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return hour;
}

/* -------------------------------------------------------
   Helper: Convert Admin vehicle type to Public UI type
------------------------------------------------------- */
function getTransportType(vehicleType?: string): TransportType {
  const type = (vehicleType || "").toLowerCase();
  if (
    type.includes("plane") ||
    type.includes("flight") ||
    type.includes("air") ||
    type.includes("helicopter")
  )
    return "plane";
  if (
    type.includes("ship") ||
    type.includes("boat") ||
    type.includes("ferry") ||
    type.includes("cruise") ||
    type.includes("water")
  )
    return "ship";
  if (
    type.includes("bus") ||
    type.includes("hiace") ||
    type.includes("van") ||
    type.includes("coach")
  )
    return "bus";
  if (
    type.includes("bike") ||
    type.includes("motorcycle") ||
    type.includes("ev") ||
    type.includes("scooter")
  )
    return "bike";
  if (type.includes("train") || type.includes("metro")) return "train";
  return "car";
}

/* -------------------------------------------------------
   Helper: Convert Backend Transport -> Public Transport
------------------------------------------------------- */
function mapTransport(item: BackendTransport): TransportOption {
  const vehicleType = item.vehicleType ?? item.vehicle_type ?? "Other";
  const vehicleNumber = item.vehicleNumber ?? item.vehicle_number ?? "";
  const operatorName =
    item.operatorName ?? item.operator_name ?? "Transport Operator";
  const route = item.route ?? "";
  const pickupPoint = item.pickupPoint ?? item.pickup_point ?? "";
  const departureTime = item.departureTime ?? item.departure_time ?? "";
  const fare = Number(item.fare ?? 0);
  const currency = item.currency ?? "NPR";
  const seatCapacity = Number(item.seatCapacity ?? item.seat_capacity ?? 0);
  const driverPhoto = item.driverPhotoUrl ?? item.driver_photo_url ?? "";
  const vehiclePhotos = item.vehiclePhotos ?? item.vehicle_photos ?? [];
  const image =
    vehiclePhotos.length > 0
      ? vehiclePhotos[0]
      : driverPhoto || "/logo/gojitriplogo.jpg";
  const activeStatus = item.activeStatus ?? item.active_status ?? "Active";
  const approvalStatus =
    item.approvalStatus ?? item.approval_status ?? "Published";
  const type = getTransportType(vehicleType);

  let lat: number | undefined;
  let lng: number | undefined;
  if (item.gpsCoordinates) {
    try {
      const coords = item.gpsCoordinates.split(",");
      lat = parseFloat(coords[0]);
      lng = parseFloat(coords[1]);
    } catch (e) {
      console.warn("Invalid GPS coordinates for transport:", item.id);
    }
  }

  let from = pickupPoint || "Nepal";
  let to = route || "Destination";

  if (route) {
    const routeParts = route
      .split(/→|->|\s+to\s+|-/i)
      .map((part) => part.trim())
      .filter(Boolean);
    if (routeParts.length >= 2) {
      from = pickupPoint || routeParts[0];
      to = routeParts[routeParts.length - 1];
    } else {
      to = route;
    }
  }

  const departureHour = parseDepartureHour(departureTime);

  return {
    id: String(item.id),
    type,
    name:
      operatorName !== "Transport Operator"
        ? operatorName
        : `${vehicleType} Transport`,
    description: [
      vehicleType,
      vehicleNumber ? `Vehicle No: ${vehicleNumber}` : "",
      route ? `Route: ${route}` : "",
    ]
      .filter(Boolean)
      .join(" • "),
    image,
    from,
    to,
    duration: "Available",
    departureTime: departureTime || "Flexible",
    arrivalTime: "Flexible",
    price: fare,
    currency,
    capacity: seatCapacity,
    available: seatCapacity,
    rating: 4.5,
    provider: operatorName,
    amenities: [
      vehicleType,
      (item.licenceVerified ?? item.licence_verified)
        ? "Licence Verified"
        : "",
      activeStatus,
      approvalStatus,
    ].filter(Boolean),
    lat,
    lng,
    departureHour,
    _searchText: [
      operatorName,
      vehicleType,
      vehicleNumber,
      route,
      pickupPoint,
      departureTime,
      activeStatus,
      approvalStatus,
    ]
      .join(" ")
      .toLowerCase(),
  };
}

// ============= LOADING SKELETON =============
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((item) => (
      <div
        key={item}
        className="flex gap-3 p-3 bg-white rounded-xl border border-gray-200 animate-pulse"
      >
        <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="flex gap-1 mb-2">
            <div className="h-4 w-12 bg-gray-200 rounded" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>
          <div className="flex justify-between">
            <div className="h-5 w-20 bg-gray-200 rounded" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ============= EMPTY STATE =============
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="text-6xl mb-4">🚌</div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">
      No Transport Found
    </h3>
    <p className="text-gray-500 max-w-md mx-auto text-center">{message}</p>
  </div>
);

// ============= COMPACT TRANSPORT CARD =============
const CompactTransportCard: React.FC<{
  transport: TransportOption;
  isSelected: boolean;
  onClick: () => void;
  onViewDetails?: () => void;
}> = ({ transport, isSelected, onClick, onViewDetails }) => {
  const typeIcons: Record<string, React.ElementType> = {
    car: Car,
    bus: Bus,
    plane: Plane,
    ship: Ship,
    train: Train,
    bike: Bike,
  };
  const TypeIcon = typeIcons[transport.type] || Car;

  return (
    <div
      className={`bg-white rounded-xl border transition-all cursor-pointer hover:shadow-md group ${
        isSelected
          ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-md"
          : "border-gray-200 hover:border-emerald-300"
      }`}
      onClick={() => {
        onClick();
        if (onViewDetails) onViewDetails();
      }}
    >
      <div className="flex flex-col sm:flex-row gap-3.5 p-3.5">
        <div className="flex-shrink-0 w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-gray-100 relative">
          <img
            src={transport.image || "/logo/gojitriplogo.jpg"}
            alt={transport.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo/gojitriplogo.jpg";
            }}
          />
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <TypeIcon className="h-3 w-3 text-emerald-400" />
            {transport.type.toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-base font-extrabold text-slate-900 truncate group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                <TypeIcon className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                {transport.name}
              </h3>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full flex-shrink-0">
                <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                <span className="text-xs font-extrabold text-amber-900">
                  {transport.rating || 4.8}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-600 text-xs mb-2 flex-wrap">
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                <span>
                  {transport.from} ➔ {transport.to}
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                <span>Dept: {transport.departureTime}</span>
              </div>
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {transport.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-200/60"
                >
                  {amenity}
                </span>
              ))}
              {transport.amenities.length > 3 && (
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium">
                  +{transport.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <span className="text-base font-extrabold text-slate-900">
                {transport.currency} {transport.price.toLocaleString()}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onViewDetails) onViewDetails();
                }}
                className="ml-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
              >
                Book
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= MAIN TRANSPORT PAGE =============
const TransportPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const locParam =
      params.get("location") ||
      params.get("search") ||
      params.get("q") ||
      params.get("routeStop");
    if (locParam && locParam.trim()) {
      setSearchQuery(locParam.trim());
    }
  }, []);

  const [transports, setTransports] = useState<TransportOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    transportType: [],
    sortBy: "recommended",
    priceMin: 0,
    priceMax: 100000,
    departureTimeSlot: "any",
    operatorVerifiedOnly: false,
  });
  const [selectedTransportId, setSelectedTransportId] = useState<string | null>(
    null
  );
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [yelpDetailData, setYelpDetailData] = useState<YelpDetailData | null>(
    null
  );
  const [showYelpModal, setShowYelpModal] = useState(false);
  const transportListRef = useRef<HTMLDivElement>(null);

  // ============= GOOGLE GEOCODING (Pickup Point Search) =============
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult | null>(
    null
  );
  const [geocoding, setGeocoding] = useState(false);

  // Debounced geocode — sirf search query 3+ chars aur local me results kam hon
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 3) {
      setGeocodeResult(null);
      return;
    }

    // Local search me results mil gaye? To geocode skip
    // (Ye check filteredTransports me karenge — but for debounce, just fire)

    const timer = setTimeout(async () => {
      setGeocoding(true);
      const result = await geocodeLocation(query);
      setGeocodeResult(result);
      setGeocoding(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ============= YELP DETAIL =============
  const handleOpenYelpDetail = (t: TransportOption) => {
    setYelpDetailData({
      id: t.id,
      name: t.name,
      category: `${t.type.toUpperCase()} Passenger Transport Operator`,
      rating: t.rating || 4.8,
      reviewCount: 32,
      priceLevel: "$$",
      address: `Pickup Point: ${t.from}`,
      location: `${t.from} → ${t.to}`,
      phone: (t as any).mobileNumber || t.provider || "+977 1 4567890",
      whatsapp: (t as any).whatsAppNumber || "+9779801234567",
      image: t.image,
      galleryImages:
        (t as any).vehiclePhotos || (t as any).photos || (t.image ? [t.image] : []),
      description:
        (t as any).description ||
        `${t.name} (${t.provider}) provides reliable, safe ${t.type} passenger transport service along the ${t.from} to ${t.to} corridor. Driver photo and vehicle licences are fully verified.`,
      amenities:
        (t as any).amenities ||
        t.amenities || [
          "AC Vehicle",
          "Reclining Seats",
          "Luggage Storage",
          "GPS Tracking",
          "Verified Driver",
        ],
      hours: t.departureTime
        ? [{ day: "Daily Schedule", time: `Departure: ${t.departureTime}` }]
        : undefined,
      priceTag: `${t.currency} ${t.price} / seat`,
      entityType: "transport",
      offerings: [
        {
          title: `Regular Seat Ticket (${t.from} → ${t.to})`,
          price: `${t.currency} ${t.price}`,
          desc: `Departure: ${t.departureTime} • Vehicle Type: ${t.type.toUpperCase()}`,
        },
        {
          title: "Full Vehicle Private Charter",
          price: `${t.currency} ${(t.price * 6).toLocaleString()}`,
          desc: "Private booking for families & groups with custom pickup location.",
        },
      ],
    });
    setShowYelpModal(true);
  };

  // ============= FETCH CMS + API =============
  const fetchTransports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const storeTransports = cmsStore.getTransports();
      const userStoreTransports = storeTransports.filter(
        (s) => !String(s.id).startsWith("tr-")
      );
      const response = await apiRequest<BackendTransport[]>("/transport").catch(
        () => null
      );
      console.log("Transport API response:", response);

      const backendData = Array.isArray(response) ? response : [];
      const mappedData = backendData.map((bItem) => {
        const base = mapTransport(bItem);
        const storeMatch = storeTransports.find(
          (s) => String(s.id) === String(bItem.id)
        );
        const routeStr = storeMatch?.route || storeMatch?.pickupPoint;
        let from = base.from;
        let to = base.to;
        if (routeStr && routeStr.includes("➔")) {
          const parts = routeStr.split("➔");
          from = parts[0].trim();
          to = parts[1].trim();
        } else if (routeStr && routeStr.includes("->")) {
          const parts = routeStr.split("->");
          from = parts[0].trim();
          to = parts[1].trim();
        } else if (storeMatch?.pickupPoint) {
          from = storeMatch.pickupPoint;
        }
        return {
          ...base,
          from: from || base.from,
          to: to || base.to,
          amenities:
            Array.isArray((storeMatch as any)?.vehicleAmenities) &&
            (storeMatch as any).vehicleAmenities.length > 0
              ? (storeMatch as any).vehicleAmenities
              : base.amenities,
        };
      });

      userStoreTransports.forEach((st: any) => {
        if (!mappedData.some((m) => String(m.id) === String(st.id))) {
          const routeStr = st.route || st.pickupPoint || "Kathmandu ➔ Pokhara";
          let from = "Kathmandu";
          let to = "Pokhara";
          if (routeStr.includes("➔")) {
            const parts = routeStr.split("➔");
            from = parts[0].trim();
            to = parts[1].trim();
          } else if (routeStr.includes("->")) {
            const parts = routeStr.split("->");
            from = parts[0].trim();
            to = parts[1].trim();
          } else if (st.pickupPoint) {
            from = st.pickupPoint;
          }

          const departureTime = st.departureTime || "07:30 AM";

          mappedData.unshift({
            id: String(st.id),
            name: st.operatorName || st.driverName || "Express Transport",
            type: (st.vehicleType?.toLowerCase() as any) || "bus",
            from,
            to,
            duration: "4.5h",
            departureTime,
            arrivalTime: "12:00 PM",
            price: Number(st.fare || st.ticketPrice) || 1200,
            currency: st.currency || "NRs",
            capacity: st.seatCapacity || 35,
            rating: 4.8,
            image:
              st.vehiclePhotos && st.vehiclePhotos[0]
                ? st.vehiclePhotos[0]
                : "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
            amenities:
              st.vehicleAmenities && st.vehicleAmenities.length > 0
                ? st.vehicleAmenities
                : ["AC", "Reclining Seats"],
            provider: st.operatorName || "Verified Operator",
            available: st.seatCapacity || 15,
            description: st.driverName
              ? `Driver: ${st.driverName}`
              : "Comfortable Highway Passenger Service",
            departureHour: parseDepartureHour(departureTime),
            _searchText: [
              st.operatorName,
              st.vehicleType,
              routeStr,
              departureTime,
            ]
              .join(" ")
              .toLowerCase(),
          });
        }
      });

      setTransports(mappedData);

      // Compute max price for slider
      const maxPrice = Math.max(
        100000,
        ...mappedData.map((m) => m.price || 0)
      );
      setFilters((prev) => ({ ...prev, priceMax: maxPrice }));
    } catch (err) {
      console.error("Failed to fetch transports:", err);
      setTransports([]);
      setError("Unable to load transport data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTransports();
  }, [fetchTransports]);

  // ============= FUZZY SEARCH HELPER =============
  // Simple fuzzy: check if all query words are present in haystack
  const fuzzyMatch = (haystack: string, query: string): boolean => {
    if (!query) return true;
    const words = query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    const hay = haystack.toLowerCase();
    return words.every((word) => {
      // Direct match
      if (hay.includes(word)) return true;
      // Typo tolerance: allow 1 char difference for words 4+ chars
      if (word.length >= 4) {
        // Check if any word in haystack is within edit distance 1
        const hayWords = hay.split(/\s+/);
        return hayWords.some((hw) => {
          if (Math.abs(hw.length - word.length) > 1) return false;
          let diff = 0;
          const len = Math.min(hw.length, word.length);
          for (let i = 0; i < len; i++) {
            if (hw[i] !== word[i]) diff++;
            if (diff > 1) return false;
          }
          return diff <= 1;
        });
      }
      return false;
    });
  };

  // ============= FILTER + SORT (A) =============
  const filteredTransports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = transports.filter((transport) => {
      // Fuzzy search
      if (query) {
        const haystack =
          transport._searchText ||
          [
            transport.name,
            transport.description,
            transport.from,
            transport.to,
            transport.provider,
            transport.type,
          ]
            .join(" ")
            .toLowerCase();
        if (!fuzzyMatch(haystack, query)) return false;
      }

      // Transport type filter
      if (
        filters.transportType.length > 0 &&
        !filters.transportType.includes(transport.type)
      ) {
        return false;
      }

      // Price range filter
      if (
        transport.price < filters.priceMin ||
        transport.price > filters.priceMax
      ) {
        return false;
      }

      // Departure time slot filter
      if (filters.departureTimeSlot !== "any" && transport.departureHour !== undefined) {
        const h = transport.departureHour;
        if (filters.departureTimeSlot === "morning" && (h < 5 || h >= 12))
          return false;
        if (filters.departureTimeSlot === "afternoon" && (h < 12 || h >= 17))
          return false;
        if (filters.departureTimeSlot === "evening" && (h < 17 || h >= 21))
          return false;
        if (filters.departureTimeSlot === "night" && (h < 21 && h >= 5))
          return false;
      }

      // Verified operator filter
      if (filters.operatorVerifiedOnly) {
        const hasVerified = transport.amenities.some((a) =>
          a.toLowerCase().includes("verified")
        );
        if (!hasVerified) return false;
      }

      return true;
    });

    // Sort
    switch (filters.sortBy) {
      case "price-low":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "capacity":
        result = [...result].sort((a, b) => b.capacity - a.capacity);
        break;
      case "departure":
        result = [...result].sort((a, b) => {
          const ha = a.departureHour ?? 99;
          const hb = b.departureHour ?? 99;
          return ha - hb;
        });
        break;
      default:
        // Recommended: verified first, then rating
        result = [...result].sort((a, b) => {
          const aV = a.amenities.some((x) =>
            x.toLowerCase().includes("verified")
          )
            ? 1
            : 0;
          const bV = b.amenities.some((x) =>
            x.toLowerCase().includes("verified")
          )
            ? 1
            : 0;
          if (aV !== bV) return bV - aV;
          return (b.rating || 0) - (a.rating || 0);
        });
        break;
    }

    return result;
  }, [transports, searchQuery, filters]);

  const toggleTransportType = (type: string) => {
    setFilters((previous) => {
      const exists = previous.transportType.includes(type);
      return {
        ...previous,
        transportType: exists
          ? previous.transportType.filter((item) => item !== type)
          : [...previous.transportType, type],
      };
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setGeocodeResult(null);
    setFilters({
      transportType: [],
      sortBy: "recommended",
      priceMin: 0,
      priceMax: 100000,
      departureTimeSlot: "any",
      operatorVerifiedOnly: false,
    });
  };

  const activeFilterCount =
    filters.transportType.length +
    (filters.departureTimeSlot !== "any" ? 1 : 0) +
    (filters.operatorVerifiedOnly ? 1 : 0) +
    (filters.priceMin > 0 || filters.priceMax < 100000 ? 1 : 0);

  const handleMarkerClick = (transportId: string) => {
    setSelectedTransportId(transportId);
    if (transportListRef.current) {
      const cards =
        transportListRef.current.querySelectorAll("[data-transport-id]");
      cards.forEach((card) => {
        if (card.getAttribute("data-transport-id") === transportId) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          card.classList.add("ring-2", "ring-blue-500", "shadow-lg");
          setTimeout(() => {
            card.classList.remove("ring-2", "ring-blue-500", "shadow-lg");
          }, 2000);
        }
      });
    }
  };

  // ============= MAP CENTER (Google Geocode ya default) =============
  const mapCenter = useMemo(() => {
    if (geocodeResult) {
      return { lat: geocodeResult.lat, lng: geocodeResult.lng };
    }
    // Agar koi transport ka lat/lng hai to uska average
    const withCoords = filteredTransports.filter((t) => t.lat && t.lng);
    if (withCoords.length > 0) {
      const avgLat =
        withCoords.reduce((s, t) => s + (t.lat || 0), 0) / withCoords.length;
      const avgLng =
        withCoords.reduce((s, t) => s + (t.lng || 0), 0) / withCoords.length;
      return { lat: avgLat, lng: avgLng };
    }
    return { lat: 28.2096, lng: 83.9856 };
  }, [geocodeResult, filteredTransports]);

  // Detect: search query Google me match hua lekin local me 0 results
  const showGoogleFallbackHint =
    searchQuery.trim().length >= 3 &&
    filteredTransports.length === 0 &&
    geocodeResult !== null &&
    !geocoding;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white sticky top-0 z-30 shadow-lg">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 rounded-xl text-white font-medium transition-all hover:scale-105 active:scale-95 group flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline text-sm">Back</span>
            </button>

            <div className="flex-1 max-w-2xl mx-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search routes (e.g. Kathmandu to Pokhara), operators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-white/95 text-gray-900 placeholder-gray-500 border-0 rounded-xl focus:ring-2 focus:ring-white/50 outline-none transition-all shadow-sm text-sm"
                />
                {geocoding && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {searchQuery && !geocoding && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all text-xs font-bold ${
                  showAdvancedFilters || activeFilterCount > 0
                    ? "bg-white text-blue-600 shadow-md"
                    : "bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-blue-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/30 transition-all text-white flex-shrink-0"
              >
                {isMapExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
                <span className="hidden lg:inline text-sm">
                  {isMapExpanded ? "Collapse" : "Expand"}
                </span>
              </button>
            </div>
          </div>

          {/* Transport Type Quick Filters */}
          <div className="pb-3 flex gap-2 flex-wrap items-center">
            {["plane", "ship", "car", "bus", "train", "bike"].map((type) => {
              const selected = filters.transportType.includes(type);
              const labels: Record<string, string> = {
                plane: "✈️ Plane",
                ship: "🚢 Ship",
                car: "🚗 Car",
                bus: "🚌 Bus",
                train: "🚆 Train",
                bike: "🏍️ Bike",
              };
              return (
                <button
                  key={type}
                  onClick={() => toggleTransportType(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selected
                      ? "bg-white text-blue-600 shadow-md"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {labels[type] || type}
                </button>
              );
            })}
            {(searchQuery ||
              filters.transportType.length > 0 ||
              activeFilterCount > 0) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/80 text-white hover:bg-red-500 transition-all flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="bg-white/10 backdrop-blur-sm border-t border-white/20">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-xs font-medium text-white/90 mb-2 flex items-center justify-between">
                    <span>Price Range ({filters.priceMin} - {filters.priceMax})</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max={Math.max(100000, ...transports.map((t) => t.price))}
                      step="100"
                      value={filters.priceMin}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          priceMin: Math.min(
                            Number(e.target.value),
                            prev.priceMax - 100
                          ),
                        }))
                      }
                      className="w-full accent-white"
                    />
                    <input
                      type="range"
                      min="0"
                      max={Math.max(100000, ...transports.map((t) => t.price))}
                      step="100"
                      value={filters.priceMax}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          priceMax: Math.max(
                            Number(e.target.value),
                            prev.priceMin + 100
                          ),
                        }))
                      }
                      className="w-full accent-white"
                    />
                  </div>
                </div>

                {/* Departure Time */}
                <div>
                  <label className="block text-xs font-medium text-white/90 mb-2">
                    Departure Time
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      { key: "any", label: "Any" },
                      { key: "morning", label: "🌅 Morning (5-12)" },
                      { key: "afternoon", label: "☀️ Afternoon (12-17)" },
                      { key: "evening", label: "🌆 Evening (17-21)" },
                      { key: "night", label: "🌙 Night (21-5)" },
                    ].map((slot) => (
                      <button
                        key={slot.key}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            departureTimeSlot: slot.key as any,
                          }))
                        }
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                          filters.departureTimeSlot === slot.key
                            ? "bg-white text-blue-600 shadow-md"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verified Only */}
                <div>
                  <label className="block text-xs font-medium text-white/90 mb-2">
                    Trust
                  </label>
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        operatorVerifiedOnly: !prev.operatorVerifiedOnly,
                      }))
                    }
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filters.operatorVerifiedOnly
                        ? "bg-green-500 text-white shadow-md"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified Operators Only
                  </button>
                </div>
              </div>

              {/* Geocode result badge */}
              {geocodeResult && (
                <div className="mt-3 flex items-center gap-2 text-xs text-green-100 bg-green-500/20 rounded-lg px-3 py-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  <span>
                    📍 Google Location: <strong>{geocodeResult.formattedAddress}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Split Layout */}
      <div
        className={`flex-1 flex transition-all duration-300 ${
          isMapExpanded ? "flex-col-reverse" : "flex-row"
        }`}
      >
        {/* Transport List - Left */}
        <div
          className={`${
            isMapExpanded ? "h-1/2" : "w-1/2"
          } overflow-y-auto bg-gray-50 border-r border-gray-200`}
          style={{ height: isMapExpanded ? "50%" : "calc(100vh - 120px)" }}
          ref={transportListRef}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-700 font-medium text-sm">
                {loading
                  ? "Loading..."
                  : `${filteredTransports.length} transport option${
                      filteredTransports.length === 1 ? "" : "s"
                    } found`}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">Sort:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
                  }
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="capacity">Capacity</option>
                  <option value="departure">Departure Time</option>
                </select>
              </div>
            </div>

            {/* Google fallback hint */}
            {showGoogleFallbackHint && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
                <Globe className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">
                    No transport operators listed for "{searchQuery}"
                  </p>
                  <p className="text-blue-700">
                    Google Maps me ye location mil gayi:{" "}
                    <strong>{geocodeResult?.formattedAddress}</strong>. Abhi
                    koi operator is route pe registered nahi hai.
                  </p>
                </div>
              </div>
            )}

            {loading ? (
              <LoadingSkeleton />
            ) : filteredTransports.length === 0 ? (
              <EmptyState
                message={
                  error ||
                  (searchQuery.length >= 3
                    ? `No transport found for "${searchQuery}". Try a different route or clear filters.`
                    : "No transport options found. Add transport from the Admin Dashboard first.")
                }
              />
            ) : (
              <div className="space-y-3">
                {filteredTransports.map((transport) => (
                  <div key={transport.id} data-transport-id={transport.id}>
                    <CompactTransportCard
                      transport={transport}
                      isSelected={selectedTransportId === transport.id}
                      onClick={() => {
                        setSelectedTransportId(transport.id);
                        handleMarkerClick(transport.id);
                        handleOpenYelpDetail(transport);
                      }}
                      onViewDetails={() => handleOpenYelpDetail(transport)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map - Right */}
        <div
          className={`${isMapExpanded ? "h-1/2" : "w-1/2"} bg-gray-100 p-3`}
          style={{ height: isMapExpanded ? "50%" : "calc(100vh - 120px)" }}
        >
          <InteractiveMap
            items={filteredTransports.map((t) => ({
              id: t.id,
              name: t.name,
              location: `${t.from} → ${t.to}`,
              priceTag: `${t.currency} ${t.price}`,
              rating: t.rating || 4.8,
              image: t.image,
              lat: t.lat,
              lng: t.lng,
              category: "transport",
            }))}
            selectedId={selectedTransportId}
            onMarkerClick={(id) => {
              setSelectedTransportId(id);
              handleMarkerClick(id);
            }}
            center={mapCenter}
          />
        </div>
      </div>

      {/* Yelp Business Detail Modal */}
      <YelpDetailModal
        isOpen={showYelpModal}
        onClose={() => setShowYelpModal(false)}
        data={yelpDetailData}
      />
    </div>
  );
};

export default TransportPage;        