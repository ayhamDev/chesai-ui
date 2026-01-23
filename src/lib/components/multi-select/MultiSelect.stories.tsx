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
  },
};

export const WithIcons: Story = {
  name: "With Icons & Chips",
  args: {
    label: "Pets",
    placeholder: "Select your pets",
    options: animals,
    variant: "faded",
    shape: "full",
  },
};

export const Controlled: Story = {
  name: "Controlled State",
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [values, setValues] = useState(["react"]);
    return (
      <div className="w-80 space-y-4">
        <MultiSelect
          label="Tech Stack"
          options={frameworks}
          value={values}
          onValueChange={setValues}
        />
        <div className="text-sm text-gray-500">
          Selected: {values.join(", ")}
        </div>
      </div>
    );
  },
};

export const MaxCount: Story = {
  name: "Max Count Truncation",
  args: {
    label: "Tags",
    placeholder: "Select tags...",
    options: frameworks,
    maxCount: 2,
    value: ["react", "vue", "angular", "svelte"],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use `maxCount` to limit the number of visible chips. The rest will be grouped into a '+N more' badge.",
      },
    },
  },
};

export const Validation: Story = {
  name: "Error State",
  args: {
    label: "Required Field",
    options: frameworks,
    isInvalid: true,
    errorMessage: "Please select at least one item.",
    variant: "bordered",
  },
};

export const Variants: Story = {
  name: "Visual Variants",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <MultiSelect
        label="Flat"
        variant="flat"
        options={frameworks}
        placeholder="Select..."
      />
      <MultiSelect
        label="Faded"
        variant="faded"
        options={frameworks}
        placeholder="Select..."
      />
      <MultiSelect
        label="Bordered"
        variant="bordered"
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
