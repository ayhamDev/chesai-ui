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
    variant: "filled",
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
    variant: "outlined",
    startContent: <span className="text-gray-500 text-sm">$</span>,
  },
};

export const Variants: Story = {
  name: "Visual Variants",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <NumberInput label="Filled" variant="filled" defaultValue={10} />
      <NumberInput
        label="Filled Inverted"
        variant="filled-inverted"
        defaultValue={20}
      />
      <NumberInput label="Outlined" variant="outlined" defaultValue={30} />
      <NumberInput label="Underlined" variant="underlined" defaultValue={40} />
    </div>
  ),
};
