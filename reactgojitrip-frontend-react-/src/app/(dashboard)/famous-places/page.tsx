"use client";

import React, { useState, useEffect } from "react";
import { cmsStore } from "@/lib/cms-store";
import type { FamousPlaceEntry, ApprovalStatus } from "@/types/cms";
import { ImageFileInput } from "@/components/common/ImageFileInput";
import { LocationFormSection } from "@/components/common/LocationFormSection";
import {
  Mountain,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Star,
  Eye,
  X,
  Sparkles,
} from "lucide-react";
import { SafeImage } from "@/components/common/SafeImage";

const CATEGORIES = [
  "All Categories",
  "Religious & Heritage",
  "Scenic & Nature",
  "Pilgrimage & Mountain",
  "Adventure & Wildlife",
  "Cultural Heritage",
];

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80";

export default function AdminFamousPlacesPage() {
  const [places, setPlaces] = useState<FamousPlaceEntry[]>(cmsStore.getPlaces());
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<FamousPlaceEntry | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<FamousPlaceEntry>>({
    name: "",
    category: "Religious & Heritage",
    location: "",
    description: "",
    bestTimeToVisit: "",
    entryFee: 0,
    currency: "NPR",
    rating: 4.8,
    imageUrl: "",
    approvalStatus: "Published",
  });

  const refreshData = () => {
    setPlaces(cmsStore.getPlaces());
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = cmsStore.subscribe(() => refreshData());
    return unsubscribe;
  }, []);

  const handleOpenAddModal = () => {
    setEditingPlace(null);
    setFormData({
      name: "",
      category: "Religious & Heritage",
      location: "",
      description: "",
      bestTimeToVisit: "October - March",
      entryFee: 0,
      currency: "NPR",
      rating: 4.8,
      imageUrl: "",
      approvalStatus: "Published",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (place: FamousPlaceEntry) => {
    setEditingPlace(place);
    setFormData({ ...place });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this attraction entry?")) {
      await cmsStore.deletePlace(id);
      refreshData();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      alert("Please provide Attraction Name and Location.");
      return;
    }

    const payload: FamousPlaceEntry = {
      id: editingPlace?.id || `place_${Date.now()}`,
      name: formData.name || "",
      category: formData.category || "Religious & Heritage",
      location: formData.location || "",
      description: formData.description || "",
      bestTimeToVisit: formData.bestTimeToVisit || "All Year",
      entryFee: Number(formData.entryFee) || 0,
      currency: formData.currency || "NPR",
      rating: Number(formData.rating) || 4.8,
      imageUrl: formData.imageUrl || DEFAULT_IMAGE,
      photos: formData.imageUrl ? [formData.imageUrl] : [DEFAULT_IMAGE],
      approvalStatus: (formData.approvalStatus as ApprovalStatus) || "Published",
      createdAt: editingPlace?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByName: "Admin",
    };

    await cmsStore.savePlace(payload);
    setIsModalOpen(false);
    refreshData();
  };

  const filteredPlaces = places.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === "All Categories" || p.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "All Status" || p.approvalStatus === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* HEADER SECTION (DARK THEME) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl">
              <Mountain className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">Famous Places & Attractions Management</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage tourist spots, heritage sites, and scenic travel destinations rendered across GojiTrip front-end.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Attraction</span>
        </button>
      </div>

      {/* FILTER BAR (DARK THEME) */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search attractions by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-400 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All Status" className="bg-slate-900 text-white">All Status</option>
            <option value="Published" className="bg-slate-900 text-white">Published</option>
            <option value="Approved" className="bg-slate-900 text-white">Approved</option>
            <option value="Under Review" className="bg-slate-900 text-white">Under Review</option>
            <option value="Draft" className="bg-slate-900 text-white">Draft</option>
          </select>
        </div>
      </div>

      {/* PLACES GRID (DARK CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaces.map((place) => (
          <div
            key={place.id}
            className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl hover:border-slate-700 transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 w-full bg-slate-800">
                <SafeImage
                  src={place.imageUrl || DEFAULT_IMAGE}
                  fallbackSrc={DEFAULT_IMAGE}
                  alt={place.name}
                  width={400}
                  height={200}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md text-slate-200 text-[10px] font-extrabold rounded-full border border-slate-800">
                  {place.category}
                </span>
                <span
                  className={`absolute top-3 right-3 px-3 py-1 text-[10px] font-extrabold rounded-full ${
                    place.approvalStatus === "Published"
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {place.approvalStatus}
                </span>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-white truncate">
                    {place.name}
                  </h3>
                  <span className="flex items-center text-xs font-bold text-amber-400">
                    ★ {place.rating || 4.8}
                  </span>
                </div>

                <p className="text-xs text-slate-400 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{place.location}</span>
                </p>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {place.description}
                </p>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Best Time: {place.bestTimeToVisit || "All Year"}</span>
                  <span className="font-extrabold text-emerald-400">
                    {place.entryFee ? `${place.currency || "NPR"} ${place.entryFee}` : "Free Entry"}
                  </span>
                </div>
              </div>
            </div>

            {/* CARD ACTIONS (DARK BOTTOM BAR) */}
            <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-2">
              <select
                value={place.approvalStatus}
                onChange={(e) => cmsStore.updateStatus("place", place.id, e.target.value as ApprovalStatus)}
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-xl text-[11px] font-bold text-slate-200 focus:outline-none"
              >
                <option value="Published" className="bg-slate-900">Published</option>
                <option value="Approved" className="bg-slate-900">Approved</option>
                <option value="Under Review" className="bg-slate-900">Under Review</option>
                <option value="Draft" className="bg-slate-900">Draft</option>
              </select>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenEditModal(place)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl transition-colors"
                  title="Edit Attraction"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(place.id)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 rounded-xl transition-colors"
                  title="Delete Attraction"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlaces.length === 0 && (
        <div className="bg-slate-900 rounded-3xl p-12 text-center border border-slate-800 text-slate-400">
          No attractions found matching your search filters.
        </div>
      )}

      {/* ADD / EDIT MODAL (DARK THEME) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <Mountain className="w-5 h-5 text-emerald-400" />
                <span>{editingPlace ? "Edit Attraction Entry" : "Add New Famous Attraction"}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">Attraction Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pashupatinath Temple"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">Category</label>
                <select
                  value={formData.category || "Religious & Heritage"}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                >
                  {CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                  ))}
                </select>
              </div>

              {/* STRUCTURED LOCATION (COUNTRY, STATE, CITY, FULL ADDRESS) */}
              <LocationFormSection
                locationString={formData.location || ""}
                onChange={({ combinedLocation }) => {
                  setFormData((prev) => ({ ...prev, location: combinedLocation }));
                }}
              />

              <div>
                <label className="block text-slate-300 mb-1 font-bold">Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide a detailed travel description of this attraction..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Best Time to Visit</label>
                  <input
                    type="text"
                    placeholder="e.g. Oct - Mar"
                    value={formData.bestTimeToVisit || ""}
                    onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Entry Fee</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.entryFee || 0}
                    onChange={(e) => setFormData({ ...formData, entryFee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Currency</label>
                  <select
                    value={formData.currency || "NPR"}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="NRs" className="bg-slate-900">NRs</option>
                    <option value="NPR" className="bg-slate-900">NPR</option>
                    <option value="USD" className="bg-slate-900">USD</option>
                    <option value="INR" className="bg-slate-900">INR</option>
                    <option value="EUR" className="bg-slate-900">EUR</option>
                  </select>
                </div>
              </div>

              <div>
                <ImageFileInput
                  label="Upload Attraction Image from Device"
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  onClear={() => setFormData({ ...formData, imageUrl: "" })}
                  category="Destinations"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg"
                >
                  Save Attraction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
