"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Globe, Compass, Home } from "lucide-react";

interface LocationFormSectionProps {
  country?: string;
  state?: string;
  city?: string;
  fullAddress?: string;
  locationString?: string;
  onChange: (locationData: {
    country: string;
    state: string;
    city: string;
    fullAddress: string;
    combinedLocation: string;
  }) => void;
  dark?: boolean;
}

const COUNTRIES = [
  "Nepal",
  "India",
  "Bhutan",
  "United States",
  "United Kingdom",
  "Australia",
  "Canada",
  "Germany",
  "Japan",
  "Other",
];

export const LocationFormSection: React.FC<LocationFormSectionProps> = ({
  country: initialCountry,
  state: initialState,
  city: initialCity,
  fullAddress: initialFullAddress,
  locationString = "",
  onChange,
  dark = true,
}) => {
  // Parse location helper with smart Country recognition
  const parseLocation = (locStr: string, cProp?: string, sProp?: string, ctProp?: string, faProp?: string) => {
    if (cProp || ctProp) {
      return {
        country: cProp || "Nepal",
        state: sProp || "",
        city: ctProp || "",
        fullAddress: faProp || "",
      };
    }

    if (!locStr || locStr.trim() === "" || locStr === "N/A" || locStr === "Location not specified") {
      return { country: "Nepal", state: "", city: "", fullAddress: "" };
    }

    const parts = locStr.split("-");
    const addressPart = parts.length > 1 ? parts.slice(1).join("-").trim() : "";
    const cityStateCountryParts = parts[0].split(",").map((s) => s.trim()).filter(Boolean);

    let country = "Nepal";
    let state = "";
    let city = "";

    const knownCountriesLower = ["nepal", "india", "bhutan", "united states", "united kingdom", "australia", "canada", "germany", "japan", "other"];
    
    let countryIdx = -1;
    cityStateCountryParts.forEach((part, idx) => {
      if (knownCountriesLower.includes(part.toLowerCase())) {
        countryIdx = idx;
      }
    });

    if (countryIdx !== -1) {
      country = cityStateCountryParts[countryIdx];
      const remaining = cityStateCountryParts.filter((_, idx) => idx !== countryIdx);
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

  const parsed = parseLocation(locationString, initialCountry, initialState, initialCity, initialFullAddress);

  const [country, setCountry] = useState<string>(parsed.country);
  const [state, setState] = useState<string>(parsed.state);
  const [city, setCity] = useState<string>(parsed.city);
  const [fullAddress, setFullAddress] = useState<string>(parsed.fullAddress);

  const lastLocationStringRef = useRef<string>(locationString);

  // Re-sync state when opening edit modal for a different record
  useEffect(() => {
    if (locationString !== lastLocationStringRef.current || initialCountry || initialCity) {
      lastLocationStringRef.current = locationString;
      const res = parseLocation(locationString, initialCountry, initialState, initialCity, initialFullAddress);
      setCountry(res.country);
      setState(res.state);
      setCity(res.city);
      setFullAddress(res.fullAddress);
    }
  }, [locationString, initialCountry, initialState, initialCity, initialFullAddress]);

  // Helper to emit changes up to parent
  const emitChange = (c: string, s: string, ct: string, fa: string) => {
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
    });
  };

  const handleCountryChange = (val: string) => {
    setCountry(val);
    emitChange(val, state, city, fullAddress);
  };

  const handleStateChange = (val: string) => {
    setState(val);
    emitChange(country, val, city, fullAddress);
  };

  const handleCityChange = (val: string) => {
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

  return (
    <div className={`p-4 rounded-2xl border space-y-3.5 ${dark ? "bg-slate-955/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
      <div className="flex items-center space-x-2 border-b pb-2.5 border-slate-800/80">
        <MapPin className="w-4 h-4 text-emerald-400" />
        <span className={`font-extrabold text-xs uppercase tracking-wider ${labelClass}`}>
          Structured Location & Full Address Details
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
        {/* COUNTRY SELECT */}
        <div>
          <label className={`block mb-1 font-bold flex items-center space-x-1 ${labelClass}`}>
            <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Country *</span>
          </label>
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

        {/* STATE / PROVINCE */}
        <div>
          <label className={`block mb-1 font-bold flex items-center space-x-1 ${labelClass}`}>
            <Compass className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>State / Province</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Gandaki / Madhya Pradesh"
            value={state}
            onChange={(e) => handleStateChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${bgInputClass}`}
          />
        </div>

        {/* CITY / DISTRICT */}
        <div>
          <label className={`block mb-1 font-bold flex items-center space-x-1 ${labelClass}`}>
            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>City / District *</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Pokhara / Kathmandu / Bhopal"
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${bgInputClass}`}
          />
        </div>
      </div>

      {/* FULL ADDRESS (OPTIONAL) */}
      <div>
        <label className={`block mb-1 font-bold text-xs flex items-center space-x-1 ${labelClass}`}>
          <Home className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>Full Address / Street / Ward No. (Optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Ward No. 6, Lakeside Road, Street 14"
          value={fullAddress}
          onChange={(e) => handleFullAddressChange(e.target.value)}
          className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${bgInputClass}`}
        />
      </div>
    </div>
  );
};
