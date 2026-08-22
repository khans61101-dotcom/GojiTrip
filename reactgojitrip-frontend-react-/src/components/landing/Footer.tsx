"use client";

import React from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  MapPin,
  Hotel,
  UtensilsCrossed,
  Bus,
  Fuel,
  Mountain,
  Sparkles,
  ShieldCheck,
  Mail,
  Phone,
  ArrowRight,
  Globe,
  Lock,
  Heart,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#0B1120] text-slate-300 border-t border-slate-800/80 relative overflow-hidden font-sans">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Info & Newsletter (Col 1-5) */}
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/90 border border-slate-700/80 p-1 flex items-center justify-center shadow-lg group-hover:border-emerald-500/50 transition-colors">
                <img
                  src="/logo/gojitriplogo.jpg"
                  alt="GojiTrip Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  GojiTrip
                </span>
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Verified Travel Portal
                </div>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              GojiTrip is your AI-powered pocket travel companion for Nepal & beyond. Connecting travelers with verified routes, authentic partner homestays, bus fares, certified mountain guides, and real-time highway insights.
            </p>

            {/* Verification Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>100% Ground-Verified Data Strategy</span>
            </div>

            {/* Newsletter Box */}
            <div className="pt-2 max-w-md space-y-2">
              <label className="block text-xs font-bold text-slate-200">
                Get Nepal Travel & Highway Updates
              </label>
              {subscribed ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Thank you for subscribing to GojiTrip Updates!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="flex-1 bg-[#182238] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Links Columns (Col 6-12) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 pt-2">
            
            {/* Col 1: Explore Services */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                Travel Services
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link
                    to="/pages/hotels"
                    className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                  >
                    <Hotel className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Hotels & Homestays</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pages/routes"
                    className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Routes & Highway Maps</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pages/transport"
                    className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                  >
                    <Bus className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Buses & Vehicles</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pages/restaurants"
                    className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Restaurants & Dining</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pages/guides"
                    className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Tour Guides & Treks</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 2: Destinations & Highlights */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                Highlights
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link
                    to="/pages/famous-places"
                    className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                  >
                    <Mountain className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Famous Attractions</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pages/fuel-stations"
                    className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                  >
                    <Fuel className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Fuel & EV Stations</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pages/about"
                    className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>About GojiTrip</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="#howitworks"
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Portal & Support */}
            <div className="space-y-4 col-span-2 sm:col-span-1">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                CMS & Support
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link
                    to="/auth/login"
                    className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center space-x-2 font-semibold"
                  >
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Portal Login</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center space-x-2 font-semibold"
                  >
                    <Globe className="w-3.5 h-3.5 text-teal-400" />
                    <span>Admin Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/auth/register"
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    Register Partner Account
                  </Link>
                </li>
              </ul>

              {/* Direct Contact Info */}
              <div className="pt-2 text-[11px] text-slate-400 space-y-1.5 border-t border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>support@gojitrip.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+977-9800000000</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar (Copyright & Social Links) */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span>© {new Date().getFullYear()} GojiTrip. All rights reserved. Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>for Travelers.</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <a
              href="https://facebook.com/gojitrip"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-[#182238] border border-slate-700/80 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all"
              title="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com/gojitrip"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-[#182238] border border-slate-700/80 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all"
              title="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com/gojitrip"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-[#182238] border border-slate-700/80 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all"
              title="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com/company/gojitrip"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-[#182238] border border-slate-700/80 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
