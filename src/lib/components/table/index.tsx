"use client";

import {
  flexRender,
  type Row,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion"; // Add Framer Motion
import React, { createContext, useContext, useMemo } from "react";
import { ContextMenu } from "../context-menu";
import { Skeleton } from "../skeleton";
import { useStickyHeader } from "./use-sticky-header";

// --- Types & Context ---
type TableDensity = "default" | "compact";
type TableVariant = "primary" | "secondary" | "ghost";

export interface TableContextProps {
  table: TanstackTable<any>;
  density: TableDensity;
  variant: TableVariant;
  renderContextMenu?: (row: Row<any>) => React.ReactNode;
  renderExpandedRow?: (row: Row<any>) => React.ReactNode; // Add prop
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
  "h-12 px-4 text-start align-middle font-semibold [&:has([role=checkbox])]:pe-0 transition-colors",
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
  "p-4 align-middle [&:has([role=checkbox])]:pe-0",
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
      role="columnheader"
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
      role="cell"
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
  const { renderContextMenu, variant, renderExpandedRow } = useTableContext();

  const RowContent = (
    <tr
      role="row"
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

  const WrappedMainRow = renderContextMenu ? (
    <ContextMenu>
      <ContextMenu.Trigger asChild>{RowContent}</ContextMenu.Trigger>
      {renderContextMenu(row)}
    </ContextMenu>
  ) : (
    RowContent
  );

  const isExpanded = row.getIsExpanded();

  return (
    <React.Fragment>
      {WrappedMainRow}
      <AnimatePresence initial={false}>
        {renderExpandedRow && isExpanded && (
          <motion.tr
            role="row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              "bg-surface-container-lowest",
              variant !== "ghost" && "border-b border-outline-variant",
            )}
          >
            <td role="cell" colSpan={row.getVisibleCells().length} className="p-0">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                {renderExpandedRow(row)}
              </motion.div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
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
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode; // Add prop
  isLoading?: boolean;
  skeletonCount?: number;
  /** Follow the outer vertical scroller while preserving horizontal scrolling. */
  stickyHeader?: boolean;
  /** Space below a sticky app bar, in pixels relative to the outer scroller. */
  stickyHeaderOffset?: number;
  /** Access the horizontal scroll container, e.g. for an external scrollbar. */
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export const TableRoot = <TData extends {}>({
  className,
  table,
  density = "default",
  variant = "primary",
  renderContextMenu,
  renderExpandedRow, // Accept prop
  isLoading = false,
  skeletonCount = 10,
  stickyHeader = false,
  stickyHeaderOffset = 0,
  scrollContainerRef,
  ...props
}: TableRootProps<TData>) => {
  const { containerRef, headerRef, stickyViewportRef, stickyTableRef } =
    useStickyHeader(stickyHeader);
  const setContainerRef = React.useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (scrollContainerRef) scrollContainerRef.current = node;
  }, [containerRef, scrollContainerRef]);
  const contextValue = useMemo(
    () => ({
      table,
      density,
      variant,
      renderContextMenu,
      renderExpandedRow, // Provide prop
    }),
    [table, density, variant, renderContextMenu, renderExpandedRow],
  );

  const renderHeaderRows = () => table.getHeaderGroups().map(headerGroup => (
    <tr key={headerGroup.id} role="row">
      {headerGroup.headers.map(header => (
        <TableHead key={header.id} colSpan={header.colSpan}>
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </TableHead>
      ))}
    </tr>
  ));

  const bodyTable = (
      <div
        ref={setContainerRef}
        className={clsx(
          tableContainerVariants({ variant }),
          stickyHeader && "col-start-1 row-start-1 min-w-0",
          className,
        )}
        {...props}
      >
        <table data-table-body="" role={stickyHeader ? "presentation" : undefined} className={tableVariants()}>
          <thead
            ref={headerRef}
            role="rowgroup"
            aria-hidden={stickyHeader || undefined}
            inert={stickyHeader || undefined}
            style={stickyHeader ? { visibility: "hidden" } : undefined}
          >
            {renderHeaderRows()}
          </thead>
          <tbody role="rowgroup" className={stickyHeader ? "relative z-0 isolate" : undefined}>
            {isLoading ? (
              Array.from({ length: skeletonCount }).map((_, rowIndex) => (
                <tr role="row" key={rowIndex} className={trVariants({ variant })}>
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
              <tr role="row">
                <td
                  role="cell"
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
  );

  return (
    <TableContext.Provider value={contextValue}>
      {stickyHeader ? (
        <div role="table" className="relative grid grid-cols-1 min-w-0">
          <div
            ref={stickyViewportRef}
            data-sticky-header=""
            className="sticky col-start-1 row-start-1 self-start z-10 overflow-x-auto overflow-y-hidden border-transparent bg-surface-container-low [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ top: stickyHeaderOffset }}
          >
            <table ref={stickyTableRef} role="presentation" className={tableVariants()} style={{ tableLayout: "fixed" }}>
              <colgroup>
                {table.getVisibleLeafColumns().map(column => <col key={column.id} />)}
              </colgroup>
              <thead role="rowgroup">{renderHeaderRows()}</thead>
            </table>
          </div>
          {bodyTable}
        </div>
      ) : bodyTable}
    </TableContext.Provider>
  );
};
TableRoot.displayName = "Table";

export const Table = Object.assign(TableRoot, {
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
});
