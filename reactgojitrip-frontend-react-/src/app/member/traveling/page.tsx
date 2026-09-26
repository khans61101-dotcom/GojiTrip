import React, { useState, useEffect } from 'react';
import { useMemberAuth } from '@/lib/member-auth';
import { cmsStore } from '@/lib/cms-store';
import { TransportEntry } from '@/types/cms';
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  CheckCircle2,
  X,
  AlertCircle,
  Clock,
  ShieldCheck,
  Users,
} from 'lucide-react';

const COMMON_AMENITIES = [
  'Air Conditioning (AC)',
  '4x4 All Wheel Drive',
  'Luggage Carrier On Roof',
  'Onboard WiFi',
  'USB Fast Charging Ports',
  'First Aid Kit',
  'Emergency Oxygen Tank',
  'Music & Entertainment System',
];

export default function MemberTravelingPage() {
  const { member } = useMemberAuth();
  const [transports, setTransports] = useState<TransportEntry[]>([]);
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransport, setEditingTransport] = useState<Partial<TransportEntry> | null>(null);
  const [photoInput, setPhotoInput] = useState('');

  const loadData = () => {
    if (!member) return;
    setTransports(cmsStore.getTransportsByOwner(member.id));
  };

  useEffect(() => {
    loadData();
    const unsub = cmsStore.subscribe(loadData);
    return unsub;
  }, [member]);

  if (!member) return null;

  const canManage = member.category === 'Traveling' || member.category === 'Combo';

  if (!canManage) {
    return (
      <div className="p-8 text-center rounded-3xl bg-[#0F172A] border border-slate-800">
        <AlertCircle className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
        <h2 className="text-lg font-black text-white">Access Restricted</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Your current account is registered under the <strong>{member.category}</strong> category.
          Traveling & Fleet management is only available to Traveling or Combo members.
        </p>
      </div>
    );
  }

  const filteredTransports = transports.filter((t) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.operatorName.toLowerCase().includes(q) ||
      t.route.toLowerCase().includes(q) ||
      (t.vehicleNumber && t.vehicleNumber.toLowerCase().includes(q));
    const matchesType = vehicleFilter === 'ALL' || t.vehicleType === vehicleFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenAddModal = () => {
    setEditingTransport({
      operatorName: member.businessName,
      contactPerson: member.name,
      mobileNumber: member.phone,
      whatsAppNumber: member.phone,
      vehicleType: 'Jeep',
      vehicleNumber: 'Ba Pro 01-028-Cha 1234',
      seatCapacity: 7,
      route: 'Pokhara → Muktinath (via Jomsom)',
      pickupPoint: 'Baglung Bus Park, Pokhara',
      departureTime: '06:30 AM Daily',
      fare: 2500,
      currency: 'NPR',
      luggagePolicy: 'Max 20kg main bag + 1 daypack per seat',
      vehiclePhotos: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      ],
      driverPhotoUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      vehicleAmenities: ['4x4 All Wheel Drive', 'Luggage Carrier On Roof'],
      licenceVerified: true,
      activeStatus: 'Active',
      approvalStatus: 'Approved',
      createdByName: member.name,
      ownerId: member.id,
      ownerEmail: member.email,
    });
    setPhotoInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: TransportEntry) => {
    setEditingTransport({
      ...t,
      vehiclePhotos: Array.isArray(t.vehiclePhotos) ? [...t.vehiclePhotos] : [],
      vehicleAmenities: Array.isArray(t.vehicleAmenities) ? [...t.vehicleAmenities] : [],
    });
    setPhotoInput('');
    setIsModalOpen(true);
  };

  const handleToggleAmenity = (amenity: string) => {
    if (!editingTransport) return;
    const current = editingTransport.vehicleAmenities || [];
    if (current.includes(amenity)) {
      setEditingTransport({
        ...editingTransport,
        vehicleAmenities: current.filter((a) => a !== amenity),
      });
    } else {
      setEditingTransport({
        ...editingTransport,
        vehicleAmenities: [...current, amenity],
      });
    }
  };

  const handleAddPhoto = () => {
    const url = photoInput.trim();
    if (!url || !editingTransport) return;
    const photos = editingTransport.vehiclePhotos || [];
    setEditingTransport({
      ...editingTransport,
      vehiclePhotos: [...photos, url],
      driverPhotoUrl: editingTransport.driverPhotoUrl || url,
    });
    setPhotoInput('');
  };

  const handleRemovePhoto = (idx: number) => {
    if (!editingTransport) return;
    const photos = [...(editingTransport.vehiclePhotos || [])];
    photos.splice(idx, 1);
    setEditingTransport({
      ...editingTransport,
      vehiclePhotos: photos,
      driverPhotoUrl: photos[0] || '',
    });
  };

  const handleSaveTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransport || !editingTransport.operatorName?.trim()) {
      alert('Please provide operator or fleet name.');
      return;
    }

    const photos = editingTransport.vehiclePhotos || [];
    const mainPhoto = editingTransport.driverPhotoUrl || photos[0] || '';

    await cmsStore.saveTransport({
      ...editingTransport,
      vehiclePhotos: photos,
      driverPhotoUrl: mainPhoto,
      ownerId: member.id,
      ownerEmail: member.email,
      createdByName: editingTransport.createdByName || member.name,
    });

    setIsModalOpen(false);
    setEditingTransport(null);
  };

  const handleDeleteTransport = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove vehicle "${name}"? This action cannot be undone.`)) {
      await cmsStore.deleteTransport(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Truck className="w-4 h-4" />
            <span>Traveling & Fleet Management</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            My Vehicles & Travel Routes
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your 4x4 Jeeps, EV shuttles, passenger fares, route stops, and seat timetables.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-black text-xs shadow-lg shadow-cyan-900/30 transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle / Route</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search operator, route, plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#182238] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
        >
          <option value="ALL">All Vehicle Types</option>
          <option value="Jeep">Jeep (4x4)</option>
          <option value="EV">Electric Vehicle (EV)</option>
          <option value="Scorpio">Scorpio SUV</option>
          <option value="Bus">Tourist Bus</option>
          <option value="HiAce">HiAce Van</option>
        </select>
      </div>

      {/* Items list */}
      {filteredTransports.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0F172A] border border-dashed border-slate-800">
          <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Transport Units Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You haven't listed any vehicles or routes yet, or none match your filter.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs transition inline-flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTransports.map((t) => {
            const isActive = t.activeStatus === 'Active';

            return (
              <div
                key={t.id}
                className="rounded-3xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Photo Banner */}
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={
                        t.driverPhotoUrl ||
                        t.vehiclePhotos?.[0] ||
                        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={t.operatorName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-cyan-500/30">
                        {t.vehicleType}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-300 text-[10px] font-semibold border border-slate-700">
                        {t.seatCapacity} Seats
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border backdrop-blur-md ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-700/60 text-slate-400 border-slate-600'
                        }`}
                      >
                        {t.activeStatus}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-extrabold text-white tracking-tight line-clamp-1">
                        {t.operatorName}
                      </h3>
                      <p className="text-xs text-slate-300 font-semibold mt-1 line-clamp-1">
                        {t.route}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Plate: {t.vehicleNumber || 'N/A'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Seat Fare: </span>
                        <span className="text-base font-black text-cyan-300">
                          {t.currency || 'NPR'} {t.fare.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{t.departureTime || 'Daily'}</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">Pickup: {t.pickupPoint}</span>
                    </div>

                    {/* Amenities chips */}
                    {Array.isArray(t.vehicleAmenities) && t.vehicleAmenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {t.vehicleAmenities.slice(0, 3).map((a, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-[#182238] text-[10px] text-slate-300 border border-slate-700/60 font-medium"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                  <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{t.mobileNumber || 'N/A'}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleOpenEditModal(t)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Edit Vehicle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTransport(t.id, t.operatorName)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                      title="Delete Vehicle"
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
          ADD / EDIT TRANSPORT MODAL
      ======================================================== */}
      {isModalOpen && editingTransport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingTransport.id ? 'Edit Vehicle / Transport' : 'List New Vehicle / Route'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Save your fleet details. This unit will be linked to your member ID ({member.id}).
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransport} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Operator / Fleet Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annapurna Super 4x4 Fleet"
                    value={editingTransport.operatorName || ''}
                    onChange={(e) => setEditingTransport({ ...editingTransport, operatorName: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Vehicle Type
                  </label>
                  <select
                    value={editingTransport.vehicleType || 'Jeep'}
                    onChange={(e) => setEditingTransport({ ...editingTransport, vehicleType: e.target.value as any })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Jeep">Jeep (4x4)</option>
                    <option value="EV">Electric Vehicle (EV)</option>
                    <option value="Scorpio">Scorpio SUV</option>
                    <option value="Bus">Tourist Bus</option>
                    <option value="HiAce">HiAce Van</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Vehicle Number Plate *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ga 2 Cha 8891"
                    value={editingTransport.vehicleNumber || ''}
                    onChange={(e) => setEditingTransport({ ...editingTransport, vehicleNumber: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Passenger Seat Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={editingTransport.seatCapacity ?? 7}
                    onChange={(e) => setEditingTransport({ ...editingTransport, seatCapacity: Number(e.target.value) })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Operating Route *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pokhara → Muktinath (via Jomsom)"
                    value={editingTransport.route || ''}
                    onChange={(e) => setEditingTransport({ ...editingTransport, route: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Pickup Hub / Point
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Baglung Bus Park, Pokhara"
                    value={editingTransport.pickupPoint || ''}
                    onChange={(e) => setEditingTransport({ ...editingTransport, pickupPoint: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Departure Timetable
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 06:30 AM Daily"
                    value={editingTransport.departureTime || ''}
                    onChange={(e) => setEditingTransport({ ...editingTransport, departureTime: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Ticket Fare per Seat (NPR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="2500"
                    value={editingTransport.fare ?? 2500}
                    onChange={(e) => setEditingTransport({ ...editingTransport, fare: Number(e.target.value) })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Booking Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={editingTransport.mobileNumber || ''}
                    onChange={(e) => setEditingTransport({ ...editingTransport, mobileNumber: e.target.value, whatsAppNumber: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Vehicle Amenities & Specs
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COMMON_AMENITIES.map((am) => {
                    const isChecked = (editingTransport.vehicleAmenities || []).includes(am);
                    return (
                      <button
                        key={am}
                        type="button"
                        onClick={() => handleToggleAmenity(am)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition border flex items-center justify-between ${
                          isChecked
                            ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                            : 'bg-[#182238] border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{am}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo URLs */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Vehicle Photos
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL (https://...)"
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
                    className="flex-1 bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
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
                  {(editingTransport.vehiclePhotos || []).map((url, i) => (
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-black text-xs shadow-lg shadow-cyan-900/30 transition"
                >
                  {editingTransport.id ? 'Save Changes' : 'Create Transport Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
