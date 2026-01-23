import type { Meta, StoryObj } from "@storybook/react";
import {
  FolderOpen,
  Globe,
  HardDrive,
  RefreshCw,
  Server,
  Settings2,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../../lib/components/badge";
import { Card } from "../../lib/components/card";
import { FAB } from "../../lib/components/fab";
import { Input } from "../../lib/components/input";
import { Separator } from "../../lib/components/separator";
import { Switch } from "../../lib/components/switch";
import { Typography } from "../../lib/components/typography";
import { WindowControls } from "../../lib/components/window-controls";
import clsx from "clsx";
const meta: Meta = {
  title: "Showcase/FTP Server (Desktop App)",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A modernization of a legacy Material Design 2 FTP Server utility. This example demonstrates how to compose `chesai-ui` components to create a dense, functional desktop-style window using the MD3 design language.",
      },
    },
  },
};

export default meta;

// --- Custom Theme Override ---
// We override the default "Earth/Red" theme of the library with a "Blue" theme
// to match the original app's brand identity, but using MD3 token logic.
const FTP_THEME_STYLES = {
  "--md-sys-color-primary": "rgb(168 199 250)", // Pastel Blue (Dark Mode)
  "--md-sys-color-on-primary": "rgb(0 49 91)",
  "--md-sys-color-primary-container": "rgb(0 71 133)",
  "--md-sys-color-on-primary-container": "rgb(214 227 255)",
  "--md-sys-color-secondary": "rgb(190 198 220)",
  "--md-sys-color-on-secondary": "rgb(40 48 66)",
  "--md-sys-color-secondary-container": "rgb(62 71 89)",
  "--md-sys-color-on-secondary-container": "rgb(218 226 249)",
  "--md-sys-color-surface": "rgb(17 19 24)",
  "--md-sys-color-on-surface": "rgb(226 226 230)",
  "--md-sys-color-surface-container": "rgb(30 31 35)",
  "--md-sys-color-surface-container-high": "rgb(40 41 45)",
  "--md-sys-color-outline-variant": "rgb(68 71 79)",
} as React.CSSProperties;

const FtpServerApp = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [port, setPort] = useState("21");

  const toggleServer = () => setIsRunning(!isRunning);

  return (
    <div
      style={FTP_THEME_STYLES}
      className="dark bg-black p-10 rounded-3xl flex items-center justify-center font-manrope"
    >
      {/* --- Main Application Window --- */}
      <Card
        variant="surface"
        shape="minimal"
        padding="none"
        elevation={4}
        className="w-[380px] overflow-hidden border border-outline-variant/40 bg-surface text-on-surface shadow-2xl ring-1 ring-black/50"
      >
        {/* --- Window Title Bar --- */}
        <div className="flex h-12 items-center justify-between bg-surface-container px-4 select-none draggable">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-1.5 rounded-lg">
              <Globe className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold tracking-tight text-sm">FTP Server</span>
          </div>
          <WindowControls />
        </div>

        <div className="flex flex-col gap-6 p-6">
          {/* --- Section: Server Status --- */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <Typography variant="h4" className="!mt-0 font-bold text-lg">
                Server Status
              </Typography>
            </div>

            {/* Status Card */}
            <Card
              variant="secondary" // Maps to Surface Container High
              shape="minimal"
              className="relative overflow-hidden p-5 transition-colors duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-3 w-3">
                      {isRunning && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      )}
                      <span
                        className={clsx(
                          "relative inline-flex rounded-full h-3 w-3",
                          isRunning ? "bg-green-500" : "bg-error",
                        )}
                      />
                    </div>
                    <Typography
                      variant="small"
                      className="font-semibold uppercase tracking-wider opacity-80"
                    >
                      {isRunning ? "Running" : "Stopped"}
                    </Typography>
                  </div>
                  <Typography variant="large" className="font-mono font-bold">
                    ftp://192.168.56.2:{port}
                  </Typography>
                  <div className="flex items-center gap-1.5 opacity-60">
                    <Wifi className="h-3 w-3" />
                    <span className="text-xs">Wi-Fi Interface</span>
                  </div>
                </div>

                {/* Main Action Button */}
                <FAB
                  variant={isRunning ? "secondary" : "primary"}
                  size="md"
                  shape="minimal" // Modern squircle shape
                  icon={
                    <RefreshCw
                      className={clsx(
                        "h-6 w-6 transition-transform duration-700",
                        isRunning ? "rotate-180" : "",
                      )}
                    />
                  }
                  onClick={toggleServer}
                  className={clsx("shadow-lg")}
                />
              </div>
            </Card>
          </section>

          <Separator className="opacity-50" />

          {/* --- Section: Configuration --- */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings2 className="h-5 w-5 text-primary" />
              <Typography variant="h4" className="!mt-0 font-bold text-lg">
                Configuration
              </Typography>
            </div>

            {/* Config Form Group */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-xl bg-surface-container p-3 pr-4 border border-outline-variant/30">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Anonymous Login</span>
                  <span className="text-xs text-on-surface-variant">
                    Allow access without password
                  </span>
                </div>
                <Switch
                  size="md"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  variant="flat"
                  label="Username"
                  placeholder="admin"
                  defaultValue="ayham"
                  disabled={isAnonymous}
                  shape="minimal"
                  className={clsx(
                    "transition-opacity",
                    isAnonymous && "opacity-50",
                  )}
                />
                <Input
                  variant="flat"
                  label="Password"
                  type="password"
                  placeholder="••••••"
                  defaultValue="123456"
                  disabled={isAnonymous}
                  shape="minimal"
                  className={clsx(
                    "transition-opacity",
                    isAnonymous && "opacity-50",
                  )}
                />
              </div>

              <Input
                variant="flat"
                label="Port"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                shape="minimal"
                placeholder="21"
                endContent={
                  <Badge variant="secondary" shape="minimal" className="mr-1">
                    TCP
                  </Badge>
                }
              />

              <div className="pt-2">
                <Typography variant="small" className="mb-2 ml-1 opacity-80">
                  Root Directory
                </Typography>
                <div className="group flex items-center gap-3 rounded-xl border border-dashed border-outline-variant p-3 hover:bg-surface-container transition-colors cursor-pointer">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-xs font-mono text-on-surface-variant">
                      C:\Users\ayham\Desktop\Stuff
                    </span>
                    <span className="text-xs font-semibold text-primary group-hover:underline">
                      Change Directory
                    </span>
                  </div>
                  <FolderOpen className="ml-auto h-4 w-4 opacity-50" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* --- Footer --- */}
        <div className="bg-surface-container py-2 text-center border-t border-outline-variant/30">
          <Typography variant="small" className="text-[10px] opacity-40">
            Developed by Ayham • v2.4.0
          </Typography>
        </div>
      </Card>
    </div>
  );
};

export const ModernizedUI: StoryObj = {
  render: () => <FtpServerApp />,
};
