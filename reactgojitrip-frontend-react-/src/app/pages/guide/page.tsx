"use client";

import "@/styles/pages/guide/guide.css";

import React from "react";
import { cmsStore } from "@/lib/cms-store";
import { SafeImage } from "@/components/common/SafeImage";
import {
  Search,
  MapPin,
  Clock,
  Users,
  Star,
  Sparkles,
  Compass,
  Mountain,
  Camera,
  Utensils,
  Landmark,
  TreePine,
  Palette,
  Globe,
  ChevronRight,
  Filter,
  X,
  Award,
  Calendar,
  Phone,
  Mail,
  Heart,
  Share2,
  ExternalLink,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface Guide {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  location: string;
  price: number;
  specialties: string[];
  languages: string[];
  guideContactDetails?: string;
  availability?: string;
  experienceYears?: number;
  certified?: boolean;
}

interface Activity {
  id: string;
  activityName: string;
  guideName: string;
  guideContactDetails: string;
  pricing: number;
  duration: string;
  difficultyLevel: "Easy" | "Moderate" | "Challenging" | "Extreme";
  photos: string[];
  imageUrl?: string;
  availability: "Daily" | "Weekends" | "Seasonal" | "On Request";
}

interface ApiResponse<T> {
  data?: T;
  items?: T;
  results?: T;
}

/* =========================================================
   API BASE URL
========================================================= */

const API_BASE_URL = "http://localhost:8000";

/* =========================================================
   IMAGE HELPER
========================================================= */

const getImageUrl = (
  image?: string | null,
  fallback = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
): string => {
  if (!image || typeof image !== "string") {
    return fallback;
  }

  const trimmedImage = image.trim();

  if (!trimmedImage) {
    return fallback;
  }

  if (
    trimmedImage.startsWith("http://") ||
    trimmedImage.startsWith("https://")
  ) {
    return trimmedImage;
  }

  if (trimmedImage.startsWith("/")) {
    return trimmedImage;
  }

  return `/${trimmedImage}`;
};

/* =========================================================
   FETCH JSON
========================================================= */

const fetchJson = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as T;
};

/* =========================================================
   EXTRACT ARRAY
========================================================= */

const extractArray = <T,>(response: ApiResponse<T[]> | T[]): T[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  if (Array.isArray(response.results)) {
    return response.results;
  }

  return [];
};

/* =========================================================
   SAFE VALUE HELPERS
========================================================= */

const toStringValue = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
};

const toNumberValue = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object") {
          const object = item as Record<string, unknown>;

          return (
            toStringValue(object.name) ||
            toStringValue(object.title) ||
            toStringValue(object.value)
          );
        }

        return "";
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

/* =========================================================
   MAP GUIDE
========================================================= */

const mapGuide = (value: unknown): Guide => {
  const item =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const imageValue =
    item.image ??
    item.imageUrl ??
    item.photoUrl ??
    item.photo ??
    item.profileImage ??
    item.profilePhoto ??
    "";

  const name =
    toStringValue(item.name) ||
    toStringValue(item.guideName) ||
    toStringValue(item.fullName) ||
    "Local Guide";

  const description =
    toStringValue(item.description) ||
    toStringValue(item.bio) ||
    toStringValue(item.about) ||
    "Experienced local travel guide.";

  const location =
    toStringValue(item.location) ||
    toStringValue(item.destination) ||
    toStringValue(item.city) ||
    toStringValue(item.country) ||
    "Nepal";

  const specialties = toStringArray(
    item.specialties ??
      item.speciality ??
      item.specializations ??
      item.expertise,
  );

  const languages = toStringArray(
    item.languages ?? item.language ?? item.spokenLanguages,
  );

  return {
    id:
      toStringValue(item.id) ||
      toStringValue(item._id) ||
      `guide-${Math.random().toString(36).slice(2)}`,

    name,

    description,

    image: getImageUrl(toStringValue(imageValue)),

    rating: toNumberValue(item.rating ?? item.averageRating, 0),

    location,

    price: toNumberValue(
      item.price ?? item.pricing ?? item.pricePerDay ?? item.dailyRate,
      0,
    ),

    specialties,

    languages,

    guideContactDetails:
      toStringValue(
        item.guideContactDetails ??
          item.contactDetails ??
          item.contact ??
          item.phone ??
          item.mobile,
      ) || undefined,

    availability:
      toStringValue(item.availability ?? item.availableDays ?? item.status) ||
      undefined,

    experienceYears: toNumberValue(item.experienceYears ?? item.yearsExperience, 5),

    certified: Boolean(item.certified ?? item.isCertified ?? item.licensed),
  };
};

/* =========================================================
   MAP ACTIVITY
========================================================= */

const mapActivity = (value: unknown): Activity => {
  const item =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const rawDifficulty = toStringValue(
    item.difficultyLevel ?? item.difficulty ?? item.level,
    "Easy",
  );

  const difficultyMap: Record<string, Activity["difficultyLevel"]> = {
    easy: "Easy",
    moderate: "Moderate",
    challenging: "Challenging",
    extreme: "Extreme",
  };

  const difficultyLevel = difficultyMap[rawDifficulty.toLowerCase()] || "Easy";

  const rawAvailability = toStringValue(
    item.availability ?? item.availableDays ?? item.status,
    "On Request",
  );

  const availabilityMap: Record<string, Activity["availability"]> = {
    daily: "Daily",
    weekends: "Weekends",
    seasonal: "Seasonal",
    "on request": "On Request",
  };

  const availability =
    availabilityMap[rawAvailability.toLowerCase()] || "On Request";

  const photos = toStringArray(item.photos ?? item.images ?? item.imageUrls);

  const imageUrl = getImageUrl(
    toStringValue(item.imageUrl ?? item.image ?? item.photo ?? photos[0]),
  );

  let guideName = toStringValue(item.guideName);

  if (!guideName && item.guide && typeof item.guide === "object") {
    const guide = item.guide as Record<string, unknown>;

    guideName = toStringValue(guide.name) || toStringValue(guide.fullName);
  }

  return {
    id:
      toStringValue(item.id) ||
      toStringValue(item._id) ||
      `activity-${Math.random().toString(36).slice(2)}`,

    activityName:
      toStringValue(item.activityName) ||
      toStringValue(item.name) ||
      toStringValue(item.title) ||
      "Activity",

    guideName,

    guideContactDetails: toStringValue(
      item.guideContactDetails ?? item.contactDetails ?? item.contact,
    ),

    pricing: toNumberValue(
      item.pricing ?? item.price ?? item.pricePerPerson ?? item.amount,
      0,
    ),

    duration:
      toStringValue(item.duration ?? item.durationHours) || "On Request",

    difficultyLevel,

    photos,

    imageUrl,

    availability,
  };
};

/* =========================================================
   SPECIALTY ICON MAP
========================================================= */

const getSpecialtyIcon = (specialty: string) => {
  const icons: Record<string, React.ReactNode> = {
    hiking: <Mountain className="h-3.5 w-3.5" />,
    trekking: <Mountain className="h-3.5 w-3.5" />,
    photography: <Camera className="h-3.5 w-3.5" />,
    food: <Utensils className="h-3.5 w-3.5" />,
    culture: <Landmark className="h-3.5 w-3.5" />,
    wildlife: <TreePine className="h-3.5 w-3.5" />,
    art: <Palette className="h-3.5 w-3.5" />,
    history: <Landmark className="h-3.5 w-3.5" />,
    adventure: <Compass className="h-3.5 w-3.5" />,
    architecture: <Landmark className="h-3.5 w-3.5" />,
  };

  const key = specialty.toLowerCase();
  return icons[key] || <Sparkles className="h-3.5 w-3.5" />;
};

/* =========================================================
   DIFFICULTY COLOR MAP
========================================================= */

const getDifficultyColor = (level: Activity["difficultyLevel"]) => {
  const colors = {
    Easy: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Moderate: "bg-amber-100 text-amber-700 border-amber-200",
    Challenging: "bg-orange-100 text-orange-700 border-orange-200",
    Extreme: "bg-red-100 text-red-700 border-red-200",
  };
  return colors[level] || colors.Easy;
};

const getDifficultyIcon = (level: Activity["difficultyLevel"]) => {
  const icons = {
    Easy: "🟢",
    Moderate: "🟡",
    Challenging: "🟠",
    Extreme: "🔴",
  };
  return icons[level] || "🟢";
};

/* =========================================================
   GUIDE CARD
========================================================= */

const GuideCard: React.FC<{
  guide: Guide;
  index: number;
}> = ({ guide, index }) => {
  const [isLiked, setIsLiked] = React.useState(false);

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100/80 relative animate-fadeInUp"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

      {/* Image */}
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        <SafeImage
          src={guide.image}
          fallbackSrc="/logo/gojitriplogo.jpg"
          alt={guide.name || "Travel guide"}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Rating */}
        {guide.rating > 0 && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg z-20">
            <span className="flex items-center gap-1.5 text-yellow-500 font-semibold text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {guide.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Certified Badge */}
        {guide.certified && (
          <div className="absolute top-3 left-3 bg-emerald-500/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg z-20">
            <span className="flex items-center gap-1.5 text-white font-medium text-xs">
              <Award className="h-3.5 w-3.5" />
              Certified
            </span>
          </div>
        )}

        {/* Experience Years */}
        {guide.experienceYears && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full z-20">
            <span className="flex items-center gap-1.5 text-white text-xs">
              <Calendar className="h-3.5 w-3.5" />
              {guide.experienceYears}+ years
            </span>
          </div>
        )}

        {/* Quick action buttons - visible on hover */}
        <div className="absolute top-3 right-16 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button
            type="button"
            onClick={() => setIsLiked(!isLiked)}
            className="p-2 bg-white/90 backdrop-blur-md rounded-full hover:bg-white shadow-lg transition-all hover:scale-110"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`}
            />
          </button>
          <button
            type="button"
            className="p-2 bg-white/90 backdrop-blur-md rounded-full hover:bg-white shadow-lg transition-all hover:scale-110"
          >
            <Share2 className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 relative z-10">
        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
          {guide.name}
        </h3>

        {/* Location */}
        <p className="text-gray-500 text-sm mb-3 flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-blue-500" />
          {guide.location}
        </p>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {guide.description}
        </p>

        {/* Specialties */}
        {guide.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {guide.specialties.slice(0, 4).map((specialty) => (
              <span
                key={`${guide.id}-specialty-${specialty}`}
                className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100/50"
              >
                {getSpecialtyIcon(specialty)}
                {specialty}
              </span>
            ))}
            {guide.specialties.length > 4 && (
              <span className="text-xs text-gray-400 font-medium px-1">
                +{guide.specialties.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Languages */}
        {guide.languages.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {guide.languages.slice(0, 3).map((language) => (
              <span
                key={`${guide.id}-language-${language}`}
                className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100/50"
              >
                <Globe className="h-3 w-3" />
                {language}
              </span>
            ))}
            {guide.languages.length > 3 && (
              <span className="text-xs text-gray-400 font-medium px-1">
                +{guide.languages.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Availability */}
        {guide.availability && (
          <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4 bg-gray-50/80 px-3 py-1.5 rounded-lg">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium">{guide.availability}</span>
          </div>
        )}

        {/* Bottom */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100/80">
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {guide.price > 0
                ? `NPR ${guide.price.toLocaleString()}`
                : "Contact"}
            </span>

            {guide.price > 0 && (
              <span className="text-gray-400 text-sm font-medium ml-1">/day</span>
            )}
          </div>

          <button
            type="button"
            className="group/btn px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 text-sm font-medium flex items-center gap-2 hover:scale-105"
          >
            Book Guide
            <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   ACTIVITY CARD
========================================================= */

const ActivityCard: React.FC<{
  activity: Activity;
  index: number;
}> = ({ activity, index }) => {
  const activityImage = activity.imageUrl || getImageUrl(activity.photos?.[0]);

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100/80 animate-fadeInUp"
      style={{ animationDelay: `${index * 0.1 + 0.1}s` }}
    >
      {/* Image */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        <SafeImage
          src={activityImage}
          fallbackSrc="/logo/gojitriplogo.jpg"
          alt={activity.activityName || "Activity"}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Activity
        </div>

        {/* Difficulty Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${getDifficultyColor(activity.difficultyLevel)} shadow-lg`}
          >
            {getDifficultyIcon(activity.difficultyLevel)} {activity.difficultyLevel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
          {activity.activityName}
        </h3>

        {activity.guideName && (
          <p className="text-gray-500 text-sm mb-3 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-blue-500" />
            Guide: <span className="font-medium text-gray-700">{activity.guideName}</span>
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-100/50">
            <Clock className="h-3.5 w-3.5" />
            {activity.duration}
          </span>

          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-100/50">
            <Calendar className="h-3.5 w-3.5" />
            {activity.availability}
          </span>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100/80">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {activity.pricing > 0
              ? `NPR ${activity.pricing.toLocaleString()}`
              : "Contact"}
          </span>

          <button
            type="button"
            className="group/btn px-5 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105"
          >
            View Activity
            <ExternalLink className="h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   LOADING SKELETON
========================================================= */

const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse"
        >
          <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300" />

          <div className="p-5 space-y-3">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3" />
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full" />
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-5/6" />
            <div className="flex gap-2">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16" />
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20" />
            </div>
            <div className="flex justify-between pt-3">
              <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24" />
              <div className="h-9 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState: React.FC<{
  message: string;
  onClear: () => void;
}> = ({ message, onClear }) => {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100/80 shadow-sm">
      <div className="text-6xl mb-4 animate-bounce">🧭</div>

      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        No Guides Found
      </h3>

      <p className="text-gray-500 mb-6 max-w-md mx-auto">{message}</p>

      <button
        type="button"
        onClick={onClear}
        className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-medium flex items-center gap-2 mx-auto hover:scale-105"
      >
        <Filter className="h-4 w-4" />
        Clear Filters
        <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
};

/* =========================================================
   MAIN PAGE
========================================================= */

const GuidePage: React.FC = () => {
  const [loading, setLoading] = React.useState(true);

  const [guides, setGuides] = React.useState<Guide[]>([]);

  const [activities, setActivities] = React.useState<Activity[]>([]);

  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const locParam = params.get("location") || params.get("search") || params.get("q") || params.get("routeStop");
    if (locParam && locParam.trim()) {
      setSearchTerm(locParam.trim());
    }
  }, []);

  const [specialtyFilter, setSpecialtyFilter] = React.useState("");

  const [languageFilter, setLanguageFilter] = React.useState("");

  const [priceFilter, setPriceFilter] = React.useState("");

  const [error, setError] = React.useState("");

  /* =======================================================
     FETCH DATA
  ======================================================= */

  const fetchGuideAndActivityData = React.useCallback(async () => {
    setLoading(true);
    setError("");

    let guideData: Guide[] = [];
    let activityData: Activity[] = [];

    try {
      const guidesResponse = await fetchJson<ApiResponse<unknown[]>>(
        `${API_BASE_URL}/api/v1/guides`,
      );

      const guideArray = extractArray(guidesResponse);
      guideData = guideArray.map(mapGuide);
    } catch (guideError) {
      console.error("Failed to fetch guides, loading store fallback:", guideError);
      guideData = [];
    }

    if (guideData.length === 0) {
      const storeGuides = cmsStore.getGuides();
      guideData = storeGuides.map((g) => ({
        id: String(g.id),
        name: g.fullName,
        description: g.bio || `Certified ${g.specialization} with ${g.experienceYears || 5}+ years experience across Annapurna & Mustang corridors.`,
        image: g.photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
        rating: 4.9,
        location: g.location || "Pokhara / Kathmandu",
        price: g.dailyRate || 3500,
        specialties: g.specialization ? [g.specialization, "Trekking", "Mountain Navigation"] : ["Trekking", "Cultural Heritage"],
        languages: g.languages && g.languages.length > 0 ? g.languages : ["Nepali", "English"],
        guideContactDetails: g.contactNumber,
        availability: "Available Daily",
        experienceYears: g.experienceYears || 5,
        certified: true,
      }));
    }

    try {
      const activitiesResponse = await fetchJson<ApiResponse<unknown[]>>(
        `${API_BASE_URL}/api/v1/activities`,
      );

      const activityArray = extractArray(activitiesResponse);

      activityData = activityArray.map(mapActivity);
    } catch (activityError) {
      console.error("Failed to fetch activities:", activityError);

      activityData = [];
    }

    setGuides(guideData);
    setActivities(activityData);

    if (guideData.length === 0 && activityData.length === 0) {
      setError("Unable to load guides and activities from the server.");
    }

    setLoading(false);
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  React.useEffect(() => {
    fetchGuideAndActivityData();
  }, [fetchGuideAndActivityData]);

  /* =======================================================
     FILTER GUIDES
  ======================================================= */

  const filteredGuides = React.useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return guides.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.specialties.some((specialty) =>
          specialty.toLowerCase().includes(query),
        ) ||
        item.languages.some((language) =>
          language.toLowerCase().includes(query),
        );

      const matchesSpecialty =
        !specialtyFilter ||
        item.specialties.some(
          (specialty) =>
            specialty.toLowerCase() === specialtyFilter.toLowerCase(),
        );

      const matchesLanguage =
        !languageFilter ||
        item.languages.some(
          (language) => language.toLowerCase() === languageFilter.toLowerCase(),
        );

      let matchesPrice = true;

      if (priceFilter === "budget") {
        matchesPrice = item.price < 150;
      }

      if (priceFilter === "standard") {
        matchesPrice = item.price >= 150 && item.price <= 200;
      }

      if (priceFilter === "premium") {
        matchesPrice = item.price > 200;
      }

      return (
        matchesSearch && matchesSpecialty && matchesLanguage && matchesPrice
      );
    });
  }, [guides, searchTerm, specialtyFilter, languageFilter, priceFilter]);

  /* =======================================================
     FILTER ACTIVITIES
  ======================================================= */

  const filteredActivities = React.useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return activities;
    }

    return activities.filter(
      (activity) =>
        activity.activityName.toLowerCase().includes(query) ||
        activity.guideName.toLowerCase().includes(query) ||
        activity.difficultyLevel.toLowerCase().includes(query) ||
        activity.duration.toLowerCase().includes(query),
    );
  }, [activities, searchTerm]);

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearchTerm("");
    setSpecialtyFilter("");
    setLanguageFilter("");
    setPriceFilter("");
  };

  const hasFilters = Boolean(
    searchTerm || specialtyFilter || languageFilter || priceFilter,
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50/50">
      {/* Animated background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-100/10 rounded-full blur-3xl" />
      </div>

      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl animate-float delay-700" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium mb-4 border border-white/10">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              Local Travel Experts
              <span className="w-1 h-1 bg-white/30 rounded-full" />
              <span className="text-blue-200">Nepal</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-300">
                Local Guide
              </span>
            </h1>

            <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">
              Connect with expert local guides and discover authentic activities from
              GojiTrip. Explore Nepal like never before.
            </p>

            {/* SEARCH */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/10">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 h-5 w-5" />

                  <input
                    type="text"
                    placeholder="Search guides, activities, location, or specialty..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="group px-8 py-3.5 bg-white text-blue-600 rounded-xl hover:shadow-lg hover:shadow-white/20 transition-all duration-300 font-semibold flex items-center gap-2 justify-center hover:scale-105"
                >
                  Find Guides
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-xl">{guides.length}+</div>
                  <div className="text-blue-200 text-sm">Expert Guides</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-xl">{activities.length}+</div>
                  <div className="text-blue-200 text-sm">Activities</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Star className="h-5 w-5 fill-yellow-300 text-yellow-300" />
                </div>
                <div>
                  <div className="font-bold text-xl">4.9</div>
                  <div className="text-blue-200 text-sm">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 55C120 50 240 40 360 45C480 50 600 70 720 75C840 80 960 70 1080 60C1200 50 1320 40 1380 35L1440 30V120H1380C1320 120 1200 120 1080 120H360C240 120 120 120 60 120H0V60Z" fill="#F9FAFB" />
          </svg>
        </div>
      </section>

      {/* =================================================
          FILTERS
      ================================================= */}

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 z-10">
        <div className="bg-white rounded-2xl p-5 shadow-xl border border-gray-100/80 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              {/* Specialty */}
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:bg-gray-50"
              >
                <option value="">All Specialties</option>
                <option value="history">🏛️ History</option>
                <option value="food">🍜 Food</option>
                <option value="adventure">🧗 Adventure</option>
                <option value="art">🎨 Art</option>
                <option value="architecture">🏗️ Architecture</option>
                <option value="hiking">🥾 Hiking</option>
                <option value="photography">📸 Photography</option>
                <option value="wildlife">🐘 Wildlife</option>
                <option value="culture">🎭 Culture</option>
              </select>

              {/* Language */}
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:bg-gray-50"
              >
                <option value="">All Languages</option>
                <option value="english">🇬🇧 English</option>
                <option value="spanish">🇪🇸 Spanish</option>
                <option value="french">🇫🇷 French</option>
                <option value="maori">🇳🇿 Maori</option>
                <option value="nepali">🇳🇵 Nepali</option>
                <option value="italian">🇮🇹 Italian</option>
              </select>

              {/* Price */}
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:bg-gray-50"
              >
                <option value="">All Prices</option>
                <option value="budget">💰 Budget - Under NPR 150</option>
                <option value="standard">💰💰 Standard - NPR 150 - 200</option>
                <option value="premium">💰💰💰 Premium - NPR 200+</option>
              </select>

              {/* Clear */}
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="group px-4 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all duration-300 flex items-center gap-2"
                >
                  <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                  Clear Filters
                </button>
              )}
            </div>

            <div className="text-sm text-gray-600 whitespace-nowrap bg-gray-50/80 px-4 py-2 rounded-xl border border-gray-100">
              <span className="font-bold text-gray-900 text-base">
                {filteredGuides.length}
              </span>{" "}
              {filteredGuides.length === 1 ? "guide" : "guides"} available
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 rounded-2xl p-5 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-xl">⚠️</span>
                </div>
                <p className="font-medium">{error}</p>
              </div>

              <button
                type="button"
                onClick={fetchGuideAndActivityData}
                className="group px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 font-medium flex items-center gap-2 hover:scale-105"
              >
                <svg className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =================================================
          GUIDES
      ================================================= */}

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Compass className="h-8 w-8 text-blue-600" />
              Local Guides
            </h2>

            <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Guides added and managed from the Admin Dashboard
            </p>
          </div>

          {filteredGuides.length > 0 && (
            <div className="hidden md:flex items-center gap-1 text-sm text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {filteredGuides.length} guides available
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : filteredGuides.length === 0 ? (
          <EmptyState
            message={
              guides.length === 0
                ? "No guides have been added from the Admin Dashboard yet."
                : "Try adjusting your search or filters to find the perfect guide."
            }
            onClear={clearFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide, index) => (
              <GuideCard key={guide.id} guide={guide} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* =================================================
          ACTIVITIES
      ================================================= */}

      {!loading && filteredActivities.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-purple-600" />
                Activities
              </h2>

              <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Activities added and managed from the Admin Dashboard
              </p>
            </div>

            <span className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl text-sm font-medium text-purple-700 border border-purple-100">
              {filteredActivities.length}{" "}
              {filteredActivities.length === 1 ? "activity" : "activities"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity, index) => (
              <ActivityCard key={activity.id} activity={activity} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default GuidePage; 