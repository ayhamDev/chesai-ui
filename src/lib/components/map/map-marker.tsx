"use client";

import { clsx } from "clsx";
import { Map as MapIcon } from "lucide-react";
import React, { createContext, useState } from "react";
import {
  Marker as ReactMapMarker,
  Popup as ReactMapPopup,
  type MarkerDragEvent,
} from "react-map-gl/maplibre";
import { MapPopup } from "./map-popup";

interface MarkerContextProps {
  isHovered: boolean;
  setIsHovered: (v: boolean) => void;
}
export const MarkerContext = createContext<MarkerContextProps | null>(null);

export interface MapMarkerProps {
  longitude: number;
  latitude: number;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  draggable?: boolean;
  onDragStart?: (e: MarkerDragEvent) => void;
  onDrag?: (e: MarkerDragEvent) => void;
  onDragEnd?: (e: MarkerDragEvent) => void;
  rotation?: number;
  offset?: [number, number];
  color?: "primary" | "secondary" | "error";
  popup?: React.ReactNode;
  popupOpen?: boolean;
  onPopupClose?: () => void;
}

export const MapMarker = ({
  longitude,
  latitude,
  children,
  onClick,
  draggable,
  onDragStart,
  onDrag,
  onDragEnd,
  rotation,
  offset,
  color = "primary",
  popup,
  popupOpen: controlledPopupOpen,
  onPopupClose,
}: MapMarkerProps) => {
  const [internalPopupOpen, setInternalPopupOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isPopupOpen =
    controlledPopupOpen !== undefined ? controlledPopupOpen : internalPopupOpen;

  const handleMarkerClick = (e: any) => {
    e.originalEvent.stopPropagation();
    if (popup || React.Children.count(children) > 1) {
      setInternalPopupOpen((prev) => !prev);
    }
    onClick?.(e.originalEvent);
  };

  const handlePopupClose = () => {
    setInternalPopupOpen(false);
    onPopupClose?.();
  };

  const defaultPin = (
    <div className="relative group cursor-pointer transition-transform hover:scale-110 active:scale-95">
      <div
        className={clsx(
          "flex h-8 w-8 items-center justify-center rounded-full shadow-md ring-2 ring-white dark:ring-black",
          color === "primary" && "bg-primary text-on-primary",
          color === "secondary" && "bg-secondary text-on-secondary",
          color === "error" && "bg-error text-on-error",
        )}
      >
        <MapIcon className="h-4 w-4" />
      </div>
      <div
        className={clsx(
          "absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-sm ring-2 ring-white dark:ring-black",
          color === "primary" && "bg-primary",
          color === "secondary" && "bg-secondary",
          color === "error" && "bg-error",
        )}
      />
    </div>
  );

  const childrenArray = React.Children.toArray(children);
  const markerContent =
    childrenArray.find(
      (c) => React.isValidElement(c) && c.type === MarkerContent,
    ) ||
    childrenArray.filter(
      (c) =>
        React.isValidElement(c) &&
        c.type !== MarkerPopup &&
        c.type !== MarkerTooltip &&
        c.type !== MarkerLabel,
    );

  const popupElement = childrenArray.find(
    (c) => React.isValidElement(c) && c.type === MarkerPopup,
  );
  const tooltipElement = childrenArray.find(
    (c) => React.isValidElement(c) && c.type === MarkerTooltip,
  );
  const labelElement = childrenArray.find(
    (c) => React.isValidElement(c) && c.type === MarkerLabel,
  );

  return (
    <MarkerContext.Provider value={{ isHovered, setIsHovered }}>
      <ReactMapMarker
        longitude={longitude}
        latitude={latitude}
        anchor="bottom"
        draggable={draggable}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        onClick={handleMarkerClick}
        rotation={rotation}
        offset={offset}
      >
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* @ts-ignore */}
          {markerContent?.length > 0 ? markerContent : defaultPin}
          {labelElement}
        </div>
      </ReactMapMarker>
      {isPopupOpen && popup && (
        <MapPopup
          longitude={longitude}
          latitude={latitude}
          onClose={handlePopupClose}
        >
          {popup}
        </MapPopup>
      )}
      {isPopupOpen && popupElement && (
        <ReactMapPopup
          longitude={longitude}
          latitude={latitude}
          anchor="top"
          offset={10}
          closeButton={false}
          onClose={handlePopupClose}
          className="z-20"
          maxWidth="300px"
        >
          {popupElement}
        </ReactMapPopup>
      )}
      {isHovered && tooltipElement && (
        <ReactMapPopup
          longitude={longitude}
          latitude={latitude}
          anchor="top"
          offset={10}
          closeButton={false}
          closeOnClick={false}
          className="z-30 pointer-events-none"
        >
          {tooltipElement}
        </ReactMapPopup>
      )}
    </MarkerContext.Provider>
  );
};

export const MarkerContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={className}>{children}</div>;
MarkerContent.displayName = "MarkerContent";

export const MarkerLabel = ({
  children,
  position = "top",
  className,
}: {
  children: React.ReactNode;
  position?: "top" | "bottom";
  className?: string;
}) => (
  <div
    className={clsx(
      "absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-on-surface bg-surface/80 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm border border-outline-variant/20",
      position === "top" ? "-top-8" : "-bottom-8",
      className,
    )}
  >
    {children}
  </div>
);
MarkerLabel.displayName = "MarkerLabel";

export const MarkerTooltip = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={clsx(
      "px-2 py-1 bg-inverse-surface text-inverse-on-surface text-xs rounded shadow-md animate-in fade-in zoom-in-95 duration-200",
      className,
    )}
  >
    {children}
  </div>
);
MarkerTooltip.displayName = "MarkerTooltip";

export const MarkerPopup = ({
  children,
  closeButton = true,
  className,
}: {
  children: React.ReactNode;
  closeButton?: boolean;
  className?: string;
}) => {
  return (
    <div
      className={clsx(
        "relative min-w-[150px] rounded-xl border border-outline-variant bg-surface-container-high p-3 shadow-xl text-on-surface animate-in fade-in zoom-in-95 duration-200",
        className,
      )}
    >
      {children}
    </div>
  );
};
MarkerPopup.displayName = "MarkerPopup";
