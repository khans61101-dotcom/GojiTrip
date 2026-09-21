"use client";

import React, { useState, useEffect } from "react";
import { cmsStore } from "@/lib/cms-store";
import type { BookingRecord, BookingStatus, BookingItemType } from "@/types/cms";
import {
  CalendarCheck,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  Mail,
  MessageCircle,
  Eye,
  Plus,
  Hotel,
  Home,
  Bus,
  UtensilsCrossed,
  Compass,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  ChevronDown,
  X,
} from "lucide-react";
import { SafeImage } from "@/components/common/SafeImage";

const ITEM_TYPES: { label: string; value: BookingItemType | "All" }[] = [
  { label: "All Types", value: "All" },
  { label: "Hotels", value: "Hotel" },
  { label: "Homestays", value: "Homestay" },
  { label: "Transports", value: "Transport" },
  { label: "Restaurants", value: "Restaurant" },
  { label: "Activities", value: "Activity" },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>(cmsStore.getBookings());
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "All">("All");
  const [selectedType, setSelectedType] = useState<BookingItemType | "All">("All");
  
  // Selected detail modal
  const [detailBooking, setDetailBooking] = useState<BookingRecord | null>(null);
  
  // New manual booking modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState<Partial<BookingRecord>>({
    itemType: "Hotel",
    itemName: "",
    location: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    checkInDate: new Date().toISOString().split("T")[0],
    checkOutDate: "",
    bookingTime: "12:00 PM",
    guests: 2,
    roomOrSeatType: "Standard Room",
    totalPrice: 2500,
    currency: "NPR",
    status: "Pending",
    paymentStatus: "Pending",
    specialRequests: "",
  });

  const refreshData = () => {
    setBookings([...cmsStore.getBookings()]);
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = cmsStore.subscribe(refreshData);
    return unsubscribe;
  }, []);

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      search.trim() === "" ||
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      b.customerPhone.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.itemName.toLowerCase().includes(search.toLowerCase()) ||
      (b.location && b.location.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = selectedStatus === "All" || b.status === selectedStatus;
    const matchesType = selectedType === "All" || b.itemType === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate stats
  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "Pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "Confirmed").length;
  const completedCount = bookings.filter((b) => b.status === "Completed").length;
  const totalRevenue = bookings.reduce((sum, b) => {
    if (b.status !== "Cancelled") return sum + (Number(b.totalPrice) || 0);
    return sum;
  }, 0);

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    await cmsStore.updateBookingStatus(id, newStatus);
    refreshData();
    if (detailBooking && detailBooking.id === id) {
      setDetailBooking({ ...detailBooking, status: newStatus });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this enquiry/booking record?")) {
      await cmsStore.deleteBooking(id);
      refreshData();
      if (detailBooking?.id === id) setDetailBooking(null);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.customerName || !newBooking.itemName) {
      alert("Please fill in the customer name and item name.");
      return;
    }

    await cmsStore.saveBooking(newBooking);
    setIsAddModalOpen(false);
    refreshData();
  };

  const getItemIcon = (type: BookingItemType) => {
    switch (type) {
      case "Hotel":
        return <Hotel className="w-4 h-4 text-emerald-400" />;
      case "Homestay":
        return <Home className="w-4 h-4 text-teal-400" />;
      case "Transport":
        return <Bus className="w-4 h-4 text-blue-400" />;
      case "Restaurant":
        return <UtensilsCrossed className="w-4 h-4 text-orange-400" />;
      case "Activity":
        return <Compass className="w-4 h-4 text-indigo-400" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Pending Review</span>
          </span>
        );
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase mb-2">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Customer Booking & Enquiry Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Bookings & Enquiries Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Live visitor reservations for Hotels, Homestays, Transport jeeps, Restaurant dining, and Tours. Contact customers directly via Phone or WhatsApp and update status.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="relative z-10 self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-md">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Enquiries</p>
            <p className="text-2xl font-black text-white mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111827] p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between shadow-md">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Pending Action</p>
            </div>
            <p className="text-2xl font-black text-amber-300 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111827] p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between shadow-md">
          <div>
            <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Confirmed</p>
            <p className="text-2xl font-black text-emerald-300 mt-1">{confirmedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111827] p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 flex items-center justify-between shadow-md">
          <div>
            <p className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Completed</p>
            <p className="text-2xl font-black text-blue-300 mt-1">{completedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-md col-span-2 sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated Value</p>
            <p className="text-xl font-black text-emerald-400 mt-1">
              NRs {totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, phone, ID, or item..."
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Module Type Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {ITEM_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedType === t.value
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800 overflow-x-auto">
          {(["All", "Pending", "Confirmed", "Completed", "Cancelled"] as const).map((st) => {
            const count =
              st === "All"
                ? bookings.length
                : bookings.filter((b) => b.status === st).length;

            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === st
                    ? "bg-slate-800 text-white border border-slate-600 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    st === "Pending" && count > 0
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-slate-900 text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bookings List / Table */}
      {filteredBookings.length === 0 ? (
        <div className="bg-[#111827] rounded-3xl border border-slate-800 p-12 text-center">
          <CalendarCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No bookings found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search
              ? "No enquiries match your search query. Try adjusting your filters."
              : "No enquiries have been made yet. New bookings created by users will appear here automatically."}
          </p>
        </div>
      ) : (
        <div className="bg-[#111827] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Booking ID & Date</th>
                  <th className="px-5 py-3.5 font-bold">Item & Service</th>
                  <th className="px-5 py-3.5 font-bold">Customer Details</th>
                  <th className="px-5 py-3.5 font-bold">Party / Schedule</th>
                  <th className="px-5 py-3.5 font-bold">Amount</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBookings.map((b) => {
                  const cleanPhone = b.customerPhone.replace(/[^0-9]/g, "");
                  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("977") ? cleanPhone : "977" + cleanPhone}`;

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-900/40 transition-colors group"
                    >
                      {/* Booking ID & Date */}
                      <td className="px-5 py-4 align-top">
                        <div className="font-mono font-bold text-white text-xs">
                          {b.id}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {new Date(b.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Item & Service */}
                      <td className="px-5 py-4 align-top max-w-xs">
                        <div className="flex items-start gap-3">
                          {b.itemImage ? (
                            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-slate-700">
                              <SafeImage
                                src={b.itemImage}
                                alt={b.itemName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                              {getItemIcon(b.itemType)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                                {b.itemType}
                              </span>
                            </div>
                            <div className="font-bold text-white text-xs mt-1 truncate">
                              {b.itemName}
                            </div>
                            {b.location && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                                <span>{b.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Customer Details */}
                      <td className="px-5 py-4 align-top">
                        <div className="font-bold text-white text-xs">
                          {b.customerName}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                          <a
                            href={`mailto:${b.customerEmail}`}
                            className="hover:text-emerald-400 transition-colors truncate max-w-[150px]"
                          >
                            {b.customerEmail}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <a
                            href={`tel:${b.customerPhone}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold border border-slate-700 transition-colors"
                            title="Call customer"
                          >
                            <Phone className="w-2.5 h-2.5" />
                            <span>{b.customerPhone}</span>
                          </a>
                          {b.customerPhone && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Party / Schedule */}
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold">{b.checkInDate}</span>
                        </div>
                        {b.checkOutDate && (
                          <div className="text-[10px] text-slate-500 pl-5">
                            to {b.checkOutDate}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-500" />
                            <span>{b.guests} Guests</span>
                          </span>
                          {b.roomOrSeatType && (
                            <span className="text-slate-500">• {b.roomOrSeatType}</span>
                          )}
                        </div>
                        {b.specialRequests && (
                          <div className="text-[10px] text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded mt-1.5 line-clamp-1 border border-amber-500/20">
                            Note: {b.specialRequests}
                          </div>
                        )}
                      </td>

                      {/* Amount & Payment */}
                      <td className="px-5 py-4 align-top">
                        <div className="font-extrabold text-white text-xs">
                          {b.currency} {Number(b.totalPrice).toLocaleString()}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          Pay: <span className="text-slate-200">{b.paymentStatus}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 align-top">
                        <div className="space-y-1.5">
                          {getStatusBadge(b.status)}
                          
                          {/* Quick status switch dropdown */}
                          <div className="relative">
                            <select
                              value={b.status}
                              onChange={(e) =>
                                handleStatusChange(b.id, e.target.value as BookingStatus)
                              }
                              className="w-full bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none pr-5"
                            >
                              <option value="Pending">Mark Pending</option>
                              <option value="Confirmed">Mark Confirmed</option>
                              <option value="Completed">Mark Completed</option>
                              <option value="Cancelled">Mark Cancelled</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailBooking(b)}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="View Full Booking Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Booking"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL VIEW MODAL */}
      {detailBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">
                    Enquiry Details: {detailBooking.id}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Booked on {new Date(detailBooking.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailBooking(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              {/* Status Header */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 font-bold uppercase text-[11px]">
                  Current Status
                </span>
                <div className="flex items-center gap-2">
                  {getStatusBadge(detailBooking.status)}
                  <select
                    value={detailBooking.status}
                    onChange={(e) =>
                      handleStatusChange(detailBooking.id, e.target.value as BookingStatus)
                    }
                    className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Service Info */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex gap-3">
                {detailBooking.itemImage && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700">
                    <SafeImage
                      src={detailBooking.itemImage}
                      alt={detailBooking.itemName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    {detailBooking.itemType}
                  </span>
                  <h4 className="font-bold text-white text-sm mt-1">
                    {detailBooking.itemName}
                  </h4>
                  {detailBooking.location && (
                    <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {detailBooking.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Customer Contact */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Customer Contact
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Name:</span>
                    <span className="font-bold text-white">{detailBooking.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Email:</span>
                    <a
                      href={`mailto:${detailBooking.customerEmail}`}
                      className="font-bold text-emerald-400 hover:underline"
                    >
                      {detailBooking.customerEmail}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Phone:</span>
                    <a
                      href={`tel:${detailBooking.customerPhone}`}
                      className="font-bold text-emerald-400 hover:underline"
                    >
                      {detailBooking.customerPhone}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Quick Action:</span>
                    <a
                      href={`https://wa.me/${detailBooking.customerPhone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-bold"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Schedule & Room/Seat */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Reservation Schedule & Details
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Date:</span>
                    <span className="font-bold text-white">
                      {detailBooking.checkInDate}{" "}
                      {detailBooking.checkOutDate ? `to ${detailBooking.checkOutDate}` : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Time:</span>
                    <span className="font-bold text-white">{detailBooking.bookingTime || "12:00 PM"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Guests:</span>
                    <span className="font-bold text-white">{detailBooking.guests} People</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tier / Room:</span>
                    <span className="font-bold text-white">
                      {detailBooking.roomOrSeatType || "Standard"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Amount:</span>
                    <span className="font-black text-emerald-400 text-sm">
                      {detailBooking.currency} {Number(detailBooking.totalPrice).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Payment Mode:</span>
                    <span className="font-bold text-slate-200">
                      {detailBooking.paymentStatus}
                    </span>
                  </div>
                </div>

                {detailBooking.specialRequests && (
                  <div className="pt-2 border-t border-slate-800 mt-2">
                    <span className="text-slate-500 block">Special Customer Requests:</span>
                    <p className="text-amber-200 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 mt-1 italic">
                      "{detailBooking.specialRequests}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800 mt-4">
              <button
                onClick={() => handleDelete(detailBooking.id)}
                className="px-3 py-2 rounded-xl bg-rose-950 text-rose-400 hover:bg-rose-900 border border-rose-800/40 text-xs font-bold transition-all"
              >
                Delete Record
              </button>
              <button
                onClick={() => setDetailBooking(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ENTRY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">New Phone / Walk-in Booking</h3>
                  <p className="text-xs text-slate-400">Manually record a customer enquiry or offline booking.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Service Type *</label>
                  <select
                    value={newBooking.itemType}
                    onChange={(e) => setNewBooking({ ...newBooking, itemType: e.target.value as BookingItemType })}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5"
                  >
                    <option value="Hotel">Hotel</option>
                    <option value="Homestay">Homestay</option>
                    <option value="Transport">Transport</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Activity">Activity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Item / Service Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mountain View Resort"
                    value={newBooking.itemName}
                    onChange={(e) => setNewBooking({ ...newBooking, itemName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Pokhara, Lakeside"
                  value={newBooking.location}
                  onChange={(e) => setNewBooking({ ...newBooking, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={newBooking.customerName}
                    onChange={(e) => setNewBooking({ ...newBooking, customerName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={newBooking.customerEmail}
                    onChange={(e) => setNewBooking({ ...newBooking, customerEmail: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+977-98..."
                    value={newBooking.customerPhone}
                    onChange={(e) => setNewBooking({ ...newBooking, customerPhone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Check-in Date</label>
                  <input
                    type="date"
                    value={newBooking.checkInDate}
                    onChange={(e) => setNewBooking({ ...newBooking, checkInDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Check-out Date</label>
                  <input
                    type="date"
                    value={newBooking.checkOutDate}
                    onChange={(e) => setNewBooking({ ...newBooking, checkOutDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Guests</label>
                  <input
                    type="number"
                    min="1"
                    value={newBooking.guests}
                    onChange={(e) => setNewBooking({ ...newBooking, guests: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Total Price (NRs)</label>
                  <input
                    type="number"
                    value={newBooking.totalPrice}
                    onChange={(e) => setNewBooking({ ...newBooking, totalPrice: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Special Requests / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Needs early check-in, vegetarian food requested..."
                  value={newBooking.specialRequests}
                  onChange={(e) => setNewBooking({ ...newBooking, specialRequests: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
