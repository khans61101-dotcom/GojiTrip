"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tag, Plus, X, Sparkles } from "lucide-react";

interface TagInputSectionProps {
  label: string;
  placeholder?: string;
  value?: string[] | string;
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  dark?: boolean;
}

export const TagInputSection: React.FC<TagInputSectionProps> = ({
  label,
  placeholder = "Type and press Enter or comma ( , ) to add...",
  value = [],
  onChange,
  suggestions = [],
  dark = true,
}) => {
  // Standardize value into string[]
  const parseTags = (input: string[] | string | undefined): string[] => {
    if (Array.isArray(input)) return input.filter(Boolean);
    if (typeof input === "string") {
      return input.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const initialParsed = parseTags(value);
  const [tags, setTags] = useState<string[]>(initialParsed);
  const [inputValue, setInputValue] = useState("");

  const lastEmittedJsonRef = useRef<string>(JSON.stringify(initialParsed));

  // Re-sync when value prop changes from OUTSIDE (e.g. opening edit modal for a different record)
  useEffect(() => {
    const currentPropParsed = parseTags(value);
    const currentPropJson = JSON.stringify(currentPropParsed);

    if (currentPropJson !== lastEmittedJsonRef.current) {
      lastEmittedJsonRef.current = currentPropJson;
      setTags(currentPropParsed);
    }
  }, [JSON.stringify(value)]);

  const emitChange = (newTags: string[]) => {
    const newJson = JSON.stringify(newTags);
    lastEmittedJsonRef.current = newJson;
    setTags(newTags);
    onChange(newTags);
  };

  const addTag = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      return;
    }
    const updated = [...tags, trimmed];
    setInputValue("");
    emitChange(updated);
  };

  const removeTag = (indexToRemove: number) => {
    const updated = tags.filter((_, idx) => idx !== indexToRemove);
    emitChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  const bgInputClass = dark
    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500"
    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-emerald-500 focus:border-emerald-500";

  const labelClass = dark ? "text-slate-300" : "text-slate-700";

  return (
    <div className={`p-4 rounded-2xl border space-y-3 ${dark ? "bg-slate-900/80 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
      <div className="flex items-center justify-between">
        <label className={`block font-bold text-xs flex items-center space-x-1.5 uppercase tracking-wider ${labelClass}`}>
          <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{label}</span>
        </label>
        <span className="text-[11px] font-semibold text-emerald-400/90">
          {tags.length} Added
        </span>
      </div>

      {/* INPUT FIELD */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 font-medium transition-all ${bgInputClass}`}
        />
        {inputValue.trim() && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              addTag(inputValue);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-lg transition-all flex items-center space-x-1 shadow-sm"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        )}
      </div>

      {/* TAG CHIP BOXES ROW */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {tags.map((tag, idx) => (
            <div
              key={`${tag}-${idx}`}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs shadow-sm hover:border-emerald-400 transition-all group"
            >
              <span className="max-w-[200px] truncate">{tag}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  removeTag(idx);
                }}
                className="p-0.5 rounded-md hover:bg-emerald-500/20 text-emerald-400 hover:text-red-400 transition-colors"
                title="Remove item"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* QUICK SUGGESTIONS CHIPS (IF PROVIDED) */}
      {suggestions.length > 0 && (
        <div className="pt-1 border-t border-slate-800/60">
          <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Quick Suggestions (Click to Add):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions
              .filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()))
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    addTag(s);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all flex items-center space-x-1 ${
                    dark
                      ? "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10"
                      : "bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  <Plus className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{s}</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
