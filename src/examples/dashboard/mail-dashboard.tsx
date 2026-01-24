"use client";

import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  Bold,
  Clock,
  File,
  Filter,
  Forward,
  Inbox,
  LayoutGrid,
  Menu,
  MoreVertical,
  Paperclip,
  Plus,
  Reply,
  Search,
  Send,
  Settings,
  Star,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";

// --- Library Imports ---
import { Avatar } from "../../lib/components/avatar";
import { Badge } from "../../lib/components/badge";
import { Button } from "../../lib/components/button";
import { Checkbox } from "../../lib/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../lib/components/dialog";
import { ElasticScrollArea } from "../../lib/components/elastic-scroll-area";
import { FAB } from "../../lib/components/fab";
import { IconButton } from "../../lib/components/icon-button";
import { Input } from "../../lib/components/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "../../lib/components/item";
import { Separator } from "../../lib/components/separator";
import { Sidebar, useSidebar } from "../../lib/components/sidebar";
import { Textarea } from "../../lib/components/textarea";
import { toast } from "../../lib/components/toast";
import { Typography } from "../../lib/components/typography";

// --- Mock Data Generation ---
type LabelType = "work" | "personal" | "travel" | "important";

interface MailItem {
  id: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  subject: string;
  snippet: string;
  body: string;
  date: Date;
  isRead: boolean;
  isStarred: boolean;
  labels: LabelType[];
  hasAttachment: boolean;
}

const GENERATE_COUNT = 50;

const FIRST_NAMES = [
  "Alice",
  "Bob",
  "Charlie",
  "David",
  "Emma",
  "Frank",
  "Grace",
  "Henry",
  "Ivy",
  "Jack",
];
const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
];
const SUBJECTS = [
  "Project Update: Q4 Roadmap",
  "Invitation: Lunch & Learn",
  "Your subscription is renewing soon",
  "Security Alert: New login detected",
  "Feedback on the new design",
  "Flight Confirmation: NYC to LON",
  "Invoice #12345 is due",
  "Weekly Digest: Top stories for you",
  "Meeting notes from Monday",
  "Can we reschedule?",
];
const SNIPPETS = [
  "Hi team, just wanted to share the latest progress on the Q4 roadmap...",
  "Join us for a lunch and learn session this Friday at 12 PM...",
  "Your subscription to Pro Plan will renew on...",
  "We detected a new login from a device in...",
  "I've reviewed the latest mocks and I have a few thoughts...",
  "Your flight to London has been confirmed. See details attached...",
  "Please find the attached invoice for the services rendered...",
  "Here are the top stories you might have missed this week...",
  "Here are the key takeaways from our sync yesterday...",
  "Something came up and I won't be able to make it...",
];

const generateMails = (): MailItem[] => {
  return Array.from({ length: GENERATE_COUNT }).map((_, i) => {
    const firstName =
      FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const hasAttachment = Math.random() > 0.8;
    const labels: LabelType[] = [];
    if (Math.random() > 0.7) labels.push("work");
    if (Math.random() > 0.8) labels.push("important");
    if (Math.random() > 0.9) labels.push("travel");

    return {
      id: `mail-${i}`,
      sender: {
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        avatar: `https://i.pravatar.cc/150?u=${i}`,
      },
      subject: SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)],
      snippet: SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)],
      body: `Hi there,\n\n${
        SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)]
      } \n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nBest regards,\n${firstName}`,
      date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
      isRead: Math.random() > 0.4,
      isStarred: Math.random() > 0.8,
      hasAttachment,
      labels,
    };
  });
};

const MailLabelBadge = ({ label }: { label: LabelType }) => {
  const colors: Record<LabelType, string> = {
    work: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    personal:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    travel:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    important: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <Badge shape="full" className={clsx("border-none px-1.5", colors[label])}>
      {label}
    </Badge>
  );
};

// --- MailDashboard Component ---

export const MailDashboard = () => {
  const [data, setData] = useState<MailItem[]>(() => generateMails());
  const [selectedMailId, setSelectedMailId] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isDetailOpen = !!selectedMailId;
  const selectedMail = useMemo(
    () => data.find((m) => m.id === selectedMailId),
    [data, selectedMailId],
  );

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setData((prev) =>
      prev.map((mail) =>
        mail.id === id ? { ...mail, isStarred: !mail.isStarred } : mail,
      ),
    );
  };

  const toggleRead = (id: string, status: boolean) => {
    setData((prev) =>
      prev.map((mail) => (mail.id === id ? { ...mail, isRead: status } : mail)),
    );
  };

  const toggleSelection = (id: string) => {
    setRowSelection((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDelete = (ids: string[]) => {
    setData((prev) => prev.filter((mail) => !ids.includes(mail.id)));
    setRowSelection({});
    if (ids.includes(selectedMailId || "")) {
      setSelectedMailId(null);
    }
    toast.success(`Moved ${ids.length} conversation(s) to trash.`);
  };

  const handleRowClick = (mail: MailItem) => {
    setSelectedMailId(mail.id);
    if (!mail.isRead) {
      toggleRead(mail.id, true);
    }
  };

  return (
    <div className="flex h-screen w-full bg-graphite-background text-graphite-foreground overflow-hidden font-sans">
      <Sidebar.Provider defaultOpen={false}>
        <DashboardSidebar onCompose={() => setIsComposeOpen(true)} />
        <div className="flex flex-1 flex-col min-w-0">
          <DashboardHeader
            searchValue={searchQuery}
            onSearch={setSearchQuery}
          />
          <div className="flex flex-1 overflow-hidden relative">
            <div
              className={clsx(
                "flex flex-col transition-all duration-300 ease-in-out",
                isDetailOpen
                  ? "w-1/2 min-w-[400px] border-r border-graphite-border hidden md:flex"
                  : "w-full",
              )}
            >
              <MailList
                data={data.filter(
                  (m) =>
                    m.subject
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    m.sender.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                )}
                rowSelection={rowSelection}
                toggleSelection={toggleSelection}
                onRowClick={handleRowClick}
                onToggleStar={toggleStar}
                onDelete={handleDelete}
                compactMode={isDetailOpen}
              />
            </div>
            <AnimatePresence mode="wait">
              {isDetailOpen && selectedMail && (
                <motion.div
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex-1 bg-graphite-card shadow-2xl z-10 w-full md:w-auto absolute md:static inset-0"
                >
                  <MailDetailView
                    mail={selectedMail}
                    onClose={() => setSelectedMailId(null)}
                    onDelete={() => handleDelete([selectedMail.id])}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Sidebar.Provider>
      <ComposeModal open={isComposeOpen} onOpenChange={setIsComposeOpen} />
    </div>
  );
};

// --- Sub-Components ---

const DashboardSidebar = ({ onCompose }: { onCompose: () => void }) => {
  return (
    <Sidebar
      className="border-r border-graphite-border bg-graphite-background pt-2"
      collapsedWidth="4.5rem"
      width="16rem"
      layout="inset"
      expandOnHover={true}
    >
      <div className="px-4 pb-4">
        <FAB
          variant="primary"
          icon={<Plus className="h-6 w-6" />}
          isExtended={true}
          onClick={onCompose}
          className="w-full shadow-md"
        >
          Compose
        </FAB>
      </div>
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.Item icon={<Inbox size={20} />} isActive>
            Inbox
            <span className="ml-auto text-xs font-semibold">12</span>
          </Sidebar.Item>
          <Sidebar.Item icon={<Star size={20} />}>Starred</Sidebar.Item>
          <Sidebar.Item icon={<Clock size={20} />}>Snoozed</Sidebar.Item>
          <Sidebar.Item icon={<Send size={20} />}>Sent</Sidebar.Item>
          <Sidebar.Item icon={<File size={20} />}>Drafts</Sidebar.Item>
          <Sidebar.Item icon={<MoreVertical size={20} />}>More</Sidebar.Item>
        </Sidebar.Group>

        <Separator className="my-2" />

        <Sidebar.Group>
          <Sidebar.Label>Labels</Sidebar.Label>
          <Sidebar.Item icon={<Tag size={18} className="text-blue-500" />}>
            Work
          </Sidebar.Item>
          <Sidebar.Item icon={<Tag size={18} className="text-green-500" />}>
            Personal
          </Sidebar.Item>
          <Sidebar.Item icon={<Tag size={18} className="text-orange-500" />}>
            Travel
          </Sidebar.Item>
        </Sidebar.Group>
      </Sidebar.Content>
    </Sidebar>
  );
};

const DashboardHeader = ({
  searchValue,
  onSearch,
}: {
  searchValue: string;
  onSearch: (v: string) => void;
}) => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-graphite-border bg-graphite-card h-16 shrink-0 z-20">
      <div className="flex items-center gap-4 min-w-[240px]">
        <IconButton variant="ghost" onClick={toggleSidebar}>
          <Menu className="h-6 w-6" />
        </IconButton>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-red-500 flex items-center justify-center text-white font-bold text-lg">
            M
          </div>
          <Typography
            variant="h4"
            className="hidden sm:block text-xl text-graphite-foreground/80"
          >
            Mail
          </Typography>
        </div>
      </div>

      <div className="flex-1 max-w-2xl px-4">
        <Input
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search mail"
          variant="flat"
          shape="full"
          className="w-full"
          classNames={{ input: "pl-2" }}
          startContent={
            <Search className="h-5 w-5 text-graphite-foreground/50" />
          }
          endContent={
            <IconButton variant="ghost" size="sm" className="rounded-full">
              <Filter className="h-4 w-4 opacity-50" />
            </IconButton>
          }
        />
      </div>

      <div className="flex items-center gap-2 min-w-[140px] justify-end">
        <IconButton variant="ghost" className="hidden sm:flex">
          <AlertCircle className="h-6 w-6 opacity-60" />
        </IconButton>
        <IconButton variant="ghost" className="hidden sm:flex">
          <Settings className="h-6 w-6 opacity-60" />
        </IconButton>
        <IconButton variant="ghost">
          <LayoutGrid className="h-6 w-6 opacity-60" />
        </IconButton>
        <Avatar
          src="https://github.com/shadcn.png"
          fallback="CN"
          size="md"
          className="ml-2"
        />
      </div>
    </header>
  );
};

const MailList = ({
  data,
  rowSelection,
  toggleSelection,
  onRowClick,
  onToggleStar,
  onDelete,
  compactMode,
}: {
  data: MailItem[];
  rowSelection: Record<string, boolean>;
  toggleSelection: (id: string) => void;
  onRowClick: (mail: MailItem) => void;
  onToggleStar: (e: React.MouseEvent, id: string) => void;
  onDelete: (ids: string[]) => void;
  compactMode: boolean;
}) => {
  return (
    <div className="h-full bg-graphite-background">
      <ElasticScrollArea className="h-full">
        <div className="p-2 pb-20">
          <ItemGroup>
            {data.map((mail) => (
              <Item
                key={mail.id}
                variant={mail.isRead ? "ghost" : "secondary"}
                shape="minimal"
                padding={compactMode ? "sm" : "md"}
                className={clsx(
                  "cursor-pointer group hover:shadow-sm transition-all",
                  rowSelection[mail.id] &&
                    "bg-secondary-container border-primary/50",
                )}
                onClick={() => onRowClick(mail)}
              >
                <div
                  className="flex items-center h-full mr-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={!!rowSelection[mail.id]}
                    onChange={() => toggleSelection(mail.id)}
                    className="mr-2"
                  />
                  <IconButton
                    variant="ghost"
                    size="sm"
                    shape="full"
                    onClick={(e) => onToggleStar(e, mail.id)}
                    className={clsx(
                      mail.isStarred
                        ? "text-yellow-500"
                        : "text-graphite-foreground/20 hover:text-graphite-foreground/50",
                    )}
                  >
                    <Star
                      className={clsx(
                        "h-4 w-4",
                        mail.isStarred ? "fill-current" : "",
                      )}
                    />
                  </IconButton>
                </div>

                <ItemContent>
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <ItemTitle
                      className={clsx(
                        !mail.isRead && "font-bold text-foreground",
                        "text-sm truncate",
                      )}
                    >
                      {mail.sender.name}
                    </ItemTitle>
                    <Typography
                      variant="small"
                      className={clsx(
                        "text-[10px] shrink-0",
                        mail.isRead
                          ? "opacity-50"
                          : "font-bold text-primary opacity-100",
                      )}
                    >
                      {new Date(mail.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                  </div>

                  <Typography
                    variant="small"
                    className={clsx(
                      "truncate text-sm",
                      !mail.isRead && "font-semibold text-foreground",
                    )}
                  >
                    {mail.subject}
                  </Typography>
                  <ItemDescription className="line-clamp-1 text-xs opacity-70">
                    {mail.snippet}
                  </ItemDescription>

                  {mail.labels.length > 0 && !compactMode && (
                    <div className="flex gap-1 mt-2">
                      {mail.labels.map((label) => (
                        <MailLabelBadge key={label} label={label} />
                      ))}
                    </div>
                  )}
                </ItemContent>

                <ItemActions className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete([mail.id]);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-error" />
                  </IconButton>
                  <IconButton variant="ghost" size="sm">
                    <Archive className="h-4 w-4 text-graphite-foreground/50" />
                  </IconButton>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </div>
      </ElasticScrollArea>
    </div>
  );
};

const MailDetailView = ({
  mail,
  onClose,
  onDelete,
}: {
  mail: MailItem;
  onClose: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="h-full flex flex-col bg-graphite-card">
      <div className="flex items-center justify-between p-2 border-b border-graphite-border bg-graphite-card/95 backdrop-blur z-10 sticky top-0">
        <div className="flex items-center gap-1">
          <IconButton variant="ghost" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </IconButton>
          <IconButton variant="ghost">
            <Archive className="h-5 w-5" />
          </IconButton>
          <IconButton variant="ghost" onClick={onDelete}>
            <Trash2 className="h-5 w-5" />
          </IconButton>
          <IconButton variant="ghost">
            <File className="h-5 w-5" />
          </IconButton>
        </div>
        <div className="flex items-center gap-1">
          <IconButton variant="ghost">
            <Star
              className={clsx(
                "h-5 w-5",
                mail.isStarred ? "text-yellow-500 fill-current" : "",
              )}
            />
          </IconButton>
          <IconButton variant="ghost">
            <MoreVertical className="h-5 w-5" />
          </IconButton>
        </div>
      </div>

      <ElasticScrollArea className="flex-1">
        <div className="p-6 md:p-8 max-w-3xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-6">
            <Typography variant="h3" className="leading-tight">
              {mail.subject}
            </Typography>
            <div className="flex gap-1 shrink-0 mt-1">
              {mail.labels.map((label) => (
                <MailLabelBadge key={label} label={label} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-graphite-border/50">
            <Avatar src={mail.sender.avatar} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <Typography variant="large" className="font-bold truncate">
                  {mail.sender.name}
                </Typography>
                <Typography variant="small" className="text-xs opacity-50">
                  {new Date(mail.date).toLocaleString()}
                </Typography>
              </div>
              <Typography variant="small" className="opacity-60 truncate">
                {`<${mail.sender.email}>`}
              </Typography>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-graphite-foreground/90">
            <p className="whitespace-pre-wrap leading-relaxed">{mail.body}</p>
          </div>

          {mail.hasAttachment && (
            <div className="mt-8 pt-4 border-t border-graphite-border/30">
              <Typography variant="small" className="font-bold mb-3">
                2 Attachments
              </Typography>
              <div className="flex gap-4 overflow-x-auto pb-2">
                <div className="w-32 h-24 bg-graphite-secondary rounded-lg border border-graphite-border flex items-center justify-center shrink-0">
                  <File className="h-8 w-8 opacity-20" />
                </div>
                <div className="w-32 h-24 bg-graphite-secondary rounded-lg border border-graphite-border flex items-center justify-center shrink-0">
                  <File className="h-8 w-8 opacity-20" />
                </div>
              </div>
            </div>
          )}

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
    </div>
  );
};

const ComposeModal = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} variant="basic">
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
              variant="flat"
              shape="sharp"
              placeholder="Recipients"
              className="px-4 py-2"
              classNames={{ input: "text-sm" }}
            />
          </div>
          <div className="border-b border-graphite-border/50">
            <Input
              variant="flat"
              shape="sharp"
              placeholder="Subject"
              className="px-4 py-2"
              classNames={{ input: "text-sm font-medium" }}
            />
          </div>
          <Textarea
            variant="flat"
            shape="sharp"
            placeholder="Compose email..."
            className="flex-1 resize-none p-0 text-sm leading-relaxed"
            classNames={{
              input: "p-4 h-full",
              innerWrapper: "h-full",
            }}
          />
        </div>

        <DialogFooter className="bg-graphite-card p-3 border-t border-graphite-border flex justify-between items-center w-full !mt-0">
          <div className="flex items-center gap-2">
            <Button
              className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                toast.success("Message sent");
                onOpenChange(false);
              }}
            >
              Send
            </Button>
            <IconButton variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </IconButton>
            <IconButton variant="ghost" size="sm">
              <Tag className="h-4 w-4" />
            </IconButton>
            <IconButton variant="ghost" size="sm">
              <Bold className="h-4 w-4" />
            </IconButton>
          </div>
          <IconButton variant="ghost" size="sm">
            <Trash2 className="h-4 w-4 text-error" />
          </IconButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
