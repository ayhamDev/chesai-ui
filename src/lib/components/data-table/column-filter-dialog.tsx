"use client";

import type { Column } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Button } from "../button";
import { Typography } from "../typography";
import { getDataTableColumnLabel } from "./advanced-filter";
import { DataTableFilterEditor } from "./filter-editor";
import {
  type AdvancedFilterValue,
  getColumnFilterConfig,
  getDefaultFilterOperator,
  normalizeFilterValue,
} from "./filter-utils";

interface ColumnFilterDialogProps<TData, TValue> {
  column: Column<TData, TValue>;
  onClose: () => void;
}

export function ColumnFilterDialog<TData, TValue>({
  column,
  onClose,
}: ColumnFilterDialogProps<TData, TValue>) {
  const typedColumn = column as unknown as Column<TData, unknown>;
  const config = getColumnFilterConfig(typedColumn);
  const currentFilter = column.getFilterValue();
  const emptyFilter: AdvancedFilterValue = {
    operator: getDefaultFilterOperator(typedColumn),
    value: config.variant === "multi-select" ? [] : "",
  };
  const [draft, setDraft] = useState<AdvancedFilterValue>(() =>
    currentFilter === undefined
      ? emptyFilter
      : normalizeFilterValue(currentFilter, typedColumn),
  );

  useEffect(() => {
    const nextEmptyFilter: AdvancedFilterValue = {
      operator: getDefaultFilterOperator(typedColumn),
      value: config.variant === "multi-select" ? [] : "",
    };
    setDraft(
      currentFilter === undefined
        ? nextEmptyFilter
        : normalizeFilterValue(currentFilter, typedColumn),
    );
  }, [currentFilter, typedColumn, config.variant]);

  const applyFilter = () => {
    const value = draft.value;
    if (
      value === "" ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0)
    ) {
      column.setFilterValue(undefined);
    } else {
      column.setFilterValue(draft);
    }
    onClose();
  };

  return (
    <div className="flex min-w-[320px] flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <Typography
          variant="label-large"
          className="font-bold uppercase tracking-tighter opacity-70"
        >
          Filter Column
        </Typography>
        <Typography variant="title-small" className="truncate">
          {getDataTableColumnLabel(typedColumn)}
        </Typography>
      </div>

      <DataTableFilterEditor
        column={typedColumn}
        filter={draft}
        onChange={setDraft}
        onClear={() => setDraft(emptyFilter)}
      />

      <div className="mt-2 flex items-center justify-between">
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
