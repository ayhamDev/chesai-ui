import type { Meta, StoryObj } from "@storybook/react";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { SplitButton } from "./index";

const meta: Meta<typeof SplitButton> = {
  title: "Components/Buttons/SplitButton",
  component: SplitButton,
  tags: ["autodocs"],
  argTypes: {
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A split button combines a primary action button with a secondary trigger button. It maintains a small gap and applies specific rounding to the outer edges.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    shape: "full",
  },
  render: (args) => (
    <SplitButton {...args}>
      <Button variant="primary">
        <Plus className="mr-2 h-4 w-4" />
        Create
      </Button>
      <IconButton variant="primary" aria-label="More options">
        <ChevronDown className="h-4 w-4" />
      </IconButton>
    </SplitButton>
  ),
};

export const AllShapes: Story = {
  name: "All Shapes",
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <SplitButton shape="full">
        <Button variant="secondary">Full Shape</Button>
        <IconButton variant="secondary" aria-label="Options for Full Shape">
          <ChevronDown className="h-4 w-4" />
        </IconButton>
      </SplitButton>
      <SplitButton shape="minimal">
        <Button variant="secondary">Minimal Shape</Button>
        <IconButton variant="secondary" aria-label="Options for Minimal Shape">
          <ChevronDown className="h-4 w-4" />
        </IconButton>
      </SplitButton>
      <SplitButton shape="sharp">
        <Button variant="secondary">Sharp Shape</Button>
        <IconButton variant="secondary" aria-label="Options for Sharp Shape">
          <ChevronDown className="h-4 w-4" />
        </IconButton>
      </SplitButton>
    </div>
  ),
};

export const DifferentSizes: Story = {
  name: "Different Button Sizes",
  render: () => (
    <SplitButton shape="minimal">
      <Button variant="primary" size="lg">
        Large Action
      </Button>
      <IconButton
        variant="primary"
        size="lg"
        aria-label="Options for Large Action"
      >
        <ChevronDown className="h-5 w-5" />
      </IconButton>
    </SplitButton>
  ),
};
