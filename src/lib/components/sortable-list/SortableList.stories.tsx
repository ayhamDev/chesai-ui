import type { Meta, StoryObj } from "@storybook/react";
import { GripHorizontal } from "lucide-react";
import { useState } from "react";
import { Avatar } from "../avatar";
import { Card } from "../card";
import { Typography } from "../typography";
import { SortableList } from "./index";

const meta: Meta<typeof SortableList> = {
  title: "Components/Data/SortableList",
  component: SortableList,
  subcomponents: {
    "SortableList.Item": SortableList.Item as any,
    "SortableList.DragHandle": SortableList.DragHandle as any,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A vertical drag-and-drop list built on `@dnd-kit`. It provides a compound architecture, smooth overlay animations, and leverages Chesai UI's semantic surface variants.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "surface"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    gap: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SortableList>;

// --- MOCK DATA ---
const INITIAL_FRUITS = [
  { id: "1", name: "Apple", desc: "A sweet red fruit" },
  { id: "2", name: "Banana", desc: "A long yellow fruit" },
  { id: "3", name: "Cherry", desc: "A small red fruit" },
  { id: "4", name: "Date", desc: "A sweet brown fruit" },
  { id: "5", name: "Elderberry", desc: "A dark purple fruit" },
];

const INITIAL_TEAM = [
  {
    id: "u1",
    name: "John Doe",
    role: "Admin",
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: "u2",
    name: "Jane Smith",
    role: "Editor",
    avatar: "https://i.pravatar.cc/150?u=2",
  },
  {
    id: "u3",
    name: "Alice Johnson",
    role: "Viewer",
    avatar: "https://i.pravatar.cc/150?u=3",
  },
  {
    id: "u4",
    name: "Bob Builder",
    role: "Viewer",
    avatar: "https://i.pravatar.cc/150?u=4",
  },
];

export const Default: Story = {
  name: "1. Basic Sortable List",
  args: {
    variant: "primary",
    shape: "minimal",
    gap: "sm",
  },
  render: (args) => {
    const [items, setItems] = useState(INITIAL_FRUITS);

    return (
      <div className="w-[400px]">
        <SortableList {...args} items={items} onReorder={setItems}>
          {items.map((item) => (
            <SortableList.Item key={item.id} id={item.id}>
              <SortableList.DragHandle />
              <div className="flex flex-col ml-2">
                <Typography variant="label-large" className="font-bold">
                  {item.name}
                </Typography>
                <Typography variant="body-small" muted>
                  {item.desc}
                </Typography>
              </div>
            </SortableList.Item>
          ))}
        </SortableList>
      </div>
    );
  },
};

export const ComplexItems: Story = {
  name: "2. Complex Items (Ghost Variant)",
  args: {
    variant: "ghost",
    gap: "none",
    shape: "sharp",
  },
  render: (args) => {
    const [items, setItems] = useState(INITIAL_TEAM);

    return (
      <Card className="w-[450px]" padding="none">
        <Typography variant="title-medium" className="mb-4 pt-6 px-6 font-bold">
          Prioritize Members
        </Typography>
        <div className="pb-4 px-2">
          <SortableList {...args} items={items} onReorder={setItems}>
            {items.map((item) => (
              <SortableList.Item
                key={item.id}
                id={item.id}
                className="border-b border-outline-variant/30 last:border-0 rounded-none px-4"
              >
                <SortableList.DragHandle className="mr-2" />
                <Avatar src={item.avatar} size="md" className="mr-3" />
                <div className="flex flex-col flex-1">
                  <Typography variant="label-large" className="font-semibold">
                    {item.name}
                  </Typography>
                  <Typography variant="body-small" muted>
                    {item.role}
                  </Typography>
                </div>
              </SortableList.Item>
            ))}
          </SortableList>
        </div>
      </Card>
    );
  },
};

export const CustomHandle: Story = {
  name: "3. Custom Drag Handle",
  args: {
    variant: "surface",
    shape: "minimal",
    gap: "md",
  },
  render: (args) => {
    const [items, setItems] = useState(INITIAL_FRUITS.slice(0, 3));

    return (
      <div className="w-[400px]">
        <SortableList {...args} items={items} onReorder={setItems}>
          {items.map((item) => (
            <SortableList.Item key={item.id} id={item.id}>
              <div className="flex items-center justify-between w-full pr-2">
                <Typography variant="label-large" className="font-bold">
                  {item.name}
                </Typography>

                {/* Applying custom icon to the handle */}
                <SortableList.DragHandle
                  icon={<GripHorizontal className="h-5 w-5" />}
                />
              </div>
            </SortableList.Item>
          ))}
        </SortableList>
      </div>
    );
  },
};
