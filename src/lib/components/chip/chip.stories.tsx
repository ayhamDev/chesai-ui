import type { Meta, StoryObj } from "@storybook/react";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { Chip } from "./index";

const meta: Meta<typeof Chip> = {
  title: "Components/Chip",
  component: Chip,
  tags: ["autodocs"],
  argTypes: {
    selected: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    children: {
      control: "text",
    },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Default Chip",
  },
};

export const Selected: Story = {
  args: {
    children: "Selected Chip",
    selected: true,
  },
};

export const Interactive: Story = {
  name: "Interactive (Toggle)",
  render: (args) => {
    const [isSelected, setIsSelected] = useState(false);
    return (
      <Chip
        {...args}
        selected={isSelected}
        onClick={() => setIsSelected(!isSelected)}
        startIcon={isSelected && <Check className="h-4 w-4" />}
      >
        {isSelected ? "Filter Enabled" : "Enable Filter"}
      </Chip>
    );
  },
};

export const WithIcons: Story = {
  name: "With Start and End Icons",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Chip>
        <span className="font-normal mr-2">Tag:</span>
        React
      </Chip>
      <Chip endIcon={<X className="h-4 w-4" />}>Dismissible</Chip>
    </div>
  ),
};

export const Disabled: Story = {
  name: "Disabled States",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Chip disabled>Disabled</Chip>
      <Chip selected disabled>
        Selected & Disabled
      </Chip>
    </div>
  ),
};
