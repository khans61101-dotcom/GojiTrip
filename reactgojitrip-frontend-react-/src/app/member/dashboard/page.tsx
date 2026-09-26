import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMemberAuth } from '@/lib/member-auth';
import { cmsStore } from '@/lib/cms-store';
import { HotelEntry, TransportEntry, RestaurantEntry } from '@/types/cms';
import {
  Home,
  Truck,
  UtensilsCrossed,
  Plus,
  ArrowRight,
  Sparkles,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  TrendingUp,
} from 'lucide-react';

export default function MemberDashboardPage() {
  const { member } = useMemberAuth();

  const [myHotels, setMyHotels] = useState<HotelEntry[]>([]);
  const [myTransports, setMyTransports] = useState<TransportEntry[]>([]);
  const [myRestaurants, setMyRestaurants] = useState<RestaurantEntry[]>([]);

  const loadData = () => {
    if (!member) return;
    setMyHotels(cmsStore.getHotelsByOwner(member.id));
    setMyTransports(cmsStore.getTransportsByOwner(member.id));
    setMyRestaurants(cmsStore.getRestaurantsByOwner(member.id));
  };

  useEffect(() => {
    loadData();
    const unsub = cmsStore.subscribe(loadData);
    return unsub;
  }, [member]);

  if (!member) return null;

  const category = member.category;
  const canHomestays = category === 'Home & Homestays' || category === 'Combo';
  const canTraveling = category === 'Traveling' || category === 'Combo';
  const canRestaurants = category === 'Restaurant' || category === 'Combo';

  return (
    <div className="space-y-8">
      {/* ========================================================
          WELCOME HERO CARD
      ======================================================== */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#111A2E] via-[#0F172A] to-[#131F38] border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
                Member Portal
              </span>
              <span className="text-xs text-slate-400 font-semibold">•</span>
              <span className="text-xs text-slate-400 font-bold">{member.businessName}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {member.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Your member account is authorized for <strong className="text-emerald-400">{member.category}</strong>.
              All your properties, transport routes, and dining entries are isolated and managed exclusively by your team.
            </p>
          </div>

          {/* Quick Subscription Chip */}
          <div className="p-4 rounded-2xl bg-[#182238]/90 border border-slate-700/80 shrink-0 space-y-2 sm:w-64">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Active Plan</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-extrabold text-[10px] border border-emerald-500/20">
                {member.subscriptionStatus || 'Active'}
              </span>
            </div>
            <p className="text-sm font-extrabold text-white truncate">
              {member.subscribedPlanName || `${member.category} Pro Pass`}
            </p>
            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-700/60">
              <span>Valid Until:</span>
              <span className="font-semibold text-slate-300">
                {member.subscriptionExpiry || '2027-09-30'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          QUICK STATS SUMMARY
      ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {canHomestays && (
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                My Homestays & Stays
              </p>
              <h3 className="text-2xl font-black text-white mt-1">{myHotels.length}</h3>
              <p className="text-[11px] text-amber-400 font-medium mt-0.5">Active Properties</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Home className="w-5 h-5" />
            </div>
          </div>
        )}

        {canTraveling && (
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                My Vehicles & Routes
              </p>
              <h3 className="text-2xl font-black text-white mt-1">{myTransports.length}</h3>
              <p className="text-[11px] text-cyan-400 font-medium mt-0.5">Fleet Units</p>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Truck className="w-5 h-5" />
            </div>
          </div>
        )}

        {canRestaurants && (
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                My Restaurants & Cafes
              </p>
              <h3 className="text-2xl font-black text-white mt-1">{myRestaurants.length}</h3>
              <p className="text-[11px] text-rose-400 font-medium mt-0.5">Dining Outlets</p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          </div>
        )}

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Platform Status
            </p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">100%</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Verified Member</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================
          CATEGORY-SPECIFIC QUICK ACTIONS & OVERVIEW
      ======================================================== */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span>Your Managed Listings</span>
          </h2>
        </div>

        {/* Home & Homestays Section */}
        {canHomestays && (
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Home & Homestays</h3>
                  <p className="text-xs text-slate-400">
                    Manage your rooms, nightly rates, facilities and direct inquiry phone numbers.
                  </p>
                </div>
              </div>

              <Link
                to="/member/homestays"
                className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage Stays ({myHotels.length})</span>
              </Link>
            </div>

            {myHotels.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-[#0B0F17]">
                <p className="text-xs text-slate-400 font-medium">No homestays or hotels added yet.</p>
                <Link
                  to="/member/homestays"
                  className="mt-3 inline-flex items-center space-x-1.5 text-xs font-bold text-amber-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Your First Homestay Now</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myHotels.slice(0, 3).map((hotel) => (
                  <div
                    key={hotel.id}
                    className="p-4 rounded-2xl bg-[#141E33] border border-slate-800 flex items-start space-x-3"
                  >
                    <img
                      src={
                        hotel.imageUrl ||
                        hotel.photos?.[0] ||
                        'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={hotel.hotelName}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {hotel.propertyType}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate mt-1">{hotel.hotelName}</h4>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{hotel.location}</span>
                      </p>
                      <p className="text-xs font-extrabold text-amber-300 mt-1">
                        NRs {hotel.pricePerNight?.toLocaleString() || '2,500'}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">/ night</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Traveling & Fleet Section */}
        {canTraveling && (
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Traveling & Fleet</h3>
                  <p className="text-xs text-slate-400">
                    Manage your 4x4 Jeeps, EV Shuttles, routes, fares, and seat departure timetables.
                  </p>
                </div>
              </div>

              <Link
                to="/member/traveling"
                className="px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage Fleet ({myTransports.length})</span>
              </Link>
            </div>

            {myTransports.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-[#0B0F17]">
                <p className="text-xs text-slate-400 font-medium">No transport or vehicles listed yet.</p>
                <Link
                  to="/member/traveling"
                  className="mt-3 inline-flex items-center space-x-1.5 text-xs font-bold text-cyan-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>List Your First Vehicle / Route</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myTransports.slice(0, 3).map((tr) => (
                  <div
                    key={tr.id}
                    className="p-4 rounded-2xl bg-[#141E33] border border-slate-800 flex items-start space-x-3"
                  >
                    <img
                      src={
                        tr.driverPhotoUrl ||
                        tr.vehiclePhotos?.[0] ||
                        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={tr.operatorName}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {tr.vehicleType} • {tr.seatCapacity} Seats
                      </span>
                      <h4 className="text-xs font-bold text-white truncate mt-1">{tr.operatorName}</h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{tr.route}</p>
                      <p className="text-xs font-extrabold text-cyan-300 mt-1">
                        NRs {tr.fare.toLocaleString()}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">/ seat</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Restaurant & Dining Section */}
        {canRestaurants && (
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Restaurants & Dining</h3>
                  <p className="text-xs text-slate-400">
                    Manage your food menu, recommended local specialties, opening hours, and phone orders.
                  </p>
                </div>
              </div>

              <Link
                to="/member/restaurants"
                className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs transition flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage Restaurants ({myRestaurants.length})</span>
              </Link>
            </div>

            {myRestaurants.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-[#0B0F17]">
                <p className="text-xs text-slate-400 font-medium">No restaurants or cafes listed yet.</p>
                <Link
                  to="/member/restaurants"
                  className="mt-3 inline-flex items-center space-x-1.5 text-xs font-bold text-rose-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>List Your First Restaurant / Menu</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myRestaurants.slice(0, 3).map((res) => (
                  <div
                    key={res.id}
                    className="p-4 rounded-2xl bg-[#141E33] border border-slate-800 flex items-start space-x-3"
                  >
                    <img
                      src={
                        res.imageUrl ||
                        res.photos?.[0] ||
                        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={res.restaurantName}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {res.cuisineTypes?.[0] || 'Local Cuisine'}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate mt-1">
                        {res.restaurantName}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{res.location}</span>
                      </p>
                      <p className="text-xs font-extrabold text-rose-300 mt-1">
                        NRs {res.averageMealPrice || 650}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">avg meal</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
