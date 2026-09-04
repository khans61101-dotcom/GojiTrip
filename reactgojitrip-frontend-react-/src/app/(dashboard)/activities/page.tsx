"use client";

import React from "react";
import { cmsStore } from "@/lib/cms-store";
import { ActivityEntry } from "@/types/cms";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ImageFileInput, validateImagePayloads } from "@/components/common/ImageFileInput";
import { MultiImageFileInput } from "@/components/common/MultiImageFileInput";
import {
  Compass,
  Plus,
  Search,
  UserCheck,
  Phone,
  Clock,
  DollarSign,
  Flame,
  Edit,
  Trash2,
  Image as ImageIcon,
  X,
  UploadCloud,
  FileImage,
  Loader2,
  Check,
  Calendar,
  Star,
} from "lucide-react";

// =============== MEDIA PICKER MODAL (Built-in) ===============
function MediaPickerModal({
  isOpen,
  onClose,
  onSelectMedia,
  title = "Select Photo",
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (url: string) => void;
  title?: string;
}) {
  const [mediaList, setMediaList] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  // Image upload states
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

  // =============== File selection handler ===============
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (!file) {
      setSelectedFile(null);
      setImagePreview(null);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const msg = "File size exceeds 5MB limit. Please select an image under 5MB.";
      setUploadError(msg);
      alert(msg);
      setSelectedFile(null);
      setImagePreview(null);
      e.target.value = "";
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Only JPG, JPEG, and PNG files are allowed");
      setSelectedFile(null);
      setImagePreview(null);
      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // =============== Upload new image to media library ===============
  const handleUploadImage = () => {
    if (!selectedFile || !imagePreview) {
      setUploadError("Please select an image first");
      return;
    }

    setIsUploading(true);

    try {
      // Create media item
      const newMediaItem = {
        id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: selectedFile.name.replace(/\.[^/.]+$/, "") || "Uploaded Image",
        fileType: "Photo" as const,
        category: "Activities" as const,
        url: imagePreview,
        thumbnailUrl: imagePreview,
        fileSizeMb: parseFloat((selectedFile.size / (1024 * 1024)).toFixed(1)),
        tags: ["Activity", "Uploaded"],
        uploadedBy: "Content Team",
        createdAt: new Date().toISOString(),
      };

      // Add to store
      cmsStore.addMedia(newMediaItem as any);

      // Select the uploaded image
      setSelectedImage(imagePreview);

      // Reset file states
      setSelectedFile(null);
      setImagePreview(null);
      setUploadError(null);

      // Refresh media list
      const updatedMedia = cmsStore.getMedia();
      setMediaList(Array.isArray(updatedMedia) ? updatedMedia : []);

      // Auto-select after upload
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

  // =============== Select from existing media ===============
  const handleSelectMedia = (url: string) => {
    setSelectedImage(url);
    onSelectMedia(url);
    setTimeout(onClose, 300);
  };

  // =============== Remove selected file ===============
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setUploadError(null);
    const fileInput = document.getElementById(
      "media-upload-input",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
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

        <div className="flex-1 overflow-y-auto p-6">
          {/* =============== UPLOAD NEW IMAGE SECTION =============== */}
          <div className="mb-6">
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-semibold text-white flex items-center">
                    <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    Upload New Image
                  </h4>
                  <p className="text-slate-500 text-[10px] mt-0.5">
                    File size below 4MB. Only JPG, JPEG, and PNG allowed.
                  </p>
                </div>
              </div>

              {/* Image upload UI */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Hidden file input */}
                <input
                  id="media-upload-input"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Choose File button */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("media-upload-input")?.click()
                    }
                    className="px-4 py-2 bg-[#182238] border border-slate-700 rounded-xl text-xs text-white hover:border-emerald-500 transition-colors flex items-center space-x-2"
                  >
                    <FileImage className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Choose File</span>
                  </button>

                  {/* File name display */}
                  <span className="text-xs text-slate-400 truncate max-w-[150px]">
                    {selectedFile ? selectedFile.name : "No file chosen"}
                  </span>
                </div>

                {/* Upload button */}
                <button
                  type="button"
                  onClick={handleUploadImage}
                  disabled={!selectedFile || isUploading}
                  className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl text-xs hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 w-full sm:w-auto justify-center"
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

              {/* Image preview */}
              {imagePreview && (
                <div className="mt-3 relative">
                  <div className="relative rounded-lg overflow-hidden bg-slate-900 max-h-32">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-[10px] text-white">
                      {selectedFile?.name} (
                      {(selectedFile?.size || 0 / (1024 * 1024)).toFixed(1)} MB)
                    </div>
                  </div>
                </div>
              )}

              {/* Error message */}
              {uploadError && (
                <p className="text-red-400 text-[10px] mt-2 flex items-center">
                  <span className="mr-1">⚠</span> {uploadError}
                </p>
              )}
            </div>
          </div>

          {/* =============== EXISTING MEDIA LIBRARY SECTION =============== */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-white flex items-center">
                <ImageIcon className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Select from Media Library
              </h4>
              <span className="text-[10px] text-slate-500">
                {mediaList.length} assets
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : mediaList.length === 0 ? (
              <div className="glass-panel p-8 rounded-xl text-center border border-slate-800">
                <ImageIcon className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-xs text-slate-400">
                  No media assets found. Upload a new image above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {mediaList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectMedia(item.url)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer transition-all group bg-slate-900 aspect-square ${
                      selectedImage === item.url
                        ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#111827]"
                        : "hover:ring-2 hover:ring-slate-600 hover:ring-offset-2 hover:ring-offset-[#111827]"
                    }`}
                  >
                    {item.url ? (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (
                            e.target as HTMLImageElement
                          ).parentElement!.innerHTML =
                            '<div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">No image</div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                        No image
                      </div>
                    )}

                    {selectedImage === item.url && (
                      <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                        <div className="bg-emerald-500 rounded-full p-1">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-[10px] text-white truncate">
                        {item.title || "Untitled"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#131C30] flex justify-end">
          <button
            onClick={() => {
              onClose();
              setSelectedFile(null);
              setImagePreview(null);
              setUploadError(null);
              setSelectedImage(null);
            }}
            className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// =============== MAIN ACTIVITIES PAGE ===============
type AvailabilityType = "Daily" | "Weekends" | "Seasonal" | "On Request";

export default function ActivitiesPage() {
  const [activities, setActivities] = React.useState<ActivityEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingAct, setEditingAct] =
    React.useState<Partial<ActivityEntry> | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [mediaPickerOpen, setMediaPickerOpen] = React.useState(false);

  React.useEffect(() => {
    const refreshData = () => {
      setActivities(cmsStore.getActivities());
      setLoading(!cmsStore.isHydrated());
    };

    refreshData();
    const unsubscribe = cmsStore.subscribe(refreshData);
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const filtered = activities.filter((a) => {
    if (!a || !a.activityName || !a.guideName) {
      return false;
    }
    const matchesSearch =
      a.activityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.guideName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || a.approvalStatus === statusFilter;
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
    setEditingAct({
      id: undefined,
      activityName: "",
      guideName: "",
      guideContactDetails: "",
      pricing: 3500,
      currency: "NRs",
      duration: "2 Hours",
      difficultyLevel: "Moderate",
      photos: [],
      imageUrl: "",
      availability: "Daily" as AvailabilityType,
      approvalStatus: "Published",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (a: ActivityEntry) => {
    setEditingAct({ ...a });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this activity entry?")) {
      cmsStore.deleteActivity(id);
    }
  };

  // =============== Handle media attachment ===============
  const handleAttachMedia = (url: string) => {
    if (!editingAct) return;
    const photos = editingAct.photos || [];
    setEditingAct({
      ...editingAct,
      photos: [...photos, url],
      imageUrl: url, // Also set as main image
    });
  };

  // =============== Remove photo ===============
  const handleRemovePhoto = (photoUrl: string) => {
    if (!editingAct) return;
    const currentPhotos = editingAct.photos || [];
    const updatedPhotos = currentPhotos.filter((url) => url !== photoUrl);
    setEditingAct({
      ...editingAct,
      photos: updatedPhotos,
      imageUrl: updatedPhotos.length > 0 ? updatedPhotos[0] : "",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAct) return;

    const imageCheck = validateImagePayloads([editingAct.imageUrl, ...(editingAct.photos || [])]);
    if (!imageCheck.valid) {
      alert(imageCheck.errorMsg);
      return;
    }

    setIsSubmitting(true);
    try {
      if (!editingAct.activityName || !editingAct.guideName) {
        alert("Please fill in required fields: Activity Name and Guide Name.");
        setIsSubmitting(false);
        return;
      }

      const photos = Array.isArray(editingAct.photos) && editingAct.photos.length > 0
        ? editingAct.photos
        : (editingAct.imageUrl ? [editingAct.imageUrl] : []);

      const activityToSave = {
        ...editingAct,
        id: editingAct.id ? String(editingAct.id) : undefined,
        photos: photos,
        imageUrl: editingAct.imageUrl || photos[0] || "",
        createdAt: editingAct.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await cmsStore.saveActivity(activityToSave as ActivityEntry);
      setIsModalOpen(false);
      setEditingAct(null);
    } catch (error) {
      console.error("Error saving activity:", error);
      alert("Failed to save activity. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeString = (value: string | undefined | null): string => {
    return value || "N/A";
  };

  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "N/A";
    }
    try {
      return amount.toLocaleString();
    } catch {
      return String(amount);
    }
  };

  const getDifficultyBadge = (diff: string | undefined) => {
    if (!diff) return "bg-slate-800 text-slate-300";
    switch (diff) {
      case "Easy":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Moderate":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "Challenging":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "Extreme":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-slate-800 text-slate-300";
    }
  };

  const handleAvailabilityChange = (value: string) => {
    if (!editingAct) return;
    if (
      value === "Daily" ||
      value === "Weekends" ||
      value === "Seasonal" ||
      value === "On Request"
    ) {
      setEditingAct({
        ...editingAct,
        availability: value as AvailabilityType,
      });
    }
  };

  const getAvailabilityIcon = (availability: string | undefined) => {
    switch (availability) {
      case "Daily":
        return <Calendar className="w-3 h-3" />;
      case "Weekends":
        return <Calendar className="w-3 h-3" />;
      case "Seasonal":
        return <Flame className="w-3 h-3" />;
      case "On Request":
        return <Clock className="w-3 h-3" />;
      default:
        return <Calendar className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Adventures & Certified Guides</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Activity & Guide Module
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage paragliding, treks, horse riding, guide contact details,
            difficulty levels & pricing.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Activity & Guide</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search activity name, guide..."
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

      {/* Grid - Medium Cards */}
      {filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800 text-slate-400">
          <Compass className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-semibold">
            No activity entries found matching filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="glass-panel rounded-2xl border border-slate-800/90 overflow-hidden flex flex-col hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="relative h-52 w-full bg-slate-900 overflow-hidden">
                  {item.imageUrl || (item.photos && item.photos[0]) ? (
                    <img
                      src={
                        item.imageUrl || (item.photos && item.photos[0]) || ""
                      }
                      alt={safeString(item.activityName)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (
                          e.target as HTMLImageElement
                        ).parentElement!.innerHTML =
                          '<div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">Image not available</div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                      No Photo
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex space-x-2">
                    <span
                      className={`px-2.5 py-1 rounded-full border font-bold text-[10px] uppercase backdrop-blur-sm ${getDifficultyBadge(
                        item.difficultyLevel,
                      )}`}
                    >
                      {safeString(item.difficultyLevel)}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <StatusBadge
                      status={item.approvalStatus}
                      entityType="Activity"
                      entityId={item.id}
                    />
                  </div>

                  {/* Price badge on image */}
                  <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 font-bold text-xs">
                    {item.currency || "NRs"} {formatCurrency(item.pricing)}
                  </div>

                  {/* Rating badge */}
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center">
                    <Star className="w-3 h-3 text-yellow-400 mr-1" />
                    4.7
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-bold text-white truncate">
                    {safeString(item.activityName)}
                  </h3>

                  <div className="mt-2 p-2.5 rounded-xl bg-[#182238]/60 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center">
                        <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        Guide:
                      </span>
                      <span className="font-bold text-slate-200 truncate max-w-[150px]">
                        {safeString(item.guideName)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1" />
                        Contact:
                      </span>
                      <span className="text-slate-300 text-[10px]">
                        {safeString(item.guideContactDetails)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {safeString(item.duration)}
                    </span>
                    <span className="flex items-center text-slate-400">
                      {getAvailabilityIcon(item.availability)}
                      <span className="ml-1 text-[10px]">
                        {safeString(item.availability)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="px-4 py-2.5 bg-[#131C30] border-t border-slate-800 flex justify-between items-center">
                <span className="text-[9px] text-slate-400">
                  Updated:{" "}
                  {item.updatedAt
                    ? new Date(item.updatedAt).toLocaleDateString()
                    : "N/A"}
                </span>
                <div className="flex space-x-1.5">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
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

      {/* =============== MODAL FORM WITH IMAGE UPLOAD =============== */}
      {isModalOpen && editingAct && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#182238] flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">
                {editingAct.id ? "Edit Activity & Guide" : "Add Activity"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingAct(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="p-6 overflow-y-auto space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Activity Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingAct.activityName || ""}
                  onChange={(e) =>
                    setEditingAct({
                      ...editingAct,
                      activityName: e.target.value,
                    })
                  }
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Guide Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAct.guideName || ""}
                    onChange={(e) =>
                      setEditingAct({
                        ...editingAct,
                        guideName: e.target.value,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Guide Contact Details
                  </label>
                  <input
                    type="text"
                    value={editingAct.guideContactDetails || ""}
                    onChange={(e) =>
                      setEditingAct({
                        ...editingAct,
                        guideContactDetails: e.target.value,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. +977-9846001122"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Availability
                </label>
                <select
                  value={editingAct.availability || "Daily"}
                  onChange={(e) => handleAvailabilityChange(e.target.value)}
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekends">Weekends</option>
                  <option value="Seasonal">Seasonal</option>
                  <option value="On Request">On Request</option>
                </select>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Currency
                  </label>
                  <select
                    value={(editingAct as any).currency || "NRs"}
                    onChange={(e) =>
                      setEditingAct((prev: any) => ({
                        ...prev,
                        currency: e.target.value,
                      }))
                    }
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
                    Pricing
                  </label>
                  <input
                    type="number"
                    value={editingAct.pricing || 0}
                    onChange={(e) =>
                      setEditingAct((prev: any) => ({
                        ...prev,
                        pricing: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={editingAct.duration || ""}
                    onChange={(e) =>
                      setEditingAct({ ...editingAct, duration: e.target.value })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. 2 Hours"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={editingAct.difficultyLevel || "Moderate"}
                    onChange={(e) =>
                      setEditingAct({
                        ...editingAct,
                        difficultyLevel: e.target
                          .value as ActivityEntry["difficultyLevel"],
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                    <option value="Extreme">Extreme</option>
                  </select>
                </div>
              </div>

              {/* =============== CURRENT PHOTOS DISPLAY =============== */}
              {editingAct.photos && editingAct.photos.length > 0 && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Current Photos ({editingAct.photos.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {editingAct.photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-800"
                      >
                        <img
                          src={photo}
                          alt={`Activity photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo)}
                          className="absolute top-0 right-0 p-0.5 bg-red-500/80 hover:bg-red-600 rounded-bl-lg text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =============== IMAGE FILE UPLOAD FROM COMPUTER =============== */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <ImageFileInput
                  label="Activity Hero Cover Photo (Main Cover Image)"
                  value={editingAct.imageUrl || (editingAct.photos && editingAct.photos[0]) || ""}
                  onChange={(url) =>
                    setEditingAct({
                      ...editingAct,
                      imageUrl: url,
                      photos: editingAct.photos && editingAct.photos.length > 0 ? [url, ...editingAct.photos.slice(1)] : [url],
                    })
                  }
                  onClear={() =>
                    setEditingAct({
                      ...editingAct,
                      imageUrl: "",
                    })
                  }
                  category="Activities"
                />

                <MultiImageFileInput
                  label="Activity Photo Gallery (Add Multiple Images for Yelp Detail View)"
                  images={editingAct.photos || []}
                  onChange={(photos) =>
                    setEditingAct({
                      ...editingAct,
                      photos: photos,
                      imageUrl: editingAct.imageUrl || photos[0] || "",
                    })
                  }
                  category="Activities"
                  maxImages={10}
                />

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Or choose from Media Library:</span>
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

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingAct(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Save Activity</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============== MEDIA PICKER MODAL =============== */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelectMedia={handleAttachMedia}
        title="Select Photo for Activity"
      />
    </div>
  );
}
