import type { Meta, StoryObj } from "@storybook/react";
import { ChevronRight, Home, Plus, Trash2, Folder, File } from "lucide-react";
import { Breadcrumb } from "./index";
import { Button } from "../button";
import { Card } from "../card";
import { Typography } from "../typography";
import { Flex } from "../layout/flex";

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Navigators/Breadcrumb (Dynamic)",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <Breadcrumb.Provider
        defaultItems={[
          { id: "home", label: "Home", href: "/", icon: <Home size={14} /> },
          {
            id: "docs",
            label: "Documents",
            href: "/docs",
            icon: <Folder size={14} />,
          },
        ]}
      >
        <Story />
      </Breadcrumb.Provider>
    ),
  ],
};

export default meta;

const InteractiveDemo = () => {
  const { addItem, popItem, setItems, items } = Breadcrumb.useBreadcrumbs();

  const handlePush = () => {
    const nextIndex = items.length + 1;
    addItem({
      label: `Subfolder ${nextIndex}`,
      href: `/folder-${nextIndex}`,
      icon: <File size={14} />,
    });
  };

  const handleReset = () => {
    setItems([
      { id: "home", label: "Home", href: "/", icon: <Home size={14} /> },
    ]);
  };

  return (
    <div className="flex flex-col gap-8 min-w-[600px]">
      <Card className="p-6">
        <Typography variant="title-medium" className="mb-4">
          Auto-Collapsing Breadcrumbs
        </Typography>

        {/* Pass maxItems here to trigger auto-grouping */}
        <Breadcrumb.Dynamic
          separator={<ChevronRight size={14} />}
          maxItems={4}
          itemsBeforeCollapse={1}
          itemsAfterCollapse={2}
        />
      </Card>

      <Flex gap="sm" justify="center">
        <Button
          variant="secondary"
          onClick={popItem}
          disabled={items.length <= 1}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Pop Item
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button variant="primary" onClick={handlePush}>
          <Plus className="mr-2 h-4 w-4" /> Push Folder
        </Button>
      </Flex>

      <div className="text-center opacity-60">
        <Typography variant="body-small">
          Keep clicking "Push Folder". When the count hits 5, the middle items
          will collapse into a dropdown.
        </Typography>
        <Typography variant="body-small" className="mt-1 font-mono">
          State count: {items.length} items
        </Typography>
      </div>
    </div>
  );
};

export const Interactive: StoryObj = {
  render: () => <InteractiveDemo />,
};
