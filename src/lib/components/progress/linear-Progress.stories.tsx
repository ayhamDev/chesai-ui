import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Button } from "../button";
import { LinearProgress } from "./index";

const meta: Meta<typeof LinearProgress> = {
  title: "Components/Feedback/LinearProgress",
  component: LinearProgress,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    indeterminate: { control: "boolean" },
    variant: {
      control: "select",
      options: ["standard", "wavy"],
    },
    amplitude: { control: { type: "range", min: 0.5, max: 4, step: 0.1 } },
    frequency: { control: { type: "range", min: 2, max: 15, step: 0.5 } },
  },
};

export default meta;
type Story = StoryObj<typeof LinearProgress>;

export const Default: Story = {
  args: { value: 50 },
  render: (args) => (
    <div className="w-80">
      <LinearProgress {...args} />
    </div>
  ),
};

export const Wavy: Story = {
  args: {
    variant: "wavy",
    value: 60,
    amplitude: 1.8,
    frequency: 6.5,
  },
  render: (args) => (
    <div className="w-80">
      <LinearProgress {...args} />
    </div>
  ),
};

export const InteractiveMorph: Story = {
  name: "Wavy to Flat Morph (100% Transition)",
  render: () => {
    const [progress, setProgress] = useState(50);

    return (
      <div className="flex flex-col items-center gap-6 w-80">
        <LinearProgress variant="wavy" value={progress} />
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

export const Indeterminate: Story = {
  args: { indeterminate: true },
  render: (args) => (
    <div className="w-80">
      <LinearProgress {...args} />
    </div>
  ),
};

export const IndeterminateWavy: Story = {
  name: "Indeterminate (Wavy Flow)",
  args: {
    indeterminate: true,
    variant: "wavy",
  },
  render: (args) => (
    <div className="w-80">
      <LinearProgress {...args} />
    </div>
  ),
};
