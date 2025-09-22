import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button"; // Import Button
import { Card } from "../card"; // Import Card
import { Typography } from "../typography"; // Import Typography
import { BouncyBox } from "./index";

const meta: Meta<typeof BouncyBox> = {
  title: "Components/BouncyBox",
  component: BouncyBox,
  tags: ["autodocs"],
  argTypes: {
    scaleAmount: {
      control: { type: "range", min: 0.7, max: 1, step: 0.01 },
    },
  },
  parameters: {
    layout: "centered", // Center the component for better viewing
    docs: {
      description: {
        component:
          "A wrapper component that adds a bouncy, pressable animation to any child element on click. Built with Framer Motion.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    scaleAmount: 0.95,
  },
  render: (args) => (
    <BouncyBox {...args}>
      <Card shape="minimal" className="w-64 cursor-pointer">
        <Typography variant="h4">Click Me!</Typography>
        <Typography variant="p">
          This entire card will bounce when you press down on it.
        </Typography>
      </Card>
    </BouncyBox>
  ),
};

export const WrappingAButton: Story = {
  name: "Wrapping an Interactive Element",
  render: () => (
    <BouncyBox
      onClick={() => alert("Wrapper Clicked!")}
      className="rounded-full"
    >
      <Button
        size="lg"
        onClick={(e) => {
          // Prevent the wrapper's onClick from firing if needed
          e.stopPropagation();
          alert("Button Clicked!");
        }}
      >
        Click the Button
      </Button>
    </BouncyBox>
  ),
};

export const MoreBouncy: Story = {
  name: "More Bouncy",
  args: {
    scaleAmount: 0.85,
  },
  render: (args) => (
    <BouncyBox {...args}>
      <Card shape="full" className="w-48 h-48 flex items-center justify-center">
        <Typography variant="h3">Boing!</Typography>
      </Card>
    </BouncyBox>
  ),
};
