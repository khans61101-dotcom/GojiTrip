"use client";

import React from "react";
import { apiRequest } from "@/lib/api";
import { MediaItem } from "@/types/cms";
import {
  X,
  Image as ImageIcon,
  Plus,
  Check,
  Search,
  Loader2,
  UploadCloud,
} from "lucide-react";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (url: string) => void;
  title?: string;
  filterCategory?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectMedia,
  title = "Select Media Asset",
  filterCategory = "Hotels",
}) => {
  const [mediaList, setMediaList] = React.useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"library" | "upload">(
    "library",
  );

  // Upload states
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  /**
   * Fetch media from backend
   */
  const fetchMedia = React.useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await apiRequest<any>("/media");

      // Support both:
      // 1. [...]
      // 2. { data: [...] }
      const data: any[] = Array.isArray(response)
        ? response
        : response &&
            typeof response === "object" &&
            Array.isArray(response.data)
          ? response.data
          : [];

      const mappedMedia: MediaItem[] = data.map((m) => ({
        id: String(m.id ?? ""),
        title: m.title || "Untitled Media",
        fileType: m.fileType || "",
        category: m.category || "",
        url: m.url || "/logo/gojitriplogo.jpg",
        thumbnailUrl: m.thumbnailUrl || m.url || "/logo/gojitriplogo.jpg",
        fileSizeMb: m.fileSizeMb ?? 0,
        tags: Array.isArray(m.tags) ? m.tags : [],
        uploadedAt: m.uploadedAt || "",
        uploadedBy: m.uploadedBy || "",
      }));

      const uniqueMedia: MediaItem[] = [];
      const seenKeys = new Set<string>();

      for (const item of mappedMedia) {
        const key = (item.url || item.thumbnailUrl || "").trim().toLowerCase();
        if (key && !seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueMedia.push(item);
        } else if (!key) {
          uniqueMedia.push(item);
        }
      }

      setMediaList(uniqueMedia);
    } catch (error) {
      console.error("Error fetching media:", error);
      setMediaList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch media whenever modal opens
   */
  React.useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, fetchMedia]);

  if (!isOpen) {
    return null;
  }

  /**
   * Filter media
   */
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredMedia = mediaList.filter((media) => {
    const category = media.category || "";

    const tags = Array.isArray(media.tags) ? media.tags : [];

    const title = media.title || "";

    const matchesCategory =
      category === filterCategory ||
      tags.some(
        (tag) =>
          String(tag || "").toLowerCase() === filterCategory.toLowerCase(),
      );

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const matchesTitle = title.toLowerCase().includes(normalizedSearch);

    const matchesTags = tags.some((tag) =>
      String(tag || "")
        .toLowerCase()
        .includes(normalizedSearch),
    );

    return matchesTitle || matchesTags;
  });

  /**
   * Handle file upload
   */
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      return;
    }

    setIsUploading(true);

    try {
      /**
       * Generate a stable placeholder URL.
       *
       * IMPORTANT:
       * `placeholderUrl` was previously missing, which caused:
       *
       * Cannot find name 'placeholderUrl'
       *
       * We generate it here before using it.
       */
      const fileNameWithoutExtension = selectedFile.name
        .replace(/\.[^/.]+$/, "")
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "-");

      const seed = fileNameWithoutExtension || `media-${Date.now()}`;

      const placeholderUrl = `https://picsum.photos/seed/${encodeURIComponent(
        seed,
      )}/800/500`;

      console.log("Uploading media:", {
        title: selectedFile.name,
        url: placeholderUrl,
        category: filterCategory,
      });

      await apiRequest("/media/upload", {
        method: "POST",
        body: {
          title: selectedFile.name,
          url: placeholderUrl,
          category: filterCategory,
          entityType: "hotel",
        },
      });

      // Refresh media library
      await fetchMedia();

      // Switch back to library
      setActiveTab("library");

      // Clear selected file
      setSelectedFile(null);

      // Reset file input if necessary
      const fileInput = document.getElementById(
        "media-file-upload",
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-emerald-400" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-white">{title}</h2>

              <p className="text-xs text-slate-500">
                {filterCategory} media library
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-6 pt-4 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setActiveTab("library")}
              className={`pb-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === "library"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Media Library ({filteredMedia.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`pb-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === "upload"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Upload
            </button>
          </div>

          {/* Search */}
          {activeTab === "library" && (
            <div className="relative hidden sm:block w-64 mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search media..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "library" ? (
            isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-7 h-7 animate-spin text-emerald-500 mb-3" />

                <p className="text-xs text-slate-400">Loading media...</p>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-900 flex items-center justify-center">
                  <ImageIcon className="w-7 h-7 text-slate-500" />
                </div>

                <h3 className="text-sm font-semibold text-slate-300 mb-1">
                  No Media Found
                </h3>

                <p className="text-xs text-slate-500">
                  No media assets found for {filterCategory}.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Upload Media
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredMedia.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      onSelectMedia(item.url);
                      onClose();
                    }}
                    className="text-left cursor-pointer group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video hover:border-emerald-500/80 transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <img
                      src={
                        item.thumbnailUrl ||
                        item.url ||
                        "/logo/gojitriplogo.jpg"
                      }
                      alt={item.title || "Media"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;

                        if (target.src.includes("/logo/gojitriplogo.jpg")) {
                          return;
                        }

                        target.src = "/logo/gojitriplogo.jpg";
                      }}
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                      <p className="text-[10px] text-white truncate">
                        {item.title || "Untitled"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            <form
              onSubmit={handleUpload}
              className="space-y-5 max-w-md mx-auto py-8"
            >
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-8 text-center transition-colors">
                <UploadCloud className="w-10 h-10 text-slate-500 mx-auto mb-4" />

                <h3 className="text-sm font-semibold text-slate-200 mb-1">
                  Select Media File
                </h3>

                <p className="text-xs text-slate-500 mb-5">
                  Choose an image to add to the media library
                </p>

                <label
                  htmlFor="media-file-upload"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Choose File
                </label>

                <input
                  id="media-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        alert("File size exceeds 5MB limit. Please select an image under 5MB.");
                        e.target.value = "";
                        setSelectedFile(null);
                        return;
                      }
                      setSelectedFile(file);
                    }
                  }}
                  className="hidden"
                />

                {selectedFile && (
                  <div className="mt-5 p-3 bg-slate-900 border border-slate-800 rounded-lg text-left">
                    <p className="text-xs text-slate-300 truncate">
                      {selectedFile.name}
                    </p>

                    <p className="text-[10px] text-slate-500 mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  !selectedFile || isUploading
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    Upload Media
                  </>
                )}
              </button>

              <p className="text-[10px] text-slate-500 text-center">
                The selected image will be added to the {filterCategory} media
                library.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
