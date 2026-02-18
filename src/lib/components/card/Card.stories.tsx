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
        "high-contrast",
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
      <Typography variant="title-large">This is a Card</Typography>
      <Typography variant="body-medium">
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
        <Typography variant="title-large">Primary</Typography>
        <Typography variant="body-small" muted={true}>
          bg-surface-container-low
        </Typography>
      </Card>
      <Card variant="secondary" className="p-6">
        <Typography variant="title-large">Secondary</Typography>
        <Typography variant="body-small" muted={true}>
          bg-surface-container-highest
        </Typography>
      </Card>
      <Card variant="tertiary" className="p-6">
        <Typography variant="title-large">Tertiary</Typography>
        <Typography variant="body-small" muted={true}>
          bg-tertiary-container
        </Typography>
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
        <Typography variant="title-large">Click Me</Typography>
        <Typography variant="body-small" muted={true}>
          Hover for bloom, click for ripple.
        </Typography>
      </Card>

      <Card
        {...args}
        shape="full"
        className="max-w-md flex flex-col justify-center items-center h-32"
      >
        <Typography variant="title-large">Full Shape</Typography>
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
        <Typography variant="title-large">Level 1</Typography>
        <Typography variant="body-small" muted={true}>
          Subtle shadow
        </Typography>
      </Card>
      <Card elevation={2} variant="primary" shape="minimal">
        <Typography variant="title-large">Level 2</Typography>
        <Typography variant="body-small" muted={true}>
          Default floating
        </Typography>
      </Card>
      <Card elevation={3} variant="primary" shape="minimal">
        <Typography variant="title-large">Level 3</Typography>
        <Typography variant="body-small" muted={true}>
          Lifted state
        </Typography>
      </Card>
      <Card elevation={4} variant="primary" shape="minimal">
        <Typography variant="title-large">Level 4</Typography>
        <Typography variant="body-small" muted={true}>
          Dialog / Modal
        </Typography>
      </Card>
      <Card elevation={5} variant="primary" shape="minimal">
        <Typography variant="title-large">Level 5</Typography>
        <Typography variant="body-small" muted={true}>
          Maximum lift
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
        <Typography variant="title-medium">Upgrade to Pro</Typography>
        <Typography variant="body-small" muted={true}>
          Unlock all features and get unlimited access.
        </Typography>
      </div>
      <Typography variant="body-medium">
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
      <Typography variant="title-large">Outlined Style</Typography>
      <Typography variant="body-medium">
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
        <Typography variant="title-large">Bordered</Typography>
        <Typography variant="body-small" muted={true}>
          Flat, 1px stroke
        </Typography>
      </Card>

      {/* Elevated */}
      <Card elevation={2} variant="primary" className="w-64">
        <Typography variant="title-large">Elevated</Typography>
        <Typography variant="body-small" muted={true}>
          Shadow, no stroke
        </Typography>
      </Card>

      {/* Both */}
      <Card bordered elevation={1} variant="primary" className="w-64">
        <Typography variant="title-large">Both</Typography>
        <Typography variant="body-small" muted={true}>
          Subtle stroke + Shadow
        </Typography>
      </Card>
    </div>
  ),
};
// ... existing imports
export const HighContrast: Story = {
  name: "High Contrast (Inverse)",
  args: {
    variant: "high-contrast",
    shape: "minimal",
    padding: "md",
    enableRipple: true,
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Card {...args} className="max-w-md">
        <Typography variant="title-large" className="text-inherit!">
          High Contrast Card
        </Typography>
        <Typography body-medium className="text-inherit! opacity-80">
          In Light Mode, I am dark. In Dark Mode, I am light/white. I use the
          MD3 Inverse Surface tokens.
        </Typography>
      </Card>

      <div className="flex gap-4">
        <Card
          {...args}
          shape="full"
          padding="sm"
          className="w-32 h-32 flex items-center justify-center text-center"
        >
          <Typography variant="label-small" className="text-inherit!">
            Inverse Full
          </Typography>
        </Card>
        <Card
          variant="primary"
          bordered
          shape="full"
          padding="sm"
          className="w-32 h-32 flex items-center justify-center text-center"
        >
          <Typography variant="label-small">Standard Outlined</Typography>
        </Card>
      </div>
    </div>
  ),
};
