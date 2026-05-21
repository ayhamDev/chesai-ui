import type { Meta, StoryObj } from "@storybook/react";
import {
  Copy,
  ExternalLink,
  Pen,
  Share2,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { Card } from "../card";
import { Typography } from "../typography";
import { ContextMenu } from "./index";

const meta: Meta<typeof ContextMenu> = {
  title: "Components/ContextMenu",
  component: ContextMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A menu that appears on right-click (desktop) or long-press (mobile). It is built on Radix UI for accessibility and now supports a responsive glass effect.",
      },
    },
  },
  argTypes: {
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    glass: {
      control: "boolean",
      description:
        "Applies a glassmorphism backdrop-filter to the content pane.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

const MenuContent = () => (
  <>
    <ContextMenu.Item>
      <Pen className="mr-2 h-4 w-4" />
      <span>Edit</span>
      <ContextMenu.Shortcut>⌘E</ContextMenu.Shortcut>
    </ContextMenu.Item>
    <ContextMenu.Item>
      <Copy className="mr-2 h-4 w-4" />
      <span>Copy</span>
      <ContextMenu.Shortcut>⌘C</ContextMenu.Shortcut>
    </ContextMenu.Item>
    <ContextMenu.Separator />
    <ContextMenu.Item>
      <Share2 className="mr-2 h-4 w-4" />
      <span>Share</span>
    </ContextMenu.Item>
    <ContextMenu.Separator />
    <ContextMenu.Item className="text-red-500 hover:!bg-red-500/10">
      <Trash2 className="mr-2 h-4 w-4" />
      <span>Delete</span>
      <ContextMenu.Shortcut>⌘⌫</ContextMenu.Shortcut>
    </ContextMenu.Item>
  </>
);

export const Default: Story = {
  name: "1. Basic Usage",
  args: {
    shape: "sharp",
    size: "sm",
    glass: false,
  },
  render: (args) => (
    <ContextMenu {...args}>
      <ContextMenu.Trigger asChild>
        <Card className="flex h-48 w-80 cursor-default items-center justify-center border-2 border-dashed">
          <Typography variant="body-small" muted={true}>
            Right-click or long-press here
          </Typography>
        </Card>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <MenuContent />
      </ContextMenu.Content>
    </ContextMenu>
  ),
};

export const Glassmorphism: Story = {
  name: "2. Glassmorphism",
  args: {
    shape: "minimal",
    size: "md",
    glass: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Enabling `glass={true}` applies a polished translucent blur filter to the dropdown. This is best visualized over textured or colorful backgrounds.",
      },
    },
  },
  render: (args) => (
    <div className="relative p-12 bg-gradient-to-tr from-indigo-500 via-rose-500 to-amber-500 rounded-2xl overflow-hidden shadow-inner">
      <ContextMenu {...args}>
        <ContextMenu.Trigger asChild>
          <Card className="flex h-48 w-80 cursor-default items-center justify-center border-2 border-dashed border-white/40 bg-white/10 text-white backdrop-blur-sm">
            <Typography variant="body-small" className="text-inherit">
              Right-click over this gradient
            </Typography>
          </Card>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <MenuContent />
        </ContextMenu.Content>
      </ContextMenu>
    </div>
  ),
};

export const AllSizes: Story = {
  name: "3. All Sizes",
  render: () => (
    <div className="flex items-start gap-8">
      <ContextMenu size="sm">
        <ContextMenu.Trigger asChild>
          <Card className="flex h-32 w-48 cursor-default items-center justify-center border-2 border-dashed">
            <Typography variant="body-small">Small Menu</Typography>
          </Card>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <MenuContent />
        </ContextMenu.Content>
      </ContextMenu>
      <ContextMenu size="md">
        <ContextMenu.Trigger asChild>
          <Card className="flex h-32 w-48 cursor-default items-center justify-center border-2 border-dashed">
            <Typography variant="body-small">Medium Menu</Typography>
          </Card>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <MenuContent />
        </ContextMenu.Content>
      </ContextMenu>
      <ContextMenu size="lg">
        <ContextMenu.Trigger asChild>
          <Card className="flex h-32 w-48 cursor-default items-center justify-center border-2 border-dashed">
            <Typography variant="body-small">Large Menu</Typography>
          </Card>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <MenuContent />
        </ContextMenu.Content>
      </ContextMenu>
    </div>
  ),
};

export const KitchenSink: Story = {
  name: "4. Kitchen Sink",
  args: {
    size: "md",
    shape: "minimal",
    glass: false,
  },
  render: function Render(args) {
    const [showGrid, setShowGrid] = useState(true);
    const [theme, setTheme] = useState("dark");
    return (
      <ContextMenu {...args}>
        <ContextMenu.Trigger asChild>
          <Card className="flex h-48 w-80 cursor-default items-center justify-center border-2 border-dashed">
            <Typography variant="body-small" muted={true}>
              Right-click or long-press here
            </Typography>
          </Card>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item>
            Open in New Tab <ContextMenu.Shortcut>⌘T</ContextMenu.Shortcut>
          </ContextMenu.Item>
          <ContextMenu.Item disabled>
            Print... <ContextMenu.Shortcut>⌘P</ContextMenu.Shortcut>
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.CheckboxItem
            checked={showGrid}
            onCheckedChange={setShowGrid}
          >
            Show Grid Lines
          </ContextMenu.CheckboxItem>
          <ContextMenu.Separator />
          <ContextMenu.Label>Theme</ContextMenu.Label>
          <ContextMenu.RadioGroup value={theme} onValueChange={setTheme}>
            <ContextMenu.RadioItem value="light">Light</ContextMenu.RadioItem>
            <ContextMenu.RadioItem value="dark">Dark</ContextMenu.RadioItem>
            <ContextMenu.RadioItem value="system">System</ContextMenu.RadioItem>
          </ContextMenu.RadioGroup>
          <ContextMenu.Separator />
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger>
              <UserPlus className="mr-2 h-4 w-4" />
              Share with...
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent>
                <ContextMenu.Item>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Email Link
                </ContextMenu.Item>
                <ContextMenu.Item>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>
        </ContextMenu.Content>
      </ContextMenu>
    );
  },
};
