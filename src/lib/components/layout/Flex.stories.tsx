import type { Meta, StoryObj } from "@storybook/react";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { Card } from "../card";
import { Typography } from "../typography";
import { Flex, FlexItem } from "./flex";

const meta: Meta<typeof Flex> = {
  title: "Components/Layout/Flex",
  component: Flex,
  // Cast to avoid strict typing issues with subcomponents in some Storybook versions
  subcomponents: { FlexItem } as Record<string, React.ComponentType<any>>,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A flexible box layout powered by Framer Motion. It supports standard flex props and automatic layout animations (FLIP) when items are added, removed, or reordered.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Flex>;

// --- BASIC USAGE ---

export const HorizontalStack: Story = {
  name: "Horizontal Stack",
  render: () => (
    <Card className="p-6">
      <Typography variant="title-small" className="mb-4">
        Team Members
      </Typography>
      <Flex align="center" gap="md">
        {[1, 2, 3, 4].map((i) => (
          <FlexItem key={i}>
            <Avatar fallback={`U${i}`} className="bg-blue-100 text-blue-700" />
          </FlexItem>
        ))}
        <Button size="xs" variant="secondary" className="rounded-full">
          <Plus size={16} />
        </Button>
      </Flex>
    </Card>
  ),
};

export const VerticalStack: Story = {
  name: "Vertical Stack",
  render: () => (
    <Card className="max-w-md p-0 overflow-hidden">
      <div className="bg-graphite-secondary p-4 border-b border-graphite-border">
        <Typography variant="title-small">Notifications</Typography>
      </div>
      <Flex direction="column" gap="none" className="divide-y divide-gray-100">
        {[
          { title: "New Message", time: "2m ago" },
          { title: "Friend Request", time: "1h ago" },
          { title: "System Update", time: "1d ago" },
        ].map((item, i) => (
          <FlexItem
            key={i}
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Flex justify="between" align="center">
              <Typography variant="body-small" className="font-medium">
                {item.title}
              </Typography>
              <Typography variant="body-small" muted={true} className="text-xs">
                {item.time}
              </Typography>
            </Flex>
          </FlexItem>
        ))}
      </Flex>
    </Card>
  ),
};

// --- WRAPPING & TAGS ---

export const TagsLayout: Story = {
  name: "Wrap (Tags)",
  render: () => {
    const tags = [
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "Storybook",
      "Design Systems",
      "Accessibility",
      "Performance",
      "UX/UI",
      "Testing",
    ];

    return (
      <div className="max-w-md">
        <Typography variant="title-small" className="mb-4">
          Skills
        </Typography>
        <Flex wrap="wrap" gap="sm">
          {tags.map((tag) => (
            <FlexItem key={tag}>
              <div className="px-3 py-1.5 rounded-full bg-graphite-secondary border border-graphite-border text-sm font-medium hover:border-black/20 transition-colors cursor-default">
                {tag}
              </div>
            </FlexItem>
          ))}
        </Flex>
      </div>
    );
  },
};

// --- INTERACTIVE ANIMATION ---

export const Interactive: Story = {
  name: "Animated List",
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [tasks, setTasks] = useState([
      { id: 1, text: "Review Pull Requests", priority: "High" },
      { id: 2, text: "Update Documentation", priority: "Medium" },
      { id: 3, text: "Fix Navigation Bug", priority: "High" },
    ]);

    const addTask = () => {
      const id = Date.now();
      setTasks((prev) => [
        { id, text: `New Task #${id.toString().slice(-4)}`, priority: "Low" },
        ...prev,
      ]);
    };

    const removeTask = (id: number) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    };

    return (
      <div className="max-w-lg">
        <Flex justify="between" align="center" className="mb-6">
          <Typography variant="title-medium">Task Board</Typography>
          <Button onClick={addTask} size="sm">
            <Plus size={16} className="mr-2" /> Add Task
          </Button>
        </Flex>

        <Flex direction="column" gap="sm">
          {tasks.map((task) => (
            <FlexItem key={task.id}>
              <Card className="flex items-center justify-between p-4 group hover:shadow-md transition-shadow">
                <Flex align="center" gap="md">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      task.priority === "High"
                        ? "bg-red-500"
                        : task.priority === "Medium"
                          ? "bg-orange-500"
                          : "bg-green-500"
                    }`}
                  />
                  <Typography>{task.text}</Typography>
                </Flex>
                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="p-2 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Delete task"
                >
                  <X size={18} />
                </button>
              </Card>
            </FlexItem>
          ))}
          {tasks.length === 0 && (
            <FlexItem key="empty">
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <Typography variant="body-small" muted={true}>
                  No tasks remaining
                </Typography>
                <Button variant="link" onClick={addTask}>
                  Create one?
                </Button>
              </div>
            </FlexItem>
          )}
        </Flex>
      </div>
    );
  },
};
