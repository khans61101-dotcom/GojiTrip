import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    L: any;
  }
}

export interface MapMarkerItem {
  id: string | number;
  name: string;
  location?: string;
  priceTag?: string;
  rating?: number;
  image?: string;
  lat?: number;
  lng?: number;
  category?: "hotel" | "restaurant" | "transport" | "place";
}

interface InteractiveMapProps {
  items: MapMarkerItem[];
  selectedId?: string | number | null;
  onMarkerClick: (id: string) => void;
  center?: { lat: number; lng: number };
  drawPolyline?: boolean;
}

// Extensive dictionary for cities, states, and countries
const LOCATION_COORDINATES_MAP: Record<string, { lat: number; lng: number }> = {
  // Punjab & North India
  "punjab": { lat: 30.9009, lng: 75.8573 },
  "panjab": { lat: 30.9009, lng: 75.8573 },
  "chandigarh": { lat: 30.7333, lng: 76.7794 },
  "ludhiana": { lat: 30.9009, lng: 75.8573 },
  "amritsar": { lat: 31.6340, lng: 74.8723 },
  "jalandhar": { lat: 31.3260, lng: 75.5762 },
  "patiala": { lat: 30.3398, lng: 76.3869 },
  "pathankot": { lat: 32.2686, lng: 75.6496 },
  "bathinda": { lat: 30.2110, lng: 74.9455 },
  "haryana": { lat: 29.0588, lng: 76.0856 },
  "gurgaon": { lat: 28.4595, lng: 77.0266 },
  "gurugram": { lat: 28.4595, lng: 77.0266 },

  // Goa & South/West India
  "goa": { lat: 15.2993, lng: 74.1240 },
  "panaji": { lat: 15.4909, lng: 73.8278 },
  "panjim": { lat: 15.4909, lng: 73.8278 },
  "margao": { lat: 15.2832, lng: 73.9862 },
  "vasco": { lat: 15.3960, lng: 73.8157 },
  "maharashtra": { lat: 19.7515, lng: 75.7139 },
  "nashik": { lat: 19.9975, lng: 73.7898 },
  "kolhapur": { lat: 16.7050, lng: 74.2433 },
  "karnataka": { lat: 15.3173, lng: 75.7139 },
  "hubli": { lat: 15.3647, lng: 75.1240 },
  "belgaum": { lat: 15.8497, lng: 74.4977 },

  // Central & Other India Cities & Regions
  "bhopal": { lat: 23.2599, lng: 77.4126 },
  "berasia": { lat: 23.6333, lng: 77.4333 },
  "berasiya": { lat: 23.6333, lng: 77.4333 },
  "madhya pradesh": { lat: 23.2599, lng: 77.4126 },
  "m.p": { lat: 23.2599, lng: 77.4126 },
  "m. p": { lat: 23.2599, lng: 77.4126 },
  "gwalior": { lat: 26.2183, lng: 78.1784 },
  "jabalpur": { lat: 23.1815, lng: 79.9864 },
  "sagar": { lat: 23.8388, lng: 78.7378 },
  "rewa": { lat: 24.5362, lng: 81.3037 },
  "satna": { lat: 24.6005, lng: 80.8322 },
  "sehore": { lat: 23.2030, lng: 77.0844 },
  "ashta": { lat: 23.0189, lng: 76.5502 },
  "sonkatch": { lat: 22.9772, lng: 76.3688 },
  "dewas": { lat: 22.9676, lng: 76.0534 },
  "indore": { lat: 22.7196, lng: 75.8577 },
  "ujjain": { lat: 23.1765, lng: 75.7885 },
  "ratlam": { lat: 23.3315, lng: 75.0367 },
  "omkareshwar": { lat: 22.2464, lng: 76.1517 },
  "maheshwar": { lat: 22.1770, lng: 75.5843 },
  "dhar": { lat: 22.5976, lng: 75.3023 },
  "mandav": { lat: 22.4357, lng: 75.3411 },
  "mhow": { lat: 22.5526, lng: 75.7554 },

  // Nepal Highway Corridor Locations
  "naubise": { lat: 27.7144, lng: 85.1764 },
  "malekhu": { lat: 27.8105, lng: 84.8290 },
  "mugling": { lat: 27.8596, lng: 84.5574 },
  "kurintar": { lat: 27.8683, lng: 84.5800 },
  "dumre": { lat: 27.9734, lng: 84.4258 },
  "bandipur": { lat: 27.9372, lng: 84.4172 },
  "damauli": { lat: 27.9701, lng: 84.2828 },
  "bharatpur": { lat: 27.6833, lng: 84.4333 },
  "kusma": { lat: 28.2255, lng: 83.6789 },
  "beni": { lat: 28.3449, lng: 83.5647 },
  "tatopani": { lat: 28.4900, lng: 83.6550 },
  "jomsom": { lat: 28.7818, lng: 83.7431 },
  "kagbeni": { lat: 28.8378, lng: 83.7828 },
  "delhi": { lat: 28.6139, lng: 77.2090 },
  "new delhi": { lat: 28.6139, lng: 77.2090 },
  "mumbai": { lat: 19.0760, lng: 72.8777 },
  "bangalore": { lat: 12.9716, lng: 77.5946 },
  "bengaluru": { lat: 12.9716, lng: 77.5946 },
  "kolkata": { lat: 22.5726, lng: 88.3639 },
  "chennai": { lat: 13.0827, lng: 80.2707 },
  "hyderabad": { lat: 17.3850, lng: 78.4867 },
  "jaipur": { lat: 26.9124, lng: 75.7873 },
  "agra": { lat: 27.1767, lng: 78.0081 },
  "pune": { lat: 18.5204, lng: 73.8567 },
  "ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "surat": { lat: 21.1702, lng: 72.8311 },
  "lucknow": { lat: 26.8467, lng: 80.9462 },
  "varanasi": { lat: 25.3176, lng: 82.9739 },
  "patna": { lat: 25.5941, lng: 85.1376 },
  "shimla": { lat: 31.1048, lng: 77.1734 },
  "manali": { lat: 32.2432, lng: 77.1892 },
  "dharamsala": { lat: 32.2190, lng: 76.3234 },
  "rishikesh": { lat: 30.0869, lng: 78.2676 },
  "dehradun": { lat: 30.3165, lng: 78.0322 },
  "india": { lat: 20.5937, lng: 78.9629 },

  // Nepal Cities & Regions
  "kathmandu": { lat: 27.7172, lng: 85.3240 },
  "pokhara": { lat: 28.2096, lng: 83.9856 },
  "lakeside": { lat: 28.2096, lng: 83.9580 },
  "chitwan": { lat: 27.5291, lng: 84.3542 },
  "sauraha": { lat: 27.5756, lng: 84.4947 },
  "lumbini": { lat: 27.4776, lng: 83.2755 },
  "mustang": { lat: 28.9986, lng: 83.8473 },
  "jomson": { lat: 28.7816, lng: 83.7292 },
  "muktinath": { lat: 28.8170, lng: 83.8717 },
  "everest": { lat: 27.9881, lng: 86.9250 },
  "lukla": { lat: 27.6869, lng: 86.7294 },
  "namche": { lat: 27.8069, lng: 86.7142 },
  "annapurna": { lat: 28.5300, lng: 83.8700 },
  "nagarkot": { lat: 27.7172, lng: 85.5200 },
  "bhaktapur": { lat: 27.6710, lng: 85.4298 },
  "patan": { lat: 27.6644, lng: 85.3188 },
  "lalitpur": { lat: 27.6644, lng: 85.3188 },
  "dharan": { lat: 26.8124, lng: 87.2834 },
  "biratnagar": { lat: 26.4525, lng: 87.2718 },
  "birgunj": { lat: 27.0099, lng: 84.8777 },
  "janakpur": { lat: 26.7288, lng: 85.9248 },
  "butwal": { lat: 27.7006, lng: 83.4484 },
  "bhairahawa": { lat: 27.5050, lng: 83.4533 },
  "nepalgunj": { lat: 28.0500, lng: 81.6167 },
  "dhangadhi": { lat: 28.6833, lng: 80.6000 },
  "gorkha": { lat: 28.0000, lng: 84.6333 },
  "nepal": { lat: 28.3949, lng: 84.1240 },
};

function lookupSingleCoordinate(str: string): { lat: number; lng: number } | null {
  const strLower = str.toLowerCase().trim();
  if (!strLower) return null;

  // 1. Search specific city/region keys (sorted by length descending, ignoring generic country names)
  const cityKeysSorted = Object.keys(LOCATION_COORDINATES_MAP)
    .filter((k) => k !== "india" && k !== "nepal")
    .sort((a, b) => b.length - a.length);

  for (const key of cityKeysSorted) {
    if (strLower.includes(key)) {
      return LOCATION_COORDINATES_MAP[key];
    }
  }

  // 2. Fallback to generic country centers if no specific city matches
  if (strLower.includes("india")) return LOCATION_COORDINATES_MAP["india"];
  if (strLower.includes("nepal")) return LOCATION_COORDINATES_MAP["nepal"];

  return null;
}

function resolveCoordinates(item: MapMarkerItem): { lat: number; lng: number } {
  const rawText = `${item.location || ""} ${item.name || ""}`.trim();
  const textLower = rawText.toLowerCase();

  // 1. Top priority: Text location lookup against known cities/regions (e.g. Bhopal, Indore, Pokhara, Kathmandu, Annapurna)
  // If the user's location string explicitly names a city, use that city's coordinates over old default lat/lng
  const singleMatch = lookupSingleCoordinate(rawText);
  if (singleMatch) {
    const hash = textLower.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const jitterLat = ((hash % 100) / 10000) - 0.005;
    const jitterLng = (((hash >> 2) % 100) / 10000) - 0.005;
    return { lat: singleMatch.lat + jitterLat, lng: singleMatch.lng + jitterLng };
  }

  // 2. Compound highway hub or address delimiter split e.g. "Bhopal, M.P - Devki Nagar", "Panjab - Goa"
  const splitDelimiters = [" - ", " – ", " — ", " to ", " ➔ ", " -> "];
  for (const delim of splitDelimiters) {
    if (textLower.includes(delim)) {
      const parts = textLower.split(delim);
      if (parts.length >= 2) {
        const c1 = lookupSingleCoordinate(parts[0]);
        const c2 = lookupSingleCoordinate(parts[1]);
        if (c1 && c2) {
          return {
            lat: (c1.lat + c2.lat) / 2,
            lng: (c1.lng + c2.lng) / 2,
          };
        }
        if (c1) return c1;
        if (c2) return c2;
      }
    }
  }

  // 3. Next priority: If no city match in text, use explicit numeric lat & lng (if valid & not default 0)
  const numLat = Number(item.lat);
  const numLng = Number(item.lng);
  if (!isNaN(numLat) && numLat !== 0 && !isNaN(numLng) && numLng !== 0) {
    return { lat: numLat, lng: numLng };
  }

  // 4. Smart fallback based on country keywords
  const indianTokens = ["india", "panjab", "punjab", "goa", "delhi", "mumbai", "bhopal", "indore", "jaipur", "highway", "hub"];
  const isIndian = indianTokens.some((t) => textLower.includes(t));
  const baseCenter = isIndian ? { lat: 20.5937, lng: 78.9629 } : { lat: 28.2096, lng: 83.9856 };

  let hash = 0;
  for (let i = 0; i < textLower.length; i++) {
    hash = (hash << 5) - hash + textLower.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = (Math.abs(hash) % 200) / 100 - 1;
  const lngOffset = (Math.abs(hash >> 3) % 200) / 100 - 1;

  return { lat: baseCenter.lat + latOffset, lng: baseCenter.lng + lngOffset };
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  items,
  selectedId,
  onMarkerClick,
  center = { lat: 28.2096, lng: 83.9856 },
  drawPolyline = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const polylineRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.L) {
      setLoaded(true);
      return;
    }

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setLoaded(true);
      document.head.appendChild(script);
    } else {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current || !window.L) return;

    const L = window.L;

    if (!mapInstanceRef.current) {
      const map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom: 7,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers & polyline
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (items.length === 0) return;

    const group: any[] = [];

    items.forEach((item, index) => {
      const coords = resolveCoordinates(item);
      const itemLat = coords.lat;
      const itemLng = coords.lng;

      const isSelected = String(item.id) === String(selectedId);
      const color = item.category === "restaurant" ? "#f97316" : item.category === "transport" ? "#10b981" : "#2563eb";

      const customIcon = L.divIcon({
        className: "custom-leaflet-pin",
        html: `
          <div style="
            background: ${isSelected ? "#dc2626" : color};
            color: white;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            transform: ${isSelected ? "scale(1.15)" : "scale(1)"};
            transition: all 0.2s;
          ">
            <span>📍 ${index + 1}</span>
            <span>${item.priceTag || ""}</span>
          </div>
        `,
        iconSize: [90, 30],
        iconAnchor: [45, 15],
      });

      const marker = L.marker([itemLat, itemLng], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px; max-width: 200px;">
          ${item.image ? `<img src="${item.image}" style="width:100%; height:80px; object-fit:cover; border-radius:8px; margin-bottom:6px;"/>` : ""}
          <strong style="font-size: 13px; color: #0f172a; display:block;">${item.name}</strong>
          <div style="font-size: 11px; color: #64748b; margin-top:2px;">📍 ${item.location || "Location"}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
            <span style="font-size: 12px; font-weight:bold; color: #16a34a;">${item.priceTag || ""}</span>
            <span style="font-size: 11px; color: #f59e0b; font-weight:bold;">★ ${item.rating || 4.8}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on("click", () => {
        onMarkerClick(String(item.id));
      });

      markersRef.current[String(item.id)] = marker;
      group.push([itemLat, itemLng]);
    });

    if (drawPolyline && group.length > 1) {
      polylineRef.current = L.polyline(group, {
        color: "#2563eb",
        weight: 4,
        opacity: 0.85,
        dashArray: "6, 8"
      }).addTo(map);
    }

    if (selectedId && markersRef.current[String(selectedId)]) {
      const selMarker = markersRef.current[String(selectedId)];
      const latLng = selMarker.getLatLng();
      map.setView([latLng.lat, latLng.lng], 13, { animate: true });
      selMarker.openPopup();
    } else if (group.length > 0) {
      if (group.length === 1) {
        map.setView(group[0], 11);
      } else {
        const bounds = L.latLngBounds(group);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [loaded, items, selectedId, center, onMarkerClick, drawPolyline]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-inner bg-slate-100">
      <div ref={containerRef} className="w-full h-full z-10" style={{ minHeight: "450px" }} />
      {!loaded && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Loading Map...</span>
          </div>
        </div>
      )}
      {loaded && items.length > 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-slate-200 text-xs font-semibold text-slate-700 z-[1000] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{items.length} Location Pin{items.length > 1 ? 's' : ''} Displayed</span>
        </div>
      )}
    </div>
  );
};
