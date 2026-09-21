/**
 * Utility to calculate real Driving Distance (KM) and Estimated Travel Time
 * between any Origin Point and Destination Point.
 *
 * Uses:
 * 1. Pre-calculated verified city-pair database (instant, high accuracy)
 * 2. High-speed OSRM (OpenStreetMap Routing Engine) driving route calculation
 * 3. Fallback online geocoding (Nominatim) + OSRM
 * 4. Geometric Haversine road-curve formula fallback
 */

import { lookupSingleCoordinate } from "@/components/common/InteractiveMap";

export interface RouteCalcResult {
  distanceKm: number;
  travelTime: string; // e.g., "7 Hours 55 Mins", "2 Hours 30 Mins", etc.
  source: "predefined" | "osrm" | "calculated";
}

// Pre-verified driving distances and times for popular routes (Nepal, MP, India corridors)
const VERIFIED_ROUTES: Record<
  string,
  { distanceKm: number; travelTime: string }
> = {
  // Nepal corridors
  "pokhara-muktinath": { distanceKm: 170, travelTime: "8 Hours" },
  "pokhara-jomsom": { distanceKm: 155, travelTime: "7 Hours" },
  "pokhara-chitwan": { distanceKm: 145, travelTime: "5 Hours" },
  "pokhara-bandipur": { distanceKm: 75, travelTime: "2.5 Hours" },
  "kathmandu-pokhara": { distanceKm: 200, travelTime: "6 Hours" },
  "kathmandu-chitwan": { distanceKm: 170, travelTime: "5.5 Hours" },
  "kathmandu-nagarkot": { distanceKm: 32, travelTime: "1.5 Hours" },
  "kathmandu-bhaktapur": { distanceKm: 15, travelTime: "45 Mins" },
  "kathmandu-lumbini": { distanceKm: 290, travelTime: "8.5 Hours" },
  "pokhara-lumbini": { distanceKm: 195, travelTime: "6 Hours" },

  // MP / Central India corridors
  "bhopal-indore": { distanceKm: 195, travelTime: "3.5 Hours" },
  "indore-bhopal": { distanceKm: 195, travelTime: "3.5 Hours" },
  "bhopal-gwalior": { distanceKm: 430, travelTime: "7.5 Hours" },
  "bhopal-jabalpur": { distanceKm: 310, travelTime: "6 Hours" },
  "bhopal-sagar": { distanceKm: 170, travelTime: "3.5 Hours" },
  "bhopal-rewa": { distanceKm: 490, travelTime: "9 Hours" },
  "bhopal-delhi": { distanceKm: 780, travelTime: "13 Hours" },
  "bhopal-surat": { distanceKm: 620, travelTime: "11 Hours" },
  "bhopal-mumbai": { distanceKm: 770, travelTime: "14 Hours" },
  "bhopal-vidisha": { distanceKm: 55, travelTime: "1.2 Hours" },

  // From Indore
  "indore-surat": { distanceKm: 450, travelTime: "8.5 Hours" },
  "indore-mumbai": { distanceKm: 585, travelTime: "10.5 Hours" },
  "indore-ahmedabad": { distanceKm: 385, travelTime: "7 Hours" },
  "indore-ujjain": { distanceKm: 55, travelTime: "1 Hour" },
  "indore-omkareshwar": { distanceKm: 77, travelTime: "2 Hours" },
  "indore-ratlam": { distanceKm: 135, travelTime: "2.5 Hours" },
  "indore-mandav": { distanceKm: 95, travelTime: "2.2 Hours" },
  "indore-dhule": { distanceKm: 260, travelTime: "5 Hours" },
  "indore-pune": { distanceKm: 590, travelTime: "11 Hours" },
  "indore-gwalior": { distanceKm: 510, travelTime: "9 Hours" },
  "indore-delhi": { distanceKm: 820, travelTime: "14 Hours" },

  // North India / Golden Triangle
  "delhi-jaipur": { distanceKm: 280, travelTime: "4.5 Hours" },
  "delhi-agra": { distanceKm: 230, travelTime: "3.5 Hours" },
  "delhi-chandigarh": { distanceKm: 245, travelTime: "4 Hours" },
  "delhi-shimla": { distanceKm: 345, travelTime: "7 Hours" },
  "delhi-manali": { distanceKm: 530, travelTime: "11 Hours" },
  "delhi-dehradun": { distanceKm: 245, travelTime: "5 Hours" },
  "delhi-rishikesh": { distanceKm: 240, travelTime: "4.5 Hours" },
  "gwalior-delhi": { distanceKm: 360, travelTime: "5.5 Hours" },
  "gwalior-agra": { distanceKm: 120, travelTime: "2 Hours" },

  // Rajasthan
  "jaipur-ajmer": { distanceKm: 135, travelTime: "2.5 Hours" },
  "jaipur-pushkar": { distanceKm: 145, travelTime: "2.8 Hours" },
  "jaipur-udaipur": { distanceKm: 390, travelTime: "6.5 Hours" },
  "jaipur-jodhpur": { distanceKm: 330, travelTime: "5.5 Hours" },
  "jaipur-bikaner": { distanceKm: 335, travelTime: "5.5 Hours" },

  // West & Coastal
  "mumbai-pune": { distanceKm: 150, travelTime: "3 Hours" },
  "mumbai-goa": { distanceKm: 580, travelTime: "10 Hours" },
  "mumbai-surat": { distanceKm: 280, travelTime: "5 Hours" },
  "pune-goa": { distanceKm: 440, travelTime: "8 Hours" },
};

function normalizeKey(str: string): string {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Format hours and minutes nicely
 */
function formatDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return "0 Hours";
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);

  if (hours === 0) {
    return `${mins} Mins`;
  }
  if (mins === 0) {
    return `${hours} ${hours === 1 ? "Hour" : "Hours"}`;
  }
  return `${hours} ${hours === 1 ? "Hour" : "Hours"} ${mins} Mins`;
}

/**
 * Fetch coordinates for a place name using Nominatim API as fallback
 */
async function geocodePlace(name: string): Promise<{ lat: number; lng: number } | null> {
  // First check our comprehensive local coordinate dictionary
  const local = lookupSingleCoordinate(name);
  if (local) return local;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        name
      )}&limit=1`,
      {
        signal: controller.signal,
        headers: {
          "Accept-Language": "en",
        },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }
  } catch {
    // Network / timeout error, fallback
  }

  return null;
}

/**
 * Fetch real driving route distance and duration using public OSRM router
 */
async function fetchOsrmRoute(
  c1: { lat: number; lng: number },
  c2: { lat: number; lng: number }
): Promise<{ distanceKm: number; durationMinutes: number } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const url = `https://router.project-osrm.org/route/v1/driving/${c1.lng},${c1.lat};${c2.lng},${c2.lat}?overview=false`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.code === "Ok" && data.routes && data.routes[0]) {
        const route = data.routes[0];
        const km = Math.round(route.distance / 1000);
        const durationMin = Math.round(route.duration / 60);
        return { distanceKm: km, durationMinutes: durationMin };
      }
    }
  } catch {
    // Timeout or network error
  }
  return null;
}

/**
 * Main calculator function: Given origin and destination names,
 * automatically returns driving Distance (KM) and Est. Travel Time.
 */
export async function calculateRouteDistanceAndTime(
  origin: string,
  destination: string
): Promise<RouteCalcResult | null> {
  const org = (origin || "").trim();
  const dest = (destination || "").trim();

  if (!org || !dest) return null;

  // 1. Check verified pair database first (Instant & highly accurate)
  const k1 = `${normalizeKey(org)}-${normalizeKey(dest)}`;
  const k2 = `${normalizeKey(dest)}-${normalizeKey(org)}`;

  if (VERIFIED_ROUTES[k1]) {
    return {
      distanceKm: VERIFIED_ROUTES[k1].distanceKm,
      travelTime: VERIFIED_ROUTES[k1].travelTime,
      source: "predefined",
    };
  }
  if (VERIFIED_ROUTES[k2]) {
    return {
      distanceKm: VERIFIED_ROUTES[k2].distanceKm,
      travelTime: VERIFIED_ROUTES[k2].travelTime,
      source: "predefined",
    };
  }

  // Check partial key matches
  for (const [key, val] of Object.entries(VERIFIED_ROUTES)) {
    const [p1, p2] = key.split("-");
    const nOrg = normalizeKey(org);
    const nDest = normalizeKey(dest);
    if (
      (nOrg.includes(p1) || p1.includes(nOrg)) &&
      (nDest.includes(p2) || p2.includes(nDest))
    ) {
      return {
        distanceKm: val.distanceKm,
        travelTime: val.travelTime,
        source: "predefined",
      };
    }
  }

  // 2. Resolve coordinates of both points
  const [c1, c2] = await Promise.all([geocodePlace(org), geocodePlace(dest)]);

  if (c1 && c2) {
    // 3. Try real driving road engine (OSRM)
    const osrmResult = await fetchOsrmRoute(c1, c2);
    if (osrmResult && osrmResult.distanceKm > 0) {
      return {
        distanceKm: osrmResult.distanceKm,
        travelTime: formatDuration(osrmResult.durationMinutes),
        source: "osrm",
      };
    }

    // 4. Mathematical Haversine formula with road winding multiplier
    const R = 6371; // Earth radius in km
    const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
    const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((c1.lat * Math.PI) / 180) *
        Math.cos((c2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = R * c;

    // Mountainous or highway road winding coefficient: ~1.35x
    const roadKm = Math.round(straightKm * 1.35);

    // Realistic average speed estimate:
    // Mountainous / slow roads if distance < 200km in Nepal/hills (~35-40 km/h)
    // Highway speed if longer (~55-60 km/h)
    const isHills =
      org.toLowerCase().includes("pokhara") ||
      org.toLowerCase().includes("muktinath") ||
      dest.toLowerCase().includes("pokhara") ||
      dest.toLowerCase().includes("muktinath") ||
      org.toLowerCase().includes("manali") ||
      dest.toLowerCase().includes("manali") ||
      org.toLowerCase().includes("shimla") ||
      dest.toLowerCase().includes("shimla");

    const avgSpeed = isHills ? 32 : roadKm > 400 ? 58 : 48;
    const totalMinutes = Math.round((roadKm / avgSpeed) * 60);

    return {
      distanceKm: roadKm,
      travelTime: formatDuration(totalMinutes),
      source: "calculated",
    };
  }

  return null;
}
