import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./index";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar/Avatar", // Renamed for clarity in Storybook hierarchy
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    // --- THIS IS THE KEY CHANGE ---
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    // --- END OF CHANGE ---
    src: { control: "text" },
    fallback: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  name: "1. Image",
  args: {
    src: "https://i.pravatar.cc/150",
    fallback: "User",
  },
};

export const InitialsFallback: Story = {
  name: "2. Fallback to Initials",
  args: {
    src: "https://broken-url.com/avatar.png",
    fallback: "Alisa Hester",
  },
};

export const GenericFallback: Story = {
  name: "3. Fallback to Icon",
  args: {},
};

export const AllSizes: Story = {
  name: "4. All Sizes",
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="xs" fallback="A" />
      <Avatar size="sm" fallback="B" />
      <Avatar size="md" fallback="C" />
      <Avatar size="lg" fallback="D" />
      <Avatar size="xl" fallback="E" />
    </div>
  ),
};

export const AllShapes: Story = {
  name: "5. All Shapes",
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar shape="full" src="https://i.pravatar.cc/150?img=3" />
      <Avatar shape="minimal" src="https://i.pravatar.cc/150?img=4" />
      <Avatar shape="sharp" src="https://i.pravatar.cc/150?img=5" />
    </div>
  ),
};
