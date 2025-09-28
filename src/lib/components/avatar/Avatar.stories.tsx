import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./index";
import { AvatarGroup } from "./AvatarGroup"; // Import AvatarGroup

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar", // Changed title to be more general
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
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

export const LoadingSkeleton: Story = {
  name: "2. Loading Skeleton",
  args: {
    // This URL will delay the image load by 2 seconds
    src: "https://www.deelay.me/2000/https://i.pravatar.cc/150?img=1",
    fallback: "User",
    shape: "full",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The Avatar displays a skeleton loader while the image is loading. This is a 2-second delayed image.",
      },
    },
  },
};

export const InitialsFallback: Story = {
  name: "3. Fallback to Initials",
  args: {
    src: "https://broken-url.com/avatar.png",
    fallback: "Alisa Hester",
  },
};

export const GenericFallback: Story = {
  name: "4. Fallback to Icon",
  args: {},
};

export const AllSizes: Story = {
  name: "5. All Sizes",
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
  name: "6. All Shapes",
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar shape="full" src="https://i.pravatar.cc/150?img=3" />
      <Avatar shape="minimal" src="https://i.pravatar.cc/150?img=4" />
      <Avatar shape="sharp" src="https://i.pravatar.cc/150?img=5" />
    </div>
  ),
};

// --- NEW AVATAR GROUP STORY ---
export const Group: Story = {
  name: "7. Avatar Group",
  render: () => (
    <div className="flex flex-col items-start gap-8">
      <div>
        <h3 className="mb-2 font-semibold">Default Group (md)</h3>
        <AvatarGroup>
          <Avatar src="https://i.pravatar.cc/150?img=1" fallback="A" />
          <Avatar src="https://i.pravatar.cc/150?img=2" fallback="B" />
          <Avatar src="https://i.pravatar.cc/150?img=3" fallback="C" />
          <Avatar src="https://i.pravatar.cc/150?img=4" fallback="D" />
        </AvatarGroup>
      </div>
      <div>
        <h3 className="mb-2 font-semibold">With Max Count (lg)</h3>
        <AvatarGroup max={3}>
          <Avatar
            size="lg"
            src="https://i.pravatar.cc/150?img=5"
            fallback="A"
          />
          <Avatar
            size="lg"
            src="https://i.pravatar.cc/150?img=6"
            fallback="B"
          />
          <Avatar
            size="lg"
            src="https://i.pravatar.cc/150?img=7"
            fallback="C"
          />
          <Avatar
            size="lg"
            src="https://i.pravatar.cc/150?img=8"
            fallback="D"
          />
          <Avatar
            size="lg"
            src="https://i.pravatar.cc/150?img=9"
            fallback="E"
          />
        </AvatarGroup>
      </div>
    </div>
  ),
};
