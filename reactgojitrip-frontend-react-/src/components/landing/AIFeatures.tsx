import React from 'react';
import { Brain, Sparkles, Zap, ShieldCheck, Target, Compass, Clock } from 'lucide-react';

const aiFeatures = [
  { 
    icon: Brain, 
    title: "Intelligent Route Optimization", 
    desc: "Our AI analyzes real-time traffic, terrain, and your preferences to craft the most efficient journey.",
    gradient: "from-blue-500 to-cyan-400",
    delay: 0
  },
  { 
    icon: Sparkles, 
    title: "Personalized Recommendations", 
    desc: "Get curated suggestions for hotels, restaurants, and hidden gems perfectly matched to your travel style.",
    gradient: "from-purple-500 to-pink-400",
    delay: 100
  },
  { 
    icon: Zap, 
    title: "Predictive Condition Alerts", 
    desc: "Stay ahead with proactive notifications about weather changes, road closures, or public transit disruptions.",
    gradient: "from-amber-500 to-orange-400",
    delay: 200
  },
  {
    icon: ShieldCheck,
    title: "Safety-First Navigation",
    desc: "Real-time safety ratings and secure route suggestions ensure peace of mind on every adventure.",
    gradient: "from-emerald-500 to-teal-400",
    delay: 300
  },
  {
    icon: Compass,
    title: "Smart Destination Discovery",
    desc: "Uncover off-the-beaten-path locations and local favorites with AI-powered exploration tools.",
    gradient: "from-rose-500 to-red-400",
    delay: 400
  },
  {
    icon: Clock,
    title: "Time-Saving Automation",
    desc: "Automatic itinerary adjustments and smart scheduling free up your time for what truly matters.",
    gradient: "from-indigo-500 to-violet-400",
    delay: 500
  },
];

export default function AIFeatures() {
  return (
    <section className="relative py-16 md:py-28 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container relative mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 rounded-full mb-4 border border-blue-600/20">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
            <span className="text-sm font-semibold text-blue-700 tracking-wider uppercase">AI-Powered</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent mb-4 leading-tight">
            Premium AI Capabilities
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Experience the future of travel planning with our sophisticated, 
            engine-driven intelligence designed to elevate every journey.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {aiFeatures.map((feature, i) => (
            <div
              key={i}
              className="group relative p-8 bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl shadow-slate-200/40 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-200/50 hover:-translate-y-3 hover:bg-white/90"
              style={{ animationDelay: `${feature.delay}ms` }}
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              {/* Icon Container */}
              <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-2xl`}>
                <feature.icon size={28} strokeWidth={1.5} />
                {/* Glow Ring */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10`}></div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                {feature.desc}
              </p>

              {/* Decorative Line */}
              <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-blue-600/20 to-transparent rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        {/* <div className="text-center mt-16">
          <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 hover:scale-105">
            <span>Explore All Features</span>
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10"></div>
          </button>
        </div> */}
      </div>
    </section>
  );
} 