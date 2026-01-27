"use client";

import { clsx } from "clsx";
import { Compass, Expand, Locate, Minus, Plus } from "lucide-react";
import { useMap } from "react-map-gl/maplibre";
import { IconButton } from "../icon-button";

export const MapControls = ({
  position = "top-right",
  showZoom = true,
  showCompass = true,
  showLocate = true,
  showFullscreen = true,
}: {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  showZoom?: boolean;
  showCompass?: boolean;
  showLocate?: boolean;
  showFullscreen?: boolean;
}) => {
  const { current: map } = useMap();
  const handleZoomIn = () => map?.zoomIn();
  const handleZoomOut = () => map?.zoomOut();
  const handleResetNorth = () => map?.resetNorth();
  const handleLocate = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        map?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 14,
        });
      });
    }
  };
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      map
        ?.getContainer()
        .requestFullscreen()
        .catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };
  const posClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-8 right-4",
    "bottom-left": "bottom-8 left-4",
  };
  return (
    <div
      className={clsx(
        "absolute z-10 flex flex-col gap-1.5",
        posClasses[position],
      )}
    >
      <div className="flex flex-col gap-1 bg-surface-container-high/90 backdrop-blur-md p-1 rounded-xl shadow-md border border-outline-variant/50">
        {showZoom && (
          <>
            <IconButton size="sm" variant="ghost" onClick={handleZoomIn}>
              <Plus className="size-4" />
            </IconButton>
            <IconButton size="sm" variant="ghost" onClick={handleZoomOut}>
              <Minus className="size-4" />
            </IconButton>
          </>
        )}
        {showCompass && (
          <IconButton size="sm" variant="ghost" onClick={handleResetNorth}>
            <Compass className="size-5" />
          </IconButton>
        )}
      </div>
      {(showLocate || showFullscreen) && (
        <div className="flex flex-col gap-1 bg-surface-container-high/90 backdrop-blur-md p-1 rounded-xl shadow-md border border-outline-variant/50">
          {showLocate && (
            <IconButton size="sm" variant="ghost" onClick={handleLocate}>
              <Locate className="size-4" />
            </IconButton>
          )}
          {showFullscreen && (
            <IconButton size="sm" variant="ghost" onClick={handleFullscreen}>
              <Expand className="size-4" />
            </IconButton>
          )}
        </div>
      )}
    </div>
  );
};
