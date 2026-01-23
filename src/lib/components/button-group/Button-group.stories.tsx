import type { Meta, StoryObj } from "@storybook/react";
import { Bold, Italic, Underline } from "lucide-react";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { ButtonGroup } from "./index";

const meta: Meta<typeof ButtonGroup> = {
  title: "Components/Buttons/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  argTypes: {
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "Determines the border-radius of the group's outer corners.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A container for grouping related buttons. It automatically styles its children to create a seamless, 'glued-together' look.",
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
    <ButtonGroup {...args}>
      <Button variant="secondary">Left</Button>
      <Button variant="secondary">Middle</Button>
      <Button variant="secondary">Right</Button>
    </ButtonGroup>
  ),
};

export const AllShapes: Story = {
  name: "All Shapes",
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <ButtonGroup shape="full">
        <Button variant="secondary">Full</Button>
        <Button variant="secondary">Full</Button>
        <Button variant="secondary">Full</Button>
      </ButtonGroup>
      <ButtonGroup shape="minimal">
        <Button variant="secondary">Minimal</Button>
        <Button variant="secondary">Minimal</Button>
        <Button variant="secondary">Minimal</Button>
      </ButtonGroup>
      <ButtonGroup shape="sharp">
        <Button variant="secondary">Sharp</Button>
        <Button variant="secondary">Sharp</Button>
        <Button variant="secondary">Sharp</Button>
      </ButtonGroup>
    </div>
  ),
};

export const WithIconButtons: Story = {
  name: "With Icon Buttons (Toolbar Example)",
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <p className="text-sm text-gray-500">
        A common use case, like a text editor toolbar.
      </p>
      <ButtonGroup shape="minimal">
        <IconButton variant="primary" size="sm" aria-label="Bold">
          <Bold className="h-4 w-4" />
        </IconButton>
        <IconButton variant="secondary" size="sm" aria-label="Italic">
          <Italic className="h-4 w-4" />
        </IconButton>
        <IconButton variant="secondary" size="sm" aria-label="Underline">
          <Underline className="h-4 w-4" />
        </IconButton>
      </ButtonGroup>
    </div>
  ),
};
