import type { Meta, StoryObj } from "@storybook/react";
import {
  Archive,
  Box,
  Compass,
  Contact,
  CreditCard,
  Folder,
  Home,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  MessagesSquare,
  PlusSquare,
  Settings,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import React from "react";
import { LayoutProvider } from "../../context/layout-context";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { Divider } from "../divider";
import { IconButton } from "../icon-button";
import { LayoutDirectionToggle } from "../layout-toggle";
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
    "Sidebar.Collapse": Sidebar.Collapse,
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
      options: [
        "surface",
        "surface-container-lowest",
        "surface-container-low",
        "surface-container",
        "surface-container-high",
        "surface-container-highest",
        "background",
        "primary",
        "secondary",
        "tertiary",
        "error",
        "ghost",
      ],
      description: "The visual theme/color of the sidebar container.",
    },
    itemVariant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "tertiary",
        "error",
        "surface",
        "ghost",
      ],
      description:
        "The visual theme/color of the active items within the sidebar.",
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
      <LayoutProvider>
        <div className="h-screen w-full bg-graphite-background flex relative">
          <div className="absolute top-4 right-4 z-50">
            <LayoutDirectionToggle />
          </div>
          <Story />
        </div>
      </LayoutProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary">
            <Box className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <Typography variant="title-small" className="truncate text-base!">
              Acme Corp
            </Typography>
          )}
        </div>
      </Sidebar.Header>
      <Sidebar.Content elasticity={elasticity}>
        <Sidebar.FAB
          icon={<Box />}
          onClick={() => alert("FAB Clicked")}
          label={"New Item"}
          variant="tertiary"
        />
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
              // @ts-ignore
              (<Sidebar.Item key={i} icon={<Box />} onClick={() => {}}>Archive Item {i + 1}
              </Sidebar.Item>)
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
              <span className="text-xs opacity-60 truncate">jane@acme.com</span>
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
    variant: "surface",
    shape: "minimal",
    itemShape: "full",
    itemSize: "lg",
    itemVariant: "primary",
    expandOnHover: false,
  },
  render: (args) => (
    <Sidebar.Provider>
      <Sidebar {...args}>
        <SidebarContentExample />
      </Sidebar>
      <main className="flex-1 p-6 flex flex-col bg-graphite-background">
        <header className="h-16 border-b border-outline-variant/30 flex items-center px-4 gap-4 bg-surface rounded-xl mb-4">
          <Sidebar.Trigger />
          <Separator orientation="vertical" className="h-6" />
          <Typography variant="title-small">Playground</Typography>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-on-surface/50 text-center">
          <Typography variant="large">Adjust Sidebar Controls</Typography>
          <Typography variant="body-small" className="mt-2">
            Use the layout toggle in the top right to switch between LTR and
            RTL.
          </Typography>
        </div>
      </main>
    </Sidebar.Provider>
  ),
};

export const MockupNesting: Story = {
  name: "2. Nested Menu (Like Your Mockup)",
  args: {
    layout: "sidebar",
    variant: "surface-container-low",
    shape: "minimal",
    itemShape: "full",
    itemSize: "lg",
    itemVariant: "secondary",
    expandOnHover: false,
  },
  render: (args) => {
    const [active, setActive] = React.useState("enlarz");

    return (
      <Sidebar.Provider>
        <Sidebar {...args} width="18rem">
          <Sidebar.Header className="justify-between">
            <div className="flex items-center gap-3 overflow-hidden py-2 px-1">
              <Sparkles className="h-6 w-6 text-on-surface" />
              <Typography
                variant="title-medium"
                className="font-bold tracking-tight"
              >
                Menu
              </Typography>
            </div>
          </Sidebar.Header>

          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.Item
                icon={<Home />}
                isActive={active === "home"}
                onClick={() => setActive("home")}
              >
                Home
              </Sidebar.Item>

              <Sidebar.Item
                icon={<MessageSquare />}
                isActive={active === "messages"}
                onClick={() => setActive("messages")}
                badge={
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
                    <Badge
                      variant="primary"
                      shape="full"
                      className="px-1.5 h-5 bg-on-surface text-surface font-semibold text-xs"
                    >
                      2
                    </Badge>
                  </div>
                }
              >
                Messages
              </Sidebar.Item>

              <Sidebar.Collapse
                icon={<PlusSquare />}
                label="Integrations"
                indicator="plus-minus"
                isActive={active.startsWith("int-")}
              >
                <Sidebar.Item
                  icon={<Folder />}
                  isActive={active === "int-1"}
                  onClick={() => setActive("int-1")}
                >
                  Framer Sync
                </Sidebar.Item>
                <Sidebar.Item
                  icon={<Folder />}
                  isActive={active === "int-2"}
                  onClick={() => setActive("int-2")}
                >
                  GitHub App
                </Sidebar.Item>
              </Sidebar.Collapse>

              <Sidebar.Item
                icon={<CreditCard />}
                isActive={active === "finance"}
                onClick={() => setActive("finance")}
              >
                Finance
              </Sidebar.Item>

              <Sidebar.Collapse
                icon={<Archive />}
                label="Threads"
                indicator="plus-minus"
                defaultOpen
                isActive={["fignuts", "enlarz", "hugeicons"].includes(active)}
              >
                <Sidebar.Item
                  icon={<Folder />}
                  isActive={active === "fignuts"}
                  onClick={() => setActive("fignuts")}
                >
                  Fignuts
                </Sidebar.Item>
                <Sidebar.Item
                  icon={<Folder />}
                  isActive={active === "enlarz"}
                  onClick={() => setActive("enlarz")}
                >
                  Enlarz System
                </Sidebar.Item>
                <Sidebar.Item
                  icon={<Folder />}
                  isActive={active === "hugeicons"}
                  onClick={() => setActive("hugeicons")}
                >
                  Hugeicons
                </Sidebar.Item>
              </Sidebar.Collapse>

              <Sidebar.Item
                icon={<Contact />}
                isActive={active === "contacts"}
                onClick={() => setActive("contacts")}
              >
                Contacts
              </Sidebar.Item>

              <Sidebar.Collapse
                icon={<Compass />}
                label="Explore"
                indicator="plus-minus"
                isActive={active.startsWith("exp-")}
              >
                <Sidebar.Item
                  icon={<Folder />}
                  isActive={active === "exp-1"}
                  onClick={() => setActive("exp-1")}
                >
                  Trending
                </Sidebar.Item>
              </Sidebar.Collapse>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>

        <main className="flex-1 p-6 flex flex-col bg-surface-dim">
          <header className="h-16 border-b border-outline-variant/30 flex items-center px-4 gap-4 bg-surface rounded-xl mb-4 shadow-sm">
            <Sidebar.Trigger />
            <Separator orientation="vertical" className="h-6" />
            <Typography variant="title-small">Mockup Showcase</Typography>
          </header>
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface/50 text-center">
            <Typography variant="large">
              Interactive Nesting Component
            </Typography>
            <Typography variant="body-small" className="mt-2">
              Currently Active Item:{" "}
              <strong className="text-primary">{active}</strong>
            </Typography>
          </div>
        </main>
      </Sidebar.Provider>
    );
  },
};
