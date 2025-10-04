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
import { useRef, useState } from "react";
import { AppBar } from "../appbar";
import { Badge } from "../badge";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { IconButton } from "../icon-button";
import { Input } from "../input";
import { ShallowRouter, useRouter } from "../shallow-router";
import { Typography } from "../typography";
import { Sidebar, useSidebar } from "./index";

const meta: Meta<typeof Sidebar> = {
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
    activeItem: { control: false },
    onItemPress: { action: "itemPressed" },
    isOpen: { control: false },
    onOpenChange: { action: "openChange" },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

// --- Helper Components for Stories ---

const navItems = [
  { key: "inbox", label: "Inbox", icon: <Inbox size={20} />, count: 24 },
  { key: "sent", label: "Sent", icon: <Send size={20} /> },
  { key: "favorites", label: "Favorites", icon: <Star size={20} /> },
  { key: "drafts", label: "Drafts", icon: <File size={20} /> },
  { key: "archive", label: "Archive", icon: <Archive size={20} /> },
  { key: "trash", label: "Trash", icon: <Trash2 size={20} /> },
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
      {/* You can add a logo or title here */}
    </Sidebar.Header>
  );
};

const SidebarContents = () => (
  <>
    <CustomSidebarHeader />
    <Sidebar.PrimaryAction icon={<Pencil size={24} />}>
      Compose
    </Sidebar.PrimaryAction>
    <Sidebar.Nav>
      {navItems.map((item) => (
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
      <Sidebar.Item itemKey="profile" icon={<User size={20} />}>
        Profile
      </Sidebar.Item>
      <Sidebar.Item itemKey="settings" icon={<Settings size={20} />}>
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

const RenderWithRouter = (args: any) => {
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
      <Sidebar.Container>
        <SidebarContents />
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

export const DesktopCollapsed: Story = {
  name: "2. Desktop (Collapsed by Default)",
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
  name: "3. Mobile (Modal Drawer)",
  args: {
    mobileVariant: "modal",
    side: "left",
    defaultOpen: false,
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
  name: "4. Mobile (Push Drawer)",
  args: {
    mobileVariant: "push",
    side: "left",
    defaultOpen: false,
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "The 'push' variant moves the main content aside to reveal the sidebar, creating a different spatial relationship.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter>
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};

export const RightSide: Story = {
  name: "5. Right Side Variant",
  args: {
    ...DesktopExpanded.args,
    side: "right",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `side` prop works for all variants on both desktop and mobile.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter>
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};

export const ControlledState: Story = {
  name: "6. Controlled State",
  args: {
    ...DesktopExpanded.args,
  },
  render: function Render(args) {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <ShallowRouter>
        <div className="absolute top-4 right-4 z-10">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 bg-blue-500 text-white rounded-full"
          >
            Toggle Sidebar
          </button>
        </div>
        <RenderWithRouter {...args} isOpen={isOpen} onOpenChange={setIsOpen} />
      </ShallowRouter>
    );
  },
};

const shortNavItems = [
  { key: "inbox", label: "Inbox", icon: <Inbox size={20} /> },
  { key: "sent", label: "Sent", icon: <Send size={20} /> },
  { key: "favorites", label: "Favorites", icon: <Star size={20} /> },
];

export const ItemVariants: Story = {
  name: "7. Item Variants (Size & Shape)",
  args: {
    ...DesktopExpanded.args,
    defaultOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `size` and `shape` of `Sidebar.Item` components can be controlled by props on the parent `<Sidebar.Nav>`. Props on an individual item will override the parent.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter>
      <Sidebar
        {...args}
        activeItem="inbox"
        onItemPress={() => {}}
        isOpen={args.isOpen}
        onOpenChange={args.onOpenChange}
      >
        <Sidebar.Container>
          <CustomSidebarHeader />
          <Sidebar.SectionHeader>Small, Minimal</Sidebar.SectionHeader>
          <Sidebar.Nav size="sm" shape="minimal">
            {shortNavItems.map((item) => (
              <Sidebar.Item key={item.key} itemKey={item.key} icon={item.icon}>
                {item.label}
              </Sidebar.Item>
            ))}
          </Sidebar.Nav>
          <Sidebar.Separator />
          <Sidebar.SectionHeader>Large, Sharp</Sidebar.SectionHeader>
          <Sidebar.Nav size="lg" shape="sharp">
            {shortNavItems.map((item) => (
              <Sidebar.Item key={item.key} itemKey={item.key} icon={item.icon}>
                {item.label}
              </Sidebar.Item>
            ))}
            <Sidebar.Item
              itemKey="override"
              icon={<Archive size={20} />}
              shape="full"
            >
              Override
            </Sidebar.Item>
          </Sidebar.Nav>
        </Sidebar.Container>
        <Sidebar.Content>
          <div className="p-6">
            <Typography variant="h1">Item Variants</Typography>
            <Typography variant="p">
              The sidebar on the left demonstrates different sizes and shapes
              for navigation items.
            </Typography>
          </div>
        </Sidebar.Content>
      </Sidebar>
    </ShallowRouter>
  ),
};

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

const FullAppLayoutRenderer = (args: any) => {
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
      <Sidebar.Container>
        <SidebarContents />
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
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates a complete application layout, integrating `Sidebar` with a large, collapsible `AppBar` and a scrollable content area powered by `ElasticScrollArea`. The key is passing the `scrollRef` from the scroll area to the `AppBar` to synchronize their behavior.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter>
      <FullAppLayoutRenderer {...args} />
    </ShallowRouter>
  ),
};
