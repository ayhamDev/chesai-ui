import type { Meta, StoryObj } from "@storybook/react";
import { Mail, Settings, User } from "lucide-react";
import React from "react";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "./index";

const meta: Meta<typeof ItemGroup> = {
  title: "Components/Data/ItemGroup",
  component: ItemGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    direction: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    gap: {
      control: "select",
      options: ["none", "xs", "sm", "md", "lg"],
      description: "Controls the spacing between grouped items.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ItemGroup>;

export const DefaultVertical: Story = {
  name: "1. Vertical Stack",
  args: {
    shape: "minimal",
    direction: "vertical",
    gap: "xs",
  },
  render: (args) => (
    <div className="w-96">
      <ItemGroup {...args}>
        <Item variant="secondary" className="cursor-pointer">
          <ItemMedia variant="icon" shape="full">
            <User className="h-4 w-4" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Profile</ItemTitle>
            <ItemDescription>Manage your public profile.</ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="secondary" className="cursor-pointer">
          <ItemMedia variant="icon" shape="full">
            <Mail className="h-4 w-4" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Email Preferences</ItemTitle>
            <ItemDescription>
              Update your notification settings.
            </ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="secondary" className="cursor-pointer">
          <ItemMedia variant="icon" shape="full">
            <Mail className="h-4 w-4" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Email Preferences</ItemTitle>
            <ItemDescription>
              Update your notification settings.
            </ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="secondary" className="cursor-pointer">
          <ItemMedia variant="icon" shape="full">
            <Settings className="h-4 w-4" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Security</ItemTitle>
            <ItemDescription>Change password and 2FA.</ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  ),
};

export const HorizontalStack: Story = {
  name: "2. Horizontal Stack",
  args: {
    shape: "full",
    direction: "horizontal",
    gap: "xs",
  },
  render: (args) => (
    <div className="max-w-3xl">
      <ItemGroup {...args}>
        <Item variant="primary" padding="sm" className="cursor-pointer px-6">
          <ItemContent>
            <ItemTitle>React</ItemTitle>
          </ItemContent>
        </Item>
        <Item variant="primary" padding="sm" className="cursor-pointer px-6">
          <ItemContent>
            <ItemTitle>Vue</ItemTitle>
          </ItemContent>
        </Item>
        <Item variant="primary" padding="sm" className="cursor-pointer px-6">
          <ItemContent>
            <ItemTitle>Svelte</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  ),
};

export const SharpShape: Story = {
  name: "3. Sharp (0px inner & outer)",
  args: {
    shape: "sharp",
    direction: "vertical",
    gap: "none",
  },
  render: (args) => (
    <div className="w-80">
      <ItemGroup {...args}>
        <Item variant="secondary" padding="sm">
          <ItemContent>
            <ItemTitle>Option A</ItemTitle>
          </ItemContent>
        </Item>
        <Item variant="secondary" padding="sm">
          <ItemContent>
            <ItemTitle>Option B</ItemTitle>
          </ItemContent>
        </Item>
        <Item variant="secondary" padding="sm">
          <ItemContent>
            <ItemTitle>Option C</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  ),
};
