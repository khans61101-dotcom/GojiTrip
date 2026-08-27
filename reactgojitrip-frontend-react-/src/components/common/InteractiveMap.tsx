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
}

// Extensive dictionary for cities, states, and countries
const LOCATION_COORDINATES_MAP: Record<string, { lat: number; lng: number }> = {
  // India Cities & Regions
  "bhopal": { lat: 23.2599, lng: 77.4126 },
  "indore": { lat: 22.7196, lng: 75.8577 },
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
  "goa": { lat: 15.2993, lng: 74.1240 },
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
  "bandipur": { lat: 27.9372, lng: 84.4172 },
  "gorkha": { lat: 28.0000, lng: 84.6333 },
  "nepal": { lat: 28.3949, lng: 84.1240 },
};

function resolveCoordinates(item: MapMarkerItem): { lat: number; lng: number } {
  // 1. If explicit valid lat & lng exist
  if (item.lat && !isNaN(item.lat) && item.lat !== 0 && item.lng && !isNaN(item.lng) && item.lng !== 0) {
    return { lat: item.lat, lng: item.lng };
  }

  // 2. Check location string & name against known dictionary
  const locLower = (item.location || "").toLowerCase().trim();
  const nameLower = (item.name || "").toLowerCase().trim();

  for (const [key, coords] of Object.entries(LOCATION_COORDINATES_MAP)) {
    if (locLower.includes(key) || nameLower.includes(key)) {
      const jitterLat = (Math.random() - 0.5) * 0.02;
      const jitterLng = (Math.random() - 0.5) * 0.02;
      return { lat: coords.lat + jitterLat, lng: coords.lng + jitterLng };
    }
  }

  // 3. Fallback: deterministic offset hash based on location text
  const strToHash = locLower || nameLower || "default";
  let hash = 0;
  for (let i = 0; i < strToHash.length; i++) {
    hash = (hash << 5) - hash + strToHash.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = (Math.abs(hash) % 200) / 100 - 1;
  const lngOffset = (Math.abs(hash >> 3) % 200) / 100 - 1;

  return { lat: 28.2096 + latOffset, lng: 83.9856 + lngOffset };
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  items,
  selectedId,
  onMarkerClick,
  center = { lat: 28.2096, lng: 83.9856 },
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
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

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

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

    if (group.length > 0) {
      if (group.length === 1) {
        map.setView(group[0], 11);
      } else {
        const bounds = L.latLngBounds(group);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
  }, [loaded, items, selectedId, center, onMarkerClick]);

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
