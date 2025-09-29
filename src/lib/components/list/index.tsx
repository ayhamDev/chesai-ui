"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import React, { useState } from "react";
import { ListContext } from "../../context/List.context";
import { Typography } from "../typography";
import { ListItem, type ListItemProps } from "./ListItem"; // Import ListItemProps

// Export the type so it can be used elsewhere
export type { ListItemProps };

const listVariants = cva("flex w-full flex-col overflow-hidden", {
  variants: {
    variant: {
      primary: "",
      secondary: "",
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

const Divider = () => <div className="h-px bg-graphite-border ml-4" />;

interface ListProps
  extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof listVariants> {
  children: React.ReactNode;
  dividers?: boolean;
  header?: React.ReactNode;
  selectable?: boolean;
  reorderable?: boolean;
}

const ListRoot = ({
  className,
  children,
  dividers = false,
  header,
  variant,
  shape,
  selectable = false,
  reorderable = false,
  ...props
}: ListProps) => {
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

      if (newSet.size === 0) {
        setIsSelectionMode(false);
      }

      return newSet;
    });
  };

  const childArray = React.Children.toArray(children);

  return (
    <ListContext.Provider
      value={{
        isSelectable: selectable,
        isSelectionMode,
        setIsSelectionMode,
        selectedItems,
        toggleSelection,
        isReorderable: reorderable,
      }}
    >
      <div className="flex flex-col">
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
        <ul
          className={clsx(listVariants({ variant, shape, className }), "py-2")}
          {...props}
        >
          {childArray.map((child, index) => {
            if (!React.isValidElement(child)) return child;
            const isLast = index === childArray.length - 1;
            return (
              <React.Fragment key={child.key}>
                {child}
                {dividers && !isLast && <Divider />}
              </React.Fragment>
            );
          })}
        </ul>
      </div>
    </ListContext.Provider>
  );
};

export const List = Object.assign(ListRoot, {
  Item: ListItem,
});
