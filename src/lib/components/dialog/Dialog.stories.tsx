import type { Meta, StoryObj } from "@storybook/react";
import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "../button";
import { Input } from "../input";
import { Typography } from "../typography";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
  type DialogProps,
} from "./index";

// Combined type for story controls
type StoryComponentProps = DialogProps & Pick<DialogContentProps, "shape">;

const meta: Meta<StoryComponentProps> = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    // Use 'fullscreen' layout for stories to better see the dialogs
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A fully accessible, custom-built dialog component with support for basic and fullscreen variants.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["basic", "fullscreen"],
      description: "Determines the dialog's appearance and animation.",
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "Controls the border-radius of the basic dialog card.",
      table: { category: "DialogContent Props" },
      // Only show this control if the variant is 'basic'
      if: { arg: "variant", eq: "basic" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  name: "Basic Dialog",
  args: {
    variant: "basic",
    shape: "minimal",
  },
  parameters: {
    // Re-center this specific story for better viewing
    layout: "centered",
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen} variant={args.variant}>
        <DialogTrigger asChild>
          <Button>Open Basic Dialog</Button>
        </DialogTrigger>
        <DialogContent shape={args.shape}>
          <DialogHeader>
            <DialogTitle>Basic Dialog Title</DialogTitle>
            <DialogDescription>
              This is a standard modal dialog.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Typography variant="p">
              It floats in the center and has a scale/fade animation.
            </Typography>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

export const FullScreen: Story = {
  name: "Full-Screen Dialog",
  args: {
    variant: "fullscreen",
  },
  parameters: {
    // Add mobile viewport for better demonstration
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "The fullscreen variant is designed for mobile and complex forms. It slides up from the bottom. The `DialogHeader` automatically styles itself as a sticky app bar.",
      },
    },
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="h-screen w-screen bg-gray-100 p-4">
        <Dialog open={isOpen} onOpenChange={setIsOpen} variant={args.variant}>
          <DialogTrigger asChild>
            <Button>Open Full-Screen Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            {/* The Header now acts as a fixed app bar */}
            <DialogHeader>
              <DialogClose asChild>
                <Button variant="ghost" shape="full" className="h-10 w-10 p-0">
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
              <DialogTitle>Full-screen dialog title</DialogTitle>
              <Button variant="link">Save</Button>
            </DialogHeader>
            {/* Main content area should be scrollable */}
            <DialogBody>
              <div className="grid gap-6">
                <Input label="Event name" placeholder="Team Sync" />
                <Input label="Location" placeholder="Conference Room 4" />
                <Typography variant="p">
                  Add more form fields here to see the scrolling behavior...
                </Typography>
                {/* Add dummy content to demonstrate scrolling */}
                <div className="h-96 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50" />
                <div className="h-96 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50" />
              </div>
            </DialogBody>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};
