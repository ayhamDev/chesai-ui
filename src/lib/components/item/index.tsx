"use client";

import { Slot } from "@radix-ui/react-slot";
import { useLongPress } from "@uidotdev/usehooks";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import * as React from "react";
import useRipple from "use-ripple-hook";
export * from "./virtual-item-list";

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
  // Added z-0 to establish stacking context for bloom effect
  "group/item relative flex flex-wrap items-center border text-sm outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 overflow-hidden z-0",
  {
    variants: {
      variant: {
        primary:
          "bg-surface-container-low border-outline-variant text-on-surface",
        secondary:
          "bg-surface-container-high border-transparent text-on-surface",
        ghost:
          "bg-transparent border-transparent text-on-surface " +
          // Bloom Effect: Uses Secondary Container for a subtle highlight
          "after:absolute after:inset-0 after:z-[-1] after:bg-secondary-container/50 after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] after:transition-all after:duration-250 after:ease-out " +
          "hover:after:opacity-100 hover:after:scale-100",
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
        icon: "bg-secondary-container border border-transparent text-on-secondary-container [&_svg:not([class*='size-'])]:opacity-80",
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
    className={clsx("h-px w-full bg-outline-variant", className)}
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
    disableRipple?: boolean;
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
      color: "var(--color-ripple-dark)",
      duration: 400,
      disabled: disabled || disableRipple,
    });

    // @ts-ignore
    const longPressBindings = useLongPress(onLongPress || null);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (
        onLongPress &&
        // @ts-ignore
        typeof longPressBindings.onPointerDown === "function"
      ) {
        // @ts-ignore
        longPressBindings.onPointerDown(e);
      }
      event(e);
      onPointerDown?.(e);
    };

    const finalProps = {
      ...props,
      ...(onLongPress ? longPressBindings : {}),
      onPointerDown: handlePointerDown,
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
        "flex flex-1 flex-col gap-0.5 min-w-0 z-10",
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
        "flex w-fit items-center gap-2 text-base font-semibold leading-snug text-on-surface",
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
      "text-on-surface-variant line-clamp-2 text-sm font-normal leading-normal",
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
        "flex items-center gap-2 z-10",
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
