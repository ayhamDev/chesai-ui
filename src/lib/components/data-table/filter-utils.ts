import type {
  Column,
  ColumnDef,
  FilterFn,
  Row,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

export type DataTableFilterVariant =
  | "text"
  | "number"
  | "date"
  | "select"
  | "multi-select"
  | "custom";

export type FilterOperator =
  | "contains"
  | "notContains"
  | "eq"
  | "neq"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "startsWith"
  | "endsWith"
  | "in"
  | "notIn";

export type DataTableFilterScalar = string | number | boolean | Date;
export type DataTableFilterInput =
  | DataTableFilterScalar
  | DataTableFilterScalar[];

export interface AdvancedFilterValue {
  operator: FilterOperator;
  value: DataTableFilterInput;
}

export interface DataTableFilterOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

export interface DataTableFilterEditorProps<TData> {
  column: Column<TData, unknown>;
  operator: FilterOperator;
  value: DataTableFilterInput;
  onOperatorChange: (operator: FilterOperator) => void;
  onValueChange: (value: DataTableFilterInput) => void;
  onClear: () => void;
}

export interface DataTableColumnFilterConfig<TData> {
  variant?: DataTableFilterVariant;
  label?: string;
  placeholder?: string;
  options?: DataTableFilterOption[];
  operators?: FilterOperator[];
  defaultOperator?: FilterOperator;
  getValue?: (row: TData) => unknown;
  renderEditor?: (props: DataTableFilterEditorProps<TData>) => ReactNode;
  parse?: (values: string[]) => DataTableFilterInput | undefined;
  serialize?: (value: DataTableFilterInput) => string[];
}

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    /** @deprecated Use `filter.variant` instead. */
    filterType?: "text" | "number" | "date" | "select";
    filter?: DataTableColumnFilterConfig<TData>;
  }
}

export const FILTER_OPERATORS: Record<
  Exclude<DataTableFilterVariant, "custom">,
  FilterOperator[]
> = {
  text: [
    "contains",
    "notContains",
    "eq",
    "neq",
    "startsWith",
    "endsWith",
  ],
  number: ["eq", "neq", "gt", "gte", "lt", "lte"],
  date: ["eq", "neq", "gt", "gte", "lt", "lte"],
  select: ["eq", "neq"],
  "multi-select": ["in", "notIn"],
};

export const FILTER_OPERATOR_LABELS: Record<FilterOperator, string> = {
  contains: "Contains",
  notContains: "Does not contain",
  eq: "Equals",
  neq: "Not equals",
  gt: "Greater than",
  gte: "Greater than or equal",
  lt: "Less than",
  lte: "Less than or equal",
  startsWith: "Starts with",
  endsWith: "Ends with",
  in: "Is any of",
  notIn: "Is none of",
};

export function getColumnFilterConfig<TData>(
  column: Column<TData, unknown>,
): DataTableColumnFilterConfig<TData> & { variant: DataTableFilterVariant } {
  const configured = column.columnDef.meta?.filter;
  const legacyType = column.columnDef.meta?.filterType;
  const firstValue = column.getFacetedRowModel().rows[0]?.getValue(column.id);
  const inferredVariant =
    legacyType ?? (typeof firstValue === "number" ? "number" : "text");

  return {
    ...configured,
    variant: configured?.variant ?? inferredVariant,
  };
}

export function getFilterOperators<TData>(
  column: Column<TData, unknown>,
): FilterOperator[] {
  const config = getColumnFilterConfig(column);
  if (config.operators?.length) return config.operators;
  if (config.variant === "custom") {
    return config.defaultOperator ? [config.defaultOperator] : ["eq"];
  }
  return FILTER_OPERATORS[config.variant];
}

export function getDefaultFilterOperator<TData>(
  column: Column<TData, unknown>,
): FilterOperator {
  const config = getColumnFilterConfig(column);
  const operators = getFilterOperators(column);
  return config.defaultOperator && operators.includes(config.defaultOperator)
    ? config.defaultOperator
    : operators[0];
}

export function normalizeFilterValue<TData>(
  rawValue: unknown,
  column: Column<TData, unknown>,
): AdvancedFilterValue {
  if (
    rawValue &&
    typeof rawValue === "object" &&
    !Array.isArray(rawValue) &&
    "operator" in rawValue &&
    "value" in rawValue
  ) {
    return rawValue as AdvancedFilterValue;
  }

  return {
    operator: Array.isArray(rawValue)
      ? "in"
      : getDefaultFilterOperator(column),
    value: (rawValue ?? "") as DataTableFilterInput,
  };
}

export function hasFilterValue(value: unknown): boolean {
  const normalized =
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "value" in value
      ? (value as { value: unknown }).value
      : value;

  if (Array.isArray(normalized)) return normalized.length > 0;
  return normalized !== undefined && normalized !== null && normalized !== "";
}

export function getFilterRowValue<TData>(
  row: Row<TData>,
  columnId: string,
): unknown {
  const column = row
    .getAllCells()
    .find(cell => cell.column.id === columnId)?.column;
  const getValue = column?.columnDef.meta?.filter?.getValue;
  return getValue ? getValue(row.original) : row.getValue(columnId);
}

export function prepareDataTableColumns<TData>(
  columns: ColumnDef<TData>[],
): ColumnDef<TData>[] {
  return columns.map(column => {
    const definition = column as ColumnDef<TData> & {
      accessorKey?: string;
      accessorFn?: (row: TData, index: number) => unknown;
      columns?: ColumnDef<TData>[];
    };
    if (definition.columns?.length) {
      return {
        ...definition,
        columns: prepareDataTableColumns(definition.columns),
      } as ColumnDef<TData>;
    }

    const getValue = definition.meta?.filter?.getValue;
    if (!definition.accessorKey && !definition.accessorFn && getValue) {
      return {
        ...definition,
        accessorFn: (row: TData) => getValue(row),
      } as ColumnDef<TData>;
    }
    return column;
  });
}

function toComparable(value: unknown, variant: DataTableFilterVariant) {
  if (variant === "number") {
    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
  }
  if (variant === "date") {
    const timestamp =
      value instanceof Date ? value.getTime() : new Date(String(value)).getTime();
    return Number.isFinite(timestamp) ? timestamp : undefined;
  }
  return String(value).toLocaleLowerCase();
}

function equals(
  rowValue: unknown,
  filterValue: unknown,
  variant: DataTableFilterVariant,
) {
  const left = toComparable(rowValue, variant);
  const right = toComparable(filterValue, variant);
  return left !== undefined && right !== undefined && left === right;
}

// biome-ignore lint/suspicious/noExplicitAny: The exported filter is intentionally reusable for every row shape.
export const advancedFilterFn: FilterFn<any> = (
  row,
  columnId,
  rawFilterValue,
) => {
  const column = row
    .getAllCells()
    .find(cell => cell.column.id === columnId)?.column;
  if (!column) return true;

  const config = getColumnFilterConfig(column);
  const { operator, value } = normalizeFilterValue(rawFilterValue, column);
  if (!hasFilterValue(value)) return true;

  const rowValue = getFilterRowValue(row, columnId);
  if (rowValue === null || rowValue === undefined) return false;

  const rowString = String(rowValue).toLocaleLowerCase();
  const valueString = String(value).toLocaleLowerCase();
  const rowComparable = toComparable(rowValue, config.variant);
  const valueComparable = toComparable(value, config.variant);

  switch (operator) {
    case "contains":
      return rowString.includes(valueString);
    case "notContains":
      return !rowString.includes(valueString);
    case "startsWith":
      return rowString.startsWith(valueString);
    case "endsWith":
      return rowString.endsWith(valueString);
    case "eq":
      return equals(rowValue, value, config.variant);
    case "neq":
      return !equals(rowValue, value, config.variant);
    case "gt":
      return (
        rowComparable !== undefined &&
        valueComparable !== undefined &&
        rowComparable > valueComparable
      );
    case "gte":
      return (
        rowComparable !== undefined &&
        valueComparable !== undefined &&
        rowComparable >= valueComparable
      );
    case "lt":
      return (
        rowComparable !== undefined &&
        valueComparable !== undefined &&
        rowComparable < valueComparable
      );
    case "lte":
      return (
        rowComparable !== undefined &&
        valueComparable !== undefined &&
        rowComparable <= valueComparable
      );
    case "in":
    case "notIn": {
      const values = Array.isArray(value) ? value : [value];
      const rowValues = Array.isArray(rowValue) ? rowValue : [rowValue];
      const matches = rowValues.some(candidate =>
        values.some(selected => equals(candidate, selected, config.variant)),
      );
      return operator === "in" ? matches : !matches;
    }
    default:
      return true;
  }
};

// biome-ignore lint/suspicious/noExplicitAny: The exported filter is intentionally reusable for every row shape.
export const advancedGlobalFilterFn: FilterFn<any> = (
  row,
  columnId,
  filterValue,
) => {
  if (!hasFilterValue(filterValue)) return true;
  const rowValue = getFilterRowValue(row, columnId);
  if (rowValue === null || rowValue === undefined) return false;
  const values = Array.isArray(rowValue) ? rowValue : [rowValue];
  const search = String(filterValue).toLocaleLowerCase();
  return values.some(value =>
    String(value).toLocaleLowerCase().includes(search),
  );
};
