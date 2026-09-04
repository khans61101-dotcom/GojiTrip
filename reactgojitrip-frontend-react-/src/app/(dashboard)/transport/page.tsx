'use client';

import React from 'react';
import { listTransport, deleteTransport, TransportRecord } from '@/lib/api';
import { StatusBadge } from '@/components/common/StatusBadge';
import { cmsStore } from '@/lib/cms-store';
import { ImageFileInput, validateImagePayloads } from '@/components/common/ImageFileInput';
import { MultiImageFileInput } from '@/components/common/MultiImageFileInput';
import { TagInputSection } from '@/components/common/TagInputSection';
import { Bus, Plus, Search, CheckCircle, XCircle, Phone, MessageSquare, Trash2, Edit, Clock, DollarSign, MapPin, ShieldCheck, UserCheck, Tag, Info } from 'lucide-react';
import { MultiMarkerMap } from '@/components/common/MultiMarkerMap';

type TransportForm = {
  id?: number | string;
  operatorName: string;
  contactPerson: string;
  mobileNumber: string;
  whatsAppNumber: string;
  vehicleType: string;
  vehicleNumber: string;
  seatCapacity: number;
  from: string;
  to: string;
  route: string;
  pickupPoint: string;
  dropPoint: string;
  departureTime: string;
  arrivalTime: string;
  fare: number;
  currency: string;
  luggagePolicy: string;
  driverPhotoUrl: string;
  vehiclePhotos: string[];
  vehicleAmenities: string[];
  driverLicense: string;
  licenceVerified: boolean;
  activeStatus: string;
  approvalStatus: string;
  description: string;
  createdByName: string;
};

const emptyForm: TransportForm = {
  operatorName: '',
  contactPerson: '',
  mobileNumber: '',
  whatsAppNumber: '',
  vehicleType: 'Jeep',
  vehicleNumber: '',
  seatCapacity: 7,
  from: 'Kathmandu',
  to: 'Pokhara',
  route: 'Kathmandu ➔ Pokhara',
  pickupPoint: 'Kalanki Bus Terminal',
  dropPoint: 'Lakeside Tourist Bus Station',
  departureTime: '07:00 AM',
  arrivalTime: '~6.5 Hours',
  fare: 1500,
  currency: 'NPR',
  luggagePolicy: '1 Main Bag (up to 20kg) + 1 Handpack',
  driverPhotoUrl: '',
  vehiclePhotos: [],
  vehicleAmenities: ["AC Vehicle", "Reclining Seats", "Luggage Storage", "GPS Tracking", "Verified Driver"],
  driverLicense: '',
  licenceVerified: true,
  activeStatus: 'Active',
  approvalStatus: 'Draft',
  description: '',
  createdByName: 'Goji Admin',
};

export default function TransportPage() {
  const [items, setItems] = React.useState<TransportRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLocation, setSelectedLocation] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | number>('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<TransportForm>(emptyForm);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTransport().catch(() => []);
      const storeItems = cmsStore.getTransports();
      const mapped = (Array.isArray(data) ? data : []).map((item: any) => {
        const match = storeItems.find((s: any) => String(s.id) === String(item.id));
        return match ? { ...item, ...match } : item;
      });

      storeItems.forEach((st: any) => {
        if (!mapped.some((m: any) => String(m.id) === String(st.id))) {
          mapped.unshift(st as any);
        }
      });

      setItems(mapped.length > 0 ? mapped : (storeItems as any));
    } catch (err) {
      setItems(cmsStore.getTransports() as any);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
    const unsubscribe = cmsStore.subscribe(() => {
      const storeItems = cmsStore.getTransports();
      setItems((prev: any) => {
        if (!Array.isArray(prev) || prev.length === 0) return storeItems as any;
        const updated = [...prev];
        storeItems.forEach((st: any) => {
          const idx = updated.findIndex((p: any) => String(p.id) === String(st.id));
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], ...st };
          } else {
            updated.unshift(st);
          }
        });
        return updated;
      });
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [load]);

  const openCreate = () => {
    setEditing(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    const routeStr = item.route || item.pickupPoint || '';
    let fromVal = (item as any).from || '';
    let toVal = (item as any).to || '';
    if (!fromVal && routeStr.includes('➔')) {
      const parts = routeStr.split('➔');
      fromVal = parts[0].trim();
      toVal = parts[1].trim();
    } else if (!fromVal && routeStr.includes('->')) {
      const parts = routeStr.split('->');
      fromVal = parts[0].trim();
      toVal = parts[1].trim();
    }

    const amenities = (Array.isArray(item.vehicleAmenities))
      ? item.vehicleAmenities
      : (Array.isArray(item.vehicle_amenities))
      ? item.vehicle_amenities
      : (Array.isArray((item as any).amenities))
      ? (item as any).amenities
      : (typeof item.vehicleAmenities === "string" && item.vehicleAmenities ? item.vehicleAmenities.split(",").map((s: string) => s.trim()).filter(Boolean) : []);

    const driverLicense = item.driverLicense || (item as any).driver_license || (item as any).licenseNumber || (item as any).licenceNumber || '';

    setEditing({
      id: item.id,
      operatorName: item.operatorName || '',
      contactPerson: item.contactPerson || item.driverName || '',
      mobileNumber: item.mobileNumber || '',
      whatsAppNumber: item.whatsAppNumber || '',
      vehicleType: item.vehicleType || 'Jeep',
      vehicleNumber: item.vehicleNumber || '',
      seatCapacity: Number(item.seatCapacity) || 7,
      from: fromVal || 'Kathmandu',
      to: toVal || 'Pokhara',
      route: item.route || `${fromVal || 'Kathmandu'} ➔ ${toVal || 'Pokhara'}`,
      pickupPoint: item.pickupPoint || '',
      dropPoint: (item as any).dropPoint || '',
      departureTime: item.departureTime || '',
      arrivalTime: (item as any).arrivalTime || (item as any).duration || '',
      fare: Number(item.fare) || 0,
      currency: item.currency || 'NPR',
      luggagePolicy: item.luggagePolicy || '',
      driverPhotoUrl: item.driverPhotoUrl || (item.vehiclePhotos && item.vehiclePhotos[0]) || '',
      vehiclePhotos: Array.isArray(item.vehiclePhotos) && item.vehiclePhotos.length > 0 ? item.vehiclePhotos : (Array.isArray((item as any).photos) ? (item as any).photos : []),
      vehicleAmenities: amenities,
      driverLicense: driverLicense,
      licenceVerified: item.licenceVerified ?? true,
      activeStatus: item.activeStatus || 'Active',
      approvalStatus: item.approvalStatus || 'Draft',
      description: item.description || (item as any).notes || '',
      createdByName: item.createdByName || 'Goji Admin',
    });
    setIsModalOpen(true);
  };

  const onDelete = async (id: number | string) => {
    if (!confirm('Delete this transport operator record?')) return;
    setDeletingId(String(id));
    setError(null);
    try {
      await deleteTransport(id);
      setSuccess('Transport record deleted.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transport record');
    } finally {
      setDeletingId(null);
    }
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const imageCheck = validateImagePayloads([(editing as any).imageUrl]);
    if (!imageCheck.valid) {
      alert(imageCheck.errorMsg);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const routeCombined = editing.from && editing.to ? `${editing.from.trim()} ➔ ${editing.to.trim()}` : editing.route;

      const payload = {
        operatorName: editing.operatorName,
        contactPerson: editing.contactPerson,
        mobileNumber: editing.mobileNumber,
        whatsAppNumber: editing.whatsAppNumber,
        vehicleType: editing.vehicleType,
        vehicleNumber: editing.vehicleNumber,
        seatCapacity: Number(editing.seatCapacity),
        from: editing.from,
        to: editing.to,
        route: routeCombined,
        pickupPoint: editing.pickupPoint,
        dropPoint: editing.dropPoint,
        departureTime: editing.departureTime,
        arrivalTime: editing.arrivalTime,
        fare: Number(editing.fare),
        currency: editing.currency,
        luggagePolicy: editing.luggagePolicy,
        driverPhotoUrl: editing.driverPhotoUrl || null,
        vehiclePhotos: editing.vehiclePhotos || [],
        vehicleAmenities: editing.vehicleAmenities || [],
        vehicle_amenities: editing.vehicleAmenities || [],
        amenities: editing.vehicleAmenities || [],
        driverLicense: editing.driverLicense || '',
        driver_license: editing.driverLicense || '',
        licenseNumber: editing.driverLicense || '',
        licenceVerified: editing.licenceVerified,
        activeStatus: editing.activeStatus,
        approvalStatus: editing.approvalStatus,
        description: editing.description,
        createdByName: editing.createdByName,
      };

      await cmsStore.saveTransport({
        id: editing.id ? String(editing.id) : undefined,
        ...payload,
      } as any);

      setSuccess(editing.id ? 'Transport operator updated successfully.' : 'Transport operator created successfully.');
      setIsModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transport record');
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter(item => {
    const matchesSearch =
      item.operatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.approvalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Bus className="w-4 h-4" />
            <span>Vehicle & Operator Database</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Transport Module</h1>
          <p className="text-slate-400 text-xs mt-1">Manage vehicles, transport operators, routes, fare pricing, and onboard services.</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all">
          <Plus className="w-4 h-4" />
          <span>Add New Transport Operator</span>
        </button>
      </div>

      {(error || success) && (
        <div className={`p-3 rounded-xl text-xs border ${error ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
          {error || success}
        </div>
      )}

      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by operator, route, plate no..." className="w-full bg-[#182238] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white" />
        </div>
        <div className="flex items-center space-x-1 bg-[#182238] border border-slate-700/80 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {['ALL', 'Draft', 'Under Review', 'Approved', 'Published'].map(st => (
            <button key={st} onClick={() => setStatusFilter(st)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${statusFilter === st ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}>
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 2-COLUMN LIST LEFT + MAP RIGHT */}
      {loading ? (
        <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800 text-slate-400">Loading transport records...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LIST (LEFT 7 COLS) */}
          <div className="lg:col-span-7 space-y-4">
            {filtered.length === 0 ? (
              <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800 text-slate-400">
                <Bus className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                <p className="text-sm font-semibold">No transport entries found matching filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(item => (
                  <div
                    key={item.id}
                    onMouseEnter={() => setSelectedId(item.id)}
                    onClick={() => setSelectedId(item.id)}
                    className={`glass-panel rounded-2xl border overflow-hidden flex flex-col justify-between transition-all cursor-pointer ${
                      selectedId && String(selectedId) === String(item.id)
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10"
                        : "border-slate-800/90 hover:border-emerald-500/60"
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">{item.vehicleType}</span>
                            <span className="text-xs font-mono font-bold text-slate-300">{item.vehicleNumber}</span>
                            {item.licenceVerified ? <span className="text-[10px] font-semibold text-emerald-400 flex items-center"><CheckCircle className="w-3 h-3 mr-0.5" /> Licence Verified</span> : <span className="text-[10px] font-semibold text-amber-400 flex items-center"><XCircle className="w-3 h-3 mr-0.5" /> Unverified</span>}
                          </div>
                          <h3 className="text-base font-bold text-white mt-1.5">{item.operatorName}</h3>
                        </div>
                        <StatusBadge status={(item.approvalStatus || 'Draft') as any} interactive={false} />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs border-y border-slate-800/60 py-3">
                        <div><span className="text-slate-400 flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" /> Route:</span><span className="font-semibold text-slate-200 block mt-0.5">{item.route}</span></div>
                        <div><span className="text-slate-400 flex items-center"><DollarSign className="w-3.5 h-3.5 mr-1 text-slate-500" /> Fare / Seat:</span><span className="font-bold text-emerald-400 block mt-0.5">{item.currency} {item.fare.toLocaleString()} ({item.seatCapacity} Seats)</span></div>
                        <div><span className="text-slate-400 flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" /> Pickup Point:</span><span className="font-medium text-slate-300 block mt-0.5">{item.pickupPoint}</span></div>
                        <div><span className="text-slate-400 flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-slate-500" /> Departure Time:</span><span className="font-medium text-slate-300 block mt-0.5">{item.departureTime}</span></div>
                      </div>

                      {/* AMENITIES BADGES */}
                      {Array.isArray((item as any).vehicleAmenities) && (item as any).vehicleAmenities.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(item as any).vehicleAmenities.map((am: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-medium rounded-full">
                              ✨ {am}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap items-center justify-between text-xs gap-2">
                        <div className="flex items-center space-x-3 text-slate-300">
                          <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1 text-emerald-400" /> {item.mobileNumber}</span>
                          {item.whatsAppNumber && <span className="flex items-center text-emerald-400"><MessageSquare className="w-3.5 h-3.5 mr-1" /> WhatsApp</span>}
                        </div>
                        <span className="text-slate-400 text-[11px]">Luggage: {item.luggagePolicy}</span>
                      </div>
                    </div>
                    <div className="px-5 py-3 bg-[#131C30] border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Added by {item.createdByName}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(item);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 text-xs px-2.5 py-1"
                        >
                          <Edit className="w-3.5 h-3.5 text-emerald-400" /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                          }}
                          disabled={deletingId === String(item.id)}
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
          </div>

          {/* MULTI-MARKER PLOTTED MAP (RIGHT 5 COLS) */}
          <div className="lg:col-span-5">
            <MultiMarkerMap
              items={filtered.map((item) => ({
                id: item.id,
                title: item.operatorName,
                location: item.pickupPoint || item.route,
                category: item.vehicleType,
                imageUrl: item.driverPhotoUrl,
              }))}
              selectedId={selectedId}
              onItemSelect={(item) => setSelectedId(item.id)}
              title="Transport & Route Map View"
            />
          </div>
        </div>
      )}

      {/* ===================== ADD / EDIT TRANSPORT MODAL ===================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#182238] flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Bus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base text-white">{editing.id ? 'Edit Transport Entry' : 'Add New Transport Operator'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xl font-bold">×</button>
            </div>
            
            <form onSubmit={onSave} className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* SECTION 1: OPERATOR & DRIVER CONTACT */}
              <div className="space-y-3 bg-[#131C30] p-4 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <UserCheck className="w-4 h-4" />
                  <span>1. OPERATOR & DRIVER INFORMATION</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Transport / Company Name *</label>
                    <input required value={editing.operatorName} onChange={e => setEditing({ ...editing, operatorName: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500" placeholder="e.g. Annapurna Super Express 4x4" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Driver / Contact Person *</label>
                    <input required value={editing.contactPerson} onChange={e => setEditing({ ...editing, contactPerson: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500" placeholder="e.g. Pasang Sherpa" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Mobile / Emergency Phone *</label>
                    <input required value={editing.mobileNumber} onChange={e => setEditing({ ...editing, mobileNumber: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="e.g. +977-9856012345" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">WhatsApp Booking Number</label>
                    <input value={editing.whatsAppNumber} onChange={e => setEditing({ ...editing, whatsAppNumber: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="e.g. +977-9856012345" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Driver License / Verification ID</label>
                    <input value={editing.driverLicense} onChange={e => setEditing({ ...editing, driverLicense: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="e.g. NP-DL-889102" />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 text-emerald-400 font-semibold cursor-pointer">
                      <input type="checkbox" checked={editing.licenceVerified} onChange={e => setEditing({ ...editing, licenceVerified: e.target.checked })} className="w-4 h-4 rounded accent-emerald-500" />
                      <span>Licence & Operator Verified</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 2: VEHICLE CATEGORY & CAPACITY */}
              <div className="space-y-3 bg-[#131C30] p-4 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <Bus className="w-4 h-4" />
                  <span>2. VEHICLE CATEGORY & FLEET DETAILS</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Vehicle Category *</label>
                    <select
                      value={editing.vehicleType || "Jeep"}
                      onChange={(e) => setEditing({ ...editing, vehicleType: e.target.value })}
                      className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Plane">✈️ Plane / Flight / Airline</option>
                      <option value="Ship">🚢 Ship / Ferry / Boat / Cruise</option>
                      <option value="Jeep">🚙 Jeep / Scorpio / 4x4 SUV</option>
                      <option value="Car">🚗 Car / Taxi / Sedan</option>
                      <option value="Bus">🚌 Bus / Tourist Coach</option>
                      <option value="Hiace">🚐 Hiace / Van / Minibus</option>
                      <option value="Bike">🏍️ Bike / Scooter / Motorcycle</option>
                      <option value="Train">🚆 Train / Rail</option>
                      <option value="Other">🚐 Other Vehicle</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Plate / Registration No. *</label>
                    <input required value={editing.vehicleNumber} onChange={e => setEditing({ ...editing, vehicleNumber: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" placeholder="e.g. GA-2-CHA-8891" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Seat Capacity *</label>
                    <input type="number" min={1} max={500} required value={editing.seatCapacity} onChange={e => setEditing({ ...editing, seatCapacity: Number(e.target.value) })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Seat capacity" />
                  </div>
                </div>
              </div>

              {/* SECTION 3: ROUTE & TIMINGS */}
              <div className="space-y-3 bg-[#131C30] p-4 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <MapPin className="w-4 h-4" />
                  <span>3. ROUTE CORRIDOR & TIMINGS</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Departure City (From) *</label>
                    <input required value={editing.from} onChange={e => setEditing({ ...editing, from: e.target.value, route: `${e.target.value} ➔ ${editing.to}` })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="e.g. Kathmandu" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Destination City (To) *</label>
                    <input required value={editing.to} onChange={e => setEditing({ ...editing, to: e.target.value, route: `${editing.from} ➔ ${e.target.value}` })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="e.g. Pokhara" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Pickup Location / Terminal</label>
                    <input value={editing.pickupPoint} onChange={e => setEditing({ ...editing, pickupPoint: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="e.g. Kalanki Bus Terminal" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Drop Off Station / Terminal</label>
                    <input value={editing.dropPoint} onChange={e => setEditing({ ...editing, dropPoint: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="e.g. Lakeside Tourist Bus Stand" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Departure Schedule / Time *</label>
                    <input required value={editing.departureTime} onChange={e => setEditing({ ...editing, departureTime: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="e.g. 06:30 AM Daily" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Travel Duration / Arrival Time</label>
                    <input value={editing.arrivalTime} onChange={e => setEditing({ ...editing, arrivalTime: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="e.g. ~6.5 Hours or 01:00 PM" />
                  </div>
                </div>
              </div>

              {/* SECTION 4: FARE & LUGGAGE POLICY */}
              <div className="space-y-3 bg-[#131C30] p-4 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <DollarSign className="w-4 h-4" />
                  <span>4. FARE PRICING & LUGGAGE POLICY</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Ticket Fare / Seat Price *</label>
                    <input type="number" min={0} required value={editing.fare} onChange={e => setEditing({ ...editing, fare: Number(e.target.value) })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold" placeholder="Fare amount" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Currency *</label>
                    <select value={editing.currency} onChange={e => setEditing({ ...editing, currency: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold">
                      <option value="NPR">NPR (Nepalese Rupee)</option>
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (Indian Rupee)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Luggage & Carry-on Policy</label>
                    <input value={editing.luggagePolicy} onChange={e => setEditing({ ...editing, luggagePolicy: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="e.g. Max 20kg main bag + 1 daypack" />
                  </div>
                </div>
              </div>

              {/* SECTION 5: DESCRIPTION */}
              <div className="space-y-2 bg-[#131C30] p-4 rounded-xl border border-slate-800">
                <label className="block text-slate-300 font-semibold mb-1">Vehicle & Service Description (Shown on Yelp Detail View)</label>
                <textarea
                  rows={3}
                  value={editing.description}
                  onChange={e => setEditing({ ...editing, description: e.target.value })}
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  placeholder="Reliable passenger transport service with experienced mountain terrain drivers..."
                />
              </div>

              {/* SECTION 6: VEHICLE AMENITIES TAG CHIP BOXES */}
              <div className="bg-[#131C30] p-4 rounded-xl border border-slate-800">
                <TagInputSection
                  label="Vehicle Amenities & Onboard Services"
                  placeholder="Type amenity (e.g. AC Vehicle) & press Enter or comma..."
                  value={editing.vehicleAmenities || []}
                  onChange={(tags) =>
                    setEditing((prev) => ({
                      ...prev,
                      vehicleAmenities: tags,
                    }))
                  }
                  suggestions={[
                    "AC Vehicle",
                    "Reclining Seats",
                    "Luggage Storage",
                    "GPS Tracking",
                    "Verified Driver",
                    "Wi-Fi Onboard",
                    "Charging Ports",
                    "Water Bottle",
                    "First Aid Kit",
                  ]}
                />
              </div>

              {/* SECTION 7: DRIVER & VEHICLE GALLERY UPLOADS */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <ImageFileInput
                  label="Driver / Main Vehicle Cover Photo (Select File from Computer)"
                  value={editing.driverPhotoUrl || ""}
                  onChange={(url) => setEditing({ ...editing, driverPhotoUrl: url })}
                  onClear={() => setEditing({ ...editing, driverPhotoUrl: "" })}
                  category="Transport"
                />

                <MultiImageFileInput
                  label="Vehicle Fleet Gallery (Add Multiple Photos for Yelp Detail View)"
                  images={editing.vehiclePhotos || []}
                  onChange={(photos) => setEditing({ ...editing, vehiclePhotos: photos })}
                  category="Transport"
                  maxImages={10}
                />
              </div>

              {/* SECTION 8: STATUS & PUBLISHING */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#131C30] p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Active Status</label>
                  <select value={editing.activeStatus} onChange={e => setEditing({ ...editing, activeStatus: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Maintenance">Under Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Approval Status</label>
                  <select value={editing.approvalStatus} onChange={e => setEditing({ ...editing, approvalStatus: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold">
                    <option value="Draft">Draft</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold">Cancel</button>
                <button disabled={saving} type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/20">
                  {saving ? 'Saving...' : 'Save Transport Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
