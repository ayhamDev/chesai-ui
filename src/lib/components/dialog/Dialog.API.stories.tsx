import type { Meta, StoryObj } from "@storybook/react";
import { AlertTriangle, Info, Trash2 } from "lucide-react";
import { DialogProvider, useDialog } from "../../context/DialogProvider";
import { Button } from "../button";
import { Card } from "../card";
import { Toaster, toast } from "../toast";
import { Typography } from "../typography";

const meta: Meta = {
  title: "Components/Dialog/Dialog (API)",
  decorators: [
    (Story) => (
      <DialogProvider>
        <div className="h-[600px] w-full flex items-center justify-center bg-graphite-background">
          <Toaster />
          <Story />
        </div>
      </DialogProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

const DialogApiDemo = () => {
  const { show } = useDialog();

  const handleSimpleAlert = () => {
    show({
      title: "Operation Successful",
      description: "Your changes have been saved to the cloud.",
      cancelLabel: "Close",
      // Hide confirm button for simple alerts
      onConfirm: undefined,
      contentProps: { className: "text-center" }, // Center text
    });
  };

  const handleConfirmDestructive = async () => {
    const confirmed = await show({
      title: "Delete Account?",
      description: "This action cannot be undone. All data will be lost.",
      confirmLabel: "Delete",
      destructive: true,
      // Pass a custom body if you need more than just text
      body: (
        <div className="bg-error-container/30 p-3 rounded-lg flex items-center gap-3 text-error mt-2">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">Warning: Critical Action</span>
        </div>
      ),
    });

    if (confirmed) {
      toast.error("Account deleted");
    } else {
      toast("Cancelled");
    }
  };

  const handleAsyncAction = async () => {
    await show({
      title: "Processing Payment",
      description: "Please confirm your purchase of $49.00",
      confirmLabel: "Pay Now",
      onConfirm: async () => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        toast.success("Payment successful!");
      },
    });
  };

  return (
    <Card className="flex flex-col gap-6 p-8 min-w-[320px]">
      <Typography variant="h4" className="text-center mb-2">
        Imperative Dialogs
      </Typography>

      <Button onClick={handleSimpleAlert} variant="secondary">
        <Info className="mr-2 h-4 w-4" /> Simple Alert
      </Button>

      <Button onClick={handleAsyncAction} variant="primary">
        Async Confirmation
      </Button>

      <Button onClick={handleConfirmDestructive} variant="destructive">
        <Trash2 className="mr-2 h-4 w-4" /> Destructive Confirm
      </Button>
    </Card>
  );
};

export const StandardUsage: StoryObj = {
  render: () => <DialogApiDemo />,
};
