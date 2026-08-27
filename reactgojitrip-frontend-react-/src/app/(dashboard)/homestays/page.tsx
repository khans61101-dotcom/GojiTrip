"use client";

import React from "react";
import {
  listHotels,
  deleteHotel,
  HotelRecord,
} from "@/lib/api";
import { cmsStore } from "@/lib/cms-store";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ImageFileInput } from "@/components/common/ImageFileInput";
import { MultiImageFileInput } from "@/components/common/MultiImageFileInput";
import { ApprovalStatus } from "@/types/cms";
import {
  Home,
  Plus,
  Search,
  MapPin,
  Phone,
  Clock,
  Edit,
  Trash2,
  X,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { MediaPickerModal } from "@/components/media/MediaPickerModal";

export default function HomestaysPage() {
  const [homestays, setHomestays] = React.useState<HotelRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingHomestay, setEditingHomestay] = React.useState<Partial<HotelRecord> | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Media Picker state
  const [mediaPickerOpen, setMediaPickerOpen] = React.useState(false);

  React.useEffect(() => {
    fetchHomestays();
    const unsubscribe = cmsStore.subscribe(() => {
      const storeHotels = cmsStore.getHotels();
      setHomestays((prev: any) => {
        if (!Array.isArray(prev) || prev.length === 0) {
          return storeHotels.filter((h) => h.propertyType === "Homestay") as any;
        }
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

  const fetchHomestays = async () => {
    setLoading(true);
    try {
      const storeHotels = cmsStore.getHotels();
      const backendData = await listHotels().catch(() => []);
      const data = Array.isArray(backendData) ? backendData : [];

      const allItems = data.length > 0 ? data : storeHotels;
      const filteredHomestays = allItems.filter(
        (h: any) => h.propertyType === "Homestay" || (h.hotelName && h.hotelName.toLowerCase().includes("homestay"))
      );

      const merged = filteredHomestays.map((h: any) => {
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

        const pricePerNight = match?.pricePerNight !== undefined ? match.pricePerNight : (Number(h.pricePerNight) || 1500);
        const currency = match?.currency || h.currency || "NRs";
        const approvalStatus = match?.approvalStatus || h.approvalStatus || "Draft";

        return {
          ...h,
          propertyType: "Homestay",
          pricePerNight,
          currency,
          approvalStatus,
          hotelPhotos: photos,
          photos: photos,
          imageUrl: h.imageUrl || photos[0] || "",
        };
      });

      setHomestays(merged as any);
    } catch (error) {
      console.error("Error fetching homestays:", error);
      const fallback = cmsStore.getHotels().filter((h) => h.propertyType === "Homestay");
      setHomestays(fallback as any);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = (Array.isArray(homestays) ? homestays : []).filter((h) => {
    const matchesSearch =
      (h.hotelName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.contactPerson || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || h.approvalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreateModal = () => {
    setEditingHomestay({
      hotelName: "New Traditional Homestay",
      propertyType: "Homestay",
      contactPerson: "Local Village Host",
      phoneNumber: "+977-98XXXXXXXX",
      location: "Mustang Village, Nepal",
      latitude: 28.78,
      longitude: 83.73,
      checkInTime: "12:00 PM",
      checkOutTime: "10:00 AM",
      availabilityStatus: "Available",
      partnerStatus: "Verified Partner",
      approvalStatus: "Draft",
      createdByName: "Admin",
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

    setEditingHomestay({
      ...h,
      propertyType: "Homestay",
      hotelPhotos: existingPhotos,
      photos: existingPhotos,
      imageUrl: h.imageUrl || existingPhotos[0] || "",
    } as any);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this homestay record?")) {
      try {
        await deleteHotel(id);
        fetchHomestays();
      } catch (error) {
        console.error("Error deleting homestay:", error);
        alert("Failed to delete homestay.");
      }
    }
  };

  const handleSaveHomestay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHomestay) return;

    setIsSubmitting(true);
    try {
      const rawPhotos = (editingHomestay as any).hotelPhotos || (editingHomestay as any).photos;
      const photos = Array.isArray(rawPhotos) && rawPhotos.length > 0
        ? rawPhotos
        : (editingHomestay.imageUrl ? [editingHomestay.imageUrl] : []);

      const payload = {
        ...editingHomestay,
        propertyType: "Homestay",
        hotelPhotos: photos,
        photos: photos,
        imageUrl: editingHomestay.imageUrl || photos[0] || null,
      };

      await cmsStore.saveHotel({
        id: editingHomestay.id ? String(editingHomestay.id) : undefined,
        ...payload,
      } as any);

      setIsModalOpen(false);
      setEditingHomestay(null);
      fetchHomestays();
    } catch (error) {
      console.error("Error saving homestay:", error);
      alert("Failed to save homestay. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttachMedia = (url: string) => {
    if (!editingHomestay || !url) return;
    setEditingHomestay((prev: any) => {
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

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111827] p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Home className="w-6 h-6 text-emerald-400" />
            <span>Homestays Management Module</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage authentic local homestays, village stays, host contacts, and photo galleries
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Homestay</span>
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#111827] p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search homestays by name, village location, host name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#182238] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Approval Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Published">Published</option>
          </select>
        </div>
      </div>

      {/* CONTENT LIST */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-[#111827] p-12 rounded-2xl border border-slate-800 text-center">
          <Home className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Homestays Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No traditional homestay records match your filter criteria. Click "Add New Homestay" to register a new village stay.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((h) => {
            const photoList = (h as any).hotelPhotos || (h as any).photos || (h.imageUrl ? [h.imageUrl] : []);
            return (
              <div
                key={h.id}
                className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={h.imageUrl || photoList[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}
                      alt={h.hotelName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80" />

                    <div className="absolute top-3 left-3 flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white font-bold text-[10px] uppercase backdrop-blur-sm shadow">
                        Homestay
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <StatusBadge status={h.approvalStatus as ApprovalStatus} />
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] text-slate-300 font-medium">
                        📸 {photoList.length} Photos Gallery
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {h.hotelName}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center mt-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 mr-1 flex-shrink-0" />
                        <span className="truncate">{h.location}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Host Person</span>
                        <span className="font-semibold text-slate-200">{h.contactPerson || "Local Host"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Phone Contact</span>
                        <span className="font-semibold text-slate-200">{h.phoneNumber || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-slate-900/40 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 flex items-center">
                    <Clock className="w-3.5 h-3.5 text-slate-500 mr-1" />
                    <span>In: {h.checkInTime || "12 PM"} • Out: {h.checkOutTime || "10 AM"}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleOpenEditModal(h)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 transition-all border border-slate-700"
                      title="Edit Homestay"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(Number(h.id))}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-all border border-slate-700"
                      title="Delete Homestay"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FORM MODAL */}
      {isModalOpen && editingHomestay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#111827] border border-slate-800 rounded-2xl p-6 text-white space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <Home className="w-5 h-5 text-emerald-400" />
                <span>{editingHomestay.id ? "Edit Homestay Details" : "Add New Village Homestay"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHomestay} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Homestay Name</label>
                  <input
                    type="text"
                    required
                    value={editingHomestay.hotelName || ""}
                    onChange={(e) => setEditingHomestay({ ...editingHomestay, hotelName: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Property Category</label>
                  <input
                    type="text"
                    disabled
                    value="Homestay"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Host Contact Person</label>
                  <input
                    type="text"
                    value={editingHomestay.contactPerson || ""}
                    onChange={(e) => setEditingHomestay({ ...editingHomestay, contactPerson: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone Contact Number</label>
                  <input
                    type="text"
                    value={editingHomestay.phoneNumber || ""}
                    onChange={(e) => setEditingHomestay({ ...editingHomestay, phoneNumber: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Village Location Address</label>
                <input
                  type="text"
                  required
                  value={editingHomestay.location || ""}
                  onChange={(e) => setEditingHomestay({ ...editingHomestay, location: e.target.value })}
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Currency</label>
                  <select
                    value={(editingHomestay as any).currency || "NRs"}
                    onChange={(e) => setEditingHomestay((prev: any) => ({ ...prev, currency: e.target.value }))}
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
                  <label className="block text-slate-300 font-bold mb-1">Price Per Night</label>
                  <input
                    type="number"
                    value={(editingHomestay as any).pricePerNight || 1500}
                    onChange={(e) => setEditingHomestay((prev: any) => ({ ...prev, pricePerNight: Number(e.target.value) || 0 }))}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="1500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Check-In Time</label>
                  <input
                    type="text"
                    value={editingHomestay.checkInTime || "12:00 PM"}
                    onChange={(e) => setEditingHomestay({ ...editingHomestay, checkInTime: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Check-Out Time</label>
                  <input
                    type="text"
                    value={editingHomestay.checkOutTime || "10:00 AM"}
                    onChange={(e) => setEditingHomestay({ ...editingHomestay, checkOutTime: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* PHOTO GALLERY INPUTS */}
              <div className="pt-2 border-t border-slate-800 space-y-4">
                <ImageFileInput
                  label="Homestay Main Cover Photo"
                  value={editingHomestay.imageUrl || ""}
                  onChange={(url) =>
                    setEditingHomestay((prev: any) => ({
                      ...prev,
                      imageUrl: url,
                      hotelPhotos: prev?.hotelPhotos && prev.hotelPhotos.length > 0 ? [url, ...prev.hotelPhotos.slice(1)] : [url],
                      photos: prev?.photos && prev.photos.length > 0 ? [url, ...prev.photos.slice(1)] : [url],
                    }))
                  }
                  onClear={() => setEditingHomestay((prev: any) => ({ ...prev, imageUrl: "" }))}
                  category="Hotels"
                />

                <MultiImageFileInput
                  label="Homestay Photo Gallery (Add Multiple Images)"
                  images={(editingHomestay as any).hotelPhotos || (editingHomestay as any).photos || []}
                  onChange={(photos) =>
                    setEditingHomestay((prev: any) => ({
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
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all disabled:opacity-50 flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Save Homestay</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEDIA PICKER MODAL */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelectMedia={handleAttachMedia}
        title="Select Homestay Photo from Media Library"
        filterCategory="Hotels"
      />
    </div>
  );
}
