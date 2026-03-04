import type { Meta, StoryObj } from "@storybook/react";
import { Time, parseTime } from "@internationalized/date";
import React from "react";
import { TimeInput } from "./index";
import { Clock } from "lucide-react";

const meta: Meta<typeof TimeInput> = {
  title: "Components/Forms & Inputs/TimeInput",
  component: TimeInput,
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
    hourCycle: {
      control: "radio",
      options: [12, 24],
    },
    granularity: {
      control: "select",
      options: ["hour", "minute", "second"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TimeInput>;

export const Default: Story = {
  args: {
    label: "Event Time",
    defaultValue: new Time(11, 45),
    variant: "filled",
  },
};

export const WithSeconds: Story = {
  name: "With Seconds (Granularity)",
  args: {
    label: "Meeting Time",
    granularity: "second",
    defaultValue: new Time(11, 45, 30),
    variant: "outlined",
  },
};

export const WithStartContent: Story = {
  name: "With Icon",
  args: {
    label: "Appointment",
    defaultValue: parseTime("09:00"),
    variant: "filled-inverted",
    startContent: (
      <Clock
        className="text-default-400 pointer-events-none flex-shrink-0"
        size={18}
      />
    ),
  },
  render: (args) => (
    <div className="w-72">
      <TimeInput {...args} />
    </div>
  ),
};
