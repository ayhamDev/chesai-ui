import type { Meta, StoryObj } from "@storybook/react";
import {
  Code,
  Component,
  GitCommit,
  Github,
  LifeBuoy,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import React from "react";
import { Badge } from "../badge";
import { Typography } from "../typography";
import { NavigationMenu, navigationMenuTriggerStyle } from "./index";

const meta: Meta<typeof NavigationMenu> = {
  title: "Components/Navigators/NavigationMenu",
  component: NavigationMenu,
  subcomponents: {
    "NavigationMenu.ContentList": NavigationMenu.ContentList,
    "NavigationMenu.ContentItem": NavigationMenu.ContentItem,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A modern, accessible navigation menu with smooth, animated transitions for dropdowns. Built on Radix UI. Now includes `ContentList` and `ContentItem` for building rich dropdown layouts.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

export const Default: Story = {
  name: "1. Default Menu",
  render: () => (
    <div className="flex h-96 w-full items-start justify-center pt-12">
      <NavigationMenu>
        <NavigationMenu.List>
          <NavigationMenu.Item>
            <NavigationMenu.Trigger>Getting started</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenu.Link asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-lg bg-gradient-to-b from-graphite-secondary to-graphite-border p-6 no-underline outline-none focus:shadow-md"
                      href="#"
                    >
                      <Component className="h-6 w-6" />
                      <div className="mb-2 mt-4 text-lg font-bold">
                        chesai-ui
                      </div>
                      <p className="text-sm leading-tight text-gray-500">
                        A modern, accessible component library for React.
                      </p>
                    </a>
                  </NavigationMenu.Link>
                </li>
                {/* Replaced old ListItem with new ContentItem */}
                <NavigationMenu.ContentItem href="#" title="Introduction">
                  Learn the basics of the library and its design principles.
                </NavigationMenu.ContentItem>
                <NavigationMenu.ContentItem href="#" title="Installation">
                  How to get started and integrate with your project.
                </NavigationMenu.ContentItem>
                <NavigationMenu.ContentItem href="#" title="Theming">
                  Customize colors, fonts, and more to match your brand.
                </NavigationMenu.ContentItem>
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link
              href="#"
              className={navigationMenuTriggerStyle()}
            >
              <Typography variant="body-small" className="font-semibold">
                Changelog
              </Typography>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu>
    </div>
  ),
};

// --- NEW STORY ---
export const WithIconsAndAdornments: Story = {
  name: "2. With Icons and Adornments",
  parameters: {
    docs: {
      description: {
        story:
          "The new `ContentList` and `ContentItem` components make it easy to build rich, descriptive navigation menus with icons and other adornments like badges.",
      },
    },
  },
  render: () => (
    <div className="flex h-96 w-full items-start justify-center pt-12">
      <NavigationMenu>
        <NavigationMenu.List>
          <NavigationMenu.Item>
            <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              {/* Use ContentList for consistent styling */}
              <NavigationMenu.ContentList
                grid="cols-2"
                className="md:w-[500px]"
              >
                <NavigationMenu.ContentItem
                  title="API Documentation"
                  startIcon={<Code size={20} />}
                  href="#"
                >
                  Access our full suite of REST and GraphQL APIs.
                </NavigationMenu.ContentItem>
                <NavigationMenu.ContentItem
                  title="Contribution Guide"
                  startIcon={<GitCommit size={20} />}
                  href="#"
                >
                  Help us improve the library by contributing.
                </NavigationMenu.ContentItem>
                <NavigationMenu.ContentItem
                  title="GitHub Repository"
                  startIcon={<Github size={20} />}
                  href="#"
                >
                  View the source code and report issues.
                </NavigationMenu.ContentItem>
                <NavigationMenu.ContentItem
                  title="Support"
                  startIcon={<LifeBuoy size={20} />}
                  href="#"
                  endAdornment={
                    <Badge variant="secondary" shape="full">
                      New
                    </Badge>
                  }
                >
                  Get help from our dedicated support team.
                </NavigationMenu.ContentItem>
              </NavigationMenu.ContentList>
            </NavigationMenu.Content>
          </NavigationMenu.Item>

          <NavigationMenu.Item>
            <NavigationMenu.Trigger>Account</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              {/* A single-column list */}
              <NavigationMenu.ContentList grid="cols-1" className="w-[300px]">
                <NavigationMenu.ContentItem
                  title="Profile"
                  startIcon={<User size={16} />}
                  href="#"
                />
                <NavigationMenu.ContentItem
                  title="Settings"
                  startIcon={<Settings size={16} />}
                  href="#"
                />
                <NavigationMenu.ContentItem
                  title="Log out"
                  startIcon={<LogOut size={16} />}
                  href="#"
                />
              </NavigationMenu.ContentList>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu>
    </div>
  ),
};
