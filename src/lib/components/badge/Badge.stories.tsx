import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./index";
import { Button } from "../button";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "destructive", "outline"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    children: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Badge",
    shape: "full",
  },
};

export const AllVariants: Story = {
  name: "All Variants",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const AllShapes: Story = {
  name: "All Shapes",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Badge variant="primary" shape="full">
        Full
      </Badge>
      <Badge variant="primary" shape="minimal">
        Minimal
      </Badge>
      <Badge variant="primary" shape="sharp">
        Sharp
      </Badge>
    </div>
  ),
};
