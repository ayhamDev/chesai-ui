# DataTable state and URL integration

`DataTable` does not import a router or `nuqs`. The consuming application owns
navigation and server fetching, while `createDataTableUrlCodec` converts between
the table's controlled state and `URLSearchParams`.

```tsx
const codec = createDataTableUrlCodec({
  columns,
  namespace: "orders",
});

const [tableState, setTableState] = useState(() =>
  codec.parse(new URLSearchParams(location.search)),
);

function handleStateChange(updater: Updater<DataTableState>) {
  const next = functionalUpdate(updater, {
    ...tableState,
    rowSelection: {},
    expanded: {},
  });

  const nextUrlState = {
    pagination: next.pagination,
    sorting: next.sorting,
    columnFilters: next.columnFilters,
    globalFilter: next.globalFilter,
    columnVisibility: next.columnVisibility,
  };

  setTableState(nextUrlState);
  const params = codec.write(
    new URLSearchParams(location.search),
    nextUrlState,
  );
  router.replace(`?${params.toString()}`);
}

<DataTable
  data={serverRows}
  columns={columns}
  serverSide
  rowCount={totalRows}
  state={tableState}
  onStateChange={handleStateChange}
/>;
```

For Next.js, React Router, TanStack Router, or `nuqs`, replace only the
`location.search` and `router.replace` lines with that framework's search-param
reader and setter. The codec preserves unrelated parameters and can be created
with a unique namespace for every table on the page.

Column filters are configured through `columnDef.meta.filter`. Rendered cells
are never inspected; use an accessor or `filter.getValue(row.original)` when a
badge or other custom component displays the value.

```tsx
{
  id: "status",
  cell: ({ row }) => <Badge>{row.original.status.label}</Badge>,
  meta: {
    filter: {
      variant: "select",
      getValue: row => row.status.value,
      options: statuses,
    },
  },
}
```

## CSV and XLSX export

`DataTable` shows an Export menu by default. Client tables can export all raw
data, the current page, every filtered/sorted row, or selected rows without
additional configuration. “All data” ignores active filters, sorting, and
pagination. All accessor columns are exported, including columns hidden in the
current view. Selection and action columns are skipped because they do not have
accessors.

Use `columnDef.meta.export` to change a heading or exported value, opt a data
column out, or explicitly opt a display-only column in:

```tsx
const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    meta: {
      export: {
        label: "Order total",
        getValue: order => order.total.amount,
      },
    },
  },
  {
    accessorKey: "internalNote",
    meta: { export: { enabled: false } },
  },
];

<DataTable
  data={orders}
  columns={columns}
  exportOptions={{
    fileName: ({ format, scope }) => `orders-${scope}.${format}`,
    sheetName: "Orders",
    onError: error => reportError(error),
  }}
/>;
```

For a server-side table, provide a paged fetcher. The export request contains
the current table state without changing it, plus the requested scope, an
export `pageIndex`, `offset`, requested `limit`, selected row IDs, and an abort
signal. For `scope: "allData"`, the backend should omit the current filters and
sorting. The server may return fewer than `limit` rows, but every response must
include the authoritative total for the requested scope.

```tsx
<DataTable
  data={page.rows}
  columns={columns}
  serverSide
  rowCount={page.total}
  state={tableState}
  onStateChange={setTableState}
  exportOptions={{
    batchSize: 1000,
    fetchPage: async request => {
      const response = await api.orders.list({
        sorting:
          request.scope === "allData"
            ? undefined
            : request.state.sorting,
        filters:
          request.scope === "allData"
            ? undefined
            : request.state.columnFilters,
        search:
          request.scope === "allData"
            ? undefined
            : request.state.globalFilter,
        offset: request.offset,
        limit: request.limit,
        ids:
          request.scope === "selected"
            ? request.selectedRowIds
            : undefined,
        signal: request.signal,
      });
      return { rows: response.items, totalRows: response.total };
    },
  }}
/>;
```

The same engine is available without React. `exportDataTable` returns bytes and
metadata rather than triggering a download, so the result can be saved,
uploaded, attached, or tested. Browser applications can pass the result to
`downloadDataTableExport`.

```tsx
const result = await exportDataTable({
  format: "csv",
  scope: "all",
  columns,
  rows: filteredOrders,
  fileName: "orders",
});

downloadDataTableExport(result);
```

Set `visibility={{ export: false }}` to remove the built-in menu. The exported
`DataTableExportButton` can be rendered in a custom toolbar inside the
`DataTable` provider.
