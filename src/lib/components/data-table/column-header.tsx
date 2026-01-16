"use client";

import { type Column } from "@tanstack/react-table";
import { clsx } from "clsx";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  EyeOff,
  Filter,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../button";
import { Dialog, DialogContent } from "../dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { ColumnFilterDialog } from "./column-filter-dialog";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  enableColumnFilter?: boolean;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  enableColumnFilter,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  if (!column.getCanSort() && !enableColumnFilter) {
    return <div className={clsx(className)}>{title}</div>;
  }

  return (
    <div className={clsx("flex items-center space-x-2", className)}>
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-secondary-container"
            >
              <span>{title}</span>
              {column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4 text-primary" />
              ) : column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4 text-primary" />
              ) : (
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              )}
              {column.getFilterValue() && (
                <Filter className="ml-2 h-3 w-3 text-primary" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUp className="mr-2 h-3.5 w-3.5 text-on-surface-variant" />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDown className="mr-2 h-3.5 w-3.5 text-on-surface-variant" />
              Desc
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => column.clearSorting()}>
              <X className="mr-2 h-3.5 w-3.5 text-on-surface-variant" />
              Clear Sort
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeOff className="mr-2 h-3.5 w-3.5 text-on-surface-variant" />
              Hide
            </DropdownMenuItem>

            {enableColumnFilter && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setIsFilterOpen(true)}>
                  <Filter className="mr-2 h-3.5 w-3.5 text-on-surface-variant" />
                  Filter
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent variant="surface" className="p-0 w-auto min-w-[300px]">
          <ColumnFilterDialog
            column={column}
            onClose={() => setIsFilterOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
