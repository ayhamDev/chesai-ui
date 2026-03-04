"use client";

import { type Table } from "@tanstack/react-table";
import { useDebounce } from "@uidotdev/usehooks";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../badge";
import { Button } from "../button";
import { Card } from "../card";
import { SearchView } from "../search-view";
import { Typography } from "../typography";
import { DataTableAdvancedFilter } from "./advanced-filter";
import { useDataTable } from "./context";
import { DataTableViewOptions } from "./view-options";

interface DataTableToolbarProps<TData> {
  children?: React.ReactNode;
  bulkActions?: (table: Table<TData>) => React.ReactNode;
}

export function DataTableToolbar<TData>({
  children,
  bulkActions,
}: DataTableToolbarProps<TData>) {
  const { table } = useDataTable<TData>();

  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    !!table.getState().globalFilter;

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  const [searchValue, setSearchValue] = useState(
    table.getState().globalFilter ?? "",
  );
  const debouncedSearch = useDebounce(searchValue, 300);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    table.setGlobalFilter(debouncedSearch);
  }, [debouncedSearch, table]);

  return (
    <Card
      padding="none"
      variant="ghost"
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2 px-2"
    >
      <div className="flex flex-1 items-center gap-4 w-full overflow-x-auto no-scrollbar flex-wrap z-10">
        {/* standard SearchView dropped in naturally */}
        <div className="w-full max-w-sm min-w-[250px]">
          <SearchView
            variant="docked"
            value={searchValue}
            onChange={setSearchValue}
            open={isSearchOpen}
            onOpenChange={setIsSearchOpen}
            placeholder="Search..."
            dockedLeadingIcon={
              <Search className="h-5 w-5 text-on-surface-variant" />
            }
          >
            <div className="p-4 flex flex-col gap-3">
              <Typography
                variant="label-small"
                className="opacity-60 uppercase tracking-wider font-bold"
              >
                Searchable Columns
              </Typography>
              <div className="flex flex-wrap gap-2">
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanFilter())
                  .map((col) => {
                    const header =
                      typeof col.columnDef.header === "string"
                        ? col.columnDef.header
                        : col.id.charAt(0).toUpperCase() + col.id.slice(1);

                    return (
                      <Badge key={col.id} variant="secondary" shape="minimal">
                        {header}
                      </Badge>
                    );
                  })}
              </div>
            </div>
          </SearchView>
        </div>

        <DataTableAdvancedFilter table={table} />

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
          {isFiltered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                onClick={() => {
                  table.resetColumnFilters();
                  table.setGlobalFilter("");
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

      <div className="flex items-center gap-2 self-end sm:self-auto z-0">
        <AnimatePresence>
          {hasSelection && bulkActions && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2"
            >
              {bulkActions(table)}
              <div className="h-6 w-[1px] bg-outline-variant mx-1" />
            </motion.div>
          )}
        </AnimatePresence>
        <DataTableViewOptions />
      </div>
    </Card>
  );
}
