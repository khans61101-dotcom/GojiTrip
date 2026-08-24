"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon, X, FileImage, Check } from "lucide-react";
import { cmsStore } from "@/lib/cms-store";

interface ImageFileInputProps {
  label?: string;
  value?: string;
  onChange: (imageUrl: string) => void;
  onClear?: () => void;
  category?: "Hotels" | "Restaurants" | "Transport" | "Activities" | "Destinations" | "Routes";
}

export const ImageFileInput: React.FC<ImageFileInputProps> = ({
  label = "Upload Image File from Device",
  value,
  onChange,
  onClear,
  category = "Hotels",
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setError(null);

    // Validate size (max 8MB)
    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be under 8MB");
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, WEBP)");
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      
      // Auto-save to CMS Media Store
      try {
        cmsStore.addMedia({
          id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          fileType: "Photo",
          category: category as any,
          url: dataUrl,
          thumbnailUrl: dataUrl,
          fileSizeMb: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
          tags: [category, "Uploaded"],
          uploadedBy: "Admin",
          createdAt: new Date().toISOString(),
        } as any);
      } catch (err) {
        console.error("Error saving media item:", err);
      }

      onChange(dataUrl);
      setIsUploading(false);
    };

    reader.onerror = () => {
      setError("Failed to read image file.");
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold text-slate-300">
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image Preview or Dropzone */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden bg-[#182238] border border-emerald-500/40 p-2 flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-700">
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>Image Attached</span>
            </div>
            <p className="text-[10px] text-slate-400 truncate mt-0.5 max-w-[200px]">
              {value.startsWith("data:") ? "Local File Selected" : value}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => {
                if (onClear) onClear();
                else onChange("");
              }}
              className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              title="Remove Image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition-all flex flex-col items-center justify-center gap-2 ${
            dragActive
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-slate-700/80 bg-[#182238]/60 hover:border-emerald-500/50 hover:bg-[#182238]"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">
              Click to Choose File from Device
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Supports JPG, PNG, WEBP (Drag & Drop allowed)
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-[10px] font-semibold">⚠ {error}</p>
      )}
    </div>
  );
};

export default ImageFileInput;
