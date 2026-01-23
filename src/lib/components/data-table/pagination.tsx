"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { IconButton } from "../icon-button";
import { Input } from "../input";
import { Select } from "../select"; // FIX: Imported as Select
import { Typography } from "../typography";
import { useDataTable } from "./context";

export function DataTablePagination<TData>() {
  const { table } = useDataTable<TData>();

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  const [pageInput, setPageInput] = useState(String(pageIndex + 1));

  useEffect(() => {
    setPageInput(String(pageIndex + 1));
  }, [pageIndex]);

  const handlePageSubmit = () => {
    let page = Number(pageInput) - 1;
    if (isNaN(page)) page = 0;
    if (page < 0) page = 0;
    if (page >= pageCount) page = pageCount - 1;

    table.setPageIndex(page);
    setPageInput(String(page + 1));
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-2 py-4 sm:flex-row flex-wrap">
      {/* Selected Count */}
      <div className="text-sm text-graphite-foreground/70 order-2 sm:order-1">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>

      {/* Controls Container */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8 order-1 sm:order-2 w-full sm:w-auto flex-wrap">
        {/* Rows Per Page & Page Input Group */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-4 flex-wrap">
          {/* Rows Per Page */}
          <div className="flex items-center space-x-2">
            <Typography
              variant="small"
              className="whitespace-nowrap text-graphite-foreground"
            >
              Rows per page
            </Typography>
            <div className="w-[80px]">
              <Select
                size="sm"
                variant="flat"
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
                items={[
                  { value: "10", label: "10" },
                  { value: "20", label: "20" },
                  { value: "30", label: "30" },
                  { value: "40", label: "40" },
                  { value: "50", label: "50" },
                  { value: "100", label: "100" },
                ]}
              />
            </div>
          </div>

          {/* Page Input */}
          <div className="flex items-center justify-center text-sm font-medium text-graphite-foreground gap-2">
            <span>Page</span>
            <Input
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={handlePageSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handlePageSubmit();
                  e.currentTarget.blur();
                }
              }}
              // Dynamic width based on character length + padding
              style={{ width: `${Math.max(pageInput.length, 1) + 2}ch` }}
              classNames={{ input: " text-center px-1 min-w-[2.5rem]" }}
              variant="flat"
              size="sm"
            />
            <span className="whitespace-nowrap">of {pageCount || 1}</span>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center space-x-2">
          <IconButton
            variant="ghost"
            size="sm"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
