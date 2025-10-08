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
      options: ["primary", "secondary", "glass"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    isSelected: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "primary",
    shape: "minimal",
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

export const AllVariants: Story = {
  name: "All Variants & States",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card variant="primary" shape="minimal">
        <Typography variant="h4">Primary</Typography>
        <Typography variant="p">The default card style.</Typography>
      </Card>
      <Card variant="secondary" shape="minimal">
        <Typography variant="h4">Secondary</Typography>
        <Typography variant="p">For less emphasis.</Typography>
      </Card>
      <Card variant="primary" shape="minimal" isSelected={true}>
        <Typography variant="h4">Primary (Selected)</Typography>
        <Typography variant="p">To indicate selection.</Typography>
      </Card>
    </div>
  ),
};

export const GlassVariant: Story = {
  name: "Glass Variant",
  args: {
    variant: "glass",
    shape: "minimal",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `glass` variant creates a 'glassmorphism' effect with a blurred, semi-transparent background. It's designed to be placed on top of colorful or textured backgrounds.",
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
      <Card {...args} className="max-w-md">
        <Typography variant="h3">Glass Card</Typography>
        <Typography variant="p" className="!text-white/80">
          This card uses a backdrop-blur effect to create a frosted glass look,
          letting the background color and texture show through.
        </Typography>
      </Card>
    </div>
  ),
};

export const AllShapes: Story = {
  name: "All Shapes",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card shape="full">
        <Typography variant="h4">Full</Typography>
        <Typography variant="p">The default, highly-rounded style.</Typography>
      </Card>
      <Card shape="minimal">
        <Typography variant="h4">Minimal</Typography>
        <Typography variant="p">A more subtle, modern rounding.</Typography>
      </Card>
      <Card shape="sharp">
        <Typography variant="h4">Sharp</Typography>
        <Typography variant="p">No rounding for a blocky look.</Typography>
      </Card>
    </div>
  ),
};

export const Composition: Story = {
  name: "Composition Example",
  render: () => (
    <Card shape="minimal" className="max-w-sm flex flex-col gap-4">
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
