import type { Meta, StoryObj } from "@storybook/react";
import { Mail, Search } from "lucide-react";
import { Input } from "./index";

const meta: Meta<typeof Input> = {
  title: "Components/Forms & Inputs/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["flat", "bordered", "underlined", "faded", "ghost"],
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
    disabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    isClearable: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: "Email",
    placeholder: "Enter your email",
    type: "email",
  },
};

export const Variants: Story = {
  name: "Visual Variants",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <Input
        label="Flat (Default)"
        variant="flat"
        placeholder="Filled no ring"
      />
      <Input
        label="Ghost"
        variant="ghost"
        placeholder="Transparent, background on hover"
      />
      <Input
        label="Faded"
        variant="faded"
        placeholder="Background shift on focus"
      />
      <Input label="Bordered" variant="bordered" placeholder="Outline style" />
      <Input
        label="Underlined"
        variant="underlined"
        placeholder="Bottom border only"
      />
    </div>
  ),
};

export const Shapes: Story = {
  name: "Rounding Shapes",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <Input
        label="Minimal (Default)"
        shape="minimal"
        variant="flat"
        placeholder="Rounded-2xl"
      />
      <Input
        label="Full"
        shape="full"
        variant="flat"
        placeholder="Rounded-full"
      />
      <Input
        label="Sharp"
        shape="sharp"
        variant="flat"
        placeholder="Rounded-none"
      />
    </div>
  ),
};

export const Sizes: Story = {
  name: "Sizes (Inside Label)",

  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <Input label="Small" size="sm" variant="flat" />
      <Input label="Medium" size="md" variant="flat" />
      <Input label="Large" size="lg" variant="flat" />
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    labelPlacement: "outside",
  },

  name: "With Icons",

  render: () => (
    <div className="w-full flex flex-col gap-4 max-w-sm">
      <Input
        label="Email"
        shape="full"
        placeholder="you@example.com"
        labelPlacement="outside"
        startContent={
          <Mail
            className="text-on-surface-variant pointer-events-none flex-shrink-0"
            size={20}
          />
        }
      />
      <Input
        label="Search"
        shape="full"
        placeholder="Type to search..."
        endContent={
          <Search
            className="text-on-surface-variant pointer-events-none flex-shrink-0"
            size={18}
          />
        }
      />
    </div>
  ),
};
