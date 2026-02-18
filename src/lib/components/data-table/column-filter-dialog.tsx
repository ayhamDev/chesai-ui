"use client";

import { type Column } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { Button } from "../button";
import { Input } from "../input";
import { Select } from "../select";
import { Typography } from "../typography";
import { type FilterOperator, type AdvancedFilterValue } from "./filter-utils";

interface ColumnFilterDialogProps<TData, TValue> {
  column: Column<TData, TValue>;
  onClose: () => void;
}

const TEXT_OPERATORS = [
  { value: "contains", label: "Contains" },
  { value: "notContains", label: "Doesn't contain" },
  { value: "eq", label: "Equals" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
];

const NUMBER_OPERATORS = [
  { value: "eq", label: "Equals (=)" },
  { value: "neq", label: "Not Equals (≠)" },
  { value: "gt", label: "Greater Than (>)" },
  { value: "lt", label: "Less Than (<)" },
  { value: "gte", label: "Greater or Equal (≥)" },
  { value: "lte", label: "Less or Equal (≤)" },
];

export function ColumnFilterDialog<TData, TValue>({
  column,
  onClose,
}: ColumnFilterDialogProps<TData, TValue>) {
  // Infer type if not provided in meta
  const firstValue = column.getFacetedRowModel().rows[0]?.getValue(column.id);
  const inferredType = typeof firstValue === "number" ? "number" : "text";
  const type = column.columnDef.meta?.filterType || inferredType;

  const currentFilter = column.getFilterValue() as AdvancedFilterValue;

  const [operator, setOperator] = useState<string>(
    currentFilter?.operator || (type === "number" ? "gt" : "contains"),
  );
  const [value, setValue] = useState<string>(
    currentFilter?.value?.toString() || "",
  );

  const applyFilter = () => {
    if (value === "") {
      column.setFilterValue(undefined);
    } else {
      column.setFilterValue({
        operator: operator as FilterOperator,
        value: type === "number" ? Number(value) : value,
      });
    }
    onClose();
  };

  return (
    <div className="flex flex-col gap-4 p-4 min-w-[280px]">
      <div className="flex flex-col gap-1">
        <Typography
          variant="label-large"
          className="font-bold opacity-70 uppercase tracking-tighter"
        >
          Filter Column
        </Typography>
        <Typography variant="title-small" className="truncate">
          {typeof column.columnDef.header === "string"
            ? column.columnDef.header
            : column.id}
        </Typography>
      </div>

      <div className="flex flex-col gap-3">
        <Select
          size="sm"
          label="Condition"
          variant="flat"
          value={operator}
          onValueChange={setOperator}
          items={type === "number" ? NUMBER_OPERATORS : TEXT_OPERATORS}
        />
        <Input
          size="sm"
          label="Value"
          variant="flat"
          type={type === "number" ? "number" : "text"}
          placeholder="Type a value..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilter()}
        />
      </div>

      <div className="flex justify-between items-center mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            column.setFilterValue(undefined);
            onClose();
          }}
        >
          Clear
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={applyFilter}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
