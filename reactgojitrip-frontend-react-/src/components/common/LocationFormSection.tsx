"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Globe,
  Compass,
  Home,
  Edit3,
  ListFilter,
  Navigation,
  Crosshair,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  COUNTRIES,
  getStatesForCountry,
  getCitiesForState,
  findMatchingState,
  findMatchingCity,
} from "@/lib/location-data";
import { lookupSingleCoordinate } from "@/components/common/InteractiveMap";

declare global {
  interface Window {
    L: any;
  }
}

interface LocationFormSectionProps {
  country?: string;
  state?: string;
  city?: string;
  fullAddress?: string;
  locationString?: string;
  latitude?: number;
  longitude?: number;
  onChange: (locationData: {
    country: string;
    state: string;
    city: string;
    fullAddress: string;
    combinedLocation: string;
    latitude?: number;
    longitude?: number;
  }) => void;
  dark?: boolean;
}

export const LocationFormSection: React.FC<LocationFormSectionProps> = ({
  country: initialCountry,
  state: initialState,
  city: initialCity,
  fullAddress: initialFullAddress,
  locationString = "",
  latitude: initialLat,
  longitude: initialLng,
  onChange,
  dark = true,
}) => {
  // Parse location helper with smart Country recognition
  const parseLocation = (
    locStr: string,
    cProp?: string,
    sProp?: string,
    ctProp?: string,
    faProp?: string
  ) => {
    if (cProp || ctProp) {
      return {
        country: cProp || "Nepal",
        state: sProp || "",
        city: ctProp || "",
        fullAddress: faProp || "",
      };
    }

    if (
      !locStr ||
      locStr.trim() === "" ||
      locStr === "N/A" ||
      locStr === "Location not specified"
    ) {
      return { country: "Nepal", state: "", city: "", fullAddress: "" };
    }

    const parts = locStr.split("-");
    const addressPart = parts.length > 1 ? parts.slice(1).join("-").trim() : "";
    const cityStateCountryParts = parts[0]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let country = "Nepal";
    let state = "";
    let city = "";

    const knownCountriesLower = [
      "nepal",
      "india",
      "bhutan",
      "united states",
      "united kingdom",
      "australia",
      "canada",
      "germany",
      "japan",
      "other",
    ];

    let countryIdx = -1;
    cityStateCountryParts.forEach((part, idx) => {
      if (knownCountriesLower.includes(part.toLowerCase())) {
        countryIdx = idx;
      }
    });

    if (countryIdx !== -1) {
      country = cityStateCountryParts[countryIdx];
      const remaining = cityStateCountryParts.filter(
        (_, idx) => idx !== countryIdx
      );
      if (remaining.length >= 2) {
        city = remaining[0];
        state = remaining[1];
      } else if (remaining.length === 1) {
        city = remaining[0];
      }
    } else {
      if (cityStateCountryParts.length >= 3) {
        city = cityStateCountryParts[0];
        state = cityStateCountryParts[1];
        country = cityStateCountryParts[2];
      } else if (cityStateCountryParts.length === 2) {
        city = cityStateCountryParts[0];
        country = cityStateCountryParts[1];
      } else if (cityStateCountryParts.length === 1) {
        city = cityStateCountryParts[0];
      }
    }

    return {
      country: country || "Nepal",
      state,
      city,
      fullAddress: addressPart,
    };
  };

  const parsed = parseLocation(
    locationString,
    initialCountry,
    initialState,
    initialCity,
    initialFullAddress
  );

  const [country, setCountry] = useState<string>(parsed.country);
  const [state, setState] = useState<string>(parsed.state);
  const [city, setCity] = useState<string>(parsed.city);
  const [fullAddress, setFullAddress] = useState<string>(parsed.fullAddress);

  // Map & Pin States
  const [markerCoords, setMarkerCoords] = useState<{ lat: number; lng: number } | null>(() => {
    if (initialLat && initialLng && !isNaN(Number(initialLat)) && !isNaN(Number(initialLng))) {
      return { lat: Number(initialLat), lng: Number(initialLng) };
    }
    const found = lookupSingleCoordinate(parsed.city || parsed.state || parsed.country);
    return found || { lat: 28.2096, lng: 83.9856 }; // Default to Pokhara, Nepal
  });

  const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);
  const [lastAutoFilledAddress, setLastAutoFilledAddress] = useState<string | null>(null);

  // Flags for whether State or City are in manual text input mode vs dropdown mode
  const [isCustomState, setIsCustomState] = useState<boolean>(() => {
    if (!parsed.state) return false;
    const matched = findMatchingState(parsed.country, parsed.state);
    return !matched;
  });

  const [isCustomCity, setIsCustomCity] = useState<boolean>(() => {
    if (!parsed.city) return false;
    const matched = findMatchingCity(parsed.country, parsed.state, parsed.city);
    return !matched;
  });

  const lastLocationStringRef = useRef<string>(locationString);

  // Available states for selected country
  const availableStates = getStatesForCountry(country);

  // Available cities for selected country & state
  const availableCities = getCitiesForState(country, state);

  // Map references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Helper to emit changes up to parent
  const emitChange = useCallback((
    c: string,
    s: string,
    ct: string,
    fa: string,
    lat?: number,
    lng?: number
  ) => {
    const combined =
      [ct.trim(), s.trim(), c.trim()].filter(Boolean).join(", ") +
      (fa && fa.trim() ? ` - ${fa.trim()}` : "");

    lastLocationStringRef.current = combined;
    onChange({
      country: c,
      state: s,
      city: ct,
      fullAddress: fa,
      combinedLocation: combined,
      latitude: lat ?? markerCoords?.lat,
      longitude: lng ?? markerCoords?.lng,
    });
  }, [markerCoords, onChange]);

  // Dynamically load Leaflet script & stylesheet
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.L) {
      setMapLoaded(true);
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
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Update pin and reverse geocode clicked location
  const updatePinAndReverseGeocode = useCallback(
    async (lat: number, lng: number, autoFill = true) => {
      setMarkerCoords({ lat, lng });

      if (mapInstanceRef.current && window.L) {
        const L = window.L;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(
            mapInstanceRef.current
          );

          markerRef.current.on("dragend", (event: any) => {
            const pos = event.target.getLatLng();
            updatePinAndReverseGeocode(pos.lat, pos.lng, true);
          });
        }
      }

      if (!autoFill) {
        emitChange(country, state, city, fullAddress, lat, lng);
        return;
      }

      setIsReverseGeocoding(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );

        if (response.ok) {
          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;

            // Extract street / area details
            const streetParts = [
              addr.house_number,
              addr.building,
              addr.road || addr.pedestrian || addr.footway || addr.street,
              addr.neighbourhood || addr.suburb || addr.hamlet || addr.village,
              addr.commercial || addr.industrial,
            ].filter(Boolean);

            let detectedFullAddress = streetParts.length > 0 ? streetParts.join(", ") : "";

            if (!detectedFullAddress && data.display_name) {
              detectedFullAddress = data.display_name.split(",").slice(0, 2).join(", ").trim();
            }

            if (detectedFullAddress) {
              setFullAddress(detectedFullAddress);
              setLastAutoFilledAddress(detectedFullAddress);
            }

            // Detect Country
            let nextCountry = country;
            if (addr.country) {
              const matchedC = COUNTRIES.find(
                (c) => c.toLowerCase() === addr.country.toLowerCase()
              );
              if (matchedC) nextCountry = matchedC;
            }

            // Detect State
            let nextState = state;
            if (!nextState && addr.state) {
              const matchedS = findMatchingState(nextCountry, addr.state);
              nextState = matchedS || addr.state;
            }

            // Detect City
            let nextCity = city;
            const detectedCity =
              addr.city || addr.town || addr.municipality || addr.district || addr.county;
            if (!nextCity && detectedCity) {
              const matchedCt = findMatchingCity(nextCountry, nextState, detectedCity);
              nextCity = matchedCt || detectedCity;
            }

            if (nextCountry !== country) setCountry(nextCountry);
            if (nextState !== state) setState(nextState);
            if (nextCity !== city) setCity(nextCity);

            const finalAddr = detectedFullAddress || fullAddress;
            emitChange(nextCountry, nextState, nextCity, finalAddr, lat, lng);

            if (markerRef.current) {
              markerRef.current
                .bindPopup(
                  `
                <div style="font-size: 11px; font-weight: bold; color: #1e293b; padding: 2px;">
                  📍 <strong>${finalAddr || "Selected Location"}</strong>
                  <div style="font-size: 9px; color: #64748b; margin-top: 2px;">
                    ${[nextCity, nextState, nextCountry].filter(Boolean).join(", ")}
                  </div>
                  <div style="font-size: 9px; color: #10b981; font-weight: 700; margin-top: 3px;">
                    ✓ Full address auto-filled
                  </div>
                </div>
              `
                )
                .openPopup();
            }
          }
        }
      } catch (err) {
        console.warn("Reverse geocode lookup warning:", err);
        const fallbackAddr = `Location Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        setFullAddress(fallbackAddr);
        emitChange(country, state, city, fallbackAddr, lat, lng);
      } finally {
        setIsReverseGeocoding(false);
      }
    },
    [country, state, city, fullAddress, emitChange]
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !window.L) return;

    const L = window.L;

    if (!mapInstanceRef.current) {
      const initialLat = markerCoords?.lat || 28.2096;
      const initialLng = markerCoords?.lng || 83.9856;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Create initial marker
      const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        updatePinAndReverseGeocode(pos.lat, pos.lng, true);
      });
      markerRef.current = marker;

      // Handle map click
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        updatePinAndReverseGeocode(lat, lng, true);
      });

      mapInstanceRef.current = map;

      // Invalidate size once rendered inside modal
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  }, [mapLoaded, markerCoords, updatePinAndReverseGeocode]);

  // Pan Map to selected City / State / Country
  const panMapToLocation = useCallback((cName: string, sName: string, ctName: string) => {
    if (!mapInstanceRef.current || !window.L) return;

    const map = mapInstanceRef.current;
    const query = [ctName, sName, cName].filter(Boolean).join(", ");
    const directCoords = lookupSingleCoordinate(ctName || sName || cName);

    if (directCoords) {
      const zoom = ctName ? 12 : sName ? 8 : 6;
      map.flyTo([directCoords.lat, directCoords.lng], zoom, { duration: 1.2 });
      if (markerRef.current) {
        markerRef.current.setLatLng([directCoords.lat, directCoords.lng]);
      }
      setMarkerCoords(directCoords);
      return;
    }

    // Optional geocoding fallback
    if (query) {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`
      )
        .then((res) => (res.ok ? res.json() : []))
        .then((results) => {
          if (results && results.length > 0) {
            const lat = parseFloat(results[0].lat);
            const lng = parseFloat(results[0].lon);
            const zoom = ctName ? 13 : sName ? 8 : 6;
            map.flyTo([lat, lng], zoom, { duration: 1.2 });
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            }
            setMarkerCoords({ lat, lng });
          }
        })
        .catch(() => null);
    }
  }, []);

  // Re-sync state when opening edit modal for a different record
  useEffect(() => {
    if (
      locationString !== lastLocationStringRef.current ||
      initialCountry ||
      initialCity
    ) {
      lastLocationStringRef.current = locationString;
      const res = parseLocation(
        locationString,
        initialCountry,
        initialState,
        initialCity,
        initialFullAddress
      );
      setCountry(res.country);

      // Check if state is recognized
      const matchedState = findMatchingState(res.country, res.state);
      const finalState = matchedState || res.state;
      setState(finalState);
      setIsCustomState(Boolean(res.state && !matchedState));

      // Check if city is recognized
      const matchedCity = findMatchingCity(res.country, finalState, res.city);
      const finalCity = matchedCity || res.city;
      setCity(finalCity);
      setIsCustomCity(Boolean(res.city && !matchedCity));

      setFullAddress(res.fullAddress);

      // Pan map to new record
      if (initialLat && initialLng && !isNaN(Number(initialLat)) && !isNaN(Number(initialLng))) {
        const lat = Number(initialLat);
        const lng = Number(initialLng);
        setMarkerCoords({ lat, lng });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1.0 });
          if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        }
      } else {
        panMapToLocation(res.country, finalState, finalCity);
      }
    }
  }, [
    locationString,
    initialCountry,
    initialState,
    initialCity,
    initialFullAddress,
    initialLat,
    initialLng,
    panMapToLocation,
  ]);

  // Handle Country Change
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const newStates = getStatesForCountry(newCountry);

    let nextState = "";
    let nextIsCustomState = false;
    let nextCity = "";
    let nextIsCustomCity = false;

    if (newStates.length === 0) {
      nextIsCustomState = true;
      nextIsCustomCity = true;
    } else {
      const matched = findMatchingState(newCountry, state);
      if (matched) {
        nextState = matched;
        nextIsCustomState = false;
        const newCities = getCitiesForState(newCountry, matched);
        const matchedC = findMatchingCity(newCountry, matched, city);
        if (matchedC) {
          nextCity = matchedC;
          nextIsCustomCity = false;
        } else if (newCities.length > 0) {
          nextCity = "";
          nextIsCustomCity = false;
        } else {
          nextCity = city;
          nextIsCustomCity = true;
        }
      } else {
        nextState = "";
        nextIsCustomState = false;
        nextCity = "";
        nextIsCustomCity = false;
      }
    }

    setState(nextState);
    setIsCustomState(nextIsCustomState);
    setCity(nextCity);
    setIsCustomCity(nextIsCustomCity);

    emitChange(newCountry, nextState, nextCity, fullAddress);
    panMapToLocation(newCountry, nextState, nextCity);
  };

  // Handle State Change from Dropdown
  const handleStateSelectChange = (val: string) => {
    if (val === "__custom__") {
      setIsCustomState(true);
      setState("");
      setCity("");
      setIsCustomCity(true);
      emitChange(country, "", "", fullAddress);
      return;
    }

    setState(val);
    setIsCustomState(false);

    const newCities = getCitiesForState(country, val);
    let nextCity = "";
    if (newCities.length > 0) {
      const matchedCity = findMatchingCity(country, val, city);
      nextCity = matchedCity || "";
      setCity(nextCity);
      setIsCustomCity(false);
    } else {
      setIsCustomCity(true);
      nextCity = city;
    }

    emitChange(country, val, nextCity, fullAddress);
    panMapToLocation(country, val, nextCity);
  };

  // Handle State Change from Manual Input
  const handleStateInputChange = (val: string) => {
    setState(val);
    emitChange(country, val, city, fullAddress);
  };

  // Handle City Change from Dropdown
  const handleCitySelectChange = (val: string) => {
    if (val === "__custom__") {
      setIsCustomCity(true);
      setCity("");
      emitChange(country, state, "", fullAddress);
      return;
    }

    setCity(val);
    setIsCustomCity(false);
    emitChange(country, state, val, fullAddress);
    panMapToLocation(country, state, val);
  };

  // Handle City Change from Manual Input
  const handleCityInputChange = (val: string) => {
    setCity(val);
    emitChange(country, state, val, fullAddress);
  };

  const handleFullAddressChange = (val: string) => {
    setFullAddress(val);
    emitChange(country, state, city, val);
  };

  const bgInputClass = dark
    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-emerald-500"
    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-emerald-500";

  const labelClass = dark ? "text-slate-300" : "text-slate-700";

  // Toggle button styling for dropdown vs manual input
  const toggleBtnClass =
    "text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all flex items-center space-x-1 cursor-pointer " +
    (dark
      ? "bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700 hover:border-emerald-500/50"
      : "bg-slate-100 hover:bg-slate-200 text-emerald-600 border-slate-300");

  return (
    <div
      className={`p-4 rounded-2xl border space-y-3.5 ${
        dark ? "bg-slate-955/60 border-slate-800" : "bg-slate-50 border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between border-b pb-2.5 border-slate-800/80">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span
            className={`font-extrabold text-xs uppercase tracking-wider ${labelClass}`}
          >
            Structured Location & Full Address Details
          </span>
        </div>
        <span className="text-[10px] font-medium text-slate-400">
          Auto-filtered Country ➔ State ➔ City ➔ Map Auto-Fill
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
        {/* 1. COUNTRY SELECT */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              className={`font-bold flex items-center space-x-1 ${labelClass}`}
            >
              <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Country *</span>
            </label>
          </div>
          <select
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border focus:outline-none font-bold ${bgInputClass}`}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c} className="bg-slate-900 text-white">
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 2. STATE / PROVINCE */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              className={`font-bold flex items-center space-x-1 ${labelClass}`}
            >
              <Compass className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>State / Province</span>
            </label>
            {availableStates.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const next = !isCustomState;
                  setIsCustomState(next);
                  if (next) {
                    setIsCustomCity(true);
                  }
                }}
                className={toggleBtnClass}
                title={
                  isCustomState
                    ? "Pick from predefined list"
                    : "Enter custom state name manually"
                }
              >
                {isCustomState ? (
                  <>
                    <ListFilter className="w-2.5 h-2.5" />
                    <span>List</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>Manual</span>
                  </>
                )}
              </button>
            )}
          </div>

          {availableStates.length > 0 && !isCustomState ? (
            <select
              value={state}
              onChange={(e) => handleStateSelectChange(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border focus:outline-none font-semibold ${bgInputClass}`}
            >
              <option value="" className="bg-slate-900 text-slate-400">
                -- Select State / Province --
              </option>
              {availableStates.map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-white">
                  {s}
                </option>
              ))}
              <option
                value="__custom__"
                className="bg-slate-900 text-amber-400 font-bold"
              >
                ✏️ + Enter Custom State...
              </option>
            </select>
          ) : (
            <input
              type="text"
              placeholder={
                availableStates.length > 0
                  ? "Enter custom state name"
                  : "e.g. Gandaki / Madhya Pradesh"
              }
              value={state}
              onChange={(e) => handleStateInputChange(e.target.value)}
              onBlur={() => panMapToLocation(country, state, city)}
              className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${bgInputClass}`}
            />
          )}
        </div>

        {/* 3. CITY / DISTRICT */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              className={`font-bold flex items-center space-x-1 ${labelClass}`}
            >
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>City / District *</span>
            </label>
            {availableCities.length > 0 && !isCustomState && (
              <button
                type="button"
                onClick={() => setIsCustomCity(!isCustomCity)}
                className={toggleBtnClass}
                title={
                  isCustomCity
                    ? "Pick from predefined city list"
                    : "Enter custom city name manually"
                }
              >
                {isCustomCity ? (
                  <>
                    <ListFilter className="w-2.5 h-2.5" />
                    <span>List</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>Manual</span>
                  </>
                )}
              </button>
            )}
          </div>

          {availableCities.length > 0 && !isCustomState && !isCustomCity ? (
            <select
              value={city}
              required
              onChange={(e) => handleCitySelectChange(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border focus:outline-none font-semibold ${bgInputClass}`}
            >
              <option value="" className="bg-slate-900 text-slate-400">
                -- Select City / District --
              </option>
              {availableCities.map((ct) => (
                <option key={ct} value={ct} className="bg-slate-900 text-white">
                  {ct}
                </option>
              ))}
              <option
                value="__custom__"
                className="bg-slate-900 text-amber-400 font-bold"
              >
                ✏️ + Enter Custom City...
              </option>
            </select>
          ) : (
            <input
              type="text"
              required
              placeholder={
                availableCities.length > 0
                  ? "Enter custom city name"
                  : state
                  ? `e.g. City in ${state}`
                  : "e.g. Pokhara / Kathmandu / Bhopal"
              }
              value={city}
              onChange={(e) => handleCityInputChange(e.target.value)}
              onBlur={() => panMapToLocation(country, state, city)}
              className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${bgInputClass}`}
            />
          )}
        </div>
      </div>

      {/* FULL ADDRESS (WITH AUTO-FILL BADGE) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            className={`font-bold text-xs flex items-center space-x-1 ${labelClass}`}
          >
            <Home className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Full Address / Street / Ward No. (Optional)</span>
          </label>
          {lastAutoFilledAddress && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              <span>Auto-filled from map click</span>
            </span>
          )}
        </div>
        <input
          type="text"
          placeholder="e.g. Ward No. 6, Lakeside Road, Street 14 (Click map below to auto-fill)"
          value={fullAddress}
          onChange={(e) => handleFullAddressChange(e.target.value)}
          className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${bgInputClass}`}
        />
      </div>

      {/* 4. INTERACTIVE MAP SECTION WITH AUTO-FILL ON CLICK */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span className={`text-xs font-bold ${dark ? "text-slate-200" : "text-slate-800"}`}>
              Interactive Location Map (Click on Map to Auto-Fill Address)
            </span>
            {isReverseGeocoding && (
              <span className="text-[10px] text-emerald-400 animate-pulse flex items-center gap-1 font-semibold">
                <Loader2 className="w-3 h-3 animate-spin" />
                Detecting street address...
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => panMapToLocation(country, state, city)}
            className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1 transition-all"
            title="Center map on selected location"
          >
            <Crosshair className="w-3 h-3" />
            <span>Center on {city || state || country}</span>
          </button>
        </div>

        {/* Status Info Bar */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] bg-slate-900/80 p-2 rounded-xl border border-slate-800">
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
            🌍 Country: <strong className="text-emerald-400">{country || "None"}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
            📍 State: <strong className="text-sky-400">{state || "None"}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
            🏙️ City: <strong className="text-amber-400">{city || "None"}</strong>
          </span>
          {markerCoords && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
              📌 {markerCoords.lat.toFixed(4)}, {markerCoords.lng.toFixed(4)}
            </span>
          )}
          <span className="ml-auto text-[9px] text-slate-400 hidden sm:inline">
            💡 Click on the map to pinpoint & auto-fill exact address
          </span>
        </div>

        {/* Leaflet Map Canvas */}
        <div
          ref={mapContainerRef}
          className="w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-slate-700/80 relative shadow-inner z-0"
          style={{ minHeight: "220px" }}
        />
      </div>
    </div>
  );
};

export default LocationFormSection;
