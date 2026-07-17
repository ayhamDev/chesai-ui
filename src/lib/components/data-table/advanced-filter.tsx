"use client";

import type { Column, Table } from "@tanstack/react-table";
import { Filter, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "../badge";
import { Button } from "../button";
import { Dialog, DialogContent, DialogTrigger } from "../dialog";
import { Select } from "../select";
import { Typography } from "../typography";
import { DataTableFilterEditor } from "./filter-editor";
import {
  type AdvancedFilterValue,
  getColumnFilterConfig,
  getDefaultFilterOperator,
  normalizeFilterValue,
} from "./filter-utils";

interface DataTableAdvancedFilterProps<TData> {
  table: Table<TData>;
}

export function getDataTableColumnLabel<TData>(
  column: Column<TData, unknown>,
) {
  const configuredLabel = column.columnDef.meta?.filter?.label;
  if (configuredLabel) return configuredLabel;
  const header = column.columnDef.header;
  if (typeof header === "string") return header;
  return column.id.charAt(0).toUpperCase() + column.id.slice(1);
}

function createEmptyFilter<TData>(
  column: Column<TData, unknown>,
): AdvancedFilterValue {
  const config = getColumnFilterConfig(column);
  return {
    operator: getDefaultFilterOperator(column),
    value: config.variant === "multi-select" ? [] : "",
  };
}

function AdvancedFilterRow<TData>({
  filter,
  table,
  columns,
  removeFilter,
}: {
  filter: { id: string; value: unknown };
  table: Table<TData>;
  columns: Column<TData, unknown>[];
  removeFilter: (id: string) => void;
}) {
  const column = table.getColumn(filter.id);
  if (!column) return null;
  const normalized = normalizeFilterValue(
    filter.value,
    column as Column<TData, unknown>,
  );

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-outline-variant/50 p-2 sm:flex-row sm:items-start">
      <div className="w-full shrink-0 sm:w-[140px]">
        <Select
          size="sm"
          variant="filled"
          position="item-aligned"
          value={filter.id}
          onValueChange={newId => {
            if (newId === filter.id) return;
            const nextColumn = table.getColumn(newId);
            if (nextColumn) {
              table.setColumnFilters(current => [
                ...current.filter(
                  active =>
                    active.id !== filter.id && active.id !== newId,
                ),
                {
                  id: newId,
                  value: createEmptyFilter(
                    nextColumn as Column<TData, unknown>,
                  ),
                },
              ]);
            }
          }}
          items={columns.map(item => ({
            value: item.id,
            label: getDataTableColumnLabel(item),
            disabled:
              table
                .getState()
                .columnFilters.some(active => active.id === item.id) &&
              item.id !== filter.id,
          }))}
        />
      </div>

      <DataTableFilterEditor
        column={column as Column<TData, unknown>}
        filter={normalized}
        onChange={value => column.setFilterValue(value)}
        onClear={() => removeFilter(filter.id)}
      />

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 shrink-0 p-0 text-error hover:bg-error/10 hover:text-error"
        aria-label={`Remove ${getDataTableColumnLabel(column as Column<TData, unknown>)} filter`}
        onClick={() => removeFilter(filter.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function DataTableAdvancedFilter<TData>({
  table,
}: DataTableAdvancedFilterProps<TData>) {
  const [open, setOpen] = useState(false);
  const columns = table
    .getAllLeafColumns()
    .filter(column => column.getCanFilter()) as Column<TData, unknown>[];
  const activeFilters = table.getState().columnFilters;

  if (!columns.length) return null;

  const removeFilter = (columnId: string) => {
    table.getColumn(columnId)?.setFilterValue(undefined);
  };

  const addFilter = () => {
    const unusedColumn = columns.find(
      column => !activeFilters.some(filter => filter.id === column.id),
    );
    if (unusedColumn) unusedColumn.setFilterValue(createEmptyFilter(unusedColumn));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} variant="basic">
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="md"
          className="my-2"
          startIcon={<Filter className="h-3.5 w-3.5" />}
        >
          Filter
          {activeFilters.length > 0 && (
            <Badge
              variant="primary"
              shape="minimal"
              className="ml-2 h-5 px-1 text-[10px]"
            >
              {activeFilters.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent variant="surface" className="max-w-[760px]!">
        <div className="mb-4 flex items-center justify-between">
          <Typography variant="body-small" className="font-semibold">
            Filters
          </Typography>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex max-h-[360px] flex-col gap-3 overflow-y-auto">
          {activeFilters.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-outline-variant py-8 text-center text-sm text-on-surface-variant/50">
              No active filters
            </div>
          ) : (
            activeFilters.map(filter => (
              <AdvancedFilterRow
                key={filter.id}
                filter={filter}
                table={table}
                columns={columns}
                removeFilter={removeFilter}
              />
            ))
          )}
        </div>

        <div className="mt-4 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
            disabled={activeFilters.length === 0}
          >
            Clear all
          </Button>
          <Button
            variant="secondary"
            size="sm"
            startIcon={<Plus className="h-4 w-4" />}
            onClick={addFilter}
            disabled={activeFilters.length >= columns.length}
          >
            Add Filter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
