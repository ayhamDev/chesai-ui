import type { Meta, StoryObj } from "@storybook/react";
import {
  Cloud,
  CreditCard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Sheet } from "../sheet";
import { Button } from "../button";
import { Card } from "../card";
import { Flex } from "../layouts";
import { Typography } from "../typography";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./index";

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    overlayBlur: {
      control: "select",
      options: ["none", "xs", "sm", "md", "lg", "xl"],
      description:
        "Backdrop blur: none, 2, 4, 8, 16 or 24px. Requires overlay.",
    },
    overlay: {
      control: "boolean",
      description:
        "Dim the page behind the menu without changing its position.",
    },
    overlayClassName: {
      control: "text",
      description: "Customize the backdrop color or blur.",
    },
    bordered: {
      control: "boolean",
      description: "Show the popup outer border (off by default).",
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  name: "1. Basic Usage",
  args: {
    shape: "minimal",
    glass: true,
  },
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button>Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Billing</span>
          <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Cloud className="mr-2 h-4 w-4" />
          <span>API (Disabled)</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// New story to showcase shapes
export const AllShapes: Story = {
  name: "2. All Shapes",
  render: () => (
    <div className="flex items-center gap-4">
      <DropdownMenu shape="full">
        <DropdownMenuTrigger asChild>
          <Button>Full</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu shape="minimal">
        <DropdownMenuTrigger asChild>
          <Button>Minimal</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu shape="sharp">
        <DropdownMenuTrigger asChild>
          <Button>Sharp</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

export const WithGroupsAndLabels: Story = {
  name: "3. Groups & Labels",
  args: {
    shape: "minimal",
  },
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Open Grouped Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Users className="mr-2 h-4 w-4" />
            <span>Team</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <UserPlus className="mr-2 h-4 w-4" />
            <span>Invite users</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LifeBuoy className="mr-2 h-4 w-4" />
          <span>Support</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithCheckboxes: Story = {
  name: "4. Checkbox Items",
  args: {
    shape: "minimal",
  },
  render: (args) => {
    const [showStatusBar, setShowStatusBar] = useState(true);
    const [showActivityBar, setShowActivityBar] = useState(false);
    return (
      <DropdownMenu {...args}>
        <DropdownMenuTrigger asChild>
          <Button>View Options</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Panel Visibility</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={showStatusBar}
            onCheckedChange={setShowStatusBar}
          >
            Status Bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showActivityBar}
            onCheckedChange={setShowActivityBar}
          >
            Activity Bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem disabled>Panel</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const WithRadioGroup: Story = {
  name: "5. Radio Group Items",
  args: {
    shape: "minimal",
  },
  render: (args) => {
    const [position, setPosition] = useState("bottom");
    return (
      <DropdownMenu {...args}>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">Set Position</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
            <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const WithSubMenu: Story = {
  name: "6. Sub-Menus",
  args: {
    shape: "minimal",
  },
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button>Open With Sub-Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem>
          <Mail className="mr-2 h-4 w-4" />
          <span>Email</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>Message</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <UserPlus className="mr-2 h-4 w-4" />
            <span>Invite</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem>
                <Plus className="mr-2 h-4 w-4" />
                <span>New User</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>New Team</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>More...</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithOverlay: Story = {
  name: "With Overlay",
  args: { overlay: true, overlayBlur: "xs", shape: "minimal" },
  render: (args) => {
    const [action, setAction] = useState("No action selected");
    return (
      <Flex
        direction="column"
        gap="lg"
        className="w-[min(85vw,440px)] p-4 text-on-surface"
      >
        <Flex align="center" justify="between">
          <Typography variant="headline-small">Messages</Typography>
          <DropdownMenu {...args}>
            <DropdownMenuTrigger asChild>
              <Button size="sm">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem onSelect={() => setAction("New chat selected")}>
                <MessageSquare aria-hidden="true" />
                New chat
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setAction("New contact selected")}
              >
                <UserPlus aria-hidden="true" />
                New contact
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setAction("New community selected")}
              >
                <Users aria-hidden="true" />
                New community
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Flex>
        <Typography variant="body-medium" className="text-on-surface-variant">
          The menu stays anchored to its trigger. Click the dimmed background or
          press Escape to dismiss it.
        </Typography>
        <Card variant="surface-container-low" bordered>
          <Flex direction="column" gap="lg">
            <Flex direction="column" gap="xs">
              <Typography variant="title-small">Design team</Typography>
              <Typography variant="body-small">
                The updated mockups are ready for review.
              </Typography>
            </Flex>
            <Flex direction="column" gap="xs">
              <Typography variant="title-small">Project updates</Typography>
              <Typography variant="body-small">
                Your next milestone is coming up.
              </Typography>
            </Flex>
            <Flex direction="column" gap="xs">
              <Typography variant="title-small">Community</Typography>
              <Typography variant="body-small">
                Welcome to the conversation.
              </Typography>
            </Flex>
          </Flex>
        </Card>
        <Typography variant="body-small" role="status">
          {action}
        </Typography>
      </Flex>
    );
  },
};

export const CustomOverlay: Story = {
  ...WithOverlay,
  name: "Custom Overlay",
  args: {
    overlay: true,
    overlayClassName: "bg-black/50 backdrop-blur-none",
    shape: "full",
  },
};

export const BlurSizes: Story = {
  name: "Overlay Blur Sizes",
  render: () => (
    <Flex direction="column" gap="lg" className="max-w-xl p-6 text-on-surface">
      <Typography variant="headline-small">Overlay blur</Typography>
      <Typography variant="body-medium">
        Open a menu to compare the background blur. Keyboard navigation shows a
        focus outline; hovering highlights the item without an outline.
      </Typography>
      <Flex gap="sm" wrap="wrap">
        {(["none", "xs", "sm", "md", "lg", "xl"] as const).map((blur) => (
          <DropdownMenu key={blur} overlay overlayBlur={blur}>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">{blur}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <MessageSquare aria-hidden="true" />
                New chat
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserPlus aria-hidden="true" />
                New contact
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users aria-hidden="true" />
                New community
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </Flex>
      <Card variant="surface-container-low" bordered>
        <Flex direction="column" gap="sm">
          <Typography variant="title-medium">Background content</Typography>
          <Typography variant="body-medium">
            The larger the blur size, the softer this text becomes behind the
            open menu.
          </Typography>
        </Flex>
      </Card>
    </Flex>
  ),
};


export const OpenSheet: Story = {
  name: 'Menu to sheet handoff',
  render: () => <MenuSheetHandoff />,
};
function MenuSheetHandoff() {
  const [open, setOpen] = useState(false);
  const [clicks, setClicks] = useState(0);
  return <Flex direction="column" gap="lg" disableAnimatePresence>
    <Typography variant="headline-small">Menu to sheet</Typography>
    <DropdownMenu overlay overlayBlur="sm">
      <DropdownMenuTrigger asChild><Button>Actions</Button></DropdownMenuTrigger>
      <DropdownMenuContent><DropdownMenuItem onSelect={() => setOpen(true)}>Open details</DropdownMenuItem></DropdownMenuContent>
    </DropdownMenu>
    <Button variant="outline" onClick={() => setClicks(value => value + 1)}>Page action: {clicks}</Button>
    <Sheet open={open} onOpenChange={setOpen} overlayBlur="sm">
      <Sheet.Content aria-describedby={undefined}>
        <Sheet.Header><Sheet.Title>Details</Sheet.Title></Sheet.Header>
        <Flex className="p-6" direction="column" disableAnimatePresence>
          <Typography>Close this sheet, then try the page action or open the menu again.</Typography>
          <Sheet.Close asChild><Button>Close details</Button></Sheet.Close>
        </Flex>
      </Sheet.Content>
    </Sheet>
  </Flex>;
}
