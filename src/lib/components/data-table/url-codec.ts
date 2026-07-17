import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import {
  FILTER_OPERATORS,
  type AdvancedFilterValue,
  type DataTableColumnFilterConfig,
  type DataTableFilterInput,
  type DataTableFilterVariant,
  type FilterOperator,
} from "./filter-utils";
import {
  defaultDataTableState,
  type DataTableUrlState,
} from "./types";

interface ColumnCodecDefinition<TData> {
  id: string;
  filter?: DataTableColumnFilterConfig<TData>;
  canFilter: boolean;
  canHide: boolean;
  canSort: boolean;
}

export interface DataTableUrlCodecOptions<TData> {
  columns: ColumnDef<TData>[];
  namespace?: string;
  defaults?: Partial<DataTableUrlState>;
}

export interface DataTableUrlCodec {
  parse: (searchParams: URLSearchParams) => DataTableUrlState;
  write: (
    searchParams: URLSearchParams,
    state: DataTableUrlState,
  ) => URLSearchParams;
}

function flattenColumns<TData>(
  columns: ColumnDef<TData>[],
): ColumnCodecDefinition<TData>[] {
  const result: ColumnCodecDefinition<TData>[] = [];

  for (const column of columns) {
    const definition = column as ColumnDef<TData> & {
      accessorKey?: string;
      columns?: ColumnDef<TData>[];
    };
    if (definition.columns?.length) {
      result.push(...flattenColumns(definition.columns));
      continue;
    }

    const id =
      definition.id ??
      (typeof definition.accessorKey === "string"
        ? definition.accessorKey
        : undefined);
    if (!id) continue;
    const hasAccessor =
      !!definition.accessorKey ||
      "accessorFn" in definition ||
      !!definition.meta?.filter?.getValue;

    result.push({
      id,
      filter: definition.meta?.filter ?? (
        definition.meta?.filterType
          ? { variant: definition.meta.filterType }
          : undefined
      ),
      canFilter: definition.enableColumnFilter !== false && hasAccessor,
      canHide: definition.enableHiding !== false,
      canSort: definition.enableSorting !== false && hasAccessor,
    });
  }

  return result;
}

function filterVariant<TData>(
  column: ColumnCodecDefinition<TData>,
): DataTableFilterVariant {
  return column.filter?.variant ?? "text";
}

function allowedOperators<TData>(
  column: ColumnCodecDefinition<TData>,
): FilterOperator[] {
  if (column.filter?.operators?.length) return column.filter.operators;
  const variant = filterVariant(column);
  if (variant === "custom") {
    return column.filter?.defaultOperator
      ? [column.filter.defaultOperator]
      : ["eq"];
  }
  return FILTER_OPERATORS[variant];
}

function defaultOperator<TData>(
  column: ColumnCodecDefinition<TData>,
): FilterOperator {
  const operators = allowedOperators(column);
  return column.filter?.defaultOperator &&
    operators.includes(column.filter.defaultOperator)
    ? column.filter.defaultOperator
    : operators[0];
}

function parseValues<TData>(
  values: string[],
  column: ColumnCodecDefinition<TData>,
): DataTableFilterInput | undefined {
  if (!values.length) return undefined;
  const config = column.filter;
  if (config?.parse) return config.parse(values);

  const variant = filterVariant(column);
  if (variant === "number") {
    const value = Number(values[0]);
    return Number.isFinite(value) ? value : undefined;
  }
  if (variant === "date") {
    return Number.isFinite(new Date(values[0]).getTime())
      ? values[0]
      : undefined;
  }
  if (variant === "select" || variant === "multi-select") {
    const parsed = values
      .map(value =>
        config?.options?.find(option => String(option.value) === value),
      )
      .filter(
        (
          option,
        ): option is NonNullable<
          DataTableColumnFilterConfig<TData>["options"]
        >[number] => !!option,
      )
      .map(option => option.value);
    if (!parsed.length) return undefined;
    return variant === "multi-select" ? parsed : parsed[0];
  }
  return values[0];
}

function serializeValues<TData>(
  value: DataTableFilterInput,
  column: ColumnCodecDefinition<TData>,
) {
  if (column.filter?.serialize) return column.filter.serialize(value);
  const values = Array.isArray(value) ? value : [value];
  return values.map(item =>
    item instanceof Date ? item.toISOString() : String(item),
  );
}

function mergeDefaults(
  defaults?: Partial<DataTableUrlState>,
): DataTableUrlState {
  return {
    pagination: {
      ...defaultDataTableState.pagination,
      ...defaults?.pagination,
    },
    sorting: defaults?.sorting ?? defaultDataTableState.sorting,
    columnFilters:
      defaults?.columnFilters ?? defaultDataTableState.columnFilters,
    globalFilter: defaults?.globalFilter ?? defaultDataTableState.globalFilter,
    columnVisibility: {
      ...defaultDataTableState.columnVisibility,
      ...defaults?.columnVisibility,
    },
  };
}

function cloneVisibility(visibility: VisibilityState): VisibilityState {
  return { ...visibility };
}

export function createDataTableUrlCodec<TData>({
  columns,
  namespace = "table",
  defaults: partialDefaults,
}: DataTableUrlCodecOptions<TData>): DataTableUrlCodec {
  const definitions = flattenColumns(columns);
  const byId = new Map(definitions.map(column => [column.id, column]));
  const defaults = mergeDefaults(partialDefaults);
  const key = (suffix: string) => `${namespace}.${suffix}`;

  return {
    parse(searchParams) {
      const page = Number(searchParams.get(key("page")));
      const pageSize = Number(searchParams.get(key("pageSize")));
      const pagination = {
        pageIndex:
          Number.isInteger(page) && page > 0
            ? page - 1
            : defaults.pagination.pageIndex,
        pageSize:
          Number.isInteger(pageSize) && pageSize > 0
            ? pageSize
            : defaults.pagination.pageSize,
      };

      const sorting = searchParams
        .getAll(key("sort"))
        .map(sort => {
          const directionSeparator = sort.lastIndexOf(":");
          if (directionSeparator < 1) return undefined;
          const id = sort.slice(0, directionSeparator);
          const direction = sort.slice(directionSeparator + 1);
          const column = byId.get(id);
          if (
            !column?.canSort ||
            (direction !== "asc" && direction !== "desc")
          ) {
            return undefined;
          }
          return { id, desc: direction === "desc" };
        })
        .filter((sort): sort is { id: string; desc: boolean } => !!sort);

      const columnFilters = definitions.flatMap(column => {
        if (!column.canFilter) return [];
        const operatorKey = key(`filter.${column.id}.operator`);
        const valueKey = key(`filter.${column.id}.value`);
        const operator =
          (searchParams.get(operatorKey) as FilterOperator | null) ??
          defaultOperator(column);
        if (!allowedOperators(column).includes(operator)) return [];
        const value = parseValues(searchParams.getAll(valueKey), column);
        if (
          value === undefined ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          return [];
        }
        return [{ id: column.id, value: { operator, value } }];
      });

      const columnVisibility = cloneVisibility(defaults.columnVisibility);
      for (const id of searchParams.getAll(key("hidden"))) {
        if (byId.get(id)?.canHide) columnVisibility[id] = false;
      }
      for (const id of searchParams.getAll(key("visible"))) {
        if (byId.get(id)?.canHide) columnVisibility[id] = true;
      }

      return {
        pagination,
        sorting: sorting.length ? sorting : defaults.sorting,
        columnFilters: columnFilters.length
          ? columnFilters
          : defaults.columnFilters,
        globalFilter:
          searchParams.get(key("search")) ?? defaults.globalFilter,
        columnVisibility,
      };
    },

    write(searchParams, state) {
      const next = new URLSearchParams(searchParams);
      const ownedPrefix = `${namespace}.`;
      for (const existingKey of Array.from(next.keys())) {
        if (existingKey.startsWith(ownedPrefix)) next.delete(existingKey);
      }

      if (state.pagination.pageIndex !== defaults.pagination.pageIndex) {
        next.set(key("page"), String(state.pagination.pageIndex + 1));
      }
      if (state.pagination.pageSize !== defaults.pagination.pageSize) {
        next.set(key("pageSize"), String(state.pagination.pageSize));
      }
      for (const sort of state.sorting) {
        if (byId.get(sort.id)?.canSort) {
          next.append(key("sort"), `${sort.id}:${sort.desc ? "desc" : "asc"}`);
        }
      }
      if (state.globalFilter && state.globalFilter !== defaults.globalFilter) {
        next.set(key("search"), state.globalFilter);
      }

      for (const filter of state.columnFilters) {
        const column = byId.get(filter.id);
        if (!column?.canFilter) continue;
        const normalized =
          filter.value &&
          typeof filter.value === "object" &&
          !Array.isArray(filter.value) &&
          "operator" in filter.value &&
          "value" in filter.value
            ? (filter.value as AdvancedFilterValue)
            : ({
                operator: Array.isArray(filter.value)
                  ? "in"
                  : defaultOperator(column),
                value: filter.value,
              } as AdvancedFilterValue);
        if (!allowedOperators(column).includes(normalized.operator)) continue;
        if (
          normalized.value === undefined ||
          normalized.value === null ||
          normalized.value === "" ||
          (Array.isArray(normalized.value) && normalized.value.length === 0)
        ) {
          continue;
        }
        const values = serializeValues(normalized.value, column);
        if (!values.length || values.every(value => value === "")) continue;
        next.set(
          key(`filter.${column.id}.operator`),
          normalized.operator,
        );
        for (const value of values) {
          next.append(key(`filter.${column.id}.value`), value);
        }
      }

      for (const column of definitions) {
        if (!column.canHide) continue;
        const current = state.columnVisibility[column.id] !== false;
        const defaultVisible =
          defaults.columnVisibility[column.id] !== false;
        if (current === defaultVisible) continue;
        next.append(key(current ? "visible" : "hidden"), column.id);
      }

      return next;
    },
  };
}
