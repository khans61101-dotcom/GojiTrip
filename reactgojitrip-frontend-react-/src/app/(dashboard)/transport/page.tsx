'use client';

import React from 'react';
import { listTransport, createTransport, updateTransport, deleteTransport, TransportRecord } from '@/lib/api';
import { StatusBadge } from '@/components/common/StatusBadge';
import { cmsStore } from '@/lib/cms-store';
import { ImageFileInput } from '@/components/common/ImageFileInput';
import { MultiImageFileInput } from '@/components/common/MultiImageFileInput';
import { Bus, Plus, Search, CheckCircle, XCircle, Phone, MessageSquare, Trash2, Edit, Clock, DollarSign, MapPin } from 'lucide-react';

type TransportForm = {
  id?: number;
  operatorName: string;
  contactPerson: string;
  mobileNumber: string;
  whatsAppNumber: string;
  vehicleType: string;
  vehicleNumber: string;
  seatCapacity: number;
  route: string;
  pickupPoint: string;
  departureTime: string;
  fare: number;
  currency: string;
  luggagePolicy: string;
  driverPhotoUrl: string;
  vehiclePhotos?: string[];
  licenceVerified: boolean;
  activeStatus: string;
  approvalStatus: string;
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
  route: '',
  pickupPoint: '',
  departureTime: '',
  fare: 0,
  currency: 'NPR',
  luggagePolicy: '',
  driverPhotoUrl: '',
  vehiclePhotos: [],
  licenceVerified: false,
  activeStatus: 'Active',
  approvalStatus: 'Draft',
  createdByName: 'Goji Admin',
};

export default function TransportPage() {
  const [items, setItems] = React.useState<TransportRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<TransportForm>(emptyForm);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTransport();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transport records');
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
        return prev.map((item: any) => {
          const match = storeItems.find((s: any) => String(s.id) === String(item.id));
          return match ? { ...item, ...match } : item;
        });
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

  const openEdit = (item: TransportRecord) => {
    setEditing({
      id: item.id,
      operatorName: item.operatorName,
      contactPerson: item.contactPerson || '',
      mobileNumber: item.mobileNumber || '',
      whatsAppNumber: item.whatsAppNumber || '',
      vehicleType: item.vehicleType || 'Jeep',
      vehicleNumber: item.vehicleNumber || '',
      seatCapacity: item.seatCapacity || 0,
      route: item.route || '',
      pickupPoint: item.pickupPoint || '',
      departureTime: item.departureTime || '',
      fare: item.fare || 0,
      currency: item.currency || 'NPR',
      luggagePolicy: item.luggagePolicy || '',
      driverPhotoUrl: item.driverPhotoUrl || '',
      vehiclePhotos: Array.isArray(item.vehiclePhotos) && item.vehiclePhotos.length > 0 ? item.vehiclePhotos : (Array.isArray((item as any).photos) ? (item as any).photos : (item.driverPhotoUrl ? [item.driverPhotoUrl] : [])),
      licenceVerified: item.licenceVerified || false,
      activeStatus: item.activeStatus || 'Active',
      approvalStatus: item.approvalStatus || 'Draft',
      createdByName: item.createdByName || 'Goji Admin',
    });
    setIsModalOpen(true);
  };

  const onDelete = async (id: number) => {
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
    setSaving(true);
    setError(null);
    try {
      const payload = {
        operatorName: editing.operatorName,
        contactPerson: editing.contactPerson,
        mobileNumber: editing.mobileNumber,
        whatsAppNumber: editing.whatsAppNumber,
        vehicleType: editing.vehicleType,
        vehicleNumber: editing.vehicleNumber,
        seatCapacity: Number(editing.seatCapacity),
        route: editing.route,
        pickupPoint: editing.pickupPoint,
        departureTime: editing.departureTime,
        fare: Number(editing.fare),
        currency: editing.currency,
        luggagePolicy: editing.luggagePolicy,
        driverPhotoUrl: editing.driverPhotoUrl || null,
        vehiclePhotos: editing.vehiclePhotos || [],
        licenceVerified: editing.licenceVerified,
        activeStatus: editing.activeStatus,
        approvalStatus: editing.approvalStatus,
        createdByName: editing.createdByName,
      };

      if (editing.id) {
        await updateTransport(editing.id, payload);
        setSuccess('Transport record updated.');
      } else {
        await createTransport(payload);
        setSuccess('Transport record created.');
      }
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
          <p className="text-slate-400 text-xs mt-1">API-backed transport CRUD.</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center space-x-1.5">
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

      {loading ? (
        <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800 text-slate-400">Loading transport records...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800 text-slate-400">
          <Bus className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-semibold">No transport entries found matching filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map(item => (
            <div key={item.id} className="glass-panel rounded-2xl border border-slate-800/90 overflow-hidden flex flex-col justify-between">
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
                  <StatusBadge status={item.approvalStatus as any} entityType="Transport" entityId={String(item.id)} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs border-y border-slate-800/60 py-3">
                  <div><span className="text-slate-400 flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" /> Route:</span><span className="font-semibold text-slate-200 block mt-0.5">{item.route}</span></div>
                  <div><span className="text-slate-400 flex items-center"><DollarSign className="w-3.5 h-3.5 mr-1 text-slate-500" /> Fare / Seat:</span><span className="font-bold text-emerald-400 block mt-0.5">{item.currency} {item.fare.toLocaleString()} ({item.seatCapacity} Seats)</span></div>
                  <div><span className="text-slate-400 flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" /> Pickup Point:</span><span className="font-medium text-slate-300 block mt-0.5">{item.pickupPoint}</span></div>
                  <div><span className="text-slate-400 flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-slate-500" /> Departure Time:</span><span className="font-medium text-slate-300 block mt-0.5">{item.departureTime}</span></div>
                </div>

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
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => onDelete(item.id)} disabled={deletingId === String(item.id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#182238] flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">{editing.id ? 'Edit Transport Entry' : 'Add New Transport Operator'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">×</button>
            </div>
            <form onSubmit={onSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <input value={editing.operatorName} onChange={e => setEditing({ ...editing, operatorName: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Operator name" />
                <input value={editing.contactPerson} onChange={e => setEditing({ ...editing, contactPerson: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Contact person" />
                <input value={editing.mobileNumber} onChange={e => setEditing({ ...editing, mobileNumber: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Mobile number" />
                <input value={editing.whatsAppNumber} onChange={e => setEditing({ ...editing, whatsAppNumber: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="WhatsApp number" />
              </div>
              <div className="grid grid-cols-3 gap-4">
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
                  <label className="block text-slate-300 font-semibold mb-1">Vehicle / Flight No.</label>
                  <input value={editing.vehicleNumber} onChange={e => setEditing({ ...editing, vehicleNumber: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="e.g. BA-1-PA-4567 or YT-402" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Seat Capacity</label>
                  <input type="number" value={editing.seatCapacity} onChange={e => setEditing({ ...editing, seatCapacity: Number(e.target.value) })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Seat capacity" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input value={editing.route} onChange={e => setEditing({ ...editing, route: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Route" />
                <input value={editing.pickupPoint} onChange={e => setEditing({ ...editing, pickupPoint: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Pickup point" />
                <input value={editing.departureTime} onChange={e => setEditing({ ...editing, departureTime: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Departure time" />
                <input type="number" value={editing.fare} onChange={e => setEditing({ ...editing, fare: Number(e.target.value) })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Fare" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input value={editing.currency} onChange={e => setEditing({ ...editing, currency: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Currency" />
                <input value={editing.luggagePolicy} onChange={e => setEditing({ ...editing, luggagePolicy: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Luggage policy" />
              </div>

              {/* DESCRIPTION & VEHICLE AMENITIES */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vehicle & Service Description (Shown on Yelp Detail View)</label>
                <textarea
                  rows={2}
                  value={(editing as any).description || ""}
                  onChange={e => setEditing({ ...editing, description: e.target.value } as any)}
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  placeholder="Reliable passenger transport, mountain terrain driving, licensed driver..."
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vehicle Amenities & Services (comma separated)</label>
                <input
                  type="text"
                  value={((editing as any).amenities || ["AC Vehicle", "Reclining Seats", "Luggage Storage", "GPS Tracking", "Verified Driver"]).join(", ")}
                  onChange={e => setEditing({ ...editing, amenities: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } as any)}
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  placeholder="AC Vehicle, Reclining Seats, Luggage Storage, GPS Tracking, Verified Driver"
                />
              </div>
              {/* =============== DRIVER & VEHICLE PHOTO FILE UPLOAD =============== */}
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
                  images={editing.vehiclePhotos || (editing as any).photos || []}
                  onChange={(photos) => setEditing({ ...editing, vehiclePhotos: photos, photos: photos } as any)}
                  category="Transport"
                  maxImages={10}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center gap-2 text-slate-300"><input type="checkbox" checked={editing.licenceVerified} onChange={e => setEditing({ ...editing, licenceVerified: e.target.checked })} /> Licence verified</label>
                <input value={editing.activeStatus} onChange={e => setEditing({ ...editing, activeStatus: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Active status" />
                <input value={editing.approvalStatus} onChange={e => setEditing({ ...editing, approvalStatus: e.target.value })} className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Approval status" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200">Cancel</button>
                <button disabled={saving} type="submit" className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold">{saving ? 'Saving...' : 'Save Transport'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
