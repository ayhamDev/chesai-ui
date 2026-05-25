import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Combobox } from "./index";
import { Code, Database, Palette, Zap } from "lucide-react";

const meta: Meta<typeof Combobox> = {
  title: "Components/Forms & Inputs/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
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
    disabled: { control: "boolean" },
    isClearable: { control: "boolean" },
    mobileLayout: {
      control: "select",
      options: ["default", "bottom-sheet", "dialog"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Combobox>;

const frameworks = [
  { value: "react", label: "React", icon: <Code className="w-4 h-4" /> },
  { value: "vue", label: "Vue", icon: <Palette className="w-4 h-4" /> },
  {
    value: "angular",
    label: "Angular",
    icon: <Database className="w-4 h-4" />,
  },
  { value: "svelte", label: "Svelte", icon: <Zap className="w-4 h-4" /> },
  { value: "solid", label: "SolidJS", disabled: true },
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
    isClearable: true,
  },
  render: (args) => {
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
    const [value, setValue] = useState("");
    return (
      <div className="flex flex-col gap-6 w-80">
        <Combobox
          label="Bordered & Clearable"
          variant="outlined"
          startContent={<Database className="w-4 h-4" />}
          options={frameworks}
          value={value}
          onValueChange={setValue}
          isClearable
        />
        <Combobox
          label="Outside Label"
          labelPlacement="outside"
          variant="filled"
          options={frameworks}
        />
        <Combobox
          label="Error State"
          isInvalid
          errorMessage="Please select a valid option."
          variant="filled"
          options={frameworks}
        />
        <Combobox
          label="Mobile Sheet"
          description="Resize screen to test mobile drawer"
          mobileLayout="bottom-sheet"
          variant="underlined"
          options={frameworks}
        />
      </div>
    );
  },
};
