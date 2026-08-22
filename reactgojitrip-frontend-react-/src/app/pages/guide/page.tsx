"use client";

import "@/styles/pages/guide/guide.css";

import React from "react";
import { SafeImage } from "@/components/common/SafeImage";
import { Search, MapPin, Clock, Users } from "lucide-react";

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
  fallback = "/logo/gojitriplogo.jpg",
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

  /* -----------------------------
     Difficulty
  ----------------------------- */

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

  /* -----------------------------
     Availability
  ----------------------------- */

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

  /* -----------------------------
     Photos
  ----------------------------- */

  const photos = toStringArray(item.photos ?? item.images ?? item.imageUrls);

  /* -----------------------------
     Image
  ----------------------------- */

  const imageUrl = getImageUrl(
    toStringValue(item.imageUrl ?? item.image ?? item.photo ?? photos[0]),
  );

  /* -----------------------------
     Guide Name
  ----------------------------- */

  let guideName = toStringValue(item.guideName);

  /*
   * Fix:
   * item.guide is unknown, so access it
   * only after checking its type.
   */
  if (!guideName && item.guide && typeof item.guide === "object") {
    const guide = item.guide as Record<string, unknown>;

    guideName = toStringValue(guide.name) || toStringValue(guide.fullName);
  }

  /* -----------------------------
     Return Activity
  ----------------------------- */

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
   GUIDE CARD
========================================================= */

const GuideCard: React.FC<{
  guide: Guide;
}> = ({ guide }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
      {/* Image */}

      <div className="relative h-64 bg-gray-100">
        <SafeImage
          src={guide.image}
          fallbackSrc="/logo/gojitriplogo.jpg"
          alt={guide.name || "Travel guide"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Rating */}

        {guide.rating > 0 && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
            <span className="flex items-center gap-1 text-yellow-500 font-semibold text-sm">
              ⭐ {guide.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {guide.name}
        </h3>

        {/* Location */}

        <p className="text-gray-600 text-sm mb-3 flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {guide.location}
        </p>

        {/* Description */}

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {guide.description}
        </p>

        {/* Specialties */}

        {guide.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {guide.specialties.map((specialty) => (
              <span
                key={`${guide.id}-specialty-${specialty}`}
                className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
        )}

        {/* Languages */}

        {guide.languages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {guide.languages.slice(0, 3).map((language) => (
              <span
                key={`${guide.id}-language-${language}`}
                className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full"
              >
                {language}
              </span>
            ))}
          </div>
        )}

        {/* Availability */}

        {guide.availability && (
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
            <Clock className="h-4 w-4" />
            {guide.availability}
          </div>
        )}

        {/* Bottom */}

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div>
            <span className="text-xl font-bold text-blue-600">
              {guide.price > 0
                ? `NPR ${guide.price.toLocaleString()}`
                : "Contact"}
            </span>

            {guide.price > 0 && (
              <span className="text-gray-500 text-sm">/day</span>
            )}
          </div>

          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Book Guide
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
}> = ({ activity }) => {
  const activityImage = activity.imageUrl || getImageUrl(activity.photos?.[0]);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
      {/* Image */}

      <div className="relative h-64 bg-gray-100">
        <SafeImage
          src={activityImage}
          fallbackSrc="/logo/gojitriplogo.jpg"
          alt={activity.activityName || "Activity"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
          Activity
        </div>
      </div>

      {/* Content */}

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {activity.activityName}
        </h3>

        {activity.guideName && (
          <p className="text-gray-600 text-sm mb-3 flex items-center gap-1">
            <Users className="h-4 w-4" />
            Guide: {activity.guideName}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            {activity.difficultyLevel}
          </span>

          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
            {activity.duration}
          </span>

          <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
            {activity.availability}
          </span>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <span className="text-xl font-bold text-blue-600">
            {activity.pricing > 0
              ? `NPR ${activity.pricing.toLocaleString()}`
              : "Contact"}
          </span>

          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View Activity
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
          className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse"
        >
          <div className="h-64 bg-gray-200" />

          <div className="p-5 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4" />

            <div className="h-4 bg-gray-200 rounded w-1/3" />

            <div className="h-4 bg-gray-200 rounded w-full" />

            <div className="h-4 bg-gray-200 rounded w-5/6" />

            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded-full w-16" />
              <div className="h-6 bg-gray-200 rounded-full w-20" />
            </div>

            <div className="flex justify-between pt-3">
              <div className="h-7 bg-gray-200 rounded w-24" />
              <div className="h-9 bg-gray-200 rounded w-28" />
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
    <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
      <div className="text-5xl mb-4">🧭</div>

      <h3 className="text-2xl font-semibold text-gray-800 mb-2">
        No Guides Found
      </h3>

      <p className="text-gray-500 mb-6">{message}</p>

      <button
        type="button"
        onClick={onClear}
        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Clear Filters
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

    /* ---------------------------
         Guides
      --------------------------- */

    try {
      const guidesResponse = await fetchJson<ApiResponse<unknown[]>>(
        `${API_BASE_URL}/api/v1/guides`,
      );

      const guideArray = extractArray(guidesResponse);

      guideData = guideArray.map(mapGuide);
    } catch (guideError) {
      console.error("Failed to fetch guides:", guideError);

      guideData = [];
    }

    /* ---------------------------
         Activities
      --------------------------- */

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
    <div className="min-h-screen bg-gray-50">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <div className="text-blue-100 font-medium mb-3">
              Local Travel Experts
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Guide
            </h1>

            <p className="text-blue-100 text-lg mb-8">
              Connect with expert local guides and discover activities from
              GojiTrip.
            </p>

            {/* SEARCH */}

            <div className="bg-white rounded-xl p-4 shadow-xl">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

                  <input
                    type="text"
                    placeholder="Search guides, activities, location, or specialty..."
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Find Guides
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          FILTERS
      ================================================= */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              {/* Specialty */}

              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Specialties</option>
                <option value="history">History</option>
                <option value="food">Food</option>
                <option value="adventure">Adventure</option>
                <option value="art">Art</option>
                <option value="architecture">Architecture</option>
                <option value="hiking">Hiking</option>
                <option value="photography">Photography</option>
                <option value="wildlife">Wildlife</option>
                <option value="culture">Culture</option>
              </select>

              {/* Language */}

              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Languages</option>
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="maori">Maori</option>
                <option value="nepali">Nepali</option>
                <option value="italian">Italian</option>
              </select>

              {/* Price */}

              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Prices</option>

                <option value="budget">Budget - Under NPR 150</option>

                <option value="standard">Standard - NPR 150 - 200</option>

                <option value="premium">Premium - NPR 200+</option>
              </select>

              {/* Clear */}

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="text-sm text-gray-600 whitespace-nowrap">
              <span className="font-semibold text-gray-900">
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p>{error}</p>

              <button
                type="button"
                onClick={fetchGuideAndActivityData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =================================================
          GUIDES
      ================================================= */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Local Guides</h2>

            <p className="text-gray-500 text-sm mt-1">
              Guides added and managed from the Admin Dashboard
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : filteredGuides.length === 0 ? (
          <EmptyState
            message={
              guides.length === 0
                ? "No guides have been added from the Admin Dashboard yet."
                : "Try adjusting your search or filters."
            }
            onClear={clearFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        )}
      </section>

      {/* =================================================
          ACTIVITIES
      ================================================= */}

      {!loading && filteredActivities.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Activities</h2>

              <p className="text-gray-500 text-sm mt-1">
                Activities added and managed from the Admin Dashboard
              </p>
            </div>

            <span className="text-sm text-gray-600">
              {filteredActivities.length}{" "}
              {filteredActivities.length === 1 ? "activity" : "activities"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default GuidePage;
