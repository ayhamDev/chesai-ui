import type { Meta, StoryObj } from "@storybook/react";
import { CircularProgress } from "./index";

const meta: Meta<typeof CircularProgress> = {
  title: "Components/Feedback/CircularProgress",
  component: CircularProgress,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
    indeterminate: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof CircularProgress>;

export const Default: Story = {
  args: { value: 60, size: "md" },
};

export const WithLabel: Story = {
  args: { value: 75, size: "lg" },
  render: (args) => (
    <CircularProgress {...args}>
      <span className="text-[10px] font-bold">{args.value}%</span>
    </CircularProgress>
  ),
};

export const Indeterminate: Story = {
  args: { indeterminate: true, size: "lg" },
};
