"use client";

import React from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  MapPin,
  Hotel,
  Home,
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
  Linkedin,
  Crown,
} from "lucide-react";
import { cmsStore } from "@/lib/cms-store";

function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12 font-sans relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* TOP SECTION: BRAND + NEWSLETTER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-900">
          {/* Brand Info (Col 1-5) */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="/logo/gojitriplogo.png"
                alt="GojiTrip"
                className="h-10 w-auto object-contain brightness-125"
              />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Nepal’s leading highway corridor & route guide platform. Discover verified mountain hotels, local highway eateries, jeep transport, and real-time corridor stops.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-xs text-slate-300">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Partners</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Nepal Highways</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Links Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-2">
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
                  <span>Hotels</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/homestays"
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                >
                  <Home className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Homestays</span>
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
                <li>
                  <Link
                    to="/pages/membership"
                    className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                  >
                    <Crown className="w-3.5 h-3.5 text-emerald-500" />
                    <span>VIP Member Passes</span>
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

        {/* Bottom Bar (Copyright & Social Links) */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span>© {new Date().getFullYear()} GojiTrip. All rights reserved. Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>for Travelers.</span>
          </div>

          <div><p>Developed By Namami Software.</p></div> 

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
              href="https://x.com/gojitrip"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-[#182238] border border-slate-700/80 text-slate-400 hover:text-white hover:border-slate-500 transition-all flex items-center justify-center"
              title="X (formerly Twitter)"
              aria-label="X (formerly Twitter)"
            >
              <XIcon className="w-4 h-4" />
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
