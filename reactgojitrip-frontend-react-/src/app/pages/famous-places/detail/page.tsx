"use client";

import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Ticket,
  Calendar,
  Share2,
  Heart,
  Navigation,
  CheckCircle2,
  Info,
  ShieldCheck,
  Compass,
  ExternalLink,
  Camera,
  Building,
  Utensils,
  Bus,
  Sparkles,
  Award,
  ChevronRight
} from "lucide-react";

import { SafeImage } from "@/components/common/SafeImage";
import { InteractiveMap } from "@/components/common/InteractiveMap";
import { cmsStore } from "@/lib/cms-store";
import { INITIAL_PLACES } from "@/lib/initial-data";

export default function FamousPlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const placeNameParam = searchParams.get("name") || "";
  const sourceParam = searchParams.get("source") || "";
  const destParam = searchParams.get("destination") || "";

  const [place, setPlace] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [activePhoto, setActivePhoto] = React.useState<string>("");
  const [isSaved, setIsSaved] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);

    // 1. Check cmsStore for place
    const allStorePlaces = cmsStore.getPlaces();
    let found: any = allStorePlaces.find((p) => String(p.id) === String(id) || p.name.toLowerCase() === placeNameParam.toLowerCase());

    // 2. Check INITIAL_PLACES fallback
    if (!found) {
      found = INITIAL_PLACES.find((p) => String(p.id) === String(id) || p.name.toLowerCase() === placeNameParam.toLowerCase());
    }

    // 3. Construct default fallback if ID or Name provided
    if (!found) {
      found = {
        id: id || "place-detail",
        name: placeNameParam || "Famous Tourist Destination",
        category: "Historical & Cultural Heritage",
        location: "Nepal",
        description: "A world-renowned landmark and essential sightseeing stop along popular travel corridors. Known for stunning architecture, rich spiritual heritage, and panoramic natural views.",
        bestTimeToVisit: "October - March (Clear Skies & Pleasant Weather)",
        entryFee: 0,
        currency: "NPR",
        rating: 4.9,
        reviews: 850,
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
        photos: [
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
        ],
        approvalStatus: "Published",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    setPlace(found);
    const mainImg = (found as any).imageUrl || ((found as any).photos && (found as any).photos[0]) || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80";
    setActivePhoto(mainImg);
    setLoading(false);
  }, [id, placeNameParam]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading || !place) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Loading Landmark Details...</span>
        </div>
      </div>
    );
  }

  const galleryPhotos = place.photos && place.photos.length > 0
    ? place.photos
    : [place.imageUrl || activePhoto];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      
      {/* ==========================================
          TOP NAVIGATION BAR
      ========================================== */}
      <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700/60 text-xs font-semibold transition-all"
          >
            <ArrowLeft size={16} />
            <span>Back to Famous Places</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isSaved
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                  : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
              }`}
            >
              <Heart size={15} className={isSaved ? "fill-rose-400 text-rose-400" : ""} />
              <span>{isSaved ? "Saved to Bucketlist" : "Save Landmark"}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            >
              <Share2 size={15} />
              <span>{copied ? "Link Copied!" : "Share Place"}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ==========================================
          BREADCRUMB & HERO HEADER
      ========================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <span className="cursor-pointer hover:text-emerald-400" onClick={() => navigate("/")}>Home</span>
          <ChevronRight size={12} />
          <span className="cursor-pointer hover:text-emerald-400" onClick={() => navigate("/pages/famous-places")}>Famous Places</span>
          <ChevronRight size={12} />
          <span className="text-emerald-400 font-semibold">{place.name}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">
                ✨ {Array.isArray(place.category) ? place.category[0] : (place.category || "Must-Visit Attraction")}
              </span>
              <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-full flex items-center gap-1">
                <ShieldCheck size={13} /> Verified Landmark
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {place.name}
            </h1>

            <p className="flex items-center gap-1.5 text-slate-300 text-sm mt-2">
              <MapPin size={16} className="text-emerald-400 shrink-0" />
              <span>{place.location || "Nepal Region"}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shrink-0">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Star size={20} className="fill-amber-400" />
              <span className="text-xl font-black">{place.rating || 4.9}</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-xs text-slate-400">Visitor Rating</div>
              <div className="text-xs font-bold text-slate-200">{place.reviews || 950}+ Verified Reviews</div>
            </div>
          </div>
        </div>

        {/* ==========================================
            PHOTO GALLERY GRID & LIGHTBOX
        ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2 relative h-[360px] sm:h-[450px] rounded-3xl overflow-hidden border border-slate-800 group shadow-2xl">
            <SafeImage
              src={activePhoto}
              alt={place.name}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs font-semibold text-white flex items-center gap-2">
              <Camera size={14} className="text-emerald-400" />
              <span>Main Gallery Image</span>
            </div>
          </div>

          <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible">
            {galleryPhotos.slice(0, 3).map((photo: string, idx: number) => (
              <div
                key={idx}
                onClick={() => setActivePhoto(photo)}
                className={`relative h-28 sm:h-36 lg:h-[138px] min-w-[120px] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all shadow-md shrink-0 lg:shrink ${
                  activePhoto === photo ? "border-emerald-500 scale-[1.02]" : "border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100"
                }`}
              >
                <SafeImage src={photo} alt={`${place.name} photo ${idx + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* ==========================================
            QUICK STATS HIGHLIGHT BAR
        ========================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <Calendar size={20} />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400">Best Season</div>
              <div className="text-xs font-bold text-slate-200 mt-0.5">{place.bestTimeToVisit || "All Year Round"}</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <Ticket size={20} />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400">Entry Ticket Fee</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">
                {place.entryFee && place.entryFee > 0 ? `${place.currency || "NPR"} ${place.entryFee}` : "Free Entry"}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400">Suggested Duration</div>
              <div className="text-xs font-bold text-slate-200 mt-0.5">2 - 3 Hours</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
              <Compass size={20} />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400">Accessibility</div>
              <div className="text-xs font-bold text-slate-200 mt-0.5">Highway / Road Linked</div>
            </div>
          </div>
        </div>

        {/* ==========================================
            MAIN CONTENT & SIDEBAR DETAILS
        ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Overview, Highlights & Map */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* OVERVIEW & HISTORY */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Sparkles size={18} />
                <h3 className="text-white text-lg">About & Heritage Overview</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {place.description}
              </p>
            </div>

            {/* KEY ATTRACTIONS HIGHLIGHTS */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-white text-lg font-bold flex items-center gap-2">
                <Award size={18} className="text-emerald-400" />
                <span>Key Highlights & What To Experience</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Sacred Architecture & Heritage Structures",
                  "Panoramic Mountain & Landscape Views",
                  "Guided Sightseeing & Cultural Photography",
                  "Local Artisan Handicrafts & Souvenir Markets",
                  "Traditional Food & Tea Stalls Nearby",
                  "Safe Passenger Parking & Rest Facilities"
                ].map((highlight, index) => (
                  <div key={index} className="flex items-start gap-2.5 bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                    <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-xs text-slate-200 font-medium">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* INTERACTIVE LEAFLET LOCATION MAP */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-lg">
                  <MapPin size={20} className="text-emerald-400" />
                  <span>Exact Interactive Map Location</span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + (place.location || ""))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <div className="h-[320px] rounded-2xl overflow-hidden border border-slate-800">
                <InteractiveMap
                  items={[
                    {
                      id: place.id,
                      name: place.name,
                      location: place.location,
                      lat: place.latitude,
                      lng: place.longitude,
                      priceTag: place.entryFee ? `NPR ${place.entryFee}` : "Landmark",
                      rating: place.rating || 4.9,
                      image: activePhoto,
                    }
                  ]}
                  selectedId={place.id}
                  onMarkerClick={() => {}}
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: VISITOR INFO & TRIP ACTIONS */}
          <div className="space-y-6">
            
            {/* VISITOR PRACTICAL GUIDELINES */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <h3 className="text-white text-base font-bold flex items-center gap-2 border-b border-slate-800 pb-3">
                <Info size={18} className="text-blue-400" />
                <span>Visitor Information & Guidelines</span>
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="text-slate-400 font-medium mb-1">⏰ Visiting Hours</div>
                  <div className="text-slate-200 font-bold bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    05:00 AM - 07:00 PM (Daily)
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-medium mb-1">👗 Recommended Attire</div>
                  <div className="text-slate-200 font-semibold">
                    Modest clothing required for temple grounds. Comfortable walking shoes recommended.
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-medium mb-1">📷 Photography & Camera</div>
                  <div className="text-slate-200 font-semibold">
                    Allowed in outer courtyards. Drone photography requires prior local permit.
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={() => navigate(`/pages/routes${sourceParam && destParam ? `?source=${sourceParam}&destination=${destParam}` : ''}`)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Navigation size={16} />
                  <span>Plan Route via {place.name}</span>
                </button>
              </div>
            </div>

            {/* NEARBY SERVICES LINKS */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-white text-base font-bold">Explore Services Near {place.name}</h3>
              <div className="space-y-2.5">
                <button
                  onClick={() => navigate("/pages/hotels")}
                  className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-800/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-semibold transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Building size={16} className="text-emerald-400" />
                    <span>Hotels & Homestays Nearby</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-500 group-hover:text-white" />
                </button>

                <button
                  onClick={() => navigate("/pages/restaurants")}
                  className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-800/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-semibold transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Utensils size={16} className="text-amber-400" />
                    <span>Restaurants & Local Food</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-500 group-hover:text-white" />
                </button>

                <button
                  onClick={() => navigate("/pages/transport")}
                  className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-800/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-semibold transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Bus size={16} className="text-blue-400" />
                    <span>Buses & Private Transport</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-500 group-hover:text-white" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
