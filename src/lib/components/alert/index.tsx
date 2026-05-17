"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import React from "react";
import { Typography } from "../typography";

const alertVariants = cva(
  "relative w-full flex gap-3 p-4 border transition-colors duration-300",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-container text-on-primary-container border-transparent",
        secondary:
          "bg-secondary-container text-on-secondary-container border-transparent",
        tertiary:
          "bg-tertiary-container text-on-tertiary-container border-transparent",
        error: "bg-error-container text-on-error-container border-error/20",
        outline: "bg-surface border-outline-variant text-on-surface",
      },
      shape: {
        full: "rounded-[28px] px-6",
        minimal: "rounded-xl",
        sharp: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "secondary",
      shape: "minimal",
    },
  },
);

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "tertiary" | "error" | "outline";
  shape?: "full" | "minimal" | "sharp";
}
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, shape, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={clsx(alertVariants({ variant, shape }), className)}
      {...props}
    />
  ),
);
Alert.displayName = "Alert";

const AlertIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("mt-0.5 shrink-0 [&>svg]:h-5 [&>svg]:w-5", className)}
    {...props}
  />
));
AlertIcon.displayName = "AlertIcon";

const AlertContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("flex flex-1 flex-col gap-1 min-w-0", className)}
    {...props}
  />
));
AlertContent.displayName = "AlertContent";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <Typography
    as="h5"
    ref={ref}
    variant="label-large"
    className={clsx("font-bold tracking-tight text-inherit", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="body-small"
    className={clsx("text-inherit opacity-80 leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

const AlertAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("shrink-0 ml-auto flex items-start", className)}
    {...props}
  />
));
AlertAction.displayName = "AlertAction";

export {
  Alert,
  AlertIcon,
  AlertContent,
  AlertTitle,
  AlertDescription,
  AlertAction,
};
