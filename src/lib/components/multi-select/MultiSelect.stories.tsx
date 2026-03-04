import type { Meta, StoryObj } from "@storybook/react";
import { Cat, Dog, Fish, Rabbit, Turtle } from "lucide-react";
import { useState } from "react";
import { MultiSelect } from "./index";

const meta: Meta<typeof MultiSelect> = {
  title: "Components/Forms & Inputs/MultiSelect",
  component: MultiSelect,
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
    maxCount: { control: "number" },
    disabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

const animals = [
  { value: "cat", label: "Cat", icon: Cat },
  { value: "dog", label: "Dog", icon: Dog },
  { value: "rabbit", label: "Rabbit", icon: Rabbit },
  { value: "turtle", label: "Turtle", icon: Turtle },
  { value: "fish", label: "Fish", icon: Fish },
];

const frameworks = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
];

export const Default: Story = {
  args: {
    label: "Frameworks",
    placeholder: "Select frameworks",
    options: frameworks,
    labelPlacement: "inside",
    variant: "filled",
  },
};

export const WithIcons: Story = {
  name: "With Icons & Chips",
  args: {
    label: "Pets",
    placeholder: "Select your pets",
    options: animals,
    variant: "filled-inverted",
    shape: "full",
  },
};

export const Variants: Story = {
  name: "Visual Variants",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <MultiSelect
        label="Filled"
        variant="filled"
        options={frameworks}
        placeholder="Select..."
      />
      <MultiSelect
        label="Filled Inverted"
        variant="filled-inverted"
        options={frameworks}
        placeholder="Select..."
      />
      <MultiSelect
        label="Outlined"
        variant="outlined"
        options={frameworks}
        placeholder="Select..."
      />
      <MultiSelect
        label="Underlined"
        variant="underlined"
        options={frameworks}
        placeholder="Select..."
      />
    </div>
  ),
};
