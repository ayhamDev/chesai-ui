// src/lib/context/ThemeProvider.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import {
  Paintbrush,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import React, { useState } from "react";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Card } from "../components/card";
import { ColorPicker } from "../components/color-picker";
import { FAB } from "../components/fab";
import { Grid, GridItem } from "../components/layout/grid";
import { Switch } from "../components/switch";
import { Typography } from "../components/typography";
import { ThemeProvider, useTheme } from "./ThemeProvider";
import { CSS_MAPPING } from "../utils/theme-generator";

const meta: Meta<typeof ThemeProvider> = {
  title: "Theme/Advanced Theme Builder",
  component: ThemeProvider,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

const AdvancedThemeDemo = () => {
  const {
    theme,
    setTheme,
    seedColor,
    setSeedColor,
    resolvedTheme,
    overrides,
    setOverride,
    resetOverrides,
  } = useTheme();

  // Helper for manual override inputs
  const [primaryOverride, setPrimaryOverride] = useState(
    overrides.primary || "",
  );
  const [backgroundOverride, setBackgroundOverride] = useState(
    overrides.background || "",
  );

  const handleManualPrimaryChange = (val: string) => {
    setPrimaryOverride(val);
    setOverride("primary", val);
  };

  const handleManualBackgroundChange = (val: string) => {
    setBackgroundOverride(val);
    setOverride("background", val);
  };

  return (
    <div className="min-h-screen bg-background text-on-background transition-colors duration-300 p-8 flex flex-col gap-8">
      {/* 1. SEED COLOR CONTROL */}
      <Card variant="surface" className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <Typography
              variant="headline-small"
              className="font-bold flex items-center gap-2"
            >
              <Sparkles className="text-primary" /> Global Seed Color
            </Typography>
            <Typography variant="body-medium" muted>
              Generates a full palette. Overrides below take precedence.
            </Typography>
          </div>
          <div className="flex items-center gap-4">
            <ColorPicker
              value={seedColor || "#8F4C38"}
              onChange={setSeedColor}
              variant="bordered"
              shape="full"
              label="Seed"
            />
            <Button
              variant="ghost"
              onClick={() => setSeedColor(null)}
              disabled={!seedColor}
            >
              Clear Seed
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. MANUAL OVERRIDES CONTROL */}
      <Card variant="surface" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Typography
              variant="headline-small"
              className="font-bold flex items-center gap-2"
            >
              <SlidersHorizontal className="text-secondary" /> Manual Overrides
            </Typography>
            <Typography variant="body-medium" muted>
              Granular control over specific tokens. Try changing Primary or
              Background.
            </Typography>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetOverrides();
              setPrimaryOverride("");
              setBackgroundOverride("");
            }}
          >
            Reset All Overrides
          </Button>
        </div>

        <Grid columns={{ default: 1, sm: 2, md: 4 }} gap="md">
          <ColorPicker
            label="Primary Color Override"
            value={primaryOverride || (seedColor ? "Generated" : "")}
            onChange={handleManualPrimaryChange}
            variant="faded"
          />
          <ColorPicker
            label="Background Color Override"
            value={backgroundOverride || (seedColor ? "Generated" : "")}
            onChange={handleManualBackgroundChange}
            variant="faded"
          />
          {/* Add more specific pickers here as needed */}
        </Grid>
      </Card>

      {/* 3. PREVIEW */}
      <Typography
        variant="title-large"
        className="font-bold border-b border-outline-variant pb-2"
      >
        Resulting UI ({resolvedTheme} mode)
      </Typography>

      <Grid columns={{ default: 1, md: 3 }} gap="lg">
        {/* Primary Card */}
        <Card variant="primary" className="p-6 flex flex-col gap-4">
          <Typography variant="title-medium">Primary Surface</Typography>
          <Typography variant="body-medium">
            This card uses <code>primary-container</code> bg and{" "}
            <code>on-primary-container</code> text.
          </Typography>
          <Button variant="primary">Primary Button</Button>
        </Card>

        {/* Background Check */}
        <Card variant="surface" bordered className="p-6 flex flex-col gap-4">
          <Typography variant="title-medium">Surface</Typography>
          <Typography variant="body-medium">
            Uses standard surface colors.
          </Typography>
          <Button variant="secondary">Secondary Button</Button>
        </Card>

        {/* Tertiary */}
        <Card variant="tertiary" className="p-6 flex flex-col gap-4">
          <Typography variant="title-medium">Tertiary Accent</Typography>
          <FAB icon={<Paintbrush />} variant="tertiary" size="sm" />
        </Card>
      </Grid>

      <div className="flex gap-4">
        <Button onClick={() => setTheme("light")}>Force Light</Button>
        <Button onClick={() => setTheme("dark")}>Force Dark</Button>
      </div>
    </div>
  );
};

export const Builder: StoryObj = {
  render: () => (
    <ThemeProvider>
      <AdvancedThemeDemo />
    </ThemeProvider>
  ),
};
