import { apiRequest, clearToken, saveToken } from '@/lib/api';
import {
  ActivityEntry,
  ApprovalStatus,
  GuideEntry,
  HotelEntry,
  MediaItem,
  RestaurantEntry,
  RouteEntry,
  RoleType,
  TransportEntry,
  WorkflowHistoryLog,
  FamousPlaceEntry,
  FuelStationEntry,
  RoomTypeInfo,
} from '@/types/cms';
import { INITIAL_ACTIVITIES, INITIAL_HOTELS, INITIAL_MEDIA, INITIAL_RESTAURANTS, INITIAL_ROUTES, INITIAL_TRANSPORTS, INITIAL_GUIDES, INITIAL_LOGS, INITIAL_PLACES, INITIAL_FUEL_STATIONS } from '@/lib/initial-data';

type BackendTrip = { id: number; name: string; destination: string; price: number; description?: string | null; duration: number; is_active: boolean; image_url?: string | null; created_at: string; updated_at: string; owner_id?: number | null };
type BackendRoute = { id: number; name: string; origin: string; destination: string; distance: number; status: string };
type BackendHotel = { id: number; name: string; location: string; price_per_night: number; is_active: boolean };
type BackendRestaurant = { id: number; name: string; location: string; cuisine: string; is_active: boolean };
type BackendActivity = { id: number; name: string; description: string; price: number; guide_name: string; is_active: boolean };
type BackendMedia = { id: number; filename: string; filepath: string; uploaded_at: string };
type BackendUser = { id: number; email: string; username: string; full_name?: string | null; is_active: boolean; is_superuser: boolean; created_at: string; updated_at?: string | null };

const fallbackStatus: ApprovalStatus = 'Published';

const emptyStats = {
  transportsCount: 0, routesCount: 0, hotelsCount: 0, restaurantsCount: 0,
  activitiesCount: 0, mediaCount: 0, draftCount: 0, underReviewCount: 0, approvedCount: 0, publishedCount: 0, guidesCount: 0, placesCount: 0, fuelStationsCount: 0,
};

function mapTrip(t: BackendTrip): TransportEntry {
  return {
    id: String(t.id),
    operatorName: t.name,
    contactPerson: '',
    mobileNumber: '',
    whatsAppNumber: '',
    vehicleType: 'Jeep',
    vehicleNumber: `TRIP-${t.id}`,
    seatCapacity: 0,
    route: t.destination,
    pickupPoint: '',
    departureTime: '',
    fare: t.price,
    currency: 'USD',
    luggagePolicy: t.description || '',
    driverPhotoUrl: t.image_url || undefined,
    vehiclePhotos: t.image_url ? [t.image_url] : [],
    licenceVerified: true,
    activeStatus: t.is_active ? 'Active' : 'Inactive',
    approvalStatus: fallbackStatus,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
    createdByName: 'API',
  };
}

function mapRoute(r: any): RouteEntry {
  const imageUrl = r.imageUrl || r.image_url || (Array.isArray(r.photos) && r.photos[0]) || '';
  const photos = (Array.isArray(r.photos) && r.photos.length > 0)
    ? r.photos
    : (Array.isArray(r.routePhotos) && r.routePhotos.length > 0)
    ? r.routePhotos
    : (imageUrl ? [imageUrl] : []);
  return {
    id: String(r.id),
    routeName: r.routeName || r.name || 'Unnamed Route',
    origin: r.origin || '',
    destination: r.destination || '',
    totalDistanceKm: Number(r.totalDistanceKm ?? r.distance) || 0,
    estimatedTravelTime: r.estimatedTravelTime || r.duration || 'N/A',
    roadCondition: r.roadCondition || 'Smooth Asphalt',
    imageUrl,
    photos,
    fuelStations: Array.isArray(r.fuelStations) ? r.fuelStations : [],
    evChargingStations: Array.isArray(r.evChargingStations) ? r.evChargingStations : [],
    medicalCentres: Array.isArray(r.medicalCentres) ? r.medicalCentres : [],
    policePosts: Array.isArray(r.policePosts) ? r.policePosts : [],
    atms: Array.isArray(r.atms) ? r.atms : [],
    viewpoints: Array.isArray(r.viewpoints) ? r.viewpoints : [],
    restaurants: Array.isArray(r.restaurants) ? r.restaurants : [],
    recommendedStops: Array.isArray(r.recommendedStops) ? r.recommendedStops : [],
    touristAttractions: Array.isArray(r.touristAttractions) ? r.touristAttractions : [],
    weatherSummary: r.weatherSummary || '',
    emergencyContacts: Array.isArray(r.emergencyContacts) ? r.emergencyContacts : [],
    connectedTransportIds: Array.isArray(r.connectedTransportIds) ? r.connectedTransportIds : [],
    connectedHotelIds: Array.isArray(r.connectedHotelIds) ? r.connectedHotelIds : [],
    approvalStatus: (r.approvalStatus || r.status as ApprovalStatus) || fallbackStatus,
    createdAt: r.createdAt || new Date().toISOString(),
    updatedAt: r.updatedAt || new Date().toISOString(),
    createdByName: r.createdByName || 'API',
  };
}

function mapHotel(h: any): HotelEntry {
  const imageUrl = h.imageUrl || h.image_url || (Array.isArray(h.hotelPhotos) && h.hotelPhotos[0]) || (Array.isArray(h.photos) && h.photos[0]) || '';
  const photos = (Array.isArray(h.hotelPhotos) && h.hotelPhotos.length > 0)
    ? h.hotelPhotos
    : (Array.isArray(h.photos) && h.photos.length > 0)
    ? h.photos
    : (imageUrl ? [imageUrl] : []);

  let roomTypes: RoomTypeInfo[] = [];
  const rawRT = h.roomTypes || h.room_types;
  if (Array.isArray(rawRT)) {
    roomTypes = rawRT;
  } else if (typeof rawRT === 'string' && rawRT.trim()) {
    try { roomTypes = JSON.parse(rawRT); } catch (e) {}
  }

  return {
    id: String(h.id),
    hotelName: h.hotelName,
    propertyType: h.propertyType,
    contactPerson: h.contactPerson,
    phoneNumber: h.phoneNumber,
    location: h.location,
    latitude: h.latitude,
    longitude: h.longitude,
    roomTypes,
    facilities: Array.isArray(h.facilities) ? h.facilities : [],
    checkInTime: h.checkInTime,
    checkOutTime: h.checkOutTime,
    imageUrl,
    hotelPhotos: photos,
    photos: photos,
    pricePerNight: Number(h.pricePerNight) || 2500,
    currency: h.currency || 'NRs',
    availabilityStatus: h.availabilityStatus,
    partnerStatus: h.partnerStatus,
    approvalStatus: h.approvalStatus,
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
    createdByName: h.createdByName,
  };
}

function mapRestaurant(r: any): RestaurantEntry {
  const imageUrl = r.imageUrl || r.image_url || (Array.isArray(r.photos) && r.photos[0]) || '';
  const photos = (Array.isArray(r.photos) && r.photos.length > 0)
    ? r.photos
    : (imageUrl ? [imageUrl] : []);

  return {
    id: String(r.id),
    restaurantName: r.restaurantName,
    location: r.location,
    contactDetails: r.contactDetails,
    cuisineTypes: r.cuisineTypes,
    openingHours: r.openingHours,
    priceRange: r.priceRange,
    currency: r.currency || 'NRs',
    averageMealPrice: Number(r.averageMealPrice) || 650,
    photos: photos,
    imageUrl: imageUrl,
    recommendedDishes: Array.isArray(r.recommendedDishes) ? r.recommendedDishes : [],
    approvalStatus: r.approvalStatus,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    createdByName: r.createdByName,
  };
}

function mapActivity(a: any): ActivityEntry {
  const photosArray = Array.isArray(a.photos) && a.photos.length > 0
    ? a.photos
    : a.imageUrl
      ? [a.imageUrl]
      : [];
  return {
    id: String(a.id),
    activityName: a.activityName,
    guideName: a.guideName,
    guideContactDetails: a.guideContact,
    pricing: a.pricing,
    currency: a.currency || 'NRs',
    duration: a.duration,
    difficultyLevel: a.difficultyLevel,
    photos: photosArray,
    imageUrl: a.imageUrl || photosArray[0] || '',
    availability: a.availability,
    approvalStatus: a.approvalStatus,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    createdByName: a.createdByName,
  };
}

function mapGuide(g: any): GuideEntry {
  return {
    id: String(g.id),
    fullName: g.fullName,
    contactNumber: g.contactNumber,
    licenseNumber: g.licenseNumber || '',
    languages: Array.isArray(g.languages) ? g.languages : ['English', 'Nepali'],
    experienceYears: g.experienceYears || 0,
    specialization: g.specialization || 'Mountain Guide',
    dailyRate: g.dailyRate || 0,
    currency: g.currency || 'NRs',
    bio: g.bio || '',
    photoUrl: g.photoUrl || '',
    approvalStatus: g.approvalStatus || 'Published',
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
    createdByName: g.createdByName || 'Admin',
  };
}

function mapMedia(m: any): MediaItem {
  return {
    id: String(m.id),
    title: m.title,
    fileType: m.fileType,
    category: m.category,
    url: m.url,
    thumbnailUrl: m.url,
    fileSizeMb: m.fileSizeMb,
    tags: m.tags,
    uploadedAt: m.uploadedAt,
    uploadedBy: m.uploadedBy,
  };
}

class CMSStore {
  private transports: TransportEntry[] = [];
  private routes: RouteEntry[] = [];
  private hotels: HotelEntry[] = [];
  private restaurants: RestaurantEntry[] = [];
  private activities: ActivityEntry[] = [];
  private guides: GuideEntry[] = [];
  private places: FamousPlaceEntry[] = [];
  private fuelStations: FuelStationEntry[] = [];
  private media: MediaItem[] = [];
  private logs: WorkflowHistoryLog[] = [];
  private currentRole: RoleType = 'Admin';
  private listeners: (() => void)[] = [];
  private hydrated = false;

  constructor() {
    this.loadFromLocalStorage();
    if (typeof window !== 'undefined') void this.refreshAll();
  }

  private loadFromLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      const storedHotels = localStorage.getItem('gojitrip_cms_hotels');
      if (storedHotels) this.hotels = JSON.parse(storedHotels);
      const storedRest = localStorage.getItem('gojitrip_cms_restaurants');
      if (storedRest) this.restaurants = JSON.parse(storedRest);
      const storedRoutes = localStorage.getItem('gojitrip_cms_routes');
      if (storedRoutes) this.routes = JSON.parse(storedRoutes);
      const storedActivities = localStorage.getItem('gojitrip_cms_activities');
      if (storedActivities) this.activities = JSON.parse(storedActivities);
      const storedGuides = localStorage.getItem('gojitrip_cms_guides');
      if (storedGuides) this.guides = JSON.parse(storedGuides);
      const storedPlaces = localStorage.getItem('gojitrip_cms_places');
      if (storedPlaces) this.places = JSON.parse(storedPlaces);
      const storedFuel = localStorage.getItem('gojitrip_cms_fuel_stations');
      if (storedFuel) this.fuelStations = JSON.parse(storedFuel);
    } catch (e) {
      console.warn("Failed to load CMS store from localStorage:", e);
    }
  }

  private saveToLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('gojitrip_cms_hotels', JSON.stringify(this.hotels));
      localStorage.setItem('gojitrip_cms_restaurants', JSON.stringify(this.restaurants));
      localStorage.setItem('gojitrip_cms_routes', JSON.stringify(this.routes));
      localStorage.setItem('gojitrip_cms_activities', JSON.stringify(this.activities));
      localStorage.setItem('gojitrip_cms_guides', JSON.stringify(this.guides));
      localStorage.setItem('gojitrip_cms_places', JSON.stringify(this.places));
      localStorage.setItem('gojitrip_cms_fuel_stations', JSON.stringify(this.fuelStations));
    } catch (e) {
      console.warn("Failed to save CMS store to localStorage, performing lightweight image optimization:", e);
      try {
        const cleanHotels = this.hotels.map(h => ({
          ...h,
          imageUrl: (h.imageUrl && h.imageUrl.length > 200000) ? '' : h.imageUrl,
          hotelPhotos: (h.hotelPhotos || []).filter(p => p.length <= 200000),
          photos: (h.photos || []).filter(p => p.length <= 200000),
          roomTypes: (h.roomTypes || []).map(r => ({
            ...r,
            imageUrl: (r.imageUrl && r.imageUrl.length > 200000) ? '' : r.imageUrl,
            photos: (r.photos || []).filter(p => p.length <= 200000),
          })),
        }));
        localStorage.setItem('gojitrip_cms_hotels', JSON.stringify(cleanHotels));
      } catch (innerErr) {
        throw new Error("Storage Quota Exceeded: Your browser storage is full. Please use smaller image files so your entries persist permanently.");
      }
    }
  }

  private notify() {
    this.saveToLocalStorage();
    this.listeners.forEach(l => l());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  private async refreshAll() {
    try {
      const [trips, routes, hotels, restaurants, activities, guides, media, logs] = await Promise.all([
        apiRequest<BackendTrip[]>('/trips'),
        apiRequest<BackendRoute[]>('/routes'),
        apiRequest<BackendHotel[]>('/hotels'),
        apiRequest<BackendRestaurant[]>('/restaurants'),
        apiRequest<BackendActivity[]>('/activities'),
        apiRequest<any[]>('/guides'),
        apiRequest<BackendMedia[]>('/media'),
        apiRequest<WorkflowHistoryLog[]>('/workflow/logs'),
      ]);
      console.log("Successfully fetched all data");
      
      const prevHotels = this.hotels;
      const prevRestaurants = this.restaurants;
      const prevRoutes = this.routes;
      const prevTransports = this.transports;

      this.transports = Array.isArray(trips) && trips.length > 0 
        ? trips.map((t: any) => {
            const mapped = mapTrip(t);
            const prev = prevTransports.find(p => String(p.id) === String(mapped.id));
            const vehicleAmenities = (Array.isArray(prev?.vehicleAmenities) && prev.vehicleAmenities.length > 0)
              ? prev.vehicleAmenities
              : (Array.isArray((prev as any)?.amenities) && (prev as any).amenities.length > 0)
              ? (prev as any).amenities
              : (Array.isArray(t.vehicle_amenities) ? t.vehicle_amenities : (Array.isArray(t.vehicleAmenities) ? t.vehicleAmenities : (Array.isArray(t.amenities) ? t.amenities : [])));
            const driverLicense = prev?.driverLicense || (prev as any)?.driver_license || (prev as any)?.licenseNumber || t.driver_license || t.driverLicense || t.licenseNumber || '';
            const description = prev?.description || (prev as any)?.notes || t.description || '';
            return {
              ...mapped,
              vehicleAmenities,
              amenities: vehicleAmenities,
              driverLicense,
              description,
            };
          })
        : (prevTransports.filter(t => !String(t.id).startsWith('tr-')));
      
      this.routes = Array.isArray(routes) && routes.length > 0 
        ? routes.map((r: any) => {
            const mapped = mapRoute(r);
            const prev = prevRoutes.find(p => String(p.id) === String(mapped.id));
            const photos = (Array.isArray(prev?.photos) && prev.photos.length > 0)
              ? prev.photos
              : (Array.isArray((prev as any)?.routePhotos) && (prev as any).routePhotos.length > 0)
              ? (prev as any).routePhotos
              : mapped.photos;
            const approvalStatus = prev?.approvalStatus || mapped.approvalStatus || 'Draft';
            return { ...mapped, approvalStatus, photos, routePhotos: photos, imageUrl: mapped.imageUrl || photos[0] || '' };
          })
        : (prevRoutes.filter(r => !String(r.id).startsWith('rt-')));

      const mergedHotels: HotelEntry[] = Array.isArray(hotels) && hotels.length > 0
        ? hotels.map((h: any) => {
            const mapped = mapHotel(h);
            const prev = prevHotels.find(p =>
              String(p.id) === String(mapped.id) ||
              (p.hotelName && mapped.hotelName && p.hotelName.toLowerCase().trim() === mapped.hotelName.toLowerCase().trim())
            );
            const photos = (Array.isArray(prev?.hotelPhotos) && prev.hotelPhotos.length > 0)
              ? prev.hotelPhotos
              : (Array.isArray(prev?.photos) && prev.photos.length > 0)
              ? prev.photos
              : mapped.hotelPhotos;
            const facilities = (Array.isArray((prev as any)?.facilities) && (prev as any).facilities.length > 0)
              ? (prev as any).facilities
              : (mapped.facilities || []);
            const approvalStatus = prev?.approvalStatus || mapped.approvalStatus || 'Draft';
            const pricePerNight = prev?.pricePerNight !== undefined ? prev.pricePerNight : mapped.pricePerNight;
            const currency = prev?.currency || mapped.currency || 'NRs';
            const loc = (prev?.location && prev.location.trim() !== '' && prev.location !== 'N/A') ? prev.location : mapped.location;
            const lat = prev?.latitude || mapped.latitude;
            const lng = prev?.longitude || mapped.longitude;
            const roomTypes = (Array.isArray(prev?.roomTypes) && prev.roomTypes.length > 0)
              ? prev.roomTypes
              : (mapped.roomTypes || []);
            return { ...mapped, location: loc, latitude: lat, longitude: lng, facilities, roomTypes, pricePerNight, currency, approvalStatus, hotelPhotos: photos, photos: photos, imageUrl: mapped.imageUrl || photos[0] || '' } as unknown as HotelEntry;
          })
        : (prevHotels.length > 0 ? prevHotels : INITIAL_HOTELS);

      prevHotels.forEach((ph) => {
        if (!mergedHotels.some(m => String(m.id) === String(ph.id) || (m.hotelName && ph.hotelName && m.hotelName.toLowerCase().trim() === ph.hotelName.toLowerCase().trim()))) {
          mergedHotels.unshift(ph as HotelEntry);
        }
      });
      this.hotels = mergedHotels;

      const mergedRestaurants: RestaurantEntry[] = Array.isArray(restaurants) && restaurants.length > 0
        ? restaurants.map((r: any) => {
            const mapped = mapRestaurant(r);
            const prev = prevRestaurants.find(p => String(p.id) === String(mapped.id));
            const photos = (Array.isArray(prev?.photos) && prev.photos.length > 0)
              ? prev.photos
              : mapped.photos;
            const cuisineTypes = (Array.isArray(prev?.cuisineTypes) && prev.cuisineTypes.length > 0)
              ? prev.cuisineTypes
              : (mapped.cuisineTypes || []);
            const dietaryOptions = (Array.isArray((prev as any)?.dietaryOptions) && (prev as any).dietaryOptions.length > 0)
              ? (prev as any).dietaryOptions
              : ((mapped as any).dietaryOptions || []);
            const recommendedDishes = (Array.isArray(prev?.recommendedDishes) && prev.recommendedDishes.length > 0)
              ? prev.recommendedDishes
              : (mapped.recommendedDishes || []);
            const approvalStatus = prev?.approvalStatus || mapped.approvalStatus || 'Draft';
            const averageMealPrice = prev?.averageMealPrice !== undefined ? prev.averageMealPrice : mapped.averageMealPrice;
            const currency = prev?.currency || mapped.currency || 'NRs';
            const location = (prev?.location && prev.location.trim() !== '' && prev.location !== 'N/A') ? prev.location : mapped.location;
            return { ...mapped, location, cuisineTypes, dietaryOptions, recommendedDishes, averageMealPrice, currency, approvalStatus, photos, imageUrl: mapped.imageUrl || photos[0] || '' } as RestaurantEntry;
          })
        : (prevRestaurants.length > 0 ? prevRestaurants : INITIAL_RESTAURANTS);

      prevRestaurants.forEach((pr) => {
        if (!mergedRestaurants.some(m => String(m.id) === String(pr.id))) {
          mergedRestaurants.unshift(pr as RestaurantEntry);
        }
      });
      this.restaurants = mergedRestaurants;

      const prevActivities = this.activities;
      const mergedActivities: ActivityEntry[] = Array.isArray(activities) && activities.length > 0
        ? activities.map((a: any) => {
            const mapped = mapActivity(a);
            const prev = prevActivities.find(p => String(p.id) === String(mapped.id));
            const photos = (Array.isArray(prev?.photos) && prev.photos.length > 0)
              ? prev.photos
              : mapped.photos;
            const approvalStatus = prev?.approvalStatus || mapped.approvalStatus || 'Draft';
            const pricing = prev?.pricing !== undefined ? prev.pricing : mapped.pricing;
            const currency = prev?.currency || mapped.currency || 'NRs';
            return { ...mapped, pricing, currency, approvalStatus, photos, imageUrl: mapped.imageUrl || photos[0] || '' } as ActivityEntry;
          })
        : (prevActivities.length > 0 ? prevActivities : INITIAL_ACTIVITIES);

      prevActivities.forEach((pa) => {
        if (!mergedActivities.some(m => String(m.id) === String(pa.id))) {
          mergedActivities.unshift(pa as ActivityEntry);
        }
      });
      this.activities = mergedActivities;

      const prevGuides = this.guides;
      const mergedGuides: GuideEntry[] = Array.isArray(guides) && guides.length > 0
        ? guides.map((g: any) => {
            const mapped = mapGuide(g);
            const prev = prevGuides.find(p => String(p.id) === String(mapped.id));
            const approvalStatus = prev?.approvalStatus || mapped.approvalStatus || 'Published';
            const dailyRate = prev?.dailyRate !== undefined ? prev.dailyRate : mapped.dailyRate;
            const currency = prev?.currency || mapped.currency || 'NRs';
            return (prev ? { ...mapped, ...prev, dailyRate, currency, approvalStatus } : { ...mapped, dailyRate, currency, approvalStatus }) as GuideEntry;
          })
        : (prevGuides.length > 0 ? prevGuides : INITIAL_GUIDES);

      prevGuides.forEach((pg) => {
        if (!mergedGuides.some(m => String(m.id) === String(pg.id))) {
          mergedGuides.unshift(pg as GuideEntry);
        }
      });
      this.guides = mergedGuides;

      const rawMediaList = Array.isArray(media) && media.length > 0 ? media.map(mapMedia) : INITIAL_MEDIA;
      const uniqueMediaList: MediaItem[] = [];
      const seenUrls = new Set<string>();
      for (const item of rawMediaList) {
        const key = (item.url || item.thumbnailUrl || '').trim().toLowerCase();
        if (key && !seenUrls.has(key)) {
          seenUrls.add(key);
          uniqueMediaList.push(item);
        } else if (!key) {
          uniqueMediaList.push(item);
        }
      }
      this.media = uniqueMediaList;
      this.logs = Array.isArray(logs) ? logs : INITIAL_LOGS;
      this.hydrated = true;
      this.notify();
    } catch (error) {
      console.error("Error in refreshAll, loading initial defaults:", error);
      if (this.hotels.length === 0) this.hotels = INITIAL_HOTELS;
      if (this.restaurants.length === 0) this.restaurants = INITIAL_RESTAURANTS;
      if (this.routes.length === 0) this.routes = INITIAL_ROUTES;
      if (this.transports.length === 0) this.transports = INITIAL_TRANSPORTS;
      if (this.activities.length === 0) this.activities = INITIAL_ACTIVITIES;
      if (this.guides.length === 0) this.guides = INITIAL_GUIDES;
      this.places = this.places.filter(p => !String(p.id).startsWith('place-') && !String(p.id).startsWith('demo-'));
      this.fuelStations = this.fuelStations.filter(f => !String(f.id).startsWith('fuel-'));
      if (this.media.length === 0) this.media = INITIAL_MEDIA;
      if (this.logs.length === 0) this.logs = INITIAL_LOGS;
      this.hydrated = true;
      this.notify();
    }
  }

  resetToDefaults() {
    void this.refreshAll();
  }

  getRole() { return this.currentRole; }
  setRole(role: RoleType) { this.currentRole = role; this.notify(); }

  getStats() {
    const places = this.getPlaces();
    const fuelStations = this.getFuelStations();
    const allItems: any[] = [
      ...this.transports,
      ...this.routes,
      ...this.hotels,
      ...this.restaurants,
      ...this.activities,
      ...this.guides,
      ...places,
      ...fuelStations,
    ];

    let draftCount = 0;
    let underReviewCount = 0;
    let approvedCount = 0;
    let publishedCount = 0;

    allItems.forEach((item) => {
      const status = item.approvalStatus || item.status || "Published";
      if (status === "Draft") draftCount++;
      else if (status === "Under Review") underReviewCount++;
      else if (status === "Approved") approvedCount++;
      else publishedCount++;
    });

    return {
      totalEntries: allItems.length + this.media.length,
      transportsCount: this.transports.length,
      routesCount: this.routes.length,
      hotelsCount: this.hotels.length,
      restaurantsCount: this.restaurants.length,
      activitiesCount: this.activities.length,
      guidesCount: this.guides.length,
      placesCount: places.length,
      fuelStationsCount: fuelStations.length,
      mediaCount: this.media.length,
      draftCount,
      underReviewCount,
      approvedCount,
      publishedCount,
    };
  }

  getWorkflowLogs() { return this.logs; }
  getTransports() { return this.transports; }
  getRoutes() { return this.routes; }
  getHotels() { return this.hotels; }
  getRestaurants() { return this.restaurants; }
  getActivities() { return this.activities; }
  getGuides() { return this.guides; }
  getPlaces() {
    return this.places.filter(p => !String(p.id).startsWith('place-') && !String(p.id).startsWith('demo-'));
  }
  getFuelStations() {
    if (!Array.isArray(this.fuelStations) || this.fuelStations.length === 0) {
      return INITIAL_FUEL_STATIONS;
    }
    return this.fuelStations;
  }
  getMedia() { return this.media; }
  isHydrated() { return this.hydrated; }

  getTransportById(id: string) { return this.transports.find(x => x.id === id); }
  getRouteById(id: string) { return this.routes.find(x => x.id === id); }
  getPlaceById(id: string) { return this.getPlaces().find(x => x.id === id); }
  getFuelStationById(id: string) { return this.getFuelStations().find(x => x.id === id); }

  async savePlace(entry: FamousPlaceEntry) {
    const isEdit = Boolean(entry.id && String(entry.id).trim() !== '' && String(entry.id) !== 'undefined');
    const id = isEdit ? String(entry.id) : `place_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const existingIndex = this.places.findIndex(p => String(p.id) === id);
    if (existingIndex >= 0) {
      this.places[existingIndex] = { ...entry, id, updatedAt: new Date().toISOString() };
    } else {
      this.places.unshift({
        ...entry,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.notify();
    return entry;
  }

  async deletePlace(id: string) {
    this.places = this.places.filter(p => String(p.id) !== String(id));
    this.notify();
  }

  async saveFuelStation(entry: FuelStationEntry) {
    const isEdit = Boolean(entry.id && String(entry.id).trim() !== '' && String(entry.id) !== 'undefined');
    const id = isEdit ? String(entry.id) : `fuel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const existingIndex = this.fuelStations.findIndex(f => String(f.id) === id);
    if (existingIndex >= 0) {
      this.fuelStations[existingIndex] = { ...entry, id, updatedAt: new Date().toISOString() };
    } else {
      this.fuelStations.unshift({
        ...entry,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.notify();
    return entry;
  }

  async deleteFuelStation(id: string) {
    this.fuelStations = this.fuelStations.filter(f => f.id !== id);
    this.notify();
  }

  async login(username: string, password: string) {
    const result = await apiRequest<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      auth: false,
      body: { username, password },
    });
    await saveToken(result.access_token);
    await this.refreshAll();
    return result;
  }

  async signup(payload: { email: string; username: string; full_name?: string; password: string }) {
    return apiRequest('/auth/signup', { method: 'POST', auth: false, body: payload });
  }

  async refreshToken() {
    const result = await apiRequest<{ access_token: string; token_type: string }>('/auth/refresh', { method: 'POST' });
    await saveToken(result.access_token);
    return result;
  }

  logout() {
    clearToken();
  }

  async saveTransport(entry: Partial<TransportEntry> & { id?: string; vehicleAmenities?: string[]; description?: string; dropPoint?: string; driverLicense?: string; from?: string; to?: string }) {
    const vehiclePhotos = (Array.isArray(entry.vehiclePhotos) && entry.vehiclePhotos.length > 0)
      ? entry.vehiclePhotos
      : (Array.isArray((entry as any).photos) && (entry as any).photos.length > 0)
      ? (entry as any).photos
      : (entry.driverPhotoUrl ? [entry.driverPhotoUrl] : []);
    const driverPhotoUrl = entry.driverPhotoUrl || vehiclePhotos[0] || '';
    const vehicleAmenities = Array.isArray((entry as any).vehicleAmenities) && (entry as any).vehicleAmenities.length > 0
      ? (entry as any).vehicleAmenities
      : (Array.isArray((entry as any).amenities) && (entry as any).amenities.length > 0 ? (entry as any).amenities : []);

    const payload = {
      operatorName: entry.operatorName || 'New Operator',
      contactPerson: entry.contactPerson || 'N/A',
      mobileNumber: entry.mobileNumber || 'N/A',
      whatsAppNumber: entry.whatsAppNumber || 'N/A',
      vehicleType: entry.vehicleType || 'Jeep',
      vehicleNumber: entry.vehicleNumber || 'N/A',
      seatCapacity: Number(entry.seatCapacity) || 0,
      route: entry.route || 'N/A',
      pickupPoint: entry.pickupPoint || 'N/A',
      dropPoint: entry.dropPoint || 'N/A',
      departureTime: entry.departureTime || 'N/A',
      fare: Number(entry.fare) || 0,
      currency: entry.currency || 'NPR',
      luggagePolicy: entry.luggagePolicy || 'N/A',
      driverPhotoUrl: driverPhotoUrl || null,
      vehiclePhotos: vehiclePhotos,
      photos: vehiclePhotos,
      vehicleAmenities: vehicleAmenities,
      vehicle_amenities: vehicleAmenities,
      amenities: vehicleAmenities,
      driverLicense: entry.driverLicense || '',
      driver_license: entry.driverLicense || '',
      licenseNumber: entry.driverLicense || '',
      licenceVerified: !!entry.licenceVerified,
      activeStatus: entry.activeStatus || 'Active',
      approvalStatus: entry.approvalStatus || 'Draft',
      description: entry.description || '',
      createdByName: entry.createdByName || 'Goji Admin',
    };

    if (entry.id) {
      this.transports = this.transports.map(t => String(t.id) === String(entry.id) ? { ...t, ...entry, ...payload } as any : t);
    } else {
      const newTransport: any = { id: `tr-${Date.now()}`, ...entry, ...payload };
      this.transports.unshift(newTransport);
    }

    this.notify();

    const method = entry.id ? 'PATCH' : 'POST';
    const path = entry.id ? `/transport/${Number(entry.id)}` : '/transport';
    try {
      await apiRequest(path, { method, body: payload }).catch(() => null);
    } catch (error) {
      console.warn("Backend transport save fallback to local memory:", error);
    }
  }

  async deleteTransport(id: string) { await apiRequest(`/transport/${Number(id)}`, { method: 'DELETE' }); await this.refreshAll(); }

  async saveRoute(entry: Partial<RouteEntry> & { id?: string }) {
    const photos = (Array.isArray(entry.photos) && entry.photos.length > 0)
      ? entry.photos
      : (Array.isArray((entry as any).routePhotos) && (entry as any).routePhotos.length > 0)
      ? (entry as any).routePhotos
      : (entry.imageUrl ? [entry.imageUrl] : []);
    const imageUrl = entry.imageUrl || photos[0] || '';
    const payload = {
      routeName: entry.routeName || 'New Route',
      origin: entry.origin || '',
      destination: entry.destination || '',
      totalDistanceKm: Number(entry.totalDistanceKm) || 0,
      estimatedTravelTime: entry.estimatedTravelTime || 'N/A',
      roadCondition: entry.roadCondition || 'N/A',
      weatherSummary: entry.weatherSummary || 'N/A',
      imageUrl: imageUrl || null,
      photos: photos,
      routePhotos: photos,
      approvalStatus: entry.approvalStatus && entry.approvalStatus.trim() !== '' ? entry.approvalStatus : 'Draft',
      createdByName: entry.createdByName || (typeof window !== 'undefined' && localStorage.getItem('gojitrip_username')) || 'Goji Admin',
    };

    if (entry.id) {
      this.routes = this.routes.map(r => r.id === String(entry.id) ? { ...r, ...entry, imageUrl, photos, routePhotos: photos } as RouteEntry : r);
    } else {
      const newRoute: RouteEntry = { id: `rt-${Date.now()}`, ...entry, imageUrl, photos, routePhotos: photos } as RouteEntry;
      this.routes.unshift(newRoute);
    }
    this.notify();

    try {
      const method = entry.id ? 'PATCH' : 'POST';
      const path = entry.id ? `/routes/${Number(entry.id)}` : '/routes';
      await apiRequest(path, { method, body: payload });
      await this.refreshAll();
    } catch (err) {
      console.warn("Route save backend sync error, kept in local state:", err);
    }
    return entry.id ? this.routes.find(r => r.id === String(entry.id)) : this.routes[0];
  }
  async deleteRoute(id: string) { await apiRequest(`/routes/${Number(id)}`, { method: 'DELETE' }); await this.refreshAll(); }

  async saveHotel(entry: Partial<HotelEntry> & { id?: string }) {
    const photos = (Array.isArray(entry.hotelPhotos) && entry.hotelPhotos.length > 0)
      ? entry.hotelPhotos
      : (Array.isArray((entry as any).photos) && (entry as any).photos.length > 0)
      ? (entry as any).photos
      : (entry.imageUrl ? [entry.imageUrl] : []);
    const imageUrl = entry.imageUrl || photos[0] || '';

    const roomTypes = Array.isArray(entry.roomTypes) ? entry.roomTypes : [];
    const facilities = Array.isArray(entry.facilities) ? entry.facilities : [];

    const payload = {
      hotelName: entry.hotelName || 'New Hotel',
      propertyType: entry.propertyType || 'Hotel',
      contactPerson: entry.contactPerson || 'N/A',
      phoneNumber: entry.phoneNumber || 'N/A',
      location: entry.location || 'N/A',
      latitude: Number(entry.latitude) || 0,
      longitude: Number(entry.longitude) || 0,
      checkInTime: entry.checkInTime || 'N/A',
      checkOutTime: entry.checkOutTime || 'N/A',
      availabilityStatus: entry.availabilityStatus || 'Available',
      partnerStatus: entry.partnerStatus || 'Standard',
      imageUrl: imageUrl || null,
      hotelPhotos: photos,
      photos: photos,
      pricePerNight: Number(entry.pricePerNight) || 2500,
      currency: entry.currency || 'NRs',
      facilities: facilities,
      roomTypes: roomTypes,
      approvalStatus: entry.approvalStatus || 'Published',
      createdByName: entry.createdByName || 'API',
    };

    const isEdit = Boolean(entry.id && String(entry.id).trim() !== '' && String(entry.id) !== 'undefined');
    const savedId = isEdit ? String(entry.id) : `ht_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (isEdit) {
      this.hotels = this.hotels.map(h =>
        (String(h.id) === String(entry.id) || (h.hotelName && entry.hotelName && h.hotelName.toLowerCase().trim() === entry.hotelName.toLowerCase().trim()))
          ? { ...h, ...entry, id: savedId, imageUrl, hotelPhotos: photos, photos: photos, roomTypes, facilities, currency: entry.currency || h.currency || 'NRs' } as unknown as HotelEntry
          : h
      );
    } else {
      const newHotel: HotelEntry = { ...entry, id: savedId, imageUrl, hotelPhotos: photos, photos: photos, roomTypes, facilities, currency: entry.currency || 'NRs' } as unknown as HotelEntry;
      this.hotels.unshift(newHotel);
    }
    this.notify();

    try {
      const method = isEdit ? 'PATCH' : 'POST';
      const path = isEdit ? `/hotels/${Number(entry.id)}` : '/hotels';
      const backendRes: any = await apiRequest(path, { method, body: payload }).catch(() => null);
      if (backendRes && backendRes.id && !isEdit) {
        this.hotels = this.hotels.map(h => String(h.id) === String(savedId) ? { ...h, id: String(backendRes.id) } as HotelEntry : h);
        this.notify();
      }
    } catch (err) {
      console.warn("Hotel save backend sync error, kept in local state:", err);
    }
  }
  async deleteHotel(id: string | number) {
    const sId = String(id);
    this.hotels = this.hotels.filter(h => String(h.id) !== sId);
    this.notify();
    try {
      const num = Number(id);
      if (!isNaN(num) && num > 0) {
        await apiRequest(`/hotels/${num}`, { method: 'DELETE' });
      }
    } catch (e) {
      console.warn("Hotel delete backend sync notice:", e);
    }
  }

  async saveRestaurant(entry: Partial<RestaurantEntry> & { id?: string }) {
    const photos = (Array.isArray(entry.photos) && entry.photos.length > 0)
      ? entry.photos
      : (entry.imageUrl ? [entry.imageUrl] : []);
    const imageUrl = entry.imageUrl || photos[0] || '';

    const payload = {
      restaurantName: entry.restaurantName || 'New Restaurant',
      location: entry.location || 'N/A',
      contactDetails: entry.contactDetails || 'N/A',
      cuisineTypes: entry.cuisineTypes || [],
      openingHours: entry.openingHours || 'N/A',
      priceRange: entry.priceRange || 'NPR NPR',
      currency: entry.currency || 'NRs',
      averageMealPrice: Number(entry.averageMealPrice) || 650,
      imageUrl: imageUrl || null,
      photos: photos,
      approvalStatus: entry.approvalStatus || 'Published',
      createdByName: entry.createdByName || 'API',
    };

    const isEdit = Boolean(entry.id && String(entry.id).trim() !== '' && String(entry.id) !== 'undefined');
    const savedId = isEdit ? String(entry.id) : `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (isEdit) {
      this.restaurants = this.restaurants.map(r => String(r.id) === String(entry.id) ? { ...r, ...entry, id: savedId, imageUrl, photos: photos, currency: entry.currency || r.currency || 'NRs' } as RestaurantEntry : r);
    } else {
      const newRest: RestaurantEntry = { ...entry, id: savedId, imageUrl, photos: photos, currency: entry.currency || 'NRs' } as RestaurantEntry;
      this.restaurants.unshift(newRest);
    }
    this.notify();

    try {
      const method = isEdit ? 'PATCH' : 'POST';
      const path = isEdit ? `/restaurants/${Number(entry.id)}` : '/restaurants';
      const backendRes: any = await apiRequest(path, { method, body: payload }).catch(() => null);
      if (backendRes && backendRes.id && !isEdit) {
        this.restaurants = this.restaurants.map(r => String(r.id) === String(savedId) ? { ...r, id: String(backendRes.id) } as RestaurantEntry : r);
        this.notify();
      }
    } catch (err) {
      console.warn("Restaurant save backend sync error, kept in local state:", err);
    }
  }
  async deleteRestaurant(id: string | number) {
    const sId = String(id);
    this.restaurants = this.restaurants.filter(r => String(r.id) !== sId);
    this.notify();
    try {
      const num = Number(id);
      if (!isNaN(num) && num > 0) {
        await apiRequest(`/restaurants/${num}`, { method: 'DELETE' });
      }
    } catch (e) {
      console.warn("Restaurant delete backend sync notice:", e);
    }
  }

  async saveActivity(entry: Partial<ActivityEntry> & { id?: string }) {
    const photos = (Array.isArray(entry.photos) && entry.photos.length > 0)
      ? entry.photos
      : (entry.imageUrl ? [entry.imageUrl] : []);
    const imageUrl = entry.imageUrl || photos[0] || '';

    const payload = {
      activityName: entry.activityName || 'New Activity',
      guideName: entry.guideName || 'N/A',
      guideContact: entry.guideContactDetails || 'N/A',
      pricing: Number(entry.pricing) || 0,
      currency: entry.currency || 'NRs',
      duration: entry.duration || 'N/A',
      difficultyLevel: entry.difficultyLevel || 'Easy',
      availability: entry.availability || 'Daily',
      approvalStatus: entry.approvalStatus || 'Published',
      createdByName: entry.createdByName || 'API',
      imageUrl: imageUrl || '',
      photos: photos,
    };

    const isEdit = Boolean(entry.id && String(entry.id).trim() !== '' && String(entry.id) !== 'undefined');
    const savedId = isEdit ? String(entry.id) : `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (isEdit) {
      this.activities = this.activities.map(a => String(a.id) === String(entry.id) ? { ...a, ...entry, id: savedId, imageUrl, photos, currency: entry.currency || a.currency || 'NRs' } as ActivityEntry : a);
    } else {
      const newAct: ActivityEntry = { ...entry, id: savedId, imageUrl, photos, currency: entry.currency || 'NRs' } as ActivityEntry;
      this.activities.unshift(newAct);
    }
    this.notify();

    try {
      const method = isEdit ? 'PATCH' : 'POST';
      const path = isEdit ? `/activities/${Number(entry.id) || entry.id}` : '/activities';
      const backendRes: any = await apiRequest(path, { method, body: payload }).catch(() => null);
      if (backendRes && backendRes.id && !isEdit) {
        this.activities = this.activities.map(a => String(a.id) === String(savedId) ? { ...a, id: String(backendRes.id) } as ActivityEntry : a);
        this.notify();
      }
    } catch (err) {
      console.warn("Activity save backend sync error, kept in local state:", err);
    }
  }
  async deleteActivity(id: string | number) {
    const sId = String(id);
    this.activities = this.activities.filter(a => String(a.id) !== sId);
    this.notify();
    try {
      const num = Number(id);
      if (!isNaN(num) && num > 0) {
        await apiRequest(`/activities/${num}`, { method: 'DELETE' });
      }
    } catch (e) {
      console.warn("Activity delete backend sync notice:", e);
    }
  }

  async saveGuide(entry: Partial<GuideEntry> & { id?: string }) {
    const photoUrl = entry.photoUrl || entry.imageUrl || '';
    const payload = {
      fullName: entry.fullName || 'New Guide',
      contactNumber: entry.contactNumber || 'N/A',
      licenseNumber: entry.licenseNumber || 'NPL-GUIDE-101',
      languages: entry.languages || ['English', 'Nepali'],
      experienceYears: Number(entry.experienceYears) || 3,
      specialization: entry.specialization || 'Mountain Guide',
      dailyRate: Number(entry.dailyRate) || 3000,
      currency: entry.currency || 'NRs',
      bio: entry.bio || '',
      photoUrl: photoUrl || '',
      imageUrl: photoUrl || '',
      location: entry.location || 'Pokhara / Kathmandu',
      approvalStatus: entry.approvalStatus || 'Published',
      createdByName: entry.createdByName || 'Admin',
    };

    if (entry.id) {
      this.guides = this.guides.map(g => g.id === String(entry.id) ? { ...g, ...entry, photoUrl, currency: entry.currency || g.currency || 'NRs' } as GuideEntry : g);
    } else {
      const newGuide: GuideEntry = { id: `gd-${Date.now()}`, ...entry, photoUrl, currency: entry.currency || 'NRs' } as GuideEntry;
      this.guides.unshift(newGuide);
    }
    this.notify();

    try {
      const isNew = !entry.id || String(entry.id).startsWith('gd-') || String(entry.id).startsWith('guide_');
      const method = isNew ? 'POST' : 'PATCH';
      const path = isNew ? '/guides' : `/guides/${Number(entry.id) || entry.id}`;
      await apiRequest(path, { method, body: payload }).catch(() => null);
      await this.refreshAll();
    } catch (err) {
      console.warn("Guide save backend sync error, kept in local state:", err);
    }
  }
  async deleteGuide(id: string | number) {
    const sId = String(id);
    this.guides = this.guides.filter(g => String(g.id) !== sId);
    this.notify();
    try {
      const num = Number(id);
      if (!isNaN(num) && num > 0) {
        await apiRequest(`/guides/${num}`, { method: 'DELETE' });
      }
    } catch (e) {
      console.warn("Guide delete backend sync notice:", e);
    }
  }

  async addMedia(entry: Partial<MediaItem> & { url: string }) {
    const cleanUrl = (entry.url || '').trim();
    if (!cleanUrl) return;
    const exists = this.media.some(m => (m.url || '').trim().toLowerCase() === cleanUrl.toLowerCase());
    if (exists) {
      console.log("Media item already exists in library, skipping duplicate:", cleanUrl);
      return;
    }
    await apiRequest('/media/upload', {
      method: 'POST',
      body: {
        url: cleanUrl,
        title: entry.title || 'Uploaded Media',
        category: entry.category || 'Destinations'
      }
    }).catch(() => null);
    await this.refreshAll();
  }
  async deleteMedia(id: string) { await apiRequest(`/media/${Number(id)}`, { method: 'DELETE' }); await this.refreshAll(); }

  updateStatus(entityType: string, entityId: string, newStatus: ApprovalStatus, comment?: string) {
    const type = (entityType || '').toLowerCase();
    const id = String(entityId);

    let previousStatus: ApprovalStatus = 'Draft';
    let entityTitle = 'Entity';

    if (type.includes('hotel')) {
      this.hotels = this.hotels.map(h => {
        if (String(h.id) === id) {
          previousStatus = h.approvalStatus;
          entityTitle = h.hotelName || 'Hotel';
          return { ...h, approvalStatus: newStatus, updatedAt: new Date().toISOString() };
        }
        return h;
      });
    } else if (type.includes('restaurant')) {
      this.restaurants = this.restaurants.map(r => {
        if (String(r.id) === id) {
          previousStatus = r.approvalStatus;
          entityTitle = r.restaurantName || 'Restaurant';
          return { ...r, approvalStatus: newStatus, updatedAt: new Date().toISOString() };
        }
        return r;
      });
    } else if (type.includes('activity')) {
      this.activities = this.activities.map(a => {
        if (String(a.id) === id) {
          previousStatus = a.approvalStatus;
          entityTitle = a.activityName || 'Activity';
          return { ...a, approvalStatus: newStatus, updatedAt: new Date().toISOString() };
        }
        return a;
      });
    } else if (type.includes('guide')) {
      this.guides = this.guides.map(g => {
        if (String(g.id) === id) {
          previousStatus = g.approvalStatus;
          entityTitle = g.fullName || 'Guide';
          return { ...g, approvalStatus: newStatus, updatedAt: new Date().toISOString() };
        }
        return g;
      });
    } else if (type.includes('route')) {
      this.routes = this.routes.map(rt => {
        if (String(rt.id) === id) {
          previousStatus = rt.approvalStatus;
          entityTitle = rt.routeName || 'Route';
          return { ...rt, approvalStatus: newStatus, updatedAt: new Date().toISOString() };
        }
        return rt;
      });
    } else if (type.includes('transport')) {
      this.transports = this.transports.map(t => {
        if (String(t.id) === id) {
          previousStatus = t.approvalStatus;
          entityTitle = t.operatorName || 'Transport';
          return { ...t, approvalStatus: newStatus, updatedAt: new Date().toISOString() };
        }
        return t;
      });
    } else if (type.includes('place')) {
      this.places = this.places.map(p => {
        if (String(p.id) === id) {
          previousStatus = p.approvalStatus;
          entityTitle = p.name || 'Famous Place';
          return { ...p, approvalStatus: newStatus, updatedAt: new Date().toISOString() };
        }
        return p;
      });
    } else if (type.includes('fuel')) {
      this.fuelStations = this.fuelStations.map(f => {
        if (String(f.id) === id) {
          previousStatus = f.approvalStatus;
          entityTitle = f.name || 'Fuel Station';
          return { ...f, approvalStatus: newStatus, updatedAt: new Date().toISOString() };
        }
        return f;
      });
    }

    this.logs.unshift({
      id: `log_${Date.now()}`,
      entityType: (entityType.charAt(0).toUpperCase() + entityType.slice(1)) as any,
      entityId: id,
      entityTitle: entityTitle,
      previousStatus: previousStatus,
      newStatus: newStatus,
      changedByRole: 'Admin',
      changedByName: 'Goji Admin',
      comment: comment || `Inline status update to ${newStatus}`,
      timestamp: new Date().toISOString(),
    });

    this.notify();

    // Async backend sync for status
    const numId = Number(id);
    if (!isNaN(numId) && numId > 0) {
      let endpoint = '';
      if (type.includes('hotel')) endpoint = `/hotels/${numId}`;
      else if (type.includes('restaurant')) endpoint = `/restaurants/${numId}`;
      else if (type.includes('activity')) endpoint = `/activities/${numId}`;
      else if (type.includes('guide')) endpoint = `/guides/${numId}`;
      else if (type.includes('route')) endpoint = `/routes/${numId}`;

      if (endpoint) {
        apiRequest(endpoint, { method: 'PATCH', body: { approvalStatus: newStatus } }).catch(() => null);
      }
    }
  }
}

export const cmsStore = new CMSStore();
