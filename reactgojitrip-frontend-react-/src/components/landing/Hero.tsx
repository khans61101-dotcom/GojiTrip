"use client";

import React, { useEffect, useRef, useState } from "react";
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
      <div className="space-y-2">
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
            className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm placeholder:text-slate-400"
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
              <X size={16} className="text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* ======================================================
          SUGGESTIONS
      ====================================================== */}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-[100] left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.placeId}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition flex items-start gap-3 border-b border-slate-100 last:border-b-0"
            >
              <div className="mt-1 shrink-0">
                <MapPin size={18} className="text-blue-500" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {suggestion.name}
                </p>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {suggestion.address}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ======================================================
          NO RESULTS
      ====================================================== */}

      {showSuggestions &&
        !loading &&
        value.trim().length >= 2 &&
        suggestions.length === 0 && (
          <div className="absolute z-[100] left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl px-4 py-4">
            <p className="text-sm text-slate-500">No locations found.</p>
          </div>
        )}
    </div>
  );
};

// ============================================================
// HERO
// ============================================================

export const Hero = () => {
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

  // ==========================================================
  // SEARCH ROUTE
  // ==========================================================

  const handleSearch = async () => {
    // --------------------------------------------------------
    // SOURCE VALIDATION
    // --------------------------------------------------------

    if (!sourceLocation) {
      alert("Please select a starting location from the suggestions.");
      return;
    }

    // --------------------------------------------------------
    // DESTINATION VALIDATION
    // --------------------------------------------------------

    if (!destinationLocation) {
      alert("Please select a destination from the suggestions.");
      return;
    }

    // --------------------------------------------------------
    // DATE VALIDATION
    // --------------------------------------------------------

    if (!date) {
      alert("Please select your journey date.");
      return;
    }

    // --------------------------------------------------------
    // TRAVELLER VALIDATION
    // --------------------------------------------------------

    const travellerCount = Number(travellers);

    if (!Number.isInteger(travellerCount) || travellerCount < 1) {
      alert("Please enter at least 1 traveller.");
      return;
    }

    try {
      setSearching(true);

      // ======================================================
      // FINAL SEARCH DATA
      // ======================================================

      const searchData: RouteSearchData = {
        source: {
          placeId: sourceLocation.placeId,
          name: sourceLocation.name,
          address: sourceLocation.address,
          latitude: sourceLocation.latitude,
          longitude: sourceLocation.longitude,
        },

        destination: {
          placeId: destinationLocation.placeId,
          name: destinationLocation.name,
          address: destinationLocation.address,
          latitude: destinationLocation.latitude,
          longitude: destinationLocation.longitude,
        },

        date,
        travellers: travellerCount,
      };

      // ======================================================
      // DEBUG
      // ======================================================

      console.log("====================================");
      console.log("REAL ROUTE SEARCH", searchData);
      console.log("SOURCE:", sourceLocation);
      console.log("DESTINATION:", destinationLocation);
      console.log("====================================");

      // ======================================================
      // SAVE SEARCH DATA
      // ======================================================

      sessionStorage.setItem(
        "gojitrip_route_search",
        JSON.stringify(searchData),
      );

      // ======================================================
      // NOTIFY COMPLETE ROUTE ANALYSIS
      // ======================================================

      window.dispatchEvent(
        new CustomEvent("gojitrip:route-search", {
          detail: searchData,
        }),
      );

      // ======================================================
      // SCROLL TO COMPLETE ROUTE ANALYSIS
      // ======================================================

      setTimeout(() => {
        const analysisSection = document.getElementById(
          "complete-route-analysis",
        );

        if (analysisSection) {
          analysisSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);

      // ======================================================
      // FUTURE BACKEND API
      // ======================================================
      //
      // Jab actual NestJS route planning endpoint ready ho:
      //
      // const result = await apiRequest("/trips/plan", {
      //   method: "POST",
      //   body: searchData,
      // });
      //
      // Phir result me actual route stops receive karke
      // CompleteRouteAnalysis ko pass kiya ja sakta hai.
      //
      // ======================================================
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
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1]">
              Plan Smarter.
              <br />
              <span className="text-blue-600">Travel Better.</span>
              <br />
              GojiTrip.
            </h1>

            <p className="text-base md:text-xl text-slate-600 max-w-lg">
              AI-powered route planning, real-time insights, and everything you
              need for a perfect journey.
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                {
                  icon: Navigation,
                  label: "AI Route Planner",
                },
                {
                  icon: Sparkles,
                  label: "Real-time Updates",
                },
                {
                  icon: BrainCircuit,
                  label: "Smart Recommendations",
                },
              ].map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full text-slate-700 font-medium text-sm shadow-sm"
                  >
                    <Icon size={16} className="text-blue-600" />

                    {feature.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ==================================================
              RIGHT SEARCH CARD
          ================================================== */}

          <div className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
            <div className="bg-white/90 backdrop-blur-xl border border-white/50 p-6 md:p-8 rounded-3xl shadow-2xl shadow-black/10">
              {/* SOURCE */}

              <div className="mb-4">
                <LocationInput
                  label="Source"
                  placeholder="Enter starting location"
                  value={source}
                  selectedLocation={sourceLocation}
                  iconColor="text-blue-500"
                  onChange={setSource}
                  onSelect={setSourceLocation}
                  onClear={() => setSourceLocation(null)}
                />
              </div>

              {/* DESTINATION */}

              <div className="mb-4">
                <LocationInput
                  label="Destination"
                  placeholder="Enter destination"
                  value={destination}
                  selectedLocation={destinationLocation}
                  iconColor="text-red-500"
                  onChange={setDestination}
                  onSelect={setDestinationLocation}
                  onClear={() => setDestinationLocation(null)}
                />
              </div>

              {/* DATE + TRAVELLERS */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* DATE */}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
                    Date of Journey
                  </label>

                  <div className="relative flex items-center">
                    <Calendar
                      className="absolute left-4 text-blue-500"
                      size={18}
                    />

                    <input
                      type="date"
                      min={today}
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                    />
                  </div>
                </div>

                {/* TRAVELLERS */}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
                    No. of Travellers
                  </label>

                  <div className="relative flex items-center">
                    <Users
                      className="absolute left-4 text-blue-500"
                      size={18}
                    />

                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="1 Traveller"
                      value={travellers}
                      onChange={(event) => setTravellers(event.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* SEARCH BUTTON */}

              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base transition shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                {searching ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Search Route
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
