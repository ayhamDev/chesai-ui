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
import { Divider } from "../divider";
import { IconButton } from "../icon-button";
import { Separator } from "../separator";
import { Typography } from "../typography";
import { Sidebar, useSidebar } from "./index";

// ... (Meta config matches original) ...
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

// ... (SidebarContentExample and default stories unchanged - omitting for brevity as they are correct) ...
const SidebarContentExample = ({
  elasticity = false,
}: {
  elasticity?: boolean;
}) => {
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
            <Typography variant="h4" className="truncate text-base!">
              Acme Corp
            </Typography>
          )}
        </div>
      </Sidebar.Header>
      <Sidebar.Content elasticity={elasticity}>
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
        <Divider variant="dashed" />
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
        {elasticity && (
          <Sidebar.Group>
            <Sidebar.Label>Archive</Sidebar.Label>
            {Array.from({ length: 15 }).map((_, i) => (
              <Sidebar.Item key={i} icon={<Box />} onClick={() => {}}>
                Archive Item {i + 1}
              </Sidebar.Item>
            ))}
          </Sidebar.Group>
        )}
      </Sidebar.Content>
      <Divider variant="dashed" />

      <Sidebar.Footer className="justify-between">
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
    variant: "ghost",
    shape: "minimal",
    itemShape: "full",
    itemSize: "md",
    itemVariant: "primary",
    expandOnHover: true,
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
