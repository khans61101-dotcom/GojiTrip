"use client";

import React from "react";
import {
  UtensilsCrossed,
  Plus,
  Search,
  MapPin,
  Phone,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  ChefHat,
  X,
  UploadCloud,
  FileImage,
  Loader2,
  Check,
  Star,
} from "lucide-react";

import { cmsStore } from "@/lib/cms-store";
import { ImageFileInput } from "@/components/common/ImageFileInput";

import {
  listRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "@/lib/api";

import { RestaurantEntry } from "@/types/cms";
import { StatusBadge } from "@/components/common/StatusBadge";

// ============================================================
// TYPES
// ============================================================

type MediaItem = {
  id: string | number;
  title?: string;
  fileType?: string;
  category?: string;
  url?: string;
  thumbnailUrl?: string;
  fileSizeMb?: number;
  tags?: string[];
  uploadedBy?: string;
  createdAt?: string;
};

type RestaurantForm = Partial<RestaurantEntry> & {
  imageUrl?: string;
};

type RestaurantApiPayload = {
  restaurantName: string;
  location: string;
  contactDetails: string;
  cuisineTypes: string[];
  openingHours: string;
  priceRange: string;
  imageUrl?: string;
  approvalStatus?: string;
  createdByName: string;
};

// ============================================================
// MEDIA PICKER
// ============================================================

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
  const [mediaList, setMediaList] = React.useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const [isUploading, setIsUploading] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // ============================================================
  // RESET
  // ============================================================

  const resetPickerState = React.useCallback(() => {
    setSelectedImage(null);
    setSelectedFile(null);
    setImagePreview(null);
    setUploadError(null);
    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // ============================================================
  // LOAD MEDIA
  // ============================================================

  const loadMedia = React.useCallback(() => {
    try {
      setIsLoading(true);

      const media = cmsStore.getMedia();

      const validMedia = Array.isArray(media)
        ? media.filter(
            (item: any) =>
              item &&
              typeof item.url === "string" &&
              item.url.trim().length > 0,
          )
        : [];

      setMediaList(validMedia);
    } catch (error) {
      console.error("Error loading media:", error);
      setMediaList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;

    resetPickerState();
    loadMedia();
  }, [isOpen, loadMedia, resetPickerState]);

  // ============================================================
  // FILE SELECT
  // ============================================================

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setUploadError(null);

    if (!file) {
      setSelectedFile(null);
      setImagePreview(null);
      return;
    }

    const maxSize = 4 * 1024 * 1024;

    if (file.size > maxSize) {
      setUploadError("File size must be below 4MB.");
      setSelectedFile(null);
      setImagePreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!validTypes.includes(file.type)) {
      setUploadError("Only JPG, JPEG, PNG, and WEBP files are allowed.");

      setSelectedFile(null);
      setImagePreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
      }
    };

    reader.onerror = () => {
      setUploadError("Unable to read selected image.");
      setSelectedFile(null);
      setImagePreview(null);
    };

    reader.readAsDataURL(file);
  };

  // ============================================================
  // UPLOAD TO MEDIA STORE
  // ============================================================

  const handleUploadImage = async () => {
    if (!selectedFile || !imagePreview) {
      setUploadError("Please select an image first.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const newMediaItem: MediaItem = {
        id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,

        title:
          selectedFile.name.replace(/\.[^/.]+$/, "") ||
          "Uploaded Restaurant Image",

        fileType: "Photo",
        category: "Restaurants",

        url: imagePreview,
        thumbnailUrl: imagePreview,

        fileSizeMb: Number((selectedFile.size / (1024 * 1024)).toFixed(2)),

        tags: ["Restaurant", "Uploaded"],
        uploadedBy: "Content Team",
        createdAt: new Date().toISOString(),
      };

      cmsStore.addMedia(newMediaItem as any);

      const updatedMedia = cmsStore.getMedia();

      const validMedia = Array.isArray(updatedMedia)
        ? updatedMedia.filter(
            (item: any) =>
              item &&
              typeof item.url === "string" &&
              item.url.trim().length > 0,
          )
        : [];

      setMediaList(validMedia);

      setSelectedImage(imagePreview);

      onSelectMedia(imagePreview);

      setSelectedFile(null);
      setImagePreview(null);
      setUploadError(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // ============================================================
  // SELECT EXISTING
  // ============================================================

  const handleSelectMedia = (url: string) => {
    if (!url) return;

    setSelectedImage(url);

    onSelectMedia(url);

    setTimeout(() => {
      onClose();
    }, 200);
  };

  // ============================================================
  // REMOVE FILE
  // ============================================================

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setUploadError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================
  // CLOSE
  // ============================================================

  const handleClose = () => {
    resetPickerState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* HEADER */}

        <div className="px-6 py-4 border-b border-slate-800 bg-[#182238] flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-white">{title}</h3>

            <p className="text-slate-400 text-[10px] mt-1">
              Upload new image or select from existing media
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}

        <div className="flex-1 overflow-y-auto p-6">
          {/* UPLOAD */}

          <div className="mb-6">
            <div className="bg-[#131C30] p-4 rounded-xl border border-slate-800">
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-white flex items-center">
                  <UploadCloud className="w-4 h-4 mr-1.5 text-emerald-400" />
                  Upload New Image
                </h4>

                <p className="text-slate-500 text-[10px] mt-1">
                  Maximum 4MB. JPG, JPEG, PNG or WEBP.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-[#182238] border border-slate-700 rounded-xl text-xs text-white hover:border-emerald-500 transition-colors flex items-center gap-2"
                >
                  <FileImage className="w-4 h-4 text-emerald-400" />
                  Choose File
                </button>

                <span className="text-xs text-slate-400 truncate max-w-[220px]">
                  {selectedFile ? selectedFile.name : "No file chosen"}
                </span>

                <button
                  type="button"
                  onClick={handleUploadImage}
                  disabled={!selectedFile || isUploading}
                  className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl text-xs hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 sm:ml-auto"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Upload & Select
                    </>
                  )}
                </button>
              </div>

              {imagePreview && (
                <div className="mt-4 relative">
                  <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
                    <img
                      src={imagePreview}
                      alt="Restaurant image preview"
                      className="w-full h-40 object-contain"
                    />

                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 rounded-full text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-[10px] text-white">
                      {selectedFile?.name}
                    </div>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-[10px]">⚠ {uploadError}</p>
                </div>
              )}
            </div>
          </div>

          {/* EXISTING MEDIA */}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-white flex items-center">
                <ImageIcon className="w-4 h-4 mr-1.5 text-emerald-400" />
                Select from Media Library
              </h4>

              <span className="text-[10px] text-slate-500">
                {mediaList.length} assets
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : mediaList.length === 0 ? (
              <div className="bg-[#131C30] p-8 rounded-xl text-center border border-slate-800">
                <ImageIcon className="w-8 h-8 mx-auto text-slate-600 mb-2" />

                <p className="text-xs text-slate-400">No media assets found.</p>

                <p className="text-[10px] text-slate-600 mt-1">
                  Upload a new restaurant image above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {mediaList.map((item) => {
                  const imageUrl = item.url || item.thumbnailUrl || "";

                  if (!imageUrl) return null;

                  return (
                    <button
                      type="button"
                      key={String(item.id)}
                      onClick={() => handleSelectMedia(imageUrl)}
                      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all group bg-slate-900 aspect-square text-left ${
                        selectedImage === imageUrl
                          ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#111827]"
                          : "hover:ring-2 hover:ring-slate-600 hover:ring-offset-2 hover:ring-offset-[#111827]"
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={item.title || "Restaurant media"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />

                      {selectedImage === imageUrl && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                          <div className="bg-emerald-500 rounded-full p-1.5">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                        <p className="text-[10px] text-white truncate">
                          {item.title || "Untitled"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}

        <div className="px-6 py-4 border-t border-slate-800 bg-[#131C30] flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = React.useState<RestaurantEntry[]>([]);

  const [loading, setLoading] = React.useState(true);

  const [searchQuery, setSearchQuery] = React.useState("");

  const [statusFilter, setStatusFilter] = React.useState("ALL");

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [editingRest, setEditingRest] = React.useState<RestaurantForm | null>(
    null,
  );

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [mediaPickerOpen, setMediaPickerOpen] = React.useState(false);

  // ============================================================
  // LOAD FROM DATABASE
  // ============================================================

  const loadRestaurants = React.useCallback(async () => {
    try {
      setLoading(true);
      const storeItems = cmsStore.getRestaurants();
      const response = await listRestaurants().catch(() => null);

      const data = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
          ? (response as any).data
          : [];

      if (data.length > 0) {
        // Merge image URLs from cmsStore if backend response missed them
        const merged = data.map((item: any) => {
          const matchingStore = storeItems.find((s) => String(s.id) === String(item.id));
          const imageUrl = item.imageUrl || (item.photos && item.photos[0]) || matchingStore?.imageUrl || (matchingStore?.photos && matchingStore.photos[0]) || "";
          return {
            ...item,
            imageUrl,
            photos: item.photos && item.photos.length > 0 ? item.photos : imageUrl ? [imageUrl] : [],
          };
        });
        setRestaurants(merged as RestaurantEntry[]);
      } else {
        setRestaurants(storeItems as RestaurantEntry[]);
      }
    } catch (error) {
      console.error("Failed to load restaurants from database, falling back to store:", error);
      setRestaurants(cmsStore.getRestaurants() as RestaurantEntry[]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  // ============================================================
  // FILTER
  // ============================================================

  const filtered = restaurants.filter((restaurant) => {
    if (!restaurant) return false;

    const query = searchQuery.trim().toLowerCase();

    const restaurantName = restaurant.restaurantName || "";

    const location = restaurant.location || "";

    const matchesSearch =
      !query ||
      restaurantName.toLowerCase().includes(query) ||
      location.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "ALL" || restaurant.approvalStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ============================================================
  // CREATE
  // ============================================================

  const handleOpenCreateModal = () => {
    setEditingRest({
      restaurantName: "",
      location: "",
      contactDetails: "",
      cuisineTypes: [],
      openingHours: "",
      priceRange: "NPR NPR",
      photos: [],
      imageUrl: "",
      recommendedDishes: [],
      approvalStatus: "Draft",
      createdByName: "Content Team",
    });

    setIsModalOpen(true);
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleOpenEditModal = (restaurant: RestaurantEntry) => {
    const existingImage = restaurant.imageUrl || restaurant.photos?.[0] || "";

    setEditingRest({
      ...restaurant,
      imageUrl: existingImage,
      photos: restaurant.photos || (existingImage ? [existingImage] : []),
    });

    setIsModalOpen(true);
  };

  // ============================================================
  // DELETE FROM DATABASE
  // ============================================================

  const handleDelete = async (id: string | number) => {
    if (!confirm("Delete this restaurant record?")) {
      return;
    }

    try {
      setLoading(true);

      console.log(`DELETE /api/v1/restaurants/${id}`);

      await deleteRestaurant(String(id));

      console.log("Restaurant deleted successfully:", id);

      await loadRestaurants();
    } catch (error) {
      console.error("Failed to delete restaurant:", error);

      alert("Failed to delete restaurant from database.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ATTACH MEDIA
  // ============================================================

  const handleAttachMedia = (url: string) => {
    if (!editingRest || !url) return;

    const currentPhotos = editingRest.photos || [];

    const updatedPhotos = currentPhotos.includes(url)
      ? currentPhotos
      : [url, ...currentPhotos];

    setEditingRest({
      ...editingRest,
      imageUrl: url,
      photos: updatedPhotos,
    });
  };

  // ============================================================
  // REMOVE PHOTO
  // ============================================================

  const handleRemovePhoto = (photoUrl: string) => {
    if (!editingRest) return;

    const currentPhotos = editingRest.photos || [];

    const updatedPhotos = currentPhotos.filter((url) => url !== photoUrl);

    const currentImageUrl = editingRest.imageUrl || "";

    let newImageUrl = currentImageUrl;

    if (currentImageUrl === photoUrl) {
      newImageUrl = updatedPhotos[0] || "";
    }

    setEditingRest({
      ...editingRest,
      imageUrl: newImageUrl,
      photos: updatedPhotos,
    });
  };

  // ============================================================
  // BUILD API PAYLOAD
  // ============================================================

  const buildRestaurantPayload = (): RestaurantApiPayload => {
    if (!editingRest) {
      throw new Error("Restaurant form data is missing.");
    }

    const cuisineTypes = Array.isArray(editingRest.cuisineTypes)
      ? editingRest.cuisineTypes
          .map((value) => String(value).trim())
          .filter(Boolean)
      : [];

    const recommendedDishes = Array.isArray(editingRest.recommendedDishes)
      ? editingRest.recommendedDishes
          .map((value) => String(value).trim())
          .filter(Boolean)
      : [];

    const photos = Array.isArray(editingRest.photos)
      ? editingRest.photos.filter(Boolean)
      : [];

    const imageUrl = String(editingRest.imageUrl || photos[0] || "").trim();

    return {
      restaurantName: String(editingRest.restaurantName || "").trim(),

      location: String(editingRest.location || "").trim(),

      contactDetails: String(editingRest.contactDetails || "").trim(),

      cuisineTypes,

      openingHours: String(editingRest.openingHours || "").trim(),

      priceRange: String(editingRest.priceRange || "NPR NPR").trim(),

      imageUrl: imageUrl || undefined,

      approvalStatus: String(editingRest.approvalStatus || "Draft").trim(),

      createdByName: String(editingRest.createdByName || "Content Team").trim(),

      // recommendedDishes/photos are frontend fields.
      // Backend Restaurant model currently does not use them.
      // They are intentionally not sent to Prisma.
    };
  };

  // ============================================================
  // SAVE TO DATABASE
  // ============================================================

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingRest) return;

    const restaurantName = editingRest.restaurantName?.trim();

    if (!restaurantName) {
      alert("Please enter a restaurant name.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = buildRestaurantPayload();

      console.log("Restaurant payload:", payload);

      // Save to cmsStore (persists image url in memory & backend)
      await cmsStore.saveRestaurant({
        id: editingRest.id ? String(editingRest.id) : undefined,
        restaurantName: payload.restaurantName,
        location: payload.location,
        contactDetails: payload.contactDetails,
        cuisineTypes: payload.cuisineTypes,
        openingHours: payload.openingHours,
        priceRange: payload.priceRange as any,
        imageUrl: payload.imageUrl,
        photos: payload.imageUrl ? [payload.imageUrl] : [],
        approvalStatus: payload.approvalStatus as any,
        createdByName: payload.createdByName,
      });

      await loadRestaurants();

      setIsModalOpen(false);
      setEditingRest(null);
      setMediaPickerOpen(false);

      alert(
        editingRest.id
          ? "Restaurant updated successfully."
          : "Restaurant saved successfully to database.",
      );
    } catch (error: any) {
      console.error("Restaurant save error:", error);

      const message =
        error?.message ||
        error?.details?.message ||
        "Failed to save restaurant to database.";

      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // SAFE STRING
  // ============================================================

  const safeString = (value: string | undefined | null) => {
    return value || "N/A";
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <UtensilsCrossed className="w-4 h-4" />
            <span>Local Dining & Culinary Spots</span>
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Restaurant Module
          </h1>

          <p className="text-slate-400 text-xs mt-1">
            Manage Thakali kitchens, mountain bakeries, opening hours &
            recommended dishes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Restaurant</span>
        </button>
      </div>

      {/* SEARCH */}

      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />

          <input
            type="text"
            placeholder="Search restaurant name, location..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full bg-[#182238] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-1 bg-[#182238] border border-slate-700/80 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {["ALL", "Draft", "Under Review", "Approved", "Published"].map(
            (status) => (
              <button
                type="button"
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? "bg-emerald-500 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {status}
              </button>
            ),
          )}
        </div>
      </div>

      {/* GRID */}

      {filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800 text-slate-400">
          <UtensilsCrossed className="w-10 h-10 mx-auto text-slate-600 mb-3" />

          <p className="text-sm font-semibold">
            No restaurant entries found matching filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const cardImage = item.imageUrl || item.photos?.[0] || "";

            return (
              <div
                key={String(item.id)}
                className="glass-panel rounded-2xl border border-slate-800/90 overflow-hidden flex flex-col hover:border-slate-700 transition-all group"
              >
                {/* IMAGE */}

                <div className="relative h-52 w-full bg-slate-900 overflow-hidden">
                  {cardImage ? (
                    <img
                      src={cardImage}
                      alt={safeString(item.restaurantName)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                      No Photo
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex space-x-2">
                    <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-400 font-bold text-[10px] border border-white/10 flex items-center">
                      <DollarSign className="w-3 h-3 mr-0.5" />
                      {safeString(item.priceRange)}
                    </span>

                    {item.cuisineTypes?.length > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 font-bold text-[10px] border border-white/10">
                        {item.cuisineTypes[0]}
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <StatusBadge
                      status={item.approvalStatus}
                      entityType="Restaurant"
                      entityId={String(item.id)}
                    />
                  </div>

                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center">
                    <Star className="w-3 h-3 text-yellow-400 mr-1" />
                    4.3
                  </div>
                </div>

                {/* CONTENT */}

                <div className="p-4">
                  <h3 className="text-base font-bold text-white truncate">
                    {safeString(item.restaurantName)}
                  </h3>

                  <p className="text-xs text-slate-300 flex items-center mt-1">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-400 flex-shrink-0" />

                    <span className="truncate">
                      {safeString(item.location)}
                    </span>
                  </p>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400 border-y border-slate-800 py-2">
                    <span className="flex items-center min-w-0">
                      <Phone className="w-3.5 h-3.5 mr-1 flex-shrink-0" />

                      <span className="truncate">
                        {safeString(item.contactDetails)}
                      </span>
                    </span>

                    <span className="flex items-center ml-2">
                      <Clock className="w-3.5 h-3.5 mr-1 flex-shrink-0" />

                      <span className="truncate">
                        {safeString(item.openingHours)}
                      </span>
                    </span>
                  </div>

                  {item.cuisineTypes?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.cuisineTypes.slice(0, 3).map((cuisine, index) => (
                        <span
                          key={`${cuisine}-${index}`}
                          className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 text-[10px] font-semibold border border-slate-700"
                        >
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.recommendedDishes?.length > 0 && (
                    <div className="mt-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase flex items-center mb-0.5">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Recommended
                      </span>

                      <div className="flex flex-wrap gap-1">
                        {item.recommendedDishes
                          .slice(0, 2)
                          .map((dish, index) => (
                            <span
                              key={`${dish}-${index}`}
                              className="text-[10px] text-slate-300 bg-[#182238] px-1.5 py-0.5 rounded flex items-center"
                            >
                              <ChefHat className="w-2.5 h-2.5 mr-1 text-emerald-400" />
                              {dish}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* FOOTER */}

                <div className="px-4 py-2.5 bg-[#131C30] border-t border-slate-800 flex justify-between items-center mt-auto">
                  <span className="text-[9px] text-slate-400">
                    Added by {safeString(item.createdByName)}
                  </span>

                  <div className="flex space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
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
          FORM MODAL
      ======================================================== */}

      {isModalOpen && editingRest && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            {/* HEADER */}

            <div className="px-6 py-4 border-b border-slate-800 bg-[#182238] flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">
                {editingRest.id ? "Edit Restaurant" : "Add New Restaurant"}
              </h3>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingRest(null);
                  setMediaPickerOpen(false);
                }}
                className="text-slate-400 hover:text-white disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSave}
              className="p-6 overflow-y-auto space-y-4 text-xs"
            >
              {/* NAME */}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Restaurant Name *
                </label>

                <input
                  type="text"
                  required
                  value={editingRest.restaurantName || ""}
                  onChange={(event) =>
                    setEditingRest({
                      ...editingRest,
                      restaurantName: event.target.value,
                    })
                  }
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* LOCATION + CONTACT */}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Location
                  </label>

                  <input
                    type="text"
                    value={editingRest.location || ""}
                    onChange={(event) =>
                      setEditingRest({
                        ...editingRest,
                        location: event.target.value,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Contact Details
                  </label>

                  <input
                    type="text"
                    value={editingRest.contactDetails || ""}
                    onChange={(event) =>
                      setEditingRest({
                        ...editingRest,
                        contactDetails: event.target.value,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="+977-9856011999"
                  />
                </div>
              </div>

              {/* CUISINE */}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Cuisine Types (comma separated)
                </label>

                <input
                  type="text"
                  value={(editingRest.cuisineTypes || []).join(", ")}
                  onChange={(event) =>
                    setEditingRest({
                      ...editingRest,
                      cuisineTypes: event.target.value
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Thakali, Nepali, Italian"
                />
              </div>

              {/* OPENING + PRICE */}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Opening Hours
                  </label>

                  <input
                    type="text"
                    value={editingRest.openingHours || ""}
                    onChange={(event) =>
                      setEditingRest({
                        ...editingRest,
                        openingHours: event.target.value,
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="07:00 AM - 09:00 PM"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Price Range
                  </label>

                  <select
                    value={editingRest.priceRange || "NPR"}
                    onChange={(event) =>
                      setEditingRest({
                        ...editingRest,
                        priceRange: event.target.value as
                          | "NPR"
                          | "NPR NPR"
                          | "NPR NPR NPR"
                          | "NPR NPR NPR NPR",
                      })
                    }
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="NPR">NPR</option>

                    <option value="NPR NPR">NPR NPR</option>

                    <option value="NPR NPR NPR">NPR NPR NPR</option>
                    
                    <option value="NPR NPR NPR NPR">NPR NPR NPR NPR</option>
                  </select>
                </div>
              </div>

              {/* DISHES */}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Recommended Dishes (comma separated)
                </label>

                <input
                  type="text"
                  value={(editingRest.recommendedDishes || []).join(", ")}
                  onChange={(event) =>
                    setEditingRest({
                      ...editingRest,
                      recommendedDishes: event.target.value
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Dal Bhat, Momo, Thukpa"
                />
              </div>

              {/* IMAGE */}

              {editingRest.imageUrl && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Restaurant Photo
                  </label>

                  <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
                    <img
                      src={editingRest.imageUrl}
                      alt="Restaurant"
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleRemovePhoto(editingRest.imageUrl || "")
                      }
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 hover:bg-red-600 text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PHOTOS */}

              {editingRest.photos && editingRest.photos.length > 0 && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Attached Photos ({editingRest.photos.length})
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {editingRest.photos.map((photo, index) => (
                      <div
                        key={`${photo}-${index}`}
                        className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-800 border border-slate-700"
                      >
                        <img
                          src={photo}
                          alt={`Restaurant photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {editingRest.imageUrl === photo && (
                          <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 text-[8px] text-center text-white">
                            MAIN
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo)}
                          className="absolute top-0 right-0 p-0.5 bg-red-500/90 hover:bg-red-600 rounded-bl-lg text-white"
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
                  label="Restaurant Photo (Select File from Computer / Device)"
                  value={editingRest.imageUrl || (editingRest.photos && editingRest.photos[0]) || ""}
                  onChange={(url) =>
                    setEditingRest({
                      ...editingRest,
                      imageUrl: url,
                      photos: [url, ...(editingRest.photos || [])],
                    })
                  }
                  onClear={() =>
                    setEditingRest({
                      ...editingRest,
                      imageUrl: "",
                      photos: [],
                    })
                  }
                  category="Restaurants"
                />

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Or choose from existing Media Library:</span>
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

              {/* ACTIONS */}

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingRest(null);
                    setMediaPickerOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Restaurant</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEDIA PICKER */}

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelectMedia={handleAttachMedia}
        title="Select Photo for Restaurant"
      />
    </div>
  );
}
