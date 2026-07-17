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
