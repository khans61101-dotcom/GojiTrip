"use client";

import "@/styles/pages/fuel-station/fuel-station.css";
import React from "react";
import { SafeImage } from "@/components/common/SafeImage";

interface FuelStation {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  location: string;
  price: number;
  fuelTypes: string[];
  amenities: string[];
  hours: string;
}

const FuelStationPage = () => {
  const [loading, setLoading] = React.useState(true);
  const [stations, setStations] = React.useState<FuelStation[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");

  const [fuelTypeFilter, setFuelTypeFilter] = React.useState("");
  const [amenityFilter, setAmenityFilter] = React.useState("");

  // =====================================================
  // MOCK DATA
  // IMPORTANT: Images are direct URLs, not Markdown links
  // =====================================================

  const mockStations: FuelStation[] = [
    {
      id: "1",
      name: "Highway Fuel Stop",
      description:
        "Full-service fuel station with convenience store and essential travel facilities.",
      image: "https://picsum.photos/seed/fuel1/400/300",
      rating: 4.5,
      location: "Highway 101",
      price: 3.45,
      fuelTypes: ["Gasoline", "Diesel", "Premium"],
      amenities: ["Store", "Restrooms", "Car Wash"],
      hours: "24/7",
    },
    {
      id: "2",
      name: "Green Energy Station",
      description:
        "Eco-friendly station with electric charging, biofuel and modern traveler facilities.",
      image: "https://picsum.photos/seed/fuel2/400/300",
      rating: 4.7,
      location: "Downtown",
      price: 3.89,
      fuelTypes: ["Electric", "Biofuel", "Premium"],
      amenities: ["Charging", "Cafe", "WiFi"],
      hours: "6 AM - 11 PM",
    },
    {
      id: "3",
      name: "Mountain Highway Fuel",
      description:
        "Convenient fuel stop for travelers heading toward mountain destinations.",
      image: "https://picsum.photos/seed/fuel3/400/300",
      rating: 4.6,
      location: "Mountain Highway",
      price: 3.59,
      fuelTypes: ["Gasoline", "Diesel"],
      amenities: ["Store", "Restrooms"],
      hours: "24/7",
    },
    {
      id: "4",
      name: "City Express Fuel",
      description:
        "Modern fuel station located near the city center with quick service.",
      image: "https://picsum.photos/seed/fuel4/400/300",
      rating: 4.4,
      location: "City Center",
      price: 3.72,
      fuelTypes: ["Gasoline", "Premium"],
      amenities: ["Store", "Cafe", "WiFi"],
      hours: "5 AM - 12 AM",
    },
    {
      id: "5",
      name: "Eco Charge Hub",
      description:
        "Electric vehicle charging hub with comfortable waiting and refreshment facilities.",
      image: "https://picsum.photos/seed/fuel5/400/300",
      rating: 4.8,
      location: "Green Valley",
      price: 2.95,
      fuelTypes: ["Electric", "Biofuel"],
      amenities: ["Charging", "Cafe", "WiFi"],
      hours: "24/7",
    },
    {
      id: "6",
      name: "Travelers Fuel Point",
      description:
        "Large roadside fuel station with restrooms, food and vehicle services.",
      image: "https://picsum.photos/seed/fuel6/400/300",
      rating: 4.6,
      location: "National Highway",
      price: 3.49,
      fuelTypes: ["Gasoline", "Diesel", "Premium"],
      amenities: ["Store", "Restrooms", "Car Wash", "Cafe"],
      hours: "24/7",
    },
  ];

  // =====================================================
  // LOAD DATA
  // =====================================================

  React.useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setStations(mockStations);
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // =====================================================
  // FILTER + SEARCH
  // =====================================================

  const filteredStations = React.useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return stations.filter((item) => {
      // Search
      const matchesSearch =
        !query ||
        (item.name || "").toLowerCase().includes(query) ||
        (item.location || "").toLowerCase().includes(query) ||
        (item.description || "").toLowerCase().includes(query) ||
        (item.fuelTypes || []).some((fuel) =>
          fuel.toLowerCase().includes(query),
        ) ||
        (item.amenities || []).some((amenity) =>
          amenity.toLowerCase().includes(query),
        );

      // Fuel type
      const matchesFuelType =
        !fuelTypeFilter ||
        item.fuelTypes.some(
          (fuel) => fuel.toLowerCase() === fuelTypeFilter.toLowerCase(),
        );

      // Amenity
      const matchesAmenity =
        !amenityFilter ||
        item.amenities.some(
          (amenity) => amenity.toLowerCase() === amenityFilter.toLowerCase(),
        );

      return matchesSearch && matchesFuelType && matchesAmenity;
    });
  }, [stations, searchTerm, fuelTypeFilter, amenityFilter]);

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearchTerm("");
    setFuelTypeFilter("");
    setAmenityFilter("");
  };

  // =====================================================
  // LOADING SKELETON
  // =====================================================

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
        >
          <div className="h-48 bg-gray-200" />

          <div className="p-5 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />

            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded-full w-16" />
              <div className="h-6 bg-gray-200 rounded-full w-20" />
            </div>

            <div className="flex justify-between pt-3">
              <div className="h-7 bg-gray-200 rounded w-24" />
              <div className="h-9 bg-gray-200 rounded w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =================================================
          HERO SECTION
      ================================================= */}

      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide mb-3">
              Road Trip Essentials
            </p>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Fuel Stations
            </h1>

            <p className="text-blue-100 text-lg mb-8">
              Find fuel stations and charging points along your route.
            </p>

            {/* Search */}
            <div className="bg-white rounded-xl p-4 shadow-xl">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search stations by name or location..."
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <button
                  type="button"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Find Stations
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          FILTERS
      ================================================= */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              {/* Fuel Type */}
              <select
                value={fuelTypeFilter}
                onChange={(e) => setFuelTypeFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Fuel Types</option>
                <option value="gasoline">Gasoline</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="premium">Premium</option>
                <option value="biofuel">Biofuel</option>
              </select>

              {/* Amenities */}
              <select
                value={amenityFilter}
                onChange={(e) => setAmenityFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Amenities</option>
                <option value="store">Store</option>
                <option value="restrooms">Restrooms</option>
                <option value="car wash">Car Wash</option>
                <option value="charging">Charging</option>
                <option value="cafe">Cafe</option>
                <option value="wifi">WiFi</option>
              </select>

              {/* Clear */}
              {(searchTerm || fuelTypeFilter || amenityFilter) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="text-sm text-gray-600 whitespace-nowrap">
              <span className="font-semibold text-gray-900">
                {filteredStations.length}
              </span>{" "}
              {filteredStations.length === 1
                ? "station found"
                : "stations found"}
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          STATIONS GRID
      ================================================= */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <LoadingSkeleton />
        ) : filteredStations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm text-center py-16 px-6">
            <div className="text-6xl mb-4">⛽</div>

            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              No Fuel Stations Found
            </h3>

            <p className="text-gray-500 mb-6">
              Try adjusting your search or filters to find stations.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStations.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                {/* Image */}
                <div className="relative w-full h-52 bg-gray-100">
                  <SafeImage
                    src={item.image}
                    alt={item.name || "Fuel station"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Rating */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                    <span className="flex items-center gap-1 text-yellow-500 font-semibold text-sm">
                      ⭐ {item.rating}
                    </span>
                  </div>

                  {/* Open Badge */}
                  <div className="absolute bottom-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Open {item.hours}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.name}
                    </h3>
                  </div>

                  {/* Location */}
                  <p className="text-gray-600 text-sm mb-3 flex items-center gap-1">
                    <span>📍</span>
                    {item.location}
                  </p>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Fuel Types */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.fuelTypes.slice(0, 3).map((fuel) => (
                      <span
                        key={`${item.id}-${fuel}`}
                        className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full"
                      >
                        {fuel}
                      </span>
                    ))}
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={`${item.id}-${amenity}`}
                        className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  {/* Bottom */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-xl font-bold text-blue-600">
                        ${item.price}
                      </span>

                      <span className="text-gray-500 text-sm">/gal</span>
                    </div>

                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Directions
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default FuelStationPage;
