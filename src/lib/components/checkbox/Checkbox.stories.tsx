import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Checkbox } from "./index";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Forms & Inputs/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Accept terms and conditions",
  },
};

export const Checked: Story = {
  args: {
    label: "Save my preferences",
    defaultChecked: true, // Use defaultChecked for uncontrolled initial state
  },
};

export const Disabled: Story = {
  name: "Disabled States",
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox disabled label="Unchecked and Disabled" />
      <Checkbox disabled defaultChecked label="Checked and Disabled" />
    </div>
  ),
};

export const Interactive: Story = {
  name: "Interactive (Controlled)",
  render: () => {
    const [isChecked, setIsChecked] = useState(false);
    return (
      <div className="flex flex-col gap-2">
        <Checkbox
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
          label="Click me to see the state change"
        />
        <p className="text-sm text-gray-500">
          Current state: {isChecked ? "Checked" : "Unchecked"}
        </p>
      </div>
    );
  },
};

export const WithoutLabel: Story = {
  name: "Without a Label",
  args: {
    "aria-label": "A checkbox without a visible label", // Important for accessibility
  },
};
