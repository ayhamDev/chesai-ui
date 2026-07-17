import type { ColumnDef } from "@tanstack/react-table";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataTable, type DataTableState } from "./index";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(URL, "createObjectURL", {
  configurable: true,
  value: vi.fn(() => "blob:data-table-export"),
});
Object.defineProperty(URL, "revokeObjectURL", {
  configurable: true,
  value: vi.fn(),
});
Object.defineProperty(SVGElement.prototype, "getTotalLength", {
  configurable: true,
  value: () => 100,
});
Object.defineProperty(SVGElement.prototype, "getPointAtLength", {
  configurable: true,
  value: (length: number) => ({ x: length, y: length }),
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

type Item = {
  id: string;
  name: string;
  status: string;
};

const data: Item[] = [
  { id: "1", name: "Alpha", status: "pending" },
  { id: "2", name: "Beta", status: "success" },
];

const columns: ColumnDef<Item>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      filter: {
        variant: "select",
        options: [
          { label: "Pending", value: "pending" },
          { label: "Success", value: "success" },
        ],
      },
    },
  },
];

const serverState = {
  pagination: { pageIndex: 1, pageSize: 1 },
  sorting: [{ id: "name", desc: true }],
  columnFilters: [
    { id: "status", value: { operator: "eq", value: "missing" } },
  ],
  globalFilter: "",
  columnVisibility: {},
} satisfies Parameters<typeof DataTable<Item>>[0]["state"];

describe("DataTable", () => {
  it("does not transform server-provided rows locally", () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        serverSide
        rowCount={25}
        state={serverState}
        onStateChange={() => {}}
        visibility={{ toolbar: false, pagination: false }}
      />,
    );

    expect(screen.getByText("Alpha")).toBeTruthy();
    expect(screen.getByText("Beta")).toBeTruthy();
  });

  it("supports granular control visibility without hiding the table", () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        visibility={{
          search: false,
          filters: false,
          reset: false,
          viewOptions: false,
          export: false,
          pagination: false,
          selectionSummary: false,
        }}
      />,
    );

    expect(screen.queryByPlaceholderText("Search...")).toBeNull();
    expect(screen.queryByText("Filter")).toBeNull();
    expect(screen.queryByText("View")).toBeNull();
    expect(screen.queryByText("Export")).toBeNull();
    expect(screen.getByText("Alpha")).toBeTruthy();
  });

  it("filters a rendered-only custom cell through meta.filter.getValue", () => {
    const customColumns: ColumnDef<Item>[] = [
      { accessorKey: "name", header: "Name" },
      {
        id: "statusBadge",
        header: "Status",
        cell: ({ row }) => <span>{row.original.status.toUpperCase()}</span>,
        meta: {
          filter: {
            variant: "select",
            getValue: row => row.status,
            options: [
              { label: "Pending", value: "pending" },
              { label: "Success", value: "success" },
            ],
          },
        },
      },
    ];
    render(
      <DataTable
        data={data}
        columns={customColumns}
        state={{
          columnFilters: [
            {
              id: "statusBadge",
              value: { operator: "eq", value: "success" },
            },
          ],
        }}
        visibility={{ toolbar: false, pagination: false }}
      />,
    );

    expect(screen.queryByText("Alpha")).toBeNull();
    expect(screen.getByText("Beta")).toBeTruthy();
    expect(screen.getByText("SUCCESS")).toBeTruthy();
  });

  it("resets the page in the same state change as server search", async () => {
    const onStateChange = vi.fn();
    render(
      <DataTable
        data={data}
        columns={columns}
        serverSide
        rowCount={25}
        state={{ ...serverState, columnFilters: [] }}
        onStateChange={onStateChange}
        searchDebounceMs={0}
        visibility={{ filters: false, viewOptions: false, pagination: false }}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search..."), {
      target: { value: "alpha" },
    });

    await waitFor(() => expect(onStateChange).toHaveBeenCalled());
    const update = onStateChange.mock.calls.at(-1)?.[0] as DataTableState;
    expect(update.globalFilter).toBe("alpha");
    expect(update.pagination.pageIndex).toBe(0);
  });

  it("keeps legacy controlled pagination working", () => {
    const onPaginationChange = vi.fn();
    render(
      <DataTable
        data={data.slice(0, 1)}
        columns={columns}
        pageCount={2}
        pagination={{ pageIndex: 0, pageSize: 1 }}
        onPaginationChange={onPaginationChange}
        visibility={{ toolbar: false }}
      />,
    );

    const nextPageButton = screen
      .getByText("Go to next page")
      .closest("button");
    expect(nextPageButton).toBeTruthy();
    if (nextPageButton) fireEvent.click(nextPageButton);
    expect(onPaginationChange).toHaveBeenCalled();
  });

  it("exports the current client page from the toolbar", async () => {
    const onSuccess = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(
      <DataTable
        data={data}
        columns={columns}
        initialState={{ pagination: { pageIndex: 0, pageSize: 1 } }}
        exportOptions={{ fileName: "items", onSuccess }}
        visibility={{ search: false, filters: false, viewOptions: false }}
      />,
    );

    const exportButton = screen.getByRole("button", { name: "Export" });
    exportButton.focus();
    fireEvent.keyDown(exportButton, { key: "Enter", code: "Enter" });
    const pageActions = await screen.findAllByText("Current page (1)");
    fireEvent.click(pageActions[0]);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(onSuccess.mock.calls[0]?.[0]).toMatchObject({
      fileName: "items.csv",
      format: "csv",
      scope: "page",
      rowCount: 1,
    });
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
  });

  it("exports all unfiltered client data above the current-page action", async () => {
    const onSuccess = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(
      <DataTable
        data={data}
        columns={columns}
        initialState={{ pagination: { pageIndex: 0, pageSize: 1 } }}
        exportOptions={{ fileName: "all-items", onSuccess }}
        visibility={{ search: false, filters: false, viewOptions: false }}
      />,
    );

    const exportButton = screen.getByRole("button", { name: "Export" });
    exportButton.focus();
    fireEvent.keyDown(exportButton, { key: "Enter", code: "Enter" });
    const menuItems = await screen.findAllByRole("menuitem");

    expect(menuItems[0]?.textContent).toBe("All data (2)");
    expect(menuItems[1]?.textContent).toBe("Current page (1)");
    fireEvent.click(menuItems[0]);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(onSuccess.mock.calls[0]?.[0]).toMatchObject({
      fileName: "all-items.csv",
      format: "csv",
      scope: "allData",
      rowCount: 2,
    });
  });

  it("disables server-wide scopes without a fetchPage callback", async () => {
    render(
      <DataTable
        data={data.slice(0, 1)}
        columns={columns}
        serverSide
        rowCount={25}
        state={{ ...serverState, rowSelection: { "1": true } }}
        onStateChange={() => {}}
        visibility={{ search: false, filters: false, viewOptions: false }}
      />,
    );

    const exportButton = screen.getByRole("button", { name: "Export" });
    exportButton.focus();
    fireEvent.keyDown(exportButton, { key: "Enter", code: "Enter" });
    const allDataActions = await screen.findAllByText("All data");
    const allActions = await screen.findAllByText("All filtered rows (25)");
    const selectedActions = await screen.findAllByText("Selected rows (1)");

    expect(allActions).toHaveLength(2);
    expect(selectedActions).toHaveLength(2);
    expect(allDataActions).toHaveLength(2);
    for (const action of [
      ...allDataActions,
      ...allActions,
      ...selectedActions,
    ]) {
      expect(
        action.closest('[role="menuitem"]')?.getAttribute("data-disabled"),
      ).not.toBeNull();
    }
  });
});
