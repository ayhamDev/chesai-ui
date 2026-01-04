"use client";

import {
  flexRender,
  type Row,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import React, { createContext, useContext, useMemo } from "react";
import { ContextMenu } from "../context-menu";
import { Skeleton } from "../skeleton";

// --- Types & Context ---
type TableDensity = "default" | "compact";
type TableVariant = "primary" | "secondary";

export interface TableContextProps {
  table: TanstackTable<any>;
  density: TableDensity;
  variant: TableVariant;
  renderContextMenu?: (row: Row<any>) => React.ReactNode;
}

const TableContext = createContext<TableContextProps | null>(null);

export const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("Table components must be used within a <Table.Root>");
  }
  return context;
};

// --- CVA Variants ---

// 1. Container Variants
// Added overflow-x-auto to ensure the table is scrollable on small screens by default
export const tableContainerVariants = cva(
  "w-full overflow-hidden overflow-x-auto",
  {
    variants: {
      variant: {
        primary:
          "rounded-xl border border-graphite-border bg-graphite-card text-graphite-foreground shadow-sm",
        secondary: "rounded-none bg-transparent text-graphite-foreground",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export const tableVariants = cva(
  "w-full text-sm caption-bottom border-collapse"
);

// 2. Header Variants
export const thVariants = cva(
  "h-10 px-4 text-left align-middle font-semibold [&:has([role=checkbox])]:pr-0 transition-colors",
  {
    variants: {
      variant: {
        primary:
          "bg-graphite-secondary/50 text-graphite-foreground border-b border-graphite-border",
        secondary:
          "bg-transparent text-graphite-foreground/60 border-b-2 border-graphite-border",
      },
      density: {
        default: "py-3",
        compact: "py-2",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

// 3. Row Variants
export const trVariants = cva(
  "transition-colors data-[state=selected]:bg-graphite-secondary/60",
  {
    variants: {
      variant: {
        primary:
          "border-b border-graphite-border hover:bg-graphite-secondary/40",
        secondary:
          "border-b border-graphite-border/50 border-dashed hover:bg-graphite-secondary/20",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

// 4. Cell Variants
export const tdVariants = cva(
  "p-4 align-middle [&:has([role=checkbox])]:pr-0",
  {
    variants: {
      density: {
        default: "py-4",
        compact: "py-2",
      },
      variant: {
        primary: "",
        secondary: "",
      },
    },
  }
);

// --- Sub-Components ---
export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { density, variant } = useTableContext();

  return (
    <th
      ref={ref}
      className={clsx(thVariants({ density, variant }), className)}
      {...props}
    />
  );
});
TableHead.displayName = "Table.Head";

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { density, variant } = useTableContext();

  return (
    <td
      ref={ref}
      className={clsx(tdVariants({ density, variant }), className)}
      {...props}
    />
  );
});
TableCell.displayName = "Table.Cell";

export const TableRow = <TData extends {}>({
  row,
  ...rest
}: {
  row: Row<TData>;
  [key: string]: any;
}) => {
  const { renderContextMenu, variant } = useTableContext();

  const RowContent = (
    <tr
      data-state={row.getIsSelected() && "selected"}
      className={clsx(trVariants({ variant }), rest.className)}
      {...rest}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </tr>
  );

  if (renderContextMenu) {
    return (
      <ContextMenu>
        <ContextMenu.Trigger asChild>{RowContent}</ContextMenu.Trigger>
        {renderContextMenu(row)}
      </ContextMenu>
    );
  }

  return RowContent;
};
TableRow.displayName = "Table.Row";

// --- Root Component ---
export interface TableRootProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: TanstackTable<TData>;
  density?: TableDensity;
  variant?: TableVariant;
  renderContextMenu?: (row: Row<TData>) => React.ReactNode;
  /** If true, renders skeleton rows in the table body. */
  isLoading?: boolean;
  /** Number of skeleton rows to render when loading. @default 10 */
  skeletonCount?: number;
}

export const TableRoot = <TData extends {}>({
  className,
  table,
  density = "default",
  variant = "primary",
  renderContextMenu,
  isLoading = false,
  skeletonCount = 10,
  ...props
}: TableRootProps<TData>) => {
  const contextValue = useMemo(
    () => ({
      table,
      density,
      variant,
      renderContextMenu,
    }),
    [table, density, variant, renderContextMenu]
  );

  return (
    <TableContext.Provider value={contextValue}>
      <div
        className={clsx(tableContainerVariants({ variant }), className)}
        {...props}
      >
        <table className={tableVariants()}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {isLoading ? (
              Array.from({ length: skeletonCount }).map((_, rowIndex) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                <tr key={rowIndex} className={trVariants({ variant })}>
                  {table.getVisibleLeafColumns().map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table
                .getRowModel()
                .rows.map((row) => <TableRow key={row.id} row={row} />)
            ) : (
              <tr>
                <td
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center text-graphite-foreground/70"
                >
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </TableContext.Provider>
  );
};
TableRoot.displayName = "Table";

export const Table = Object.assign(TableRoot, {
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
});
