"use client";

import React from "react";
import { MapPin, Route as RouteIcon, X, ChevronRight } from "lucide-react";

import { type RouteStop } from "@/lib/api";

type AddRouteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  stopName: string;
  nextStop: RouteStop | null;
  onAddRoute: (stop: RouteStop) => void;
};

export default function AddRouteModal({
  isOpen,
  onClose,
  stopName,
  nextStop,
  onAddRoute,
}: AddRouteModalProps) {
  if (!isOpen) {
    return null;
  }

  const handleAddNextStop = () => {
    if (!nextStop) {
      return;
    }

    onAddRoute(nextStop);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <RouteIcon size={21} className="text-blue-600" />

              <h2 className="text-xl font-bold text-slate-900">Add Route</h2>
            </div>

            <p className="text-sm text-slate-500 mt-1">
              Add a stop after{" "}
              <strong className="text-slate-700">{stopName}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label="Close"
          >
            <X size={21} />
          </button>
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div className="p-5">
          {/* =================================================
              CURRENT -> NEXT PREVIEW
          ================================================== */}

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5">
            <div className="flex items-center gap-3">
              {/* CURRENT STOP */}

              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <MapPin size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600">
                    Current Stop
                  </p>

                  <p className="font-semibold text-slate-900 truncate">
                    {stopName}
                  </p>
                </div>
              </div>

              <ChevronRight size={20} className="text-slate-400 shrink-0" />

              {/* NEXT STOP ICON */}

              <div
                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${
                  nextStop
                    ? "bg-purple-600 text-white"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                <MapPin size={18} />
              </div>
            </div>

            {/* NEXT NAME */}

            {nextStop && (
              <div className="mt-3 pl-1">
                <p className="text-[10px] uppercase tracking-wider font-bold text-purple-600">
                  Next Location
                </p>

                <p className="font-semibold text-slate-900">{nextStop.name}</p>
              </div>
            )}
          </div>

          {/* =================================================
              NEXT STOP
          ================================================== */}

          {nextStop ? (
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                Available Next Location
              </p>

              <button
                type="button"
                onClick={handleAddNextStop}
                className="w-full text-left p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  {/* ICON */}

                  <div className="w-10 h-10 shrink-0 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>

                  {/* DETAILS */}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-slate-900">
                        {nextStop.name}
                      </div>

                      <ChevronRight
                        size={18}
                        className="text-slate-400 group-hover:text-blue-600 transition-colors"
                      />
                    </div>

                    {nextStop.address && (
                      <div className="text-xs text-slate-500 mt-1">
                        {nextStop.address}
                      </div>
                    )}

                    <div className="text-xs text-purple-600 font-medium mt-2">
                      Click to add this location to your route
                    </div>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="p-5 text-center rounded-xl border border-slate-200 bg-slate-50">
              <MapPin size={30} className="mx-auto text-slate-400 mb-2" />

              <p className="font-semibold text-slate-700">
                No next location available
              </p>

              <p className="text-xs text-slate-500 mt-1">
                No location was generated after {stopName}.
              </p>
            </div>
          )}
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="p-5 pt-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
