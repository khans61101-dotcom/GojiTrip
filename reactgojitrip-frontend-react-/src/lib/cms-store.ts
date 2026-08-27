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
} from '@/types/cms';
import { INITIAL_ACTIVITIES, INITIAL_HOTELS, INITIAL_MEDIA, INITIAL_RESTAURANTS, INITIAL_ROUTES, INITIAL_TRANSPORTS, INITIAL_GUIDES, INITIAL_LOGS } from '@/lib/initial-data';

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
  activitiesCount: 0, mediaCount: 0, draftCount: 0, underReviewCount: 0, approvedCount: 0, publishedCount: 0, guidesCount: 0,
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

  return {
    id: String(h.id),
    hotelName: h.hotelName,
    propertyType: h.propertyType,
    contactPerson: h.contactPerson,
    phoneNumber: h.phoneNumber,
    location: h.location,
    latitude: h.latitude,
    longitude: h.longitude,
    roomTypes: Array.isArray(h.roomTypes) ? h.roomTypes : [],
    facilities: Array.isArray(h.facilities) ? h.facilities : [],
    checkInTime: h.checkInTime,
    checkOutTime: h.checkOutTime,
    imageUrl,
    hotelPhotos: photos,
    photos: photos,
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
    } catch (e) {
      console.warn("Failed to save CMS store to localStorage:", e);
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

      this.transports = Array.isArray(trips) && trips.length > 0 ? trips.map(mapTrip) : INITIAL_TRANSPORTS;
      
      this.routes = Array.isArray(routes) && routes.length > 0 
        ? routes.map((r: any) => {
            const mapped = mapRoute(r);
            const prev = prevRoutes.find(p => p.id === mapped.id);
            const photos = (Array.isArray(prev?.photos) && prev.photos.length > 0)
              ? prev.photos
              : (Array.isArray((prev as any)?.routePhotos) && (prev as any).routePhotos.length > 0)
              ? (prev as any).routePhotos
              : mapped.photos;
            return { ...mapped, photos, routePhotos: photos, imageUrl: mapped.imageUrl || photos[0] || '' };
          })
        : (prevRoutes.length > 0 ? prevRoutes : INITIAL_ROUTES);

      this.hotels = Array.isArray(hotels) && hotels.length > 0
        ? hotels.map((h: any) => {
            const mapped = mapHotel(h);
            const prev = prevHotels.find(p => p.id === mapped.id);
            const photos = (Array.isArray(prev?.hotelPhotos) && prev.hotelPhotos.length > 0)
              ? prev.hotelPhotos
              : (Array.isArray(prev?.photos) && prev.photos.length > 0)
              ? prev.photos
              : mapped.hotelPhotos;
            return { ...mapped, hotelPhotos: photos, photos: photos, imageUrl: mapped.imageUrl || photos[0] || '' };
          })
        : (prevHotels.length > 0 ? prevHotels : INITIAL_HOTELS);

      this.restaurants = Array.isArray(restaurants) && restaurants.length > 0
        ? restaurants.map((r: any) => {
            const mapped = mapRestaurant(r);
            const prev = prevRestaurants.find(p => p.id === mapped.id);
            const photos = (Array.isArray(prev?.photos) && prev.photos.length > 0)
              ? prev.photos
              : mapped.photos;
            return { ...mapped, photos, imageUrl: mapped.imageUrl || photos[0] || '' };
          })
        : (prevRestaurants.length > 0 ? prevRestaurants : INITIAL_RESTAURANTS);

      this.activities = Array.isArray(activities) && activities.length > 0 ? activities.map(mapActivity) : INITIAL_ACTIVITIES;
      this.guides = Array.isArray(guides) && guides.length > 0 ? guides.map(mapGuide) : INITIAL_GUIDES;
      this.media = Array.isArray(media) && media.length > 0 ? media.map(mapMedia) : INITIAL_MEDIA;
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
    return {
      totalEntries: this.transports.length + this.routes.length + this.hotels.length + this.restaurants.length + this.activities.length + this.guides.length + this.media.length,
      transportsCount: this.transports.length,
      routesCount: this.routes.length,
      hotelsCount: this.hotels.length,
      restaurantsCount: this.restaurants.length,
      activitiesCount: this.activities.length,
      guidesCount: this.guides.length,
      mediaCount: this.media.length,
      draftCount: 0,
      underReviewCount: 0,
      approvedCount: 0,
      publishedCount: 0,
    };
  }

  getWorkflowLogs() { return this.logs; }
  getTransports() { return this.transports; }
  getRoutes() { return this.routes; }
  getHotels() { return this.hotels; }
  getRestaurants() { return this.restaurants; }
  getActivities() { return this.activities; }
  getGuides() { return this.guides; }
  getMedia() { return this.media; }
  isHydrated() { return this.hydrated; }

  getTransportById(id: string) { return this.transports.find(x => x.id === id); }
  getRouteById(id: string) { return this.routes.find(x => x.id === id); }

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

  async saveTransport(entry: Partial<TransportEntry> & { id?: string }) {
    const payload = {
      operatorName: entry.operatorName || 'New Operator',
      contactPerson: entry.contactPerson || 'N/A',
      mobileNumber: entry.mobileNumber || 'N/A',
      whatsAppNumber: entry.whatsAppNumber || 'N/A',
      vehicleType: entry.vehicleType || 'Other',
      vehicleNumber: entry.vehicleNumber || 'N/A',
      seatCapacity: Number(entry.seatCapacity) || 0,
      route: entry.route || 'N/A',
      pickupPoint: entry.pickupPoint || 'N/A',
      departureTime: entry.departureTime || 'N/A',
      fare: Number(entry.fare) || 0,
      currency: entry.currency || 'USD',
      luggagePolicy: entry.luggagePolicy || 'N/A',
      driverPhotoUrl: entry.driverPhotoUrl || null,
      vehiclePhotos: entry.vehiclePhotos || [],
      licenceVerified: !!entry.licenceVerified,
      activeStatus: entry.activeStatus || 'ACTIVE',
      approvalStatus: entry.approvalStatus || 'PENDING',
      createdByName: entry.createdByName || 'API',
    };
    const method = entry.id ? 'PATCH' : 'POST';
    const path = entry.id ? `/transport/${Number(entry.id)}` : '/transport';
    try {
      await apiRequest(path, { method, body: payload });
      await this.refreshAll();
    } catch (error) {
      console.error('Failed to save transport:', error);
      throw error;
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
      approvalStatus: entry.approvalStatus || 'Draft',
      createdByName: entry.createdByName || 'API',
    };

    if (entry.id) {
      this.hotels = this.hotels.map(h => h.id === String(entry.id) ? { ...h, ...entry, imageUrl, hotelPhotos: photos, photos: photos } as HotelEntry : h);
    } else {
      const newHotel: HotelEntry = { id: `ht-${Date.now()}`, ...entry, imageUrl, hotelPhotos: photos, photos: photos } as HotelEntry;
      this.hotels.unshift(newHotel);
    }
    this.notify();

    try {
      const method = entry.id ? 'PATCH' : 'POST';
      const path = entry.id ? `/hotels/${Number(entry.id)}` : '/hotels';
      await apiRequest(path, { method, body: payload });
      await this.refreshAll();
    } catch (err) {
      console.warn("Hotel save backend sync error, kept in local state:", err);
    }
  }
  async deleteHotel(id: string) {
    this.hotels = this.hotels.filter(h => h.id !== id);
    this.notify();
    try { await apiRequest(`/hotels/${Number(id)}`, { method: 'DELETE' }); await this.refreshAll(); } catch (e) {}
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
      imageUrl: imageUrl || null,
      photos: photos,
      approvalStatus: entry.approvalStatus || 'Draft',
      createdByName: entry.createdByName || 'API',
    };

    if (entry.id) {
      this.restaurants = this.restaurants.map(r => r.id === String(entry.id) ? { ...r, ...entry, imageUrl, photos: photos } as RestaurantEntry : r);
    } else {
      const newRest: RestaurantEntry = { id: `res-${Date.now()}`, ...entry, imageUrl, photos: photos } as RestaurantEntry;
      this.restaurants.unshift(newRest);
    }
    this.notify();
    try {
      const isNew = !entry.id || String(entry.id).startsWith('res-');
      const method = isNew ? 'POST' : 'PATCH';
      const path = isNew ? '/restaurants' : `/restaurants/${Number(entry.id)}`;
      await apiRequest(path, { method, body: payload });
      await this.refreshAll();
    } catch (err) {
      console.warn("Restaurant save backend sync error, kept in local state:", err);
    }
  }
  async deleteRestaurant(id: string) {
    this.restaurants = this.restaurants.filter(r => r.id !== id);
    this.notify();
    try { await apiRequest(`/restaurants/${Number(id)}`, { method: 'DELETE' }); await this.refreshAll(); } catch (e) {}
  }

  async saveActivity(entry: Partial<ActivityEntry> & { id?: string }) {
    const imageUrl = entry.imageUrl || (entry.photos && entry.photos[0]) || '';
    const payload = {
      activityName: entry.activityName || 'New Activity',
      guideName: entry.guideName || 'N/A',
      guideContact: entry.guideContactDetails || 'N/A',
      pricing: Number(entry.pricing) || 0,
      duration: entry.duration || 'N/A',
      difficultyLevel: entry.difficultyLevel || 'Easy',
      availability: entry.availability || 'Daily',
      approvalStatus: entry.approvalStatus || 'Draft',
      createdByName: entry.createdByName || 'API',
      imageUrl: imageUrl || '',
      photos: imageUrl ? [imageUrl] : [],
    };

    if (entry.id) {
      this.activities = this.activities.map(a => a.id === String(entry.id) ? { ...a, ...entry, imageUrl, photos: imageUrl ? [imageUrl] : [] } as ActivityEntry : a);
    } else {
      const newAct: ActivityEntry = { id: `act-${Date.now()}`, ...entry, imageUrl, photos: imageUrl ? [imageUrl] : [] } as ActivityEntry;
      this.activities.unshift(newAct);
    }
    this.notify();

    try {
      const isNew = !entry.id || String(entry.id).startsWith('act-') || String(entry.id).startsWith('activity_');
      const method = isNew ? 'POST' : 'PATCH';
      const path = isNew ? '/activities' : `/activities/${Number(entry.id)}`;
      await apiRequest(path, { method, body: payload });
      await this.refreshAll();
    } catch (err) {
      console.warn("Activity save backend sync error, kept in local state:", err);
    }
  }
  async deleteActivity(id: string) {
    this.activities = this.activities.filter(a => a.id !== id);
    this.notify();
    try { await apiRequest(`/activities/${id}`, { method: 'DELETE' }); await this.refreshAll(); } catch (e) {}
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
      bio: entry.bio || '',
      photoUrl: photoUrl || '',
      imageUrl: photoUrl || '',
      location: entry.location || 'Pokhara / Kathmandu',
      approvalStatus: entry.approvalStatus || 'Published',
      createdByName: entry.createdByName || 'Admin',
    };

    if (entry.id) {
      this.guides = this.guides.map(g => g.id === String(entry.id) ? { ...g, ...entry, photoUrl } as GuideEntry : g);
    } else {
      const newGuide: GuideEntry = { id: `gd-${Date.now()}`, ...entry, photoUrl } as GuideEntry;
      this.guides.unshift(newGuide);
    }
    this.notify();

    try {
      const isNew = !entry.id || String(entry.id).startsWith('gd-') || String(entry.id).startsWith('guide_');
      const method = isNew ? 'POST' : 'PATCH';
      const path = isNew ? '/guides' : `/guides/${Number(entry.id)}`;
      await apiRequest(path, { method, body: payload });
      await this.refreshAll();
    } catch (err) {
      console.warn("Guide save backend sync error, kept in local state:", err);
    }
  }
  async deleteGuide(id: string) {
    this.guides = this.guides.filter(g => g.id !== id);
    this.notify();
    try { await apiRequest(`/guides/${id}`, { method: 'DELETE' }); await this.refreshAll(); } catch (e) {}
  }

  async addMedia(entry: Partial<MediaItem> & { url: string }) {
    await apiRequest('/media/upload', {
      method: 'POST',
      body: {
        url: entry.url,
        title: entry.title || 'Uploaded Media',
        category: entry.category || 'Destinations'
      }
    });
    await this.refreshAll();
  }
  async deleteMedia(id: string) { await apiRequest(`/media/${Number(id)}`, { method: 'DELETE' }); await this.refreshAll(); }

  updateStatus(_entityType: string, _entityId: string, _newStatus: ApprovalStatus, _comment?: string) {
    this.notify();
  }
}

export const cmsStore = new CMSStore();
