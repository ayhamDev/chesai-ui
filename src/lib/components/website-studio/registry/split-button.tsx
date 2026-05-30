import React from "react";
import * as Icons from "lucide-react";
import { SplitButton } from "../../split-button";
import { Button } from "../../button";
import { IconButton } from "../../icon-button";
import type { RegistryComponent } from "../types";

export const SplitButtonConfig: RegistryComponent = {
  name: "Split Button",
  category: "Elements",
  render: ({ label, variant, shape, size, primaryIcon, secondaryIcon, ...props }) => {
    const PrimaryIconComp = primaryIcon ? (Icons as any)[primaryIcon] : null;
    const SecondaryIconComp = secondaryIcon ? (Icons as any)[secondaryIcon] : (Icons as any)["ChevronDown"];

    return (
      <div className="w-fit inline-block" {...props}>
        <SplitButton shape={shape}>
          <Button
            variant={variant}
            size={size}
            startIcon={PrimaryIconComp ? <PrimaryIconComp size={16} /> : undefined}
          >
            {label || "Action"}
          </Button>
          <IconButton variant={variant} size={size} aria-label="More options">
            <SecondaryIconComp size={16} />
          </IconButton>
        </SplitButton>
      </div>
    );
  },
  controls: {
    label: {
      type: "text",
      label: "Primary Action Label",
      defaultValue: "Create New",
      group: "Content",
      supportsCMS: true,
    },
    primaryIcon: {
      type: "text",
      label: "Primary Icon (Lucide)",
      defaultValue: "Plus",
      group: "Icons",
    },
    secondaryIcon: {
      type: "text",
      label: "Secondary Icon (Lucide)",
      defaultValue: "ChevronDown",
      group: "Icons",
    },
    variant: {
      type: "select",
      label: "Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Tertiary", value: "tertiary" },
        { label: "Outline", value: "outline" },
      ],
    },
    size: {
      type: "select",
      label: "Size",
      group: "Aesthetics",
      defaultValue: "md",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
    shape: {
      type: "select",
      label: "Outer Shape",
      group: "Aesthetics",
      defaultValue: "full",
      options: [
        { label: "Full (Pill)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
  },
};
