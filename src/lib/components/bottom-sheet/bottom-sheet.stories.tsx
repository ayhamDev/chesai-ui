import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button";
import { Input } from "../input";
import { Typography } from "../typography";
import { BottomSheet } from "./index";

const meta: Meta<typeof BottomSheet> = {
  title: "Components/BottomSheet",
  component: BottomSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A powerful bottom sheet component built on Vaul. It supports gestures, scrolling, and different presentation modes.",
      },
    },
  },
  argTypes: {
    mode: {
      control: "select",
      options: ["normal", "detached"],
      description:
        "Controls the presentation style. `detached` is more prominent on larger screens.",
    },
    // NEW: Added shape control
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "Controls the border-radius of the bottom sheet.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof BottomSheet>;

// Helper component for scrollable content (unchanged)
const DummyContent = () => (
  <div className="px-6">
    <Typography variant="h4">Sheet Content</Typography>
    <Typography variant="p">
      This is the main content area of the bottom sheet. lorem*100
    </Typography>
  </div>
);

export const Normal: Story = {
  name: "1. Normal Mode",
  args: {
    mode: "normal",
    shape: "minimal",
  },
  render: (args) => (
    <div className="flex h-screen w-screen items-center justify-center bg-graphite-background">
      <BottomSheet
        {...args}
        snapPoints={["200px", "500px", 1]}
        fadeFromIndex={0}
      >
        <BottomSheet.Trigger asChild>
          <Button>Open Normal Sheet</Button>
        </BottomSheet.Trigger>
        <BottomSheet.Content>
          <BottomSheet.Grabber />
          <div className="flex-1 overflow-y-auto">
            <DummyContent />
          </div>
          <BottomSheet.Footer>
            <BottomSheet.Close asChild>
              <Button size="lg" variant={"primary"}>
                Confirm Action
              </Button>
            </BottomSheet.Close>
          </BottomSheet.Footer>
        </BottomSheet.Content>
      </BottomSheet>
    </div>
  ),
};

export const Detached: Story = {
  name: "2. Detached Mode",
  args: {
    mode: "detached",
    shape: "minimal",
  },
  render: (args) => (
    <div className="flex h-screen w-screen items-center justify-center bg-graphite-background">
      <BottomSheet {...args}>
        <BottomSheet.Trigger asChild>
          <Button>Open Detached Sheet</Button>
        </BottomSheet.Trigger>
        <BottomSheet.Content>
          <BottomSheet.Grabber />
          <div className="flex-1 overflow-y-auto">
            <DummyContent />
          </div>
          <BottomSheet.Footer>
            <BottomSheet.Close asChild>
              <Button size="lg" variant={"primary"}>
                Confirm Action
              </Button>
            </BottomSheet.Close>
          </BottomSheet.Footer>
        </BottomSheet.Content>
      </BottomSheet>
    </div>
  ),
};

// NEW: Story to showcase all shape variations
export const AllShapes: Story = {
  name: "3. All Shapes",
  render: () => (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 bg-graphite-background">
      <div className="flex gap-4">
        {/* Normal Mode */}
        <BottomSheet mode="normal" shape="full">
          <BottomSheet.Trigger asChild>
            <Button>Normal Full</Button>
          </BottomSheet.Trigger>
          <BottomSheet.Content>
            <BottomSheet.Grabber /> <DummyContent />
          </BottomSheet.Content>
        </BottomSheet>
        <BottomSheet mode="normal" shape="minimal">
          <BottomSheet.Trigger asChild>
            <Button>Normal Minimal</Button>
          </BottomSheet.Trigger>
          <BottomSheet.Content>
            <BottomSheet.Grabber /> <DummyContent />
          </BottomSheet.Content>
        </BottomSheet>
        <BottomSheet mode="normal" shape="sharp">
          <BottomSheet.Trigger asChild>
            <Button>Normal Sharp</Button>
          </BottomSheet.Trigger>
          <BottomSheet.Content>
            <BottomSheet.Grabber /> <DummyContent />
          </BottomSheet.Content>
        </BottomSheet>
      </div>
      <div className="flex gap-4">
        {/* Detached Mode */}
        <BottomSheet mode="detached" shape="full">
          <BottomSheet.Trigger asChild>
            <Button variant="secondary">Detached Full</Button>
          </BottomSheet.Trigger>
          <BottomSheet.Content>
            <BottomSheet.Grabber /> <DummyContent />
          </BottomSheet.Content>
        </BottomSheet>
        <BottomSheet mode="detached" shape="minimal">
          <BottomSheet.Trigger asChild>
            <Button variant="secondary">Detached Minimal</Button>
          </BottomSheet.Trigger>
          <BottomSheet.Content>
            <BottomSheet.Grabber /> <DummyContent />
          </BottomSheet.Content>
        </BottomSheet>
        <BottomSheet mode="detached" shape="sharp">
          <BottomSheet.Trigger asChild>
            <Button variant="secondary">Detached Sharp</Button>
          </BottomSheet.Trigger>
          <BottomSheet.Content>
            <BottomSheet.Grabber /> <DummyContent />
          </BottomSheet.Content>
        </BottomSheet>
      </div>
    </div>
  ),
};
