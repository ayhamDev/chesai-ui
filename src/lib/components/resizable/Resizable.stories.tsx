import type { Meta, StoryObj } from "@storybook/react";
import {
  Archive,
  Inbox,
  Menu,
  MessageSquare,
  MoreVertical,
  Pencil,
  Search,
  Star,
  Trash2,
  Video,
} from "lucide-react";
import React from "react";
import { Avatar } from "../avatar";
import { Card } from "../card";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { FAB } from "../fab";
import { IconButton } from "../icon-button";
import { NavigationRail } from "../navigation-rail";
import { Typography } from "../typography";
import { Resizable } from "./index";

const meta: Meta<typeof Resizable> = {
  title: "Components/Layout/Resizable (Split View)",
  component: Resizable,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A scratch-built resizable pane component. It mimics the Android/Material 3 split-view behavior. Drag the handle to resize the list view.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-full bg-[#FDFCFB] text-[#1A1C1E] flex overflow-hidden">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Resizable>;

// --- MOCK CONTENT ---

const EMAILS = [
  {
    id: 1,
    author: "老强",
    time: "10 min ago",
    subject: "豆花鱼",
    preview:
      "最近忙吗？昨晚我去了你最爱的那家饭馆，点了他们的特色豆花鱼，吃着吃着就想你了。有空咱们视频？",
    avatar: "https://i.pravatar.cc/150?u=1",
    color: "bg-orange-100",
  },
  {
    id: 2,
    author: "So Duri",
    time: "20 min ago",
    subject: "Dinner Club",
    preview:
      "I think it's time for us to finally try that new noodle shop downtown that doesn't use menus. Anyone else have other suggestions...",
    avatar: "https://i.pravatar.cc/150?u=2",
    color: "bg-[#E8DEF8]", // The purple selected color from screenshot
    selected: true,
  },
  {
    id: 3,
    author: "Lily MacDonald",
    time: "2 hours ago",
    subject: "This food show is made for you",
    preview:
      "Whatever you do, don't watch the new episode of 'Street Food' while hungry. It features that place we went to in Osaka!",
    avatar: "https://i.pravatar.cc/150?u=3",
    color: "bg-yellow-100",
  },
  {
    id: 4,
    author: "Ziad",
    time: "3 hours ago",
    subject: "Recipe attached",
    preview: "Here is the PDF for the focaccia bread. Good luck!",
    avatar: "https://i.pravatar.cc/150?u=4",
    color: "bg-green-100",
  },
];

const DetailView = () => (
  <div className="flex flex-col h-full bg-[#FDFCFB] p-6">
    {/* Header */}
    <div className="flex items-start justify-between mb-6">
      <div>
        <Typography variant="h2" className="text-[28px] font-normal mb-1">
          Dinner club
        </Typography>
        <div className="flex items-center gap-2">
          <Badge>3 Messages</Badge>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <IconButton variant="ghost">
          <Trash2 className="h-5 w-5 text-gray-600" />
        </IconButton>
        <IconButton variant="ghost">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </IconButton>
      </div>
    </div>

    {/* Sender Info */}
    <div className="flex items-start gap-4 mb-6">
      <Avatar src="https://i.pravatar.cc/150?u=2" size="md" />
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <Typography variant="h4" className="text-base font-bold">
            So Duri
          </Typography>
          <div className="flex items-center gap-2">
            <Typography variant="small" className="text-gray-500">
              20 min ago
            </Typography>
            <IconButton variant="ghost" size="sm">
              <Star className="h-5 w-5 text-gray-400" />
            </IconButton>
          </div>
        </div>
        <Typography variant="small" className="text-gray-600 mt-1">
          To me, Ziad, and Lily
        </Typography>
      </div>
    </div>

    {/* Body */}
    <ElasticScrollArea className="flex-1 -mr-4 pr-4">
      <div className="space-y-6 text-[16px] leading-relaxed text-[#444746]">
        <p>
          I think it's time for us to finally try that new noodle shop downtown
          that doesn't use menus. Anyone else have other suggestions for dinner
          club this week? I'm so intrigued by this idea of a noodle restaurant
          where no one gets to order for themselves – could be fun, or terrible,
          or both :)
        </p>
        <div className="rounded-2xl overflow-hidden mt-4">
          <img
            src="https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=1000&auto=format&fit=crop"
            alt="Dumplings"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </ElasticScrollArea>
  </div>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
    {children}
  </span>
);

export const MailLayout: Story = {
  name: "Google Mail Replica",
  render: () => {
    // 465dp is roughly 465px in web terms for this demo
    return (
      <div className="flex w-full h-full">
        {/* 1. NAVIGATION RAIL (Leftmost) */}

        <NavigationRail.Navigator
          activeTab="inbox"
          onTabPress={() => {}}
          variant="ghost"
          shape="full"
          className="w-full"
          bordered={false}
        >
          <NavigationRail.Screen
            name="inbox"
            label="Inbox"
            icon={({ isActive }) => (
              <div className="relative">
                <Inbox />
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] px-1 rounded-full font-bold">
                  4
                </span>
              </div>
            )}
          />
          <NavigationRail.Screen
            name="docs"
            label="Docs"
            icon={() => <Archive />}
          />
          <NavigationRail.Screen
            name="chat"
            label="Chat"
            icon={() => <MessageSquare />}
          />
          <NavigationRail.Screen
            name="meet"
            label="Meet"
            icon={() => <Video />}
          />
        </NavigationRail.Navigator>

        <Resizable
          className="flex-1  bg-[#FDFCFB]"
          defaultWidth={465} // Matches the 465dp spec
          minWidth={320}
          maxWidth={600}
        >
          {/* 2a. LEFT PANE (Message List) */}
          <Resizable.PaneLeft className="bg-[#F6F8FC] flex flex-col border-r border-transparent">
            {/* Search Bar */}
            <div className="p-4 pb-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search replies"
                  className="w-full bg-[#ECEFF1] rounded-full py-3 pl-12 pr-10 outline-none focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                />
                <Avatar
                  src="https://github.com/shadcn.png"
                  size="xs"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                />
              </div>
            </div>

            {/* Email List */}
            <ElasticScrollArea className="flex-row flex-1 p-3">
              <div className="flex flex-col gap-4">
                {EMAILS.map((email) => (
                  <Card
                    key={email.id}
                    padding="md"
                    shape="minimal"
                    elevation={email.selected ? 1 : "none"}
                    className={`cursor-pointer transition-all hover:shadow-sm border-none ${
                      email.selected ? "bg-[#E8DEF8]" : "bg-white"
                    } rounded-[20px]`} // Rounded corners like Material 3
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-3">
                        <Avatar src={email.avatar} size="sm" />
                        <div>
                          <Typography
                            variant="small"
                            className="font-bold text-[#1A1C1E]"
                          >
                            {email.author}
                          </Typography>
                          <Typography
                            variant="muted"
                            className="text-xs !mt-0 font-medium"
                          >
                            {email.time}
                          </Typography>
                        </div>
                      </div>
                      <Star
                        className={`h-5 w-5 ${
                          email.selected
                            ? "fill-gray-700 text-gray-700"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <Typography
                      variant="h4"
                      className="text-base mt-2 mb-1 font-medium"
                    >
                      {email.subject}
                    </Typography>
                    <p className="text-sm text-[#444746] line-clamp-2 leading-snug">
                      {email.preview}
                    </p>
                  </Card>
                ))}
              </div>
            </ElasticScrollArea>
          </Resizable.PaneLeft>

          {/* 2b. HANDLE */}
          <Resizable.Handle variant="pill" />
          {/* 2c. RIGHT PANE (Detail View) */}
          <Resizable.PaneRight>
            <DetailView />
          </Resizable.PaneRight>
        </Resizable>
      </div>
    );
  },
};
