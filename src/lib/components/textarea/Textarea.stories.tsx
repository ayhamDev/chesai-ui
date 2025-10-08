import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowUp,
  CornerDownLeft,
  FileCode,
  Maximize,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Button } from "../button";
import { ButtonGroup } from "../button-group";
import { Card } from "../card";
import { IconButton } from "../icon-button";
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "../item";
import { Typography } from "../typography";
import { TextArea } from "./index";

const meta: Meta<typeof TextArea> = {
  title: "Components/Forms & Inputs/TextArea",
  component: TextArea,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "minimal"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    label: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    error: { control: "text" },
    rows: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: {
    variant: "primary",
    shape: "minimal",
    size: "md",
    label: "Your Message",
    placeholder: "Enter your comments here...",
    rows: 4,
  },
};

export const AdvancedComposition: Story = {
  name: "Advanced Composition Examples",
  parameters: {
    docs: {
      description: {
        story:
          "The `minimal` variant is completely unstyled, making it perfect for composing custom input components. Here are two examples inspired by modern UI patterns.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col items-center gap-12">
      {/* --- Chat Input Example --- */}
      <div className="w-full max-w-lg">
        <Card variant="primary" shape="minimal" padding="none">
          <TextArea
            variant="minimal"
            placeholder="Ask, Search or Chat..."
            rows={1}
            wrapperClassName="p-4"
          />
          <div className="flex items-center justify-between gap-4 px-4 pb-3">
            <Button
              variant="secondary"
              size="sm"
              shape="minimal"
              startIcon={<Plus size={16} />}
            >
              Auto
            </Button>
            <Typography variant="muted" className="!mt-0">
              52% used
            </Typography>
            <IconButton
              variant="secondary"
              size="sm"
              shape="full"
              aria-label="Send"
            >
              <ArrowUp size={16} />
            </IconButton>
          </div>
        </Card>
      </div>

      {/* --- Code Editor Example --- */}
      <div className="w-full max-w-lg">
        <Card variant="primary" shape="minimal" padding="none">
          {/* Header */}
          <Item padding="sm" className="border-b border-graphite-border">
            <ItemMedia variant="icon" className="!bg-transparent !border-0">
              <FileCode size={18} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="!text-sm">script.js</ItemTitle>
            </ItemContent>
            <ItemActions>
              <ButtonGroup shape="minimal">
                <IconButton
                  variant="ghost"
                  size="xs"
                  aria-label="Refresh script"
                >
                  <RefreshCw size={14} />
                </IconButton>
                <IconButton
                  variant="ghost"
                  size="xs"
                  aria-label="Expand script"
                >
                  <Maximize size={14} />
                </IconButton>
              </ButtonGroup>
            </ItemActions>
          </Item>

          {/* Body */}
          <TextArea
            variant="minimal"
            defaultValue="console.log('Hello, world!');"
            rows={8}
            className="font-mono text-sm"
            wrapperClassName="p-4"
          />

          {/* Footer */}
          <Item padding="sm" className="border-t border-graphite-border">
            <ItemContent>
              <Typography variant="muted" className="!mt-0 !text-xs">
                Line 1, Column 1
              </Typography>
            </ItemContent>
            <ItemActions>
              <Button
                variant="secondary"
                size="sm"
                shape="minimal"
                endIcon={<CornerDownLeft size={14} />}
              >
                Run
              </Button>
            </ItemActions>
          </Item>
        </Card>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  name: "All Sizes",
  render: () => (
    <div className="flex flex-col gap-6 max-w-sm">
      <TextArea
        size="sm"
        label="Small"
        placeholder="Small textarea (sm)"
        rows={3}
      />
      <TextArea
        size="md"
        label="Medium (Default)"
        placeholder="Medium textarea (md)"
        rows={3}
      />
      <TextArea
        size="lg"
        label="Large"
        placeholder="Large textarea (lg)"
        rows={3}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "The `size` prop controls the vertical padding and font size.",
      },
    },
  },
};

export const AllVariantsAndShapes: Story = {
  name: "All Variants & Shapes",
  render: () => (
    <div className="flex flex-col gap-8 max-w-sm">
      <div>
        <h3 className="font-bold mb-4">Primary Variant</h3>
        <div className="flex flex-col gap-4">
          <TextArea
            variant="primary"
            shape="full"
            placeholder="Full Shape"
            rows={2}
          />
          <TextArea
            variant="primary"
            shape="minimal"
            placeholder="Minimal Shape"
            rows={2}
          />
          <TextArea
            variant="primary"
            shape="sharp"
            placeholder="Sharp Shape"
            rows={2}
          />
        </div>
      </div>
      <div>
        <h3 className="font-bold mb-4">Secondary Variant</h3>
        <div className="flex flex-col gap-4">
          <TextArea
            variant="secondary"
            shape="full"
            placeholder="Full Shape"
            rows={2}
          />
          <TextArea
            variant="secondary"
            shape="minimal"
            placeholder="Minimal Shape"
            rows={2}
          />
          <TextArea
            variant="secondary"
            shape="sharp"
            placeholder="Sharp Shape"
            rows={2}
          />
        </div>
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  name: "All States",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
      <div>
        <h3 className="font-bold mb-4">Primary States</h3>
        <div className="flex flex-col gap-4">
          <TextArea
            variant="primary"
            label="Default"
            placeholder="Enter a description..."
          />
          <TextArea
            variant="primary"
            label="With Value"
            defaultValue="This is some pre-filled text in the textarea."
          />
          <TextArea
            variant="primary"
            label="Error State"
            defaultValue="This message is too short."
            error="Message must be at least 50 characters."
          />
          <TextArea
            variant="primary"
            label="Disabled"
            placeholder="Cannot edit"
            disabled
          />
        </div>
      </div>
      <div>
        <h3 className="font-bold mb-4">Secondary States</h3>
        <div className="flex flex-col gap-4">
          <TextArea
            variant="secondary"
            label="Default"
            placeholder="Enter a description..."
          />
          <TextArea
            variant="secondary"
            label="With Value"
            defaultValue="This is some pre-filled text in the textarea."
          />
          <TextArea
            variant="secondary"
            label="Error State"
            defaultValue="This message is too short."
            error="Message must be at least 50 characters."
          />
          <TextArea
            variant="secondary"
            label="Disabled"
            placeholder="Cannot edit"
            disabled
          />
        </div>
      </div>
    </div>
  ),
};

export const WithCustomRows: Story = {
  name: "With Custom Rows",
  args: {
    label: "A Tall Text Area",
    placeholder: "This area starts with 8 rows",
    rows: 8,
  },
};
