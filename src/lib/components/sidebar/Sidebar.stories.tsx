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

// --- TYPE FIX: Combine props for Storybook controls ---
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

const meta: Meta<StoryProps> = {
  title: "Components/Navigators/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A highly responsive and animated navigation sidebar. It functions as a permanent or collapsible rail on desktop, and a modal or push-style drawer on mobile. Integrates with any routing library via `activeItem` and `onItemPress` props.",
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
    elasticity: {
      control: "boolean",
      table: { category: "Elastic Scroll Props" },
    },
    pullToRefresh: {
      control: "boolean",
      table: { category: "Elastic Scroll Props" },
    },
    onRefresh: {
      action: "refreshed",
      table: { category: "Elastic Scroll Props" },
    },
    scrollbarVisibility: {
      control: "select",
      options: ["auto", "always", "scroll", "hidden"],
      table: { category: "Elastic Scroll Props" },
    },
  },
};

export default meta;
type Story = StoryObj<StoryProps>;

// --- Helper Components for Stories ---

const navItems = [
  { key: "inbox", label: "Inbox", icon: <Inbox size={20} />, count: 24 },
  { key: "sent", label: "Sent", icon: <Send size={20} /> },
  { key: "favorites", label: "Favorites", icon: <Star size={20} /> },
  { key: "drafts", label: "Drafts", icon: <File size={20} /> },
  { key: "archive", label: "Archive", icon: <Archive size={20} /> },
  { key: "trash", label: "Trash", icon: <Trash2 size={20} /> },
  { key: "spam", label: "Spam", icon: <File size={20} /> },
  { key: "all_mail", label: "All Mail", icon: <File size={20} /> },
  { key: "important", label: "Important", icon: <File size={20} /> },
  { key: "social", label: "Social", icon: <File size={20} /> },
  { key: "promotions", label: "Promotions", icon: <File size={20} /> },
  { key: "forums", label: "Forums", icon: <File size={20} /> },
];

const labelItems = [
  { key: "work", label: "Work" },
  { key: "personal", label: "Personal" },
  { key: "urgent", label: "Urgent" },
];

const CustomSidebarHeader = () => {
  const { isDesktop, collapsible, toggle, side } = useSidebar();
  return (
    <Sidebar.Header className={side === "right" ? "flex-row-reverse" : ""}>
      {isDesktop && collapsible && (
        <IconButton variant="ghost" size="sm" onClick={toggle}>
          <Menu />
        </IconButton>
      )}
    </Sidebar.Header>
  );
};

const SidebarContents = ({
  shape = "full",
  ...scrollProps
}: { shape?: "full" | "minimal" | "sharp" } & Partial<
  React.ComponentProps<typeof Sidebar.Nav>
>) => (
  <>
    <CustomSidebarHeader />
    <Sidebar.PrimaryAction icon={<Pencil size={24} />} shape={shape}>
      Compose
    </Sidebar.PrimaryAction>
    <Sidebar.Nav shape={shape} {...scrollProps}>
      {navItems.map((item) => (
        <Sidebar.Item
          key={item.key}
          itemKey={item.key}
          icon={item.icon}
          endAdornment={
            item.count ? (
              <Badge
                shape="full"
                variant={item.count > 0 ? "secondary" : undefined}
              >
                {item.count}
              </Badge>
            ) : null
          }
        >
          {item.label}
        </Sidebar.Item>
      ))}
      <Sidebar.Separator />
      <Sidebar.SectionHeader>Labels</Sidebar.SectionHeader>
      {labelItems.map((item) => (
        <Sidebar.Item
          key={item.key}
          itemKey={item.key}
          icon={<File size={20} />}
        >
          {item.label}
        </Sidebar.Item>
      ))}
    </Sidebar.Nav>
    <Sidebar.Footer>
      <Sidebar.Item itemKey="profile" icon={<User size={20} />} shape={shape}>
        Profile
      </Sidebar.Item>
      <Sidebar.Item
        itemKey="settings"
        icon={<Settings size={20} />}
        shape={shape}
      >
        Settings
      </Sidebar.Item>
    </Sidebar.Footer>
  </>
);

const MainContent = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { path } = useRouter();
  const { isDesktop } = useSidebar();
  const item =
    [...navItems, ...labelItems].find((i) => i.key === path.substring(1)) ||
    navItems[0];

  return (
    <div className="p-6">
      <Sidebar.DragHandle />
      {!isDesktop && (
        <IconButton
          variant="primary"
          aria-label="Open Menu"
          onClick={onMenuClick}
        >
          <Menu />
        </IconButton>
      )}
      <Typography variant="h1" className="mt-4 capitalize">
        {item?.label || "Inbox"}
      </Typography>
      <Typography variant="lead">
        This is the main content area for the selected page.
      </Typography>
    </div>
  );
};

const RenderWithRouter = (args: StoryProps) => {
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
        <SidebarContents
          shape={args.shape}
          elasticity={args.elasticity}
          pullToRefresh={args.pullToRefresh}
          onRefresh={args.onRefresh}
          scrollbarVisibility={args.scrollbarVisibility}
        />
      </Sidebar.Container>
      <Sidebar.Content>
        <MainContent onMenuClick={() => setIsOpen(!isOpen)} />
      </Sidebar.Content>
    </Sidebar>
  );
};

// --- STORIES ---

export const DesktopExpanded: Story = {
  name: "1. Desktop (Expanded & Collapsible)",
  args: {
    desktopVariant: "permanent",
    collapsible: true,
    defaultOpen: true,
  },
  render: (args) => (
    <ShallowRouter>
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};

const simulateRefresh = () =>
  new Promise((resolve) => setTimeout(resolve, 2000));

export const ScrollableAndRefreshable: Story = {
  name: "2. Scrollable & Refreshable Nav",
  args: {
    ...DesktopExpanded.args,
    defaultOpen: true,
    elasticity: true,
    pullToRefresh: true,
    onRefresh: simulateRefresh,
    scrollbarVisibility: "auto",
  },
  render: (args) => (
    <ShallowRouter>
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};

export const DesktopCollapsed: Story = {
  name: "3. Desktop (Collapsed by Default)",
  args: {
    ...DesktopExpanded.args,
    defaultOpen: false,
  },
  render: (args) => (
    <ShallowRouter>
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};

export const MobileModal: Story = {
  name: "4. Mobile (Modal Drawer)",
  args: {
    mobileVariant: "modal",
    side: "left",
    defaultOpen: false,
    elasticity: true,
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: (args) => (
    <ShallowRouter>
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};

export const MobilePush: Story = {
  name: "5. Mobile (Push Drawer)",
  args: {
    mobileVariant: "push",
    side: "left",
    defaultOpen: false,
    elasticity: true,
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: (args) => (
    <ShallowRouter>
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};

export const VariantsAndShapes: Story = {
  name: "6. Variants and Shapes",
  args: {
    ...DesktopExpanded.args,
    variant: "primary",
    shape: "minimal",
  },
  render: (args) => (
    <ShallowRouter>
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};

export const CustomWidths: Story = {
  name: "7. Custom Widths",
  args: {
    ...DesktopExpanded.args,
    expandedWidth: 350,
    collapsedWidth: 100,
  },
  render: (args) => (
    <ShallowRouter>
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};

// ... Full App Layout story remains a great example ...
const AppLayoutContent = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { path } = useRouter();
  const item =
    [...navItems, ...labelItems].find((i) => i.key === path.substring(1)) ||
    navItems[0];

  const pageTitle = item?.label || "Inbox";

  return (
    <div className="flex h-full flex-col bg-graphite-background">
      <AppBar
        size="lg"
        largeHeaderRowHeight={50}
        scrollBehavior="conditionally-sticky"
        appBarColor="background"
        animatedBehavior={["shadow"]}
        scrollContainerRef={scrollRef}
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
          <Typography variant="h4" className="truncate font-bold">
            {pageTitle}
          </Typography>
        }
        largeHeaderContent={
          <Input
            variant="secondary"
            shape="full"
            startAdornment={<Search className="h-5 w-5 text-gray-500" />}
            placeholder="Search..."
          />
        }
      />
      <Sidebar.DragHandle />

      <ElasticScrollArea ref={scrollRef} className="flex-1">
        <main className="p-6 ">
          <Typography variant="h3" className="mb-4 pt-[100px]">
            Content for {pageTitle}
          </Typography>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: Static demo content
                key={i}
                className="h-48 rounded-2xl bg-black/5 flex items-center justify-center"
              >
                <Typography
                  variant="small"
                  className="text-graphite-foreground/50"
                >
                  Item {i + 1}
                </Typography>
              </div>
            ))}
          </div>
        </main>
      </ElasticScrollArea>
    </div>
  );
};

const FullAppLayoutRenderer = (args: StoryProps) => {
  const { path, push } = useRouter();
  const activeItem = path === "/" ? "inbox" : path.substring(1);
  const [isOpen, setIsOpen] = useState(args.defaultOpen ?? true);

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
        <AppLayoutContent onMenuClick={() => setIsOpen(!isOpen)} />
      </Sidebar.Content>
    </Sidebar>
  );
};

export const FullAppLayout: Story = {
  name: "8. Full App Layout",
  args: {
    ...DesktopExpanded.args,
    mobileVariant: "push",
  },
  render: (args) => (
    <ShallowRouter>
      <FullAppLayoutRenderer {...args} />
    </ShallowRouter>
  ),
};
