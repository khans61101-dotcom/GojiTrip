"use client";

import React from "react";
import {
  listHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  HotelRecord,
} from "@/lib/api";
import { cmsStore } from "@/lib/cms-store";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ImageFileInput } from "@/components/common/ImageFileInput";
import { MultiImageFileInput } from "@/components/common/MultiImageFileInput";
import { LocationFormSection } from "@/components/common/LocationFormSection";
import { TagInputSection } from "@/components/common/TagInputSection";
import { ApprovalStatus } from "@/types/cms";
import {
  Hotel,
  Plus,
  Search,
  MapPin,
  Phone,
  Bed,
  ShieldCheck,
  Edit,
  Trash2,
  Image as ImageIcon,
  X,
  UploadCloud,
  Loader2,
  Check,
} from "lucide-react";
import { MediaPickerModal } from "@/components/media/MediaPickerModal";

// =============== MAIN HOTELS PAGE ===============
export default function HotelsPage() {
const [hotels, setHotels] = React.useState<HotelRecord[]>([]);
const [loading, setLoading] = React.useState(true);
const [searchQuery, setSearchQuery] = React.useState("");
const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
const [isModalOpen, setIsModalOpen] = React.useState(false);
const [editingHotel, setEditingHotel] =
  React.useState<Partial<HotelRecord> | null>(null);
const [isSubmitting, setIsSubmitting] = React.useState(false);

// Media Picker state
const [mediaPickerOpen, setMediaPickerOpen] = React.useState(false);

React.useEffect(() => {
  fetchHotels();
  const unsubscribe = cmsStore.subscribe(() => {
    const storeHotels = cmsStore.getHotels();
    setHotels((prev: any) => {
      if (!Array.isArray(prev) || prev.length === 0) return storeHotels as any;
      return prev.map((item: any) => {
        const match = storeHotels.find((s: any) => String(s.id) === String(item.id));
        return match ? { ...item, ...match } : item;
      });
    });
  });
  return () => {
    if (typeof unsubscribe === "function") unsubscribe();
  };
}, []);

const fetchHotels = async () => {
  setLoading(true);
  try {
    const storeHotels = cmsStore.getHotels();
    const backendData = await listHotels().catch(() => []);
    const data = Array.isArray(backendData) ? backendData : [];

    const merged = data.map((h: any) => {
      const match = storeHotels.find((s: any) => String(s.id) === String(h.id));
      const photos = (Array.isArray(match?.hotelPhotos) && match.hotelPhotos.length > 0)
        ? match.hotelPhotos
        : (Array.isArray(match?.photos) && match.photos.length > 0)
        ? match.photos
        : (Array.isArray(h.hotelPhotos) && h.hotelPhotos.length > 0)
        ? h.hotelPhotos
        : (Array.isArray(h.photos) && h.photos.length > 0)
        ? h.photos
        : (h.imageUrl ? [h.imageUrl] : []);

      const approvalStatus = match?.approvalStatus || h.approvalStatus || "Draft";
      const pricePerNight = match?.pricePerNight !== undefined ? match.pricePerNight : (Number(h.pricePerNight) || 2500);
      const currency = match?.currency || h.currency || "NRs";
      const location = match?.location || h.location || "N/A";

      return {
        ...h,
        location,
        pricePerNight,
        currency,
        approvalStatus,
        hotelPhotos: photos,
        photos: photos,
        imageUrl: h.imageUrl || photos[0] || "",
        ...(match || {}),
      };
    });

    storeHotels.forEach((sh: any) => {
      if (!merged.some((m: any) => String(m.id) === String(sh.id))) {
        merged.unshift(sh);
      }
    });

    setHotels(merged as any);
  } catch (error) {
    console.error("Error fetching hotels:", error);
    setHotels(cmsStore.getHotels() as any);
  } finally {
    setLoading(false);
  }
};

if (loading) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );
}

const filteredHotels = (Array.isArray(hotels) ? hotels : []).filter((h) => {
  const matchesSearch =
    (h.hotelName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.contactPerson || "").toLowerCase().includes(searchQuery.toLowerCase());

  const matchesStatus =
    statusFilter === "ALL" || h.approvalStatus === statusFilter;
  return matchesSearch && matchesStatus;
});

const handleOpenCreateModal = () => {
  setEditingHotel({
    hotelName: "New Mountain Lodge",
    propertyType: "Homestay",
    contactPerson: "Local Host",
    phoneNumber: "+977-98XXXXXXXX",
    location: "Annapurna Region, Nepal",
    latitude: 28.5,
    longitude: 83.9,
    checkInTime: "12:00 PM",
    checkOutTime: "10:00 AM",
    availabilityStatus: "Available",
    partnerStatus: "Verified Partner",
    approvalStatus: "Draft",
    createdByName: "Admin",
    facilities: ["Free Wi-Fi", "Mountain View", "AC & Heating", "Hot Shower", "Free Parking", "Breakfast Included"],
    hotelPhotos: [],
    photos: [],
  } as any);
  setIsModalOpen(true);
};

const handleOpenEditModal = (h: HotelRecord) => {
  const rawHotelPhotos = (h as any).hotelPhotos;
  const rawPhotos = (h as any).photos;
  const existingPhotos = (Array.isArray(rawHotelPhotos) && rawHotelPhotos.length > 0)
    ? rawHotelPhotos
    : (Array.isArray(rawPhotos) && rawPhotos.length > 0)
    ? rawPhotos
    : (h.imageUrl ? [h.imageUrl] : []);

  const facilities = Array.isArray((h as any).facilities)
    ? (h as any).facilities
    : ["Free Wi-Fi", "Mountain View", "AC & Heating", "Hot Shower", "Free Parking", "Breakfast Included"];

  setEditingHotel({
    ...h,
    facilities,
    hotelPhotos: existingPhotos,
    photos: existingPhotos,
    imageUrl: h.imageUrl || existingPhotos[0] || "",
  } as any);
  setIsModalOpen(true);
};

const handleDelete = async (id: number | string) => {
  if (confirm("Are you sure you want to delete this property record?")) {
    try {
      await cmsStore.deleteHotel(id);
      fetchHotels();
    } catch (error) {
      console.error("Error deleting hotel:", error);
    }
  }
};

const handleSaveHotel = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingHotel) return;

  setIsSubmitting(true);
  try {
    const rawPhotos = (editingHotel as any).hotelPhotos || (editingHotel as any).photos;
    const photos = Array.isArray(rawPhotos) && rawPhotos.length > 0
      ? rawPhotos
      : (editingHotel.imageUrl ? [editingHotel.imageUrl] : []);

    const payload = {
      ...editingHotel,
      hotelPhotos: photos,
      photos: photos,
      imageUrl: editingHotel.imageUrl || photos[0] || null,
    };

    await cmsStore.saveHotel({
      id: editingHotel.id ? String(editingHotel.id) : undefined,
      ...payload,
    } as any);

    setIsModalOpen(false);
    setEditingHotel(null);
    fetchHotels();
  } catch (error) {
    console.error("Error saving hotel:", error);
    alert("Failed to save hotel. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};
  // =============== Handle media attachment ===============
  const handleAttachMedia = (url: string) => {
    if (!editingHotel || !url) return;
    setEditingHotel((prev: any) => {
      const currentPhotos = prev?.hotelPhotos || prev?.photos || [];
      const updatedPhotos = currentPhotos.includes(url) ? currentPhotos : [...currentPhotos, url];
      return {
        ...prev,
        imageUrl: prev?.imageUrl || url,
        hotelPhotos: updatedPhotos,
        photos: updatedPhotos,
      };
    });
    setMediaPickerOpen(false);
  };

  // =============== Remove photo ===============
  const handleRemovePhoto = () => {
    if (!editingHotel) return;
    setEditingHotel({
      ...editingHotel,
      imageUrl: null,
    });
  };

  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return "N/A";
    try {
      return amount.toLocaleString();
    } catch {
      return amount.toString();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Hotel className="w-4 h-4" />
            <span>Accommodations & Homestays</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Hotels & Homestays Module
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage mountain lodges, homestays, rates, GPS coordinates, room
            types & verified partner status.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search hotel name, location, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#182238] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-1 bg-[#182238] border border-slate-700/80 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {["ALL", "Draft", "Under Review", "Approved", "Published"].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? "bg-emerald-500 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {st}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Grid of Hotels */}
      {filteredHotels.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800 text-slate-400">
          <Hotel className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-semibold">
            No hotel or homestay entries found matching filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredHotels.map((item) => (
            <div
              key={item.id}
              className="glass-panel rounded-2xl border border-slate-800/90 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                {/* Photo Gallery Header */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.hotelName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (
                          e.target as HTMLImageElement
                        ).parentElement!.innerHTML =
                          '<div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">Image not available</div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                      No Photo Attached
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex space-x-2">
                    <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 font-bold text-[10px] uppercase border border-white/10">
                      {item.propertyType || "Hotel"}
                    </span>
                    {item.partnerStatus === "Verified Partner" && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center shadow">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Partner
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <StatusBadge
                      status={item.approvalStatus as ApprovalStatus}
                      entityType="Hotel"
                      entityId={item.id.toString()}
                    />
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-white">
                    {item.hotelName || "Unnamed Property"}
                  </h3>
                  <p className="text-xs text-slate-300 flex items-center mt-1">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    {item.location || "Location not specified"}(
                    {item.latitude ? item.latitude.toFixed(4) : "0.0000"},
                    {item.longitude ? item.longitude.toFixed(4) : "0.0000"})
                  </p>

                  <div className="mt-3 flex items-center space-x-4 text-xs text-slate-300 border-y border-slate-800 py-2.5">
                    <span className="flex items-center">
                      <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {item.phoneNumber || "N/A"}
                    </span>
                    <span className="text-slate-400">
                      Contact: {item.contactPerson || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="px-5 py-3 bg-[#131C30] border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Check-in: {item.checkInTime || "N/A"} • Check-out:{" "}
                  {item.checkOutTime || "N/A"}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Form Modal */}
      {isModalOpen && editingHotel && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#182238] flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">
                {editingHotel.id
                  ? "Edit Property Details"
                  : "Add New Accommodation"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveHotel}
              className="p-6 overflow-y-auto space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Hotel / Homestay Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingHotel.hotelName || ""}
                    onChange={(e) =>
                      setEditingHotel({
                        ...editingHotel,
                        hotelName: e.target.value,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Property Type
                  </label>
                  <select
                    value={editingHotel.propertyType || "Hotel"}
                    onChange={(e) =>
                      setEditingHotel({
                        ...editingHotel,
                        propertyType: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Hotel">Hotel</option>
                    <option value="Homestay">Homestay</option>
                    <option value="Resort">Resort</option>
                    <option value="Lodge">Lodge</option>
                    <option value="Guest House">Guest House</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={editingHotel.contactPerson || ""}
                    onChange={(e) =>
                      setEditingHotel({
                        ...editingHotel,
                        contactPerson: e.target.value,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Tenzing Norgay"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingHotel.phoneNumber || ""}
                    onChange={(e) =>
                      setEditingHotel({
                        ...editingHotel,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. +977-9846001122"
                  />
                </div>
              </div>

              {/* STRUCTURED LOCATION INPUT (COUNTRY, STATE, CITY, FULL ADDRESS) */}
              <LocationFormSection
                locationString={editingHotel.location || ""}
                country={(editingHotel as any).country}
                state={(editingHotel as any).state}
                city={(editingHotel as any).city}
                fullAddress={(editingHotel as any).fullAddress}
                onChange={({ country, state, city, fullAddress, combinedLocation }) => {
                  setEditingHotel((prev: any) => ({
                    ...prev,
                    location: combinedLocation,
                    country,
                    state,
                    city,
                    fullAddress,
                  }));
                }}
              />

              {/* DESCRIPTION & ABOUT THE PROPERTY */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Property Description / Story (Shown on Yelp Detail View)
                </label>
                <textarea
                  rows={3}
                  value={(editingHotel as any).description || ""}
                  onChange={(e) =>
                    setEditingHotel({
                      ...editingHotel,
                      description: e.target.value,
                    } as any)
                  }
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Describe your hotel rooms, mountain views, host hospitality, dining..."
                />
              </div>

              {/* PRICE PER NIGHT, CURRENCY & WHATSAPP */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Currency
                  </label>
                  <select
                    value={(editingHotel as any).currency || "NRs"}
                    onChange={(e) =>
                      setEditingHotel((prev: any) => ({
                        ...prev,
                        currency: e.target.value,
                      }))
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="NRs">NRs (Nepali Rupee)</option>
                    <option value="NPR">NPR (Nepali Rupee)</option>
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Price Per Night
                  </label>
                  <input
                    type="number"
                    value={(editingHotel as any).pricePerNight || 2500}
                    onChange={(e) =>
                      setEditingHotel((prev: any) => ({
                        ...prev,
                        pricePerNight: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="2500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={(editingHotel as any).whatsappNumber || ""}
                    onChange={(e) =>
                      setEditingHotel((prev: any) => ({
                        ...prev,
                        whatsappNumber: e.target.value,
                      }))
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="+977-9801234567"
                  />
                </div>
              </div>

              {/* AMENITIES & FACILITIES TAG CHIP BOXES */}
              <TagInputSection
                label="Property Amenities & Facilities"
                placeholder="Type facility (e.g. Swimming Pool) & press Enter or comma..."
                value={(editingHotel as any).facilities}
                onChange={(tags) =>
                  setEditingHotel((prev: any) => ({
                    ...prev,
                    facilities: tags,
                  }))
                }
                suggestions={[
                  "Free Wi-Fi",
                  "Mountain View",
                  "AC & Heating",
                  "Hot Shower",
                  "Free Parking",
                  "Breakfast Included",
                  "Swimming Pool",
                  "Room Service",
                  "Generator Backup",
                  "Spa & Wellness",
                ]}
              />

              {/* OPERATING HOURS / FRONT DESK SCHEDULE */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Operating Hours / Front Desk Schedule
                </label>
                <input
                  type="text"
                  value={(editingHotel as any).operatingHours || "24/7 Front Desk • Check-in: 12:00 PM, Check-out: 10:00 AM"}
                  onChange={(e) =>
                    setEditingHotel({
                      ...editingHotel,
                      operatingHours: e.target.value,
                    } as any)
                  }
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="24/7 Front Desk • Check-in: 12:00 PM"
                />
              </div>

              {/* Current Photo Display */}
              {editingHotel.imageUrl && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Current Photo
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-800">
                      <img
                        src={editingHotel.imageUrl}
                        alt="Hotel photo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute top-0 right-0 p-0.5 bg-red-500/80 hover:bg-red-600 rounded-bl-lg text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* =============== IMAGE FILE UPLOAD FROM COMPUTER =============== */}
              <div className="pt-2 border-t border-slate-800 space-y-4">
                <ImageFileInput
                  label="Hero Cover Photo (Main Cover Image)"
                  value={editingHotel.imageUrl || ""}
                  onChange={(url) => setEditingHotel({ ...editingHotel, imageUrl: url })}
                  onClear={handleRemovePhoto}
                  category="Hotels"
                />

                <MultiImageFileInput
                  label="Hotel Photo Gallery (Add Multiple Images for Yelp Detail View)"
                  images={(editingHotel as any).hotelPhotos || (editingHotel as any).photos || []}
                  onChange={(photos) =>
                    setEditingHotel((prev: any) => ({
                      ...prev,
                      hotelPhotos: photos,
                      photos: photos,
                      imageUrl: (prev && prev.imageUrl) || photos[0] || "",
                    }))
                  }
                  category="Hotels"
                  maxImages={10}
                  onOpenMediaPicker={() => setMediaPickerOpen(true)}
                />

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Or choose from existing Media Library:</span>
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#182238] border border-slate-700 hover:border-emerald-500 text-emerald-400 text-xs font-semibold flex items-center space-x-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Open Media Library</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Property</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============== MEDIA PICKER MODAL =============== */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelectMedia={handleAttachMedia}
        title="Attach Hotel Photo from Media Library"
        filterCategory="Hotels"
      />
    </div>
  );
}
