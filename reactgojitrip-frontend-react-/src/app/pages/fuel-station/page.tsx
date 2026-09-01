// FuelStationPage.tsx - With Split-Screen Layout (Left Cards List + Right Interactive Map)
"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Fuel,
  Zap,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Phone,
  ShieldCheck,
} from "lucide-react";
import YelpDetailModal, { YelpDetailData } from "@/components/common/YelpDetailModal";
import { InteractiveMap, MapMarkerItem } from "@/components/common/InteractiveMap";
import { cmsStore } from "@/lib/cms-store";

interface FuelStation {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviews?: number;
  location: string;
  price: number;
  currency?: string;
  fuelTypes: string[];
  amenities: string[];
  hours: string;
  contact?: string;
  lat?: number;
  lng?: number;
}

const mockStations: FuelStation[] = [
  {
    id: "1",
    name: "Nepal Oil Corporation Highway Hub",
    description: "Official NOC 24/7 highway fuel station featuring Petrol, Diesel, high-speed EV chargers, and traveler rest amenities.",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviews: 54,
    location: "Prithvi Highway, Pokhara",
    price: 175,
    currency: "NRs",
    fuelTypes: ["Petrol (Euro 6)", "Diesel", "60kW DC Fast EV Charger"],
    amenities: ["24/7 Restrooms", "ATM", "Air & Water Pump", "Highway Mart", "Cafe"],
    hours: "24/7 Open",
    contact: "+977 61 520000",
    lat: 28.2096,
    lng: 83.9856,
  },
  {
    id: "2",
    name: "Himalayan Eco EV Charging Park",
    description: "Ultra-fast solar-powered electric vehicle charging station with comfortable lounge, Wi-Fi, and organic Nepalese coffee.",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviews: 42,
    location: "Lakeside Center, Pokhara",
    price: 15,
    currency: "NRs",
    fuelTypes: ["120kW Supercharger", "Type 2 AC Charger", "CCS2 Fast EV Plug"],
    amenities: ["Free High-Speed Wi-Fi", "Coffee Lounge", "Clean Washrooms", "EV Cable Rental"],
    hours: "06:00 AM - 11:00 PM",
    contact: "+977 61 460011",
    lat: 28.2120,
    lng: 83.9580,
  },
  {
    id: "3",
    name: "Kathmandu-Pokhara Highway Fuel Station",
    description: "Major highway pitstop with heavy vehicle diesel pumps, passenger car petrol bays, and vehicle wash facility.",
    image: "https://images.unsplash.com/photo-1527018601619-a508a2be00ed?auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    reviews: 31,
    location: "Mugling Junction, Highway Corridor",
    price: 175,
    currency: "NRs",
    fuelTypes: ["Petrol", "Diesel", "LPG Cylinder Refill"],
    amenities: ["Truck Parking", "24/7 Restaurant", "Mechanic Repair Bay", "Clean Restrooms"],
    hours: "24/7 Open",
    contact: "+977 56 410022",
    lat: 27.8540,
    lng: 84.5550,
  },
  {
    id: "4",
    name: "Annapurna Valley Energy & Fuel Depot",
    description: "Scenic valley fuel stop providing high altitude grade fuel, emergency towing assistance, and traveler refreshments.",
    image: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviews: 28,
    location: "Beni Highway Road, Mustang Gateway",
    price: 178,
    currency: "NRs",
    fuelTypes: ["Winterized Diesel", "High Octane Petrol"],
    amenities: ["Emergency Towing", "Hot Shower Restrooms", "Tire Inflation", "Grocery Shop"],
    hours: "05:00 AM - 09:00 PM",
    contact: "+977 69 520111",
    lat: 28.3490,
    lng: 83.5650,
  },
  {
    id: "5",
    name: "Smart Green EV Charge Hub - Kathmandu",
    description: "State-of-the-art dual port DC fast charger network hub for electric cars, SUVs, and passenger buses.",
    image: "https://images.unsplash.com/photo-1558441719-6705c67073b7?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviews: 65,
    location: "Kalanki Highway Ring Road, Kathmandu",
    price: 12,
    currency: "NRs",
    fuelTypes: ["150kW Ultra Fast DC Charger", "GB/T EV Plug", "CCS2 Plug"],
    amenities: ["24/7 Security", "Waiting Lounge", "Tea & Snacks Bar", "Free Parking"],
    hours: "24/7 Open",
    contact: "+977 1 4270088",
    lat: 27.6930,
    lng: 85.2810,
  },
];

export default function FuelStationPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const locParam = params.get("location") || params.get("search") || params.get("q") || params.get("routeStop");
    if (locParam && locParam.trim()) {
      setSearchTerm(locParam.trim());
    }
  }, []);
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [fuelTypeFilter, setFuelTypeFilter] = useState("all");
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [yelpDetailData, setYelpDetailData] = useState<YelpDetailData | null>(null);
  const [showYelpModal, setShowYelpModal] = useState(false);

  const stationListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    const storeFuel: FuelStation[] = cmsStore.getFuelStations().map((f) => {
      const amenities: string[] = [];
      if (f.hasEvFastCharger) amenities.push("EV Fast Charging");
      if (f.hasRestroom) amenities.push("24/7 Restrooms");
      if (f.hasConvenienceStore) amenities.push("Highway Mart");
      if (f.hasRepairShop) amenities.push("Repair Shop");

      const fuelTypes: string[] = [];
      if (f.stationType.includes("Petrol") || f.petrolPrice) fuelTypes.push("Petrol");
      if (f.stationType.includes("Diesel") || f.dieselPrice) fuelTypes.push("Diesel");
      if (f.stationType.includes("EV") || f.evRate) fuelTypes.push("EV Fast Charging");

      return {
        id: f.id,
        name: f.name,
        description: `${f.name} offers quality fuel, EV charging facilities, and travel services along the highway corridor.`,
        image: f.imageUrl || "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
        rating: 4.8,
        reviews: 42,
        location: f.location,
        price: f.petrolPrice || f.evRate || 175,
        currency: f.currency || "NPR",
        fuelTypes: fuelTypes.length > 0 ? fuelTypes : ["Petrol", "Diesel", "EV"],
        amenities: amenities.length > 0 ? amenities : ["24/7 Restrooms", "Air & Water Pump"],
        hours: f.openingHours || "24 Hours Open",
        contact: f.contactNumber || "+977 1 4220000",
      };
    });

    setStations(storeFuel);
    if (storeFuel.length > 0) {
      setSelectedStationId(storeFuel[0].id);
    }
    setLoading(false);
  }, []);

  const handleOpenYelpDetail = (station: FuelStation) => {
    setYelpDetailData({
      id: station.id,
      name: station.name,
      category: "Fuel & EV Charging Station",
      rating: station.rating || 4.7,
      reviewCount: station.reviews || 38,
      priceLevel: "$$",
      address: station.location,
      location: station.location,
      phone: station.contact || "+977 61 520000",
      whatsapp: "+9779801234567",
      image: station.image,
      galleryImages: [station.image],
      description: station.description || `${station.name} offers high quality fuel, fast EV charging stations, 24/7 restrooms, and refreshment options along the Nepal travel corridors.`,
      amenities: station.amenities || ["24/7 Restrooms", "Air & Water Pump", "ATM", "Highway Mart", "EV Fast Charging"],
      hours: station.hours ? [{ day: "Operating Schedule", time: station.hours }] : undefined,
      priceTag: `${station.currency || "NRs"} ${station.price} / L`,
      entityType: "hotel",
      offerings: station.fuelTypes.map((ft) => ({
        title: ft,
        price: ft.toLowerCase().includes("ev") || ft.toLowerCase().includes("charger") ? "NRs 12 - 15 / kWh" : `NRs ${station.price} / Litre`,
        desc: `Verified ${ft} dispensing unit with automatic digital meter & certified purity.`,
      })),
    });
    setShowYelpModal(true);
  };

  const filteredStations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return stations.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.fuelTypes.some((f) => f.toLowerCase().includes(query)) ||
        item.amenities.some((a) => a.toLowerCase().includes(query));

      const matchesType =
        fuelTypeFilter === "all" ||
        (fuelTypeFilter === "ev" && item.fuelTypes.some((f) => f.toLowerCase().includes("ev") || f.toLowerCase().includes("charger"))) ||
        (fuelTypeFilter === "petrol" && item.fuelTypes.some((f) => f.toLowerCase().includes("petrol") || f.toLowerCase().includes("gasoline"))) ||
        (fuelTypeFilter === "diesel" && item.fuelTypes.some((f) => f.toLowerCase().includes("diesel")));

      return matchesSearch && matchesType;
    });
  }, [stations, searchTerm, fuelTypeFilter]);

  const handleMarkerClick = (stationId: string) => {
    setSelectedStationId(stationId);
    if (stationListRef.current) {
      const cards = stationListRef.current.querySelectorAll("[data-station-id]");
      cards.forEach((card) => {
        if (card.getAttribute("data-station-id") === stationId) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
      {/* Header Bar */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex-shrink-0 shadow-lg z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 rounded-xl text-white font-medium transition-all hover:scale-105 active:scale-95 group flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline text-sm">Back</span>
            </button>

            <div className="flex-1 max-w-2xl mx-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search fuel stations & EV chargers by name, location, or fuel type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/95 text-gray-900 placeholder-gray-500 border-0 rounded-xl focus:ring-2 focus:ring-white/50 outline-none transition-all shadow-sm text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium ${
                  showFilters ? "bg-white text-blue-600" : "bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
                }`}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>

              <button
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 rounded-xl text-white font-medium transition-all hover:scale-105 text-sm"
              >
                {isMapExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                <span className="hidden sm:inline">{isMapExpanded ? "Split View" : "Expand Map"}</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="pb-3 flex gap-2 flex-wrap border-t border-white/10 pt-2.5">
            {[
              { id: "all", label: "All Stations" },
              { id: "petrol", label: "⛽ Petrol" },
              { id: "diesel", label: "🚛 Diesel" },
              { id: "ev", label: "⚡ EV Charging" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFuelTypeFilter(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  fuelTypeFilter === tab.id
                    ? "bg-white text-blue-700 shadow-md scale-105"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className={`flex-1 flex transition-all duration-300 ${isMapExpanded ? "flex-col-reverse" : "flex-row"}`}>
        {/* Left Listing Column */}
        <div
          className={`${isMapExpanded ? "h-1/2" : "w-1/2"} overflow-y-auto bg-gray-50 border-r border-gray-200`}
          style={{ height: isMapExpanded ? "50%" : "calc(100vh - 125px)" }}
          ref={stationListRef}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {loading ? "Loading..." : `${filteredStations.length} Fuel & EV Stations Found`}
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-36 bg-gray-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredStations.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <Fuel className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800 text-sm">No Stations Found</h3>
                <p className="text-xs text-slate-500 mt-1">Try clearing your filters or changing search query.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredStations.map((station) => {
                  const isSelected = selectedStationId === station.id;
                  const isEV = station.fuelTypes.some((f) => f.toLowerCase().includes("ev") || f.toLowerCase().includes("charger"));

                  return (
                    <div
                      key={station.id}
                      data-station-id={station.id}
                      className={`bg-white rounded-2xl border transition-all cursor-pointer hover:shadow-md group ${
                        isSelected ? "border-blue-500 ring-2 ring-blue-500/30 shadow-md" : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() => {
                        setSelectedStationId(station.id);
                        handleMarkerClick(station.id);
                        handleOpenYelpDetail(station);
                      }}
                    >
                      <div className="flex flex-col sm:flex-row gap-3.5 p-3.5">
                        <div className="flex-shrink-0 w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-gray-100 relative">
                          <img
                            src={station.image}
                            alt={station.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/logo/gojitriplogo.jpg";
                            }}
                          />
                          <span className={`absolute top-2 left-2 px-2 py-0.5 backdrop-blur-md rounded-md text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 ${isEV ? "bg-emerald-600/90" : "bg-blue-600/90"}`}>
                            {isEV ? <Zap className="h-3 w-3" /> : <Fuel className="h-3 w-3" />}
                            {isEV ? "EV STATION" : "FUEL STATION"}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="text-base font-extrabold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                {station.name}
                              </h3>
                              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full flex-shrink-0">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                                <span className="text-xs font-extrabold text-amber-900">{station.rating}</span>
                                <span className="text-[10px] text-slate-500">({station.reviews || 38})</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-slate-600 text-xs mb-2 flex-wrap">
                              <div className="flex items-center gap-1 font-medium">
                                <MapPin className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                <span className="truncate">{station.location}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-500">
                                <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                <span>{station.hours}</span>
                              </div>
                            </div>

                            {/* Fuel Types Badges */}
                            <div className="flex gap-1.5 flex-wrap mb-1">
                              {station.fuelTypes.map((type, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold border border-blue-200/60">
                                  {type}
                                </span>
                              ))}
                            </div>

                            {/* Amenities List */}
                            <div className="flex gap-1 flex-wrap">
                              {station.amenities.slice(0, 3).map((amenity, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <div>
                              <span className="text-base font-extrabold text-slate-900">
                                {station.currency || "NRs"} {station.price}
                              </span>
                              <span className="text-slate-500 text-xs ml-1">{isEV ? "/ kWh" : "/ Litre"}</span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenYelpDetail(station);
                              }}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:scale-105 active:scale-95"
                            >
                              View Details →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Map Column */}
        <div
          className={`${isMapExpanded ? "h-1/2" : "w-1/2"} bg-gray-100 p-3`}
          style={{ height: isMapExpanded ? "50%" : "calc(100vh - 125px)" }}
        >
          <InteractiveMap
            items={filteredStations.map((s) => ({
              id: s.id,
              name: s.name,
              location: s.location,
              priceTag: `${s.currency || "NRs"} ${s.price}`,
              rating: s.rating,
              image: s.image,
              lat: s.lat,
              lng: s.lng,
              category: "place",
            }))}
            selectedId={selectedStationId}
            onMarkerClick={(id) => {
              setSelectedStationId(id);
              handleMarkerClick(id);
            }}
            center={{ lat: 28.2096, lng: 83.9856 }}
          />
        </div>
      </div>

      {/* Yelp Business Detail Modal */}
      <YelpDetailModal
        isOpen={showYelpModal}
        onClose={() => setShowYelpModal(false)}
        data={yelpDetailData}
      />
    </div>
  );
}
