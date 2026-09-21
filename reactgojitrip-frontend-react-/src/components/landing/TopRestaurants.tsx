import React, { useEffect, useState, useRef, useCallback } from "react";
import { SafeImage } from "../common/SafeImage";
import {
  Star,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
} from "lucide-react";
import { Link } from "react-router-dom";
import { listRestaurants } from "@/lib/api";
import { cmsStore } from "@/lib/cms-store";
import YelpDetailModal, { YelpDetailData } from "../common/YelpDetailModal";

export interface DisplayRestaurant {
  id: string | number;
  name: string;
  location: string;
  image: string;
  photos: string[];
  rating: number;
  reviewsCount: number;
  cuisine: string[];
  openingHours: string;
  priceRange: string;
  averageMealPrice?: number;
  currency?: string;
  contactDetails?: string;
  description?: string;
}

const DEFAULT_TOP_RESTAURANTS: DisplayRestaurant[] = [
  {
    id: "res-1",
    name: "Yac & Thakali Organic Kitchen",
    location: "Marpha Village, Mustang",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 48,
    cuisine: ["Thakali", "Organic Nepali", "Apple Bakery"],
    openingHours: "06:30 AM - 09:30 PM",
    priceRange: "$$",
    averageMealPrice: 650,
    currency: "NRs",
    description: "Authentic Himalayan organic kitchen serving Jimbu flavored Thakali thali, fresh buckwheat bread, and hot Marpha apple pies.",
  },
  {
    id: "res-2",
    name: "Pokhara Lakeside Thakali Bhancha",
    location: "Lakeside Street 6, Pokhara",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 64,
    cuisine: ["Thakali", "Local Fish", "Nepali Dal Bhat"],
    openingHours: "07:00 AM - 10:00 PM",
    priceRange: "$$",
    averageMealPrice: 750,
    currency: "NRs",
    description: "Serene lakeside dining featuring crisp Phewa river trout, traditional mutton Thakali set, and freshly prepared local delicacies.",
  },
  {
    id: "res-3",
    name: "Muktinath Himalayan Cafe & Bakery",
    location: "Ranipauwa Bazaar, Muktinath",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 38,
    cuisine: ["Tibetan", "Himalayan Coffee", "Bakery"],
    openingHours: "06:00 AM - 08:30 PM",
    priceRange: "$$",
    averageMealPrice: 500,
    currency: "NRs",
    description: "High altitude warmth serving steaming butter tea (Suja), freshly baked cinnamon rolls, and handcrafted yak momos.",
  },
  {
    id: "res-4",
    name: "Trishuli Riverbank Dhaba & Resto",
    location: "Kurintar, Prithvi Highway",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.7,
    reviewsCount: 52,
    cuisine: ["Highway Dhaba", "Buffet Thali", "River Fish"],
    openingHours: "05:00 AM - 11:00 PM",
    priceRange: "$",
    averageMealPrice: 450,
    currency: "NRs",
    description: "Iconic traveler highway stop alongside the gushing Trishuli river with 24/7 hot masala tea and hearty Nepali thali.",
  },
  {
    id: "res-5",
    name: "Thamel Newari Heritage Kitchen",
    location: "Thamel Marg, Kathmandu",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 82,
    cuisine: ["Newari Samay Baji", "Choila", "Chataamari"],
    openingHours: "10:00 AM - 10:30 PM",
    priceRange: "$$",
    averageMealPrice: 850,
    currency: "NRs",
    description: "Experience centuries of Kathmandu valley cultural heritage dining with authentic Newari spiced choila and Bara pancakes.",
  },
  {
    id: "res-6",
    name: "Sarangkot Sunrise Mountain Bistro",
    location: "Sarangkot Viewpoint, Pokhara",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 41,
    cuisine: ["Continental", "Himalayan Breakfast", "Artisan Coffee"],
    openingHours: "05:30 AM - 09:00 PM",
    priceRange: "$$",
    averageMealPrice: 700,
    currency: "NRs",
    description: "Panoramic outdoor ridge dining with front-row sunrise views of the Annapurna mountain peaks and Pokhara valley.",
  },
  {
    id: "res-7",
    name: "Bandipur Old Inn Courtyard Diner",
    location: "Main Bazaar, Bandipur Heritage Town",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 35,
    cuisine: ["Heritage Nepali", "Organic Salad", "Claypot Curries"],
    openingHours: "07:00 AM - 09:30 PM",
    priceRange: "$$",
    averageMealPrice: 900,
    currency: "NRs",
    description: "Wood-carved 18th-century Newari architecture courtyard serving slow-cooked country chicken and hill-grown organic salads.",
  },
  {
    id: "res-8",
    name: "Chitwan Sauraha Jungle Dine",
    location: "Rapti Riverbank, Sauraha, Chitwan",
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.7,
    reviewsCount: 46,
    cuisine: ["Tharu Cultural", "BBQ Grill", "Fresh River Catch"],
    openingHours: "06:30 AM - 10:30 PM",
    priceRange: "$$",
    averageMealPrice: 650,
    currency: "NRs",
    description: "Riverside sunset dining overlooking the national park with Tharu cultural dance, grilled specialties, and peaceful river breezes.",
  },
  {
    id: "res-9",
    name: "Jomsom Apple Valley Orchard Resto",
    location: "Old Airport Road, Jomsom",
    image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 29,
    cuisine: ["Mustang Cuisine", "Buckwheat Dhido", "Cider & Wine"],
    openingHours: "06:30 AM - 09:00 PM",
    priceRange: "$$",
    averageMealPrice: 600,
    currency: "NRs",
    description: "Located within peaceful apple orchards, offering fresh apple brandy, hot thukpa soup, and organic mountain barley dishes.",
  },
  {
    id: "res-10",
    name: "Peace Stupa Sunset Rooftop Cafe",
    location: "Anadu Hill, World Peace Pagoda, Pokhara",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 57,
    cuisine: ["Fusion Dining", "Artisan Teas", "Woodfired Snacks"],
    openingHours: "08:00 AM - 07:30 PM",
    priceRange: "$$",
    averageMealPrice: 550,
    currency: "NRs",
    description: "Spectacular vantage point offering sweeping sunset views of Phewa Lake and the Annapurna range with handcrafted mocktails and snacks.",
  },
];

export default function TopRestaurants() {
  const [restaurants, setRestaurants] = useState<DisplayRestaurant[]>(
    DEFAULT_TOP_RESTAURANTS.slice(0, 10)
  );
  const [loading, setLoading] = useState(true);
  const [selectedYelpData, setSelectedYelpData] = useState<YelpDetailData | null>(null);
  const [showYelpModal, setShowYelpModal] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const loadRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Fetch from Database / API
      const apiRecords = await listRestaurants().catch(() => []);
      // 2. Fetch from CMS Store
      const cmsRecords = cmsStore.getRestaurants();

      const combined: DisplayRestaurant[] = [];
      const seenNames = new Set<string>();

      const addUnique = (item: DisplayRestaurant) => {
        const cleanName = item.name.toLowerCase().trim();
        if (!cleanName || seenNames.has(cleanName)) return;
        seenNames.add(cleanName);
        combined.push(item);
      };

      // Process Backend DB items first
      if (Array.isArray(apiRecords) && apiRecords.length > 0) {
        apiRecords.forEach((r: any) => {
          const photos = Array.isArray(r.photos) && r.photos.length > 0
            ? r.photos
            : r.imageUrl
            ? [r.imageUrl]
            : [];
          const img = r.imageUrl || photos[0] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80";
          const cuisines = Array.isArray(r.cuisineTypes) && r.cuisineTypes.length > 0
            ? r.cuisineTypes
            : Array.isArray(r.cuisine)
            ? r.cuisine
            : typeof r.cuisine === "string" && r.cuisine.trim()
            ? [r.cuisine]
            : ["Traditional Nepalese", "Thakali"];

          addUnique({
            id: r.id,
            name: r.restaurantName || r.name || "Highway Dining",
            location: r.location || "Nepal Corridor",
            image: img,
            photos: photos.length > 0 ? photos : [img],
            rating: typeof r.rating === "number" ? r.rating : 4.8,
            reviewsCount: typeof r.reviews === "number" ? r.reviews : 42,
            cuisine: cuisines,
            openingHours: r.openingHours || "07:00 AM - 10:00 PM",
            priceRange: r.priceRange || "$$",
            averageMealPrice: Number(r.averageMealPrice) || 650,
            currency: r.currency || "NRs",
            contactDetails: r.contactDetails || r.phoneNumber || "+977 1 4567890",
            description: r.description || `${r.restaurantName || "This restaurant"} serves authentic local food, warm hospitality, and scenic dining on the route.`,
          });
        });
      }

      // Process CMS Store items next
      if (Array.isArray(cmsRecords) && cmsRecords.length > 0) {
        cmsRecords.forEach((r: any) => {
          const photos = Array.isArray(r.photos) && r.photos.length > 0
            ? r.photos
            : r.imageUrl
            ? [r.imageUrl]
            : [];
          const img = r.imageUrl || photos[0] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80";
          const cuisines = Array.isArray(r.cuisineTypes) && r.cuisineTypes.length > 0
            ? r.cuisineTypes
            : Array.isArray(r.cuisine)
            ? r.cuisine
            : ["Thakali", "Local Dining"];

          addUnique({
            id: r.id,
            name: r.restaurantName || r.name || "Highway Dining",
            location: r.location || "Nepal Corridor",
            image: img,
            photos: photos.length > 0 ? photos : [img],
            rating: typeof r.rating === "number" ? r.rating : 4.8,
            reviewsCount: typeof r.reviews === "number" ? r.reviews : 36,
            cuisine: cuisines,
            openingHours: r.openingHours || "07:00 AM - 10:00 PM",
            priceRange: r.priceRange || "$$",
            averageMealPrice: Number(r.averageMealPrice) || 650,
            currency: r.currency || "NRs",
            contactDetails: r.contactDetails || r.phoneNumber || "+977 1 4567890",
            description: r.description || `${r.restaurantName || "This restaurant"} is a popular dining spot serving authentic cuisine.`,
          });
        });
      }

      // Supplement with defaults to always guarantee exactly Top 10 items
      for (const fallback of DEFAULT_TOP_RESTAURANTS) {
        if (combined.length >= 10) break;
        addUnique(fallback);
      }

      setRestaurants(combined.slice(0, 10));
    } catch (err) {
      console.error("Failed to load restaurants for home page:", err);
      setRestaurants(DEFAULT_TOP_RESTAURANTS.slice(0, 10));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  const handleOpenDetails = (r: DisplayRestaurant) => {
    const galleryImages = r.photos && r.photos.length > 0 ? r.photos : [r.image];

    setSelectedYelpData({
      id: String(r.id),
      name: r.name,
      category: r.cuisine.join(" • ") || "Traditional Nepalese & Thakali Cuisine",
      rating: r.rating || 4.8,
      reviewCount: r.reviewsCount || 42,
      priceLevel: r.priceRange || "$$",
      address: r.location,
      location: r.location,
      phone: r.contactDetails || "+977 1 4220000",
      whatsapp: "+9779801112233",
      image: r.image,
      galleryImages: galleryImages,
      description:
        r.description ||
        `${r.name} is a renowned dining stop in ${r.location}, offering authentic organic Thakali thali, Himalayan coffee, and delicious meals for travelers.`,
      amenities: [
        "Organic Ingredients",
        "Outdoor Seating",
        "Free Wi-Fi",
        "Highway Parking",
        "Vegetarian Friendly",
      ],
      hours: [
        { day: "Daily Operating Hours", time: r.openingHours || "07:00 AM - 10:00 PM" },
        { day: "Kitchen Last Call", time: "09:30 PM" },
      ],
      priceTag: r.averageMealPrice
        ? `${r.currency || "NRs"} ${r.averageMealPrice.toLocaleString()} / meal`
        : `${r.currency || "NRs"} 450 - 1,200 / meal`,
      entityType: "restaurant",
      offerings: [
        {
          title: "Organic Thakali Khana Set",
          price: `${r.currency || "NRs"} ${r.averageMealPrice || 650}`,
          desc: "Authentic buckwheat dhido/rice, black lentil soup, mutton curry, ghee & fermented pickles.",
          image: galleryImages[0] || r.image,
        },
        {
          title: "Special Himalayan Chicken Momos",
          price: `${r.currency || "NRs"} 350`,
          desc: "Steamed handmade dumplings served with spicy tomato and sesame chutney.",
          image: galleryImages[1] || galleryImages[0] || r.image,
        },
        {
          title: "Fresh Himalayan Arabica Coffee",
          price: `${r.currency || "NRs"} 220`,
          desc: "Locally roasted Organic Nepalese coffee beans.",
          image: galleryImages[2] || galleryImages[0] || r.image,
        },
      ],
    });
    setShowYelpModal(true);
  };

  return (
    <section className="py-16 md:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* =====================================================
            SECTION HEADER
        ===================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-600/10 border border-orange-600/30 text-orange-700 text-xs font-bold uppercase tracking-wider mb-2">
              <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600" />
              <span>Top 10 Culinary Stops</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Best Restaurants & Highway Dining
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Verified dining stops along Nepal highways — authentic Thakali kitchens, riverside cafes, and local cuisine.
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            {/* Scroll Navigation Arrows */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="p-2 rounded-lg hover:bg-white hover:text-orange-600 text-slate-600 transition shadow-2xs cursor-pointer active:scale-95"
                title="Scroll Left"
                aria-label="Scroll restaurants left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="p-2 rounded-lg hover:bg-white hover:text-orange-600 text-slate-600 transition shadow-2xs cursor-pointer active:scale-95"
                title="Scroll Right"
                aria-label="Scroll restaurants right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              to="/pages/restaurants"
              className="text-xs font-bold text-orange-700 hover:text-orange-800 transition flex items-center space-x-1.5 bg-orange-50 hover:bg-orange-100 px-4 py-2.5 rounded-xl border border-orange-200 shadow-2xs active:scale-95"
            >
              <span>Explore All Restaurants</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* =====================================================
            SINGLE ROW HORIZONTAL SCROLLER (TOP 10)
        ===================================================== */}
        <div
          ref={scrollContainerRef}
          className="flex flex-nowrap overflow-x-auto gap-5 pb-5 pt-1 snap-x scroll-smooth scrollbar-thin scrollbar-thumb-orange-500/20 hover:scrollbar-thumb-orange-500/40"
        >
          {restaurants.map((restaurant, idx) => (
            <div
              key={restaurant.id || idx}
              onClick={() => handleOpenDetails(restaurant)}
              className="group flex-none w-72 sm:w-80 snap-start bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:border-orange-400 cursor-pointer select-none"
            >
              <div>
                {/* Photo with Overlay Badges */}
                <div className="relative w-full h-44 mb-3 rounded-xl overflow-hidden bg-slate-100">
                  <SafeImage
                    src={restaurant.image}
                    fallbackSrc={DEFAULT_TOP_RESTAURANTS[0].image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Top-left Cuisine Badge */}
                  {restaurant.cuisine && restaurant.cuisine[0] && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/65 backdrop-blur-md rounded-full text-[10px] font-bold text-white border border-white/10 shadow-sm truncate max-w-[140px]">
                      {restaurant.cuisine[0]}
                    </span>
                  )}

                  {/* Top-right Rating Badge */}
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-[11px] font-black text-slate-900 border border-slate-200 shadow-md flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{restaurant.rating}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({restaurant.reviewsCount})
                    </span>
                  </div>
                </div>

                {/* Restaurant Name */}
                <h3 className="font-extrabold text-base text-slate-900 mb-1.5 line-clamp-1 group-hover:text-orange-600 transition-colors">
                  {restaurant.name}
                </h3>

                {/* Location */}
                <div className="flex items-center space-x-1 text-slate-500 text-xs mb-2.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="truncate">{restaurant.location}</span>
                </div>

                {/* Cuisine Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {restaurant.cuisine.slice(0, 2).map((c, cIdx) => (
                    <span
                      key={cIdx}
                      className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 text-[10px] font-bold border border-orange-200/60"
                    >
                      {c}
                    </span>
                  ))}
                  {restaurant.cuisine.length > 2 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      +{restaurant.cuisine.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Hours & View Details Action */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Average Meal
                  </div>
                  <div className="text-xs font-black text-emerald-700">
                    {restaurant.averageMealPrice
                      ? `${restaurant.currency || "NRs"} ${restaurant.averageMealPrice.toLocaleString()}`
                      : `${restaurant.currency || "NRs"} 450 - 1,200`}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDetails(restaurant);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all shadow-xs hover:scale-105 active:scale-95 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Yelp Business Detail Modal for Selected Restaurant */}
      <YelpDetailModal
        isOpen={showYelpModal}
        onClose={() => {
          setShowYelpModal(false);
          setSelectedYelpData(null);
        }}
        data={selectedYelpData}
      />
    </section>
  );
}
