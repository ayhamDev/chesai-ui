import type { Meta, StoryObj } from "@storybook/react";
import {
  Bell,
  ChevronRight,
  File,
  Lock,
  Menu,
  MoreVertical,
  Palette,
  Pen,
  Pin,
  Star,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { Checkbox } from "../checkbox";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { FAB } from "../fab";
import { IconButton } from "../icon-button";
import { Switch } from "../switch";
import { toast, Toaster } from "../toast";
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
          "A versatile compound component for building list items, profiles, notifications, and more complex layouts. Items now have a subtle, fast ripple effect on click and natively support Framer Motion swipe-to-reveal physics.",
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

export const SwipeToReveal: Story = {
  name: "8. Swipe to Reveal (Inbox)",
  parameters: {
    docs: {
      description: {
        story:
          "Wrap your item content with `swipeRightContent` or `swipeLeftContent` to enable beautiful mobile-style swipe-to-reveal actions. Uses Framer Motion's drag physics natively.",
      },
    },
  },
  render: () => {
    return (
      <div className="relative w-full max-w-[420px] h-[750px] bg-white rounded-[40px] shadow-2xl border-[10px] border-[#eff1f5] overflow-hidden flex flex-col">
        <Toaster />
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-12 pb-4 bg-[#f8f9fc]">
          <Menu className="text-black" />
          <Typography
            variant="title-medium"
            className="text-black font-normal text-xl"
          >
            Inbox
          </Typography>
          <Avatar src="https://i.pravatar.cc/150?u=user" size="sm" />
        </div>

        {/* List */}
        <ElasticScrollArea className="flex-1 bg-[#f8f9fc]">
          <ItemGroup gap="none" shape="sharp" direction="vertical">
            {/* Item 1 - Showing Swipe */}
            <Item
              variant="surface"
              padding="lg"
              className="cursor-pointer bg-white border-b border-gray-100 last:border-b-0"
              swipeRightContent={
                <div className="flex w-full h-full items-center justify-start bg-[#fdbaf0] px-8">
                  <Star className="text-[#8e256b] h-8 w-8" strokeWidth={1.5} />
                </div>
              }
              onSwipeRight={() => toast("Conversation starred!")}
              swipeThreshold={100}
            >
              <ItemMedia variant="avatar" className="self-start mt-1">
                <Avatar src="https://i.pravatar.cc/150?u=karimi" size="md" />
              </ItemMedia>
              <ItemContent>
                <div className="flex justify-between items-baseline mb-1">
                  <ItemTitle className="text-black font-semibold text-base">
                    Karimi, Mohammad
                  </ItemTitle>
                  <Typography
                    variant="body-small"
                    className="text-xs font-semibold text-[#8e256b]"
                  >
                    2 min
                  </Typography>
                </div>
                <Typography
                  variant="body-medium"
                  className="text-black font-semibold leading-tight"
                >
                  Bonjour de Paris
                </Typography>
                <ItemDescription className="text-gray-500 mt-1 line-clamp-1">
                  I got my film developed from your visit...
                </ItemDescription>
              </ItemContent>
            </Item>

            {/* Item 2 */}
            <Item
              variant="surface"
              padding="lg"
              className="cursor-pointer bg-[#fdf2fc] border-b border-gray-100 last:border-b-0"
              swipeRightContent={
                <div className="flex w-full h-full items-center justify-start bg-[#fdbaf0] px-8">
                  <Star className="text-[#8e256b] h-8 w-8" strokeWidth={1.5} />
                </div>
              }
              onSwipeRight={() => toast("Conversation starred!")}
              swipeThreshold={100}
            >
              <ItemMedia variant="avatar" className="self-start mt-1">
                <Avatar src="https://i.pravatar.cc/150?u=ziad" size="md" />
              </ItemMedia>
              <ItemContent>
                <div className="flex justify-between items-baseline mb-1">
                  <ItemTitle className="text-black font-semibold text-base">
                    Ziad
                  </ItemTitle>
                  <Typography
                    variant="body-small"
                    className="text-xs font-semibold text-black"
                  >
                    5 min
                  </Typography>
                </div>
                <Typography
                  variant="body-medium"
                  className="text-black font-semibold leading-tight"
                >
                  Volunteer EMT with me?
                </Typography>
                <ItemDescription className="text-gray-500 mt-1 line-clamp-1">
                  What do you think about training to be volunteer...
                </ItemDescription>
              </ItemContent>
            </Item>

            {/* Item 3 */}
            <Item
              variant="surface"
              padding="lg"
              className="cursor-pointer bg-white border-b border-gray-100 last:border-b-0"
              swipeRightContent={
                <div className="flex w-full h-full items-center justify-start bg-[#fdbaf0] px-8">
                  <Star className="text-[#8e256b] h-8 w-8" strokeWidth={1.5} />
                </div>
              }
              onSwipeRight={() => toast("Conversation starred!")}
              swipeThreshold={100}
            >
              <ItemMedia variant="avatar" className="self-start mt-1">
                <Avatar src="https://i.pravatar.cc/150?u=reza" size="md" />
              </ItemMedia>
              <ItemContent>
                <div className="flex justify-between items-baseline mb-1">
                  <ItemTitle className="text-black font-semibold text-base">
                    Reza, Fabian
                  </ItemTitle>
                  <Typography
                    variant="body-small"
                    className="text-xs font-semibold text-black"
                  >
                    10:32 AM
                  </Typography>
                </div>
                <Typography
                  variant="body-medium"
                  className="text-black font-semibold leading-tight"
                >
                  Package shipped
                </Typography>
                <ItemDescription className="text-gray-500 mt-1 line-clamp-1">
                  Hi Ping! Just wanted to let you know that your...
                </ItemDescription>
              </ItemContent>
            </Item>

            {/* Additional items to ensure scrolling */}
            <Item
              variant="surface"
              padding="lg"
              className="cursor-pointer bg-white border-b border-gray-100 last:border-b-0"
              swipeRightContent={
                <div className="flex w-full h-full items-center justify-start bg-[#fdbaf0] px-8">
                  <Star className="text-[#8e256b] h-8 w-8" strokeWidth={1.5} />
                </div>
              }
              onSwipeRight={() => toast("Conversation starred!")}
              swipeThreshold={100}
            >
              <ItemMedia variant="avatar" className="self-start mt-1">
                <Avatar src="https://i.pravatar.cc/150?u=lilly" size="md" />
              </ItemMedia>
              <ItemContent>
                <div className="flex justify-between items-baseline mb-1">
                  <ItemTitle className="text-black font-semibold text-base">
                    MacDonald, Lilly
                  </ItemTitle>
                  <Typography
                    variant="body-small"
                    className="text-xs font-semibold text-black"
                  >
                    8:15 AM
                  </Typography>
                </div>
                <Typography
                  variant="body-medium"
                  className="text-black font-semibold leading-tight"
                >
                  This new food show is made for you
                </Typography>
                <ItemDescription className="text-gray-500 mt-1 line-clamp-1">
                  Ping - you'd love this new food show!
                </ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>
        </ElasticScrollArea>

        {/* FAB */}
        <div className="absolute bottom-6 right-6 z-50">
          <FAB
            icon={<Pen className="text-[#3b1248] h-6 w-6" />}
            variant="secondary"
            shape="minimal"
            size="xl"
            className="bg-[#cba6ff] hover:bg-[#b98df0] rounded-[24px] shadow-lg border border-transparent"
          />
        </div>
      </div>
    );
  },
};

// Mock Dataset for interactive lists
const initialMails = [
  {
    id: "1",
    author: "Karimi, Mohammad",
    time: "2 min",
    subject: "Bonjour de Paris",
    preview: "I got my film developed from your visit...",
    avatar: "https://i.pravatar.cc/150?u=karimi",
  },
  {
    id: "2",
    author: "Ziad",
    time: "5 min",
    subject: "Volunteer EMT with me?",
    preview: "What do you think about training to be volunteer...",
    avatar: "https://i.pravatar.cc/150?u=ziad",
  },
  {
    id: "3",
    author: "Reza, Fabian",
    time: "10:32 AM",
    subject: "Package shipped",
    preview: "Hi Ping! Just wanted to let you know that your...",
    avatar: "https://i.pravatar.cc/150?u=reza",
  },
];

// --- 1. TYPE 1: TRIGGER ACTION & SPRING BACK ---
export const SwipeTriggerAction: Story = {
  name: "8. Swipe to Trigger (Gmail Style)",
  parameters: {
    docs: {
      description: {
        story:
          "Type 1: Swiping triggers an immediate action and springs back fully to center without persisting open.",
      },
    },
  },
  render: () => (
    <div className="w-[400px] border border-outline-variant bg-surface-container rounded-2xl overflow-hidden shadow-md">
      <Toaster />
      <div className="p-4 bg-white border-b border-gray-100">
        <Typography variant="title-small" className="text-black">
          Starred items
        </Typography>
      </div>
      <Item
        swipeType="trigger"
        swipeRightContent={
          <div className="flex w-full h-full items-center justify-start bg-[#fdbaf0] px-8">
            <Star className="text-[#8e256b] h-6 w-6" strokeWidth={2} />
          </div>
        }
        onSwipeRight={() => toast("Conversation starred!")}
        className="cursor-pointer bg-white"
      >
        <ItemMedia variant="avatar">
          <Avatar src="https://i.pravatar.cc/150?u=karimi" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="text-black font-semibold">
            Karimi, Mohammad
          </ItemTitle>
          <ItemDescription className="text-gray-500">
            Swipe right on me to star instantly.
          </ItemDescription>
        </ItemContent>
      </Item>
    </div>
  ),
};

// --- 2. TYPE 2: DISMISS & ANIMATE HEIGHT TO 0 ---
export const SwipeToDismiss: Story = {
  name: "9. Swipe to Dismiss (Delete Style)",
  parameters: {
    docs: {
      description: {
        story:
          "Type 2: Swiping past the threshold triggers an off-screen exit animation followed by a layout collapse (height to 0).",
      },
    },
  },
  render: () => {
    const [mails, setMails] = useState(initialMails);

    const handleDismiss = (id: string) => {
      toast.error("Conversation archived");
      setTimeout(() => {
        setMails((prev) => prev.filter((m) => m.id !== id));
      }, 300);
    };

    return (
      <div className="w-[400px] border border-outline-variant bg-[#f8f9fc] rounded-2xl overflow-hidden shadow-md">
        <Toaster />
        <div className="p-4 bg-white border-b border-gray-100">
          <Typography variant="title-small" className="text-black">
            Archivable Inbox
          </Typography>
        </div>
        <ItemGroup gap="none" shape="sharp">
          {mails.map((mail) => (
            <Item
              key={mail.id}
              swipeType="dismiss"
              swipeRightContent={
                <div className="flex w-full h-full items-center justify-start bg-red-500 px-8 text-white">
                  <Trash2 className="h-6 w-6" />
                </div>
              }
              onSwipeRight={() => handleDismiss(mail.id)}
              className="bg-white border-b border-gray-100 last:border-0 cursor-pointer"
            >
              <ItemMedia variant="avatar">
                <Avatar src={mail.avatar} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="text-black">{mail.author}</ItemTitle>
                <ItemDescription className="text-gray-500 truncate">
                  {mail.subject}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </div>
    );
  },
};

// --- 3. TYPE 3: PARTIAL SWIPE TO REVEAL DRAWER ---
export const SwipeToRevealActions: Story = {
  name: "10. Swipe to Reveal (iOS Actions Style)",
  parameters: {
    docs: {
      description: {
        story:
          "Type 3: Swiping partially reveals persistent click targets underneath. Closes automatically when an option is clicked or on tap.",
      },
    },
  },
  render: () => {
    const [isPinned, setIsPinned] = useState(false);

    return (
      <div className="w-[420px] border border-outline-variant bg-[#f8f9fc] rounded-2xl overflow-hidden shadow-md">
        <Toaster />
        <div className="p-4 bg-white border-b border-gray-100">
          <Typography variant="title-small" className="text-black">
            Actionable List
          </Typography>
        </div>
        <Item
          swipeType="reveal"
          swipeLeftOffset={140} // Custom open offset width
          swipeLeftContent={
            <div className="flex h-full items-center justify-end z-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPinned(!isPinned);
                  toast(isPinned ? "Unpinned item" : "Pinned item");
                }}
                className="w-[70px] h-full flex flex-col gap-1 items-center justify-center bg-blue-500 text-white text-xs font-semibold"
              >
                <Pin className="h-4 w-4" />
                <span>{isPinned ? "Unpin" : "Pin"}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast.error("Item Deleted");
                }}
                className="w-[70px] h-full flex flex-col gap-1 items-center justify-center bg-red-500 text-white text-xs font-semibold"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          }
          className="bg-white cursor-pointer"
        >
          <ItemMedia variant="avatar">
            <Avatar src="https://i.pravatar.cc/150?u=ziad" />
          </ItemMedia>
          <ItemContent>
            <div className="flex items-center gap-2">
              <ItemTitle className="text-black">Swipe Left On Me</ItemTitle>
              {isPinned && (
                <Pin className="h-3.5 w-3.5 text-blue-500 rotate-45" />
              )}
            </div>
            <ItemDescription className="text-gray-500">
              Drag left to reveal custom action buttons.
            </ItemDescription>
          </ItemContent>
        </Item>
      </div>
    );
  },
};
