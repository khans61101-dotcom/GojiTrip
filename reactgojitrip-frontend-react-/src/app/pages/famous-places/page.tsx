"use client";

import "@/styles/pages/famous-places/famous-places.css";

import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import {
  MapPin,
  Star,
  Clock,
  ArrowRight,
  Search,
  X,
  Navigation,
  Loader2,
} from "lucide-react";

import { SafeImage } from "@/components/common/SafeImage";
import { apiRequest } from "@/lib/api";

// ============================================================
// TYPES
// ============================================================

interface RouteStop {
  id?: string | number;
  name: string;

  address?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;

  type?: string;
  subtitle?: string;
  details?: string;

  distanceFromPrevious?: number | string;
  durationFromPrevious?: string;

  recommended?: boolean;

  image?: string;
  images?: string[];

  imageUrl?: string;
  photoUrl?: string;

  description?: string;
  rating?: number;
  category?: string[];
  categories?: string[];
  bestTime?: string;
  price?: number;

  location?: string;
}

interface RoutePlanResponse {
  source?: {
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    placeId?: string;
  };

  destination?: {
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    placeId?: string;
  };

  date?: string;
  travellers?: number;

  distance?: number | string;
  duration?: string;

  stops?: RouteStop[];
  intermediateStops?: RouteStop[];
  route?: RouteStop[];

  message?: string;
}

interface FamousPlace {
  id: string;

  name: string;

  description: string;

  image?: string;

  images?: string[];

  rating: number;

  location: string;

  price: number;

  category: string[];

  bestTime: string;

  type?: string;

  latitude?: number;

  longitude?: number;

  placeId?: string;

  distanceFromPrevious?: number | string;

  durationFromPrevious?: string;

  subtitle?: string;

  details?: string;
}

// ============================================================
// HELPERS
// ============================================================

function getFirstImage(item: RouteStop | null | undefined): string | undefined {
  if (!item) {
    return undefined;
  }

  if (typeof item.image === "string" && item.image.trim()) {
    return item.image;
  }

  if (Array.isArray(item.images) && item.images.length > 0) {
    const first = item.images.find(
      (image) => typeof image === "string" && image.trim(),
    );

    if (first) {
      return first;
    }
  }

  if (typeof item.imageUrl === "string" && item.imageUrl.trim()) {
    return item.imageUrl;
  }

  if (typeof item.photoUrl === "string" && item.photoUrl.trim()) {
    return item.photoUrl;
  }

  return undefined;
}

function normalizePlace(item: RouteStop, index: number): FamousPlace {
  const categories = Array.isArray(item.category)
    ? item.category
    : Array.isArray(item.categories)
      ? item.categories
      : item.type
        ? [item.type]
        : ["Route Place"];

  return {
    id: String(item.id ?? item.placeId ?? `route-place-${index}`),

    name: item.name || "Unknown Place",

    description:
      item.description ??
      item.details ??
      item.subtitle ??
      "Recommended place on your selected route.",

    image: getFirstImage(item),

    images: Array.isArray(item.images) ? item.images : undefined,

    rating: typeof item.rating === "number" ? item.rating : 0,

    location: item.location ?? item.address ?? "Route location",

    price: typeof item.price === "number" ? item.price : 0,

    category: categories,

    bestTime: item.bestTime ?? "Best time varies by season",

    type: item.type ?? "stop",

    latitude: typeof item.latitude === "number" ? item.latitude : undefined,

    longitude: typeof item.longitude === "number" ? item.longitude : undefined,

    placeId: item.placeId,

    distanceFromPrevious: item.distanceFromPrevious,

    durationFromPrevious: item.durationFromPrevious,

    subtitle: item.subtitle,

    details: item.details,
  };
}

// ============================================================
// COMPONENT
// ============================================================

const FamousPlacesPage: React.FC = () => {
  // ==========================================================
  // REACT ROUTER
  // ==========================================================

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  // ==========================================================
  // ROUTE SEARCH PARAMETERS
  // ==========================================================

  const source = searchParams.get("source") || "";

  const destination = searchParams.get("destination") || "";

  const date = searchParams.get("date") || "";

  const travellers = searchParams.get("travellers") || "";

  // ==========================================================
  // STATE
  // ==========================================================

  const [loading, setLoading] = React.useState(true);

  const [places, setPlaces] = React.useState<FamousPlace[]>([]);

  const [searchTerm, setSearchTerm] = React.useState("");

  const [categoryFilter, setCategoryFilter] = React.useState("");

  const [ratingFilter, setRatingFilter] = React.useState("");

  const [routeInfo, setRouteInfo] = React.useState<RoutePlanResponse | null>(
    null,
  );

  const [error, setError] = React.useState("");

  // ==========================================================
  // FETCH ROUTE PLACES
  // ==========================================================

  React.useEffect(() => {
    let cancelled = false;

    async function loadRoutePlaces() {
      try {
        setLoading(true);
        setError("");

        // ----------------------------------------------------
        // No route selected
        // ----------------------------------------------------

        if (!source || !destination) {
          setPlaces([]);
          setRouteInfo(null);
          setLoading(false);
          return;
        }

        console.log("Fetching route places:", {
          source,
          destination,
          date,
          travellers,
        });

        // ----------------------------------------------------
        // PLAN ROUTE
        // ----------------------------------------------------

        const response = await apiRequest<RoutePlanResponse>("/routes/plan", {
          method: "POST",

          body: {
            source: {
              name: source.trim(),
            },

            destination: {
              name: destination.trim(),
            },

            date: date || undefined,

            travellers: travellers ? Number(travellers) : undefined,
          },
        });

        if (cancelled) {
          return;
        }

        console.log("Route plan response:", response);

        setRouteInfo(response);

        // ----------------------------------------------------
        // TAKE INTERMEDIATE STOPS
        // ----------------------------------------------------

        const routeStops =
          response.intermediateStops ?? response.stops ?? response.route ?? [];

        // ----------------------------------------------------
        // REMOVE DUPLICATES
        // ----------------------------------------------------

        const uniqueStops = routeStops.filter((stop, index, array) => {
          const currentName = (stop.name || "").trim().toLowerCase();

          return (
            array.findIndex(
              (item) => (item.name || "").trim().toLowerCase() === currentName,
            ) === index
          );
        });

        // ----------------------------------------------------
        // CONVERT ROUTE STOPS → FAMOUS PLACES
        // ----------------------------------------------------

        const normalized = uniqueStops.map((stop, index) =>
          normalizePlace(stop, index),
        );

        setPlaces(normalized);

        // ----------------------------------------------------
        // FETCH ACTUAL PLACE DETAILS
        // ----------------------------------------------------

        try {
          const placeResults = await Promise.all(
            normalized.map(async (place) => {
              try {
                const query = encodeURIComponent(place.name);

                const placeResponse = await apiRequest<unknown>(
                  `/places?search=${query}`,
                  {
                    method: "GET",
                  },
                );

                const responseData = placeResponse as {
                  data?: unknown;
                };

                let backendData: RouteStop | null = null;

                if (Array.isArray(placeResponse)) {
                  backendData =
                    (placeResponse[0] as RouteStop | undefined) ?? null;
                } else if (Array.isArray(responseData?.data)) {
                  backendData =
                    (responseData.data[0] as RouteStop | undefined) ?? null;
                } else if (
                  responseData?.data &&
                  typeof responseData.data === "object"
                ) {
                  backendData = responseData.data as RouteStop;
                } else if (placeResponse && typeof placeResponse === "object") {
                  backendData = placeResponse as RouteStop;
                }

                return {
                  routePlace: place,
                  backendData,
                };
              } catch (placeError) {
                console.warn(
                  `Unable to fetch details for ${place.name}`,
                  placeError,
                );

                return {
                  routePlace: place,
                  backendData: null,
                };
              }
            }),
          );

          if (cancelled) {
            return;
          }

          const merged = placeResults.map(({ routePlace, backendData }) => {
            if (!backendData) {
              return routePlace;
            }

            return normalizePlace(
              {
                ...routePlace,
                ...backendData,

                // Preserve route information
                distanceFromPrevious: routePlace.distanceFromPrevious,

                durationFromPrevious: routePlace.durationFromPrevious,

                placeId: backendData.placeId ?? routePlace.placeId,
              },
              0,
            );
          });

          setPlaces(merged);
        } catch (placeError) {
          console.warn(
            "Place details API unavailable. Using route data:",
            placeError,
          );
        }
      } catch (err: unknown) {
        console.error("Route places fetch failed:", err);

        if (!cancelled) {
          const errorMessage =
            err instanceof Error ? err.message : "Unable to load route places.";

          setError(errorMessage);

          setPlaces([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRoutePlaces();

    return () => {
      cancelled = true;
    };
  }, [source, destination, date, travellers]);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredPlaces = places.filter((item) => {
    const query = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.some((category) => category.toLowerCase().includes(query));

    const matchesCategory =
      !categoryFilter ||
      item.category.some(
        (category) => category.toLowerCase() === categoryFilter.toLowerCase(),
      );

    const matchesRating = !ratingFilter || item.rating >= Number(ratingFilter);

    return matchesSearch && matchesCategory && matchesRating;
  });

  // ==========================================================
  // OPEN PLACE DETAILS
  // ==========================================================

  const openPlaceDetails = (place: FamousPlace) => {
    const params = new URLSearchParams();

    params.set("name", place.name);

    if (place.placeId) {
      params.set("placeId", place.placeId);
    }

    if (place.latitude !== undefined) {
      params.set("latitude", String(place.latitude));
    }

    if (place.longitude !== undefined) {
      params.set("longitude", String(place.longitude));
    }

    if (source) {
      params.set("source", source);
    }

    if (destination) {
      params.set("destination", destination);
    }

    navigate(
      `/famous-places/${encodeURIComponent(place.id)}?${params.toString()}`,
    );
  };

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setRatingFilter("");
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="famous-places-hero">
        <div className="famous-places-hero-container">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Famous Places Along Your Route
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-8">
              Discover attractions, sightseeing spots, rest stops and famous
              places between your source and destination.
            </p>

            {/* ==================================================
                SELECTED ROUTE
            ================================================== */}

            {source && destination && (
              <div className="bg-white rounded-2xl p-4 shadow-xl mb-6">
                <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                    <MapPin size={17} className="text-blue-600" />

                    <span className="font-semibold text-gray-800">
                      {source}
                    </span>
                  </div>

                  <ArrowRight size={20} className="text-gray-400" />

                  <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
                    <MapPin size={17} className="text-red-500" />

                    <span className="font-semibold text-gray-800">
                      {destination}
                    </span>
                  </div>
                </div>

                {routeInfo?.distance && (
                  <div className="mt-3 text-sm text-gray-500">
                    Route distance: <strong>{routeInfo.distance}</strong>
                    {routeInfo.duration && <> • {routeInfo.duration}</>}
                  </div>
                )}
              </div>
            )}

            {/* ==================================================
                SEARCH
            ================================================== */}

            <div className="bg-white rounded-xl p-4 shadow-xl">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    placeholder="Search route places..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          NO ROUTE
      ====================================================== */}

      {!source || !destination ? (
        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border">
            <Navigation size={48} className="mx-auto mb-5 text-blue-600" />

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Search a Route First
            </h2>

            <p className="text-gray-500 mb-6">
              Select source and destination from the route planner to see famous
              places along your journey.
            </p>

            <button
              type="button"
              onClick={() => navigate("/routes")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg
                hover:bg-blue-700 transition-colors font-medium"
            >
              Plan a Route
            </button>
          </div>
        </section>
      ) : (
        <>
          {/* ====================================================
              FILTERS
          ==================================================== */}

          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      text-gray-800 bg-white"
                  >
                    <option value="">All Categories</option>

                    <option value="sightseeing">Sightseeing</option>

                    <option value="stop">Route Stop</option>

                    <option value="rest">Rest Stop</option>

                    <option value="food">Food</option>

                    <option value="fuel">Fuel</option>

                    <option value="hotel">Hotel</option>
                  </select>

                  <select
                    value={ratingFilter}
                    onChange={(event) => setRatingFilter(event.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      text-gray-800 bg-white"
                  >
                    <option value="">All Ratings</option>

                    <option value="4">4+ Stars</option>

                    <option value="4.5">4.5+ Stars</option>

                    <option value="4.8">4.8+ Stars</option>
                  </select>

                  {(searchTerm || categoryFilter || ratingFilter) && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="px-4 py-2.5 rounded-lg bg-gray-100
                        text-gray-700 hover:bg-gray-200"
                    >
                      <X size={15} className="inline mr-1" />
                      Clear
                    </button>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {filteredPlaces.length}
                  </span>{" "}
                  {filteredPlaces.length === 1 ? "place" : "places"} on route
                </div>
              </div>
            </div>
          </section>

          {/* ====================================================
              PLACES
          ==================================================== */}

          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="text-center">
                  <Loader2
                    size={40}
                    className="animate-spin text-blue-600 mx-auto mb-4"
                  />

                  <p className="text-gray-500">
                    Finding famous places along your route...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl p-10 text-center border">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Unable to load route places
                </h3>

                <p className="text-gray-500 mb-5">{error}</p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg"
                >
                  Try Again
                </button>
              </div>
            ) : filteredPlaces.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <div className="text-6xl mb-5">🗺️</div>

                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  No Famous Places Found
                </h3>

                <p className="text-gray-500 mb-6">
                  No intermediate places were returned for this route.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/routes")}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg"
                >
                  Change Route
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlaces.map((item, index) => (
                  <article
                    key={`${item.id}-${index}`}
                    onClick={() => openPlaceDetails(item)}
                    className="group bg-white rounded-xl shadow-sm overflow-hidden
                        border border-gray-100 hover:shadow-xl hover:-translate-y-1
                        transition-all duration-300 cursor-pointer"
                  >
                    {/* IMAGE */}

                    <div className="relative w-full h-56 overflow-hidden bg-gray-100">
                      {item.image ? (
                        <SafeImage
                          src={item.image}
                          alt={`${item.name} - ${item.location}`}
                          fill
                          className="object-cover transition-transform duration-500
                              group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw,
                              (max-width: 1024px) 50vw,
                              33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-slate-200">
                          <div className="text-center">
                            <MapPin
                              size={42}
                              className="mx-auto text-blue-500 mb-2"
                            />

                            <span className="text-sm text-gray-500">
                              {item.name}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* ROUTE BADGE */}

                      <div
                        className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm
                            px-3 py-1.5 rounded-full text-xs font-semibold
                            text-blue-600 shadow-sm"
                      >
                        {item.type === "sightseeing"
                          ? "Famous Place"
                          : item.subtitle || "Route Stop"}
                      </div>

                      {/* RATING */}

                      {item.rating > 0 && (
                        <div
                          className="absolute top-3 right-3 bg-white/95
                              backdrop-blur-sm px-3 py-1.5 rounded-full
                              flex items-center gap-1 shadow-sm"
                        >
                          <Star
                            size={14}
                            className="fill-yellow-400 text-yellow-400"
                          />

                          <span className="text-sm font-semibold text-gray-800">
                            {item.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}

                    <div className="p-5">
                      <h3 className="text-xl font-semibold text-gray-900 leading-tight mb-2">
                        {item.name}
                      </h3>

                      <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                        <MapPin size={15} className="text-blue-500" />

                        {item.location}
                      </p>

                      {/* DISTANCE */}

                      {(item.distanceFromPrevious ||
                        item.durationFromPrevious) && (
                        <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-500">
                          {item.distanceFromPrevious && (
                            <span>📍 {item.distanceFromPrevious}</span>
                          )}

                          {item.durationFromPrevious && (
                            <span>
                              <Clock size={12} className="inline mr-1" />

                              {item.durationFromPrevious}
                            </span>
                          )}
                        </div>
                      )}

                      {/* DESCRIPTION */}

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {item.description}
                      </p>

                      {/* CATEGORIES */}

                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.category.slice(0, 3).map((category) => (
                          <span
                            key={category}
                            className="text-xs bg-blue-50 text-blue-600
                                    px-2.5 py-1 rounded-full font-medium"
                          >
                            {category}
                          </span>
                        ))}
                      </div>

                      {/* BOTTOM */}

                      <div
                        className="flex items-center justify-between gap-3
                            pt-4 border-t border-gray-100"
                      >
                        <div>
                          {item.bestTime && (
                            <span className="text-xs text-gray-500">
                              Best time: <strong>{item.bestTime}</strong>
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();

                            openPlaceDetails(item);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white
                              rounded-lg hover:bg-blue-700
                              transition-colors text-sm font-medium
                              flex items-center gap-2"
                        >
                          View Details
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
};

export default FamousPlacesPage;
