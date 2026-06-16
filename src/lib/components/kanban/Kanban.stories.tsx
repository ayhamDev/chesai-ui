// src/lib/components/kanban/Kanban.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Kanban, type KanbanColumnData } from "./index";
import { Card } from "../card";
import { Typography } from "../typography";
import { Avatar } from "../avatar";
import { AvatarGroup } from "../avatar/AvatarGroup";
import { Badge } from "../badge";
import { Button } from "../button";
import {
  MessageSquare,
  MoreHorizontal,
  Calendar,
  AlertCircle,
  GripVertical,
  Paperclip,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { IconButton } from "../icon-button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../dropdown-menu";
import { toast } from "../toast";
import { ChesaiProvider } from "../../context/ChesaiProvider";
import { useDialog } from "../../context/DialogProvider";

const meta: Meta<typeof Kanban> = {
  title: "Components/Data/Kanban",
  component: Kanban,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A stunning, full-featured Kanban board powered by `@dnd-kit`. Completely customizable via render props. Features matching MD3 semantic card variations, spring physics during drag, robust cross-column drops, native scrolling, and dynamic inspection modals.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "tertiary",
        "high-contrast",
        "ghost",
        "surface",
        "surface-container-lowest",
        "surface-container-low",
        "surface-container",
        "surface-container-high",
        "surface-container-highest",
      ],
      description:
        "Controls the background and theme styles of columns, matching Card semantic variants.",
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description:
        "Controls the boundary rounding styles, matching Card semantic shapes.",
    },
    elevation: {
      control: "select",
      options: ["none", 1, 2, 3, 4, 5],
      description: "Defines the columns container level of shadowing.",
    },
    bordered: {
      control: "boolean",
      description: "Enables standard card layout borders on column containers.",
    },
    glass: {
      control: "boolean",
      description:
        "Enables polished backdrop-blur glassmorphism effects across lists.",
    },
  },
  decorators: [
    (Story) => (
      <ChesaiProvider>
        <div className="h-screen w-full bg-surface-container flex flex-col overflow-hidden font-manrope">
          <Story />
        </div>
      </ChesaiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Kanban>;

// --- MOCK DATA ---
type Task = {
  id: string;
  title: string;
  priority: "Low" | "Medium" | "High";
  tag: string;
  comments: number;
  attachments: number;
  assignees?: string[];
  dueDate?: string;
  isDone?: boolean;
};

const INITIAL_DATA: KanbanColumnData<Task>[] = [
  {
    id: "col-todo",
    title: "To Do",
    items: [
      {
        id: "task-1",
        title: "Research competitor pricing models and feature sets",
        tag: "Research",
        priority: "Medium",
        comments: 2,
        attachments: 0,
        assignees: ["https://i.pravatar.cc/150?u=a"],
        dueDate: "Oct 12",
      },
      {
        id: "task-2",
        title: "Design new landing page layouts for V2",
        tag: "Design",
        priority: "High",
        comments: 5,
        attachments: 3,
        assignees: [
          "https://i.pravatar.cc/150?u=b",
          "https://i.pravatar.cc/150?u=x",
        ],
      },
    ],
  },
  {
    id: "col-progress",
    title: "In Progress",
    items: [
      {
        id: "task-4",
        title: "Implement drag and drop Kanban board",
        tag: "Engineering",
        priority: "High",
        comments: 12,
        attachments: 4,
        assignees: ["https://i.pravatar.cc/150?u=c"],
        dueDate: "Today",
      },
    ],
  },
  {
    id: "col-done",
    title: "Done",
    items: [
      {
        id: "task-7",
        title: "Fix navigation layout shift on mobile",
        tag: "Bug",
        priority: "High",
        comments: 8,
        attachments: 1,
        assignees: ["https://i.pravatar.cc/150?u=f"],
        dueDate: "Oct 5",
        isDone: true,
      },
    ],
  },
];

export const AdvancedImplementation: Story = {
  name: "Project Management Template",
  args: {
    variant: "surface-container-low",
    shape: "minimal",
    elevation: "none",
    bordered: false,
    glass: false,
  },
  render: (args) => {
    const [columns, setColumns] = useState(INITIAL_DATA);
    const { show } = useDialog();

    // --- RENDER CUSTOM CARD ---
    const renderCard = (task: Task, isDragging: boolean) => {
      return (
        <Card
          variant={task.isDone ? "surface-container-lowest" : "surface"}
          shape="minimal"
          padding="sm"
          className={`cursor-grab active:cursor-grabbing border relative group transition-all duration-200 ${
            isDragging
              ? "border-primary shadow-2xl"
              : "border-outline-variant hover:border-outline shadow-sm hover:shadow-md"
          } ${task.isDone ? "opacity-60" : ""}`}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                shape="minimal"
                className="text-[10px] font-bold uppercase tracking-wider bg-surface-container-highest"
              >
                {task.tag}
              </Badge>
              <div className="flex gap-1">
                <div
                  className={`w-2 h-2 rounded-full mt-1 ${
                    task.priority === "High"
                      ? "bg-error"
                      : task.priority === "Medium"
                        ? "bg-orange-500"
                        : "bg-blue-500"
                  }`}
                />
              </div>
            </div>

            <Typography
              variant="body-medium"
              className={`font-semibold leading-snug ${task.isDone ? "line-through text-on-surface-variant" : "text-on-surface"}`}
            >
              {task.title}
            </Typography>

            <div className="flex items-center justify-between mt-2 pt-3 border-t border-outline-variant/30">
              <div className="flex items-center gap-3 text-on-surface-variant opacity-80">
                {task.dueDate && (
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold ${task.dueDate === "Today" ? "text-error opacity-100" : ""}`}
                  >
                    <Calendar size={13} />
                    <span>{task.dueDate}</span>
                  </div>
                )}

                {(task.comments > 0 || task.attachments > 0) && (
                  <div className="flex items-center gap-2">
                    {task.comments > 0 && (
                      <div className="flex items-center gap-1 text-xs font-semibold">
                        <MessageSquare size={13} />
                        <span>{task.comments}</span>
                      </div>
                    )}
                    {task.attachments > 0 && (
                      <div className="flex items-center gap-1 text-xs font-semibold">
                        <Paperclip size={13} />
                        <span>{task.attachments}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center">
                {task.assignees ? (
                  <AvatarGroup max={2}>
                    {task.assignees.map((src, i) => (
                      <Avatar
                        key={i}
                        src={src}
                        size="xs"
                        shape="full"
                        className="w-6 h-6 border-2 border-surface"
                      />
                    ))}
                  </AvatarGroup>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-surface-container-highest border-2 border-surface border-dashed flex items-center justify-center">
                    <AlertCircle
                      size={12}
                      className="text-on-surface-variant opacity-50"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      );
    };

    // --- RENDER CUSTOM COLUMN HEADER ---
    const renderHeader = (
      col: KanbanColumnData<Task>,
      dragHandleProps: any,
    ) => {
      const isDone = col.title.toLowerCase().includes("done");

      return (
        <div className="flex items-center justify-between p-4 bg-transparent group">
          <div className="flex items-center gap-2.5">
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity hover:bg-on-surface/10"
            >
              <GripVertical className="w-4 h-4" />
            </div>

            {isDone ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <div
                className={`w-3 h-3 rounded-full ${
                  col.title.includes("To Do")
                    ? "bg-blue-500"
                    : col.title.includes("Progress")
                      ? "bg-orange-500"
                      : "bg-purple-500"
                }`}
              />
            )}

            <Typography
              variant="title-small"
              className="font-bold tracking-tight text-inherit!"
            >
              {col.title}
            </Typography>
            <span className="flex items-center justify-center bg-surface-container-highest px-2 py-0.5 rounded-full text-xs font-bold text-on-surface-variant ml-1">
              {col.items.length}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                variant="ghost"
                size="sm"
                className="opacity-50 hover:opacity-100"
              >
                <MoreHorizontal size={18} />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => toast("Editing column " + col.title)}
              >
                Edit Column
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-error">
                Archive All Cards
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    };

    // --- RENDER CUSTOM COLUMN FOOTER ---
    const renderFooter = (col: KanbanColumnData<Task>) => (
      <Button
        variant="ghost"
        className="w-full justify-start text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50 h-10"
        startIcon={<Plus className="w-4 h-4" />}
        onClick={() => {
          setColumns((prev) =>
            prev.map((c) => {
              if (c.id === col.id) {
                return {
                  ...c,
                  items: [
                    ...c.items,
                    {
                      id: `task-${Date.now()}`,
                      title: "New Blank Task",
                      tag: "Misc",
                      priority: "Low",
                      comments: 0,
                      attachments: 0,
                    },
                  ],
                };
              }
              return c;
            }),
          );
          toast.success("Task added");
        }}
      >
        Create Issue
      </Button>
    );

    return (
      <div className="flex flex-col h-full w-full">
        {/* Mock App Header */}
        <header className="h-16 px-6 border-b border-outline-variant/40 bg-surface flex items-center justify-between shrink-0 z-10">
          <div>
            <Typography variant="title-medium" className="font-bold">
              Sprint 43 Roadmap
            </Typography>
            <Typography
              variant="body-small"
              className="text-on-surface-variant"
            >
              Engineering Team
            </Typography>
          </div>
          <div className="flex items-center gap-3">
            <AvatarGroup max={4}>
              <Avatar src="https://i.pravatar.cc/150?u=1" size="sm" />
              <Avatar src="https://i.pravatar.cc/150?u=2" size="sm" />
              <Avatar src="https://i.pravatar.cc/150?u=3" size="sm" />
            </AvatarGroup>
            <Button variant="primary" size="sm" startIcon={<Plus size={16} />}>
              New Task
            </Button>
          </div>
        </header>

        {/* The Kanban Board */}
        <div className="flex-1 overflow-hidden bg-transparent">
          <Kanban
            columns={columns}
            columnWidth={340}
            variant={args.variant}
            shape={args.shape}
            bordered={args.bordered}
            elevation={args.elevation}
            glass={args.glass}
            onChange={setColumns}
            renderCard={renderCard}
            renderColumnHeader={renderHeader}
            renderColumnFooter={renderFooter}
            onCardClick={(task) => {
              show({
                title: task.title,
                description: `Task Identifier: ${task.id}`,
                body: (
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex gap-2">
                      <Badge variant="primary">{task.tag}</Badge>
                      <Badge
                        variant={
                          task.priority === "High" ? "destructive" : "secondary"
                        }
                      >
                        {task.priority} Priority
                      </Badge>
                      {task.isDone && (
                        <Badge variant="secondary">Completed</Badge>
                      )}
                    </div>
                    <Typography
                      variant="body-medium"
                      className="opacity-80 leading-relaxed"
                    >
                      This inspector modal displays details about this specific
                      taskcard.
                    </Typography>
                  </div>
                ),
                confirmLabel: "Done",
                cancelLabel: "Archive Task",
                onCancel: () => {
                  toast(`Task ${task.id} has been archived.`);
                },
              });
            }}
            boardTrailingContent={
              <Button
                variant="ghost"
                className={`w-full h-14 border-2 border-dashed border-outline-variant/60 hover:border-primary/50 hover:bg-surface-container-highest text-on-surface-variant ${args.shape === "full" ? "rounded-3xl" : args.shape === "minimal" ? "rounded-xl" : "rounded-none"}`}
                startIcon={<Plus />}
                onClick={() => {
                  setColumns([
                    ...columns,
                    { id: `col-${Date.now()}`, title: "New Column", items: [] },
                  ]);
                  toast.success("Column added");
                }}
              >
                Add Column
              </Button>
            }
          />
        </div>
      </div>
    );
  },
};
