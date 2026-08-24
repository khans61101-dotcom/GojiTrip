"use client";

import "@/styles/pages/route/route.css";

import React from "react";
import { SafeImage } from "@/components/common/SafeImage";
import { apiRequest } from "@/lib/api";
import { cmsStore } from "@/lib/cms-store";
import { MapPin, Search, Star, Navigation, Clock, X } from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

interface BackendRoute {
  id: number | string;
  name?: string;
  routeName?: string;
  origin?: string;
  destination?: string;
  distance?: number;
  totalDistanceKm?: number;
  status?: string;
  approvalStatus?: string;
  description?: string;
  imageUrl?: string | null;
  image_url?: string | null;
  duration?: string;
  estimatedTravelTime?: string;
  stops?: number;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface RoutePlan {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  location: string;
  price: number;
  duration: string;
  difficulty: "easy" | "moderate" | "hard";
  stops: number;
}

interface PlaceSuggestion {
  placeId: string;
  name: string;
  address: string;
}

interface NearbyPlace {
  placeId?: string;
  id?: string;
  name?: string;
  displayName?: string;
  address?: string;
  formattedAddress?: string;
  imageUrl?: string | null;
  photoUrl?: string | null;
  rating?: number;
  latitude?: number;
  longitude?: number;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  distanceMeters?: number;
  types?: string[];
}

/* ============================================================
   CONSTANTS
============================================================ */

const DEFAULT_IMAGE = "/logo/gojitriplogo.jpg";

/* ============================================================
   ROUTE MAPPER
============================================================ */

function getDifficulty(route: BackendRoute): "easy" | "moderate" | "hard" {
  const status = String(
    route.status || route.approvalStatus || "",
  ).toLowerCase();

  if (
    status.includes("hard") ||
    status.includes("rough") ||
    status.includes("difficult")
  ) {
    return "hard";
  }

  if (status.includes("moderate") || status.includes("mixed")) {
    return "moderate";
  }

  return "easy";
}

function mapBackendRoute(route: BackendRoute): RoutePlan {
  const distance = Number(route.distance ?? route.totalDistanceKm ?? 0) || 0;

  const routeName =
    route.routeName ||
    route.name ||
    `${route.origin || ""} → ${route.destination || ""}`.trim() ||
    "Unnamed Route";

  const location =
    route.origin && route.destination
      ? `${route.origin} → ${route.destination}`
      : route.destination || route.origin || "GojiTrip Destination";

  const duration = route.duration || route.estimatedTravelTime || "N/A";

  const image = route.imageUrl || route.image_url || DEFAULT_IMAGE;

  const rating = typeof route.rating === "number" ? route.rating : 0;

  const stops = typeof route.stops === "number" ? route.stops : 0;

  return {
    id: String(route.id),
    name: routeName,
    description:
      route.description ||
      `Travel route from ${route.origin || "origin"} to ${
        route.destination || "destination"
      }${distance ? ` covering approximately ${distance} km.` : "."}`,
    image,
    rating,
    location,
    price: 0,
    duration,
    difficulty: getDifficulty(route),
    stops,
  };
}

/* ============================================================
   COMPONENT
============================================================ */

const RoutePage = () => {
  /* ----------------------------------------------------------
     ROUTES
  ---------------------------------------------------------- */

  const [loading, setLoading] = React.useState(true);

  const [routes, setRoutes] = React.useState<RoutePlan[]>([]);

  const [error, setError] = React.useState<string | null>(null);

  /* ----------------------------------------------------------
     SEARCH
  ---------------------------------------------------------- */

  const [searchTerm, setSearchTerm] = React.useState("");

  const [selectedLocation, setSelectedLocation] =
    React.useState<PlaceSuggestion | null>(null);

  const [locationSuggestions, setLocationSuggestions] = React.useState<
    PlaceSuggestion[]
  >([]);

  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const [searchingLocations, setSearchingLocations] = React.useState(false);

  /* ----------------------------------------------------------
     NEARBY FAMOUS PLACES
  ---------------------------------------------------------- */

  const [nearbyPlaces, setNearbyPlaces] = React.useState<NearbyPlace[]>([]);

  const [loadingNearbyPlaces, setLoadingNearbyPlaces] = React.useState(false);

  const [nearbyPlacesError, setNearbyPlacesError] = React.useState<
    string | null
  >(null);

  /* ----------------------------------------------------------
     FILTERS
  ---------------------------------------------------------- */

  const [difficultyFilter, setDifficultyFilter] = React.useState("");

  const [durationFilter, setDurationFilter] = React.useState("");

  const [ratingFilter, setRatingFilter] = React.useState("");

  /* ==========================================================
     FETCH ROUTES
  ========================================================== */

  const fetchRoutes = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const storeRoutes = cmsStore.getRoutes();
      const response = await apiRequest<
        | BackendRoute[]
        | {
            data?: BackendRoute[];
          }
      >("/routes").catch(() => null);

      const backendRoutes = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      let mappedRoutes = backendRoutes.map(mapBackendRoute);

      if (mappedRoutes.length === 0) {
        mappedRoutes = storeRoutes.map((r) => ({
          id: String(r.id),
          name: r.routeName,
          description: `Scenic travel corridor along ${r.routeName}. Distance: ${r.totalDistanceKm} km (${r.roadCondition}).`,
          image: r.imageUrl || (r.photos && r.photos[0]) || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
          rating: 4.9,
          location: `${r.origin} → ${r.destination}`,
          price: 0,
          duration: r.estimatedTravelTime || "7-9 Hours",
          difficulty: (r.roadCondition?.includes("4x4") ? "hard" : "moderate") as "easy" | "moderate" | "hard",
          stops: r.viewpoints?.length || 5,
        }));
      }

      setRoutes(mappedRoutes);
    } catch (error) {
      console.error("Failed to fetch routes, loading store fallback:", error);
      const storeRoutes = cmsStore.getRoutes();
      const mappedRoutes: RoutePlan[] = storeRoutes.map((r) => ({
        id: String(r.id),
        name: r.routeName,
        description: `Scenic travel corridor along ${r.routeName}. Distance: ${r.totalDistanceKm} km (${r.roadCondition}).`,
        image: r.imageUrl || (r.photos && r.photos[0]) || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
        rating: 4.9,
        location: `${r.origin} → ${r.destination}`,
        price: 0,
        duration: r.estimatedTravelTime || "7-9 Hours",
        difficulty: (r.roadCondition?.includes("4x4") ? "hard" : "moderate") as "easy" | "moderate" | "hard",
        stops: r.viewpoints?.length || 5,
      }));
      setRoutes(mappedRoutes);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchRoutes();
  }, [fetchRoutes]);

  /* ==========================================================
     LOCATION AUTOCOMPLETE
  ========================================================== */

  const searchLocations = React.useCallback(async (query: string) => {
    const cleanQuery = query.trim();

    if (cleanQuery.length < 2) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setSearchingLocations(true);

      const response = await apiRequest<
        | PlaceSuggestion[]
        | {
            suggestions?: PlaceSuggestion[];
          }
      >(`/places/autocomplete?q=${encodeURIComponent(cleanQuery)}`);

      const suggestions = Array.isArray(response)
        ? response
        : Array.isArray(response?.suggestions)
          ? response.suggestions
          : [];

      setLocationSuggestions(suggestions);

      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error("Location autocomplete error:", error);

      setLocationSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSearchingLocations(false);
    }
  }, []);

  /* ==========================================================
     DEBOUNCE LOCATION SEARCH
  ========================================================== */

  React.useEffect(() => {
    if (selectedLocation && searchTerm === selectedLocation.name) {
      return;
    }

    const timer = window.setTimeout(() => {
      void searchLocations(searchTerm);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchTerm, selectedLocation, searchLocations]);

  /* ==========================================================
     FETCH NEARBY FAMOUS PLACES
  ========================================================== */

  const fetchNearbyPlaces = React.useCallback(async (placeId: string) => {
    try {
      setLoadingNearbyPlaces(true);
      setNearbyPlacesError(null);
      setNearbyPlaces([]);

      /* -----------------------------------------------
             First get selected place coordinates
          ------------------------------------------------ */

      const details = await apiRequest<{
        location?: {
          placeId?: string;
          name?: string;
          address?: string;
          latitude?: number;
          longitude?: number;
        };
      }>(`/places/details?placeId=${encodeURIComponent(placeId)}`);

      const latitude = details?.location?.latitude;

      const longitude = details?.location?.longitude;

      if (typeof latitude !== "number" || typeof longitude !== "number") {
        throw new Error("Location coordinates were not returned.");
      }

      /* -----------------------------------------------
             Fetch nearby famous places
          ------------------------------------------------ */

      const response = await apiRequest<
        | NearbyPlace[]
        | {
            places?: NearbyPlace[];
            data?: NearbyPlace[];
          }
      >(`/places/nearby?lat=${latitude}&lng=${longitude}&radius=10000`);

      let places: NearbyPlace[] = [];

      if (Array.isArray(response)) {
        places = response;
      } else if (Array.isArray(response?.places)) {
        places = response.places;
      } else if (Array.isArray(response?.data)) {
        places = response.data;
      }

      setNearbyPlaces(places);
    } catch (error) {
      console.error("Nearby famous places error:", error);

      setNearbyPlacesError(
        error instanceof Error
          ? error.message
          : "Unable to load nearby famous places.",
      );

      setNearbyPlaces([]);
    } finally {
      setLoadingNearbyPlaces(false);
    }
  }, []);

  /* ==========================================================
     SELECT LOCATION
  ========================================================== */

  const handleSelectLocation = React.useCallback(
    (suggestion: PlaceSuggestion) => {
      setSelectedLocation(suggestion);

      setSearchTerm(suggestion.name);

      setShowSuggestions(false);
      setLocationSuggestions([]);

      void fetchNearbyPlaces(suggestion.placeId);
    },
    [fetchNearbyPlaces],
  );

  /* ==========================================================
     CLEAR SEARCH
  ========================================================== */

  const clearSearch = React.useCallback(() => {
    setSearchTerm("");
    setSelectedLocation(null);
    setLocationSuggestions([]);
    setNearbyPlaces([]);
    setNearbyPlacesError(null);
    setShowSuggestions(false);
  }, []);

  /* ==========================================================
     FILTER ROUTES
  ========================================================== */

  const filteredRoutes = React.useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return routes.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      const matchesDifficulty =
        !difficultyFilter || item.difficulty === difficultyFilter;

      const durationInDays = parseInt(item.duration, 10);

      const matchesDuration =
        !durationFilter ||
        (durationFilter === "1-3" &&
          durationInDays >= 1 &&
          durationInDays <= 3) ||
        (durationFilter === "4-7" &&
          durationInDays >= 4 &&
          durationInDays <= 7) ||
        (durationFilter === "8+" && durationInDays >= 8);

      const matchesRating =
        !ratingFilter || item.rating >= Number(ratingFilter);

      return (
        matchesSearch && matchesDifficulty && matchesDuration && matchesRating
      );
    });
  }, [routes, searchTerm, difficultyFilter, durationFilter, ratingFilter]);

  /* ==========================================================
     PLACE HELPERS
  ========================================================== */

  const getPlaceName = (place: NearbyPlace) => {
    return place.name || place.displayName || "Famous Place";
  };

  const getPlaceAddress = (place: NearbyPlace) => {
    return place.address || place.formattedAddress || "Nearby destination";
  };

  const getPlaceImage = (place: NearbyPlace) => {
    return place.imageUrl || place.photoUrl || DEFAULT_IMAGE;
  };

  const getPlaceRating = (place: NearbyPlace) => {
    return typeof place.rating === "number" ? place.rating : 0;
  };

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative bg-gradient-to-r from-blue-700 to-cyan-600">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Plan Your Route
          </h1>

          <p className="text-base md:text-lg text-white/90 mb-8">
            Discover routes and famous places near your destination
          </p>

          {/* SEARCH BOX */}

          <div className="relative bg-white rounded-xl p-3 md:p-4 shadow-lg max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="relative flex-1">
                <div className="relative">
                  <Search
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    placeholder="Search location e.g. Pokhara, Mustang..."
                    className="w-full pl-11 pr-11 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-sm md:text-base"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);

                      if (
                        selectedLocation &&
                        e.target.value !== selectedLocation.name
                      ) {
                        setSelectedLocation(null);
                        setNearbyPlaces([]);
                      }
                    }}
                    onFocus={() => {
                      if (locationSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* AUTOCOMPLETE */}

                {showSuggestions && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden text-left">
                    {searchingLocations ? (
                      <div className="px-4 py-4 text-sm text-gray-500">
                        Searching locations...
                      </div>
                    ) : (
                      locationSuggestions.map((suggestion) => (
                        <button
                          type="button"
                          key={suggestion.placeId}
                          onClick={() => handleSelectLocation(suggestion)}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                        >
                          <MapPin
                            size={18}
                            className="text-blue-600 mt-0.5 shrink-0"
                          />

                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {suggestion.name}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {suggestion.address}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (selectedLocation) {
                    void fetchNearbyPlaces(selectedLocation.placeId);
                  } else {
                    void searchLocations(searchTerm);
                  }
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap font-medium"
              >
                Search Location
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SELECTED LOCATION
      ===================================================== */}

      {selectedLocation && (
        <section className="max-w-7xl mx-auto px-4 pt-8">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-blue-600 font-bold">
                  Selected Location
                </p>

                <h2 className="font-bold text-gray-800">
                  {selectedLocation.name}
                </h2>

                <p className="text-sm text-gray-500">
                  {selectedLocation.address}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void fetchNearbyPlaces(selectedLocation.placeId)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <span className="inline-flex items-center gap-2">
                <Navigation size={16} />
                Find Nearby Places
              </span>
            </button>
          </div>
        </section>
      )}

      {/* =====================================================
          NEARBY FAMOUS PLACES
      ===================================================== */}

      {(selectedLocation || loadingNearbyPlaces || nearbyPlacesError) && (
        <section className="max-w-7xl mx-auto px-4 pt-8">
          <div className="mb-5">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Famous Places Near {selectedLocation?.name || "Your Location"}
            </h2>

            <p className="text-gray-500 mt-1">
              Discover attractions and famous places around your searched
              location.
            </p>
          </div>

          {loadingNearbyPlaces ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse"
                >
                  <div className="h-44 bg-gray-200" />

                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : nearbyPlacesError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-600 text-sm">
              {nearbyPlacesError}
            </div>
          ) : nearbyPlaces.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <div className="text-4xl mb-3">📍</div>

              <h3 className="font-semibold text-gray-800">
                No famous places found
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Try searching another location.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {nearbyPlaces.map((place, index) => {
                const placeId =
                  place.placeId ||
                  place.id ||
                  `${getPlaceName(place)}-${index}`;

                const rating = getPlaceRating(place);

                return (
                  <div
                    key={placeId}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <SafeImage
                        src={getPlaceImage(place)}
                        fallbackSrc={DEFAULT_IMAGE}
                        alt={getPlaceName(place)}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />

                      {rating > 0 && (
                        <div className="absolute top-3 right-3 bg-white/95 px-2 py-1 rounded-full text-xs font-semibold text-gray-800 flex items-center gap-1">
                          <Star
                            size={13}
                            className="fill-yellow-400 text-yellow-400"
                          />
                          {rating}
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 line-clamp-1">
                        {getPlaceName(place)}
                      </h3>

                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {getPlaceAddress(place)}
                      </p>

                      {typeof place.distanceMeters === "number" && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 mt-3">
                          <Navigation size={13} />
                          {(place.distanceMeters / 1000).toFixed(1)} km away
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const lat =
                            place.latitude ?? place.location?.latitude;

                          const lng =
                            place.longitude ?? place.location?.longitude;

                          if (
                            typeof lat === "number" &&
                            typeof lng === "number"
                          ) {
                            window.open(
                              `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
                              "_blank",
                              "noopener,noreferrer",
                            );
                          }
                        }}
                        className="w-full mt-4 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View on Map
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white p-4 rounded-xl shadow-sm">
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>

            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
            >
              <option value="">All Durations</option>
              <option value="1-3">1-3 Days</option>
              <option value="4-7">4-7 Days</option>
              <option value="8+">8+ Days</option>
            </select>

            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.8">4.8+ Stars</option>
            </select>

            {(searchTerm ||
              difficultyFilter ||
              durationFilter ||
              ratingFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedLocation(null);
                  setLocationSuggestions([]);
                  setNearbyPlaces([]);
                  setDifficultyFilter("");
                  setDurationFilter("");
                  setRatingFilter("");
                }}
                className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="text-sm text-gray-600 whitespace-nowrap">
            {filteredRoutes.length}{" "}
            {filteredRoutes.length === 1 ? "route" : "routes"} available
          </div>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <section className="max-w-7xl mx-auto px-4 pb-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span>Failed to load routes: {error}</span>

              <button
                type="button"
                onClick={() => void fetchRoutes()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          ROUTES
      ===================================================== */}

      <section className="max-w-7xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200" />

                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />

                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-gray-200 rounded-full" />
                    <div className="h-6 w-16 bg-gray-200 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🗺️</div>

            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No Routes Found
            </h3>

            <p className="text-gray-500">
              {routes.length === 0
                ? "No routes have been added from the Admin Dashboard yet."
                : "Try adjusting your search or filters to find routes."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoutes.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* IMAGE */}

                <div className="relative h-48 overflow-hidden">
                  <SafeImage
                    src={item.image}
                    fallbackSrc={DEFAULT_IMAGE}
                    alt={item.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                    {item.stops} stops
                  </div>
                </div>

                {/* CONTENT */}

                <div className="p-4">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 leading-tight">
                      {item.name}
                    </h3>

                    {item.rating > 0 && (
                      <span className="flex items-center gap-1 text-yellow-500 text-sm whitespace-nowrap">
                        ⭐ {item.rating}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-2 flex items-center gap-1">
                    📍 {item.location}
                  </p>

                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  {/* TAGS */}

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        item.difficulty === "easy"
                          ? "bg-green-50 text-green-600"
                          : item.difficulty === "moderate"
                            ? "bg-yellow-50 text-yellow-600"
                            : "bg-red-50 text-red-600"
                      }`}
                    >
                      {item.difficulty.toUpperCase()}
                    </span>

                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-semibold">
                      <Clock size={12} className="inline mr-1" />
                      {item.duration}
                    </span>

                    <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-semibold">
                      📌 {item.stops} stops
                    </span>
                  </div>

                  {/* FOOTER */}

                  <div className="flex justify-between items-center gap-3">
                    <span className="text-sm text-gray-600">
                      💰 Free to explore
                    </span>

                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      View Route →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RoutePage;
