import React, { useState, useEffect } from 'react';
import { useMemberAuth } from '@/lib/member-auth';
import { cmsStore } from '@/lib/cms-store';
import { HotelEntry } from '@/types/cms';
import {
  Home,
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  CheckCircle2,
  X,
  AlertCircle,
  Eye,
  Camera,
  Coffee,
  Wifi,
  Sparkles,
  Bed,
} from 'lucide-react';

const COMMON_FACILITIES = [
  'WiFi',
  'Hot Shower',
  'Solar Heating',
  'Organic Homecooked Meals',
  'Mountain View',
  'Cultural Hearth / Fireplace',
  'Free Parking',
  'Luggage Storage',
  'Apple Wine Tasting',
  'Guide Arrangement',
];

export default function MemberHomestaysPage() {
  const { member } = useMemberAuth();
  const [hotels, setHotels] = useState<HotelEntry[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Partial<HotelEntry> | null>(null);
  const [photoInput, setPhotoInput] = useState('');

  const loadData = () => {
    if (!member) return;
    setHotels(cmsStore.getHotelsByOwner(member.id));
  };

  useEffect(() => {
    loadData();
    const unsub = cmsStore.subscribe(loadData);
    return unsub;
  }, [member]);

  if (!member) return null;

  const canManage = member.category === 'Home & Homestays' || member.category === 'Combo';

  if (!canManage) {
    return (
      <div className="p-8 text-center rounded-3xl bg-[#0F172A] border border-slate-800">
        <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h2 className="text-lg font-black text-white">Access Restricted</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Your current account is registered under the <strong>{member.category}</strong> category.
          Homestays & Stays management is only available to Home & Homestays or Combo members.
        </p>
      </div>
    );
  }

  const filteredHotels = hotels.filter((h) => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || h.hotelName.toLowerCase().includes(q) || h.location.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || h.availabilityStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingHotel({
      hotelName: '',
      propertyType: 'Homestay',
      contactPerson: member.name,
      phoneNumber: member.phone,
      location: member.address || '',
      latitude: 28.3949,
      longitude: 84.124,
      pricePerNight: 2500,
      currency: 'NPR',
      facilities: ['WiFi', 'Hot Shower', 'Organic Homecooked Meals'],
      checkInTime: '12:00 PM',
      checkOutTime: '11:00 AM',
      hotelPhotos: [
        'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
      availabilityStatus: 'Available',
      partnerStatus: 'Verified Partner',
      approvalStatus: 'Approved',
      createdByName: member.name,
      ownerId: member.id,
      ownerEmail: member.email,
    });
    setPhotoInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (h: HotelEntry) => {
    setEditingHotel({
      ...h,
      facilities: Array.isArray(h.facilities) ? [...h.facilities] : [],
      hotelPhotos: Array.isArray(h.hotelPhotos) ? [...h.hotelPhotos] : h.photos || [],
    });
    setPhotoInput('');
    setIsModalOpen(true);
  };

  const handleToggleFacility = (fac: string) => {
    if (!editingHotel) return;
    const current = editingHotel.facilities || [];
    if (current.includes(fac)) {
      setEditingHotel({ ...editingHotel, facilities: current.filter((f) => f !== fac) });
    } else {
      setEditingHotel({ ...editingHotel, facilities: [...current, fac] });
    }
  };

  const handleAddPhoto = () => {
    const url = photoInput.trim();
    if (!url || !editingHotel) return;
    const photos = editingHotel.hotelPhotos || [];
    setEditingHotel({
      ...editingHotel,
      hotelPhotos: [...photos, url],
      imageUrl: editingHotel.imageUrl || url,
    });
    setPhotoInput('');
  };

  const handleRemovePhoto = (idx: number) => {
    if (!editingHotel) return;
    const photos = [...(editingHotel.hotelPhotos || [])];
    photos.splice(idx, 1);
    setEditingHotel({
      ...editingHotel,
      hotelPhotos: photos,
      imageUrl: photos[0] || '',
    });
  };

  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHotel || !editingHotel.hotelName?.trim()) {
      alert('Please provide property name.');
      return;
    }

    const photos = editingHotel.hotelPhotos || [];
    const imageUrl = editingHotel.imageUrl || photos[0] || 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80';

    await cmsStore.saveHotel({
      ...editingHotel,
      hotelPhotos: photos,
      photos: photos,
      imageUrl: imageUrl,
      ownerId: member.id,
      ownerEmail: member.email,
      createdByName: editingHotel.createdByName || member.name,
    });

    setIsModalOpen(false);
    setEditingHotel(null);
  };

  const handleDeleteHotel = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}"? This action cannot be undone.`)) {
      await cmsStore.deleteHotel(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Home className="w-4 h-4" />
            <span>Homestays & Stays Management</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            My Homestays & Stays
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View, add, and update your homestays, lodges, room pricing, and guest facilities.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-900/30 transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Homestay</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search your homestays..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#182238] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 w-full sm:w-auto"
        >
          <option value="ALL">All Availability Status</option>
          <option value="Available">Available</option>
          <option value="Fully Booked">Fully Booked</option>
          <option value="Seasonal Closure">Seasonal Closure</option>
        </select>
      </div>

      {/* Items list */}
      {filteredHotels.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0F172A] border border-dashed border-slate-800">
          <Home className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Homestay Listings Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You haven't added any homestays yet, or no listing matches your search filter.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition inline-flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Homestay Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((h) => {
            const isAvail = h.availabilityStatus === 'Available';

            return (
              <div
                key={h.id}
                className="rounded-3xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Photo Banner */}
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={
                        h.imageUrl ||
                        h.hotelPhotos?.[0] ||
                        'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={h.hotelName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                        {h.propertyType}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border backdrop-blur-md ${
                          isAvail
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {h.availabilityStatus}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-extrabold text-white tracking-tight line-clamp-1">
                        {h.hotelName}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{h.location}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Nightly Rate: </span>
                        <span className="text-base font-black text-amber-300">
                          {h.currency || 'NPR'} {h.pricePerNight?.toLocaleString() || '2,500'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Check-in: {h.checkInTime || '12 PM'}
                      </span>
                    </div>

                    {/* Facilities chips */}
                    {Array.isArray(h.facilities) && h.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {h.facilities.slice(0, 3).map((f, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-[#182238] text-[10px] text-slate-300 border border-slate-700/60 font-medium"
                          >
                            {f}
                          </span>
                        ))}
                        {h.facilities.length > 3 && (
                          <span className="text-[10px] text-slate-500 self-center">
                            +{h.facilities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                  <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{h.phoneNumber || 'N/A'}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleOpenEditModal(h)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Edit Homestay"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteHotel(h.id, h.hotelName)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
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

      {/* ========================================================
          ADD / EDIT HOMESTAY MODAL
      ======================================================== */}
      {isModalOpen && editingHotel && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingHotel.id ? 'Edit Homestay Details' : 'Add New Homestay Listing'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Save your property details. This listing will be linked to your member ID ({member.id}).
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHotel} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Homestay / Lodge Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annapurna Eco Homestay"
                    value={editingHotel.hotelName || ''}
                    onChange={(e) => setEditingHotel({ ...editingHotel, hotelName: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Property Type
                  </label>
                  <select
                    value={editingHotel.propertyType || 'Homestay'}
                    onChange={(e) => setEditingHotel({ ...editingHotel, propertyType: e.target.value as any })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Homestay">Homestay</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Lodge">Lodge / Teahouse</option>
                    <option value="Resort">Resort</option>
                    <option value="Guest House">Guest House</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Availability Status
                  </label>
                  <select
                    value={editingHotel.availabilityStatus || 'Available'}
                    onChange={(e) => setEditingHotel({ ...editingHotel, availabilityStatus: e.target.value as any })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Available">Available for Guests</option>
                    <option value="Fully Booked">Fully Booked</option>
                    <option value="Seasonal Closure">Seasonal Closure</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Location / Village / District *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ghandruk, Kaski, Nepal"
                    value={editingHotel.location || ''}
                    onChange={(e) => setEditingHotel({ ...editingHotel, location: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Nightly Rate (NPR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="2500"
                    value={editingHotel.pricePerNight ?? 2500}
                    onChange={(e) => setEditingHotel({ ...editingHotel, pricePerNight: Number(e.target.value) })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Contact Host Person
                  </label>
                  <input
                    type="text"
                    value={editingHotel.contactPerson || ''}
                    onChange={(e) => setEditingHotel({ ...editingHotel, contactPerson: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={editingHotel.phoneNumber || ''}
                    onChange={(e) => setEditingHotel({ ...editingHotel, phoneNumber: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Facilities selection */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Select Guest Facilities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMON_FACILITIES.map((fac) => {
                    const isChecked = (editingHotel.facilities || []).includes(fac);
                    return (
                      <button
                        key={fac}
                        type="button"
                        onClick={() => handleToggleFacility(fac)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition border flex items-center justify-between ${
                          isChecked
                            ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                            : 'bg-[#182238] border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{fac}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo URLs */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Photos & Gallery
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL (https://...)"
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
                    className="flex-1 bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                  >
                    Add Photo
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(editingHotel.hotelPhotos || []).map((url, i) => (
                    <div key={i} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-700">
                      <img src={url} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(i)}
                        className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-900/30 transition"
                >
                  {editingHotel.id ? 'Save Changes' : 'Create Homestay Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
