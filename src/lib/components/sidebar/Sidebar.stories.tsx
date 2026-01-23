import type { Meta, StoryObj } from "@storybook/react";
import {
  Archive,
  Box,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  MessagesSquare,
  Plus,
  Search,
  Settings,
  Settings as SettingsIcon,
  ShoppingCart,
  User,
  Users,
} from "lucide-react";
import React from "react";
import { Accordion } from "../accordion";
import { AppBar } from "../appbar";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { Checkbox } from "../checkbox";
import { PaginatedCalendar } from "../date-picker/paginated-calendar";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { IconButton } from "../icon-button";
import { Input } from "../input";
import { Select } from "../select"; // FIX: Imported as Select
import { Separator } from "../separator";
import { Typography } from "../typography";
import { Sidebar, useSidebar } from "./index";
import { Button } from "../button";
import clsx from "clsx";
import { Divider } from "../divider";

// ... (Meta config matches original) ...
const meta: Meta<typeof Sidebar> = {
  title: "Components/Navigators/Sidebar",
  component: Sidebar,
  subcomponents: {
    "Sidebar.Header": Sidebar.Header,
    "Sidebar.Content": Sidebar.Content,
    "Sidebar.Footer": Sidebar.Footer,
    "Sidebar.Item": Sidebar.Item,
    "Sidebar.Trigger": Sidebar.Trigger,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    layout: {
      control: "select",
      options: ["sidebar", "floating", "inset"],
      description: "The structural layout of the sidebar.",
    },
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost"],
      description: "The visual theme/color of the sidebar.",
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "Border radius of the sidebar container.",
    },
    itemShape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "Border radius of the sidebar items.",
    },
    itemSize: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    expandOnHover: {
      control: "boolean",
      defaultValue: false,
    },
    overlay: {
      control: "boolean",
      defaultValue: false,
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-full bg-graphite-background flex">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

// ... (SidebarContentExample and default stories unchanged - omitting for brevity as they are correct) ...
const SidebarContentExample = ({
  elasticity = false,
}: {
  elasticity?: boolean;
}) => {
  const [active, setActive] = React.useState("inbox");
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <>
      <Sidebar.Header className="justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-graphite-primary text-graphite-primaryForeground">
            <Box className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <Typography variant="h4" className="truncate !text-base">
              Acme Corp
            </Typography>
          )}
        </div>
      </Sidebar.Header>
      <Sidebar.Content elasticity={elasticity}>
        <Sidebar.Group>
          <Sidebar.Item
            icon={<LayoutDashboard />}
            isActive={active === "dashboard"}
            onClick={() => setActive("dashboard")}
          >
            Dashboard
          </Sidebar.Item>
          <Sidebar.Item
            icon={<Inbox />}
            isActive={active === "inbox"}
            onClick={() => setActive("inbox")}
            badge={
              <Badge variant="primary" shape="full" className="px-1.5 h-5">
                12
              </Badge>
            }
          >
            Inbox
          </Sidebar.Item>
          <Sidebar.Item
            icon={<MessagesSquare />}
            isActive={active === "messages"}
            onClick={() => setActive("messages")}
          >
            Messages
          </Sidebar.Item>
        </Sidebar.Group>
        <Divider variant="dashed" />
        <Sidebar.Group>
          <Sidebar.Label>Management</Sidebar.Label>
          <Sidebar.Item
            icon={<Users />}
            isActive={active === "customers"}
            onClick={() => setActive("customers")}
          >
            Customers
          </Sidebar.Item>
          <Sidebar.Item
            icon={<ShoppingCart />}
            isActive={active === "orders"}
            onClick={() => setActive("orders")}
          >
            Orders
          </Sidebar.Item>
          <Sidebar.Item
            icon={<Archive />}
            isActive={active === "products"}
            onClick={() => setActive("products")}
          >
            Products
          </Sidebar.Item>
        </Sidebar.Group>
        {elasticity && (
          <Sidebar.Group>
            <Sidebar.Label>Archive</Sidebar.Label>
            {Array.from({ length: 15 }).map((_, i) => (
              <Sidebar.Item key={i} icon={<Box />} onClick={() => {}}>
                Archive Item {i + 1}
              </Sidebar.Item>
            ))}
          </Sidebar.Group>
        )}
      </Sidebar.Content>
      <Divider variant="dashed" />

      <Sidebar.Footer className="justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <Avatar
            size="sm"
            src="https://i.pravatar.cc/150?img=3"
            fallback="JD"
          />
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium">Jane Doe</span>
              <span className="text-xs text-graphite-foreground/60 truncate">
                jane@acme.com
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <IconButton variant="ghost" size="sm" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </IconButton>
        )}
      </Sidebar.Footer>
    </>
  );
};

export const Default: Story = {
  name: "1. Playground (All Props)",
  args: {
    layout: "inset",
    variant: "ghost",
    shape: "minimal",
    itemShape: "full",
    itemSize: "md",
    itemVariant: "primary",
    expandOnHover: true
  },
  render: (args) => (
    <Sidebar.Provider>
      <Sidebar {...args}>
        <SidebarContentExample />
      </Sidebar>
      <main className="flex-1 p-6 flex flex-col bg-graphite-background">
        <header className="h-16 border-b border-graphite-border flex items-center px-4 gap-4 bg-graphite-card rounded-xl mb-4">
          <Sidebar.Trigger />
          <Separator orientation="vertical" className="h-6" />
          <Typography variant="h4">Playground</Typography>
        </header>
        <div className="flex-1 flex items-center justify-center text-graphite-foreground/50">
          Adjust the controls in the panel to change the sidebar style.
        </div>
      </main>
    </Sidebar.Provider>
  ),
};

// ... (Other standard stories: SecondaryLarge, FloatingPill, DenseSharp, WhatsAppStyle, ScrollableWithElasticity omitted for brevity as they don't use Select) ...

// --- GOOGLE CALENDAR STORY (Uses SelectInput -> Select) ---
const CalSidebarContent = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const { state } = useSidebar();
  const myCalendars = [
    { id: "c1", label: "Ayham Gm", color: "bg-blue-500", checked: true },
    { id: "c2", label: "Birthdays", color: "bg-green-500", checked: true },
    { id: "c3", label: "Tasks", color: "bg-indigo-500", checked: true },
    { id: "c4", label: "Todoist", color: "bg-purple-500", checked: true },
  ];

  const otherCalendars = [
    {
      id: "o1",
      label: "Holidays in Sudan",
      color: "bg-green-600",
      checked: true,
    },
    {
      id: "o2",
      label: "MISK Launchpad 8.0",
      color: "bg-red-500",
      checked: true,
    },
    {
      id: "o3",
      label: "Phase 2 Schedule",
      color: "bg-orange-500",
      checked: false,
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-3 py-4">
      {/* Create Button */}
      <div className="px-1">
        <Button
          variant="secondary"
          className="h-12 w-32 !rounded-2xl shadow-sm hover:shadow-md transition-all bg-graphite-secondary border border-graphite-border"
        >
          <Plus className="mr-2 h-6 w-6" />
          <span className="text-base">Create</span>
        </Button>
      </div>

      {/* Mini Calendar */}
      <div className="px-1">
        <PaginatedCalendar
          mode="single"
          value={date}
          onSelect={(val) => setDate(val as Date)}
        />
      </div>

      {/* Search People */}
      <div className="px-1">
        <Input
          startContent={<User className="h-4 w-4 opacity-50" />} // UPDATED: startAdornment -> startContent
          placeholder="Search for people"
          variant="flat" // UPDATED: secondary -> flat for filled look
          shape="minimal"
          className="bg-graphite-secondary/50"
        />
      </div>

      {/* Calendars Accordion */}
      <Accordion
        type="multiple"
        defaultValue={["my-cals", "other-cals"]}
        className="w-full"
        shape="minimal"
      >
        <Accordion.Item value="my-cals" className="border-none">
          <Accordion.Trigger className="py-2 text-sm font-medium hover:bg-transparent">
            My calendars
          </Accordion.Trigger>
          <Accordion.Content className="pb-2">
            <div className="flex flex-col gap-2">
              {myCalendars.map((cal) => (
                <div key={cal.id} className="flex items-center gap-3 py-1">
                  <Checkbox
                    defaultChecked={cal.checked}
                    className={clsx(
                      "data-[state=checked]:border-transparent data-[state=checked]:text-white",
                      cal.color.replace("bg-", "checked:bg-"),
                    )}
                  />
                  <Typography variant="small" className="font-medium">
                    {cal.label}
                  </Typography>
                </div>
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="other-cals" className="border-none">
          <Accordion.Trigger className="py-2 text-sm font-medium hover:bg-transparent">
            Other calendars
          </Accordion.Trigger>
          <Accordion.Content className="pb-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3 py-1">
                  <Plus className="h-4 w-4 text-graphite-foreground/70" />
                  <Typography variant="small" className="font-medium">
                    Subscribe to calendar
                  </Typography>
                </div>
              </div>
              {otherCalendars.map((cal) => (
                <div key={cal.id} className="flex items-center gap-3 py-1">
                  <Checkbox
                    defaultChecked={cal.checked}
                    className={clsx(
                      "data-[state=checked]:border-transparent data-[state=checked]:text-white",
                      cal.color.replace("bg-", "checked:bg-"),
                    )}
                  />
                  <Typography variant="small" className="font-medium truncate">
                    {cal.label}
                  </Typography>
                </div>
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>

      <div className="mt-auto pt-4 text-xs text-graphite-foreground/50 px-2 text-center">
        Terms - Privacy - Policy
      </div>
    </div>
  );
};

const CalendarGrid = () => {
  // ... (Grid implementation remains same)
  return (
    <div className="flex flex-col min-w-[800px]">
      {/* ... grid layout ... */}
      <div className="flex-1 relative h-[600px] bg-graphite-background">
        {/* Placeholder grid lines */}
        <div className="absolute inset-0 grid grid-rows-12 divide-y divide-graphite-border/30">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const GoogleCalendarLayout: Story = {
  name: "Google Calendar Replica",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "A complete layout replication of Google Calendar (Dark Mode) using `Sidebar` for the left navigation, `AppBar` for the top toolbars, and `ElasticScrollArea` for the main grid content.",
      },
    },
  },
  render: () => (
    // Force dark theme wrapper for the replica
    (<div className="theme-dark bg-[#121212] text-[#e8eaed] h-screen w-full flex flex-col overflow-hidden font-sans">
      <Sidebar.Provider defaultOpen={true}>
        {/* --- Main Flex Container --- */}
        <div className="flex h-full w-full">
          {/* --- LEFT SIDEBAR --- */}
          <Sidebar
            layout="inset"
            variant="primary"
            className="border-r border-[#2E2E2E] !bg-[#121212]" // Manual override for exact GCal dark hex
            width="20rem"
          >
            <Sidebar.Content elasticity>
              <CalSidebarContent />
            </Sidebar.Content>
          </Sidebar>

          {/* --- CENTER CONTENT AREA --- */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#121212]">
            {/* --- TOP APP BAR --- */}
            <AppBar
              position="static" // Non-sticky for this layout
              appBarColor="background"
              className="!bg-[#121212] border-b border-[#2E2E2E] h-16 shrink-0 relative !top-auto"
              shadow="none"
              startAdornment={
                <div className="flex items-center gap-2 pl-2">
                  <div className="flex items-center gap-2 ml-1">
                    <CalendarIcon className="h-7 w-7 text-blue-500" />
                    <Typography
                      variant="h4"
                      className="text-[22px] text-white tracking-tight font-normal hidden sm:block"
                    >
                      Calendar
                    </Typography>
                  </div>
                </div>
              }
              centerAdornment={
                <div className="flex items-center gap-4 ml-8">
                  <Button
                    variant="secondary"
                    className="bg-transparent border border-[#5f6368] text-white hover:bg-[#2E2E2E] h-9 rounded px-4"
                  >
                    Today
                  </Button>
                  <div className="flex items-center gap-1">
                    <IconButton
                      size="sm"
                      variant="ghost"
                      className="hover:bg-[#2E2E2E] text-white"
                    >
                      <ChevronLeft />
                    </IconButton>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      className="hover:bg-[#2E2E2E] text-white"
                    >
                      <ChevronRight />
                    </IconButton>
                  </div>
                  <Typography
                    variant="h4"
                    className="text-xl text-white font-normal min-w-[140px]"
                  >
                    November 2025
                  </Typography>
                </div>
              }
              endAdornments={[
                <IconButton
                  key="search"
                  variant="ghost"
                  className="text-white hover:bg-[#2E2E2E]"
                >
                  <Search className="h-5 w-5" />
                </IconButton>,
                <IconButton
                  key="help"
                  variant="ghost"
                  className="text-white hover:bg-[#2E2E2E]"
                >
                  <HelpCircle className="h-5 w-5" />
                </IconButton>,
                <IconButton
                  key="settings"
                  variant="ghost"
                  className="text-white hover:bg-[#2E2E2E]"
                >
                  <SettingsIcon className="h-5 w-5" />
                </IconButton>,
                <div key="view-select" className="mx-2">
                  {/* UPDATED: SelectInput -> Select */}
                  <Select
                    size="sm"
                    variant="flat"
                    value="week"
                    // Override class to match GCal dark mode
                    className="!bg-transparent border border-[#5f6368] text-white w-24 h-9"
                    items={[
                      { value: "day", label: "Day" },
                      { value: "week", label: "Week" },
                      { value: "month", label: "Month" },
                      { value: "year", label: "Year" },
                    ]}
                  />
                </div>,
                <div key="avatar" className="pl-2">
                  <Avatar
                    size="sm"
                    src="https://github.com/shadcn.png"
                    className="ring-2 ring-[#121212]"
                  />
                </div>,
              ]}
            />

            {/* --- CALENDAR GRID SCROLL AREA --- */}
            <ElasticScrollArea
              className="flex-1"
              viewportClassName="!flex flex-col"
            >
              <CalendarGrid />
            </ElasticScrollArea>
          </div>

          {/* --- RIGHT TOOLS PANEL (Visual Only) --- */}
          <div className="w-14 border-l border-[#2E2E2E] flex flex-col items-center py-4 gap-6 shrink-0 bg-[#121212]">
            <IconButton
              size="sm"
              variant="ghost"
              className="hover:bg-[#2E2E2E]"
            >
              <div className="w-5 h-5 bg-yellow-500 rounded-sm" title="Keep" />
            </IconButton>
            <IconButton
              size="sm"
              variant="ghost"
              className="hover:bg-[#2E2E2E]"
            >
              <div className="w-5 h-5 bg-blue-500 rounded-full" title="Tasks" />
            </IconButton>
            <IconButton
              size="sm"
              variant="ghost"
              className="hover:bg-[#2E2E2E]"
            >
              <div
                className="w-5 h-5 bg-blue-400 rounded-sm"
                title="Contacts"
              />
            </IconButton>
            <div className="h-px w-8 bg-[#2E2E2E] my-2" />
            <IconButton
              size="sm"
              variant="ghost"
              className="hover:bg-[#2E2E2E]"
            >
              <Plus className="h-5 w-5 text-white" />
            </IconButton>
          </div>
        </div>
      </Sidebar.Provider>
    </div>)
  ),
};
