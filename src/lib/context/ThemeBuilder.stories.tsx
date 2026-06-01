// src/lib/context/ThemeBuilder.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowLeft,
  Bird,
  Check,
  Code,
  LayoutGrid,
  Lightbulb,
  MessageSquare,
  Moon,
  MoreVertical,
  Palette,
  Play,
  RefreshCw,
  Search,
  Star,
  Sun,
  Type,
} from "lucide-react";
import { useState } from "react";

// --- Components ---
import { Avatar } from "../components/avatar";
import { Badge } from "../components/badge";
import { BottomTabs } from "../components/bottom-tabs";
import { Button } from "../components/button";
import { ButtonGroup } from "../components/button-group";
import { CodeEditor } from "../components/code-editor";
import { ColorPicker } from "../components/color-picker";
import DeviceFrame from "../components/device";
import { ElasticScrollArea } from "../components/elastic-scroll-area";
import { IconButton } from "../components/icon-button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
} from "../components/item";
import { Carousel, CarouselItem } from "../components/material3-carousel";
import { NavigationRail } from "../components/navigation-rail";
import { Resizable } from "../components/resizable";
import { Select } from "../components/select";
import { Switch } from "../components/switch";
import { Toaster, toast } from "../components/toast";
import { Typography } from "../components/typography";

// --- Context & Utils ---
import { PRESET_FONTS } from "../utils/font-loader";
import type { ThemeColorKey } from "../utils/theme-generator";
import { DialogProvider, useDialog } from "./DialogProvider";
import { ThemeProvider, useTheme } from "./ThemeProvider";

const meta: Meta<typeof ThemeProvider> = {
  title: "Theme/Material Theme Builder",
  component: ThemeProvider,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="light">
        <DialogProvider>
          <Toaster />
          <Story />
        </DialogProvider>
      </ThemeProvider>
    ),
  ],
};

export default meta;

// ============================================================================
// TAILWIND COLOR PALETTE (50 - 900)
// ============================================================================
const TAILWIND_COLORS: Record<string, Record<number, string>> = {
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
  zinc: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
  },
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
  },
  stone: {
    50: "#fafaf9",
    100: "#f5f5f4",
    200: "#e7e5e4",
    300: "#d6d3d1",
    400: "#a8a29e",
    500: "#78716c",
    600: "#57534e",
    700: "#44403c",
    800: "#292524",
    900: "#1c1917",
  },
  red: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
  orange: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
  },
  amber: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  yellow: {
    50: "#fefce8",
    100: "#fef9c3",
    200: "#fef08a",
    300: "#fde047",
    400: "#facc15",
    500: "#eab308",
    600: "#ca8a04",
    700: "#a16207",
    800: "#854d0e",
    900: "#713f12",
  },
  lime: {
    50: "#f7fee7",
    100: "#ecfccb",
    200: "#d9f99d",
    300: "#bef264",
    400: "#a3e635",
    500: "#84cc16",
    600: "#65a30d",
    700: "#4d7c0f",
    800: "#3f6212",
    900: "#365314",
  },
  green: {
    50: "#f0fdf4",
    100: "#dcfce3",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
  emerald: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },
  teal: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
    800: "#115e59",
    900: "#134e4a",
  },
  cyan: {
    50: "#ecfeff",
    100: "#cffafe",
    200: "#a5f3fc",
    300: "#67e8f9",
    400: "#22d3ee",
    500: "#06b6d4",
    600: "#0891b2",
    700: "#0e7490",
    800: "#155e75",
    900: "#164e63",
  },
  sky: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },
  blue: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  indigo: {
    50: "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#6366f1",
    600: "#4f46e5",
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
  },
  violet: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
  },
  purple: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7e22ce",
    800: "#6b21a8",
    900: "#581c87",
  },
  fuchsia: {
    50: "#fdf4ff",
    100: "#fae8ff",
    200: "#f5d0fe",
    300: "#f0abfc",
    400: "#e879f9",
    500: "#d946ef",
    600: "#c026d3",
    700: "#a21caf",
    800: "#86198f",
    900: "#701a75",
  },
  pink: {
    50: "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    300: "#f9a8d4",
    400: "#f472b6",
    500: "#ec4899",
    600: "#db2777",
    700: "#be185d",
    800: "#9d174d",
    900: "#831843",
  },
  rose: {
    50: "#fff1f2",
    100: "#ffe4e6",
    200: "#fecdd3",
    300: "#fda4af",
    400: "#fb7185",
    500: "#f43f5e",
    600: "#e11d48",
    700: "#be123c",
    800: "#9f1239",
    900: "#881337",
  },
};

const fontOptions = Object.keys(PRESET_FONTS).map((k) => ({
  value: k,
  label: PRESET_FONTS[k].name,
}));

// Keys matching the ThemeOverrides map in your theme-generator.ts
const OVERRIDE_KEYS: { key: ThemeColorKey; label: string }[] = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "tertiary", label: "Tertiary" },
  { key: "error", label: "Error" },
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "surfaceVariant", label: "Surface Variant" },
  { key: "outline", label: "Outline" },
];

// ============================================================================
// 1. LEFT SIDEBAR: CONTROLS
// ============================================================================

const SidebarControls = () => {
  const {
    theme,
    setTheme,
    seedColor,
    setSeedColor,
    overrides,
    setOverride,
    resetOverrides,
    fonts,
    setFonts,
    contrast,
    setContrast,
  } = useTheme();

  const { show } = useDialog();

  const [colorFamily, setColorFamily] = useState<string>("purple");

  const handleGlobalReset = () => {
    setTheme("light");
    setContrast("standard");
    setSeedColor(null); // <-- FIX: Reset to null to remove generated variables and rely on default theme.css
    resetOverrides();
    setFonts({
      brand: "Manrope",
      plain: "Manrope",
      expressiveButtons: false,
    });
    setColorFamily(""); // Reset the UI dropdown
  };

  const handleExport = () => {
    const codeString = `import { ChesaiProvider } from 'chesai-ui';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChesaiProvider
      defaultTheme="${theme}"
      defaultContrast="${contrast}"${seedColor ? `\n      defaultSeedColor="${seedColor}"` : ""}
      defaultFonts={${JSON.stringify(fonts, null, 2).split("\n").join("\n      ")}}
      defaultOverrides={${JSON.stringify(overrides, null, 2).split("\n").join("\n      ")}}
    >
      {children}
    </ChesaiProvider>
  );
}`;

    show({
      title: "Export Theme Configuration",
      description:
        "Copy this code and wrap your application in the ChesaiProvider to apply your customized theme globally.",
      contentProps: { className: "max-w-4xl" },
      body: (
        <div className="mt-4 border border-outline-variant/30 rounded-xl overflow-hidden shadow-inner">
          <CodeEditor
            value={codeString}
            language="typescript"
            fileName="App.tsx"
            height={400}
            readOnly
            variant="ghost"
            shape="sharp"
            enableCopy={true}
          />
        </div>
      ),
      confirmLabel: "Copy Code",
      cancelLabel: "Close",
      onConfirm: () => {
        navigator.clipboard.writeText(codeString);
        toast.success("Theme code copied to clipboard!");
      },
    });
  };

  return (
    <div className="w-full h-full bg-surface flex flex-col shrink-0">
      {/* HEADER WITH GLOBAL RESET & EXPORT */}
      <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-lowest">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
            <Palette size={16} />
          </div>
          <Typography variant="title-medium" className="font-bold">
            Theme Builder
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            shape="minimal"
            onClick={handleExport}
            startIcon={<Code size={14} />}
          >
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            shape="minimal"
            onClick={handleGlobalReset}
            startIcon={<RefreshCw size={14} />}
          >
            Reset
          </Button>
        </div>
      </div>

      <ElasticScrollArea className="flex-1">
        <div className="p-6 flex flex-col gap-8 pb-20">
          {/* --- GLOBAL PREFERENCES --- */}
          <section className="flex flex-col gap-5">
            <Typography
              variant="label-small"
              className="uppercase tracking-widest opacity-60 font-bold"
            >
              Mode & Contrast
            </Typography>

            <div className="flex flex-col gap-2">
              <Typography variant="body-medium">Appearance</Typography>
              <ButtonGroup shape="full" gap="md">
                <Button
                  size="sm"
                  className="flex-1"
                  variant={theme === "light" ? "primary" : "secondary"}
                  onClick={() => setTheme("light")}
                  startIcon={<Sun size={14} />}
                >
                  Light
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  variant={theme === "dark" ? "primary" : "secondary"}
                  onClick={() => setTheme("dark")}
                  startIcon={<Moon size={14} />}
                >
                  Dark
                </Button>
              </ButtonGroup>
            </div>

            <div className="flex flex-col gap-2">
              <Typography variant="body-medium">Contrast Level</Typography>
              <Select
                size="md"
                variant="filled"
                value={contrast}
                onValueChange={(v) => setContrast(v as any)}
                items={[
                  { value: "standard", label: "Standard (Default)" },
                  { value: "medium", label: "Medium Contrast" },
                  { value: "high", label: "High Contrast" },
                ]}
              />
            </div>
          </section>

          {/* --- SOURCE COLOR --- */}
          <section className="flex flex-col gap-4 border-t border-outline-variant/30 pt-6">
            <div className="flex flex-col">
              <Typography
                variant="label-small"
                className="uppercase tracking-widest opacity-60 font-bold"
              >
                Source Color
              </Typography>
              <Typography
                variant="body-small"
                muted
                className="mt-1 leading-snug"
              >
                Creates a cohesive 5-key tonal palette using dynamic color
                algorithms.
              </Typography>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <Select
                size="sm"
                variant="outlined"
                value={colorFamily}
                onValueChange={setColorFamily}
                placeholder="Select a color family"
                items={Object.keys(TAILWIND_COLORS).map((family) => ({
                  value: family,
                  label: family.charAt(0).toUpperCase() + family.slice(1),
                }))}
              />

              <div className="grid grid-cols-5 gap-2 mt-1">
                {colorFamily &&
                  Object.entries(TAILWIND_COLORS[colorFamily]).map(
                    ([step, hex]) => (
                      <button
                        key={hex}
                        onClick={() => setSeedColor(hex)}
                        className={`w-full aspect-square rounded-lg transition-transform hover:scale-110 flex items-center justify-center shadow-sm ${
                          seedColor === hex
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-surface"
                            : "ring-1 ring-outline-variant/30"
                        }`}
                        style={{ backgroundColor: hex }}
                        title={`${colorFamily}-${step} (${hex})`}
                      >
                        {seedColor === hex && (
                          <Check
                            size={14}
                            className="text-white mix-blend-difference"
                          />
                        )}
                      </button>
                    ),
                  )}
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <Typography variant="body-small">Custom Hex</Typography>
              <ColorPicker
                value={seedColor || "#10b981"}
                onChange={setSeedColor}
                variant="filled"
                shape="minimal"
                className="w-full"
              />
            </div>
          </section>

          {/* --- TYPOGRAPHY --- */}
          <section className="flex flex-col gap-5 border-t border-outline-variant/30 pt-6">
            <Typography
              variant="label-small"
              className="uppercase tracking-widest opacity-60 font-bold flex items-center gap-2"
            >
              <Type size={14} /> Typography
            </Typography>

            <div className="flex flex-col gap-2">
              <Typography variant="body-medium">
                Brand Font (Headings)
              </Typography>
              <Select
                variant="filled"
                value={fonts.brand}
                onValueChange={(v) => setFonts({ brand: v })}
                items={fontOptions}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Typography variant="body-medium">Plain Font (Body)</Typography>
              <Select
                variant="filled"
                value={fonts.plain}
                onValueChange={(v) => setFonts({ plain: v })}
                items={fontOptions}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 mt-1">
              <div className="flex flex-col">
                <Typography variant="label-large">
                  Expressive Buttons
                </Typography>
                <Typography variant="body-small" muted>
                  Use Brand font for actions
                </Typography>
              </div>
              <Switch
                checked={fonts.expressiveButtons}
                onCheckedChange={(c) => setFonts({ expressiveButtons: c })}
              />
            </div>
          </section>

          {/* --- CORE COLORS (OVERRIDES) --- */}
          <section className="flex flex-col gap-5 border-t border-outline-variant/30 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Typography
                  variant="label-small"
                  className="uppercase tracking-widest opacity-60 font-bold"
                >
                  Core Colors
                </Typography>
                <Typography variant="body-small" muted className="mt-1">
                  Manually override specific tokens.
                </Typography>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {OVERRIDE_KEYS.map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-2">
                  <Typography variant="body-small">{label}</Typography>
                  <ColorPicker
                    value={overrides[key] || ""}
                    onChange={(c) => setOverride(key, c)}
                    variant="outlined"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </ElasticScrollArea>
    </div>
  );
};

// ============================================================================
// 2. RIGHT CANVAS: APP MOCKUPS (OWL Ed-Tech Clone)
// ============================================================================

const OWL_CAROUSEL = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
    badge: "Architecture",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
  },
];

const LESSONS = [
  {
    id: 1,
    title: "An Introduction to the Landscape",
    duration: "4:14",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=150",
  },
  {
    id: 2,
    title: "Movement and Expression",
    duration: "7:28",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150",
  },
  {
    id: 3,
    title: "Composition and the Urban Canvas",
    duration: "3:43",
    image:
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=150",
  },
  {
    id: 4,
    title: "Lighting Technique and Aesthetics",
    duration: "4:45",
    image:
      "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=150",
  },
];

const AppMockups = () => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="w-full h-full bg-surface-container-lowest mt-0 overflow-auto p-4 pt-0 md:p-8 flex items-start justify-center">
      <div className="w-full max-w-[1400px] mx-auto min-h-max transform transition-transform hover:scale-[1.01] duration-500 delay-100 flex items-start justify-center">
        <DeviceFrame defaultType="laptop">
          {/* App Content wrapper with @container for internal responsiveness independent of window */}
          <div className="@container w-full h-full bg-surface text-on-surface flex flex-col overflow-hidden relative">
            <div className="flex flex-1 h-full min-h-0">
              {/* Sidebar (Desktop/Tablet) using NavigationRail */}
              <div className="hidden @3xl:flex shrink-0 h-full ">
                <NavigationRail.Navigator
                  activeTab={activeTab}
                  onTabPress={setActiveTab}
                  variant="ghost"
                  itemVariant="secondary"
                  itemLayout="inline"
                  shape="full"
                  forceExpanded={true}
                  hideMenuButton={true}
                  bordered={false}
                  className="h-full pt-4"
                >
                  <NavigationRail.Header className="px-4 py-2 mb-6">
                    <div className="flex items-center gap-2 font-black text-xl tracking-tight">
                      <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-md">
                        <Bird size={16} fill="currentColor" />
                      </div>
                      OWL
                    </div>
                  </NavigationRail.Header>

                  <NavigationRail.Screen
                    name="home"
                    label="Home"
                    icon={() => <LayoutGrid size={18} />}
                  />
                  <NavigationRail.Screen
                    name="featured"
                    label="Featured"
                    icon={() => <Lightbulb size={18} />}
                  />
                  <NavigationRail.Screen
                    name="search"
                    label="Search"
                    icon={() => <Search size={18} />}
                  />
                </NavigationRail.Navigator>
              </div>

              {/* Main Area */}
              <div className="flex-1 overflow-hidden flex flex-col relative z-0">
                <ElasticScrollArea className="h-full w-full">
                  <div className="p-6 md:p-10 max-w-[1000px] mx-auto">
                    {/* Top Bar (Mobile only) */}
                    <div className="flex @3xl:hidden items-center justify-between mb-6">
                      <div className="flex items-center gap-2 font-black text-xl tracking-tight">
                        <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-md">
                          <Bird size={16} fill="currentColor" />
                        </div>
                        OWL
                      </div>
                      <Avatar
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"
                        size="sm"
                      />
                    </div>

                    {/* Right Top Header (Desktop only) */}
                    <div className="hidden @3xl:flex items-center justify-end gap-3 mb-6">
                      <IconButton variant="ghost" size="sm">
                        <Star size={18} className="text-on-surface-variant" />
                      </IconButton>
                      <Avatar
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"
                        size="sm"
                      />
                      <IconButton variant="ghost" size="sm">
                        <MoreVertical
                          size={18}
                          className="text-on-surface-variant"
                        />
                      </IconButton>
                    </div>

                    {/* Carousel using MD3 Carousel */}
                    <div className="relative w-full mb-6">
                      <Carousel
                        height={320}
                        slidesPerView={1.2}
                        loop={false}
                        breakpoints={{
                          640: { slidesPerView: 1.5 },
                          1024: { slidesPerView: 2.5 },
                        }}
                      >
                        {OWL_CAROUSEL.map((item, index) => (
                          <CarouselItem
                            key={item.id}
                            index={index}
                            imageUrl={item.image}
                          />
                        ))}
                      </Carousel>

                      {/* Static Overlays to match mockup */}
                      <div className="absolute top-4 left-4 z-10 pointer-events-none">
                        <IconButton
                          size="sm"
                          variant="surface"
                          className="bg-white/70 backdrop-blur-md text-black hover:bg-white shadow-sm pointer-events-auto"
                        >
                          <ArrowLeft size={18} />
                        </IconButton>
                      </div>
                      <div className="absolute bottom-4 left-[20%] @3xl:left-[15%] -translate-x-1/2 z-10 pointer-events-none">
                        <Badge className="bg-[#f4a8e5] text-black border-none font-bold px-4 py-1.5 shadow-md text-xs">
                          {OWL_CAROUSEL[0].badge}
                        </Badge>
                      </div>
                    </div>

                    {/* 2-Column Content */}
                    <div className="flex flex-col @5xl:flex-row gap-10 mt-4">
                      {/* Left */}
                      <div className="flex-1 min-w-0 pr-0 @5xl:pr-6">
                        <Typography
                          variant="display-medium"
                          className="font-bold leading-[1.1] tracking-tight mb-6"
                        >
                          Understanding the
                          <br />
                          Composition of
                          <br />
                          Modern Cities
                        </Typography>
                        <Typography
                          variant="body-large"
                          className="opacity-70 leading-relaxed mb-8 font-medium"
                        >
                          This video course explores the fundamental principles
                          of urban and rural building design. The curriculum
                          includes the history of architecture, the interplay of
                          interiors and exteriors, the impact of natural light
                          sources, and how to balance aesthetics with structural
                          integrity.
                        </Typography>

                        <Typography
                          variant="title-medium"
                          className="font-bold mb-4"
                        >
                          Materials you'll need
                        </Typography>
                        <ul className="list-disc pl-5 opacity-80 space-y-2 mb-8 font-medium">
                          <li>Laptop</li>
                          <li>Large sketchpad</li>
                          <li>#2 Pencil, charcoal</li>
                        </ul>
                      </div>

                      {/* Right */}
                      <div className="w-full @5xl:w-[400px] shrink-0">
                        <div className="rounded-[28px] bg-[#f3f1f5] dark:bg-surface-container-high p-6 shadow-sm">
                          <Typography
                            variant="title-medium"
                            className="font-bold mb-6 text-center text-lg"
                          >
                            Lessons in this course
                          </Typography>
                          <ItemGroup gap="sm" shape="full">
                            {LESSONS.map((lesson) => (
                              <Item
                                key={lesson.id}
                                variant="surface"
                                padding="sm"
                              >
                                <ItemMedia
                                  shape="minimal"
                                  className="w-[60px] h-[60px] rounded-xl overflow-hidden shadow-sm shrink-0"
                                >
                                  <img
                                    src={lesson.image}
                                    className="w-full h-full object-cover"
                                    alt={lesson.title}
                                  />
                                </ItemMedia>
                                <ItemContent className="justify-center px-2">
                                  <Typography
                                    variant="body-medium"
                                    className="font-bold leading-tight line-clamp-2"
                                  >
                                    {lesson.title}
                                  </Typography>
                                  <Typography
                                    variant="body-small"
                                    className="opacity-60 mt-1 font-medium text-xs"
                                  >
                                    {lesson.duration}
                                  </Typography>
                                </ItemContent>
                                <ItemActions>
                                  <IconButton
                                    variant="ghost"
                                    size="sm"
                                    shape="full"
                                    className="opacity-60 hover:opacity-100 border border-outline-variant bg-white dark:bg-surface"
                                  >
                                    <Play
                                      size={14}
                                      className="ml-0.5 fill-current"
                                    />
                                  </IconButton>
                                </ItemActions>
                              </Item>
                            ))}
                          </ItemGroup>
                        </div>
                      </div>
                    </div>

                    {/* Add extra padding at bottom to clear mobile tabs if present */}
                    <div className="h-16 @3xl:h-0" />
                  </div>
                </ElasticScrollArea>
              </div>
            </div>

            {/* Mobile Bottom Tabs */}
            <div className="flex @3xl:hidden shrink-0 border-t border-outline-variant/30 bg-surface z-50">
              <BottomTabs.Navigator
                activeTab={activeTab}
                onTabPress={setActiveTab}
                shape="full"
                mode="attached"
                bordered={false}
                itemLayout="stacked"
                variant="surface"
                itemVariant="secondary"
                disableRipple={true}
                pillStyle="icon"
                className="h-16 w-full"
              >
                <BottomTabs.Screen
                  name="home"
                  label="Home"
                  icon={() => <LayoutGrid size={20} />}
                />
                <BottomTabs.Screen
                  name="featured"
                  label="Featured"
                  icon={() => <Lightbulb size={20} />}
                />
                <BottomTabs.Screen
                  name="search"
                  label="Search"
                  icon={() => <Search size={20} />}
                />
                <BottomTabs.Screen
                  name="messages"
                  label="Messages"
                  icon={() => <MessageSquare size={20} />}
                />
              </BottomTabs.Navigator>
            </div>
          </div>
        </DeviceFrame>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN STORY RENDERER WITH RESIZABLE PANES
// ============================================================================

export const BuilderPlayground: StoryObj = {
  render: () => {
    return (
      <Resizable className="w-full h-screen overflow-hidden bg-background">
        <Resizable.Pane
          id="controls"
          defaultWidth={350}
          className="border-r border-outline-variant/30 shadow-2xl z-20 min-w-[300px]"
        >
          <SidebarControls />
        </Resizable.Pane>

        <Resizable.Handle target="controls" variant="pill" className="z-30" />

        <Resizable.Pane
          id="preview"
          flex
          className="z-10 bg-surface-container-lowest"
        >
          <AppMockups />
        </Resizable.Pane>
      </Resizable>
    );
  },
};
