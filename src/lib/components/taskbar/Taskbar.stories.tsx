import type { Meta, StoryObj } from "@storybook/react";
import { Mountain } from "lucide-react";
import React, { useState } from "react";
import { NavigationMenu } from "../navigation-menu";
import { Typography } from "../typography";
import { Taskbar } from "./index";

const meta: Meta<typeof Taskbar> = {
  title: "Components/Navigators/Taskbar",
  component: Taskbar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A draggable taskbar component designed for desktop applications (Electron, Tauri). It provides window controls and slots for custom content like menus and titles.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["transparent", "card", "secondary"],
      description: "The background color variant of the taskbar.",
    },
    bordered: {
      control: "boolean",
      description: "Adds a bottom border to the taskbar.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Controls the height of the taskbar and its controls.",
    },
    isMaximized: { control: "boolean" },
    onMinimize: { action: "minimized" },
    onMaximize: { action: "maximized" },
    onClose: { action: "closed" },
    startAdornment: { control: false },
    centerAdornment: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Taskbar>;

// Helper component to simulate a desktop window
const FakeWindow = ({
  children,
  title = "My App",
}: {
  children: React.ReactNode;
  title?: string;
}) => (
  <div>
    <Typography variant="body-small" className="text-center mb-2 font-semibold">
      {title}
    </Typography>
    <div className="w-[720px] h-[480px] flex flex-col shadow-2xl overflow-hidden bg-graphite-background ring-1 ring-black/5 rounded-xl">
      {children}
    </div>
  </div>
);

// Helper for the menu bar example
const MenuBar = () => (
  <NavigationMenu>
    <NavigationMenu.List>
      <NavigationMenu.Item>
        <NavigationMenu.Trigger>File</NavigationMenu.Trigger>
        <NavigationMenu.Content>
          <ul className="grid w-[200px] gap-2 p-3">
            <li>New</li>
            <li>Open</li>
            <li>Save</li>
          </ul>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
      <NavigationMenu.Item>
        <NavigationMenu.Trigger>Edit</NavigationMenu.Trigger>
        <NavigationMenu.Content>
          <ul className="grid w-[200px] gap-2 p-3">
            <li>Undo</li>
            <li>Redo</li>
            <li>Cut</li>
          </ul>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
      <NavigationMenu.Item>
        <NavigationMenu.Trigger>View</NavigationMenu.Trigger>
        <NavigationMenu.Content>
          <ul className="grid w-[200px] gap-2 p-3">
            <li>Zoom In</li>
            <li>Zoom Out</li>
          </ul>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
    </NavigationMenu.List>
  </NavigationMenu>
);

export const Default: Story = {
  name: "1. Default",
  args: {
    variant: "transparent",
    bordered: false,
    size: "md",
  },
  render: (args) => {
    const [isMaximized, setIsMaximized] = useState(args.isMaximized || false);
    return (
      <FakeWindow title="Default Taskbar">
        <Taskbar
          {...args}
          isMaximized={isMaximized}
          onMaximize={() => setIsMaximized(!isMaximized)}
          startAdornment={
            <div className="flex items-center gap-2 pl-2">
              <Mountain size={16} />
              <Typography variant="body-small" className="font-semibold">
                App Title
              </Typography>
            </div>
          }
        />
        <div className="flex-1 p-6">
          <Typography variant="body-medium">
            This is the default taskbar with a transparent background and no
            border.
          </Typography>
        </div>
      </FakeWindow>
    );
  },
};

export const AllSizes: Story = {
  name: "2. Sizing",
  parameters: {
    docs: {
      description: {
        story:
          "The `size` prop controls the overall height of the taskbar, as well as the dimensions of the window control buttons.",
      },
    },
  },
  render: (args) => {
    const [isMaximized, setIsMaximized] = useState(false);
    return (
      <div className="flex flex-col gap-8">
        <FakeWindow title="Small (sm)">
          <Taskbar
            {...args}
            size="sm"
            isMaximized={isMaximized}
            onMaximize={() => setIsMaximized(!isMaximized)}
            startAdornment={
              <div className="flex items-center gap-2 pl-2">
                <Mountain size={14} />
                <Typography variant="body-small" className="font-semibold">
                  App
                </Typography>
              </div>
            }
          />
          <div className="flex-1 p-6" />
        </FakeWindow>
        <FakeWindow title="Medium (md - default)">
          <Taskbar
            {...args}
            size="md"
            isMaximized={isMaximized}
            onMaximize={() => setIsMaximized(!isMaximized)}
            startAdornment={
              <div className="flex items-center gap-2 pl-2">
                <Mountain size={16} />
                <Typography variant="body-small" className="font-semibold">
                  App
                </Typography>
              </div>
            }
          />
          <div className="flex-1 p-6" />
        </FakeWindow>
        <FakeWindow title="Large (lg)">
          <Taskbar
            {...args}
            size="lg"
            isMaximized={isMaximized}
            onMaximize={() => setIsMaximized(!isMaximized)}
            startAdornment={
              <div className="flex items-center gap-2 pl-2">
                <Mountain size={18} />
                <Typography variant="body-small" className="font-semibold">
                  App
                </Typography>
              </div>
            }
          />
          <div className="flex-1 p-6" />
        </FakeWindow>
      </div>
    );
  },
};

export const ColorVariants: Story = {
  name: "3. Color Variants",
  parameters: {
    docs: {
      description: {
        story:
          "The `variant` prop changes the background color to match different parts of the UI theme.",
      },
    },
  },
  render: (args) => {
    const [isMaximized, setIsMaximized] = useState(false);
    return (
      <div className="flex flex-col gap-8">
        <FakeWindow title="Variant: Card">
          <Taskbar
            {...args}
            variant="card"
            isMaximized={isMaximized}
            onMaximize={() => setIsMaximized(!isMaximized)}
          />
          <div className="flex-1 p-6" />
        </FakeWindow>
        <FakeWindow title="Variant: Secondary">
          <Taskbar
            {...args}
            variant="secondary"
            isMaximized={isMaximized}
            onMaximize={() => setIsMaximized(!isMaximized)}
          />
          <div className="flex-1 p-6" />
        </FakeWindow>
      </div>
    );
  },
};

export const Bordered: Story = {
  name: "4. Bordered vs. Borderless",
  parameters: {
    docs: {
      description: {
        story:
          "The `bordered` prop adds a subtle bottom border, useful for separating the taskbar from the content below.",
      },
    },
  },
  render: (args) => {
    const [isMaximized, setIsMaximized] = useState(false);
    return (
      <div className="flex flex-col gap-8">
        <FakeWindow title="Bordered (variant: card)">
          <Taskbar
            {...args}
            variant="card"
            bordered={true}
            isMaximized={isMaximized}
            onMaximize={() => setIsMaximized(!isMaximized)}
          />
          <div className="flex-1 p-6" />
        </FakeWindow>
        <FakeWindow title="Borderless (variant: card)">
          <Taskbar
            {...args}
            variant="card"
            bordered={false}
            isMaximized={isMaximized}
            onMaximize={() => setIsMaximized(!isMaximized)}
          />
          <div className="flex-1 p-6" />
        </FakeWindow>
      </div>
    );
  },
};
