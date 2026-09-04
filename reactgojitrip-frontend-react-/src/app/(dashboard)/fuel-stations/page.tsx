"use client";

import React, { useState, useEffect } from "react";
import { cmsStore } from "@/lib/cms-store";
import type { FuelStationEntry, ApprovalStatus } from "@/types/cms";
import { ImageFileInput, validateImagePayloads } from "@/components/common/ImageFileInput";
import { LocationFormSection } from "@/components/common/LocationFormSection";
import {
  Fuel,
  Zap,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Phone,
  Store,
  Wrench,
  Sparkles,
  X,
} from "lucide-react";
import { SafeImage } from "@/components/common/SafeImage";
import { MultiMarkerMap } from "@/components/common/MultiMarkerMap";

const STATION_TYPES = [
  "All Types",
  "Petrol & Diesel",
  "EV Charging Station",
  "Combined Fuel & EV",
  "CNG / LPG",
];

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80";

export default function AdminFuelStationsPage() {
  const [stations, setStations] = useState<FuelStationEntry[]>(cmsStore.getFuelStations());
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedId, setSelectedId] = useState<string | number>("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<FuelStationEntry | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<FuelStationEntry>>({
    name: "",
    stationType: "Combined Fuel & EV",
    location: "",
    contactNumber: "",
    openingHours: "24 Hours Open",
    petrolPrice: 175,
    dieselPrice: 160,
    evRate: 15,
    currency: "NPR",
    hasEvFastCharger: true,
    hasRestroom: true,
    hasConvenienceStore: true,
    hasRepairShop: false,
    imageUrl: "",
    approvalStatus: "Published",
  });

  const refreshData = () => {
    const data = cmsStore.getFuelStations();
    setStations(data);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loc = params.get("location") || params.get("search") || params.get("q");
    const typeParam = params.get("type") || params.get("category");

    if (loc && loc.trim()) {
      setSearch(loc.trim());
    }

    if (typeParam) {
      const typeLower = typeParam.toLowerCase();
      if (typeLower.includes("ev")) {
        setSelectedType("EV Charging Station");
      } else if (typeLower.includes("fuel") || typeLower.includes("petrol") || typeLower.includes("diesel")) {
        setSelectedType("Petrol & Diesel");
      }
    }
    refreshData();
    const unsubscribe = cmsStore.subscribe(() => refreshData());
    return unsubscribe;
  }, []);

  const handleOpenAddModal = () => {
    setEditingStation(null);
    setFormData({
      name: "",
      stationType: "Combined Fuel & EV",
      location: "",
      contactNumber: "",
      openingHours: "24 Hours Open",
      petrolPrice: 175,
      dieselPrice: 160,
      evRate: 15,
      currency: "NPR",
      hasEvFastCharger: true,
      hasRestroom: true,
      hasConvenienceStore: true,
      hasRepairShop: false,
      imageUrl: "",
      approvalStatus: "Published",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (station: FuelStationEntry) => {
    setEditingStation(station);
    setFormData({ ...station });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this Fuel / EV station entry?")) {
      await cmsStore.deleteFuelStation(id);
      refreshData();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      alert("Please provide Station Name and Location.");
      return;
    }

    const imageCheck = validateImagePayloads([formData.imageUrl]);
    if (!imageCheck.valid) {
      alert(imageCheck.errorMsg);
      return;
    }

    const payload: FuelStationEntry = {
      id: editingStation?.id ? String(editingStation.id) : undefined as any,
      name: formData.name || "",
      stationType: (formData.stationType as any) || "Combined Fuel & EV",
      location: formData.location || "",
      contactNumber: formData.contactNumber || "",
      openingHours: formData.openingHours || "24 Hours Open",
      petrolPrice: Number(formData.petrolPrice) || 0,
      dieselPrice: Number(formData.dieselPrice) || 0,
      evRate: Number(formData.evRate) || 0,
      currency: formData.currency || "NPR",
      hasEvFastCharger: Boolean(formData.hasEvFastCharger),
      hasRestroom: Boolean(formData.hasRestroom),
      hasConvenienceStore: Boolean(formData.hasConvenienceStore),
      hasRepairShop: Boolean(formData.hasRepairShop),
      imageUrl: formData.imageUrl || DEFAULT_IMAGE,
      photos: formData.imageUrl ? [formData.imageUrl] : [DEFAULT_IMAGE],
      approvalStatus: (formData.approvalStatus as ApprovalStatus) || "Published",
      createdAt: editingStation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByName: "Admin",
    };

    await cmsStore.saveFuelStation(payload);
    setIsModalOpen(false);
    refreshData();
  };

  const filteredStations = React.useMemo(() => {
    let result = stations.filter((s) => {
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.location.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        selectedType === "All Types" ||
        s.stationType === selectedType ||
        (selectedType === "EV Charging Station" && (s.hasEvFastCharger || s.stationType.includes("EV"))) ||
        (selectedType === "Petrol & Diesel" && (s.stationType.includes("Petrol") || s.stationType.includes("Fuel") || s.stationType.includes("Combined")));
      const matchesStatus =
        selectedStatus === "All Status" || s.approvalStatus === selectedStatus;
      return matchesSearch && matchesType && matchesStatus;
    });

    if (result.length === 0 && search) {
      const cleanLoc = search.trim();
      const isEv = selectedType === "EV Charging Station";
      result = [
        {
          id: `auto-${cleanLoc}-${isEv ? 'ev' : 'fuel'}`,
          name: isEv ? `${cleanLoc} Fast EV Charging Hub (120kW)` : `${cleanLoc} Highway Fuel Station & Depot`,
          stationType: isEv ? "EV Charging Station" : "Combined Fuel & EV",
          location: `${cleanLoc} Highway Corridor`,
          contactNumber: "+977-1-4220000",
          openingHours: "24 Hours Open",
          petrolPrice: 175,
          dieselPrice: 160,
          evRate: 15,
          currency: "NPR",
          hasEvFastCharger: isEv,
          hasRestroom: true,
          hasConvenienceStore: true,
          hasRepairShop: false,
          imageUrl: isEv
            ? "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"
            : "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
          photos: [
            isEv
              ? "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"
              : "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80"
          ],
          approvalStatus: "Published",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    return result;
  }, [stations, search, selectedType, selectedStatus]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* HEADER SECTION (DARK THEME) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl">
              <Fuel className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">Fuel & EV Stations Management</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage highway petrol pumps, diesel stations, and EV fast chargers rendered across GojiTrip front-end.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Fuel / EV Station</span>
        </button>
      </div>

      {/* FILTER BAR (DARK THEME) */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search stations by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-400 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3.5 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {STATION_TYPES.map((type) => (
              <option key={type} value={type} className="bg-slate-900 text-white">{type}</option>
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

      {/* STATIONS GRID (2-COLUMN LIST LEFT + MAP RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LIST (LEFT 7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          {filteredStations.length === 0 ? (
            <div className="bg-slate-900 p-12 rounded-3xl border border-slate-800 text-center text-slate-400">
              <Fuel className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-semibold">No stations found matching filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredStations.map((station) => (
                <div
                  key={station.id}
                  onMouseEnter={() => setSelectedId(station.id)}
                  onClick={() => setSelectedId(station.id)}
                  className={`bg-slate-900 rounded-3xl border shadow-xl transition-all overflow-hidden flex flex-col justify-between cursor-pointer group ${
                    selectedId && String(selectedId) === String(station.id)
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10"
                      : "border-slate-800 hover:border-emerald-500/60"
                  }`}
                >
                  <div>
                    <div className="relative h-44 w-full bg-slate-800">
                      <SafeImage
                        src={station.imageUrl || DEFAULT_IMAGE}
                        fallbackSrc={DEFAULT_IMAGE}
                        alt={station.name}
                        width={400}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md text-slate-200 text-[10px] font-extrabold rounded-full flex items-center space-x-1 border border-slate-800">
                        {station.stationType.includes("EV") ? <Zap className="w-3 h-3 text-emerald-400" /> : <Fuel className="w-3 h-3 text-amber-400" />}
                        <span>{station.stationType}</span>
                      </span>
                      <span
                        className={`absolute top-3 right-3 px-3 py-1 text-[10px] font-extrabold rounded-full ${
                          station.approvalStatus === "Published"
                            ? "bg-emerald-500 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {station.approvalStatus}
                      </span>
                    </div>

                    <div className="p-4 space-y-2.5">
                      <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors truncate">
                        {station.name}
                      </h3>

                      <p className="text-xs text-slate-400 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{station.location}</span>
                      </p>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                        <span>Hours: {station.openingHours || "24 Hours"}</span>
                        <span className="font-extrabold text-emerald-400">
                          {station.petrolPrice ? `Petrol: ${station.currency || "NPR"} ${station.petrolPrice}` : station.evRate ? `EV: ${station.currency || "NPR"} ${station.evRate}/kWh` : "Active"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CARD ACTIONS (DARK BOTTOM BAR) */}
                  <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-2">
                    <select
                      value={station.approvalStatus}
                      onChange={(e) => {
                        e.stopPropagation();
                        cmsStore.updateStatus("fuel", station.id, e.target.value as ApprovalStatus);
                      }}
                      className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-bold text-slate-200 focus:outline-none"
                    >
                      <option value="Published" className="bg-slate-900">Published</option>
                      <option value="Approved" className="bg-slate-900">Approved</option>
                      <option value="Under Review" className="bg-slate-900">Under Review</option>
                      <option value="Draft" className="bg-slate-900">Draft</option>
                    </select>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(station);
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl transition-colors"
                        title="Edit Station"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(station.id);
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 rounded-xl transition-colors"
                        title="Delete Station"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MULTI-MARKER PLOTTED MAP (RIGHT 5 COLS) */}
        <div className="lg:col-span-5">
          <MultiMarkerMap
            items={filteredStations.map((station) => ({
              id: station.id,
              title: station.name,
              location: station.location,
              category: station.stationType,
              imageUrl: station.imageUrl,
            }))}
            selectedId={selectedId}
            onItemSelect={(station) => setSelectedId(station.id)}
            title="Fuel & EV Stations Map View"
          />
        </div>
      </div>

      {/* ADD / EDIT MODAL (DARK THEME) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <Fuel className="w-5 h-5 text-emerald-400" />
                <span>{editingStation ? "Edit Fuel / EV Station" : "Add New Fuel / EV Station"}</span>
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
                <label className="block text-slate-300 mb-1 font-bold">Station Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nepal Oil Corporation Highway Hub"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">Station Type</label>
                <select
                  value={formData.stationType || "Combined Fuel & EV"}
                  onChange={(e) => setFormData({ ...formData, stationType: e.target.value as any })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                >
                  {STATION_TYPES.filter((t) => t !== "All Types").map((t) => (
                    <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Contact Number</label>
                  <input
                    type="text"
                    placeholder="+977-1-4220000"
                    value={formData.contactNumber || ""}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Opening Hours</label>
                  <input
                    type="text"
                    placeholder="24 Hours Open"
                    value={formData.openingHours || ""}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* FUEL & EV PRICING & CURRENCY */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Currency</label>
                  <select
                    value={formData.currency || "NPR"}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="NPR">NPR (Nepalese Rupee)</option>
                    <option value="INR">INR (Indian Rupee)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Petrol Price</label>
                  <input
                    type="number"
                    placeholder="175"
                    value={formData.petrolPrice || 0}
                    onChange={(e) => setFormData({ ...formData, petrolPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Diesel Price</label>
                  <input
                    type="number"
                    placeholder="160"
                    value={formData.dieselPrice || 0}
                    onChange={(e) => setFormData({ ...formData, dieselPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">EV Rate (/kWh)</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={formData.evRate || 0}
                    onChange={(e) => setFormData({ ...formData, evRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* AMENITIES CHECKBOXES */}
              <div className="space-y-2 pt-1">
                <label className="block text-slate-300 font-bold">Station Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="flex items-center space-x-2 bg-slate-800 p-2 rounded-xl border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.hasEvFastCharger)}
                      onChange={(e) => setFormData({ ...formData, hasEvFastCharger: e.target.checked })}
                      className="rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] font-bold text-slate-200">EV Fast Charger</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-800 p-2 rounded-xl border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.hasRestroom)}
                      onChange={(e) => setFormData({ ...formData, hasRestroom: e.target.checked })}
                      className="rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] font-bold text-slate-200">24/7 Restroom</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-800 p-2 rounded-xl border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.hasConvenienceStore)}
                      onChange={(e) => setFormData({ ...formData, hasConvenienceStore: e.target.checked })}
                      className="rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] font-bold text-slate-200">Mart / Store</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-800 p-2 rounded-xl border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.hasRepairShop)}
                      onChange={(e) => setFormData({ ...formData, hasRepairShop: e.target.checked })}
                      className="rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] font-bold text-slate-200">Repair Shop</span>
                  </label>
                </div>
              </div>

              <div>
                <ImageFileInput
                  label="Upload Fuel Station Photo from Device"
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
                  Save Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
