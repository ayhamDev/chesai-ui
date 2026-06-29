"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { useMediaQuery } from "@uidotdev/usehooks";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
// Near the top of src/lib/components/resizable/Resizable.stories.tsx
import {
  Archive,
  Bold,
  ChevronLeft,
  Forward,
  History,
  Inbox,
  LifeBuoy,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Plus,
  Reply,
  Search,
  Settings,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  User,
  UserPlus,
  Users,
  Video,
  X,
  // Added icons for the new side panel apps:
  Calendar,
  Lightbulb,
  CheckSquare,
  HardDrive,
} from "lucide-react";

import { useMemo, useState } from "react";
import { Button } from "../button";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { BottomTabs } from "../bottom-tabs";
import { Card } from "../card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { FAB } from "../fab";
import { IconButton } from "../icon-button";
import { Input } from "../input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../item";
import { NavigationRail } from "../navigation-rail";
import { SearchView } from "../search-view";
import { createStackNavigator, useNavigation, useRoute } from "../stack-router";
import { Textarea } from "../textarea";
import { toast } from "../toast";
import { Typography } from "../typography";
import { Resizable, useResizableState } from "./index";
import { LayoutDirectionToggle } from "../layout-toggle";

const meta: Meta = {
  title: "Showcase/Dynamic Split View (Gmail)",
  parameters: { layout: "fullscreen" },
};

export default meta;

// --- MOCK DATA ---
const EMAILS = [
  {
    id: "1",
    author: "Ayham Gm",
    time: "10:45 AM",
    subject: "New Design System Components",
    preview:
      "I've updated the Resizable and StackRouter components. Can you take a look at the latest PR?",
    avatar: "https://i.pravatar.cc/150?u=ayham",
  },
  {
    id: "2",
    author: "Google Cloud",
    time: "9:20 AM",
    subject: "Your monthly usage report",
    preview:
      "Your usage for the month of June has been processed. View your detailed breakdown in the console.",
    avatar: "https://i.pravatar.cc/150?u=google",
  },
  {
    id: "3",
    author: "Framer Team",
    time: "Yesterday",
    subject: "Layout Animations are here!",
    preview:
      "Magic Motion just got an upgrade. Learn how to use the new shared element transitions.",
    avatar: "https://i.pravatar.cc/150?u=framer",
  },
  {
    id: "4",
    author: "Linear",
    time: "2 days ago",
    subject: "Cycle 43 Summary",
    preview:
      "The cycle has ended. Here is a summary of the issues completed and the velocity of the team.",
    avatar: "https://i.pravatar.cc/150?u=linear",
  },
  {
    id: "5",
    author: "Slack",
    time: "Last week",
    subject: "New login from Chrome on Windows",
    preview:
      "We noticed a new login to your workspace. If this was you, you can ignore this email.",
    avatar: "https://i.pravatar.cc/150?u=slack",
  },
];

const HISTORY = [
  { id: 1, text: "Summer vacation plans", icon: <History size={20} /> },
  { id: 2, text: "Grocery list", icon: <History size={20} /> },
  { id: 3, text: "Budget 2025", icon: <History size={20} /> },
];

const SUGGESTIONS = [
  { id: 4, text: "Coffee shops nearby", icon: <Search size={20} /> },
  { id: 5, text: "Weather in Tokyo", icon: <Search size={20} /> },
  { id: 6, text: "How to center a div", icon: <TrendingUp size={20} /> },
];

const RESULTS = [
  {
    id: 7,
    text: "Alice Freeman",
    sub: "alice@example.com",
    avatar: "https://i.pravatar.cc/150?u=a",
  },
  {
    id: 8,
    text: "Bob Smith",
    sub: "bob@example.com",
    avatar: "https://i.pravatar.cc/150?u=b",
  },
  {
    id: "mail-1",
    text: "Ayham Gm",
    sub: "ayham@example.com",
    avatar: "https://i.pravatar.cc/150?u=ayham",
  },
];

// --- MOBILE STACK DEFINITION ---
type MobileStackParamList = {
  Home: undefined;
  Detail: { mailId: string };
};
const MobileStack = createStackNavigator<MobileStackParamList>();

// --- SHARED COMPONENTS ---

const EmptyState = () => (
  <div className="flex h-full flex-col items-center justify-center p-12 text-center opacity-40">
    <div className="mb-4 rounded-full bg-graphite-secondary p-8">
      <Inbox size={48} />
    </div>
    <Typography variant="title-small">Select an item to read</Typography>
    <Typography variant="body-medium">Nothing is selected yet.</Typography>
    <LayoutDirectionToggle />
  </div>
);

const ComposeModal = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog variant="fullscreen" open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl !p-0 overflow-hidden h-[600px] flex flex-col shadow-2xl rounded-t-xl sm:rounded-xl">
        <DialogHeader className="bg-[#f2f6fc] dark:bg-graphite-secondary px-4 py-3 border-b border-graphite-border flex flex-row items-center justify-between !space-y-0">
          <DialogTitle className="text-sm font-semibold">
            New Message
          </DialogTitle>
          <div className="flex items-center gap-2">
            <IconButton
              variant="ghost"
              size="xs"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </IconButton>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col bg-graphite-card">
          <div className="border-b border-graphite-border/50">
            <Input
              variant="filled"
              shape="sharp"
              placeholder="Recipients"
              className="bg-transparent shadow-none"
              classNames={{
                input: "text-sm",
                inputWrapper: "bg-transparent shadow-none px-4 py-3",
              }}
            />
          </div>
          <div className="border-b border-graphite-border/50">
            <Input
              variant="filled"
              shape="sharp"
              placeholder="Subject"
              className="bg-transparent shadow-none"
              classNames={{
                input: "text-sm font-medium",
                inputWrapper: "bg-transparent shadow-none px-4 py-3",
              }}
            />
          </div>
          <Textarea
            variant="filled"
            shape="sharp"
            placeholder="Compose email..."
            className="flex-1 bg-transparent shadow-none"
            classNames={{
              input: "resize-none text-sm leading-relaxed p-4",
              inputWrapper: "h-full bg-transparent shadow-none",
            }}
          />
        </div>

        <DialogFooter className="bg-graphite-card p-3 border-t border-graphite-border flex justify-between items-center w-full !mt-0">
          <div className="flex items-center gap-2">
            <Button
              className="rounded-full px-6 h-9 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                toast.success("Message sent");
                onOpenChange(false);
              }}
            >
              Send
            </Button>
            <IconButton variant="ghost" size="sm">
              <Paperclip className="h-4 w-4 text-graphite-foreground/60" />
            </IconButton>
            <IconButton variant="ghost" size="sm">
              <Tag className="h-4 w-4 text-graphite-foreground/60" />
            </IconButton>
            <IconButton variant="ghost" size="sm">
              <Bold className="h-4 w-4 text-graphite-foreground/60" />
            </IconButton>
          </div>
          <IconButton variant="ghost" size="sm">
            <Trash2 className="h-4 w-4 text-graphite-foreground/60" />
          </IconButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DetailView = ({
  mail,
  onClose,
}: {
  mail: (typeof EMAILS)[0];
  onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 10 }}
    className="flex h-full flex-col bg-graphite-card"
  >
    {/* Header Actions */}
    <div className="flex items-center justify-between border-b border-graphite-border p-4 bg-graphite-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex gap-1">
        <IconButton variant="ghost" size="sm" onClick={onClose}>
          <ChevronLeft />
        </IconButton>
        <IconButton variant="ghost" size="sm">
          <Archive size={18} />
        </IconButton>
        <IconButton variant="ghost" size="sm">
          <Trash2 size={18} />
        </IconButton>
        <IconButton variant="ghost" size="sm">
          <Star size={18} />
        </IconButton>
      </div>
      <IconButton variant="ghost" size="sm">
        <MoreVertical size={18} />
      </IconButton>
    </div>

    <ElasticScrollArea
      className="flex-1 z-100000"
      pullToRefresh={true}
      onRefresh={async () => await new Promise((r) => setTimeout(r, 10000))}
    >
      <div className="p-6 md:p-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-2">
          <Typography
            variant="title-medium"
            className="text-2xl md:text-3xl font-normal leading-tight"
          >
            {mail.subject}
          </Typography>
          <Badge variant="secondary" shape="minimal" className="w-fit">
            Inbox
          </Badge>
        </div>

        <div className="mb-8 flex items-center gap-4">
          <Avatar src={mail.avatar} size="lg" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <Typography variant="large" className="font-bold">
                {mail.author}
              </Typography>
              <Typography variant="body-small" className="opacity-50">
                {mail.time}
              </Typography>
            </div>
            <Typography variant="body-small" className="opacity-60">
              to me
            </Typography>
          </div>
        </div>

        <div className="prose dark:prose-invert">
          <Typography className="leading-relaxed text-graphite-foreground/80">
            {mail.preview}
            <br />
            <br />
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Satius est
            enim ad posteris et iis, qui nunc sunt, ut cum ea, quae docere
            vellent, perfectioneretur.
          </Typography>
        </div>

        <div className="mt-12 flex gap-3">
          <Button
            variant="secondary"
            shape="full"
            startIcon={<Reply size={16} />}
          >
            Reply
          </Button>
          <Button
            variant="secondary"
            shape="full"
            startIcon={<Forward size={16} />}
          >
            Forward
          </Button>
        </div>
      </div>
    </ElasticScrollArea>
  </motion.div>
);

// --- MOBILE SCREEN COMPONENTS ---

const MobileInboxContent = ({
  data,
  onMailClick,
  searchQuery,
  setSearchQuery,
  isOpen,
  setIsOpen,
  onCompose,
}: {
  data: typeof EMAILS;
  onMailClick: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
  onCompose: () => void;
}) => {
  const isSearching = searchQuery.length > 0;
  const filteredResults = RESULTS.filter((r) =>
    r.text.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full bg-graphite-background">
      <div className="p-4 pb-2 z-20 sticky top-0 bg-graphite-background/95 backdrop-blur-md">
        <SearchView
          value={searchQuery}
          onChange={setSearchQuery}
          open={isOpen}
          onOpenChange={setIsOpen}
          placeholder="Search in mail"
          dockedLeadingIcon={<Search className="h-6 w-6" />}
          dockedTrailingIcon={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton size="xs" variant="ghost">
                  <Avatar
                    src="https://i.pravatar.cc/150?u=8"
                    size="sm"
                    className="cursor-pointer hover:opacity-80"
                  />
                </IconButton>
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
          }
        >
          <div className="py-2">
            {!isSearching && (
              <>
                <div className="px-4 py-3">
                  <Typography
                    variant="body-small"
                    className="font-bold opacity-70"
                  >
                    Recent
                  </Typography>
                </div>
                {HISTORY.map((item) => (
                  <Item
                    key={item.id}
                    variant="ghost"
                    className="cursor-pointer rounded-none px-4 py-3"
                    onClick={() => setSearchQuery(item.text)}
                  >
                    <ItemMedia className="text-graphite-foreground/70 mr-4">
                      {item.icon}
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="font-normal text-base">
                        {item.text}
                      </ItemTitle>
                    </ItemContent>
                  </Item>
                ))}
              </>
            )}
            {isSearching && (
              <>
                <div className="px-4 py-3">
                  <Typography
                    variant="body-small"
                    className="font-bold opacity-70"
                  >
                    Contacts
                  </Typography>
                </div>
                {filteredResults.map((item) => (
                  <Item
                    key={item.id}
                    variant="ghost"
                    className="cursor-pointer rounded-none px-4 py-3"
                  >
                    <ItemMedia className="mr-4">
                      <Avatar src={item.avatar} />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="font-normal text-base">
                        {item.text}
                      </ItemTitle>
                      <Typography
                        variant="body-small"
                        muted={true}
                        className="text-sm"
                      >
                        {item.sub}
                      </Typography>
                    </ItemContent>
                  </Item>
                ))}
              </>
            )}
          </div>
        </SearchView>
      </div>

      <ElasticScrollArea
        className="flex-1"
        pullToRefresh
        onRefresh={async () => {
          await new Promise((r) => setTimeout(r, 1000));
        }}
      >
        <div className="flex flex-col gap-1 px-2 pb-20">
          <Typography
            variant="body-small"
            className="px-4 py-2 font-bold opacity-50 uppercase tracking-wider text-xs"
          >
            Inbox
          </Typography>
          {data.map((mail) => (
            <Item
              key={mail.id}
              variant="ghost"
              shape="minimal"
              padding="md"
              className="cursor-pointer bg-graphite-card border border-graphite-border shadow-sm mb-2"
              onClick={() => onMailClick(mail.id)}
            >
              <ItemMedia className="self-start mt-1">
                <Avatar src={mail.avatar} size="md" />
              </ItemMedia>
              <ItemContent>
                <div className="flex items-center justify-between">
                  <ItemTitle className="text-base font-bold">
                    {mail.author}
                  </ItemTitle>
                  <Typography
                    variant="body-small"
                    className="text-xs font-medium opacity-60"
                  >
                    {mail.time}
                  </Typography>
                </div>
                <Typography
                  variant="body-small"
                  className="font-semibold mt-0.5"
                >
                  {mail.subject}
                </Typography>
                <ItemDescription className="line-clamp-2 mt-1 text-sm">
                  {mail.preview}
                </ItemDescription>
              </ItemContent>
              <ItemActions className="self-start mt-1">
                <IconButton variant="ghost" size="xs">
                  <Star className="w-4 h-4 opacity-30" />
                </IconButton>
              </ItemActions>
            </Item>
          ))}
        </div>
      </ElasticScrollArea>

      <div className="absolute bottom-6 right-6 z-30">
        <FAB
          icon={<Plus size={32} />}
          size="lg"
          variant="primary"
          onClick={onCompose}
        >
          Compose
        </FAB>
      </div>
    </div>
  );
};

// --- MOBILE HOME SCREEN (TABS HOST) ---
const MobileHomeScreen = ({
  data,
  onMailClick,
  searchQuery,
  setSearchQuery,
  isOpen,
  setIsOpen,
}: {
  data: typeof EMAILS;
  onMailClick: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
}) => {
  const [activeTab, setActiveTab] = useState("inbox");
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  return (
    <div className="flex flex-col h-full w-full bg-graphite-background">
      <div className="flex-1 relative overflow-hidden">
        {activeTab === "inbox" && (
          <MobileInboxContent
            data={data}
            onMailClick={onMailClick}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            onCompose={() => setIsComposeOpen(true)}
          />
        )}
        {activeTab === "chat" && (
          <div className="flex h-full items-center justify-center p-8 text-center opacity-50">
            <div>
              <MessageSquare className="w-12 h-12 mx-auto mb-4" />
              <Typography variant="title-small">Chats</Typography>
              <Typography variant="body-small">No messages yet.</Typography>
            </div>
          </div>
        )}
        {activeTab === "meet" && (
          <div className="flex h-full items-center justify-center p-8 text-center opacity-50">
            <div>
              <Video className="w-12 h-12 mx-auto mb-4" />
              <Typography variant="title-small">Meet</Typography>
              <Typography variant="body-small">
                No upcoming meetings.
              </Typography>
            </div>
          </div>
        )}
      </div>

      <BottomTabs.Navigator
        activeTab={activeTab}
        onTabPress={setActiveTab}
        shape="sharp"
        mode="attached"
        itemLayout="stacked"
      >
        <BottomTabs.Screen
          name="inbox"
          label="Inbox"
          shape="full"
          icon={() => <Inbox size={24} />}
        />
        <BottomTabs.Screen
          name="chat"
          label="Chat"
          shape="full"
          icon={() => <MessageSquare size={24} />}
        />
        <BottomTabs.Screen
          name="meet"
          shape="full"
          label="Meet"
          icon={() => <Video size={24} />}
        />
      </BottomTabs.Navigator>

      <ComposeModal open={isComposeOpen} onOpenChange={setIsComposeOpen} />
    </div>
  );
};

// Mobile Detail Screen Wrapper
const MobileDetailScreen = () => {
  const navigation = useNavigation<MobileStackParamList>();
  const route = useRoute<MobileStackParamList, "Detail">();
  const mail = EMAILS.find((m) => m.id === route.params.mailId);

  if (!mail) return null;

  return <DetailView mail={mail} onClose={() => navigation.goBack()} />;
};

export const GmailReplica: StoryObj = {
  render: () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isComposeOpen, setIsComposeOpen] = useState(false);

    const filteredEmails = useMemo(
      () =>
        EMAILS.filter(
          (m) =>
            m.subject.toLowerCase().includes(query.toLowerCase()) ||
            m.author.toLowerCase().includes(query.toLowerCase()),
        ),
      [query],
    );

    const activeMail = useMemo(
      () => EMAILS.find((m) => m.id === selectedId),
      [selectedId],
    );

    const isMobile = useMediaQuery("(max-width: 768px)");

    if (isMobile) {
      return (
        <div className="h-screen w-full bg-graphite-background">
          <MobileStack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              animation: "slide-from-bottom",
            }}
          >
            <MobileStack.Screen name="Home">
              {(props) => (
                <MobileHomeScreen
                  data={filteredEmails}
                  onMailClick={(id) =>
                    props.navigation.push("Detail", { mailId: id })
                  }
                  searchQuery={query}
                  setSearchQuery={setQuery}
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                />
              )}
            </MobileStack.Screen>
            <MobileStack.Screen name="Detail" component={MobileDetailScreen} />
          </MobileStack.Navigator>
        </div>
      );
    }

    const isSearching = query.length > 0;
    const filteredResults = RESULTS.filter((r) =>
      r.text.toLowerCase().includes(query.toLowerCase()),
    );

    return (
      <div className="flex h-screen w-full bg-graphite-background">
        <NavigationRail.Navigator
          activeTab="inbox"
          onTabPress={() => {}}
          variant="ghost"
          shape="full"
          width="4.5rem"
          expandedWidth="12rem"
          bordered={false}
        >
          <NavigationRail.FAB
            icon={<Plus />}
            variant="primary"
            label="Compose"
            onClick={() => setIsComposeOpen(true)}
          />
          <NavigationRail.Screen
            name="inbox"
            label="Inbox"
            icon={() => <Inbox />}
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

        <Resizable className="flex-1">
          <Resizable.Pane
            id="list-view"
            defaultWidth={380}
            collapseAt={600}
            className="flex flex-col bg-graphite-background/50  border-outline-variant"
          >
            <div className="p-4">
              <SearchView
                variant="docked"
                value={query}
                onChange={setQuery}
                open={isOpen}
                onOpenChange={setIsOpen}
                placeholder="Search mail"
                dockedLeadingIcon={<Search className="h-6 w-6" />}
                dockedTrailingIcon={
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <IconButton size="xs" variant="ghost">
                        <Avatar
                          src="https://i.pravatar.cc/150?u=8"
                          size="sm"
                          className="cursor-pointer hover:opacity-80"
                        />
                      </IconButton>
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
                }
              >
                <div className="py-2">
                  {!isSearching && (
                    <>
                      <div className="px-4 py-3">
                        <Typography
                          variant="body-small"
                          className="font-bold opacity-70"
                        >
                          Recent
                        </Typography>
                      </div>
                      {HISTORY.map((item) => (
                        <Item
                          key={item.id}
                          variant="ghost"
                          className="cursor-pointer rounded-none px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5"
                          onClick={() => setQuery(item.text)}
                        >
                          <ItemMedia className="text-graphite-foreground/70 mr-4">
                            {item.icon}
                          </ItemMedia>
                          <ItemContent>
                            <ItemTitle className="font-normal text-base">
                              {item.text}
                            </ItemTitle>
                          </ItemContent>
                          <ItemActions>
                            <div className="-rotate-45 opacity-40">
                              <MoreVertical size={18} />
                            </div>
                          </ItemActions>
                        </Item>
                      ))}
                    </>
                  )}
                  {isSearching && (
                    <>
                      <div className="px-4 py-3">
                        <Typography
                          variant="body-small"
                          className="font-bold opacity-70"
                        >
                          Contacts
                        </Typography>
                      </div>
                      {filteredResults.map((item) => (
                        <Item
                          key={item.id}
                          variant="ghost"
                          className="cursor-pointer rounded-none px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <ItemMedia className="mr-4">
                            <Avatar src={item.avatar} />
                          </ItemMedia>
                          <ItemContent>
                            <ItemTitle className="font-normal text-base">
                              {item.text}
                            </ItemTitle>
                            <Typography
                              variant="body-small"
                              muted={true}
                              className="text-sm"
                            >
                              {item.sub}
                            </Typography>
                          </ItemContent>
                        </Item>
                      ))}
                    </>
                  )}
                </div>
              </SearchView>
            </div>

            <ElasticScrollArea className="flex-1 px-2">
              <div className="flex flex-col gap-1 py-2">
                <Typography
                  variant="body-small"
                  className="px-4 py-2 font-bold opacity-50 uppercase tracking-wider text-xs"
                >
                  Today
                </Typography>
                {filteredEmails.map((mail) => (
                  <Item
                    key={mail.id}
                    variant="ghost"
                    shape="minimal"
                    padding="sm"
                    className={clsx(
                      "cursor-pointer transition-all",
                      selectedId === mail.id &&
                        " dark:bg-surface-container-highest ",
                    )}
                    onClick={() => setSelectedId(mail.id)}
                  >
                    <ItemMedia>
                      <Avatar src={mail.avatar} size="md" />
                    </ItemMedia>
                    <ItemContent>
                      <div className="flex items-center justify-between">
                        <ItemTitle className="text-sm font-bold">
                          {mail.author}
                        </ItemTitle>
                        <Typography
                          variant="body-small"
                          className="text-[10px] opacity-50"
                        >
                          {mail.time}
                        </Typography>
                      </div>
                      <Typography
                        variant="body-small"
                        className="font-semibold line-clamp-1"
                      >
                        {mail.subject}
                      </Typography>
                      <ItemDescription className="line-clamp-2">
                        {mail.preview}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                ))}
              </div>
            </ElasticScrollArea>
          </Resizable.Pane>

          <Resizable.Handle target="list-view" variant="pill" />

          <Resizable.Pane id="details" flex className="bg-graphite-card">
            <AnimatePresence mode="wait">
              {activeMail ? (
                <DetailView
                  key={activeMail.id}
                  mail={activeMail}
                  onClose={() => setSelectedId(null)}
                />
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <EmptyState />
                </motion.div>
              )}
            </AnimatePresence>
          </Resizable.Pane>
        </Resizable>

        <ComposeModal open={isComposeOpen} onOpenChange={setIsComposeOpen} />
      </div>
    );
  },
};

// --- STORY 2: SEPARATED FLOATING CARD LAYOUT WITH GAPS ---

export const SeparatedCardLayout: StoryObj = {
  name: "2. Separated Floating Cards (MD3 Style)",
  render: () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const activeMail = EMAILS.find((m) => m.id === selectedId);

    // List view helper utilizing the Resizable context state
    const MailList = () => {
      const { setWidth, isCollapsed } = useResizableState("separated-detail");

      const handleSelect = (id: string) => {
        setSelectedId(id);
        if (isCollapsed) {
          // Open details view smoothly via the Resizable State API
          setWidth(450);
        }
      };

      return (
        <div className="flex flex-col gap-2">
          {EMAILS.map((mail) => (
            <Item
              key={mail.id}
              variant="ghost"
              shape="minimal"
              padding="sm"
              className={clsx(
                "cursor-pointer transition-all",
                selectedId === mail.id
                  ? "bg-surface-container-highest"
                  : "hover:bg-surface-container-high/40",
              )}
              onClick={() => handleSelect(mail.id)}
            >
              <ItemMedia>
                <Avatar src={mail.avatar} size="md" />
              </ItemMedia>
              <ItemContent>
                <div className="flex items-center justify-between">
                  <ItemTitle className="text-sm font-bold">
                    {mail.author}
                  </ItemTitle>
                  <Typography
                    variant="body-small"
                    className="text-[10px] opacity-40"
                  >
                    {mail.time}
                  </Typography>
                </div>
                <ItemDescription className="line-clamp-2 mt-0.5 text-xs">
                  {mail.preview}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </div>
      );
    };

    // Header helper utilizing the Resizable context state to collapse the pane
    const DetailHeader = () => {
      const { setWidth } = useResizableState("separated-detail");
      if (!activeMail) return null;

      return (
        <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar src={activeMail.avatar} size="lg" />
            <div>
              <Typography variant="title-medium" className="font-bold">
                {activeMail.author}
              </Typography>
              <Typography variant="body-small" className="opacity-50">
                {activeMail.time}
              </Typography>
            </div>
          </div>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => {
              setWidth(0);
              setSelectedId(null); // Clear selected item so open becomes false cleanly
            }}
          >
            <X className="h-4 w-4" />
          </IconButton>
        </div>
      );
    };

    return (
      <div className="flex h-screen w-full bg-surface-container-low p-4 gap-4">
        {/* Set storageKey to enable layout persistence */}
        <Resizable
          gap="md"
          className="flex-1 h-full"
          defaultSizes={{ "separated-detail": 0 }}
          storageKey="separated-card-layout-story"
        >
          <Resizable.Pane id="separated-list" flex className="h-full">
            <Card
              shape="minimal"
              variant="surface-container-lowest"
              className="h-full flex flex-col p-2"
            >
              <Typography
                variant="label-small"
                className="px-4 py-3 font-bold opacity-60 uppercase tracking-widest text-xs"
              >
                Comments & Feeds
              </Typography>
              <ElasticScrollArea className="flex-1 px-1">
                <MailList />
              </ElasticScrollArea>
            </Card>
          </Resizable.Pane>

          <Resizable.Handle
            indicatorColor="secondary"
            target="separated-detail"
            invert
            variant="pill"
            divided={false}
            showIndicator={true}
            alwaysShowIndicator={true}
            indicatorHeight={100}
            indicatorWidth={15}
          />

          {/* Bound open state cleanly with React state to ensure it never loads as an empty, open pane */}
          <Resizable.Pane
            id="separated-detail"
            defaultWidth={450}
            className="h-full"
            adaptTo="docked"
            collapseAt={800}
            open={selectedId !== null}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedId(null);
              }
            }}
          >
            <Card
              shape="minimal"
              variant="surface-container-lowest"
              className="h-full overflow-hidden flex flex-col p-0"
            >
              {activeMail ? (
                <div className="flex-1 flex flex-col">
                  <DetailHeader />
                  <ElasticScrollArea className="flex-1 p-6">
                    <Typography
                      variant="title-large"
                      className="font-bold mb-4"
                    >
                      {activeMail.subject}
                    </Typography>
                    <Typography
                      variant="body-medium"
                      className="leading-relaxed opacity-85"
                    >
                      {activeMail.preview}
                    </Typography>
                  </ElasticScrollArea>
                </div>
              ) : (
                <EmptyState />
              )}
            </Card>
          </Resizable.Pane>
        </Resizable>
      </div>
    );
  },
};

// --- STORY 3: THREE-PANE GMAIL WITH SIDE APPS PANEL ---

export const ThreePaneGmailWithApps: StoryObj = {
  name: "3. Three-Pane Layout (Gmail with Calendar & Keep)",
  render: () => {
    const [selectedId, setSelectedId] = useState<string | null>("1");
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isComposeOpen, setIsComposeOpen] = useState(false);

    // Side panel apps state
    const [activeApp, setActiveApp] = useState<"calendar" | "keep" | "drive">(
      "calendar",
    );
    const [isAppsOpen, setIsAppsOpen] = useState(true);

    const filteredEmails = useMemo(
      () =>
        EMAILS.filter(
          (m) =>
            m.subject.toLowerCase().includes(query.toLowerCase()) ||
            m.author.toLowerCase().includes(query.toLowerCase()),
        ),
      [query],
    );

    const activeMail = useMemo(
      () => EMAILS.find((m) => m.id === selectedId),
      [selectedId],
    );

    const handleAppToggle = (app: "calendar" | "keep" | "drive") => {
      if (activeApp === app && isAppsOpen) {
        setIsAppsOpen(false);
      } else {
        setActiveApp(app);
        setIsAppsOpen(true);
      }
    };

    // Sub-components for side app contents
    const CalendarWidget = () => (
      <div className="flex flex-col gap-4">
        <Typography variant="title-small" className="font-semibold px-1">
          Schedule
        </Typography>
        <div className="flex flex-col gap-2">
          <div className="p-3 rounded-xl bg-primary-container/30 border-l-4 border-primary">
            <Typography
              variant="label-small"
              className="text-primary font-bold"
            >
              10:00 AM - 11:00 AM
            </Typography>
            <Typography variant="body-medium" className="font-medium mt-0.5">
              Design Sync & PR Reviews
            </Typography>
          </div>
          <div className="p-3 rounded-xl bg-secondary-container/20 border-l-4 border-secondary">
            <Typography
              variant="label-small"
              className="text-secondary font-bold"
            >
              1:30 PM - 2:00 PM
            </Typography>
            <Typography variant="body-medium" className="font-medium mt-0.5">
              Lunch with Design Team
            </Typography>
          </div>
          <div className="p-3 rounded-xl bg-outline-variant/10 border-l-4 border-outline-variant">
            <Typography variant="label-small" className="opacity-60 font-bold">
              4:00 PM - 4:45 PM
            </Typography>
            <Typography
              variant="body-medium"
              className="font-medium mt-0.5 opacity-80"
            >
              Weekly Standup
            </Typography>
          </div>
        </div>
      </div>
    );

    const KeepWidget = () => (
      <div className="flex flex-col gap-4">
        <Typography variant="title-small" className="font-semibold px-1">
          My Notes
        </Typography>
        <div className="flex flex-col gap-3">
          <Card
            variant="surface-container"
            shape="minimal"
            className="p-3 border-none shadow-sm bg-yellow-100/10 dark:bg-yellow-950/10"
          >
            <Typography variant="body-medium" className="font-bold">
              Resizable Features
            </Typography>
            <Typography variant="body-small" className="opacity-80 mt-1">
              Add persistent width storage to the multi-pane panel before
              shipping.
            </Typography>
          </Card>
          <Card
            variant="surface-container"
            shape="minimal"
            className="p-3 border-none shadow-sm"
          >
            <Typography variant="body-medium" className="font-bold">
              Grocery List
            </Typography>
            <Typography variant="body-small" className="opacity-80 mt-1">
              Coffee beans, oat milk, sparkling water.
            </Typography>
          </Card>
        </div>
      </div>
    );

    const DriveWidget = () => (
      <div className="flex flex-col gap-4">
        <Typography variant="title-small" className="font-semibold px-1">
          Recent Files
        </Typography>
        <div className="flex flex-col gap-2">
          {[
            { name: "design-spec-v2.pdf", size: "4.2 MB" },
            { name: "workspace-layout.png", size: "1.8 MB" },
            { name: "feedback-notes.docx", size: "124 KB" },
          ].map((file, i) => (
            <Item
              key={i}
              variant="ghost"
              shape="minimal"
              padding="sm"
              className="cursor-pointer"
            >
              <ItemMedia>
                <HardDrive className="h-4 w-4 opacity-70" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="text-xs font-medium truncate max-w-[140px]">
                  {file.name}
                </ItemTitle>
                <Typography
                  variant="body-small"
                  className="text-[10px] opacity-40"
                >
                  {file.size}
                </Typography>
              </ItemContent>
            </Item>
          ))}
        </div>
      </div>
    );

    const isSearching = query.length > 0;
    const filteredResults = RESULTS.filter((r) =>
      r.text.toLowerCase().includes(query.toLowerCase()),
    );

    return (
      <div className="flex h-screen w-full bg-graphite-background">
        {/* Leftmost primary navigation rail */}

        <NavigationRail.Navigator
          activeTab="inbox"
          onTabPress={() => {}}
          variant="ghost"
          shape="full"
          width="4.5rem"
          expandedWidth="12rem"
          bordered={false}
        >
          <NavigationRail.FAB
            icon={<Plus />}
            variant="primary"
            label="Compose"
            onClick={() => setIsComposeOpen(true)}
          />
          <NavigationRail.Screen
            name="inbox"
            label="Inbox"
            icon={() => <Inbox />}
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

        {/* Outer Split Pane Structure */}
        <Resizable className="flex-1">
          {/* Pane 1: Inbox List view */}
          <Resizable.Pane
            id="list-view-3p"
            defaultWidth={340}
            collapseAt={600}
            className="flex flex-col bg-graphite-background/50 border-outline-variant"
          >
            <div className="p-4">
              <SearchView
                variant="docked"
                value={query}
                onChange={setQuery}
                open={isOpen}
                onOpenChange={setIsOpen}
                placeholder="Search mail"
                dockedLeadingIcon={<Search className="h-6 w-6" />}
                dockedTrailingIcon={
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <IconButton size="xs" variant="ghost">
                        <Avatar
                          src="https://i.pravatar.cc/150?u=8"
                          size="sm"
                          className="cursor-pointer hover:opacity-80"
                        />
                      </IconButton>
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
              >
                <div className="py-2">
                  {!isSearching && (
                    <>
                      <div className="px-4 py-3">
                        <Typography
                          variant="body-small"
                          className="font-bold opacity-70"
                        >
                          Recent Searches
                        </Typography>
                      </div>
                      {HISTORY.map((item) => (
                        <Item
                          key={item.id}
                          variant="ghost"
                          className="cursor-pointer rounded-none px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5"
                          onClick={() => setQuery(item.text)}
                        >
                          <ItemMedia className="text-graphite-foreground/70 mr-4">
                            {item.icon}
                          </ItemMedia>
                          <ItemContent>
                            <ItemTitle className="font-normal text-base">
                              {item.text}
                            </ItemTitle>
                          </ItemContent>
                        </Item>
                      ))}
                    </>
                  )}
                  {isSearching && (
                    <>
                      <div className="px-4 py-3">
                        <Typography
                          variant="body-small"
                          className="font-bold opacity-70"
                        >
                          Contacts
                        </Typography>
                      </div>
                      {filteredResults.map((item) => (
                        <Item
                          key={item.id}
                          variant="ghost"
                          className="cursor-pointer rounded-none px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <ItemMedia className="mr-4">
                            <Avatar src={item.avatar} />
                          </ItemMedia>
                          <ItemContent>
                            <ItemTitle className="font-normal text-base">
                              {item.text}
                            </ItemTitle>
                            <Typography
                              variant="body-small"
                              muted
                              className="text-sm"
                            >
                              {item.sub}
                            </Typography>
                          </ItemContent>
                        </Item>
                      ))}
                    </>
                  )}
                </div>
              </SearchView>
            </div>

            <ElasticScrollArea className="flex-1 px-2">
              <div className="flex flex-col gap-1 py-2">
                <Typography
                  variant="body-small"
                  className="px-4 py-2 font-bold opacity-50 uppercase tracking-wider text-xs"
                >
                  Today
                </Typography>
                {filteredEmails.map((mail) => (
                  <Item
                    key={mail.id}
                    variant="ghost"
                    shape="minimal"
                    padding="sm"
                    className={clsx(
                      "cursor-pointer transition-all",
                      selectedId === mail.id &&
                        "dark:bg-surface-container-highest bg-black/5",
                    )}
                    onClick={() => setSelectedId(mail.id)}
                  >
                    <ItemMedia>
                      <Avatar src={mail.avatar} size="md" />
                    </ItemMedia>
                    <ItemContent>
                      <div className="flex items-center justify-between">
                        <ItemTitle className="text-sm font-bold">
                          {mail.author}
                        </ItemTitle>
                        <Typography
                          variant="body-small"
                          className="text-[10px] opacity-50"
                        >
                          {mail.time}
                        </Typography>
                      </div>
                      <Typography
                        variant="body-small"
                        className="font-semibold line-clamp-1"
                      >
                        {mail.subject}
                      </Typography>
                      <ItemDescription className="line-clamp-2">
                        {mail.preview}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                ))}
              </div>
            </ElasticScrollArea>
          </Resizable.Pane>

          <Resizable.Handle target="list-view-3p" variant="pill" />

          {/* Pane 2: Primary Email Detail View (Flexible Middle Pane) */}
          <Resizable.Pane id="details-3p" flex className="bg-graphite-card">
            <AnimatePresence mode="wait">
              {activeMail ? (
                <DetailView
                  key={activeMail.id}
                  mail={activeMail}
                  onClose={() => setSelectedId(null)}
                />
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <EmptyState />
                </motion.div>
              )}
            </AnimatePresence>
          </Resizable.Pane>

          <Resizable.Handle target="apps-panel" invert variant="pill" />

          {/* Pane 3: Right side adaptive Utility Apps Panel */}
          <Resizable.Pane
            id="apps-panel"
            defaultWidth={280}
            minWidth={200}
            dismissible={true}
            open={isAppsOpen}
            onOpenChange={setIsAppsOpen}
            className="bg-graphite-background/40 border-l border-outline-variant/30"
          >
            <div className="flex flex-col h-full">
              {/* Header inside utility pane */}
              <div className="h-14 px-4 flex items-center justify-between border-b border-outline-variant/20 bg-graphite-background/20">
                <Typography
                  variant="label-medium"
                  className="font-bold opacity-60 uppercase tracking-widest text-[11px]"
                >
                  Side Panel
                </Typography>
                <IconButton
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsAppsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </IconButton>
              </div>

              {/* Utility content switchboard */}
              <div className="flex-1 p-4 overflow-hidden">
                <ElasticScrollArea className="h-full">
                  {activeApp === "calendar" && <CalendarWidget />}
                  {activeApp === "keep" && <KeepWidget />}
                  {activeApp === "drive" && <DriveWidget />}
                </ElasticScrollArea>
              </div>
            </div>
          </Resizable.Pane>
        </Resizable>

        {/* Persistent Side App Bar to switch or restore panel widgets */}
        <div className="w-12 bg-graphite-background border-l border-outline-variant/20 flex flex-col items-center py-4 gap-4 z-10 shrink-0">
          <IconButton
            variant={isAppsOpen && activeApp === "calendar" ? "tonal" : "ghost"}
            size="sm"
            onClick={() => handleAppToggle("calendar")}
            className={clsx(
              "rounded-full transition-all",
              isAppsOpen &&
                activeApp === "calendar" &&
                "bg-primary-container text-on-primary-container",
            )}
          >
            <Calendar className="h-5 w-5" />
          </IconButton>

          <IconButton
            variant={isAppsOpen && activeApp === "keep" ? "tonal" : "ghost"}
            size="sm"
            onClick={() => handleAppToggle("keep")}
            className={clsx(
              "rounded-full transition-all",
              isAppsOpen &&
                activeApp === "keep" &&
                "bg-primary-container text-on-primary-container",
            )}
          >
            <Lightbulb className="h-5 w-5" />
          </IconButton>

          <IconButton
            variant={isAppsOpen && activeApp === "drive" ? "tonal" : "ghost"}
            size="sm"
            onClick={() => handleAppToggle("drive")}
            className={clsx(
              "rounded-full transition-all",
              isAppsOpen &&
                activeApp === "drive" &&
                "bg-primary-container text-on-primary-container",
            )}
          >
            <HardDrive className="h-5 w-5" />
          </IconButton>
        </div>

        <ComposeModal open={isComposeOpen} onOpenChange={setIsComposeOpen} />
      </div>
    );
  },
};
