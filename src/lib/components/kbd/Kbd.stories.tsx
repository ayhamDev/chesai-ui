import type { Meta, StoryObj } from "@storybook/react";
import { Command } from "lucide-react";
import { Typography } from "../typography";
import { Kbd } from "./index";

const meta: Meta<typeof Kbd> = {
  title: "Components/Data/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A component to display keyboard shortcuts. It mimics the look of a physical keyboard key using the `kbd` HTML tag.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "flat", "outline", "ghost"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
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
type Story = StoryObj<typeof Kbd>;

export const Default: Story = {
  args: {
    children: "K",
  },
};

export const CommonShortcuts: Story = {
  name: "Common Shortcuts",
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Typography variant="small" className="w-32">
          Spotlight:
        </Typography>
        <span className="flex gap-1">
          <Kbd>
            <Command className="h-3 w-3" />
          </Kbd>
          <Kbd>K</Kbd>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Typography variant="small" className="w-32">
          Close Tab:
        </Typography>
        <span className="flex gap-1">
          <Kbd>Ctrl</Kbd>
          <Kbd>W</Kbd>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Typography variant="small" className="w-32">
          Screenshot:
        </Typography>
        <span className="flex gap-1">
          <Kbd>
            <Command className="h-3 w-3" />
          </Kbd>
          <Kbd>
            <span className="text-xs">⇧</span>
          </Kbd>
          <Kbd>4</Kbd>
        </span>
      </div>
    </div>
  ),
};

export const Variants: Story = {
  name: "Visual Variants",
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <Kbd variant="default">Default</Kbd>
        <Typography variant="muted" className="text-xs">
          3D / Card
        </Typography>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Kbd variant="flat">Flat</Kbd>
        <Typography variant="muted" className="text-xs">
          Secondary
        </Typography>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Kbd variant="outline">Outline</Kbd>
        <Typography variant="muted" className="text-xs">
          Border Only
        </Typography>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Kbd variant="ghost">Ghost</Kbd>
        <Typography variant="muted" className="text-xs">
          Minimal
        </Typography>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  name: "Sizes",
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-2">
        <Kbd size="sm">Esc</Kbd>
        <Typography variant="muted" className="text-xs">
          Small
        </Typography>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Kbd size="md">Enter</Kbd>
        <Typography variant="muted" className="text-xs">
          Medium
        </Typography>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Kbd size="lg">Space</Kbd>
        <Typography variant="muted" className="text-xs">
          Large
        </Typography>
      </div>
    </div>
  ),
};

export const InsideMenu: Story = {
  name: "Usage in Menu",
  parameters: {
    docs: {
      description: {
        story:
          "Kbd components are frequently used as right-aligned addons in Dropdowns or Command Palettes.",
      },
    },
  },
  render: () => (
    <div className="w-64 rounded-xl border border-graphite-border bg-graphite-card p-2 shadow-lg">
      <div className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-graphite-secondary cursor-pointer">
        <span className="text-sm font-medium">Search...</span>
        <span className="flex gap-1">
          <Kbd size="sm">⌘</Kbd>
          <Kbd size="sm">F</Kbd>
        </span>
      </div>
      <div className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-graphite-secondary cursor-pointer">
        <span className="text-sm font-medium">Settings</span>
        <span className="flex gap-1">
          <Kbd size="sm">⌘</Kbd>
          <Kbd size="sm">,</Kbd>
        </span>
      </div>
    </div>
  ),
};
