# DataTable state and URL integration

## Sticky headers and pagination with outer scrolling

```tsx
<DataTable
  data={rows}
  columns={columns}
  stickyHeader
  stickyHeaderOffset={64}
  stickyFooter
  stickyFooterOffset={0}
/>
```

Both options are off by default. `stickyHeaderOffset` reserves space below an
app bar at the top of the outer scrollport; `stickyFooterOffset` reserves space
above a bottom app bar. Offsets are pixels and default to zero. If the app bar
is outside the scrolling area, no extra header offset is needed.

The page or a surrounding `overflow-y: auto` area owns vertical scrolling. Do
not give the table's own wrapper a fixed height or vertical scrollbar in this
mode. Keep intervening layout wrappers free of `overflow: hidden/auto/scroll`
unless they are the intended vertical scroll area, so the sticky pagination
can follow that area.

The visible header uses native CSS `position: sticky` outside the horizontal
scroll wrapper. Vertical scrolling does not run JavaScript positioning or a
transform animation. A hidden, inert header in the body table supplies column
measurements, so content-based widths stay aligned. Only horizontal scroll and
column measurements are synchronized in JavaScript. The accessible table has
one header; the sizing copy is excluded from focus and accessibility navigation.
Custom header components should use `useId()` for DOM IDs rather than hardcoded
IDs, since a sizing copy is also rendered in sticky mode.

Pagination also uses CSS `position: sticky` and stays within the DataTable
boundary. The header stops at the end of the rows. Hiding pagination also hides
the sticky footer.

When `stickyFooter` is enabled, the horizontal scrollbar lives above pagination
inside that footer. It scrolls the same table in either direction and stays in
sync with trackpad scrolling over the rows. It appears only when columns
overflow, and updates when the table or viewport resizes. The original scrollbar
returns when the sticky footer is disabled or pagination is hidden, unless
`stickyScrollbar` is explicitly enabled.

To keep just the horizontal scrollbar sticky while pagination remains at the
end of the table, enable `stickyScrollbar` and leave `stickyFooter` off:

```tsx
<DataTable
  data={rows}
  columns={columns}
  stickyHeader
  stickyScrollbar
  stickyScrollbarOffset={0}
/>
```

`stickyScrollbar` defaults to false and also works when pagination is hidden.
Its bottom offset defaults to zero. If `stickyFooter` is also enabled and
pagination is visible, the scrollbar and pagination share one sticky footer
using `stickyFooterOffset` (no duplicate scrollbar).

Try **Sticky Header and Scrollbar / Normal Pagination**, or the
**Sticky Header and Footer / Outer Container** and **Page Scroll**
Storybook examples, including the LTR/RTL toggle.

## Toolbar visibility

Hide individual toolbar controls using `visibility`. Unspecified controls keep
their defaults, and these options also work with sticky headers and scrollbars.

```tsx
<DataTable
  data={rows}
  columns={columns}
  visibility={{
    viewOptions: false,
    export: false,
    filters: false,
  }}
/>
```

The other toolbar switches are `search` and `reset`. Use
`visibility={{ toolbar: false }}` to hide the entire toolbar, including custom
toolbar content and bulk actions. This does not hide the table's column headers.
`pagination` and `selectionSummary` control the footer elements independently.

`visibility.filters: false` hides both the toolbar Filter button and the
column-header Filter/Edit Filter actions, dialogs, and filter indicators.
Filtering still works through controlled `state.columnFilters`, `state.globalFilter`,
or your custom controls using the table API. Sorting remains available.
For a fully custom filtering UI, hide search and reset separately:

```tsx
<DataTable
  data={rows}
  columns={columns}
  visibility={{ filters: false, search: false, reset: false }}
/>
```

In the sticky Storybook examples, edit the `visibility` object in Controls to
try any combination.

Column-header **Hide Column** actions are available only when the toolbar and
its **View** menu are visible, and the column permits hiding (`enableHiding !== false`).
This prevents users from hiding a column without a way to restore it. The View
menu is available on small screens too and lists all hideable leaf columns,
including custom display columns. Custom controls can still manage
`state.columnVisibility` or use the table API when the built-in controls are hidden.

## State and URL integration

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
## Pagination and virtualized infinite scrolling

Pagination remains the default. Set `mode="infinite"`, or use `defaultMode` and
`showModeSwitch` for a built-in selector. Use `mode` / `onModeChange` to control
the mode from your application. The selector resets `pagination.pageIndex` to 0;
when changing `mode` externally, reset your controlled pagination and data source
in the same update.

```tsx
<DataTable
  data={allRows}
  columns={columns}
  getRowId={row => row.id}
  defaultMode="infinite"
  showModeSwitch
  stickyHeader
  virtualization={{ estimateRowHeight: 56, overscan: 8 }}
/>
```

Client mode sorts and filters the full `data` array before virtualizing it; page
size does not truncate infinite mode. Only visible rows plus overscan are mounted.
Row heights, including expanded content, are measured with ResizeObserver. Column
widths follow TanStack column sizes to avoid shifting as rows enter the viewport.
All visible columns render for each mounted row (horizontal column virtualization
is not enabled). `virtualization` can also be supplied in pagination mode for large
pages. `estimateRowHeight` defaults to 56px, `overscan` to 8, and
`loadMoreThreshold` to 5 rows. Scrolling belongs to the main page: virtualization
automatically follows the nearest vertically scrollable ancestor, or the browser
window. It never creates a fixed-height vertical viewport inside the table.
For an explicit external page scroller, set
`virtualization={{ getScrollElement: () => pageScrollRef.current }}`.
The existing outer-scroller sticky header and footer behavior is preserved.
Sorting, filters, page-size changes and `infiniteScroll.resetKey` return the page
to the table's start if it was scrolled past it; appending rows preserves position.

## Server infinite loading (offsets or cursors)

Pass accumulated pages in `data`. The component calls `onLoadMore` near the end,
including when the initial page does not fill the viewport. It does not increment
`state.pagination.pageIndex` in infinite mode: your data source owns offsets,
cursor tokens, fetching, caching and cancellation. `rowCount` is optional.

```tsx
<DataTable
  serverSide
  mode="infinite"
  data={query.data?.pages.flatMap(page => page.rows) ?? []}
  columns={columns}
  getRowId={row => row.id}
  state={state}
  onStateChange={setState}
  isLoading={query.isPending}
  infiniteScroll={{
    hasNextPage: query.hasNextPage,
    isFetching: query.isFetching,
    onLoadMore: () => query.fetchNextPage(),
    error: query.error,
    resetKey: accountId,
  }}
/>
```

For a cursor endpoint, configure your query's next page parameter from the
response's `nextCursor`, and send that opaque token unchanged on the next request.
For offsets, `onLoadMore` can request `offset: data.length` instead. Return the
request promise so the component can show loading and catch failures, or supply
`isFetching` and `error` when an external query library owns the request.

Automatic requests are deduplicated per query and loaded row count. Failures stop
automatic fetching and show Retry. A response that appends no rows will not cause
a request loop; use Load more or change `resetKey` to re-arm an unchanged range. Set
`hasNextPage=false` at the end. Existing rows remain visible during fetching.

Include sorting, column filters, global search, page size and mode in the server
query key. On changes, replace accumulated rows and reset the cursor/offset;
cancel or ignore responses from the previous query. Pass `isLoading` or
`infiniteScroll.isFetching` while replacing the first page so stale rows cannot
trigger another request. Use stable `getRowId` values for selection and expansion.
Virtualization bounds DOM size; the caller still owns accumulated data in memory.
When switching to pagination, supply only the requested server page; when switching
back to infinite mode, start a new accumulated result set.

## Cursor-based paginated navigation

Use `cursorPagination` for a sequential API, with or without a known total:

```tsx
<DataTable
  serverSide
  data={page.rows}
  columns={columns}
  state={state}
  onStateChange={setState}
  cursorPagination={{
    hasNextPage: page.nextCursor != null,
    hasPreviousPage: cursorHistory.length > 0,
    isFetching,
    onNextPage: () => navigate(page.nextCursor, "next"),
    onPreviousPage: () => navigate(cursorHistory.at(-1), "previous"),
  }}
/>
```

These callbacks replace TanStack's next/previous actions. Your `navigate` handler
owns the cursor history, fetching and `state.pagination.pageIndex` used for the
page label. Reset the history on filter/sort/page-size changes. First/last-page
buttons are hidden and the styled page-number input is read-only because opaque
cursors cannot support random access. Availability flags and `isFetching` determine button availability.
Without a total or `cursorPagination`, offset pagination displays an unknown total
and allows Next; supply availability flags or a known `rowCount`/`pageCount` to
identify the end. Unknown totals are never represented as the loaded page length.
