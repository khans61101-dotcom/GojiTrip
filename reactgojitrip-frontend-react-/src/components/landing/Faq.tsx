"use client";

import { useState } from "react";

const faqs = [
  { q: "How does AI plan trips?", a: "GojiTrip's AI analyzes your route, budget, and preferences to build a day-by-day itinerary with stops, stays, and activities." },
  { q: "Can I book hotels?", a: "Yes, verified hotels and homestays along your route can be booked directly inside the app." },
  { q: "Can I hire guides?", a: "You can browse certified local, trekking, and language guides and book them with your trip." },
  { q: "Does it support road trips?", a: "Road trips are GojiTrip's specialty — full route analysis, scenic stops, and fuel estimates included." },
  { q: "Can I rent commercial vehicles?", a: "Yes, from jeeps and taxis to tempo travellers and luxury buses, based on your route and group size." },
  { q: "Does it show government transport?", a: "Bus, train, and metro schedules along with fare estimates are shown wherever available." },
  { q: "How are vendors verified?", a: "Vendors complete KYC (ID and business details) and are reviewed by our team before their listing goes live." },
  { q: "Is pricing real-time?", a: "Prices are refreshed continuously so your budget plan reflects current rates." },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-12 md:py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>Questions
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Frequently asked questions</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((f, i) => (
            <div className={`bg-white border border-slate-200 rounded-2xl p-4 md:p-6 transition-all duration-300${open === i ? " shadow-lg" : ""}`} key={f.q}>
              <button
                className="w-full flex items-center justify-between text-left text-base md:text-lg font-semibold text-slate-900"
                onClick={() => setOpen(open === i ? null : i)}
              >
                {f.q}
                <span className={`text-2xl text-blue-600 transition-transform duration-300${open === i ? " rotate-45" : ""}`}>+</span>
              </button>
              <div className={`text-slate-600 text-sm md:text-base mt-4 overflow-hidden transition-all duration-300 ${open === i ? "max-h-40" : "max-h-0"}`}>{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
