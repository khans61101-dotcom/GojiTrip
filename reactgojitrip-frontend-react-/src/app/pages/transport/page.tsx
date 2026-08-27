// TransportPage.tsx - With Split Layout (Left List + Right Map)
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { SafeImage } from "@/components/common/SafeImage";
import { apiRequest } from "@/lib/api";
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
} from "lucide-react";

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
}

interface FilterState {
  transportType: string[];
  sortBy: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

/* -------------------------------------------------------
   Helper: Convert Admin vehicle type to Public UI type
------------------------------------------------------- */
function getTransportType(
  vehicleType?: string,
): TransportType {
  const type = (vehicleType || "").toLowerCase();

  if (type.includes("plane") || type.includes("flight") || type.includes("air") || type.includes("helicopter")) {
    return "plane";
  }
  if (type.includes("ship") || type.includes("boat") || type.includes("ferry") || type.includes("cruise") || type.includes("water")) {
    return "ship";
  }
  if (type.includes("bus") || type.includes("hiace") || type.includes("van") || type.includes("coach")) {
    return "bus";
  }
  if (type.includes("bike") || type.includes("motorcycle") || type.includes("ev") || type.includes("scooter")) {
    return "bike";
  }
  if (type.includes("train") || type.includes("metro")) {
    return "train";
  }
  return "car";
}

/* -------------------------------------------------------
   Helper: Convert Backend Transport -> Public Transport
------------------------------------------------------- */
function mapTransport(item: BackendTransport): TransportOption {
  const vehicleType = item.vehicleType ?? item.vehicle_type ?? "Other";
  const vehicleNumber = item.vehicleNumber ?? item.vehicle_number ?? "";
  const operatorName = item.operatorName ?? item.operator_name ?? "Transport Operator";
  const route = item.route ?? "";
  const pickupPoint = item.pickupPoint ?? item.pickup_point ?? "";
  const departureTime = item.departureTime ?? item.departure_time ?? "";
  const fare = Number(item.fare ?? 0);
  const currency = item.currency ?? "NPR";
  const seatCapacity = Number(item.seatCapacity ?? item.seat_capacity ?? 0);
  const driverPhoto = item.driverPhotoUrl ?? item.driver_photo_url ?? "";
  const vehiclePhotos = item.vehiclePhotos ?? item.vehicle_photos ?? [];
  const image = vehiclePhotos.length > 0 ? vehiclePhotos[0] : driverPhoto || "/logo/gojitriplogo.jpg";
  const activeStatus = item.activeStatus ?? item.active_status ?? "Active";
  const approvalStatus = item.approvalStatus ?? item.approval_status ?? "Published";
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
    const routeParts = route.split(/→|->|\s+to\s+|-/i).map((part) => part.trim()).filter(Boolean);
    if (routeParts.length >= 2) {
      from = pickupPoint || routeParts[0];
      to = routeParts[routeParts.length - 1];
    } else {
      to = route;
    }
  }

  return {
    id: String(item.id),
    type,
    name: operatorName !== "Transport Operator" ? operatorName : `${vehicleType} Transport`,
    description: [vehicleType, vehicleNumber ? `Vehicle No: ${vehicleNumber}` : "", route ? `Route: ${route}` : ""]
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
    rating: 0,
    provider: operatorName,
    amenities: [vehicleType, (item.licenceVerified ?? item.licence_verified) ? "Licence Verified" : "", activeStatus, approvalStatus]
      .filter(Boolean),
    lat,
    lng,
  };
}

// ============= LOADING SKELETON =============
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((item) => (
      <div key={item} className="flex gap-3 p-3 bg-white rounded-xl border border-gray-200 animate-pulse">
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
    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Transport Found</h3>
    <p className="text-gray-500 max-w-md mx-auto text-center">{message}</p>
  </div>
);

// ============= MAP COMPONENT =============
const MapComponent: React.FC<{
  transports: TransportOption[];
  selectedTransportId?: string | null;
  onMarkerClick: (transportId: string) => void;
  center?: { lat: number; lng: number };
}> = ({ transports, selectedTransportId, onMarkerClick, center = { lat: 27.7172, lng: 85.324 } }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap`;
      script.async = true;
      script.defer = true;

      window.initMap = () => {
        initializeMap();
      };

      document.head.appendChild(script);

      return () => {
        const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
        scripts.forEach((s) => s.remove());
        window.initMap = () => {};
      };
    };

    const initializeMap = () => {
      if (!mapRef.current) {
        console.error("Map container not found");
        return;
      }

      try {
        console.log("Initializing map with center:", center);
        
        const mapOptions = {
          center: center,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        };

        const map = new window.google.maps.Map(mapRef.current, mapOptions);
        setIsMapLoaded(true);
        setMapError(null);

        const typeColors: Record<string, string> = {
          car: "#3B82F6",
          bus: "#10B981",
          train: "#8B5CF6",
          bike: "#F59E0B",
        };

        const typeIcons: Record<string, string> = {
          car: "🚗",
          bus: "🚌",
          train: "🚆",
          bike: "🏍️",
        };

        transports.forEach((transport, index) => {
          let position;
          if (transport.lat && transport.lng) {
            position = { lat: transport.lat, lng: transport.lng };
          } else {
            const latOffset = (Math.random() - 0.5) * 0.05;
            const lngOffset = (Math.random() - 0.5) * 0.05;
            position = {
              lat: center.lat + latOffset,
              lng: center.lng + lngOffset,
            };
          }

          const marker = new window.google.maps.Marker({
            position,
            map: map,
            title: transport.name,
            animation: window.google.maps.Animation.DROP,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: selectedTransportId === transport.id ? "#2563EB" : typeColors[transport.type] || "#3B82F6",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
              scale: selectedTransportId === transport.id ? 14 : 10,
            },
            label: {
              text: `${index + 1}`,
              color: "#FFFFFF",
              fontSize: "10px",
              fontWeight: "bold",
            },
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 18px;">${typeIcons[transport.type] || "🚗"}</span>
                  <strong style="font-size: 14px;">${transport.name}</strong>
                </div>
                <div style="font-size: 12px; color: #666; margin: 4px 0;">
                  📍 ${transport.from} → ${transport.to}
                </div>
                <div style="font-size: 12px; color: #666; margin: 4px 0;">
                  🕐 ${transport.departureTime}
                </div>
                <div style="font-size: 12px; color: #666; margin: 4px 0;">
                  👤 Capacity: ${transport.capacity}
                </div>
                <div style="font-size: 14px; font-weight: bold; color: #1f2937; margin: 4px 0;">
                  ${transport.currency} ${transport.price.toLocaleString()}
                </div>
                <button 
                  onclick="window.handleTransportBook('${transport.id}')"
                  style="
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 4px 16px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 4px;
                    width: 100%;
                  "
                >
                  Book Now
                </button>
              </div>
            `,
          });

          marker.addListener("click", () => {
            onMarkerClick(transport.id);
            infoWindow.open(map, marker);
          });

          if (selectedTransportId === transport.id) {
            setTimeout(() => {
              infoWindow.open(map, marker);
              map.panTo(position);
              map.setZoom(15);
            }, 500);
          }
        });

        if (transports.length > 1) {
          const bounds = new window.google.maps.LatLngBounds();
          transports.forEach((transport) => {
            let pos;
            if (transport.lat && transport.lng) {
              pos = { lat: transport.lat, lng: transport.lng };
            } else {
              const latOffset = (Math.random() - 0.5) * 0.05;
              const lngOffset = (Math.random() - 0.5) * 0.05;
              pos = {
                lat: center.lat + latOffset,
                lng: center.lng + lngOffset,
              };
            }
            bounds.extend(pos);
          });
          map.fitBounds(bounds);
        }

        (window as any).handleTransportBook = (transportId: string) => {
          onMarkerClick(transportId);
        };

      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError("Failed to load map. Please check your API key.");
      }
    };

    loadGoogleMaps();

    return () => {
      delete (window as any).handleTransportBook;
    };
  }, [center, transports, selectedTransportId, onMarkerClick]);

  if (mapError) {
    return (
      <div className="h-full w-full bg-gray-100 rounded-2xl flex flex-col items-center justify-center p-8">
        <div className="text-5xl mb-4">🗺️</div>
        <p className="text-gray-700 font-medium text-center">Map unavailable</p>
        <p className="text-gray-500 text-sm text-center mt-1">{mapError}</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden bg-gray-200 relative">
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: "500px" }} />
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}
      {isMapLoaded && transports.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-xs text-gray-600">
          📍 {transports.length} transport{transports.length > 1 ? 's' : ''} displayed
        </div>
      )}
    </div>
  );
};

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
        isSelected ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-md" : "border-gray-200 hover:border-emerald-300"
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
                <span className="text-xs font-extrabold text-amber-900">{transport.rating || 4.8}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-600 text-xs mb-2 flex-wrap">
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                <span>{transport.from} ➔ {transport.to}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                <span>Dept: {transport.departureTime}</span>
              </div>
            </div>

            {/* Amenities pills */}
            <div className="flex gap-1.5 flex-wrap">
              {transport.amenities.slice(0, 3).map((amenity, index) => (
                <span key={index} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-200/60">
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
                className="px-3 py-1 rounded-lg text-xs font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
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
    const locParam = params.get("location") || params.get("search") || params.get("q") || params.get("routeStop");
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
  });
  const [selectedTransportId, setSelectedTransportId] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [yelpDetailData, setYelpDetailData] = useState<YelpDetailData | null>(null);
  const [showYelpModal, setShowYelpModal] = useState(false);
  const transportListRef = useRef<HTMLDivElement>(null);

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
      galleryImages: (t as any).vehiclePhotos || (t as any).photos || (t.image ? [t.image] : []),
      description: (t as any).description || `${t.name} (${t.provider}) provides reliable, safe ${t.type} passenger transport service along the ${t.from} to ${t.to} corridor. Driver photo and vehicle licences are fully verified.`,
      amenities: (t as any).amenities || t.amenities || ["AC Vehicle", "Reclining Seats", "Luggage Storage", "GPS Tracking", "Verified Driver"],
      hours: t.departureTime ? [{ day: "Daily Schedule", time: `Departure: ${t.departureTime}` }] : undefined,
      priceTag: `${t.currency} ${t.price} / seat`,
      entityType: "transport",
      offerings: [
        { title: `Regular Seat Ticket (${t.from} → ${t.to})`, price: `${t.currency} ${t.price}`, desc: `Departure: ${t.departureTime} • Vehicle Type: ${t.type.toUpperCase()}` },
        { title: "Full Vehicle Private Charter", price: `${t.currency} ${(t.price * 6).toLocaleString()}`, desc: "Private booking for families & groups with custom pickup location." },
      ],
    });
    setShowYelpModal(true);
  };

  const fetchTransports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest<BackendTransport[]>("/transport");
      console.log("Transport API response:", response);

      const backendData = Array.isArray(response) ? response : [];
      const mappedData = backendData.map(mapTransport);
      setTransports(mappedData);
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

  const filteredTransports = transports.filter((transport) => {
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      const searchableText = [
        transport.name,
        transport.description,
        transport.from,
        transport.to,
        transport.provider,
        transport.type,
        transport.currency,
      ]
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
    }

    if (filters.transportType.length > 0 && !filters.transportType.includes(transport.type)) {
      return false;
    }

    return true;
  });

  const sortedTransports = [...filteredTransports].sort((a, b) => {
    if (filters.sortBy === "price-low") {
      return a.price - b.price;
    }
    if (filters.sortBy === "price-high") {
      return b.price - a.price;
    }
    if (filters.sortBy === "capacity") {
      return b.capacity - a.capacity;
    }
    return 0;
  });

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
    setFilters({
      transportType: [],
      sortBy: "recommended",
    });
  };

  const handleMarkerClick = (transportId: string) => {
    setSelectedTransportId(transportId);
    if (transportListRef.current) {
      const cards = transportListRef.current.querySelectorAll("[data-transport-id]");
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
                  placeholder="Search routes, operators, or transport types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/95 text-gray-900 placeholder-gray-500 border-0 rounded-xl focus:ring-2 focus:ring-white/50 outline-none transition-all shadow-sm text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/30 transition-all text-white flex-shrink-0"
              >
                {isMapExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                <span className="hidden lg:inline text-sm">{isMapExpanded ? "Collapse" : "Expand"}</span>
              </button>
            </div>
          </div>

          {/* Transport Type Filters */}
          <div className="pb-3 flex gap-2 flex-wrap">
            {["plane", "ship", "car", "bus", "train", "bike"].map((type) => {
              const selected = filters.transportType.includes(type);
              const labels: Record<string, string> = {
                plane: "✈️ Plane",
                ship: "🚢 Ship / Ferry",
                car: "🚗 Car / SUV",
                bus: "🚌 Bus / Van",
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
            {(searchQuery || filters.transportType.length > 0) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/80 text-white hover:bg-red-500 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className={`flex-1 flex transition-all duration-300 ${isMapExpanded ? "flex-col-reverse" : "flex-row"}`}>
        {/* Transport List - Left */}
        <div
          className={`${isMapExpanded ? "h-1/2" : "w-1/2"} overflow-y-auto bg-gray-50 border-r border-gray-200`}
          style={{ height: isMapExpanded ? "50%" : "calc(100vh - 120px)" }}
          ref={transportListRef}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-700 font-medium text-sm">
                {loading ? "Loading..." : `${sortedTransports.length} transport options found`}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">Sort:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="capacity">Capacity</option>
                </select>
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : sortedTransports.length === 0 ? (
              <EmptyState message={error || "No transport options found. Add transport from the Admin Dashboard first."} />
            ) : (
              <div className="space-y-3">
                {sortedTransports.map((transport) => (
                  <CompactTransportCard
                    key={transport.id}
                    transport={transport}
                    isSelected={selectedTransportId === transport.id}
                    onClick={() => {
                      setSelectedTransportId(transport.id);
                      handleMarkerClick(transport.id);
                      handleOpenYelpDetail(transport);
                    }}
                    onViewDetails={() => handleOpenYelpDetail(transport)}
                  />
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
            items={sortedTransports.map((t) => ({
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
            center={{ lat: 28.2096, lng: 83.9856 }}
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