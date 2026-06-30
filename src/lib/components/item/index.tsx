// src/lib/components/item/index.tsx

"use client";

import { Slot } from "@radix-ui/react-slot";
import { useLongPress } from "@uidotdev/usehooks";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import {
  AnimatePresence,
  animate,
  cubicBezier,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import * as React from "react";
import { twMerge } from "tailwind-merge";
import useRipple from "use-ripple-hook";

// --- Types ---

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
type SwipeType = "trigger" | "dismiss" | "reveal";

export interface SwipeActionConfig {
  icon: React.ReactNode;
  label?: string;
  onClick: () => void | Promise<void>;
  color?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "error"
    | "destructive"
    | (string & {});
  shape?: "full" | "minimal" | "sharp";
  className?: string;
}

interface ItemContextProps {
  variant: ItemVariant;
  size: ItemSize;
  direction: ItemDirection;
  expanded?: boolean;
}

const ItemContext = React.createContext<ItemContextProps>({
  variant: "primary",
  size: "md",
  direction: "horizontal",
  expanded: false,
});

export const useItem = () => React.useContext(ItemContext);

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
    if (shape === "full") return "!rounded-[32px]";
    if (shape === "minimal") return "!rounded-xl";
  }

  if (direction === "vertical") {
    if (shape === "full") {
      if (isFirst) return "!rounded-t-[32px] !rounded-b-md";
      if (isLast) return "!rounded-t-md !rounded-b-[32px]";
      return "!rounded-t-md !rounded-b-md";
    }
    if (shape === "minimal") {
      if (isFirst) return "!rounded-t-xl !rounded-b-sm";
      if (isLast) return "!rounded-t-sm !rounded-b-xl";
      return "!rounded-t-sm !rounded-b-sm";
    }
  } else {
    if (shape === "full") {
      if (isFirst) return "!rounded-l-[32px] !rounded-r-md";
      if (isLast) return "!rounded-l-md !rounded-r-[32px]";
      return "!rounded-l-md !rounded-r-[32px]";
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
        className={twMerge(
          clsx(
            "flex",
            direction === "vertical" ? "flex-col" : "flex-row",
            gapMap[gap],
            className,
          ),
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
            className: twMerge(
              clsx(
                (child as React.ReactElement<any>).props.className,
                shapeClass,
                "focus-visible:z-10",
              ),
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
    className={twMerge(clsx("h-px w-full bg-outline-variant", className))}
    {...props}
  />
));
ItemSeparator.displayName = "ItemSeparator";

// --- Item Component ---

export interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ItemVariant;
  size?: ItemSize;
  shape?: "full" | "minimal" | "sharp";
  direction?: ItemDirection;
  padding?: "none" | "sm" | "md" | "lg";
  bordered?: boolean;
  elevation?: "none" | 1 | 2 | 3 | 4 | 5;
  asChild?: boolean;
  disabled?: boolean;
  disableRipple?: boolean;
  onLongPress?: (e: any) => void;

  // Expansion Feature
  expandable?: boolean;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;

  // Swipe Features
  swipeType?: SwipeType;
  swipeThreshold?: number;
  swipeRightAction?: SwipeActionConfig;
  swipeLeftAction?: SwipeActionConfig;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  swipeRightOffset?: number;
  swipeLeftOffset?: number;
}

const shapeClassesMap = {
  full: "rounded-[32px]",
  minimal: "rounded-xl",
  sharp: "rounded-none",
};

const getActionBgClass = (color?: string) => {
  switch (color) {
    case "primary":
      return "bg-primary text-on-primary";
    case "secondary":
      return "bg-secondary-container text-on-secondary-container";
    case "tertiary":
      return "bg-tertiary-container text-on-tertiary-container";
    case "error":
    case "destructive":
      return "bg-error text-on-error";
    default:
      return color || "bg-secondary-container text-on-secondary-container";
  }
};

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

      expandable = false,
      expanded,
      defaultExpanded = false,
      onExpandedChange,

      swipeType = "trigger",
      swipeThreshold = 100,
      swipeRightAction,
      swipeLeftAction,
      onSwipeRight,
      onSwipeLeft,
      swipeRightOffset = 80,
      swipeLeftOffset = 80,
      ...props
    },
    ref,
  ) => {
    const Comp = (asChild ? Slot : "div") as any;

    const localRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

    const effectiveVariant = (variant || "primary") as ItemVariant;
    const effectiveSize = (size || "md") as ItemSize;
    const effectiveDirection = (direction || "horizontal") as ItemDirection;

    // --- Expansion State ---
    const [internalExpanded, setInternalExpanded] =
      React.useState(defaultExpanded);
    const isExpanded = expanded !== undefined ? expanded : internalExpanded;

    const toggleExpand = () => {
      if (disabled) return;
      const nextState = !isExpanded;
      if (expanded === undefined) {
        setInternalExpanded(nextState);
      }
      onExpandedChange?.(nextState);
    };

    const rippleColor = "var(--color-ripple-dark)";
    const [, event] = useRipple({
      ref: localRef as React.RefObject<HTMLElement>,
      color: rippleColor,
      duration: 400,
      disabled: disabled || disableRipple,
    });

    const longPressBindings = useLongPress(onLongPress ?? (() => {}), {
      threshold: 500,
    });

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      event(e);
      onPointerDown?.(e);
    };

    const isSwipeable = !!swipeRightAction || !!swipeLeftAction;
    const x = useMotionValue(0);
    const [isDismissed, setIsDismissed] = React.useState(false);

    const leftUnderlayWidth = useTransform(x, [-1000, 0, 1000], [0, 0, 1000]);
    const rightUnderlayWidth = useTransform(x, [-1000, 0, 1000], [1000, 0, 0]);
    const leftOpacity = useTransform(x, [0, 50], [0, 1]);
    const rightOpacity = useTransform(x, [0, -50], [0, 1]);

    const stableConstraints = {
      left:
        swipeType === "reveal"
          ? swipeLeftAction
            ? -swipeLeftOffset
            : 0
          : -1000,
      right:
        swipeType === "reveal"
          ? swipeRightAction
            ? swipeRightOffset
            : 0
          : 1000,
    };

    const handleDragEnd = (e: any, info: any) => {
      if (disabled) return;

      const offsetX = info?.offset?.x ?? 0;
      const currentX = x.get();
      let targetX = 0;

      const tweenAnimationOptions = {
        type: "tween",
        ease: cubicBezier(0.05, 0.7, 0.1, 1),
        duration: 0.28,
      } as const;

      if (swipeType === "dismiss") {
        if (offsetX > swipeThreshold && swipeRightAction) {
          targetX = 600;
          animate(x, targetX, { type: "tween", duration: 0.2 }).then(() => {
            if (localRef.current) {
              setIsDismissed(true);
              swipeRightAction.onClick?.();
              onSwipeRight?.();
            }
          });
          return;
        } else if (offsetX < -swipeThreshold && swipeLeftAction) {
          targetX = -600;
          animate(x, targetX, { type: "tween", duration: 0.2 }).then(() => {
            if (localRef.current) {
              setIsDismissed(true);
              swipeLeftAction.onClick?.();
              onSwipeLeft?.();
            }
          });
          return;
        }
      } else if (swipeType === "reveal") {
        const thresholdRight = swipeRightOffset / 2;
        const thresholdLeft = swipeLeftOffset / 2;

        if (currentX > thresholdRight && swipeRightAction) {
          targetX = swipeRightOffset;
        } else if (currentX < -thresholdLeft && swipeLeftAction) {
          targetX = -swipeLeftOffset;
        }
      } else {
        if (offsetX > swipeThreshold && swipeRightAction) {
          swipeRightAction.onClick?.();
          onSwipeRight?.();
        } else if (offsetX < -swipeThreshold && swipeLeftAction) {
          swipeLeftAction.onClick?.();
          onSwipeLeft?.();
        }
      }

      animate(x, targetX, tweenAnimationOptions);
    };

    const handleItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
      // Disable expanding while actively swiping/dragging.
      // If pointer has dragged the card horizontally (> 5px), early return.
      if (isSwipeable && Math.abs(x.get()) > 5) {
        if (swipeType === "reveal" && Math.abs(x.get()) > 10) {
          e.stopPropagation();
          e.preventDefault();
          animate(x, 0, {
            type: "tween",
            ease: [0.05, 0.7, 0.1, 1],
            duration: 0.25,
          });
        }
        return;
      }

      if (expandable) {
        toggleExpand();
      }
      props.onClick?.(e);
    };

    const finalProps = {
      ...props,
      "aria-disabled": disabled,
      ...(onLongPress ? longPressBindings : {}),
      onPointerDown: handlePointerDown,
      onClick: handleItemClick,
    };

    const currentShapeClass =
      shape === "full"
        ? isExpanded
          ? "rounded-[16px]"
          : "rounded-[32px]"
        : shapeClassesMap[shape || "minimal"];

    const contextValue = {
      variant: effectiveVariant,
      size: effectiveSize,
      direction: effectiveDirection,
      expanded: isExpanded,
    };

    const innerContent = (
      <Comp
        ref={isSwipeable ? undefined : localRef}
        data-slot="item"
        className={twMerge(
          clsx(
            itemVariants({
              variant: effectiveVariant,
              size: effectiveSize,
              shape: shape === "full" ? undefined : shape,
              direction: effectiveDirection,
              padding,
              bordered,
              elevation,
            }),
            shape === "full" &&
              (isExpanded ? "rounded-[16px]" : "rounded-[32px]"),
            expandable && "cursor-pointer",
            className,
            disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          ),
        )}
        {...finalProps}
      />
    );

    if (!isSwipeable) {
      return (
        <ItemContext.Provider value={contextValue}>
          {innerContent}
        </ItemContext.Provider>
      );
    }

    const leftActionShapeClass = swipeRightAction?.shape
      ? shapeClassesMap[swipeRightAction.shape]
      : "rounded-[inherit]";

    const rightActionShapeClass = swipeLeftAction?.shape
      ? shapeClassesMap[swipeLeftAction.shape]
      : "rounded-[inherit]";

    return (
      <ItemContext.Provider value={contextValue}>
        <motion.div
          className={clsx(
            "relative w-full overflow-hidden z-0 bg-transparent transform-gpu will-change-[height,opacity] transition-all duration-200 ease-out",
            currentShapeClass,
          )}
          animate={
            isDismissed
              ? {
                  height: 0,
                  opacity: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  paddingTop: 0,
                  paddingBottom: 0,
                  border: "none",
                }
              : {}
          }
          transition={{ duration: 0.22, ease: [0.4, 0, 1, 1] }}
        >
          {swipeRightAction && (
            <motion.div
              style={{ width: leftUnderlayWidth }}
              className={twMerge(
                clsx(
                  "absolute inset-y-0 left-0 flex items-center justify-center overflow-hidden z-0 transform-gpu will-change-[width,opacity]",
                  leftActionShapeClass,
                  getActionBgClass(swipeRightAction.color),
                  swipeRightAction.className,
                ),
              )}
            >
              <motion.div
                style={{ opacity: leftOpacity }}
                className="flex flex-col items-center justify-center gap-1.5 px-6  text-center select-none min-w-max shrink-0 overflow-hidden"
              >
                <div className="shrink-0">{swipeRightAction.icon}</div>
                {swipeRightAction.label && (
                  <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                    {swipeRightAction.label}
                  </span>
                )}
              </motion.div>
            </motion.div>
          )}

          {swipeLeftAction && (
            <motion.div
              style={{ width: rightUnderlayWidth }}
              className={twMerge(
                clsx(
                  "absolute inset-y-0 right-0 flex items-center justify-center overflow-hidden z-0 transform-gpu will-change-[width,opacity]",
                  rightActionShapeClass,
                  getActionBgClass(swipeLeftAction.color),
                  swipeLeftAction.className,
                ),
              )}
            >
              <motion.div
                style={{ opacity: rightOpacity }}
                className="flex flex-col items-center justify-center gap-1.5 px-6 text-center select-none min-w-max shrink-0 overflow-hidden"
              >
                <div className="shrink-0">{swipeLeftAction.icon}</div>
                {swipeLeftAction.label && (
                  <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                    {swipeLeftAction.label}
                  </span>
                )}
              </motion.div>
            </motion.div>
          )}

          <motion.div
            ref={localRef}
            style={{ x }}
            drag={disabled ? false : "x"}
            dragDirectionLock
            dragConstraints={stableConstraints}
            dragElastic={swipeType === "reveal" ? 0.2 : 0.3}
            onDragEnd={handleDragEnd}
            data-vaul-no-drag
            className="relative z-10 w-full rounded-[inherit] cursor-pointer transform-gpu will-change-transform touch-pan-y"
          >
            {innerContent}
          </motion.div>
        </motion.div>
      </ItemContext.Provider>
    );
  },
);

const ItemMedia = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "icon" | "avatar";
    shape?: "full" | "minimal" | "sharp";
  }
>(({ className, variant, shape = "minimal", ...props }, ref) => {
  const { size: contextSize, direction } = useItem();
  return (
    <div
      ref={ref}
      data-slot="item-media"
      className={twMerge(
        clsx(
          itemMediaVariants({
            variant,
            size: contextSize,
            shape,
            className,
          }),
          direction === "horizontal" ? "mb-auto" : "mb-2",
        ),
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
  const { direction } = useItem();
  return (
    <div
      ref={ref}
      data-slot="item-content"
      className={twMerge(
        clsx(
          "flex flex-1 flex-col gap-0.5 min-w-0 z-10",
          direction === "vertical" && "items-center",
          className,
        ),
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
  const { direction } = useItem();
  return (
    <div
      ref={ref}
      data-slot="item-title"
      className={twMerge(
        clsx(
          "flex w-fit items-center gap-2 text-title-medium font-semibold leading-snug text-inherit",
          direction === "vertical" && "justify-center",
          className,
        ),
      )}
      {...props}
    />
  );
});
ItemTitle.displayName = "ItemTitle";

export interface ItemDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  collapsedLines?: number;
}

const ItemDescription = React.forwardRef<
  HTMLParagraphElement,
  ItemDescriptionProps
>(({ className, collapsedLines = 2, ...props }, ref) => {
  const { expanded } = useItem();

  const clampClass = expanded
    ? ""
    : collapsedLines === 1
      ? "line-clamp-1"
      : collapsedLines === 2
        ? "line-clamp-2"
        : collapsedLines === 3
          ? "line-clamp-3"
          : collapsedLines === 4
            ? "line-clamp-4"
            : collapsedLines === 5
              ? "line-clamp-5"
              : collapsedLines === 6
                ? "line-clamp-6"
                : "";

  return (
    <p
      ref={ref}
      data-slot="item-description"
      className={twMerge(
        clsx(
          "opacity-80 text-sm font-normal leading-normal text-inherit transition-all duration-200",
          clampClass,
          className,
        ),
      )}
      {...props}
    />
  );
});
ItemDescription.displayName = "ItemDescription";

const ItemActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { direction } = useItem();
  return (
    <div
      ref={ref}
      data-slot="item-actions"
      className={twMerge(
        clsx(
          "flex items-center gap-2 z-10",
          direction === "horizontal" ? "ml-auto pl-4" : "mt-2",
          className,
        ),
      )}
      {...props}
    />
  );
});
ItemActions.displayName = "ItemActions";

const ItemExpandedContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, onClick, onPointerDown, ...props }, ref) => {
  const { expanded } = useItem();

  // Prevent event bubbling to avoid triggering parent toggles and ripples
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClick?.(e);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onPointerDown?.(e);
  };

  return (
    <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          ref={ref}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          className={twMerge("overflow-hidden w-full", className)}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          {...(props as any)}
        >
          <div className="pt-2 pb-1">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
ItemExpandedContent.displayName = "ItemExpandedContent";

const ItemHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="item-header"
    className={twMerge(
      clsx("flex basis-full items-center justify-between gap-2", className),
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
    className={twMerge(
      clsx(
        "flex basis-full items-center justify-between gap-2 mt-2",
        className,
      ),
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
  ItemExpandedContent,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
};
