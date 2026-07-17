import type { ColumnDef } from "@tanstack/react-table";
import { read, utils } from "xlsx";
import { describe, expect, it, vi } from "vitest";
import {
  type DataTableExportError,
  exportDataTable,
  sanitizeDataTableSheetName,
} from "./export";
import type { DataTableState } from "./types";

type ExportRow = {
  id: string;
  name: string;
  amount: number;
  createdAt: Date;
  details: { active: boolean };
  formula: string;
};

const rows: ExportRow[] = [
  {
    id: "1",
    name: 'Alpha, "One"',
    amount: 12.5,
    createdAt: new Date("2026-07-17T10:15:00.000Z"),
    details: { active: true },
    formula: "=1+1",
  },
];

const columns: ColumnDef<ExportRow>[] = [
  { id: "select", header: "Select" },
  { accessorKey: "id", header: "Identifier" },
  {
    accessorKey: "name",
    header: () => "Rendered name",
    meta: { export: { label: "Customer" } },
  },
  { accessorKey: "amount", header: "Amount" },
  { accessorKey: "createdAt", header: "Created" },
  { accessorKey: "details", header: "Details" },
  { accessorKey: "formula", header: "Formula" },
  {
    id: "computed",
    header: "Computed",
    meta: {
      export: {
        getValue: row => row.name.toUpperCase(),
      },
    },
  },
  {
    accessorKey: "name",
    id: "excluded",
    meta: { export: { enabled: false } },
  },
  { id: "actions", header: "Actions", cell: () => null },
];

const state: DataTableState = {
  pagination: { pageIndex: 3, pageSize: 25 },
  sorting: [{ id: "name", desc: true }],
  columnFilters: [
    { id: "name", value: { operator: "contains", value: "a" } },
  ],
  globalFilter: "alpha",
  columnVisibility: { id: false },
  rowSelection: {},
  expanded: {},
};

describe("exportDataTable", () => {
  it("creates secure, Excel-friendly CSV bytes from exportable columns", async () => {
    const result = await exportDataTable({
      format: "csv",
      scope: "allData",
      columns,
      rows,
      fileName: "payments.xlsx",
    });

    const text = new TextDecoder().decode(result.bytes);
    expect([...result.bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(text).toContain(
      "Identifier,Customer,Amount,Created,Details,Formula,Computed",
    );
    expect(text).toContain('"Alpha, ""One"""');
    expect(text).toContain("2026-07-17T10:15:00.000Z");
    expect(text).toContain('"{""active"":true}"');
    expect(text).toContain("'=1+1");
    expect(text).not.toContain("Select");
    expect(text).not.toContain("Actions");
    expect(result.fileName).toBe("payments.csv");
    expect(result.rowCount).toBe(1);
  });

  it("preserves primitive and date cell types in XLSX output", async () => {
    const result = await exportDataTable({
      format: "xlsx",
      scope: "page",
      columns,
      rows,
      sheetName: "Payments:*?/[] with a very long suffix",
    });
    const workbook = read(result.bytes, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const values = utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
      header: 1,
      raw: true,
    });

    expect(sheetName.length).toBeLessThanOrEqual(31);
    expect(sheetName).not.toMatch(/[\\/*?:[\]]/);
    expect(values[0]).toEqual([
      "Identifier",
      "Customer",
      "Amount",
      "Created",
      "Details",
      "Formula",
      "Computed",
    ]);
    expect(values[1]?.[2]).toBe(12.5);
    expect(values[1]?.[3]).toBeInstanceOf(Date);
    expect(values[1]?.[5]).toBe("=1+1");
  });

  it("fetches server rows until totalRows even when pages are clamped", async () => {
    const allRows = Array.from({ length: 5 }, (_, index) => ({
      ...rows[0],
      id: String(index + 1),
      name: `Row ${index + 1}`,
    }));
    const requests: Array<{
      scope: string;
      pageIndex: number;
      offset: number;
      limit: number;
    }> = [];
    const onProgress = vi.fn();

    const result = await exportDataTable({
      format: "csv",
      scope: "allData",
      columns,
      state,
      batchSize: 1000,
      fetchPage: async request => {
        requests.push({
          scope: request.scope,
          pageIndex: request.pageIndex,
          offset: request.offset,
          limit: request.limit,
        });
        return {
          rows: allRows.slice(request.offset, request.offset + 2),
          totalRows: allRows.length,
        };
      },
      onProgress,
    });

    expect(requests).toEqual([
      { scope: "allData", pageIndex: 0, offset: 0, limit: 1000 },
      { scope: "allData", pageIndex: 1, offset: 2, limit: 1000 },
      { scope: "allData", pageIndex: 2, offset: 4, limit: 1000 },
    ]);
    expect(result.rowCount).toBe(5);
    expect(onProgress).toHaveBeenLastCalledWith(
      expect.objectContaining({ fetchedRows: 5, totalRows: 5, pageIndex: 2 }),
    );
    expect(state.pagination).toEqual({ pageIndex: 3, pageSize: 25 });
  });

  it("passes selected IDs and reports incomplete server exports", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ rows, totalRows: 2 })
      .mockResolvedValueOnce({ rows: [], totalRows: 2 });
    const onError = vi.fn();

    await expect(
      exportDataTable({
        format: "csv",
        scope: "selected",
        columns,
        state,
        selectedRowIds: ["row-1", "row-7"],
        fetchPage,
        onError,
      }),
    ).rejects.toMatchObject({
      code: "INCOMPLETE_DATA",
    } satisfies Partial<DataTableExportError>);
    expect(fetchPage.mock.calls[0]?.[0].selectedRowIds).toEqual([
      "row-1",
      "row-7",
    ]);
    expect(onError).toHaveBeenCalledOnce();
  });

  it("rejects an already-aborted export", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      exportDataTable({
        format: "csv",
        scope: "page",
        columns,
        rows,
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({
      code: "ABORTED",
    } satisfies Partial<DataTableExportError>);
  });

  it("sanitizes empty and invalid worksheet names", () => {
    expect(sanitizeDataTableSheetName("[]:*?/\\")).toBe("Data");
    expect(sanitizeDataTableSheetName("'Orders'")).toBe("Orders");
  });
});
