"use client";

import type { Table } from "@tanstack/react-table";
import { useDebounce } from "@uidotdev/usehooks";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../button";
import { Card } from "../card";
import { Input } from "../input";
import { DataTableAdvancedFilter } from "./advanced-filter";
import { useDataTable } from "./context";
import { DataTableExportButton } from "./export-button";
import { defaultDataTableVisibility } from "./types";
import { DataTableViewOptions } from "./view-options";

interface DataTableToolbarProps<TData> {
  children?: React.ReactNode;
  bulkActions?: (table: Table<TData>) => React.ReactNode;
}

export function DataTableToolbar<TData>({
  children,
  bulkActions,
}: DataTableToolbarProps<TData>) {
  const {
    table,
    searchInputProps,
    visibility: configuredVisibility,
    searchDebounceMs = 300,
    resetFilters,
  } = useDataTable<TData>();
  const visibility = {
    ...defaultDataTableVisibility,
    ...configuredVisibility,
  };

  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    !!table.getState().globalFilter;
  const selectedCount = Object.values(table.getState().rowSelection).filter(
    Boolean,
  ).length;
  const hasSelection = selectedCount > 0;
  const hasFilterableColumns = table
    .getAllLeafColumns()
    .some(column => column.getCanFilter());

  const [searchValue, setSearchValue] = useState(
    String(table.getState().globalFilter ?? ""),
  );
  const debouncedSearch = useDebounce(searchValue, searchDebounceMs);
  const globalFilter = String(table.getState().globalFilter ?? "");

  useEffect(() => {
    if (debouncedSearch !== String(table.getState().globalFilter ?? "")) {
      table.setGlobalFilter(debouncedSearch);
    }
  }, [debouncedSearch, table]);

  useEffect(() => {
    setSearchValue(globalFilter);
  }, [globalFilter]);

  const showSearch = visibility.search;
  const showFilters = visibility.filters && hasFilterableColumns;
  const showReset = visibility.reset && isFiltered;
  const showViewOptions = visibility.viewOptions;
  const showExport = visibility.export;
  const showBulkActions = hasSelection && !!bulkActions;
  const hasContent =
    showSearch ||
    showFilters ||
    showReset ||
    showViewOptions ||
    showExport ||
    showBulkActions ||
    !!children;

  if (!visibility.toolbar || !hasContent) return null;

  return (
    <Card
      padding="none"
      variant="ghost"
      className="flex flex-col items-start justify-between gap-4 px-2 sm:flex-row sm:items-center sm:gap-2"
    >
      <div className="z-10 flex w-full flex-1 flex-wrap items-center gap-4 overflow-x-auto no-scrollbar">
        {showSearch && (
          <div className="w-full min-w-[250px] max-w-sm">
            <Input
              variant="filled"
              shape="full"
              placeholder="Search..."
              startContent={
                <Search className="h-5 w-5 text-on-surface-variant" />
              }
              {...searchInputProps}
              type="search"
              value={searchValue}
              onValueChange={setSearchValue}
            />
          </div>
        )}

        {showFilters && <DataTableAdvancedFilter table={table} />}

        {children && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-2"
          >
            {children}
          </motion.div>
        )}

        <AnimatePresence>
          {showReset && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                onClick={() => {
                  if (resetFilters) {
                    resetFilters();
                  } else {
                    table.resetColumnFilters();
                    table.setGlobalFilter("");
                  }
                  setSearchValue("");
                }}
                className="h-10 px-2 lg:px-3"
                startIcon={<X className="h-4 w-4" />}
              >
                Reset
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(showBulkActions || showViewOptions || showExport) && (
        <div className="z-0 flex items-center gap-2 self-end sm:self-auto">
          <AnimatePresence>
            {showBulkActions && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2"
              >
                {bulkActions?.(table)}
                {(showViewOptions || showExport) && (
                  <div className="mx-1 h-6 w-[1px] bg-outline-variant" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {showExport && <DataTableExportButton />}
          {showViewOptions && <DataTableViewOptions />}
        </div>
      )}
    </Card>
  );
}
