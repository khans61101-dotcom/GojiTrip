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

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  items,
  selectedId,
  onMarkerClick,
  center = { lat: 28.2096, lng: 83.9856 }, // Pokhara Nepal default center
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Ensure Leaflet CSS & JS loaded
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

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      const map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom: 12,
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
      // Coordinates fallback near center if missing
      const itemLat = item.lat && !isNaN(item.lat) && item.lat !== 0 ? item.lat : center.lat + (Math.random() - 0.5) * 0.04;
      const itemLng = item.lng && !isNaN(item.lng) && item.lng !== 0 ? item.lng : center.lng + (Math.random() - 0.5) * 0.04;

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
          <div style="font-size: 11px; color: #64748b; margin-top:2px;">📍 ${item.location || "Nepal"}</div>
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
      map.fitBounds(group, { padding: [40, 40], maxZoom: 14 });
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
