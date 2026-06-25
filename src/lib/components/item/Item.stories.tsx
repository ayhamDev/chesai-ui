// src/lib/components/item/Item.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import {
  ChevronDown,
  ChevronRight,
  File,
  MoreVertical,
  Star,
} from "lucide-react";
import React from "react";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { Typography } from "../typography";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemExpandedContent,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "./index";

const meta: Meta<typeof Item> = {
  title: "Components/Data/Item",
  component: Item,
  subcomponents: {
    ItemGroup,
    ItemSeparator,
    ItemMedia,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemActions,
    ItemExpandedContent,
    ItemHeader,
    ItemFooter,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile compound component for building lists, notifications, and modular action layers. Supports custom swipe states, ripple triggers, long-press callbacks, and Material-inspired vertical expansion grids.",
      },
    },
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
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    direction: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
    asChild: { control: "boolean" },
    disabled: { control: "boolean" },
    disableRipple: { control: "boolean" },
    onLongPress: { action: "longPressed" },
  },
};

export default meta;
type Story = StoryObj<typeof Item>;

export const Default: Story = {
  name: "1. Default",
  args: {
    variant: "primary",
    size: "md",
    shape: "minimal",
    direction: "horizontal",
  },
  render: (args) => (
    <div className="w-96">
      <Item {...args}>
        <ItemMedia variant="icon">
          <File />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Annual Report</ItemTitle>
          <ItemDescription>
            Finalized version of the 2023 report.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <IconButton variant="ghost" size="sm" aria-label="More options">
            <MoreVertical size={16} />
          </IconButton>
        </ItemActions>
      </Item>
    </div>
  ),
};

export const AllVariants: Story = {
  name: "2. All Variants",
  render: () => (
    <div className="w-96">
      <ItemGroup>
        <Item variant="primary" onClick={() => {}}>
          <ItemContent>
            <ItemTitle>Primary (Click for Ripple)</ItemTitle>
          </ItemContent>
        </Item>
        <Item variant="secondary" onClick={() => {}}>
          <ItemContent>
            <ItemTitle>Secondary</ItemTitle>
          </ItemContent>
        </Item>
        <Item variant="ghost" onClick={() => {}}>
          <ItemContent>
            <ItemTitle>Ghost</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  ),
};

export const AllSizes: Story = {
  name: "3. All Sizes",
  render: () => (
    <div className="w-96">
      <ItemGroup>
        <Item size="sm">
          <ItemMedia variant="icon">
            <Star />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Small Item</ItemTitle>
          </ItemContent>
        </Item>
        <Item size="md">
          <ItemMedia variant="icon">
            <Star />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Medium Item (Default)</ItemTitle>
          </ItemContent>
        </Item>
        <Item size="lg">
          <ItemMedia variant="icon">
            <Star />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Large Item</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  ),
};

// State-enabled wrapper story validating the Android 16 expandable shade logic.
// Strictly uses MD3 classes for theming consistency and prevents capsule warping.
const ExpandableNotificationHelper = ({
  sender,
  time,
  avatar,
  message,
}: {
  sender: string;
  time: string;
  avatar: string;
  message: string;
}) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Item
      expandable
      expanded={expanded}
      onExpandedChange={setExpanded}
      shape="full"
      variant="surface-container"
      padding="md"
    >
      <ItemMedia variant="avatar" className="self-start mt-1">
        <Avatar src={avatar} fallback={sender[0]} />
      </ItemMedia>
      <ItemContent>
        <div className="flex justify-between items-center mb-0.5">
          <ItemTitle className="text-sm font-bold text-on-surface">
            {sender}
          </ItemTitle>
          <div className="flex items-center gap-1 opacity-60 text-on-surface-variant">
            <Typography variant="body-small" className="text-xs font-semibold">
              {time}
            </Typography>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
        <ItemDescription collapsedLines={1} className="text-on-surface-variant">
          {message}
        </ItemDescription>

        <ItemExpandedContent>
          <div className="flex items-center gap-2 mt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                alert(`Marked ${sender}'s message as read`);
              }}
            >
              Mark as read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                alert(`Replying to ${sender}`);
              }}
            >
              Reply
            </Button>
          </div>
        </ItemExpandedContent>
      </ItemContent>
    </Item>
  );
};

export const ExpandableShadeNotification: Story = {
  name: "4. Android 16 Shade (Expandable)",
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the expandable Material notification card shaded within an outer platform container. Note that clicking the overall notification triggers a clean, smooth transition that avoids oval capsule distortion, and button triggers stop event bubbles natively.",
      },
    },
  },
  render: () => (
    <div className="w-[420px] bg-surface-container-low p-4 rounded-[36px] border border-outline-variant/30 flex flex-col gap-2 shadow-xl">
      <ExpandableNotificationHelper
        sender="Matt"
        time="now"
        avatar="https://i.pravatar.cc/150?u=matt"
        message="Hey! Are we still down for meeting up on Saturday? I think Tyler wanted to as well."
      />
      <ExpandableNotificationHelper
        sender="Rebecca"
        time="5m"
        avatar="https://i.pravatar.cc/150?u=rebecca"
        message="Are you coming over? I'm making a bunch of food for everyone and want to make sure I have enough."
      />
    </div>
  ),
};

export const VerticalProductCard: Story = {
  name: "5. Vertical (Product Card Style)",
  args: {
    direction: "vertical",
    shape: "minimal",
    variant: "primary",
    padding: "none",
  },
  render: (args) => (
    <div className="flex items-start gap-4">
      <Item
        {...args}
        className="w-60 text-left cursor-pointer"
        onClick={() => alert("Product card clicked!")}
      >
        <ItemMedia className="!mb-0 !p-0 !rounded-t-xl !rounded-b-none overflow-hidden w-full h-[150px]">
          <img
            src="https://images.unsplash.com/photo-1588421357574-87938a86fa28?q=80&w=600&auto=format&fit=crop"
            alt="Abstract dark texture"
            className="w-full h-40 object-cover"
          />
        </ItemMedia>
        <ItemContent className="p-4 w-full !items-start">
          <ItemTitle>v0-1.5-sm</ItemTitle>
          <ItemDescription>Everyday tasks and UI generation.</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  ),
};

export const AsLink: Story = {
  name: "6. Polymorphic (as link)",
  parameters: {
    docs: {
      description: {
        story:
          "Using `asChild` prop, the `Item` component can wrap an anchor tag to become a fully clickable link, while maintaining all styling and layout.",
      },
    },
  },
  render: () => (
    <div className="w-96">
      <Item asChild variant="ghost" className="cursor-pointer">
        <a href="#" onClick={(e) => e.preventDefault()}>
          <ItemMedia variant="icon">
            <File />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Project Proposal</ItemTitle>
            <ItemDescription>Click to view the document.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <ChevronRight
              size={20}
              className="text-on-surface-variant opacity-60"
            />
          </ItemActions>
        </a>
      </Item>
    </div>
  ),
};

export const RippleControl: Story = {
  name: "7. Ripple Control",
  parameters: {
    docs: {
      description: {
        story:
          "You can explicitly disable the ripple effect on an item by setting `disableRipple={true}`.",
      },
    },
  },
  render: () => (
    <div className="w-96">
      <ItemGroup>
        <Item onClick={() => {}} className="cursor-pointer">
          <ItemMedia variant="icon">
            <Star />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Ripple Enabled (Default)</ItemTitle>
            <ItemDescription>Click me to see the effect.</ItemDescription>
          </ItemContent>
        </Item>
        <Item onClick={() => {}} disableRipple className="cursor-pointer">
          <ItemMedia variant="icon">
            <Star />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Ripple Disabled</ItemTitle>
            <ItemDescription>
              This item will not have a ripple effect.
            </ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  ),
};

export const WithLongPress: Story = {
  name: "8. With Long Press",
  parameters: {
    docs: {
      description: {
        story:
          "The `onLongPress` prop allows you to trigger an action when an item is pressed for 500ms. This is particularly useful for context menus on touch devices.",
      },
    },
  },
  render: (args) => (
    <div className="w-96">
      <ItemGroup>
        <Item
          onLongPress={() => {
            alert("Long press triggered!");
          }}
          onClick={() => alert("Item clicked!")}
          className="cursor-pointer"
        >
          <ItemMedia variant="icon">
            <File />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Long Press Me</ItemTitle>
            <ItemDescription>
              Press and hold this item for half a second.
            </ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  ),
};
