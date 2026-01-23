import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button";
import { Typography } from "../typography";
import { toast, Toaster } from "./index";

const meta: Meta<typeof Toaster> = {
  title: "Components/Feedback/Toaster",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A styled wrapper around the `sonner` toast library. To use, place the `<Toaster />` component at the root of your app, then call the `toast()` function from anywhere to trigger a notification.",
      },
    },
  },
  argTypes: {
    position: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    },
    expand: { control: "boolean" },
    richColors: { control: "boolean" },
    duration: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  name: "1. Basic Usage",
  args: {
    position: "bottom-right",
  },
  render: (args) => (
    <div className="h-[75vh]">
      <Toaster {...args} />
      <div className="flex flex-col items-start gap-4">
        <Typography variant="large">Trigger Toasts</Typography>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => toast("A new event has been created.")}
          >
            Default
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.message("Event Created", {
                description: "Sunday, October 5, 2025 at 2:43 PM",
              })
            }
          >
            With Description
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.success("Profile updated successfully!")}
          >
            Success
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.error("Failed to connect to the server.")}
          >
            Error
          </Button>
        </div>
      </div>
    </div>
  ),
};

export const WithActions: Story = {
  name: "2. With Actions",
  args: {
    ...Default.args,
  },
  render: (args) => (
    <div className="h-[75vh]">
      <Toaster {...args} />
      <Button
        onClick={() =>
          toast("An item was added to your cart.", {
            action: {
              label: "Undo",
              onClick: () => console.log("Undo action triggered"),
            },
            cancel: {
              label: "Dismiss",
              onClick: () => console.log("Cancel action triggered"),
            },
          })
        }
      >
        Trigger Action Toast
      </Button>
    </div>
  ),
};

// Helper function to simulate a promise
const simulatePromise = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      // Randomly resolve or reject
      if (Math.random() > 0.3) {
        resolve({ name: "Chesai UI" });
      } else {
        reject({ name: "API Error" });
      }
    }, 2000);
  });

export const AsyncPromise: Story = {
  name: "3. Async (Promise)",
  args: {
    ...Default.args,
  },
  render: (args) => (
    <div className="h-[75vh]">
      <Toaster {...args} />
      <Button
        onClick={() =>
          toast.promise(simulatePromise, {
            loading: "Saving your preferences...",
            success: (data: any) => `${data.name} preferences have been saved!`,
            error: "Could not save preferences.",
          })
        }
      >
        Trigger Promise Toast
      </Button>
    </div>
  ),
};

export const Positioning: Story = {
  name: "4. Positioning",
  render: () => (
    <div className="h-[75vh] grid grid-cols-3 gap-4">
      <Toaster position="top-left" />
      <Toaster position="top-center" />
      <Toaster position="top-right" />
      <Toaster position="bottom-left" />
      <Toaster position="bottom-center" />
      <Toaster position="bottom-right" />

      <Button
        variant="secondary"
        onClick={() => toast("Top Left", { id: "tl" })}
      >
        Top Left
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast("Top Center", { id: "tc" })}
      >
        Top Center
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast("Top Right", { id: "tr" })}
      >
        Top Right
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast("Bottom Left", { id: "bl" })}
      >
        Bottom Left
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast("Bottom Center", { id: "bc" })}
      >
        Bottom Center
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast("Bottom Right", { id: "br" })}
      >
        Bottom Right
      </Button>
    </div>
  ),
};
