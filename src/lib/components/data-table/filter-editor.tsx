"use client";

import type { Column } from "@tanstack/react-table";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../button";
import { Input } from "../input";
import { Select } from "../select";
import {
  FILTER_OPERATOR_LABELS,
  type AdvancedFilterValue,
  type DataTableFilterInput,
  type FilterOperator,
  getColumnFilterConfig,
  getFilterOperators,
} from "./filter-utils";

export interface DataTableFilterEditorComponentProps<TData> {
  column: Column<TData, unknown>;
  filter: AdvancedFilterValue;
  onChange: (filter: AdvancedFilterValue) => void;
  onClear: () => void;
}

function stringifyValue(value: DataTableFilterInput) {
  if (Array.isArray(value)) return value.map(String);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "");
}

export function DataTableFilterEditor<TData>({
  column,
  filter,
  onChange,
  onClear,
}: DataTableFilterEditorComponentProps<TData>) {
  const config = getColumnFilterConfig(column);
  const operators = getFilterOperators(column);
  const operator = operators.includes(filter.operator)
    ? filter.operator
    : operators[0];

  const setOperator = (nextOperator: FilterOperator) => {
    onChange({ ...filter, operator: nextOperator });
  };
  const setValue = (value: DataTableFilterInput) => {
    onChange({ operator, value });
  };

  if (config.renderEditor) {
    return config.renderEditor({
      column,
      operator,
      value: filter.value,
      onOperatorChange: setOperator,
      onValueChange: setValue,
      onClear,
    });
  }

  const options =
    config.options?.map(option => ({
      value: String(option.value),
      label: option.label,
      disabled: option.disabled,
    })) ?? [];
  const selectedValues = Array.isArray(filter.value)
    ? filter.value.map(String)
    : [];

  let valueEditor: ReactNode;
  if (config.variant === "select") {
    valueEditor = (
      <Select
        size="sm"
        variant="filled"
        placeholder={config.placeholder ?? "Select a value"}
        value={String(filter.value ?? "")}
        onValueChange={value => {
          const selected = config.options?.find(
            option => String(option.value) === value,
          );
          setValue(selected?.value ?? value);
        }}
        items={options}
      />
    );
  } else if (config.variant === "multi-select") {
    valueEditor = (
      <div className="flex max-h-40 flex-wrap gap-1 overflow-y-auto rounded-lg border border-outline-variant/50 p-2">
        {config.options?.map(option => {
          const optionValue = String(option.value);
          const selected = selectedValues.includes(optionValue);
          return (
            <Button
              key={optionValue}
              type="button"
              variant={selected ? "secondary" : "ghost"}
              size="sm"
              disabled={option.disabled}
              aria-pressed={selected}
              startIcon={selected ? <Check className="h-3.5 w-3.5" /> : undefined}
              onClick={() => {
                const next = selected
                  ? selectedValues.filter(value => value !== optionValue)
                  : [...selectedValues, optionValue];
                setValue(
                  config.options
                    ?.filter(item => next.includes(String(item.value)))
                    .map(item => item.value) ?? next,
                );
              }}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    );
  } else {
    valueEditor = (
      <Input
        size="sm"
        variant="filled"
        type={
          config.variant === "number"
            ? "number"
            : config.variant === "date"
              ? "date"
              : "text"
        }
        placeholder={config.placeholder ?? "Type a value..."}
        value={stringifyValue(filter.value)}
        onValueChange={value =>
          setValue(
            config.variant === "number" && value !== ""
              ? Number(value)
              : value,
          )
        }
      />
    );
  }

  return (
    <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
      <Select
        size="sm"
        variant="filled"
        value={operator}
        onValueChange={value => setOperator(value as FilterOperator)}
        items={operators.map(value => ({
          value,
          label: FILTER_OPERATOR_LABELS[value],
        }))}
      />
      {valueEditor}
    </div>
  );
}
