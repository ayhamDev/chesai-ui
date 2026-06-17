import type { Meta, StoryObj } from "@storybook/react";
import { GripHorizontal, GripVertical } from "lucide-react";
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
          "A completely headless drag-and-drop wrapper built on `@dnd-kit`. Apply it to Cards, Grids, or List Items via `asChild` to make your existing UI sortable without fighting built-in styles.",
      },
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

const INITIAL_IMAGES = [
  {
    id: "i1",
    src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&q=80",
    title: "Architecture",
  },
  {
    id: "i2",
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80",
    title: "Abstract",
  },
  {
    id: "i3",
    src: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&q=80",
    title: "Minimal",
  },
  {
    id: "i4",
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&q=80",
    title: "Nature",
  },
];

export const HeadlessList: Story = {
  name: "1. Vertical List (using Card)",
  render: () => {
    const [items, setItems] = useState(INITIAL_FRUITS);

    return (
      <div className="w-[400px]">
        {/* SortableList wraps the container, providing the context */}
        <SortableList
          items={items}
          onReorder={setItems}
          className="flex flex-col gap-2"
          renderOverlay={(item) => (
            <Card
              shape="minimal"
              variant="surface"
              className="flex items-center p-3 opacity-90 scale-105 shadow-xl"
            >
              <GripVertical className="h-5 w-5 text-on-surface-variant opacity-50 mr-3" />
              <Typography variant="label-large" className="font-bold">
                {item.name}
              </Typography>
            </Card>
          )}
        >
          {items.map((item) => (
            /* Using asChild seamlessly merges the sortable refs onto our Card */
            <SortableList.Item key={item.id} id={item.id} asChild>
              <Card
                shape="minimal"
                variant="primary"
                className="flex items-center p-3 group"
              >
                {/* 
                  The handle can wrap any icon or div.
                  The touch-none/cursor-grab classes are automatically injected.
                */}
                <SortableList.DragHandle asChild>
                  <div className="p-1 mr-2 rounded-md hover:bg-on-surface/10 opacity-50 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-5 w-5 text-on-surface-variant" />
                  </div>
                </SortableList.DragHandle>

                <div className="flex flex-col">
                  <Typography variant="label-large" className="font-bold">
                    {item.name}
                  </Typography>
                  <Typography variant="body-small" muted>
                    {item.desc}
                  </Typography>
                </div>
              </Card>
            </SortableList.Item>
          ))}
        </SortableList>
      </div>
    );
  },
};

export const HeadlessGrid: Story = {
  name: "2. Sortable Grid (using Rect Strategy)",
  parameters: {
    docs: {
      description: {
        story:
          "Because it defaults to `rectSortingStrategy`, the headless component handles multi-column grids flawlessly. In this example, the *entire* image acts as the drag handle.",
      },
    },
  },
  render: () => {
    const [items, setItems] = useState(INITIAL_IMAGES);

    return (
      <div className="w-[600px] p-6 bg-surface-container-low rounded-3xl border border-outline-variant">
        <Typography variant="title-medium" className="mb-4 font-bold px-2">
          Reorder Gallery
        </Typography>
        <SortableList
          items={items}
          onReorder={setItems}
          className="grid grid-cols-2 gap-4"
          renderOverlay={(item) => (
            <Card
              padding="none"
              shape="minimal"
              className="overflow-hidden ring-4 ring-primary shadow-2xl scale-105"
            >
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-32 object-cover"
              />
            </Card>
          )}
        >
          {items.map((item) => (
            <SortableList.Item key={item.id} id={item.id} asChild>
              <Card
                padding="none"
                shape="minimal"
                className="overflow-hidden relative group"
              >
                {/* The entire card is the drag handle */}
                <SortableList.DragHandle className="absolute inset-0 w-full h-full z-10" />
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-32 object-cover pointer-events-none"
                />
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                  <Typography
                    variant="label-medium"
                    className="text-white font-bold"
                  >
                    {item.title}
                  </Typography>
                </div>
                <div className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripHorizontal className="h-4 w-4" />
                </div>
              </Card>
            </SortableList.Item>
          ))}
        </SortableList>
      </div>
    );
  },
};
