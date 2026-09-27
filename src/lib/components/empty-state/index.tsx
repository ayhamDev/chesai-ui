"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import React from "react";
import { Typography } from "../typography";

const emptyStateVariants = cva(
  "flex w-full flex-col items-center justify-center text-center p-8 gap-3",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        card: "bg-surface-container-low border border-outline-variant rounded-xl shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card";
  icon?: React.ReactNode;
  /** Custom artwork or component above the title. Replaces icon without resizing or cloning it. */
  visual?: React.ReactNode;
  classNames?: Partial<Record<"visual" | "icon" | "title" | "description" | "action", string>>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, classNames, variant, icon, visual, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(emptyStateVariants({ variant }), className)}
        {...props}
      >
        {visual != null ? (
          <div className={clsx("mb-2 flex max-w-full items-center justify-center", classNames?.visual)}>
            {visual}
          </div>
        ) : icon && (
          <div className={clsx("mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant", classNames?.icon)}>
            {/* Clone icon to ensure consistent sizing if it's an SVG */}
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement, {
                  // @ts-ignore
                  className: clsx(
                    "h-10 w-10 opacity-70",
                    (icon.props as any).className,
                  ),
                })
              : icon}
          </div>
        )}
        <Typography
          variant="title-medium"
          className={clsx("font-bold text-on-surface", classNames?.title)}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            variant="body-medium"
            className={clsx("max-w-sm text-on-surface-variant opacity-80", classNames?.description)}
          >
            {description}
          </Typography>
        )}
        {action && <div className={classNames?.action}>{action}</div>}
      </div>
    );
  },
);

EmptyState.displayName = "EmptyState";
