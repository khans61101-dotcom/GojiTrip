import "@/styles/pages/hotels/hotels.css";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Wifi,
  Wind,
  Snowflake,
  Car,
  Utensils,
  Dumbbell,
  ArrowLeft,
} from "lucide-react";
import { listHotels, getHotelRooms, createBooking, RoomType } from "@/lib/api";
import { SafeImage } from "@/components/common/SafeImage";

// Types
interface Hotel {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  location: string;
  pricePerNight: number;
  currency: string;
  amenities: string[];
  distance: string;
  available: boolean;
  gpsCoordinates?: string;
  contact?: string;
  status?: "draft" | "under-review" | "approved" | "published";
  roomTypes?: RoomType[];
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

// Booking Modal Component
const BookingModal: React.FC<{
  hotel: Hotel;
  onClose: () => void;
  onBook: (data: BookingData) => void;
}> = ({ hotel, onClose, onBook }) => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [nights, setNights] = useState(1);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(
    hotel.roomTypes && hotel.roomTypes.length > 0 ? hotel.roomTypes[0] : null,
  );

  // Use fetched room types; fallback to empty array
  const roomTypes = hotel.roomTypes ?? [];

  // Ensure a selected room type exists
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
          {/* Hotel Preview */}
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
            {/* Room Type Selection */}
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
                        {hotel.currency || "$"}
                        {room.pricePerNight}
                      </span>
                      <span className="text-xs text-gray-600">/night</span>
                    </div>
                    {room.type === "AC" && (
                      <div className="mt-1 text-xs text-blue-700 font-semibold">
                        ✨ Premium Comfort
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Check-in */}
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-500"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* Check-out */}
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-500"
                  min={checkIn || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* Guests */}
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
                    <option
                      key={num}
                      value={num}
                      className="text-gray-900 bg-white"
                    >
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Room Details Summary */}
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
                    {hotel.currency || "$"}
                    {selectedRoomType.pricePerNight}/night
                  </p>
                  {selectedRoomType.description && (
                    <p className="text-gray-600 text-xs mt-1">
                      {selectedRoomType.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            {checkIn && checkOut && selectedRoomType && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <span>
                    {selectedRoomType.pricePerNight} x {nights} nights
                  </span>
                  <span className="font-semibold text-gray-900">
                    {hotel.currency || "$"}
                    {selectedRoomType.pricePerNight * nights}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <span>Taxes & fees</span>
                  <span className="font-semibold text-gray-900">
                    {hotel.currency || "$"}
                    {(selectedRoomType.pricePerNight * nights * 0.12).toFixed(
                      0,
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>
                    {hotel.currency || "$"}
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

// Success Modal (Updated)
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
          <span className="font-semibold text-gray-900">Total:</span> $
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

// Reusable Components
const SectionHeader: React.FC<{
  title: string;
  subtitle: string;
  light?: boolean;
}> = ({ title, subtitle, light = false }) => (
  <div className="mb-8">
    <h1
      className={`text-3xl md:text-4xl font-bold mb-2 ${
        light ? "text-white" : "text-gray-900"
      }`}
    >
      {title}
    </h1>
    <p className={`text-lg ${light ? "text-blue-100" : "text-gray-600"}`}>
      {subtitle}
    </p>
  </div>
);

const SearchBar: React.FC<{
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ placeholder, value, onChange }) => (
  <div className="relative w-full max-w-2xl">
    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-12 pr-4 py-3 bg-white text-gray-900 placeholder-gray-500 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
    />
  </div>
);

const FilterChip: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
      active
        ? "bg-blue-600 text-white shadow-md"
        : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300"
    }`}
  >
    {label}
  </button>
);

const HotelCard: React.FC<{
  hotel: Hotel;
  onBookClick: (hotel: Hotel) => void;
}> = ({ hotel, onBookClick }) => {
  const [imageSrc, setImageSrc] = useState(
    hotel.image || "/logo/gojitriplogo.jpg",
  );

  useEffect(() => {
    setImageSrc(hotel.image || "/logo/gojitriplogo.jpg");
  }, [hotel.image]);

  // Get room type info
  const hasACRoom =
    Array.isArray(hotel.roomTypes) &&
    hotel.roomTypes.some((r) => r && r.type === "AC");
  const hasNonACRoom =
    Array.isArray(hotel.roomTypes) &&
    hotel.roomTypes.some((r) => r && r.type === "Non-AC");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative h-48 w-full overflow-hidden">
        <SafeImage
          src={imageSrc}
          alt={hotel.name || "Hotel image"}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
          {hotel.distance || "0.5 mi"}
        </div>
        {!hotel.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {hotel.name || "Unnamed Hotel"}
          </h3>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-900">
              {hotel.rating || 4.5}
            </span>
            <span className="text-gray-600 text-sm">
              ({hotel.reviews || 0})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-gray-600 mb-3">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {hotel.location || "Location not specified"}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {hotel.description || "No description available"}
        </p>

        {/* Room Type Badges */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {hasACRoom && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium flex items-center gap-1">
              <Snowflake className="h-3 w-3 text-blue-700" />
              AC Available
            </span>
          )}
          {hasNonACRoom && (
            <span className="px-2 py-1 bg-orange-50 text-orange-800 rounded-md text-xs font-medium flex items-center gap-1">
              <Wind className="h-3 w-3 text-orange-800" />
              Non-AC Available
            </span>
          )}
          {Array.isArray(hotel.amenities) &&
            hotel.amenities.slice(0, 2).map((amenity) => (
              <span
                key={amenity}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
              >
                {amenity}
              </span>
            ))}
          {Array.isArray(hotel.amenities) && hotel.amenities.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
              +{hotel.amenities.length - 2}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {hotel.currency || "$"}
              {hotel.pricePerNight || 0}
            </span>
            <span className="text-gray-600 text-sm">/night</span>
          </div>
          <button
            onClick={() => onBookClick(hotel)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg ${
              hotel.available !== false
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-200 text-gray-600 cursor-not-allowed"
            }`}
            disabled={hotel.available === false}
          >
            {hotel.available !== false ? "Book Now" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
};

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

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        className="bg-white rounded-2xl overflow-hidden animate-pulse"
      >
        <div className="h-48 bg-gray-200" />
        <div className="p-5">
          <div className="h-6 bg-gray-200 rounded mb-2 w-3/4" />
          <div className="h-4 bg-gray-200 rounded mb-4 w-1/2" />
          <div className="h-4 bg-gray-200 rounded mb-4" />
          <div className="flex gap-2 mb-4">
            <div className="h-6 w-16 bg-gray-200 rounded" />
            <div className="h-6 w-16 bg-gray-200 rounded" />
          </div>
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// Main Component
const HotelsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
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

  // Fetch hotels from API
  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listHotels();
      console.log("Hotels API response:", data);

      // Handle both array and { data: [] } formats safely
      const rawHotels: any[] = Array.isArray(data)
        ? data
        : data && typeof data === "object" && Array.isArray((data as any).data)
          ? (data as any).data
          : [];

      // Transform API data to match Hotel interface (showing ALL returned hotels, including Draft)
      const transformedHotels: Hotel[] = rawHotels.map((hotel: any) => {
        const imageUrl =
          hotel.imageUrl &&
          typeof hotel.imageUrl === "string" &&
          hotel.imageUrl.trim() !== ""
            ? hotel.imageUrl
            : "/logo/gojitriplogo.jpg";

        return {
          id: String(hotel.id ?? Math.random()),
          name: hotel.hotelName || hotel.name || "Unnamed Hotel",
          description: hotel.description || "No description available",
          image: imageUrl,
          rating: typeof hotel.rating === "number" ? hotel.rating : 4.5,
          reviews: typeof hotel.reviews === "number" ? hotel.reviews : 0,
          location: hotel.location || "Location not specified",
          pricePerNight:
            typeof hotel.pricePerNight === "number" ? hotel.pricePerNight : 0,
          currency: hotel.currency || "NPR",
          amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
          distance: hotel.distance || "0.5 km",
          available:
            hotel.availabilityStatus !== undefined &&
            hotel.availabilityStatus !== null
              ? hotel.availabilityStatus === "Available"
              : (hotel.available ?? true),
          status: hotel.approvalStatus
            ? (String(hotel.approvalStatus)
                .toLowerCase()
                .replace(/\s+/g, "-") as any)
            : "draft",
          roomTypes: [],
        };
      });

      console.log("Transformed hotels:", transformedHotels);

      // Render cards immediately after API data loads
      setHotels(transformedHotels);
      setLoading(false);

      // Asynchronously fetch room types for each hotel without blocking UI render
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
        }),
      ).then((roomResults) => {
        setHotels((prevHotels) =>
          prevHotels.map((h) => {
            const match = roomResults.find((r) => r.id === h.id);
            return match ? { ...h, roomTypes: match.rooms } : h;
          }),
        );
      });
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setHotels([]);
      setLoading(false);
    }
  }, []);

  // Filter and search hotels
  const filterHotels = useCallback(() => {
    let filtered = hotels;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((hotel) => {
        const name = (hotel.name || "").toLowerCase();
        const location = (hotel.location || "").toLowerCase();
        const description = (hotel.description || "").toLowerCase();
        const matchesAmenities =
          Array.isArray(hotel.amenities) &&
          hotel.amenities.some((a) => (a || "").toLowerCase().includes(query));
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
        (hotel) => (hotel.rating ?? 0) >= filters.rating,
      );
    }

    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(
        (hotel) =>
          Array.isArray(hotel.amenities) &&
          filters.amenities.some((amenity) =>
            hotel.amenities.includes(amenity),
          ),
      );
    }

    // Room Type filter
    if (filters.roomType !== "all") {
      filtered = filtered.filter(
        (hotel) =>
          Array.isArray(hotel.roomTypes) &&
          hotel.roomTypes.some((r) => r && r.type === filters.roomType),
      );
    }

    // Sort
    switch (filters.sortBy) {
      case "price-low":
        filtered = [...filtered].sort(
          (a, b) => (a.pricePerNight ?? 0) - (b.pricePerNight ?? 0),
        );
        break;
      case "price-high":
        filtered = [...filtered].sort(
          (a, b) => (b.pricePerNight ?? 0) - (a.pricePerNight ?? 0),
        );
        break;
      case "rating":
        filtered = [...filtered].sort(
          (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
        );
        break;
      default: // recommended
        filtered = [...filtered].sort(
          (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
        );
        break;
    }

    return filtered;
  }, [hotels, searchQuery, filters]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const handleBookClick = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (data: BookingData) => {
    setBookingData(data);
    setShowBookingModal(false);
    setShowSuccessModal(true);
    // Here you would typically send the booking data to your API
    console.log("Booking submitted:", data);
  };

  const filteredHotels = filterHotels();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative">
        {/* Back Button - Top Left */}
        <button
          onClick={handleGoBack}
          className="absolute top-4 left-4 md:top-6 md:left-6 z-10 
                   flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 
                   bg-white/20 backdrop-blur-sm 
                   hover:bg-white/30 
                   border border-white/30 
                   rounded-xl 
                   text-white font-medium 
                   transition-all duration-300 
                   shadow-lg hover:shadow-xl
                   hover:scale-105 active:scale-95
                   group"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:-translate-x-1" />
          <span className="hidden sm:inline text-sm md:text-base">Back</span>
        </button>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <SectionHeader
            title="Find Your Perfect Stay"
            subtitle="Discover and book the best hotels along your route with exclusive deals"
            light={true}
          />

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <SearchBar
              placeholder="Search hotels by name, location, or amenities..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all whitespace-nowrap text-white"
            >
              <Filter className="h-5 w-5 text-white" />
              <span className="text-white font-medium">Filters</span>
              <ChevronDown
                className={`h-4 w-4 text-white transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[3, 4, 5].map((rating) => (
                    <FilterChip
                      key={rating}
                      label={`${rating}+ Stars`}
                      active={filters.rating === rating}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          rating: filters.rating === rating ? 0 : rating,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                >
                  <option
                    value="recommended"
                    className="text-gray-900 bg-white"
                  >
                    Recommended
                  </option>
                  <option value="price-low" className="text-gray-900 bg-white">
                    Price: Low to High
                  </option>
                  <option value="price-high" className="text-gray-900 bg-white">
                    Price: High to Low
                  </option>
                  <option value="rating" className="text-gray-900 bg-white">
                    Rating
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                  value={filters.roomType}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      roomType: e.target.value as "all" | "AC" | "Non-AC",
                    })
                  }
                >
                  <option value="all" className="text-gray-900 bg-white">
                    All Room Types
                  </option>
                  <option value="AC" className="text-gray-900 bg-white">
                    ❄️ AC Rooms
                  </option>
                  <option value="Non-AC" className="text-gray-900 bg-white">
                    🌬️ Non-AC Rooms
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="flex gap-2 flex-wrap">
                  {["WiFi", "Parking", "Pool", "Restaurant", "Spa"].map(
                    (amenity) => (
                      <FilterChip
                        key={amenity}
                        label={amenity}
                        active={filters.amenities.includes(amenity)}
                        onClick={() => {
                          setFilters({
                            ...filters,
                            amenities: filters.amenities.includes(amenity)
                              ? filters.amenities.filter((a) => a !== amenity)
                              : [...filters.amenities, amenity],
                          });
                        }}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <LoadingSkeleton />
        ) : filteredHotels.length === 0 ? (
          <EmptyState message="No hotels found matching your criteria. Try adjusting your search or filters." />
        ) : (
          <>
            <p className="text-gray-700 font-medium mb-4">
              Showing {filteredHotels.length}{" "}
              {filteredHotels.length === 1 ? "hotel" : "hotels"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onBookClick={handleBookClick}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Booking Modal */}
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

      {/* Success Modal */}
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
