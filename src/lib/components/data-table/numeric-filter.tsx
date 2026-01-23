"use client";

import { type Column } from "@tanstack/react-table";
import { Filter } from "lucide-react";
import { useState } from "react";
import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { Input } from "../input";
import { Select } from "../select"; // FIX: Imported as Select

interface DataTableNumericFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
}

export type NumericFilterValue = {
  operator: "eq" | "neq" | "lt" | "gt";
  value: number | string;
};

export function DataTableNumericFilter<TData, TValue>({
  column,
  title,
}: DataTableNumericFilterProps<TData, TValue>) {
  const filterValue = (column?.getFilterValue() as NumericFilterValue) || {
    operator: "eq",
    value: "",
  };

  const [operator, setOperator] = useState<string>(filterValue.operator);
  const [value, setValue] = useState<string>(String(filterValue.value || ""));

  const applyFilter = () => {
    if (value === "") {
      column?.setFilterValue(undefined);
    } else {
      column?.setFilterValue({ operator, value: Number(value) });
    }
  };

  const clearFilter = () => {
    setValue("");
    setOperator("eq");
    column?.setFilterValue(undefined);
  };

  const isActive = !!column?.getFilterValue();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size="sm"
          className="h-8 data-[state=open]:bg-graphite-secondary"
        >
          <Filter className="mr-2 h-3.5 w-3.5" />
          {title}
          {isActive && (
            <span className="ml-2 rounded-full bg-graphite-primary h-2 w-2" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px] p-3">
        <DropdownMenuLabel>Filter {title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-3 my-2">
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
            type="number"
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
        <div className="flex justify-between mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilter}
            disabled={!isActive && value === ""}
          >
            Clear
          </Button>
          <Button variant="primary" size="sm" onClick={applyFilter}>
            Apply
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
