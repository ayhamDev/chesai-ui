"use client";

import { type Column } from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "../button";
import { Input } from "../input";
import { Select } from "../select"; // FIX: Imported as Select
import { Typography } from "../typography";

export type NumericFilterValue = {
  operator: "eq" | "neq" | "lt" | "gt";
  value: number | string;
};

interface ColumnFilterDialogProps<TData, TValue> {
  column: Column<TData, TValue>;
  onClose: () => void;
}

export function ColumnFilterDialog<TData, TValue>({
  column,
  onClose,
}: ColumnFilterDialogProps<TData, TValue>) {
  const currentFilter = column.getFilterValue() as NumericFilterValue | string;
  const isNumeric =
    typeof currentFilter === "object" &&
    currentFilter !== null &&
    "operator" in currentFilter;

  const [operator, setOperator] = useState<string>(
    isNumeric ? (currentFilter as NumericFilterValue).operator : "eq"
  );
  const [value, setValue] = useState<string>(
    isNumeric
      ? String((currentFilter as NumericFilterValue).value || "")
      : String(currentFilter || "")
  );

  const applyFilter = () => {
    if (value === "") {
      column.setFilterValue(undefined);
    } else {
      column.setFilterValue({ operator, value: Number(value) });
    }
    onClose();
  };

  const clearFilter = () => {
    column.setFilterValue(undefined);
    onClose();
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <Typography variant="small" className="font-semibold">
          Filter by {column.id}
        </Typography>
        <div className="flex flex-col gap-4">
          <Select
            size="sm"
            variant="flat"
            value={operator}
            onValueChange={setOperator}
            items={[
              { value: "eq", label: "Equals (=)" },
              { value: "neq", label: "Not Equal (!=)" },
              { value: "lt", label: "Less Than (<)" },
              { value: "gt", label: "Greater Than (>)" },
            ]}
          />
          <Input
            size="sm"
            variant="flat"
            placeholder="Value..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilter();
            }}
          />
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={clearFilter}>
          Clear
        </Button>
        <Button variant="primary" size="sm" onClick={applyFilter}>
          Apply
        </Button>
      </div>
    </div>
  );
}
