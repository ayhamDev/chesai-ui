"use client";

import { Map as MapIcon, PenTool, Trash2 } from "lucide-react";
import type { MapLayerMouseEvent } from "maplibre-gl";
import React, { useEffect, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";
import { IconButton } from "../icon-button";

export interface MapDrawProps {
  /** Callback when the drawing list changes */
  onChange?: (features: any[]) => void;
  /** Whether to show the tool palette */
  visible?: boolean;
}

export const MapDraw = ({ onChange, visible = true }: MapDrawProps) => {
  const { current: map } = useMap();
  const [features, setFeatures] = useState<any[]>([]);
  const [mode, setMode] = useState<"none" | "point" | "polygon">("none");
  const [currentPolygon, setCurrentPolygon] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!map) return;

    const handleClick = (e: MapLayerMouseEvent) => {
      const coord: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      if (mode === "point") {
        const newFeature = {
          type: "Feature",
          id: Date.now(),
          geometry: { type: "Point", coordinates: coord },
          properties: {},
        };
        const next = [...features, newFeature];
        setFeatures(next);
        onChange?.(next);
        setMode("none"); // Auto-exit after point
      } else if (mode === "polygon") {
        setCurrentPolygon((prev) => [...prev, coord]);
      }
    };

    const handleDblClick = (e: MapLayerMouseEvent) => {
      e.preventDefault(); // Stop zoom
      if (mode === "polygon" && currentPolygon.length > 2) {
        // Close polygon
        const closedPoly = [...currentPolygon, currentPolygon[0]];
        const newFeature = {
          type: "Feature",
          id: Date.now(),
          geometry: { type: "Polygon", coordinates: [closedPoly] },
          properties: {},
        };
        const next = [...features, newFeature];
        setFeatures(next);
        onChange?.(next);
        setCurrentPolygon([]);
        setMode("none");
      }
    };

    if (mode !== "none") {
      map.getCanvas().style.cursor = "crosshair";
      map.on("click", handleClick);
      map.on("dblclick", handleDblClick);
    } else {
      map.getCanvas().style.cursor = "";
      map.off("click", handleClick);
      map.off("dblclick", handleDblClick);
    }

    return () => {
      map.off("click", handleClick);
      map.off("dblclick", handleDblClick);
    };
  }, [map, mode, features, currentPolygon, onChange]);

  if (!visible) return null;

  return (
    <>
      {/* Tool Palette */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-surface-container/90 backdrop-blur-md p-1 rounded-full shadow-lg border border-outline-variant flex gap-1">
        <IconButton
          size="sm"
          variant={mode === "point" ? "primary" : "ghost"}
          onClick={() => setMode(mode === "point" ? "none" : "point")}
          title="Draw Point"
        >
          <MapIcon size={18} />
        </IconButton>
        <IconButton
          size="sm"
          variant={mode === "polygon" ? "primary" : "ghost"}
          onClick={() => setMode(mode === "polygon" ? "none" : "polygon")}
          title="Draw Area (Double click to finish)"
        >
          <PenTool size={18} />
        </IconButton>
        {features.length > 0 && (
          <IconButton
            size="sm"
            variant="ghost"
            className="text-error hover:text-error hover:bg-error/10"
            onClick={() => {
              setFeatures([]);
              onChange?.([]);
            }}
            title="Clear All"
          >
            <Trash2 size={18} />
          </IconButton>
        )}
      </div>

      {/* Render Drawn Features */}
      {/* 1. Finished Features */}
      <Source
        id="drawn-source"
        type="geojson"
        data={{ type: "FeatureCollection", features: features } as any}
      >
        <Layer
          id="drawn-points"
          type="circle"
          filter={["==", "$type", "Point"]}
          paint={{ "circle-radius": 6, "circle-color": "#3b82f6" }}
        />
        <Layer
          id="drawn-polys-fill"
          type="fill"
          filter={["==", "$type", "Polygon"]}
          paint={{ "fill-color": "#3b82f6", "fill-opacity": 0.2 }}
        />
        <Layer
          id="drawn-polys-line"
          type="line"
          filter={["==", "$type", "Polygon"]}
          paint={{ "line-color": "#3b82f6", "line-width": 2 }}
        />
      </Source>

      {/* 2. Active Drawing (Polygon in progress) */}
      {currentPolygon.length > 0 && (
        <Source
          id="drawing-source"
          type="geojson"
          data={{
            type: "Feature",
            geometry: { type: "LineString", coordinates: currentPolygon },
            properties: {},
          }}
        >
          <Layer
            id="drawing-line"
            type="line"
            paint={{
              "line-color": "#ef4444",
              "line-width": 2,
              "line-dasharray": [2, 1],
            }}
          />
          <Layer
            id="drawing-points"
            type="circle"
            paint={{ "circle-radius": 4, "circle-color": "#ef4444" }}
          />
        </Source>
      )}
    </>
  );
};
