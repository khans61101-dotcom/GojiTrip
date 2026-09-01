export type ApprovalStatus = 'Draft' | 'Under Review' | 'Approved' | 'Published';

export type RoleType = 'Content Creator' | 'Reviewer' | 'Admin';

export interface TransportEntry {
  id: string;
  operatorName: string;
  contactPerson: string;
  mobileNumber: string;
  whatsAppNumber: string;
  vehicleType: 'Jeep' | 'Scorpio' | 'Hiace' | 'Bus' | 'EV' | 'Other';
  vehicleNumber: string;
  seatCapacity: number;
  route: string;
  pickupPoint: string;
  departureTime: string;
  fare: number;
  currency: string;
  luggagePolicy: string;
  driverPhotoUrl?: string;
  vehiclePhotos: string[];
  licenceVerified: boolean;
  activeStatus: 'Active' | 'Inactive';
  approvalStatus: ApprovalStatus;
  driverLicense?: string;
  vehicleAmenities?: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
}

export interface RoutePOI {
  id: string;
  name: string;
  category: 'Fuel Station' | 'EV Charger' | 'Medical Centre' | 'Police Post' | 'ATM' | 'Viewpoint' | 'Restaurant' | 'Recommended Stop' | 'Tourist Attraction';
  location: string;
  details?: string;
  contactNumber?: string;
  lat?: number;
  lng?: number;
}

export interface EmergencyContact {
  id: string;
  title: string;
  phone: string;
  location: string;
}

export interface RouteEntry {
  id: string;
  routeName: string; // e.g. Pokhara → Muktinath
  origin: string;
  destination: string;
  totalDistanceKm: number;
  estimatedTravelTime: string;
  roadCondition: 'Smooth Asphalt' | 'Mixed Asphalt/Gravel' | 'Offroad / Rough Dirt' | 'Passable 4x4 Only' | 'Under Construction';
  fuelStations: RoutePOI[];
  evChargingStations: RoutePOI[];
  medicalCentres: RoutePOI[];
  policePosts: RoutePOI[];
  atms: RoutePOI[];
  viewpoints: RoutePOI[];
  restaurants: RoutePOI[];
  recommendedStops: RoutePOI[];
  touristAttractions: RoutePOI[];
  weatherSummary: string;
  emergencyContacts: EmergencyContact[];
  connectedTransportIds: string[];
  connectedHotelIds: string[];
  imageUrl?: string;
  photos?: string[];
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
}

export interface RoomTypeInfo {
  id: string;
  typeName: string; // Deluxe Twin, Standard Single, Dormitory
  ratePerNight: number;
  capacity: number;
  photos: string[];
}

export interface HotelEntry {
  id: string;
  hotelName: string;
  propertyType: 'Hotel' | 'Homestay' | 'Resort' | 'Lodge' | 'Guest House';
  contactPerson: string;
  phoneNumber: string;
  location: string;
  latitude: number;
  longitude: number;
  roomTypes: RoomTypeInfo[];
  facilities: string[]; // WiFi, Hot Shower, Parking, Heater, Dining, Mountain View
  checkInTime: string;
  checkOutTime: string;
  hotelPhotos: string[];
  photos?: string[];
  imageUrl?: string;
  pricePerNight?: number;
  currency?: string;
  availabilityStatus: 'Available' | 'Fully Booked' | 'Seasonal Closure';
  partnerStatus: 'Verified Partner' | 'Pending Verification' | 'Standard';
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
}

export interface MenuItem {
  id: string;
  dishName: string;
  category: 'Appetizer' | 'Main Course' | 'Beverage' | 'Local Special';
  price: number;
  isRecommended: boolean;
}

export interface RestaurantEntry {
  id: string;
  restaurantName: string;
  location: string;
  contactDetails: string;
  cuisineTypes: string[]; // Nepali, Thakali, Continental, Bakery, Indian
  openingHours: string;
  priceRange: 'NPR' | 'NPR NPR' | 'NPR NPR NPR' | 'NPR NPR NPR NPR';
  currency?: string;
  averageMealPrice?: number;
  menuPdfUrl?: string;
  menuItems?: MenuItem[];
  photos: string[];
  imageUrl?: string;
  recommendedDishes: string[];
  dietaryOptions?: string[];
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
}

export interface ActivityEntry {
  id: string;
  activityName: string;
  guideName: string;
  guideContactDetails: string;
  pricing: number;
  currency?: string;
  duration: string; // e.g. "3 Hours", "Full Day", "5 Days"
  difficultyLevel: 'Easy' | 'Moderate' | 'Challenging' | 'Extreme';
  photos: string[];
  imageUrl?: string;
  availability: 'Daily' | 'Weekends' | 'Seasonal' | 'On Request';
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
}

export interface GuideEntry {
  id: string;
  fullName: string;
  contactNumber: string;
  licenseNumber?: string;
  languages: string[];
  experienceYears?: number;
  specialization: string;
  dailyRate?: number;
  currency?: string;
  bio?: string;
  photoUrl?: string;
  imageUrl?: string;
  location?: string;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  fileType: 'Photo' | 'Video' | 'Document';
  category: 'Hotels' | 'Routes' | 'Transport' | 'Restaurants' | 'Activities' | 'Destinations';
  url: string;
  thumbnailUrl?: string;
  fileSizeMb: number;
  tags: string[];
  uploadedAt: string;
  uploadedBy: string;
}

export interface FamousPlaceEntry {
  id: string;
  name: string;
  category: string; // Heritage, Adventure, Scenic, Religious, Nature, Temple
  location: string;
  description: string;
  bestTimeToVisit?: string;
  entryFee?: number;
  currency?: string;
  rating?: number;
  reviews?: number;
  imageUrl?: string;
  photos: string[];
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
}

export interface FuelStationEntry {
  id: string;
  name: string;
  stationType: 'Petrol & Diesel' | 'EV Charging Station' | 'Combined Fuel & EV' | 'CNG / LPG';
  location: string;
  contactNumber?: string;
  openingHours?: string;
  petrolPrice?: number;
  dieselPrice?: number;
  evRate?: number;
  currency?: string;
  hasEvFastCharger: boolean;
  hasRestroom: boolean;
  hasConvenienceStore: boolean;
  hasRepairShop: boolean;
  imageUrl?: string;
  photos: string[];
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
}

export interface WorkflowHistoryLog {
  id: string;
  entityType: 'Transport' | 'Route' | 'Hotel' | 'Restaurant' | 'Activity' | 'Place' | 'FuelStation';
  entityId: string;
  entityTitle: string;
  previousStatus: ApprovalStatus;
  newStatus: ApprovalStatus;
  changedByRole: RoleType;
  changedByName: string;
  comment?: string;
  timestamp: string;
}
