"use client";

import {
  flexRender,
  type Row,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import { useMediaQuery } from "@uidotdev/usehooks";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import React, { createContext, useContext, useMemo } from "react";
import { ContextMenu } from "../context-menu";
import { Skeleton } from "../skeleton"; // Import Skeleton

// --- Types & Context ---
type ResponsiveLayout = "scroll" | "custom";
type TableDensity = "default" | "compact";

interface TableContextProps {
  table: TanstackTable<any>;
  responsiveLayout: ResponsiveLayout;
  isMobile: boolean;
  density: TableDensity;
  renderContextMenu?: (row: Row<any>) => React.ReactNode;
}

const TableContext = createContext<TableContextProps | null>(null);

const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("Table components must be used within a <Table.Root>");
  }
  return context;
};

// --- CVA Variants ---
const tableContainerVariants = cva(
  "w-full overflow-hidden rounded-xl border border-graphite-border bg-graphite-card text-graphite-foreground"
);

const tableVariants = cva("w-full text-sm caption-bottom", {
  variants: {
    layout: {
      desktop: "table-auto border-collapse",
      scroll: "table-auto border-collapse",
      custom: "flex flex-col gap-3",
    },
  },
});

const thVariants = cva(
  "h-10 px-4 text-left align-middle font-semibold text-graphite-foreground [&:has([role=checkbox])]:pr-0 border-b border-graphite-border bg-graphite-secondary/30",
  {
    variants: {
      density: {
        default: "py-3",
        compact: "py-2",
      },
      isFirstSticky: { true: "sticky left-0 z-10 bg-graphite-card" },
    },
  }
);

const trVariants = cva(
  "border-b border-graphite-border transition-colors hover:bg-graphite-secondary/40 data-[state=selected]:bg-graphite-secondary/60"
);

const tdVariants = cva(
  "p-4 align-middle [&:has([role=checkbox])]:pr-0 text-graphite-foreground",
  {
    variants: {
      density: {
        default: "py-4",
        compact: "py-2",
      },
      isFirstSticky: { true: "sticky left-0 z-10 bg-graphite-card" },
    },
  }
);

// --- Sub-Components ---
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & { colIndex: number }
>(({ className, colIndex, ...props }, ref) => {
  const { responsiveLayout, density } = useTableContext();
  const isFirstSticky = responsiveLayout === "scroll" && colIndex === 0;

  return (
    <th
      ref={ref}
      className={clsx(thVariants({ density, isFirstSticky }), className)}
      {...props}
    />
  );
});
TableHead.displayName = "Table.Head";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { colIndex: number }
>(({ className, colIndex, ...props }, ref) => {
  const { responsiveLayout, density } = useTableContext();
  const isFirstSticky = responsiveLayout === "scroll" && colIndex === 0;

  return (
    <td
      ref={ref}
      className={clsx(tdVariants({ density, isFirstSticky }), className)}
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
  const { renderContextMenu } = useTableContext();

  const RowContent = (
    <tr
      data-state={row.getIsSelected() && "selected"}
      className={clsx(trVariants(), rest.className)}
      {...rest}
    >
      {row.getVisibleCells().map((cell, cellIndex) => (
        <TableCell key={cell.id} colIndex={cellIndex}>
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
  responsiveLayout?: ResponsiveLayout;
  breakpoint?: "sm" | "md" | "lg";
  density?: TableDensity;
  renderMobileRow?: (row: Row<TData>) => React.ReactNode;
  renderContextMenu?: (row: Row<TData>) => React.ReactNode;
  /**
   * If true, renders skeleton rows in the table body.
   */
  isLoading?: boolean;
  /**
   * Number of skeleton rows to render when loading.
   * @default 10
   */
  skeletonCount?: number;
}

const TableRoot = <TData extends {}>({
  className,
  table,
  responsiveLayout = "scroll",
  breakpoint = "md",
  density = "default",
  renderMobileRow,
  renderContextMenu,
  isLoading = false,
  skeletonCount = 10,
  ...props
}: TableRootProps<TData>) => {
  const breakpointMap = { sm: 640, md: 768, lg: 1024 };
  const isMobile = useMediaQuery(`(max-width: ${breakpointMap[breakpoint]}px)`);

  const contextValue = useMemo(
    () => ({ table, responsiveLayout, isMobile, density, renderContextMenu }),
    [table, responsiveLayout, isMobile, density, renderContextMenu]
  );

  const layout = isMobile ? responsiveLayout : "desktop";

  // --- Loading State for Custom Layout ---
  if (layout === "custom" && isLoading) {
    return (
      <div className={tableVariants({ layout, className })} {...props}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            key={index}
            className="w-full h-32 rounded-xl bg-graphite-secondary animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (layout === "custom") {
    if (!renderMobileRow) {
      throw new Error(
        "renderMobileRow is required when responsiveLayout is 'custom'."
      );
    }
    return (
      <TableContext.Provider value={contextValue}>
        <div className={tableVariants({ layout, className })} {...props}>
          {table.getRowModel().rows.length > 0 ? (
            table
              .getRowModel()
              .rows.map((row) => (
                <React.Fragment key={row.id}>
                  {renderMobileRow(row)}
                </React.Fragment>
              ))
          ) : (
            <div className="text-center p-8 text-graphite-foreground/70">
              No results found.
            </div>
          )}
        </div>
      </TableContext.Provider>
    );
  }

  return (
    <TableContext.Provider value={contextValue}>
      <div
        className={clsx(
          tableContainerVariants(),
          isMobile && responsiveLayout === "scroll" && "overflow-x-auto",
          className
        )}
        {...props}
      >
        <table className={tableVariants({ layout })}>
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
            {isLoading ? (
              // --- Loading Skeletons ---
              Array.from({ length: skeletonCount }).map((_, rowIndex) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                <tr key={rowIndex} className={trVariants()}>
                  {table.getVisibleLeafColumns().map((column, colIndex) => (
                    <TableCell key={column.id} colIndex={colIndex}>
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
