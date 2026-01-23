import type { Meta, StoryObj } from "@storybook/react";
import { LinearProgress } from "./index";

const meta: Meta<typeof LinearProgress> = {
  title: "Components/Feedback/LinearProgress",
  component: LinearProgress,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    indeterminate: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof LinearProgress>;

export const Default: Story = {
  args: { value: 50 },
  render: (args) => (
    <div className="w-80">
      <LinearProgress {...args} />
    </div>
  ),
};

export const Indeterminate: Story = {
  args: { indeterminate: true },
  render: (args) => (
    <div className="w-80">
      <LinearProgress {...args} />
    </div>
  ),
};
