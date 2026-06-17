// src/lib/components/icon-button/Icon-button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Plus, Phone, Video, Search, Moon } from "lucide-react";
import { useState } from "react";
import { IconButton } from "./index";
import { Typography } from "../typography";

const meta: Meta<typeof IconButton> = {
  title: "Components/Buttons/IconButton",
  component: IconButton,
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
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "The border radius of the icon button.",
    },
    containerShape: {
      control: "select",
      options: ["normal", "wide-pill"],
      description: "Controls the aspect ratio width of the container.",
    },
    isLoading: { control: "boolean" },
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
    containerShape: "normal",
    children: <Plus className="h-6 w-6" />,
    "aria-label": "Add new item",
  },
};

export const CustomContainerShapes: Story = {
  name: "Mockup Match (Wide Pill Dial)",
  render: () => (
    <div className="flex flex-col items-center gap-6 p-8 bg-[#18181b] rounded-3xl w-[450px]">
      <Typography
        variant="title-medium"
        className="text-[#a1a1aa] font-semibold tracking-wide"
      >
        +1 (804) 503-3063
      </Typography>

      <div className="flex items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <IconButton
            variant="secondary"
            containerShape="wide-pill"
            size="md"
            className="!bg-[#3f3f46] !text-[#f4f4f5]"
          >
            <Phone className="h-5 w-5" />
          </IconButton>
          <Typography
            variant="label-small"
            className="text-[#f4f4f5] font-semibold"
          >
            Voice
          </Typography>
        </div>

        <div className="flex flex-col items-center gap-2">
          <IconButton
            variant="secondary"
            containerShape="wide-pill"
            size="md"
            className="!bg-[#3f3f46] !text-[#f4f4f5]"
          >
            <Video className="h-5 w-5" />
          </IconButton>
          <Typography
            variant="label-small"
            className="text-[#f4f4f5] font-semibold"
          >
            Video
          </Typography>
        </div>

        <div className="flex flex-col items-center gap-2">
          <IconButton
            variant="secondary"
            containerShape="wide-pill"
            size="md"
            className="!bg-[#3f3f46] !text-[#f4f4f5]"
          >
            <Search className="h-5 w-5" />
          </IconButton>
          <Typography
            variant="label-small"
            className="text-[#f4f4f5] font-semibold"
          >
            Search
          </Typography>
        </div>
      </div>
    </div>
  ),
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
      <IconButton variant="tertiary" size="md" aria-label="Tertiary">
        <Plus className="h-6 w-6" />
      </IconButton>
      <IconButton variant="outline" size="md" aria-label="Outline">
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
  name: "All Sizes (Wide Pill)",
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      <IconButton
        variant="primary"
        containerShape="wide-pill"
        size="xl"
        aria-label="Extra Large"
      >
        <Plus className="h-8 w-8" />
      </IconButton>
      <IconButton
        variant="primary"
        containerShape="wide-pill"
        size="lg"
        aria-label="Large"
      >
        <Plus className="h-6 w-6" />
      </IconButton>
      <IconButton
        variant="primary"
        containerShape="wide-pill"
        size="md"
        aria-label="Medium"
      >
        <Plus className="h-6 w-6" />
      </IconButton>
      <IconButton
        variant="primary"
        containerShape="wide-pill"
        size="sm"
        aria-label="Small"
      >
        <Plus className="h-5 w-5" />
      </IconButton>
      <IconButton
        variant="primary"
        containerShape="wide-pill"
        size="xs"
        aria-label="Extra Small"
      >
        <Plus className="h-4 w-4" />
      </IconButton>
    </div>
  ),
};

export const Loading: Story = {
  name: "Loading State",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <IconButton
        variant="primary"
        containerShape="wide-pill"
        size="md"
        aria-label="Loading"
        isLoading
      >
        <Plus className="h-6 w-6" />
      </IconButton>
      <IconButton
        variant="secondary"
        containerShape="wide-pill"
        size="md"
        aria-label="Loading"
        isLoading
      >
        <Plus className="h-6 w-6" />
      </IconButton>
    </div>
  ),
};
