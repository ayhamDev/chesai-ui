import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "../../dialog";
import { Button } from "../../button";
import { Typography } from "../../typography";
import type { RegistryComponent } from "../types";

export const DialogConfig: RegistryComponent = {
  name: "Modal Dialog",
  category: "Layout",
  acceptsChildren: true,
  render: ({
    triggerText,
    title,
    description,
    variant,
    animation,
    shape,
    glass,
    children,
    ...props
  }) => (
    <div className="w-fit inline-block" {...props}>
      <Dialog variant={variant} animation={animation} glass={glass}>
        <DialogTrigger asChild>
          <Button>{triggerText || "Open Modal"}</Button>
        </DialogTrigger>
        <DialogContent shape={shape}>
          <DialogHeader>
            <DialogTitle>{title || "Dialog Title"}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          <DialogBody>
            {children || (
              <div className="py-8 text-center border-2 border-dashed border-outline-variant/30 rounded-xl mt-4 opacity-50 text-sm">
                Drop content here...
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="primary">Confirm</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
  controls: {
    triggerText: {
      type: "text",
      label: "Trigger Button Text",
      group: "Content",
      defaultValue: "Open Modal",
    },
    title: {
      type: "text",
      label: "Dialog Title",
      group: "Content",
      defaultValue: "Confirmation required",
      supportsCMS: true,
    },
    description: {
      type: "text",
      label: "Description",
      group: "Content",
      defaultValue: "Please review the information below before proceeding.",
      supportsCMS: true,
    },
    variant: {
      type: "select",
      label: "Presentation Variant",
      group: "Layout",
      defaultValue: "basic",
      options: [
        { label: "Basic (Centered)", value: "basic" },
        { label: "Fullscreen (Mobile)", value: "fullscreen" },
      ],
    },
    animation: {
      type: "select",
      label: "Animation Style",
      group: "Behavior",
      defaultValue: "material3",
      options: [
        { label: "Material 3 (Emphasized Drop)", value: "material3" },
        { label: "Default (Scale/Fade)", value: "default" },
      ],
    },
    shape: {
      type: "select",
      label: "Dialog Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Heavy Round)", value: "full" },
        { label: "Minimal (Standard)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
    glass: {
      type: "boolean",
      label: "Glassmorphism Backdrop",
      group: "Aesthetics",
      defaultValue: false,
    },
  },
};
