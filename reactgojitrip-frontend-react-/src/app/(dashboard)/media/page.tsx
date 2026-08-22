"use client";

import React from "react";
import { cmsStore } from "@/lib/cms-store";
import { MediaItem } from "@/types/cms";
import {
  Image as ImageIcon,
  UploadCloud,
  Search,
  Tag,
  Trash2,
  Video,
  FileText,
  Copy,
  CheckCircle2,
  Plus,
  Loader2,
  RefreshCw,
} from "lucide-react";

// Define type-safe category and file type options
type CategoryType = MediaItem["category"];
type FileType = MediaItem["fileType"];

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = React.useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("ALL");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // New Media Uploader Form State
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newUrl, setNewUrl] = React.useState("");
  const [newCategory, setNewCategory] =
    React.useState<CategoryType>("Destinations");
  const [newType, setNewType] = React.useState<FileType>("Photo");
  const [newTags, setNewTags] = React.useState("Nepal, Travel, GojiTrip");

  // =============== FIXED: Refresh data function with debugging ===============
  const refreshData = React.useCallback(() => {
    try {
      console.log("Refreshing media data...");
      const data = cmsStore.getMedia();
      console.log("Raw media data from store:", data);

      // Ensure we always have an array and filter out any invalid items
      const validData = Array.isArray(data)
        ? data.filter((item) => {
            if (!item || !item.id) {
              console.warn("Invalid media item found:", item);
              return false;
            }
            return true;
          })
        : [];

      console.log("Valid media data:", validData);
      setMediaList(validData);
      setError(null);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching media:", error);
      setError("Failed to load media. Please try refreshing.");
      setMediaList([]);
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    console.log("Media page mounted, initializing data...");
    refreshData();

    const unsubscribe = cmsStore.subscribe(() => {
      console.log("Store updated, refreshing media data...");
      refreshData();
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [refreshData]);

  // Also refresh when component becomes visible
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Page became visible, refreshing data...");
        refreshData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshData]);

  // =============== FIXED: Safe filtering with proper null checks ===============
  const filtered = mediaList.filter((item) => {
    // Skip if item is null/undefined or missing required fields
    if (!item || !item.title) return false;

    // Safely convert to lowercase with null checks
    const title = item.title || "";
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const searchLower = searchQuery ? searchQuery.toLowerCase() : "";

    const matchesSearch =
      title.toLowerCase().includes(searchLower) ||
      tags.some((t) => t && t.toLowerCase().includes(searchLower));

    const matchesCategory =
      categoryFilter === "ALL" || item.category === categoryFilter;
    const matchesType = typeFilter === "ALL" || item.fileType === typeFilter;

    if (!matchesSearch || !matchesCategory || !matchesType) {
      console.log(`Filtered out item: ${title}, cat: ${item.category}, filter: ${categoryFilter}`);
    }

    return matchesSearch && matchesCategory && matchesType;
  });

  const handleCopyUrl = (url: string, id: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (!id) return;
    if (confirm("Delete media asset from central library?")) {
      console.log("Deleting media:", id);
      cmsStore.deleteMedia(id);
      // Force refresh after delete
      setTimeout(() => refreshData(), 100);
    }
  };

  // =============== FIXED: Upload handler with proper refresh ===============
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !newTitle.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the media item
      const newMediaItem = {
        id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: newTitle.trim(),
        fileType: newType,
        category: newCategory,
        url: newUrl.trim(),
        thumbnailUrl: newUrl.trim(),
        fileSizeMb: parseFloat((Math.random() * 3 + 1).toFixed(1)),
        tags: newTags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t), // Filter empty tags
        uploadedBy: "Content Team",
        createdAt: new Date().toISOString(),
      };

      console.log("Adding new media item:", newMediaItem);

      // Add to store
      cmsStore.addMedia(newMediaItem as any);

      // Close modal and reset form
      setIsUploadModalOpen(false);
      setNewTitle("");
      setNewUrl("");
      setNewCategory("Destinations");
      setNewType("Photo");
      setNewTags("Nepal, Travel, GojiTrip");

      // Force refresh after a short delay to ensure store is updated
      setTimeout(() => {
        console.log("Refreshing after upload...");
        refreshData();
        setIsSubmitting(false);
      }, 300);
    } catch (error) {
      console.error("Error uploading media:", error);
      alert("Failed to upload media. Please try again.");
      setIsSubmitting(false);
    }
  };

  // =============== FIXED: Type-safe category change handler ===============
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    // Validate that the value is a valid category
    const validCategories: CategoryType[] = [
      "Hotels",
      "Routes",
      "Transport",
      "Restaurants",
      "Activities",
      "Destinations",
    ];
    if (validCategories.includes(value as CategoryType)) {
      setNewCategory(value as CategoryType);
    }
  };

  // =============== FIXED: Type-safe file type change handler ===============
  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    // Validate that the value is a valid file type
    const validFileTypes: FileType[] = ["Photo", "Video", "Document"];
    if (validFileTypes.includes(value as FileType)) {
      setNewType(value as FileType);
    }
  };

  const getTypeIcon = (type: MediaItem["fileType"]) => {
    if (!type) return <ImageIcon className="w-4 h-4 text-emerald-400" />;

    switch (type) {
      case "Photo":
        return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case "Video":
        return <Video className="w-4 h-4 text-purple-400" />;
      case "Document":
        return <FileText className="w-4 h-4 text-cyan-400" />;
      default:
        return <ImageIcon className="w-4 h-4 text-emerald-400" />;
    }
  };

  // =============== FIXED: Safe string formatter ===============
  const safeString = (value: string | undefined | null): string => {
    return value || "Untitled";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Loading media library...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-red-400 mb-3" />
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              refreshData();
            }}
            className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ImageIcon className="w-4 h-4" />
            <span>Centralized Digital Asset Storage</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Media Library
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Upload and reuse verified photos, videos, and documents across
            hotels, routes, transport, activities & destinations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => refreshData()}
            className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center space-x-1"
            title="Refresh media library"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center space-x-1.5"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Media Asset</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="text-xs text-slate-400">
        Total media assets: {mediaList.length} | Filtered: {filtered.length}
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tags or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#182238] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center space-x-1 bg-[#182238] border border-slate-700/80 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {[
            "ALL",
            "Hotels",
            "Routes",
            "Transport",
            "Restaurants",
            "Activities",
            "Destinations",
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? "bg-emerald-500 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800 text-slate-400">
          <ImageIcon className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-semibold">
            {mediaList.length === 0
              ? "No media assets in library. Click 'Upload Media Asset' to add your first image."
              : "No media assets found matching your search."}
          </p>
          {mediaList.length === 0 && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Media</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id || Math.random()}
              className="glass-panel rounded-2xl border border-slate-800/90 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="relative h-40 w-full bg-slate-900 overflow-hidden">
                  {/* =============== FIXED: Safe image rendering =============== */}
                  {item.url ? (
                    <img
                      src={item.url}
                      alt={safeString(item.title)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback for broken images
                        (e.target as HTMLImageElement).style.display = "none";
                        (
                          e.target as HTMLImageElement
                        ).parentElement!.innerHTML =
                          '<div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">Image not available</div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                      No Image URL
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5 flex space-x-1.5">
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white flex items-center">
                      {getTypeIcon(item.fileType)}
                      <span className="ml-1">{safeString(item.fileType)}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                      {safeString(item.category)}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-xs text-white truncate">
                    {safeString(item.title)}
                  </h3>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Size: {item.fileSizeMb || "N/A"} MB • Uploaded by{" "}
                    {safeString(item.uploadedBy)}
                  </div>

                  {/* =============== FIXED: Safe tags rendering =============== */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {Array.isArray(item.tags) &&
                      item.tags.map((t, i) =>
                        t ? (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-medium flex items-center"
                          >
                            <Tag className="w-2.5 h-2.5 mr-0.5 text-slate-400" />{" "}
                            #{t}
                          </span>
                        ) : null,
                      )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 py-2.5 bg-[#131C30] border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleCopyUrl(item.url, item.id)}
                  className="text-xs font-semibold text-emerald-400 hover:underline flex items-center"
                  disabled={!item.url}
                >
                  {copiedId === item.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />{" "}
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" /> Copy Image URL
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#182238] flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">
                Upload New Media Asset
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleUploadSubmit}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Asset Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mustang Valley Jeep Trail Photo"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Direct Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
                {newUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden h-32 bg-slate-900">
                    <img
                      src={newUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (
                          e.target as HTMLImageElement
                        ).parentElement!.innerHTML =
                          '<div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">Invalid image URL</div>';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={handleCategoryChange}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Hotels">Hotels</option>
                    <option value="Routes">Routes</option>
                    <option value="Transport">Transport</option>
                    <option value="Restaurants">Restaurants</option>
                    <option value="Activities">Activities</option>
                    <option value="Destinations">Destinations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    File Type
                  </label>
                  <select
                    value={newType}
                    onChange={handleFileTypeChange}
                    className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Photo">Photo</option>
                    <option value="Video">Video</option>
                    <option value="Document">Document</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g., Nepal, Travel, Mountain"
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add to Library</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
