"use client";

import { useLongPress } from "@uidotdev/usehooks";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  type PanInfo,
} from "framer-motion";
import { GripVertical } from "lucide-react";
import React, { useContext, useEffect, useRef } from "react";
import useRipple from "use-ripple-hook";
import { ListContext } from "../../context/List.context";
import { Checkbox } from "../checkbox";
import { Typography } from "../typography";

const SWIPE_THRESHOLD = -80; // How far to swipe to snap open

const listItemVariants = cva(
  "relative flex w-full items-center justify-between gap-4 px-4 transition-colors duration-200 overflow-hidden", // Added overflow-hidden for ripple
  {
    variants: {
      lines: {
        "one-line": "min-h-[56px] py-2",
        "two-line": "min-h-[72px] py-3",
        "three-line": "min-h-[88px] py-4",
      },
      isSelected: {
        true: "bg-graphite-secondary",
        // FIX: Removed opacity from hover to prevent swipe actions from showing through
        false: "bg-graphite-card hover:bg-graphite-secondary",
      },
    },
    defaultVariants: {
      lines: "one-line",
      isSelected: false,
    },
  }
);

export interface ListItemProps
  extends React.HTMLAttributes<HTMLLIElement>,
    VariantProps<typeof listItemVariants> {
  id: string | number;
  headline: React.ReactNode;
  supportingText?: React.ReactNode;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  swipeActions?: React.ReactNode;
  dndAttributes?: React.HTMLAttributes<any>;
  dndListeners?: React.HTMLAttributes<any>;
}

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  (
    {
      className,
      id,
      headline,
      supportingText,
      startAdornment,
      endAdornment,
      swipeActions,
      lines: propLines,
      dndAttributes,
      dndListeners,
      onClick,
      ...props
    },
    ref
  ) => {
    const context = useContext(ListContext);
    if (!context) {
      throw new Error("ListItem must be used within a List component.");
    }

    const {
      isSelectable,
      isSelectionMode,
      setIsSelectionMode,
      selectedItems,
      toggleSelection,
      isReorderable,
    } = context;

    const isSelected = selectedItems.has(id);
    const hasSwipeActions = !!swipeActions;
    const x = useMotionValue(0);
    const swipeActionRef = useRef<HTMLDivElement>(null);

    // --- RIPPLE EFFECT HOOK ---
    const itemRef = useRef<HTMLDivElement>(null);
    const [, rippleEvent] = useRipple({
      ref: itemRef,
      color: "rgba(0, 0, 0, 0.1)",
      duration: 400,
      disabled: isReorderable,
    });
    // --- END RIPPLE EFFECT ---

    const longPressAttrs = useLongPress(() => {
      if (isSelectable && !isReorderable) {
        setIsSelectionMode(true);
        toggleSelection(id);
      }
    });

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isSelectionMode) {
        toggleSelection(id);
      } else {
        onClick?.(e as any);
      }
    };

    const handleDragEnd = (event: MouseEvent | TouchEvent, info: PanInfo) => {
      const swipeActionWidth = swipeActionRef.current?.offsetWidth || 0;
      const { offset, velocity } = info;
      if (offset.x < SWIPE_THRESHOLD || velocity.x < -500) {
        animate(x, -swipeActionWidth, { type: "spring", bounce: 0.2 });
      } else {
        animate(x, 0, { type: "spring", bounce: 0.2 });
      }
    };

    useEffect(() => {
      // If selection mode is turned off, reset swipe state
      if (!isSelectionMode) {
        animate(x, 0, { type: "spring", bounce: 0.2 });
      }
    }, [isSelectionMode, x]);

    const lines = propLines || (supportingText ? "two-line" : "one-line");

    return (
      <li ref={ref} className="relative bg-graphite-card" {...props}>
        {hasSwipeActions && (
          <div
            ref={swipeActionRef}
            className="absolute inset-y-0 right-0 flex items-center z-0"
            aria-hidden
          >
            {swipeActions}
          </div>
        )}

        <motion.div
          ref={itemRef}
          drag={hasSwipeActions && !isSelectionMode ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={{ left: 0.8, right: 0 }}
          onDragEnd={handleDragEnd}
          onClick={handleClick}
          onPointerDown={rippleEvent}
          {...longPressAttrs}
          style={{ x }}
          className={clsx(
            "relative w-full cursor-pointer",
            listItemVariants({ lines, isSelected, className })
          )}
        >
          {/* Main content flex container */}
          <div className="flex flex-1 items-center gap-4 min-w-0">
            {isReorderable && (
              <div
                className="cursor-grab touch-none"
                {...dndAttributes}
                {...dndListeners}
              >
                <GripVertical className="h-5 w-5 text-graphite-foreground/40" />
              </div>
            )}

            <AnimatePresence initial={false}>
              {isSelectionMode && (
                <motion.div
                  initial={{ scale: 0, width: 0, marginRight: 0 }}
                  animate={{ scale: 1, width: "auto", marginRight: "1rem" }}
                  exit={{ scale: 0, width: 0, marginRight: 0 }}
                  className="overflow-hidden"
                >
                  <Checkbox
                    checked={isSelected}
                    readOnly
                    aria-label={`Select ${headline}`}
                    className="pointer-events-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {startAdornment && (
              <div className="flex-shrink-0">{startAdornment}</div>
            )}

            <div className="flex-1 flex flex-col justify-center min-w-0">
              <Typography variant="large" className="truncate">
                {headline}
              </Typography>
              {supportingText && (
                <Typography variant="muted" className="truncate !mt-0">
                  {supportingText}
                </Typography>
              )}
            </div>
          </div>

          {/* End Adornment */}
          {!isSelectionMode && endAdornment && (
            <div className="flex-shrink-0">{endAdornment}</div>
          )}
        </motion.div>
      </li>
    );
  }
);

ListItem.displayName = "List.Item";
