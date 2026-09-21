export interface RoomType {
  id: string;
  name: string;
  type: string;
  pricePerNight: number;
  capacity: number;
  availableRooms: number;
  amenities: string[];
}

export interface Hotel {
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
  status?: 'draft' | 'under-review' | 'approved' | 'published';
  roomTypes?: RoomType[];
  propertyType?: string;
  contactPerson?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  checkInTime?: string;
  checkOutTime?: string;
  availabilityStatus?: string;
  partnerStatus?: string;
  source?: 'cms' | 'api' | 'google';
  placeId?: string;
  googleRating?: number;
}
