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

/**
 * Strict Pre-Save Image Payload Validation.
 * Checks if any image Base64 data string exceeds ~900KB limit (1.2 million chars).
 */
export function validateImagePayloads(images: (string | null | undefined)[]): { valid: boolean; errorMsg?: string } {
  const MAX_BASE64_LENGTH = 1.2 * 1024 * 1024; // ~900KB max per Base64 image
  for (const img of images) {
    if (!img) continue;
    if (typeof img === "string" && img.startsWith("data:")) {
      if (img.length > MAX_BASE64_LENGTH) {
        return {
          valid: false,
          errorMsg: "Warning: Attached image size is too large (>900KB compressed). Please select a smaller image file so your data can be saved permanently.",
        };
      }
    }
  }
  return { valid: true };
}

/**
 * Re-compresses an existing Base64 Data URL to stay well under database limits.
 */
export function compressDataUrl(dataUrl: string, maxDimension = 800, quality = 0.65): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith("data:image")) {
    return Promise.resolve(dataUrl);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      const limit = Math.min(maxDimension, 800);
      if (width > limit || height > limit) {
        if (width > height) {
          height = Math.round((height * limit) / width);
          width = limit;
        } else {
          width = Math.round((width * limit) / height);
          height = limit;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      let compressed = canvas.toDataURL("image/jpeg", Math.min(quality, 0.65));
      const MAX_B64 = 800 * 1024;
      if (compressed.length > MAX_B64) {
        compressed = canvas.toDataURL("image/jpeg", 0.40);
      }
      if (compressed.length > MAX_B64) {
        const canvas2 = document.createElement("canvas");
        canvas2.width = Math.round(width * 0.6);
        canvas2.height = Math.round(height * 0.6);
        const ctx2 = canvas2.getContext("2d");
        if (ctx2) {
          ctx2.drawImage(img, 0, 0, canvas2.width, canvas2.height);
          compressed = canvas2.toDataURL("image/jpeg", 0.40);
        }
      }
      resolve(compressed);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Ensures all images in a list (whether data URLs or URLs) are sanitized and compressed.
 */
export async function sanitizeAndCompressImages(images: (string | null | undefined)[]): Promise<string[]> {
  const result: string[] = [];
  for (const img of images) {
    if (!img) continue;
    if (typeof img === "string" && img.startsWith("data:image")) {
      try {
        const compressed = await compressDataUrl(img, 800, 0.65);
        result.push(compressed);
      } catch {
        result.push(img);
      }
    } else if (typeof img === "string" && img.trim()) {
      result.push(img.trim());
    }
  }
  return result;
}

export function compressImageFile(file: File, maxDimension = 800, quality = 0.65): Promise<string> {
  return new Promise((resolve, reject) => {
    const maxSize = 5 * 1024 * 1024; // 5MB limit
    if (file.size > maxSize) {
      reject(new Error("File size exceeds 5MB limit. Please select an image under 5MB."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Limit max dimension to 800px for DB-safe output
        const limit = Math.min(maxDimension, 800);
        if (width > limit || height > limit) {
          if (width > height) {
            height = Math.round((height * limit) / width);
            width = limit;
          } else {
            width = Math.round((width * limit) / height);
            height = limit;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Always output JPEG for best compression (PNG → JPEG gives huge savings)
        const q = Math.min(quality, 0.65);
        let compressedDataUrl = canvas.toDataURL("image/jpeg", q);

        // Second pass: if still > ~600KB base64 string, compress harder
        const MAX_B64 = 800 * 1024; // ~600KB binary = ~800K base64 chars
        if (compressedDataUrl.length > MAX_B64) {
          compressedDataUrl = canvas.toDataURL("image/jpeg", 0.40);
        }

        // Third pass: reduce resolution 60% and re-compress
        if (compressedDataUrl.length > MAX_B64) {
          const canvas2 = document.createElement("canvas");
          canvas2.width = Math.round(width * 0.6);
          canvas2.height = Math.round(height * 0.6);
          const ctx2 = canvas2.getContext("2d");
          if (ctx2) {
            ctx2.drawImage(img, 0, 0, canvas2.width, canvas2.height);
            compressedDataUrl = canvas2.toDataURL("image/jpeg", 0.40);
          }
        }

        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        resolve(event.target?.result as string);
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
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

  const processFile = async (file: File) => {
    setError(null);

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size exceeds 5MB limit. Please upload an image under 5MB.");
      alert("File size exceeds 5MB limit. Please upload an image under 5MB.");
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, WEBP)");
      return;
    }

    setIsUploading(true);

    try {
      const dataUrl = await compressImageFile(file, 800, 0.65);

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
    } catch (err: any) {
      setError(err?.message || "Failed to process image file.");
      alert(err?.message || "Failed to process image file.");
    } finally {
      setIsUploading(false);
    }
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
