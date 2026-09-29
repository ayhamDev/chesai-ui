import type {
  ColumnFiltersState,
  ExpandedState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

export type DataTableMode = "pagination" | "infinite";

/** Cursor tokens and request cancellation remain owned by the data source. */
export interface DataTableInfiniteScroll {
  hasNextPage: boolean;
  onLoadMore: () => void | Promise<unknown>;
  isFetching?: boolean;
  /** Change when replacing the data source without changing table filters. */
  resetKey?: string | number;
  /** External query errors stop automatic loading until Retry is pressed. */
  error?: unknown;
}

/** Sequential navigation for APIs that cannot jump to arbitrary pages. */
export interface DataTableCursorPagination {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  isFetching?: boolean;
}

export interface DataTableState {
  pagination: PaginationState;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  expanded: ExpandedState;
}

export type DataTableUrlState = Pick<
  DataTableState,
  | "pagination"
  | "sorting"
  | "columnFilters"
  | "globalFilter"
  | "columnVisibility"
>;

export interface DataTableVisibility {
  toolbar: boolean;
  search: boolean;
  /** Show the filter builder, column-menu filter actions and header filter indicators. Does not disable filtering. */
  filters: boolean;
  reset: boolean;
  /** Show the column visibility menu. Hiding this also removes header Hide Column actions. */
  viewOptions: boolean;
  export: boolean;
  pagination: boolean;
  selectionSummary: boolean;
}

export const defaultDataTableState: DataTableState = {
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  sorting: [],
  columnFilters: [],
  globalFilter: "",
  columnVisibility: {},
  rowSelection: {},
  expanded: {},
};

export const defaultDataTableVisibility: DataTableVisibility = {
  toolbar: true,
  search: true,
  filters: true,
  reset: true,
  viewOptions: true,
  export: true,
  pagination: true,
  selectionSummary: true,
};
