import type { Meta, StoryObj } from "@storybook/react";
import { Plus } from "lucide-react";
import { IconButton } from "./index";

const meta: Meta<typeof IconButton> = {
  title: "Components/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
    // Add the new 'shape' control
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "The border radius of the icon button.",
    },
    disabled: { control: "boolean" },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    size: "md",
    shape: "full", // Default shape
    children: <Plus className="h-6 w-6" />,
    "aria-label": "Add new item", // Essential for accessibility
  },
};

export const AllVariants: Story = {
  name: "All Variants",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <IconButton variant="primary" size="md" aria-label="Primary">
        <Plus className="h-6 w-6" />
      </IconButton>
      <IconButton variant="secondary" size="md" aria-label="Secondary">
        <Plus className="h-6 w-6" />
      </IconButton>
      <IconButton variant="ghost" size="md" aria-label="Ghost">
        <Plus className="h-6 w-6" />
      </IconButton>
      <IconButton variant="link" size="md" aria-label="Link">
        <Plus className="h-6 w-6" />
      </IconButton>
    </div>
  ),
};

export const AllSizes: Story = {
  name: "All Sizes",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <IconButton variant="primary" size="lg" aria-label="Large">
        <Plus className="h-8 w-8" />
      </IconButton>
      <IconButton variant="primary" size="md" aria-label="Medium">
        <Plus className="h-6 w-6" />
      </IconButton>
      <IconButton variant="primary" size="sm" aria-label="Small">
        <Plus className="h-5 w-5" />
      </IconButton>
      <IconButton variant="primary" size="xs" aria-label="Extra Small">
        <Plus className="h-4 w-4" />
      </IconButton>
    </div>
  ),
};

// New story to showcase the shape variations
export const AllShapes: Story = {
  name: "All Shapes",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <IconButton
        variant="primary"
        size="md"
        shape="full"
        aria-label="Full Shape"
      >
        <Plus className="h-6 w-6" />
      </IconButton>
      <IconButton
        variant="primary"
        size="md"
        shape="minimal"
        aria-label="Minimal Shape"
      >
        <Plus className="h-6 w-6" />
      </IconButton>
      <IconButton
        variant="primary"
        size="md"
        shape="sharp"
        aria-label="Sharp Shape"
      >
        <Plus className="h-6 w-6" />
      </IconButton>
    </div>
  ),
};
