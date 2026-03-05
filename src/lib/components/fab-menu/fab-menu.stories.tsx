// src/lib/components/fab-menu/FABMenu.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import {
  FileText,
  Folder,
  MessageSquare,
  Plus,
  Mail,
  Video,
  Share2,
} from "lucide-react";
import { FABMenu, useFABMenu } from "./index";
import { FAB } from "../fab";

const meta: Meta<typeof FABMenu> = {
  title: "Components/Buttons/FABMenu",
  component: FABMenu,
  subcomponents: {
    "FABMenu.Trigger": FABMenu.Trigger,
    "FABMenu.List": FABMenu.List,
    "FABMenu.Item": FABMenu.Item,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    direction: {
      control: "select",
      options: ["up", "down", "left", "right"],
    },
    align: {
      control: "select",
      options: ["start", "center", "end"],
    },
    overlay: {
      control: "boolean",
      description: "Adds a dimming backdrop behind the open menu.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof FABMenu>;

// We create a helper wrapper to access `useFABMenu` context for animating the icon
const AnimatedTrigger = () => {
  const { isOpen } = useFABMenu();
  return (
    <FABMenu.Trigger asChild>
      <FAB
        icon={
          <Plus
            size={30}
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-45" : "rotate-0"
            }`}
          />
        }
      />
    </FABMenu.Trigger>
  );
};

export const Default: Story = {
  name: "1. Match User Image",
  args: {
    direction: "up",
    align: "center",
  },
  render: (args) => (
    <div className="flex h-[350px] items-end justify-center w-full pb-8">
      <FABMenu {...args}>
        <AnimatedTrigger />
        <FABMenu.List>
          <FABMenu.Item icon={<FileText />} label="Document" />
          <FABMenu.Item icon={<MessageSquare />} label="Message" />
          <FABMenu.Item icon={<Folder />} label="Folder" />
        </FABMenu.List>
      </FABMenu>
    </div>
  ),
};

export const BottomRightFixed: Story = {
  name: "2. Fixed Positioning (Real World)",
  args: {
    direction: "up",
    align: "end", // Aligns the right edge of the items with the right edge of the trigger
    overlay: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Setting `align='end'` ensures the menu items expand to the left, which is perfect for components fixed to the bottom-right corner of the screen.",
      },
    },
  },
  render: (args) => (
    <div className="relative w-[600px] h-[400px] bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
      <div className="p-8 text-on-surface-variant opacity-60">
        Page content goes here...
      </div>

      {/* Fixed wrapper mimicking the screen corner */}
      <div className="absolute bottom-6 right-6">
        <FABMenu {...args}>
          <AnimatedTrigger />
          <FABMenu.List>
            <FABMenu.Item icon={<Video />} label="Start Meeting" />
            <FABMenu.Item icon={<Share2 />} label="Share Screen" />
            <FABMenu.Item icon={<Mail />} label="New Email" />
          </FABMenu.List>
        </FABMenu>
      </div>
    </div>
  ),
};

export const IconOnlyHorizontal: Story = {
  name: "3. Icon Only (Horizontal)",
  args: {
    direction: "left",
    align: "center",
  },
  render: (args) => (
    <div className="flex h-[200px] items-center justify-end w-[400px] pr-8">
      <FABMenu {...args}>
        <AnimatedTrigger />
        <FABMenu.List>
          <FABMenu.Item icon={<FileText />} />
          <FABMenu.Item icon={<MessageSquare />} />
          <FABMenu.Item icon={<Folder />} />
        </FABMenu.List>
      </FABMenu>
    </div>
  ),
};
