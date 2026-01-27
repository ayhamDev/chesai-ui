import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TimePicker } from "./index";

const meta: Meta<typeof TimePicker> = {
  title: "Components/Forms & Inputs/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A custom, iOS-style time picker with a roller interface. It supports single time selection and features responsive variants: `docked` (desktop), `modal`, and `fullscreen` (mobile).",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["docked", "modal"],
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
type Story = StoryObj<typeof TimePicker>;

export const Docked: Story = {
  name: "1. Docked (Desktop Default)",
  args: {
    variant: "docked",
    label: "Event Time",
  },
  render: function Render(args) {
    const [time, setTime] = useState<Date | undefined>(new Date());
    return (
      <div className="w-80">
        <TimePicker {...args} value={time} onChange={(val) => setTime(val)} />
      </div>
    );
  },
};

export const Modal: Story = {
  name: "2. Modal",
  args: {
    variant: "modal",
    label: "Appointment Time",
  },
  render: function Render(args) {
    const [time, setTime] = useState<Date | undefined>(new Date());
    return (
      <div className="w-80">
        <TimePicker {...args} value={time} onChange={(val) => setTime(val)} />
      </div>
    );
  },
};

export const AllSizesAndShapes: Story = {
  name: "3. Trigger Sizes & Shapes",
  render: () => (
    <div className="flex max-w-sm flex-col gap-8">
      <div>
        <h3 className="mb-4 font-bold">Small Size</h3>
        <div className="flex items-start gap-4">
          <TimePicker size="sm" shape="full" placeholder="Full" />
          <TimePicker size="sm" shape="minimal" placeholder="Minimal" />
          <TimePicker size="sm" shape="sharp" placeholder="Sharp" />
        </div>
      </div>
      <div>
        <h3 className="mb-4 font-bold">Medium Size</h3>
        <div className="flex items-start gap-4">
          <TimePicker size="md" shape="full" placeholder="Full" />
          <TimePicker size="md" shape="minimal" placeholder="Minimal" />
          <TimePicker size="md" shape="sharp" placeholder="Sharp" />
        </div>
      </div>
      <div>
        <h3 className="mb-4 font-bold">Large Size</h3>
        <div className="flex items-start gap-4">
          <TimePicker size="lg" shape="full" placeholder="Full" />
          <TimePicker size="lg" shape="minimal" placeholder="Minimal" />
          <TimePicker size="lg" shape="sharp" placeholder="Sharp" />
        </div>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  name: "4. Disabled State",
  args: {
    label: "Start Time",
    disabled: true,
  },
  render: function Render(args) {
    return (
      <div className="w-80">
        <TimePicker {...args} />
      </div>
    );
  },
};
