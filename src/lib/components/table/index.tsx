"use client";

import {
  flexRender,
  type ColumnDef,
  type Row,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import { useMediaQuery } from "@uidotdev/usehooks";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import React, { createContext, useContext, useMemo } from "react";
import { Card, type CardProps } from "../card";

// --- Type Augmentation (Unchanged) ---
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    isAccordionHeader?: boolean;
  }
}

// --- 1. TYPES & CONTEXT (Refactored for new API) ---

export type { ColumnDef };

// The responsive layout options are now simplified.
type ResponsiveLayout = "scroll" | "custom";

interface TableContextProps {
  table: TanstackTable<any>;
  responsiveLayout: ResponsiveLayout;
  isMobile: boolean;
}

const TableContext = createContext<TableContextProps | null>(null);

const useTableContext = <TData,>() => {
  const context = useContext(
    TableContext as React.Context<TableContextProps | null>
  );
  if (!context) {
    throw new Error("Table components must be used within a <Table.Root>");
  }
  return context as {
    table: TanstackTable<TData>;
    responsiveLayout: ResponsiveLayout;
    isMobile: boolean;
  };
};

// --- 2. CVA VARIANTS (Updated for new API) ---
const tableVariants = cva("w-full text-sm", {
  variants: {
    layout: {
      desktop: "table-auto border-collapse",
      scroll: "table-auto border-collapse",
      // 'custom' variant will be a flex container for the custom rendered items
      custom: "flex flex-col gap-3",
    },
  },
});

const thVariants = cva(
  "p-4 font-semibold text-left border-b border-graphite-border",
  {
    variants: {
      isFirstSticky: {
        true: "sticky left-0 z-10",
      },
      stickyCellVariant: {
        card: "bg-graphite-card",
        secondary: "bg-graphite-secondary",
      },
    },
  }
);

const tdVariants = cva("p-4 border-b border-graphite-border align-top", {
  variants: {
    isFirstSticky: {
      true: "sticky left-0 z-10",
    },
    stickyCellVariant: {
      card: "bg-graphite-card",
      secondary: "bg-graphite-secondary",
    },
  },
});

// --- 3. SUB-COMPONENTS (Simplified) ---

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & { colIndex: number }
>(({ className, colIndex, ...props }, ref) => {
  const { responsiveLayout } = useTableContext();
  const { stickyCellVariant } = useContext(TableRootContext);
  const isFirstSticky = responsiveLayout === "scroll" && colIndex === 0;

  return (
    <th
      ref={ref}
      className={thVariants({ isFirstSticky, stickyCellVariant, className })}
      {...props}
    />
  );
});
TableHead.displayName = "Table.Head";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { colIndex: number }
>(({ className, colIndex, ...props }, ref) => {
  const { responsiveLayout } = useTableContext();
  const { stickyCellVariant } = useContext(TableRootContext);
  const isFirstSticky = responsiveLayout === "scroll" && colIndex === 0;

  return (
    <td
      ref={ref}
      className={tdVariants({ isFirstSticky, stickyCellVariant, className })}
      {...props}
    />
  );
});
TableCell.displayName = "Table.Cell";

const TableRow = <TData extends {}>({
  row,
  ...rest
}: {
  row: Row<TData>;
  [key: string]: any;
}) => {
  // This component now only ever renders a `<tr>`, as the custom logic is handled in the root.
  return (
    <tr
      className={clsx("hover:bg-graphite-secondary/50", rest.className)}
      {...rest}
    >
      {row.getVisibleCells().map((cell, cellIndex) => (
        <TableCell key={cell.id} colIndex={cellIndex}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </tr>
  );
};
TableRow.displayName = "Table.Row";

// --- 4. ROOT COMPONENT (Refactored with Custom Render Prop) ---

export interface TableRootProps<TData>
  extends React.HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {
  table: TanstackTable<TData>;
  responsiveLayout?: ResponsiveLayout;
  breakpoint?: "sm" | "md" | "lg";
  stickyCellVariant?: "card" | "secondary";
  /**
   * A function to render a custom component for each row on mobile viewports.
   * Required when `responsiveLayout` is set to `'custom'`.
   * @param row The TanStack Table `row` object.
   */
  renderMobileRow?: (row: Row<TData>) => React.ReactNode;
}

const TableRootContext = createContext<
  Pick<TableRootProps<unknown>, "stickyCellVariant">
>({
  stickyCellVariant: "card",
});

const TableRoot = <TData extends {}>({
  className,
  table,
  responsiveLayout = "scroll",
  breakpoint = "md",
  stickyCellVariant = "card",
  renderMobileRow,
  ...props
}: TableRootProps<TData>) => {
  const breakpointMap = { sm: 640, md: 768, lg: 1024 };
  const isMobile = useMediaQuery(`(max-width: ${breakpointMap[breakpoint]}px)`);

  const contextValue = useMemo(
    () => ({ table, responsiveLayout, isMobile }),
    [table, responsiveLayout, isMobile]
  );

  const rootContextValue = useMemo(
    () => ({ stickyCellVariant }),
    [stickyCellVariant]
  );

  const layout = isMobile ? responsiveLayout : "desktop";

  // --- LOGIC FOR CUSTOM MOBILE RENDERER ---
  if (layout === "custom") {
    if (!renderMobileRow) {
      throw new Error(
        "The `renderMobileRow` prop is required when `responsiveLayout` is 'custom'."
      );
    }
    return (
      <TableContext.Provider value={contextValue}>
        <div className={tableVariants({ layout, className })} {...props}>
          {table.getRowModel().rows.map((row) => (
            // The key is now on the root element rendered by the user's function
            <React.Fragment key={row.id}>{renderMobileRow(row)}</React.Fragment>
          ))}
        </div>
      </TableContext.Provider>
    );
  }

  // --- LOGIC FOR DESKTOP & SCROLL LAYOUTS ---
  return (
    <TableRootContext.Provider value={rootContextValue}>
      <TableContext.Provider value={contextValue}>
        <div
          className={clsx(
            isMobile &&
              responsiveLayout === "scroll" &&
              "w-full overflow-x-auto"
          )}
        >
          <table className={tableVariants({ layout, className })} {...props}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, headerIndex) => (
                    <TableHead key={header.id} colIndex={headerIndex}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      </TableContext.Provider>
    </TableRootContext.Provider>
  );
};
TableRoot.displayName = "Table";

export const Table = Object.assign(TableRoot, {
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
});
