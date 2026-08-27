// RestaurantsPage.tsx - With Split Layout (Left List + Right Map)
"use client";

import "@/styles/pages/restaurants/restaurants.css";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { SafeImage } from "@/components/common/SafeImage";
import { apiRequest } from "@/lib/api";
import { cmsStore } from "@/lib/cms-store";
import YelpDetailModal, { YelpDetailData } from "@/components/common/YelpDetailModal";
import { InteractiveMap, MapMarkerItem } from "@/components/common/InteractiveMap";

import { Search, Filter, Star, MapPin, Clock, Leaf, ArrowLeft, Maximize2, Minimize2 } from "lucide-react";

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
  openingHours: string;
  distance: string;
  dietaryOptions: string[];
  featured: boolean;
  lat?: number;
  lng?: number;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

/**
 * Convert backend restaurant response
 * into frontend Restaurant card format.
 */
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

  const rawPhotos: string[] = Array.isArray(restaurant.photos) && restaurant.photos.length > 0
    ? restaurant.photos
    : Array.isArray(restaurant.restaurantPhotos) && restaurant.restaurantPhotos.length > 0
    ? restaurant.restaurantPhotos
    : restaurant.imageUrl
    ? [restaurant.imageUrl]
    : [];

  const mainImage = restaurant.imageUrl?.trim() || rawPhotos[0] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80";

  return {
    id: String(restaurant.id),
    name: restaurant.restaurantName?.trim() || restaurant.name?.trim() || "Unnamed Restaurant",
    description: restaurant.contactDetails?.trim() || restaurant.description?.trim() || "Discover a great dining experience along your journey.",
    image: mainImage,
    photos: rawPhotos.length > 0 ? rawPhotos : [mainImage],
    rating: 4.8,
    reviews: 36,
    location: restaurant.location?.trim() || "Location unavailable",
    cuisine: Array.isArray(restaurant.cuisineTypes) && restaurant.cuisineTypes.length > 0
      ? restaurant.cuisineTypes
      : Array.isArray(restaurant.cuisine) && restaurant.cuisine.length > 0
      ? restaurant.cuisine
      : ["Thakali", "Nepali"],
    priceRange: restaurant.priceRange && ["NPR", "NPR NPR", "NPR NPR NPR", "NPR NPR NPR NPR"].includes(restaurant.priceRange)
      ? restaurant.priceRange
      : "NPR NPR",
    openingHours: restaurant.openingHours?.trim() || "07:00 AM - 09:30 PM",
    distance: "1.5 km",
    dietaryOptions: ["Vegetarian", "Organic"],
    featured: restaurant.approvalStatus === "Published" || restaurant.approvalStatus === "Approved",
    lat,
    lng,
  };
};

// ============= LOADING SKELETON =============
const LoadingSkeleton: React.FC = () => {
  return (
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
};

// ============= EMPTY STATE =============
const EmptyState: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-6xl mb-4">🍽️</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Restaurants Found</h3>
      <p className="text-gray-500 max-w-md mx-auto text-center">{message}</p>
    </div>
  );
};

// ============= MAP COMPONENT =============
const MapComponent: React.FC<{
  restaurants: Restaurant[];
  selectedRestaurantId?: string | null;
  onMarkerClick: (restaurantId: string) => void;
  center?: { lat: number; lng: number };
}> = ({ restaurants, selectedRestaurantId, onMarkerClick, center = { lat: 27.7172, lng: 85.324 } }) => {
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

        // Add markers for each restaurant
        restaurants.forEach((restaurant, index) => {
          let position;
          if (restaurant.lat && restaurant.lng) {
            position = { lat: restaurant.lat, lng: restaurant.lng };
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
            title: restaurant.name,
            animation: window.google.maps.Animation.DROP,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: selectedRestaurantId === restaurant.id ? "#2563EB" : "#F59E0B",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
              scale: selectedRestaurantId === restaurant.id ? 14 : 10,
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
                <strong style="font-size: 14px;">${restaurant.name}</strong>
                <div style="font-size: 12px; color: #666; margin: 4px 0;">📍 ${restaurant.location}</div>
                <div style="display: flex; align-items: center; gap: 4px; margin: 4px 0;">
                  <span style="color: #f59e0b;">★</span>
                  <span style="font-size: 13px; font-weight: 600;">${restaurant.rating}</span>
                  <span style="font-size: 12px; color: #666;">(${restaurant.reviews})</span>
                </div>
                <div style="font-size: 12px; color: #666; margin: 4px 0;">
                  🕐 ${restaurant.openingHours}
                </div>
                <div style="display: flex; gap: 4px; flex-wrap: wrap; margin: 4px 0;">
                  ${restaurant.cuisine.slice(0, 2).map(c => `<span style="background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 4px; font-size: 10px;">${c}</span>`).join('')}
                </div>
                <button 
                  onclick="window.handleRestaurantView('${restaurant.id}')"
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
                  View Restaurant
                </button>
              </div>
            `,
          });

          marker.addListener("click", () => {
            onMarkerClick(restaurant.id);
            infoWindow.open(map, marker);
          });

          if (selectedRestaurantId === restaurant.id) {
            setTimeout(() => {
              infoWindow.open(map, marker);
              map.panTo(position);
              map.setZoom(15);
            }, 500);
          }
        });

        if (restaurants.length > 1) {
          const bounds = new window.google.maps.LatLngBounds();
          restaurants.forEach((restaurant) => {
            let pos;
            if (restaurant.lat && restaurant.lng) {
              pos = { lat: restaurant.lat, lng: restaurant.lng };
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

        (window as any).handleRestaurantView = (restaurantId: string) => {
          onMarkerClick(restaurantId);
        };

      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError("Failed to load map. Please check your API key.");
      }
    };

    loadGoogleMaps();

    return () => {
      delete (window as any).handleRestaurantView;
    };
  }, [center, restaurants, selectedRestaurantId, onMarkerClick]);

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
      {isMapLoaded && restaurants.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-xs text-gray-600">
          📍 {restaurants.length} restaurant{restaurants.length > 1 ? 's' : ''} displayed
        </div>
      )}
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
  const dietaryList = Array.isArray(restaurant.dietaryOptions) && restaurant.dietaryOptions.length > 0
    ? restaurant.dietaryOptions
    : ["Organic Ingredients", "Outdoor Seating", "Free Wi-Fi", "Highway Parking"];

  return (
    <div
      className={`bg-white rounded-xl border transition-all cursor-pointer hover:shadow-md group ${
        isSelected ? "border-red-500 ring-2 ring-red-500/30 shadow-md" : "border-gray-200 hover:border-red-300"
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
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-base font-extrabold text-slate-900 truncate group-hover:text-red-600 transition-colors">
                {restaurant.name}
              </h3>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full flex-shrink-0">
                <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                <span className="text-xs font-extrabold text-amber-900">{restaurant.rating || 4.7}</span>
                <span className="text-[10px] text-slate-500">({restaurant.reviews || 36})</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-600 text-xs mb-2 flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                <span className="truncate font-medium">{restaurant.location}</span>
              </div>
              {restaurant.openingHours && (
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span>{restaurant.openingHours}</span>
                </div>
              )}
            </div>

            {/* Dietary & Cuisine Options */}
            <div className="flex gap-1.5 flex-wrap">
              {restaurant.cuisine.map((c) => (
                <span key={c} className="px-2 py-0.5 bg-red-50 text-red-700 rounded-md text-[10px] font-bold border border-red-200/60">
                  {c}
                </span>
              ))}
              {dietaryList.slice(0, 2).map((diet, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium border border-slate-200/60">
                  {diet}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                {restaurant.priceRange || "$$"}
              </span>
              <span className="text-slate-500 text-xs ml-1.5">NRs 450 - 1,200 / meal</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onViewDetails) onViewDetails();
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-red-600 hover:bg-red-700 text-white shadow-sm hover:scale-105 active:scale-95"
            >
              View Details →
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
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [yelpDetailData, setYelpDetailData] = useState<YelpDetailData | null>(null);
  const [showYelpModal, setShowYelpModal] = useState(false);
  const restaurantListRef = useRef<HTMLDivElement>(null);

  const handleOpenYelpDetail = (r: Restaurant) => {
    const galleryImages = (Array.isArray(r.photos) && r.photos.length > 0)
      ? r.photos
      : (r.image ? [r.image] : []);

    setYelpDetailData({
      id: r.id,
      name: r.name,
      category: r.cuisine.join(" • ") || "Traditional Nepalese & Thakali Cuisine",
      rating: r.rating || 4.7,
      reviewCount: r.reviews || 36,
      priceLevel: r.priceRange || "$$",
      address: r.location,
      location: r.location,
      phone: (r as any).contactDetails || r.description || "+977 1 4220000",
      whatsapp: (r as any).whatsappNumber || "+9779801112233",
      image: r.image || galleryImages[0],
      galleryImages: galleryImages,
      description: (r as any).description || `${r.name} is a renowned dining spot along the Nepal highway corridor, serving authentic organic Thakali thali, Himalayan coffee, and local delicacies.`,
      amenities: (r as any).dietaryOptions || r.dietaryOptions || ["Organic Ingredients", "Outdoor Seating", "Free Wi-Fi", "Highway Parking", "Vegetarian Friendly"],
      hours: r.openingHours ? [{ day: "Daily Operating Hours", time: r.openingHours }] : undefined,
      priceTag: "NRs 450 - 1,200 / meal",
      entityType: "restaurant",
      offerings: (r as any).recommendedDishes && (r as any).recommendedDishes.length > 0 ? (r as any).recommendedDishes.map((dish: string) => ({
        title: dish,
        price: "NRs 450",
        desc: `Handcrafted signature preparation using fresh local ingredients.`,
      })) : [
        { title: "Organic Thakali Khana Set", price: "NRs 650", desc: "Authentic buckwheat dhido/rice, black lentil soup, mutton curry, ghee & fermented pickles." },
        { title: "Special Himalayan Chicken Momos", price: "NRs 350", desc: "Steamed handmade dumplings served with spicy tomato and sesame chutney." },
        { title: "Fresh Himalayan Arabica Coffee", price: "NRs 220", desc: "Locally roasted Organic Nepalese coffee beans." },
      ],
    });
    setShowYelpModal(true);
  };

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const storeItems = cmsStore.getRestaurants();
      const response = await apiRequest<BackendRestaurant[]>("/restaurants").catch(() => null);
      const backendRestaurants = Array.isArray(response) ? response : [];

      let mappedRestaurants: Restaurant[] = [];

      if (backendRestaurants.length > 0) {
        mappedRestaurants = backendRestaurants.map((bItem: any) => {
          const storeMatch = storeItems.find((s) => String(s.id) === String(bItem.id));
          const photos = (Array.isArray(storeMatch?.photos) && storeMatch.photos.length > 0)
            ? storeMatch.photos
            : (Array.isArray(bItem.photos) && bItem.photos.length > 0)
            ? bItem.photos
            : (bItem.imageUrl ? [bItem.imageUrl] : (storeMatch?.imageUrl ? [storeMatch.imageUrl] : []));

          const imageUrl = bItem.imageUrl || photos[0] || storeMatch?.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80";

          const base = mapRestaurant(bItem);
          return {
            ...base,
            image: imageUrl,
            photos: photos.length > 0 ? photos : [imageUrl],
          };
        });
      }

      if (mappedRestaurants.length === 0) {
        mappedRestaurants = storeItems.map((r) => {
          const photos = (Array.isArray(r.photos) && r.photos.length > 0)
            ? r.photos
            : (r.imageUrl ? [r.imageUrl] : []);
          const imageUrl = r.imageUrl || photos[0] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80";

          return {
            id: String(r.id),
            name: r.restaurantName || "Unnamed Restaurant",
            description: r.contactDetails || "Delicious local food and dining experience.",
            image: imageUrl,
            photos: photos.length > 0 ? photos : [imageUrl],
            rating: 4.8,
            reviews: 42,
            location: r.location || "Location unavailable",
            cuisine: r.cuisineTypes && r.cuisineTypes.length > 0 ? r.cuisineTypes : ["Thakali", "Nepali"],
            priceRange: r.priceRange || "NPR NPR",
            openingHours: r.openingHours || "07:00 AM - 09:30 PM",
            distance: "2.5 km",
            dietaryOptions: ["Vegetarian", "Organic"],
            featured: true,
            lat: undefined,
            lng: undefined,
          };
        });
      }

      setRestaurants(mappedRestaurants);
    } catch (err) {
      console.error("Failed to fetch restaurants, loading store fallback:", err);
      const storeItems = cmsStore.getRestaurants();
      const mappedRestaurants = storeItems.map((r) => {
        const photos = (Array.isArray(r.photos) && r.photos.length > 0)
          ? r.photos
          : (r.imageUrl ? [r.imageUrl] : []);
        const imageUrl = r.imageUrl || photos[0] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80";

        return {
          id: String(r.id),
          name: r.restaurantName || "Unnamed Restaurant",
          description: r.contactDetails || "Delicious local food and dining experience.",
          image: imageUrl,
          photos: photos.length > 0 ? photos : [imageUrl],
          rating: 4.8,
          reviews: 42,
          location: r.location || "Location unavailable",
          cuisine: r.cuisineTypes && r.cuisineTypes.length > 0 ? r.cuisineTypes : ["Thakali", "Nepali"],
          priceRange: r.priceRange || "NPR NPR",
          openingHours: r.openingHours || "07:00 AM - 09:30 PM",
          distance: "2.5 km",
          dietaryOptions: ["Vegetarian", "Organic"],
          featured: true,
          lat: undefined,
          lng: undefined,
        };
      });
      setRestaurants(mappedRestaurants);
      setError("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRestaurants();
  }, [fetchRestaurants]);

  const availableCuisines = React.useMemo(() => {
    const cuisines = restaurants.flatMap((restaurant) => restaurant.cuisine);
    return Array.from(new Set(cuisines)).filter(Boolean).sort();
  }, [restaurants]);

  const filteredRestaurants = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return restaurants.filter((restaurant) => {
      const matchesSearch =
        !query ||
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.location.toLowerCase().includes(query) ||
        restaurant.description.toLowerCase().includes(query) ||
        restaurant.cuisine.some((cuisine) =>
          cuisine.toLowerCase().includes(query),
        );

      const matchesCuisine =
        selectedCuisine.length === 0 ||
        restaurant.cuisine.some((cuisine) => selectedCuisine.includes(cuisine));

      return matchesSearch && matchesCuisine;
    });
  }, [restaurants, searchQuery, selectedCuisine]);

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisine((previous) =>
      previous.includes(cuisine)
        ? previous.filter((item) => item !== cuisine)
        : [...previous, cuisine],
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCuisine([]);
  };

  const handleMarkerClick = (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    if (restaurantListRef.current) {
      const cards = restaurantListRef.current.querySelectorAll("[data-restaurant-id]");
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
                  placeholder="Search restaurants by cuisine, name, or location..."
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

          {/* Cuisine filters */}
          {availableCuisines.length > 0 && (
            <div className="pb-3 flex gap-2 flex-wrap">
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
      <div className={`flex-1 flex transition-all duration-300 ${isMapExpanded ? "flex-col-reverse" : "flex-row"}`}>
        {/* Restaurant List - Left */}
        <div
          className={`${isMapExpanded ? "h-1/2" : "w-1/2"} overflow-y-auto bg-gray-50 border-r border-gray-200`}
          style={{ height: isMapExpanded ? "50%" : "calc(100vh - 120px)" }}
          ref={restaurantListRef}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-700 font-medium text-sm">
                {loading ? "Loading..." : `${filteredRestaurants.length} restaurants found`}
              </p>
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : filteredRestaurants.length === 0 ? (
              <EmptyState message="No restaurants match your search or selected cuisine filters." />
            ) : (
              <div className="space-y-3">
                {filteredRestaurants.map((restaurant) => (
                  <CompactRestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isSelected={selectedRestaurantId === restaurant.id}
                    onClick={() => {
                      setSelectedRestaurantId(restaurant.id);
                      handleMarkerClick(restaurant.id);
                      handleOpenYelpDetail(restaurant);
                    }}
                    onViewDetails={() => handleOpenYelpDetail(restaurant)}
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
            items={filteredRestaurants.map((r) => ({
              id: r.id,
              name: r.name,
              location: r.location,
              priceTag: r.priceRange || "$$",
              rating: r.rating || 4.7,
              image: r.image,
              lat: r.lat,
              lng: r.lng,
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