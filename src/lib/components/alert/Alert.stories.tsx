import type { Meta, StoryObj } from "@storybook/react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import {
  Alert,
  AlertAction,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "./index";

const meta: Meta<typeof Alert> = {
  title: "Components/Feedback/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "error", "outline"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    variant: "secondary",
  },
  render: (args) => (
    <div className="w-[500px]">
      <Alert {...args}>
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>System Update Available</AlertTitle>
          <AlertDescription>
            A new version of the application is ready to be installed. Please
            refresh your browser.
          </AlertDescription>
        </AlertContent>
        <AlertAction>
          <Button variant="secondary" size="sm">
            Update
          </Button>
        </AlertAction>
      </Alert>
    </div>
  ),
};

export const Variants: Story = {
  name: "Semantic Variants",
  render: () => (
    <div className="flex flex-col gap-4 w-[500px]">
      <Alert variant="error">
        <AlertIcon>
          <AlertCircle />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>Connection Failed</AlertTitle>
          <AlertDescription>
            We couldn't connect to the server.
          </AlertDescription>
        </AlertContent>
      </Alert>

      <Alert variant="primary">
        <AlertIcon>
          <CheckCircle2 />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>Payment Successful</AlertTitle>
          <AlertDescription>
            Your receipt has been sent to your email.
          </AlertDescription>
        </AlertContent>
      </Alert>

      <Alert variant="outline">
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>
            This uses the outline variant for subtle hints.
          </AlertDescription>
        </AlertContent>
      </Alert>
    </div>
  ),
};
