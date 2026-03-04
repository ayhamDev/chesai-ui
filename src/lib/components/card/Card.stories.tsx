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
        "surface-container-lowest",
        "surface-container-low",
        "surface-container",
        "surface-container-high",
        "surface-container-highest",
      ],
      description: "The visual style of the card.",
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
    variant: "surface-container",
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

export const SurfaceHierarchy: Story = {
  name: "MD3 Surface Hierarchy",
  parameters: {
    docs: {
      description: {
        story:
          "Material Design 3 uses specific surface tones to denote elevation and containment hierarchy without necessarily using shadows.",
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card variant="surface-container-lowest" className="p-6">
        <Typography variant="title-medium">Surface Container Lowest</Typography>
        <Typography variant="body-small" muted={true}>
          Lowest elevation
        </Typography>
      </Card>
      <Card variant="surface-container-low" className="p-6">
        <Typography variant="title-medium">Surface Container Low</Typography>
        <Typography variant="body-small" muted={true}>
          Low elevation
        </Typography>
      </Card>
      <Card variant="surface-container" className="p-6">
        <Typography variant="title-medium">Surface Container</Typography>
        <Typography variant="body-small" muted={true}>
          Default container
        </Typography>
      </Card>
      <Card variant="surface-container-high" className="p-6">
        <Typography variant="title-medium">Surface Container High</Typography>
        <Typography variant="body-small" muted={true}>
          High elevation
        </Typography>
      </Card>
      <Card variant="surface-container-highest" className="p-6">
        <Typography variant="title-medium">
          Surface Container Highest
        </Typography>
        <Typography variant="body-small" muted={true}>
          Highest elevation
        </Typography>
      </Card>
    </div>
  ),
};

export const ColorVariants: Story = {
  name: "Semantic Colors",
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

export const ElevationLevels: Story = {
  name: "Shadow Elevation",
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 p-4">
      <Card elevation={1} variant="surface-container" shape="minimal">
        <Typography variant="title-large">Level 1</Typography>
        <Typography variant="body-small" muted={true}>
          Subtle shadow
        </Typography>
      </Card>
      <Card elevation={2} variant="surface-container" shape="minimal">
        <Typography variant="title-large">Level 2</Typography>
        <Typography variant="body-small" muted={true}>
          Default floating
        </Typography>
      </Card>
      <Card elevation={3} variant="surface-container" shape="minimal">
        <Typography variant="title-large">Level 3</Typography>
        <Typography variant="body-small" muted={true}>
          Lifted state
        </Typography>
      </Card>
      <Card elevation={4} variant="surface-container" shape="minimal">
        <Typography variant="title-large">Level 4</Typography>
        <Typography variant="body-small" muted={true}>
          Dialog / Modal
        </Typography>
      </Card>
      <Card elevation={5} variant="surface-container" shape="minimal">
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

export const Outlined: Story = {
  name: "Outlined Card",
  args: {
    variant: "surface",
    bordered: true,
    elevation: "none",
    shape: "minimal",
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
