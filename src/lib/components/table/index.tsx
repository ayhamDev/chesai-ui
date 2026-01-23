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
type TableVariant = "primary" | "secondary" | "ghost";

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

export const tableContainerVariants = cva(
  "w-full overflow-hidden overflow-x-auto",
  {
    variants: {
      variant: {
        primary:
          "rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface",
        secondary: "rounded-none bg-transparent text-on-surface",
        ghost: "rounded-xl bg-transparent text-on-surface",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export const tableVariants = cva(
  "w-full text-sm caption-bottom border-collapse",
);

// Header Variants
export const thVariants = cva(
  "h-12 px-4 text-left align-middle font-semibold [&:has([role=checkbox])]:pr-0 transition-colors",
  {
    variants: {
      variant: {
        primary:
          "bg-surface-container/50 text-on-surface border-b border-outline-variant",
        secondary:
          "bg-transparent text-on-surface-variant border-b border-outline-variant",
        ghost:
          "bg-surface-container-low text-on-surface border-b border-outline-variant/50 first:rounded-tl-xl last:rounded-tr-xl",
      },
      density: {
        default: "py-3",
        compact: "py-2",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

// Row Variants
export const trVariants = cva(
  "transition-colors data-[state=selected]:bg-secondary-container/60",
  {
    variants: {
      variant: {
        primary:
          "border-b border-outline-variant hover:bg-surface-container-highest/50",
        secondary:
          "border-b border-outline-variant/50 border-dashed hover:bg-surface-container-highest/30",
        ghost:
          "border-b border-outline-variant/30 last:border-0 hover:bg-surface-container-low/40",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export const tdVariants = cva(
  "p-4 align-middle [&:has([role=checkbox])]:pr-0",
  {
    variants: {
      density: {
        default: "py-4",
        compact: "py-2",
      },
    },
  },
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
  const { density } = useTableContext();

  return (
    <td
      ref={ref}
      className={clsx(tdVariants({ density }), className)}
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
export interface TableRootProps<
  TData,
> extends React.HTMLAttributes<HTMLDivElement> {
  table: TanstackTable<TData>;
  density?: TableDensity;
  variant?: TableVariant;
  renderContextMenu?: (row: Row<TData>) => React.ReactNode;
  isLoading?: boolean;
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
    [table, density, variant, renderContextMenu],
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
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: skeletonCount }).map((_, rowIndex) => (
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
                  className="h-24 text-center text-on-surface-variant"
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
