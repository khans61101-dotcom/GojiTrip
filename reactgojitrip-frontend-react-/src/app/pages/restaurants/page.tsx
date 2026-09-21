// RestaurantsPage.tsx - With Google Places Integration (Split Layout)
"use client";

import "@/styles/pages/restaurants/restaurants.css";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { SafeImage } from "@/components/common/SafeImage";
import { apiRequest } from "@/lib/api";
import { cmsStore } from "@/lib/cms-store";
import YelpDetailModal, { YelpDetailData } from "@/components/common/YelpDetailModal";
import { InteractiveMap, MapMarkerItem } from "@/components/common/InteractiveMap";

import { Search, Filter, Star, MapPin, Clock, Leaf, ArrowLeft, Maximize2, Minimize2, Globe } from "lucide-react";

// ============= GOOGLE PLACES HELPERS =============
const GOOGLE_API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  "YOUR_GOOGLE_MAPS_API_KEY";

let _placesService: any = null;
let _scriptPromise: Promise<void> | null = null;

const loadGooglePlacesScript = (): Promise<void> => {
  if (_scriptPromise) return _scriptPromise;

  _scriptPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if ((window as any).google?.maps?.places) return resolve();

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

  return _scriptPromise;
};

const getPlacesService = (): any => {
  if (_placesService) return _placesService;
  const dummy = document.createElement("div");
  _placesService = new (window as any).google.maps.places.PlacesService(dummy);
  return _placesService;
};

// ============= TYPES =============
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
  gpsCoordinates?: string | null;
  lat?: number;
  lng?: number;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  photos: string[];
  rating: number;
  reviews: number;
  location: string;
  cuisine: string[];
  priceRange: "NPR" | "NPR NPR" | "NPR NPR NPR" | "NPR NPR NPR NPR";
  currency?: string;
  averageMealPrice?: number;
  openingHours: string;
  distance: string;
  dietaryOptions: string[];
  featured: boolean;
  lat?: number;
  lng?: number;
  source?: "cms" | "api" | "google";
  placeId?: string;
  googleRating?: number;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

// ============= MAPPER =============
const mapRestaurant = (restaurant: any): Restaurant => {
  let lat: number | undefined;
  let lng: number | undefined;
  if (restaurant.gpsCoordinates) {
    try {
      const coords = restaurant.gpsCoordinates.split(",");
      lat = parseFloat(coords[0]);
      lng = parseFloat(coords[1]);
    } catch (e) {
      console.warn("Invalid GPS coordinates for restaurant:", restaurant.id);
    }
  }

  const rawPhotos: string[] =
    Array.isArray(restaurant.photos) && restaurant.photos.length > 0
      ? restaurant.photos
      : Array.isArray(restaurant.restaurantPhotos) &&
        restaurant.restaurantPhotos.length > 0
      ? restaurant.restaurantPhotos
      : restaurant.imageUrl
      ? [restaurant.imageUrl]
      : [];

  const mainImage =
    restaurant.imageUrl?.trim() ||
    rawPhotos[0] ||
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80";

  return {
    id: String(restaurant.id),
    name:
      restaurant.restaurantName?.trim() ||
      restaurant.name?.trim() ||
      "Unnamed Restaurant",
    description:
      restaurant.contactDetails?.trim() ||
      restaurant.description?.trim() ||
      "Discover a great dining experience along your journey.",
    image: mainImage,
    photos: rawPhotos.length > 0 ? rawPhotos : [mainImage],
    rating: 4.8,
    reviews: 36,
    location: restaurant.location?.trim() || "Location unavailable",
    cuisine:
      Array.isArray(restaurant.cuisineTypes) &&
      restaurant.cuisineTypes.length > 0
        ? restaurant.cuisineTypes
        : Array.isArray(restaurant.cuisine) && restaurant.cuisine.length > 0
        ? restaurant.cuisine
        : ["Thakali", "Nepali"],
    priceRange:
      restaurant.priceRange &&
      ["NPR", "NPR NPR", "NPR NPR NPR", "NPR NPR NPR NPR"].includes(
        restaurant.priceRange
      )
        ? restaurant.priceRange
        : "NPR NPR",
    openingHours: restaurant.openingHours?.trim() || "07:00 AM - 09:30 PM",
    distance: "1.5 km",
    dietaryOptions: ["Vegetarian", "Organic"],
    featured:
      restaurant.approvalStatus === "Published" ||
      restaurant.approvalStatus === "Approved",
    lat,
    lng,
    source: "api",
  };
};

// ============= LOADING SKELETON =============
const LoadingSkeleton: React.FC = () => {
  return (
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
};

// ============= EMPTY STATE =============
const EmptyState: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-6xl mb-4">🍽️</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        No Restaurants Found
      </h3>
      <p className="text-gray-500 max-w-md mx-auto text-center">{message}</p>
    </div>
  );
};

// ============= COMPACT RESTAURANT CARD =============
const CompactRestaurantCard: React.FC<{
  restaurant: Restaurant;
  isSelected: boolean;
  onClick: () => void;
  onViewDetails?: () => void;
}> = ({ restaurant, isSelected, onClick, onViewDetails }) => {
  const dietaryList =
    Array.isArray(restaurant.dietaryOptions) &&
    restaurant.dietaryOptions.length > 0
      ? restaurant.dietaryOptions
      : [
          "Organic Ingredients",
          "Outdoor Seating",
          "Free Wi-Fi",
          "Highway Parking",
        ];

  const isGoogle = restaurant.source === "google";

  return (
    <div
      className={`bg-white rounded-xl border transition-all cursor-pointer hover:shadow-md group ${
        isSelected
          ? "border-red-500 ring-2 ring-red-500/30 shadow-md"
          : "border-gray-200 hover:border-red-300"
      }`}
      onClick={() => {
        onClick();
        if (onViewDetails) onViewDetails();
      }}
    >
      <div className="flex flex-col sm:flex-row gap-3.5 p-3.5">
        <div className="flex-shrink-0 w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-gray-100 relative">
          <img
            src={restaurant.image || "/logo/gojitriplogo.jpg"}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo/gojitriplogo.jpg";
            }}
          />
          {restaurant.cuisine[0] && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[10px] font-bold text-white uppercase tracking-wider">
              {restaurant.cuisine[0]}
            </span>
          )}
          {isGoogle && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-green-500 backdrop-blur-md rounded-md text-[10px] font-bold text-white flex items-center gap-0.5">
              <Globe className="w-2.5 h-2.5" />G
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-base font-extrabold text-slate-900 truncate group-hover:text-red-600 transition-colors">
                {restaurant.name}
              </h3>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full flex-shrink-0">
                <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                <span className="text-xs font-extrabold text-amber-900">
                  {restaurant.rating || 4.7}
                </span>
                <span className="text-[10px] text-slate-500">
                  ({restaurant.reviews || 36})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-600 text-xs mb-2 flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                <span className="truncate font-medium">
                  {restaurant.location}
                </span>
              </div>
              {restaurant.openingHours && (
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span>{restaurant.openingHours}</span>
                </div>
              )}
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {restaurant.cuisine.map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 bg-red-50 text-red-700 rounded-md text-[10px] font-bold border border-red-200/60"
                >
                  {c}
                </span>
              ))}
              {dietaryList.slice(0, 2).map((diet, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium border border-slate-200/60"
                >
                  {diet}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md mr-1.5 border border-slate-200">
                {restaurant.priceRange || "$$"}
              </span>
              <span className="text-emerald-700 font-extrabold text-sm">
                {restaurant.averageMealPrice
                  ? `${restaurant.currency || "NRs"} ${restaurant.averageMealPrice.toLocaleString()} / meal`
                  : `${restaurant.currency || "NRs"} 450 - 1,200 / meal`}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onViewDetails) onViewDetails();
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-red-600 hover:bg-red-700 text-white shadow-sm hover:scale-105 active:scale-95"
            >
              View Details {"\u2192"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= MAIN RESTAURANTS PAGE =============
const RestaurantsPage: React.FC = () => {
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

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [googleRestaurants, setGoogleRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [useGoogleSearch, setUseGoogleSearch] = useState(true);
  const [error, setError] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | null
  >(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [yelpDetailData, setYelpDetailData] = useState<YelpDetailData | null>(
    null
  );
  const [showYelpModal, setShowYelpModal] = useState(false);
  const restaurantListRef = useRef<HTMLDivElement>(null);

  // ============= YELP DETAIL =============
  const handleOpenYelpDetail = (r: Restaurant) => {
    const galleryImages =
      Array.isArray(r.photos) && r.photos.length > 0
        ? r.photos
        : r.image
        ? [r.image]
        : [];

    const isGoogle = r.source === "google";

    setYelpDetailData({
      id: r.id,
      name: r.name,
      category:
        r.cuisine.join(" • ") ||
        (isGoogle ? "Restaurant (via Google)" : "Traditional Nepalese & Thakali Cuisine"),
      rating: r.rating || 4.7,
      reviewCount: r.reviews || 36,
      priceLevel: r.priceRange || "$$",
      address: r.location,
      location: r.location,
      phone: (r as any).contactDetails || r.description || "+977 1 4220000",
      whatsapp: (r as any).whatsappNumber || "+9779801112233",
      image: r.image || galleryImages[0],
      galleryImages: galleryImages,
      description:
        (r as any).description ||
        `${r.name} is a renowned dining spot along the Nepal highway corridor, serving authentic organic Thakali thali, Himalayan coffee, and local delicacies.`,
      amenities:
        (r as any).dietaryOptions ||
        r.dietaryOptions ||
        [
          "Organic Ingredients",
          "Outdoor Seating",
          "Free Wi-Fi",
          "Highway Parking",
          "Vegetarian Friendly",
        ],
      hours: r.openingHours
        ? [{ day: "Daily Operating Hours", time: r.openingHours }]
        : undefined,
      priceTag: r.averageMealPrice
        ? `${r.currency || "NRs"} ${r.averageMealPrice.toLocaleString()} / meal`
        : `${r.currency || "NRs"} 450 - 1,200 / meal`,
      entityType: "restaurant",
      offerings:
        (r as any).recommendedDishes &&
        (r as any).recommendedDishes.length > 0
          ? (r as any).recommendedDishes.map((dish: string) => ({
              title: dish,
              price: `${r.currency || "NRs"} ${r.averageMealPrice || 450}`,
              desc: `Handcrafted signature preparation using fresh local ingredients.`,
            }))
          : [
              {
                title: "Organic Thakali Khana Set",
                price: `${r.currency || "NRs"} ${r.averageMealPrice || 650}`,
                desc: "Authentic buckwheat dhido/rice, black lentil soup, mutton curry, ghee & fermented pickles.",
              },
              {
                title: "Special Himalayan Chicken Momos",
                price: `${r.currency || "NRs"} 350`,
                desc: "Steamed handmade dumplings served with spicy tomato and sesame chutney.",
              },
              {
                title: "Fresh Himalayan Arabica Coffee",
                price: `${r.currency || "NRs"} 220`,
                desc: "Locally roasted Organic Nepalese coffee beans.",
              },
            ],
    });
    setShowYelpModal(true);
  };

  // ============= CMS + API FETCH =============
  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const storeItems = cmsStore.getRestaurants();
      const response = await apiRequest<BackendRestaurant[]>(
        "/restaurants"
      ).catch(() => null);
      const backendRestaurants = Array.isArray(response) ? response : [];

      let mappedRestaurants: Restaurant[] = [];

      if (backendRestaurants.length > 0) {
        mappedRestaurants = backendRestaurants.map((bItem: any) => {
          const storeMatch = storeItems.find(
            (s) => String(s.id) === String(bItem.id)
          );
          const photos =
            Array.isArray(storeMatch?.photos) && storeMatch.photos.length > 0
              ? storeMatch.photos
              : Array.isArray(bItem.photos) && bItem.photos.length > 0
              ? bItem.photos
              : bItem.imageUrl
              ? [bItem.imageUrl]
              : storeMatch?.imageUrl
              ? [storeMatch.imageUrl]
              : [];

          const imageUrl =
            bItem.imageUrl ||
            photos[0] ||
            storeMatch?.imageUrl ||
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80";

          const currency = storeMatch?.currency || bItem.currency || "NRs";
          const averageMealPrice =
            storeMatch?.averageMealPrice !== undefined
              ? storeMatch.averageMealPrice
              : Number(bItem.averageMealPrice) || 650;

          const base = mapRestaurant(bItem);
          const location =
            storeMatch?.location &&
            storeMatch.location.trim() !== "" &&
            storeMatch.location !== "N/A"
              ? storeMatch.location
              : base.location;
          return {
            ...base,
            location,
            currency,
            averageMealPrice,
            image: imageUrl,
            photos: photos.length > 0 ? photos : [imageUrl],
            lat: (storeMatch as any)?.latitude || base.lat,
            lng: (storeMatch as any)?.longitude || base.lng,
          };
        });
      }

      storeItems.forEach((r) => {
        if (!mappedRestaurants.some((m) => String(m.id) === String(r.id))) {
          const photos =
            Array.isArray(r.photos) && r.photos.length > 0
              ? r.photos
              : r.imageUrl
              ? [r.imageUrl]
              : [];
          const imageUrl =
            r.imageUrl ||
            photos[0] ||
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80";

          mappedRestaurants.unshift({
            id: String(r.id),
            name: r.restaurantName || "Unnamed Restaurant",
            description:
              r.contactDetails || "Delicious local food and dining experience.",
            image: imageUrl,
            photos: photos.length > 0 ? photos : [imageUrl],
            rating: 4.8,
            reviews: 42,
            location: r.location || "Location unavailable",
            cuisine:
              r.cuisineTypes && r.cuisineTypes.length > 0
                ? r.cuisineTypes
                : ["Thakali", "Nepali"],
            priceRange: r.priceRange || "NPR NPR",
            currency: r.currency || "NRs",
            averageMealPrice: Number(r.averageMealPrice) || 650,
            openingHours: r.openingHours || "07:00 AM - 09:30 PM",
            distance: "2.5 km",
            dietaryOptions: ["Vegetarian", "Organic"],
            featured: true,
            lat: (r as any).latitude,
            lng: (r as any).longitude,
            source: "cms",
          });
        }
      });

      setRestaurants(mappedRestaurants);
    } catch (err) {
      console.error(
        "Failed to fetch restaurants, loading store fallback:",
        err
      );
      const storeItems = cmsStore.getRestaurants();
      const mappedRestaurants = storeItems.map((r) => {
        const photos =
          Array.isArray(r.photos) && r.photos.length > 0
            ? r.photos
            : r.imageUrl
            ? [r.imageUrl]
            : [];
        const imageUrl =
          r.imageUrl ||
          photos[0] ||
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80";

        return {
          id: String(r.id),
          name: r.restaurantName || "Unnamed Restaurant",
          description:
            r.contactDetails || "Delicious local food and dining experience.",
          image: imageUrl,
          photos: photos.length > 0 ? photos : [imageUrl],
          rating: 4.8,
          reviews: 42,
          location: r.location || "Location unavailable",
          cuisine:
            r.cuisineTypes && r.cuisineTypes.length > 0
              ? r.cuisineTypes
              : ["Thakali", "Nepali"],
          priceRange: (r.priceRange || "NPR NPR") as any,
          openingHours: r.openingHours || "07:00 AM - 09:30 PM",
          distance: "2.5 km",
          dietaryOptions: ["Vegetarian", "Organic"],
          featured: true,
          lat: undefined,
          lng: undefined,
          source: "cms" as const,
        };
      });
      setRestaurants(mappedRestaurants);
      setError("");
    } finally {
      setLoading(false);
    }
  }, []);

  // ============= GOOGLE PLACES FETCH =============
  const fetchGoogleRestaurants = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setGoogleRestaurants([]);
      return;
    }

    setGoogleLoading(true);
    try {
      await loadGooglePlacesScript();
      const google = (window as any).google;

      if (!google?.maps?.places) {
        console.warn("Google Places not available");
        setGoogleRestaurants([]);
        setGoogleLoading(false);
        return;
      }

      const service = getPlacesService();

      // Step 1: Geocode
      const geocodeQuery = (): Promise<{ lat: number; lng: number } | null> =>
        new Promise((resolve) => {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { address: query },
            (results: any, status: any) => {
              if (status === "OK" && results?.[0]) {
                const loc = results[0].geometry.location;
                resolve({ lat: loc.lat(), lng: loc.lng() });
              } else {
                resolve(null);
              }
            }
          );
        });

      const center = await geocodeQuery();
      const searchCenter = center
        ? new google.maps.LatLng(center.lat, center.lng)
        : new google.maps.LatLng(28.3949, 84.124);

      // Step 2: Text Search
      const textSearch = (): Promise<any[]> =>
        new Promise((resolve) => {
          service.textSearch(
            {
              query: `restaurants in ${query}`,
              location: searchCenter,
              radius: 15000,
            },
            (results: any, status: any) => {
              if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                results
              ) {
                resolve(results);
              } else {
                console.warn("Places textSearch status:", status);
                resolve([]);
              }
            }
          );
        });

      const results = await textSearch();
      console.log("Google Places restaurants:", results);

      const converted: Restaurant[] = results
        .slice(0, 20)
        .map((place: any, index: number) => {
          const lat = place.geometry?.location?.lat() ?? 0;
          const lng = place.geometry?.location?.lng() ?? 0;
          const photoUrl = place.photos?.[0]?.getUrl({
            maxWidth: 800,
            maxHeight: 600,
          });

          const priceLevelMap: Record<number, Restaurant["priceRange"]> = {
            1: "NPR",
            2: "NPR NPR",
            3: "NPR NPR NPR",
            4: "NPR NPR NPR NPR",
          };
          const priceRange =
            priceLevelMap[place.price_level as number] || "NPR NPR";

          const avgPrice =
            place.price_level === 4
              ? 2000
              : place.price_level === 3
              ? 1200
              : place.price_level === 2
              ? 700
              : 450;

          const types: string[] = place.types || [];
          const cuisineGuess = types
            .filter((t: string) =>
              [
                "restaurant",
                "cafe",
                "bar",
                "meal_takeaway",
                "meal_delivery",
                "bakery",
              ].includes(t)
            )
            .map((t: string) =>
              t
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())
            );
          const cuisine = cuisineGuess.length > 0 ? cuisineGuess : ["Restaurant"];

          return {
            id: `google-${place.place_id || index}`,
            placeId: place.place_id,
            name: place.name || "Unnamed Restaurant",
            description: place.formatted_address || "Restaurant via Google",
            image:
              photoUrl ||
              "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
            photos: place.photos
              ? place.photos
                  .slice(0, 6)
                  .map((p: any) => p.getUrl({ maxWidth: 1200 }))
              : [],
            rating: place.rating ?? 4.5,
            reviews: place.user_ratings_total ?? 0,
            location: place.formatted_address || place.vicinity || "Nepal",
            cuisine,
            priceRange,
            currency: "NRs",
            averageMealPrice: avgPrice,
            openingHours: place.opening_hours?.open_now
              ? "Open Now"
              : "07:00 AM - 10:00 PM",
            distance: "1.0 km",
            dietaryOptions: ["Vegetarian", "Organic"],
            featured: false,
            lat,
            lng,
            source: "google",
            googleRating: place.rating,
          };
        });

      setGoogleRestaurants(converted);
    } catch (err) {
      console.error("Google Places error:", err);
      setGoogleRestaurants([]);
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  // ============= GOOGLE SEARCH DEBOUNCE =============
  useEffect(() => {
    if (!useGoogleSearch) {
      setGoogleRestaurants([]);
      return;
    }
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setGoogleRestaurants([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchGoogleRestaurants(searchQuery);
    }, 900);

    return () => clearTimeout(timer);
  }, [searchQuery, useGoogleSearch, fetchGoogleRestaurants]);

  useEffect(() => {
    void fetchRestaurants();
  }, [fetchRestaurants]);

  // ============= MERGE + FILTER =============
  const mergedRestaurants = React.useMemo(() => {
    let combined: Restaurant[] = [...restaurants, ...googleRestaurants];

    // Duplicate removal (name + location)
    const seen = new Set<string>();
    combined = combined.filter((r) => {
      const key = `${(r.name || "").toLowerCase().trim()}-${(r.location || "")
        .toLowerCase()
        .trim()
        .slice(0, 40)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return combined;
  }, [restaurants, googleRestaurants]);

  const availableCuisines = React.useMemo(() => {
    const cuisines = mergedRestaurants.flatMap((restaurant) => restaurant.cuisine);
    return Array.from(new Set(cuisines)).filter(Boolean).sort();
  }, [mergedRestaurants]);

  const filteredRestaurants = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const googleIds = new Set(googleRestaurants.map((g) => g.id));

    return mergedRestaurants.filter((restaurant) => {
      // Google results already matched by search
      const isFromGoogle = googleIds.has(restaurant.id);

      const matchesSearch =
        !query ||
        isFromGoogle ||
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.location.toLowerCase().includes(query) ||
        restaurant.description.toLowerCase().includes(query) ||
        restaurant.cuisine.some((cuisine) =>
          cuisine.toLowerCase().includes(query)
        );

      const matchesCuisine =
        selectedCuisine.length === 0 ||
        restaurant.cuisine.some((cuisine) =>
          selectedCuisine.includes(cuisine)
        );

      return matchesSearch && matchesCuisine;
    });
  }, [mergedRestaurants, searchQuery, selectedCuisine, googleRestaurants]);

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisine((previous) =>
      previous.includes(cuisine)
        ? previous.filter((item) => item !== cuisine)
        : [...previous, cuisine]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCuisine([]);
  };

  const handleMarkerClick = (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    if (restaurantListRef.current) {
      const cards =
        restaurantListRef.current.querySelectorAll("[data-restaurant-id]");
      cards.forEach((card) => {
        if (card.getAttribute("data-restaurant-id") === restaurantId) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          card.classList.add("ring-2", "ring-blue-500", "shadow-lg");
          setTimeout(() => {
            card.classList.remove("ring-2", "ring-blue-500", "shadow-lg");
          }, 2000);
        }
      });
    }
  };

  const isLoading = loading || googleLoading;

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
                  placeholder="Search city, restaurant name... (e.g. Pokhara, Kathmandu)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-white/95 text-gray-900 placeholder-gray-500 border-0 rounded-xl focus:ring-2 focus:ring-white/50 outline-none transition-all shadow-sm text-sm"
                />
                {googleLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setUseGoogleSearch(!useGoogleSearch)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  useGoogleSearch
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-white/20 backdrop-blur-sm text-white border border-white/30"
                }`}
                title="Toggle Google Places search"
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">
                  {useGoogleSearch ? "Google ON" : "Google OFF"}
                </span>
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

          {/* Cuisine filters */}
          {availableCuisines.length > 0 && (
            <div className="pb-3 flex gap-2 flex-wrap items-center">
              {availableCuisines.slice(0, 8).map((cuisine) => (
                <button
                  key={cuisine}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedCuisine.includes(cuisine)
                      ? "bg-white text-blue-600 shadow-md"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                  onClick={() => toggleCuisine(cuisine)}
                >
                  {cuisine}
                </button>
              ))}
              {googleRestaurants.length > 0 && (
                <span className="text-xs text-green-200 bg-green-500/30 px-2 py-1 rounded-full flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {googleRestaurants.length} from Google
                </span>
              )}
              {(searchQuery || selectedCuisine.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/80 text-white hover:bg-red-500 transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div
        className={`flex-1 flex transition-all duration-300 ${
          isMapExpanded ? "flex-col-reverse" : "flex-row"
        }`}
      >
        {/* Restaurant List - Left */}
        <div
          className={`${
            isMapExpanded ? "h-1/2" : "w-1/2"
          } overflow-y-auto bg-gray-50 border-r border-gray-200`}
          style={{ height: isMapExpanded ? "50%" : "calc(100vh - 120px)" }}
          ref={restaurantListRef}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-700 font-medium text-sm">
                {isLoading && filteredRestaurants.length === 0
                  ? "Loading..."
                  : `${filteredRestaurants.length} restaurant${
                      filteredRestaurants.length === 1 ? "" : "s"
                    } found`}
              </p>
              {searchQuery.length >= 3 && googleLoading && (
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Searching Google...
                </span>
              )}
            </div>

            {isLoading && filteredRestaurants.length === 0 ? (
              <LoadingSkeleton />
            ) : filteredRestaurants.length === 0 ? (
              <EmptyState
                message={
                  searchQuery.length >= 3
                    ? `No restaurants found for "${searchQuery}". Try another city name.`
                    : "No restaurants match your search or selected cuisine filters."
                }
              />
            ) : (
              <div className="space-y-3">
                {filteredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    data-restaurant-id={restaurant.id}
                  >
                    <CompactRestaurantCard
                      restaurant={restaurant}
                      isSelected={selectedRestaurantId === restaurant.id}
                      onClick={() => {
                        setSelectedRestaurantId(restaurant.id);
                        handleMarkerClick(restaurant.id);
                        handleOpenYelpDetail(restaurant);
                      }}
                      onViewDetails={() => handleOpenYelpDetail(restaurant)}
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
            items={filteredRestaurants.map((r) => ({
              id: r.id,
              name: r.name,
              location: r.location,
              priceTag: r.averageMealPrice
                ? `${r.currency || "NRs"} ${r.averageMealPrice}`
                : r.priceRange || "$$",
              rating: r.rating || 4.7,
              image: r.image,
              lat: (r as any).latitude || r.lat,
              lng: (r as any).longitude || r.lng,
              category: "restaurant",
            }))}
            selectedId={selectedRestaurantId}
            onMarkerClick={(id) => {
              setSelectedRestaurantId(id);
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

export default RestaurantsPage;  