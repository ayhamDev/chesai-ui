import type { Meta, StoryObj } from "@storybook/react";
import { Volume1, Volume2, Sun, Minus, Plus } from "lucide-react";
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
          "MD3 Slider with Line (Thin) and Bar (Thick) visual styles, supporting Standard, Centered, and Range behaviors.",
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

// --- 3. USE CASES ---

export const VolumeControl: Story = {
  name: "Use Case: Volume (Bar)",
  render: () => (
    <Card className="w-96 p-8 flex flex-col gap-6" variant="primary">
      <Typography variant="h4">System Volume</Typography>

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

export const BrightnessControl: Story = {
  name: "Use Case: Brightness (Centered)",
  render: () => (
    <div className="w-96 p-6 bg-black rounded-3xl flex flex-col gap-4 text-white">
      <div className="flex justify-between items-center">
        <Typography variant="body-large">Display</Typography>
        <Sun size={20} />
      </div>

      <Slider
        visual="bar"
        size="lg"
        variant="centered"
        min={-100}
        max={100}
        defaultValue={[0]}
        // Using a start icon for the bar looks great
        startIcon={<Sun size={24} />}
        withLabel
        thumbRingColor="black"
      />
      <div className="flex justify-between text-xs text-gray-400 px-2">
        <span>Darker</span>
        <span>Brighter</span>
      </div>
    </div>
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
