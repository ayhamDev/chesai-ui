import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { Avatar } from "./index";
import { AvatarGroup } from "./AvatarGroup";
import { SHAPE_PATHS, type ShapeType } from "../shape/paths"; // Import ShapeType

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
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
    shapeStyle: {
      control: "select",
      options: Object.keys(SHAPE_PATHS),
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
  name: "6. Standard Box Shapes",
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar shape="full" src="https://i.pravatar.cc/150?img=3" />
      <Avatar shape="minimal" src="https://i.pravatar.cc/150?img=4" />
      <Avatar shape="sharp" src="https://i.pravatar.cc/150?img=5" />
    </div>
  ),
};

export const Group: Story = {
  name: "7. Avatar Group",
  render: () => (
    <div className="flex flex-col items-start gap-8">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-500">
          Default Group (md)
        </h3>
        <AvatarGroup>
          <Avatar src="https://i.pravatar.cc/150?img=1" fallback="A" />
          <Avatar src="https://i.pravatar.cc/150?img=2" fallback="B" />
          <Avatar src="https://i.pravatar.cc/150?img=3" fallback="C" />
          <Avatar src="https://i.pravatar.cc/150?img=4" fallback="D" />
        </AvatarGroup>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-500">
          With Max Count (lg)
        </h3>
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

// --- NEW STORIES ADDED FOR SHAPE SUPPORT ---

export const CustomShapes: Story = {
  name: "8. Custom Shapes (shapeStyle)",
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar
        size="xl"
        shapeStyle="flower"
        src="https://i.pravatar.cc/150?img=10"
      />
      <Avatar
        size="xl"
        shapeStyle="burst"
        src="https://i.pravatar.cc/150?img=11"
      />
      <Avatar
        size="xl"
        shapeStyle="hexagon"
        src="https://i.pravatar.cc/150?img=12"
      />
      <Avatar
        size="xl"
        shapeStyle="cookie4"
        src="https://i.pravatar.cc/150?img=13"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Using the `shapeStyle` prop automatically shifts the avatar from using standard CSS radius to SVG clip-paths, allowing integration with the media shape paths.",
      },
    },
  },
};

export const MorphingAvatar: Story = {
  name: "9. Morphing Avatar Loop",
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [shape, setShape] = useState<ShapeType>("circle");
    const morphSequence: ShapeType[] = [
      "circle",
      "flower",
      "cookie4",
      "hexagon",
      "clamshell",
    ];

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const interval = setInterval(() => {
        setShape((prev) => {
          const nextIndex =
            (morphSequence.indexOf(prev) + 1) % morphSequence.length;
          return morphSequence[nextIndex];
        });
      }, 2000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Avatar
          size="3xl"
          shapeStyle={shape}
          src="https://i.pravatar.cc/150?img=33"
          fallback="AM"
        />
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full">
          {shape}
        </p>
      </div>
    );
  },
};
