import { TransportEntry, RouteEntry, HotelEntry, RestaurantEntry, ActivityEntry, GuideEntry, MediaItem, WorkflowHistoryLog } from '@/types/cms';

export const INITIAL_TRANSPORTS: TransportEntry[] = [
  {
    id: 'tr-1',
    operatorName: 'Annapurna Super Express 4x4',
    contactPerson: 'Pasang Sherpa',
    mobileNumber: '+977-9856012345',
    whatsAppNumber: '+977-9856012345',
    vehicleType: 'Jeep',
    vehicleNumber: 'Ga 2 Cha 8891',
    seatCapacity: 7,
    route: 'Pokhara → Muktinath (via Jomsom)',
    pickupPoint: 'Baglung Bus Park, Pokhara',
    departureTime: '06:30 AM Daily',
    fare: 2500,
    currency: 'NPR',
    luggagePolicy: 'Max 20kg main bag + 1 daypack per seat',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    vehiclePhotos: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80'
    ],
    licenceVerified: true,
    activeStatus: 'Active',
    approvalStatus: 'Approved',
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-07-25T14:30:00Z',
    createdByName: 'Nabin Gurung (Content Team)'
  },
  {
    id: 'tr-2',
    operatorName: 'Mustang EV Shuttle Services',
    contactPerson: 'Sujata Thakali',
    mobileNumber: '+977-9846098765',
    whatsAppNumber: '+977-9846098765',
    vehicleType: 'EV',
    vehicleNumber: 'Ba Pro 01-026-Cha 4512',
    seatCapacity: 11,
    route: 'Pokhara → Tatopani Hot Springs',
    pickupPoint: 'Lakeside Center, Pokhara',
    departureTime: '08:00 AM Daily',
    fare: 1800,
    currency: 'NPR',
    luggagePolicy: 'Soft duffel bags only, up to 15kg',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    vehiclePhotos: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
    ],
    licenceVerified: true,
    activeStatus: 'Active',
    approvalStatus: 'Published',
    createdAt: '2026-07-22T09:15:00Z',
    updatedAt: '2026-07-27T11:00:00Z',
    createdByName: 'Deepa Adhikari (Senior Editor)'
  },
  {
    id: 'tr-3',
    operatorName: 'Highland Scorpio Deluxe Travels',
    contactPerson: 'Bikram Shrestha',
    mobileNumber: '+977-9801122334',
    whatsAppNumber: '+977-9801122334',
    vehicleType: 'Scorpio',
    vehicleNumber: 'Ga 1 Cha 4410',
    seatCapacity: 6,
    route: 'Jomsom → Muktinath Temple',
    pickupPoint: 'Jomsom Airport Gate',
    departureTime: 'On Demand / hourly',
    fare: 1200,
    currency: 'NPR',
    luggagePolicy: 'Standard travel luggage',
    vehiclePhotos: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
    ],
    licenceVerified: false,
    activeStatus: 'Active',
    approvalStatus: 'Under Review',
    createdAt: '2026-07-27T16:45:00Z',
    updatedAt: '2026-07-27T16:45:00Z',
    createdByName: 'Ramesh Karki (Field Officer)'
  }
];

export const INITIAL_ROUTES: RouteEntry[] = [
  {
    id: 'rt-1',
    routeName: 'Pokhara → Muktinath Pilgrimage Highway',
    origin: 'Pokhara Lakeside (Elev. 822m)',
    destination: 'Muktinath Temple (Elev. 3,710m)',
    totalDistanceKm: 174,
    estimatedTravelTime: '7 - 9 Hours',
    roadCondition: 'Passable 4x4 Only',
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    photos: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'],
    fuelStations: [
      { id: 'poi-1', name: 'NOC Fuel Depot Beni', category: 'Fuel Station', location: 'Beni Bazaar', contactNumber: '+977-68-520111' },
      { id: 'poi-2', name: 'Jomsom Petroleum Station', category: 'Fuel Station', location: 'Jomsom Airport Road' }
    ],
    evChargingStations: [
      { id: 'poi-3', name: 'GojiTrip Fast Charger Beni', category: 'EV Charger', location: 'Beni Riverbank Rest Stop', details: '60kW DC Fast Dual Gun' },
      { id: 'poi-4', name: 'Tatopani Eco Resort EV Plug', category: 'EV Charger', location: 'Tatopani Hot Springs', details: '22kW AC Type 2' }
    ],
    medicalCentres: [
      { id: 'poi-5', name: 'Beni District Hospital', category: 'Medical Centre', location: 'Beni Town', contactNumber: '+977-68-520022' },
      { id: 'poi-6', name: 'Mountain Rescue Clinic Jomsom', category: 'Medical Centre', location: 'Jomsom Army Camp Post' }
    ],
    policePosts: [
      { id: 'poi-7', name: 'ACAP Permit Checkpost Tatopani', category: 'Police Post', location: 'Tatopani Gate', contactNumber: '+977-69-400100' },
      { id: 'poi-8', name: 'Kagbeni Tourist Police Post', category: 'Police Post', location: 'Kagbeni Junction' }
    ],
    atms: [
      { id: 'poi-9', name: 'Nabil Bank ATM Beni', category: 'ATM', location: 'Main Chowk Beni' },
      { id: 'poi-10', name: 'Prabhu Bank ATM Jomsom', category: 'ATM', location: 'Jomsom Main Market' }
    ],
    viewpoints: [
      { id: 'poi-11', name: 'Rupse Waterfall Overlook', category: 'Viewpoint', location: 'Between Dana & Ghasa', details: 'Spectacular 300m waterfall gorge view' },
      { id: 'poi-12', name: 'Kali Gandaki Deep Gorge View', category: 'Viewpoint', location: 'Ghasa Bridge' }
    ],
    restaurants: [
      { id: 'poi-13', name: 'Thakali Kitchen Dana', category: 'Restaurant', location: 'Dana Village', contactNumber: '+977-9846011122' },
      { id: 'poi-14', name: 'Apple Pie Corner Marpha', category: 'Restaurant', location: 'Marpha Old Town' }
    ],
    recommendedStops: [
      { id: 'poi-15', name: 'Tatopani Natural Hot Springs', category: 'Recommended Stop', location: 'Tatopani Village', details: 'Relaxing natural sulfur bath by river' },
      { id: 'poi-16', name: 'Marpha White Cobblestone Village', category: 'Recommended Stop', location: 'Marpha', details: 'Famous for apple orchards & cider distillery' }
    ],
    touristAttractions: [
      { id: 'poi-17', name: 'Muktinath 108 Sacred Spouts', category: 'Tourist Attraction', location: 'Muktinath Temple Complex' },
      { id: 'poi-18', name: 'Jwala Mai Eternal Flame', category: 'Tourist Attraction', location: 'Muktinath Monastery' }
    ],
    weatherSummary: 'Sunny mornings with high afternoon wind speeds in Kali Gandaki valley. Temperatures range from 22°C in Pokhara down to -5°C at Muktinath night time in winter.',
    emergencyContacts: [
      { id: 'ec-1', title: 'Mustang District Emergency Rescue', phone: '100 / +977-69-530100', location: 'Jomsom' },
      { id: 'ec-2', title: 'High Altitude Medical Helpline', phone: '+977-1-4422100', location: 'Kathmandu / Regional' }
    ],
    connectedTransportIds: ['tr-1', 'tr-2'],
    connectedHotelIds: ['ht-1', 'ht-2'],
    approvalStatus: 'Published',
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-07-28T07:30:00Z',
    createdByName: 'Deepa Adhikari (Senior Editor)'
  },
  {
    id: 'rt-2',
    routeName: 'Kathmandu → Pokhara Prithvi Highway Corridor',
    origin: 'Kalanki, Kathmandu (Elev. 1,400m)',
    destination: 'Lakeside, Pokhara (Elev. 822m)',
    totalDistanceKm: 200,
    estimatedTravelTime: '5 - 6 Hours',
    roadCondition: 'Mixed Asphalt/Gravel',
    imageUrl: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=800&q=80',
    photos: ['https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=800&q=80'],
    fuelStations: [],
    evChargingStations: [],
    medicalCentres: [],
    policePosts: [],
    atms: [],
    viewpoints: [],
    restaurants: [],
    recommendedStops: [],
    touristAttractions: [],
    weatherSummary: 'Pleasant weather year round along Trishuli river valley.',
    emergencyContacts: [],
    connectedTransportIds: [],
    connectedHotelIds: [],
    approvalStatus: 'Published',
    createdAt: '2026-07-16T08:00:00Z',
    updatedAt: '2026-07-28T07:30:00Z',
    createdByName: 'Nabin Gurung'
  },
  {
    id: 'rt-3',
    routeName: 'Pokhara → Chitwan National Park Safari Express',
    origin: 'Pokhara (Elev. 822m)',
    destination: 'Sauraha, Chitwan (Elev. 150m)',
    totalDistanceKm: 148,
    estimatedTravelTime: '4 - 5 Hours',
    roadCondition: 'Smooth Asphalt',
    imageUrl: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',
    photos: ['https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80'],
    fuelStations: [],
    evChargingStations: [],
    medicalCentres: [],
    policePosts: [],
    atms: [],
    viewpoints: [],
    restaurants: [],
    recommendedStops: [],
    touristAttractions: [],
    weatherSummary: 'Warm subtropical weather with elephant safari and rhino spotting.',
    emergencyContacts: [],
    connectedTransportIds: [],
    connectedHotelIds: [],
    approvalStatus: 'Published',
    createdAt: '2026-07-17T08:00:00Z',
    updatedAt: '2026-07-28T07:30:00Z',
    createdByName: 'Deepa Adhikari'
  }
];

export const INITIAL_HOTELS: HotelEntry[] = [
  {
    id: 'ht-1',
    hotelName: 'Grand Hotel Mustang & Spa',
    propertyType: 'Hotel',
    contactPerson: 'Karma Gurung',
    phoneNumber: '+977-69-530222',
    location: 'Jomsom Airport Road, Mustang',
    latitude: 28.7811,
    longitude: 83.7381,
    roomTypes: [
      {
        id: 'rtp-1',
        typeName: 'Deluxe Nilgiri Mountain View Twin',
        ratePerNight: 8500,
        capacity: 2,
        photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80']
      },
      {
        id: 'rtp-2',
        typeName: 'Executive Suite',
        ratePerNight: 15000,
        capacity: 3,
        photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80']
      }
    ],
    facilities: ['24/7 Hot Water', 'High Speed WiFi', 'Mountain View Restaurant', 'In-room Heater', 'Free Airport Shuttle', 'Oxygen Support Cylinder'],
    checkInTime: '12:00 PM',
    checkOutTime: '10:00 AM',
    hotelPhotos: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    availabilityStatus: 'Available',
    partnerStatus: 'Verified Partner',
    approvalStatus: 'Published',
    createdAt: '2026-07-18T11:20:00Z',
    updatedAt: '2026-07-26T09:00:00Z',
    createdByName: 'Nabin Gurung (Content Team)'
  },
  {
    id: 'ht-2',
    hotelName: 'Kagbeni Authentic Thakali Homestay',
    propertyType: 'Homestay',
    contactPerson: 'Dolma Bista',
    phoneNumber: '+977-9846778899',
    location: 'Old Town Square, Kagbeni',
    latitude: 28.8379,
    longitude: 83.7845,
    roomTypes: [
      {
        id: 'rtp-3',
        typeName: 'Traditional Wooden Bedroom',
        ratePerNight: 3200,
        capacity: 2,
        photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80']
      }
    ],
    facilities: ['Homecooked Organic Meals', 'Solar Hot Shower', 'Cultural Hearth Room', 'Local Apple Wine Tasting'],
    checkInTime: '01:00 PM',
    checkOutTime: '11:00 AM',
    hotelPhotos: [
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
    availabilityStatus: 'Available',
    partnerStatus: 'Verified Partner',
    approvalStatus: 'Approved',
    createdAt: '2026-07-21T14:10:00Z',
    updatedAt: '2026-07-25T16:00:00Z',
    createdByName: 'Nabin Gurung (Content Team)'
  }
];

export const INITIAL_RESTAURANTS: RestaurantEntry[] = [
  {
    id: 'res-1',
    restaurantName: 'Yac & Thakali Organic Kitchen',
    location: 'Marpha Village Main Lane, Mustang',
    contactDetails: '+977-9856711223',
    cuisineTypes: ['Thakali', 'Nepali Organic', 'Bakery'],
    openingHours: '06:30 AM - 09:30 PM',
    priceRange: 'NPR NPR',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
    ],
    recommendedDishes: [
      'Jimbu Flavored Mustang Thakali Thali',
      'Fresh Marpha Apple Pie with Yak Cheese',
      'Local Sea Buckthorn Juice'
    ],
    approvalStatus: 'Published',
    createdAt: '2026-07-19T09:00:00Z',
    updatedAt: '2026-07-24T12:00:00Z',
    createdByName: 'Deepa Adhikari (Senior Editor)'
  },
  {
    id: 'res-2',
    restaurantName: 'Pokhara Lakeside Thakali Bhancha',
    location: 'Lakeside Street 6, Pokhara',
    contactDetails: '+977-61-460112',
    cuisineTypes: ['Thakali', 'Local Fish', 'Nepali Dal Bhat'],
    openingHours: '07:00 AM - 10:00 PM',
    priceRange: 'NPR NPR',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
    ],
    recommendedDishes: [
      'Phewa Lake Fried Fish',
      'Mutton Thakali Set with Ghee',
      'Gundruk Khatiya Soup'
    ],
    approvalStatus: 'Published',
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-07-25T11:00:00Z',
    createdByName: 'Nabin Gurung (Content Team)'
  },
  {
    id: 'res-3',
    restaurantName: 'Muktinath Himalayan Cafe & Bakery',
    location: 'Ranipauwa Bazaar, Muktinath',
    contactDetails: '+977-9846098112',
    cuisineTypes: ['Tibetan', 'Bakery', 'Coffee & Tea'],
    openingHours: '06:00 AM - 08:30 PM',
    priceRange: 'NPR NPR',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80'
    ],
    recommendedDishes: [
      'Hot Cinnamon Roll & Filter Coffee',
      'Steamed Yak Meat Momos',
      'Butter Tea (Suja)'
    ],
    approvalStatus: 'Published',
    createdAt: '2026-07-22T08:00:00Z',
    updatedAt: '2026-07-26T14:00:00Z',
    createdByName: 'Deepa Adhikari (Senior Editor)'
  },
  {
    id: 'res-4',
    restaurantName: 'Trishuli Riverbank Dhaba & Resto',
    location: 'Kurintar, Prithvi Highway',
    contactDetails: '+977-9801234567',
    cuisineTypes: ['Highway Dhaba', 'Buffet Dal Bhat', 'Snacks'],
    openingHours: '05:00 AM - 11:00 PM',
    priceRange: 'NPR',
    imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80'
    ],
    recommendedDishes: [
      'Fresh River Fish Fry',
      'Unlimited Chicken Dal Bhat Thali',
      'Masala Milk Tea'
    ],
    approvalStatus: 'Published',
    createdAt: '2026-07-23T09:30:00Z',
    updatedAt: '2026-07-27T10:00:00Z',
    createdByName: 'Nabin Gurung'
  }
];

export const INITIAL_GUIDES: GuideEntry[] = [
  {
    id: 'gd-1',
    fullName: 'Pasang Nuru Sherpa',
    specialization: 'High Altitude Trekking & Mountaineering',
    contactNumber: '+977-9846011223',
    licenseNumber: 'NMA-GUIDE-8848',
    experienceYears: 12,
    languages: ['Nepali', 'English', 'Sherpa', 'Hindi'],
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    bio: 'Certified NMA Mountain Guide with 12+ years experience leading Annapurna Circuit, Mustang Valley & EBC Treks.',
    dailyRate: 4500,
    location: 'Pokhara / Jomsom',
    approvalStatus: 'Published',
    createdAt: '2026-07-15T10:00:00Z',
    updatedAt: '2026-07-25T12:00:00Z'
  },
  {
    id: 'gd-2',
    fullName: 'Rohan Thapa',
    specialization: 'Tandem Paragliding Pilot & Adventure Expert',
    contactNumber: '+977-9806112233',
    licenseNumber: 'APPI-PILOT-410',
    experienceYears: 8,
    languages: ['Nepali', 'English'],
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    bio: 'APPI Licensed Commercial Tandem Paragliding Pilot in Sarangkot, Pokhara with 3,500+ safe flights.',
    dailyRate: 8500,
    location: 'Pokhara Lakeside',
    approvalStatus: 'Published',
    createdAt: '2026-07-16T11:00:00Z',
    updatedAt: '2026-07-26T14:00:00Z'
  },
  {
    id: 'gd-3',
    fullName: 'Sujata Gurung',
    specialization: 'Cultural Heritage & Monastery Specialist',
    contactNumber: '+977-9851098765',
    licenseNumber: 'NTB-CULTURE-104',
    experienceYears: 7,
    languages: ['Nepali', 'English', 'French'],
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    bio: 'Licensed UNESCO Cultural Heritage Guide specializing in Kathmandu Valley Temples, Muktinath Pilgrimage & Buddhist Monasteries.',
    dailyRate: 3500,
    location: 'Kathmandu / Pokhara',
    approvalStatus: 'Published',
    createdAt: '2026-07-18T09:00:00Z',
    updatedAt: '2026-07-27T10:00:00Z'
  },
  {
    id: 'gd-4',
    fullName: 'Kiran Sunuwar',
    specialization: 'River Captain & White Water Rafting Specialist',
    contactNumber: '+977-9801122998',
    licenseNumber: 'NARA-RIVER-305',
    experienceYears: 10,
    languages: ['Nepali', 'English'],
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    bio: 'NARA certified Senior River Captain with 10 years experience navigating Trishuli, Bote Koshi and Kali Gandaki rapids.',
    dailyRate: 4000,
    location: 'Kurintar / Pokhara',
    approvalStatus: 'Published',
    createdAt: '2026-07-20T08:00:00Z',
    updatedAt: '2026-07-28T11:00:00Z'
  }
];

export const INITIAL_ACTIVITIES: ActivityEntry[] = [
  {
    id: 'act-1',
    activityName: 'Sarangkot Sunrise Paragliding Tandem',
    guideName: 'Rohan Thapa (FAI Certified Pilot)',
    guideContactDetails: '+977-9806112233',
    pricing: 9500,
    duration: '30 Minutes Flight (2 Hours Total)',
    difficultyLevel: 'Easy',
    photos: [
      'https://images.unsplash.com/photo-1521651201144-634f700b36ef?auto=format&fit=crop&w=800&q=80'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1521651201144-634f700b36ef?auto=format&fit=crop&w=800&q=80',
    availability: 'Daily',
    approvalStatus: 'Published',
    createdAt: '2026-07-15T12:00:00Z',
    updatedAt: '2026-07-22T10:00:00Z',
    createdByName: 'Nabin Gurung (Content Team)'
  }
];

export const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'med-1',
    title: 'Pokhara Muktinath Highway Scenic View',
    fileType: 'Photo',
    category: 'Routes',
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=300&q=80',
    fileSizeMb: 3.4,
    tags: ['Mustang', 'Highway', 'Landscape', 'Annapurna'],
    uploadedAt: '2026-07-20T08:30:00Z',
    uploadedBy: 'Content Team'
  },
  {
    id: 'med-2',
    title: 'Muktinath Temple 108 Spouts Photo',
    fileType: 'Photo',
    category: 'Destinations',
    url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=300&q=80',
    fileSizeMb: 4.1,
    tags: ['Muktinath', 'Temple', 'Pilgrimage', 'Sacred'],
    uploadedAt: '2026-07-21T09:15:00Z',
    uploadedBy: 'Content Team'
  },
  {
    id: 'med-3',
    title: '4x4 Offroad Jeep Mustang Trail',
    fileType: 'Photo',
    category: 'Transport',
    url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=300&q=80',
    fileSizeMb: 2.8,
    tags: ['Jeep', 'Offroad', 'Mustang', 'Transport'],
    uploadedAt: '2026-07-22T11:45:00Z',
    uploadedBy: 'Nabin Gurung'
  }
];

export const INITIAL_LOGS: WorkflowHistoryLog[] = [
  {
    id: 'log-1',
    entityType: 'Route',
    entityId: 'rt-1',
    entityTitle: 'Pokhara → Muktinath Pilgrimage Highway',
    previousStatus: 'Approved',
    newStatus: 'Published',
    changedByRole: 'Admin',
    changedByName: 'Sanjay Subedi (GojiTrip Head of Ops)',
    comment: 'Verified all EV charger locations and police post emergency contacts.',
    timestamp: '2026-07-28T07:30:00Z'
  },
  {
    id: 'log-2',
    entityType: 'Transport',
    entityId: 'tr-1',
    entityTitle: 'Annapurna Super Express 4x4',
    previousStatus: 'Under Review',
    newStatus: 'Approved',
    changedByRole: 'Reviewer',
    changedByName: 'Deepa Adhikari (Senior Editor)',
    comment: 'Vehicle license and driver identity document verified successfully.',
    timestamp: '2026-07-25T14:30:00Z'
  }
];
