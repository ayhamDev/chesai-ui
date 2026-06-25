// src/lib/components/item/ItemSwipe.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import {
  Archive,
  Check,
  CheckCircle2,
  ChevronDown,
  FolderArchive,
  Inbox,
  Pin,
  RotateCcw,
  Star,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { Toaster, toast } from "../toast";
import { Typography } from "../typography";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemExpandedContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "./index";

const meta: Meta<typeof Item> = {
  title: "Components/Data/Item (Swipe Features)",
  component: Item,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

// ============================================================================
// 1. GMAIL INBOX CLONE (Trigger Action - Multi-directional)
// ============================================================================
interface InboxMail {
  id: string;
  sender: string;
  subject: string;
  body: string;
  time: string;
  avatar: string;
  starred: boolean;
}

const initialMails: InboxMail[] = [
  {
    id: "mail-1",
    sender: "npm registry",
    subject: "Published version 0.15.0 of chesai-ui",
    body: "Your package has been successfully compiled and deployed to public feeds.",
    time: "2:32 PM",
    avatar: "https://i.pravatar.cc/150?u=npm",
    starred: false,
  },
  {
    id: "mail-2",
    sender: "Ziad Al-Karimi",
    subject: "Design feedback on swipe physics",
    body: "Hey Ayham, the updated flush layout feels significantly better. The edges align perfectly.",
    time: "11:41 AM",
    avatar: "https://i.pravatar.cc/150?u=ziad",
    starred: true,
  },
  {
    id: "mail-3",
    sender: "Vercel deployments",
    subject: "Failed production build task",
    body: "Deploy of project 'chesai-ui' failed during type-checking phase. Click to inspect.",
    time: "Yesterday",
    avatar: "https://i.pravatar.cc/150?u=vercel",
    starred: false,
  },
];

export const GmailInboxStyle: StoryObj<typeof Item> = {
  name: "1. Gmail Style Inbox (Trigger)",
  parameters: {
    docs: {
      description: {
        story:
          "Multi-directional Trigger Action: Dragging right stars/unstars the email, while dragging left archives it. The row springs back instantly after firing.",
      },
    },
  },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [mails, setMails] = useState<InboxMail[]>(initialMails);

    const toggleStar = (id: string) => {
      setMails((prev) =>
        prev.map((mail) => {
          if (mail.id === id) {
            const nextState = !mail.starred;
            toast(nextState ? "Conversation starred" : "Star removed");
            return { ...mail, starred: nextState };
          }
          return mail;
        }),
      );
    };

    const archiveMail = (id: string) => {
      toast.success("Conversation archived");
      setMails((prev) => prev.filter((mail) => mail.id !== id));
    };

    const handleRestore = () => {
      setMails(initialMails);
      toast("Inbox restored to initial state");
    };

    return (
      <div className="relative w-[400px] bg-surface-container-lowest rounded-[32px] shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col font-sans">
        <Toaster />

        {/* Mobile Header Bar */}
        <div className="px-6 pt-8 pb-4 flex items-center justify-between border-b border-outline-variant/30 bg-surface-container-lowest">
          <div className="flex items-center gap-2.5">
            <Inbox className="h-5 w-5 text-primary" />
            <Typography
              variant="title-medium"
              className="font-extrabold text-on-surface"
            >
              Primary Mail
            </Typography>
          </div>
          {mails.length === 0 && (
            <button
              onClick={handleRestore}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          )}
        </div>

        {/* Swipe List */}
        <ItemGroup
          gap="none"
          shape="sharp"
          className="bg-surface-container-lowest"
        >
          {mails.map((mail) => (
            <Item
              key={mail.id}
              swipeType="trigger"
              swipeThreshold={100}
              swipeRightAction={{
                icon: <Star className="h-6 w-6" />,
                label: mail.starred ? "Unstar" : "Star",
                shape: "full",
                color: "tertiary",
                onClick: () => toggleStar(mail.id),
              }}
              swipeLeftAction={{
                icon: <Archive className="h-6 w-6" />,
                label: "Archive",
                shape: "full",

                color: "primary",
                onClick: () => archiveMail(mail.id),
              }}
              className="bg-surface-container-lowest border-b border-outline-variant/10 last:border-0 cursor-pointer"
            >
              <ItemMedia variant="avatar" className="self-start mt-1">
                <Avatar src={mail.avatar} fallback={mail.sender[0]} />
              </ItemMedia>
              <ItemContent>
                <div className="flex justify-between items-baseline mb-0.5">
                  <ItemTitle className="text-sm font-bold text-on-surface">
                    {mail.sender}
                  </ItemTitle>
                  <Typography
                    variant="body-small"
                    className="text-xs opacity-60"
                  >
                    {mail.time}
                  </Typography>
                </div>
                <div className="flex items-center gap-1.5">
                  <Typography
                    variant="body-medium"
                    className="font-semibold text-on-surface text-xs leading-none truncate"
                  >
                    {mail.subject}
                  </Typography>
                  {mail.starred && (
                    <Star className="h-3 w-3 fill-current text-tertiary shrink-0" />
                  )}
                </div>
                <ItemDescription className="text-xs opacity-60 line-clamp-1 mt-1">
                  {mail.body}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </div>
    );
  },
};

// ============================================================================
// 2. DISMISS AND COLLAPSE LIST (Dismiss Style)
// ============================================================================
interface AlertItem {
  id: string;
  source: string;
  message: string;
  avatar: string;
}

const initialAlerts: AlertItem[] = [
  {
    id: "alert-1",
    source: "Figma invites",
    message: "Carmen invite you to collaborate on 'chesai-ui-m3' draft.",
    avatar: "https://i.pravatar.cc/150?u=alert-1",
  },
  {
    id: "alert-2",
    source: "Weekly Digests",
    message: "Your weekly analytics report is compiled and ready.",
    avatar: "https://i.pravatar.cc/150?u=alert-2",
  },
];

export const DismissAndCollapse: StoryObj<typeof Item> = {
  name: "2. Notification dismissal (Dismiss)",
  parameters: {
    docs: {
      description: {
        story:
          "Dismiss Action: Sliding past the threshold triggers an off-screen tween animation followed by a clean, automatic layout collapse (height shrinks to 0).",
      },
    },
  },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);

    const handleDismiss = (id: string) => {
      toast("Alert cleared");
      setTimeout(() => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      }, 250);
    };

    return (
      <div className="relative w-[400px] bg-surface-container-lowest rounded-[32px] shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col font-sans">
        <Toaster />

        {/* Header */}
        <div className="px-6 pt-8 pb-4 flex items-center justify-between border-b border-outline-variant/30 bg-surface-container-lowest">
          <Typography
            variant="title-medium"
            className="font-extrabold text-on-surface flex items-center gap-2"
          >
            <CheckCircle2 className="h-5 w-5 text-error" /> Active Alerts
          </Typography>
          {alerts.length === 0 && (
            <button
              onClick={() => setAlerts(initialAlerts)}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restore
            </button>
          )}
        </div>

        {/* List */}
        <ItemGroup
          gap="none"
          shape="sharp"
          className="bg-surface-container-lowest"
        >
          {alerts.map((alert) => (
            <Item
              key={alert.id}
              swipeType="dismiss"
              swipeThreshold={120}
              swipeLeftAction={{
                icon: <Trash2 className="h-5 w-5" />,
                label: "Clear",
                color: "error", // Maps to native error background block
                onClick: () => handleDismiss(alert.id),
              }}
              className="bg-surface-container-lowest border-b border-outline-variant/10 last:border-0 cursor-pointer"
            >
              <ItemMedia variant="avatar">
                <Avatar src={alert.avatar} fallback={alert.source[0]} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="text-sm font-bold text-on-surface">
                  {alert.source}
                </ItemTitle>
                <ItemDescription className="text-xs opacity-60">
                  {alert.message}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </div>
    );
  },
};

// ============================================================================
// 3. PERSISTENT REVEAL DRAWER (iOS Style)
// ============================================================================
export const SwipeToRevealOptions: StoryObj<typeof Item> = {
  name: "3. Chat Options Drawer (Reveal)",
  parameters: {
    docs: {
      description: {
        story:
          "Persistent Reveal: Sliding reveals custom actionable buttons positioned statically underneath the card layer. Tapping anywhere on the active card automatically slides it shut.",
      },
    },
  },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isPinned, setIsPinned] = useState(false);

    return (
      <div className="relative w-[400px] bg-surface-container-lowest rounded-[32px] shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col font-sans">
        <Toaster />

        {/* Header */}
        <div className="px-6 pt-8 pb-4 border-b border-outline-variant/30 bg-surface-container-lowest">
          <Typography
            variant="title-medium"
            className="font-extrabold text-on-surface"
          >
            Messaging
          </Typography>
        </div>

        {/* Chat Item */}
        <Item
          swipeType="reveal"
          swipeLeftOffset={100}
          swipeLeftAction={{
            icon: <Pin className={`h-5 w-5 ${isPinned ? "rotate-45" : ""}`} />,
            label: isPinned ? "Unpin" : "Pin",
            color: "secondary",
            onClick: () => {
              setIsPinned((prev) => !prev);
              toast(
                isPinned
                  ? "Conversation unpinned"
                  : "Conversation pinned to top",
              );
            },
          }}
          className="bg-surface-container-lowest cursor-pointer"
        >
          <ItemMedia variant="avatar" className="self-start mt-1">
            <Avatar src="https://i.pravatar.cc/150?u=jack" fallback="JM" />
          </ItemMedia>
          <ItemContent>
            <div className="flex items-center gap-1.5">
              <ItemTitle className="text-sm font-bold text-on-surface">
                Jack Morrison
              </ItemTitle>
              {isPinned && (
                <Pin className="h-3 w-3 text-secondary fill-current rotate-45 shrink-0" />
              )}
            </div>
            <ItemDescription className="text-xs opacity-60">
              Swipe left to open the custom Pin/Unpin option drawer.
            </ItemDescription>
          </ItemContent>
        </Item>
      </div>
    );
  },
};

// ============================================================================
// 4. COMBINED ACTION: SWIPE-TO-DISMISS + EXPANSIBLE DRAWER
// ============================================================================
interface CombinedMessage {
  id: string;
  sender: string;
  time: string;
  avatar: string;
  message: string;
}

const initialCombined: CombinedMessage[] = [
  {
    id: "msg-1",
    sender: "Matt",
    time: "now",
    avatar: "https://i.pravatar.cc/150?u=matt",
    message:
      "Hey! Are we still down for meeting up on Saturday? I think Tyler wanted to as well.",
  },
  {
    id: "msg-2",
    sender: "Rebecca",
    time: "5m",
    avatar: "https://i.pravatar.cc/150?u=rebecca",
    message:
      "Are you coming over? I'm making a bunch of food for everyone and want to make sure I have enough.",
  },
];

const StatefulSwipeExpandItem = ({
  item,
  onDismiss,
}: {
  item: CombinedMessage;
  onDismiss: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Item
      expandable
      expanded={expanded}
      onExpandedChange={setExpanded}
      shape="full"
      variant="surface-container"
      swipeType="dismiss"
      swipeThreshold={120}
      swipeLeftAction={{
        icon: <Trash2 className="h-5 w-5" />,
        label: "Clear",
        color: "error",
        onClick: () => onDismiss(item.id),
      }}
    >
      <ItemMedia variant="avatar" className="self-start mt-1">
        <Avatar src={item.avatar} fallback={item.sender[0]} />
      </ItemMedia>
      <ItemContent>
        <div className="flex justify-between items-center mb-0.5">
          <ItemTitle className="text-sm font-bold text-on-surface">
            {item.sender}
          </ItemTitle>
          <div className="flex items-center gap-1 opacity-60 text-on-surface-variant">
            <Typography variant="body-small" className="text-xs font-semibold">
              {item.time}
            </Typography>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
        <ItemDescription collapsedLines={1} className="text-on-surface-variant">
          {item.message}
        </ItemDescription>

        <ItemExpandedContent>
          <div className="flex items-center gap-2 mt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Stop expansion toggle
                toast.success(`Marked message from ${item.sender} as read`);
              }}
            >
              Mark as read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Stop expansion toggle
                toast.success(`Opening inline reply to ${item.sender}`);
              }}
            >
              Reply
            </Button>
          </div>
        </ItemExpandedContent>
      </ItemContent>
    </Item>
  );
};

export const ExpandableWithSwipe: StoryObj<typeof Item> = {
  name: "4. Combined Expand + Swipe Dismiss",
  parameters: {
    docs: {
      description: {
        story:
          "Multi-Feature Combo: Clicking toggles the card's expanded height and triggers the border radius transition from a full capsule pill down to squircle corners. Swiping left seamlessly throws the card off-screen and triggers a height collapse.",
      },
    },
  },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [messages, setMessages] =
      useState<CombinedMessage[]>(initialCombined);

    const handleDismiss = (id: string) => {
      toast("Notification cleared");
      setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }, 250);
    };

    return (
      <div className="relative w-[420px] bg-surface-container-low p-4 rounded-[36px] border border-outline-variant/30 flex flex-col gap-2 shadow-xl font-sans">
        <Toaster />

        {/* Header */}
        <div className="px-4 py-2 flex items-center justify-between">
          <Typography
            variant="title-medium"
            className="font-extrabold text-on-surface"
          >
            Active Notifications
          </Typography>
          {messages.length === 0 && (
            <button
              onClick={() => setMessages(initialCombined)}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restore
            </button>
          )}
        </div>

        {/* Message shade list */}
        {messages.map((msg) => (
          <StatefulSwipeExpandItem
            key={msg.id}
            item={msg}
            onDismiss={handleDismiss}
          />
        ))}
      </div>
    );
  },
};
