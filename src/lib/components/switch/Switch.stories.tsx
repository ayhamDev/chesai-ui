import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Switch } from "./index";

const meta: Meta<typeof Switch> = {
  title: "Components/Forms & Inputs/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Airplane Mode",
  },
};

export const Checked: Story = {
  name: "On by Default",
  args: {
    label: "Enable Notifications",
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  name: "Disabled States",
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch disabled label="Off and Disabled" />
      <Switch disabled defaultChecked label="On and Disabled" />
    </div>
  ),
};

export const Interactive: Story = {
  name: "Interactive (Controlled)",
  render: () => {
    const [isEnabled, setIsEnabled] = useState(true);
    return (
      <div className="flex flex-col gap-2">
        <Switch
          checked={isEnabled}
          onChange={(e) => setIsEnabled(e.target.checked)}
          label="Feature Toggle"
        />
        <p className="text-sm text-gray-500">
          The feature is currently: {isEnabled ? "Enabled" : "Disabled"}
        </p>
      </div>
    );
  },
};

export const WithoutLabel: Story = {
  name: "Without a Label",
  args: {
    "aria-label": "A switch without a visible label",
  },
};

export const AllSizes: Story = {
  name: "All Sizes",
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <Switch size="sm" label="Small" defaultChecked />
      <Switch size="md" label="Medium (Default)" defaultChecked />
      <Switch size="lg" label="Large" defaultChecked />
    </div>
  ),
};

export const AllShapes: Story = {
  name: "All Shapes",
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <Switch shape="full" label="Full (Default)" defaultChecked />
      <Switch shape="minimal" label="Minimal" defaultChecked />
      <Switch shape="sharp" label="Sharp" defaultChecked />
    </div>
  ),
};
