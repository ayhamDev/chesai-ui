"use client";

import { FileSpreadsheet, FileText, Table2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { useDataTable } from "./context";
import {
  DataTableExportError,
  downloadDataTableExport,
  exportDataTable,
  type DataTableExportFormat,
  type DataTableExportScope,
} from "./export";

export interface DataTableExportButtonProps {
  className?: string;
  label?: string;
}

function toExportError(error: unknown): DataTableExportError {
  return error instanceof DataTableExportError
    ? error
    : new DataTableExportError(
        "INVALID_RESPONSE",
        error instanceof Error ? error.message : "The data table export failed.",
        { cause: error },
      );
}

export function DataTableExportButton<TData>({
  className,
  label = "Export",
}: DataTableExportButtonProps) {
  const {
    table,
    serverSide,
    rowCount,
    exportOptions,
    exportColumns,
  } = useDataTable<TData>();
  const [isExporting, setIsExporting] = useState(false);
  const abortController = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      abortController.current?.abort();
    },
    [],
  );

  if (!exportColumns) return null;

  const selectedRowIds = Object.entries(table.getState().rowSelection)
    .filter(([, selected]) => selected)
    .map(([id]) => id);
  const pageRows = table.getRowModel().rows.map(row => row.original);
  const rawRows = serverSide
    ? []
    : table.getCoreRowModel().rows.map(row => row.original);
  const allRows = serverSide
    ? []
    : table.getPrePaginationRowModel().rows.map(row => row.original);
  const selectedRows = serverSide
    ? []
    : table
        .getPrePaginationRowModel()
        .rows.filter(row => row.getIsSelected())
        .map(row => row.original);
  const canFetchServerRows = !serverSide || !!exportOptions?.fetchPage;

  const runExport = async (
    format: DataTableExportFormat,
    scope: DataTableExportScope,
  ) => {
    if (isExporting) return;
    setIsExporting(true);
    const controller = new AbortController();
    abortController.current = controller;

    try {
      const headlessOptions = { ...exportOptions, onError: undefined };
      const rowsByScope: Record<DataTableExportScope, TData[]> = {
        allData: rawRows,
        page: pageRows,
        all: allRows,
        selected: selectedRows,
      };
      const result = await exportDataTable({
        ...headlessOptions,
        columns: exportColumns,
        format,
        scope,
        rows: rowsByScope[scope],
        state: table.getState(),
        selectedRowIds,
        signal: controller.signal,
      });
      downloadDataTableExport(result);
    } catch (error) {
      const exportError = toExportError(error);
      if (exportError.code !== "ABORTED") {
        exportOptions?.onError?.(exportError);
      }
    } finally {
      if (abortController.current === controller) {
        abortController.current = null;
      }
      setIsExporting(false);
    }
  };

  const allDisabled =
    isExporting ||
    !canFetchServerRows ||
    (serverSide ? rowCount === 0 : allRows.length === 0);
  const allDataDisabled =
    isExporting ||
    !canFetchServerRows ||
    (!serverSide && rawRows.length === 0);
  const selectedDisabled =
    isExporting || selectedRowIds.length === 0 || !canFetchServerRows;

  const renderFormatActions = (
    format: DataTableExportFormat,
    icon: React.ReactNode,
  ) => (
    <>
      <DropdownMenuLabel className="flex items-center gap-2">
        {icon}
        {format === "csv" ? "CSV" : "Excel workbook"}
      </DropdownMenuLabel>
      <DropdownMenuItem
        disabled={allDataDisabled}
        onSelect={() => void runExport(format, "allData")}
      >
        All data{serverSide ? "" : ` (${rawRows.length})`}
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={isExporting || pageRows.length === 0}
        onSelect={() => void runExport(format, "page")}
      >
        Current page ({pageRows.length})
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={allDisabled}
        onSelect={() => void runExport(format, "all")}
      >
        All filtered rows
        {serverSide && rowCount !== undefined ? ` (${rowCount})` : ""}
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={selectedDisabled}
        onSelect={() => void runExport(format, "selected")}
      >
        Selected rows ({selectedRowIds.length})
      </DropdownMenuItem>
    </>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isExporting}>
        <Button
          variant="secondary"
          size="sm"
          className={className}
          isLoading={isExporting}
          startIcon={<Table2 className="h-4 w-4" />}
          aria-label={isExporting ? "Exporting data" : label}
          aria-busy={isExporting}
        >
          {isExporting ? "Exporting" : label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        {renderFormatActions(
          "csv",
          <FileText className="h-4 w-4" aria-hidden="true" />,
        )}
        <DropdownMenuSeparator />
        {renderFormatActions(
          "xlsx",
          <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />,
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
