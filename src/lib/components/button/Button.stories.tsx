import type { Meta, StoryObj } from "@storybook/react";
import { ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "./index";

const meta: Meta<typeof Button> = {
  title: "Components/Buttons/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "tertiary",
        "outline",
        "destructive",
        "ghost",
        "link",
      ],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "The border radius of the button.",
    },
    isLoading: { control: "boolean" },
    disabled: { control: "boolean" },
    asChild: { control: "boolean" },
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
    children: "Primary Button",
  },
};

export const AllVariants: Story = {
  name: "All Variants",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Destructive</Button>
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
        shape="minimal"
        endIcon={<ChevronRight className="h-5 w-5" />}
      >
        Continue
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  name: "Loading State",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary" isLoading>
        Saving...
      </Button>
      <Button variant="secondary" isLoading>
        Loading...
      </Button>
      <Button variant="outline" isLoading>
        Fetching...
      </Button>
      <Button variant="ghost" isLoading>
        Processing...
      </Button>
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
      <Button variant="primary" isLoading={isLoading} onClick={handleClick}>
        {isLoading ? "Submitting..." : "Click to Submit"}
      </Button>
    );
  },
};

export const AsChild: Story = {
  name: "As Child (Polymorphic)",
  parameters: {
    docs: {
      description: {
        story:
          "Use the `asChild` prop to render the button as a different element, like an anchor tag, while preserving all styles and functionality.",
      },
    },
  },
  render: () => (
    <Button asChild variant={"primary"} size="lg">
      <a href="#">This is an anchor tag</a>
    </Button>
  ),
};
