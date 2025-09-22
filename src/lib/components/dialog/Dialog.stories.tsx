import type { Meta, StoryObj } from "@storybook/react";
import { X } from "lucide-react";
import { useState } from "react";
// Import the AppBar component
import { AppBar } from "../appbar";
import { Button } from "../button";
import { IconButton } from "../icon-button";
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
  name: "Full-Screen Dialog with AppBar",
  args: {
    variant: "fullscreen",
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "The fullscreen variant integrated with the collapsible AppBar. The `AppBar.Provider` wraps the content inside the `DialogContent` to manage the scroll state, enabling animations and sticky behavior.",
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
            {/*
              1. The AppBar.Provider creates the scroll container for the Dialog.
                 It tracks scroll events and provides them to the AppBar component.
            */}
            <AppBar.Provider>
              {/*
                2. The AppBar replaces the simple DialogHeader. It's configured
                   to be large, collapsible, and conditionally sticky.
              */}
              <AppBar
                size="md"
                scrollBehavior="sticky"
                startAdornment={
                  <DialogClose asChild>
                    <IconButton variant="ghost" shape="full">
                      <X className="h-5 w-5" />
                    </IconButton>
                  </DialogClose>
                }
                animatedBehavior="appbar-color"
                animatedColor="background"
                endAdornments={[
                  <Button key="save" size={"sm"} variant="secondary">
                    Save
                  </Button>,
                ]}
              >
                <Typography variant="h4" className="truncate ">
                  Create New Event
                </Typography>
              </AppBar>

              {/*
                3. The DialogBody contains the main scrollable content.
                   IMPORTANT: It needs top padding equal to the expanded height of the AppBar
                   to prevent content from being hidden underneath it initially.
                   Large row (96px) + Large header content (h2, ~52px) = ~148px.
              */}
              <DialogBody className="pt-[100px] px-4 pb-8">
                <div className="grid gap-6">
                  <Input label="Event name" placeholder="Team Sync" />
                  <Input label="Location" placeholder="Conference Room 4" />
                  <Typography variant="p">
                    Scroll down to see the AppBar collapse and hide...
                  </Typography>
                  <div className="h-96 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50" />
                  <div className="h-96 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50" />
                  <Typography variant="p" className="text-center">
                    End of content.
                  </Typography>
                </div>
              </DialogBody>
            </AppBar.Provider>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};
