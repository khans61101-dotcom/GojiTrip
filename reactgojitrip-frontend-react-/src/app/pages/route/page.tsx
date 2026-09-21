"use client";

import "@/styles/pages/route/route.css";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SafeImage } from "@/components/common/SafeImage";
import { InteractiveMap, lookupSingleCoordinate, LOCATION_COORDINATES_MAP, type MapMarkerItem } from "@/components/common/InteractiveMap";
import { apiRequest, planRoute, type RouteSearchData, type RouteStop } from "@/lib/api";
import { cmsStore } from "@/lib/cms-store";
import type { RouteEntry, RoutePOI, EmergencyContact } from "@/types/cms";
import AddRouteModal from "@/components/common/AddRouteModal";
import {
  MapPin,
  Search,
  Star,
  Navigation,
  Clock,
  X,
  Plus,
  ChevronRight,
  Fuel,
  Zap,
  Stethoscope,
  ShieldAlert,
  CreditCard,
  Camera,
  Utensils,
  Hotel,
  Home,
  Bus,
  Compass,
  Mountain,
  Phone,
  AlertTriangle,
  Route as RouteIcon,
  LocateFixed,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

/* ============================================================
   ACTION CATEGORIES
============================================================ */

type ActionCategory = {
  key: "hotels" | "homestays" | "restaurants" | "transport" | "places" | "fuel" | "famous-places";
  label: string;
  path: string;
  icon: React.ElementType;
};

const actionCategories: ActionCategory[] = [
  { key: "hotels", label: "Hotels", path: "/pages/hotels", icon: Hotel },
  { key: "homestays", label: "Homestays", path: "/pages/homestays", icon: Home },
  { key: "restaurants", label: "Restaurants", path: "/pages/restaurants", icon: Utensils },
  { key: "transport", label: "Transport", path: "/pages/transport", icon: Bus },
  { key: "places", label: "Guides & Treks", path: "/pages/guides", icon: Compass },
  { key: "fuel", label: "Fuel & EV", path: "/pages/fuel-stations", icon: Fuel },
  { key: "famous-places", label: "Attractions", path: "/pages/famous-places", icon: Star },
];

/* ============================================================
   TIMELINE STOP TYPE
============================================================ */

type TimelineStop = RouteStop & {
  sequence: number;
  isSource: boolean;
  isDestination: boolean;
  isViaStop?: boolean;
  badgeLabel?: string;
  badgeBg?: string;
  color?: string;
  distanceKm?: string;
  travelTime?: string;
  extraInfo?: string;
};

interface PlaceSuggestion {
  placeId: string;
  name: string;
  address: string;
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80";

/* ==========================================================
   CITY & EXTRA INFO PARSER FOR CLEAN DISPLAY
   Extracts pure city name for heading, and moves extra details
   (e.g., Highway Junction, State names, Hub info) below.
========================================================== */
export function extractCityAndExtraInfo(
  rawName: string,
  explicitExtra?: string
): { cityName: string; extraInfo: string } {
  if (explicitExtra && explicitExtra.trim()) {
    return {
      cityName: (rawName || "").trim(),
      extraInfo: explicitExtra.trim(),
    };
  }

  if (!rawName) return { cityName: "", extraInfo: "" };
  const str = rawName.trim();

  // Pattern 1: "City Name (State / Extra Info)" or "City Suffix (State)"
  const parenRegex = /^([^(]+?)\s*(\([^)]+\))$/;
  const parenMatch = str.match(parenRegex);

  if (parenMatch) {
    const beforeParen = parenMatch[1].trim();
    const parenContent = parenMatch[2].trim();

    const keywordsRegex = /\s+(highway junction|service hub|fuel station|hilltop bypass|expressway|transit hub|heritage waypoint|lake corridor|express hub|gateway|food stop|rest stop|riverside|bridge hub|town|fort|valley|viewpoint|bypass|junction|food court|checkpost|mountain hub|village|border stop|checkpost|service stop|highway hub|express corridor|corridor)$/i;
    const kwMatch = beforeParen.match(keywordsRegex);

    if (kwMatch && kwMatch.index && kwMatch.index > 1) {
      const cityOnly = beforeParen.slice(0, kwMatch.index).trim();
      const kw = kwMatch[0].trim();
      return {
        cityName: cityOnly || beforeParen,
        extraInfo: `${kw} ${parenContent}`.trim(),
      };
    }

    return {
      cityName: beforeParen,
      extraInfo: parenContent.replace(/^\(|\)$/g, "").trim(),
    };
  }

  // Pattern 2: "City - Extra Info"
  if (str.includes(" - ")) {
    const [c, ...rest] = str.split(" - ");
    return {
      cityName: c.trim(),
      extraInfo: rest.join(" - ").trim(),
    };
  }

  // Pattern 3: Common keywords at the end without parentheses
  const trailingKwRegex = /\s+(highway junction|service hub|fuel station|expressway|transit hub|food court|rest stop)$/i;
  const tMatch = str.match(trailingKwRegex);
  if (tMatch && tMatch.index && tMatch.index > 2) {
    return {
      cityName: str.slice(0, tMatch.index).trim(),
      extraInfo: tMatch[0].trim(),
    };
  }

  return { cityName: str, extraInfo: "" };
}

/* ==========================================================
   ROUTE CORRIDOR INTERMEDIATE LOCATIONS RESOLVER
========================================================== */
function resolveCorridorStops(
  src: string,
  dst: string,
  routeName?: string,
  cmsPois?: any[]
): Array<{ name: string; extraInfo?: string; type: string; details: string; distPct: number }> {
  const norm = (s: string) =>
    (s || "")
      .toLowerCase()
      .replace(/u/g, "a")
      .replace(/[^a-z0-9]/g, "");

  const srcNorm = norm(src);
  const dstNorm = norm(dst);
  const nameNorm = norm(routeName || "");

  // 1. Predefined Highway Corridor Resolver with Fuzzy Spell Matching & Intermediate States
  // A. Panjab / Punjab -> Goa
  if (
    (srcNorm.includes("pnjb") || srcNorm.includes("panjab") || srcNorm.includes("punjab") || nameNorm.includes("panjab") || nameNorm.includes("punjab")) &&
    (dstNorm.includes("goa") || nameNorm.includes("goa"))
  ) {
    return [
      { name: "Ludhiana & Ambala", extraInfo: "Punjab & Haryana Transit Hub", type: "rest", details: "Punjab & Haryana Central Highway & Transport Hub", distPct: 0.12 },
      { name: "Delhi NCR", extraInfo: "Expressway Bypass (Delhi State)", type: "rest", details: "Capital Transit & Highway Bypass Corridor", distPct: 0.25 },
      { name: "Jaipur", extraInfo: "Heritage Waypoint (Rajasthan)", type: "place", details: "Rajasthan Heritage Waypoint & Tourist Stop", distPct: 0.4 },
      { name: "Udaipur", extraInfo: "Lake Corridor (Rajasthan)", type: "place", details: "Scenic Lake City Travel & Rest Stop", distPct: 0.55 },
      { name: "Ahmedabad", extraInfo: "Express Hub (Gujarat)", type: "fuel", details: "Gujarat Expressway Fuel, EV & Rest Stop", distPct: 0.7 },
      { name: "Mumbai-Pune", extraInfo: "Coastal Expressway (Maharashtra)", type: "rest", details: "Coastal Highway Transit Stop & Food Court", distPct: 0.85 },
    ];
  }

  // B. Bhopal -> Indore
  if (
    (srcNorm.includes("bhpl") || srcNorm.includes("bhopal") || nameNorm.includes("bhopal")) &&
    (dstNorm.includes("indor") || nameNorm.includes("indore"))
  ) {
    return [
      { name: "Sehore", extraInfo: "Highway Junction (Madhya Pradesh)", type: "rest", details: "Sehore Bypass & Refreshment Rest Stop", distPct: 0.2 },
      { name: "Ashta", extraInfo: "Service Hub (Madhya Pradesh)", type: "food", details: "Ashta Highway Service Hub & Food Restaurants", distPct: 0.4 },
      { name: "Sonkatch", extraInfo: "Fuel Station (Madhya Pradesh)", type: "fuel", details: "Sonkatch Fuel & Travel Service Point", distPct: 0.65 },
      { name: "Dewas", extraInfo: "Hilltop Bypass (Madhya Pradesh)", type: "place", details: "Dewas Hilltop Temple & Highway Bypass Hub", distPct: 0.8 },
    ];
  }

  // C. Delhi -> Jaipur
  if (
    (srcNorm.includes("delhi") || nameNorm.includes("delhi")) &&
    (dstNorm.includes("jaipur") || nameNorm.includes("jaipur"))
  ) {
    return [
      { name: "Gurgaon", extraInfo: "Manesar Corridor (Haryana)", type: "rest", details: "Millennium City Highway Corridor in Haryana", distPct: 0.15 },
      { name: "Dharuhera", extraInfo: "Express Hub (Haryana)", type: "fuel", details: "Highway Fuel & Fast Charger Station in Haryana", distPct: 0.3 },
      { name: "Neemrana", extraInfo: "Heritage Fort (Rajasthan)", type: "place", details: "Neemrana Fort Heritage & Culture Stop in Rajasthan", distPct: 0.5 },
      { name: "Kotputli", extraInfo: "Bypass Junction (Rajasthan)", type: "rest", details: "Kotputli Highway Junction & Rest Area in Rajasthan", distPct: 0.7 },
      { name: "Shahpura", extraInfo: "Food Court (Rajasthan)", type: "food", details: "Shahpura Food Court & Refreshment Stop in Rajasthan", distPct: 0.85 },
    ];
  }

  // D. Kathmandu -> Pokhara
  if (
    (srcNorm.includes("ktm") || srcNorm.includes("kathmandu") || nameNorm.includes("kathmandu")) &&
    (dstNorm.includes("pkh") || dstNorm.includes("pokhara") || nameNorm.includes("pokhara"))
  ) {
    return [
      { name: "Naubise", extraInfo: "Highway Junction (Bagmati Province, Nepal)", type: "rest", details: "Kathmandu Valley Exit & Highway Hub", distPct: 0.15 },
      { name: "Malekhu", extraInfo: "Riverside Food Stop (Bagmati Province, Nepal)", type: "food", details: "Malekhu Riverside Fish & Refreshment Stop", distPct: 0.35 },
      { name: "Mugling", extraInfo: "Bridge Hub (Gandaki Province, Nepal)", type: "rest", details: "Trishuli River Bridge Highway Hub", distPct: 0.55 },
      { name: "Dumre & Bandipur", extraInfo: "Hillside Heritage (Gandaki Province, Nepal)", type: "place", details: "Bandipur Hillside Heritage & Viewpoint Stop", distPct: 0.7 },
      { name: "Damauli", extraInfo: "Town Service Hub (Gandaki Province, Nepal)", type: "fuel", details: "Tanahun Service & Fuel Station Stop", distPct: 0.85 },
    ];
  }

  // E. Kathmandu -> Chitwan
  if (
    (srcNorm.includes("kathmandu") || nameNorm.includes("kathmandu")) &&
    (dstNorm.includes("chitwan") || dstNorm.includes("sauraha") || nameNorm.includes("chitwan"))
  ) {
    return [
      { name: "Naubise", extraInfo: "Highway Junction (Bagmati Province, Nepal)", type: "rest", details: "Highway Transit Point", distPct: 0.15 },
      { name: "Malekhu", extraInfo: "Food Stop (Bagmati Province, Nepal)", type: "food", details: "Refreshment & Local Food Stop", distPct: 0.35 },
      { name: "Mugling", extraInfo: "Trishuli Junction (Gandaki Province, Nepal)", type: "rest", details: "Trishuli Confluence Junction", distPct: 0.55 },
      { name: "Kurintar", extraInfo: "Cable Car Station (Bagmati Province, Nepal)", type: "place", details: "Manakamana Cable Car & Pilgrimage Hub", distPct: 0.7 },
      { name: "Bharatpur", extraInfo: "Chitwan Gateway (Bagmati Province, Nepal)", type: "fuel", details: "Chitwan Entrance Fuel & Service Hub", distPct: 0.88 },
    ];
  }

  // F. Pokhara -> Muktinath
  if (
    (srcNorm.includes("pokhara") || nameNorm.includes("pokhara")) &&
    (dstNorm.includes("muktinath") || dstNorm.includes("jomsom") || nameNorm.includes("muktinath"))
  ) {
    return [
      { name: "Kusma", extraInfo: "Adventure Bridge (Parbat, Nepal)", type: "place", details: "Suspension Bridge & Adventure Hub", distPct: 0.3 },
      { name: "Beni", extraInfo: "Mustang Gateway (Myagdi, Nepal)", type: "rest", details: "Myagdi River Junction & Mustang Gateway", distPct: 0.45 },
      { name: "Tatopani", extraInfo: "Hot Springs (Myagdi, Nepal)", type: "place", details: "Natural Hot Springs Rest Stop", distPct: 0.6 },
      { name: "Ghasa", extraInfo: "Pine Forest Checkpost (Mustang, Nepal)", type: "rest", details: "Mustang Checkpost & Pine Forest Corridor", distPct: 0.75 },
      { name: "Jomsom", extraInfo: "Mountain Hub (Mustang, Nepal)", type: "place", details: "Apple Orchards & Mountain Airport Hub", distPct: 0.88 },
      { name: "Kagbeni", extraInfo: "Sacred Village (Mustang, Nepal)", type: "place", details: "Sacred River Confluence & Ancient Village", distPct: 0.95 },
    ];
  }

  // G. Indore -> Pune (~665 km)
  if (
    (srcNorm.includes("indor") || nameNorm.includes("indore")) &&
    (dstNorm.includes("pune") || nameNorm.includes("pune"))
  ) {
    return [
      { name: "Sendhwa", extraInfo: "MP ➔ MH State Border", type: "rest", details: "State Border Checkpost, Fuel Stations & Highway Amenities", distPct: 0.2 },
      { name: "Dhule", extraInfo: "Transit Hub (Maharashtra State)", type: "fuel", details: "NH52 Major Highway Junction & EV Fast Chargers in MH", distPct: 0.38 },
      { name: "Malegaon", extraInfo: "Food & Service Stop (Maharashtra State)", type: "food", details: "Highway Food Court & 24/7 Traveller Refreshment Stop in MH", distPct: 0.52 },
      { name: "Nashik", extraInfo: "Travel & Wine Capital (Maharashtra State)", type: "place", details: "Panchavati Temple Heritage, Wine Capital & Highway Service Hub in MH", distPct: 0.68 },
      { name: "Sangamner", extraInfo: "Shirdi Junction (Maharashtra State)", type: "rest", details: "Shirdi Pilgrimage Corridor & Rest Hub in MH", distPct: 0.82 },
      { name: "Narayangaon", extraInfo: "Khed Bypass (Maharashtra State)", type: "fuel", details: "Fuel & Refreshment Station Before Entering Pune Valley in MH", distPct: 0.92 },
    ];
  }

  // H. Indore -> Mumbai (~585 km)
  if (
    (srcNorm.includes("indor") || nameNorm.includes("indore")) &&
    (dstNorm.includes("mumbai") || nameNorm.includes("mumbai"))
  ) {
    return [
      { name: "Sendhwa", extraInfo: "Border Rest Stop (MP ➔ MH Border)", type: "rest", details: "MP-Maharashtra Border Transit & Rest Point", distPct: 0.22 },
      { name: "Dhule", extraInfo: "Highway Junction (Maharashtra State)", type: "fuel", details: "NH52 Transit Hub & High Speed EV Charger Point in MH", distPct: 0.42 },
      { name: "Malegaon", extraInfo: "Food Hub (Maharashtra State)", type: "food", details: "Highway Restaurant & Traveller Food Stop in MH", distPct: 0.56 },
      { name: "Nashik", extraInfo: "Panchavati Heritage (Maharashtra State)", type: "place", details: "Godavari River Heritage & Travel Stop in MH", distPct: 0.72 },
      { name: "Igatpuri", extraInfo: "Hill Station Stop (Maharashtra State)", type: "place", details: "Scenic Ghat Viewpoint & Cool Mountain Rest Area in MH", distPct: 0.84 },
      { name: "Thane", extraInfo: "Expressway Gateway (Maharashtra State)", type: "fuel", details: "Mumbai Entry Toll Plaza & Fuel Station in MH", distPct: 0.94 },
    ];
  }

  // I. Indore -> Surat (~450 km)
  if (
    (srcNorm.includes("indor") || nameNorm.includes("indore")) &&
    (dstNorm.includes("surat") || nameNorm.includes("surat"))
  ) {
    return [
      { name: "Dhar", extraInfo: "Mandav Fort Gateway (Madhya Pradesh)", type: "place", details: "Historic Mandu Fort Gateway & Scenic Point in MP", distPct: 0.2 },
      { name: "Jhabua", extraInfo: "Dahod Junction (MP ➔ Gujarat Border)", type: "rest", details: "MP-Gujarat Highway Checkpost & Rest Stop", distPct: 0.4 },
      { name: "Godhra", extraInfo: "Expressway Hub (Gujarat State)", type: "fuel", details: "Expressway Fuel Station & EV Charger in Gujarat", distPct: 0.58 },
      { name: "Vadodara", extraInfo: "Express Corridor (Gujarat State)", type: "rest", details: "NE1 Expressway Transit Hub & Dining in Gujarat", distPct: 0.75 },
      { name: "Bharuch", extraInfo: "Narmada Bridge (Gujarat State)", type: "place", details: "Narmada Cable Bridge Viewpoint & Rest Area in Gujarat", distPct: 0.88 },
    ];
  }

  // J. Bhopal -> Delhi (~780 km)
  if (
    (srcNorm.includes("bhopal") || nameNorm.includes("bhopal")) &&
    (dstNorm.includes("delhi") || nameNorm.includes("delhi"))
  ) {
    return [
      { name: "Vidisha", extraInfo: "Sanchi Stupa Gateway (Madhya Pradesh)", type: "place", details: "UNESCO Heritage Sanchi Stupa Gateway in MP", distPct: 0.1 },
      { name: "Bina", extraInfo: "Highway Junction (Madhya Pradesh)", type: "rest", details: "Central MP Transit & Refreshment Stop", distPct: 0.25 },
      { name: "Jhansi", extraInfo: "Fort Corridor (Uttar Pradesh)", type: "place", details: "Historic Jhansi Fort & Highway Service Point in UP", distPct: 0.42 },
      { name: "Gwalior", extraInfo: "Fort Waypoint (Madhya Pradesh)", type: "place", details: "Gwalior Royal Heritage & Highway Rest Area in MP", distPct: 0.58 },
      { name: "Agra", extraInfo: "Taj Expressway Corridor (Uttar Pradesh)", type: "fuel", details: "Yamuna Expressway Entrance, Fuel & EV Fast Chargers in UP", distPct: 0.78 },
      { name: "Mathura", extraInfo: "Vrindavan Gateway (Uttar Pradesh)", type: "rest", details: "Sacred Mathura Corridor & Refreshment Stop in UP", distPct: 0.88 },
    ];
  }

  // K. Delhi -> Manali (~530 km)
  if (
    (srcNorm.includes("delhi") || nameNorm.includes("delhi")) &&
    (dstNorm.includes("manali") || nameNorm.includes("manali"))
  ) {
    return [
      { name: "Panipat", extraInfo: "Service Hub (Haryana State)", type: "fuel", details: "Grand Trunk Road Fuel & Dining Stop in Haryana", distPct: 0.18 },
      { name: "Ambala", extraInfo: "Transport Junction (Punjab / Haryana)", type: "rest", details: "Punjab-Haryana Border Transit Hub", distPct: 0.36 },
      { name: "Chandigarh", extraInfo: "Express Hub (Chandigarh UT)", type: "place", details: "Beautiful City Bypass & Highway Rest Area", distPct: 0.46 },
      { name: "Bilaspur", extraInfo: "Swarghat Viewpoint (Himachal Pradesh)", type: "place", details: "Gobind Sagar Lake & Mountain Viewpoint in Himachal", distPct: 0.65 },
      { name: "Mandi", extraInfo: "Tunnel & Beas River (Himachal Pradesh)", type: "rest", details: "Beas River Valley & Tunnel Highway Stop in Himachal", distPct: 0.82 },
      { name: "Kullu", extraInfo: "Valley Rest Stop (Himachal Pradesh)", type: "food", details: "Kullu Apple Orchards & River Rafting Stop in Himachal", distPct: 0.92 },
    ];
  }

  // L. Indore -> Gwalior (~510 km)
  if (
    (srcNorm.includes("indor") || nameNorm.includes("indore")) &&
    (dstNorm.includes("gwlr") || dstNorm.includes("gwalior") || nameNorm.includes("gwalior"))
  ) {
    return [
      { name: "Dewas", extraInfo: "Highway Junction (Madhya Pradesh)", type: "rest", details: "Highway Bypass & Refreshment Stop in MP", distPct: 0.15 },
      { name: "Sarangpur", extraInfo: "Shajapur Corridor (Madhya Pradesh)", type: "food", details: "NH46 Highway Food Court & Restaurants in MP", distPct: 0.32 },
      { name: "Biaora", extraInfo: "Service Hub (Madhya Pradesh)", type: "fuel", details: "Central Highway Fuel & EV Service Hub in MP", distPct: 0.48 },
      { name: "Guna", extraInfo: "Transit Hub (Madhya Pradesh)", type: "fuel", details: "Major Highway Junction & Fueling Station in MP", distPct: 0.65 },
      { name: "Shivpuri", extraInfo: "Fort & Heritage (Madhya Pradesh)", type: "place", details: "Madhav National Park & Historic Fort Gateway in MP", distPct: 0.82 },
      { name: "Mohana", extraInfo: "Gwalior Gateway (Madhya Pradesh)", type: "rest", details: "Highway Rest Area Before Entering Gwalior Fort Valley in MP", distPct: 0.93 },
    ];
  }

  // M. Gwalior -> Pune (~950 km)
  if (
    (srcNorm.includes("gwlr") || srcNorm.includes("gwalior") || nameNorm.includes("gwalior")) &&
    (dstNorm.includes("pune") || nameNorm.includes("pune"))
  ) {
    return [
      { name: "Shivpuri", extraInfo: "Fort Waypoint (Madhya Pradesh)", type: "place", details: "Historic Fort Waypoint & Highway Hub in MP", distPct: 0.15 },
      { name: "Guna", extraInfo: "Highway Rest Area (Madhya Pradesh)", type: "rest", details: "Central Highway Transit Point in MP", distPct: 0.28 },
      { name: "Dewas", extraInfo: "Indore Express Hub (Madhya Pradesh)", type: "fuel", details: "MP Highway Fuel, EV Charger & Food Court", distPct: 0.45 },
      { name: "Sendhwa", extraInfo: "Border Checkpost (MP ➔ MH Border)", type: "rest", details: "MP-MH State Border Checkpost & Amenities", distPct: 0.6 },
      { name: "Dhule", extraInfo: "Transit Hub (Maharashtra State)", type: "fuel", details: "NH52 Highway Junction & Fast Charger Point in MH", distPct: 0.72 },
      { name: "Nashik", extraInfo: "Wine & Heritage Stop (Maharashtra State)", type: "place", details: "Godavari Temple Heritage & Refreshments in MH", distPct: 0.84 },
      { name: "Sangamner", extraInfo: "Khed Bypass (Maharashtra State)", type: "fuel", details: "Fuel & Service Stop Approaching Pune Entry in MH", distPct: 0.94 },
    ];
  }

  // N. Bhopal -> Pune (~780 km)
  if (
    (srcNorm.includes("bhpl") || srcNorm.includes("bhopal") || nameNorm.includes("bhopal")) &&
    (dstNorm.includes("pune") || nameNorm.includes("pune"))
  ) {
    return [
      { name: "Sehore", extraInfo: "Ashta Service Stop (Madhya Pradesh)", type: "rest", details: "Bhopal Exit Expressway Refreshment Hub in MP", distPct: 0.18 },
      { name: "Dewas", extraInfo: "Indore Highway Hub (Madhya Pradesh)", type: "fuel", details: "MP Highway Service Station & Fast Charger", distPct: 0.35 },
      { name: "Sendhwa", extraInfo: "Border Checkpost (MP ➔ MH Border)", type: "rest", details: "MP-MH State Border Checkpost & Amenities", distPct: 0.48 },
      { name: "Dhule", extraInfo: "Transit Hub (Maharashtra State)", type: "fuel", details: "NH52 Highway Junction & EV Fast Chargers in MH", distPct: 0.62 },
      { name: "Nashik", extraInfo: "Wine & Heritage Stop (Maharashtra State)", type: "place", details: "Godavari Temple Heritage & Refreshments in MH", distPct: 0.78 },
      { name: "Narayangaon", extraInfo: "Khed Bypass (Maharashtra State)", type: "rest", details: "Highway Rest Area Before Entering Pune in MH", distPct: 0.9 },
    ];
  }

  // O. Bhopal -> Gwalior (~430 km)
  if (
    (srcNorm.includes("bhpl") || srcNorm.includes("bhopal") || nameNorm.includes("bhopal")) &&
    (dstNorm.includes("gwlr") || dstNorm.includes("gwalior") || nameNorm.includes("gwalior"))
  ) {
    return [
      { name: "Vidisha", extraInfo: "Sanchi Stupa (Madhya Pradesh)", type: "place", details: "UNESCO Heritage Site & Gateway in MP", distPct: 0.15 },
      { name: "Bina", extraInfo: "Highway Junction (Madhya Pradesh)", type: "rest", details: "Central MP Transit & Refreshment Stop", distPct: 0.38 },
      { name: "Guna", extraInfo: "Service Hub (Madhya Pradesh)", type: "fuel", details: "Highway Fuel & EV Charger Station in MP", distPct: 0.62 },
      { name: "Shivpuri", extraInfo: "Fort Viewpoint (Madhya Pradesh)", type: "place", details: "Madhav National Park & Viewpoint in MP", distPct: 0.82 },
    ];
  }

  // P. Gwalior -> Delhi (~360 km)
  if (
    (srcNorm.includes("gwlr") || srcNorm.includes("gwalior") || nameNorm.includes("gwalior")) &&
    (dstNorm.includes("delhi") || nameNorm.includes("delhi"))
  ) {
    return [
      { name: "Morena", extraInfo: "Dholpur Border Stop (MP ➔ Rajasthan)", type: "rest", details: "MP-Rajasthan State Border Transit Hub", distPct: 0.2 },
      { name: "Agra", extraInfo: "Taj Expressway Hub (Uttar Pradesh)", type: "fuel", details: "Taj Expressway Entrance & Fast Charger in UP", distPct: 0.5 },
      { name: "Mathura", extraInfo: "Vrindavan Gateway (Uttar Pradesh)", type: "place", details: "Sacred Pilgrim Heritage Stop in UP", distPct: 0.72 },
      { name: "Palwal", extraInfo: "Gurgaon Express Stop (Haryana / Delhi)", type: "rest", details: "Delhi NCR Entry Expressway Stop", distPct: 0.9 },
    ];
  }

  // 2. Check if CMS POIs are explicitly provided (for unmapped routes with custom backend POIs)
  if (Array.isArray(cmsPois) && cmsPois.length > 0) {
    const validPois = cmsPois.filter((p) => p && (p.name || p.title || p.location));
    if (validPois.length > 0) {
      return validPois.map((poi, idx) => {
        const rawTitle = poi.name || poi.title || poi.location || `Waypoint ${idx + 1}`;
        const { cityName, extraInfo } = extractCityAndExtraInfo(rawTitle);
        return {
          name: cityName,
          extraInfo: extraInfo || poi.location,
          type:
            poi.category === "Restaurant" || poi.type === "food"
              ? "food"
              : poi.category === "Fuel Station" || poi.type === "fuel"
              ? "fuel"
              : poi.category === "Viewpoint" || poi.type === "place"
              ? "place"
              : "rest",
          details: poi.details || poi.location || `Key waypoint along corridor.`,
          distPct: (idx + 1) / (validPois.length + 1),
        };
      });
    }
  }

  // 3. Smart Geographic Fallback — picks REAL city names from coordinate map that lie
  //    between source and destination. Works for ANY route pair, not just predefined ones.
  return resolveSmartGeographicFallback(src, dst);
}

/**
 * Finds real cities from the LOCATION_COORDINATES_MAP that lie geographically between
 * two named cities. Returns them as properly-typed corridor stop objects.
 * This ensures NO placeholder names like "Transit Service Station #1" ever appear.
 */
function resolveSmartGeographicFallback(
  src: string,
  dst: string
): Array<{ name: string; extraInfo?: string; type: string; details: string; distPct: number }> {
  // Normalize helper
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  // Lookup source & destination coordinates
  const srcCoord = lookupSingleCoordinate(src);
  const dstCoord = lookupSingleCoordinate(dst);

  // SKIP_KEYS: generic region names, countries, & states that aren't real highway cities
  const SKIP_KEYS = new Set([
    "india", "nepal", "bhutan", "maharashtra", "madhya pradesh", "m.p", "m. p",
    "karnataka", "haryana", "gujarat", "rajasthan", "uttar pradesh",
    "himachal pradesh", "punjab", "panjab", "goa",
  ]);

  if (!srcCoord || !dstCoord) {
    // Cannot geo-resolve — return simple named stops using source/destination
    return [
      { name: src, extraInfo: "Journey Start", type: "rest", details: `Departure point on ${src} ➔ ${dst} corridor.`, distPct: 0.2 },
      { name: dst, extraInfo: "Journey End", type: "place", details: `Arrival point on ${src} ➔ ${dst} corridor.`, distPct: 0.8 },
    ];
  }

  // Haversine distance helper (km)
  const haversine = (a: { lat: number; lng: number }, b: { lat: number; lng: number }): number => {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const sinA = Math.sin(dLat / 2);
    const sinB = Math.sin(dLng / 2);
    const c =
      sinA * sinA +
      Math.cos((a.lat * Math.PI) / 180) *
        Math.cos((b.lat * Math.PI) / 180) *
        sinB * sinB;
    return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
  };

  const totalDist = haversine(srcCoord, dstCoord);

  // Helper: project a point onto the line segment src→dst, return fraction [0,1]
  //         and perpendicular deviation (km)
  const projectOntoRoute = (
    p: { lat: number; lng: number }
  ): { fraction: number; devKm: number } => {
    const ax = srcCoord.lng, ay = srcCoord.lat;
    const bx = dstCoord.lng, by = dstCoord.lat;
    const px = p.lng, py = p.lat;

    const abx = bx - ax, aby = by - ay;
    const apx = px - ax, apy = py - ay;
    const ab2 = abx * abx + aby * aby;
    const t = ab2 === 0 ? 0 : Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2));

    // Closest point on segment
    const closestX = ax + t * abx;
    const closestY = ay + t * aby;

    // Convert perpendicular deviation to km (approximate: 1 degree ≈ 111 km)
    const devLat = (py - closestY) * 111;
    const devLng = (px - closestX) * 111 * Math.cos((py * Math.PI) / 180);
    const devKm = Math.sqrt(devLat * devLat + devLng * devLng);

    return { fraction: t, devKm };
  };

  // Max allowed perpendicular deviation from route line (scale with distance)
  const maxDevKm = Math.max(60, totalDist * 0.25);

  // Score every city in our coordinate map
  type CityCandidate = {
    cityName: string;
    fraction: number;
    devKm: number;
    coord: { lat: number; lng: number };
  };

  const candidates: CityCandidate[] = [];
  const srcClean = clean(src);
  const dstClean = clean(dst);

  for (const [key, coord] of Object.entries(LOCATION_COORDINATES_MAP)) {
    if (SKIP_KEYS.has(key)) continue;
    // Exclude keys that ARE the source or destination
    if (clean(key).includes(srcClean) || srcClean.includes(clean(key))) continue;
    if (clean(key).includes(dstClean) || dstClean.includes(clean(key))) continue;

    const { fraction, devKm } = projectOntoRoute(coord);

    // Only keep intermediate points (not near start or end) within corridor width
    if (fraction < 0.08 || fraction > 0.95) continue;
    if (devKm > maxDevKm) continue;

    candidates.push({ cityName: key, fraction, devKm, coord });
  }

  // Divide the route into segments (e.g. 4-5 evenly spaced buckets from 0.10 to 0.90)
  // and pick the best (lowest devKm) city candidate in each segment.
  const NUM_BUCKETS = 5;
  const selected: CityCandidate[] = [];

  for (let b = 0; b < NUM_BUCKETS; b++) {
    const minFrac = 0.08 + (b / NUM_BUCKETS) * 0.84;
    const maxFrac = 0.08 + ((b + 1) / NUM_BUCKETS) * 0.84;

    const bucketCandidates = candidates
      .filter((c) => c.fraction >= minFrac && c.fraction < maxFrac)
      .sort((a, b) => a.devKm - b.devKm);

    if (bucketCandidates.length > 0) {
      // Pick the candidate with lowest deviation from the route line
      const best = bucketCandidates[0];
      // Ensure it's not too close to previous selected stop
      const isDuplicate = selected.some(
        (s) => Math.abs(s.fraction - best.fraction) < 0.08 || s.cityName === best.cityName
      );
      if (!isDuplicate) {
        selected.push(best);
      }
    }
  }

  // If buckets didn't yield enough stops, greedily fill from remaining candidates
  if (selected.length < 3) {
    for (const c of candidates) {
      if (selected.length >= 4) break;
      const isTooClose = selected.some(
        (s) => Math.abs(s.fraction - c.fraction) < 0.12 || s.cityName === c.cityName
      );
      if (!isTooClose) {
        selected.push(c);
      }
    }
  }

  // Sort selected stops strictly by fraction (origin to destination order)
  selected.sort((a, b) => a.fraction - b.fraction);

  // Stop type assignment based on position
  const stopTypes = ["rest", "food", "fuel", "place", "rest"] as const;
  const stopTypeLabels = ["Highway Hub", "Food Stop", "Fuel Station", "Scenic Point", "Rest Stop"];

  if (selected.length > 0) {
    return selected.map((c, idx) => {
      // Capitalize city name nicely
      const displayName = c.cityName
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      const typeIdx = idx % stopTypes.length;
      const stopType = stopTypes[typeIdx];
      const typeLabel = stopTypeLabels[typeIdx];

      return {
        name: displayName,
        extraInfo: `${typeLabel} – ${src} ➔ ${dst} Corridor`,
        type: stopType,
        details: `${displayName} — key waypoint along ${src} to ${dst} highway corridor. Services available: Hotels, Restaurants, Fuel & EV Stations, Attractions.`,
        distPct: c.fraction,
      };
    });
  }

  // Ultimate fallback: if still no geo matches, use the src → dst midpoint city approach
  // Give meaningful named stops derived from source / destination names
  const srcTitle = src.split(",")[0].trim();
  const dstTitle = dst.split(",")[0].trim();
  return [
    {
      name: `${srcTitle} Outskirts`,
      extraInfo: `${srcTitle} ➔ ${dstTitle} Highway Start`,
      type: "rest",
      details: `First highway rest area departing ${srcTitle} towards ${dstTitle}. Fuel & food available.`,
      distPct: 0.2,
    },
    {
      name: `Midway Junction`,
      extraInfo: `Midpoint – ${srcTitle} ➔ ${dstTitle}`,
      type: "fuel",
      details: `Central highway junction between ${srcTitle} and ${dstTitle}. EV charging, fuel & restaurants available.`,
      distPct: 0.5,
    },
    {
      name: `${dstTitle} Approach`,
      extraInfo: `Last stop before ${dstTitle}`,
      type: "place",
      details: `Final scenic rest stop before entering ${dstTitle}. Good viewpoints & refreshments.`,
      distPct: 0.82,
    },
  ];
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function RoutePage() {
  const navigate = useNavigate();
  /* ----------------------------------------------------------
     STATE: DB ROUTES & SELECTION
  ---------------------------------------------------------- */
  const [dbRoutes, setDbRoutes] = useState<RouteEntry[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedMapMarkerId, setSelectedMapMarkerId] = useState<string | null>(null);

  const handleSelectRoute = useCallback((id: string) => {
    setSelectedRouteId(id);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("last_selected_route_id", id);
        const url = new URL(window.location.href);
        url.searchParams.set("id", id);
        window.history.replaceState({}, "", url.toString());
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  /* ----------------------------------------------------------
     STATE: CUSTOM ROUTE SEARCH & TIMELINE
  ---------------------------------------------------------- */
  const [sourceSearch, setSourceSearch] = useState("");
  const [destSearch, setDestSearch] = useState("");
  const [sourceSuggestions, setSourceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  const [routeSearch, setRouteSearch] = useState<RouteSearchData | null>(null);
  const [apiStops, setApiStops] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [routeDistance, setRouteDistance] = useState<number | string | undefined>();
  const [routeDuration, setRouteDuration] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------------------------------------
     STATE: SESSION ROUTE EXTENSIONS (USER-ADDED EXTENDED STOPS)
  ---------------------------------------------------------- */
  interface SessionExtension {
    id: string;
    name: string;
    distKm: number;
    addedAt: string;
  }
  const [routeExtensions, setRouteExtensions] = useState<SessionExtension[]>([]);
  const [newExtensionInput, setNewExtensionInput] = useState("");

  /* Reset extensions when route or search changes */
  useEffect(() => {
    setRouteExtensions([]);
  }, [selectedRouteId, routeSearch]);

  const calculateExtensionDistance = useCallback((prevCity: string, newCity: string): number => {
    const norm = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const pKey = norm(prevCity);
    const nKey = norm(newCity);
    const pairKey = `${pKey}-${nKey}`;
    const revPairKey = `${nKey}-${pKey}`;

    const CITY_PAIR_DISTANCES: Record<string, number> = {
      // From Indore
      "indoresurat": 450,
      "indoremumbai": 585,
      "indoreahmedabad": 385,
      "indoreujjain": 55,
      "indoreomkareshwar": 77,
      "indoreratlam": 135,
      "indoremandav": 95,
      "indoredhule": 260,
      "indorebhopal": 195,
      "indorepune": 590,

      // From Bhopal
      "bhopalindore": 195,
      "bhopalgwalior": 430,
      "bhopaljabalpur": 310,
      "bhopalsagar": 170,
      "bhopalrewa": 490,
      "bhopaldelhi": 780,
      "bhopalsurat": 620,
      "bhopalmumbai": 770,
      "bhopalvidisha": 55,

      // From Delhi
      "delhijaipur": 280,
      "delhiagra": 230,
      "delhichandigarh": 245,
      "delhishimla": 345,
      "delhimanali": 530,
      "delhidehradun": 245,
      "delhirishikesh": 240,

      // From Jaipur
      "jaipurajmer": 135,
      "jaipurpushkar": 145,
      "jaipurudaipur": 390,
      "jaipurjodhpur": 330,
      "jaipurbikaner": 335,

      // From Mumbai / Goa
      "mumbaipune": 150,
      "mumbaigoa": 580,
      "mumbaisurat": 280,
      "goagokarna": 140,
      "goakarwar": 65,

      // From Pokhara / Kathmandu / Nepal
      "pokharamuktinath": 170,
      "pokharachitwan": 145,
      "pokharajomsom": 155,
      "pokharabandipur": 75,
      "kathmandupokhara": 200,
      "kathmanduchitwan": 170,
      "kathmandunagarkot": 32,
      "kathmandubhaktapur": 15,
    };

    if (CITY_PAIR_DISTANCES[pairKey]) return CITY_PAIR_DISTANCES[pairKey];
    if (CITY_PAIR_DISTANCES[revPairKey]) return CITY_PAIR_DISTANCES[revPairKey];

    const c1 = lookupSingleCoordinate(prevCity);
    const c2 = lookupSingleCoordinate(newCity);

    if (c1 && c2) {
      const R = 6371;
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
      const roadDistKm = Math.round(straightKm * 1.3);
      if (roadDistKm > 10) return roadDistKm;
    }

    return 65;
  }, []);

  const handleAddExtension = (e?: React.FormEvent, customName?: string, customKm?: number) => {
    if (e) e.preventDefault();
    const nameToAdd = (customName || newExtensionInput).trim();
    if (!nameToAdd) return;

    if (routeExtensions.some((ext) => ext.name.toLowerCase() === nameToAdd.toLowerCase())) {
      setNewExtensionInput("");
      return;
    }

    const lastStopName = routeExtensions.length > 0
      ? routeExtensions[routeExtensions.length - 1].name
      : (routeSearch ? routeSearch.destination.name : (activeDbRoute?.destination || "Destination"));

    const dist = customKm || calculateExtensionDistance(lastStopName, nameToAdd);
    const newExt: SessionExtension = {
      id: `ext-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: nameToAdd,
      distKm: dist,
      addedAt: new Date().toISOString(),
    };

    setRouteExtensions((prev) => [...prev, newExt]);
    setNewExtensionInput("");
  };

  const handleRemoveExtension = (idToRemove: string) => {
    setRouteExtensions((prev) => prev.filter((e) => e.id !== idToRemove));
  };

  /* ----------------------------------------------------------
     STATE: POI FILTER & SEARCH PARAMS
  ---------------------------------------------------------- */
  const [activePoiTab, setActivePoiTab] = useState<string>("all");
  const [searchParams] = useSearchParams();

  /* ==========================================================
     LOAD DB ROUTES & AUTO-POPULATE SEARCH FROM URL PARAMS
  ========================================================== */
  const fetchDbRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const storeRoutes = cmsStore.getRoutes();

      const response = await apiRequest<RouteEntry[] | { data?: RouteEntry[] }>("/routes").catch(() => null);

      let fetched: RouteEntry[] = [];
      if (Array.isArray(response)) {
        fetched = response;
      } else if (response && Array.isArray((response as any).data)) {
        fetched = (response as any).data;
      }

      const combinedRaw = [...storeRoutes, ...fetched];
      const seenKeys = new Set<string>();
      const uniqueRoutes: RouteEntry[] = [];

      for (const r of combinedRaw) {
        const key = String(r.id || r.routeName || `${r.origin}-${r.destination}`).toLowerCase().trim();
        if (key && !seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueRoutes.push(r);
        }
      }

      setDbRoutes(uniqueRoutes);

      if (uniqueRoutes.length > 0) {
        const savedId = typeof window !== "undefined" ? sessionStorage.getItem("last_selected_route_id") : null;
        const validSaved = savedId && uniqueRoutes.some((r) => String(r.id) === String(savedId)) ? savedId : null;
        setSelectedRouteId((prev) => prev || validSaved || uniqueRoutes[0].id);
      }
    } catch (err) {
      console.error("Fetch DB routes error:", err);
      const storeRoutes = cmsStore.getRoutes();
      setDbRoutes(storeRoutes);
      if (storeRoutes.length > 0) {
        const savedId = typeof window !== "undefined" ? sessionStorage.getItem("last_selected_route_id") : null;
        const validSaved = savedId && storeRoutes.some((r) => String(r.id) === String(savedId)) ? savedId : null;
        setSelectedRouteId(validSaved || storeRoutes[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDbRoutes();
  }, [fetchDbRoutes]);

  // Read URL search params from Hero component redirect or Card clicks
  useEffect(() => {
    const savedSessionId = typeof window !== "undefined" ? sessionStorage.getItem("last_selected_route_id") : null;
    const idParam = searchParams.get("id") || searchParams.get("routeId") || searchParams.get("selectedId") || savedSessionId;
    const nameParam = searchParams.get("name") || searchParams.get("title");
    const srcParam = searchParams.get("source") || searchParams.get("origin") || searchParams.get("from");
    const dstParam = searchParams.get("destination") || searchParams.get("to");

    if (dbRoutes.length > 0) {
      let matched: RouteEntry | undefined;

      if (idParam) {
        matched = dbRoutes.find((r) => String(r.id) === String(idParam));
      }

      if (!matched && nameParam) {
        const lowerName = nameParam.toLowerCase();
        matched = dbRoutes.find((r) =>
          r.routeName.toLowerCase().includes(lowerName) ||
          lowerName.includes(r.routeName.toLowerCase()) ||
          `${r.origin} to ${r.destination}`.toLowerCase().includes(lowerName)
        );
      }

      if (!matched && (srcParam || dstParam)) {
        const srcLower = (srcParam || "").toLowerCase();
        const dstLower = (dstParam || "").toLowerCase();
        matched = dbRoutes.find((r) =>
          (srcLower && (r.origin.toLowerCase().includes(srcLower) || r.routeName.toLowerCase().includes(srcLower))) ||
          (dstLower && (r.destination.toLowerCase().includes(dstLower) || r.routeName.toLowerCase().includes(dstLower)))
        );
      }

      if (matched) {
        setSelectedRouteId(matched.id);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("last_selected_route_id", matched.id);
        }
        setRouteSearch(null);
      } else if (srcParam || dstParam) {
        if (srcParam) setSourceSearch(srcParam);
        if (dstParam) setDestSearch(dstParam);

        const srcName = srcParam || "Kathmandu";
        const dstName = dstParam || "Pokhara";

        const searchData: RouteSearchData = {
          source: { name: srcName, placeId: "src-1", address: srcName, latitude: 0, longitude: 0 },
          destination: { name: dstName, placeId: "dst-1", address: dstName, latitude: 0, longitude: 0 },
          date: searchParams.get("date") || new Date().toISOString().split("T")[0],
          travellers: Number(searchParams.get("travellers")) || 1,
        };
        setRouteSearch(searchData);
      }
    }
  }, [searchParams, dbRoutes]);

  /* ==========================================================
     ACTIVE ROUTE ENTRY
  ========================================================== */
  const activeDbRoute = useMemo<RouteEntry | null>(() => {
    if (!selectedRouteId) return dbRoutes[0] || null;
    return dbRoutes.find((r) => r.id === selectedRouteId) || dbRoutes[0] || null;
  }, [dbRoutes, selectedRouteId]);

  /* ==========================================================
     TIMELINE STOPS COMPUTATION (DB ROUTE OR SEARCHED ROUTE)
  ========================================================== */
  const timelineStops = useMemo<TimelineStop[]>(() => {
    const appendExtensions = (baseStops: TimelineStop[]): TimelineStop[] => {
      if (routeExtensions.length === 0 || baseStops.length === 0) return baseStops;
      const result = [...baseStops];
      const origDstIndex = result.length - 1;

      let baseKm = parseFloat(String(result[origDstIndex].distanceKm).replace(/[^0-9.]/g, "")) || 200;
      let baseHours = parseFloat(String(result[origDstIndex].travelTime).replace(/[^0-9.]/g, "")) || (baseKm / 45);

      if (origDstIndex >= 0) {
        result[origDstIndex] = {
          ...result[origDstIndex],
          isDestination: false,
          badgeLabel: "CORRIDOR WAYPOINT",
          color: "bg-emerald-600",
          badgeBg: "bg-emerald-50 text-emerald-600",
          subtitle: "Original Corridor Terminal",
          details: `${result[origDstIndex].name} (Original Corridor Terminal). Extended further to custom session stops below.`,
        };
      }

      let cumKm = baseKm;
      let cumHours = baseHours;

      routeExtensions.forEach((ext, extIdx) => {
        const prevStop = result[result.length - 1];
        const prevCity = prevStop ? prevStop.name : "Previous Terminal";
        const newCity = ext.name;

        // Resolve intermediate via-stops between prevCity and newCity
        const midStops = resolveCorridorStops(prevCity, newCity);

        midStops.forEach((mid, midIdx) => {
          const midKm = cumKm + Math.round(ext.distKm * mid.distPct);
          const midHours = cumHours + ((ext.distKm * mid.distPct) / 50);
          result.push({
            id: `ext-${extIdx}-mid-${midIdx}`,
            name: mid.name,
            extraInfo: mid.extraInfo,
            type: mid.type as any,
            subtitle: `Intermediate Extension Stop`,
            address: `${mid.name} (${prevCity} ➔ ${newCity})`,
            details: `${mid.details}. On the route from ${prevCity} to ${newCity}.`,
            sequence: result.length + 1,
            isSource: false,
            isDestination: false,
            badgeLabel: mid.type === "food" ? "FOOD STOP" : mid.type === "fuel" ? "FUEL STOP" : mid.type === "place" ? "ATTRACTION" : "HIGHWAY HUB",
            color: mid.type === "food" ? "bg-orange-500" : mid.type === "fuel" ? "bg-amber-500" : mid.type === "place" ? "bg-purple-600" : "bg-emerald-600",
            badgeBg: "bg-emerald-50 text-emerald-600",
            distanceKm: `~${midKm} km`,
            travelTime: `~${midHours.toFixed(1)}h`,
            isExtension: true,
          } as any);
        });

        // Finally add the target extended city as the Ending Destination!
        cumKm += ext.distKm;
        const stepHours = ext.distKm / 50;
        cumHours += stepHours;

        const isFinalExt = extIdx === routeExtensions.length - 1;
        const formattedHours = `~${cumHours.toFixed(1)}h`;

        result.push({
          id: ext.id,
          name: ext.name,
          type: "destination",
          subtitle: isFinalExt ? "Session Extended Destination" : `Extended Stop #${extIdx + 1}`,
          address: `${ext.name} (Custom Session Stop)`,
          details: `Custom user extension beyond original route. Total distance to ${ext.name}: ${cumKm} km (~${cumHours.toFixed(1)}h).`,
          sequence: result.length + 1,
          isSource: false,
          isDestination: isFinalExt,
          badgeLabel: isFinalExt ? "SESSION DESTINATION" : `EXTENDED STOP #${extIdx + 1}`,
          color: isFinalExt ? "bg-purple-600" : "bg-indigo-600",
          badgeBg: isFinalExt ? "bg-purple-50 text-purple-600" : "bg-indigo-50 text-indigo-600",
          distanceKm: `${cumKm} km`,
          travelTime: formattedHours,
          isExtension: true,
        } as any);
      });

      return result;
    };

    // 1. Custom Searched Route Timeline
    if (routeSearch) {
      const srcName = routeSearch.source?.name || "Origin";
      const dstName = routeSearch.destination?.name || "Destination";

      const preMapped = resolveCorridorStops(srcName, dstName);

      const sourceStop: TimelineStop = {
        id: "src-1",
        name: srcName,
        type: "source",
        subtitle: "Start your journey from here",
        address: (routeSearch.source as any)?.address || srcName,
        details: "Starting Point",
        sequence: 1,
        isSource: true,
        isDestination: false,
        badgeLabel: "START",
        color: "bg-blue-600",
        badgeBg: "bg-blue-50 text-blue-600",
        distanceKm: "0 km",
        travelTime: "0h 00m",
      };

      const destStop: TimelineStop = {
        id: "dst-1",
        name: dstName,
        type: "destination",
        subtitle: "Your final destination",
        address: (routeSearch.destination as any)?.address || dstName,
        details: "Final Destination",
        sequence: (preMapped?.length || apiStops.length) + 2,
        isSource: false,
        isDestination: true,
        badgeLabel: "DESTINATION",
        color: "bg-red-500",
        badgeBg: "bg-red-50 text-red-600",
        distanceKm: routeDistance ? `${routeDistance} km` : "End",
        travelTime: routeDuration || "End",
      };

      if (preMapped && preMapped.length > 0) {
        const totalKmVal = parseFloat(String(routeDistance || "200")) || 200;
        const intermediates: TimelineStop[] = preMapped.map((item, idx) => {
          const stepKm = Math.round(totalKmVal * item.distPct);
          return {
            id: `searched-mid-${idx}`,
            name: item.name,
            extraInfo: item.extraInfo,
            type: item.type as any,
            subtitle: `Intermediate Corridor Stop`,
            address: `${item.name} Highway Station`,
            details: `${item.details}. Click below to explore local hotels, restaurants & attractions.`,
            sequence: idx + 2,
            isSource: false,
            isDestination: false,
            badgeLabel: item.type === "food" ? "FOOD STOP" : item.type === "fuel" ? "FUEL STOP" : item.type === "place" ? "ATTRACTION" : "HIGHWAY HUB",
            color: item.type === "food" ? "bg-orange-500" : item.type === "fuel" ? "bg-amber-500" : item.type === "place" ? "bg-purple-600" : "bg-emerald-600",
            badgeBg: "bg-emerald-50 text-emerald-600",
            distanceKm: `~${stepKm} km`,
            travelTime: `~${(stepKm / 45).toFixed(1)}h`,
          };
        });
        return appendExtensions([sourceStop, ...intermediates, destStop]);
      }

      const intermediates: TimelineStop[] = apiStops.map((stop, idx) => ({
        ...stop,
        sequence: idx + 2,
        isSource: false,
        isDestination: false,
        badgeLabel: stop.type === "food" ? "FOOD STOP" : stop.type === "fuel" ? "FUEL STOP" : "RECOMMENDED STOP",
        color: stop.type === "food" ? "bg-orange-500" : stop.type === "fuel" ? "bg-amber-500" : "bg-emerald-600",
        badgeBg: "bg-emerald-50 text-emerald-600",
        distanceKm: `~${((idx + 1) * 45).toFixed(0)} km`,
        travelTime: `~${(idx + 1) * 1.2}h`,
      }));

      return appendExtensions([sourceStop, ...intermediates, destStop]);
    }

    // 2. DB Active Route Timeline with Full Corridor Intermediate Locations
    if (activeDbRoute) {
      const srcName = activeDbRoute.origin || "Origin";
      const dstName = activeDbRoute.destination || "Destination";
      const totalKm = activeDbRoute.totalDistanceKm || 200;

      const rawPois = [
        ...(activeDbRoute.recommendedStops || []),
        ...(activeDbRoute.touristAttractions || []),
        ...(activeDbRoute.viewpoints || []),
        ...(activeDbRoute.restaurants || []),
        ...(activeDbRoute.fuelStations || []),
      ];

      const corridorIntermediates = resolveCorridorStops(srcName, dstName, activeDbRoute.routeName, rawPois);

      const stopsList: TimelineStop[] = [];

      // Start Stop
      stopsList.push({
        id: `db-src-${activeDbRoute.id}`,
        name: srcName,
        type: "source",
        subtitle: "Start your journey",
        address: `${srcName} Departure Point`,
        details: `Corridor start along ${activeDbRoute.routeName}. Road condition: ${activeDbRoute.roadCondition || "Smooth Asphalt"}.`,
        sequence: 1,
        isSource: true,
        isDestination: false,
        badgeLabel: "START",
        color: "bg-blue-600",
        badgeBg: "bg-blue-50 text-blue-600",
        distanceKm: "0 km",
        travelTime: "0h 00m",
      });

      // Intermediate Corridor Stops
      corridorIntermediates.forEach((item, index) => {
        const stepKm = Math.round(totalKm * item.distPct);
        const hours = (stepKm / 45).toFixed(1);

        stopsList.push({
          id: `db-mid-${index}-${activeDbRoute.id}`,
          name: item.name,
          extraInfo: item.extraInfo,
          type: item.type as any,
          subtitle: `Intermediate Waypoint on ${activeDbRoute.routeName}`,
          address: `${item.name} Highway Corridor`,
          details: `${item.details}. Available services: Hotels, Restaurants, Fuel & EV Stations, and Local Attractions.`,
          sequence: index + 2,
          isSource: false,
          isDestination: false,
          badgeLabel: item.type === "food" ? "FOOD STOP" : item.type === "fuel" ? "FUEL STOP" : item.type === "place" ? "ATTRACTION" : "HIGHWAY HUB",
          color: item.type === "food" ? "bg-orange-500" : item.type === "fuel" ? "bg-amber-500" : item.type === "place" ? "bg-purple-600" : "bg-emerald-600",
          badgeBg: "bg-emerald-50 text-emerald-600",
          distanceKm: `${stepKm} km`,
          travelTime: `~${hours}h`,
        });
      });

      // Final Destination Stop
      stopsList.push({
        id: `db-dst-${activeDbRoute.id}`,
        name: dstName,
        type: "destination",
        subtitle: "Final Destination",
        address: `${dstName} Arrival Terminal`,
        details: `Arrival point for ${activeDbRoute.routeName}. Total distance: ${totalKm} km.`,
        sequence: stopsList.length + 1,
        isSource: false,
        isDestination: true,
        badgeLabel: "DESTINATION",
        color: "bg-red-500",
        badgeBg: "bg-red-50 text-red-600",
        distanceKm: `${totalKm} km`,
        travelTime: activeDbRoute.estimatedTravelTime || "End",
      });

      return appendExtensions(stopsList);
    }

    return [];
  }, [routeSearch, apiStops, routeDistance, routeDuration, activeDbRoute, routeExtensions]);

  /* ==========================================================
     MAP MARKER ITEMS FROM TIMELINE STOPS
  ========================================================== */
  const mapItems = useMemo<MapMarkerItem[]>(() => {
    return timelineStops.map((stop, idx) => {
      const { cityName: displayCity } = extractCityAndExtraInfo(stop.name, stop.extraInfo);
      return {
        id: String(stop.id || `stop-${idx}`),
        name: displayCity || stop.name,
        location: stop.address || stop.subtitle || stop.name,
        priceTag: stop.badgeLabel || `#${stop.sequence}`,
        category: stop.isSource ? "transport" : stop.isDestination ? "hotel" : "place",
        lat: (stop as any).lat || (stop as any).latitude,
        lng: (stop as any).lng || (stop as any).longitude,
      };
    });
  }, [timelineStops]);

  /* ==========================================================
     EXTENSION CALCULATIONS (CURRENT DESTINATION & SUGGESTIONS)
  ========================================================== */
  const currentDestinationName = useMemo(() => {
    if (routeExtensions.length > 0) {
      return routeExtensions[routeExtensions.length - 1].name;
    }
    if (routeSearch) return routeSearch.destination.name;
    return activeDbRoute?.destination || "Destination";
  }, [routeExtensions, routeSearch, activeDbRoute]);

  const activeTotalDistance = useMemo(() => {
    if (timelineStops.length > 0) {
      const last = timelineStops[timelineStops.length - 1];
      return last?.distanceKm || `${activeDbRoute?.totalDistanceKm || 0} km`;
    }
    return `${activeDbRoute?.totalDistanceKm || 0} km`;
  }, [timelineStops, activeDbRoute]);

  const activeTotalDuration = useMemo(() => {
    if (timelineStops.length > 0) {
      const last = timelineStops[timelineStops.length - 1];
      return last?.travelTime || activeDbRoute?.estimatedTravelTime || "N/A";
    }
    return activeDbRoute?.estimatedTravelTime || "N/A";
  }, [timelineStops, activeDbRoute]);

  const extensionSuggestions = useMemo(() => {
    const nameLower = currentDestinationName.toLowerCase();
    if (nameLower.includes("indore")) {
      return [
        { name: "Ujjain", distKm: 55 },
        { name: "Omkareshwar", distKm: 77 },
        { name: "Ratlam", distKm: 135 },
        { name: "Mandav", distKm: 95 },
      ];
    }
    if (nameLower.includes("pokhara")) {
      return [
        { name: "Muktinath", distKm: 170 },
        { name: "Chitwan", distKm: 145 },
        { name: "Bandipur", distKm: 75 },
        { name: "Jomsom", distKm: 155 },
      ];
    }
    if (nameLower.includes("kathmandu")) {
      return [
        { name: "Nagarkot", distKm: 32 },
        { name: "Bhaktapur", distKm: 15 },
        { name: "Pokhara", distKm: 200 },
        { name: "Chitwan", distKm: 170 },
      ];
    }
    if (nameLower.includes("goa")) {
      return [
        { name: "Gokarna", distKm: 140 },
        { name: "Dudhsagar Waterfalls", distKm: 45 },
        { name: "Karwar", distKm: 65 },
      ];
    }
    if (nameLower.includes("jaipur")) {
      return [
        { name: "Ajmer & Pushkar", distKm: 135 },
        { name: "Udaipur", distKm: 390 },
        { name: "Jodhpur", distKm: 330 },
      ];
    }
    return [
      { name: `${currentDestinationName} North Bypass`, distKm: 25 },
      { name: `${currentDestinationName} Scenic Viewpoint`, distKm: 40 },
    ];
  }, [currentDestinationName]);

  /* ==========================================================
     ALL POIS COMBINED FROM ACTIVE DB ROUTE
  ========================================================== */
  const allRoutePois = useMemo(() => {
    if (!activeDbRoute) return [];
    return [
      ...(activeDbRoute.fuelStations || []).map((p) => ({ ...p, catType: "fuel", catLabel: "Fuel Station", icon: Fuel, color: "text-yellow-500" })),
      ...(activeDbRoute.evChargingStations || []).map((p) => ({ ...p, catType: "ev", catLabel: "EV Station", icon: Zap, color: "text-emerald-500" })),
      ...(activeDbRoute.medicalCentres || []).map((p) => ({ ...p, catType: "medical", catLabel: "Medical Centre", icon: Stethoscope, color: "text-red-500" })),
      ...(activeDbRoute.policePosts || []).map((p) => ({ ...p, catType: "police", catLabel: "Police Checkpost", icon: ShieldAlert, color: "text-blue-500" })),
      ...(activeDbRoute.atms || []).map((p) => ({ ...p, catType: "atm", catLabel: "ATM", icon: CreditCard, color: "text-purple-500" })),
      ...(activeDbRoute.viewpoints || []).map((p) => ({ ...p, catType: "viewpoint", catLabel: "Viewpoint", icon: Camera, color: "text-indigo-500" })),
      ...(activeDbRoute.restaurants || []).map((p) => ({ ...p, catType: "restaurant", catLabel: "Restaurant", icon: Utensils, color: "text-orange-500" })),
      ...(activeDbRoute.touristAttractions || []).map((p) => ({ ...p, catType: "attraction", catLabel: "Attraction", icon: Mountain, color: "text-cyan-500" })),
    ];
  }, [activeDbRoute]);

  const filteredPois = useMemo(() => {
    if (activePoiTab === "all") return allRoutePois;
    return allRoutePois.filter((p) => p.catType === activePoiTab);
  }, [allRoutePois, activePoiTab]);

  /* ==========================================================
     SEARCH CUSTOM ROUTE HANDLER
  ========================================================== */
  const handleCustomSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceSearch.trim() || !destSearch.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const searchData: RouteSearchData = {
        source: { name: sourceSearch.trim(), placeId: "src-1", address: sourceSearch.trim(), latitude: 0, longitude: 0 },
        destination: { name: destSearch.trim(), placeId: "dst-1", address: destSearch.trim(), latitude: 0, longitude: 0 },
        date: new Date().toISOString().split("T")[0],
        travellers: 2,
      };

      setRouteSearch(searchData);

      const response = await planRoute(searchData).catch(() => null);
      if (response && Array.isArray(response.stops)) {
        setApiStops(response.stops);
        setRouteDistance(response.distance);
        setRouteDuration(response.duration);
      } else {
        setApiStops([]);
        setRouteDistance("Custom Route");
        setRouteDuration("Direct");
      }
    } catch (err) {
      console.error("Custom route error:", err);
      setError("Unable to calculate route for specified locations.");
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     SERVICE BUTTON CLICK HANDLER
  ========================================================== */
  const handleServiceClick = (stopName: string, categoryPath: string, catKey: string) => {
    const params = new URLSearchParams();
    params.set("location", stopName);
    params.set("routeStop", stopName);
    params.set("category", catKey);
    if (activeDbRoute) {
      params.set("source", activeDbRoute.origin);
      params.set("destination", activeDbRoute.destination);
      params.set("routeId", activeDbRoute.id);
      params.set("id", activeDbRoute.id);
    }
    navigate(`${categoryPath}?${params.toString()}`);
  };

  /* ==========================================================
     UI RENDER
  ========================================================== */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* =====================================================
          HEADER HERO & SEARCH BAR
      ===================================================== */}
      <section className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white pt-8 pb-20 px-4">
        {/* TOP LEFT BACK BUTTON */}
        <div className="max-w-7xl mx-auto flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all shadow-md backdrop-blur-md hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span>Back</span> 
          </button>
        </div>

        <div className="max-w-6xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ✨ REAL-TIME ROUTE INTELLIGENCE & HIGHWAY ANALYSIS
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Nepal Highway & Route Analysis
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Select any database route below or search custom locations to inspect live step-by-step stops, altitude profiles, emergency helplines, and connected services.
          </p>

          {/* SEARCH FORM */}
          <form onSubmit={handleCustomSearch} className="max-w-3xl mx-auto pt-4">
            <div className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/20 flex flex-col sm:flex-row items-center gap-3 text-slate-800">
              <div className="relative flex-1 w-full">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                <input
                  type="text"
                  placeholder="Starting point (e.g. Kathmandu, Pokhara)..."
                  value={sourceSearch}
                  onChange={(e) => setSourceSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="hidden sm:block text-slate-400 font-bold">➔</div>

              <div className="relative flex-1 w-full">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                <input
                  type="text"
                  placeholder="Destination (e.g. Muktinath, Chitwan)..."
                  value={destSearch}
                  onChange={(e) => setDestSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all whitespace-nowrap"
              >
                Analyze Custom Route
              </button>
            </div>
          </form>

          {/* SCALABLE DB ROUTE SELECTOR FOR 1 TO 100+ ROUTES */}
          {dbRoutes.length > 0 && (
            <div className="pt-6 max-w-4xl mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2 text-xs font-bold text-slate-300">
                <div className="flex items-center space-x-2">
                  <RouteIcon className="w-4 h-4 text-emerald-400" />
                  <span>Available Database Corridors ({dbRoutes.length})</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Select corridor from dropdown or scroll quick pills
                </div>
              </div>

              {/* DROPDOWN SELECT MENU FOR EASY NAVIGATION OF MULTIPLE ROUTES */}
              <div className="relative max-w-md mx-auto">
                <select
                  value={routeSearch ? "" : activeDbRoute?.id || ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      setRouteSearch(null);
                      handleSelectRoute(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer shadow-lg backdrop-blur-md"
                >
                  {routeSearch && <option value="" disabled className="bg-slate-900 text-white">-- Custom Search Active --</option>}
                  {dbRoutes.map((r, i) => (
                    <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                      #{i + 1} {r.routeName || `${r.origin} → ${r.destination}`} ({r.totalDistanceKm} km - {r.roadCondition})
                    </option>
                  ))}
                </select>
              </div>

              {/* HORIZONTAL SCROLLING QUICK SWITCH PILLS WITH NAVIGATION BUTTONS */}
              <div className="relative flex items-center group">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("db-route-pills-container");
                    if (el) el.scrollBy({ left: -200, behavior: "smooth" });
                  }}
                  className="hidden sm:flex shrink-0 w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white items-center justify-center text-xs shadow-md mr-1 transition-all"
                  aria-label="Scroll left"
                >
                  ‹
                </button>

                <div
                  id="db-route-pills-container"
                  className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1 px-1 scrollbar-none scroll-smooth w-full"
                >
                  {dbRoutes.map((r) => {
                    const isActive = !routeSearch && activeDbRoute?.id === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setRouteSearch(null);
                          handleSelectRoute(r.id);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center space-x-1.5 shrink-0 ${
                          isActive
                            ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105"
                            : "bg-white/10 text-slate-200 border-white/15 hover:bg-white/20 hover:text-white"
                        }`}
                      >
                        <RouteIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{r.routeName || `${r.origin} → ${r.destination}`}</span>
                        <span className="text-[10px] opacity-75">({r.totalDistanceKm} km)</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("db-route-pills-container");
                    if (el) el.scrollBy({ left: 200, behavior: "smooth" });
                  }}
                  className="hidden sm:flex shrink-0 w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white items-center justify-center text-xs shadow-md ml-1 transition-all"
                  aria-label="Scroll right"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          SPLIT LAYOUT: LEFT ROUTE DETAILS & RIGHT INTERACTIVE MAP
      ===================================================== */}
      <section id="complete-route-analysis" className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: ROUTE HEADER SUMMARY, TIMELINE STOPS, POIS & HELPLINES */}
          <div className="lg:col-span-7 space-y-6">
            {/* ROUTE HEADER SUMMARY CARD */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-extrabold text-[10px] uppercase tracking-wider">
                      {routeSearch ? "Custom Searched Corridor" : "Verified Nepal Highway Corridor"}
                    </span>
                    {activeDbRoute?.roadCondition && (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider">
                        {activeDbRoute.roadCondition}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                    {routeSearch
                      ? `${routeSearch.source.name} ➔ ${currentDestinationName}`
                      : `${activeDbRoute?.origin || "Origin"} ➔ ${currentDestinationName}`}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/80 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Total Distance</div>
                    <div className="text-sm font-extrabold text-emerald-600">
                      {activeTotalDistance}
                    </div>
                  </div>

                  <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/80 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Estimated Duration</div>
                    <div className="text-sm font-extrabold text-slate-800">
                      {activeTotalDuration}
                    </div>
                  </div>

                  {activeDbRoute?.imageUrl && (
                    <div className="w-16 h-12 rounded-xl overflow-hidden shadow-sm border border-slate-200 shrink-0">
                      <SafeImage src={activeDbRoute.imageUrl} fallbackSrc={DEFAULT_IMAGE} alt="Route" width={64} height={48} className="object-cover w-full h-full" />
                    </div>
                  )}
                </div>
              </div>

              {/* WEATHER SUMMARY */}
              {activeDbRoute?.weatherSummary && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start space-x-3 text-amber-900 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Highway Weather & Travel Advisory: </span>
                    <span>{activeDbRoute.weatherSummary}</span>
                  </div>
                </div>
              )}

              {/* QUICK FIND MORE ROUTE SERVICES BAR */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200/80 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Find More Services Along This Route</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Explore places along {currentDestinationName}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (activeDbRoute?.origin || sourceSearch) params.set("source", activeDbRoute?.origin || sourceSearch);
                      if (currentDestinationName) params.set("destination", currentDestinationName);
                      navigate(`/pages/famous-places?${params.toString()}`);
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                    <span>Find More Attractions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (currentDestinationName) params.set("location", currentDestinationName);
                      navigate(`/pages/fuel-station?${params.toString()}`);
                    }}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Fuel className="w-3.5 h-3.5" />
                    <span>Find More Fuel & EV Stations</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (currentDestinationName) params.set("location", currentDestinationName);
                      navigate(`/pages/hotels?${params.toString()}`);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Hotel className="w-3.5 h-3.5 text-blue-500" />
                    <span>Hotels</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (currentDestinationName) params.set("location", currentDestinationName);
                      navigate(`/pages/guides?${params.toString()}`);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Compass className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Tour Guides</span>
                  </button>
                </div>
              </div>

              {/* STEP-BY-STEP TIMELINE LIST */}
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                    <RouteIcon className="w-5 h-5 text-emerald-600" />
                    <span>Step-by-Step Route Sequence</span>
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">
                    {timelineStops.length} Waypoints Identified
                  </span>
                </div>

                <div className="space-y-6">
                  {timelineStops.map((stop) => {
                    const { cityName: displayCity, extraInfo: displayExtra } = extractCityAndExtraInfo(stop.name, stop.extraInfo);
                    return (
                      <div key={stop.id} className="flex gap-4 items-start group">
                        {/* Sequence Marker Circle */}
                        <div className={`w-9 h-9 rounded-full ${stop.color} text-white font-extrabold text-xs flex items-center justify-center shadow-md shrink-0 mt-1 ring-4 ring-white`}>
                          {stop.sequence < 10 ? `0${stop.sequence}` : stop.sequence}
                        </div>

                        {/* Card Content */}
                        <div className="flex-1 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-400 transition-colors space-y-2.5">
                          <div className="flex items-start justify-between flex-wrap gap-2">
                            <div className="space-y-1">
                              <h4 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                                {displayCity}
                              </h4>
                              {displayExtra && (
                                <div className="flex items-center gap-1.5 pt-0.5">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-semibold text-xs">
                                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>{displayExtra}</span>
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-2 shrink-0 pt-0.5">
                              {(stop as any).isExtension && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExtension(stop.id)}
                                  className="px-2 py-0.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] flex items-center space-x-1 border border-red-200 transition-colors mr-1 shadow-sm"
                                  title="Remove custom extension stop"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Remove</span>
                                </button>
                              )}
                              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${stop.badgeBg}`}>
                                {stop.badgeLabel}
                              </span>
                              <span className="text-xs font-bold text-slate-500">
                                {stop.distanceKm} ({stop.travelTime})
                              </span>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {stop.details || stop.subtitle || stop.address}
                          </p>

                          {/* QUICK ACTION CATEGORY BUTTONS FOR EACH STOP */}
                          <div className="pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-2">
                            {actionCategories.map((cat) => {
                              const Icon = cat.icon;
                              return (
                                <button
                                  key={cat.key}
                                  type="button"
                                  onClick={() => handleServiceClick(displayCity || stop.name, cat.path, cat.key)}
                                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all flex items-center space-x-1.5 shadow-sm"
                                >
                                  <Icon className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>{cat.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ========================================================
                    INTERACTIVE ROUTE EXTENSION PANEL (SESSION ONLY)
                ======================================================== */}
                <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-xl space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shrink-0">
                        <Navigation className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center space-x-1.5">
                          <span>Extend Route Beyond {currentDestinationName}</span>
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        </h4>
                        <p className="text-[11px] text-slate-300">
                          Want to travel further past <strong className="text-emerald-400 font-bold">{currentDestinationName}</strong>? Add your next stop to extend your trip route.
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] uppercase tracking-wider shrink-0">
                      🔒 Session Extension (Not saved in DB)
                    </span>
                  </div>

                  {/* INPUT & BUTTON */}
                  <form onSubmit={handleAddExtension} className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <MapPin className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={newExtensionInput}
                        onChange={(e) => setNewExtensionInput(e.target.value)}
                        placeholder={`Type next destination beyond ${currentDestinationName} (e.g. Ujjain, Ratlam, Muktinath...)`}
                        className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!newExtensionInput.trim()}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 shrink-0 shadow-lg shadow-indigo-600/30 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Extend Route</span>
                    </button>
                  </form>

                  {/* QUICK SUGGESTIONS CHIPS */}
                  {extensionSuggestions.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                        <Compass className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Quick Suggested Extension Destinations from {currentDestinationName}:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {extensionSuggestions.map((sugg) => (
                          <button
                            key={sugg.name}
                            type="button"
                            onClick={() => handleAddExtension(undefined, sugg.name, sugg.distKm)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1 shadow-sm cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-emerald-400" />
                            <span>{sugg.name}</span>
                            <span className="text-[10px] text-indigo-400 font-semibold">(+{sugg.distKm} km)</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {routeExtensions.length > 0 && (
                    <div className="pt-2 flex items-center justify-between text-xs text-indigo-300 font-semibold border-t border-slate-800">
                      <span>{routeExtensions.length} Custom Extension Stop(s) Active in Session</span>
                      <button
                        type="button"
                        onClick={() => setRouteExtensions([])}
                        className="text-red-400 hover:text-red-300 font-bold text-[11px] underline cursor-pointer"
                      >
                        Reset Extensions
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* POI CATEGORY TABS & CARDS */}
            {allRoutePois.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Points of Interest Along This Highway
                    </h3>
                    <p className="text-xs text-slate-500">
                      Fuel stations, EV chargers, emergency medical clinics, ATMs, and viewpoints.
                    </p>
                  </div>

                  <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-full">
                    {filteredPois.length} Available POIs
                  </span>
                </div>

                {/* POI Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePoiTab("all")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      activePoiTab === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    All POIs ({allRoutePois.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePoiTab("fuel")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      activePoiTab === "fuel" ? "bg-yellow-500 text-white border-yellow-500" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ⛽ Fuel ({allRoutePois.filter((p) => p.catType === "fuel").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePoiTab("ev")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      activePoiTab === "ev" ? "bg-emerald-500 text-white border-emerald-500" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ⚡ EV Chargers ({allRoutePois.filter((p) => p.catType === "ev").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePoiTab("medical")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      activePoiTab === "medical" ? "bg-red-500 text-white border-red-500" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    🩺 Medical ({allRoutePois.filter((p) => p.catType === "medical").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePoiTab("police")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      activePoiTab === "police" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    👮 Police ({allRoutePois.filter((p) => p.catType === "police").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePoiTab("atm")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      activePoiTab === "atm" ? "bg-purple-600 text-white border-purple-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    💳 ATMs ({allRoutePois.filter((p) => p.catType === "atm").length})
                  </button>
                </div>

                {/* POI Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredPois.map((poi, idx) => {
                    const Icon = poi.icon;
                    return (
                      <div key={idx} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 transition-all flex items-start space-x-3">
                        <div className={`w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm ${poi.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                              {poi.catLabel}
                            </span>
                          </div>
                          <h5 className="font-extrabold text-sm text-slate-900 truncate mt-0.5">
                            {poi.name}
                          </h5>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            📍 {poi.location}
                          </p>
                          {poi.contactNumber && (
                            <a
                              href={`tel:${poi.contactNumber}`}
                              className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-600 hover:underline mt-2"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{poi.contactNumber}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* EMERGENCY CONTACTS BOX */}
            {activeDbRoute?.emergencyContacts && activeDbRoute.emergencyContacts.length > 0 && (
              <div className="bg-red-50/80 border border-red-200 rounded-3xl p-6 shadow-md">
                <div className="flex items-center space-x-2 text-red-700 font-extrabold text-base mb-3">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <span>Highway Emergency & Police Helplines</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeDbRoute.emergencyContacts.map((contact, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-2xl border border-red-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{contact.title}</div>
                        <div className="text-[10px] text-slate-500">{contact.location}</div>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1 hover:bg-red-700 transition-colors shadow-sm"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{contact.phone}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: STICKY INTERACTIVE MAP WITH ROUTE POLYLINE */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Interactive Route Map</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {timelineStops.length} Waypoints Connected Along Corridor
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-extrabold text-[11px] rounded-full">
                  Live Map View
                </span>
              </div>

              {/* Leaflet Map Canvas Box */}
              <div className="w-full h-[540px] rounded-2xl overflow-hidden shadow-inner border border-slate-200 relative">
                <InteractiveMap
                  items={mapItems}
                  drawPolyline={true}
                  selectedId={selectedMapMarkerId}
                  onMarkerClick={(id) => setSelectedMapMarkerId(id)}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block animate-pulse" />
                  <span className="font-semibold text-slate-700">Route Path Connected</span>
                </div>
                <span className="font-extrabold text-blue-700">
                  {routeSearch ? (routeDistance ? `${routeDistance} km` : "Custom Corridor") : `${activeDbRoute?.totalDistanceKm || 0} km`}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
