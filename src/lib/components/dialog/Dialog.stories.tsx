import type { Meta, StoryObj } from "@storybook/react";
import { X } from "lucide-react";
import { useRef, useState } from "react";
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
  type DialogContentProps,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  type DialogProps,
  DialogTitle,
  DialogTrigger,
} from "./index";

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
          "A fully accessible, custom-built dialog component with support for basic and fullscreen variants. Uses MD3 animation curves.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["basic", "fullscreen"],
    },
    animation: {
      control: "select",
      options: ["default", "material3"],
      description: "Controls the open/close animation style.",
    },
    // The variant passed here is for the dialog structure, but DialogContent
    // wraps a Card. We typically rely on the Card's defaults, but if you want
    // to control the card variant in the story, you'd pass it to DialogContent directly in render.
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      if: { arg: "variant", eq: "basic" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock refresh function for the story
const simulateRefresh = () => {
  return new Promise((resolve) => setTimeout(resolve, 2000));
};

export const Basic: Story = {
  name: "Basic Dialog",
  args: {
    variant: "basic",
    shape: "minimal",
    animation: "default",
  },
  parameters: { layout: "centered" },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        variant={args.variant}
        animation={args.animation}
      >
        <DialogTrigger asChild>
          <Button>Open Basic Dialog</Button>
        </DialogTrigger>
        <DialogContent shape={args.shape} variant="surface-container-high">
          <DialogHeader>
            <DialogTitle>Basic Dialog Title</DialogTitle>
            <DialogDescription>
              This is a standard modal dialog using the{" "}
              <code>surface-container-high</code> variant.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Typography variant="body-medium">
              It floats in the center and has a scale/fade animation.
            </Typography>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button onClick={() => setIsOpen(false)}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

export const MaterialAnimation: Story = {
  name: "Material Design 3 Animation",
  args: { variant: "basic", shape: "full", animation: "material3" },
  parameters: { layout: "centered" },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        variant={args.variant}
        animation={args.animation}
      >
        <DialogTrigger asChild>
          <Button variant="secondary">Open Material Dialog</Button>
        </DialogTrigger>
        <DialogContent shape={args.shape} variant="surface-container-highest">
          <DialogHeader>
            <DialogTitle>Material Design 3</DialogTitle>
            <DialogDescription>
              Notice the slide-down and grow animation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Typography variant="body-medium">
              This animation mimics the official Material Web implementation
              using Emphasized easing curves.
            </Typography>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button>Agree</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

export const FullScreen: Story = {
  name: "Full-Screen Dialog",
  args: { variant: "fullscreen" },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
      <div className="h-screen w-screen bg-gray-100 p-4">
        <Dialog open={isOpen} onOpenChange={setIsOpen} variant={args.variant}>
          <DialogTrigger asChild>
            <Button>Open Full-Screen Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <AppBar
              variant="center"
              color="surface-container"
              leadingIcon={
                <DialogClose asChild>
                  <IconButton variant="ghost" size="md">
                    <X className="h-5 w-5" />
                  </IconButton>
                </DialogClose>
              }
              trailingIcons={
                <Button key="save" size="sm" variant="secondary">
                  Save
                </Button>
              }
              title="Create New Event"
              scrollContainerRef={scrollRef}
            />

            <DialogBody
              ref={scrollRef}
              className="px-4 pb-8 pt-[64px]"
              pullToRefresh={false}
              onRefresh={simulateRefresh}
            >
              <div className="grid gap-6 pt-[20px]">
                <Input label="Event name" placeholder="Team Sync" />
                <Input label="Location" placeholder="Conference Room 4" />
                <div className="h-96 rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-low" />
                <div className="h-96 rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-low" />
                <Typography body-medium className="text-center">
                  End of content.
                </Typography>
              </div>
            </DialogBody>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};
