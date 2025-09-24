"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { motion, Reorder, useDragControls, useSpring } from "framer-motion";
import { GripVertical } from "lucide-react";
import React, { useContext } from "react";
import useRipple from "use-ripple-hook";
import { ListContext } from "../../context/List.context";
import { Checkbox } from "../checkbox";
import { Typography } from "../typography";
import clsx from "clsx";

const listItemVariants = cva(
  "group/item relative w-full text-left focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      lines: {
        "one-line": "min-h-[48px]",
        "two-line": "min-h-[56px]",
        "three-line": "min-h-[72px]",
      },
    },
    defaultVariants: {
      lines: "two-line",
    },
  }
);

export interface ListItemProps
  extends Omit<React.HTMLAttributes<HTMLLIElement>, "id">,
    VariantProps<typeof listItemVariants> {
  id: string | number;
  headline: React.ReactNode;
  supportingText?: React.ReactNode;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  swipeActions?: React.ReactNode;
  disabled?: boolean;
}

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  (
    {
      className,
      lines,
      id,
      headline,
      supportingText,
      startAdornment,
      endAdornment,
      swipeActions,
      disabled,
      ...props
    },
    ref
  ) => {
    const context = useContext(ListContext);
    if (!context) {
      throw new Error("ListItem must be used within a List component");
    }

    const {
      isSelectionMode,
      toggleSelection,
      selectedItems,
      isReorderable,
      startReorder,
    } = context;

    const isSelected = selectedItems.has(id);
    const localRef = React.useRef<HTMLButtonElement>(null);
    const dragControls = useDragControls();

    const [, event] = useRipple({
      ref: localRef,
      color: "rgba(128, 128, 128, 0.1)",
      duration: 400,
      disabled: disabled || isReorderable,
    });

    const x = useSpring(0, { stiffness: 300, damping: 30 });

    const finalStartAdornment = isSelectionMode ? (
      <Checkbox
        checked={isSelected}
        onChange={() => toggleSelection(id)}
        aria-label={`Select ${headline}`}
      />
    ) : (
      startAdornment
    );

    const finalEndAdornment = isReorderable ? (
      <div
        onPointerDown={(e) => {
          startReorder(id);
          dragControls.start(e);
        }}
        className="cursor-grab touch-none p-2"
      >
        <GripVertical />
      </div>
    ) : (
      endAdornment
    );

    const content = (
      <button
        ref={localRef}
        type="button"
        onPointerDown={!isReorderable ? event : undefined}
        disabled={disabled}
        className="relative z-10 flex w-full cursor-pointer items-center gap-4 overflow-hidden bg-inherit p-4"
      >
        {finalStartAdornment && (
          <div className="flex-shrink-0">{finalStartAdornment}</div>
        )}
        <div className="min-w-0 flex-1">
          <Typography
            as="div"
            variant="large"
            className="truncate font-semibold"
          >
            {headline}
          </Typography>
          {supportingText && (
            <Typography variant="muted" className="line-clamp-2">
              {supportingText}
            </Typography>
          )}
        </div>
        {finalEndAdornment && (
          <div className="flex-shrink-0">{finalEndAdornment}</div>
        )}
      </button>
    );

    const itemContent = (
      <div
        className={clsx(
          "relative bg-graphite-card", // Ensure content has a background
          isSelectionMode && "transition-colors duration-200",
          isSelected && "bg-graphite-secondary"
        )}
      >
        {swipeActions && (
          <div className="absolute inset-y-0 right-0 z-0 flex items-center">
            {swipeActions}
          </div>
        )}
        <motion.div
          drag="x"
          dragConstraints={{ left: swipeActions ? -100 : 0, right: 0 }}
          onDragEnd={() => {
            if (x.get() < -50) {
              x.set(-100);
            } else {
              x.set(0);
            }
          }}
          style={{ x }}
          className="relative z-10 bg-inherit"
        >
          {content}
        </motion.div>
      </div>
    );

    if (isReorderable) {
      return (
        <Reorder.Item
          ref={ref}
          value={id}
          dragListener={false}
          dragControls={dragControls}
          className={listItemVariants({ lines, className })}
          {...props}
        >
          {itemContent}
        </Reorder.Item>
      );
    }

    return (
      <li
        ref={ref}
        className={listItemVariants({ lines, className })}
        {...props}
      >
        {itemContent}
      </li>
    );
  }
);

ListItem.displayName = "ListItem";
