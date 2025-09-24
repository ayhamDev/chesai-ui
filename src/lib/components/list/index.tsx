"use client";

import { useLongPress } from "@uidotdev/usehooks";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { Reorder } from "framer-motion";
import React, { useState } from "react";
import { ListContext } from "../../context/List.context";
import { Typography } from "../typography";
import { ListItem, ListItemProps } from "./ListItem";

const listVariants = cva("flex w-full flex-col overflow-hidden", {
  variants: {
    variant: {
      primary: "bg-graphite-card",
      secondary: "bg-graphite-secondary",
    },
    shape: {
      full: "rounded-2xl",
      minimal: "rounded-lg",
      sharp: "rounded-none",
    },
  },
  defaultVariants: {
    variant: "primary",
    shape: "minimal",
  },
});

const Divider = () => <div className="h-px bg-graphite-border" />;

interface ListProps<T>
  extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof listVariants> {
  children: React.ReactNode;
  dividers?: boolean;
  header?: React.ReactNode;
  reorderable?: boolean;
  items?: T[];
  onReorder?: (newOrder: T[]) => void;
  selectable?: boolean;
}

const ListRoot = <T extends { id: string | number }>({
  className,
  children,
  dividers = false,
  header,
  variant,
  shape,
  reorderable = false,
  items,
  onReorder,
  selectable = false,
  ...props
}: ListProps<T>) => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(
    new Set()
  );

  const toggleSelection = (id: string | number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const longPressAttrs = useLongPress(
    () => {
      if (selectable && !reorderable) setIsSelectionMode(true);
    },
    { threshold: 500 }
  );

  const startReorder = (id: string | number) => {
    // Optional: could add logic here if needed when drag starts
  };

  const childArray = React.Children.toArray(children);

  const renderContent = () => (
    <>
      {childArray.map((child, index) => {
        if (!React.isValidElement(child)) return child;
        const isLast = index === childArray.length - 1;
        return (
          <React.Fragment key={(child.props as ListItemProps).id}>
            {child}
            {dividers && !isLast && <Divider />}
          </React.Fragment>
        );
      })}
    </>
  );

  return (
    <ListContext.Provider
      value={{
        isSelectionMode,
        setIsSelectionMode,
        selectedItems,
        toggleSelection,
        isReorderable: reorderable,
        startReorder,
      }}
    >
      <div {...(selectable && longPressAttrs)}>
        {header && (
          <div className="px-4 py-2">
            <Typography
              variant="small"
              className="font-bold text-graphite-primary"
            >
              {header}
            </Typography>
          </div>
        )}
        {reorderable ? (
          <Reorder.Group
            as="ul"
            axis="y"
            values={items || []}
            onReorder={onReorder as any}
            className={clsx(listVariants({ variant, shape, className }))}
            {...props}
          >
            {children}
          </Reorder.Group>
        ) : (
          <ul
            className={clsx(listVariants({ variant, shape, className }))}
            {...props}
          >
            {renderContent()}
          </ul>
        )}
      </div>
    </ListContext.Provider>
  );
};

export const List = Object.assign(ListRoot, {
  Item: ListItem,
});
