"use client";

import React, { useEffect, useRef } from "react";
import { Globe, MapPin, ExternalLink, Navigation } from "lucide-react";

export interface MapItem {
  id: string | number;
  title: string;
  location: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  imageUrl?: string | null;
}

interface MultiMarkerMapProps {
  items: MapItem[];
  selectedId?: string | number;
  onItemSelect?: (item: MapItem) => void;
  title?: string;
  height?: string;
}

// City Geocode Coordinate Lookup Map
const GEOLOCATIONS: Record<string, { lat: number; lng: number }> = {
  // Nepal Cities & Towns
  pokhara: { lat: 28.2096, lng: 83.9856 },
  kathmandu: { lat: 27.7172, lng: 85.3240 },
  mustang: { lat: 28.7917, lng: 83.7375 },
  jomsom: { lat: 28.7819, lng: 83.7402 },
  muktinath: { lat: 28.8167, lng: 83.8711 },
  beni: { lat: 28.3444, lng: 83.5656 },
  tatopani: { lat: 28.4900, lng: 83.6540 },
  kagbeni: { lat: 28.8350, lng: 83.7820 },
  marpha: { lat: 28.7538, lng: 83.7011 },
  chitwan: { lat: 27.5291, lng: 84.3542 },
  sauraha: { lat: 27.5794, lng: 84.4950 },
  lumbini: { lat: 27.4833, lng: 83.2833 },

  // MP & India Cities & Towns
  vidisha: { lat: 23.5251, lng: 77.8081 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  berasiya: { lat: 23.6339, lng: 77.4339 },
  indore: { lat: 22.7196, lng: 75.8577 },
  sehore: { lat: 23.2031, lng: 77.0845 },
  dewas: { lat: 22.9676, lng: 76.0534 },
  ujjain: { lat: 23.1765, lng: 75.7885 },
  gwalior: { lat: 26.2183, lng: 78.1828 },
  jabalpur: { lat: 23.1815, lng: 79.9864 },
  raisen: { lat: 23.3315, lng: 77.7950 },
  hoshangabad: { lat: 22.7519, lng: 77.7289 },
  narmadapuram: { lat: 22.7519, lng: 77.7289 },
  sagar: { lat: 23.8388, lng: 78.7378 },
  rewa: { lat: 24.5362, lng: 81.3037 },
  satna: { lat: 24.6005, lng: 80.8322 },
  panjab: { lat: 30.9010, lng: 75.8573 },
  punjab: { lat: 30.9010, lng: 75.8573 },
  goa: { lat: 15.2993, lng: 74.1240 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  agra: { lat: 27.1767, lng: 78.0081 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  pune: { lat: 18.5204, lng: 73.8567 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
};

function getItemCoordinates(item: MapItem, index: number): { lat: number; lng: number } {
  const locLower = (item.location || item.title || "").toLowerCase();

  // 1. Check if location string specifies a known city/town
  const matched = Object.entries(GEOLOCATIONS).find(([city]) => locLower.includes(city));
  if (matched) {
    const offsetLat = (index % 5) * 0.008 * (index % 2 === 0 ? 1 : -1);
    const offsetLng = (index % 5) * 0.009 * (index % 3 === 0 ? 1 : -1);
    return {
      lat: matched[1].lat + offsetLat,
      lng: matched[1].lng + offsetLng,
    };
  }

  // 2. Check for Madhya Pradesh / MP region keywords
  if (locLower.includes("madhya pradesh") || locLower.includes("m.p") || locLower.includes("m. p") || locLower.includes("mp")) {
    const offsetLat = (index % 5) * 0.008 * (index % 2 === 0 ? 1 : -1);
    const offsetLng = (index % 5) * 0.009 * (index % 3 === 0 ? 1 : -1);
    return { lat: 23.2599 + offsetLat, lng: 77.4126 + offsetLng }; // MP central region
  }

  // 3. Use explicit coordinates if non-default (not equal to legacy Pokhara default ~28.5)
  if (
    item.latitude &&
    item.longitude &&
    !isNaN(item.latitude) &&
    !isNaN(item.longitude) &&
    !(Math.abs(item.latitude - 28.5) < 0.1 && Math.abs(item.longitude - 83.9) < 0.1)
  ) {
    return { lat: item.latitude, lng: item.longitude };
  }

  // 4. Default fallback with offset based on country hints
  const offsetLat = (index % 5) * 0.008 * (index % 2 === 0 ? 1 : -1);
  const offsetLng = (index % 5) * 0.009 * (index % 3 === 0 ? 1 : -1);

  if (locLower.includes("india") || locLower.includes("in")) {
    return { lat: 23.2599 + offsetLat, lng: 77.4126 + offsetLng };
  }

  // Default Pokhara fallback for Nepal
  return {
    lat: 28.2096 + offsetLat,
    lng: 83.9856 + offsetLng,
  };
}

export function MultiMarkerMap({
  items,
  selectedId,
  onItemSelect,
  title = "Live Locations Map View",
  height = "h-[500px]",
}: MultiMarkerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string | number, any>>({});

  useEffect(() => {
    // Dynamically load Leaflet CSS and JS if not already loaded
    if (typeof window === "undefined") return;

    const loadLeaflet = async () => {
      if (!(window as any).L) {
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        await new Promise<void>((resolve) => {
          if ((window as any).L) {
            resolve();
            return;
          }
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      // Initialize map instance if not existing
      if (!leafletInstanceRef.current) {
        const map = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: false,
        }).setView([28.2096, 83.9856], 10);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);

        leafletInstanceRef.current = map;
      }

      const map = leafletInstanceRef.current;

      // Clear old markers
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};

      if (items.length === 0) return;

      const bounds = L.latLngBounds([]);

      items.forEach((item, index) => {
        const coords = getItemCoordinates(item, index);
        const latLng = L.latLng(coords.lat, coords.lng);
        bounds.extend(latLng);

        const isSelected = selectedId && String(selectedId) === String(item.id);

        const customIcon = L.divIcon({
          className: "custom-leaflet-pin",
          html: `<div style="
            background: ${isSelected ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            border: 2px solid white;
            display: flex;
            align-items: center;
            gap: 4px;
            transform: scale(${isSelected ? 1.25 : 1});
            transition: transform 0.2s ease;
          ">
            <span>📍</span>
            <span>${item.title.length > 18 ? item.title.substring(0, 16) + '...' : item.title}</span>
          </div>`,
          iconSize: [120, 30],
          iconAnchor: [60, 15],
        });

        const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map);

        const googleNavUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          item.title + ' ' + item.location
        )}`;

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
            <strong style="color: #0f172a; font-size: 13px; display: block;">${item.title}</strong>
            <span style="color: #64748b; font-size: 11px; display: block; margin-top: 2px;">📍 ${item.location}</span>
            <a href="${googleNavUrl}" target="_blank" style="
              display: inline-block;
              margin-top: 8px;
              background: #10b981;
              color: white;
              font-size: 11px;
              font-weight: 700;
              padding: 4px 10px;
              border-radius: 8px;
              text-decoration: none;
            ">Navigate in Google Maps ↗</a>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on("click", () => {
          if (onItemSelect) onItemSelect(item);
        });

        markersRef.current[item.id] = marker;
      });

      // Fit map to show all items
      if (items.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }

      // If item selected, pan to it
      if (selectedId && markersRef.current[selectedId]) {
        const selectedMarker = markersRef.current[selectedId];
        selectedMarker.openPopup();
        map.panTo(selectedMarker.getLatLng(), { animate: true });
      }
    };

    void loadLeaflet();
  }, [items, selectedId, onItemSelect]);

  // Fallback Google Maps URL for header button
  const firstItemLoc = items[0]?.location || "Nepal";
  const mainGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    title + ' ' + firstItemLoc
  )}`;

  return (
    <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3 sticky top-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>{title}</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>Showing {items.length} Plotted Pins on Map</span>
          </p>
        </div>

        <a
          href={mainGoogleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-[10px] font-bold transition-all flex items-center gap-1 shrink-0"
        >
          <span>Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* MAP CONTAINER */}
      <div className={`${height} rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner relative`}>
        <div ref={mapRef} className="w-full h-full z-0" />
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
          <Navigation className="w-3 h-3" />
          <span>Click any pin or card to inspect location</span>
        </span>
        <span className="font-mono text-slate-400">
          {items.length} Pins Active
        </span>
      </div>
    </div>
  );
}
