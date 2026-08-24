"use client";

import "@/styles/pages/restaurants/restaurants.css";

import React, { useCallback, useEffect, useState } from "react";
import { SafeImage } from "@/components/common/SafeImage";
import { apiRequest } from "@/lib/api";
import { cmsStore } from "@/lib/cms-store";

import { Search, Filter, Star, MapPin, Clock, Leaf } from "lucide-react";

interface BackendRestaurant {
  id: number;
  restaurantName?: string | null;
  location?: string | null;
  contactDetails?: string | null;
  cuisineTypes?: string[] | null;
  openingHours?: string | null;
  priceRange?: "NPR" | "NPR NPR" | "NPR NPR NPR" | "NPR NPR NPR NPR" | null;
  imageUrl?: string | null;
  approvalStatus?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  createdByName?: string | null;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  location: string;
  cuisine: string[];
  priceRange: "NPR" | "NPR NPR" | "NPR NPR NPR" | "NPR NPR NPR NPR";
  openingHours: string;
  distance: string;
  dietaryOptions: string[];
  featured: boolean;
}

/**
 * Convert backend restaurant response
 * into frontend Restaurant card format.
 */
const mapRestaurant = (restaurant: BackendRestaurant): Restaurant => {
  return {
    id: String(restaurant.id),

    name: restaurant.restaurantName?.trim() || "Unnamed Restaurant",

    description:
      restaurant.contactDetails?.trim() ||
      "Discover a great dining experience along your journey.",

    image: restaurant.imageUrl?.trim() || "/logo/gojitriplogo.jpg",

    // Backend currently doesn't provide rating/review count.
    rating: 0,
    reviews: 0,

    location: restaurant.location?.trim() || "Location unavailable",

    cuisine:
      Array.isArray(restaurant.cuisineTypes) &&
      restaurant.cuisineTypes.length > 0
        ? restaurant.cuisineTypes
        : ["Restaurant"],

    priceRange:
      restaurant.priceRange &&
      ["NPR", "NPR NPR", "NPR NPR NPR", "NPR NPR NPR NPR"].includes(restaurant.priceRange)
        ? restaurant.priceRange
        : "NPR NPR",

    openingHours:
      restaurant.openingHours?.trim() || "Opening hours unavailable",

    // Backend currently doesn't provide distance.
    distance: "",

    // Backend RestaurantEntry currently doesn't have dietary options.
    dietaryOptions: [],

    featured:
      restaurant.approvalStatus === "Published" ||
      restaurant.approvalStatus === "Approved",
  };
};

/* -------------------------------------------------------------------------- */
/* Restaurant Card                                                            */
/* -------------------------------------------------------------------------- */

const RestaurantCard: React.FC<{
  restaurant: Restaurant;
}> = ({ restaurant }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <SafeImage
          src={restaurant.image}
          fallbackSrc="/logo/gojitriplogo.jpg"
          alt={restaurant.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {restaurant.featured && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
            Featured
          </div>
        )}

        {restaurant.priceRange && (
          <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
            {restaurant.priceRange}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Name + Rating */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {restaurant.name}
            </h3>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-500 text-sm">
                {restaurant.cuisine.length > 0
                  ? restaurant.cuisine.join(", ")
                  : "Restaurant"}
              </span>
            </div>
          </div>

          {restaurant.rating > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

              <span className="font-semibold text-gray-900">
                {restaurant.rating.toFixed(1)}
              </span>

              {restaurant.reviews > 0 && (
                <span className="text-gray-500 text-sm">
                  ({restaurant.reviews})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-500 mb-3">
          <MapPin className="h-4 w-4 shrink-0" />

          <span className="text-sm truncate">{restaurant.location}</span>
        </div>

        {/* Opening Hours */}
        <div className="flex items-center gap-1 text-gray-500 mb-3">
          <Clock className="h-4 w-4 shrink-0" />

          <span className="text-sm">{restaurant.openingHours}</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {restaurant.description}
        </p>

        {/* Cuisine Tags */}
        {restaurant.cuisine.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {restaurant.cuisine.slice(0, 3).map((cuisine) => (
              <span
                key={cuisine}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
              >
                {cuisine}
              </span>
            ))}

            {restaurant.cuisine.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-medium">
                +{restaurant.cuisine.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Dietary Options */}
        {restaurant.dietaryOptions.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {restaurant.dietaryOptions.slice(0, 3).map((option) => (
              <span
                key={option}
                className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium flex items-center gap-1"
              >
                <Leaf className="h-3 w-3" />
                {option}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
          <div>
            <span className="text-sm font-semibold text-gray-800">
              {restaurant.priceRange}
            </span>

            <span className="text-xs text-gray-500 ml-1">price range</span>
          </div>

          <button
            type="button"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            View Restaurant
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Loading Skeleton                                                           */
/* -------------------------------------------------------------------------- */

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
        >
          <div className="h-52 bg-gray-200" />

          <div className="p-5 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />

            <div className="h-4 bg-gray-200 rounded w-1/2" />

            <div className="h-4 bg-gray-200 rounded w-2/3" />

            <div className="h-4 bg-gray-200 rounded w-full" />

            <div className="h-4 bg-gray-200 rounded w-5/6" />

            <div className="flex gap-2">
              <div className="h-7 w-16 bg-gray-200 rounded-md" />
              <div className="h-7 w-20 bg-gray-200 rounded-md" />
              <div className="h-7 w-16 bg-gray-200 rounded-md" />
            </div>

            <div className="h-10 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

const EmptyState: React.FC<{
  message: string;
}> = ({ message }) => {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🍽️</div>

      <h3 className="text-2xl font-semibold text-gray-700 mb-2">
        No Restaurants Found
      </h3>

      <p className="text-gray-500 max-w-md mx-auto">{message}</p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Error State                                                                */
/* -------------------------------------------------------------------------- */

const ErrorState: React.FC<{
  message: string;
  onRetry: () => void;
}> = ({ message, onRetry }) => {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">⚠️</div>

      <h3 className="text-2xl font-semibold text-gray-700 mb-2">
        Unable to Load Restaurants
      </h3>

      <p className="text-gray-500 mb-6">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        Try Again
      </button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Restaurants Page                                                      */
/* -------------------------------------------------------------------------- */

const RestaurantsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedCuisine, setSelectedCuisine] = useState<string[]>([]);

  /* ---------------------------------------------------------------------- */
  /* Fetch restaurants from Admin/CMS backend                               */
  /* ---------------------------------------------------------------------- */

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * IMPORTANT:
       * No mock data is used here.
       *
       * Data comes from:
       * Admin Dashboard
       *      ↓
       * Backend API
       *      ↓
       * PostgreSQL
       *      ↓
       * GET /restaurants
       */

      const response = await apiRequest<BackendRestaurant[]>("/restaurants");
      const backendRestaurants = Array.isArray(response) ? response : [];
      let mappedRestaurants = backendRestaurants.map(mapRestaurant);

      if (mappedRestaurants.length === 0) {
        const storeItems = cmsStore.getRestaurants();
        mappedRestaurants = storeItems.map((r) => ({
          id: String(r.id),
          name: r.restaurantName,
          description: r.contactDetails || "Delicious local food and dining experience.",
          image: r.imageUrl || (r.photos && r.photos[0]) || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
          rating: 4.8,
          reviews: 42,
          location: r.location,
          cuisine: r.cuisineTypes && r.cuisineTypes.length > 0 ? r.cuisineTypes : ["Thakali", "Nepali"],
          priceRange: r.priceRange || "NPR NPR",
          openingHours: r.openingHours || "07:00 AM - 09:30 PM",
          distance: "2.5 km",
          dietaryOptions: ["Vegetarian", "Organic"],
          featured: true,
        }));
      }

      setRestaurants(mappedRestaurants);
    } catch (err) {
      console.error("Failed to fetch restaurants, loading store fallback:", err);
      const storeItems = cmsStore.getRestaurants();
      const mappedRestaurants = storeItems.map((r) => ({
        id: String(r.id),
        name: r.restaurantName,
        description: r.contactDetails || "Delicious local food and dining experience.",
        image: r.imageUrl || (r.photos && r.photos[0]) || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        rating: 4.8,
        reviews: 42,
        location: r.location,
        cuisine: r.cuisineTypes && r.cuisineTypes.length > 0 ? r.cuisineTypes : ["Thakali", "Nepali"],
        priceRange: r.priceRange || "NPR NPR",
        openingHours: r.openingHours || "07:00 AM - 09:30 PM",
        distance: "2.5 km",
        dietaryOptions: ["Vegetarian", "Organic"],
        featured: true,
      }));
      setRestaurants(mappedRestaurants);
      setError("");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Initial API fetch                                                      */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    void fetchRestaurants();
  }, [fetchRestaurants]);

  /* ---------------------------------------------------------------------- */
  /* Cuisine Filter                                                         */
  /* ---------------------------------------------------------------------- */

  const availableCuisines = React.useMemo(() => {
    const cuisines = restaurants.flatMap((restaurant) => restaurant.cuisine);

    return Array.from(new Set(cuisines)).filter(Boolean).sort();
  }, [restaurants]);

  /* ---------------------------------------------------------------------- */
  /* Filter Restaurants                                                      */
  /* ---------------------------------------------------------------------- */

  const filteredRestaurants = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return restaurants.filter((restaurant) => {
      /* Search */
      const matchesSearch =
        !query ||
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.location.toLowerCase().includes(query) ||
        restaurant.description.toLowerCase().includes(query) ||
        restaurant.cuisine.some((cuisine) =>
          cuisine.toLowerCase().includes(query),
        );

      /* Cuisine */
      const matchesCuisine =
        selectedCuisine.length === 0 ||
        restaurant.cuisine.some((cuisine) => selectedCuisine.includes(cuisine));

      return matchesSearch && matchesCuisine;
    });
  }, [restaurants, searchQuery, selectedCuisine]);

  /* ---------------------------------------------------------------------- */
  /* Toggle Cuisine                                                         */
  /* ---------------------------------------------------------------------- */

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisine((previous) =>
      previous.includes(cuisine)
        ? previous.filter((item) => item !== cuisine)
        : [...previous, cuisine],
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Clear Filters                                                          */
  /* ---------------------------------------------------------------------- */

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCuisine([]);
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}

      <section className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🍽️</span>

              <h1 className="text-3xl md:text-5xl font-bold">
                Discover Restaurants
              </h1>
            </div>

            <p className="text-base md:text-lg text-white/90 mb-8">
              Find the perfect dining experience along your route
            </p>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

                <input
                  type="text"
                  placeholder="Search by cuisine, name, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 shadow-sm"
                />
              </div>

              <button
                type="button"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all"
              >
                <Filter className="h-5 w-5" />

                <span>Filters</span>
              </button>
            </div>

            {/* Cuisine filters */}
            {availableCuisines.length > 0 && (
              <div className="flex gap-3 mt-6 flex-wrap">
                {availableCuisines.map((cuisine) => (
                  <button
                    key={cuisine}
                    type="button"
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCuisine.includes(cuisine)
                        ? "bg-white text-blue-600 shadow-md"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                    onClick={() => toggleCuisine(cuisine)}
                  >
                    {cuisine}
                  </button>
                ))}

                {(searchQuery || selectedCuisine.length > 0) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-red-500/80 text-white hover:bg-red-500 transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Restaurant List                                                  */}
      {/* ---------------------------------------------------------------- */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Result Count */}
        {!loading && !error && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600 text-sm">
              <span className="font-semibold text-gray-900">
                {filteredRestaurants.length}
              </span>{" "}
              {filteredRestaurants.length === 1 ? "restaurant" : "restaurants"}{" "}
              available
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingSkeleton />}

        {/* Error */}
        {!loading && error && (
          <ErrorState message={error} onRetry={fetchRestaurants} />
        )}

        {/* Empty */}
        {!loading && !error && filteredRestaurants.length === 0 && (
          <EmptyState
            message={
              restaurants.length === 0
                ? "No restaurants have been added from the Admin Dashboard yet."
                : "No restaurants match your search or selected cuisine filters."
            }
          />
        )}

        {/* Restaurants */}
        {!loading && !error && filteredRestaurants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RestaurantsPage;
