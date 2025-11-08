import type { Meta, StoryObj } from "@storybook/react";
import {
  Archive,
  File,
  Inbox,
  Menu,
  Pencil,
  Search,
  Send,
  Settings,
  Star,
  Trash2,
  User,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { AppBar } from "../appbar";
import { Badge } from "../badge";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { IconButton } from "../icon-button";
import { Input } from "../input";
import { ShallowRouter, useRouter } from "../shallow-router";
import { Typography } from "../typography";
import { Sidebar, useSidebar } from "./index";

// --- TYPE DEFINITION FOR STORY PROPS ---
type StoryProps = React.ComponentProps<typeof Sidebar> &
  Pick<React.ComponentProps<typeof Sidebar.Container>, "variant"> &
  Pick<
    React.ComponentProps<typeof Sidebar.Nav>,
    | "shape"
    | "elasticity"
    | "pullToRefresh"
    | "onRefresh"
    | "scrollbarVisibility"
  >;

// --- STORYBOOK META CONFIGURATION ---
const meta: Meta<StoryProps> = {
  title: "Components/Navigators/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A highly responsive and animated navigation sidebar, inspired by modern native applications. It functions as a permanent or collapsible rail on desktop, and a modal or push-style drawer on mobile. It integrates with any routing library via `activeItem` and `onItemPress` props.",
      },
    },
  },
  argTypes: {
    desktopVariant: {
      control: "select",
      options: ["permanent", "modal"],
      description: "Behavior on desktop viewports.",
    },
    mobileVariant: {
      control: "select",
      options: ["modal", "push"],
      description: "Behavior on mobile viewports.",
    },
    side: {
      control: "select",
      options: ["left", "right"],
      description: "Which side the sidebar appears on.",
    },
    collapsible: {
      control: "boolean",
      description: "Whether the sidebar can be collapsed on desktop.",
    },
    defaultOpen: {
      control: "boolean",
      description: "Initial open state for uncontrolled components.",
    },
    variant: {
      control: "select",
      options: ["primary", "secondary", "card"],
      description: "The color scheme of the sidebar.",
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "The border-radius of the navigation items.",
    },
    expandedWidth: {
      control: { type: "number", min: 200, max: 500, step: 10 },
      description: "The width of the sidebar when expanded.",
    },
    collapsedWidth: {
      control: { type: "number", min: 50, max: 150, step: 5 },
      description: "The width of the sidebar when collapsed (on desktop).",
    },
    activeItem: { control: false },
    onItemPress: { action: "itemPressed" },
    isOpen: { control: false },
    onOpenChange: { action: "openChange" },
  },
};

export default meta;
type Story = StoryObj<StoryProps>;

// --- HELPER COMPONENTS AND DATA ---

const navItems = {
  main: [
    { key: "inbox", label: "Inbox", icon: <Inbox size={20} />, count: 24 },
    { key: "sent", label: "Sent", icon: <Send size={20} /> },
    { key: "favorites", label: "Favorites", icon: <Star size={20} /> },
    { key: "drafts", label: "Drafts", icon: <File size={20} /> },
  ],
  secondary: [
    { key: "archive", label: "Archive", icon: <Archive size={20} /> },
    { key: "trash", label: "Trash", icon: <Trash2 size={20} /> },
  ],
  footer: [
    { key: "profile", label: "Profile", icon: <User size={20} /> },
    { key: "settings", label: "Settings", icon: <Settings size={20} /> },
  ],
};

const SidebarContents = ({ shape = "minimal" }) => (
  <>
    <Sidebar.Header>
      <Typography variant="h4" className="p-4">
        Mailbox
      </Typography>
    </Sidebar.Header>
    <Sidebar.PrimaryAction icon={<Pencil size={24} />} shape={shape}>
      Compose
    </Sidebar.PrimaryAction>
    <Sidebar.Nav shape={shape}>
      {navItems.main.map((item) => (
        <Sidebar.Item
          key={item.key}
          itemKey={item.key}
          icon={item.icon}
          endAdornment={
            item.count ? (
              <Badge shape="full" variant="secondary">
                {item.count}
              </Badge>
            ) : null
          }
        >
          {item.label}
        </Sidebar.Item>
      ))}
      <Sidebar.Separator />
      <Sidebar.SectionHeader>Folders</Sidebar.SectionHeader>
      {navItems.secondary.map((item) => (
        <Sidebar.Item key={item.key} itemKey={item.key} icon={item.icon}>
          {item.label}
        </Sidebar.Item>
      ))}
    </Sidebar.Nav>
    <Sidebar.Footer>
      {navItems.footer.map((item) => (
        <Sidebar.Item key={item.key} itemKey={item.key} icon={item.icon}>
          {item.label}
        </Sidebar.Item>
      ))}
    </Sidebar.Footer>
  </>
);

const AppContent = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { path } = useRouter();
  const allItems = [
    ...navItems.main,
    ...navItems.secondary,
    ...navItems.footer,
  ];
  const item =
    allItems.find((i) => i.key === path.substring(1)) || navItems.main[0];

  return (
    <div className="flex h-full flex-col bg-graphite-background">
      <AppBar
        scrollContainerRef={scrollRef}
        size="lg"
        scrollBehavior="conditionally-sticky"
        appBarColor="background"
        animatedBehavior={["shadow"]}
        startAdornment={
          <IconButton
            variant="ghost"
            aria-label="Toggle Menu"
            onClick={onMenuClick}
          >
            <Menu />
          </IconButton>
        }
        children={
          <Typography variant="h4" className="truncate font-bold capitalize">
            {item.label}
          </Typography>
        }
        largeHeaderRowHeight={50}
        largeHeaderContent={
          <Input
            variant="secondary"
            shape="full"
            startAdornment={<Search className="h-5 w-5 text-gray-500" />}
            placeholder={`Search in ${item.label}...`}
          />
        }
      />
      <Sidebar.DragHandle />
      <ElasticScrollArea ref={scrollRef} className="flex-1 pt-[110px]">
        <main className="p-6">
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-black/5" />
            ))}
          </div>
        </main>
      </ElasticScrollArea>
    </div>
  );
};

// --- RENDER FUNCTION FOR STORIES ---
const RenderApp = (args: StoryProps) => {
  const { path, push } = useRouter();
  const activeItem = path === "/" ? "inbox" : path.substring(1);
  const [isOpen, setIsOpen] = useState(args.defaultOpen);

  return (
    <Sidebar
      {...args}
      activeItem={activeItem}
      onItemPress={(key) => push(`/${key}`)}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <Sidebar.Container variant={args.variant}>
        <SidebarContents shape={args.shape} />
      </Sidebar.Container>
      <Sidebar.Content>
        <AppContent onMenuClick={() => setIsOpen(!isOpen)} />
      </Sidebar.Content>
    </Sidebar>
  );
};

// --- STORIES ---

export const Playground: Story = {
  name: "1. Playground",
  args: {
    desktopVariant: "permanent",
    mobileVariant: "modal",
    side: "left",
    collapsible: true,
    defaultOpen: true,
    variant: "card",
    shape: "minimal",
    expandedWidth: 280,
    collapsedWidth: 80,
  },
  render: (args) => (
    <ShallowRouter>
      <RenderApp {...args} />
    </ShallowRouter>
  ),
};

export const DesktopPermanent: Story = {
  name: "2. Desktop (Permanent)",
  args: {
    ...Playground.args,
    collapsible: false,
    defaultOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "A common pattern for large-screen dashboards where the sidebar is always visible and cannot be collapsed. `collapsible` is set to `false`.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter>
      <RenderApp {...args} />
    </ShallowRouter>
  ),
};

export const MobileModal: Story = {
  name: "3. Mobile (Modal)",
  args: {
    ...Playground.args,
    mobileVariant: "modal",
    defaultOpen: false,
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "On mobile, `modal` is the default. The sidebar slides over the content with a scrim behind it. You can swipe from the edge to open or drag the sidebar itself to close.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter>
      <RenderApp {...args} />
    </ShallowRouter>
  ),
};

export const MobilePush: Story = {
  name: "4. Mobile (Push)",
  args: {
    ...Playground.args,
    mobileVariant: "push",
    defaultOpen: false,
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "The `push` variant slides the main content aside to reveal the sidebar. This creates a visually connected experience.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter>
      <RenderApp {...args} />
    </ShallowRouter>
  ),
};

export const ColorVariants: Story = {
  name: "5. Color Variants",
  render: () => (
    <div className="flex h-screen w-full items-stretch">
      <div className="w-1/3">
        <ShallowRouter>
          <RenderApp {...Playground.args} variant="card" defaultOpen={true} />
        </ShallowRouter>
      </div>
      <div className="w-1/3">
        <ShallowRouter>
          <RenderApp
            {...Playground.args}
            variant="secondary"
            defaultOpen={true}
          />
        </ShallowRouter>
      </div>
      <div className="w-1/3">
        <ShallowRouter>
          <RenderApp
            {...Playground.args}
            variant="primary"
            defaultOpen={true}
          />
        </ShallowRouter>
      </div>
    </div>
  ),
};

export const RightSide: Story = {
  name: "6. Right Side",
  args: {
    ...Playground.args,
    side: "right",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `side` prop can be set to `'right'`. This is useful for secondary navigation, inspector panels, or right-to-left language layouts.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter>
      <RenderApp {...args} />
    </ShallowRouter>
  ),
};
