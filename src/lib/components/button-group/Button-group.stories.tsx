import type { Meta, StoryObj } from "@storybook/react";
import { Bold, Italic, Underline, Check } from "lucide-react";
import { useState } from "react";
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
    gap: {
      control: "select",
      options: ["none", "xs", "sm", "md", "lg"],
      description: "Controls the spacing between buttons in the group.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A container for grouping related buttons. It supports direct connection or gap spacing with custom corner roundings.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    shape: "full",
    gap: "none",
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="secondary">Left</Button>
      <Button variant="secondary">Middle</Button>
      <Button variant="secondary">Right</Button>
    </ButtonGroup>
  ),
};

export const WithGap: Story = {
  name: "With Gap",
  args: {
    shape: "full",
    gap: "sm",
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="secondary">8 oz</Button>
      <Button variant="secondary">12 oz</Button>
      <Button variant="secondary">16 oz</Button>
      <Button variant="secondary">20 oz</Button>
    </ButtonGroup>
  ),
};

export const SegmentedControlActive: Story = {
  name: "Segmented Control (Custom Design Example)",
  render: () => {
    const [selectedValue, setSelectedValue] = useState("8 oz");
    const options = ["8 oz", "12 oz", "16 oz", "20 oz"];

    return (
      <div className="bg-[#f7f5fb] p-8 inline-block rounded-xl">
        <ButtonGroup shape="full" gap="xs">
          {options.map((option) => {
            const isActive = selectedValue === option;
            return (
              <Button
                key={option}
                variant={isActive ? "primary" : "secondary"}
                isActive={isActive}
                onClick={() => setSelectedValue(option)}
                startIcon={isActive ? <Check className="h-4 w-4" /> : undefined}
                className={
                  isActive
                    ? "!bg-[#635597] !text-[#fdfbfe] hover:opacity-95"
                    : "!bg-[#cfbdfa] !text-[#4a3a80] hover:opacity-95"
                }
              >
                {option}
              </Button>
            );
          })}
        </ButtonGroup>
      </div>
    );
  },
};

export const AllShapes: Story = {
  name: "All Shapes",
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <ButtonGroup shape="full" gap="xs">
        <Button variant="secondary">Full</Button>
        <Button variant="secondary">Full</Button>
        <Button variant="secondary">Full</Button>
      </ButtonGroup>
      <ButtonGroup shape="minimal" gap="xs">
        <Button variant="secondary">Minimal</Button>
        <Button variant="secondary">Minimal</Button>
        <Button variant="secondary">Minimal</Button>
      </ButtonGroup>
      <ButtonGroup shape="sharp" gap="xs">
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
