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
  type Row,
  type SortingState,
  type VisibilityState,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import React from "react";
import { Button } from "../button";
import {
  DataTableContext,
  DataTablePagination,
  DataTableToolbar,
  advancedFilterFn,
} from "../data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { Grid, type GridProps } from "../layout/grid";
import { Masonry, type MasonryProps } from "../layout/masonry";
import { LoadingIndicator } from "../loadingIndicator";

// --- Types ---

export type DataDisplayLayout = "grid" | "list" | "masonry";

export interface DataDisplayProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[]; // Required for filtering/sorting logic
  renderItem: (row: Row<TData>) => React.ReactNode;

  // Layout Configuration
  layout?: DataDisplayLayout;
  gridProps?: Partial<GridProps>;
  masonryProps?: Partial<MasonryProps>;
  itemContainerClassName?: string;

  // State Control (Server-side or Client-side)
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  globalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;

  isLoading?: boolean;

  // UI Slots
  toolbarChildren?: React.ReactNode;
  bulkActions?: (table: TanstackTable<TData>) => React.ReactNode;

  /**
   * If true, adds a "Sort By" dropdown to the toolbar automatically
   * since column headers aren't visible.
   */
  enableSortControl?: boolean;
}

// --- Sort Control Helper ---
// Since we don't have table headers in a Grid/List view, we need a way to sort.
function DataDisplaySortControl<TData>({
  table,
}: {
  table: TanstackTable<TData>;
}) {
  const sortableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanSort());

  if (sortableColumns.length === 0) return null;

  const currentSort = table.getState().sorting[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          startIcon={<ArrowUpDown className="h-3.5 w-3.5" />}
          className="h-8"
        >
          Sort
          {currentSort && (
            <span className="ml-2 opacity-60 font-normal">
              : {currentSort.id} ({currentSort.desc ? "Desc" : "Asc"})
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sortableColumns.map((column) => {
          // Helper to get a nice label
          const header =
            typeof column.columnDef.header === "string"
              ? column.columnDef.header
              : column.id;

          return (
            <React.Fragment key={column.id}>
              <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                {header} (Asc)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                {header} (Desc)
              </DropdownMenuItem>
            </React.Fragment>
          );
        })}
        {currentSort && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => table.resetSorting()}>
              Clear Sort
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DataDisplay<TData>({
  data,
  columns,
  renderItem,
  layout = "grid",
  gridProps,
  masonryProps,
  itemContainerClassName,
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
  bulkActions,
  enableSortControl = true,
}: DataDisplayProps<TData>) {
  // --- Table State Management (Same as DataTable) ---
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
      pageSize: 12, // Default slightly higher for grids
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

  const rows = table.getRowModel().rows;

  // --- Layout Renderers ---

  const renderContent = () => {
    if (isLoading && rows.length === 0) {
      return (
        <div className="flex h-64 w-full items-center justify-center">
          <LoadingIndicator variant="material-morph" />
        </div>
      );
    }

    if (rows.length === 0) {
      return (
        <div className="flex h-64 w-full items-center justify-center border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant">
          No results found.
        </div>
      );
    }

    if (layout === "masonry") {
      return (
        <Masonry
          columns={{ default: 1, sm: 2, md: 3, lg: 4 }}
          gap="md"
          {...masonryProps}
          className={itemContainerClassName}
        >
          {rows.map((row) => (
            <React.Fragment key={row.id}>{renderItem(row)}</React.Fragment>
          ))}
        </Masonry>
      );
    }

    if (layout === "grid") {
      return (
        <Grid
          columns={{ default: 1, sm: 2, md: 3, lg: 4 }}
          gap="md"
          {...gridProps}
          className={itemContainerClassName}
        >
          {rows.map((row) => (
            // We don't wrap in GridItem automatically to give user full control over spans in their renderItem,
            // BUT normally renderItem returns a Card. Grid expects children.
            // If the user wants specific spans, they should wrap their return in GridItem.
            // We simply render the result of the function.
            <React.Fragment key={row.id}>{renderItem(row)}</React.Fragment>
          ))}
        </Grid>
      );
    }

    // Default: List
    return (
      <div className={`flex flex-col gap-4 ${itemContainerClassName}`}>
        {rows.map((row) => (
          <React.Fragment key={row.id}>{renderItem(row)}</React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <DataTableContext.Provider value={{ table }}>
      <div className="flex flex-col w-full space-y-6">
        <DataTableToolbar bulkActions={bulkActions}>
          {toolbarChildren}
          {enableSortControl && <DataDisplaySortControl table={table} />}
        </DataTableToolbar>

        {/* Main Content Area */}
        <div className="min-h-[200px]">{renderContent()}</div>

        <DataTablePagination />
      </div>
    </DataTableContext.Provider>
  );
}
