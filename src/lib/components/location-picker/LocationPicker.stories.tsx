import type { Meta, StoryObj } from "@storybook/react";
import { MapPin, Navigation } from "lucide-react";
import { useState } from "react";
import { Button } from "../button";
import { Card } from "../card";
import { Typography } from "../typography";
import { LocationPicker, SearchResult } from "./index";
import { Sheet } from "../sheet";

const meta: Meta<typeof LocationPicker> = {
  title: "Components/Data/LocationPicker",
  component: LocationPicker,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof LocationPicker>;

// --- Mock Geocoding Logic ---
const MOCK_LOCATIONS = [
  {
    id: 1,
    label: "Eiffel Tower",
    description: "London, UK",
    lat: 48.8584,
    lng: 2.2945,
  },
  {
    id: 2,
    label: "Statue of Liberty",
    description: "New York, USA",
    lat: 40.6892,
    lng: -74.0445,
  },
  {
    id: 3,
    label: "Sydney Opera House",
    description: "Sydney, Australia",
    lat: -33.8568,
    lng: 151.2153,
  },
  {
    id: 4,
    label: "Burj Khalifa",
    description: "Dubai, UAE",
    lat: 25.1972,
    lng: 55.2744,
  },
  {
    id: 5,
    label: "Central Park",
    description: "New York, USA",
    lat: 40.785091,
    lng: -73.968285,
  },
];

const mockGeocode = async (query: string): Promise<SearchResult[]> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return MOCK_LOCATIONS.filter(
    (loc) =>
      loc.label.toLowerCase().includes(query.toLowerCase()) ||
      loc.description.toLowerCase().includes(query.toLowerCase()),
  ).map((loc) => ({
    id: loc.id,
    label: loc.label,
    description: loc.description,
    latitude: loc.lat,
    longitude: loc.lng,
  }));
};

export const StandalonePage: Story = {
  name: "Standalone Page",
  render: () => (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-[400px] h-[700px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
        <LocationPicker
          onSearch={mockGeocode}
          onSelect={(coords) => console.log("Confirmed:", coords)}
          onCancel={() => console.log("Cancelled")}
          title="Set Delivery Address"
        />
      </div>
    </div>
  ),
};

export const WithDetachedSheetFooter: Story = {
  name: "With Detached Sheet Footer",
  render: () => (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
      {/* 
        Note: The Sheet uses a Portal by default (via Vaul), so it will render at the document root.
        This container mimics a mobile view.
      */}
      <div className="w-full h-full relative bg-white border shadow-xl rounded-xl overflow-hidden">
        <LocationPicker
          onSearch={mockGeocode}
          // Passing a custom footer that uses the Sheet component
          footer={({ onConfirm, latitude, longitude }) => (
            <Sheet
              forceBottomSheet={true}
              open={true}
              modal={false}
              mode="detached"
            >
              <Sheet.Content className="!pointer-events-auto">
                <div className="flex flex-col gap-4 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="label-large">
                        Confirm Location
                      </Typography>
                      <Typography variant="muted" className="text-xs font-mono">
                        {latitude.toFixed(4)}, {longitude.toFixed(4)}
                      </Typography>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Navigation size={20} />
                    </div>
                  </div>
                  <Button onClick={onConfirm} shape="full" className="w-full">
                    Confirm this Location
                  </Button>
                </div>
              </Sheet.Content>
            </Sheet>
          )}
        />
      </div>
    </div>
  ),
};
