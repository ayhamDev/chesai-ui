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
    docs: {
      description: {
        component:
          "A time input component that allows users to enter time segments (Hour, Minute, Second, AM/PM).",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["flat", "bordered", "underlined", "faded"],
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
      description: "Whether to use 12 or 24 hour time format.",
    },
    granularity: {
      control: "select",
      options: ["hour", "minute", "second"],
      description: "Determines the granularity of the time selection.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TimeInput>;

export const Default: Story = {
  args: {
    label: "Event Time",
    defaultValue: new Time(11, 45),
  },
};

export const WithSeconds: Story = {
  name: "With Seconds (Granularity)",
  args: {
    label: "Meeting Time",
    granularity: "second",
    defaultValue: new Time(11, 45, 30),
  },
};

export const HourCycle24: Story = {
  name: "24 Hour Format",
  args: {
    label: "24h Time",
    hourCycle: 24,
    defaultValue: new Time(18, 30),
  },
};

export const WithStartContent: Story = {
  name: "With Icon",
  args: {
    label: "Appointment",
    defaultValue: parseTime("09:00"),
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

export const MinMaxTime: Story = {
  name: "Min & Max Time",
  args: {
    label: "Business Hours (9am - 5pm)",
    minValue: new Time(9),
    maxValue: new Time(17),
    defaultValue: new Time(8), // Invalid default to show error state behavior
  },
  parameters: {
    docs: {
      description: {
        story:
          "Try entering a time outside 09:00 to 17:00. The input will handle validation states automatically.",
      },
    },
  },
};
