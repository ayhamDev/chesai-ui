"use client";

import { animate, useMotionValue } from "framer-motion";
import React, { useEffect, useState } from "react";
import { MapMarker, type MapMarkerProps } from "./map-marker";

export interface MapAnimatedMarkerProps extends Omit<
  MapMarkerProps,
  "longitude" | "latitude" | "rotation"
> {
  longitude: number;
  latitude: number;
  bearing?: number; // Rotation in degrees
  duration?: number; // Animation duration in seconds
}

export const MapAnimatedMarker = ({
  longitude,
  latitude,
  bearing = 0,
  duration = 2, // Smooth 2s interpolation by default
  children,
  ...props
}: MapAnimatedMarkerProps) => {
  // We use MotionValues to interpolate coordinates smoothly without React renders
  const lngMotion = useMotionValue(longitude);
  const latMotion = useMotionValue(latitude);
  const bearingMotion = useMotionValue(bearing);

  // Sync motion values when props change
  useEffect(() => {
    animate(lngMotion, longitude, { duration, ease: "linear" });
    animate(latMotion, latitude, { duration, ease: "linear" });
    // Smart rotation: take the shortest path (e.g. 350 -> 10 should go +20 not -340)
    let nextBearing = bearing;
    const currentBearing = bearingMotion.get();
    const diff = nextBearing - currentBearing;
    if (diff > 180) nextBearing -= 360;
    if (diff < -180) nextBearing += 360;
    animate(bearingMotion, nextBearing, { duration, ease: "linear" });
  }, [
    longitude,
    latitude,
    bearing,
    duration,
    lngMotion,
    latMotion,
    bearingMotion,
  ]);

  // Throttled state update for the marker via RAF mechanism implied by framer's `on`
  const [coords, setCoords] = useState({
    lng: longitude,
    lat: latitude,
    rot: bearing,
  });

  useEffect(() => {
    const unsubscribeLng = lngMotion.on("change", (v) =>
      setCoords((prev) => ({ ...prev, lng: v })),
    );
    const unsubscribeLat = latMotion.on("change", (v) =>
      setCoords((prev) => ({ ...prev, lat: v })),
    );
    const unsubscribeRot = bearingMotion.on("change", (v) =>
      setCoords((prev) => ({ ...prev, rot: v })),
    );
    return () => {
      unsubscribeLng();
      unsubscribeLat();
      unsubscribeRot();
    };
  }, [lngMotion, latMotion, bearingMotion]);

  return (
    <MapMarker
      longitude={coords.lng}
      latitude={coords.lat}
      rotation={coords.rot}
      {...props}
    >
      {children}
    </MapMarker>
  );
};
