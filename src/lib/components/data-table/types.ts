import type {
  ColumnFiltersState,
  ExpandedState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

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
  filters: boolean;
  reset: boolean;
  viewOptions: boolean;
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
  pagination: true,
  selectionSummary: true,
};
