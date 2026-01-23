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
    docs: {
      description: {
        component:
          "A date input component that allows users to enter a date segment by segment (Day, Month, Year). It supports validation, custom styling, and internationalization.",
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
      description: "Determines the granularity of the date selection.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof DateInput>;

export const Default: Story = {
  args: {
    label: "Birth Date",
    defaultValue: parseDate("2024-04-04"),
  },
};

export const Variants: Story = {
  name: "Visual Variants",
  render: () => (
    <div className="flex flex-col gap-6 w-72">
      <DateInput
        label="Flat"
        variant="flat"
        defaultValue={parseDate("2024-04-04")}
      />
      <DateInput
        label="Bordered"
        variant="bordered"
        defaultValue={parseDate("2024-04-04")}
      />
      <DateInput
        label="Underlined"
        variant="underlined"
        defaultValue={parseDate("2024-04-04")}
      />
      <DateInput
        label="Faded"
        variant="faded"
        defaultValue={parseDate("2024-04-04")}
      />
    </div>
  ),
};

export const Shapes: Story = {
  name: "Shapes",
  render: () => (
    <div className="flex flex-col gap-6 w-72">
      <DateInput
        label="Minimal"
        shape="minimal"
        variant="bordered"
        defaultValue={parseDate("2024-04-04")}
      />
      <DateInput
        label="Full"
        shape="full"
        variant="bordered"
        defaultValue={parseDate("2024-04-04")}
      />
      <DateInput
        label="Sharp"
        shape="sharp"
        variant="bordered"
        defaultValue={parseDate("2024-04-04")}
      />
    </div>
  ),
};

export const LabelPlacements: Story = {
  name: "Label Placements",
  render: () => (
    <div className="flex flex-col gap-8 w-80">
      <DateInput
        label="Inside"
        labelPlacement="inside"
        defaultValue={parseDate("2024-04-04")}
      />
      <DateInput
        label="Outside"
        labelPlacement="outside"
        defaultValue={parseDate("2024-04-04")}
      />
      <DateInput
        label="Outside Left"
        labelPlacement="outside-left"
        defaultValue={parseDate("2024-04-04")}
      />
    </div>
  ),
};

export const WithDescriptionAndError: Story = {
  name: "States (Error & Description)",
  render: () => (
    <div className="flex flex-col gap-6 w-72">
      <DateInput
        label="Event Date"
        description="Please select a weekday."
        defaultValue={new CalendarDate(2024, 11, 7)}
      />
      <DateInput
        label="Deadline"
        isInvalid
        errorMessage="Please enter a valid date."
        defaultValue={new CalendarDate(2024, 11, 7)}
      />
    </div>
  ),
};

export const Controlled: Story = {
  name: "Controlled",
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState(new CalendarDate(2024, 4, 4));

    return (
      <div className="flex flex-col gap-4 w-72">
        <DateInput label="Controlled Date" value={value} onChange={setValue} />
        <p className="text-sm text-gray-500">Selected: {value.toString()}</p>
      </div>
    );
  },
};
