// src/lib/google-places.ts
import { Hotel } from "@/types/hotel";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

let placesService: google.maps.places.PlacesService | null = null;
let scriptPromise: Promise<void> | null = null;

// Google Maps + Places script load karo (sirf ek baar)
export const loadGooglePlacesScript = (): Promise<void> => {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    // Agar already loaded hai
    if (window.google?.maps?.places) {
      resolve();
      return;
    }

    // Agar script tag already present hai
    const existing = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
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

  return scriptPromise;
};

// Places Service get karo (dummy div chahiye)
const getPlacesService = (): google.maps.places.PlacesService => {
  if (placesService) return placesService;
  const dummy = document.createElement("div");
  placesService = new google.maps.places.PlacesService(dummy);
  return placesService;
};

// 🔍 Location ke basis pe hotels search karo
export const searchHotelsFromGoogle = async (
  query: string,
  center?: { lat: number; lng: number }
): Promise<Hotel[]> => {
  await loadGooglePlacesScript();

  return new Promise((resolve, reject) => {
    const service = getPlacesService();

    // Step 1: Query se place dhoondo (agar center nahi diya)
    const doTextSearch = (searchCenter: google.maps.LatLng) => {
      service.textSearch(
        {
          query: `${query} hotels`,
          location: searchCenter,
          radius: 15000, // 15 km
        },
        (results, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
            resolve([]);
            return;
          }

          // Top 20 results ko Hotel format me convert karo
          const hotels: Hotel[] = results.slice(0, 20).map((place, index) => {
            const lat = place.geometry?.location?.lat() ?? 0;
            const lng = place.geometry?.location?.lng() ?? 0;
            const photoUrl = place.photos?.[0]?.getUrl({
              maxWidth: 800,
              maxHeight: 600,
            });

            return {
              id: `google-${place.place_id || index}`,
              placeId: place.place_id,
              name: place.name || "Unnamed Hotel",
              description:
                place.formatted_address || "No description available",
              image:
                photoUrl ||
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
              hotelPhotos: place.photos
                ? place.photos
                    .slice(0, 5)
                    .map((p) => p.getUrl({ maxWidth: 1200 }))
                : [],
              rating: place.rating ?? 4.5,
              reviews: place.user_ratings_total ?? 0,
              location: place.formatted_address || place.vicinity || "Nepal",
              pricePerNight: 2500, // Google price nahi deta, default
              currency: "NRs",
              amenities: [], // Details API se milega (Step 3)
              distance: "0.5 km",
              available: true,
              lat,
              lng,
              status: "published",
              roomTypes: [],
              propertyType: (place.name || "").toLowerCase().includes("homestay")
                ? "Homestay"
                : "Hotel",
              source: "google",
              googleRating: place.rating,
            };
          });

          resolve(hotels);
        }
      );
    };

    // Agar center diya hai to use karo, warna query se geocode karo
    if (center) {
      doTextSearch(new google.maps.LatLng(center.lat, center.lng));
    } else {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: query }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          doTextSearch(results[0].geometry.location);
        } else {
          // Fallback: Nepal center
          doTextSearch(new google.maps.LatLng(28.3949, 84.124));
        }
      });
    }
  });
};

// 📋 Ek place ki details (amenities etc.) fetch karo
export const getPlaceDetails = async (
  placeId: string
): Promise<Partial<Hotel>> => {
  await loadGooglePlacesScript();

  return new Promise((resolve) => {
    const service = getPlacesService();
    service.getDetails(
      {
        placeId,
        fields: [
          "name",
          "formatted_address",
          "formatted_phone_number",
          "rating",
          "user_ratings_total",
          "photos",
          "geometry",
          "website",
          "price_level",
          "opening_hours",
        ],
      },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
          resolve({});
          return;
        }
        resolve({
          contact: place.formatted_phone_number,
          hotelPhotos: place.photos
            ?.slice(0, 8)
            .map((p) => p.getUrl({ maxWidth: 1200 })),
          pricePerNight:
            place.price_level === 4
              ? 8000
              : place.price_level === 3
              ? 5000
              : place.price_level === 2
              ? 3000
              : 2000,
        });
      }
    );
  });
};