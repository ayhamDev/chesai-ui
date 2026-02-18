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
          "A menu that appears on right-click (desktop) or long-press (mobile). It is built on Radix UI for accessibility.",
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

export const AllSizes: Story = {
  name: "2. All Sizes",
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
  name: "3. Kitchen Sink",
  args: {
    size: "md",
    shape: "minimal",
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
