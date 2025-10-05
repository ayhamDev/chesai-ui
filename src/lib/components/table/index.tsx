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
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import React, { createContext, useContext, useMemo, useState } from "react";
import { Card, type CardProps } from "../card";
import { Typography } from "../typography";

// --- Augment TanStack's ColumnMeta type to include our custom property ---
// biome-ignore lint/correctness/noUnusedVariables: This is a required type augmentation for the library.
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    isAccordionHeader?: boolean;
  }
}

// --- 1. TYPES & CONTEXT (Refactored) ---

export type { ColumnDef };

type ResponsiveLayout = "card" | "accordion" | "scroll";

// The context itself is no longer generic. It holds a table of `any` type.
interface TableContextProps {
  table: TanstackTable<any>;
  responsiveLayout: ResponsiveLayout;
  isMobile: boolean;
}

const TableContext = createContext<TableContextProps | null>(null);

// The hook is now generic and will cast the context to the correct type.
const useTableContext = <TData,>() => {
  const context = useContext(
    TableContext as React.Context<TableContextProps | null>
  );
  if (!context) {
    throw new Error("Table components must be used within a <Table.Root>");
  }
  // Cast the table to the specific data type when the hook is used.
  return context as {
    table: TanstackTable<TData>;
    responsiveLayout: ResponsiveLayout;
    isMobile: boolean;
  };
};

// --- 2. CVA VARIANTS (Unchanged) ---

const tableVariants = cva("w-full text-sm", {
  variants: {
    layout: {
      desktop: "table-auto border-collapse",
      scroll: "table-auto border-collapse",
      card: "flex flex-col gap-3",
      accordion: "flex flex-col gap-2",
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
        card: "",
        secondary: "",
      },
    },
    compoundVariants: [
      {
        isFirstSticky: true,
        stickyCellVariant: "card",
        className: "bg-graphite-card",
      },
      {
        isFirstSticky: true,
        stickyCellVariant: "secondary",
        className: "bg-graphite-secondary",
      },
    ],
  }
);

const tdVariants = cva("p-4 border-b border-graphite-border align-top", {
  variants: {
    isFirstSticky: {
      true: "sticky left-0 z-10",
    },
    stickyCellVariant: {
      card: "",
      secondary: "",
    },
  },
  compoundVariants: [
    {
      isFirstSticky: true,
      stickyCellVariant: "card",
      className: "bg-graphite-card",
    },
    {
      isFirstSticky: true,
      stickyCellVariant: "secondary",
      className: "bg-graphite-secondary",
    },
  ],
});

// --- 3. SUB-COMPONENTS (Refactored) ---

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & { colIndex: number }
>(({ children, className, colIndex, ...props }, ref) => {
  const { responsiveLayout } = useTableContext();
  const { stickyCellVariant } = useContext(TableRootContext);
  const isFirstSticky = responsiveLayout === "scroll" && colIndex === 0;

  return (
    <th
      ref={ref}
      className={thVariants({ isFirstSticky, stickyCellVariant, className })}
      {...props}
    >
      {children}
    </th>
  );
});
TableHead.displayName = "Table.Head";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { colIndex: number }
>(({ children, className, colIndex, ...props }, ref) => {
  const { responsiveLayout } = useTableContext();
  const { stickyCellVariant } = useContext(TableRootContext);
  const isFirstSticky = responsiveLayout === "scroll" && colIndex === 0;

  return (
    <td
      ref={ref}
      className={tdVariants({ isFirstSticky, stickyCellVariant, className })}
      {...props}
    >
      {children}
    </td>
  );
});
TableCell.displayName = "Table.Cell";

// --- Row Components (Refactored for TanStack Table) ---

interface TableRowProps<TData> extends Omit<CardProps, "children"> {
  row: Row<TData>;
}

const CardRow = <TData extends {}>({
  row,
  ...cardProps
}: TableRowProps<TData>) => {
  return (
    <Card shape="minimal" variant="secondary" {...cardProps} padding="lg">
      <div className="flex justify-between items-center flex-wrap gap-8">
        {row.getVisibleCells().map((cell) => (
          <div key={cell.id}>
            <Typography variant="muted" className="!mt-0 !text-xs">
              {cell.column.columnDef.header as React.ReactNode}
            </Typography>
            <Typography
              variant="small"
              className="!mt-0 font-semibold truncate"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </Typography>
          </div>
        ))}
      </div>
    </Card>
  );
};

const AccordionRow = <TData extends {}>({
  row,
  ...cardProps
}: TableRowProps<TData>) => {
  const { accordionDetailsProps } = useContext(TableRootContext);
  const [isOpen, setIsOpen] = useState(false);

  const allCells = row.getVisibleCells();
  const accordionHeaderCells = allCells.filter(
    (cell) => cell.column.columnDef.meta?.isAccordionHeader
  );
  const accordionBodyCells = allCells.filter(
    (cell) => !cell.column.columnDef.meta?.isAccordionHeader
  );

  return (
    <Card
      shape="minimal"
      variant="secondary"
      {...cardProps}
      padding="none"
      className={clsx("overflow-hidden", cardProps.className)}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-5 text-left"
      >
        <div className="flex justify-between items-center gap-8 flex-1 min-w-0 space-y-1">
          {accordionHeaderCells.map((cell) => (
            <div key={cell.id}>
              <Typography
                variant="muted"
                className="!mt-0 font-semibold truncate"
              >
                {cell.column.columnDef.header as React.ReactNode}
              </Typography>
              <Typography variant="p" className="!mt-0 font-semibold truncate">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Typography>
            </div>
          ))}
        </div>
        <ChevronDown
          className={clsx(
            "ml-4 h-5 w-5 transition-transform flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            className="overflow-hidden"
          >
            <div
              {...accordionDetailsProps}
              className={clsx(
                "flex justify-between items-center flex-wrap gap-8 gap-y-4 p-4 border-t border-graphite-border",
                accordionDetailsProps?.className
              )}
            >
              {accordionBodyCells.map((cell) => (
                <div key={cell.id}>
                  <Typography variant="muted" className="!mt-0 !text-xs">
                    {cell.column.columnDef.header as React.ReactNode}
                  </Typography>
                  <Typography
                    variant="small"
                    className="!mt-0 font-semibold truncate"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Typography>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

const TableRow = <TData extends {}>({ row, ...rest }: TableRowProps<TData>) => {
  const { isMobile, responsiveLayout } = useTableContext<TData>();

  if (isMobile) {
    if (responsiveLayout === "card") {
      return <CardRow row={row} {...rest} />;
    }
    if (responsiveLayout === "accordion") {
      return <AccordionRow row={row} {...rest} />;
    }
  }

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

// --- 4. ROOT COMPONENT (REFACTORED) ---

export interface TableRootProps<TData>
  extends React.HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {
  table: TanstackTable<TData>;
  responsiveLayout?: ResponsiveLayout;
  breakpoint?: "sm" | "md" | "lg";
  rowProps?: (row: Row<TData>) => Omit<CardProps, "children">;
  stickyCellVariant?: "card" | "secondary";
  accordionDetailsProps?: React.HTMLAttributes<HTMLDivElement>;
}

const TableRootContext = createContext<
  Pick<TableRootProps<unknown>, "stickyCellVariant" | "accordionDetailsProps">
>({
  stickyCellVariant: "card",
});

const TableRoot = <TData extends {}>({
  className,
  table,
  responsiveLayout = "scroll",
  breakpoint = "md",
  rowProps,
  stickyCellVariant = "card",
  accordionDetailsProps,
  ...props
}: TableRootProps<TData>) => {
  const breakpointMap = { sm: 640, md: 768, lg: 1024 };
  const isMobile = useMediaQuery(`(max-width: ${breakpointMap[breakpoint]}px)`);

  const contextValue = useMemo(
    () => ({ table, responsiveLayout, isMobile }),
    [table, responsiveLayout, isMobile]
  );

  const rootContextValue = useMemo(
    () => ({ stickyCellVariant, accordionDetailsProps }),
    [stickyCellVariant, accordionDetailsProps]
  );

  const layout = isMobile ? responsiveLayout : "desktop";

  return (
    <TableRootContext.Provider value={rootContextValue}>
      <TableContext.Provider value={contextValue}>
        {layout === "card" || layout === "accordion" ? (
          <div className={tableVariants({ layout, className })} {...props}>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                row={row}
                {...(rowProps ? rowProps(row) : {})}
              />
            ))}
          </div>
        ) : (
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
                  <TableRow
                    key={row.id}
                    row={row}
                    {...(rowProps ? rowProps(row) : {})}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
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
