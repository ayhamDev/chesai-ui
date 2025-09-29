import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Meta, StoryObj } from "@storybook/react";
import { Archive, MoreVertical, Share2, Trash2, User } from "lucide-react";
import React, { useState } from "react";
import { Avatar } from "../avatar";
import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { IconButton } from "../icon-button";
import { Sheet } from "../sheet";
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
  { id: "1", name: "Alisa Hester", status: "Online", avatar: "a" },
  { id: "2", name: "Barrera Ramsey", status: "Last seen 5m ago", avatar: "b" },
  { id: "3", name: "Carroll Buchanan", status: "Typing...", avatar: "c" },
  { id: "4", name: "Decker Mckenzie", status: "Away", avatar: "d" },
];

export const Default: Story = {
  name: "1. Default List",
  args: {
    header: "Contacts",
    dividers: true,
  },
  render: (args) => (
    <div className="w-full">
      <List {...args}>
        {sampleItems.map((item) => (
          <List.Item
            key={item.id}
            id={item.id}
            headline={item.name}
            supportingText={item.status}
            startAdornment={<Avatar fallback={item.name} />}
          />
        ))}
      </List>
    </div>
  ),
};

export const SelectionMode: Story = {
  name: "2. Selection Mode (Long Press)",
  args: { ...Default.args, selectable: true },
  render: (args) => <Default.render {...args} />,
};

export const SwipeToReveal: Story = {
  name: "3. Swipe to Reveal Actions",
  args: { ...Default.args },
  render: (args) => (
    <div className="w-full">
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
                  shape="full"
                  variant={"secondary"}
                  className="h-full !rounded-none"
                  onClick={() => alert(`Archived ${item.name}`)}
                >
                  <Archive />
                </Button>
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
    </div>
  ),
};

// Helper component for the DND story
const SortableItem = (props: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <List.Item
      ref={setNodeRef}
      style={style}
      dndAttributes={attributes}
      dndListeners={listeners}
      {...props}
    />
  );
};

export const DragToReorder: Story = {
  name: "4. Drag to Reorder (with @dnd-kit)",
  args: { ...Default.args, reorderable: true, dividers: true },
  render: function Render(args) {
    const [items, setItems] = useState(sampleItems);
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        setItems((currentItems) => {
          const oldIndex = currentItems.findIndex((i) => i.id === active.id);
          const newIndex = currentItems.findIndex((i) => i.id === over.id);
          return arrayMove(currentItems, oldIndex, newIndex);
        });
      }
    }

    return (
      <div className="w-full">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <List {...args}>
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  headline={item.name}
                  supportingText={item.status}
                  startAdornment={<Avatar fallback={item.name} />}
                />
              ))}
            </List>
          </SortableContext>
        </DndContext>
      </div>
    );
  },
};

export const WithDropdownMenu: Story = {
  name: "5. Integration: Dropdown Menu",
  args: { ...Default.args },
  render: (args) => (
    <div className="w-full">
      <List {...args}>
        {sampleItems.map((item) => (
          <List.Item
            key={item.id}
            id={item.id}
            headline={item.name}
            supportingText={item.status}
            startAdornment={<Avatar fallback={item.name} />}
            endAdornment={
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <MoreVertical />
                  </IconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" /> View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          />
        ))}
      </List>
    </div>
  ),
};

export const WithBottomSheet: Story = {
  name: "6. Integration: Bottom Sheet",
  args: { ...Default.args },
  render: (args) => (
    <div className="w-full">
      <Sheet forceBottomSheet mode="detached">
        <List {...args}>
          {sampleItems.map((item) => (
            <Sheet.Trigger asChild key={item.id}>
              <List.Item
                id={item.id}
                headline={item.name}
                supportingText={item.status}
                startAdornment={<Avatar fallback={item.name} />}
              />
            </Sheet.Trigger>
          ))}
        </List>

        <Sheet.Content>
          <Sheet.Grabber />
          <div className="p-2">
            <List>
              <List.Item
                id="header"
                lines="two-line"
                headline="Alisa Hester"
                supportingText="Online"
                startAdornment={<Avatar size="lg" fallback="A" />}
                className="hover:bg-transparent" // Disable hover for header
              />
            </List>

            {/* --- THIS IS THE MODIFIED PART --- */}
            <div className="mt-2">
              <List shape="minimal" variant="secondary">
                {/** biome-ignore lint/nursery/useUniqueElementIds: strict */}
                <List.Item
                  id="share"
                  headline="Share"
                  startAdornment={<Share2 className="h-5 w-5" />}
                  onClick={() => alert("Shared!")}
                />
                {/** biome-ignore lint/nursery/useUniqueElementIds: strict */}
                <List.Item
                  id="archive"
                  headline="Archive"
                  startAdornment={<Archive className="h-5 w-5" />}
                  onClick={() => alert("Archived!")}
                />
                {/** biome-ignore lint/nursery/useUniqueElementIds: strict */}
                <List.Item
                  id="delete"
                  headline={<span className="text-red-500">Delete</span>}
                  startAdornment={<Trash2 className="h-5 w-5 text-red-500" />}
                  onClick={() => alert("Deleted!")}
                />
              </List>
            </div>
            {/* --- END OF MODIFICATION --- */}
          </div>
        </Sheet.Content>
      </Sheet>
    </div>
  ),
};
