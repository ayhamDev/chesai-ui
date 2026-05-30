import React from "react";
import * as Icons from "lucide-react";
import {
  Alert,
  AlertIcon,
  AlertContent,
  AlertTitle,
  AlertDescription,
} from "../../alert";
import type { RegistryComponent } from "../types";

export const AlertConfig: RegistryComponent = {
  name: "Alert Box",
  category: "Elements",
  render: ({ title, description, icon, variant, shape, ...props }) => {
    const IconComponent = icon ? (Icons as any)[icon] : null;

    return (
      <div className="w-full" {...props}>
        <Alert variant={variant} shape={shape}>
          {IconComponent && (
            <AlertIcon>
              <IconComponent />
            </AlertIcon>
          )}
          <AlertContent>
            {title && <AlertTitle>{title}</AlertTitle>}
            {description && <AlertDescription>{description}</AlertDescription>}
          </AlertContent>
        </Alert>
      </div>
    );
  },
  controls: {
    title: {
      type: "text",
      label: "Title",
      defaultValue: "System Notification",
      group: "Content",
      supportsCMS: true,
    },
    description: {
      type: "textarea",
      label: "Description",
      defaultValue: "This is a descriptive message for the alert.",
      group: "Content",
      supportsCMS: true,
    },
    icon: {
      type: "text",
      label: "Icon (Lucide Name)",
      defaultValue: "Info",
      description: "e.g., Info, AlertTriangle, CheckCircle2",
      group: "Icons",
    },
    variant: {
      type: "select",
      label: "Variant",
      group: "Aesthetics",
      defaultValue: "secondary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Tertiary", value: "tertiary" },
        { label: "Error", value: "error" },
        { label: "Outline", value: "outline" },
      ],
    },
    shape: {
      type: "select",
      label: "Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Pill)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
  },
};
