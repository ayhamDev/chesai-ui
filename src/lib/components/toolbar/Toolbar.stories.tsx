import type { Meta, StoryObj } from "@storybook/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Highlighter,
  Image,
  Italic,
  Link as LinkIcon,
  MousePointer2,
  Palette,
  Redo,
  Strikethrough,
  Type,
  Underline,
  Undo,
} from "lucide-react";
import { Toolbar } from "./index";

const meta: Meta<typeof Toolbar> = {
  title: "Components/Data/Toolbar",
  component: Toolbar,
  subcomponents: {
    "Toolbar.Button": Toolbar.Button,
    "Toolbar.Separator": Toolbar.Separator,
    "Toolbar.ToggleGroup": Toolbar.ToggleGroup,
    "Toolbar.ToggleItem": Toolbar.ToggleItem,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A responsive, accessible toolbar component. Supports horizontal/vertical layouts, multiple sizes, shape inheritance, and automatic tooltip integration.",
      },
    },
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description:
        "Determines the border radius of the container AND the items inside it.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
    gap: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
    shadow: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

export const HorizontalEditor: Story = {
  name: "1. Horizontal Editor (Shape: Minimal)",
  args: {
    orientation: "horizontal",
    variant: "primary",
    shape: "minimal",
    size: "md",
    padding: "sm",
    shadow: "sm",
  },
  render: (args) => (
    <Toolbar {...args} aria-label="Formatting options">
      <Toolbar.ToggleGroup type="multiple" aria-label="Text formatting">
        <Toolbar.ToggleItem value="bold" tooltip="Bold" shortcut="⌘B">
          <Bold className="h-4 w-4" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem value="italic" tooltip="Italic" shortcut="⌘I">
          <Italic className="h-4 w-4" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem value="underline" tooltip="Underline" shortcut="⌘U">
          <Underline className="h-4 w-4" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem value="strike" tooltip="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>

      <Toolbar.Separator />

      <Toolbar.ToggleGroup type="single" defaultValue="left" aria-label="Align">
        <Toolbar.ToggleItem value="left" tooltip="Align Left">
          <AlignLeft className="h-4 w-4" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem value="center" tooltip="Align Center">
          <AlignCenter className="h-4 w-4" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem value="right" tooltip="Align Right">
          <AlignRight className="h-4 w-4" />
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>

      <Toolbar.Separator />

      <Toolbar.Button tooltip="Insert Link">
        <LinkIcon className="h-4 w-4" />
      </Toolbar.Button>
      <Toolbar.Button tooltip="Insert Image">
        <Image className="h-4 w-4" />
      </Toolbar.Button>

      <Toolbar.Separator />

      {/* This button will now auto-scale on click */}
      <Toolbar.Button variant="primary" tooltip="Publish Post" shortcut="⌘S">
        Publish
      </Toolbar.Button>
    </Toolbar>
  ),
};

export const VerticalTools: Story = {
  name: "2. Vertical Tools (Shape: Sharp)",
  args: {
    orientation: "vertical",
    variant: "primary",
    shape: "sharp", // Items inside will inherit square corners
    size: "md",
    padding: "sm",
    shadow: "md",
  },
  render: (args) => (
    <div className="h-96 bg-graphite-secondary/30 p-8 rounded-xl border border-dashed border-graphite-border flex items-start gap-4">
      <Toolbar {...args} aria-label="Drawing tools">
        <Toolbar.ToggleGroup
          type="single"
          defaultValue="select"
          className="flex-col"
        >
          <Toolbar.ToggleItem value="select" tooltip="Select Tool" shortcut="V">
            <MousePointer2 className="h-4 w-4" />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="text" tooltip="Type Tool" shortcut="T">
            <Type className="h-4 w-4" />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="brush" tooltip="Brush Tool" shortcut="B">
            <Highlighter className="h-4 w-4" />
          </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>

        <Toolbar.Separator />

        <Toolbar.Button tooltip="Color Palette">
          <Palette className="h-4 w-4" style={{ color: "#3b82f6" }} />
        </Toolbar.Button>

        <div className="flex-1" />

        <Toolbar.Button tooltip="Undo" shortcut="⌘Z">
          <Undo className="h-4 w-4" />
        </Toolbar.Button>
        <Toolbar.Button tooltip="Redo" shortcut="⇧⌘Z">
          <Redo className="h-4 w-4" />
        </Toolbar.Button>
      </Toolbar>

      <div className="flex-1 h-full flex items-center justify-center text-graphite-foreground/20 font-bold text-2xl select-none">
        Canvas
      </div>
    </div>
  ),
};

export const RoundedShape: Story = {
  name: "3. Rounded Shape (Full)",
  args: {
    orientation: "horizontal",
    variant: "secondary",
    shape: "full", // Items inside will be circles/pills
    size: "lg",
    padding: "md",
    gap: "md",
  },
  render: (args) => (
    <Toolbar {...args}>
      <Toolbar.ToggleGroup type="multiple">
        <Toolbar.ToggleItem value="b" tooltip="Bold">
          <Bold className="h-5 w-5" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem value="i" tooltip="Italic">
          <Italic className="h-5 w-5" />
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>
      <Toolbar.Separator />
      <Toolbar.Button variant="primary" tooltip="Primary Action">
        Action
      </Toolbar.Button>
    </Toolbar>
  ),
};
