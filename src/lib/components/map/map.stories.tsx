import type { Meta, StoryObj } from "@storybook/react";
import {
  AlertTriangle,
  Bike,
  Building,
  Car,
  Coffee,
  Home,
  Navigation,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { Button } from "../button";
import { Card } from "../card";
import { Typography } from "../typography";
import { Map, Map as ChesaiMap } from "./index"; // Using CheckPoint name for logic
import { ThemeProvider } from "../../context/ThemeProvider";
import clsx from "clsx";
const meta: Meta<typeof Map> = {
  title: "Components/Data/Map",
  component: Map,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A theme-aware Map component built on MapLibre GL. Supports markers, popups, routes, clustering, heatmaps, and geofencing.",
      },
    },
  },
  argTypes: {
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    elevation: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
    dragPan: { control: "boolean" },
    scrollZoom: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="h-[600px] w-full max-w-6xl mx-auto bg-surface-container-low p-1 rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Map>;

const LONDON_COORDS = {
  longitude: -0.1276,
  latitude: 51.5072,
  zoom: 12,
};

// --- 1. DEFAULT MAP ---
export const Default: Story = {
  name: "1. Basic Map",
  args: {
    initialViewState: LONDON_COORDS,
    shape: "minimal",
    className: "w-full h-full",
  },
  render: (args) => (
    <Map {...args}>
      <Map.Controls showCompass showZoom showLocate />
    </Map>
  ),
};

// --- 2. MARKERS & POPUPS ---
export const MarkersAndPopups: Story = {
  name: "2. Markers & Popups",
  render: () => (
    <Map initialViewState={LONDON_COORDS} className="w-full h-full">
      <Map.Controls />

      {/* Standard Marker with Click Popup */}
      <Map.Marker
        longitude={-0.1276}
        latitude={51.5072}
        color="primary"
        popup={
          <div className="flex flex-col gap-2 min-w-[200px]">
            <Typography variant="small" className="font-bold">
              Central London
            </Typography>
            <Typography variant="muted" className="text-xs">
              The heart of the city.
            </Typography>
            <Button size="sm" className="w-full mt-1">
              Explore
            </Button>
          </div>
        }
      />

      {/* Custom Icon Marker */}
      <Map.Marker longitude={-0.09} latitude={51.505}>
        <Map.MarkerContent>
          <div className="bg-secondary-container text-on-secondary-container p-2 rounded-full shadow-md hover:scale-110 transition-transform ring-2 ring-white dark:ring-black">
            <Coffee size={20} />
          </div>
        </Map.MarkerContent>
        <Map.MarkerLabel position="bottom">Coffee Shop</Map.MarkerLabel>
      </Map.Marker>

      {/* Draggable Marker */}
      <Map.Marker
        longitude={-0.11}
        latitude={51.49}
        draggable
        onDragEnd={(e) => console.log("New position:", e.lngLat)}
        color="error"
      >
        <Map.MarkerLabel>Drag Me</Map.MarkerLabel>
      </Map.Marker>
    </Map>
  ),
};

// --- 3. HEATMAPS ---
export const HeatmapLayer: Story = {
  name: "3. Heatmaps (Density)",
  parameters: {
    docs: {
      description: {
        story:
          "Visualizes density using a `HeatmapLayer`. Useful for population, crime, or activity data. Uses the standard MapLibre heatmap style spec.",
      },
    },
  },
  render: () => {
    // Earthquake data
    const DATA_URL =
      "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson";

    return (
      <Map
        initialViewState={{
          longitude: -120,
          latitude: 50,
          zoom: 2,
        }}
        className="w-full h-full"
      >
        <Map.Controls />
        <Map.HeatmapLayer
          data={DATA_URL}
          intensity={1}
          radius={40}
          // Custom color ramp
          colors={[
            "rgba(0,0,0,0)",
            "#f1eef6",
            "#d7b5d8",
            "#df65b0",
            "#dd1c77",
            "#980043",
          ]}
        />
      </Map>
    );
  },
};

// --- 4. REAL-TIME TRACKING ---
export const RealTimeTracking: Story = {
  name: "4. Real-time Tracking & Animation",
  parameters: {
    docs: {
      description: {
        story:
          "Uses `Map.AnimatedMarker` to smoothly interpolate positions between updates. This mimics a live delivery driver or ride-share vehicle.",
      },
    },
  },
  render: () => {
    // Mock route for simulation
    const route = [
      [-0.1276, 51.5072],
      [-0.125, 51.508],
      [-0.122, 51.509],
      [-0.119, 51.51],
      [-0.115, 51.511],
      [-0.112, 51.51],
      [-0.11, 51.508],
    ];

    const [posIndex, setPosIndex] = useState(0);
    const [coords, setCoords] = useState(route[0]);
    const [bearing, setBearing] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setPosIndex((prev) => {
          const next = (prev + 1) % route.length;
          setCoords(route[next]);
          // Simple bearing calculation for demo
          const prevCoords = route[prev];
          const nextCoords = route[next];
          const angle =
            (Math.atan2(
              nextCoords[1] - prevCoords[1],
              nextCoords[0] - prevCoords[0],
            ) *
              180) /
            Math.PI;
          setBearing(90 - angle); // Adjust for map orientation
          return next;
        });
      }, 3000); // Update every 3 seconds

      return () => clearInterval(interval);
    }, []);

    return (
      <Map initialViewState={LONDON_COORDS} className="w-full h-full">
        <Map.Controls />
        <Map.Route coordinates={route as [number, number][]} opacity={0.3} />

        {/* Animated Marker */}
        <Map.AnimatedMarker
          longitude={coords[0]}
          latitude={coords[1]}
          bearing={bearing}
          duration={3} // Matches the interval for smooth continuous movement
        >
          <Map.MarkerContent>
            <div className="bg-primary text-on-primary p-2 rounded-full shadow-xl ring-2 ring-white z-20">
              <Car size={20} />
            </div>
          </Map.MarkerContent>
          <Map.MarkerLabel>Delivery Driver</Map.MarkerLabel>
        </Map.AnimatedMarker>
      </Map>
    );
  },
};

// --- 5. GEOFENCING ---
export const Geofencing: Story = {
  name: "5. Geofencing",
  parameters: {
    docs: {
      description: {
        story:
          "Visualizes a polygon area and detects when a marker is inside it. Uses the `Map.Geofence` component and `Map.isPointInPolygon` helper.",
      },
    },
  },
  render: () => {
    // A simple polygon around central London coords
    const zonePolygon: [number, number][] = [
      [-0.135, 51.51],
      [-0.12, 51.51],
      [-0.12, 51.504],
      [-0.135, 51.504],
      [-0.135, 51.51],
    ];

    const [markerPos, setMarkerPos] = useState({ lng: -0.1276, lat: 51.5072 });
    const [isInside, setIsInside] = useState(true);

    useEffect(() => {
      // Check geofence logic
      const inside = ChesaiMap.isPointInPolygon(
        [markerPos.lng, markerPos.lat],
        zonePolygon,
      );
      setIsInside(inside);
    }, [markerPos]);

    return (
      <Map initialViewState={LONDON_COORDS} className="w-full h-full">
        <Map.Controls />

        {/* Geofence Layer */}
        <Map.Geofence
          id="london-zone"
          polygon={zonePolygon}
          active={isInside} // Highlights when inside
          color={isInside ? "var(--md-sys-color-primary)" : "#666"}
          opacity={0.15}
        />

        {/* Draggable user marker */}
        <Map.Marker
          draggable
          longitude={markerPos.lng}
          latitude={markerPos.lat}
          onDrag={(e) => setMarkerPos(e.lngLat)}
          color={isInside ? "primary" : "secondary"}
        >
          <Map.MarkerLabel position="bottom">
            {isInside ? "INSIDE ZONE" : "OUTSIDE ZONE"}
          </Map.MarkerLabel>
        </Map.Marker>

        {/* Status Indicator */}
        <div className="absolute top-4 left-4 z-10 bg-surface-container/90 backdrop-blur p-3 rounded-xl border border-outline-variant shadow-lg flex items-center gap-3">
          <div
            className={clsx(
              "w-3 h-3 rounded-full",
              isInside ? "bg-green-500" : "bg-red-500",
            )}
          />
          <div>
            <Typography variant="small" className="font-bold">
              Status: {isInside ? "Authorized" : "Restricted"}
            </Typography>
            <Typography variant="muted" className="text-xs">
              Drag the marker to test
            </Typography>
          </div>
        </div>
      </Map>
    );
  },
};

// --- 6. DRAWING TOOLS ---
export const DrawingTools: Story = {
  name: "6. Drawing Tools",
  parameters: {
    docs: {
      description: {
        story:
          "Enables a simple drawing toolbar to place points or draw polygons. Double-click to finish a polygon.",
      },
    },
  },
  render: () => {
    const [features, setFeatures] = useState<any[]>([]);

    return (
      <Map initialViewState={LONDON_COORDS} className="w-full h-full">
        <Map.Controls />
        <Map.Draw
          onChange={(newFeatures) => setFeatures(newFeatures)}
          visible={true}
        />

        {/* Display count overlay */}
        <div className="absolute bottom-10 left-4 z-10 bg-surface-container/90 p-2 rounded-lg text-xs font-mono border border-outline-variant">
          Features drawn: {features.length}
        </div>
      </Map>
    );
  },
};
