"use client";

import React, { useMemo } from "react";
import { Layer, Source } from "react-map-gl/maplibre";
import { useResolvedColor } from "./map-utils";

export interface MapGeofenceProps {
  id: string;
  /** Polygon coordinates: Array of [lng, lat] arrays */
  polygon: [number, number][];
  color?: string; // Fill color
  borderColor?: string;
  opacity?: number;
  active?: boolean; // Highlight state
}

export const MapGeofence = ({
  id,
  polygon,
  color = "var(--md-sys-color-primary)",
  borderColor = "var(--md-sys-color-primary)",
  opacity = 0.2,
  active = false,
}: MapGeofenceProps) => {
  const resolvedFill = useResolvedColor(color);
  const resolvedBorder = useResolvedColor(borderColor);

  const geoJson = useMemo(
    () => ({
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [polygon],
      },
      properties: {},
    }),
    [polygon],
  );

  return (
    <Source id={`geo-${id}`} type="geojson" data={geoJson}>
      <Layer
        id={`geo-fill-${id}`}
        type="fill"
        paint={{
          "fill-color": resolvedFill,
          "fill-opacity": active ? opacity * 1.5 : opacity,
        }}
      />
      <Layer
        id={`geo-line-${id}`}
        type="line"
        paint={{
          "line-color": resolvedBorder,
          "line-width": active ? 3 : 2,
        }}
      />
    </Source>
  );
};
