import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Combobox } from "./index";
import { Database } from "lucide-react";

const meta: Meta<typeof Combobox> = {
  title: "Components/Forms & Inputs/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: ["flat", "bordered", "faded", "underlined"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Combobox>;

const frameworks = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "SolidJS" },
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
];

export const Default: Story = {
  args: {
    label: "Framework",
    placeholder: "Select framework...",
    searchPlaceholder: "Search frameworks...",
    options: frameworks,
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState("");
    return (
      <div className="w-80">
        <Combobox {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};

export const Variations: StoryObj = {
  name: "Variations & States",
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState("");
    return (
      <div className="flex flex-col gap-6 w-80">
        <Combobox
          label="Bordered & Icon"
          variant="bordered"
          startContent={<Database className="w-4 h-4" />}
          options={frameworks}
          value={value}
          onChange={setValue}
        />
        <Combobox
          label="Outside Label"
          labelPlacement="outside"
          variant="flat"
          options={frameworks}
        />
        <Combobox
          label="Error State"
          isInvalid
          errorMessage="Please select a valid option."
          variant="faded"
          options={frameworks}
        />
      </div>
    );
  },
};
