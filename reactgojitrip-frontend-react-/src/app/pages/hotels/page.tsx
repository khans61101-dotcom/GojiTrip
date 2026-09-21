// HotelsPage.tsx - With Google Places Integration
import "@/styles/pages/hotels/hotels.css";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  MapPin,
  ChevronDown,
  X,
  Calendar,
  Users,
  CreditCard,
  Wind,
  Snowflake,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Home,
  Hotel as HotelIcon,
  Globe,
} from "lucide-react";
import { listHotels, getHotelRooms, RoomType } from "@/lib/api";
import { cmsStore } from "@/lib/cms-store";
import YelpDetailModal, { YelpDetailData } from "@/components/common/YelpDetailModal";
import { InteractiveMap, MapMarkerItem } from "@/components/common/InteractiveMap";

// ============= GOOGLE PLACES HELPERS =============
const GOOGLE_API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  "YOUR_GOOGLE_MAPS_API_KEY";

let _placesService: any = null;
let _scriptPromise: Promise<void> | null = null;

const loadGooglePlacesScript = (): Promise<void> => {
  if (_scriptPromise) return _scriptPromise;

  _scriptPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if ((window as any).google?.maps?.places) return resolve();

    const existing = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Google Maps load failed"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps load failed"));
    document.head.appendChild(script);
  });

  return _scriptPromise;
};

const getPlacesService = (): any => {
  if (_placesService) return _placesService;
  const dummy = document.createElement("div");
  _placesService = new (window as any).google.maps.places.PlacesService(dummy);
  return _placesService;
};

// ============= TYPES =============
interface Hotel {
  id: string;
  name: string;
  description: string;
  image: string;
  hotelPhotos?: string[];
  photos?: string[];
  rating: number;
  reviews: number;
  location: string;
  pricePerNight: number;
  currency: string;
  amenities: string[];
  distance: string;
  available: boolean;
  gpsCoordinates?: string;
  lat?: number;
  lng?: number;
  contact?: string;
  status?: "draft" | "under-review" | "approved" | "published";
  roomTypes?: RoomType[];
  propertyType?: string;
  source?: "cms" | "api" | "google";
  placeId?: string;
  googleRating?: number;
  contactPerson?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  checkInTime?: string;
  checkOutTime?: string;
  availabilityStatus?: string;
  partnerStatus?: string;
}

interface FilterState {
  priceRange: [number, number];
  rating: number;
  amenities: string[];
  distance: string;
  sortBy: string;
  roomType: "all" | "AC" | "Non-AC";
}

interface BookingData {
  hotelId: string;
  hotelName: string;
  roomType: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  isAC: boolean;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

// ============= BOOKING MODAL =============
const BookingModal: React.FC<{
  hotel: Hotel;
  onClose: () => void;
  onBook: (data: BookingData) => void;
}> = ({ hotel, onClose, onBook }) => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [nights, setNights] = useState(1);

  // Google hotels ke liye default room type banate hain
  const defaultRoomTypes: RoomType[] = [
    {
      id: "default-standard",
      name: "Standard Room",
      type: "Non-AC",
      pricePerNight: hotel.pricePerNight || 2500,
      capacity: 2,
      available: true,
    } as any,
    {
      id: "default-deluxe",
      name: "Deluxe Room",
      type: "AC",
      pricePerNight: Math.round((hotel.pricePerNight || 2500) * 1.4),
      capacity: 3,
      available: true,
    } as any,
  ];

  const roomTypes =
    hotel.roomTypes && hotel.roomTypes.length > 0
      ? hotel.roomTypes
      : defaultRoomTypes;

  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(
    roomTypes[0]
  );

  useEffect(() => {
    if (!selectedRoomType && roomTypes.length > 0) {
      setSelectedRoomType(roomTypes[0]);
    }
  }, [roomTypes, selectedRoomType]);

  const calculateTotal = () => {
    if (!selectedRoomType) return 0;
    return selectedRoomType.pricePerNight * nights;
  };

  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNights(diffDays || 1);
    }
  }, [checkIn, checkOut]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomType) return;

    const bookingData: BookingData = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomType: selectedRoomType.name,
      roomTypeId: selectedRoomType.id,
      checkIn,
      checkOut,
      guests,
      totalPrice: calculateTotal(),
      isAC: selectedRoomType.type === "AC",
    };
    onBook(bookingData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Book Your Stay</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
            <p className="text-sm text-gray-700 flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-gray-600" />
              {hotel.location}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">
                {hotel.rating}
              </span>
              <span className="text-gray-600 text-sm">
                ({hotel.reviews} reviews)
              </span>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Room Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roomTypes.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelectedRoomType(room)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedRoomType?.id === room.id
                        ? "border-blue-600 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300 bg-white"
                    } ${!room.available ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={!room.available}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {room.type === "AC" ? (
                        <Snowflake className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Wind className="h-4 w-4 text-orange-600" />
                      )}
                      <span className="font-semibold text-gray-900 text-sm">
                        {room.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{room.type === "AC" ? "❄️ AC" : "🌬️ Non-AC"}</span>
                      <span>•</span>
                      <span>👤 {room.capacity}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-lg font-bold text-gray-900">
                        {hotel.currency || "NRs "}
                        {room.pricePerNight}
                      </span>
                      <span className="text-xs text-gray-600">/night</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                  min={checkIn || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Guests
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none text-gray-900 bg-white"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {selectedRoomType && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  {selectedRoomType.type === "AC" ? (
                    <Snowflake className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Wind className="h-4 w-4 text-orange-600" />
                  )}
                  Room Details
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-900">Type:</span>{" "}
                    {selectedRoomType.name} ({selectedRoomType.type})
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Capacity:
                    </span>{" "}
                    Up to {selectedRoomType.capacity} guests
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-900">Price:</span>{" "}
                    {hotel.currency || "NRs "}
                    {selectedRoomType.pricePerNight}/night
                  </p>
                </div>
              </div>
            )}
            {checkIn && checkOut && selectedRoomType && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <span>
                    {selectedRoomType.pricePerNight} x {nights} nights
                  </span>
                  <span className="font-semibold text-gray-900">
                    {hotel.currency || "NRs "}
                    {selectedRoomType.pricePerNight * nights}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <span>Taxes & fees</span>
                  <span className="font-semibold text-gray-900">
                    {hotel.currency || "NRs "}
                    {(
                      selectedRoomType.pricePerNight *
                      nights *
                      0.12
                    ).toFixed(0)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>
                    {hotel.currency || "NRs "}
                    {calculateTotal() +
                      selectedRoomType.pricePerNight * nights * 0.12}
                  </span>
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={!selectedRoomType}
              className={`w-full font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                selectedRoomType
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-600 cursor-not-allowed"
              }`}
            >
              <CreditCard className="h-5 w-5" />
              {selectedRoomType
                ? `Book ${selectedRoomType.type} Room`
                : "Select Room Type"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============= SUCCESS MODAL =============
const SuccessModal: React.FC<{
  bookingData: BookingData;
  onClose: () => void;
}> = ({ bookingData, onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Booking Confirmed! 🎉
      </h2>
      <p className="text-gray-700 mb-4">
        Your stay at{" "}
        <strong className="text-gray-900">{bookingData.hotelName}</strong> has
        been booked successfully.
      </p>
      <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-1">
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-gray-900">Room Type:</span>{" "}
          {bookingData.roomType}{" "}
          {bookingData.isAC ? (
            <span className="text-blue-700 font-semibold">❄️ AC</span>
          ) : (
            <span className="text-orange-700 font-semibold">🌬️ Non-AC</span>
          )}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-gray-900">Check-in:</span>{" "}
          {new Date(bookingData.checkIn).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-gray-900">Check-out:</span>{" "}
          {new Date(bookingData.checkOut).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-gray-900">Guests:</span>{" "}
          {bookingData.guests}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-gray-900">Total:</span> NRs{" "}
          {bookingData.totalPrice}
        </p>
      </div>
      <button
        onClick={onClose}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
      >
        Done
      </button>
    </div>
  </div>
);

// ============= LOADING SKELETON =============
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="flex gap-3 p-3 bg-white rounded-xl border border-gray-200 animate-pulse"
      >
        <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="flex gap-1 mb-2">
            <div className="h-4 w-12 bg-gray-200 rounded" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>
          <div className="flex justify-between">
            <div className="h-5 w-20 bg-gray-200 rounded" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ============= EMPTY STATE =============
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="bg-gray-100 rounded-full p-6 mb-4">
      <Search className="h-12 w-12 text-gray-500" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      No Results Found
    </h3>
    <p className="text-gray-600 text-center max-w-md">{message}</p>
  </div>
);

// ============= MAIN COMPONENT =============
const HotelsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const locParam =
      params.get("location") ||
      params.get("search") ||
      params.get("q") ||
      params.get("routeStop");
    if (locParam && locParam.trim()) {
      setSearchQuery(locParam.trim());
    }

    if (location.pathname.includes("/pages/homestays")) {
      setStayTypeFilter("homestays");
    } else {
      const t = params.get("type") || params.get("category");
      if (t === "homestays" || t === "homestay") {
        setStayTypeFilter("homestays");
      }
    }
  }, [location.pathname, location.search]);

  const [stayTypeFilter, setStayTypeFilter] = useState<
    "hotels" | "homestays" | "all"
  >(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("type") || params.get("category");
      if (
        t === "homestays" ||
        t === "homestay" ||
        window.location.pathname.includes("/pages/homestays")
      ) {
        return "homestays";
      }
    }
    return "hotels";
  });

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [googleHotels, setGoogleHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [useGoogleSearch, setUseGoogleSearch] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 500],
    rating: 0,
    amenities: [],
    distance: "all",
    sortBy: "recommended",
    roomType: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [yelpDetailData, setYelpDetailData] = useState<YelpDetailData | null>(
    null
  );
  const [showYelpModal, setShowYelpModal] = useState(false);
  const hotelListRef = useRef<HTMLDivElement>(null);

  // ============= YELP DETAIL OPEN =============
  const handleOpenYelpDetail = (h: Hotel) => {
    const rawPrice = (h as any).pricePerNight || h.pricePerNight || 2500;
    const currency = (h.currency || "NRs").trim();
    const isGoogle = h.source === "google";
    const propType = (h as any).propertyType || (h.name.toLowerCase().includes("homestay") ? "Homestay" : "Hotel");
    const isHomestay = propType.toLowerCase() === "homestay" || h.name.toLowerCase().includes("homestay");

    // Retrieve room types list
    const rawRT = (h as any).roomTypes || (h as any).room_types;
    let roomTypesList: any[] = [];
    if (Array.isArray(rawRT)) {
      roomTypesList = rawRT;
    } else if (typeof rawRT === "string" && (rawRT as string).trim()) {
      try { roomTypesList = JSON.parse(rawRT); } catch (e) {}
    }

    let offerings: any[] = [];
    if (roomTypesList.length > 0) {
      offerings = roomTypesList.map((rt: any) => {
        const title = rt.typeName || rt.name || rt.type || (isHomestay ? "Host Bedroom" : "Deluxe Room");
        const rate = Number(rt.ratePerNight || rt.pricePerNight || rt.price) || rawPrice;
        const cap = Number(rt.capacity || rt.maxGuests) || 2;
        const bed = rt.bedType || (cap > 2 ? "2 Double Beds" : "1 Double Bed");
        const facs = Array.isArray(rt.facilities) && rt.facilities.length > 0
          ? rt.facilities.join(" • ")
          : typeof rt.facilities === "string" && rt.facilities.trim()
          ? rt.facilities
          : "Attached Bathroom • Mountain View • Hot Shower";
        const img = rt.imageUrl || (Array.isArray(rt.photos) && rt.photos[0]) || h.image;

        return {
          title,
          price: `${currency} ${rate.toLocaleString()} / night`,
          desc: `Capacity: ${cap} ${cap === 1 ? "Guest" : "Guests"} • Bed: ${bed} • ${facs}`,
          image: img,
          ratePerNight: rate,
          capacity: cap,
          bedType: bed,
          facilities: Array.isArray(rt.facilities) ? rt.facilities : [],
        };
      });
    } else {
      // Fallback room options
      offerings = [
        {
          title: isHomestay ? "Traditional Host Wooden Room" : (isGoogle ? "Standard Room" : "Deluxe Mountain View Room"),
          price: `${currency} ${rawPrice.toLocaleString()} / night`,
          desc: isHomestay
            ? "Capacity: 2 Guests • 1 Double Bed • Homemade Hearth Dining, Organic Meals & Solar Hot Shower"
            : "Capacity: 2 Guests • 1 King Bed • Mountain View, Ensuite Bathroom, AC & Wi-Fi",
          image: (h as any).hotelPhotos?.[0] || h.image,
          ratePerNight: rawPrice,
          capacity: 2,
          bedType: isHomestay ? "1 Double Bed" : "1 King Bed",
          facilities: ["Attached Bathroom", "Hot Shower", "Mountain View", "Wi-Fi"],
        },
        {
          title: isHomestay ? "Family Village Cultural Room" : (isGoogle ? "Deluxe Room" : "Executive Valley Suite"),
          price: `${currency} ${Math.round(rawPrice * 1.35).toLocaleString()} / night`,
          desc: isHomestay
            ? "Capacity: 4 Guests • 2 Double Beds • Village Balcony, Local Host Hospitality & Tea Tasting"
            : "Capacity: 4 Guests • 2 Queen Beds • Private Balcony, Heating, Mini Bar & Panoramic Peaks",
          image: (h as any).hotelPhotos?.[1] || (h as any).hotelPhotos?.[0] || h.image,
          ratePerNight: Math.round(rawPrice * 1.35),
          capacity: 4,
          bedType: "2 Double Beds",
          facilities: ["Attached Bathroom", "Private Balcony", "Hot Shower", "Mountain View", "Heater"],
        },
      ];
    }

    const checkIn = (h as any).checkInTime || "12:00 PM";
    const checkOut = (h as any).checkOutTime || "10:00 AM";
    const phoneNum = (h as any).phoneNumber || (h as any).contact || "+977 1 4567890";
    const whatsappNum = (h as any).whatsappNumber || phoneNum;

    setYelpDetailData({
      id: h.id,
      name: h.name,
      category: propType,
      rating: h.rating || 4.8,
      reviewCount: h.reviews || 42,
      priceLevel: isHomestay ? "Authentic Village Rate" : "$$",
      address: h.location,
      location: h.location,
      phone: phoneNum,
      whatsapp: whatsappNum,
      contactPerson: (h as any).contactPerson,
      checkInTime: checkIn,
      checkOutTime: checkOut,
      partnerStatus: (h as any).partnerStatus || "Verified Partner",
      availabilityStatus: (h as any).availabilityStatus || "Available",
      image: h.image,
      galleryImages: (() => {
        const raw: string[] = [
          ...(Array.isArray((h as any).hotelPhotos) ? (h as any).hotelPhotos : []),
          ...(Array.isArray((h as any).photos) ? (h as any).photos : []),
          ...(h.image ? [h.image] : []),
        ];
        if (Array.isArray((h as any).roomTypes)) {
          (h as any).roomTypes.forEach((rt: any) => {
            if (rt.imageUrl) raw.push(rt.imageUrl);
            if (Array.isArray(rt.photos)) raw.push(...rt.photos);
          });
        }
        const unique = Array.from(new Set(raw.filter((img) => typeof img === "string" && img.trim().length > 0)));
        return unique.length > 0 ? unique : [h.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"];
      })(),
      description:
        (h as any).description ||
        h.description ||
        `${h.name} offers magnificent accommodation, warm hospitality, and scenic views in Nepal.`,
      amenities:
        (Array.isArray((h as any).facilities) && (h as any).facilities.length > 0)
          ? (h as any).facilities
          : (Array.isArray(h.amenities) && h.amenities.length > 0)
          ? h.amenities
          : [
              "Free Wi-Fi",
              "Mountain View",
              "AC & Heating",
              "Hot Shower",
              "24/7 Room Service",
              "Free Parking",
            ],
      hours: [
        { day: "Check-in Time", time: checkIn },
        { day: "Check-out Time", time: checkOut },
        { day: "Front Desk & Reception", time: "24/7 Assistance" },
      ],
      priceTag: `${currency} ${rawPrice.toLocaleString()} / night`,
      entityType: isHomestay ? "homestay" : "hotel",
      offerings,
    });
    setShowYelpModal(true);
  };

  // ============= CMS + API HOTELS FETCH =============
  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listHotels();
      console.log("Hotels API response:", data);

      const rawHotels: any[] = Array.isArray(data)
        ? data
        : data && typeof data === "object" && Array.isArray((data as any).data)
        ? (data as any).data
        : [];

      const cmsHotels = cmsStore.getHotels();

      const transformedHotels: Hotel[] = rawHotels.map((hotel: any) => {
        const storeMatch = cmsHotels.find(
          (s: any) => String(s.id) === String(hotel.id)
        );
        const photos =
          Array.isArray(storeMatch?.hotelPhotos) &&
          storeMatch.hotelPhotos.length > 0
            ? storeMatch.hotelPhotos
            : Array.isArray(storeMatch?.photos) &&
              storeMatch.photos.length > 0
            ? storeMatch.photos
            : Array.isArray(hotel.hotelPhotos) && hotel.hotelPhotos.length > 0
            ? hotel.hotelPhotos
            : Array.isArray(hotel.photos) && hotel.photos.length > 0
            ? hotel.photos
            : hotel.imageUrl
            ? [hotel.imageUrl]
            : storeMatch?.imageUrl
            ? [storeMatch.imageUrl]
            : [];

        const imageUrl =
          hotel.imageUrl &&
          typeof hotel.imageUrl === "string" &&
          hotel.imageUrl.trim() !== ""
            ? hotel.imageUrl
            : photos[0] ||
              storeMatch?.imageUrl ||
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";

        let lat: number | undefined;
        let lng: number | undefined;
        if (hotel.gpsCoordinates) {
          try {
            const coords = hotel.gpsCoordinates.split(",");
            lat = parseFloat(coords[0]);
            lng = parseFloat(coords[1]);
          } catch (e) {
            console.warn("Invalid GPS coordinates for hotel:", hotel.id);
          }
        }

        const pricePerNight =
          storeMatch?.pricePerNight !== undefined &&
          storeMatch.pricePerNight > 0
            ? storeMatch.pricePerNight
            : typeof hotel.pricePerNight === "number" &&
              hotel.pricePerNight > 0
            ? hotel.pricePerNight
            : 2500;
        const currency = storeMatch?.currency || hotel.currency || "NRs";
        const hName = hotel.hotelName || hotel.name || "Unnamed Hotel";
        const rawPropType =
          storeMatch?.propertyType ||
          hotel.propertyType ||
          (hName.toLowerCase().includes("homestay") ? "Homestay" : "Hotel");

        return {
          id: String(hotel.id ?? Math.random()),
          name: hName,
          description: hotel.description || "No description available",
          image: imageUrl,
          hotelPhotos: photos.length > 0 ? photos : [imageUrl],
          photos: photos.length > 0 ? photos : [imageUrl],
          rating: typeof hotel.rating === "number" ? hotel.rating : 4.5,
          reviews: typeof hotel.reviews === "number" ? hotel.reviews : 0,
          location:
            storeMatch?.location &&
            storeMatch.location.trim() !== "" &&
            storeMatch.location !== "N/A"
              ? storeMatch.location
              : hotel.location || "Location not specified",
          pricePerNight,
          currency,
          amenities:
            Array.isArray((storeMatch as any)?.facilities) &&
            (storeMatch as any).facilities.length > 0
              ? (storeMatch as any).facilities
              : Array.isArray(hotel.amenities)
              ? hotel.amenities
              : Array.isArray(hotel.facilities)
              ? hotel.facilities
              : [],
          distance: hotel.distance || "0.5 km",
          available:
            hotel.availabilityStatus !== undefined &&
            hotel.availabilityStatus !== null
              ? hotel.availabilityStatus === "Available"
              : hotel.available ?? true,
          status: hotel.approvalStatus
            ? (String(hotel.approvalStatus)
                .toLowerCase()
                .replace(/\s+/g, "-") as any)
            : "draft",
          roomTypes: (() => {
            const rawRT = storeMatch?.roomTypes || (hotel as any)?.roomTypes || (hotel as any)?.room_types;
            if (Array.isArray(rawRT)) return rawRT;
            if (typeof rawRT === "string" && (rawRT as string).trim()) {
              try { return JSON.parse(rawRT); } catch (e) {}
            }
            return [];
          })(),
          contactPerson: storeMatch?.contactPerson || hotel.contactPerson || "",
          phoneNumber: storeMatch?.phoneNumber || hotel.phoneNumber || "",
          whatsappNumber: (storeMatch as any)?.whatsAppNumber || (storeMatch as any)?.whatsappNumber || (hotel as any).whatsappNumber || "",
          checkInTime: storeMatch?.checkInTime || hotel.checkInTime || "12:00 PM",
          checkOutTime: storeMatch?.checkOutTime || hotel.checkOutTime || "10:00 AM",
          availabilityStatus: storeMatch?.availabilityStatus || hotel.availabilityStatus || "Available",
          partnerStatus: storeMatch?.partnerStatus || hotel.partnerStatus || "Verified Partner",
          lat: storeMatch?.latitude || lat,
          lng: storeMatch?.longitude || lng,
          gpsCoordinates: hotel.gpsCoordinates,
          propertyType: rawPropType,
          source: "api",
        };
      });

      cmsHotels
        .forEach((sh: any) => {
          if (
            !transformedHotels.some((m) => String(m.id) === String(sh.id))
          ) {
            const photos =
              Array.isArray(sh.hotelPhotos) && sh.hotelPhotos.length > 0
                ? sh.hotelPhotos
                : Array.isArray(sh.photos) && sh.photos.length > 0
                ? sh.photos
                : sh.imageUrl
                ? [sh.imageUrl]
                : [];
            const imageUrl =
              sh.imageUrl ||
              photos[0] ||
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
            const shName = sh.hotelName || "Unnamed Hotel";
            const shPropType =
              sh.propertyType ||
              (shName.toLowerCase().includes("homestay")
                ? "Homestay"
                : "Hotel");

            const rawShRT = sh.roomTypes || (sh as any).room_types;
            let shRoomTypes = Array.isArray(rawShRT) ? rawShRT : [];
            if (typeof rawShRT === "string" && (rawShRT as string).trim()) {
              try { shRoomTypes = JSON.parse(rawShRT); } catch (e) {}
            }

            transformedHotels.unshift({
              id: String(sh.id),
              name: shName,
              description: sh.description || sh.location || "No description available",
              image: imageUrl,
              hotelPhotos: photos,
              photos: photos,
              rating: 4.8,
              reviews: 35,
              location: sh.location || "Nepal",
              pricePerNight: Number(sh.pricePerNight) || 2500,
              currency: sh.currency || "NRs",
              amenities: Array.isArray(sh.facilities) ? sh.facilities : [],
              distance: "1.0 km",
              available: true,
              status: "published",
              roomTypes: shRoomTypes,
              contactPerson: sh.contactPerson || "",
              phoneNumber: sh.phoneNumber || "",
              whatsappNumber: (sh as any).whatsAppNumber || sh.whatsappNumber || "",
              checkInTime: sh.checkInTime || "12:00 PM",
              checkOutTime: sh.checkOutTime || "10:00 AM",
              availabilityStatus: sh.availabilityStatus || "Available",
              partnerStatus: sh.partnerStatus || "Verified Partner",
              lat: sh.latitude,
              lng: sh.longitude,
              propertyType: shPropType,
              source: "cms",
            });
          }
        });

      setHotels(transformedHotels);
      setLoading(false);

      // Rooms background me fetch karo (sirf API hotels ke liye)
      Promise.all(
        transformedHotels.map(async (h) => {
          try {
            const rooms = await getHotelRooms(h.id);
            const roomList = Array.isArray(rooms)
              ? rooms
              : rooms &&
                typeof rooms === "object" &&
                Array.isArray((rooms as any).data)
              ? (rooms as any).data
              : [];
            return { id: h.id, rooms: roomList };
          } catch (e) {
            console.error(`Error fetching rooms for hotel ${h.id}:`, e);
            return { id: h.id, rooms: [] };
          }
        })
      ).then((roomResults) => {
        setHotels((prevHotels) =>
          prevHotels.map((h) => {
            const match = roomResults.find((r) => r.id === h.id);
            if (match && Array.isArray(match.rooms) && match.rooms.length > 0) {
              return { ...h, roomTypes: match.rooms };
            }
            return h;
          })
        );
      });
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setHotels([]);
      setLoading(false);
    }
  }, []);

  // ============= GOOGLE PLACES FETCH =============
  const fetchGoogleHotels = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setGoogleHotels([]);
      return;
    }

    setGoogleLoading(true);
    try {
      await loadGooglePlacesScript();
      const google = (window as any).google;

      if (!google?.maps?.places) {
        console.warn("Google Places not available");
        setGoogleHotels([]);
        setGoogleLoading(false);
        return;
      }

      const service = getPlacesService();

      // Step 1: Query ko geocode karo
      const geocodeQuery = (): Promise<{ lat: number; lng: number } | null> =>
        new Promise((resolve) => {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { address: query },
            (results: any, status: any) => {
              if (status === "OK" && results?.[0]) {
                const loc = results[0].geometry.location;
                resolve({ lat: loc.lat(), lng: loc.lng() });
              } else {
                resolve(null);
              }
            }
          );
        });

      const center = await geocodeQuery();
      const searchCenter = center
        ? new google.maps.LatLng(center.lat, center.lng)
        : new google.maps.LatLng(28.3949, 84.124); // Nepal center fallback

      // Step 2: Text Search
      const textSearch = (): Promise<any[]> =>
        new Promise((resolve) => {
          service.textSearch(
            {
              query: `${query} hotels`,
              location: searchCenter,
              radius: 20000, // 20 km
            },
            (results: any, status: any) => {
              if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                results
              ) {
                resolve(results);
              } else {
                console.warn("Places textSearch status:", status);
                resolve([]);
              }
            }
          );
        });

      const results = await textSearch();
      console.log("Google Places results:", results);

      const converted: Hotel[] = results.slice(0, 20).map((place: any, index: number) => {
        const lat = place.geometry?.location?.lat() ?? 0;
        const lng = place.geometry?.location?.lng() ?? 0;
        const photoUrl = place.photos?.[0]?.getUrl({
          maxWidth: 800,
          maxHeight: 600,
        });

        const nameLower = (place.name || "").toLowerCase();
        const propType = nameLower.includes("homestay")
          ? "Homestay"
          : nameLower.includes("resort")
          ? "Resort"
          : nameLower.includes("lodge")
          ? "Lodge"
          : nameLower.includes("guest")
          ? "Guest House"
          : "Hotel";

        return {
          id: `google-${place.place_id || index}`,
          placeId: place.place_id,
          name: place.name || "Unnamed Hotel",
          description:
            place.formatted_address || "Hotel via Google Places",
          image:
            photoUrl ||
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
          hotelPhotos: place.photos
            ? place.photos
                .slice(0, 6)
                .map((p: any) => p.getUrl({ maxWidth: 1200 }))
            : [],
          photos: place.photos
            ? place.photos
                .slice(0, 6)
                .map((p: any) => p.getUrl({ maxWidth: 1200 }))
            : [],
          rating: place.rating ?? 4.5,
          reviews: place.user_ratings_total ?? 0,
          location: place.formatted_address || place.vicinity || "Nepal",
          pricePerNight:
            place.price_level === 4
              ? 8000
              : place.price_level === 3
              ? 5000
              : place.price_level === 2
              ? 3000
              : 2500,
          currency: "NRs",
          amenities: [],
          distance: "0.5 km",
          available: true,
          lat,
          lng,
          status: "published",
          roomTypes: [],
          propertyType: propType,
          source: "google",
          googleRating: place.rating,
        };
      });

      setGoogleHotels(converted);
    } catch (err) {
      console.error("Google Places error:", err);
      setGoogleHotels([]);
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  // ============= GOOGLE SEARCH DEBOUNCE =============
  useEffect(() => {
    if (!useGoogleSearch) {
      setGoogleHotels([]);
      return;
    }
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setGoogleHotels([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchGoogleHotels(searchQuery);
    }, 900);

    return () => clearTimeout(timer);
  }, [searchQuery, useGoogleSearch, fetchGoogleHotels]);

  // ============= FILTER + MERGE =============
  const filterHotels = useCallback(() => {
    // CMS/API + Google merge
    let filtered: Hotel[] = [...hotels, ...googleHotels];

    // Duplicate remove (same name + location)
    const seen = new Set<string>();
    filtered = filtered.filter((h) => {
      const key = `${(h.name || "").toLowerCase().trim()}-${(
        h.location || ""
      )
        .toLowerCase()
        .trim()
        .slice(0, 40)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Stay type filter
    if (stayTypeFilter === "hotels") {
      filtered = filtered.filter((h) => {
        const p = (h.propertyType || "").toLowerCase();
        const n = (h.name || "").toLowerCase();
        return p !== "homestay" && !n.includes("homestay");
      });
    } else if (stayTypeFilter === "homestays") {
      filtered = filtered.filter((h) => {
        const p = (h.propertyType || "").toLowerCase();
        const n = (h.name || "").toLowerCase();
        return p === "homestay" || n.includes("homestay");
      });
    }

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      // Google hotels already searchQuery se aaye hain, unhe skip karo filter me
      const googleIds = new Set(googleHotels.map((g) => g.id));
      filtered = filtered.filter((hotel) => {
        if (googleIds.has(hotel.id)) return true; // Google results already matched
        const name = (hotel.name || "").toLowerCase();
        const location = (hotel.location || "").toLowerCase();
        const description = (hotel.description || "").toLowerCase();
        const matchesAmenities =
          Array.isArray(hotel.amenities) &&
          hotel.amenities.some((a) =>
            (a || "").toLowerCase().includes(query)
          );
        return (
          name.includes(query) ||
          location.includes(query) ||
          description.includes(query) ||
          matchesAmenities
        );
      });
    }

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(
        (hotel) => (hotel.rating ?? 0) >= filters.rating
      );
    }

    // Amenities filter (sirf un hotels pe apply karo jinke paas amenities list hai)
    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(
        (hotel) =>
          Array.isArray(hotel.amenities) &&
          filters.amenities.some((amenity) =>
            hotel.amenities.includes(amenity)
          )
      );
    }

    // Room type filter
    if (filters.roomType !== "all") {
      filtered = filtered.filter(
        (hotel) =>
          Array.isArray(hotel.roomTypes) &&
          hotel.roomTypes.some((r) => r && r.type === filters.roomType)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case "price-low":
        filtered = [...filtered].sort(
          (a, b) => (a.pricePerNight ?? 0) - (b.pricePerNight ?? 0)
        );
        break;
      case "price-high":
        filtered = [...filtered].sort(
          (a, b) => (b.pricePerNight ?? 0) - (a.pricePerNight ?? 0)
        );
        break;
      case "rating":
        filtered = [...filtered].sort(
          (a, b) => (b.rating ?? 0) - (a.rating ?? 0)
        );
        break;
      default:
        // Recommended: Google results top pe, phir CMS
        filtered = [...filtered].sort((a, b) => {
          const aG = a.source === "google" ? 1 : 0;
          const bG = b.source === "google" ? 1 : 0;
          if (aG !== bG) return bG - aG;
          return (b.rating ?? 0) - (a.rating ?? 0);
        });
        break;
    }

    return filtered;
  }, [hotels, googleHotels, searchQuery, filters, stayTypeFilter]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  // ============= HANDLERS =============
  const handleBookClick = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (data: BookingData) => {
    setBookingData(data);
    setShowBookingModal(false);
    setShowSuccessModal(true);
    console.log("Booking submitted:", data);
  };

  const handleMarkerClick = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    const hotel =
      hotels.find((h) => h.id === hotelId) ||
      googleHotels.find((h) => h.id === hotelId);
    if (hotel && hotelListRef.current) {
      const cards = hotelListRef.current.querySelectorAll("[data-hotel-id]");
      cards.forEach((card) => {
        if (card.getAttribute("data-hotel-id") === hotelId) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          card.classList.add("ring-2", "ring-blue-500", "shadow-lg");
          setTimeout(() => {
            card.classList.remove("ring-2", "ring-blue-500", "shadow-lg");
          }, 2000);
        }
      });
    }
  };

  const filteredHotels = filterHotels();

  const handleGoBack = () => {
    navigate(-1);
  };

  const isLoading = loading || googleLoading;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* ============ HEADER ============ */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex-shrink-0 shadow-lg z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            <button
              onClick={handleGoBack}
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
                  placeholder="Search city, hotel name... (e.g. Pokhara, Kathmandu)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/95 text-gray-900 placeholder-gray-500 border-0 rounded-xl focus:ring-2 focus:ring-white/50 outline-none transition-all shadow-sm text-sm"
                />
                {googleLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setUseGoogleSearch(!useGoogleSearch)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  useGoogleSearch
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-white/20 backdrop-blur-sm text-white border border-white/30"
                }`}
                title="Toggle Google Places search"
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">
                  {useGoogleSearch ? "Google ON" : "Google OFF"}
                </span>
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium ${
                  showFilters
                    ? "bg-white text-blue-600"
                    : "bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
                }`}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              <button
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/30 transition-all text-white flex-shrink-0"
              >
                {isMapExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
                <span className="hidden lg:inline text-sm">
                  {isMapExpanded ? "Collapse" : "Expand"}
                </span>
              </button>
            </div>
          </div>

          <div className="pb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5 bg-black/25 p-1 rounded-xl border border-white/15 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setStayTypeFilter("hotels")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  stayTypeFilter === "hotels"
                    ? "bg-white text-blue-700 shadow-md scale-105"
                    : "text-blue-100 hover:text-white hover:bg-white/10"
                }`}
              >
                <HotelIcon className="w-3.5 h-3.5" />
                <span>Hotels Only</span>
              </button>

              <button
                type="button"
                onClick={() => setStayTypeFilter("homestays")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  stayTypeFilter === "homestays"
                    ? "bg-emerald-500 text-white shadow-md scale-105"
                    : "text-blue-100 hover:text-white hover:bg-white/10"
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Homestays Only</span>
              </button>

              <button
                type="button"
                onClick={() => setStayTypeFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  stayTypeFilter === "all"
                    ? "bg-purple-600 text-white shadow-md scale-105"
                    : "text-blue-100 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>All Stays</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-blue-100">
                {isLoading
                  ? "Loading..."
                  : `${filteredHotels.length} ${
                      stayTypeFilter === "homestays"
                        ? "homestay" + (filteredHotels.length === 1 ? "" : "s")
                        : stayTypeFilter === "hotels"
                        ? "hotel" + (filteredHotels.length === 1 ? "" : "s")
                        : "stay" + (filteredHotels.length === 1 ? "" : "s")
                    } found`}
              </span>
              {googleHotels.length > 0 && (
                <span className="text-xs text-green-200 bg-green-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {googleHotels.length} from Google
                </span>
              )}
              {searchQuery && (
                <span className="text-xs text-blue-200/80 bg-white/10 px-2 py-0.5 rounded-full">
                  "{searchQuery}"
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white/10 backdrop-blur-sm border-t border-white/20">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Rating
                  </label>
                  <div className="flex gap-1.5">
                    {[3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() =>
                          setFilters({
                            ...filters,
                            rating:
                              filters.rating === rating ? 0 : rating,
                          })
                        }
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          filters.rating === rating
                            ? "bg-white text-blue-600 shadow-md"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        {rating}+
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Sort By
                  </label>
                  <select
                    className="w-full px-3 py-1.5 bg-white/20 text-white rounded-lg focus:ring-2 focus:ring-white/50 outline-none text-sm border-0"
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters({ ...filters, sortBy: e.target.value })
                    }
                  >
                    <option value="recommended" className="text-gray-900">
                      Recommended
                    </option>
                    <option value="price-low" className="text-gray-900">
                      Price: Low to High
                    </option>
                    <option value="price-high" className="text-gray-900">
                      Price: High to Low
                    </option>
                    <option value="rating" className="text-gray-900">
                      Rating
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Room Type
                  </label>
                  <select
                    className="w-full px-3 py-1.5 bg-white/20 text-white rounded-lg focus:ring-2 focus:ring-white/50 outline-none text-sm border-0"
                    value={filters.roomType}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        roomType: e.target.value as "all" | "AC" | "Non-AC",
                      })
                    }
                  >
                    <option value="all" className="text-gray-900">
                      All Types
                    </option>
                    <option value="AC" className="text-gray-900">
                      ❄️ AC
                    </option>
                    <option value="Non-AC" className="text-gray-900">
                      🌬️ Non-AC
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Amenities
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {["WiFi", "Parking", "Pool", "Spa"].map((amenity) => (
                      <button
                        key={amenity}
                        onClick={() => {
                          setFilters({
                            ...filters,
                            amenities: filters.amenities.includes(amenity)
                              ? filters.amenities.filter(
                                  (a) => a !== amenity
                                )
                              : [...filters.amenities, amenity],
                          });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          filters.amenities.includes(amenity)
                            ? "bg-white text-blue-600 shadow-md"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Hotel List - Left */}
        <div
          className="w-1/2 overflow-y-auto bg-gray-50 border-r border-gray-200"
          ref={hotelListRef}
        >
          <div className="p-4">
            {isLoading && filteredHotels.length === 0 ? (
              <LoadingSkeleton />
            ) : filteredHotels.length === 0 ? (
              <EmptyState
                message={
                  searchQuery.length >= 3 && googleLoading
                    ? `Searching "${searchQuery}" on Google Places...`
                    : "No hotels found matching your criteria. Try searching a city name."
                }
              />
            ) : (
              <div className="space-y-3">
                {filteredHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    data-hotel-id={hotel.id}
                    className={`bg-white rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                      selectedHotelId === hotel.id
                        ? "border-blue-500 ring-2 ring-blue-500/30 shadow-md"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => {
                      setSelectedHotelId(hotel.id);
                      handleMarkerClick(hotel.id);
                      handleOpenYelpDetail(hotel);
                    }}
                  >
                    {(() => {
                      const displayPrice =
                        hotel.pricePerNight && hotel.pricePerNight > 0
                          ? hotel.pricePerNight
                          : (hotel.roomTypes &&
                              hotel.roomTypes[0]?.pricePerNight) ||
                            2500;
                      const rawCurrency = hotel.currency || "NRs";
                      const currencyStr = rawCurrency.endsWith(" ")
                        ? rawCurrency
                        : `${rawCurrency} `;
                      const amenitiesList =
                        Array.isArray(hotel.amenities) &&
                        hotel.amenities.length > 0
                          ? hotel.amenities
                          : [
                              "Free Wi-Fi",
                              "Mountain View",
                              "AC & Heating",
                              "24/7 Hot Shower",
                              "Free Parking",
                              "Breakfast",
                            ];

                      return (
                        <div className="flex flex-col sm:flex-row gap-3.5 p-3.5">
                          <div className="flex-shrink-0 w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-gray-100 relative group-hover:shadow-md transition-shadow">
                            <img
                              src={hotel.image || "/logo/gojitriplogo.jpg"}
                              alt={hotel.name || "Hotel"}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/logo/gojitriplogo.jpg";
                              }}
                            />
                            {(hotel as any).propertyType && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[10px] font-bold text-white uppercase tracking-wider">
                                {(hotel as any).propertyType}
                              </span>
                            )}
                            {hotel.source === "google" && (
                              <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-green-500 backdrop-blur-md rounded-md text-[10px] font-bold text-white flex items-center gap-0.5">
                                <Globe className="w-2.5 h-2.5" />
                                G
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="text-base font-extrabold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                  {hotel.name || "Unnamed Hotel"}
                                </h3>
                                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full flex-shrink-0">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                                  <span className="text-xs font-extrabold text-amber-900">
                                    {hotel.rating || 4.8}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    ({hotel.reviews || 42})
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 text-slate-600 text-xs mb-2">
                                <MapPin className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                <span className="truncate font-medium">
                                  {hotel.location || "Pokhara, Nepal"}
                                </span>
                              </div>

                              {hotel.description && (
                                <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                                  {hotel.description}
                                </p>
                              )}

                              <div className="flex gap-1.5 flex-wrap">
                                {amenitiesList
                                  .slice(0, 4)
                                  .map((amenity, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium border border-slate-200/60"
                                    >
                                      {amenity}
                                    </span>
                                  ))}
                                {amenitiesList.length > 4 && (
                                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold">
                                    +{amenitiesList.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <div>
                                <span className="text-base font-extrabold text-slate-900">
                                  {currencyStr}
                                  {displayPrice.toLocaleString()}
                                </span>
                                <span className="text-slate-500 text-xs font-normal">
                                  {" "}
                                  / night
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenYelpDetail(hotel);
                                  }}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all border border-slate-200 hover:scale-105 active:scale-95"
                                >
                                  Details
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookClick(hotel);
                                  }}
                                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 ${
                                    hotel.available !== false
                                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                                      : "bg-gray-200 text-gray-600 cursor-not-allowed"
                                  }`}
                                  disabled={hotel.available === false}
                                >
                                  {hotel.available !== false
                                    ? "Book Stay"
                                    : "Sold Out"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map - Right */}
        <div className="w-1/2 bg-gray-100 p-3">
          <InteractiveMap
            items={filteredHotels.map((h) => {
              const displayPrice =
                h.pricePerNight && h.pricePerNight > 0
                  ? h.pricePerNight
                  : (h.roomTypes && h.roomTypes[0]?.pricePerNight) || 2500;
              const currency = h.currency
                ? h.currency.endsWith(" ")
                  ? h.currency
                  : `${h.currency} `
                : "NRs ";
              return {
                id: h.id,
                name: h.name,
                location: h.location,
                priceTag: `${currency}${displayPrice.toLocaleString()}`,
                rating: h.rating || 4.8,
                image: h.image,
                lat: (h as any).latitude || h.lat,
                lng: (h as any).longitude || h.lng,
                category: "hotel",
              };
            })}
            selectedId={selectedHotelId}
            onMarkerClick={(id) => {
              setSelectedHotelId(id);
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
        onBookNow={(data) => {
          setShowYelpModal(false);
          const found =
            hotels.find((h) => h.id === data.id) ||
            googleHotels.find((h) => h.id === data.id);
          if (found) {
            setSelectedHotel(found);
            setShowBookingModal(true);
          }
        }}
      />

      {/* Modals */}
      {showBookingModal && selectedHotel && (
        <BookingModal
          hotel={selectedHotel}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedHotel(null);
          }}
          onBook={handleBookingSubmit}
        />
      )}

      {showSuccessModal && bookingData && (
        <SuccessModal
          bookingData={bookingData}
          onClose={() => {
            setShowSuccessModal(false);
            setBookingData(null);
          }}
        />
      )}
    </div>
  );
};

export default HotelsPage;  