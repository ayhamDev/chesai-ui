import type { Meta, StoryObj } from "@storybook/react";
import {
  Mountain,
  Search,
  User,
  Package,
  LayoutDashboard,
  Compass,
} from "lucide-react";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { Input } from "../input";
import { Typography } from "../typography";
import { Navbar } from "./index";
import React from "react";

const meta: Meta<typeof Navbar> = {
  title: "Components/Navigators/Navbar",
  component: Navbar,
  subcomponents: {
    "Navbar.Brand": Navbar.Brand as any,
    "Navbar.Content": Navbar.Content as any,
    "Navbar.Item": Navbar.Item as any,
    "Navbar.Dropdown": Navbar.Dropdown as any,
    "Navbar.Toggle": Navbar.Toggle as any,
    "Navbar.MobileMenu": Navbar.MobileMenu as any,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A highly configurable responsive navigation bar. Features explicit `position` and `innerPadding` controls, comprehensive active states (`underline`, `pill`, `bordered`, `text`), and a built-in nested dropdown system that adapts to mobile accordions seamlessly.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "surface", "ghost"],
    },
    position: {
      control: "select",
      options: ["static", "sticky", "fixed"],
      description:
        "Controls CSS positioning. 'static' scrolls normally, 'sticky' stays at the top of its scrolling parent, 'fixed' locks to the viewport.",
    },
    maxWidth: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
    },
    innerPadding: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
    bordered: { control: "boolean" },
    glass: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="w-full h-screen overflow-y-auto bg-graphite-background relative border border-outline-variant shadow-inner">
        <Story />
        <div className="p-8 pt-12 opacity-20 pointer-events-none flex flex-col gap-6">
          <Typography variant="display-small">Page Content</Typography>
          <div className="h-48 bg-surface-container rounded-2xl w-full max-w-4xl" />
          <div className="h-48 bg-surface-container rounded-2xl w-full max-w-4xl" />
          <div className="h-48 bg-surface-container rounded-2xl w-full max-w-4xl" />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
  name: "1. Default (Dropdown Mobile)",
  args: {
    position: "sticky",
    variant: "surface",
    bordered: true,
    glass: true,
    innerPadding: "md",
  },
  render: (args) => (
    <Navbar {...args}>
      <Navbar.Brand>
        <div className="flex items-center gap-2 text-primary">
          <Mountain className="h-6 w-6" />
          <Typography
            variant="title-medium"
            className="font-bold tracking-tight"
          >
            AcmeCorp
          </Typography>
        </div>
      </Navbar.Brand>

      <Navbar.Content justify="center">
        <Navbar.Item isActive activeVariant="underline">
          Home
        </Navbar.Item>
        <Navbar.Item activeVariant="underline">Products</Navbar.Item>
        <Navbar.Item activeVariant="underline">Pricing</Navbar.Item>
        <Navbar.Item activeVariant="underline">About</Navbar.Item>
      </Navbar.Content>

      <Navbar.Content justify="end">
        <Button variant="ghost" size="sm">
          Login
        </Button>
        <Button variant="primary" size="sm">
          Get Started
        </Button>
      </Navbar.Content>

      <Navbar.Toggle />

      <Navbar.MobileMenu mode="dropdown">
        <Navbar.Item isActive activeVariant="underline">
          Home
        </Navbar.Item>
        <Navbar.Item activeVariant="underline">Products</Navbar.Item>
        <Navbar.Item activeVariant="underline">Pricing</Navbar.Item>
        <Navbar.Item activeVariant="underline">About</Navbar.Item>
        <div className="h-px w-full bg-outline-variant my-2" />
        <Button variant="ghost" className="w-full justify-start">
          Login
        </Button>
        <Button variant="primary" className="w-full">
          Get Started
        </Button>
      </Navbar.MobileMenu>
    </Navbar>
  ),
};

export const SelectedStates: Story = {
  name: "2. Selected States (Pill & Bordered)",
  args: {
    ...Default.args,
    variant: "primary",
    innerPadding: "lg",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use `activeVariant` on `Navbar.Item` to change how selections look.",
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-12 w-full h-full p-0">
      {/* Pill Variant */}
      <Navbar {...args} position="static">
        <Navbar.Brand>
          <Typography variant="title-small" className="font-bold">
            Pill Style
          </Typography>
        </Navbar.Brand>
        <Navbar.Content justify="center">
          <Navbar.Item isActive activeVariant="pill">
            Dashboard
          </Navbar.Item>
          <Navbar.Item activeVariant="pill">Projects</Navbar.Item>
          <Navbar.Item activeVariant="pill">Team</Navbar.Item>
        </Navbar.Content>
        <Navbar.Content justify="end">
          <IconButton variant="ghost" size="sm">
            <Search />
          </IconButton>
        </Navbar.Content>
      </Navbar>

      {/* Bordered Variant */}
      <Navbar {...args} position="static" variant="secondary">
        <Navbar.Brand>
          <Typography variant="title-small" className="font-bold">
            Bordered Style
          </Typography>
        </Navbar.Brand>
        <Navbar.Content justify="end">
          <Navbar.Item isActive activeVariant="bordered">
            App Setup
          </Navbar.Item>
          <Navbar.Item activeVariant="bordered">Database</Navbar.Item>
          <Navbar.Item activeVariant="bordered">Deploy</Navbar.Item>
        </Navbar.Content>
      </Navbar>
    </div>
  ),
};

export const NestedMenusSideSheet: Story = {
  name: "3. Nested Dropdowns & Side Sheet",
  args: {
    position: "sticky",
    variant: "surface",
    bordered: true,
    glass: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The `Navbar.Dropdown` API automatically renders as a Popover menu on Desktop, and an animated Accordion on Mobile. This story configures the mobile menu to use `mode="side-sheet"`.',
      },
    },
  },
  render: (args) => (
    <Navbar {...args}>
      <Navbar.Brand>
        <Typography variant="title-medium" className="font-bold text-primary">
          Nexus
        </Typography>
      </Navbar.Brand>

      <Navbar.Content justify="center">
        <Navbar.Item isActive activeVariant="text">
          Home
        </Navbar.Item>

        {/* Universal Dropdown API */}
        <Navbar.Dropdown>
          <Navbar.DropdownTrigger activeVariant="text">
            Solutions
          </Navbar.DropdownTrigger>
          <Navbar.DropdownContent>
            <Navbar.DropdownItem>
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" /> Startups
              </div>
            </Navbar.DropdownItem>
            <Navbar.DropdownItem>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" /> Enterprises
              </div>
            </Navbar.DropdownItem>

            {/* Infinite Deep Nesting */}
            <Navbar.Dropdown>
              <Navbar.DropdownTrigger>More Options</Navbar.DropdownTrigger>
              <Navbar.DropdownContent>
                <Navbar.DropdownItem>Security</Navbar.DropdownItem>
                <Navbar.DropdownItem>Compliance</Navbar.DropdownItem>
              </Navbar.DropdownContent>
            </Navbar.Dropdown>
          </Navbar.DropdownContent>
        </Navbar.Dropdown>

        <Navbar.Item activeVariant="text">Pricing</Navbar.Item>
      </Navbar.Content>

      <Navbar.Content justify="end">
        <IconButton variant="ghost" size="sm" aria-label="Search">
          <Search />
        </IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Profile">
          <User />
        </IconButton>
      </Navbar.Content>

      <Navbar.Toggle />

      {/* Side-Sheet Mobile Menu */}
      <Navbar.MobileMenu
        mode="side-sheet"
        side="left"
        sheetHeader={
          <Typography variant="title-medium" className="font-bold text-primary">
            Nexus
          </Typography>
        }
      >
        <Navbar.Item isActive activeVariant="text">
          Home
        </Navbar.Item>

        {/* Dropdown becomes an accordion automatically here! */}
        <Navbar.Dropdown>
          <Navbar.DropdownTrigger activeVariant="text">
            Solutions
          </Navbar.DropdownTrigger>
          <Navbar.DropdownContent>
            <Navbar.DropdownItem>Startups</Navbar.DropdownItem>
            <Navbar.DropdownItem>Enterprises</Navbar.DropdownItem>
            <Navbar.Dropdown>
              <Navbar.DropdownTrigger>More Options</Navbar.DropdownTrigger>
              <Navbar.DropdownContent>
                <Navbar.DropdownItem>Security</Navbar.DropdownItem>
                <Navbar.DropdownItem>Compliance</Navbar.DropdownItem>
              </Navbar.DropdownContent>
            </Navbar.Dropdown>
          </Navbar.DropdownContent>
        </Navbar.Dropdown>

        <Navbar.Item activeVariant="text">Pricing</Navbar.Item>

        <div className="mt-auto pt-4 flex flex-col gap-2">
          <Button variant="outline">Sign In</Button>
          <Button variant="primary">Register</Button>
        </div>
      </Navbar.MobileMenu>
    </Navbar>
  ),
};
