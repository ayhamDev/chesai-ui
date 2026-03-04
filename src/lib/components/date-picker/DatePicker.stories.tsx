import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DatePicker } from "./date-picker";
import { Calendar } from "./calendar";

const meta: Meta<typeof DatePicker> = {
  title: "Components/Forms & Inputs/DatePicker",
  component: DatePicker,
  subcomponents: { Calendar } as any,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive Date Picker supporting Docked, Modal, and Fullscreen modes. Includes visual input variants (filled, outlined, ghost) to match other form fields.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["docked", "modal", "fullscreen"],
      description: "The presentation style of the picker (popover vs dialog).",
    },
    inputVariant: {
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
      description: "Visual style of the input trigger.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "Shape of the input trigger.",
    },
    itemShape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "Shape of the internal calendar day buttons.",
    },
    disabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Docked: Story = {
  name: "1. Docked (Desktop)",
  args: {
    variant: "docked",
    label: "Appointment Date",
    placeholder: "Select a date",
    inputVariant: "filled",
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(undefined);
    return (
      <div className="w-72">
        <DatePicker {...args} value={date} onChange={setDate} />
      </div>
    );
  },
};

export const VisualVariants: Story = {
  name: "2. Input Variations",
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(undefined);
    return (
      <div className="flex flex-col gap-6 w-72">
        <DatePicker
          label="Filled (Default)"
          inputVariant="filled"
          value={date}
          onChange={setDate}
          placeholder="Filled style"
        />
        <DatePicker
          label="Outlined"
          inputVariant="outlined"
          value={date}
          onChange={setDate}
          placeholder="Outlined style"
        />
        <DatePicker
          label="Underlined"
          inputVariant="underlined"
          value={date}
          onChange={setDate}
          placeholder="Underlined style"
        />
        <DatePicker
          label="Ghost"
          inputVariant="ghost"
          value={date}
          onChange={setDate}
          placeholder="Ghost style"
        />
        <DatePicker
          label="Invalid State"
          isInvalid
          inputVariant="outlined"
          value={date}
          onChange={setDate}
          placeholder="Error state"
        />
      </div>
    );
  },
};

export const Modal: Story = {
  name: "3. Modal (Dialog)",
  args: {
    variant: "modal",
    label: "Birthday",
    itemShape: "full",
    inputVariant: "outlined",
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <div className="w-72">
        <DatePicker {...args} value={date} onChange={setDate} />
      </div>
    );
  },
};

export const FullscreenInfinite: Story = {
  name: "4. Fullscreen (Infinite Scroll)",
  args: {
    variant: "fullscreen",
    label: "Depart - Return dates",
    placeholder: "Select dates",
    inputVariant: "filled-inverted",
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <div className="w-72">
        <DatePicker {...args} value={date} onChange={setDate} />
      </div>
    );
  },
};

export const Sizes: Story = {
  name: "5. Sizes",
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <div className="flex flex-col gap-4 w-72">
        <DatePicker
          size="sm"
          label="Small"
          value={date}
          onChange={setDate}
          inputVariant="outlined"
        />
        <DatePicker
          size="md"
          label="Medium"
          value={date}
          onChange={setDate}
          inputVariant="outlined"
        />
        <DatePicker
          size="lg"
          label="Large"
          value={date}
          onChange={setDate}
          inputVariant="outlined"
        />
      </div>
    );
  },
};
