"use client";

import { useMap as useMapGL } from "react-map-gl/maplibre";
import { MapRoot } from "./map-root";
import {
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerTooltip,
  MarkerPopup,
} from "./map-marker";
import { MapAnimatedMarker } from "./map-animated-marker";
import { MapPopup } from "./map-popup";
import { MapControls } from "./map-controls";
import { MapRoute } from "./map-route";
import { MapClusterLayer } from "./map-cluster";
import { MapHeatmapLayer } from "./map-heatmap";
import { MapGeofence } from "./map-geofence";
import { MapDraw } from "./map-draw";
import { isPointInPolygon } from "./map-utils";

export const ChesaiMap = Object.assign(MapRoot, {
  Marker: MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerTooltip,
  MarkerPopup,
  AnimatedMarker: MapAnimatedMarker,
  Popup: MapPopup,
  Controls: MapControls,
  Route: MapRoute,
  ClusterLayer: MapClusterLayer,
  HeatmapLayer: MapHeatmapLayer,
  Geofence: MapGeofence,
  Draw: MapDraw,
  // Logic export for geofencing check
  isPointInPolygon,
});

export { ChesaiMap as Map, useMapGL as useMap };
