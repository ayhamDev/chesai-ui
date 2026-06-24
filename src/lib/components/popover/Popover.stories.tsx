import type { Meta, StoryObj } from "@storybook/react";
import { HelpCircle, Settings, User, X } from "lucide-react";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { Typography } from "../typography";
import { Popover } from "./index";

const meta: Meta<typeof Popover> = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "tertiary",
        "high-contrast",
        "ghost",
        "surface",
        "surface-container-lowest",
        "surface-container-low",
        "surface-container",
        "surface-container-high",
        "surface-container-highest",
      ],
      description: "Background color variant matching surface containers.",
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "Controls the border-radius of the container content.",
    },
    glass: {
      control: "boolean",
      description: "Applies a background translucent blur to the popover.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  args: {
    variant: "secondary",
    shape: "minimal",
    glass: false,
  },
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger asChild>
        <Button variant="secondary" size="md">
          Show Info
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-80">
        <div className="flex flex-col gap-2">
          <Typography variant="title-small" className="font-bold">
            Popover Content
          </Typography>
          <Typography variant="body-medium">
            This card container adapts dynamically to your typography scale,
            color tokens, and roundness.
          </Typography>
        </div>
      </Popover.Content>
    </Popover>
  ),
};

export const Glassmorphism: Story = {
  name: "Glassmorphism Card Style",
  args: {
    variant: "primary",
    shape: "minimal",
    glass: true,
  },
  render: (args) => (
    <div className="w-[500px] h-[300px] bg-gradient-to-tr from-indigo-500 via-rose-500 to-pink-500 rounded-3xl flex items-center justify-center relative overflow-hidden">
      <Popover {...args}>
        <Popover.Trigger asChild>
          <Button variant="primary" shape="full">
            Inspect System
          </Button>
        </Popover.Trigger>
        <Popover.Content className="w-72">
          <div className="flex flex-col gap-2">
            <Typography variant="title-small" className="font-bold">
              Ambient Glass View
            </Typography>
            <Typography variant="body-small" className="opacity-80">
              The popover background applies a backdrop blur filtering pass to
              the vibrant colors underneath.
            </Typography>
          </div>
        </Popover.Content>
      </Popover>
    </div>
  ),
};

export const ComposedMenu: Story = {
  name: "Composed Menu Panel",
  args: {
    variant: "surface-container-high",
    shape: "minimal",
  },
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger asChild>
        <IconButton variant="outline" size="md" aria-label="Settings Menu">
          <Settings size={20} />
        </IconButton>
      </Popover.Trigger>
      <Popover.Content className="w-64 p-3 flex flex-col gap-1">
        <Typography
          variant="label-small"
          className="px-3 py-1 opacity-50 font-bold uppercase tracking-wider"
        >
          Quick Actions
        </Typography>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start w-full"
          startIcon={<User size={16} />}
        >
          View Profile
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start w-full"
          startIcon={<HelpCircle size={16} />}
        >
          Help Center
        </Button>
        <div className="h-px bg-outline-variant/30 my-1 w-full" />
        <Popover.Close asChild>
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            startIcon={<X size={16} />}
          >
            Close Pane
          </Button>
        </Popover.Close>
      </Popover.Content>
    </Popover>
  ),
};
