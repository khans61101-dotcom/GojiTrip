import React from 'react';
import { SafeImage } from '../common/SafeImage';
import { Star, Clock, Map } from 'lucide-react';

const routes = [
  { 
    title: "Pokhara to Mustang Valley", 
    distance: "210 km", 
    time: "12h 30m", 
    rating: 4.9, 
    badge: "Trending" 
  },
  { 
    title: "Kathmandu to Pokhara", 
    distance: "200 km", 
    time: "6h 30m", 
    rating: 4.8, 
    badge: "Most Travelled" 
  },
  { 
    title: "Pokhara to Annapurna Base Camp", 
    distance: "115 km", 
    time: "8h 00m", 
    rating: 4.9, 
    badge: "Adventure" 
  },
  { 
    title: "Kathmandu to Everest Base Camp", 
    distance: "160 km", 
    time: "12 Days", 
    rating: 5.0, 
    badge: "World Famous" 
  },
  { 
    title: "Kathmandu to Chitwan National Park", 
    distance: "160 km", 
    time: "5h 00m", 
    rating: 4.7, 
    badge: "Wildlife" 
  },
  { 
    title: "Pokhara to Lumbini", 
    distance: "205 km", 
    time: "7h 00m", 
    rating: 4.8, 
    badge: "Cultural" 
  },
  { 
    title: "Kathmandu to Nagarkot", 
    distance: "32 km", 
    time: "1h 30m", 
    rating: 4.6, 
    badge: "Sunrise View" 
  },
  { 
    title: "Kathmandu to Bhaktapur", 
    distance: "15 km", 
    time: "45m", 
    rating: 4.7, 
    badge: "Heritage" 
  },
  { 
    title: "Pokhara to Rara Lake", 
    distance: "600 km", 
    time: "18h 00m", 
    rating: 4.9, 
    badge: "Hidden Gem" 
  },
  { 
    title: "Kathmandu to Janakpur", 
    distance: "225 km", 
    time: "7h 00m", 
    rating: 4.6, 
    badge: "Spiritual" 
  },
];

export default function FamousRoutes() {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Famous Routes</h2>
          <a href="#" className="text-blue-600 font-semibold hover:text-blue-700 transition">View All Routes →</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {routes.map((route, i) => (
            <div key={i} className="group bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="relative w-full h-40 mb-4 rounded-xl overflow-hidden">
                <SafeImage src="/logo/gojitriplogo.jpg" alt={route.title} fill className="object-cover group-hover:scale-105 transition duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw" />
                <span className="absolute top-2 left-2 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-semibold text-blue-600 shadow-sm">{route.badge}</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{route.title}</h3>
              <div className="flex justify-between text-sm text-slate-500 mb-4">
                <div className="flex items-center gap-1"><Map size={14}/> {route.distance}</div>
                <div className="flex items-center gap-1"><Clock size={14}/> {route.time}</div>
              </div>
              <div className="flex items-center gap-1 text-yellow-500 font-bold"><Star size={14} fill="currentColor"/> {route.rating}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
