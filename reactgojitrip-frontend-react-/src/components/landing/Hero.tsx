"use client";

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SafeImage } from "../common/SafeImage";
import {
  MapPin,
  Calendar,
  Users,
  Search,
  BrainCircuit,
  Sparkles,
  Navigation,
  Loader2,
  X,
  Route as RouteIcon,
  ArrowUpDown,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import {
  searchPlaces,
  getPlaceDetails,
  type LocationData,
  type LocationSuggestion,
} from "@/lib/api";

// ============================================================
// SHARED ROUTE SEARCH DATA
// ============================================================

export interface RouteSearchData {
  source: {
    placeId?: string;
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };

  destination: {
    placeId?: string;
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };

  date: string;
  travellers: number;
}

// ============================================================
// LOCATION INPUT
// ============================================================

interface LocationInputProps {
  label: string;
  placeholder: string;
  value: string;
  selectedLocation: LocationData | null;
  iconColor: string;

  onChange: (value: string) => void;
  onSelect: (location: LocationData) => void;
  onClear: () => void;
}

const LocationInput = ({
  label,
  placeholder,
  value,
  selectedLocation,
  iconColor,
  onChange,
  onSelect,
  onClear,
}: LocationInputProps) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // ==========================================================
  // CLICK OUTSIDE
  // ==========================================================

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ==========================================================
  // SEARCH LOCATIONS
  // ==========================================================

  const searchLocations = async (query: string) => {
    const cleanQuery = query.trim();

    if (cleanQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();

    abortControllerRef.current = controller;

    try {
      setLoading(true);

      const results = await searchPlaces(cleanQuery, {
        signal: controller.signal,
      });

      if (!controller.signal.aborted) {
        setSuggestions(results);
        setShowSuggestions(true);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      console.error("Location search error:", error);

      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  const handleChange = (newValue: string) => {
    onChange(newValue);

    // User edited selected location.
    // Old coordinates are no longer valid.
    if (selectedLocation) {
      onClear();
    }

    setShowSuggestions(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocations(newValue);
    }, 300);
  };

  // ==========================================================
  // SELECT LOCATION
  // ==========================================================

  const handleSelect = (suggestion: LocationSuggestion) => {
    setShowSuggestions(false);
    setSuggestions([]);

    onChange(suggestion.name);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();

    abortControllerRef.current = controller;

    (async () => {
      try {
        setLoading(true);

        const location = await getPlaceDetails(suggestion.placeId, {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          onSelect(location);

          if (location.name) {
            onChange(location.name);
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Location details error:", error);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();
  };

  // ==========================================================
  // CLEAR
  // ==========================================================

  const clearLocation = () => {
    onClear();
    onChange("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div ref={containerRef} className="relative">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
          {label}
        </label>

        <div className="relative flex items-center">
          <MapPin className={`absolute left-4 ${iconColor}`} size={18} />

          <input
            type="text"
            value={value}
            placeholder={placeholder}
            autoComplete="off"
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onChange={(event) => handleChange(event.target.value)}
            className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm placeholder:text-slate-400 font-medium text-slate-800 shadow-sm"
          />

          {loading && (
            <Loader2
              size={18}
              className="absolute right-4 text-blue-500 animate-spin"
            />
          )}

          {!loading && value && (
            <button
              type="button"
              onClick={clearLocation}
              className="absolute right-3 p-1 rounded-full hover:bg-slate-100 transition"
              aria-label={`Clear ${label}`}
            >
              <X size={16} className="text-slate-400 hover:text-slate-600" />
            </button>
          )}

          {/* ======================================================
              SUGGESTIONS (DROP-UP: POPS UP ABOVE INPUT)
          ====================================================== */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-[100] left-0 right-0 bottom-full mb-2 bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 ring-1 ring-slate-900/5">
              <div className="px-3.5 py-1.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10">
                <span>Suggested Locations</span>
                <span className="text-[10px] text-blue-600 font-semibold lowercase">tap to select</span>
              </div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.placeId}
                  type="button"
                  onClick={() => handleSelect(suggestion)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/80 active:bg-blue-100/60 transition flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                    <MapPin size={15} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                      {suggestion.name}
                    </p>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {suggestion.address}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ======================================================
              NO RESULTS (DROP-UP)
          ====================================================== */}
          {showSuggestions &&
            !loading &&
            value.trim().length >= 2 &&
            suggestions.length === 0 && (
              <div className="absolute z-[100] left-0 right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                No matching locations found.
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// HERO
// ============================================================

export const Hero = () => {
  const navigate = useNavigate();
  // ==========================================================
  // SOURCE
  // ==========================================================

  const [source, setSource] = useState("");

  const [sourceLocation, setSourceLocation] = useState<LocationData | null>(
    null,
  );

  // ==========================================================
  // DESTINATION
  // ==========================================================

  const [destination, setDestination] = useState("");

  const [destinationLocation, setDestinationLocation] =
    useState<LocationData | null>(null);

  // ==========================================================
  // OTHER FIELDS
  // ==========================================================

  const [date, setDate] = useState("");

  const [travellers, setTravellers] = useState("1");

  const [searching, setSearching] = useState(false);

  // Swap Source and Destination locations
  const handleSwapLocations = () => {
    const tempSource = source;
    const tempSourceLoc = sourceLocation;
    setSource(destination);
    setSourceLocation(destinationLocation);
    setDestination(tempSource);
    setDestinationLocation(tempSourceLoc);
  };

  // ==========================================================
  // SEARCH ROUTE
  // ==========================================================

  const handleSearch = async () => {
    const srcName = sourceLocation?.name || source.trim();
    const dstName = destinationLocation?.name || destination.trim();

    if (!srcName && !dstName) {
      alert("Please enter a starting location or destination.");
      return;
    }

    const travellerCount = Number(travellers) || 1;

    try {
      setSearching(true);

      const searchData: RouteSearchData = {
        source: {
          placeId: sourceLocation?.placeId || "src-1",
          name: srcName || "Kathmandu",
          address: sourceLocation?.address || srcName,
          latitude: sourceLocation?.latitude || 0,
          longitude: sourceLocation?.longitude || 0,
        },
        destination: {
          placeId: destinationLocation?.placeId || "dst-1",
          name: dstName || "Pokhara",
          address: destinationLocation?.address || dstName,
          latitude: destinationLocation?.latitude || 0,
          longitude: destinationLocation?.longitude || 0,
        },
        date: date || new Date().toISOString().split("T")[0],
        travellers: travellerCount,
      };

      sessionStorage.setItem("gojitrip_route_search", JSON.stringify(searchData));

      const params = new URLSearchParams();
      if (srcName) params.set("source", srcName);
      if (dstName) params.set("destination", dstName);
      if (date) params.set("date", date);
      if (travellers) params.set("travellers", String(travellerCount));

      navigate(`/pages/routes?${params.toString()}`);
    } catch (error) {
      console.error("Route search error:", error);
      alert("Unable to search route. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  // ==========================================================
  // TODAY
  // ==========================================================

  const today = new Date().toISOString().split("T")[0];

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section className="relative min-h-[90vh] flex items-center py-20 overflow-hidden">
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="absolute inset-0 z-0">
        <SafeImage
          src="https://images.unsplash.com/photo-1718179634911-8551f8b0cccf?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Scenic mountain road"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/60 md:to-transparent" />
      </div>

      {/* ======================================================
          CONTAINER
      ====================================================== */}

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* ==================================================
              LEFT CONTENT
          ================================================== */}

          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/30 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>Verified Nepal Travel Portal & AI Companion</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Plan Smarter.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-red-500">Travel Better.</span>
              <br />
              GojiTrip.
            </h1>

            <p className="text-base md:text-xl text-slate-600 max-w-lg leading-relaxed">
              AI-powered route planning, verified highway insights, certified mountain guides, partner homestays, and transparent transport fares for Nepal & beyond.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {[
                { icon: Navigation, label: "AI Route Planner" },
                { icon: Sparkles, label: "100% Ground Verified" },
                { icon: BrainCircuit, label: "Smart Highway Insights" },
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3.5 py-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full text-slate-700 font-semibold text-xs shadow-sm"
                  >
                    <Icon size={15} className="text-blue-600" />
                    <span>{feature.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Popular Route Quick Presets */}
            <div className="pt-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Popular Nepal Routes (Click to Auto-Fill):
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Kathmandu ➔ Pokhara", src: "Kathmandu, Nepal", dst: "Pokhara, Nepal", srcLat: 27.7172, srcLng: 85.3240, dstLat: 28.2096, dstLng: 83.9856 },
                  { label: "Kathmandu ➔ Muktinath", src: "Kathmandu, Nepal", dst: "Muktinath, Nepal", srcLat: 27.7172, srcLng: 85.3240, dstLat: 28.8167, dstLng: 83.8667 },
                  { label: "Pokhara ➔ Chitwan", src: "Pokhara, Nepal", dst: "Chitwan, Nepal", srcLat: 28.2096, srcLng: 83.9856, dstLat: 27.5291, dstLng: 84.4533 },
                  { label: "Kathmandu ➔ Janakpur", src: "Kathmandu, Nepal", dst: "Janakpur, Nepal", srcLat: 27.7172, srcLng: 85.3240, dstLat: 26.7271, dstLng: 85.9231 },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSource(preset.src);
                      setDestination(preset.dst);
                      setSourceLocation({ placeId: `src_${idx}`, name: preset.src, address: preset.src, latitude: preset.srcLat, longitude: preset.srcLng });
                      setDestinationLocation({ placeId: `dst_${idx}`, name: preset.dst, address: preset.dst, latitude: preset.dstLat, longitude: preset.dstLng });
                      if (!date) setDate(today);
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center space-x-1"
                  >
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ==================================================
              RIGHT SEARCH CARD (HIGHWAY & ROUTE PLANNER)
          ================================================== */}

          <div className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
            <div className="bg-white/95 backdrop-blur-2xl border border-white/80 p-6 sm:p-7 rounded-[32px] shadow-2xl shadow-blue-950/15 relative transition-all">
              {/* Decorative Accent Highlights (contained so dropups are not clipped) */}
              <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl" />
              </div>

              {/* CARD HEADER: CLEAR ROUTE SEARCH MENTION */}
              <div className="mb-5 relative z-10 space-y-1.5 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-[11px] font-extrabold uppercase tracking-wider">
                    <RouteIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Route & Highway Search</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    Google Verified
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Search Travel Route
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Enter starting point and destination to inspect live road distance, elevation, tolls & stops.
                </p>
              </div>

              {/* SOURCE & DESTINATION INPUTS WITH INTERACTIVE SWAP */}
              <div className="relative mb-4 space-y-3 z-10">
                {/* SOURCE */}
                <div className="relative z-30 focus-within:z-50">
                  <LocationInput
                    label="Starting Point (Source)"
                    placeholder="Enter starting location"
                    value={source}
                    selectedLocation={sourceLocation}
                    iconColor="text-blue-600"
                    onChange={setSource}
                    onSelect={setSourceLocation}
                    onClear={() => setSourceLocation(null)}
                  />
                </div>

                {/* SWAP BUTTON */}
                <div className="relative flex justify-center -my-2.5 z-20">
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    className="p-1.5 bg-white border border-slate-200 rounded-full shadow-md text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
                    title="Swap Source and Destination"
                    aria-label="Swap starting location and destination"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                </div>

                {/* DESTINATION */}
                <div className="relative z-20 focus-within:z-50">
                  <LocationInput
                    label="Final Destination"
                    placeholder="Enter destination"
                    value={destination}
                    selectedLocation={destinationLocation}
                    iconColor="text-rose-500"
                    onChange={setDestination}
                    onSelect={setDestinationLocation}
                    onClear={() => setDestinationLocation(null)}
                  />
                </div>
              </div>

              {/* DATE + TRAVELLERS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 relative z-10">
                {/* DATE */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider pl-1">
                    Date of Journey
                  </label>

                  <div className="relative flex items-center">
                    <Calendar
                      className="absolute left-3.5 text-blue-500"
                      size={16}
                    />

                    <input
                      type="date"
                      min={today}
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

                {/* TRAVELLERS */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider pl-1">
                    No. of Travellers
                  </label>

                  <div className="relative flex items-center">
                    <Users
                      className="absolute left-3.5 text-blue-500"
                      size={16}
                    />

                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="1 Traveller"
                      value={travellers}
                      onChange={(event) => setTravellers(event.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xs font-semibold text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* SEARCH BUTTON */}
              <div className="relative z-10 space-y-2.5">
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm sm:text-base transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  {searching ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Searching Route...</span>
                    </>
                  ) : (
                    <>
                      <Navigation size={18} className="rotate-45" />
                      <span>Search Route</span>
                      <ArrowRight size={16} className="ml-0.5" />
                    </>
                  )}
                </button>

                {/* TRUST / FEATURE BADGES BAR */}
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-semibold px-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Live Road Distance
                  </span>
                  <span>•</span>
                  <span>Fuel & Rest Stops</span>
                  <span>•</span>
                  <span>Elevation Profile</span>
                </div>
              </div>
              </div>
          </div>
                                                                                            </div>
                                                                                          </div>
                                                                                        </section>
  );  
};
      