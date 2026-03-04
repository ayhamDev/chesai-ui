import type { Meta, StoryObj } from "@storybook/react";
import { CalendarDate, parseDate } from "@internationalized/date";
import React, { useState } from "react";
import { DateInput } from "./index";

const meta: Meta<typeof DateInput> = {
  title: "Components/Forms & Inputs/DateInput",
  component: DateInput,
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
    granularity: {
      control: "select",
      options: ["day", "month", "year"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DateInput>;

export const Default: Story = {
  args: {
    label: "Birth Date",
    defaultValue: parseDate("2024-04-04"),
    variant: "filled",
  },
};

export const Variants: Story = {
  name: "Visual Variants",
  render: () => (
    <div className="flex flex-col gap-6 w-72">
      <DateInput
        label="Filled"
        variant="filled"
        defaultValue={parseDate("2024-04-04")}
      />
      <DateInput
        label="Outlined"
        variant="outlined"
        defaultValue={parseDate("2024-04-04")}
      />
      <DateInput
        label="Underlined"
        variant="underlined"
        defaultValue={parseDate("2024-04-04")}
      />
      <DateInput
        label="Filled Inverted"
        variant="filled-inverted"
        defaultValue={parseDate("2024-04-04")}
      />
    </div>
  ),
};
