"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapLayerMouseEvent, StyleSpecification } from "maplibre-gl";
import React, { useEffect, useMemo, useRef, useState } from "react";
import MapGL, {
  AttributionControl,
  MapProvider,
  type MapRef,
  type ViewState,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import { useTheme } from "../../context/ThemeProvider";
import { BASEMAPS } from "./map-utils";

const mapContainerVariants = cva(
  "relative w-full h-full overflow-hidden isolate bg-surface-container-low font-sans",
  {
    variants: {
      shape: {
        full: "rounded-3xl",
        minimal: "rounded-xl",
        sharp: "rounded-none",
      },
      bordered: {
        true: "border border-outline-variant",
        false: "border-none",
      },
      elevation: {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
      },
    },
    defaultVariants: {
      shape: "minimal",
      bordered: false,
      elevation: "none",
    },
  },
);

export interface MapProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mapContainerVariants> {
  initialViewState?: Partial<ViewState>;
  // Controlled props
  longitude?: number;
  latitude?: number;
  zoom?: number;
  onMove?: (evt: ViewStateChangeEvent) => void;

  mapStyle?: string | StyleSpecification;
  scrollZoom?: boolean;
  dragPan?: boolean;
  projection?: string;
  onClick?: (e: MapLayerMouseEvent) => void;
}

export const MapRoot = React.forwardRef<MapRef, MapProps>(
  (
    {
      className,
      shape,
      bordered,
      elevation,
      initialViewState = {
        longitude: -122.4,
        latitude: 37.8,
        zoom: 10,
        pitch: 0,
        bearing: 0,
      },
      longitude,
      latitude,
      zoom,
      onMove,
      mapStyle,
      children,
      scrollZoom = true,
      dragPan = true,
      projection,
      onClick,
      ...props
    },
    ref,
  ) => {
    const { theme: resolvedTheme } = useTheme();

    // Internal state for uncontrolled usage
    const [internalViewState, setInternalViewState] =
      useState(initialViewState);
    const internalMapRef = useRef<MapRef>(null);

    const effectiveStyle = useMemo(() => {
      if (mapStyle) return mapStyle;
      return resolvedTheme === "dark" ? BASEMAPS.dark : BASEMAPS.light;
    }, [mapStyle, resolvedTheme]);

    useEffect(() => {
      if (internalMapRef.current) {
        setTimeout(() => internalMapRef.current?.resize(), 100);
      }
    }, []);

    const setRef = (node: MapRef) => {
      internalMapRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    // Determine if we are controlled or uncontrolled
    const isControlled = longitude !== undefined && latitude !== undefined;

    const handleMove = (evt: ViewStateChangeEvent) => {
      if (onMove) {
        onMove(evt);
      }
      if (!isControlled) {
        setInternalViewState(evt.viewState);
      }
    };

    const currentViewState = isControlled
      ? {
          ...initialViewState,
          longitude,
          latitude,
          zoom: zoom ?? initialViewState.zoom,
        }
      : internalViewState;

    return (
      <MapProvider>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .maplibregl-popup-content {
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            border-radius: 0 !important;
          }
          .maplibregl-popup-close-button {
            display: none;
          }
          .maplibregl-popup-tip {
            border-top-color: var(--md-sys-color-surface-container-high) !important;
            border-bottom-color: var(--md-sys-color-surface-container-high) !important;
          }
        `,
          }}
        />

        <div
          className={clsx(
            mapContainerVariants({ shape, bordered, elevation }),
            className,
          )}
          {...props}
        >
          <MapGL
            key={resolvedTheme}
            ref={setRef}
            {...currentViewState}
            onMove={handleMove}
            mapStyle={effectiveStyle}
            scrollZoom={scrollZoom}
            dragPan={dragPan}
            onClick={onClick}
            attributionControl={false}
            style={{ width: "100%", height: "100%" }}
            // @ts-ignore
            projection={projection}
          >
            <AttributionControl
              customAttribution='&copy; <a href="https://openfreemap.org">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank">&copy; OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
              position="bottom-right"
              style={{
                color: "var(--md-sys-color-on-surface-variant)",
                background: "rgba(255, 255, 255, 0.5)",
                padding: "2px 6px",
                borderRadius: "4px 0 0 0",
                fontSize: "10px",
              }}
            />
            {children}
          </MapGL>
        </div>
      </MapProvider>
    );
  },
);

MapRoot.displayName = "Map";
