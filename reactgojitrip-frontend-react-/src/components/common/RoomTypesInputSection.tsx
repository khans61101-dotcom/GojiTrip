"use client";

import React, { useState } from "react";
import { Plus, Trash2, Edit, Bed, Users, DollarSign, Image as ImageIcon, Check, X, Shield, Sparkles } from "lucide-react";
import { RoomTypeInfo } from "@/types/cms";
import { ImageFileInput, validateImagePayloads } from "@/components/common/ImageFileInput";
import { MultiImageFileInput } from "@/components/common/MultiImageFileInput";

interface RoomTypesInputSectionProps {
  roomTypes: RoomTypeInfo[];
  onChange: (roomTypes: RoomTypeInfo[]) => void;
  currency?: string;
  onOpenMediaPicker?: (onSelect: (url: string) => void) => void;
}

const COMMON_BED_TYPES = [
  "1 King Bed",
  "1 Queen Bed",
  "2 Twin Beds",
  "1 Double Bed",
  "2 Bunk Beds",
  "1 Single Bed",
  "Family Suite (2 Double Beds)",
];

const COMMON_ROOM_FACILITIES = [
  "Attached Bathroom",
  "Private Balcony",
  "Air Conditioning (AC)",
  "Mountain View",
  "River View",
  "Free High-Speed Wi-Fi",
  "Flat-Screen TV",
  "Hot & Cold Shower",
  "Room Heater",
  "Electric Kettle & Tea Maker",
  "Mini Fridge",
  "Work Desk & Chair",
];

export const RoomTypesInputSection: React.FC<RoomTypesInputSectionProps> = ({
  roomTypes = [],
  onChange,
  currency = "NRs",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [currentRoom, setCurrentRoom] = useState<Partial<RoomTypeInfo>>({
    typeName: "",
    ratePerNight: 2500,
    capacity: 2,
    bedType: "1 King Bed",
    facilities: ["Attached Bathroom", "Hot & Cold Shower", "Free High-Speed Wi-Fi", "Mountain View"],
    imageUrl: "",
    photos: [],
  });

  const safeRooms = Array.isArray(roomTypes) ? roomTypes : [];

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setCurrentRoom({
      id: `rm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      typeName: "",
      ratePerNight: 2500,
      capacity: 2,
      bedType: "1 King Bed",
      facilities: ["Attached Bathroom", "Hot & Cold Shower", "Free High-Speed Wi-Fi", "Mountain View"],
      imageUrl: "",
      photos: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    const room = safeRooms[index];
    setCurrentRoom({ ...room });
    setIsModalOpen(true);
  };

  const handleRemove = (index: number) => {
    if (confirm("Are you sure you want to remove this room type?")) {
      const updated = safeRooms.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  const handleSaveRoom = () => {
    if (!currentRoom.typeName || !currentRoom.typeName.trim()) {
      alert("Please enter a Room Name / Type.");
      return;
    }

    const imageCheck = validateImagePayloads([currentRoom.imageUrl, ...(currentRoom.photos || [])]);
    if (!imageCheck.valid) {
      alert(imageCheck.errorMsg);
      return;
    }

    const savedRoom: RoomTypeInfo = {
      id: currentRoom.id || `rm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      typeName: currentRoom.typeName.trim(),
      ratePerNight: Number(currentRoom.ratePerNight) || 0,
      capacity: Number(currentRoom.capacity) || 1,
      bedType: currentRoom.bedType || "1 King Bed",
      facilities: currentRoom.facilities || [],
      imageUrl: currentRoom.imageUrl || (currentRoom.photos && currentRoom.photos[0]) || "",
      photos: currentRoom.photos || (currentRoom.imageUrl ? [currentRoom.imageUrl] : []),
    };

    let updated: RoomTypeInfo[];
    if (editingIndex !== null) {
      updated = [...safeRooms];
      updated[editingIndex] = savedRoom;
    } else {
      updated = [...safeRooms, savedRoom];
    }

    onChange(updated);
    setIsModalOpen(false);
  };

  const toggleFacility = (facility: string) => {
    const currentList = currentRoom.facilities || [];
    if (currentList.includes(facility)) {
      setCurrentRoom({
        ...currentRoom,
        facilities: currentList.filter((f) => f !== facility),
      });
    } else {
      setCurrentRoom({
        ...currentRoom,
        facilities: [...currentList, facility],
      });
    }
  };

  return (
    <div className="space-y-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-slate-200 font-bold text-xs flex items-center gap-2">
            <Bed className="w-4 h-4 text-emerald-400" />
            Room Types & Rates ({safeRooms.length})
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Add rooms with prices, max capacity, bed configuration, amenities & room photos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Room Type</span>
        </button>
      </div>

      {/* Room List Grid */}
      {safeRooms.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
          <Bed className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
          <p className="text-xs text-slate-400">No specific room types added yet.</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Click "+ Add Room Type" to set up Deluxe, Suite, or Family rooms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {safeRooms.map((room, index) => (
            <div
              key={room.id || index}
              className="p-3 bg-slate-950 border border-slate-800 rounded-xl relative flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Room Image Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-800">
                  {room.imageUrl ? (
                    <img
                      src={room.imageUrl}
                      alt={room.typeName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Bed className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white truncate">
                      {room.typeName}
                    </h4>
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {currency} {room.ratePerNight?.toLocaleString()} / night
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-500" />
                      {room.capacity || 2} Guests
                    </span>
                    {room.bedType && (
                      <span className="flex items-center gap-1 truncate">
                        <Bed className="w-3 h-3 text-slate-500" />
                        {room.bedType}
                      </span>
                    )}
                  </div>

                  {/* Room Facilities Pills */}
                  {room.facilities && room.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {room.facilities.slice(0, 3).map((fac, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                        >
                          {fac}
                        </span>
                      ))}
                      {room.facilities.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 text-slate-500">
                          +{room.facilities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(index)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl max-h-[90vh] bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  {editingIndex !== null ? "Edit Room Type" : "Add New Room Type"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Room Name / Type *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deluxe Mountain View Room, Executive Suite"
                  value={currentRoom.typeName || ""}
                  onChange={(e) =>
                    setCurrentRoom({ ...currentRoom, typeName: e.target.value })
                  }
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Rate Per Night ({currency}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={currentRoom.ratePerNight || 0}
                    onChange={(e) =>
                      setCurrentRoom({
                        ...currentRoom,
                        ratePerNight: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Max Guest Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={currentRoom.capacity || 2}
                    onChange={(e) =>
                      setCurrentRoom({
                        ...currentRoom,
                        capacity: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Bed Configuration / Setup
                </label>
                <select
                  value={currentRoom.bedType || "1 King Bed"}
                  onChange={(e) =>
                    setCurrentRoom({ ...currentRoom, bedType: e.target.value })
                  }
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  {COMMON_BED_TYPES.map((b, i) => (
                    <option key={i} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Amenities Checkboxes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Room Amenities & Features
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-[#182238]/50 border border-slate-800 rounded-xl">
                  {COMMON_ROOM_FACILITIES.map((facility, idx) => {
                    const isChecked = (currentRoom.facilities || []).includes(facility);
                    return (
                      <label
                        key={idx}
                        className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors text-[11px] ${
                          isChecked
                            ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFacility(facility)}
                          className="accent-emerald-500 rounded"
                        />
                        <span>{facility}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Room Cover Image */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <ImageFileInput
                  label="Room Cover Photo (Main Image)"
                  value={currentRoom.imageUrl || ""}
                  onChange={(url) =>
                    setCurrentRoom({
                      ...currentRoom,
                      imageUrl: url,
                      photos: currentRoom.photos && currentRoom.photos.length > 0 ? [url, ...currentRoom.photos.slice(1)] : [url],
                    })
                  }
                  onClear={() => setCurrentRoom({ ...currentRoom, imageUrl: "" })}
                  category="Hotels"
                />
              </div>

              {/* Room Gallery Photos */}
              <div className="space-y-2">
                <MultiImageFileInput
                  label="Room Photo Gallery (Multiple Photos)"
                  images={currentRoom.photos || []}
                  onChange={(images) =>
                    setCurrentRoom({
                      ...currentRoom,
                      photos: images,
                      imageUrl: currentRoom.imageUrl || images[0] || "",
                    })
                  }
                  category="Hotels"
                />
              </div>

              {/* Form Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRoom}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-900/30"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingIndex !== null ? "Update Room" : "Save Room"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
