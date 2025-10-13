"use client";

import { Slot } from "@radix-ui/react-slot";
import { useLongPress } from "@uidotdev/usehooks";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import * as React from "react";
import useRipple from "use-ripple-hook";

// --- Context for Item Configuration ---
interface ItemContextProps {
  variant: "primary" | "secondary" | "ghost";
  size: "sm" | "md" | "lg";
  direction: "horizontal" | "vertical";
}

const ItemContext = React.createContext<ItemContextProps>({
  variant: "primary",
  size: "md",
  direction: "horizontal",
});

const useItemContext = () => React.useContext(ItemContext);

// --- CVA Variants ---
const itemVariants = cva(
  "group/item relative flex flex-wrap items-center border text-sm outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-graphite-ring focus-visible:ring-offset-2 overflow-hidden",
  {
    variants: {
      variant: {
        primary: "bg-graphite-card border-graphite-border",
        secondary: "bg-graphite-secondary border-transparent",
        ghost:
          "bg-transparent border-transparent hover:bg-graphite-secondary/60",
      },
      size: {
        sm: "gap-3",
        md: "gap-4",
        lg: "gap-4",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4",
        lg: "p-5",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-xl",
        sharp: "rounded-none",
      },
      direction: {
        horizontal: "flex-row",
        vertical: "flex-col justify-center text-center",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      padding: "md",
      shape: "minimal",
      direction: "horizontal",
    },
  }
);

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "",
        icon: "bg-graphite-secondary border border-graphite-border [&_svg:not([class*='size-'])]:text-graphite-foreground/80",
        avatar: "overflow-hidden",
      },
      size: {
        sm: "size-8 rounded-lg [&_svg:not([class*='size-'])]:size-4",
        md: "size-10 rounded-lg [&_svg:not([class*='size-'])]:size-5",
        lg: "size-12 rounded-xl [&_svg:not([class*='size-'])]:size-6",
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
  }
);

// --- Compound Components ---

const ItemGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="list"
    data-slot="item-group"
    className={clsx("group/item-group flex flex-col gap-2", className)}
    {...props}
  />
));
ItemGroup.displayName = "ItemGroup";

const ItemSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="item-separator"
    className={clsx("h-px w-full bg-graphite-border", className)}
    {...props}
  />
));
ItemSeparator.displayName = "ItemSeparator";

const Item = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
    padding?: "none" | "sm" | "md" | "lg";
    shape?: "full" | "minimal" | "sharp";
    direction?: "horizontal" | "vertical";
    asChild?: boolean;
    disabled?: boolean;
    /** If true, the ripple effect on click will be disabled. */
    disableRipple?: boolean;
    /** Callback fired when the item is pressed for 500ms. */
    onLongPress?: (
      event:
        | React.PointerEvent<HTMLDivElement>
        | React.MouseEvent<HTMLDivElement>
    ) => void;
  }
>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      shape = "minimal",
      direction = "horizontal",
      padding = "md",
      asChild = false,
      disabled,
      disableRipple = false,
      onLongPress,
      onPointerDown,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "div";

    const localRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

    const [, event] = useRipple({
      ref: localRef,
      color: "rgba(0, 0, 0, 0.1)",
      duration: 400,
      disabled: disabled || disableRipple,
    });

    // --- NEW: Long Press Logic ---
    // @ts-ignore
    const longPressBindings = useLongPress(onLongPress || null);

    // Combine event handlers: onLongPress bindings, ripple effect, and user's onPointerDown
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      // Conditionally trigger the long press hook's pointer down handler
      if (
        onLongPress &&
        // @ts-ignore
        typeof longPressBindings.onPointerDown === "function"
      ) {
        // @ts-ignore
        longPressBindings.onPointerDown(e);
      }
      // Trigger the ripple effect
      event(e);
      // Trigger the user's custom onPointerDown handler
      onPointerDown?.(e);
    };

    // Construct the final props, merging our event handlers with the long press ones
    const finalProps = {
      ...props,
      ...(onLongPress ? longPressBindings : {}), // Spread all handlers from the hook
      onPointerDown: handlePointerDown, // Override with our combined handler
    };

    return (
      <ItemContext.Provider value={{ variant, size, direction }}>
        <Comp
          ref={localRef}
          data-slot="item"
          // @ts-ignore
          disabled={disabled}
          className={clsx(
            itemVariants({
              variant,
              size,
              shape,
              direction,
              padding,
              className,
            }),
            disabled && "opacity-50 cursor-not-allowed"
          )}
          {...finalProps}
        />
      </ItemContext.Provider>
    );
  }
);
Item.displayName = "Item";

const ItemMedia = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "icon" | "avatar";
    shape?: "full" | "minimal" | "sharp";
  }
>(({ className, variant, shape = "minimal", ...props }, ref) => {
  const { size: contextSize, direction } = useItemContext();
  return (
    <div
      ref={ref}
      data-slot="item-media"
      className={clsx(
        itemMediaVariants({
          variant,
          size: contextSize,
          shape,
          className,
        }),
        direction === "horizontal" ? "mb-auto" : "mb-2"
      )}
      {...props}
    />
  );
});
ItemMedia.displayName = "ItemMedia";

const ItemContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { direction } = useItemContext();
  return (
    <div
      ref={ref}
      data-slot="item-content"
      className={clsx(
        "flex flex-1 flex-col gap-0.5 min-w-0",
        direction === "vertical" && "items-center",
        className
      )}
      {...props}
    />
  );
});
ItemContent.displayName = "ItemContent";

const ItemTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { direction } = useItemContext();
  return (
    <div
      ref={ref}
      data-slot="item-title"
      className={clsx(
        "flex w-fit items-center gap-2 text-base font-semibold leading-snug truncate",
        direction === "vertical" && "justify-center",
        className
      )}
      {...props}
    />
  );
});
ItemTitle.displayName = "ItemTitle";

const ItemDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="item-description"
    className={clsx(
      "text-graphite-foreground/70 line-clamp-2 text-sm font-normal leading-normal",
      className
    )}
    {...props}
  />
));
ItemDescription.displayName = "ItemDescription";

const ItemActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { direction } = useItemContext();
  return (
    <div
      ref={ref}
      data-slot="item-actions"
      className={clsx(
        "flex items-center gap-2",
        direction === "horizontal" ? "ml-auto pl-4" : "mt-2",
        className
      )}
      {...props}
    />
  );
});
ItemActions.displayName = "ItemActions";

const ItemHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="item-header"
    className={clsx(
      "flex basis-full items-center justify-between gap-2",
      className
    )}
    {...props}
  />
));
ItemHeader.displayName = "ItemHeader";

const ItemFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="item-footer"
    className={clsx(
      "flex basis-full items-center justify-between gap-2 mt-2",
      className
    )}
    {...props}
  />
));
ItemFooter.displayName = "ItemFooter";

export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
};
