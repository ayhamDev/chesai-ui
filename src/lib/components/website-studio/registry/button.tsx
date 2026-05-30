import React from "react";
import * as Icons from "lucide-react";
import { Button } from "../../button";
import type { RegistryComponent } from "../types";

export const ButtonConfig: RegistryComponent = {
  name: "Button",
  category: "Elements",
  render: ({
    children,
    variant,
    size,
    shape,
    startIcon,
    endIcon,
    linkTo,
    newTab,
    isLoading,
    disabled,
    onClick,
    ...props
  }) => {
    const StartIconComponent = startIcon ? (Icons as any)[startIcon] : null;
    const EndIconComponent = endIcon ? (Icons as any)[endIcon] : null;

    const handleClick = (e: React.MouseEvent) => {
      if (onClick) onClick(e);
      if (linkTo && !e.defaultPrevented) {
        e.preventDefault();
        e.currentTarget.dispatchEvent(
          new CustomEvent("studio-navigate", {
            detail: { linkTo, newTab },
            bubbles: true,
          }),
        );
      }
    };

    return (
      <Button
        variant={variant}
        size={size}
        shape={shape}
        startIcon={
          StartIconComponent ? <StartIconComponent size={18} /> : undefined
        }
        endIcon={EndIconComponent ? <EndIconComponent size={18} /> : undefined}
        isLoading={isLoading}
        disabled={disabled}
        onClick={handleClick}
        {...props}
      >
        {children || "Button"}
      </Button>
    );
  },
  controls: {
    children: {
      type: "text",
      label: "Label Text",
      defaultValue: "Click Me",
      group: "Content",
      supportsCMS: true,
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
        { label: "Ghost", value: "ghost" },
        { label: "Destructive", value: "destructive" },
        { label: "Link", value: "link" },
      ],
    },
    size: {
      type: "select",
      label: "Size",
      group: "Aesthetics",
      defaultValue: "md",
      options: [
        { label: "Extra Small", value: "xs" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
        { label: "Extra Large", value: "xl" },
      ],
    },
    shape: {
      type: "select",
      label: "Shape",
      group: "Aesthetics",
      defaultValue: "full",
      options: [
        { label: "Full (Pill)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
    startIcon: {
      type: "text",
      label: "Start Icon (Lucide)",
      description: "e.g., 'ArrowRight', 'Plus'",
      group: "Icons",
    },
    endIcon: {
      type: "text",
      label: "End Icon (Lucide)",
      description: "e.g., 'ChevronRight'",
      group: "Icons",
    },
    linkTo: {
      type: "link",
      label: "Link To URL / Page",
      group: "Behavior",
      supportsCMS: true,
    },
    newTab: {
      type: "boolean",
      label: "Open in new tab",
      group: "Behavior",
      hidden: (props) => !props.linkTo || props.linkTo.trim() === "",
    },
    isLoading: {
      type: "boolean",
      label: "Loading State",
      group: "State",
    },
    disabled: {
      type: "boolean",
      label: "Disabled State",
      group: "State",
    },
  },
};
