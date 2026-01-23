import type { Meta, StoryObj } from "@storybook/react";
import { DollarSign } from "lucide-react";
import { NumberInput } from "./index";

const meta: Meta<typeof NumberInput> = {
  title: "Components/Forms & Inputs/NumberInput",
  component: NumberInput,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["flat", "bordered", "underlined", "faded"],
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
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    allowFloat: { control: "boolean" },
    disabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    hideStepper: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {
  args: {
    label: "Quantity",
    placeholder: "0",
    defaultValue: 1,
    min: 0,
  },
};

export const FloatingNumbers: Story = {
  name: "Floating Numbers",
  args: {
    label: "Price",
    placeholder: "0.00",
    defaultValue: 3.5,
    min: 0,
    step: 0.5,
    allowFloat: true,
    startContent: <span className="text-gray-500 text-sm">$</span>,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Enable `allowFloat` to input decimals. The stepper increments based on the `step` prop (e.g., 0.5).",
      },
    },
  },
};

export const Variants: Story = {
  args: {
    allowFloat: true
  },

  name: "Visual Variants",

  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <NumberInput label="Flat (Default)" variant="flat" defaultValue={10} />
      <NumberInput label="Faded" variant="faded" defaultValue={20} />
      <NumberInput label="Bordered" variant="bordered" defaultValue={30} />
      <NumberInput label="Underlined" variant="underlined" defaultValue={40} />
    </div>
  )
};

export const Shapes: Story = {
  name: "Shapes",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <NumberInput
        label="Minimal"
        shape="minimal"
        variant="flat"
        defaultValue={5}
      />
      <NumberInput label="Full" shape="full" variant="flat" defaultValue={5} />
      <NumberInput
        label="Sharp"
        shape="sharp"
        variant="flat"
        defaultValue={5}
      />
    </div>
  ),
};

export const MinMaxStep: Story = {
  name: "Min, Max & Step",
  args: {
    label: "Rating (0-10)",
    min: 0,
    max: 10,
    step: 1,
    defaultValue: 5,
  },
};

export const HiddenStepper: Story = {
  name: "Hidden Stepper",
  args: {
    label: "Year",
    hideStepper: true,
    placeholder: "2024",
  },
};
