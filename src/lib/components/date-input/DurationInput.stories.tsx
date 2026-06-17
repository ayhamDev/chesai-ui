// src/lib/components/date-input/DurationInput.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { DurationInput } from "./duration-input";
import { parseDuration } from "./use-duration-input";
import { Timer } from "lucide-react";

const meta: Meta<typeof DurationInput> = {
  title: "Components/Forms & Inputs/DurationInput",
  component: DurationInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "filled",
        "filled-inverted",
        "outlined",
        "outlined-inverted",
        "underlined",
        "underlined-inverted",
        "ghost",
        "ghost-inverted",
      ],
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "error"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    labelPlacement: {
      control: "select",
      options: ["inside", "outside", "outside-left"],
    },
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    isRequired: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof DurationInput>;

export const Default: Story = {
  args: {
    label: "Total Durationasa",
    defaultValue: parseDuration("02:45:30"),
    variant: "ghost",
  },
};

export const WithStartContent: Story = {
  name: "With Icon",
  args: {
    label: "Timer Limit",
    defaultValue: { hours: 10, minutes: 0, seconds: 0 },
    variant: "outlined",
    startContent: (
      <Timer
        className="text-default-400 pointer-events-none flex-shrink-0"
        size={18}
      />
    ),
  },
  render: (args) => (
    <div className="w-72">
      <DurationInput {...args} />
    </div>
  ),
};

export const Variants: Story = {
  name: "Visual Variants",
  render: () => (
    <div className="flex flex-col gap-6 w-72">
      <DurationInput
        label="Filled"
        variant="filled"
        defaultValue={parseDuration("01:15:00")}
      />
      <DurationInput
        label="Outlined"
        variant="outlined"
        defaultValue={parseDuration("01:15:00")}
      />
      <DurationInput
        label="Underlined"
        variant="underlined"
        defaultValue={parseDuration("01:15:00")}
      />
      <DurationInput
        label="Filled Inverted"
        variant="filled-inverted"
        defaultValue={parseDuration("01:15:00")}
      />
    </div>
  ),
};
