"use client";

import * as RadixPopover from "@radix-ui/react-popover";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import React, { createContext, useContext } from "react";

type PopoverShape = "full" | "minimal" | "sharp";

type PopoverVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "high-contrast"
  | "ghost"
  | "surface"
  | "surface-container-lowest"
  | "surface-container-low"
  | "surface-container"
  | "surface-container-high"
  | "surface-container-highest";

interface PopoverContextProps {
  shape: PopoverShape;
  variant: PopoverVariant;
  glass: boolean;
}

const PopoverContext = createContext<PopoverContextProps>({
  shape: "minimal",
  variant: "secondary",
  glass: false,
});

const usePopoverContext = () => useContext(PopoverContext);

const contentVariants = cva(
  "z-50 p-4 border transition-all duration-300 shadow-md outline-none",
  {
    variants: {
      variant: {
        primary:
          "bg-surface-container-low text-on-surface border-outline-variant/50",
        secondary:
          "bg-surface-container-highest text-on-surface border-outline-variant/50",
        tertiary:
          "bg-tertiary-container text-on-tertiary-container border-transparent",
        "high-contrast":
          "bg-inverse-surface text-inverse-on-surface border-transparent",
        ghost: "bg-transparent text-on-surface border-transparent shadow-none",
        surface: "bg-surface text-on-surface border-outline-variant",
        "surface-container-lowest":
          "bg-surface-container-lowest text-on-surface border-outline-variant/30",
        "surface-container-low":
          "bg-surface-container-low text-on-surface border-outline-variant/30",
        "surface-container":
          "bg-surface-container text-on-surface border-outline-variant/30",
        "surface-container-high":
          "bg-surface-container-high text-on-surface border-outline-variant/30",
        "surface-container-highest":
          "bg-surface-container-highest text-on-surface border-outline-variant/30",
      },
      shape: {
        full: "rounded-3xl",
        minimal: "rounded-xl",
        sharp: "rounded-none",
      },
      glass: {
        true: "backdrop-blur-xl border-white/20 dark:border-white/10",
        false: "",
      },
    },
    compoundVariants: [
      {
        glass: true,
        variant: "primary",
        className: "bg-surface-container-low/60",
      },
      {
        glass: true,
        variant: "secondary",
        className: "bg-surface-container-highest/60",
      },
      {
        glass: true,
        variant: "tertiary",
        className: "bg-tertiary-container/60",
      },
      {
        glass: true,
        variant: "high-contrast",
        className: "bg-inverse-surface/60",
      },
      {
        glass: true,
        variant: "ghost",
        className: "bg-transparent backdrop-blur-xl",
      },
      {
        glass: true,
        variant: "surface",
        className: "bg-surface/60",
      },
      {
        glass: true,
        variant: "surface-container-lowest",
        className: "bg-surface-container-lowest/60",
      },
      {
        glass: true,
        variant: "surface-container-low",
        className: "bg-surface-container-low/60",
      },
      {
        glass: true,
        variant: "surface-container",
        className: "bg-surface-container/60",
      },
      {
        glass: true,
        variant: "surface-container-high",
        className: "bg-surface-container-high/60",
      },
      {
        glass: true,
        variant: "surface-container-highest",
        className: "bg-surface-container-highest/60",
      },
    ],
    defaultVariants: {
      variant: "secondary",
      shape: "minimal",
      glass: false,
    },
  },
);

// Map variants to exact matching fill and stroke colors
const arrowVariants = cva("fill-current [&>polygon]:fill-current", {
  variants: {
    variant: {
      primary:
        "text-surface-container-low [&>polygon]:stroke-outline-variant/30 stroke-outline-variant/30",
      secondary:
        "text-surface-container-highest [&>polygon]:stroke-outline-variant/30 stroke-outline-variant/30",
      tertiary:
        "text-tertiary-container [&>polygon]:stroke-transparent stroke-transparent",
      "high-contrast":
        "text-inverse-surface [&>polygon]:stroke-transparent stroke-transparent",
      ghost:
        "text-transparent [&>polygon]:stroke-transparent stroke-transparent",
      surface:
        "text-surface [&>polygon]:stroke-outline-variant stroke-outline-variant",
      "surface-container-lowest":
        "text-surface-container-lowest [&>polygon]:stroke-outline-variant/30 stroke-outline-variant/30",
      "surface-container-low":
        "text-surface-container-low [&>polygon]:stroke-outline-variant/30 stroke-outline-variant/30",
      "surface-container":
        "text-surface-container [&>polygon]:stroke-outline-variant/30 stroke-outline-variant/30",
      "surface-container-high":
        "text-surface-container-high [&>polygon]:stroke-outline-variant/30 stroke-outline-variant/30",
      "surface-container-highest":
        "text-surface-container-highest [&>polygon]:stroke-outline-variant/30 stroke-outline-variant/30",
    },
  },
  defaultVariants: {
    variant: "secondary",
  },
});

interface PopoverRootProps extends RadixPopover.PopoverProps {
  shape?: PopoverShape;
  variant?: PopoverVariant;
  glass?: boolean;
}

const PopoverRoot = ({
  shape = "minimal",
  variant = "secondary",
  glass = false,
  ...props
}: PopoverRootProps) => {
  return (
    <PopoverContext.Provider value={{ shape, variant, glass }}>
      <RadixPopover.Root {...props} />
    </PopoverContext.Provider>
  );
};
PopoverRoot.displayName = "Popover";

const PopoverTrigger = RadixPopover.Trigger;
const PopoverAnchor = RadixPopover.Anchor;
const PopoverPortal = RadixPopover.Portal;
const PopoverClose = RadixPopover.Close;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof RadixPopover.Content>,
  React.ComponentPropsWithoutRef<typeof RadixPopover.Content>
>(({ className, align = "center", sideOffset = 8, ...props }, ref) => {
  const { shape, variant, glass } = usePopoverContext();

  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={clsx(
          contentVariants({ shape, variant, glass }),
          "data-[state=open]:animate-menu-enter",
          "data-[state=closed]:animate-menu-exit",
          className,
        )}
        {...props}
      />
    </RadixPopover.Portal>
  );
});
PopoverContent.displayName = RadixPopover.Content.displayName;

const PopoverArrow = React.forwardRef<
  React.ElementRef<typeof RadixPopover.Arrow>,
  React.ComponentPropsWithoutRef<typeof RadixPopover.Arrow>
>(({ className, width = 14, height = 7, ...props }, ref) => {
  const { variant } = usePopoverContext();

  return (
    <RadixPopover.Arrow
      ref={ref}
      width={width}
      height={height}
      className={clsx(arrowVariants({ variant }), className)}
      {...props}
    />
  );
});
PopoverArrow.displayName = RadixPopover.Arrow.displayName;

export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Anchor: PopoverAnchor,
  Portal: PopoverPortal,
  Close: PopoverClose,
}) as typeof PopoverRoot & {
  Trigger: typeof PopoverTrigger;
  Content: typeof PopoverContent;
  Anchor: typeof PopoverAnchor;
  Portal: typeof PopoverPortal;
  Close: typeof PopoverClose;
};
