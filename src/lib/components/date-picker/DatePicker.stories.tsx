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
          "A comprehensive Date Picker supporting Docked, Modal, and Fullscreen modes. It strictly follows Material Design 3 specifications, including the ability to toggle between a Calendar grid and a Text Input for accessibility.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["docked", "modal", "fullscreen"],
      description: "The presentation style of the picker.",
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

export const Modal: Story = {
  name: "2. Modal (Dialog)",
  args: {
    variant: "modal",
    label: "Birthday",
    itemShape: "full",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The standard MD3 Date Picker dialog. Features a header with the selected date and an edit button to switch to text input mode.",
      },
    },
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

export const Fullscreen: Story = {
  name: "3. Fullscreen (Mobile)",
  args: {
    variant: "fullscreen",
    label: "Travel Date",
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(undefined);
    return (
      <div className="flex items-center justify-center h-screen w-full bg-graphite-background p-4">
        <div className="w-full max-w-sm">
          <DatePicker {...args} value={date} onChange={setDate} />
        </div>
      </div>
    );
  },
};

export const Shapes: Story = {
  name: "4. Shapes Customization",
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <div className="flex flex-col gap-8 w-72">
        <DatePicker
          label="Full (MD3 Default)"
          variant="modal"
          shape="full"
          itemShape="full"
          value={date}
          onChange={setDate}
        />
        <DatePicker
          label="Minimal (Rounded Corners)"
          variant="modal"
          shape="minimal"
          itemShape="minimal"
          value={date}
          onChange={setDate}
        />
        <DatePicker
          label="Sharp (Square)"
          variant="modal"
          shape="sharp"
          itemShape="sharp"
          value={date}
          onChange={setDate}
        />
      </div>
    );
  },
};
