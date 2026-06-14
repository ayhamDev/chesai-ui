import type { Meta, StoryObj } from "@storybook/react";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Command as CmdIcon,
  Mic,
  Music,
  Pause,
  Plus,
  Search,
  Send,
  Settings,
  SkipBack,
  SkipForward,
  Sparkles,
  User,
  Volume2,
} from "lucide-react";

// Chesai Components
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { Button } from "../button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "../command";
import { DatePicker } from "../date-picker/date-picker";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { IconButton } from "../icon-button";
import { Input } from "../input";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../item";
import { Slider } from "../slider";
import { Tabs } from "../tabs";
import { Textarea } from "../textarea";
import { Typography } from "../typography";
import { FloatingPanel } from "./index";

const meta: Meta<typeof FloatingPanel> = {
  title: "Components/Navigators/FloatingPanel",
  component: FloatingPanel,
  subcomponents: {
    "FloatingPanel.Trigger": FloatingPanel.Trigger as any,
    "FloatingPanel.Content": FloatingPanel.Content as any,
    "FloatingPanel.CloseButton": FloatingPanel.CloseButton as any,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A highly optimized, layout-prop-free floating panel. It strictly morphs explicit dimensions (width & height) allowing for butter-smooth 60fps expansions that gracefully adapt background colors via CSS cross-fading. Perfect for contextual widgets, mini-players, and command palettes.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full h-[800px] bg-graphite-background relative overflow-hidden border border-outline-variant rounded-xl shadow-inner flex items-center justify-center">
        {/* Fake Dashboard Background for context */}
        <div className="absolute inset-0 opacity-20 pointer-events-none p-12">
          <div className="w-64 h-12 bg-surface-container-highest rounded-lg mb-8" />
          <div className="grid grid-cols-3 gap-6">
            <div className="h-48 bg-surface-container rounded-2xl" />
            <div className="h-48 bg-surface-container rounded-2xl" />
            <div className="h-48 bg-surface-container rounded-2xl" />
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FloatingPanel>;

// ==========================================
// 1. AI ASSISTANT WIDGET (Bottom Right)
// ==========================================
export const AIAssistant: Story = {
  name: "1. AI Copilot Widget",
  args: {
    position: "bottom-right",
    triggerVariant: "primary",
    panelVariant: "surface",
    triggerWidth: 64,
    triggerHeight: 64,
    panelWidth: 380,
    panelHeight: 550,
  },
  parameters: {
    docs: {
      description: {
        story:
          "A modern floating AI assistant combining `ElasticScrollArea`, `Typography`, and `Input` components. The panel grows seamlessly from a circular FAB into a full chat interface.",
      },
    },
  },
  render: (args) => (
    <FloatingPanel {...args}>
      <FloatingPanel.Trigger>
        <Sparkles size={26} className="text-on-primary" />
      </FloatingPanel.Trigger>

      <FloatingPanel.Content>
        {/* Header */}
        <div className="bg-primary px-5 py-4 flex items-center justify-between shadow-sm shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Sparkles size={20} className="text-on-primary" />
            </div>
            <div>
              <Typography
                variant="title-small"
                className="text-on-primary font-bold"
              >
                Chesai Copilot
              </Typography>
              <Typography variant="label-small" className="text-on-primary/80">
                Always here to help
              </Typography>
            </div>
          </div>
          <FloatingPanel.CloseButton className="text-on-primary hover:bg-white/20 relative top-0 right-0" />
        </div>

        {/* Chat Body */}
        <ElasticScrollArea className="flex-1 bg-surface-container-lowest p-4">
          <div className="flex flex-col gap-4 pb-4">
            <div className="flex gap-3 max-w-[85%]">
              <Avatar
                fallback={<Sparkles size={14} />}
                size="sm"
                className="bg-primary-container text-on-primary-container mt-1 shrink-0"
              />
              <div className="bg-surface-container p-3 rounded-2xl rounded-tl-sm">
                <Typography variant="body-small">
                  Hi! I'm your AI assistant. I can help you navigate the UI,
                  write code, or answer questions. What's on your mind?
                </Typography>
              </div>
            </div>

            <div className="flex gap-3 max-w-[85%] self-end flex-row-reverse">
              <Avatar
                src="https://i.pravatar.cc/150?u=user"
                size="sm"
                className="mt-1 shrink-0"
              />
              <div className="bg-primary text-on-primary p-3 rounded-2xl rounded-tr-sm">
                <Typography variant="body-small" className="text-inherit">
                  How do I implement a FloatingPanel in React?
                </Typography>
              </div>
            </div>

            <div className="flex gap-3 max-w-[85%]">
              <Avatar
                fallback={<Sparkles size={14} />}
                size="sm"
                className="bg-primary-container text-on-primary-container mt-1 shrink-0"
              />
              <div className="bg-surface-container p-3 rounded-2xl rounded-tl-sm flex flex-col gap-2">
                <Typography variant="body-small">
                  It's super easy! Just wrap your trigger and content inside the
                  component:
                </Typography>
                <div className="bg-inverse-surface text-inverse-on-surface p-2 rounded-lg font-mono text-[10px] overflow-x-auto">
                  {`<FloatingPanel>\n  <FloatingPanel.Trigger>\n    Open\n  </FloatingPanel.Trigger>\n  <FloatingPanel.Content>\n    Hello World\n  </FloatingPanel.Content>\n</FloatingPanel>`}
                </div>
              </div>
            </div>
          </div>
        </ElasticScrollArea>

        {/* Footer Input */}
        <div className="p-3 border-t border-outline-variant/30 bg-surface shrink-0 flex items-center gap-2 rounded-b-2xl">
          <Input
            variant="filled"
            placeholder="Ask me anything..."
            shape="full"
            className="flex-1"
            startContent={
              <Mic size={18} className="text-on-surface-variant/50" />
            }
          />
          <IconButton shape="full" variant="primary">
            <Send size={18} />
          </IconButton>
        </div>
      </FloatingPanel.Content>
    </FloatingPanel>
  ),
};

// ==========================================
// 2. RAYCAST / SPOTLIGHT CLONE (Top Center)
// ==========================================
export const SpotlightPalette: Story = {
  name: "2. Spotlight Command (Top Center)",
  args: {
    position: "top-center",
    offset: 64,
    triggerVariant: "surface",
    panelVariant: "surface",
    triggerWidth: 300,
    triggerHeight: 52,
    triggerRadius: 16,
    panelWidth: 600,
    panelHeight: 400,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Recreates the iconic macOS Spotlight or Raycast experience. Embeds the `Command` component natively inside the panel for seamless keyboard navigation and searching.",
      },
    },
  },
  render: (args) => (
    <FloatingPanel
      {...args}
      className="shadow-2xl ring-1 ring-black/5 dark:ring-white/5"
    >
      <FloatingPanel.Trigger className="px-4 border border-outline-variant/30 hover:border-outline-variant transition-colors shadow-sm justify-between">
        <div className="flex items-center gap-3 opacity-60">
          <Search size={18} />
          <span className="text-sm">Search apps, commands...</span>
        </div>
        <div className="flex items-center gap-1 opacity-50 font-mono text-xs">
          <span>⌘</span>
          <span>K</span>
        </div>
      </FloatingPanel.Trigger>

      <FloatingPanel.Content>
        {/* We use the Command component directly! */}
        <Command className="border-none rounded-2xl bg-transparent">
          <CommandInput
            placeholder="What do you want to do?"
            className="h-16 text-lg border-b border-outline-variant/20"
          />
          <CommandList className="max-h-[336px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <Calendar className="mr-3 h-5 w-5 opacity-70" />
                <span>Create Meeting</span>
              </CommandItem>
              <CommandItem>
                <User className="mr-3 h-5 w-5 opacity-70" />
                <span>Search Contacts</span>
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="System">
              <CommandItem>
                <Settings className="mr-3 h-5 w-5 opacity-70" />
                <span>System Preferences</span>
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <CmdIcon className="mr-3 h-5 w-5 opacity-70" />
                <span>Keyboard Shortcuts</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </FloatingPanel.Content>
    </FloatingPanel>
  ),
};

// ==========================================
// 3. DYNAMIC MINI-PLAYER (Bottom Left)
// ==========================================
export const MiniPlayer: Story = {
  name: "3. Music Mini-Player (Bottom Left)",
  args: {
    position: "bottom-left",
    triggerVariant: "ghost",
    panelVariant: "surface-lowest",
    triggerWidth: 72,
    triggerHeight: 72,
    triggerRadius: 24, // Squircle
    panelWidth: 320,
    panelHeight: 400,
  },
  parameters: {
    docs: {
      description: {
        story:
          "A dynamic media player. The collapsed state shows the album art, and expanding it reveals full playback controls featuring the `Slider` and `IconButton` components.",
      },
    },
  },
  render: (args) => (
    <FloatingPanel {...args} className="border border-outline-variant/20">
      <FloatingPanel.Trigger className="p-1">
        {/* Collapsed State: Album Art */}
        <div className="w-full h-full rounded-xl overflow-hidden relative group">
          <img
            src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300"
            className="w-full h-full object-cover"
            alt="Album Art"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Music className="text-white w-6 h-6" />
          </div>
        </div>
      </FloatingPanel.Trigger>

      <FloatingPanel.Content className="p-6">
        <FloatingPanel.CloseButton className="top-4 right-4 bg-surface-container hover:bg-surface-container-high" />

        <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg mb-6 mx-auto max-w-[200px]">
          <img
            src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500"
            className="w-full h-full object-cover"
            alt="Album Art"
          />
        </div>

        <div className="text-center mb-6">
          <Typography variant="title-medium" className="font-bold truncate">
            Lost in the Echoes
          </Typography>
          <Typography variant="body-small" className="text-primary font-medium">
            Synthwave Pioneers
          </Typography>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <Slider visual="bar" size="sm" defaultValue={[45]} shape="full" />
          <div className="flex justify-between text-[10px] font-mono opacity-50">
            <span>1:24</span>
            <span>3:45</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <IconButton variant="ghost" size="md">
            <SkipBack className="fill-current" />
          </IconButton>
          <IconButton
            variant="primary"
            size="lg"
            shape="full"
            className="shadow-lg hover:scale-105 transition-transform"
          >
            <Pause className="fill-current w-8 h-8" />
          </IconButton>
          <IconButton variant="ghost" size="md">
            <SkipForward className="fill-current" />
          </IconButton>
        </div>
      </FloatingPanel.Content>
    </FloatingPanel>
  ),
};

// ==========================================
// 4. QUICK TASK CREATOR (Center)
// ==========================================
export const QuickTaskCreator: Story = {
  name: "4. Quick Task Creator (Center)",
  args: {
    position: "center",
    triggerVariant: "primary",
    panelVariant: "surface-lowest",
    triggerWidth: 160,
    triggerHeight: 56,
    triggerRadius: 28, // Pill
    panelWidth: 450,
    panelHeight: 380,
  },
  parameters: {
    docs: {
      description: {
        story:
          "A centered modal alternative. Expanding the FAB reveals a complex form utilizing `Input`, `Textarea`, and `DatePicker` components, demonstrating form composition.",
      },
    },
  },
  render: (args) => (
    <FloatingPanel {...args} className="shadow-2xl">
      <FloatingPanel.Trigger>
        <div className="flex items-center gap-2">
          <Plus size={20} />
          <span className="font-bold">New Task</span>
        </div>
      </FloatingPanel.Trigger>

      <FloatingPanel.Content>
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 shrink-0">
          <Typography variant="title-medium" className="font-bold">
            Create Task
          </Typography>
          <FloatingPanel.CloseButton className="relative top-auto right-auto" />
        </div>

        <div className="p-6 flex flex-col gap-5 flex-1 overflow-y-auto">
          <Input
            variant="underlined"
            placeholder="Task Title"
            className="shadow-none px-0"
            classNames={{ input: "text-xl font-semibold" }}
            autoFocus
          />
          <Textarea
            variant="filled"
            placeholder="Add details, notes, or subtasks..."
            minRows={3}
          />
          <div className="flex items-center gap-4">
            <DatePicker
              variant="docked"
              inputVariant="outlined"
              placeholder="Due Date"
              shape="minimal"
            />
            <Badge
              variant="secondary"
              shape="minimal"
              className="h-14 px-4 border border-outline-variant/30 flex items-center justify-center cursor-pointer hover:bg-surface-container-highest"
            >
              <User size={16} className="mr-2 opacity-60" /> Assign
            </Badge>
          </div>
        </div>

        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest shrink-0 flex justify-end gap-3">
          <Button variant="primary" className="px-8">
            Create
          </Button>
        </div>
      </FloatingPanel.Content>
    </FloatingPanel>
  ),
};

// ==========================================
// 5. NOTIFICATION FEED (Right Center)
// ==========================================
export const NotificationFeed: Story = {
  name: "5. Notification Drawer (Right Center)",
  args: {
    position: "right-center",
    triggerVariant: "secondary",
    panelVariant: "surface-lowest",
    triggerWidth: 56,
    triggerHeight: 80,
    triggerRadius: 16,
    panelWidth: 380,
    panelHeight: 600,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Acts as a side-drawer attached to the right edge. Combines `Tabs` and the `Item` list system to handle complex navigation entirely within the floating panel.",
      },
    },
  },
  render: (args) => (
    <FloatingPanel {...args} className="border-l border-outline-variant/30">
      <FloatingPanel.Trigger className="rounded-r-none border-r-0">
        <div className="relative">
          <Bell size={24} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full ring-2 ring-surface-container-high" />
        </div>
      </FloatingPanel.Trigger>

      <FloatingPanel.Content className="flex flex-col">
        <div className="flex items-center justify-between p-4 pb-0 shrink-0">
          <Typography variant="title-medium" className="font-bold">
            Notifications
          </Typography>
          <FloatingPanel.CloseButton className="relative top-auto right-auto" />
        </div>

        {/* Embedded Tabs System */}
        <Tabs
          defaultValue="all"
          variant="secondary"
          className="flex-1 flex flex-col min-h-0 mt-2"
        >
          <Tabs.List className="px-4 shrink-0">
            <Tabs.Trigger value="all">All</Tabs.Trigger>
            <Tabs.Trigger value="unread">Unread</Tabs.Trigger>
            <Tabs.Trigger value="mentions">Mentions</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content className="flex-1 overflow-hidden">
            <Tabs.Panel value="all" className="p-0 h-full">
              <ElasticScrollArea className="h-full">
                <div className="flex flex-col py-2">
                  <Item
                    variant="ghost"
                    padding="md"
                    className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 border-b border-outline-variant/20 rounded-none"
                  >
                    <ItemMedia variant="avatar">
                      <Avatar
                        fallback="JD"
                        className="bg-blue-100 text-blue-700"
                      />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="text-sm">
                        John Doe mentioned you
                      </ItemTitle>
                      <ItemDescription>
                        "Can you review the new designs?"
                      </ItemDescription>
                      <Typography
                        variant="label-small"
                        className="text-[10px] opacity-50 mt-1"
                      >
                        2 hours ago
                      </Typography>
                    </ItemContent>
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 self-center" />
                  </Item>

                  <Item
                    variant="ghost"
                    padding="md"
                    className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 border-b border-outline-variant/20 rounded-none"
                  >
                    <ItemMedia
                      variant="icon"
                      className="bg-green-100 text-green-700"
                    >
                      <CheckCircle2 />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="text-sm">
                        Deployment Successful
                      </ItemTitle>
                      <ItemDescription>
                        Production build v2.4.1 is live.
                      </ItemDescription>
                      <Typography
                        variant="label-small"
                        className="text-[10px] opacity-50 mt-1"
                      >
                        5 hours ago
                      </Typography>
                    </ItemContent>
                  </Item>

                  <Item
                    variant="ghost"
                    padding="md"
                    className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 border-b border-outline-variant/20 rounded-none"
                  >
                    <ItemMedia
                      variant="icon"
                      className="bg-orange-100 text-orange-700"
                    >
                      <Volume2 />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="text-sm">
                        New Announcement
                      </ItemTitle>
                      <ItemDescription>
                        Q3 Townhall meeting starts in 10 mins.
                      </ItemDescription>
                      <Typography
                        variant="label-small"
                        className="text-[10px] opacity-50 mt-1"
                      >
                        Yesterday
                      </Typography>
                    </ItemContent>
                  </Item>
                </div>
              </ElasticScrollArea>
            </Tabs.Panel>

            <Tabs.Panel
              value="unread"
              className="p-8 text-center opacity-50 h-full flex items-center justify-center"
            >
              <Typography>No unread notifications.</Typography>
            </Tabs.Panel>
            <Tabs.Panel
              value="mentions"
              className="p-8 text-center opacity-50 h-full flex items-center justify-center"
            >
              <Typography>No recent mentions.</Typography>
            </Tabs.Panel>
          </Tabs.Content>
        </Tabs>
      </FloatingPanel.Content>
    </FloatingPanel>
  ),
};
