"use client";

import {
  Battery,
  Bell,
  ChevronRight,
  Clock,
  History,
  MapPin,
  MoreVertical,
  Navigation,
  Plus,
  QrCode,
  Signal,
  SignalHigh,
  SignalZero,
  Smartphone,
  Wifi,
  WifiOff,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar } from "../../lib/components/avatar";
import { Badge } from "../../lib/components/badge";
import { Button } from "../../lib/components/button";
import { Card } from "../../lib/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../lib/components/dialog";
import { IconButton } from "../../lib/components/icon-button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "../../lib/components/item";
import { Map } from "../../lib/components/map";
import { QRCode } from "../../lib/components/qr-code";
import { Separator } from "../../lib/components/separator";
import { Sidebar } from "../../lib/components/sidebar";
import { toast, Toaster } from "../../lib/components/toast";
import { Typography } from "../../lib/components/typography";
import clsx from "clsx";
// --- Types ---

interface Device {
  id: string;
  name: string;
  type: "phone" | "tablet";
  owner: string;
  status: "online" | "offline" | "syncing";
  battery: number;
  lastPing: string;
  currentLocation: { lat: number; lng: number };
  avatar: string;
}

// --- Mock Data ---

const DEVICES: Device[] = [
  {
    id: "d1",
    name: "Alex's iPhone 14",
    type: "phone",
    owner: "Alex Walker",
    status: "online",
    battery: 78,
    lastPing: "Just now",
    currentLocation: { lat: 45.92, lng: 6.87 }, // Chamonix area
    avatar: "https://i.pravatar.cc/150?u=alex",
  },
  {
    id: "d2",
    name: "Fleet Tab 04",
    type: "tablet",
    owner: "Delivery Unit 4",
    status: "offline",
    battery: 12,
    lastPing: "2 hours ago",
    currentLocation: { lat: 45.85, lng: 6.8 },
    avatar: "https://i.pravatar.cc/150?u=fleet",
  },
];

// Mock Path Data for the "Discontinuity" Feature
const PATH_ONLINE_1 = [
  [6.86, 45.925],
  [6.862, 45.924],
  [6.864, 45.923],
  [6.865, 45.922],
];

const PATH_OFFLINE_GAP = [
  [6.865, 45.922],
  [6.866, 45.921], // Tunnel entry
  [6.868, 45.919], // Deep tunnel
  [6.869, 45.918], // Tunnel exit
  [6.87, 45.92],
];

// --- Component ---

export const TracePulseDashboard = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("d1");
  const [isPairingOpen, setIsPairingOpen] = useState(false);
  const [activeDevice] = useState(DEVICES[0]);

  const handleRing = () => {
    toast.success("Command Sent", {
      description: `Ringing ${activeDevice.name} at max volume.`,
    });
  };

  return (
    <div className="flex h-screen w-full bg-surface-container-low text-on-surface font-sans overflow-hidden">
      <Toaster position="top-center" />

      {/* --- Sidebar: Device List --- */}
      <Sidebar.Provider>
        <Sidebar
          className="border-r border-outline-variant bg-surface-container-low w-80 shrink-0 z-20"
          layout="sidebar"
        >
          <Sidebar.Header className="px-4 py-4 border-b border-outline-variant/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
                <SignalHigh className="text-on-primary w-5 h-5" />
              </div>
              <div>
                <Typography
                  variant="h4"
                  className="text-lg font-bold leading-none"
                >
                  TracePulse
                </Typography>
                <Typography variant="small" className="text-xs opacity-60">
                  Live Asset Monitoring
                </Typography>
              </div>
            </div>
          </Sidebar.Header>

          <Sidebar.Content className="p-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <Typography
                variant="small"
                className="font-bold text-on-surface-variant uppercase tracking-wider text-[10px]"
              >
                My Devices
              </Typography>
              <IconButton
                size="xs"
                variant="ghost"
                onClick={() => setIsPairingOpen(true)}
              >
                <Plus className="w-4 h-4" />
              </IconButton>
            </div>

            <ItemGroup>
              {DEVICES.map((device) => (
                <Item
                  key={device.id}
                  variant={
                    selectedDeviceId === device.id ? "secondary" : "ghost"
                  }
                  shape="minimal"
                  padding="sm"
                  className="cursor-pointer"
                  onClick={() => setSelectedDeviceId(device.id)}
                >
                  <ItemMedia className="relative">
                    <Avatar src={device.avatar} size="md" />
                    <span
                      className={clsx(
                        "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-surface",
                        device.status === "online"
                          ? "bg-green-500"
                          : "bg-red-500",
                      )}
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="text-sm">{device.owner}</ItemTitle>
                    <ItemDescription className="text-xs">
                      {device.name}
                    </ItemDescription>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        shape="minimal"
                        className="px-1 py-0 h-4 text-[10px]"
                      >
                        {device.battery}%
                      </Badge>
                      {device.status === "online" ? (
                        <span className="text-[10px] text-green-600 flex items-center gap-1">
                          <Wifi className="w-3 h-3" /> Online
                        </span>
                      ) : (
                        <span className="text-[10px] text-red-500 flex items-center gap-1">
                          <WifiOff className="w-3 h-3" /> Last:{" "}
                          {device.lastPing}
                        </span>
                      )}
                    </div>
                  </ItemContent>
                  {selectedDeviceId === device.id && (
                    <ItemActions>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </ItemActions>
                  )}
                </Item>
              ))}
            </ItemGroup>
          </Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>

      {/* --- Main Area: Map & Controls --- */}
      <div className="flex-1 relative flex flex-col">
        {/* Map Container */}
        <div className="flex-1 relative z-0">
          <Map
            initialViewState={{
              longitude: 6.868,
              latitude: 45.922,
              zoom: 14,
              pitch: 45,
              bearing: -15,
            }}
            mapStyle="https://tiles.openfreemap.org/styles/liberty"
            className="w-full h-full"
          >
            <Map.Controls />

            {/* 1. The "Live" Path (Solid) */}
            <Map.Route
              coordinates={PATH_ONLINE_1 as [number, number][]}
              color="var(--md-sys-color-primary)"
              width={4}
            />

            {/* 2. The "Gap" Path (Dashed - Represents offline data synced later) */}
            <Map.Route
              coordinates={PATH_OFFLINE_GAP as [number, number][]}
              color="var(--md-sys-color-error)"
              width={4}
              opacity={0.6}
              lineDasharray={[2, 2]} // Dotted effect
            />

            {/* 3. Disconnection Marker */}
            <Map.Marker longitude={6.865} latitude={45.922}>
              <Map.MarkerTooltip className="bg-error text-on-error">
                Connection Lost (10:42 AM)
              </Map.MarkerTooltip>
              <div className="w-4 h-4 bg-error rounded-full border-2 border-white" />
            </Map.Marker>

            {/* 4. Live Device Marker */}
            <Map.AnimatedMarker
              longitude={activeDevice.currentLocation.lng}
              latitude={activeDevice.currentLocation.lat}
              bearing={-45} // Heading SE
            >
              <div className="relative">
                {/* Pulse Effect */}
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                <div className="relative bg-primary text-on-primary p-2 rounded-full shadow-xl ring-4 ring-white/50 z-20">
                  <Navigation className="w-5 h-5 fill-current" />
                </div>
                <Map.MarkerLabel position="bottom">
                  {activeDevice.owner}
                </Map.MarkerLabel>
              </div>
            </Map.AnimatedMarker>
          </Map>

          {/* Floating Device Card (Top Right) */}
          <div className="absolute top-4 right-4 z-10 w-80">
            <Card
              className="bg-surface-container-high/90 backdrop-blur-md shadow-xl border border-outline-variant"
              padding="md"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Typography variant="h4">{activeDevice.name}</Typography>
                  <div className="flex items-center gap-1 text-xs text-on-surface-variant mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>Near Chamonix, France</span>
                  </div>
                </div>
                <Badge variant="primary" shape="full">
                  Live
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="flex flex-col items-center p-2 bg-surface rounded-lg border border-outline-variant/50">
                  <Battery className="w-5 h-5 mb-1 text-green-600" />
                  <span className="text-xs font-bold">78%</span>
                  <span className="text-[10px] opacity-60">Battery</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-surface rounded-lg border border-outline-variant/50">
                  <Signal className="w-5 h-5 mb-1 text-primary" />
                  <span className="text-xs font-bold">4G</span>
                  <span className="text-[10px] opacity-60">Signal</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-surface rounded-lg border border-outline-variant/50">
                  <History className="w-5 h-5 mb-1 text-orange-500" />
                  <span className="text-xs font-bold">5m</span>
                  <span className="text-[10px] opacity-60">Gap Fill</span>
                </div>
              </div>

              <Separator className="mb-4" />

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={handleRing}
                  startIcon={<Bell className="w-4 h-4" />}
                >
                  Ring Phone
                </Button>
                <IconButton variant="secondary" aria-label="Settings">
                  <MoreVertical className="w-5 h-5" />
                </IconButton>
              </div>
            </Card>
          </div>

          {/* Timeline Overlay (Bottom Left) */}
          <div className="absolute bottom-8 left-4 z-10 w-72">
            <Card
              variant="glass"
              className="border-none shadow-lg text-white bg-black/60"
              padding="sm"
            >
              <Typography variant="small" className="font-bold mb-2 pl-2">
                Journey Log
              </Typography>
              <div className="space-y-3 px-2">
                <div className="flex gap-3 text-xs opacity-80">
                  <div className="w-px bg-white/20 relative">
                    <div className="absolute top-0 -left-1 w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Connection Restored</p>
                    <p className="opacity-70">
                      10:48 AM • Uploaded 5m of offline path
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 text-xs opacity-60">
                  <div className="w-px bg-white/20 relative">
                    <div className="absolute top-0 -left-1 w-2 h-2 rounded-full bg-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Signal Lost (Gap Start)</p>
                    <p className="opacity-70">10:42 AM • Entered Tunnel</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* --- Pairing Dialog --- */}
      <Dialog
        open={isPairingOpen}
        onOpenChange={setIsPairingOpen}
        variant="basic"
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Pair New Device</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="p-4 bg-white rounded-xl shadow-inner mb-6">
              <QRCode
                value="tracepulse://pair?token=xyz123"
                size={180}
                logo="https://cdn-icons-png.flaticon.com/512/124/124021.png"
                logoSize={0.2}
                dotShape="rounded"
                cornerFrameShape="rounded"
                color="black"
              />
            </div>
            <Typography variant="h4">Scan to Connect</Typography>
            <Typography variant="p" className="mt-2 text-sm opacity-70">
              Open the TracePulse mobile app and scan this code. No login
              required on the device.
            </Typography>
            <div className="flex items-center gap-2 mt-6 text-xs bg-secondary-container px-3 py-1.5 rounded-full text-on-secondary-container">
              <Clock className="w-3 h-3" />
              <span>Code expires in 04:59</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
