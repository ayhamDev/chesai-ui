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
    variant: "filled",
  },
};

export const Variants: Story = {
  name: "Visual Variants",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <Input
        label="Filled (Default)"
        variant="filled"
        placeholder="Standard grey background"
      />
      <Input
        label="Filled Inverted"
        variant="filled-inverted"
        placeholder="Lighter background"
      />
      <Input label="Outlined" variant="outlined" placeholder="Bordered" />
      <Input
        label="Outlined Inverted"
        variant="outlined-inverted"
        placeholder="Colored Border"
      />
      <Input
        label="Underlined"
        variant="underlined"
        placeholder="Bottom border only"
      />
      <Input
        label="Ghost"
        variant="ghost"
        placeholder="Transparent until hover"
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
        variant="filled"
        placeholder="Rounded-2xl"
      />
      <Input
        label="Full"
        shape="full"
        variant="filled"
        placeholder="Rounded-full"
      />
      <Input
        label="Sharp"
        shape="sharp"
        variant="filled"
        placeholder="Rounded-none"
      />
    </div>
  ),
};

export const Sizes: Story = {
  name: "Sizes (Inside Label)",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <Input label="Small" size="sm" variant="filled" />
      <Input label="Medium" size="md" variant="filled" />
      <Input label="Large" size="lg" variant="filled" />
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    labelPlacement: "outside",
    variant: "outlined",
  },
  name: "With Icons",
  render: () => (
    <div className="w-full flex flex-col gap-4 max-w-sm">
      <Input
        label="Email"
        shape="full"
        variant="outlined"
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
        variant="filled"
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
