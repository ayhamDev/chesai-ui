import type { Meta, StoryObj } from "@storybook/react";
import { FontPicker } from "./FontPicker";
import { Card } from "../card";
import { Typography } from "../typography";
import { Button } from "../button";
import { ThemeProvider } from "../../context/ThemeProvider"; // Import the provider

const meta: Meta = {
  title: "Theme/Typography Control",
  component: FontPicker,
  tags: ["autodocs"],
  // Add the decorator here to ensure the context exists
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;

export const TypographyPlayground: StoryObj = {
  render: () => (
    <div className="space-y-8 max-w-2xl mx-auto p-4 bg-graphite-background min-h-screen">
      <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl border border-outline-variant shadow-sm">
        <div>
          <Typography variant="title-medium" className="font-bold">
            Style Settings
          </Typography>
          <Typography variant="body-small" muted>
            Customize the app typography dynamically.
          </Typography>
        </div>
        {/* The FontPicker will now have access to the context */}
        <FontPicker />
      </div>

      <div className="grid gap-6">
        <Card className="p-8">
          <Typography variant="display-medium" className="mb-4">
            The Quick Brown Fox
          </Typography>
          <Typography variant="headline-small" className="mb-2 text-primary">
            Jumps over the lazy dog
          </Typography>
          <Typography
            variant="body-large"
            className="mb-6 opacity-80 max-w-prose"
          >
            This text demonstrates the relationship between your selected
            <strong className="text-primary"> Brand Font</strong> (Headings) and
            your
            <strong className="text-secondary"> Plain Font</strong> (Body text).
            Material You relies on this contrast to create expressive
            interfaces.
          </Typography>
          <div className="flex gap-3">
            <Button>Primary Action</Button>
            <Button variant="secondary">Secondary</Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card variant="secondary" className="p-6">
            <Typography variant="title-large">Serif vs Sans</Typography>
            <Typography variant="body-medium" className="mt-2 opacity-70">
              Try selecting <strong>Playfair Display</strong> for the Header and{" "}
              <strong>Inter</strong> for the body to see a classic editorial
              look.
            </Typography>
          </Card>
          <Card variant="secondary" className="p-6">
            <Typography variant="title-large">Modern Tech</Typography>
            <Typography variant="body-medium" className="mt-2 opacity-70">
              Try <strong>Space Grotesk</strong> for the Header and{" "}
              <strong>Karla</strong> for the body for a quirky modern startup
              vibe.
            </Typography>
          </Card>
        </div>
      </div>
    </div>
  ),
};
