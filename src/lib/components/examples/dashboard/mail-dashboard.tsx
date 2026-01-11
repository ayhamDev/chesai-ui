"use client";

import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { clsx } from "clsx";
import { format, formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  Bold,
  ChevronLeft,
  ChevronRight,
  Clock,
  File,
  Filter,
  Inbox,
  LayoutGrid,
  Mail,
  Menu,
  MoreVertical,
  Paperclip,
  Plus,
  Printer,
  Reply,
  ReplyAll,
  Search,
  Send,
  Settings,
  Star,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";

// --- Library Imports (Adjust paths based on your structure) ---
import { Avatar } from "../../avatar";
import { Badge } from "../../badge";
import { Button } from "../../button";
import { Card } from "../../card";
import { Checkbox } from "../../checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../dialog";
import { ElasticScrollArea } from "../../elastic-scroll-area";
import { IconButton } from "../../icon-button";
import { Input } from "../../input";
import { Separator } from "../../separator";
import { Sidebar, useSidebar } from "../../sidebar";
import { TextArea } from "../../textarea";
import { toast } from "../../toast";
import { Tooltip, TooltipProvider, TooltipTrigger } from "../../tooltip";
import { Typography } from "../../typography";
import { FAB } from "../../fab";

// ============================================================================
// 1. MOCK DATA GENERATOR & TYPES
// ============================================================================

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

// ============================================================================
// 2. SHARED COMPONENTS (SUB-COMPONENTS)
// ============================================================================

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
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide",
        colors[label]
      )}
    >
      {label}
    </span>
  );
};

// ============================================================================
// 3. MAIN DASHBOARD COMPONENT
// ============================================================================

export const MailDashboard = () => {
  // --- STATE ---
  const [data, setData] = useState<MailItem[]>(() => generateMails());
  const [selectedMailId, setSelectedMailId] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Derived state for the "Push" layout
  const isDetailOpen = !!selectedMailId;
  const selectedMail = useMemo(
    () => data.find((m) => m.id === selectedMailId),
    [data, selectedMailId]
  );

  // --- HANDLERS ---

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setData((prev) =>
      prev.map((mail) =>
        mail.id === id ? { ...mail, isStarred: !mail.isStarred } : mail
      )
    );
  };

  const toggleRead = (id: string, status: boolean) => {
    setData((prev) =>
      prev.map((mail) => (mail.id === id ? { ...mail, isRead: status } : mail))
    );
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

  // --- RENDER ---

  return (
    <div className="flex h-screen w-full bg-graphite-background text-graphite-foreground overflow-hidden font-sans">
      <Sidebar.Provider defaultOpen={false}>
        {/* LEFT SIDEBAR (Navigation) */}
        <DashboardSidebar onCompose={() => setIsComposeOpen(true)} />

        {/* MAIN CONTENT AREA */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* TOP HEADER */}
          <DashboardHeader
            searchValue={searchQuery}
            onSearch={setSearchQuery}
          />

          {/* SPLIT VIEW CONTAINER */}
          <div className="flex flex-1 overflow-hidden relative">
            {/* MAIL LIST (THE TABLE) */}
            <div
              className={clsx(
                "flex flex-col transition-all duration-300 ease-in-out",
                isDetailOpen
                  ? "w-1/2 min-w-[400px] border-r border-graphite-border"
                  : "w-full"
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
                      .includes(searchQuery.toLowerCase())
                )}
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                onRowClick={handleRowClick}
                onToggleStar={toggleStar}
                onDelete={handleDelete}
                compactMode={isDetailOpen}
              />
            </div>

            {/* DETAIL VIEW (THE "PUSH" SHEET) */}
            <AnimatePresence mode="wait">
              {isDetailOpen && selectedMail && (
                <motion.div
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex-1 bg-graphite-card min-w-[400px] shadow-2xl z-10"
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

      {/* COMPOSE MODAL */}
      <ComposeModal open={isComposeOpen} onOpenChange={setIsComposeOpen} />
    </div>
  );
};

// ============================================================================
// 4. SUB-COMPONENTS
// ============================================================================

// --- SIDEBAR ---
const DashboardSidebar = ({ onCompose }: { onCompose: () => void }) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className="border-r border-graphite-border bg-graphite-background pt-2"
      collapsedWidth="4.5rem"
      width="16rem"
      layout="inset"
      expandOnHover={true}
    >
      <div className=" mb-4">
        <FAB
          icon={<Plus size={16} />}
          variant="primary"
          size="lg"
          isExtended={!isCollapsed}
          onClick={onCompose}
        >
          <div className="flex items-center gap-3">
            {!isCollapsed && (
              <span className="font-semibold text-sm">Compose</span>
            )}
          </div>
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

// --- HEADER ---
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
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-graphite-foreground/50 group-focus-within:text-graphite-primary transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-3 rounded-full bg-graphite-secondary/50 border-transparent focus:bg-graphite-card focus:border-transparent focus:ring-2 focus:ring-graphite-ring/20 focus:shadow-md transition-all sm:text-sm outline-none"
            placeholder="Search mail"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <IconButton variant="ghost" size="sm" className="rounded-full">
              <Filter className="h-4 w-4 opacity-50" />
            </IconButton>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 min-w-[140px] justify-end">
        <IconButton variant="ghost">
          <AlertCircle className="h-6 w-6 opacity-60" />
        </IconButton>
        <IconButton variant="ghost">
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

// --- MAIL LIST (TABLE) ---
interface MailListProps {
  data: MailItem[];
  rowSelection: Record<string, boolean>;
  setRowSelection: (val: any) => void;
  onRowClick: (mail: MailItem) => void;
  onToggleStar: (e: React.MouseEvent, id: string) => void;
  onDelete: (ids: string[]) => void;
  compactMode: boolean;
}

const MailList = ({
  data,
  rowSelection,
  setRowSelection,
  onRowClick,
  onToggleStar,
  onDelete,
  compactMode,
}: MailListProps) => {
  // Define Table Columns
  const columns: ColumnDef<MailItem>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="pl-4">
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onChange={(e) =>
                table.toggleAllPageRowsSelected(!!e.target.checked)
              }
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="pl-4" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onChange={(e) => row.toggleSelected(!!e.target.checked)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        id: "star",
        cell: ({ row }) => (
          <div
            onClick={(e) => onToggleStar(e, row.original.id)}
            className="cursor-pointer p-1"
          >
            <Star
              className={clsx(
                "h-5 w-5 transition-colors",
                row.original.isStarred
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-graphite-foreground/30 hover:text-graphite-foreground/60"
              )}
            />
          </div>
        ),
        size: 40,
      },
      {
        accessorKey: "sender.name",
        header: "Sender",
        cell: ({ row }) => (
          <div
            className={clsx(
              "truncate font-medium",
              !row.original.isRead && "font-bold text-graphite-foreground"
            )}
          >
            {row.original.sender.name}
          </div>
        ),
        size: compactMode ? 140 : 200,
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 truncate max-w-full">
            {row.original.labels.length > 0 && (
              <div className="flex gap-1 shrink-0">
                {row.original.labels.map((l) => (
                  <MailLabelBadge key={l} label={l} />
                ))}
              </div>
            )}
            <span
              className={clsx(
                "truncate",
                !row.original.isRead ? "font-bold text-graphite-foreground" : ""
              )}
            >
              {row.original.subject}
            </span>
            <span className="text-graphite-foreground/60 truncate hidden sm:inline">
              - {row.original.snippet}
            </span>
          </div>
        ),
      },
      {
        id: "actions", // Actions overlay on hover
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-graphite-background/80 backdrop-blur-sm absolute right-0 top-0 bottom-0 px-2 shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
            <TooltipProvider>
              <TooltipTrigger>
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Archive logic
                  }}
                >
                  <Archive className="h-4 w-4" />
                </IconButton>
              </TooltipTrigger>
              <Tooltip>Archive</Tooltip>

              <TooltipTrigger>
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete([row.original.id]);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </TooltipTrigger>
              <Tooltip>Delete</Tooltip>

              <TooltipTrigger>
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail className="h-4 w-4" />
                </IconButton>
              </TooltipTrigger>
              <Tooltip>Mark as unread</Tooltip>
            </TooltipProvider>
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
          const date = row.original.date;
          const isToday = new Date().toDateString() === date.toDateString();
          return (
            <div
              className={clsx(
                "text-xs text-right whitespace-nowrap font-medium",
                !row.original.isRead
                  ? "text-graphite-foreground"
                  : "text-graphite-foreground/60"
              )}
            >
              {isToday ? format(date, "h:mm a") : format(date, "MMM d")}
            </div>
          );
        },
        size: 80,
      },
    ],
    [compactMode, onToggleStar, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="flex flex-col h-full">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-graphite-border bg-graphite-background h-12 shrink-0">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onChange={(e) =>
              table.toggleAllPageRowsSelected(!!e.target.checked)
            }
          />
          <IconButton variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
          {selectedCount > 0 ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Typography variant="small" className="font-semibold mx-2">
                {selectedCount} selected
              </Typography>
              <TooltipProvider>
                <TooltipTrigger>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const selectedIds = table
                        .getSelectedRowModel()
                        .rows.map((r) => r.original.id);
                      onDelete(selectedIds);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </TooltipTrigger>
                <Tooltip>Delete</Tooltip>
              </TooltipProvider>
              <IconButton variant="ghost" size="sm">
                <Archive className="h-4 w-4" />
              </IconButton>
              <IconButton variant="ghost" size="sm">
                <Mail className="h-4 w-4" />
              </IconButton>
            </div>
          ) : (
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <div className="h-4 w-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
              </div>
            </IconButton>
          )}
          <IconButton variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </IconButton>
        </div>

        <div className="flex items-center gap-2 text-xs text-graphite-foreground/60">
          <span>1-50 of {data.length}</span>
          <IconButton variant="ghost" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
          <IconButton variant="ghost" size="sm">
            <ChevronRight className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      {/* TABLE BODY */}
      <ElasticScrollArea className="flex-1 bg-white dark:bg-graphite-background">
        <div className="w-full">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row.original)}
                  className={clsx(
                    "group relative border-b border-graphite-border/50 hover:shadow-md hover:z-10 hover:border-transparent transition-all cursor-pointer",
                    row.original.isRead
                      ? "bg-white dark:bg-graphite-background"
                      : "bg-[#f2f6fc] dark:bg-graphite-secondary/20",
                    row.getIsSelected() && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                >
                  <td className="w-10 pl-4 py-2 align-middle">
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={row.getIsSelected()}
                        onChange={(e) => row.toggleSelected(!!e.target.checked)}
                      />
                    </div>
                  </td>
                  <td className="w-10 py-2 align-middle">
                    <div onClick={(e) => onToggleStar(e, row.original.id)}>
                      <Star
                        className={clsx(
                          "h-5 w-5 transition-colors",
                          row.original.isStarred
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 hover:text-gray-500"
                        )}
                      />
                    </div>
                  </td>
                  <td
                    className={clsx(
                      "py-3 pr-4 align-middle whitespace-nowrap",
                      !row.original.isRead
                        ? "font-bold text-graphite-foreground"
                        : "font-medium text-graphite-foreground/80"
                    )}
                    style={{ width: compactMode ? "140px" : "200px" }}
                  >
                    <span className="truncate block w-full">
                      {row.original.sender.name}
                    </span>
                  </td>
                  <td className="py-3 pr-4 align-middle relative">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {row.original.labels.map((l) => (
                        <div key={l} className="shrink-0">
                          <MailLabelBadge label={l} />
                        </div>
                      ))}
                      <span
                        className={clsx(
                          "truncate",
                          !row.original.isRead
                            ? "font-bold text-graphite-foreground"
                            : "text-graphite-foreground/80"
                        )}
                      >
                        {row.original.subject}
                      </span>
                      <span className="text-gray-400 truncate hidden md:inline">
                        - {row.original.snippet}
                      </span>
                    </div>

                    {/* Hover Actions (Absolute positioned) */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center bg-inherit shadow-[-10px_0_10px_-5px_rgba(255,255,255,1)] dark:shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.5)] pl-2">
                      <IconButton
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete([row.original.id]);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                      </IconButton>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Archive className="h-4 w-4 text-gray-500" />
                      </IconButton>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Clock className="h-4 w-4 text-gray-500" />
                      </IconButton>
                    </div>
                  </td>
                  {/* Date Column - Hidden if compact mode gets too small, or keep it fixed */}
                  {!compactMode && (
                    <td
                      className={clsx(
                        "py-3 pr-4 text-right whitespace-nowrap text-xs w-24",
                        !row.original.isRead
                          ? "font-bold"
                          : "font-medium text-gray-500"
                      )}
                    >
                      {format(row.original.date, "MMM d")}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ElasticScrollArea>
    </div>
  );
};

// --- MAIL DETAIL VIEW ---
interface MailDetailViewProps {
  mail: MailItem;
  onClose: () => void;
  onDelete: () => void;
}

const MailDetailView = ({ mail, onClose, onDelete }: MailDetailViewProps) => {
  return (
    <div className="flex flex-col h-full bg-graphite-card">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-graphite-border h-12 shrink-0">
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <TooltipTrigger>
              <IconButton variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="h-5 w-5" />
              </IconButton>
            </TooltipTrigger>
            <Tooltip>Back to inbox</Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <TooltipTrigger>
              <IconButton variant="ghost" size="sm">
                <Archive className="h-4 w-4" />
              </IconButton>
            </TooltipTrigger>
            <Tooltip>Archive</Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <TooltipTrigger>
              <IconButton variant="ghost" size="sm">
                <AlertCircle className="h-4 w-4" />
              </IconButton>
            </TooltipTrigger>
            <Tooltip>Report spam</Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <TooltipTrigger>
              <IconButton variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </TooltipTrigger>
            <Tooltip>Delete</Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-1">
          <IconButton variant="ghost" size="sm">
            <Printer className="h-4 w-4" />
          </IconButton>
          <IconButton variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      {/* CONTENT */}
      <ElasticScrollArea className="flex-1">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-2xl font-normal text-graphite-foreground leading-snug">
              {mail.subject}
              {mail.labels.map((l) => (
                <span key={l} className="ml-3 align-middle">
                  <MailLabelBadge label={l} />
                </span>
              ))}
            </h1>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                shape="minimal"
                className="text-xs font-mono"
              >
                Inbox
              </Badge>
            </div>
          </div>

          <div className="flex items-start gap-4 mb-6">
            <Avatar
              src={mail.sender.avatar}
              fallback={mail.sender.name.slice(0, 1)}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-graphite-foreground">
                    {mail.sender.name}
                  </span>
                  <span className="text-sm text-graphite-foreground/60">
                    &lt;{mail.sender.email}&gt;
                  </span>
                </div>
                <div className="text-xs text-graphite-foreground/50">
                  {format(mail.date, "PPP p")} ({formatDistanceToNow(mail.date)}{" "}
                  ago)
                </div>
              </div>
              <div className="text-xs text-graphite-foreground/50 mt-0.5">
                to me
              </div>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-graphite-foreground/90 whitespace-pre-line text-sm leading-relaxed">
            {mail.body}
          </div>

          {mail.hasAttachment && (
            <div className="mt-8 pt-4 border-t border-graphite-border">
              <Typography variant="small" className="font-semibold mb-3">
                2 Attachments
              </Typography>
              <div className="flex gap-4">
                <Card
                  variant="secondary"
                  shape="minimal"
                  className="w-48 p-0 overflow-hidden group cursor-pointer border border-transparent hover:border-graphite-border transition-all"
                >
                  <div className="h-24 bg-graphite-border/30 flex items-center justify-center">
                    <File className="h-8 w-8 text-graphite-foreground/40" />
                  </div>
                  <div className="p-3 bg-graphite-card">
                    <div className="text-sm font-medium truncate">
                      Quarterly_Report.pdf
                    </div>
                    <div className="text-xs text-graphite-foreground/50">
                      2.4 MB
                    </div>
                  </div>
                </Card>
                <Card
                  variant="secondary"
                  shape="minimal"
                  className="w-48 p-0 overflow-hidden group cursor-pointer border border-transparent hover:border-graphite-border transition-all"
                >
                  <div className="h-24 bg-graphite-border/30 flex items-center justify-center">
                    <div className="h-full w-full bg-blue-100 dark:bg-blue-900/20" />
                  </div>
                  <div className="p-3 bg-graphite-card">
                    <div className="text-sm font-medium truncate">
                      Meeting_Notes.docx
                    </div>
                    <div className="text-xs text-graphite-foreground/50">
                      14 KB
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          <div className="mt-12 flex gap-4">
            <Button
              variant="secondary"
              className="rounded-full px-6 border border-graphite-border"
              startIcon={<Reply className="h-4 w-4" />}
            >
              Reply
            </Button>
            <Button
              variant="secondary"
              className="rounded-full px-6 border border-graphite-border"
              startIcon={<ReplyAll className="h-4 w-4" />}
            >
              Reply All
            </Button>
            <Button
              variant="secondary"
              className="rounded-full px-6 border border-graphite-border"
              startIcon={<ArrowLeft className="h-4 w-4 rotate-180" />}
            >
              Forward
            </Button>
          </div>
        </div>
      </ElasticScrollArea>
    </div>
  );
};

// --- COMPOSE MODAL ---
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
              variant="minimal"
              placeholder="Recipients"
              rootClassName="px-4 py-2"
              inputClassName="text-sm"
            />
          </div>
          <div className="border-b border-graphite-border/50">
            <Input
              variant="minimal"
              placeholder="Subject"
              rootClassName="px-4 py-2"
              inputClassName="text-sm font-medium"
            />
          </div>
          <TextArea
            variant="minimal"
            placeholder=""
            className="flex-1 resize-none p-4 text-sm leading-relaxed"
            wrapperClassName="h-full"
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
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
