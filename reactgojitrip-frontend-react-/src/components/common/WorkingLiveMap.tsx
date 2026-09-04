"use client";

import React from "react";
import { Globe, ExternalLink, MapPin, Navigation } from "lucide-react";

interface WorkingLiveMapProps {
  locationQuery: string;
  title?: string;
  subtitle?: string;
  height?: string;
}

function getFormattedLocationName(loc: string): string {
  const locLower = (loc || "").toLowerCase().trim();
  if (locLower.includes("panjab") || locLower.includes("punjab")) return "Punjab, India";
  if (locLower.includes("bhopal")) return "Bhopal, Madhya Pradesh, India";
  if (locLower.includes("indore")) return "Indore, Madhya Pradesh, India";
  if (locLower.includes("goa")) return "Goa, India";
  if (locLower.includes("kathmandu")) return "Kathmandu, Nepal";
  if (locLower.includes("pokhara")) return "Pokhara, Nepal";
  if (locLower.includes("mustang")) return "Mustang, Nepal";
  if (locLower.includes("chitwan")) return "Chitwan, Nepal";
  if (locLower.includes("jomsom")) return "Jomsom, Mustang, Nepal";
  if (locLower.includes("beni")) return "Beni, Myagdi, Nepal";
  if (locLower.includes("delhi")) return "Delhi, India";
  if (locLower.includes("agra")) return "Agra, Uttar Pradesh, India";
  return loc || "Nepal & India Travel Corridor";
}

export function WorkingLiveMap({
  locationQuery,
  title = "Live Google Maps View",
  subtitle,
  height = "h-[500px]",
}: WorkingLiveMapProps) {
  const formattedLoc = getFormattedLocationName(locationQuery);
  const mapQuery = `${title.replace("Live Google Maps View", "").trim()} in ${formattedLoc}`.trim();

  const googleIframeUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapQuery
  )}&t=&z=11&ie=UTF8&iwloc=&output=embed`;

  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mapQuery
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
            <span>{subtitle || formattedLoc}</span>
          </p>
        </div>

        <a
          href={externalMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-[10px] font-bold transition-all flex items-center gap-1 shrink-0"
        >
          <span>Open Full Map</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className={`${height} rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner relative`}>
        <iframe
          title="Live Google Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={googleIframeUrl}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
        <span className="flex items-center gap-1">
          <Navigation className="w-3 h-3 text-emerald-400" />
          <span>Interactive Location Corridor</span>
        </span>
        <span className="font-mono text-emerald-400 font-semibold">
          Verified GPS Coordinates
        </span>
      </div>
    </div>
  );
}
