import type { Meta, StoryObj } from "@storybook/react";
import {
  Bell,
  ChevronRight,
  File,
  Lock,
  MoreVertical,
  Palette,
  Star,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { Checkbox } from "../checkbox";
import { IconButton } from "../icon-button";
import { Switch } from "../switch";
import { Typography } from "../typography";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
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
    ItemHeader,
    ItemFooter,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile compound component for building list items, profiles, notifications, and more complex layouts. Items now have a subtle, fast ripple effect on click.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost"],
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

export const VerticalProductCard: Story = {
  name: "4. Vertical (Product Card Style)",
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
  name: "5. Polymorphic (as link)",
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
            <ChevronRight size={20} className="text-graphite-foreground/50" />
          </ItemActions>
        </a>
      </Item>
    </div>
  ),
};

export const RippleControl: Story = {
  name: "6. Ripple Control",
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
  name: "7. With Long Press",
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

export const TeamMembersList: Story = {
  name: "8. Use Case: Interactive Team List",
  parameters: {
    docs: {
      description: {
        story:
          "Clicking anywhere on the Item toggles the checkbox. Clicking the checkbox itself is handled separately to prevent the event from firing twice.",
      },
    },
  },
  render: () => {
    const members = [
      {
        id: "1",
        name: "Alisa Hester",
        role: "Frontend Developer",
        avatar: "https://i.pravatar.cc/150?img=1",
        badge: "Admin",
        active: null,
      },
      {
        id: "2",
        name: "Barry Cuda",
        role: "Backend Developer",
        avatar: "https://i.pravatar.cc/150?img=2",
        badge: null,
        active: null,
      },
      {
        id: "3",
        name: "Charlie Enderson",
        role: "Product Designer",
        avatar: "https://i.pravatar.cc/150?img=3",
        badge: null,
        active: "Last active: 2 hours ago",
      },
    ];

    const [selected, setSelected] = useState(new Set(["1"]));

    const toggleSelection = (id: string) => {
      setSelected((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    };

    return (
      <div className="max-w-4xl w-full">
        <Typography variant="h4" className="mb-4">
          Team Members
        </Typography>
        <ItemGroup>
          {members.map((member, index) => (
            <React.Fragment key={member.id}>
              <Item
                size="lg"
                shape="minimal"
                variant={member.badge ? "primary" : "secondary"}
                className="cursor-pointer"
                onClick={() => toggleSelection(member.id)}
              >
                <ItemMedia variant="avatar">
                  <Avatar
                    src={member.avatar}
                    fallback={member.name.slice(0, 2)}
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemHeader>
                    <ItemTitle>{member.name}</ItemTitle>
                    {member.badge && (
                      <Badge shape="full" variant="secondary">
                        {member.badge}
                      </Badge>
                    )}
                  </ItemHeader>
                  <ItemDescription>{member.role}</ItemDescription>
                  {member.active && (
                    <ItemFooter>
                      <Typography variant="muted" className="!text-xs">
                        {member.active}
                      </Typography>
                    </ItemFooter>
                  )}
                </ItemContent>
                <ItemActions onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(member.id)}
                    onChange={() => toggleSelection(member.id)}
                    aria-label={`Select ${member.name}`}
                  />
                </ItemActions>
              </Item>
              {index < members.length - 1 && <ItemSeparator />}
            </React.Fragment>
          ))}
        </ItemGroup>
      </div>
    );
  },
};

export const SettingsList: Story = {
  name: "9. Use Case: Interactive Settings List",
  parameters: {
    docs: {
      description: {
        story:
          "A common pattern for settings pages. Clicking the entire item toggles the switch, providing a larger touch target.",
      },
    },
  },
  render: () => {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    return (
      <div className="w-96">
        <Typography variant="h4" className="mb-4">
          Settings
        </Typography>
        <ItemGroup>
          <Item
            variant="ghost"
            size="md"
            className="cursor-pointer"
            onClick={() => setNotifications((prev) => !prev)}
          >
            <ItemMedia variant="icon" shape="full">
              <Bell />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Push Notifications</ItemTitle>
              <ItemDescription>
                Receive updates on new messages.
              </ItemDescription>
            </ItemContent>
            <ItemActions onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                aria-label="Toggle push notifications"
              />
            </ItemActions>
          </Item>
          <Item
            variant="ghost"
            size="md"
            className="cursor-pointer"
            onClick={() => setDarkMode((prev) => !prev)}
          >
            <ItemMedia variant="icon" shape="full">
              <Palette />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Dark Mode</ItemTitle>
              <ItemDescription>
                Toggle between light and dark themes.
              </ItemDescription>
            </ItemContent>
            <ItemActions onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                aria-label="Toggle dark mode"
              />
            </ItemActions>
          </Item>
          <Item asChild variant="ghost" size="md" className="cursor-pointer">
            <a href="#" onClick={(e) => e.preventDefault()}>
              <ItemMedia variant="icon" shape="full">
                <Lock />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Account & Security</ItemTitle>
              </ItemContent>
              <ItemActions>
                <ChevronRight
                  size={20}
                  className="text-graphite-foreground/50"
                />
              </ItemActions>
            </a>
          </Item>
        </ItemGroup>
      </div>
    );
  },
};

export const NotificationList: Story = {
  name: "10. Use Case: Notification List",
  parameters: {
    docs: {
      description: {
        story:
          "Displaying a feed of notifications with avatars and timestamps.",
      },
    },
  },
  render: () => (
    <div className="w-[450px]">
      <ItemGroup>
        <Item variant="secondary" shape="minimal">
          <ItemMedia variant="avatar">
            <Avatar src="https://i.pravatar.cc/150?img=4" />
          </ItemMedia>
          <ItemContent>
            <ItemDescription>
              <b>Diana Prince</b> mentioned you in the <b>Q4 Planning</b>{" "}
              document.
            </ItemDescription>
            <ItemFooter>
              <Typography variant="muted" className="!text-xs">
                2 minutes ago
              </Typography>
            </ItemFooter>
          </ItemContent>
          <ItemActions>
            <div className="size-2.5 rounded-full bg-blue-500" />
          </ItemActions>
        </Item>
        <Item variant="secondary" shape="minimal">
          <ItemMedia variant="avatar">
            <Avatar src="https://i.pravatar.cc/150?img=5" />
          </ItemMedia>
          <ItemContent>
            <ItemDescription>
              <b>Clark Kent</b> completed the task "Deploy to production".
            </ItemDescription>
            <ItemFooter>
              <Typography variant="muted" className="!text-xs">
                1 hour ago
              </Typography>
            </ItemFooter>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  ),
};
