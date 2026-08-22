import React from 'react';
import { Brain, Sparkles, Zap, ShieldCheck, Target } from 'lucide-react';

const aiFeatures = [
  { icon: Brain, title: "Intelligent Route Optimization", desc: "Our AI analyzes real-time traffic, terrain, and your preferences to craft the most efficient journey." },
  { icon: Sparkles, title: "Personalized Recommendations", desc: "Get curated suggestions for hotels, restaurants, and hidden gems perfectly matched to your travel style." },
  { icon: Zap, title: "Predictive Condition Alerts", desc: "Stay ahead with proactive notifications about weather changes, road closures, or public transit disruptions." },
];

export default function AIFeatures() {
  return (
    <section className="py-12 md:py-20 bg-slate-50/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Premium AI-Powered Capabilities</h2>
          <p className="text-slate-600">Experience effortless travel planning with our sophisticated, engine-driven intelligence.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aiFeatures.map((feature, i) => (
            <div key={i} className="group relative p-8 bg-white/60 backdrop-blur-md border border-white/50 rounded-3xl shadow-xl shadow-slate-200/50 transition-all duration-300 hover:shadow-2xl hover:bg-white/80 hover:-translate-y-2">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-600/30">
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
