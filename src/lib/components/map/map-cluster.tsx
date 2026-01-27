"use client";

import type { MapLayerMouseEvent } from "maplibre-gl";
import React, { useEffect, useId } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";

export interface MapClusterLayerProps {
  data: string | GeoJSON.FeatureCollection;
  clusterMaxZoom?: number;
  clusterRadius?: number;
  clusterColors?: [string, string, string];
  clusterThresholds?: [number, number];
  pointColor?: string;
  onPointClick?: (feature: any, coordinates: [number, number]) => void;
  onClusterClick?: (
    clusterId: number,
    coordinates: [number, number],
    pointCount: number,
  ) => void;
}

export const MapClusterLayer = ({
  data,
  clusterMaxZoom = 14,
  clusterRadius = 50,
  clusterColors = ["#FFD8E4", "#F2B8B5", "#8F4C38"],
  clusterThresholds = [100, 750],
  pointColor = "#8F4C38",
  onPointClick,
  onClusterClick,
}: MapClusterLayerProps) => {
  const uniqueId = useId();
  const sourceId = `cluster-source-${uniqueId}`;
  const clusterLayerId = `clusters-${uniqueId}`;
  const countLayerId = `cluster-count-${uniqueId}`;
  const pointLayerId = `unclustered-point-${uniqueId}`;
  const { current: map } = useMap();

  useEffect(() => {
    if (!map) return;
    const clickHandler = async (e: MapLayerMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [clusterLayerId],
      });
      const clusterId = features[0]?.properties?.cluster_id;
      const pointCount = features[0]?.properties?.point_count;
      const geometry = features[0]?.geometry as any;
      if (!clusterId || !geometry) return;
      if (onClusterClick)
        onClusterClick(
          clusterId,
          geometry.coordinates as [number, number],
          pointCount,
        );
      else {
        const source: any = map.getSource(sourceId);
        const zoom = await source.getClusterExpansionZoom(clusterId);
        map.easeTo({ center: geometry.coordinates, zoom, duration: 500 });
      }
    };
    const pointClickHandler = (e: MapLayerMouseEvent) => {
      if (!onPointClick) return;
      const feature = e.features?.[0];
      const geometry = feature?.geometry as any;
      if (feature && geometry)
        onPointClick(feature, geometry.coordinates as [number, number]);
    };
    const enterHandler = () => (map.getCanvas().style.cursor = "pointer");
    const leaveHandler = () => (map.getCanvas().style.cursor = "");

    map.on("click", clusterLayerId, clickHandler);
    map.on("click", pointLayerId, pointClickHandler);
    map.on("mouseenter", clusterLayerId, enterHandler);
    map.on("mouseleave", clusterLayerId, leaveHandler);
    map.on("mouseenter", pointLayerId, enterHandler);
    map.on("mouseleave", pointLayerId, leaveHandler);
    return () => {
      map.off("click", clusterLayerId, clickHandler);
      map.off("click", pointLayerId, pointClickHandler);
      map.off("mouseenter", clusterLayerId, enterHandler);
      map.off("mouseleave", clusterLayerId, leaveHandler);
      map.off("mouseenter", pointLayerId, enterHandler);
      map.off("mouseleave", pointLayerId, leaveHandler);
    };
  }, [
    map,
    clusterLayerId,
    pointLayerId,
    sourceId,
    onClusterClick,
    onPointClick,
  ]);

  return (
    <Source
      id={sourceId}
      type="geojson"
      data={data}
      cluster={true}
      clusterMaxZoom={clusterMaxZoom}
      clusterRadius={clusterRadius}
    >
      <Layer
        id={clusterLayerId}
        type="circle"
        filter={["has", "point_count"]}
        paint={{
          "circle-color": [
            "step",
            ["get", "point_count"],
            clusterColors[0],
            clusterThresholds[0],
            clusterColors[1],
            clusterThresholds[1],
            clusterColors[2],
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            clusterThresholds[0],
            30,
            clusterThresholds[1],
            40,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        }}
      />
      <Layer
        id={countLayerId}
        type="symbol"
        filter={["has", "point_count"]}
        layout={{
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        }}
        paint={{ "text-color": "#000000" }}
      />
      <Layer
        id={pointLayerId}
        type="circle"
        filter={["!", ["has", "point_count"]]}
        paint={{
          "circle-color": pointColor,
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        }}
      />
    </Source>
  );
};
