import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Typography } from "../typography";
import { Slider } from "./index";

const meta: Meta<typeof Slider> = {
  title: "Components/Forms & Inputs/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A slider component inspired by Material Design 3 for selecting a value or range of values. It supports 'linear' and 'bar' variants, as well as 'horizontal' and 'vertical' directions.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["linear", "bar"],
    },
    direction: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "2xl"],
      if: { arg: "variant", eq: "bar" },
    },
    disabled: { control: "boolean" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    minStepsBetweenThumbs: { control: "number" },
    onValueChange: { action: "value changed" },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Linear: Story = {
  name: "1. Linear (Single Value)",
  args: {
    variant: "linear",
    defaultValue: [50],
    max: 100,
    step: 1,
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.defaultValue);

    return (
      <div className="w-80">
        <Typography variant="large" className="text-center">
          Volume: {value?.[0]}
        </Typography>
        <Slider {...args} value={value} onValueChange={setValue} />
      </div>
    );
  },
};

export const LinearRange: Story = {
  name: "2. Linear (Range)",
  args: {
    variant: "linear",
    defaultValue: [25, 75],
    max: 100,
    step: 1,
    minStepsBetweenThumbs: 10,
  },
  render: function Render(args) {
    const [range, setRange] = useState(args.defaultValue);

    return (
      <div className="w-80">
        <Typography variant="large" className="text-center">
          Price Range: ${range?.[0]} - ${range?.[1]}
        </Typography>
        <Slider {...args} value={range} onValueChange={setRange} />
      </div>
    );
  },
};

export const BarVariant: Story = {
  name: "3. Bar Variant (All Sizes)",
  args: {
    variant: "bar",
    defaultValue: [60],
    max: 100,
  },
  render: (args) => (
    <div className="w-80 flex flex-col gap-8">
      <div>
        <Typography variant="small" className="font-semibold">
          Size: sm
        </Typography>
        <Slider {...args} size="sm" />
      </div>
      <div>
        <Typography variant="small" className="font-semibold">
          Size: md
        </Typography>
        <Slider {...args} size="md" />
      </div>
      <div>
        <Typography variant="small" className="font-semibold">
          Size: lg
        </Typography>
        <Slider {...args} size="lg" />
      </div>
      <div>
        <Typography variant="small" className="font-semibold">
          Size: xl
        </Typography>
        <Slider {...args} size="xl" />
      </div>
      <div>
        <Typography variant="small" className="font-semibold">
          Size: 2xl
        </Typography>
        <Slider {...args} size="2xl" />
      </div>
    </div>
  ),
};

export const VerticalDirection: Story = {
  name: "4. Vertical Direction",
  args: {
    direction: "vertical",
    defaultValue: [50],
    max: 100,
  },
  render: (args) => (
    <div className="flex h-64 items-center justify-center gap-16">
      <div>
        <Typography variant="h4" className="mb-4 text-center">
          Linear
        </Typography>
        <Slider {...args} variant="linear" />
      </div>
      <div>
        <Typography variant="h4" className="mb-4 text-center">
          Bar
        </Typography>
        <Slider {...args} variant="bar" size="lg" />
      </div>
      <div>
        <Typography variant="h4" className="mb-4 text-center">
          Bar (Range)
        </Typography>
        <Slider {...args} variant="bar" size="xl" defaultValue={[20, 80]} />
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  name: "5. Disabled State",
  render: () => (
    <div className="w-80 flex flex-col gap-8">
      <div>
        <Typography variant="small" className="mb-2">
          Linear (Disabled)
        </Typography>
        <Slider variant="linear" defaultValue={[50]} disabled />
      </div>
      <div>
        <Typography variant="small" className="mb-2">
          Bar (Disabled)
        </Typography>
        <Slider variant="bar" size="lg" defaultValue={[20, 80]} disabled />
      </div>
    </div>
  ),
};
