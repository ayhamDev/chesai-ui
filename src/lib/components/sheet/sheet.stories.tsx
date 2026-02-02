import type { Meta, StoryObj } from "@storybook/react";
import clsx from "clsx";
import { useState } from "react";
import { Button } from "../button";
import { Typography } from "../typography";
import { Sheet } from "./index";

const meta: Meta<typeof Sheet> = {
  title: "Components/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A versatile and responsive sheet component. It renders as a bottom sheet on mobile viewports and intelligently transitions to a side sheet (drawer) on desktop. Now supports all standard Card variants (Primary, Secondary, Tertiary, High Contrast, Ghost).",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "tertiary",
        "high-contrast",
        "ghost",
        "surface",
      ],
      description: "The visual style of the sheet.",
    },
    side: {
      control: "select",
      options: ["left", "right", "top", "bottom"],
      description:
        "Determines which side the sheet appears from on desktop viewports.",
    },
    mode: {
      control: "select",
      options: ["normal", "detached"],
      description:
        "Controls the visual style ('normal' vs. floating 'detached').",
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "Controls the border-radius of the sheet.",
    },
    forceBottomSheet: {
      control: "boolean",
    },
    forceSideSheet: {
      control: "boolean",
    },
    snapPoints: {
      control: "object",
    },
    fadeFromIndex: {
      control: "number",
    },
    dismissible: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sheet>;

// Helper for rich, scrollable content
const DummyContent = () => (
  <div className="flex-1 overflow-y-auto p-6">
    <Typography variant="h4" className="mb-2">
      Sheet Content
    </Typography>
    <Typography variant="p">
      This is the main content area. It adapts to the variant colors
      automatically.
    </Typography>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`dummy-item-${i}`}
          className="h-24 rounded-2xl bg-black/5 dark:bg-white/10"
        />
      ))}
    </div>
  </div>
);

// --- STORIES ---

export const ResponsiveBehavior: Story = {
  name: "1. Responsive Behavior (Primary)",
  args: {
    side: "right",
    mode: "normal",
    shape: "full",
    variant: "primary",
  },
  render: (args) => (
    <div className="flex h-[500px] w-full items-center justify-center bg-graphite-background p-12">
      <Sheet {...args}>
        <Sheet.Trigger asChild>
          <Button>Open Sheet</Button>
        </Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Grabber />
          <Sheet.Header>
            <Sheet.Title>
              <Typography variant="h3">Responsive Sheet</Typography>
            </Sheet.Title>
            <Sheet.Description>
              <Typography variant="muted">
                Adapts to your screen size.
              </Typography>
            </Sheet.Description>
          </Sheet.Header>
          <DummyContent />
          <Sheet.Footer>
            <Button size="lg">Save Changes</Button>
            <Sheet.Close asChild>
              <Button size="lg" variant="secondary">
                Close
              </Button>
            </Sheet.Close>
          </Sheet.Footer>
        </Sheet.Content>
      </Sheet>
    </div>
  ),
};

export const ColorVariants: Story = {
  name: "2. Color Variants",
  args: {
    side: "right",
    forceSideSheet: true, // Force side sheet to better see colors on desktop
  },
  render: (args) => (
    <div className="flex h-[600px] w-full flex-col items-center justify-center gap-4 bg-graphite-background p-8">
      <div className="flex gap-4 flex-wrap justify-center">
        {/* Primary */}
        <Sheet {...args} variant="primary">
          <Sheet.Trigger asChild>
            <Button>Primary</Button>
          </Sheet.Trigger>
          <Sheet.Content>
            <Sheet.Header>
              <Typography variant="h3">Primary</Typography>
            </Sheet.Header>
            <DummyContent />
          </Sheet.Content>
        </Sheet>

        {/* Secondary */}
        <Sheet {...args} variant="secondary">
          <Sheet.Trigger asChild>
            <Button variant="secondary">Secondary</Button>
          </Sheet.Trigger>
          <Sheet.Content>
            <Sheet.Header>
              <Typography variant="h3">Secondary</Typography>
            </Sheet.Header>
            <DummyContent />
          </Sheet.Content>
        </Sheet>

        {/* Tertiary */}
        <Sheet {...args} variant="tertiary">
          <Sheet.Trigger asChild>
            <Button variant="tertiary">Tertiary</Button>
          </Sheet.Trigger>
          <Sheet.Content>
            <Sheet.Header>
              <Typography variant="h3">Tertiary</Typography>
            </Sheet.Header>
            <DummyContent />
          </Sheet.Content>
        </Sheet>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        {/* High Contrast */}
        <Sheet {...args} variant="high-contrast">
          <Sheet.Trigger asChild>
            <Button variant="outline">High Contrast</Button>
          </Sheet.Trigger>
          <Sheet.Content>
            <Sheet.Header>
              <Typography variant="h3" className="text-inherit">
                High Contrast
              </Typography>
            </Sheet.Header>
            <DummyContent />
          </Sheet.Content>
        </Sheet>

        {/* Surface */}
        <Sheet {...args} variant="surface">
          <Sheet.Trigger asChild>
            <Button variant="ghost">Surface</Button>
          </Sheet.Trigger>
          <Sheet.Content>
            <Sheet.Header>
              <Typography variant="h3">Surface</Typography>
            </Sheet.Header>
            <DummyContent />
          </Sheet.Content>
        </Sheet>
      </div>
    </div>
  ),
};

export const HighContrastSheet: Story = {
  name: "3. High Contrast (Inverse)",
  args: {
    variant: "high-contrast",
    side: "right",
    forceBottomSheet: true, // Show grabber behavior
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `high-contrast` variant uses the inverse surface colors. Note how the grabber handle automatically adjusts its opacity/color to remain visible against the dark background.",
      },
    },
  },
  render: (args) => (
    <div className="flex h-[500px] w-full items-center justify-center bg-graphite-background p-12">
      <Sheet {...args}>
        <Sheet.Trigger asChild>
          <Button variant="primary">Open High Contrast</Button>
        </Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Grabber />
          <Sheet.Header>
            <Typography variant="h3" className="text-inherit">
              Inverse Sheet
            </Typography>
            <Typography variant="p" className="text-inherit opacity-80">
              This uses the `inverse-surface` token.
            </Typography>
          </Sheet.Header>
          <DummyContent />
        </Sheet.Content>
      </Sheet>
    </div>
  ),
};

export const DetachedMode: Story = {
  name: "4. Detached Mode",
  args: {
    ...ResponsiveBehavior.args,
    mode: "detached",
    variant: "secondary",
  },
  render: (args) => <ResponsiveBehavior.render {...args} />,
};

export const WithSnappingPoints: Story = {
  name: "5. With Snapping (Bottom Sheet)",
  args: {
    snapPoints: [0.3, 0.6, 1],
    forceBottomSheet: true,
    variant: "surface",
  },
  render: (args) => (
    <div className="flex h-[500px] w-full items-center justify-center bg-graphite-background p-12">
      <Sheet {...args}>
        <Sheet.Trigger asChild>
          <Button variant="outline">Open Snappable</Button>
        </Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Grabber />
          <DummyContent />
        </Sheet.Content>
      </Sheet>
    </div>
  ),
};
