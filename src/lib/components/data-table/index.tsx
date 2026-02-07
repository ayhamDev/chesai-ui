"use client";

import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  type Row,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import React from "react";
import { Table, type TableRootProps } from "../table";
import { DataTableColumnHeader } from "./column-header";
import { DataTableContext } from "./context";
import { DataTableFacetedFilter } from "./faceted-filter";
import { advancedFilterFn } from "./filter-utils";
import { DataTablePagination } from "./pagination";
import { DataTableToolbar } from "./toolbar";

export {
  DataTableColumnHeader,
  DataTablePagination,
  DataTableToolbar,
  DataTableFacetedFilter,
  advancedFilterFn,
  advancedFilterFn as numericFilterFn,
};

interface DataTableProps<TData> extends Omit<TableRootProps<TData>, "table"> {
  data: TData[];
  columns: ColumnDef<TData>[];
  variant: "primary" | "secondary";
  // Server Side Props
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  globalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;

  // New Prop
  isLoading?: boolean;

  // UI Props
  toolbarChildren?: React.ReactNode;
  renderContextMenu?: (row: Row<TData>) => React.ReactNode;
  bulkActions?: (table: TanstackTable<TData>) => React.ReactNode;
}

export function DataTable<TData>({
  data,
  columns,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  isLoading,
  toolbarChildren,
  density = "default",
  renderContextMenu,
  bulkActions,
  variant = "primary",
  ...tableProps
}: DataTableProps<TData>) {
  const [internalRowSelection, setInternalRowSelection] = React.useState({});
  const [internalColumnVisibility, setInternalColumnVisibility] =
    React.useState<VisibilityState>({});
  const [internalSorting, setInternalSorting] = React.useState<SortingState>(
    [],
  );
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState("");
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

  const isManualPagination = !!onPaginationChange;
  const isManualSorting = !!onSortingChange;
  const isManualFiltering = !!onColumnFiltersChange || !!onGlobalFilterChange;

  const table = useReactTable({
    data,
    columns,
    pageCount: isManualPagination ? pageCount : undefined,
    state: {
      sorting: isManualSorting ? sorting : internalSorting,
      columnFilters: isManualFiltering ? columnFilters : internalColumnFilters,
      globalFilter: isManualFiltering ? globalFilter : internalGlobalFilter,
      pagination: isManualPagination ? pagination : internalPagination,
      columnVisibility: internalColumnVisibility,
      rowSelection: internalRowSelection,
    },
    onRowSelectionChange: setInternalRowSelection,
    onColumnVisibilityChange: setInternalColumnVisibility,
    onSortingChange: isManualSorting ? onSortingChange : setInternalSorting,
    onColumnFiltersChange: isManualFiltering
      ? onColumnFiltersChange
      : setInternalColumnFilters,
    onGlobalFilterChange: isManualFiltering
      ? onGlobalFilterChange
      : setInternalGlobalFilter,
    onPaginationChange: isManualPagination
      ? onPaginationChange
      : setInternalPagination,
    manualPagination: isManualPagination,
    manualSorting: isManualSorting,
    manualFiltering: isManualFiltering,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    defaultColumn: {
      filterFn: advancedFilterFn,
    },
  });
  console.log(variant);

  return (
    <DataTableContext.Provider value={{ table }}>
      <div className="flex flex-col w-full space-y-4">
        <DataTableToolbar bulkActions={bulkActions}>
          {toolbarChildren}
        </DataTableToolbar>
        <Table
          variant={variant}
          table={table}
          density={density}
          renderContextMenu={renderContextMenu}
          isLoading={isLoading}
          {...tableProps}
        />
        <DataTablePagination />
      </div>
    </DataTableContext.Provider>
  );
}
