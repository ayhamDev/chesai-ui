"use client";

import React, { useId } from "react";
import { Layer, Source } from "react-map-gl/maplibre";

export interface MapHeatmapLayerProps {
  data: string | GeoJSON.FeatureCollection;
  intensity?: number;
  radius?: number;
  opacity?: number;
  /** Color ramp: array of colors from low to high density */
  colors?: string[];
}

export const MapHeatmapLayer = ({
  data,
  intensity = 1,
  radius = 30,
  opacity = 0.7,
  colors = [
    "rgba(33,102,172,0)",
    "rgb(103,169,207)",
    "rgb(209,229,240)",
    "rgb(253,219,199)",
    "rgb(239,138,98)",
    "rgb(178,24,43)",
  ],
}: MapHeatmapLayerProps) => {
  const uniqueId = useId();
  const sourceId = `heatmap-source-${uniqueId}`;
  const layerId = `heatmap-layer-${uniqueId}`;

  return (
    <Source id={sourceId} type="geojson" data={data}>
      <Layer
        id={layerId}
        type="heatmap"
        paint={{
          // Increase the heatmap weight based on frequency and property magnitude
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "mag"],
            0,
            0,
            6,
            1,
          ],
          // Increase the heatmap color weight weight by zoom level
          // heatmap-intensity is a multiplier on top of heatmap-weight
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            intensity,
            9,
            intensity * 3,
          ],
          // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
          // Begin color ramp at 0-stop with a 0-transparency color
          // to create a blur-like effect.
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            colors[0],
            0.2,
            colors[1],
            0.4,
            colors[2],
            0.6,
            colors[3],
            0.8,
            colors[4],
            1,
            colors[5],
          ],
          // Adjust the heatmap radius by zoom level
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            2,
            9,
            radius,
          ],
          // Transition from heatmap to circle layer by zoom level
          "heatmap-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            7,
            opacity,
            19,
            0,
          ],
        }}
      />
    </Source>
  );
};
