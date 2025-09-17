import type { Meta, StoryObj } from "@storybook/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../button";
import { FAB } from "./index";

const meta: Meta<typeof FAB> = {
  title: "Components/FAB",
  component: FAB,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    // Add the new 'shape' control
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    isExtended: { control: "boolean" },
    disabled: { control: "boolean" },
    onClick: { action: "clicked" },
  },
  args: {
    icon: <Plus className="h-7 w-7" />,
    children: "Create New",
    "aria-label": "Create New Item",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isExtended: false,
    shape: "full",
  },
};

// New story to showcase the shape variations
export const AllShapes: Story = {
  name: "All Shapes",
  render: (args) => (
    <div className="flex flex-col items-start space-y-6">
      <p className="font-semibold">Shape: Full</p>
      <div className="flex items-center gap-4">
        <FAB {...args} shape="full" isExtended={false} />
        <FAB {...args} shape="full" isExtended={true} />
      </div>
      <p className="font-semibold">Shape: Minimal</p>
      <div className="flex items-center gap-4">
        <FAB {...args} shape="minimal" isExtended={false} />
        <FAB {...args} shape="minimal" isExtended={true} />
      </div>
      <p className="font-semibold">Shape: Sharp</p>
      <div className="flex items-center gap-4">
        <FAB {...args} shape="sharp" isExtended={false} />
        <FAB {...args} shape="sharp" isExtended={true} />
      </div>
    </div>
  ),
};

export const InteractiveAnimation: Story = {
  name: "Interactive Animation",
  parameters: {
    docs: {
      description: {
        story:
          "This story uses a CSS Grid animation for a perfectly smooth transition. The text label's grid column animates from `0fr` to `1fr`.",
      },
    },
  },
  render: (args) => {
    const [isExtended, setIsExtended] = useState(false);

    return (
      <div className="space-y-4 flex flex-col">
        <p>Click the button below to see the smooth FAB animation.</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsExtended((prev) => !prev)}
        >
          {isExtended ? "Collapse FAB" : "Extend FAB"}
        </Button>
        <FAB {...args} isExtended={isExtended} />
      </div>
    );
  },
};
