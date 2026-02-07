import type { Meta, StoryObj } from "@storybook/react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../button";
import { Toaster } from "./index";

const meta: Meta<typeof Toaster> = {
  title: "Components/Feedback/Toaster",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A highly customizable toast component. Supports all Card variants (`primary`, `secondary`, `high-contrast`) and adapts to semantic states (`error`, `success`).",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "tertiary",
        "high-contrast",
        "ghost",
        "surface",
      ],
      description: "The visual style of standard (non-semantic) toasts.",
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    shadow: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
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
  },
  decorators: [
    (Story) => (
      <div className="w-[800px] h-[500px] bg-graphite-background relative border border-dashed border-outline-variant rounded-xl overflow-hidden flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Playground: Story = {
  args: {
    variant: "secondary",
    shape: "minimal",
    shadow: "lg",
    position: "bottom-right",
  },
  render: (args) => (
    <div className="flex flex-col gap-4 items-center">
      <Toaster {...args} />

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="secondary"
          onClick={() =>
            toast("Standard Notification", {
              description: `This uses the '${args.variant}' variant style.`,
            })
          }
        >
          Default Toast
        </Button>

        <Button
          variant="primary"
          onClick={() =>
            toast.success("Success", {
              description: "File uploaded successfully.",
            })
          }
        >
          Success Toast
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            toast.info("Information", {
              description: "There is a new update available.",
            })
          }
        >
          Info Toast
        </Button>

        <Button
          variant="destructive"
          onClick={() =>
            toast.error("Critical Error", {
              description: "Could not connect to the server.",
              action: {
                label: "Retry",
                onClick: () => console.log("Retrying..."),
              },
            })
          }
        >
          Error Toast
        </Button>
      </div>
    </div>
  ),
};

export const HighContrast: Story = {
  name: "Variant: High Contrast",
  args: {
    variant: "high-contrast",
    position: "bottom-center",
    shape: "full",
  },
  render: (args) => (
    <div className="flex flex-col gap-4 items-center">
      <Toaster {...args} />
      <Button
        onClick={() =>
          toast("Inverse Surface", {
            description: "This creates high contrast against the background.",
          })
        }
      >
        Show High Contrast
      </Button>
    </div>
  ),
};

export const TertiaryVariant: Story = {
  name: "Variant: Tertiary",
  args: {
    variant: "tertiary",
    position: "top-center",
    shape: "minimal",
  },
  render: (args) => (
    <div className="flex flex-col gap-4 items-center">
      <Toaster {...args} />
      <Button
        variant="tertiary"
        onClick={() =>
          toast("Tertiary Style", {
            description: "Using tertiary container colors.",
            action: {
              label: "Undo",
              onClick: () => console.log("Undo"),
            },
          })
        }
      >
        Show Tertiary
      </Button>
    </div>
  ),
};

export const ActionExample: Story = {
  name: "With Actions",
  args: {
    variant: "primary",
    position: "bottom-right",
  },
  render: (args) => (
    <div className="flex flex-col gap-4 items-center">
      <Toaster {...args} />
      <Button
        variant="secondary"
        onClick={() =>
          toast("Email Deleted", {
            description: "The conversation was moved to trash.",
            icon: <Trash2 className="w-5 h-5 text-error" />,
            action: {
              label: "Undo",
              onClick: () => console.log("Undo clicked"),
            },
            cancel: {
              label: "Dismiss",
              onClick: () => console.log("Dismissed"),
            },
          })
        }
      >
        Trigger Action
      </Button>
    </div>
  ),
};
