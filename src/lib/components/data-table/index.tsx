"use client";

import {
  functionalUpdate,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  type TableOptions,
  type VisibilityState,
} from "@tanstack/react-table";
import React from "react";
import { Table, type TableRootProps } from "../table";
import { DataTableColumnHeader } from "./column-header";
import {
  DataTableContext,
  type DataTableSearchInputProps,
} from "./context";
import { DataTableFacetedFilter } from "./faceted-filter";
import {
  advancedFilterFn,
  advancedGlobalFilterFn,
  prepareDataTableColumns,
} from "./filter-utils";
import { DataTablePagination } from "./pagination";
import { DataTableToolbar } from "./toolbar";
import {
  defaultDataTableState,
  defaultDataTableVisibility,
  type DataTableState,
  type DataTableUrlState,
  type DataTableVisibility,
} from "./types";

export {
  DataTableColumnHeader,
  DataTablePagination,
  DataTableToolbar,
  DataTableFacetedFilter,
  advancedFilterFn,
  advancedGlobalFilterFn,
  advancedFilterFn as numericFilterFn,
  DataTableContext,
};
export { createDataTableUrlCodec } from "./url-codec";
export type {
  DataTableFilterEditorProps,
  DataTableFilterInput,
  DataTableFilterOption,
  DataTableColumnFilterConfig,
  DataTableFilterVariant,
  FilterOperator,
  AdvancedFilterValue,
} from "./filter-utils";
export type {
  DataTableState,
  DataTableUrlState,
  DataTableVisibility,
} from "./types";
export type { DataTableSearchInputProps } from "./context";

type ControlledServerState = DataTableUrlState &
  Partial<Pick<DataTableState, "rowSelection" | "expanded">>;

interface DataTableBaseProps<TData extends {}>
  extends Omit<TableRootProps<TData>, "table"> {
  data: TData[];
  columns: ColumnDef<TData>[];
  variant?: "primary" | "secondary";

  initialState?: Partial<DataTableState>;
  getRowId?: TableOptions<TData>["getRowId"];

  /** @deprecated Prefer `serverSide`, `rowCount`, `state`, and `onStateChange`. */
  pageCount?: number;
  /** @deprecated Prefer `state.pagination`. */
  pagination?: PaginationState;
  /** @deprecated Prefer `onStateChange`. */
  onPaginationChange?: OnChangeFn<PaginationState>;
  /** @deprecated Prefer `state.sorting`. */
  sorting?: SortingState;
  /** @deprecated Prefer `onStateChange`. */
  onSortingChange?: OnChangeFn<SortingState>;
  /** @deprecated Prefer `state.columnFilters`. */
  columnFilters?: ColumnFiltersState;
  /** @deprecated Prefer `onStateChange`. */
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  /** @deprecated Prefer `state.globalFilter`. */
  globalFilter?: string;
  /** @deprecated Prefer `onStateChange`. */
  onGlobalFilterChange?: OnChangeFn<string>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  expanded?: ExpandedState;
  onExpandedChange?: OnChangeFn<ExpandedState>;

  toolbarChildren?: React.ReactNode;
  renderContextMenu?: (row: Row<TData>) => React.ReactNode;
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode;
  bulkActions?: (table: TanstackTable<TData>) => React.ReactNode;
  searchInputProps?: DataTableSearchInputProps;
  searchDebounceMs?: number;
  visibility?: Partial<DataTableVisibility>;
  /** @deprecated Prefer `visibility={{ toolbar: false }}`. */
  hideToolbar?: boolean;
}

type ClientDataTableProps = {
  serverSide?: false;
  rowCount?: number;
  state?: Partial<DataTableState>;
  onStateChange?: OnChangeFn<DataTableState>;
};

type ServerDataTableProps = {
  serverSide: true;
  rowCount: number;
  state: ControlledServerState;
  onStateChange: OnChangeFn<DataTableState>;
};

export type DataTableProps<TData extends {}> = DataTableBaseProps<TData> &
  (ClientDataTableProps | ServerDataTableProps);

type StatePatch = Partial<DataTableState>;

export function DataTable<TData extends {}>(props: DataTableProps<TData>) {
  const {
    data,
    columns,
    state: controlledState,
    initialState,
    onStateChange,
    serverSide = false,
    rowCount,
    pageCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    columnFilters,
    onColumnFiltersChange,
    globalFilter,
    onGlobalFilterChange,
    columnVisibility,
    onColumnVisibilityChange,
    rowSelection,
    onRowSelectionChange,
    expanded,
    onExpandedChange,
    getRowId,
    isLoading,
    toolbarChildren,
    density = "default",
    renderContextMenu,
    renderExpandedRow,
    bulkActions,
    variant = "primary",
    searchInputProps,
    searchDebounceMs = 300,
    visibility,
    hideToolbar = false,
    ...tableProps
  } = props;

  const [internalState, setInternalState] = React.useState<DataTableState>(() => ({
    ...defaultDataTableState,
    ...initialState,
    pagination: {
      ...defaultDataTableState.pagination,
      ...initialState?.pagination,
    },
    sorting: initialState?.sorting ?? [],
    columnFilters: initialState?.columnFilters ?? [],
    globalFilter: initialState?.globalFilter ?? "",
    columnVisibility: initialState?.columnVisibility ?? {},
    rowSelection: initialState?.rowSelection ?? {},
    expanded: initialState?.expanded ?? {},
  }));

  const resolvedState: DataTableState = {
    pagination:
      controlledState?.pagination ?? pagination ?? internalState.pagination,
    sorting: controlledState?.sorting ?? sorting ?? internalState.sorting,
    columnFilters:
      controlledState?.columnFilters ??
      columnFilters ??
      internalState.columnFilters,
    globalFilter:
      controlledState?.globalFilter ??
      globalFilter ??
      internalState.globalFilter,
    columnVisibility:
      controlledState?.columnVisibility ??
      columnVisibility ??
      internalState.columnVisibility,
    rowSelection:
      controlledState?.rowSelection ??
      rowSelection ??
      internalState.rowSelection,
    expanded:
      controlledState?.expanded ?? expanded ?? internalState.expanded,
  };

  const unifiedControls = {
    pagination: controlledState?.pagination !== undefined,
    sorting: controlledState?.sorting !== undefined,
    columnFilters: controlledState?.columnFilters !== undefined,
    globalFilter: controlledState?.globalFilter !== undefined,
    columnVisibility: controlledState?.columnVisibility !== undefined,
    rowSelection: controlledState?.rowSelection !== undefined,
    expanded: controlledState?.expanded !== undefined,
  };
  const legacyControls = {
    pagination: pagination !== undefined,
    sorting: sorting !== undefined,
    columnFilters: columnFilters !== undefined,
    globalFilter: globalFilter !== undefined,
    columnVisibility: columnVisibility !== undefined,
    rowSelection: rowSelection !== undefined,
    expanded: expanded !== undefined,
  };

  const commitState = (patch: StatePatch) => {
    const nextState: DataTableState = { ...resolvedState, ...patch };
    setInternalState(previous => ({
      pagination:
        unifiedControls.pagination || legacyControls.pagination
          ? previous.pagination
          : patch.pagination ?? previous.pagination,
      sorting:
        unifiedControls.sorting || legacyControls.sorting
          ? previous.sorting
          : patch.sorting ?? previous.sorting,
      columnFilters:
        unifiedControls.columnFilters || legacyControls.columnFilters
          ? previous.columnFilters
          : patch.columnFilters ?? previous.columnFilters,
      globalFilter:
        unifiedControls.globalFilter || legacyControls.globalFilter
          ? previous.globalFilter
          : patch.globalFilter ?? previous.globalFilter,
      columnVisibility:
        unifiedControls.columnVisibility || legacyControls.columnVisibility
          ? previous.columnVisibility
          : patch.columnVisibility ?? previous.columnVisibility,
      rowSelection:
        unifiedControls.rowSelection || legacyControls.rowSelection
          ? previous.rowSelection
          : patch.rowSelection ?? previous.rowSelection,
      expanded:
        unifiedControls.expanded || legacyControls.expanded
          ? previous.expanded
          : patch.expanded ?? previous.expanded,
    }));
    onStateChange?.(nextState);
    return nextState;
  };

  const resetPage = () =>
    resolvedState.pagination.pageIndex === 0
      ? resolvedState.pagination
      : { ...resolvedState.pagination, pageIndex: 0 };

  const notifyLegacyPaginationReset = (nextPagination: PaginationState) => {
    if (
      nextPagination !== resolvedState.pagination &&
      !unifiedControls.pagination
    ) {
      onPaginationChange?.(nextPagination);
    }
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = updater => {
    const next = functionalUpdate(updater, resolvedState.pagination);
    commitState({ pagination: next });
    if (!unifiedControls.pagination) onPaginationChange?.(next);
  };
  const handleSortingChange: OnChangeFn<SortingState> = updater => {
    const next = functionalUpdate(updater, resolvedState.sorting);
    const nextPagination = resetPage();
    commitState({ sorting: next, pagination: nextPagination });
    if (!unifiedControls.sorting) onSortingChange?.(next);
    notifyLegacyPaginationReset(nextPagination);
  };
  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = updater => {
    const next = functionalUpdate(updater, resolvedState.columnFilters);
    const nextPagination = resetPage();
    commitState({ columnFilters: next, pagination: nextPagination });
    if (!unifiedControls.columnFilters) onColumnFiltersChange?.(next);
    notifyLegacyPaginationReset(nextPagination);
  };
  const handleGlobalFilterChange: OnChangeFn<string> = updater => {
    const next = functionalUpdate(updater, resolvedState.globalFilter);
    const nextPagination = resetPage();
    commitState({ globalFilter: next, pagination: nextPagination });
    if (!unifiedControls.globalFilter) onGlobalFilterChange?.(next);
    notifyLegacyPaginationReset(nextPagination);
  };
  const handleColumnVisibilityChange: OnChangeFn<VisibilityState> = updater => {
    const next = functionalUpdate(updater, resolvedState.columnVisibility);
    commitState({ columnVisibility: next });
    if (!unifiedControls.columnVisibility) onColumnVisibilityChange?.(next);
  };
  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = updater => {
    const next = functionalUpdate(updater, resolvedState.rowSelection);
    commitState({ rowSelection: next });
    if (!unifiedControls.rowSelection) onRowSelectionChange?.(next);
  };
  const handleExpandedChange: OnChangeFn<ExpandedState> = updater => {
    const next = functionalUpdate(updater, resolvedState.expanded);
    commitState({ expanded: next });
    if (!unifiedControls.expanded) onExpandedChange?.(next);
  };

  const resetFilters = () => {
    const nextPagination = resetPage();
    commitState({
      columnFilters: [],
      globalFilter: "",
      pagination: nextPagination,
    });
    if (!unifiedControls.columnFilters) onColumnFiltersChange?.([]);
    if (!unifiedControls.globalFilter) onGlobalFilterChange?.("");
    notifyLegacyPaginationReset(nextPagination);
  };

  const legacyManualPagination = !serverSide && !!onPaginationChange;
  const legacyManualSorting = !serverSide && !!onSortingChange;
  const legacyManualFiltering =
    !serverSide && (!!onColumnFiltersChange || !!onGlobalFilterChange);
  const manualPagination = serverSide || legacyManualPagination;
  const manualSorting = serverSide || legacyManualSorting;
  const manualFiltering = serverSide || legacyManualFiltering;
  const preparedColumns = React.useMemo(
    () => prepareDataTableColumns(columns),
    [columns],
  );

  const table = useReactTable({
    data,
    columns: preparedColumns,
    state: resolvedState,
    rowCount: manualPagination ? rowCount : undefined,
    pageCount:
      manualPagination && rowCount === undefined ? pageCount : undefined,
    getRowId,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onRowSelectionChange: handleRowSelectionChange,
    onExpandedChange: handleExpandedChange,
    manualPagination,
    manualSorting,
    manualFiltering,
    autoResetPageIndex: false,
    getRowCanExpand: renderExpandedRow ? () => true : undefined,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: advancedGlobalFilterFn,
    defaultColumn: {
      filterFn: advancedFilterFn,
    },
  });

  const resolvedVisibility: DataTableVisibility = {
    ...defaultDataTableVisibility,
    ...visibility,
    toolbar: hideToolbar
      ? false
      : (visibility?.toolbar ?? defaultDataTableVisibility.toolbar),
  };

  return (
    <DataTableContext.Provider
      value={{
        table,
        searchInputProps,
        visibility: resolvedVisibility,
        searchDebounceMs,
        rowCount,
        serverSide,
        resetFilters,
      }}
    >
      <div className="flex w-full flex-col space-y-4">
        <DataTableToolbar bulkActions={bulkActions}>
          {toolbarChildren}
        </DataTableToolbar>
        <Table
          variant={variant}
          table={table}
          density={density}
          renderContextMenu={renderContextMenu}
          renderExpandedRow={renderExpandedRow}
          isLoading={isLoading}
          {...tableProps}
        />
        <DataTablePagination />
      </div>
    </DataTableContext.Provider>
  );
}
