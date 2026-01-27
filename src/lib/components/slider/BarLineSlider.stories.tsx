import type { Meta, StoryObj } from "@storybook/react";
import { Sun, Volume2, Mic } from "lucide-react";
import { useState } from "react";
import { BarLineSlider } from "./bar-line-slider";
import { Typography } from "../typography";

const meta: Meta<typeof BarLineSlider> = {
  title: "Components/Forms & Inputs/BarLineSlider",
  component: BarLineSlider,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A specialized slider component featuring a thick active bar and a thin inactive track, often used for volume or brightness controls in modern UIs.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-black p-12 rounded-3xl min-w-[400px] flex justify-center">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    barHeight: { control: "text" },
    activeColor: { control: "text" },
    inactiveColor: { control: "text" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof BarLineSlider>;

export const Brightness: Story = {
  name: "Brightness Control",
  render: (args) => {
    const [val, setVal] = useState([40]);
    return (
      <div className="w-full max-w-sm flex flex-col gap-4">
        <BarLineSlider
          {...args}
          value={val}
          onValueChange={setVal}
          icon={
            <Sun className="w-6 h-6 fill-black/20 stroke-black stroke-[2]" />
          }
          aria-label="Brightness"
        />
      </div>
    );
  },
};

export const Volume: Story = {
  name: "Volume Control",
  render: () => {
    const [val, setVal] = useState([75]);
    return (
      <div className="w-full max-w-sm">
        <BarLineSlider
          value={val}
          onValueChange={setVal}
          activeColor="bg-white"
          inactiveColor="bg-white/20"
          icon={<Volume2 className="w-6 h-6 text-black" />}
          aria-label="Volume"
        />
      </div>
    );
  },
};

export const MicrophoneLevel: Story = {
  name: "Microphone (Custom Colors)",
  render: () => {
    const [val, setVal] = useState([60]);
    return (
      <div className="w-full max-w-sm">
        <BarLineSlider
          value={val}
          onValueChange={setVal}
          // Using MD3 primary color
          activeColor="bg-primary"
          // Using MD3 surface container
          inactiveColor="bg-surface-container-highest"
          barHeight="h-14"
          icon={<Mic className="w-6 h-6 text-on-primary" />}
        />
      </div>
    );
  },
};

export const SlimVariant: Story = {
  name: "Slim Variant",
  args: {
    barHeight: "h-8",
    defaultValue: [50],
    icon: <Sun className="w-4 h-4 stroke-black" />,
  },
};
