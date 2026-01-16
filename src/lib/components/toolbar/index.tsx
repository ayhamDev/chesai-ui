"use client";

import * as ToolbarPrimitive from "@radix-ui/react-toolbar";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React, { createContext, useContext, useState } from "react";
import useRipple from "use-ripple-hook";
import { iconButtonVariants } from "../icon-button";
import { Tooltip, TooltipProvider, TooltipTrigger } from "../tooltip";
import { Typography } from "../typography";

type ToolbarSize = "sm" | "md" | "lg";
type ToolbarOrientation = "horizontal" | "vertical";
type ToolbarShape = "full" | "minimal" | "sharp";

interface ToolbarContextProps {
  orientation: ToolbarOrientation;
  size: ToolbarSize;
  shape: ToolbarShape;
}
const ToolbarContext = createContext<ToolbarContextProps>({
  orientation: "horizontal",
  size: "md",
  shape: "minimal",
});

const useToolbarContext = () => useContext(ToolbarContext);

const toolbarVariants = cva(
  "flex items-center transition-colors duration-200 border",
  {
    variants: {
      orientation: {
        horizontal: "flex-row w-fit",
        vertical: "flex-col h-fit",
      },
      variant: {
        primary: "bg-surface-container border-outline-variant",
        secondary: "bg-surface-container-high border-transparent",
        ghost: "bg-transparent border-transparent",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-2xl",
        sharp: "rounded-none",
      },
      shadow: {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
      },
      padding: {
        none: "p-0",
        sm: "p-1",
        md: "p-2",
        lg: "p-3",
      },
      gap: {
        none: "gap-0",
        sm: "gap-1",
        md: "gap-2",
        lg: "gap-3",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      variant: "primary",
      shape: "minimal",
      shadow: "none",
      padding: "sm",
      gap: "sm",
    },
  }
);

const separatorVariants = cva("bg-outline-variant shrink-0 opacity-60", {
  variants: {
    orientation: {
      horizontal: "w-[1px] mx-1",
      vertical: "h-[1px] my-1",
    },
    size: {
      sm: "h-3 w-3",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    },
  },
  compoundVariants: [
    { orientation: "horizontal", size: "sm", className: "h-3" },
    { orientation: "horizontal", size: "md", className: "h-5" },
    { orientation: "horizontal", size: "lg", className: "h-6" },
    { orientation: "vertical", size: "sm", className: "w-3" },
    { orientation: "vertical", size: "md", className: "w-5" },
    { orientation: "vertical", size: "lg", className: "w-6" },
  ],
  defaultVariants: {
    orientation: "horizontal",
    size: "md",
  },
});

const itemBaseStyles =
  "relative flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none overflow-hidden";

const toggleItemVariants = cva(itemBaseStyles, {
  variants: {
    variant: {
      default:
        "bg-transparent text-on-surface disabled:opacity-70 focus:ring-2 focus:ring-offset-2 focus:ring-primary " +
        "after:absolute after:inset-0 after:z-[1] after:bg-secondary-container after:opacity-0 after:scale-70 after:origin-center after:rounded-[inherit] after:transition-all after:duration-300 after:ease-out " +
        "hover:after:opacity-100 hover:after:scale-100 " +
        "disabled:after:opacity-0 " +
        "data-[state=on]:bg-secondary-container data-[state=on]:text-on-secondary-container",
      outline:
        "border border-transparent hover:border-outline-variant data-[state=on]:border-outline-variant data-[state=on]:bg-surface-container-high shadow-sm",
      primary:
        "hover:bg-primary/10 data-[state=on]:bg-primary data-[state=on]:text-on-primary",
    },
    size: {
      sm: "h-8 min-w-[2rem] text-xs px-1.5",
      md: "h-10 min-w-[2.5rem] text-sm px-2",
      lg: "h-12 min-w-[3rem] text-base px-3",
    },
    shape: {
      full: "rounded-full",
      minimal: "rounded-lg",
      sharp: "rounded-none",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
    shape: "minimal",
  },
});

interface ToolbarItemTooltipProps {
  children: React.ReactElement;
  content: string;
  shortcut?: string;
}

const ToolbarItemTooltip = ({
  children,
  content,
  shortcut,
}: ToolbarItemTooltipProps) => {
  const { orientation } = useToolbarContext();
  return (
    <TooltipProvider>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <Tooltip
        variant="primary"
        // @ts-ignore
        side={orientation === "vertical" ? "right" : "top"}
        className="flex items-center gap-3"
      >
        <span>{content}</span>
        {shortcut && (
          <Typography
            variant="small"
            className="!text-xs opacity-70 bg-white/20 px-1.5 py-0.5 rounded"
          >
            {shortcut}
          </Typography>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export interface ToolbarProps
  extends React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Root>,
    VariantProps<typeof toolbarVariants> {}

const ToolbarRoot = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.Root>,
  ToolbarProps
>(
  (
    {
      className,
      orientation = "horizontal",
      variant,
      shape = "minimal",
      shadow,
      padding,
      gap,
      // @ts-ignore
      size = "md",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <ToolbarContext.Provider
        value={{
          orientation: orientation!,
          size: size!,
          shape: shape!,
        }}
      >
        <ToolbarPrimitive.Root
          ref={ref}
          orientation={orientation}
          className={clsx(
            toolbarVariants({
              orientation,
              variant,
              shape,
              shadow,
              padding,
              gap,
            }),
            className
          )}
          {...props}
        >
          {children}
        </ToolbarPrimitive.Root>
      </ToolbarContext.Provider>
    );
  }
);
ToolbarRoot.displayName = "Toolbar";

const ToolbarSeparator = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Separator>
>(({ className, ...props }, ref) => {
  const { orientation, size } = useToolbarContext();
  return (
    <ToolbarPrimitive.Separator
      ref={ref}
      className={clsx(separatorVariants({ orientation, size }), className)}
      {...props}
    />
  );
});
ToolbarSeparator.displayName = "ToolbarSeparator";

interface ToolbarButtonProps
  extends React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Button>,
    VariantProps<typeof iconButtonVariants> {
  size?: ToolbarSize;
  shape?: ToolbarShape;
  tooltip?: string;
  shortcut?: string;
}

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  (
    {
      className,
      variant = "ghost",
      size,
      shape,
      children,
      tooltip,
      shortcut,
      ...props
    },
    ref
  ) => {
    const context = useToolbarContext();
    const finalSize = size || context.size;
    const finalShape = shape || context.shape;

    const localRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);

    const rippleColor =
      variant === "primary" || variant === "destructive"
        ? "var(--color-on-primary)"
        : "var(--color-primary)";

    const [, event] = useRipple({
      ref: localRef,
      color: rippleColor,
      duration: 400,
      // Fix: Removed opacity
    });

    const [isPressed, setIsPressed] = useState(false);

    const hasText = React.Children.toArray(children).some(
      (child) => typeof child === "string" || typeof child === "number"
    );

    const ButtonElement = (
      <ToolbarPrimitive.Button
        ref={localRef}
        onPointerDown={(e) => {
          event(e);
          !hasText && setIsPressed(true);
        }}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
        className={clsx(
          iconButtonVariants({
            variant,
            size: finalSize,
            shape: finalShape,
          }),
          hasText && "w-auto px-4 min-w-[auto] aspect-auto",
          className
        )}
        {...props}
      >
        <motion.span
          className="flex items-center justify-center gap-2 relative z-10"
          animate={{ scale: isPressed ? 0.9 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          {children}
        </motion.span>
      </ToolbarPrimitive.Button>
    );

    if (tooltip) {
      return (
        <ToolbarItemTooltip content={tooltip} shortcut={shortcut}>
          {ButtonElement}
        </ToolbarItemTooltip>
      );
    }

    return ButtonElement;
  }
);
ToolbarButton.displayName = "ToolbarButton";

const ToolbarToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.ToggleGroup>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.ToggleGroup>
>(({ className, ...props }, ref) => {
  const { orientation } = useToolbarContext();
  return (
    <ToolbarPrimitive.ToggleGroup
      ref={ref}
      className={clsx(
        "flex items-center gap-0.5",
        orientation === "vertical" ? "flex-col w-full" : "flex-row",
        className
      )}
      {...props}
    />
  );
});
ToolbarToggleGroup.displayName = "ToolbarToggleGroup";

interface ToolbarToggleItemProps
  extends React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.ToggleItem>,
    VariantProps<typeof toggleItemVariants> {
  size?: ToolbarSize;
  shape?: ToolbarShape;
  tooltip?: string;
  shortcut?: string;
}

const ToolbarToggleItem = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.ToggleItem>,
  ToolbarToggleItemProps
>(
  (
    { className, variant, size, shape, children, tooltip, shortcut, ...props },
    ref
  ) => {
    const context = useToolbarContext();
    const finalSize = size || context.size;
    const finalShape = shape || context.shape;

    const localRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);

    const [, event] = useRipple({
      ref: localRef,
      color: "var(--color-on-surface)",
      duration: 400,
      // Fix: Removed opacity
    });

    const [isPressed, setIsPressed] = useState(false);

    const ItemElement = (
      <ToolbarPrimitive.ToggleItem
        ref={localRef}
        onPointerDown={(e) => {
          event(e);
          setIsPressed(true);
        }}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
        className={clsx(
          toggleItemVariants({
            variant,
            size: finalSize,
            shape: finalShape,
          }),
          context.orientation === "vertical" && "w-full",
          className
        )}
        {...props}
      >
        <motion.span
          className="flex items-center justify-center gap-2 relative z-10"
          animate={{ scale: isPressed ? 0.9 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          {children}
        </motion.span>
      </ToolbarPrimitive.ToggleItem>
    );

    if (tooltip) {
      return (
        <ToolbarItemTooltip content={tooltip} shortcut={shortcut}>
          {ItemElement}
        </ToolbarItemTooltip>
      );
    }

    return ItemElement;
  }
);
ToolbarToggleItem.displayName = "ToolbarToggleItem";

export const Toolbar = Object.assign(ToolbarRoot, {
  Button: ToolbarButton,
  Separator: ToolbarSeparator,
  ToggleGroup: ToolbarToggleGroup,
  ToggleItem: ToolbarToggleItem,
  ItemTooltip: ToolbarItemTooltip,
});
