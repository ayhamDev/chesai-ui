import type { Meta, StoryObj } from "@storybook/react";
import { Volume1, Volume2, Sun, Minus, Plus, AlertCircle } from "lucide-react";
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
          "MD3 Slider with Line (Thin) and Bar (Thick) visual styles, supporting Standard, Centered, and Range behaviors. Now includes Shape and Color props.",
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
  },
  render: (args) => (
    <div className="w-80">
      <Slider {...args} />
    </div>
  ),
};

// --- 2. LINE VARIATIONS (Thin) ---

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

// --- 3. COLORS & SHAPES ---

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

// --- 4. USE CASES ---

export const VolumeControl: Story = {
  name: "Use Case: Volume (Bar)",
  render: () => (
    <Card className="w-96 p-8 flex flex-col gap-6" variant="primary">
      <Typography variant="title-small">System Volume</Typography>

      {/* Bar Slider with Icon Inside */}
      <Slider
        visual="bar"
        size="lg"
        defaultValue={[70]}
        startIcon={<Volume2 className="text-on-primary" />}
        withLabel
        thumbRingColor="var(--md-sys-color-surface-container-low)"
      />
    </Card>
  ),
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
