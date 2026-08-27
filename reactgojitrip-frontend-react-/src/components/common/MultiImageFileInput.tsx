"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, Plus, X, Image as ImageIcon, Link as LinkIcon, FolderOpen } from "lucide-react";
import { cmsStore } from "@/lib/cms-store";

interface MultiImageFileInputProps {
  label?: string;
  images: string[];
  onChange: (images: string[]) => void;
  category?: "Hotels" | "Restaurants" | "Transport" | "Activities" | "Destinations" | "Routes";
  maxImages?: number;
  onOpenMediaPicker?: () => void;
}

export const MultiImageFileInput: React.FC<MultiImageFileInputProps> = ({
  label = "Photo Gallery (Add Multiple Images)",
  images = [],
  onChange,
  category = "Hotels",
  maxImages = 10,
  onOpenMediaPicker,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);

    if (images.length + fileArray.length > maxImages) {
      setError(`Maximum limit is ${maxImages} images.`);
    }

    const availableSlots = maxImages - images.length;
    const filesToProcess = fileArray.slice(0, availableSlots);

    if (filesToProcess.length === 0) return;

    setIsUploading(true);

    try {
      const base64Results = await Promise.all(
        filesToProcess.map(async (file) => {
          const dataUrl = await readFileAsDataUrl(file);
          try {
            cmsStore.addMedia({
              id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              title: file.name.replace(/\.[^/.]+$/, ""),
              fileType: "Photo",
              category: category as any,
              url: dataUrl,
              thumbnailUrl: dataUrl,
              fileSizeMb: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
              tags: [category, "GalleryUpload"],
              uploadedBy: "Admin",
              createdAt: new Date().toISOString(),
            } as any);
          } catch (err) {
            console.error("Error saving media item:", err);
          }
          return dataUrl;
        })
      );

      onChange([...images, ...base64Results]);
    } catch (err) {
      console.error("Failed to process uploaded images:", err);
      setError("Failed to process some image files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = ""; // Reset input so same file can be re-selected
    }
  };

  const handleAddUrl = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!inputUrl.trim()) return;
    if (images.length >= maxImages) {
      setError(`Maximum limit is ${maxImages} images.`);
      return;
    }
    const cleanUrl = inputUrl.trim();
    if (!images.includes(cleanUrl)) {
      onChange([...images, cleanUrl]);
    }
    setInputUrl("");
    setShowUrlInput(false);
    setError(null);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="space-y-3 bg-[#131c31]/90 p-4 rounded-2xl border border-slate-800 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
          <ImageIcon className="w-4 h-4 text-emerald-400" />
          <span>{label} ({images.length}/{maxImages})</span>
        </label>

        <div className="flex items-center space-x-2">
          {onOpenMediaPicker && (
            <button
              type="button"
              onClick={onOpenMediaPicker}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20"
            >
              <FolderOpen className="w-3 h-3" />
              <span>Media Library</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 transition-colors flex items-center space-x-1"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? "Hide URL" : "+ Add URL"}</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input for Multiple Selection */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* URL Input Box (Without Nested Form Tag to Avoid Form Submit Collisions) */}
      {showUrlInput && (
        <div className="flex gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
          <input
            type="url"
            placeholder="Paste Image URL (https://...)"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl(e);
              }
            }}
            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={(e) => handleAddUrl(e)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-md transition-all flex-shrink-0"
          >
            Add
          </button>
        </div>
      )}

      {/* GALLERY THUMBNAIL GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map((imgUrl, idx) => (
          <div
            key={idx}
            className="relative group aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-md"
          >
            <img
              src={imgUrl}
              alt={`Gallery Image ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80";
              }}
            />

            {/* Photo Index Badge */}
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white font-black text-[9px] backdrop-blur-sm">
              #{idx + 1} {idx === 0 ? "(Main)" : ""}
            </div>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => handleRemoveImage(idx)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-700 transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 shadow-md"
              title="Remove Photo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* ADD MORE PHOTOS BUTTON DROPZONE */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="aspect-square rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500/80 bg-slate-900/60 hover:bg-slate-900 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-all p-2 text-center"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[10px] font-bold">+ Add Photos</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-[10px] font-semibold">⚠ {error}</p>
      )}
    </div>
  );
};

export default MultiImageFileInput;
