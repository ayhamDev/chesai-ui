import type { Meta, StoryObj } from "@storybook/react";
import { Check, Plus, Shuffle, Trash2, User } from "lucide-react";
import { useState } from "react";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { Button } from "../button";
import { Card } from "../card";
import { IconButton } from "../icon-button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../item";
import { Typography } from "../typography";
import { Flex, FlexItem } from "./flex";

const meta: Meta<typeof Flex> = {
  title: "Components/Layout/Flex",
  component: Flex,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Demonstrating robust addition and removal animations using `Flex` and `FlexItem`. The `popLayout` mode ensures removed items don't leave layout gaps.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Flex>;

// --- MOCK DATA GENERATOR ---
const NAMES = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Ethan",
  "Fiona",
  "George",
  "Hannah",
];
const ROLES = ["Designer", "Engineer", "Manager", "Director", "Support"];

const generateUser = () => {
  const id = Math.random().toString(36).substr(2, 9);
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const role = ROLES[Math.floor(Math.random() * ROLES.length)];
  return { id, name, role, status: "Active" };
};

export const TaskManager: Story = {
  name: "Interactive Task Manager",
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [users, setUsers] = useState(() => [
      generateUser(),
      generateUser(),
      generateUser(),
    ]);

    const addUser = () => {
      setUsers((prev) => [generateUser(), ...prev]);
    };

    const removeUser = (id: string) => {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    };

    const shuffleUsers = () => {
      setUsers((prev) => [...prev].sort(() => Math.random() - 0.5));
    };

    return (
      <Card className="w-full max-w-md mx-auto" padding="lg">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Typography variant="title-medium">Team Members</Typography>
            <Typography variant="body-small" muted>
              {users.length} active members
            </Typography>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={shuffleUsers}
              startIcon={<Shuffle size={14} />}
            >
              Shuffle
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={addUser}
              startIcon={<Plus size={14} />}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Animated List */}
        <Flex direction="column" gap="sm" className="min-h-[300px]">
          {users.map((user) => (
            <FlexItem key={user.id}>
              <Item
                variant="secondary"
                shape="minimal"
                className="bg-surface-container-high border border-transparent hover:border-outline-variant transition-colors"
              >
                <ItemMedia variant="avatar">
                  <Avatar
                    fallback={user.name[0]}
                    size="md"
                    className="bg-primary-container text-on-primary-container"
                  />
                </ItemMedia>

                <ItemContent>
                  <ItemTitle>{user.name}</ItemTitle>
                  <ItemDescription className="flex items-center gap-2">
                    {user.role}
                    <Badge
                      variant="secondary"
                      shape="full"
                      className="h-4 px-1.5 text-[10px]"
                    >
                      {user.status}
                    </Badge>
                  </ItemDescription>
                </ItemContent>

                <ItemActions>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    className="text-error hover:bg-error/10"
                    onClick={() => removeUser(user.id)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </ItemActions>
              </Item>
            </FlexItem>
          ))}

          {users.length === 0 && (
            <FlexItem key="empty-state">
              <div className="h-40 flex flex-col items-center justify-center text-center border-2 border-dashed border-outline-variant rounded-xl">
                <Typography variant="body-medium" muted>
                  No team members found.
                </Typography>
                <Button variant="link" onClick={addUser}>
                  Create one?
                </Button>
              </div>
            </FlexItem>
          )}
        </Flex>
      </Card>
    );
  },
};

export const NotificationStack: Story = {
  name: "Toast/Notification Stack",
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [notifications, setNotifications] = useState([
      { id: "1", title: "New Message", time: "Just now" },
      { id: "2", title: "System Update", time: "2m ago" },
    ]);

    const addNotification = () => {
      const id = Date.now().toString();
      setNotifications((prev) => [
        { id, title: `Notification ${prev.length + 1}`, time: "Just now" },
        ...prev,
      ]);
    };

    const dismiss = (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
      <div className="w-80 relative h-[400px] border border-outline-variant bg-surface-container-low rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 bg-surface shadow-sm z-10 flex justify-between items-center">
          <Typography variant="label-large" className="font-bold">
            Notifications
          </Typography>
          <IconButton variant="ghost" size="sm" onClick={addNotification}>
            <Plus size={16} />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Note: We use direction="column-reverse" to stack from bottom if desired, but here standard column */}
          <Flex direction="column" gap="sm">
            {notifications.map((n) => (
              <FlexItem key={n.id}>
                <Card
                  variant="surface"
                  elevation={1}
                  padding="sm"
                  className="flex items-start gap-3 border border-outline-variant/50"
                >
                  <div className="mt-0.5 bg-primary text-on-primary rounded-full p-1">
                    <Check size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Typography variant="label-medium" className="font-bold">
                      {n.title}
                    </Typography>
                    <Typography variant="body-small" muted>
                      {n.time}
                    </Typography>
                  </div>
                  <button
                    onClick={() => dismiss(n.id)}
                    className="text-on-surface-variant hover:text-error transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </Card>
              </FlexItem>
            ))}
          </Flex>
        </div>
      </div>
    );
  },
};
