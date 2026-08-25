// HotelsPage.tsx - Fixed Map Rendering
import "@/styles/pages/hotels/hotels.css";
import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Wind,
  Snowflake,
  ArrowLeft,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { listHotels, getHotelRooms, RoomType } from "@/lib/api";
import YelpDetailModal, { YelpDetailData } from "@/components/common/YelpDetailModal";

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
  lat?: number;
  lng?: number;
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
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(
    hotel.roomTypes && hotel.roomTypes.length > 0 ? hotel.roomTypes[0] : null,
  );

  const roomTypes = hotel.roomTypes ?? [];

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
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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
              <span className="font-semibold text-gray-900">{hotel.rating}</span>
              <span className="text-gray-600 text-sm">({hotel.reviews} reviews)</span>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Room Type</label>
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
                      <span className="font-semibold text-gray-900 text-sm">{room.name}</span>
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
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
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
                    <span className="font-semibold text-gray-900">Type:</span> {selectedRoomType.name} ({selectedRoomType.type})
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-900">Capacity:</span> Up to {selectedRoomType.capacity} guests
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-900">Price:</span> {hotel.currency || "$"}
                    {selectedRoomType.pricePerNight}/night
                  </p>
                </div>
              </div>
            )}
            {checkIn && checkOut && selectedRoomType && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <span>{selectedRoomType.pricePerNight} x {nights} nights</span>
                  <span className="font-semibold text-gray-900">
                    {hotel.currency || "$"}{selectedRoomType.pricePerNight * nights}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <span>Taxes & fees</span>
                  <span className="font-semibold text-gray-900">
                    {hotel.currency || "$"}{(selectedRoomType.pricePerNight * nights * 0.12).toFixed(0)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>
                    {hotel.currency || "$"}{calculateTotal() + selectedRoomType.pricePerNight * nights * 0.12}
                  </span>
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={!selectedRoomType}
              className={`w-full font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                selectedRoomType ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-200 text-gray-600 cursor-not-allowed"
              }`}
            >
              <CreditCard className="h-5 w-5" />
              {selectedRoomType ? `Book ${selectedRoomType.type} Room` : "Select Room Type"}
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
        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed! 🎉</h2>
      <p className="text-gray-700 mb-4">
        Your stay at <strong className="text-gray-900">{bookingData.hotelName}</strong> has been booked successfully.
      </p>
      <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-1">
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-gray-900">Room Type:</span> {bookingData.roomType}{" "}
          {bookingData.isAC ? <span className="text-blue-700 font-semibold">❄️ AC</span> : <span className="text-orange-700 font-semibold">🌬️ Non-AC</span>}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-gray-900">Check-in:</span> {new Date(bookingData.checkIn).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-gray-900">Check-out:</span> {new Date(bookingData.checkOut).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-gray-900">Guests:</span> {bookingData.guests}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-gray-900">Total:</span> ${bookingData.totalPrice}
        </p>
      </div>
      <button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
        Done
      </button>
    </div>
  </div>
);

// ============= LOADING SKELETON =============
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex gap-3 p-3 bg-white rounded-xl border border-gray-200 animate-pulse">
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
    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
    <p className="text-gray-600 text-center max-w-md">{message}</p>
  </div>
);

// ============= MAP COMPONENT - Fixed =============
const MapComponent: React.FC<{
  hotels: Hotel[];
  selectedHotelId?: string | null;
  onMarkerClick: (hotelId: string) => void;
  center?: { lat: number; lng: number };
}> = ({ hotels, selectedHotelId, onMarkerClick, center = { lat: 27.7172, lng: 85.324 } }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Load Google Maps
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap`;
      script.async = true;
      script.defer = true;

      window.initMap = () => {
        initializeMap();
      };

      document.head.appendChild(script);

      return () => {
        const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
        scripts.forEach((s) => s.remove());
        window.initMap = () => {};
      };
    };

    const initializeMap = () => {
      if (!mapRef.current) {
        console.error("Map container not found");
        return;
      }

      try {
        console.log("Initializing map with center:", center);
        
        const mapOptions = {
          center: center,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        };

        const map = new window.google.maps.Map(mapRef.current, mapOptions);
        setIsMapLoaded(true);
        setMapError(null);

        // Add markers for each hotel
        hotels.forEach((hotel, index) => {
          let position;
          if (hotel.lat && hotel.lng) {
            position = { lat: hotel.lat, lng: hotel.lng };
          } else {
            // Generate random position near center
            const latOffset = (Math.random() - 0.5) * 0.05;
            const lngOffset = (Math.random() - 0.5) * 0.05;
            position = {
              lat: center.lat + latOffset,
              lng: center.lng + lngOffset,
            };
          }

          const marker = new window.google.maps.Marker({
            position,
            map: map,
            title: hotel.name,
            animation: window.google.maps.Animation.DROP,
            label: {
              text: `${index + 1}`,
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: "bold",
            },
          });

          // Info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <strong style="font-size: 14px;">${hotel.name}</strong>
                <div style="font-size: 12px; color: #666; margin: 4px 0;">📍 ${hotel.location}</div>
                <div style="display: flex; align-items: center; gap: 4px; margin: 4px 0;">
                  <span style="color: #f59e0b;">★</span>
                  <span style="font-size: 13px; font-weight: 600;">${hotel.rating}</span>
                  <span style="font-size: 12px; color: #666;">(${hotel.reviews})</span>
                </div>
                <div style="font-size: 14px; font-weight: bold; color: #1f2937; margin: 4px 0;">
                  ${hotel.currency || "$"}${hotel.pricePerNight} <span style="font-size: 12px; font-weight: normal; color: #666;">/night</span>
                </div>
                <button 
                  onclick="window.handleHotelBook('${hotel.id}')"
                  style="
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 4px 16px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 4px;
                    width: 100%;
                  "
                >
                  Book Now
                </button>
              </div>
            `,
          });

          marker.addListener("click", () => {
            onMarkerClick(hotel.id);
            infoWindow.open(map, marker);
          });

          // If this is the selected hotel, open its info window
          if (selectedHotelId === hotel.id) {
            setTimeout(() => {
              infoWindow.open(map, marker);
              map.panTo(position);
              map.setZoom(15);
            }, 500);
          }
        });

        // Fit bounds if multiple hotels
        if (hotels.length > 1) {
          const bounds = new window.google.maps.LatLngBounds();
          hotels.forEach((hotel) => {
            let pos;
            if (hotel.lat && hotel.lng) {
              pos = { lat: hotel.lat, lng: hotel.lng };
            } else {
              const latOffset = (Math.random() - 0.5) * 0.05;
              const lngOffset = (Math.random() - 0.5) * 0.05;
              pos = {
                lat: center.lat + latOffset,
                lng: center.lng + lngOffset,
              };
            }
            bounds.extend(pos);
          });
          map.fitBounds(bounds);
        }

        // Expose book function to window
        (window as any).handleHotelBook = (hotelId: string) => {
          onMarkerClick(hotelId);
        };

      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError("Failed to load map. Please check your API key.");
      }
    };

    loadGoogleMaps();

    return () => {
      delete (window as any).handleHotelBook;
    };
  }, [center, hotels, selectedHotelId, onMarkerClick]);

  if (mapError) {
    return (
      <div className="h-full w-full bg-gray-100 rounded-2xl flex flex-col items-center justify-center p-8">
        <div className="text-5xl mb-4">🗺️</div>
        <p className="text-gray-700 font-medium text-center">Map unavailable</p>
        <p className="text-gray-500 text-sm text-center mt-1">{mapError}</p>
        <p className="text-gray-400 text-xs text-center mt-2">
          Please check your Google Maps API key
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden bg-gray-200 relative">
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: "500px" }} />
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}
      {isMapLoaded && hotels.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-xs text-gray-600">
          📍 {hotels.length} hotel{hotels.length > 1 ? 's' : ''} displayed
        </div>
      )}
    </div>
  );
};

// ============= MAIN COMPONENT =============
const HotelsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [yelpDetailData, setYelpDetailData] = useState<YelpDetailData | null>(null);
  const [showYelpModal, setShowYelpModal] = useState(false);
  const hotelListRef = useRef<HTMLDivElement>(null);

  const handleOpenYelpDetail = (h: Hotel) => {
    const rawPrice = (h as any).pricePerNight || h.pricePerNight || 2500;
    const currency = h.currency || "NRs ";
    setYelpDetailData({
      id: h.id,
      name: h.name,
      category: (h as any).propertyType || "Luxury Hotel & Mountain Resort",
      rating: h.rating || 4.8,
      reviewCount: h.reviews || 42,
      priceLevel: "$$",
      address: h.location,
      location: h.location,
      phone: (h as any).phoneNumber || h.contact || "+977 1 4567890",
      whatsapp: (h as any).whatsappNumber || "+9779801234567",
      image: h.image,
      galleryImages: (h as any).hotelPhotos || (h as any).photos || (h.image ? [h.image] : []),
      description: (h as any).description || h.description || `${h.name} offers magnificent mountain view accommodation, gourmet dining, and warm Nepalese hospitality.`,
      amenities: (h as any).facilities || h.amenities || ["Free Wi-Fi", "Mountain View", "AC & Heating", "Hot Shower", "24/7 Room Service", "Free Parking"],
      hours: (h as any).operatingHours ? [{ day: "Front Desk & Schedule", time: (h as any).operatingHours }] : undefined,
      priceTag: `${currency} ${rawPrice} / night`,
      entityType: "hotel",
      offerings: h.roomTypes?.map((rt: any) => ({
        title: rt.typeName || rt.type || "Deluxe Room",
        price: `NRs ${rt.pricePerNight || rawPrice} / night`,
        desc: `Capacity: ${rt.maxGuests || 2} Guests • ${rt.type === "AC" || rt.isAC ? "Air Conditioned" : "Standard Heating"}`,
      })) || [
        { title: "Deluxe Mountain View Suite", price: `${currency} ${rawPrice}`, desc: "Spacious suite with private balcony overviewing Annapurna peaks." },
        { title: "Standard Double Room", price: `${currency} ${Math.round(rawPrice * 0.8)}`, desc: "Comfortable double bed room with ensuite modern bathroom." },
      ],
    });
    setShowYelpModal(true);
  };

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

      const transformedHotels: Hotel[] = rawHotels.map((hotel: any) => {
        const imageUrl =
          hotel.imageUrl && typeof hotel.imageUrl === "string" && hotel.imageUrl.trim() !== ""
            ? hotel.imageUrl
            : "/logo/gojitriplogo.jpg";

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

        return {
          id: String(hotel.id ?? Math.random()),
          name: hotel.hotelName || hotel.name || "Unnamed Hotel",
          description: hotel.description || "No description available",
          image: imageUrl,
          rating: typeof hotel.rating === "number" ? hotel.rating : 4.5,
          reviews: typeof hotel.reviews === "number" ? hotel.reviews : 0,
          location: hotel.location || "Location not specified",
          pricePerNight: typeof hotel.pricePerNight === "number" ? hotel.pricePerNight : 0,
          currency: hotel.currency || "NPR",
          amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
          distance: hotel.distance || "0.5 km",
          available:
            hotel.availabilityStatus !== undefined && hotel.availabilityStatus !== null
              ? hotel.availabilityStatus === "Available"
              : (hotel.available ?? true),
          status: hotel.approvalStatus
            ? (String(hotel.approvalStatus).toLowerCase().replace(/\s+/g, "-") as any)
            : "draft",
          roomTypes: [],
          lat,
          lng,
          gpsCoordinates: hotel.gpsCoordinates,
        };
      });

      setHotels(transformedHotels);
      setLoading(false);

      Promise.all(
        transformedHotels.map(async (h) => {
          try {
            const rooms = await getHotelRooms(h.id);
            const roomList = Array.isArray(rooms)
              ? rooms
              : rooms && typeof rooms === "object" && Array.isArray((rooms as any).data)
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

  const filterHotels = useCallback(() => {
    let filtered = hotels;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((hotel) => {
        const name = (hotel.name || "").toLowerCase();
        const location = (hotel.location || "").toLowerCase();
        const description = (hotel.description || "").toLowerCase();
        const matchesAmenities =
          Array.isArray(hotel.amenities) &&
          hotel.amenities.some((a) => (a || "").toLowerCase().includes(query));
        return name.includes(query) || location.includes(query) || description.includes(query) || matchesAmenities;
      });
    }

    if (filters.rating > 0) {
      filtered = filtered.filter((hotel) => (hotel.rating ?? 0) >= filters.rating);
    }

    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(
        (hotel) =>
          Array.isArray(hotel.amenities) &&
          filters.amenities.some((amenity) => hotel.amenities.includes(amenity)),
      );
    }

    if (filters.roomType !== "all") {
      filtered = filtered.filter(
        (hotel) =>
          Array.isArray(hotel.roomTypes) &&
          hotel.roomTypes.some((r) => r && r.type === filters.roomType),
      );
    }

    switch (filters.sortBy) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => (a.pricePerNight ?? 0) - (b.pricePerNight ?? 0));
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => (b.pricePerNight ?? 0) - (a.pricePerNight ?? 0));
        break;
      case "rating":
        filtered = [...filtered].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      default:
        filtered = [...filtered].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
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
    console.log("Booking submitted:", data);
  };

  const handleMarkerClick = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    const hotel = hotels.find((h) => h.id === hotelId);
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

  console.log("Filtered Hotels:", filteredHotels);
  console.log("Loading:", loading);
  console.log("Hotels with coordinates:", filteredHotels.map(h => ({ name: h.name, lat: h.lat, lng: h.lng })));

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
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
                  placeholder="Search hotels by name, location, or amenities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                <span className="hidden sm:inline">Filters</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>

              <button
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/30 transition-all text-white flex-shrink-0"
              >
                {isMapExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                <span className="hidden lg:inline text-sm">{isMapExpanded ? "Collapse" : "Expand"}</span>
              </button>
            </div>
          </div>

          <div className="pb-3 flex items-center gap-2">
            <span className="text-sm text-blue-100">
              {loading ? "Loading..." : `${filteredHotels.length} ${filteredHotels.length === 1 ? "hotel" : "hotels"} found`}
            </span>
            {searchQuery && (
              <span className="text-xs text-blue-200/80 bg-white/10 px-2 py-0.5 rounded-full">"{searchQuery}"</span>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="bg-white/10 backdrop-blur-sm border-t border-white/20">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">Rating</label>
                  <div className="flex gap-1.5">
                    {[3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setFilters({ ...filters, rating: filters.rating === rating ? 0 : rating })}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          filters.rating === rating ? "bg-white text-blue-600 shadow-md" : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        {rating}+
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">Sort By</label>
                  <select
                    className="w-full px-3 py-1.5 bg-white/20 text-white rounded-lg focus:ring-2 focus:ring-white/50 outline-none text-sm border-0"
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  >
                    <option value="recommended" className="text-gray-900">Recommended</option>
                    <option value="price-low" className="text-gray-900">Price: Low to High</option>
                    <option value="price-high" className="text-gray-900">Price: High to Low</option>
                    <option value="rating" className="text-gray-900">Rating</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">Room Type</label>
                  <select
                    className="w-full px-3 py-1.5 bg-white/20 text-white rounded-lg focus:ring-2 focus:ring-white/50 outline-none text-sm border-0"
                    value={filters.roomType}
                    onChange={(e) => setFilters({ ...filters, roomType: e.target.value as "all" | "AC" | "Non-AC" })}
                  >
                    <option value="all" className="text-gray-900">All Types</option>
                    <option value="AC" className="text-gray-900">❄️ AC</option>
                    <option value="Non-AC" className="text-gray-900">🌬️ Non-AC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">Amenities</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {["WiFi", "Parking", "Pool", "Spa"].map((amenity) => (
                      <button
                        key={amenity}
                        onClick={() => {
                          setFilters({
                            ...filters,
                            amenities: filters.amenities.includes(amenity)
                              ? filters.amenities.filter((a) => a !== amenity)
                              : [...filters.amenities, amenity],
                          });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          filters.amenities.includes(amenity) ? "bg-white text-blue-600 shadow-md" : "bg-white/20 text-white hover:bg-white/30"
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Hotel List - Left */}
        <div className="w-1/2 overflow-y-auto bg-gray-50 border-r border-gray-200" ref={hotelListRef}>
          <div className="p-4">
            {loading ? (
              <LoadingSkeleton />
            ) : filteredHotels.length === 0 ? (
              <EmptyState message="No hotels found matching your criteria." />
            ) : (
              <div className="space-y-3">
                {filteredHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    data-hotel-id={hotel.id}
                    className={`bg-white rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                      selectedHotelId === hotel.id ? "border-blue-500 ring-2 ring-blue-500/30 shadow-md" : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => {
                      setSelectedHotelId(hotel.id);
                      handleMarkerClick(hotel.id);
                      handleOpenYelpDetail(hotel);
                    }}
                  >
                    <div className="flex gap-3 p-3">
                      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-200">
                        <img
                          src={hotel.image || "/logo/gojitriplogo.jpg"}
                          alt={hotel.name || "Hotel"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/logo/gojitriplogo.jpg";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {hotel.name || "Unnamed Hotel"}
                          </h3>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold text-gray-900">{hotel.rating || 4.5}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 text-xs mb-1">
                          <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{hotel.location || "Location not specified"}</span>
                        </div>
                        <div className="flex gap-1 mb-2 flex-wrap">
                          {Array.isArray(hotel.roomTypes) && hotel.roomTypes.some((r) => r && r.type === "AC") && (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium flex items-center gap-0.5">
                              <Snowflake className="h-2.5 w-2.5" /> AC
                            </span>
                          )}
                          {Array.isArray(hotel.roomTypes) && hotel.roomTypes.some((r) => r && r.type === "Non-AC") && (
                            <span className="px-1.5 py-0.5 bg-orange-50 text-orange-800 rounded text-[10px] font-medium flex items-center gap-0.5">
                              <Wind className="h-2.5 w-2.5" /> Non-AC
                            </span>
                          )}
                          {Array.isArray(hotel.amenities) && hotel.amenities.slice(0, 1).map((amenity) => (
                            <span key={amenity} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium">
                              {amenity}
                            </span>
                          ))}
                          {Array.isArray(hotel.amenities) && hotel.amenities.length > 1 && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium">
                              +{hotel.amenities.length - 1}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-gray-900">
                              {hotel.currency || "$"}{hotel.pricePerNight || 0}
                            </span>
                            <span className="text-gray-600 text-xs">/night</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenYelpDetail(hotel);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                            >
                              Details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookClick(hotel);
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                hotel.available !== false ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-200 text-gray-600 cursor-not-allowed"
                              }`}
                              disabled={hotel.available === false}
                            >
                              {hotel.available !== false ? "Book" : "Sold Out"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map - Right */}
        <div className="w-1/2 bg-gray-100 p-3">
          <MapComponent 
            hotels={filteredHotels} 
            selectedHotelId={selectedHotelId} 
            onMarkerClick={handleMarkerClick}
            center={{ lat: 27.7172, lng: 85.324 }}
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
          const found = hotels.find((h) => h.id === data.id);
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