"use client";

import React, { useEffect, useId, useMemo } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";
import { useResolvedColor } from "./map-utils";

export interface MapRouteProps {
  coordinates: [number, number][];
  color?: string;
  width?: number;
  opacity?: number;
  lineDasharray?: number[];
  interactive?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const MapRoute = ({
  coordinates,
  color = "var(--md-sys-color-primary)",
  width = 4,
  opacity = 0.8,
  lineDasharray,
  interactive = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: MapRouteProps) => {
  const resolvedColor = useResolvedColor(color);
  const uniqueId = useId();
  const sourceId = `route-source-${uniqueId}`;
  const layerId = `route-layer-${uniqueId}`;
  const { current: map } = useMap();

  const geoJsonData = useMemo(
    () => ({
      type: "Feature" as const,
      properties: {},
      geometry: { type: "LineString" as const, coordinates },
    }),
    [coordinates],
  );

  useEffect(() => {
    if (!map || !interactive) return;
    const clickHandler = () => onClick?.();
    const enterHandler = () => (map.getCanvas().style.cursor = "pointer");
    const leaveHandler = () => (map.getCanvas().style.cursor = "");

    map.on("click", layerId, clickHandler);
    map.on("mouseenter", layerId, enterHandler);
    map.on("mouseleave", layerId, leaveHandler);

    return () => {
      if (map) {
        map.off("click", layerId, clickHandler);
        map.off("mouseenter", layerId, enterHandler);
        map.off("mouseleave", layerId, leaveHandler);
      }
    };
  }, [map, layerId, interactive, onClick]);

  return (
    <Source id={sourceId} type="geojson" data={geoJsonData}>
      <Layer
        id={layerId}
        type="line"
        layout={{ "line-join": "round", "line-cap": "round" }}
        paint={{
          "line-color": resolvedColor,
          "line-width": width,
          "line-opacity": opacity,
          ...(lineDasharray && { "line-dasharray": lineDasharray }),
        }}
      />
    </Source>
  );
};
