import React from 'react';
import { BrainCircuit, Zap, Info, Map, Clock3 } from 'lucide-react';

export default function WhyChooseGojiTrip() {
  const features = [
    { icon: BrainCircuit, title: "AI-Powered Planning", desc: "Intelligent routes tailored to your preferences." },
    { icon: Zap, title: "Real-time Updates", desc: "Live traffic and road condition alerts." },
    { icon: Info, title: "Complete Information", desc: "Detailed guides for every destination." },
    { icon: Map, title: "Google Maps Integration", desc: "Seamless navigation with familiar tools." },
    { icon: Clock3, title: "Save Time & Money", desc: "Optimize your budget and travel schedule." },
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12">Why Choose GojiTrip?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-center hover:bg-blue-50 hover:border-blue-100 transition-all duration-300">
              <feature.icon size={32} className="text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 mb-1 text-sm">{feature.title}</h3>
              <p className="text-xs text-slate-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
