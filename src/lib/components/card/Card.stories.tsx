import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button";
import { Typography } from "../typography";
import { Card } from "./index";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "tertiary",
        "glass",
        "ghost",
        "surface",
      ],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    elevation: {
      control: "select",
      options: ["none", 1, 2, 3, 4, 5],
    },
    isSelected: {
      control: "boolean",
    },
    hoverEffect: {
      control: "boolean",
      description: "Enables the bloom effect (works best on ghost variant).",
    },
    enableRipple: {
      control: "boolean",
      description: "Enables the ripple click effect.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "primary",
    shape: "minimal",
    padding: "md",
  },
  render: (args) => (
    <Card {...args} className="max-w-md">
      <Typography variant="h3">This is a Card</Typography>
      <Typography variant="p">
        A card is a flexible container for content. You can place any other
        components inside it.
      </Typography>
    </Card>
  ),
};

export const ColorVariants: Story = {
  name: "Color Variants",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card variant="primary" className="p-6">
        <Typography variant="h4">Primary</Typography>
        <Typography variant="muted">bg-surface-container-low</Typography>
      </Card>
      <Card variant="secondary" className="p-6">
        <Typography variant="h4">Secondary</Typography>
        <Typography variant="muted">bg-surface-container-highest</Typography>
      </Card>
      <Card variant="tertiary" className="p-6">
        <Typography variant="h4">Tertiary</Typography>
        <Typography variant="muted">bg-tertiary-container</Typography>
      </Card>
    </div>
  ),
};

// --- NEW: Ghost Variant with Bloom & Ripple ---
export const GhostInteractive: Story = {
  name: "Interactive Ghost (Bloom + Ripple)",
  args: {
    variant: "ghost",
    shape: "minimal",
    hoverEffect: true,
    enableRipple: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Combines `variant='ghost'`, `hoverEffect={true}`, and `enableRipple={true}` to create a highly interactive, native-feeling touch target. The background scales in on hover, and a ripple expands on click.",
      },
    },
  },
  render: (args) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card {...args} className="max-w-md">
        <Typography variant="h4">Click Me</Typography>
        <Typography variant="muted">
          Hover for bloom, click for ripple.
        </Typography>
      </Card>

      <Card
        {...args}
        shape="full"
        className="max-w-md flex flex-col justify-center items-center h-32"
      >
        <Typography variant="h4">Full Shape</Typography>
      </Card>
    </div>
  ),
};

// --- NEW: Elevation Levels ---
export const ElevationLevels: Story = {
  name: "Modern Elevation",
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 p-4">
      <Card elevation={1} variant="primary" shape="minimal">
        <Typography variant="h4">Level 1</Typography>
        <Typography variant="muted">Subtle shadow</Typography>
      </Card>
      <Card elevation={2} variant="primary" shape="minimal">
        <Typography variant="h4">Level 2</Typography>
        <Typography variant="muted">Default floating</Typography>
      </Card>
      <Card elevation={3} variant="primary" shape="minimal">
        <Typography variant="h4">Level 3</Typography>
        <Typography variant="muted">Lifted state</Typography>
      </Card>
      <Card elevation={4} variant="primary" shape="minimal">
        <Typography variant="h4">Level 4</Typography>
        <Typography variant="muted">Dialog / Modal</Typography>
      </Card>
      <Card elevation={5} variant="primary" shape="minimal">
        <Typography variant="h4">Level 5</Typography>
        <Typography variant="muted">Maximum lift</Typography>
      </Card>
    </div>
  ),
};

export const GlassVariant: Story = {
  name: "Glass Variant",
  args: {
    variant: "glass",
    shape: "minimal",
    enableRipple: true, // Ripple works great on glass too
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `glass` variant creates a 'glassmorphism' effect. We've enabled ripple here to show it uses a lighter ripple color for better contrast on dark backgrounds.",
      },
    },
  },
  render: (args) => (
    <div
      className="w-full max-w-2xl h-96 flex items-center justify-center rounded-2xl overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1470&auto=format&fit=crop)",
      }}
    >
      <Card {...args} className="max-w-md cursor-pointer">
        <Typography variant="h3">Glass Card</Typography>
        <Typography variant="p" className="text-white/80!">
          Click to see the light ripple effect against the blurred backdrop.
        </Typography>
      </Card>
    </div>
  ),
};

export const Composition: Story = {
  name: "Composition Example",
  render: () => (
    <Card
      shape="minimal"
      elevation={2}
      className="max-w-sm flex flex-col gap-4"
    >
      <div>
        <Typography variant="h3">Upgrade to Pro</Typography>
        <Typography variant="muted">
          Unlock all features and get unlimited access.
        </Typography>
      </div>
      <Typography variant="p">
        Gain access to advanced analytics, priority support, and exclusive
        content by upgrading your plan today.
      </Typography>
      <div className="flex justify-end">
        <Button>Learn More</Button>
      </div>
    </Card>
  ),
};
// ... (existing imports)

export const Outlined: Story = {
  name: "Outlined Card",
  args: {
    variant: "primary",
    bordered: true,
    elevation: "none",
    shape: "minimal",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `bordered` prop adds a subtle 1px border. This is the standard 'Outlined' card style in Material Design 3.",
      },
    },
  },
  render: (args) => (
    <Card {...args} className="max-w-md">
      <Typography variant="h4">Outlined Style</Typography>
      <Typography variant="p">
        Best for low-priority content or clean, flat interfaces.
      </Typography>
    </Card>
  ),
};

export const BorderedVsElevated: Story = {
  name: "Compare: Border vs Elevation",
  render: () => (
    <div className="flex flex-wrap gap-6">
      {/* Bordered */}
      <Card bordered variant="primary" className="w-64">
        <Typography variant="h4">Bordered</Typography>
        <Typography variant="muted">Flat, 1px stroke</Typography>
      </Card>

      {/* Elevated */}
      <Card elevation={2} variant="primary" className="w-64">
        <Typography variant="h4">Elevated</Typography>
        <Typography variant="muted">Shadow, no stroke</Typography>
      </Card>

      {/* Both */}
      <Card bordered elevation={1} variant="primary" className="w-64">
        <Typography variant="h4">Both</Typography>
        <Typography variant="muted">Subtle stroke + Shadow</Typography>
      </Card>
    </div>
  ),
};
