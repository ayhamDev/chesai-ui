import type { ColumnDef } from "@tanstack/react-table";
import type { DataTableState } from "./types";

export type DataTableExportFormat = "csv" | "xlsx";
export type DataTableExportScope = "allData" | "page" | "all" | "selected";
export type DataTableExportValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | object;

export interface DataTableExportValueContext {
  columnId: string;
  format: DataTableExportFormat;
  scope: DataTableExportScope;
  rowIndex: number;
}

export interface DataTableColumnExportConfig<TData> {
  enabled?: boolean;
  label?: string;
  getValue?: (
    row: TData,
    context: DataTableExportValueContext,
  ) => DataTableExportValue;
}

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    export?: DataTableColumnExportConfig<TData>;
  }
}

export interface DataTableExportFetchRequest {
  state: DataTableState;
  scope: Exclude<DataTableExportScope, "page">;
  pageIndex: number;
  offset: number;
  limit: number;
  selectedRowIds: string[];
  signal: AbortSignal;
}

export interface DataTableExportFetchResult<TData> {
  rows: TData[];
  totalRows: number;
}

export type DataTableExportFetcher<TData> = (
  request: DataTableExportFetchRequest,
) => Promise<DataTableExportFetchResult<TData>>;

export interface DataTableExportProgress {
  format: DataTableExportFormat;
  scope: DataTableExportScope;
  fetchedRows: number;
  totalRows: number;
  pageIndex: number;
}

export interface DataTableExportFileNameContext {
  format: DataTableExportFormat;
  scope: DataTableExportScope;
  rowCount: number;
}

export interface DataTableExportResult {
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
  format: DataTableExportFormat;
  scope: DataTableExportScope;
  rowCount: number;
}

export interface DataTableExportConfig<TData> {
  fileName?:
    | string
    | ((context: DataTableExportFileNameContext) => string);
  sheetName?: string;
  batchSize?: number;
  fetchPage?: DataTableExportFetcher<TData>;
  onProgress?: (progress: DataTableExportProgress) => void;
  onSuccess?: (result: DataTableExportResult) => void;
  onError?: (error: DataTableExportError) => void;
}

export interface ExportDataTableOptions<TData>
  extends DataTableExportConfig<TData> {
  format: DataTableExportFormat;
  scope: DataTableExportScope;
  columns: readonly ColumnDef<TData, unknown>[];
  rows?: readonly TData[];
  state?: DataTableState;
  selectedRowIds?: readonly string[];
  signal?: AbortSignal;
}

export type DataTableExportErrorCode =
  | "ABORTED"
  | "FETCH_FAILED"
  | "INCOMPLETE_DATA"
  | "INVALID_CONFIGURATION"
  | "INVALID_RESPONSE"
  | "UNSUPPORTED_ENVIRONMENT";

export class DataTableExportError extends Error {
  readonly code: DataTableExportErrorCode;

  constructor(
    code: DataTableExportErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "DataTableExportError";
    this.code = code;
  }
}

interface ResolvedExportColumn<TData> {
  id: string;
  label: string;
  getValue: (
    row: TData,
    context: DataTableExportValueContext,
  ) => DataTableExportValue;
}

const CSV_MIME_TYPE = "text/csv;charset=utf-8";
const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const DEFAULT_BATCH_SIZE = 1000;

function getNestedValue(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined;
    }
    return (current as Record<string, unknown>)[key];
  }, value);
}

function flattenColumns<TData>(
  columns: readonly ColumnDef<TData, unknown>[],
): ColumnDef<TData, unknown>[] {
  return columns.flatMap(column => {
    if ("columns" in column && Array.isArray(column.columns)) {
      return flattenColumns(
        column.columns as readonly ColumnDef<TData, unknown>[],
      );
    }
    return [column];
  });
}

function resolveColumns<TData>(
  columns: readonly ColumnDef<TData, unknown>[],
): ResolvedExportColumn<TData>[] {
  return flattenColumns(columns).flatMap(column => {
    const configured = column.meta?.export;
    if (configured?.enabled === false) return [];

    const accessorKey =
      "accessorKey" in column && column.accessorKey !== undefined
        ? String(column.accessorKey)
        : undefined;
    const accessorFn =
      "accessorFn" in column && typeof column.accessorFn === "function"
        ? column.accessorFn
        : undefined;
    if (!configured?.getValue && !accessorKey && !accessorFn) return [];

    const id = column.id ?? accessorKey ?? configured?.label;
    if (!id) return [];

    const label =
      configured?.label ??
      (typeof column.header === "string" ? column.header : undefined) ??
      accessorKey ??
      id;

    return [
      {
        id,
        label,
        getValue: (row, context) => {
          if (configured?.getValue) return configured.getValue(row, context);
          if (accessorFn) {
            return accessorFn(
              row,
              context.rowIndex,
            ) as DataTableExportValue;
          }
          return getNestedValue(row, accessorKey as string) as DataTableExportValue;
        },
      },
    ];
  });
}

function abortError(): DataTableExportError {
  return new DataTableExportError("ABORTED", "The data table export was aborted.");
}

function assertNotAborted(signal: AbortSignal) {
  if (signal.aborted) throw abortError();
}

async function resolveRows<TData>(
  options: ExportDataTableOptions<TData>,
  signal: AbortSignal,
): Promise<TData[]> {
  if (options.scope === "page" || !options.fetchPage) {
    const rows = [...(options.rows ?? [])];
    options.onProgress?.({
      format: options.format,
      scope: options.scope,
      fetchedRows: rows.length,
      totalRows: rows.length,
      pageIndex: 0,
    });
    return rows;
  }
  if (!options.state) {
    throw new DataTableExportError(
      "INVALID_CONFIGURATION",
      "A table state is required when fetchPage is used.",
    );
  }

  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  if (!Number.isInteger(batchSize) || batchSize <= 0) {
    throw new DataTableExportError(
      "INVALID_CONFIGURATION",
      "batchSize must be a positive integer.",
    );
  }

  const rows: TData[] = [];
  let pageIndex = 0;
  let totalRows: number | undefined;

  while (totalRows === undefined || rows.length < totalRows) {
    assertNotAborted(signal);
    let response: DataTableExportFetchResult<TData>;
    try {
      response = await options.fetchPage({
        state: options.state,
        scope: options.scope,
        pageIndex,
        offset: rows.length,
        limit: batchSize,
        selectedRowIds: [...(options.selectedRowIds ?? [])],
        signal,
      });
    } catch (error) {
      if (signal.aborted || (error instanceof Error && error.name === "AbortError")) {
        throw abortError();
      }
      throw new DataTableExportError(
        "FETCH_FAILED",
        `Failed to fetch export page ${pageIndex + 1}.`,
        { cause: error },
      );
    }

    if (
      !response ||
      !Array.isArray(response.rows) ||
      !Number.isInteger(response.totalRows) ||
      response.totalRows < 0
    ) {
      throw new DataTableExportError(
        "INVALID_RESPONSE",
        "fetchPage must return rows and a non-negative integer totalRows.",
      );
    }
    if (totalRows !== undefined && response.totalRows !== totalRows) {
      throw new DataTableExportError(
        "INVALID_RESPONSE",
        "fetchPage returned an inconsistent totalRows value.",
      );
    }

    totalRows = response.totalRows;
    if (response.rows.length === 0 && rows.length < totalRows) {
      throw new DataTableExportError(
        "INCOMPLETE_DATA",
        `Export stopped after ${rows.length} of ${totalRows} rows because the server returned an empty page.`,
      );
    }
    if (rows.length + response.rows.length > totalRows) {
      throw new DataTableExportError(
        "INVALID_RESPONSE",
        "fetchPage returned more rows than totalRows.",
      );
    }

    rows.push(...response.rows);
    options.onProgress?.({
      format: options.format,
      scope: options.scope,
      fetchedRows: rows.length,
      totalRows,
      pageIndex,
    });
    pageIndex += 1;
  }

  return rows;
}

function normalizeStructuredValue(value: object): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function normalizeCsvValue(value: DataTableExportValue): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return normalizeStructuredValue(value);
  if (typeof value === "number" && !Number.isFinite(value)) {
    return String(value);
  }
  return String(value);
}

function protectCsvFormula(value: string): string {
  return /^[\t\r ]*[=+\-@]/.test(value) ? `'${value}` : value;
}

function quoteCsvValue(value: string): string {
  const protectedValue = protectCsvFormula(value);
  return /[",\r\n]/.test(protectedValue)
    ? `"${protectedValue.replaceAll('"', '""')}"`
    : protectedValue;
}

function createCsvBytes(rows: DataTableExportValue[][]): Uint8Array {
  const csv = rows
    .map(row => row.map(value => quoteCsvValue(normalizeCsvValue(value))).join(","))
    .join("\r\n");
  return new TextEncoder().encode(`\uFEFF${csv}`);
}

function normalizeXlsxValue(value: DataTableExportValue) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object") return normalizeStructuredValue(value);
  if (typeof value === "number" && !Number.isFinite(value)) {
    return String(value);
  }
  return value;
}

export function sanitizeDataTableSheetName(sheetName = "Data"): string {
  const sanitized = sheetName
    .replace(/[\\/*?:[\]]/g, " ")
    .replace(/^'+|'+$/g, "")
    .trim()
    .slice(0, 31);
  return sanitized || "Data";
}

function normalizeFileName(
  requested: DataTableExportConfig<unknown>["fileName"],
  context: DataTableExportFileNameContext,
): string {
  const date = new Date().toISOString().slice(0, 10);
  const raw =
    typeof requested === "function"
      ? requested(context)
      : requested || `data-table-${date}`;
  const base = raw.trim().replace(/\.(csv|xlsx)$/i, "") || `data-table-${date}`;
  return `${base}.${context.format}`;
}

async function createXlsxBytes(
  rows: DataTableExportValue[][],
  sheetName?: string,
): Promise<Uint8Array> {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.aoa_to_sheet(
    rows.map(row => row.map(normalizeXlsxValue)),
    { cellDates: true },
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    sanitizeDataTableSheetName(sheetName),
  );
  const output = XLSX.write(workbook, {
    type: "array",
    bookType: "xlsx",
    compression: true,
    cellDates: true,
  });
  return output instanceof Uint8Array ? output : new Uint8Array(output);
}

async function performDataTableExport<TData>(
  options: ExportDataTableOptions<TData>,
): Promise<DataTableExportResult> {
  const controller = options.signal ? undefined : new AbortController();
  const signal = options.signal ?? controller?.signal;
  if (!signal) {
    throw new DataTableExportError(
      "UNSUPPORTED_ENVIRONMENT",
      "AbortController is required to export data.",
    );
  }
  assertNotAborted(signal);

  const columns = resolveColumns(options.columns);
  const rows = await resolveRows(options, signal);
  assertNotAborted(signal);

  const values: DataTableExportValue[][] = [
    columns.map(column => column.label),
    ...rows.map((row, rowIndex) =>
      columns.map(column =>
        column.getValue(row, {
          columnId: column.id,
          format: options.format,
          scope: options.scope,
          rowIndex,
        }),
      ),
    ),
  ];
  const context = {
    format: options.format,
    scope: options.scope,
    rowCount: rows.length,
  };
  const result: DataTableExportResult = {
    bytes:
      options.format === "csv"
        ? createCsvBytes(values)
        : await createXlsxBytes(values, options.sheetName),
    fileName: normalizeFileName(
      options.fileName as DataTableExportConfig<unknown>["fileName"],
      context,
    ),
    mimeType:
      options.format === "csv" ? CSV_MIME_TYPE : XLSX_MIME_TYPE,
    format: options.format,
    scope: options.scope,
    rowCount: rows.length,
  };
  options.onSuccess?.(result);
  return result;
}

export async function exportDataTable<TData>(
  options: ExportDataTableOptions<TData>,
): Promise<DataTableExportResult> {
  try {
    return await performDataTableExport(options);
  } catch (error) {
    const exportError =
      error instanceof DataTableExportError
        ? error
        : new DataTableExportError(
            "INVALID_RESPONSE",
            error instanceof Error
              ? error.message
              : "The data table export failed.",
            { cause: error },
          );
    options.onError?.(exportError);
    throw exportError;
  }
}

export function downloadDataTableExport(result: DataTableExportResult): void {
  if (
    typeof document === "undefined" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    throw new DataTableExportError(
      "UNSUPPORTED_ENVIRONMENT",
      "Browser download APIs are not available in this environment.",
    );
  }

  const buffer = new ArrayBuffer(result.bytes.byteLength);
  new Uint8Array(buffer).set(result.bytes);
  const blob = new Blob([buffer], { type: result.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = result.fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
