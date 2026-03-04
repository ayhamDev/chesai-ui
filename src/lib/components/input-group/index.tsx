"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import * as React from "react";
import { Input, type InputProps } from "../input";
import { Textarea, type TextareaProps } from "../textarea";

export const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("relative flex w-full", className)}
    {...props}
  />
));
InputGroup.displayName = "InputGroup";

const addonVariants = cva(
  "absolute z-10 flex items-center text-on-surface-variant pointer-events-none",
  {
    variants: {
      align: {
        start: "left-3 top-1/2 -translate-y-1/2",
        end: "right-3 top-1/2 -translate-y-1/2",
        "block-end": "bottom-3 right-3",
      },
    },
    defaultVariants: {
      align: "end",
    },
  },
);

export interface InputGroupAddonProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof addonVariants> {}

export const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  InputGroupAddonProps
>(({ className, align, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(addonVariants({ align }), className)}
    {...props}
  />
));
InputGroupAddon.displayName = "InputGroupAddon";

export const InputGroupText = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={clsx("text-xs font-medium opacity-70", className)}
    {...props}
  />
));
InputGroupText.displayName = "InputGroupText";

export const InputGroupTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, classNames, ...props }, ref) => (
  <Textarea
    ref={ref}
    className={className}
    classNames={{
      ...classNames,
      // Ensure there is padding at the bottom so text doesn't go under the block-end addon
      input: clsx("pb-8", classNames?.input),
    }}
    {...props}
  />
));
InputGroupTextarea.displayName = "InputGroupTextarea";

export const InputGroupInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, classNames, ...props }, ref) => (
    <Input ref={ref} className={className} classNames={classNames} {...props} />
  ),
);
InputGroupInput.displayName = "InputGroupInput";
