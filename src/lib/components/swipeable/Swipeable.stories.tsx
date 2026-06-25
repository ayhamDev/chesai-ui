import type { Meta, StoryObj } from "@storybook/react";
import { Archive, Heart, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Card } from "../card";
import { Typography } from "../typography";
import { Swipeable } from "./index";

const meta: Meta<typeof Swipeable> = {
  title: "Components/Data/Swipeable (Headless)",
  component: Swipeable,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const HeadlessCardSwipe: StoryObj<typeof Swipeable> = {
  name: "1. Headless Card Swipe (Dismiss)",
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [items, setItems] = useState([
      {
        id: 1,
        title: "Headless Implementation",
        desc: "No native list structure required.",
      },
      {
        id: 2,
        title: "Framer Motion Underlay",
        desc: "Transforms match parent scale automatically.",
      },
    ]);

    const handleDismiss = (id: number) => {
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }, 250);
    };

    return (
      <div className="w-96 flex flex-col gap-3">
        {items.map((item) => (
          <Swipeable
            key={item.id}
            type="dismiss"
            rightAction={{
              icon: <Trash2 className="h-5 w-5" />,
              label: "Delete",
              color: "error",
              onClick: () => handleDismiss(item.id),
            }}
          >
            {/* Background Action Underlay Layer */}
            <Swipeable.Action side="right" className="rounded-xl" />

            {/* Foreground Draggable Canvas Container */}
            <Swipeable.Content>
              <Card
                shape="minimal"
                className="p-4 border border-outline-variant bg-surface select-none"
              >
                <Typography variant="title-medium" className="font-bold">
                  {item.title}
                </Typography>
                <Typography variant="body-small" className="opacity-70 mt-1">
                  {item.desc}
                </Typography>
              </Card>
            </Swipeable.Content>
          </Swipeable>
        ))}
      </div>
    );
  },
};

export const RevealActions: StoryObj<typeof Swipeable> = {
  name: "2. Headless Options Drawer (Reveal)",
  render: () => {
    return (
      <div className="w-96">
        <Swipeable
          type="reveal"
          leftOffset={100}
          rightOffset={100}
          leftAction={{
            icon: <Heart className="h-5 w-5" />,
            label: "Like",
            color: "tertiary",
            onClick: () => alert("Liked!"),
          }}
          rightAction={{
            icon: <Archive className="h-5 w-5" />,
            label: "Archive",
            color: "primary",
            onClick: () => alert("Archived!"),
          }}
        >
          {/* Option Underlays */}
          <Swipeable.Action side="left" className="rounded-xl" />
          <Swipeable.Action side="right" className="rounded-xl" />

          {/* Draggable View */}
          <Swipeable.Content>
            <Card
              shape="minimal"
              className="p-4 border border-outline-variant bg-surface text-center"
            >
              <Typography variant="body-medium" className="font-semibold">
                Swipe either way to reveal options
              </Typography>
            </Card>
          </Swipeable.Content>
        </Swipeable>
      </div>
    );
  },
};
