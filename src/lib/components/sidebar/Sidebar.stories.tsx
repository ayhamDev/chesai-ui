import type { Meta, StoryObj } from "@storybook/react";
import {
  Archive,
  Box,
  Inbox,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import React from "react";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { IconButton } from "../icon-button";
import { Separator } from "../separator";
import { Typography } from "../typography";
import { Sidebar, useSidebar } from "./index";

const meta: Meta<typeof Sidebar> = {
  title: "Components/Navigators/Sidebar",
  component: Sidebar,
  subcomponents: {
    "Sidebar.Header": Sidebar.Header,
    "Sidebar.Content": Sidebar.Content,
    "Sidebar.Footer": Sidebar.Footer,
    "Sidebar.Item": Sidebar.Item,
    "Sidebar.Trigger": Sidebar.Trigger,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    layout: {
      control: "select",
      options: ["sidebar", "floating", "inset"],
      description: "The structural layout of the sidebar.",
    },
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost"],
      description: "The visual theme/color of the sidebar.",
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "Border radius of the sidebar container.",
    },
    itemShape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "Border radius of the sidebar items.",
    },
    itemSize: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    expandOnHover: {
      control: "boolean",
      defaultValue: false,
    },
    overlay: {
      control: "boolean",
      defaultValue: false,
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-full bg-graphite-background flex">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const SidebarContentExample = () => {
  const [active, setActive] = React.useState("inbox");
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <>
      <Sidebar.Header className="justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-graphite-primary text-graphite-primaryForeground">
            <Box className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <Typography variant="h4" className="truncate !text-base">
              Acme Corp
            </Typography>
          )}
        </div>
      </Sidebar.Header>
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.Item
            icon={<LayoutDashboard />}
            isActive={active === "dashboard"}
            onClick={() => setActive("dashboard")}
          >
            Dashboard
          </Sidebar.Item>
          <Sidebar.Item
            icon={<Inbox />}
            isActive={active === "inbox"}
            onClick={() => setActive("inbox")}
            badge={
              <Badge variant="primary" shape="full" className="px-1.5 h-5">
                12
              </Badge>
            }
          >
            Inbox
          </Sidebar.Item>
          <Sidebar.Item
            icon={<MessagesSquare />}
            isActive={active === "messages"}
            onClick={() => setActive("messages")}
          >
            Messages
          </Sidebar.Item>
        </Sidebar.Group>
        <Separator className="my-2" />
        <Sidebar.Group>
          <Sidebar.Label>Management</Sidebar.Label>
          <Sidebar.Item
            icon={<Users />}
            isActive={active === "customers"}
            onClick={() => setActive("customers")}
          >
            Customers
          </Sidebar.Item>
          <Sidebar.Item
            icon={<ShoppingCart />}
            isActive={active === "orders"}
            onClick={() => setActive("orders")}
          >
            Orders
          </Sidebar.Item>
          <Sidebar.Item
            icon={<Archive />}
            isActive={active === "products"}
            onClick={() => setActive("products")}
          >
            Products
          </Sidebar.Item>
        </Sidebar.Group>
      </Sidebar.Content>
      <Sidebar.Footer className="justify-between border-t border-graphite-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <Avatar
            size="sm"
            src="https://i.pravatar.cc/150?img=3"
            fallback="JD"
          />
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium">Jane Doe</span>
              <span className="text-xs text-graphite-foreground/60 truncate">
                jane@acme.com
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <IconButton variant="ghost" size="sm" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </IconButton>
        )}
      </Sidebar.Footer>
    </>
  );
};

export const Default: Story = {
  name: "1. Playground (All Props)",
  args: {
    layout: "inset",
    variant: "primary",
    shape: "minimal",
    itemShape: "full",
    itemSize: "md",
  },
  render: (args) => (
    <Sidebar.Provider>
      <Sidebar {...args}>
        <SidebarContentExample />
      </Sidebar>
      <main className="flex-1 p-6 flex flex-col bg-graphite-background">
        <header className="h-16 border-b border-graphite-border flex items-center px-4 gap-4 bg-graphite-card rounded-xl mb-4">
          <Sidebar.Trigger />
          <Separator orientation="vertical" className="h-6" />
          <Typography variant="h4">Playground</Typography>
        </header>
        <div className="flex-1 flex items-center justify-center text-graphite-foreground/50">
          Adjust the controls in the panel to change the sidebar style.
        </div>
      </main>
    </Sidebar.Provider>
  ),
};

export const SecondaryLarge: Story = {
  name: "2. Secondary Color & Large Items",
  args: {
    layout: "sidebar",
    variant: "secondary",
    itemSize: "lg",
    itemShape: "minimal",
  },
  render: Default.render,
};

export const FloatingPill: Story = {
  name: "3. Floating & Full (Pill) Items",
  args: {
    layout: "floating",
    variant: "primary",
    shape: "full",
    itemShape: "full",
    itemSize: "md",
  },
  render: Default.render,
};

export const DenseSharp: Story = {
  name: "4. Dense & Sharp (Technical)",
  args: {
    layout: "sidebar",
    variant: "primary",
    shape: "sharp",
    itemSize: "sm",
    itemShape: "sharp",
  },
  render: Default.render,
};

export const WhatsAppStyle: Story = {
  name: "Overlay & Hover (WhatsApp Style)",
  args: {
    layout: "sidebar",
    variant: "primary",
    expandOnHover: true,
    overlay: true,
    width: "18rem",
  },
  render: (args) => (
    <Sidebar.Provider defaultOpen={false}>
      <Sidebar {...args}>
        <SidebarContentExample />
      </Sidebar>

      {/* Main Content Area simulating the chat list behind the sidebar */}
      <main className="flex-1 flex bg-graphite-secondary relative">
        {/* List Area */}
        <div className="w-80 border-r border-graphite-border bg-white flex flex-col">
          <header className="h-16 flex items-center px-4 border-b border-graphite-border">
            <Typography variant="h4">Chats</Typography>
          </header>
          <div className="flex-1 p-2 space-y-2 overflow-auto">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-graphite-background flex items-center p-2 gap-3"
              >
                <div className="h-10 w-10 rounded-full bg-graphite-border shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-2/3 bg-graphite-border rounded" />
                  <div className="h-2 w-full bg-graphite-border rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Chat Area */}
        <div className="flex-1 bg-[#efeae2] flex items-center justify-center">
          <Typography variant="muted">
            Select a chat to start messaging
          </Typography>
        </div>
      </main>
    </Sidebar.Provider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "This example mimics the WhatsApp Web sidebar. Set `expandOnHover={true}` to expand on mouse enter, and `overlay={true}` to make the expanded state float on top of the adjacent content (the chat list) instead of pushing it. A collapsed placeholder remains visible.",
      },
    },
  },
};
