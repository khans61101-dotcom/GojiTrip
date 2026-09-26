import React, { useState, useEffect } from 'react';
import { useMemberAuth } from '@/lib/member-auth';
import { cmsStore } from '@/lib/cms-store';
import { RestaurantEntry } from '@/types/cms';
import {
  UtensilsCrossed,
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
  Flame,
} from 'lucide-react';

const COMMON_CUISINES = [
  'Thakali Bhanchha',
  'Nepali Organic & Dal Bhat',
  'Bakery & Coffee',
  'Himalayan & Tibetan (Momos, Thukpa)',
  'Highway Dhaba & Snacks',
  'Continental & Breakfast',
  'Indian',
  'Fresh Local Fish',
];

export default function MemberRestaurantsPage() {
  const { member } = useMemberAuth();
  const [restaurants, setRestaurants] = useState<RestaurantEntry[]>([]);
  const [search, setSearch] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Partial<RestaurantEntry> | null>(null);
  const [photoInput, setPhotoInput] = useState('');
  const [dishInput, setDishInput] = useState('');

  const loadData = () => {
    if (!member) return;
    setRestaurants(cmsStore.getRestaurantsByOwner(member.id));
  };

  useEffect(() => {
    loadData();
    const unsub = cmsStore.subscribe(loadData);
    return unsub;
  }, [member]);

  if (!member) return null;

  const canManage = member.category === 'Restaurant' || member.category === 'Combo';

  if (!canManage) {
    return (
      <div className="p-8 text-center rounded-3xl bg-[#0F172A] border border-slate-800">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-black text-white">Access Restricted</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Your current account is registered under the <strong>{member.category}</strong> category.
          Restaurant & Dining management is only available to Restaurant or Combo members.
        </p>
      </div>
    );
  }

  const filteredRestaurants = restaurants.filter((r) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.restaurantName.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q);
    const matchesCuisine =
      cuisineFilter === 'ALL' ||
      (Array.isArray(r.cuisineTypes) && r.cuisineTypes.some((c) => c.toLowerCase().includes(cuisineFilter.toLowerCase())));
    return matchesSearch && matchesCuisine;
  });

  const handleOpenAddModal = () => {
    setEditingRestaurant({
      restaurantName: member.businessName,
      location: member.address || '',
      contactDetails: member.phone,
      cuisineTypes: ['Thakali Bhanchha', 'Nepali Organic & Dal Bhat'],
      openingHours: '06:30 AM - 09:30 PM',
      priceRange: 'NPR NPR',
      averageMealPrice: 650,
      currency: 'NPR',
      recommendedDishes: ['Authentic Mustang Thakali Thali', 'Jimbu Fried Potato', 'Local Apple Pie'],
      photos: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      approvalStatus: 'Approved',
      createdByName: member.name,
      ownerId: member.id,
      ownerEmail: member.email,
    });
    setPhotoInput('');
    setDishInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (r: RestaurantEntry) => {
    setEditingRestaurant({
      ...r,
      cuisineTypes: Array.isArray(r.cuisineTypes) ? [...r.cuisineTypes] : [],
      recommendedDishes: Array.isArray(r.recommendedDishes) ? [...r.recommendedDishes] : [],
      photos: Array.isArray(r.photos) ? [...r.photos] : [],
    });
    setPhotoInput('');
    setDishInput('');
    setIsModalOpen(true);
  };

  const handleToggleCuisine = (cuisine: string) => {
    if (!editingRestaurant) return;
    const current = editingRestaurant.cuisineTypes || [];
    if (current.includes(cuisine)) {
      setEditingRestaurant({
        ...editingRestaurant,
        cuisineTypes: current.filter((c) => c !== cuisine),
      });
    } else {
      setEditingRestaurant({
        ...editingRestaurant,
        cuisineTypes: [...current, cuisine],
      });
    }
  };

  const handleAddDish = () => {
    const text = dishInput.trim();
    if (!text || !editingRestaurant) return;
    const dishes = editingRestaurant.recommendedDishes || [];
    if (!dishes.includes(text)) {
      setEditingRestaurant({
        ...editingRestaurant,
        recommendedDishes: [...dishes, text],
      });
    }
    setDishInput('');
  };

  const handleRemoveDish = (idx: number) => {
    if (!editingRestaurant) return;
    const dishes = [...(editingRestaurant.recommendedDishes || [])];
    dishes.splice(idx, 1);
    setEditingRestaurant({
      ...editingRestaurant,
      recommendedDishes: dishes,
    });
  };

  const handleAddPhoto = () => {
    const url = photoInput.trim();
    if (!url || !editingRestaurant) return;
    const photos = editingRestaurant.photos || [];
    setEditingRestaurant({
      ...editingRestaurant,
      photos: [...photos, url],
      imageUrl: editingRestaurant.imageUrl || url,
    });
    setPhotoInput('');
  };

  const handleRemovePhoto = (idx: number) => {
    if (!editingRestaurant) return;
    const photos = [...(editingRestaurant.photos || [])];
    photos.splice(idx, 1);
    setEditingRestaurant({
      ...editingRestaurant,
      photos,
      imageUrl: photos[0] || '',
    });
  };

  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRestaurant || !editingRestaurant.restaurantName?.trim()) {
      alert('Please provide restaurant name.');
      return;
    }

    const photos = editingRestaurant.photos || [];
    const imageUrl = editingRestaurant.imageUrl || photos[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';

    await cmsStore.saveRestaurant({
      ...editingRestaurant,
      photos: photos,
      imageUrl: imageUrl,
      ownerId: member.id,
      ownerEmail: member.email,
      createdByName: editingRestaurant.createdByName || member.name,
    });

    setIsModalOpen(false);
    setEditingRestaurant(null);
  };

  const handleDeleteRestaurant = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}"? This action cannot be undone.`)) {
      await cmsStore.deleteRestaurant(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <UtensilsCrossed className="w-4 h-4" />
            <span>Restaurant & Dining Management</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            My Restaurants & Menus
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Showcase your highway eatery, kitchen specialties, dining hours, and guest inquiry contact.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs shadow-lg shadow-rose-900/30 transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Restaurant / Menu</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search dining spot or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#182238] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <select
          value={cuisineFilter}
          onChange={(e) => setCuisineFilter(e.target.value)}
          className="bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 w-full sm:w-auto"
        >
          <option value="ALL">All Cuisines</option>
          <option value="Thakali">Thakali</option>
          <option value="Nepali">Nepali Organic</option>
          <option value="Bakery">Bakery & Cafe</option>
          <option value="Tibetan">Tibetan</option>
          <option value="Dhaba">Highway Dhaba</option>
        </select>
      </div>

      {/* Items list */}
      {filteredRestaurants.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0F172A] border border-dashed border-slate-800">
          <UtensilsCrossed className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Restaurant Listings Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You haven't listed any restaurants or menus yet, or none match your filter.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition inline-flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Restaurant Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((r) => {
            return (
              <div
                key={r.id}
                className="rounded-3xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Photo Banner */}
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={
                        r.imageUrl ||
                        r.photos?.[0] ||
                        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={r.restaurantName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-rose-300 text-[10px] font-black uppercase tracking-wider border border-rose-500/30">
                        {r.cuisineTypes?.[0] || 'Dining Spot'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border backdrop-blur-md bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                        {r.approvalStatus || 'Published'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-extrabold text-white tracking-tight line-clamp-1">
                        {r.restaurantName}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{r.location}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Avg Meal: </span>
                        <span className="text-base font-black text-rose-300">
                          {r.currency || 'NPR'} {r.averageMealPrice?.toLocaleString() || '650'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{r.openingHours || 'Daily'}</span>
                      </span>
                    </div>

                    {/* Recommended Dishes chips */}
                    {Array.isArray(r.recommendedDishes) && r.recommendedDishes.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-400" />
                          <span>Specialties:</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {r.recommendedDishes.slice(0, 3).map((d, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-[#182238] text-[10px] text-slate-300 border border-slate-700/60 font-medium truncate max-w-[200px]"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                  <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{r.contactDetails || 'N/A'}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleOpenEditModal(r)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Edit Restaurant"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRestaurant(r.id, r.restaurantName)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                      title="Delete Restaurant"
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
          ADD / EDIT RESTAURANT MODAL
      ======================================================== */}
      {isModalOpen && editingRestaurant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingRestaurant.id ? 'Edit Restaurant Listing' : 'Add New Restaurant / Menu'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Save your eatery details. This listing will be linked to your member ID ({member.id}).
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRestaurant} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Restaurant / Dhaba Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yac & Thakali Organic Kitchen"
                    value={editingRestaurant.restaurantName || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, restaurantName: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Location / Highway Corridor *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marpha Village Main Lane, Mustang"
                    value={editingRestaurant.location || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, location: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 06:30 AM - 09:30 PM"
                    value={editingRestaurant.openingHours || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, openingHours: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Average Meal Price (NPR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="650"
                    value={editingRestaurant.averageMealPrice ?? 650}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, averageMealPrice: Number(e.target.value) })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Contact Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={editingRestaurant.contactDetails || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, contactDetails: e.target.value })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Cuisines selection */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Select Cuisines Served
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COMMON_CUISINES.map((cuisine) => {
                    const isChecked = (editingRestaurant.cuisineTypes || []).includes(cuisine);
                    return (
                      <button
                        key={cuisine}
                        type="button"
                        onClick={() => handleToggleCuisine(cuisine)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition border flex items-center justify-between ${
                          isChecked
                            ? 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                            : 'bg-[#182238] border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{cuisine}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recommended Dishes */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Specialty & Recommended Dishes
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Jimbu Mustang Thakali Thali"
                    value={dishInput}
                    onChange={(e) => setDishInput(e.target.value)}
                    className="flex-1 bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDish}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                  >
                    Add Dish
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(editingRestaurant.recommendedDishes || []).map((dish, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#182238] border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5"
                    >
                      <span>{dish}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDish(i)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Photo URLs */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Restaurant Photos
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL (https://...)"
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
                    className="flex-1 bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
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
                  {(editingRestaurant.photos || []).map((url, i) => (
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs shadow-lg shadow-rose-900/30 transition"
                >
                  {editingRestaurant.id ? 'Save Changes' : 'Create Restaurant Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
