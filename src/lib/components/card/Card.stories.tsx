import type { Meta, StoryObj } from "@storybook/react";
import { CreditCard, Eye, ShieldAlert, Star, TrendingUp } from "lucide-react";
import React from "react";
import { Button } from "../button";
import { Typography } from "../typography";
import { Card, CardGroup } from "./index";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  subcomponents: { CardGroup },
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
    animatedGradientBorder: {
      control: "boolean",
      description:
        "Enables an animated linear gradient surrounding the border.",
    },
    gradientWidth: {
      control: "number",
      description: "Border thickness of the gradient.",
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
    glass: false,
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
        <Typography className="text-inherit! opacity-80 text-sm">
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

export const GlassEffect: Story = {
  name: "Glass Effect (Backdrop Blur)",
  args: {
    glass: true,
    padding: "md",
    shape: "minimal",
    variant: "primary",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Applies a highly polished glassmorphism effect using `backdrop-blur-xl`. It flawlessly blends the translucent alpha level to perfectly match whichever surface `variant` you select (Primary, Secondary, Surface, etc).",
      },
    },
  },
  render: (args) => (
    <div className="w-full max-w-3xl h-[450px] bg-gradient-to-br from-indigo-500 via-rose-500 to-pink-500 rounded-3xl p-6 md:p-12 flex items-center justify-center relative overflow-hidden shadow-inner">
      {/* Decorative blurred blobs in the background to show off the glass */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-white/30 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-black/20 rounded-full blur-3xl animate-pulse" />

      <Card
        {...args}
        variant={args.variant}
        className="max-w-md w-full relative z-10"
      >
        <Typography variant="title-large">Glassmorphism Card</Typography>
        <Typography
          variant="body-medium"
          className="mt-2 opacity-80 leading-relaxed"
        >
          This card dynamically adjusts its transparency based on the variant
          you pass to it, blurring the vibrant gradient behind it.
        </Typography>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" shape="minimal">
            Dismiss
          </Button>
          <Button variant="primary" shape="minimal">
            Awesome
          </Button>
        </div>
      </Card>
    </div>
  ),
};

// ============================================================================
// NEW: ANIMATED GRADIENT BORDER STORY
// ============================================================================

export const AnimatedGradientBorder: Story = {
  name: "Animated Gradient Border",
  args: {
    // Example of a dark variant
    variant: "surface-container-highest",

    shape: "minimal",
    padding: "md",
    animatedGradientBorder: true,
    gradientWidth: 2,
    gradientColors: ["#4285F4", "#EA4335", "#FBBC05", "#34A853"],
    glass: false
  },
  parameters: {
    docs: {
      description: {
        story:
          "Injects a seamlessly looping, CSS-masked animated linear gradient border around the card. It does not obstruct content or interfere with hover and click state ripples. Perfect for 'Pro' up-sells.",
      },
    },
  },
  render: (args) => (
    <Card {...args} className="max-w-sm flex flex-col gap-1.5">
      <Typography variant="title-medium" className="font-bold">
        Upgrade to unlock more
      </Typography>
      <Typography variant="body-small" muted>
        Access higher limits, Pro models, and more.
      </Typography>
    </Card>
  ),
};

// ============================================================================
// CARD GROUP STORIES
// ============================================================================

export const GroupedVertical: StoryObj = {
  name: "Group: Vertical Stack (Settings Menu)",
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates a vertical stacked list of cards grouped under a single continuous capsule context. If `gap='none'` is specified, double overlapping borders are automatically resolved.",
      },
    },
  },
  render: () => (
    <div className="w-96 flex flex-col gap-4">
      <Typography variant="title-medium" className="px-1 font-bold">
        Account Settings
      </Typography>
      <CardGroup shape="sharp" direction="vertical" gap="none">
        <Card
          variant="surface-container"
          bordered
          padding="sm"
          className="cursor-pointer hover:bg-surface-container-high transition-colors flex items-center gap-4"
        >
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <CreditCard size={20} />
          </div>
          <div className="flex-1">
            <Typography variant="title-small">Payment Methods</Typography>
            <Typography variant="body-small" muted>
              Manage your cards and billing details.
            </Typography>
          </div>
        </Card>

        <Card
          variant="surface-container"
          bordered
          padding="sm"
          className="cursor-pointer hover:bg-surface-container-high transition-colors flex items-center gap-4"
        >
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <Eye size={20} />
          </div>
          <div className="flex-1">
            <Typography variant="title-small">Privacy & Visibility</Typography>
            <Typography variant="body-small" muted>
              Control who sees your activity.
            </Typography>
          </div>
        </Card>

        <Card
          variant="surface-container"
          bordered
          padding="sm"
          className="cursor-pointer hover:bg-surface-container-high transition-colors flex items-center gap-4"
        >
          <div className="p-2.5 rounded-xl bg-error/10 text-error shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div className="flex-1">
            <Typography variant="title-small" className="text-error">
              Security Center
            </Typography>
            <Typography variant="body-small" muted>
              Review authentication logs.
            </Typography>
          </div>
        </Card>
      </CardGroup>
    </div>
  ),
};

export const GroupedHorizontal: StoryObj = {
  name: "Group: Horizontal Stack (Grid Metrics)",
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates standard card grouping inside a horizontal block. Custom corner-radii are inherited seamlessly from the card's own definitions.",
      },
    },
  },
  render: () => (
    <div className="w-[600px] flex flex-col gap-4">
      <Typography variant="title-medium" className="font-bold">
        Performance Overview
      </Typography>
      <CardGroup shape="full" direction="horizontal" gap="sm">
        <Card
          variant="surface-container-low"
          bordered
          className="flex-1 flex flex-col gap-2 p-5"
        >
          <div className="flex justify-between items-center text-primary">
            <Typography variant="label-large" className="font-bold">
              Total Revenue
            </Typography>
            <TrendingUp size={18} />
          </div>
          <Typography variant="headline-medium" className="font-extrabold">
            $45,231
          </Typography>
          <Typography variant="body-small" muted>
            +12.4% from last month
          </Typography>
        </Card>

        <Card
          variant="surface-container-low"
          bordered
          className="flex-1 flex flex-col gap-2 p-5"
        >
          <div className="flex justify-between items-center text-tertiary">
            <Typography variant="label-large" className="font-bold">
              Subscribers
            </Typography>
            <Star size={18} />
          </div>
          <Typography variant="headline-medium" className="font-extrabold">
            1,204
          </Typography>
          <Typography variant="body-small" muted>
            +4.3% from last week
          </Typography>
        </Card>
      </CardGroup>
    </div>
  ),
};
