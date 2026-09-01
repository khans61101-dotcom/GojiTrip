import React, { useEffect, useState, useRef } from "react";
import { SafeImage } from "../common/SafeImage";
import { Star, Clock, Map, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { listRoutes } from "@/lib/api";
import { cmsStore } from "@/lib/cms-store";

interface DisplayRoute {
  id?: string | number;
  title: string;
  distance: string;
  time: string;
  rating: number;
  badge: string;
  image: string;
}

const DEFAULT_ROUTES: DisplayRoute[] = [
  {
    title: "Pokhara to Mustang Valley",
    distance: "210 km",
    time: "12h 30m",
    rating: 4.9,
    badge: "Trending",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Kathmandu to Pokhara",
    distance: "200 km",
    time: "6h 30m",
    rating: 4.8,
    badge: "Most Travelled",
    image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Pokhara to Annapurna Base Camp",
    distance: "115 km",
    time: "8h 00m",
    rating: 4.9,
    badge: "Adventure",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Kathmandu to Everest Base Camp",
    distance: "160 km",
    time: "12 Days",
    rating: 5.0,
    badge: "World Famous",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Kathmandu to Chitwan National Park",
    distance: "160 km",
    time: "5h 00m",
    rating: 4.7,
    badge: "Wildlife",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80",
  },
];

export default function FamousRoutes() {
  const [displayRoutes, setDisplayRoutes] = useState<DisplayRoute[]>(DEFAULT_ROUTES);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function loadRoutes() {
      try {
        setLoading(true);
        const apiData = await listRoutes().catch(() => []);
        const cmsItems = cmsStore.getRoutes();

        const combinedRaw = [...cmsItems, ...(Array.isArray(apiData) ? apiData : [])];

        const seenKeys = new Set<string>();
        const uniqueRoutes: any[] = [];

        for (const item of combinedRaw) {
          const titleKey = (item.routeName || (item.origin && item.destination ? `${item.origin} to ${item.destination}` : "")).toLowerCase().trim();
          const idKey = String(item.id || "").toLowerCase().trim();
          const key = idKey || titleKey;

          if (key && !seenKeys.has(key) && (!titleKey || !seenKeys.has(titleKey))) {
            if (idKey) seenKeys.add(idKey);
            if (titleKey) seenKeys.add(titleKey);
            uniqueRoutes.push(item);
          }
        }

        if (uniqueRoutes.length > 0) {
          const mapped: DisplayRoute[] = uniqueRoutes.map((item: any, idx: number) => {
            const title = item.routeName || (item.origin && item.destination ? `${item.origin} to ${item.destination}` : `Route #${idx + 1}`);
            const dist = item.totalDistanceKm || item.distance ? `${item.totalDistanceKm || item.distance} km` : "150 km";
            const duration = item.estimatedTravelTime || item.duration || "5h 30m";
            const img = item.imageUrl || (item.photos && item.photos[0]) || DEFAULT_ROUTES[idx % DEFAULT_ROUTES.length].image;
            const badge = item.roadCondition || "Verified Corridor";

            return {
              id: item.id || idx,
              title,
              distance: dist,
              time: duration,
              rating: 4.8,
              badge,
              image: img,
            };
          });

          setDisplayRoutes(mapped);
        }
      } catch (err) {
        console.error("Failed to load DB routes for home page:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRoutes();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/30 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>Verified Nepal Corridors</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Travel Routes & Highways 
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore ground-verified highway distances, travel times, and scenic stopovers.
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            {/* Scroll Navigation Buttons */}
            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => scroll("left")}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              to="/pages/routes"
              className="text-xs font-bold text-blue-700 hover:text-blue-800 transition flex items-center space-x-1 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-200 hover:bg-blue-100"
            >
              <span>Explore All ({displayRoutes.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Single Row Horizontal Scroller Container */}
        <div
          ref={scrollContainerRef}
          className="flex flex-nowrap overflow-x-auto gap-5 pb-4 pt-1 snap-x scroll-smooth scrollbar-thin scrollbar-thumb-blue-500/20 hover:scrollbar-thumb-blue-500/40"
        >
          {displayRoutes.map((route, i) => (
            <Link
              key={route.id || i}
              to={`/pages/routes?id=${encodeURIComponent(String(route.id))}&name=${encodeURIComponent(route.title)}`}
              className="group flex-none w-72 sm:w-80 snap-start bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:border-blue-400"
            >
              <div>
                <div className="relative w-full h-40 mb-3 rounded-xl overflow-hidden bg-slate-100">
                  <SafeImage
                    src={route.image}
                    fallbackSrc={DEFAULT_ROUTES[0].image}
                    alt={route.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-blue-300 border border-white/10 shadow-sm truncate max-w-[140px]">
                    {route.badge}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {route.title}
                </h3>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Map size={13} className="text-blue-600" />
                    <span>{route.distance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={13} className="text-slate-400" />
                    <span>{route.time}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <Star size={13} fill="currentColor" />
                    <span>{route.rating}</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 group-hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
