import type { Meta, StoryObj } from "@storybook/react";
import {
  BatteryMedium,
  Bluetooth,
  ChevronRight,
  AlertTriangle,
  Flashlight,
  Home,
  Plane,
  RotateCw,
  Signal,
  Wifi,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "../button";
import { Card } from "../card";
import DeviceFrame from "../device";
import { Switch } from "../switch";
import { Typography } from "../typography";
import { LayoutRouter, useLayoutRouter } from "./index";

const meta: Meta<typeof LayoutRouter> = {
  title: "Showcase/Android Quick Settings",
  component: LayoutRouter,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <DeviceFrame defaultType="phone">
        <Story />
      </DeviceFrame>
    ),
  ],
};

export default meta;
type Story = StoryObj;

// --- CONFIGURATION & DATA ---

// Colors extracted from the reference image
const COLORS = {
  active: "bg-[#dceda2] text-[#1a1c16]", // The lime green color
  inactive: "bg-[#33352e] text-[#e3e3dc]", // The dark grey color
  background: "bg-black",
};

interface SettingItem {
  id: string;
  label: string;
  status: string;
  icon: React.ElementType;
  active: boolean;
  hasChevron?: boolean;
}

const SETTINGS_DATA: SettingItem[] = [
  {
    id: "internet",
    label: "Internet",
    status: "Verizon, LTE",
    icon: Signal,
    active: true,
    hasChevron: true,
  },
  {
    id: "bluetooth",
    label: "Bluetooth",
    status: "Off",
    icon: Bluetooth,
    active: false,
    hasChevron: true,
  },
  {
    id: "flashlight",
    label: "Flashlight",
    status: "Off",
    icon: Flashlight,
    active: false,
  },
  {
    id: "rotate",
    label: "Auto-rotate",
    status: "On",
    icon: RotateCw,
    active: true,
  },
  {
    id: "battery",
    label: "Battery Saver",
    status: "Off",
    icon: BatteryMedium,
    active: false,
  },
  {
    id: "airplane",
    label: "Airplane mode",
    status: "Off",
    icon: Plane,
    active: false,
  },
  {
    id: "home",
    label: "Device controls",
    status: "",
    icon: Home,
    active: true,
    hasChevron: true,
  },
  {
    id: "dnd",
    label: "Do Not Disturb",
    status: "Off",
    icon: AlertTriangle,
    active: false,
  },
];

// --- COMPONENT: GRID CARD (TRIGGER) ---

const SettingCard = ({ item }: { item: SettingItem }) => {
  const Icon = item.icon;

  return (
    <div
      className={`
        relative w-full h-[88px] rounded-[28px] p-4 flex items-start gap-3 overflow-hidden cursor-pointer transition-transform active:scale-95
        ${item.active ? COLORS.active : COLORS.inactive}
      `}
    >
      {/* Icon Area */}
      <LayoutRouter.SharedElement tag="icon-container">
        <div className="flex items-center justify-center">
          <Icon
            className={`w-6 h-6 ${
              item.active ? "text-[#1a1c16]" : "text-[#e3e3dc]"
            }`}
          />
        </div>
      </LayoutRouter.SharedElement>

      {/* Text Area */}
      <div className="flex flex-col justify-center h-full flex-1 min-w-0">
        <LayoutRouter.SharedElement tag="label">
          <span className="font-semibold text-[15px] leading-tight block truncate">
            {item.label}
          </span>
        </LayoutRouter.SharedElement>
        <LayoutRouter.SharedElement tag="status">
          <span className="text-[13px] opacity-80 block truncate">
            {item.status}
          </span>
        </LayoutRouter.SharedElement>
      </div>

      {/* Chevron if applicable */}
      {item.hasChevron && (
        <div className="self-center opacity-60">
          <ChevronRight size={20} />
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: DETAIL SCREEN (EXPANDED) ---

const DetailScreen = ({ item }: { item: SettingItem }) => {
  const { goBack } = useLayoutRouter();
  const [isEnabled, setIsEnabled] = useState(item.active);
  const Icon = item.icon;

  return (
    <div
      className={`w-full h-full flex flex-col -4 ${COLORS.inactive}`}
      // Add a slight top padding for the drag handle affordance area
    >
      {/* Visual Drag Handle Indicator */}
      <div className="w-full flex justify-center pt-3 pb-1">
        <div className="w-12 h-1.5 bg-white/20 rounded-full" />
      </div>

      {/* Header Section */}
      <div className="px-6 py-6 flex flex-col gap-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LayoutRouter.SharedElement tag="icon-container">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  isEnabled ? COLORS.active : "bg-black/20"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isEnabled ? "text-[#1a1c16]" : "text-white"
                  }`}
                />
              </div>
            </LayoutRouter.SharedElement>
            <div className="flex flex-col">
              <LayoutRouter.SharedElement tag="label">
                <Typography variant="h4" className="text-white">
                  {item.label}
                </Typography>
              </LayoutRouter.SharedElement>
              <LayoutRouter.SharedElement tag="status">
                <Typography variant="muted">
                  {isEnabled ? "On" : "Off"}
                </Typography>
              </LayoutRouter.SharedElement>
            </div>
          </div>
          <Switch
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            size="lg"
            className="data-[state=checked]:bg-[#dceda2] data-[state=checked]:border-[#dceda2]"
          />
        </div>
      </div>

      {/* Content Body (Mocking list of options) */}
      <div className="flex-1 p-4 overflow-y-auto">
        {item.id === "internet" ? (
          <div className="flex flex-col gap-2">
            <Typography variant="label-large" className="px-2 py-2 opacity-70">
              Wi-Fi Networks
            </Typography>
            {["Home WiFi", "Office_5G", "Starbucks Guest"].map((net) => (
              <Card
                key={net}
                variant="ghost"
                className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer"
              >
                <Wifi size={20} />
                <span className="flex-1">{net}</span>
                {net === "Home WiFi" && isEnabled && <Signal size={16} />}
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 opacity-40 gap-4">
            <Icon size={48} />
            <Typography>No additional settings available.</Typography>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="p-4 border-t border-white/10 flex justify-end">
        <Button
          onClick={goBack}
          className="rounded-full bg-[#dceda2] text-black hover:bg-[#ccdb95]"
        >
          Done
        </Button>
      </div>
    </div>
  );
};

// --- MAIN DEMO COMPONENT ---

export const QuickSettingsDemo: Story = {
  render: () => (
    <div className="h-full w-full bg-black text-white overflow-hidden flex flex-col">
      {/* Fake Status Bar Spacing */}
      <div className="h-8 w-full" />

      {/* Header */}
      <div className="px-6 py-4 flex justify-between items-end">
        <Typography variant="h3" className="font-normal text-2xl">
          Settings
        </Typography>
        <div className="flex gap-4 opacity-70">
          <div className="p-2 bg-[#303030] rounded-full">
            <Typography variant="small" className="font-bold px-2">
              100%
            </Typography>
          </div>
        </div>
      </div>

      <LayoutRouter duration={0.4}>
        <LayoutRouter.List className="flex-1 overflow-y-auto p-4 pt-0">
          <div className="grid grid-cols-2 gap-3 pb-20">
            {SETTINGS_DATA.map((item) => (
              <LayoutRouter.Link key={item.id} id={item.id}>
                <SettingCard item={item} />
              </LayoutRouter.Link>
            ))}
          </div>
        </LayoutRouter.List>

        {/* Generate Screens for each setting */}
        {SETTINGS_DATA.map((item) => (
          <LayoutRouter.Screen
            key={item.id}
            id={item.id}
            presentation="modal" // Makes it appear as an overlay
            dismissible={true} // Enables drag-to-dismiss
            dismissDirection="y" // Drag down to close
          >
            <DetailScreen item={item} />
          </LayoutRouter.Screen>
        ))}
      </LayoutRouter>
    </div>
  ),
};
