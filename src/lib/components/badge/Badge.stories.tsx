import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./index";
import { Flex } from "../layouts";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "destructive", "outline"],
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
    <Flex wrap="wrap" align="center" gap="md">
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="tertiary">Tertiary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </Flex>
  ),
};

export const AllShapes: Story = {
  name: "All Shapes",
  render: () => (
    <Flex wrap="wrap" align="center" gap="md">
      <Badge variant="primary" shape="full">
        Full
      </Badge>
      <Badge variant="primary" shape="minimal">
        Minimal
      </Badge>
      <Badge variant="primary" shape="sharp">
        Sharp
      </Badge>
    </Flex>
  ),
};

export const Tertiary: Story = {
  args: {
    children: "Tertiary",
    variant: "tertiary",
    shape: "full",
  },
};
