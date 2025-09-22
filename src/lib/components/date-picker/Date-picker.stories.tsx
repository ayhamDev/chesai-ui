import type { Meta, StoryObj } from "@storybook/react";
import { addDays } from "date-fns";
import React, { useState } from "react";
import type { DateRange } from "react-day-picker";
import { DatePicker } from "./index";

const meta: Meta<typeof DatePicker> = {
  title: "Components/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A fully custom, MD3-compliant date picker with single/range modes, a spacious paginated calendar, and a manual input mode. It has three variants: `docked` (desktop), `modal`, and `fullscreen` (mobile).",
      },
    },
  },
  argTypes: {
    mode: {
      control: "select",
      options: ["single", "range"],
      description:
        "Determines if a single date or a date range can be selected.",
    },
    variant: {
      control: "select",
      options: ["docked", "modal", "fullscreen"],
      description:
        "Overrides the default responsive behavior to force a specific variant.",
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
    shape: { control: "select", options: ["full", "minimal", "sharp"] },
    label: { control: "text" },
    disabled: { control: "boolean" },
    value: { control: false },
    onChange: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Docked: Story = {
  name: "1. Docked (Desktop Default)",
  args: {
    variant: "docked",
    label: "Event Date",
    mode: "single",
  },
  render: function Render(args) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <div className="w-80">
        <DatePicker
          {...args}
          value={date}
          onChange={(val) => setDate(val as Date)}
        />
      </div>
    );
  },
};

export const ModalSingle: Story = {
  name: "2. Modal (Single Date)",
  args: {
    variant: "modal",
    label: "Appointment",
    mode: "single",
  },
  render: function Render(args) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <div className="w-80">
        <DatePicker
          {...args}
          value={date}
          onChange={(val) => setDate(val as Date)}
        />
      </div>
    );
  },
};

export const ModalRange: Story = {
  name: "3. Modal (Date Range)",
  args: {
    variant: "modal",
    label: "Vacation",
    mode: "range",
  },
  render: function Render(args) {
    const [range, setRange] = useState<DateRange | undefined>({
      from: new Date(),
      to: addDays(new Date(), 5),
    });
    return (
      <div className="w-80">
        <DatePicker
          {...args}
          value={range}
          onChange={(val) => setRange(val as DateRange)}
        />
      </div>
    );
  },
};

export const Fullscreen: Story = {
  name: "4. Fullscreen (Mobile Default)",
  args: {
    variant: "fullscreen",
    label: "Booking",
    mode: "range",
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: function Render(args) {
    const [range, setRange] = useState<DateRange | undefined>({
      from: new Date(),
      to: addDays(new Date(), 5),
    });
    return (
      <div className="w-80">
        <DatePicker
          {...args}
          value={range}
          onChange={(val) => setRange(val as DateRange)}
        />
      </div>
    );
  },
};

export const InputMode: Story = {
  name: "5. Manual Input Mode",
  args: {
    variant: "modal",
    label: "Date of Birth",
    mode: "single",
  },
  render: function Render(args) {
    const [date, setDate] = useState<Date | undefined>(new Date("1990-01-01"));
    return (
      <div className="w-80">
        <DatePicker
          {...args}
          value={date}
          onChange={(val) => setDate(val as Date)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Click the pencil icon in the modal to switch to the manual text input view.",
      },
    },
  },
};
