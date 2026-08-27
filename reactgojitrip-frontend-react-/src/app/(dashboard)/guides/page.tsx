"use client";

import React from "react";
import { cmsStore } from "@/lib/cms-store";
import { GuideEntry } from "@/types/cms";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ImageFileInput } from "@/components/common/ImageFileInput";
import {
  Users,
  Plus,
  Search,
  Phone,
  Edit,
  Trash2,
  Image as ImageIcon,
  X,
  UploadCloud,
  FileImage,
  Loader2,
  Check,
  Award,
  Globe,
  Briefcase,
  Star,
  UserCheck,
} from "lucide-react";

// =============== MEDIA PICKER MODAL ===============
function MediaPickerModal({
  isOpen,
  onClose,
  onSelectMedia,
  title = "Select Guide Photo",
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (url: string) => void;
  title?: string;
}) {
  const [mediaList, setMediaList] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      try {
        const media = cmsStore.getMedia();
        setMediaList(Array.isArray(media) ? media : []);
      } catch (error) {
        console.error("Error loading media:", error);
        setMediaList([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (!file) {
      setSelectedFile(null);
      setImagePreview(null);
      return;
    }

    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File size must be below 4MB");
      setSelectedFile(null);
      setImagePreview(null);
      e.target.value = "";
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Only JPG, JPEG, and PNG files are allowed");
      setSelectedFile(null);
      setImagePreview(null);
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImage = () => {
    if (!selectedFile || !imagePreview) {
      setUploadError("Please select an image first");
      return;
    }

    setIsUploading(true);

    try {
      const newMediaItem = {
        id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: selectedFile.name.replace(/\.[^/.]+$/, "") || "Guide Photo",
        fileType: "Photo" as const,
        category: "Activities" as const,
        url: imagePreview,
        thumbnailUrl: imagePreview,
        fileSizeMb: parseFloat((selectedFile.size / (1024 * 1024)).toFixed(1)),
        tags: ["Guide", "Photo"],
        uploadedBy: "Content Team",
        createdAt: new Date().toISOString(),
      };

      cmsStore.addMedia(newMediaItem as any);
      setSelectedImage(imagePreview);

      setSelectedFile(null);
      setImagePreview(null);
      setUploadError(null);

      const updatedMedia = cmsStore.getMedia();
      setMediaList(Array.isArray(updatedMedia) ? updatedMedia : []);

      setTimeout(() => {
        onSelectMedia(imagePreview);
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectMedia = (url: string) => {
    setSelectedImage(url);
    onSelectMedia(url);
    setTimeout(onClose, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-slate-800 bg-[#182238] flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-white">{title}</h3>
            <p className="text-slate-400 text-[10px]">
              Upload new or select from existing media
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              setSelectedFile(null);
              setImagePreview(null);
              setUploadError(null);
              setSelectedImage(null);
            }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-semibold text-white flex items-center mb-3">
              <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Upload New Profile Photo
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                id="guide-media-upload-input"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() =>
                  document.getElementById("guide-media-upload-input")?.click()
                }
                className="px-4 py-2 bg-[#182238] border border-slate-700 rounded-xl text-xs text-white hover:border-emerald-500 transition-colors flex items-center space-x-2"
              >
                <FileImage className="w-3.5 h-3.5 text-emerald-400" />
                <span>Choose Photo</span>
              </button>
              <span className="text-xs text-slate-400 truncate max-w-[150px]">
                {selectedFile ? selectedFile.name : "No photo chosen"}
              </span>
              <button
                type="button"
                onClick={handleUploadImage}
                disabled={!selectedFile || isUploading}
                className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl text-xs hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Submit</span>
                  </>
                )}
              </button>
            </div>

            {imagePreview && (
              <div className="mt-3 relative rounded-lg overflow-hidden bg-slate-900 max-h-32">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 object-contain"
                />
              </div>
            )}
            {uploadError && (
              <p className="text-red-400 text-[10px] mt-2">⚠ {uploadError}</p>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white mb-3 flex items-center">
              <ImageIcon className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Select from Existing Photos ({mediaList.length})
            </h4>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : mediaList.length === 0 ? (
              <div className="glass-panel p-6 rounded-xl text-center text-xs text-slate-400">
                No media found. Upload photo above.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {mediaList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectMedia(item.url)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer transition-all aspect-square bg-slate-900 ${
                      selectedImage === item.url
                        ? "ring-2 ring-emerald-500"
                        : "hover:ring-2 hover:ring-slate-600"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {selectedImage === item.url && (
                      <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-emerald-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-800 bg-[#131C30] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// =============== MAIN GUIDES PAGE ===============
export default function GuidesPage() {
  const [guides, setGuides] = React.useState<GuideEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingGuide, setEditingGuide] =
    React.useState<Partial<GuideEntry> | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = React.useState(false);

  React.useEffect(() => {
    const refreshData = () => {
      const data = cmsStore.getGuides();
      setGuides(Array.isArray(data) ? data : []);
      setLoading(false);
    };

    refreshData();
    const unsubscribe = cmsStore.subscribe(refreshData);
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const filtered = guides.filter((g) => {
    if (!g) return false;
    const name = (g.fullName || "").toLowerCase();
    const spec = (g.specialization || "").toLowerCase();
    const query = (searchQuery || "").toLowerCase();
    const matchesSearch = name.includes(query) || spec.includes(query);
    const matchesStatus =
      statusFilter === "ALL" || g.approvalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const handleOpenCreateModal = () => {
    setEditingGuide({
      fullName: "Pasang Sherpa",
      contactNumber: "+977-9846110022",
      licenseNumber: "NPL-MTN-8848",
      languages: ["English", "Nepali", "Hindi"],
      experienceYears: 8,
      specialization: "High Altitude Trekking & Climbing",
      dailyRate: 3500,
      bio: "Certified Annapurna & Everest Base Camp guide with 8+ years experience.",
      photoUrl:
        "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
      approvalStatus: "Published",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (g: GuideEntry) => {
    setEditingGuide({ ...g });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this tour guide entry?")) {
      cmsStore.deleteGuide(id);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuide) return;

    setIsSubmitting(true);
    try {
      if (!editingGuide.fullName || !editingGuide.contactNumber) {
        alert("Please fill in required fields: Full Name and Contact Number.");
        setIsSubmitting(false);
        return;
      }

      await cmsStore.saveGuide(editingGuide);
      setIsModalOpen(false);
      setEditingGuide(null);
    } catch (error) {
      console.error("Error saving guide:", error);
      alert("Failed to save guide. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Certified Tour Guides & Mountain Experts</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Tour Guides & Experts Directory
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage certified trekking guides, paragliding pilots, river captains & driver contacts.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tour Guide</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search guide name, specialization..."
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

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800 text-slate-400">
          <Users className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-semibold">No tour guides found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((g) => (
            <div
              key={g.id}
              className="glass-panel rounded-2xl border border-slate-800/90 overflow-hidden flex flex-col hover:border-slate-700 transition-all group"
            >
              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
                    {g.photoUrl ? (
                      <img
                        src={g.photoUrl}
                        alt={g.fullName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xl">
                        {g.fullName?.[0] || "G"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-extrabold text-white truncate">
                        {g.fullName}
                      </h3>
                      <StatusBadge
                        status={g.approvalStatus}
                        entityType="Guide"
                        entityId={g.id}
                      />
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold flex items-center mt-1">
                      <Briefcase className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                      <span className="truncate">{g.specialization}</span>
                    </p>
                    {g.licenseNumber && (
                      <div className="flex items-center text-[10px] text-slate-400 mt-1">
                        <Award className="w-3 h-3 text-amber-400 mr-1 flex-shrink-0" />
                        <span>Lic: {g.licenseNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#182238]/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center">
                      <Phone className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                      Contact:
                    </span>
                    <span className="font-bold text-slate-200">{g.contactNumber}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center">
                      <Star className="w-3.5 h-3.5 mr-1 text-yellow-400" />
                      Experience:
                    </span>
                    <span className="font-semibold text-slate-300">
                      {g.experienceYears || 0} Years
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center">
                      <Globe className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                      Languages:
                    </span>
                    <span className="text-[10px] text-slate-300">
                      {Array.isArray(g.languages) ? g.languages.join(", ") : "English, Nepali"}
                    </span>
                  </div>

                  {g.dailyRate && (
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Daily Rate:</span>
                      <span className="font-bold text-emerald-400">
                        {g.currency || "NRs"} {g.dailyRate.toLocaleString()} / Day
                      </span>
                    </div>
                  )}
                </div>

                {g.bio && (
                  <p className="text-xs text-slate-400 line-clamp-2 italic">
                    "{g.bio}"
                  </p>
                )}
              </div>

              {/* Action Bar */}
              <div className="px-4 py-2.5 bg-[#131C30] border-t border-slate-800 flex justify-between items-center">
                <span className="text-[9px] text-slate-400">
                  Updated: {g.updatedAt ? new Date(g.updatedAt).toLocaleDateString() : "N/A"}
                </span>
                <div className="flex space-x-1.5">
                  <button
                    onClick={() => handleOpenEditModal(g)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && editingGuide && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#182238] flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">
                {editingGuide.id ? "Edit Tour Guide" : "Add Tour Guide"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingGuide(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingGuide.fullName || ""}
                  onChange={(e) => setEditingGuide({ ...editingGuide, fullName: e.target.value })}
                  placeholder="e.g. Pasang Sherpa"
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingGuide.contactNumber || ""}
                    onChange={(e) => setEditingGuide({ ...editingGuide, contactNumber: e.target.value })}
                    placeholder="+977-9846110022"
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    License / Reg No.
                  </label>
                  <input
                    type="text"
                    value={editingGuide.licenseNumber || ""}
                    onChange={(e) => setEditingGuide({ ...editingGuide, licenseNumber: e.target.value })}
                    placeholder="NPL-MTN-8848"
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={editingGuide.specialization || ""}
                    onChange={(e) => setEditingGuide({ ...editingGuide, specialization: e.target.value })}
                    placeholder="High Altitude Trekking / Pilot / Driver"
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={editingGuide.experienceYears || 0}
                    onChange={(e) => setEditingGuide({ ...editingGuide, experienceYears: Number(e.target.value) })}
                    placeholder="8"
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Currency
                  </label>
                  <select
                    value={(editingGuide as any).currency || "NRs"}
                    onChange={(e) => setEditingGuide({ ...editingGuide, currency: e.target.value })}
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
                    Daily Fee Rate
                  </label>
                  <input
                    type="number"
                    value={editingGuide.dailyRate || 0}
                    onChange={(e) => setEditingGuide({ ...editingGuide, dailyRate: Number(e.target.value) })}
                    placeholder="3500"
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Status
                  </label>
                  <select
                    value={editingGuide.approvalStatus || "Published"}
                    onChange={(e) => setEditingGuide({ ...editingGuide, approvalStatus: e.target.value as any })}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Published">Published</option>
                  </select>
                </div>

              {/* =============== PROFILE PHOTO FILE UPLOAD =============== */}
              <div className="space-y-2">
                <ImageFileInput
                  label="Guide Profile Photo (Select File from Computer / Device)"
                  value={editingGuide.photoUrl || ""}
                  onChange={(url) => setEditingGuide({ ...editingGuide, photoUrl: url })}
                  onClear={() => setEditingGuide({ ...editingGuide, photoUrl: "" })}
                  category="Activities"
                />

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Or select from Media Library:</span>
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

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Short Bio / Certification Notes
                </label>
                <textarea
                  rows={3}
                  value={editingGuide.bio || ""}
                  onChange={(e) => setEditingGuide({ ...editingGuide, bio: e.target.value })}
                  placeholder="Certified Annapurna & Everest Base Camp guide..."
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingGuide(null);
                  }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Save Guide</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelectMedia={(url) => {
          if (editingGuide) setEditingGuide({ ...editingGuide, photoUrl: url });
        }}
      />
    </div>
  );
}
