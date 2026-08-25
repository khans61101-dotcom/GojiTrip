"use client";

import {
  CircleUserRound,
  LogIn,
  UserPlus,
  Menu,
  X,
  Compass,
  MapPin,
  Hotel,
  UtensilsCrossed,
  Bus,
  Fuel,
  Mountain,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const servicesRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleAccount = () => {
    setIsAccountOpen((prev) => !prev);
    setIsServicesOpen(false);
  };
  const toggleServices = () => {
    setIsServicesOpen((prev) => !prev);
    setIsAccountOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(event.target as Node)
      ) {
        setIsServicesOpen(false);
      }
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const primaryLinks = [
    { name: "About Us", href: "/pages/about", icon: Sparkles },
    { name: "Routes & Maps", href: "/pages/routes", icon: MapPin },
    { name: "Hotels & Stay", href: "/pages/hotels", icon: Hotel },
  ];

  const dropdownServices = [
    { name: "Buses & Transport", href: "/pages/transport", icon: Bus, desc: "Schedules, routes & vehicle fares" },
    { name: "Restaurants & Dining", href: "/pages/restaurants", icon: UtensilsCrossed, desc: "Local food & recommended dining" },
    { name: "Certified Guides & Treks", href: "/pages/guides", icon: Compass, desc: "Mountain guides & adventure pilots" },
    { name: "Famous Attractions", href: "/pages/famous-places", icon: Mountain, desc: "Top Nepal destinations & landmarks" },
    { name: "Fuel & EV Stations", href: "/pages/fuel-stations", icon: Fuel, desc: "Highway fuel & charging stops" },
  ];

  return (
    <header
      id="top"
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand Logo */}
          <Link
            className="flex items-center flex-shrink-0"
            to="/"
            aria-label="GojiTrip home"
          >
            <img
              src="/logo/gojitriplogo.jpg"
              alt="GojiTrip"
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl object-contain shadow-sm"
            />
            <span className="ml-2.5 text-xl font-extrabold text-slate-800 tracking-tight">
              GojiTrip
            </span>
          </Link>

          {/* Clean Primary Navbar Links (Compact & Spaced) */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-4">
            {primaryLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-xs font-semibold text-slate-700 hover:text-emerald-600 transition-colors flex items-center space-x-1.5 px-3 py-2 rounded-xl hover:bg-slate-50"
                >
                  <Icon className="w-4 h-4 text-emerald-500" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* "More Travel Services ▾" Dropdown (Click Only) */}
            <div className="relative" ref={servicesRef}>
              <button
                type="button"
                onClick={toggleServices}
                className="text-xs font-semibold text-slate-700 hover:text-emerald-600 transition-colors flex items-center space-x-1.5 px-3 py-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200"
              >
                <Compass className="w-4 h-4 text-emerald-500" />
                <span>More Services</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isServicesOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu Box */}
              {isServicesOpen && (
                <div className="absolute left-0 mt-1 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                    Explore All Services
                  </div>
                  {dropdownServices.map((svc) => {
                    const Icon = svc.icon;
                    return (
                      <Link
                        key={svc.name}
                        to={svc.href}
                        onClick={() => setIsServicesOpen(false)}
                        className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-emerald-50/70 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors flex-shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                            {svc.name}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {svc.desc}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-xs font-bold text-slate-700 hover:text-emerald-600 transition-colors px-3 py-2 rounded-xl hover:bg-slate-100 border border-slate-200/80"
            >
              CMS Portal
            </Link>
            <Link
              to="/pages/routes"
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all"
            >
              Start Planning
            </Link>

            {/* Profile Menu Dropdown */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={toggleAccount}
                className="flex items-center gap-2 p-2.5 text-slate-600 hover:text-emerald-600 rounded-full border border-slate-200 hover:border-emerald-200 transition-all"
                aria-expanded={isAccountOpen}
              >
                <CircleUserRound size={18} />
              </button>

              {isAccountOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-50">
                  <Link
                    to="/auth/login"
                    onClick={() => setIsAccountOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                  >
                    <LogIn size={15} className="text-emerald-500" /> Login to Portal
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={() => setIsAccountOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                  >
                    <UserPlus size={15} className="text-emerald-500" /> Register Account
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsAccountOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 border-t border-slate-100 mt-1 pt-2 rounded-xl"
                  >
                    <CircleUserRound size={15} /> Admin Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Toggle Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Slide-down Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 space-y-3">
            <div className="flex flex-col gap-1">
              <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Main Pages
              </div>
              {primaryLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl flex items-center space-x-2.5"
                    onClick={toggleMenu}
                  >
                    <Icon className="w-4 h-4 text-emerald-500" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <div className="px-4 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2 border-t border-slate-100">
                Services
              </div>
              {dropdownServices.map((svc) => {
                const Icon = svc.icon;
                return (
                  <Link
                    key={svc.name}
                    to={svc.href}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl flex items-center space-x-2.5"
                    onClick={toggleMenu}
                  >
                    <Icon className="w-4 h-4 text-emerald-500" />
                    <span>{svc.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="px-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/auth/login"
                className="w-full px-4 py-2 text-center text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50"
                onClick={toggleMenu}
              >
                Login to Portal
              </Link>
              <Link
                to="/dashboard"
                className="w-full px-4 py-2 text-center text-white bg-emerald-500 rounded-xl text-xs font-bold shadow-md hover:bg-emerald-600"
                onClick={toggleMenu}
              >
                Admin Dashboard
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
