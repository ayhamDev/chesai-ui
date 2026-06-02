import type { Meta, StoryObj } from "@storybook/react";
import { Volume2, Sun, Minus, Plus, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Slider } from "./index";
import { Card } from "../card";
import { Typography } from "../typography";

const meta: Meta<typeof Slider> = {
  title: "Components/Forms & Inputs/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "MD3 Slider with Line (Thin) and Bar (Thick) styles. Supports standard, centered, and range variants. Now includes physical segment gaps, dynamic edge smoothing, and adjustable thumb geometry.",
      },
    },
  },
  argTypes: {
    visual: {
      control: "select",
      options: ["line", "bar"],
      description: "The visual style: thin line or thick bar.",
    },
    variant: {
      control: "select",
      options: ["standard", "centered", "range"],
      description: "The behavior of the slider value.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      if: { arg: "visual", eq: "bar" },
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "error"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description:
        "Outer border radius. Gap corners smooth dynamically to prevent overshoots.",
    },
    gap: {
      control: { type: "range", min: 0, max: 32, step: 1 },
      description:
        "Physical transparent gap between the thumb and track segments.",
    },
    thumbHeight: {
      control: "text",
      description:
        "Override height/length of the thumb (supports dynamic classes like 'h-16' or raw CSS '80px').",
    },
    thumbWidth: {
      control: "text",
      description:
        "Override width/thickness of the thumb (supports dynamic classes like 'w-1.5' or raw CSS '4px').",
    },
    withTicks: { control: "boolean" },
    withLabel: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

// --- 1. BAR VARIATIONS (Thick) ---

export const StandardBar: Story = {
  name: "Standard Bar (Default)",
  args: {
    visual: "bar",
    size: "sm",
    defaultValue: [50],
    withLabel: true,
  },
  render: (args) => (
    <div className="w-80">
      <Slider {...args} />
    </div>
  ),
};

export const CenteredBar: Story = {
  name: "Centered Bar",
  args: {
    visual: "bar",
    variant: "centered",
    size: "lg",
    min: -50,
    max: 50,
    defaultValue: [0],
    withLabel: true,
  },
  render: (args) => (
    <div className="w-80 flex flex-col gap-2">
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>-50</span>
        <span>0</span>
        <span>+50</span>
      </div>
      <Slider {...args} />
    </div>
  ),
};

export const RangeBar: Story = {
  name: "Range Bar",
  args: {
    visual: "bar",
    variant: "range",
    size: "lg",
    defaultValue: [25, 75],
    withLabel: true,
    gap: 8,
    thumbHeight: "80px",
    thumbWidth: "4px",
  },
  render: (args) => (
    <div className="w-[450px]">
      <Slider {...args} />
    </div>
  ),
};

// --- 2. GAP & ADJUSTABLE GEOMETRY ---

export const RoundedPillWithGap: Story = {
  name: "Pill Bar (Gap & Smoothed Edges)",
  args: {
    visual: "bar",
    size: "sm",
    shape: "full",
    defaultValue: [47],
    gap: 10,
    thumbHeight: "80px",
    thumbWidth: "4px",
    color: "primary",
  },
  render: (args) => {
    return (
      <div className="w-96 flex flex-col gap-6 p-6 bg-surface-container/20 rounded-2xl">
        <Typography
          variant="label-medium"
          className="opacity-60 uppercase font-bold tracking-wider"
        >
          Smoothed Edges ({args.shape})
        </Typography>
        <Slider {...args} />
      </div>
    );
  },
};

// --- 3. LINE VARIATIONS (Thin) ---

export const StandardLine: Story = {
  name: "Standard Line",
  args: {
    visual: "line",
    defaultValue: [60],
    withLabel: true,
  },
  render: (args) => (
    <div className="w-80">
      <Slider {...args} />
    </div>
  ),
};

export const LineWithIcons: Story = {
  name: "Line with Icons",
  args: {
    visual: "line",
    defaultValue: [40],
    startIcon: <Minus size={20} />,
    endIcon: <Plus size={20} />,
  },
  render: (args) => (
    <div className="w-80">
      <Slider {...args} />
    </div>
  ),
};

// --- 4. COLORS & SHAPES ---

export const Variations: Story = {
  name: "Colors & Shapes",
  render: () => (
    <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-[600px]">
      {/* Primary Full */}
      <div className="flex flex-col gap-2">
        <Typography variant="label-small">Primary Full</Typography>
        <Slider visual="bar" color="primary" shape="full" defaultValue={[60]} />
      </div>

      {/* Secondary Minimal */}
      <div className="flex flex-col gap-2">
        <Typography variant="label-small">Secondary Minimal</Typography>
        <Slider
          visual="bar"
          color="secondary"
          shape="minimal"
          defaultValue={[40]}
        />
      </div>

      {/* Tertiary Sharp */}
      <div className="flex flex-col gap-2">
        <Typography variant="label-small">Tertiary Sharp</Typography>
        <Slider
          visual="bar"
          color="tertiary"
          shape="sharp"
          defaultValue={[75]}
        />
      </div>

      {/* Error Minimal */}
      <div className="flex flex-col gap-2">
        <Typography variant="label-small">Error Minimal</Typography>
        <Slider
          visual="bar"
          color="error"
          shape="minimal"
          defaultValue={[90]}
          startIcon={
            <AlertCircle className="w-4 h-4 text-on-error-container" />
          }
        />
      </div>

      {/* Line Primary Full */}
      <div className="flex flex-col gap-2">
        <Typography variant="label-small">Line Primary Full</Typography>
        <Slider
          visual="line"
          color="primary"
          shape="full"
          defaultValue={[60]}
        />
      </div>

      {/* Line Secondary Sharp */}
      <div className="flex flex-col gap-2">
        <Typography variant="label-small">Line Secondary Sharp</Typography>
        <Slider
          visual="line"
          color="secondary"
          shape="sharp"
          defaultValue={[30]}
        />
      </div>
    </div>
  ),
};

// --- 5. USE CASES ---

export const VolumeControl: Story = {
  name: "Use Case: Volume (Bar)",
  render: () => {
    const [val, setVal] = useState([47]);
    return (
      <Card className="w-96 p-8 flex flex-col gap-6" variant="primary">
        <Typography variant="title-small">Notification Volume</Typography>

        <Slider
          visual="bar"
          size="sm"
          shape="full"
          value={val}
          onValueChange={setVal}
          startIcon={<Volume2 className="text-on-primary" />}
          gap={10}
          thumbHeight="80px"
          thumbWidth="4px"
        />

        <Typography variant="body-medium" className="opacity-60">
          System volume level: {val[0]}%
        </Typography>
      </Card>
    );
  },
};

export const DiscreteSteps: Story = {
  name: "Discrete Steps (Ticks)",
  args: {
    visual: "bar",
    size: "md",
    step: 10,
    min: 0,
    max: 100,
    defaultValue: [30],
    withTicks: true,
    withLabel: true,
    gap: 3
  },
  render: (args) => (
    <div className="w-80">
      <Slider {...args} />
    </div>
  ),
};

export const VerticalBar: Story = {
  name: "Vertical Bar",
  args: {
    visual: "bar",
    orientation: "vertical",
    size: "md",
    defaultValue: [50],
    withLabel: true,
    startIcon: <Volume2 className="text-on-primary" />,
  },
  render: (args) => (
    <div className="h-80 p-10 bg-surface-container rounded-xl flex items-center justify-center">
      <Slider {...args} />
    </div>
  ),
};
