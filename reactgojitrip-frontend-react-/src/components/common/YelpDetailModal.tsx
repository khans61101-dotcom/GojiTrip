"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Share2,
  Bookmark,
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
  Sparkles,
  ArrowLeft,
  Camera,
  CalendarCheck,
  Send,
  Loader2,
  Copy,
  Check,
  Bed,
  Home,
  Tag,
  ImageIcon,
  Trash2,
  ZoomIn,
  Plus,
  ChevronLeft,
  ChevronRight,
  Grid,
} from "lucide-react";
import { SafeImage } from "@/components/common/SafeImage";
import { cmsStore } from "@/lib/cms-store";
import { isAuthenticated, getStoredUser, UserProfile } from "@/lib/auth";
import { AuthBookingModal } from "@/components/auth/AuthBookingModal";
import { BookingItemType } from "@/types/cms";
import { compressImageFile } from "@/components/common/ImageFileInput";

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
  images?: string[];
}

export interface OfferingItem {
  title: string;
  price: string;
  desc: string;
  image?: string;
  ratePerNight?: number;
  capacity?: number;
  bedType?: string;
  facilities?: string[];
  count?: number;
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
  entityType: "hotel" | "restaurant" | "transport" | "homestay";
  contactPerson?: string;
  checkInTime?: string;
  checkOutTime?: string;
  partnerStatus?: string;
  availabilityStatus?: string;
  rawPrice?: number;
}

type YelpDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  data: YelpDetailData | null;
  onBookNow?: (data: YelpDetailData) => void;
};

const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80";

/* ============================================================
   COMPONENT - 100% FULL-SCREEN PAGE COVER
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
  const [selectedOffering, setSelectedOffering] = useState<OfferingItem | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);
  const [viewingImageIndex, setViewingImageIndex] = useState<number>(0);

  // Sync selected offering and reset slider whenever data changes
  useEffect(() => {
    setCurrentSlide(0);
    if (data?.offerings && data.offerings.length > 0) {
      setSelectedOffering(data.offerings[0]);
    } else {
      setSelectedOffering(null);
    }
  }, [data]);

  // Live Review Form State
  const [newAuthor, setNewAuthor] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [newReviewImages, setNewReviewImages] = useState<string[]>([]);
  const [isCompressingImages, setIsCompressingImages] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const reviewFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [userReviews, setUserReviews] = useState<ReviewItem[]>([]);
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);

  const handleSelectReviewImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsCompressingImages(true);
    try {
      const fileList = Array.from(files);
      const compressedList: string[] = [];
      for (const f of fileList) {
        if (newReviewImages.length + compressedList.length >= 6) break;
        try {
          const comp = await compressImageFile(f, 800, 0.65);
          compressedList.push(comp);
        } catch (err) {
          console.warn("Could not compress review image:", err);
        }
      }
      setNewReviewImages((prev) => [...prev, ...compressedList].slice(0, 6));
    } finally {
      setIsCompressingImages(false);
      if (reviewFileInputRef.current) reviewFileInputRef.current.value = "";
    }
  };

  const handleRemoveReviewImage = (idxToRemove: number) => {
    setNewReviewImages((prev) => prev.filter((_, i) => i !== idxToRemove));
  };

  // Booking & Auth State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const getActiveNumericRate = (): number => {
    if (selectedOffering?.ratePerNight && selectedOffering.ratePerNight > 0) {
      return selectedOffering.ratePerNight;
    }
    if (data?.rawPrice && data.rawPrice > 0) {
      return data.rawPrice;
    }
    const tagMatch = (data?.priceTag || "").replace(/,/g, "").match(/\d+/);
    if (tagMatch) {
      const parsed = Number(tagMatch[0]);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const levelMatch = (data?.priceLevel || "").match(/\d+/);
    if (levelMatch) {
      const parsed = Number(levelMatch[0]);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 2500;
  };

  const handleBookClick = () => {
    if (!isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }
    proceedToBookingConfirm();
  };

  const proceedToBookingConfirm = (userOverride?: UserProfile) => {
    const user = userOverride || getStoredUser();
    if (user) {
      setCustomerName(user.full_name || user.username || "");
      setCustomerEmail(user.email || "");
      if (user.phone) setCustomerPhone(user.phone);
    }
    setShowConfirmModal(true);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setIsSubmittingBooking(true);
    try {
      const itemTypeMap: Record<string, BookingItemType> = {
        hotel: "Hotel",
        restaurant: "Restaurant",
        transport: "Transport",
        homestay: "Homestay",
        activity: "Activity",
        route: "Route",
      };
      const itemType: BookingItemType = itemTypeMap[data.entityType] || "Hotel";
      const numericPrice = getActiveNumericRate();
      const isStay = data.entityType === "hotel" || data.entityType === "homestay";

      const currencyStr = (data.priceTag?.includes("NRs") || data.priceTag?.includes("Rs") || data.priceLevel?.includes("NPR") || data.priceLevel?.includes("Rs"))
        ? "NPR"
        : "USD";

      const roomDetailNote = selectedOffering
        ? `Selected Room: ${selectedOffering.title} (${selectedOffering.price})`
        : "";
      const combinedNotes = [roomDetailNote, specialNotes.trim()].filter(Boolean).join("\n");

      const user = getStoredUser();
      const newBooking = await cmsStore.saveBooking({
        itemType,
        itemId: String(data.id),
        itemName: selectedOffering ? `${data.name} - ${selectedOffering.title}` : data.name,
        itemImage: selectedOffering?.image || data.image,
        location: data.address || data.location,
        customerName: customerName.trim() || user?.full_name || user?.username || "Guest User",
        customerEmail: customerEmail.trim() || user?.email || "",
        customerPhone: customerPhone.trim() || (user as any)?.phone || "",
        userId: user?.id,
        checkInDate: bookDate,
        bookingTime: bookTime,
        guests,
        totalPrice: isStay ? numericPrice : numericPrice * guests,
        currency: currencyStr,
        status: "Pending",
        paymentStatus: "Pay on Arrival",
        specialRequests: combinedNotes || undefined,
      });

      setConfirmedBookingId(newBooking.id);
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      if (onBookNow) onBookNow(data);
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Prevent background scroll when full page view is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Load persisted reviews from localStorage when modal opens
  useEffect(() => {
    if (data?.id) {
      try {
        const saved = localStorage.getItem(`goji_reviews_${data.id}`);
        if (saved) {
          setUserReviews(JSON.parse(saved));
        } else {
          setUserReviews([]);
        }
      } catch (err) {
        console.error("Error reading reviews:", err);
      }
    }
  }, [data?.id]);

  const gallery = useMemo(() => {
    if (!data) return [DEFAULT_FALLBACK];
    const raw: string[] = [
      ...(Array.isArray(data.galleryImages) ? data.galleryImages : []),
      ...(data.image ? [data.image] : []),
    ];
    if (Array.isArray(data.offerings)) {
      data.offerings.forEach((off) => {
        if (off.image && typeof off.image === "string") raw.push(off.image);
      });
    }
    const unique = Array.from(new Set(raw.filter((img) => typeof img === "string" && img.trim().length > 0)));
    return unique.length > 0 ? unique : [DEFAULT_FALLBACK];
  }, [data]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % gallery.length);
  }, [gallery.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + gallery.length) % gallery.length);
  }, [gallery.length]);

  const handleNextViewingImage = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setViewingImageIndex((prev) => {
      const nextIdx = (prev + 1) % gallery.length;
      setViewingImage(gallery[nextIdx]);
      return nextIdx;
    });
  }, [gallery]);

  const handlePrevViewingImage = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setViewingImageIndex((prev) => {
      const prevIdx = (prev - 1 + gallery.length) % gallery.length;
      setViewingImage(gallery[prevIdx]);
      return prevIdx;
    });
  }, [gallery]);

  // Keyboard navigation for slider and lightbox
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (viewingImage) {
          handleNextViewingImage();
        } else {
          nextSlide();
        }
      } else if (e.key === "ArrowLeft") {
        if (viewingImage) {
          handlePrevViewingImage();
        } else {
          prevSlide();
        }
      } else if (e.key === "Escape") {
        if (viewingImage) setViewingImage(null);
        else if (showGalleryModal) setShowGalleryModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, viewingImage, showGalleryModal, nextSlide, prevSlide, handleNextViewingImage, handlePrevViewingImage]);

  if (!isOpen || !data) return null;

  // Combine default reviews with user-submitted reviews
  const defaultReviews: ReviewItem[] = [
    {
      id: "r-1",
      author: "Pasang Gurung",
      rating: 5,
      date: "2 days ago",
      comment: "Exceptional service and beautiful views! Highly recommended for anyone traveling in Nepal.",
      images: [
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
      ],
    },
    {
      id: "r-2",
      author: "Anjali Sharma",
      rating: 4,
      date: "1 week ago",
      comment: "Great experience. Clean facilities, helpful staff, and very convenient location along the route.",
      images: [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
      ],
    },
  ];

  const allReviews = [
    ...userReviews,
    ...(data.reviewsList || defaultReviews),
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
      images: newReviewImages.length > 0 ? newReviewImages : undefined,
    };

    const updatedReviews = [review, ...userReviews];
    setUserReviews(updatedReviews);
    if (data?.id) {
      try {
        localStorage.setItem(`goji_reviews_${data.id}`, JSON.stringify(updatedReviews));
      } catch (err) {
        console.error("Error saving review:", err);
      }
    }

    setNewComment("");
    setNewAuthor("");
    setNewReviewImages([]);
    setShowReviewSuccess(true);
    setTimeout(() => setShowReviewSuccess(false), 4000);
  };

  const operatingHours = data.hours || [
    { day: "Mon - Fri", time: "07:00 AM - 10:00 PM" },
    { day: "Saturday", time: "07:00 AM - 11:00 PM" },
    { day: "Sunday", time: "08:00 AM - 09:00 PM" },
  ];

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen min-h-screen overflow-y-auto bg-white text-slate-900 animate-in fade-in duration-200">
      
      {/* =====================================================
          TOP STICKY BACK & NAVIGATION BAR
      ===================================================== */}
      <div className="sticky top-0 z-50 bg-slate-950/95 text-white backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all border border-white/15 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Listings</span>
        </button>

        <div className="font-extrabold text-sm sm:text-base text-slate-200 truncate max-w-md hidden sm:block">
          {data.name}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-md active:scale-95"
          aria-label="Close full page view"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full bg-white min-h-[calc(100vh-60px)] pb-16">
        
        {/* =====================================================
            1. HERO FULL-WIDTH IMAGE SLIDER & CONTROLS
        ===================================================== */}
        <div className="relative h-96 sm:h-[520px] md:h-[560px] w-full bg-slate-950 overflow-hidden select-none group">
          {/* SLIDES WITH SMOOTH TRANSITION */}
          {gallery.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out cursor-pointer ${
                idx === currentSlide ? "opacity-100 z-10 scale-100" : "opacity-0 pointer-events-none z-0 scale-105"
              }`}
              onClick={() => {
                setViewingImageIndex(idx);
                setViewingImage(img);
              }}
            >
              <SafeImage
                src={img}
                fallbackSrc={DEFAULT_FALLBACK}
                alt={`${data.name} photo ${idx + 1}`}
                fill
                className="object-cover transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-slate-950/20" />
            </div>
          ))}

          {/* PREV / NEXT NAVIGATION ARROWS */}
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-950/60 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all shadow-xl hover:scale-110 active:scale-95 group/btn cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 group-hover/btn:-translate-x-0.5 transition-transform" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-950/60 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all shadow-xl hover:scale-110 active:scale-95 group/btn cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}

          {/* TOP-RIGHT CONTROLS: PHOTO COUNTER + VIEW ALL GALLERY BUTTON */}
          <div className="absolute top-5 right-4 sm:right-8 z-30 flex items-center space-x-2.5">
            <div className="px-3.5 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md text-white font-black text-xs border border-white/20 shadow-lg flex items-center space-x-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentSlide + 1} / {gallery.length}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowGalleryModal(true);
              }}
              className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs backdrop-blur-md border border-emerald-400/40 shadow-xl flex items-center space-x-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>All Photos ({gallery.length})</span>
            </button>
          </div>

          {/* BOTTOM SLIDE DOT INDICATORS */}
          {gallery.length > 1 && (
            <div className="absolute bottom-24 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(i);
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === currentSlide
                      ? "w-7 bg-emerald-400 shadow-md"
                      : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* OVERLAY BUSINESS HEADER DETAILS */}
          <div className="absolute bottom-6 left-4 right-4 sm:left-12 sm:right-12 z-20 text-white space-y-3 max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1 rounded-full bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md">
                  {data.category}
                </span>
                <span className="px-3.5 py-1 rounded-full bg-white/20 text-white font-bold text-xs backdrop-blur-md flex items-center space-x-1.5 border border-white/20">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified GojiTrip Partner</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-md">
                {data.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm font-semibold">
                <div className="flex items-center space-x-1.5 bg-amber-400 text-slate-950 px-3 py-1 rounded-xl font-black text-sm shadow-md">
                  <Star className="w-4 h-4 fill-slate-950" />
                  <span>{data.rating || 4.8}</span>
                </div>
                <span className="text-slate-200">({allReviews.length} Verified Reviews)</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-bold">{data.priceLevel || "$$"}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-200 flex items-center space-x-1 truncate max-w-xs sm:max-w-md">
                  <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="truncate">{data.location}</span>
                </span>
              </div>
            </div>

            {/* Gallery Button on Right */}
            <div className="hidden sm:block shrink-0">
              <button
                type="button"
                onClick={() => setShowGalleryModal(true)}
                className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-black text-xs sm:text-sm rounded-2xl backdrop-blur-md border border-white/30 shadow-xl flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Grid className="w-4 h-4 text-emerald-400" />
                <span>Explore Gallery ({gallery.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================
            2. YELP QUICK ACTION BUTTONS BAR
        ===================================================== */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-12 py-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
            <div className="flex flex-wrap gap-2.5">
              <a
                href="#review-section"
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all flex items-center space-x-2 active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                <span>Write a Review</span>
              </a>

              <button
                type="button"
                onClick={() => setShowGalleryModal(true)}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-all flex items-center space-x-2 active:scale-95 shadow-2xs cursor-pointer"
              >
                <Grid className="w-4 h-4 text-emerald-600" />
                <span>Photos ({gallery.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSaved(!isSaved)}
                className={`px-5 py-2.5 rounded-xl border transition-all flex items-center space-x-2 active:scale-95 ${
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
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-all flex items-center space-x-2 active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>

            <div className="flex items-center space-x-2.5">
              {data.phone && (
                <a
                  href={`tel:${data.phone}`}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all flex items-center space-x-2 active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Direct</span>
                </a>
              )}
              {data.whatsapp && (
                <a
                  href={`https://wa.me/${data.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all flex items-center space-x-2 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            3. MAIN CONTENT BODY - FULL COVER (2 COLUMNS)
        ===================================================== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-12 py-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT COLUMN: ABOUT, HOST INFO, OFFERINGS, HOURS, REVIEWS (65% WIDTH) */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* HOST & PROPERTY INFORMATION BANNER */}
            {(data.contactPerson || data.checkInTime || data.partnerStatus || data.availabilityStatus) && (
              <div className="bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-slate-50 border border-emerald-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-600/20">
                      {data.contactPerson ? data.contactPerson.charAt(0).toUpperCase() : <Home className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
                        {data.entityType === "homestay" ? "Local Village Host" : "Property Host & Contact"}
                      </div>
                      <div className="text-base sm:text-lg font-black text-slate-900">
                        {data.contactPerson ? `Hosted by ${data.contactPerson}` : data.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {data.partnerStatus && (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center space-x-1.5 border border-emerald-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{data.partnerStatus}</span>
                      </span>
                    )}
                    {data.availabilityStatus && (
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1.5 border ${
                        data.availabilityStatus.toLowerCase().includes("avail")
                          ? "bg-emerald-500 text-white border-emerald-600"
                          : "bg-amber-100 text-amber-900 border-amber-300"
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{data.availabilityStatus}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Timings & Direct Contact Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-emerald-200/60 text-xs font-semibold text-slate-700">
                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-emerald-100">
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Check-In</span>
                    <span className="font-extrabold text-slate-900 text-sm">{data.checkInTime || "12:00 PM"}</span>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-emerald-100">
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Check-Out</span>
                    <span className="font-extrabold text-slate-900 text-sm">{data.checkOutTime || "10:00 AM"}</span>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-emerald-100">
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Property Type</span>
                    <span className="font-extrabold text-slate-900 text-sm">{data.category || (data.entityType === "homestay" ? "Homestay" : "Hotel")}</span>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-emerald-100 flex flex-col justify-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Host Support</span>
                    <span className="font-extrabold text-emerald-700 text-xs">24/7 Assistance</span>
                  </div>
                </div>
              </div>
            )}

            {/* ABOUT THE BUSINESS */}
            <div className="space-y-4 border-b border-slate-100 pb-8">
              <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2.5">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>About {data.name}</span>
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                {data.description || `${data.name} is a premier destination offering high quality experiences along the Nepal travel corridors.`}
              </p>
            </div>

            {/* FEATURED OFFERINGS / ROOM TYPES / VEHICLE FLEET */}
            {data.offerings && data.offerings.length > 0 && (
              <div className="space-y-5 border-b border-slate-100 pb-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2.5">
                    {data.entityType === "homestay" ? (
                      <Home className="w-6 h-6 text-emerald-600" />
                    ) : data.entityType === "hotel" ? (
                      <Hotel className="w-6 h-6 text-emerald-600" />
                    ) : data.entityType === "restaurant" ? (
                      <Utensils className="w-6 h-6 text-orange-500" />
                    ) : (
                      <Bus className="w-6 h-6 text-blue-600" />
                    )}
                    <span>
                      {data.entityType === "homestay"
                        ? "Available Homestay Rooms & Rates"
                        : data.entityType === "hotel"
                        ? "Available Room Types & Rates"
                        : data.entityType === "restaurant"
                        ? "Popular Menu Highlights"
                        : "Vehicle Fleet & Fares"}
                    </span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    {data.offerings.length} {data.offerings.length === 1 ? "Option" : "Options"} Available
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {data.offerings.map((item, idx) => {
                    const isSelected = selectedOffering?.title === item.title;
                    return (
                      <div
                        key={idx}
                        className={`bg-slate-50 p-5 rounded-2xl border transition-all flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5 ${
                          isSelected
                            ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/20"
                            : "border-slate-200 hover:border-emerald-300 hover:shadow-sm"
                        }`}
                      >
                        {item.image && (
                          <div className="w-full sm:w-36 h-32 rounded-xl overflow-hidden relative shrink-0 border border-slate-200">
                            <SafeImage
                              src={item.image}
                              fallbackSrc={DEFAULT_FALLBACK}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-black text-base text-slate-900">{item.title}</h4>
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-xl shrink-0">
                                {item.price}
                              </span>
                            </div>

                            {/* Capacity & Bed Type Pills */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {item.capacity && (
                                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold">
                                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{item.capacity} {item.capacity === 1 ? "Guest" : "Guests"} max</span>
                                </span>
                              )}
                              {item.bedType && (
                                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold">
                                  <Bed className="w-3.5 h-3.5 text-blue-600" />
                                  <span>{item.bedType}</span>
                                </span>
                              )}
                            </div>

                            {/* Facilities chips */}
                            {Array.isArray(item.facilities) && item.facilities.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {item.facilities.map((fac, fIdx) => (
                                  <span
                                    key={fIdx}
                                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200"
                                  >
                                    {fac}
                                  </span>
                                ))}
                              </div>
                            )}

                            {item.desc && !Array.isArray(item.facilities) && (
                              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.desc}</p>
                            )}
                          </div>

                          {/* Room Selection CTA Button */}
                          {(data.entityType === "hotel" || data.entityType === "homestay") && (
                            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                              <span className="text-xs text-slate-500 font-medium">
                                {isSelected ? "Currently selected for reservation" : "Click to select this room"}
                              </span>
                              <button
                                type="button"
                                onClick={() => setSelectedOffering(item)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                                  isSelected
                                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                    : "bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 active:scale-95"
                                }`}
                              >
                                {isSelected ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Selected</span>
                                  </>
                                ) : (
                                  <span>Select Room</span>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AMENITIES & FEATURES CHECKLIST */}
            <div className="space-y-5 border-b border-slate-100 pb-8">
              <h3 className="text-xl font-black text-slate-900">Amenities & Services</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {data.amenities && data.amenities.length > 0 ? (
                  data.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center space-x-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))
                ) : (
                  ["Free Wi-Fi", "Free Parking", "AC & Heating", "Hot Water", "24/7 Service", "Credit Cards Accepted"].map((am, idx) => (
                    <div key={idx} className="flex items-center space-x-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{am}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* LOCATION & OPERATING HOURS */}
            <div className="space-y-5 border-b border-slate-100 pb-8">
              <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2.5">
                <MapPin className="w-6 h-6 text-red-500" />
                <span>Location & Hours</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-200">
                <div className="space-y-3">
                  <div className="text-sm font-extrabold text-slate-900">{data.address || data.location}</div>
                  <button
                    type="button"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.name + " " + data.location)}`, "_blank")}
                    className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:underline"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Operating Hours</span>
                  </div>
                  {operatingHours.map((h, i) => (
                    <div key={i} className="flex justify-between text-xs sm:text-sm font-semibold text-slate-700">
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
                <h3 className="text-xl font-black text-slate-900">
                  Customer Reviews & Ratings
                </h3>
                <div className="flex items-center space-x-1 text-amber-500 font-extrabold text-base">
                  <Star className="w-5 h-5 fill-amber-400" />
                  <span>{data.rating || 4.8} / 5.0</span>
                </div>
              </div>

              {/* WRITE A REVIEW FORM */}
              <form onSubmit={handleAddReview} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                <div className="font-black text-sm sm:text-base text-slate-900">
                  Write Your Verified Review for {data.name}
                </div>

                {showReviewSuccess && (
                  <div className="p-4 bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold rounded-2xl flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Thank you! Your review has been posted successfully.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name (e.g. Pasang Sherpa)..."
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  />

                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-slate-200">
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
                  placeholder="Share your experience (food quality, stay comfort, transport timing, staff hospitality)..."
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                />

                {/* PHOTO UPLOAD SECTION */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>Attach Trip Photos (Optional)</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {newReviewImages.length}/6 photos
                    </span>
                  </div>

                  <input
                    ref={reviewFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSelectReviewImages}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    {newReviewImages.length < 6 && (
                      <button
                        type="button"
                        disabled={isCompressingImages}
                        onClick={() => reviewFileInputRef.current?.click()}
                        className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 hover:border-emerald-400 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50 shadow-2xs"
                      >
                        {isCompressingImages ? (
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        ) : (
                          <Plus className="w-4 h-4 text-emerald-600" />
                        )}
                        <span>{isCompressingImages ? "Compressing Photos..." : "Upload Photos"}</span>
                      </button>
                    )}

                    {newReviewImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 group shadow-xs shrink-0"
                      >
                        <img src={img} alt={`Uploaded photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveReviewImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center text-xs transition-colors shadow-sm"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">
                    Verified review will be published instantly
                  </span>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Post Review
                  </button>
                </div>
              </form>

              {/* REVIEWS LIST */}
              <div className="space-y-4">
                {allReviews.map((rev) => (
                  <div key={rev.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">{rev.author}</div>
                          <div className="text-xs text-slate-400">{rev.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{rev.comment}</p>

                    {/* REVIEW PHOTOS */}
                    {rev.images && rev.images.length > 0 && (
                      <div className="pt-1">
                        <div className="flex flex-wrap gap-2">
                          {rev.images.map((imgUrl, imgIdx) => (
                            <button
                              key={imgIdx}
                              type="button"
                              onClick={() => setViewingImage(imgUrl)}
                              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs hover:shadow-md transition-all shrink-0 cursor-zoom-in"
                            >
                              <SafeImage
                                src={imgUrl}
                                fallbackSrc={DEFAULT_FALLBACK}
                                alt={`Review photo ${imgIdx + 1}`}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                                <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY BOOKING SIDEBAR (35% WIDTH) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {data.entityType === "homestay"
                    ? "Homestay Nightly Rate"
                    : data.entityType === "hotel"
                    ? "Nightly Rate"
                    : data.entityType === "restaurant"
                    ? "Average Meal Cost"
                    : "Fare / Seat Rate"}
                </div>
                <div className="text-3xl font-black text-emerald-600 mt-1">
                  {selectedOffering ? selectedOffering.price : (data.priceTag || "NRs 2,500")}
                </div>
                {selectedOffering && (
                  <div className="text-xs font-bold text-slate-800 mt-1 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>Selected: {selectedOffering.title}</span>
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-1 font-semibold">Taxes & service fees included</div>
              </div>

              {/* BOOKING INPUTS */}
              <div className="space-y-4">
                {/* ROOM TYPE SELECTOR IF AVAILABLE */}
                {(data.entityType === "hotel" || data.entityType === "homestay") && data.offerings && data.offerings.length > 0 && (
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1.5">
                      Selected Room Type
                    </label>
                    <div className="relative">
                      <Bed className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={selectedOffering?.title || ""}
                        onChange={(e) => {
                          const found = data.offerings?.find((o) => o.title === e.target.value);
                          if (found) setSelectedOffering(found);
                        }}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        {data.offerings.map((off, idx) => (
                          <option key={idx} value={off.title}>
                            {off.title} — {off.price}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1.5">
                    {data.entityType === "hotel" || data.entityType === "homestay" ? "Check-in Date" : "Reservation Date"}
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={bookDate}
                      onChange={(e) => setBookDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1.5">
                      {data.entityType === "transport" ? "Seats" : "Guests"}
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full pl-10 pr-2 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? "Person" : "People"}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1.5">
                      Time
                    </label>
                    <select
                      value={bookTime}
                      onChange={(e) => setBookTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {["08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "06:00 PM", "08:00 PM"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Stay Timing Info */}
                {(data.checkInTime || data.checkOutTime) && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 font-semibold text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Check-In:</span>
                      <span className="font-bold text-slate-900">{data.checkInTime || "12:00 PM"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Check-Out:</span>
                      <span className="font-bold text-slate-900">{data.checkOutTime || "10:00 AM"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA BOOK BUTTON */}
              <button
                type="button"
                onClick={handleBookClick}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl transition-all text-center active:scale-95 flex items-center justify-center space-x-2"
              >
                <CalendarCheck className="w-5 h-5" />
                <span>
                  {data.entityType === "homestay"
                    ? "Book Homestay Now"
                    : data.entityType === "hotel"
                    ? "Book Room Now"
                    : data.entityType === "restaurant"
                    ? "Reserve Table"
                    : "Book Transport Seat"}
                </span>
              </button>

              {/* GUARANTEE BADGES */}
              <div className="pt-2 space-y-2 border-t border-slate-100 text-xs text-slate-500 font-semibold">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant Confirmation & Guarantee</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>No hidden booking fees</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* AUTH MODAL IF USER IS NOT LOGGED IN */}
      <AuthBookingModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        bookingTitle={`Book ${data.name}`}
        onSuccess={(user) => {
          setShowAuthModal(false);
          proceedToBookingConfirm(user);
        }}
      />

      {/* BOOKING CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CalendarCheck className="w-4 h-4" />
                <span>Confirm Reservation Enquiry</span>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
              {/* Item Summary Card */}
              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <img
                  src={selectedOffering?.image || data.image}
                  alt={data.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {data.entityType}
                    </span>
                    <span className="text-xs text-slate-400 truncate">{data.category}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate mt-0.5">{data.name}</h4>
                  {selectedOffering && (
                    <div className="text-xs font-extrabold text-emerald-400 mt-0.5 truncate flex items-center space-x-1">
                      <span>Room: {selectedOffering.title}</span>
                      <span className="text-slate-400 font-normal">({selectedOffering.price})</span>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 flex items-center mt-0.5 truncate">
                    <MapPin className="w-3 h-3 mr-1 text-slate-500 shrink-0" />
                    {data.location || data.address}
                  </p>
                </div>
              </div>

              {/* Booking Info Grid */}
              <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">Date</span>
                  <span className="text-white font-bold">{bookDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">Time</span>
                  <span className="text-white font-bold">{bookTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">Party</span>
                  <span className="text-white font-bold">{guests} {guests === 1 ? "Guest" : "Guests"}</span>
                </div>
              </div>

              {/* Customer Info Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+977-98..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Special Requests / Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="Any specific requests (e.g. window seat, quiet room, late arrival)..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>

              {/* Price & Guarantee */}
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block">Payment Method</span>
                  <span className="text-xs text-slate-300 font-semibold">Pay on Arrival / Free Cancellation</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">Estimated Total</span>
                  <span className="text-base font-black text-emerald-400">
                    {(data.priceTag?.includes("NRs") || data.priceTag?.includes("Rs") || data.priceLevel?.includes("NPR") || data.priceLevel?.includes("Rs")) ? "NRs" : "USD"}{" "}
                    {(data.entityType === "hotel" || data.entityType === "homestay" ? getActiveNumericRate() : getActiveNumericRate() * guests).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmittingBooking}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-xl shadow-emerald-950 transition-all disabled:opacity-50"
              >
                {isSubmittingBooking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send Booking Enquiry</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-md bg-[#0F172A] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">Booking Enquiry Sent!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Your enquiry for <span className="text-white font-bold">{data.name}</span> has been saved in the system.
              </p>
            </div>

            {confirmedBookingId && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Reference ID:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono font-black text-emerald-400">{confirmedBookingId}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(confirmedBookingId);
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-white"
                    title="Copy ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-left text-xs space-y-1 text-slate-300">
              <div className="flex items-center text-emerald-400 font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                <span>What happens next?</span>
              </div>
              <p className="text-[11px] text-slate-400">
                1. The admin & operator have been notified in the Admin Panel.
              </p>
              <p className="text-[11px] text-slate-400">
                2. You will receive confirmation via WhatsApp / Phone at <span className="text-white font-medium">{customerPhone || "your contact number"}</span>.
              </p>
            </div>

            <button
              onClick={() => {
                setShowSuccessModal(false);
                setConfirmedBookingId(null);
              }}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950"
            >
              Done & Return to Details
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          PHOTO GALLERY MODAL (ALL PHOTOS GRID)
      ===================================================== */}
      {showGalleryModal && (
        <div
          className="fixed inset-0 z-[120] bg-slate-950/95 backdrop-blur-md overflow-y-auto animate-in fade-in"
          onClick={() => setShowGalleryModal(false)}
        >
          <div
            className="min-h-screen p-4 sm:p-8 flex flex-col max-w-7xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gallery Header */}
            <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-md py-4 border-b border-slate-800 flex items-center justify-between mb-6">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Grid className="w-4 h-4" />
                  <span>Full Photo Gallery</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {data.name}
                  <span className="text-sm font-normal text-slate-400 ml-3">
                    ({gallery.length} {gallery.length === 1 ? "Photo" : "Photos"})
                  </span>
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              >
                <X className="w-4 h-4" />
                <span>Close Gallery</span>
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 flex-1">
              {gallery.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setViewingImageIndex(idx);
                    setViewingImage(imgUrl);
                  }}
                  className="group relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer select-none"
                >
                  <SafeImage
                    src={imgUrl}
                    fallbackSrc={DEFAULT_FALLBACK}
                    alt={`${data.name} photo ${idx + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Photo Index Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-slate-950/75 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 shadow-sm">
                    #{idx + 1}
                  </div>

                  {/* Zoom In Action Indicator on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/90 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                      <ZoomIn className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Tip Bar */}
            <div className="py-6 mt-6 border-t border-slate-900 text-center text-xs text-slate-400">
              Tip: Click on any photo to view in high resolution with full slider controls and keyboard arrows.
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          TRUE FULL-SCREEN IMMERSIVE LIGHTBOX VIEWER
      ===================================================== */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-[130] w-screen h-screen bg-slate-950/98 backdrop-blur-2xl flex flex-col justify-between select-none overflow-hidden animate-in fade-in duration-200"
          onClick={() => setViewingImage(null)}
        >
          {/* Top Floating Glass Header */}
          <div
            className="w-full px-4 sm:px-8 py-3.5 bg-slate-950/80 border-b border-white/10 backdrop-blur-md flex items-center justify-between z-30 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3.5 truncate">
              {gallery.includes(viewingImage) ? (
                <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs sm:text-sm border border-emerald-500/30 flex items-center space-x-2 shrink-0">
                  <Camera className="w-4 h-4" />
                  <span>
                    Photo {viewingImageIndex + 1} of {gallery.length}
                  </span>
                </div>
              ) : (
                <div className="px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-400 font-black text-xs sm:text-sm border border-blue-500/30 flex items-center space-x-2 shrink-0">
                  <Camera className="w-4 h-4" />
                  <span>User Review Photo</span>
                </div>
              )}
              <span className="text-sm sm:text-base font-extrabold text-white truncate drop-shadow-md">
                {data.name}
              </span>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setViewingImage(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-600 text-white transition-all flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 cursor-pointer border border-white/15"
                title="Close viewer (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Giant Viewport Display Area with Next/Prev Arrows */}
          <div
            className="relative flex-1 w-full h-full min-h-0 flex items-center justify-center p-2 sm:p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full max-w-7xl flex items-center justify-center">
              <img
                src={viewingImage}
                alt={`${data.name} preview`}
                className="w-full h-full max-h-[82vh] sm:max-h-[85vh] max-w-[95vw] sm:max-w-[90vw] object-contain mx-auto rounded-xl sm:rounded-2xl shadow-2xl transition-all duration-300 select-none"
              />
            </div>

            {/* Prev / Next Arrows */}
            {gallery.includes(viewingImage) && gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevViewingImage}
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white border border-white/25 flex items-center justify-center transition-all shadow-2xl hover:scale-110 active:scale-95 cursor-pointer group backdrop-blur-md"
                  aria-label="Previous photo"
                  title="Previous (Left arrow)"
                >
                  <ChevronLeft className="w-7 h-7 sm:w-9 sm:h-9 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={handleNextViewingImage}
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white border border-white/25 flex items-center justify-center transition-all shadow-2xl hover:scale-110 active:scale-95 cursor-pointer group backdrop-blur-md"
                  aria-label="Next photo"
                  title="Next (Right arrow)"
                >
                  <ChevronRight className="w-7 h-7 sm:w-9 sm:h-9 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnail Strip for Fast Navigation */}
          {gallery.includes(viewingImage) && gallery.length > 1 && (
            <div
              className="w-full px-4 py-3 bg-slate-950/90 border-t border-white/10 backdrop-blur-md overflow-x-auto flex items-center justify-start sm:justify-center space-x-3 shrink-0 z-30 scrollbar-thin scrollbar-thumb-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              {gallery.map((thumbUrl, tIdx) => (
                <button
                  key={tIdx}
                  type="button"
                  onClick={() => {
                    setViewingImageIndex(tIdx);
                    setViewingImage(thumbUrl);
                  }}
                  className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer shadow-md ${
                    tIdx === viewingImageIndex
                      ? "border-emerald-400 ring-2 ring-emerald-400/50 scale-105 opacity-100"
                      : "border-white/15 opacity-50 hover:opacity-100 hover:border-white/40"
                  }`}
                >
                  <SafeImage
                    src={thumbUrl}
                    fallbackSrc={DEFAULT_FALLBACK}
                    alt={`Thumbnail ${tIdx + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white">
                    #{tIdx + 1}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
