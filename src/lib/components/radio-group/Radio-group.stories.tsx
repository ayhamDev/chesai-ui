import type { Meta, StoryObj } from "@storybook/react";
import { Radio } from "./index";
import React, { useState } from "react";

const meta: Meta<typeof Radio> = {
  title: "Components/RadioGroup",
  component: Radio,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    disabled: { control: "boolean" },
  },
  // We render the group with items for all stories
  render: (args) => {
    const [plan, setPlan] = useState("basic");

    return (
      <Radio {...args} value={plan} onValueChange={setPlan}>
        <Radio.Item value="basic" label="Basic" />
        <Radio.Item value="premium" label="Premium" />
        <Radio.Item value="enterprise" label="Enterprise (Disabled)" disabled />
      </Radio>
    );
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Interactive",
  args: {
    label: "Select a Plan",
  },
};

export const Disabled: Story = {
  name: "Disabled Group",
  args: {
    label: "This entire group is disabled",
    disabled: true,
  },
};
