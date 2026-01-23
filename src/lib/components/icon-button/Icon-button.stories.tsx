import type { Meta, StoryObj } from "@storybook/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { IconButton } from "./index";

const meta: Meta<typeof IconButton> = {
  title: "Components/Buttons/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "destructive", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "The border radius of the icon button.",
    },
    isLoading: { control: "boolean" }, // Added isLoading control
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
    shape: "full",
    children: <Plus className="h-6 w-6" />,
    "aria-label": "Add new item",
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
      <IconButton variant="destructive" size="md" aria-label="Destructive">
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

// --- NEW STORIES FOR LOADING STATE ---

export const Loading: Story = {
  name: "Loading State",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <IconButton variant="primary" size="md" aria-label="Loading" isLoading>
        <Plus className="h-6 w-6" />
      </IconButton>
      <IconButton variant="secondary" size="md" aria-label="Loading" isLoading>
        <Plus className="h-6 w-6" />
      </IconButton>
      <IconButton variant="ghost" size="md" aria-label="Loading" isLoading>
        <Plus className="h-6 w-6" />
      </IconButton>
    </div>
  ),
};

export const InteractiveLoading: Story = {
  name: "Interactive Loading",
  render: () => {
    const [isLoading, setIsLoading] = useState(false);
    const handleClick = () => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    };
    return (
      <IconButton
        variant="primary"
        size="lg"
        aria-label="Submit"
        isLoading={isLoading}
        onClick={handleClick}
      >
        <Plus className="h-8 w-8" />
      </IconButton>
    );
  },
};
