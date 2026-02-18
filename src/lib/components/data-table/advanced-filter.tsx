"use client";

import { type Table } from "@tanstack/react-table";
import { useDebounce } from "@uidotdev/usehooks";
import { Filter, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../badge";
import { Button } from "../button";
import { Dialog, DialogContent, DialogTrigger } from "../dialog";
import { Input } from "../input";
import { Select } from "../select"; // FIX: Imported as Select
import { Typography } from "../typography";
import { type AdvancedFilterValue, type FilterOperator } from "./filter-utils";

interface DataTableAdvancedFilterProps<TData> {
  table: Table<TData>;
}

const operators: { value: FilterOperator; label: string }[] = [
  { value: "contains", label: "Contains" },
  { value: "notContains", label: "Does not contain" },
  { value: "eq", label: "Equals" },
  { value: "neq", label: "Not Equals" },
  { value: "gt", label: "Greater than" },
  { value: "lt", label: "Less than" },
  { value: "gte", label: "GTE" },
  { value: "lte", label: "LTE" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
];

const getColumnLabel = (column: any) => {
  const header = column.columnDef.header;
  if (typeof header === "string") {
    return header;
  }
  return column.id.charAt(0).toUpperCase() + column.id.slice(1);
};

const AdvancedFilterRow = ({
  filter,
  table,
  columns,
  removeFilter,
}: {
  filter: any;
  table: Table<any>;
  columns: any[];
  removeFilter: (id: string) => void;
}) => {
  const column = table.getColumn(filter.id);
  const rawValue = filter.value;

  const initialFilterValue =
    typeof rawValue === "object" && rawValue !== null && "operator" in rawValue
      ? (rawValue as AdvancedFilterValue)
      : {
          operator: "contains" as FilterOperator,
          value: String(rawValue ?? ""),
        };

  const [localValue, setLocalValue] = useState<string>(
    String(initialFilterValue.value),
  );
  const debouncedValue = useDebounce(localValue, 400);

  useEffect(() => {
    if (String(initialFilterValue.value) !== debouncedValue) {
      table.getColumn(filter.id)?.setFilterValue({
        ...initialFilterValue,
        value: debouncedValue,
      });
    }
  }, [debouncedValue, filter.id, initialFilterValue.operator, table]);

  if (!column) return null;

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg  border border-outline-variant/50">
      <div className="w-[120px] flex-shrink-0">
        <Select
          size="sm"
          variant="flat" // Updated variant
          position="item-aligned"
          value={filter.id}
          onValueChange={(newId) => {
            if (newId !== filter.id) {
              removeFilter(filter.id);
              table.getColumn(newId)?.setFilterValue(initialFilterValue);
            }
          }}
          items={columns.map((col) => ({
            value: col.id,
            label: getColumnLabel(col),
            disabled:
              table.getState().columnFilters.some((f) => f.id === col.id) &&
              col.id !== filter.id,
          }))}
        />
      </div>
      <div className="w-[180px] flex-shrink-0">
        <Select
          size="sm"
          position="item-aligned"
          variant="flat" // Updated variant
          value={initialFilterValue.operator}
          onValueChange={(val) => {
            table.getColumn(filter.id)?.setFilterValue({
              ...initialFilterValue,
              operator: val,
            });
          }}
          items={operators}
        />
      </div>
      <div className="flex-1 min-w-0">
        <Input
          size="sm"
          variant="flat" // Updated variant
          placeholder="Value..."
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-error hover:text-error hover:bg-error/10"
        onClick={() => removeFilter(filter.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export function DataTableAdvancedFilter<TData>({
  table,
}: DataTableAdvancedFilterProps<TData>) {
  const [open, setOpen] = useState(false);
  const columns = table
    .getAllColumns()
    .filter((column) => column.getCanFilter());

  const activeFilters = table.getState().columnFilters;

  const removeFilter = (columnId: string) => {
    table.getColumn(columnId)?.setFilterValue(undefined);
  };

  const addFilter = () => {
    const unusedColumn = columns.find(
      (col) => !activeFilters.find((f) => f.id === col.id),
    );
    if (unusedColumn) {
      unusedColumn.setFilterValue({ operator: "contains", value: "" });
    }
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
              className="ml-2 px-1 h-5 text-[10px]"
            >
              {activeFilters.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent variant="surface" className="max-w-[600px]!">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="body-small" className="font-semibold">
            Filters
          </Typography>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
          {activeFilters.length === 0 ? (
            <div className="py-8 text-center text-on-surface-variant/50 text-sm border-2 border-dashed border-outline-variant rounded-lg">
              No active filters
            </div>
          ) : (
            activeFilters.map((filter) => (
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
