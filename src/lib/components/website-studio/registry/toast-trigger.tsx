import React from "react";
import { Button } from "../../button";
import { toast } from "../../toast";
import type { RegistryComponent } from "../types";

export const ToastTriggerConfig: RegistryComponent = {
  name: "Toast Trigger",
  category: "Interactions",
  render: ({ label, type, message, description, shape, variant, ...props }) => (
    <div className="w-fit inline-block" {...props}>
      <Button
        shape={shape}
        variant={variant}
        onClick={() => {
          if (type === "success") {
            toast.success(message || "Success", { description });
          } else if (type === "error") {
            toast.error(message || "Error", { description });
          } else if (type === "info") {
            toast.info(message || "Info", { description });
          } else {
            toast(message || "Notification", { description });
          }
        }}
      >
        {label || "Trigger Toast"}
      </Button>
    </div>
  ),
  controls: {
    label: {
      type: "text",
      label: "Button Label",
      group: "Content",
      defaultValue: "Show Notification",
    },
    message: {
      type: "text",
      label: "Toast Message",
      group: "Content",
      defaultValue: "Changes saved successfully.",
      supportsCMS: true,
    },
    description: {
      type: "text",
      label: "Toast Description (Optional)",
      group: "Content",
      defaultValue: "Your data is secure.",
      supportsCMS: true,
    },
    type: {
      type: "select",
      label: "Toast Semantic Type",
      group: "Behavior",
      defaultValue: "default",
      options: [
        { label: "Default", value: "default" },
        { label: "Success", value: "success" },
        { label: "Error", value: "error" },
        { label: "Info", value: "info" },
      ],
    },
    variant: {
      type: "select",
      label: "Button Variant",
      group: "Aesthetics",
      defaultValue: "secondary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Ghost", value: "ghost" },
        { label: "Outline", value: "outline" },
      ],
    },
    shape: {
      type: "select",
      label: "Button Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full", value: "full" },
        { label: "Minimal", value: "minimal" },
        { label: "Sharp", value: "sharp" },
      ],
    },
  },
};
