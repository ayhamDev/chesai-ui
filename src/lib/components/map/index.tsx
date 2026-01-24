"use client";

import { useDebounce } from "@uidotdev/usehooks";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import {
  Compass,
  Expand,
  Locate,
  Map as MapIcon,
  Minus,
  PenTool,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import type {
  MapLayerMouseEvent,
  StyleSpecification,
  Map as MapLibreInstance,
} from "maplibre-gl";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import MapGL, {
  AttributionControl,
  Layer,
  MapProvider,
  Marker as ReactMapMarker,
  Popup as ReactMapPopup,
  Source,
  useMap as useMapGL,
  type MapRef,
  type MarkerDragEvent,
  type ViewState,
} from "react-map-gl/maplibre";
import { useTheme } from "../../context/ThemeProvider";
import { IconButton } from "../icon-button";

// --- TYPES & CONTEXT ---

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

const BASEMAPS = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
  voyager: "https://tiles.openfreemap.org/styles/liberty",
};

// --- HELPER: Resolve CSS Variables ---
const useResolvedColor = (colorString: string) => {
  const [resolved, setResolved] = useState(() =>
    colorString?.startsWith("var(") ? "rgba(0,0,0,0)" : colorString,
  );

  useEffect(() => {
    if (!colorString || !colorString.startsWith("var(")) {
      setResolved(colorString);
      return;
    }
    const tempEl = document.createElement("div");
    tempEl.style.color = colorString;
    tempEl.style.display = "none";
    document.body.appendChild(tempEl);
    const computedColor = getComputedStyle(tempEl).color;
    setResolved(computedColor);
    document.body.removeChild(tempEl);
  }, [colorString]);

  return resolved;
};

// --- HELPER: Point in Polygon (Ray Casting) ---
const isPointInPolygon = (
  point: [number, number],
  polygon: [number, number][],
) => {
  const x = point[0];
  const y = point[1];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// --- ROOT COMPONENT ---

// @ts-ignore
export interface MapProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mapContainerVariants> {
  initialViewState?: Partial<ViewState>;
  mapStyle?: string | StyleSpecification;
  scrollZoom?: boolean;
  dragPan?: boolean;
  projection?: string;
  onClick?: (e: MapLayerMouseEvent) => void;
}

const MapRoot = React.forwardRef<MapRef, MapProps>(
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
    const [viewState, setViewState] = useState(initialViewState);
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
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
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

// --- MARKER COMPONENTS (Existing) ---
interface MarkerContextProps {
  isHovered: boolean;
  setIsHovered: (v: boolean) => void;
}
const MarkerContext = createContext<MarkerContextProps | null>(null);

export interface MapMarkerProps {
  longitude: number;
  latitude: number;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  draggable?: boolean;
  onDragStart?: (e: MarkerDragEvent) => void;
  onDrag?: (e: MarkerDragEvent) => void;
  onDragEnd?: (e: MarkerDragEvent) => void;
  rotation?: number;
  offset?: [number, number];
  color?: "primary" | "secondary" | "error";
  popup?: React.ReactNode;
  popupOpen?: boolean;
  onPopupClose?: () => void;
}

const MapMarker = ({
  longitude,
  latitude,
  children,
  onClick,
  draggable,
  onDragStart,
  onDrag,
  onDragEnd,
  rotation,
  offset,
  color = "primary",
  popup,
  popupOpen: controlledPopupOpen,
  onPopupClose,
}: MapMarkerProps) => {
  const [internalPopupOpen, setInternalPopupOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isPopupOpen =
    controlledPopupOpen !== undefined ? controlledPopupOpen : internalPopupOpen;

  const handleMarkerClick = (e: any) => {
    e.originalEvent.stopPropagation();
    if (popup || React.Children.count(children) > 1) {
      setInternalPopupOpen((prev) => !prev);
    }
    onClick?.(e.originalEvent);
  };

  const handlePopupClose = () => {
    setInternalPopupOpen(false);
    onPopupClose?.();
  };

  const defaultPin = (
    <div className="relative group cursor-pointer transition-transform hover:scale-110 active:scale-95">
      <div
        className={clsx(
          "flex h-8 w-8 items-center justify-center rounded-full shadow-md ring-2 ring-white dark:ring-black",
          color === "primary" && "bg-primary text-on-primary",
          color === "secondary" && "bg-secondary text-on-secondary",
          color === "error" && "bg-error text-on-error",
        )}
      >
        <MapIcon className="h-4 w-4" />
      </div>
      <div
        className={clsx(
          "absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-sm ring-2 ring-white dark:ring-black",
          color === "primary" && "bg-primary",
          color === "secondary" && "bg-secondary",
          color === "error" && "bg-error",
        )}
      />
    </div>
  );

  const childrenArray = React.Children.toArray(children);
  const markerContent =
    childrenArray.find(
      (c) => React.isValidElement(c) && c.type === MarkerContent,
    ) ||
    childrenArray.filter(
      (c) =>
        React.isValidElement(c) &&
        c.type !== MarkerPopup &&
        c.type !== MarkerTooltip &&
        c.type !== MarkerLabel,
    );

  const popupElement = childrenArray.find(
    (c) => React.isValidElement(c) && c.type === MarkerPopup,
  );
  const tooltipElement = childrenArray.find(
    (c) => React.isValidElement(c) && c.type === MarkerTooltip,
  );
  const labelElement = childrenArray.find(
    (c) => React.isValidElement(c) && c.type === MarkerLabel,
  );

  return (
    <MarkerContext.Provider value={{ isHovered, setIsHovered }}>
      <ReactMapMarker
        longitude={longitude}
        latitude={latitude}
        anchor="bottom"
        draggable={draggable}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        onClick={handleMarkerClick}
        rotation={rotation}
        offset={offset}
      >
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* @ts-ignore */}
          {markerContent?.length > 0 ? markerContent : defaultPin}
          {labelElement}
        </div>
      </ReactMapMarker>
      {isPopupOpen && popup && (
        <MapPopup
          longitude={longitude}
          latitude={latitude}
          onClose={handlePopupClose}
        >
          {popup}
        </MapPopup>
      )}
      {isPopupOpen && popupElement && (
        <ReactMapPopup
          longitude={longitude}
          latitude={latitude}
          anchor="top"
          offset={10}
          closeButton={false}
          onClose={handlePopupClose}
          className="z-20"
          maxWidth="300px"
        >
          {popupElement}
        </ReactMapPopup>
      )}
      {isHovered && tooltipElement && (
        <ReactMapPopup
          longitude={longitude}
          latitude={latitude}
          anchor="top"
          offset={10}
          closeButton={false}
          closeOnClick={false}
          className="z-30 pointer-events-none"
        >
          {tooltipElement}
        </ReactMapPopup>
      )}
    </MarkerContext.Provider>
  );
};

const MarkerContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={className}>{children}</div>;
MarkerContent.displayName = "MarkerContent";

const MarkerLabel = ({
  children,
  position = "top",
  className,
}: {
  children: React.ReactNode;
  position?: "top" | "bottom";
  className?: string;
}) => (
  <div
    className={clsx(
      "absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-on-surface bg-surface/80 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm border border-outline-variant/20",
      position === "top" ? "-top-8" : "-bottom-8",
      className,
    )}
  >
    {children}
  </div>
);
MarkerLabel.displayName = "MarkerLabel";

const MarkerTooltip = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={clsx(
      "px-2 py-1 bg-inverse-surface text-inverse-on-surface text-xs rounded shadow-md animate-in fade-in zoom-in-95 duration-200",
      className,
    )}
  >
    {children}
  </div>
);
MarkerTooltip.displayName = "MarkerTooltip";

const MarkerPopup = ({
  children,
  closeButton = true,
  className,
}: {
  children: React.ReactNode;
  closeButton?: boolean;
  className?: string;
}) => {
  return (
    <div
      className={clsx(
        "relative min-w-[150px] rounded-xl border border-outline-variant bg-surface-container-high p-3 shadow-xl text-on-surface animate-in fade-in zoom-in-95 duration-200",
        className,
      )}
    >
      {children}
    </div>
  );
};
MarkerPopup.displayName = "MarkerPopup";

const MapPopup = ({
  longitude,
  latitude,
  children,
  onClose,
  className,
  closeButton = true,
}: {
  longitude: number;
  latitude: number;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  closeButton?: boolean;
}) => {
  return (
    <ReactMapPopup
      longitude={longitude}
      latitude={latitude}
      anchor="top"
      offset={10}
      onClose={onClose}
      closeButton={false}
      className="z-20"
      maxWidth="320px"
    >
      <div
        className={clsx(
          "relative rounded-xl border border-outline-variant bg-surface-container-high p-3 shadow-xl text-on-surface",
          className,
        )}
      >
        {closeButton && onClose && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-1.5 right-1.5 p-1 rounded-full hover:bg-surface-container-highest transition-colors opacity-60 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {children}
      </div>
    </ReactMapPopup>
  );
};

// --- NEW: ANIMATED MARKER (Real-time tracking) ---

export interface MapAnimatedMarkerProps extends Omit<
  MapMarkerProps,
  "longitude" | "latitude" | "rotation"
> {
  longitude: number;
  latitude: number;
  bearing?: number; // Rotation in degrees
  duration?: number; // Animation duration in seconds
}

const MapAnimatedMarker = ({
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

  // We need a way to pass these changing values to the Marker.
  // React-map-gl doesn't accept MotionValues directly for lat/lng.
  // So we use a requestAnimationFrame loop to update local state for the marker
  // ONLY if we are animating. This allows high performance.
  // Alternatively, we render a Motion div INSIDE the marker, but the marker itself needs position.
  //
  // OPTIMIZATION: We will simply drive a standard state, but throttled to RAF.
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

// --- NEW: HEATMAP LAYER ---

export interface MapHeatmapLayerProps {
  data: string | GeoJSON.FeatureCollection;
  intensity?: number;
  radius?: number;
  opacity?: number;
  /** Color ramp: array of colors from low to high density */
  colors?: string[];
}

const MapHeatmapLayer = ({
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

// --- NEW: GEOFENCE LAYER ---

export interface MapGeofenceProps {
  id: string;
  /** Polygon coordinates: Array of [lng, lat] arrays */
  polygon: [number, number][];
  color?: string; // Fill color
  borderColor?: string;
  opacity?: number;
  active?: boolean; // Highlight state
}

const MapGeofence = ({
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

// --- NEW: SIMPLE DRAWING TOOLS ---

export interface MapDrawProps {
  /** Callback when the drawing list changes */
  onChange?: (features: any[]) => void;
  /** Whether to show the tool palette */
  visible?: boolean;
}

const MapDraw = ({ onChange, visible = true }: MapDrawProps) => {
  const { current: map } = useMapGL();
  const [features, setFeatures] = useState<any[]>([]);
  const [mode, setMode] = useState<"none" | "point" | "polygon">("none");
  const [currentPolygon, setCurrentPolygon] = useState<[number, number][]>([]);

  // We tap into the map's click event manually
  // Note: Parent Map component must allow this via context or we assume global map
  // Here we assume this component is inside <Map> so we access the instance via hook

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

// --- EXISTING COMPONENTS (Route, Cluster, Controls) ---

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

const MapRoute = ({
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
  const { current: map } = useMapGL();

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

const MapClusterLayer = ({
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
  const { current: map } = useMapGL();

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
  const { current: map } = useMapGL();
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

// --- EXPORT ---

export const ChesaiMap = Object.assign(MapRoot, {
  Marker: MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerTooltip,
  MarkerPopup,
  AnimatedMarker: MapAnimatedMarker, // NEW
  Popup: MapPopup,
  Controls: MapControls,
  Route: MapRoute,
  ClusterLayer: MapClusterLayer,
  HeatmapLayer: MapHeatmapLayer, // NEW
  Geofence: MapGeofence, // NEW
  Draw: MapDraw, // NEW
  // Logic export for geofencing check
  isPointInPolygon,
});

export { ChesaiMap as Map, useMapGL as useMap };
