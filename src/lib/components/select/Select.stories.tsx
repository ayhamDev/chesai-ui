import type { Meta, StoryObj } from "@storybook/react";
import { User } from "lucide-react";
import { useState } from "react";
import { Select } from "./index";

const meta: Meta<typeof Select> = {
  title: "Components/Forms & Inputs/Select",
  component: Select,
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
    mobileLayout: {
      control: "select",
      options: ["default", "bottom-sheet", "dialog"],
    },
    disabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const animals = [
  { value: "cat", label: "Cat" },
  { value: "dog", label: "Dog" },
  { value: "elephant", label: "Elephant" },
  { value: "lion", label: "Lion" },
  { value: "tiger", label: "Tiger" },
  { value: "giraffe", label: "Giraffe" },
  { value: "cat2", label: "Cat2" },
  { value: "dog2", label: "Dog2" },
  { value: "elephant2", label: "Elephant2" },
  { value: "lion2", label: "Lion2" },
  { value: "tiger2", label: "Tiger2" },
  { value: "giraffe2", label: "Giraffe2" },
];

export const Default: Story = {
  args: {
    label: "Favorite Animal",
    placeholder: "Select an animal",
    items: animals,
    labelPlacement: "inside",
    mobileLayout: "dialog"
  },
};

export const Variants: Story = {
  name: "Visual Variants",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <Select
        label="Flat (Default)"
        variant="flat"
        items={animals}
        placeholder="Select..."
      />
      <Select
        label="Faded"
        variant="faded"
        items={animals}
        placeholder="Select..."
      />
      <Select
        label="Bordered"
        variant="bordered"
        items={animals}
        placeholder="Select..."
      />
      <Select
        label="Underlined"
        variant="underlined"
        items={animals}
        placeholder="Select..."
      />
    </div>
  ),
};

export const Shapes: Story = {
  name: "Shapes",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <Select
        label="Minimal"
        shape="minimal"
        variant="flat"
        items={animals}
        placeholder="Select..."
      />
      <Select
        label="Full"
        shape="full"
        variant="flat"
        items={animals}
        placeholder="Select..."
      />
      <Select
        label="Sharp"
        shape="sharp"
        variant="flat"
        items={animals}
        placeholder="Select..."
      />
    </div>
  ),
};

export const Sizes: Story = {
  name: "Sizes",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <Select label="Small" size="sm" items={animals} placeholder="Select..." />
      <Select
        label="Medium"
        size="md"
        items={animals}
        placeholder="Select..."
      />
      <Select label="Large" size="lg" items={animals} placeholder="Select..." />
    </div>
  ),
};

export const WithStartContent: Story = {
  name: "With Start Content",
  args: {
    label: "User",
    placeholder: "Select user",
    items: [
      { value: "1", label: "Jane Doe" },
      { value: "2", label: "John Smith" },
    ],
    startContent: <User className="w-4 h-4 text-gray-500" />,
  },
};

export const InvalidState: Story = {
  name: "Invalid State",
  args: {
    label: "Required Field",
    placeholder: "Select...",
    items: animals,
    isInvalid: true,
    errorMessage: "Please make a selection",
  },
};
