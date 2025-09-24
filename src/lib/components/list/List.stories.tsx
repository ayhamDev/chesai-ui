import type { Meta, StoryObj } from "@storybook/react";
import { MoreVertical, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { List } from "./index";

const meta: Meta<typeof List> = {
  title: "Components/List",
  component: List,
  subcomponents: { "List.Item": List.Item },
  tags: ["autodocs"],
  argTypes: {
    header: { control: "text" },
    dividers: { control: "boolean" },
    variant: { control: "select", options: ["primary", "secondary"] },
    shape: { control: "select", options: ["full", "minimal", "sharp"] },
    selectable: { control: "boolean" },
    reorderable: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof List>;

const sampleItems = [
  { id: 1, name: "Alisa Hester", status: "Online", avatar: "a" },
  { id: 2, name: "Barrera Ramsey", status: "Last seen 5m ago", avatar: "b" },
  { id: 3, name: "Carroll Buchanan", status: "Typing...", avatar: "c" },
  { id: 4, name: "Decker Mckenzie", status: "Away", avatar: "d" },
];

export const Default: Story = {
  name: "1. Default List",
  args: {
    header: "Contacts",
    dividers: true,
    variant: "primary",
    shape: "minimal",
  },
  render: (args) => (
    <List {...args}>
      {sampleItems.map((item) => (
        <List.Item
          key={item.id}
          id={item.id}
          headline={item.name}
          supportingText={item.status}
          startAdornment={<Avatar fallback={item.name} />}
          endAdornment={
            <IconButton variant="ghost">
              <MoreVertical />
            </IconButton>
          }
        />
      ))}
    </List>
  ),
};

export const SelectionMode: Story = {
  name: "2. Selection Mode (Long Press)",
  args: { ...Default.args, selectable: true },
  parameters: {
    docs: {
      description: {
        story:
          "Long press any item to enter selection mode. Clicks will then toggle selection. The `selectable` prop must be true.",
      },
    },
  },
  render: (args) => <Default.render {...args} />,
};

export const SwipeToReveal: Story = {
  name: "3. Swipe to Reveal Actions",
  args: { ...Default.args },
  parameters: {
    docs: {
      description: {
        story:
          "Swipe an item left to reveal hidden actions. The component handles the animation.",
      },
    },
  },
  render: (args) => (
    <List {...args}>
      {sampleItems.map((item) => (
        <List.Item
          key={item.id}
          id={item.id}
          headline={item.name}
          supportingText={item.status}
          startAdornment={<Avatar fallback={item.name} />}
          swipeActions={
            <div className="flex h-full">
              <Button
                shape="sharp"
                className="h-full !rounded-none bg-red-500 hover:bg-red-600"
                onClick={() => alert(`Deleted ${item.name}`)}
              >
                <Trash2 />
              </Button>
            </div>
          }
        />
      ))}
    </List>
  ),
};

export const DragToReorder: Story = {
  name: "4. Drag to Reorder",
  args: { ...Default.args, reorderable: true, dividers: true },
  parameters: {
    docs: {
      description: {
        story:
          "When `reorderable` is true, a drag handle appears. Drag items to reorder the list. This requires passing `items` and `onReorder` props.",
      },
    },
  },
  render: function Render(args) {
    const [items, setItems] = useState(sampleItems);
    return (
      <List {...args} items={items} onReorder={setItems}>
        {items.map((item) => (
          <List.Item
            key={item.id}
            id={item.id}
            headline={item.name}
            supportingText={item.status}
            startAdornment={<Avatar fallback={item.name} />}
          />
        ))}
      </List>
    );
  },
};
