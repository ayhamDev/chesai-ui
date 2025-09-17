import type { Meta, StoryObj } from "@storybook/react";
import { Bold, HelpCircle, Italic } from "lucide-react";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { Tooltip, TooltipProvider, TooltipTrigger } from "./index";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  // We point to the Tooltip content component as the primary component for controls
  component: Tooltip,
  // Subcomponents tell Storybook how the parts are related
  subcomponents: { TooltipProvider, TooltipTrigger },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A powerful, accessible tooltip built with Floating UI. It must be wrapped in a `TooltipProvider`.",
      },
    },
  },
  // The `render` function is used for all stories to provide the necessary context
  render: (args) => (
    <div className="flex justify-center items-center h-48">
      <TooltipProvider>
        <TooltipTrigger>
          <Button variant="secondary">Hover or Focus Me</Button>
        </TooltipTrigger>
        {/* Pass the story's args to the Tooltip content */}
        <Tooltip {...args}>This is a tooltip</Tooltip>
      </TooltipProvider>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // You can control the tooltip's appearance here
    variant: "primary",
    size: "md",
    shape: "minimal",
  },
};

export const AllVariants: Story = {
  name: "All Variants",
  render: () => (
    <div className="flex items-center gap-6 pt-8">
      <TooltipProvider>
        <TooltipTrigger>
          <IconButton aria-label="Primary Tooltip">
            <Bold />
          </IconButton>
        </TooltipTrigger>
        <Tooltip variant="primary">Primary Tooltip</Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <TooltipTrigger>
          <IconButton aria-label="Secondary Tooltip">
            <Italic />
          </IconButton>
        </TooltipTrigger>
        <Tooltip variant="secondary">Secondary Tooltip</Tooltip>
      </TooltipProvider>
    </div>
  ),
};

export const AllSizesAndShapes: Story = {
  name: "All Sizes & Shapes",
  render: () => (
    <div className="flex items-center gap-6 pt-8">
      <TooltipProvider>
        <TooltipTrigger>
          <IconButton size="sm" aria-label="Small Minimal">
            <HelpCircle className="h-4 w-4" />
          </IconButton>
        </TooltipTrigger>
        <Tooltip size="sm" shape="minimal">
          Small Minimal
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <TooltipTrigger>
          <IconButton size="md" aria-label="Medium Full">
            <HelpCircle className="h-5 w-5" />
          </IconButton>
        </TooltipTrigger>
        <Tooltip size="md" shape="full">
          Medium Full
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <TooltipTrigger>
          <IconButton size="lg" aria-label="Large Sharp">
            <HelpCircle className="h-6 w-6" />
          </IconButton>
        </TooltipTrigger>
        <Tooltip size="lg" shape="sharp">
          Large Sharp
        </Tooltip>
      </TooltipProvider>
    </div>
  ),
};

export const DynamicPositioning: Story = {
  name: "Dynamic Positioning",
  parameters: {
    docs: {
      description: {
        story:
          "Place tooltips near the edge of the canvas to see them flip automatically.",
      },
    },
  },
  render: () => (
    <div className="w-full h-96 relative border border-dashed flex items-center justify-center">
      <div className="absolute top-2 left-2">
        <TooltipProvider>
          <TooltipTrigger>
            <IconButton aria-label="Top-left corner">
              <Bold />
            </IconButton>
          </TooltipTrigger>
          <Tooltip>Flipped to the bottom!</Tooltip>
        </TooltipProvider>
      </div>
      <div className="absolute bottom-2 right-2">
        <TooltipProvider>
          <TooltipTrigger>
            <IconButton aria-label="Bottom-right corner">
              <Italic />
            </IconButton>
          </TooltipTrigger>
          <Tooltip>This should stay on top.</Tooltip>
        </TooltipProvider>
      </div>
    </div>
  ),
};
