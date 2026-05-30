import React from "react";
import { Map } from "../../map";
import type { RegistryComponent } from "../types";

export const MapConfig: RegistryComponent = {
  name: "Interactive Map",
  category: "Media",
  render: ({
    longitude,
    latitude,
    zoom,
    shape,
    elevation,
    bordered,
    showControls,
    dragPan,
    scrollZoom,
    ...props
  }) => (
    <div className="w-full h-[400px]" {...props}>
      <Map
        longitude={longitude}
        latitude={latitude}
        zoom={zoom}
        shape={shape}
        elevation={elevation}
        bordered={bordered}
        dragPan={dragPan}
        scrollZoom={scrollZoom}
        className="w-full h-full"
      >
        {showControls && <Map.Controls showCompass showZoom showLocate />}
      </Map>
    </div>
  ),
  controls: {
    longitude: {
      type: "number",
      label: "Longitude",
      defaultValue: -0.1276,
      step: 0.0001,
      group: "Location",
      supportsCMS: true,
    },
    latitude: {
      type: "number",
      label: "Latitude",
      defaultValue: 51.5072,
      step: 0.0001,
      group: "Location",
      supportsCMS: true,
    },
    zoom: {
      type: "number",
      label: "Zoom Level",
      defaultValue: 12,
      min: 1,
      max: 22,
      step: 1,
      group: "Location",
    },
    showControls: {
      type: "boolean",
      label: "Show UI Controls",
      defaultValue: true,
      group: "Features",
    },
    dragPan: {
      type: "boolean",
      label: "Allow Drag Panning",
      defaultValue: true,
      group: "Features",
    },
    scrollZoom: {
      type: "boolean",
      label: "Allow Scroll Zoom",
      defaultValue: false,
      group: "Features",
    },
    shape: {
      type: "select",
      label: "Container Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Heavy Round)", value: "full" },
        { label: "Minimal (Standard)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
    elevation: {
      type: "select",
      label: "Shadow Elevation",
      group: "Aesthetics",
      defaultValue: "none",
      options: [
        { label: "None", value: "none" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
    bordered: {
      type: "boolean",
      label: "Bordered",
      group: "Aesthetics",
      defaultValue: false,
    },
  },
};
