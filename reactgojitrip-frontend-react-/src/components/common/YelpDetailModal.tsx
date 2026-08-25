"use client";

import React, { useState } from "react";
import {
  X,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Share2,
  Bookmark,
  Camera,
  Edit3,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Users,
  Utensils,
  Hotel,
  Bus,
  Wifi,
  Wind,
  Car,
  CreditCard,
  Tv,
  Coffee,
  Sparkles,
} from "lucide-react";
import { SafeImage } from "@/components/common/SafeImage";

/* ============================================================
   TYPES
============================================================ */

export interface ReviewItem {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
}

export interface OfferingItem {
  title: string;
  price: string;
  desc: string;
  image?: string;
}

export interface YelpDetailData {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  priceLevel: string; // "$$", "$$$"
  address: string;
  location: string;
  phone?: string;
  whatsapp?: string;
  image: string;
  galleryImages?: string[];
  description: string;
  amenities: string[];
  hours?: { day: string; time: string }[];
  offerings?: OfferingItem[];
  reviewsList?: ReviewItem[];
  priceTag?: string;
  entityType: "hotel" | "restaurant" | "transport";
}

type YelpDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  data: YelpDetailData | null;
  onBookNow?: (data: YelpDetailData) => void;
};

const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80";

/* ============================================================
   COMPONENT
============================================================ */

export default function YelpDetailModal({
  isOpen,
  onClose,
  data,
  onBookNow,
}: YelpDetailModalProps) {
  const [bookDate, setBookDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [guests, setGuests] = useState<number>(2);
  const [bookTime, setBookTime] = useState<string>("12:00 PM");
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Live Review Form State
  const [newAuthor, setNewAuthor] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [userReviews, setUserReviews] = useState<ReviewItem[]>([]);
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);

  if (!isOpen || !data) return null;

  // Combine default reviews with user-submitted reviews
  const allReviews = [
    ...userReviews,
    ...(data.reviewsList || [
      {
        id: "r-1",
        author: "Pasang Gurung",
        rating: 5,
        date: "2 days ago",
        comment: "Exceptional service and beautiful views! Highly recommended for anyone traveling in Nepal.",
      },
      {
        id: "r-2",
        author: "Anjali Sharma",
        rating: 4,
        date: "1 week ago",
        comment: "Great experience. Clean facilities, helpful staff, and very convenient location along the route.",
      },
    ]),
  ];

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const review: ReviewItem = {
      id: `user-r-${Date.now()}`,
      author: newAuthor.trim() || "Verified Traveler",
      rating: newRating,
      date: "Just now",
      comment: newComment.trim(),
    };

    setUserReviews([review, ...userReviews]);
    setNewComment("");
    setNewAuthor("");
    setShowReviewSuccess(true);
    setTimeout(() => setShowReviewSuccess(false), 4000);
  };

  const gallery = data.galleryImages && data.galleryImages.length >= 3
    ? data.galleryImages
    : [
        data.image || DEFAULT_FALLBACK,
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
      ];

  const operatingHours = data.hours || [
    { day: "Mon - Fri", time: "07:00 AM - 10:00 PM" },
    { day: "Saturday", time: "07:00 AM - 11:00 PM" },
    { day: "Sunday", time: "08:00 AM - 09:00 PM" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-6 border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* =====================================================
            1. YELP-STYLE PHOTO MOSAIC GALLERY HEADER
        ===================================================== */}
        <div className="relative h-64 sm:h-80 w-full bg-slate-900 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 h-full gap-1">
            <div className="relative sm:col-span-2 h-full overflow-hidden">
              <SafeImage
                src={gallery[0]}
                fallbackSrc={DEFAULT_FALLBACK}
                alt={data.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            </div>
            <div className="hidden sm:grid grid-rows-2 h-full gap-1">
              <div className="relative h-full overflow-hidden">
                <SafeImage src={gallery[1]} fallbackSrc={DEFAULT_FALLBACK} alt="Gallery 2" fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="relative h-full overflow-hidden">
                <SafeImage src={gallery[2]} fallbackSrc={DEFAULT_FALLBACK} alt="Gallery 3" fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          </div>

          {/* OVERLAY BUSINESS HEADER DETAILS */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                {data.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white font-bold text-[10px] backdrop-blur-md flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified GojiTrip Partner</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
              {data.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold">
              <div className="flex items-center space-x-1 bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-lg font-extrabold">
                <Star className="w-4 h-4 fill-slate-950" />
                <span>{data.rating || 4.8}</span>
              </div>
              <span className="text-slate-200">({allReviews.length} Verified Reviews)</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-400 font-bold">{data.priceLevel || "$$"}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-200 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>{data.location}</span>
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================
            2. YELP QUICK ACTION BUTTONS BAR
        ===================================================== */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
          <div className="flex flex-wrap gap-2">
            <a
              href="#review-section"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <Edit3 className="w-4 h-4" />
              <span>Write a Review</span>
            </a>

            <button
              type="button"
              onClick={() => setIsSaved(!isSaved)}
              className={`px-4 py-2 rounded-xl border transition-all flex items-center space-x-1.5 ${
                isSaved ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-emerald-600 text-emerald-600" : ""}`} />
              <span>{isSaved ? "Saved" : "Save Listing"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: data.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }
              }}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-all flex items-center space-x-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {data.phone && (
              <a
                href={`tel:${data.phone}`}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all flex items-center space-x-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Direct</span>
              </a>
            )}
            {data.whatsapp && (
              <a
                href={`https://wa.me/${data.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all flex items-center space-x-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* =====================================================
            3. MAIN CONTENT BODY (2 COLUMNS)
        ===================================================== */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 max-h-[calc(85vh-200px)] overflow-y-auto">
          
          {/* LEFT COLUMN: ABOUT, OFFERINGS, HOURS, REVIEWS (65% WIDTH) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ABOUT THE BUSINESS */}
            <div className="space-y-3 border-b border-slate-100 pb-6">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>About {data.name}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {data.description || `${data.name} is a premier destination offering high quality experiences along the Nepal travel corridors.`}
              </p>
            </div>

            {/* FEATURED OFFERINGS / ROOM TYPES / VEHICLE FLEET */}
            {data.offerings && data.offerings.length > 0 && (
              <div className="space-y-4 border-b border-slate-100 pb-6">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                  {data.entityType === "hotel" ? <Hotel className="w-5 h-5 text-emerald-600" /> : data.entityType === "restaurant" ? <Utensils className="w-5 h-5 text-orange-500" /> : <Bus className="w-5 h-5 text-blue-600" />}
                  <span>{data.entityType === "hotel" ? "Available Room Types & Rates" : data.entityType === "restaurant" ? "Popular Menu Highlights" : "Vehicle Fleet & Fares"}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.offerings.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 transition-all flex space-x-3">
                      {item.image && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 border border-slate-200">
                          <SafeImage src={item.image} fallbackSrc={DEFAULT_FALLBACK} alt={item.title} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">{item.title}</h4>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-lg">
                            {item.price}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AMENITIES & FEATURES CHECKLIST */}
            <div className="space-y-4 border-b border-slate-100 pb-6">
              <h3 className="text-lg font-extrabold text-slate-900">Amenities & Services</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data.amenities && data.amenities.length > 0 ? (
                  data.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))
                ) : (
                  ["Free Wi-Fi", "Free Parking", "AC & Heating", "Hot Water", "24/7 Service", "Credit Cards Accepted"].map((am, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{am}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* LOCATION & OPERATING HOURS */}
            <div className="space-y-4 border-b border-slate-100 pb-6">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <span>Location & Hours</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-900">{data.address || data.location}</div>
                  <button
                    type="button"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.name + " " + data.location)}`, "_blank")}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:underline"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Operating Hours</span>
                  </div>
                  {operatingHours.map((h, i) => (
                    <div key={i} className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{h.day}:</span>
                      <span className="font-bold">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* YELP REVIEWS & RATING SECTION */}
            <div id="review-section" className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Customer Reviews & Ratings
                </h3>
                <div className="flex items-center space-x-1 text-amber-500 font-extrabold text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{data.rating || 4.8} / 5.0</span>
                </div>
              </div>

              {/* WRITE A REVIEW FORM */}
              <form onSubmit={handleAddReview} className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="font-extrabold text-xs sm:text-sm text-slate-900">
                  Write Your Verified Review for {data.name}
                </div>

                {showReviewSuccess && (
                  <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Thank you! Your review has been posted successfully.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your Name (e.g. Pasang Sherpa)..."
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                  />

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-600">Rating:</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 text-amber-400 focus:outline-none"
                        >
                          <Star className={`w-5 h-5 ${star <= newRating ? "fill-amber-400" : "text-slate-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <textarea
                  placeholder="Share your experience (food, stay, transport comfort, hospitality)..."
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                />

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Post Review
                </button>
              </form>

              {/* REVIEWS LIST */}
              <div className="space-y-4">
                {allReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-slate-900">{rev.author}</div>
                          <div className="text-[10px] text-slate-400">{rev.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY BOOKING SIDEBAR (35% WIDTH) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xl space-y-5">
              
              <div className="border-b border-slate-100 pb-4">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {data.entityType === "hotel" ? "Nightly Rate" : data.entityType === "restaurant" ? "Average Meal Cost" : "Fare / Seat Rate"}
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {data.priceTag || "NRs 2,500"}
                </div>
                <div className="text-[11px] text-slate-500">Taxes & fees included</div>
              </div>

              {/* BOOKING INPUTS */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    {data.entityType === "hotel" ? "Check-in Date" : "Reservation Date"}
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={bookDate}
                      onChange={(e) => setBookDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                      {data.entityType === "transport" ? "Seats" : "Guests"}
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full pl-9 pr-2 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? "Person" : "People"}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                      Time
                    </label>
                    <select
                      value={bookTime}
                      onChange={(e) => setBookTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {["08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "06:00 PM", "08:00 PM"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* CTA BOOK BUTTON */}
              <button
                type="button"
                onClick={() => {
                  if (onBookNow) {
                    onBookNow(data);
                  } else {
                    alert(`Booking Request Sent for ${data.name} on ${bookDate} for ${guests} guests!`);
                  }
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all text-center"
              >
                {data.entityType === "hotel" ? "Book Room Now" : data.entityType === "restaurant" ? "Reserve Table" : "Book Transport Seat"}
              </button>

              {/* GUARANTEE BADGES */}
              <div className="pt-2 space-y-2 border-t border-slate-100 text-[11px] text-slate-500 font-semibold">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Instant Confirmation & Guarantee</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>No hidden booking fees</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
