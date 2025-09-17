import type { Meta, StoryObj } from "@storybook/react";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "./index";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      // Removed 'icon' as it's now a separate component
      options: ["primary", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
    // Added the new 'shape' control
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "The border radius of the button.",
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
    children: "Primary Button",
  },
};

export const AllVariants: Story = {
  name: "All Variants",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  name: "All Sizes",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary" size="lg">
        Large
      </Button>
      <Button variant="primary" size="md">
        Medium
      </Button>
      <Button variant="primary" size="sm">
        Small
      </Button>
      <Button variant="primary" size="xs">
        Extra Small
      </Button>
    </div>
  ),
};

// New story to showcase the shape variations
export const AllShapes: Story = {
  name: "All Shapes",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary" shape="full">
        Full
      </Button>
      <Button variant="primary" shape="minimal">
        Minimal
      </Button>
      <Button variant="primary" shape="sharp">
        Sharp
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  name: "With Start/End Icons",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        variant="primary"
        size="md"
        startIcon={<Plus className="h-5 w-5" />}
      >
        Add Item
      </Button>
      <Button
        variant="secondary"
        size="md"
        shape="minimal" // Example of using a different shape with an icon
        endIcon={<ChevronRight className="h-5 w-5" />}
      >
        Continue
      </Button>
    </div>
  ),
};

export const FocusState: Story = {
  name: "Focus State (Click Me!)",
  args: {
    variant: "primary",
    size: "md",
    children: "Click or Tab to Focus",
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates the focus ring that appears on click or when navigating with the keyboard.",
      },
    },
  },
};
