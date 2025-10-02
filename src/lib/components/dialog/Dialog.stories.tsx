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
          "A fully accessible, custom-built dialog component with support for basic and fullscreen variants. The fullscreen variant's body is an `ElasticScrollArea`, enabling pull-to-refresh and other advanced scrolling effects.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["basic", "fullscreen"],
    },
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
  console.log("Refresh triggered!");
  return new Promise((resolve) => setTimeout(resolve, 2000));
};

export const Basic: Story = {
  name: "Basic Dialog",
  args: { variant: "basic", shape: "minimal" },
  parameters: { layout: "centered" },
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
  args: { variant: "fullscreen" },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "The `DialogBody` in a fullscreen dialog is now an `ElasticScrollArea`. This allows for native-like scrolling and enables features like `pullToRefresh`. The `AppBar`'s `scrollContainerRef` points to the `DialogBody`'s ref to synchronize scroll animations.",
      },
    },
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
              size="md"
              scrollBehavior="conditionally-sticky"
              startAdornment={
                <DialogClose asChild>
                  <IconButton variant="ghost" size={"md"} shape="full">
                    <X className="h-5 w-5" />
                  </IconButton>
                </DialogClose>
              }
              animatedBehavior={["shadow"]}
              appBarColor="card"
              endAdornments={[
                <Button key="save" size={"sm"} variant="secondary">
                  Save
                </Button>,
              ]}
              scrollContainerRef={scrollRef}
            >
              <Typography variant="h4" className="truncate font-semibold">
                Create New Event
              </Typography>
            </AppBar>

            <DialogBody
              ref={scrollRef}
              className="px-4 pb-8"
              pullToRefresh={false}
              onRefresh={simulateRefresh}
            >
              <div className="grid gap-6 pt-[70px]">
                <Input label="Event name" placeholder="Team Sync" />
                <Input label="Location" placeholder="Conference Room 4" />
                <Typography variant="p">
                  Scroll down to see the AppBar animate. You can also pull down
                  from the top to refresh.
                </Typography>
                <div className="h-96 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50" />
                <div className="h-96 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50" />
                <Typography variant="p" className="text-center">
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
