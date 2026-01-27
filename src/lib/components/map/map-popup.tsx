"use client";

import { clsx } from "clsx";
import { X } from "lucide-react";
import React from "react";
import { Popup as ReactMapPopup } from "react-map-gl/maplibre";

export const MapPopup = ({
  longitude,
  latitude,
  children,
  onClose,
  className,
  closeButton = true,
}: {
  longitude: number;
  latitude: number;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  closeButton?: boolean;
}) => {
  return (
    <ReactMapPopup
      longitude={longitude}
      latitude={latitude}
      anchor="top"
      offset={10}
      onClose={onClose}
      closeButton={false}
      className="z-20"
      maxWidth="320px"
    >
      <div
        className={clsx(
          "relative rounded-xl border border-outline-variant bg-surface-container-high p-3 shadow-xl text-on-surface",
          className,
        )}
      >
        {closeButton && onClose && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-1.5 right-1.5 p-1 rounded-full hover:bg-surface-container-highest transition-colors opacity-60 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {children}
      </div>
    </ReactMapPopup>
  );
};
