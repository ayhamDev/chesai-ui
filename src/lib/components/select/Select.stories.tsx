import type { Meta, StoryObj } from "@storybook/react";
import { User } from "lucide-react";
import { Select } from "./index";

const meta: Meta<typeof Select> = {
  title: "Components/Forms & Inputs/Select",
  component: Select,
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
];

export const Default: Story = {
  args: {
    label: "Favorite Animal",
    placeholder: "Select an animal",
    items: animals,
    labelPlacement: "inside",
    variant: "filled",
    mobileLayout: "dialog",
  },
};

export const Variants: Story = {
  name: "Visual Variants",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <Select
        label="Filled"
        variant="filled"
        items={animals}
        placeholder="Select..."
      />
      <Select
        label="Filled Inverted"
        variant="filled-inverted"
        items={animals}
        placeholder="Select..."
      />
      <Select
        label="Outlined"
        variant="outlined"
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
        variant="filled"
        items={animals}
        placeholder="Select..."
      />
      <Select
        label="Full"
        shape="full"
        variant="filled"
        items={animals}
        placeholder="Select..."
      />
      <Select
        label="Sharp"
        shape="sharp"
        variant="filled"
        items={animals}
        placeholder="Select..."
      />
    </div>
  ),
};

export const WithStartContent: Story = {
  name: "With Start Content",
  args: {
    label: "User",
    placeholder: "Select user",
    variant: "outlined",
    items: [
      { value: "1", label: "Jane Doe" },
      { value: "2", label: "John Smith" },
    ],
    startContent: <User className="w-4 h-4 text-gray-500" />,
  },
};
