"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SafeImage } from "@/components/common/SafeImage";
import { apiRequest } from "@/lib/api";
import {
  Search,
  Filter,
  Clock,
  Car,
  Bus,
  Bike,
  Users,
  Train,
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
}

interface TransportOption {
  id: string;
  type: "car" | "bus" | "train" | "bike";
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
}

interface FilterState {
  transportType: string[];
  sortBy: string;
}

/* -------------------------------------------------------
   Helper: Convert Admin vehicle type to Public UI type
------------------------------------------------------- */
function getTransportType(
  vehicleType?: string,
): "car" | "bus" | "train" | "bike" {
  const type = (vehicleType || "").toLowerCase();

  if (type === "bus") {
    return "bus";
  }

  if (type === "ev") {
    return "bike";
  }

  if (type === "bike" || type === "motorcycle") {
    return "bike";
  }

  if (type === "train") {
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

  /*
   * Route format can be:
   * Kathmandu - Pokhara
   * Kathmandu → Pokhara
   * Kathmandu to Pokhara
   *
   * We try to split it for the public UI.
   */
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

    /*
     * Backend TransportEntry does not have
     * an "available seats" field.
     * Therefore capacity is used here.
     */
    available: seatCapacity,

    /*
     * Backend TransportEntry does not contain
     * rating.
     */
    rating: 0,

    provider: operatorName,

    amenities: [
      vehicleType,
      (item.licenceVerified ?? item.licence_verified) ? "Licence Verified" : "",
      activeStatus,
      approvalStatus,
    ].filter(Boolean),
  };
}

/* -------------------------------------------------------
   Transport Card
------------------------------------------------------- */
const TransportCard: React.FC<{
  transport: TransportOption;
}> = ({ transport }) => {
  const typeIcons = {
    car: Car,
    bus: Bus,
    train: Train,
    bike: Bike,
  };

  const TypeIcon = typeIcons[transport.type];

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <SafeImage
          src={transport.image}
          fallbackSrc="/logo/gojitriplogo.jpg"
          alt={transport.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Transport Type */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm">
          <TypeIcon className="h-4 w-4 text-blue-600" />

          <span className="text-xs font-semibold text-gray-800">
            {transport.type.toUpperCase()}
          </span>
        </div>

        {/* Available Seats */}
        {transport.available > 0 && (
          <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
            {transport.available} seats
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">
              {transport.name}
            </h3>

            <p className="text-sm text-gray-500 mt-1">{transport.provider}</p>
          </div>

          {transport.rating > 0 && (
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg shrink-0">
              <span className="text-yellow-400">★</span>

              <span className="font-semibold text-gray-900">
                {transport.rating}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {transport.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {transport.description}
          </p>
        )}

        {/* Route */}
        <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-lg p-3">
          <div className="text-center min-w-0 flex-1">
            <p className="text-xs text-gray-500 mb-1">Pickup</p>

            <p className="font-semibold text-gray-900 text-sm truncate">
              {transport.from}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {transport.departureTime}
            </p>
          </div>

          <div className="px-3 text-center">
            <Clock className="h-4 w-4 text-blue-600 mx-auto mb-1" />

            <p className="text-xs text-gray-500">{transport.duration}</p>
          </div>

          <div className="text-center min-w-0 flex-1">
            <p className="text-xs text-gray-500 mb-1">Route</p>

            <p className="font-semibold text-gray-900 text-sm truncate">
              {transport.to}
            </p>

            <p className="text-xs text-gray-500 mt-1">Flexible</p>
          </div>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Users className="h-4 w-4 text-blue-600" />

          <span>
            Capacity:{" "}
            <strong className="text-gray-900">{transport.capacity}</strong>
          </span>
        </div>

        {/* Amenities */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {transport.amenities
            .filter(Boolean)
            .slice(0, 4)
            .map((amenity, index) => (
              <span
                key={`${amenity}-${index}`}
                className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium"
              >
                {amenity}
              </span>
            ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-3">
          <div>
            <span className="text-xl font-bold text-gray-900">
              {transport.currency} {transport.price.toLocaleString()}
            </span>

            {transport.price > 0 && (
              <span className="text-gray-500 text-sm ml-1">/trip</span>
            )}
          </div>

          <button
            type="button"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   Loading Skeleton
------------------------------------------------------- */
const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <div
        key={item}
        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse"
      >
        <div className="h-52 bg-gray-200" />

        <div className="p-5 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4" />

          <div className="h-4 bg-gray-200 rounded w-1/2" />

          <div className="h-16 bg-gray-200 rounded" />

          <div className="h-16 bg-gray-200 rounded" />

          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded w-20" />
            <div className="h-6 bg-gray-200 rounded w-20" />
            <div className="h-6 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* -------------------------------------------------------
   Empty State
------------------------------------------------------- */
const EmptyState: React.FC<{
  message: string;
}> = ({ message }) => (
  <div className="text-center py-20">
    <div className="text-6xl mb-5">🚌</div>

    <h3 className="text-2xl font-semibold text-gray-700 mb-2">
      No Transport Found
    </h3>

    <p className="text-gray-500 max-w-md mx-auto">{message}</p>
  </div>
);

/* -------------------------------------------------------
   Main Transport Page
------------------------------------------------------- */
const TransportPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const [transports, setTransports] = useState<TransportOption[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [filters, setFilters] = useState<FilterState>({
    transportType: [],
    sortBy: "recommended",
  });

  /* -----------------------------------------------------
     Fetch REAL Transport data from Admin/API
  ----------------------------------------------------- */
  const fetchTransports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * IMPORTANT:
       * This is the same endpoint used by
       * Admin Transport module.
       */
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

  /* -----------------------------------------------------
     Initial API call
  ----------------------------------------------------- */
  useEffect(() => {
    void fetchTransports();
  }, [fetchTransports]);

  /* -----------------------------------------------------
     Search + Filters
  ----------------------------------------------------- */
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

    if (
      filters.transportType.length > 0 &&
      !filters.transportType.includes(transport.type)
    ) {
      return false;
    }

    return true;
  });

  /* -----------------------------------------------------
     Sort
  ----------------------------------------------------- */
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

  /* -----------------------------------------------------
     Toggle transport filter
  ----------------------------------------------------- */
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

  /* -----------------------------------------------------
     Clear Filters
  ----------------------------------------------------- */
  const clearFilters = () => {
    setSearchQuery("");

    setFilters({
      transportType: [],
      sortBy: "recommended",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* -------------------------------------------------
          Hero
      ------------------------------------------------- */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">
              🚌 Nepal Transport Options
            </h1>

            <p className="text-white/90 text-base md:text-lg">
              Find and book the best transportation across Nepal
            </p>
          </div>

          {/* Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

              <input
                type="text"
                placeholder="Search routes, operators, or transport types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 shadow-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                void fetchTransports();
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all"
            >
              <Filter className="h-5 w-5" />

              <span>Refresh</span>
            </button>
          </div>

          {/* Transport Type Filters */}
          <div className="flex gap-3 mt-6 flex-wrap">
            {[
              {
                label: "Car",
                value: "car",
              },
              {
                label: "Bus",
                value: "bus",
              },
              {
                label: "Train",
                value: "train",
              },
              {
                label: "Bike",
                value: "bike",
              },
            ].map((type) => {
              const selected = filters.transportType.includes(type.value);

              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => toggleTransportType(type.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selected
                      ? "bg-white text-blue-600 shadow-md"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {type.label}
                </button>
              );
            })}

            {(searchQuery || filters.transportType.length > 0) && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 rounded-full text-sm font-medium bg-red-500/80 text-white hover:bg-red-500 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------
          Sort / Count
      ------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Available Transport</p>

            <p className="text-xl font-semibold text-gray-900">
              {loading ? "Loading..." : `${sortedTransports.length} options`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="sort" className="text-sm text-gray-600">
              Sort by
            </label>

            <select
              id="sort"
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((previous) => ({
                  ...previous,
                  sortBy: e.target.value,
                }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recommended">Recommended</option>

              <option value="price-low">Price: Low to High</option>

              <option value="price-high">Price: High to Low</option>

              <option value="capacity">Capacity</option>
            </select>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------
          Error
      ------------------------------------------------- */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            <p className="font-medium">{error}</p>

            <button
              type="button"
              onClick={() => {
                void fetchTransports();
              }}
              className="mt-2 text-sm font-semibold underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------
          Transport Cards
      ------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <LoadingSkeleton />
        ) : sortedTransports.length === 0 ? (
          <EmptyState
            message={
              error ||
              "No transport options found. Add transport from the Admin Dashboard first."
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTransports.map((transport) => (
              <TransportCard key={transport.id} transport={transport} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportPage;
