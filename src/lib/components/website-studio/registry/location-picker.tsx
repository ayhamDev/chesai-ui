import React from "react";
import { LocationPicker, type SearchResult } from "../../location-picker";
import type { RegistryComponent } from "../types";

const mockGeocode = async (query: string): Promise<SearchResult[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return [
    { id: 1, label: "Eiffel Tower", description: "Paris, France", latitude: 48.8584, longitude: 2.2945 },
    { id: 2, label: "Statue of Liberty", description: "New York, USA", latitude: 40.6892, longitude: -74.0445 },
    { id: 3, label: "Sydney Opera House", description: "Sydney, Australia", latitude: -33.8568, longitude: 151.2153 },
  ].filter(loc => loc.label.toLowerCase().includes(query.toLowerCase()) || loc.description.toLowerCase().includes(query.toLowerCase()));
};

export const LocationPickerConfig: RegistryComponent = {
  name: "Location Picker",
  category: "Forms",
  render: ({ title, placeholder, confirmLabel, cancelLabel, coordinatesString, ...props }) => {
    const coords = (coordinatesString || "-0.1276, 51.5072")
      .split(",")
      .map((n: string) => parseFloat(n.trim()));

    const defaultCoords: [number, number] = !isNaN(coords[0]) && !isNaN(coords[1])
      ? [coords[0], coords[1]]
      : [-0.1276, 51.5072];

    return (
      <div className="w-full h-[500px] border border-outline-variant rounded-2xl overflow-hidden shadow-lg" {...props}>
        <LocationPicker
          title={title}
          placeholder={placeholder}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
          defaultCoordinates={defaultCoords}
          onSearch={mockGeocode}
          onSelect={(c) => console.log("Location picked in Studio:", c)}
        />
      </div>
    );
  },
  controls: {
    title: {
      type: "text",
      label: "Header Title",
      defaultValue: "Select Delivery Location",
      group: "Content",
      supportsCMS: true,
    },
    placeholder: {
      type: "text",
      label: "Search Placeholder",
      defaultValue: "Search for an address...",
      group: "Content",
    },
    confirmLabel: {
      type: "text",
      label: "Confirm Button Text",
      defaultValue: "Confirm Location",
      group: "Content",
    },
    cancelLabel: {
      type: "text",
      label: "Cancel Button Text",
      defaultValue: "Cancel",
      group: "Content",
    },
    coordinatesString: {
      type: "text",
      label: "Initial Coordinates (Lng, Lat)",
      description: "Comma separated, e.g., -0.1276, 51.5072 (London)",
      defaultValue: "-0.1276, 51.5072",
      group: "Data",
      supportsCMS: true,
    },
  },
};
