"use client";

import { Slot } from "@radix-ui/react-slot";
import { useLongPress } from "@uidotdev/usehooks";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import * as React from "react";
import useRipple from "use-ripple-hook";

// --- Types ---

// Expanded to match Card variants
type ItemVariant =
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

type ItemSize = "sm" | "md" | "lg";
type ItemDirection = "horizontal" | "vertical";

interface ItemContextProps {
  variant: ItemVariant;
  size: ItemSize;
  direction: ItemDirection;
}

const ItemContext = React.createContext<ItemContextProps>({
  variant: "primary",
  size: "md",
  direction: "horizontal",
});

const useItemContext = () => React.useContext(ItemContext);

// --- CVA Variants ---

const itemVariants = cva(
  "group/item relative flex flex-wrap items-center transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 overflow-hidden z-0",
  {
    variants: {
      variant: {
        primary: "bg-surface-container-low text-on-surface",
        secondary: "bg-surface-container-high text-on-surface",
        tertiary: "bg-tertiary-container text-on-tertiary-container",
        "high-contrast": "bg-inverse-surface text-inverse-on-surface",
        ghost:
          "bg-transparent text-on-surface " +
          "after:absolute after:inset-0 after:z-[-1] after:bg-secondary-container/50 after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] after:transition-all after:duration-250 after:ease-out " +
          "hover:after:opacity-100 hover:after:scale-100",

        // --- MD3 Surface Container Variants ---
        surface: "bg-surface text-on-surface",
        "surface-container-lowest":
          "bg-surface-container-lowest text-on-surface",
        "surface-container-low": "bg-surface-container-low text-on-surface",
        "surface-container": "bg-surface-container text-on-surface",
        "surface-container-high": "bg-surface-container-high text-on-surface",
        "surface-container-highest":
          "bg-surface-container-highest text-on-surface",
      },
      bordered: {
        true: "border border-outline-variant",
        false: "border border-transparent",
      },
      elevation: {
        none: "shadow-none",
        1: "shadow-sm",
        2: "shadow-md",
        3: "shadow-lg",
        4: "shadow-xl",
        5: "shadow-2xl",
      },
      size: {
        sm: "gap-3 text-xs",
        md: "gap-4 text-sm",
        lg: "gap-5 text-base",
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
      bordered: false,
      elevation: "none",
    },
  },
);

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 [&_svg]:pointer-events-none transition-colors",
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
  },
);

// --- Compound Components ---

export type ItemGroupShape = "full" | "minimal" | "sharp";
export type ItemGroupDirection = "horizontal" | "vertical";
export type ItemGroupGap = "none" | "xs" | "sm" | "md" | "lg";

export interface ItemGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: ItemGroupShape;
  direction?: ItemGroupDirection;
  gap?: ItemGroupGap;
}

const gapMap: Record<ItemGroupGap, string> = {
  none: "gap-0",
  xs: "gap-0.5",
  sm: "gap-1",
  md: "gap-2",
  lg: "gap-4",
};

// Explicit static class mapping to ensure Tailwind compiles them correctly
// and using [30px] to prevent the browser from clamping the inner curves.
const getShapeClasses = (
  index: number,
  total: number,
  shape: ItemGroupShape,
  direction: ItemGroupDirection,
) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const isOnly = total === 1;

  if (shape === "sharp") return "!rounded-none";

  if (isOnly) {
    if (shape === "full") return "!rounded-[30px]";
    if (shape === "minimal") return "!rounded-xl";
  }

  if (direction === "vertical") {
    if (shape === "full") {
      if (isFirst) return "!rounded-t-[30px] !rounded-b-md";
      if (isLast) return "!rounded-t-md !rounded-b-[30px]";
      return "!rounded-t-md !rounded-b-md";
    }
    if (shape === "minimal") {
      if (isFirst) return "!rounded-t-xl !rounded-b-sm";
      if (isLast) return "!rounded-t-sm !rounded-b-xl";
      return "!rounded-t-sm !rounded-b-sm";
    }
  } else {
    // horizontal
    if (shape === "full") {
      if (isFirst) return "!rounded-l-[30px] !rounded-r-md";
      if (isLast) return "!rounded-l-md !rounded-r-[30px]";
      return "!rounded-l-md !rounded-r-md";
    }
    if (shape === "minimal") {
      if (isFirst) return "!rounded-l-xl !rounded-r-sm";
      if (isLast) return "!rounded-l-sm !rounded-r-xl";
      return "!rounded-l-sm !rounded-r-sm";
    }
  }
  return "";
};

const ItemGroup = React.forwardRef<HTMLDivElement, ItemGroupProps>(
  (
    {
      className,
      children,
      shape = "minimal",
      direction = "vertical",
      gap = "xs",
      ...props
    },
    ref,
  ) => {
    const childArray = React.Children.toArray(children).filter(
      React.isValidElement,
    );

    return (
      <div
        ref={ref}
        role="group"
        data-slot="item-group"
        className={clsx(
          "flex",
          direction === "vertical" ? "flex-col" : "flex-row",
          gapMap[gap],
          className,
        )}
        {...props}
      >
        {childArray.map((child, index) => {
          const shapeClass = getShapeClasses(
            index,
            childArray.length,
            shape,
            direction,
          );

          return React.cloneElement(child as React.ReactElement<any>, {
            className: clsx(
              (child as React.ReactElement<any>).props.className,
              shapeClass,
              "focus-visible:z-10", // Ensures focus rings sit above sibling elements
            ),
          });
        })}
      </div>
    );
  },
);
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

export interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
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
  size?: "sm" | "md" | "lg";
  shape?: "full" | "minimal" | "sharp";
  direction?: "horizontal" | "vertical";
  padding?: "none" | "sm" | "md" | "lg";
  bordered?: boolean;
  elevation?: "none" | 1 | 2 | 3 | 4 | 5;
  asChild?: boolean;
  disabled?: boolean;
  disableRipple?: boolean;
  onLongPress?: (e: any) => void;
}
const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      shape = "minimal",
      direction = "horizontal",
      padding = "md",
      bordered = false,
      elevation = "none",
      asChild = false,
      disabled,
      disableRipple = false,
      onLongPress,
      onPointerDown,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "div";

    const localRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

    // Fix TS error: Ensure variants are never null for Context/Styles
    const effectiveVariant = (variant || "primary") as ItemVariant;
    const effectiveSize = (size || "md") as ItemSize;
    const effectiveDirection = (direction || "horizontal") as ItemDirection;

    // Dynamic ripple color based on variant contrast
    const rippleColor = "var(--color-ripple-dark)";

    const [, event] = useRipple({
      ref: localRef as React.RefObject<HTMLElement>,
      color: rippleColor,
      duration: 400,
      disabled: disabled || disableRipple,
    });

    // Provide a no-op function if onLongPress is undefined to satisfy useLongPress types
    const longPressBindings = useLongPress(onLongPress ?? (() => {}), {
      threshold: 500,
    });

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      // We do not call longPressBindings handlers here manually.
      // They are spread onto the element below.
      event(e);
      onPointerDown?.(e);
    };

    const finalProps = {
      ...props,
      // Apply aria-disabled for accessibility
      "aria-disabled": disabled,
      // Spread the long press bindings (onMouseDown, onTouchStart, etc.) if handler exists
      ...(onLongPress ? longPressBindings : {}),
      onPointerDown: handlePointerDown,
    };

    return (
      <ItemContext.Provider
        value={{
          variant: effectiveVariant,
          size: effectiveSize,
          direction: effectiveDirection,
        }}
      >
        <Comp
          ref={localRef}
          data-slot="item"
          className={clsx(
            itemVariants({
              variant: effectiveVariant,
              size: effectiveSize,
              shape,
              direction: effectiveDirection,
              padding,
              bordered,
              elevation,
              className,
            }),
            disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          )}
          {...finalProps}
        />
      </ItemContext.Provider>
    );
  },
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
        direction === "horizontal" ? "mb-auto" : "mb-2",
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
        className,
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
      // MD3 standard for list titles is title-medium
      className={clsx(
        "flex w-fit items-center gap-2 text-title-medium font-semibold leading-snug text-inherit",
        direction === "vertical" && "justify-center",
        className,
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
      "opacity-80 line-clamp-2 text-sm font-normal leading-normal text-inherit",
      className,
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
        className,
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
      className,
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
      className,
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
