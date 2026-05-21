import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Button } from "../button";
import { CircularProgress } from "./index";

const meta: Meta<typeof CircularProgress> = {
  title: "Components/Feedback/CircularProgress",
  component: CircularProgress,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
    indeterminate: { control: "boolean" },
    variant: {
      control: "select",
      options: ["standard", "wavy"],
    },
    amplitude: { control: { type: "range", min: 0.5, max: 3, step: 0.1 } },
    frequency: { control: { type: "range", min: 4, max: 20, step: 1 } },
  },
};

export default meta;
type Story = StoryObj<typeof CircularProgress>;

export const Default: Story = {
  args: { value: 60, size: "md" },
};

export const Wavy: Story = {
  args: {
    variant: "wavy",
    value: 60,
    size: "lg",
    amplitude: 1.5,
    frequency: 10,
  },
  render: (args) => <CircularProgress {...args} />,
};

export const InteractiveMorph: Story = {
  args: {
    amplitude: 0.5,
    frequency: 4,
  },

  name: "Wavy to Flat Morph (100% Transition)",

  render: () => {
    const [progress, setProgress] = useState(50);

    return (
      <div className="flex flex-col items-center gap-6">
        <CircularProgress variant="wavy" size="lg" value={progress} />
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setProgress(50)}>
            Set 50% (Wavy)
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setProgress(85)}>
            Set 85% (Morphing)
          </Button>
          <Button size="sm" variant="primary" onClick={() => setProgress(100)}>
            Set 100% (Flat)
          </Button>
        </div>
        <span className="text-xs text-on-surface-variant font-medium">
          Progress: {progress}%
        </span>
      </div>
    );
  },
};

export const WithLabel: Story = {
  args: { value: 75, size: "lg" },
  render: (args) => (
    <CircularProgress {...args}>
      <span className="text-[10px] font-bold">{args.value}%</span>
    </CircularProgress>
  ),
};

export const Indeterminate: Story = {
  args: { indeterminate: true, size: "lg" },
};

export const IndeterminateWavy: Story = {
  name: "Wavy",
  args: {
    size: "xl",
    value: 47,
    amplitude: 1.6,
    gap: 8,
    variant: "wavy",
    frequency: 9
  },
  render: (args) => <CircularProgress {...args} />,
};
