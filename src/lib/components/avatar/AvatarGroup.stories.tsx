import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./index";

const meta: Meta<typeof Avatar.Group> = {
  title: "Components/Avatar/Avatar.Group",
  component: Avatar.Group,
  tags: ["autodocs"],
  argTypes: {
    max: {
      control: "number",
      description: "Maximum number of avatars to display.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar.Group>;

export const Default: Story = {
  name: "1. Default Stack",
  render: (args) => (
    <Avatar.Group {...args}>
      <Avatar src="https://i.pravatar.cc/150?img=1" />
      <Avatar src="https://i.pravatar.cc/150?img=2" />
      <Avatar src="https://i.pravatar.cc/150?img=3" />
    </Avatar.Group>
  ),
};

export const WithOverflow: Story = {
  name: "2. Stack with Overflow",
  args: {
    max: 4,
  },
  render: (args) => (
    <Avatar.Group {...args}>
      <Avatar src="https://i.pravatar.cc/150?img=1" />
      <Avatar src="https://i.pravatar.cc/150?img=2" />
      <Avatar src="https://i.pravatar.cc/150?img=3" />
      <Avatar src="https://i.pravatar.cc/150?img=4" />
      <Avatar fallback="AB" />
      <Avatar fallback="CD" />
    </Avatar.Group>
  ),
};

export const WithAddButton: Story = {
  name: "3. Stack with Add Button",
  render: (args) => (
    <Avatar.Group {...args}>
      <Avatar src="https://i.pravatar.cc/150?img=5" />
      <Avatar src="https://i.pravatar.cc/150?img=6" />
      <Avatar fallback="S" />
      <Avatar variant="add" onClick={() => alert("Add user clicked!")} />
    </Avatar.Group>
  ),
};

// --- THIS STORY IS REWRITTEN TO MATCH YOUR IMAGE ---
export const DifferentSizes: Story = {
  name: "4. With Different Sizes",
  render: () => (
    <div className="flex flex-col items-start gap-8">
      {/* Small Group */}
      <Avatar.Group max={4}>
        <Avatar size="sm" src="https://i.pravatar.cc/150?img=11" />
        <Avatar size="sm" src="https://i.pravatar.cc/150?img=12" />
        <Avatar size="sm" fallback="S" />
        <Avatar size="sm" src="https://i.pravatar.cc/150?img=13" />
        <Avatar size="sm" src="https://i.pravatar.cc/150?img=14" />
      </Avatar.Group>

      {/* Large Group */}
      <Avatar.Group max={5}>
        <Avatar size="lg" src="https://i.pravatar.cc/150?img=21" />
        <Avatar size="lg" src="https://i.pravatar.cc/150?img=22" />
        <Avatar size="lg" fallback="L" />
        <Avatar size="lg" src="https://i.pravatar.cc/150?img=23" />
        <Avatar size="lg" src="https://i.pravatar.cc/150?img=24" />
        <Avatar size="lg" src="https://i.pravatar.cc/150?img=25" />
      </Avatar.Group>
    </div>
  ),
};
