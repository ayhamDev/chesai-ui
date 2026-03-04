import type { Meta, StoryObj } from "@storybook/react";
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
          "A versatile and responsive sheet component. It renders as a bottom sheet on mobile viewports and intelligently transitions to a side sheet (drawer) on desktop. Supports full MD3 surface hierarchy.",
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
        "surface-container-lowest",
        "surface-container-low",
        "surface-container",
        "surface-container-high",
        "surface-container-highest",
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
    <Typography variant="title-small" className="mb-2">
      Sheet Content
    </Typography>
    <Typography variant="body-medium">
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
  name: "1. Responsive Behavior",
  args: {
    side: "right",
    mode: "normal",
    shape: "full",
    variant: "surface-container-high",
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
              <Typography variant="title-medium">Responsive Sheet</Typography>
            </Sheet.Title>
            <Sheet.Description>
              <Typography variant="body-small" muted={true}>
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

export const SurfaceVariants: Story = {
  name: "2. Surface Variants",
  args: {
    side: "right",
    forceSideSheet: true,
  },
  render: (args) => (
    <div className="flex h-[600px] w-full flex-col items-center justify-center gap-6 bg-graphite-background p-8">
      <Typography variant="title-medium">Semantic Surfaces</Typography>
      <div className="flex gap-4 flex-wrap justify-center">
        {/* Surface Low */}
        <Sheet {...args} variant="surface-container-low">
          <Sheet.Trigger asChild>
            <Button variant="secondary">Surface Container Low</Button>
          </Sheet.Trigger>
          <Sheet.Content>
            <Sheet.Header>
              <Typography variant="title-medium">
                Surface Container Low
              </Typography>
            </Sheet.Header>
            <DummyContent />
          </Sheet.Content>
        </Sheet>

        {/* Surface Container */}
        <Sheet {...args} variant="surface-container">
          <Sheet.Trigger asChild>
            <Button variant="secondary">Container</Button>
          </Sheet.Trigger>
          <Sheet.Content>
            <Sheet.Header>
              <Typography variant="title-medium">Surface Container</Typography>
            </Sheet.Header>
            <DummyContent />
          </Sheet.Content>
        </Sheet>

        {/* Surface High */}
        <Sheet {...args} variant="surface-container-high">
          <Sheet.Trigger asChild>
            <Button variant="secondary">Surface Container High</Button>
          </Sheet.Trigger>
          <Sheet.Content>
            <Sheet.Header>
              <Typography variant="title-medium">
                Surface Container High
              </Typography>
            </Sheet.Header>
            <DummyContent />
          </Sheet.Content>
        </Sheet>

        {/* Surface Highest */}
        <Sheet {...args} variant="surface-container-highest">
          <Sheet.Trigger asChild>
            <Button variant="secondary">Surface Container Highest</Button>
          </Sheet.Trigger>
          <Sheet.Content>
            <Sheet.Header>
              <Typography variant="title-medium">
                Surface Container Highest
              </Typography>
            </Sheet.Header>
            <DummyContent />
          </Sheet.Content>
        </Sheet>
      </div>

      <Typography variant="title-medium">Semantic Roles</Typography>
      <div className="flex gap-4 flex-wrap justify-center">
        {/* Primary */}
        <Sheet {...args} variant="primary">
          <Sheet.Trigger asChild>
            <Button variant="primary">Primary</Button>
          </Sheet.Trigger>
          <Sheet.Content>
            <Sheet.Header>
              <Typography variant="title-medium">Primary</Typography>
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
              <Typography variant="title-medium">Tertiary</Typography>
            </Sheet.Header>
            <DummyContent />
          </Sheet.Content>
        </Sheet>

        {/* High Contrast */}
        <Sheet {...args} variant="high-contrast">
          <Sheet.Trigger asChild>
            <Button variant="outline">High Contrast</Button>
          </Sheet.Trigger>
          <Sheet.Content>
            <Sheet.Header>
              <Typography variant="title-medium" className="text-inherit">
                High Contrast
              </Typography>
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
    forceBottomSheet: true,
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
            <Typography variant="title-medium" className="text-inherit">
              Inverse Sheet
            </Typography>
            <Typography body-medium className="text-inherit opacity-80">
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
    variant: "surface-container",
  },
  render: (args) => <ResponsiveBehavior.render {...args} />,
};

export const WithSnappingPoints: Story = {
  name: "5. With Snapping (Bottom Sheet)",
  args: {
    snapPoints: [0.3, 0.6, 1],
    forceBottomSheet: true,
    variant: "surface-container-high",
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
