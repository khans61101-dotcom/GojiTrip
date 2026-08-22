import React from 'react';
import { SafeImage } from '../common/SafeImage';
import { Star } from 'lucide-react';

const testimonials = [
  { name: "Rahul S.", role: "Solo Traveller", review: "GojiTrip made my Leh trip effortless. The AI route planning was spot on!", rating: 5 },
  { name: "Priya M.", role: "Family Vacationer", review: "The hotel recommendations saved us so much time and money. Loved the experience.", rating: 5 },
  { name: "Vikram K.", role: "Adventure Blogger", review: "Real-time updates helped me avoid a major road closure. A must-have tool.", rating: 4 },
];

export default function Testimonials() {
  return (
    <section className="py-12 md:py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12">What Travellers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">
              <div className="flex gap-1 text-yellow-500 mb-4">
                {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
              </div>
              <p className="text-slate-600 mb-6 italic text-sm md:text-base">"{t.review}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden relative">
                  <SafeImage src={`https://picsum.photos/seed/user${i}/100/100`} alt={t.name} fill className="object-cover" sizes="48px" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{t.name}</h4>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
