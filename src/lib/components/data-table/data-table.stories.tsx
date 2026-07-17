import type { Meta, StoryObj } from "@storybook/react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  functionalUpdate,
  getCoreRowModel, // Imported for sub-table
  useReactTable, // Imported for sub-table
} from "@tanstack/react-table";
import {
  CheckCircle2,
  Copy,
  HelpCircle,
  Mail,
  MoreHorizontal,
  Pen,
  Timer,
  Trash2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "../badge";
import { Button } from "../button";
import { Card } from "../card";
import { Checkbox } from "../checkbox";
import { ContextMenu } from "../context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { Table } from "../table"; // Imported base Table component
import { Typography } from "../typography";
import { Input } from "../input";
import { DataTableColumnHeader } from "./column-header";
import { type AdvancedFilterValue } from "./filter-utils";
import {
  DataTable,
  advancedFilterFn,
  createDataTableUrlCodec,
  type DataTableState,
  type DataTableUrlState,
} from "./index";

const meta: Meta<typeof DataTable> = {
  title: "Components/Data/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    density: {
      control: "select",
      options: ["default", "compact"],
    },
    data: { control: false },
    columns: { control: false },
    isLoading: { control: "boolean" },
    hideToolbar: { control: "boolean" },
    visibility: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

// --- Mock Data ---
type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
  priority: "low" | "medium" | "high";
};

const statuses = [
  { value: "pending", label: "Pending", icon: Timer },
  { value: "processing", label: "Processing", icon: HelpCircle },
  { value: "success", label: "Success", icon: CheckCircle2 },
  { value: "failed", label: "Failed", icon: XCircle },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const generateData = (count: number): Payment[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: `PAY-${i + 1}`,
    amount: Math.floor(Math.random() * 1000) + 10,
    status: ["pending", "processing", "success", "failed"][
      Math.floor(Math.random() * 4)
    ] as any,
    priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as any,
    email: `user-${i + 1}@example.com`,
  }));

const sampleData = generateData(100);

// --- Columns ---
const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(!!e.target.checked)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status"),
      );

      if (!status) return null;

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    meta: {
      filter: {
        variant: "select",
        label: "Payment status",
        options: statuses.map(status => ({
          value: status.value,
          label: status.label,
        })),
      },
    },
    filterFn: advancedFilterFn,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    meta: {
      filter: {
        variant: "custom",
        label: "Customer email",
        operators: ["contains"],
        defaultOperator: "contains",
        parse: values => values[0],
        serialize: value => [String(value)],
        renderEditor: ({ value, onValueChange }) => (
          <Input
            size="sm"
            variant="filled"
            type="email"
            placeholder="name@example.com"
            value={String(value ?? "")}
            onValueChange={onValueChange}
          />
        ),
      },
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Amount"
      />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
    meta: {
      filter: {
        variant: "number",
        label: "Amount",
        defaultOperator: "gte",
      },
    },
    filterFn: advancedFilterFn,
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      return (
        <Badge
          variant={priority === "high" ? "destructive" : "secondary"}
          shape="minimal"
          className="capitalize"
        >
          {priority}
        </Badge>
      );
    },
    meta: {
      filter: {
        variant: "multi-select",
        label: "Priority",
        options: priorities,
      },
    },
    filterFn: advancedFilterFn,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(row.original.id)}
          >
            Copy payment ID
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// --- STORIES ---

export const Default: Story = {
  args: {
    variant: "secondary",
  },
  name: "1. Default Table",
  render: (args) => (
    <DataTable
      data={sampleData}
      columns={columns}
      density={args.density}
      variant="secondary"
    />
  ),
};

export const WithoutToolbar: Story = {
  args: {
    variant: "secondary",
    hideToolbar: true,
  },
  name: "2. Without Toolbar",
  render: (args) => (
    <DataTable
      data={sampleData}
      columns={columns}
      density={args.density}
      hideToolbar={args.hideToolbar}
    />
  ),
};

export const GranularControls: Story = {
  name: "3. Granular Controls",
  parameters: {
    docs: {
      description: {
        story:
          "The search, filter builder, view menu, reset action, pagination, and selection summary can be hidden independently without disabling controlled state.",
      },
    },
  },
  render: args => (
    <DataTable
      data={sampleData}
      columns={columns}
      density={args.density}
      variant="secondary"
      visibility={{
        search: false,
        viewOptions: false,
        export: false,
        selectionSummary: false,
      }}
    />
  ),
};

export const ClientExportScopes: Story = {
  name: "5. CSV/XLSX Export (Client)",
  parameters: {
    docs: {
      description: {
        story:
          "The Export menu supports all raw data, the current page, all filtered rows, and selected rows. Email starts hidden from the table but remains in the exported file because export includes all data columns by default.",
      },
    },
  },
  render: args => (
    <DataTable
      data={sampleData}
      columns={columns}
      density={args.density}
      variant="secondary"
      getRowId={row => row.id}
      initialState={{
        pagination: { pageIndex: 0, pageSize: 10 },
        columnVisibility: { email: false },
        rowSelection: { "PAY-1": true, "PAY-3": true },
      }}
      exportOptions={{
        fileName: ({ scope }) => `payments-${scope}`,
        sheetName: "Payments",
      }}
    />
  ),
};

export const TypedAndCustomFilters: Story = {
  name: "4. Typed and Custom Filters",
  parameters: {
    docs: {
      description: {
        story:
          "Status uses a single select, priority uses a multi-select, amount only exposes numeric operators, and email supplies a custom editor. Badge cells filter through their raw accessor values.",
      },
    },
  },
  render: args => (
    <DataTable
      data={sampleData}
      columns={columns}
      density={args.density}
      variant="secondary"
    />
  ),
};

export const WithBulkActions: Story = {
  name: "3. With Bulk Actions",
  render: (args) => (
    <DataTable
      data={sampleData}
      columns={columns}
      density={args.density}
      bulkActions={(table) => {
        const selectedCount = table.getFilteredSelectedRowModel().rows.length;
        return (
          <>
            <Button
              size="sm"
              variant="destructive"
              startIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => {
                alert(`Deleting ${selectedCount} items`);
                table.resetRowSelection();
              }}
            >
              Delete ({selectedCount})
            </Button>
            <Button
              size="sm"
              variant="secondary"
              startIcon={<Mail className="h-4 w-4" />}
              onClick={() => alert(`Emailing ${selectedCount} users`)}
            >
              Email
            </Button>
          </>
        );
      }}
    />
  ),
};

export const WithContextMenu: Story = {
  name: "4. With Context Menu",
  parameters: {
    docs: {
      description: {
        story:
          "Right-click (or long-press on touch devices) on any row to reveal context-specific actions. The `renderContextMenu` prop wraps the row internally with the ContextMenu trigger.",
      },
    },
  },
  render: (args) => (
    <DataTable
      data={sampleData}
      columns={columns}
      density={args.density}
      renderContextMenu={(row) => (
        <ContextMenu.Content>
          <ContextMenu.Item
            onClick={() => alert(`Editing ${row.original.email}`)}
          >
            <Pen className="mr-2 h-4 w-4" />
            Edit Payment
          </ContextMenu.Item>
          <ContextMenu.Item
            onClick={() => navigator.clipboard.writeText(row.original.id)}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy ID
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item className="text-red-500 focus:bg-red-50">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      )}
    />
  ),
};

export const ServerSideSimulation: Story = {
  name: "5. Server-Side Simulation",
  render: function Render() {
    const [data, setData] = useState<Payment[]>([]);
    const [pageCount, setPageCount] = useState(0);
    const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      setIsLoading(true);
      const timer = setTimeout(() => {
        let filteredData = [...sampleData];

        if (globalFilter) {
          const lowerFilter = globalFilter.toLowerCase();
          filteredData = filteredData.filter(
            (item) =>
              item.email.toLowerCase().includes(lowerFilter) ||
              item.status.toLowerCase().includes(lowerFilter),
          );
        }

        if (columnFilters.length > 0) {
          columnFilters.forEach((filter) => {
            const { id, value } = filter;
            const filterVal = value as AdvancedFilterValue;
            const op = filterVal.operator || "contains";
            const val = filterVal.value ?? filterVal;

            filteredData = filteredData.filter((item) => {
              const itemValue = item[id as keyof Payment];
              if (op === "eq") return String(itemValue) === String(val);
              if (op === "gt") return Number(itemValue) > Number(val);
              if (op === "lt") return Number(itemValue) < Number(val);
              return String(itemValue)
                .toLowerCase()
                .includes(String(val).toLowerCase());
            });
          });
        }

        if (sorting.length > 0) {
          const { id, desc } = sorting[0];
          filteredData.sort((a, b) => {
            // @ts-ignore
            if (a[id] < b[id]) return desc ? 1 : -1;
            // @ts-ignore
            if (a[id] > b[id]) return desc ? -1 : 1;
            return 0;
          });
        }

        const totalRows = filteredData.length;
        const start = pagination.pageIndex * pagination.pageSize;
        const end = start + pagination.pageSize;
        const safeStart = Math.min(start, totalRows);
        const safeEnd = Math.min(end, totalRows);
        const slicedData = filteredData.slice(safeStart, safeEnd);

        setData(slicedData);
        setPageCount(Math.ceil(totalRows / pagination.pageSize));
        setIsLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }, [pagination, sorting, columnFilters, globalFilter]);

    return (
      <DataTable
        data={data}
        columns={columns}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        isLoading={isLoading && data.length === 0}
      />
    );
  },
};

export const ServerSideSimulationWithSkeleton: Story = {
  name: "6. Server-Side Simulation With Skeleton",
  render: function Render() {
    const [data, setData] = useState<Payment[]>([]);
    const [pageCount, setPageCount] = useState(0);
    const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      setIsLoading(true);
      setData([]);

      const timer = setTimeout(() => {
        let filteredData = [...sampleData];

        if (globalFilter) {
          const lowerFilter = globalFilter.toLowerCase();
          filteredData = filteredData.filter(
            (item) =>
              item.email.toLowerCase().includes(lowerFilter) ||
              item.status.toLowerCase().includes(lowerFilter),
          );
        }

        if (columnFilters.length > 0) {
          columnFilters.forEach((filter) => {
            const { id, value } = filter;
            const filterVal = value as AdvancedFilterValue;
            const op = filterVal.operator || "contains";
            const val = filterVal.value ?? filterVal;

            filteredData = filteredData.filter((item) => {
              const itemValue = item[id as keyof Payment];
              if (op === "eq") return String(itemValue) === String(val);
              if (op === "gt") return Number(itemValue) > Number(val);
              if (op === "lt") return Number(itemValue) < Number(val);
              return String(itemValue)
                .toLowerCase()
                .includes(String(val).toLowerCase());
            });
          });
        }

        if (sorting.length > 0) {
          const { id, desc } = sorting[0];
          filteredData.sort((a, b) => {
            // @ts-ignore
            if (a[id] < b[id]) return desc ? 1 : -1;
            // @ts-ignore
            if (a[id] > b[id]) return desc ? -1 : 1;
            return 0;
          });
        }

        const totalRows = filteredData.length;
        const start = pagination.pageIndex * pagination.pageSize;
        const end = start + pagination.pageSize;
        const safeStart = Math.min(start, totalRows);
        const safeEnd = Math.min(end, totalRows);
        const slicedData = filteredData.slice(safeStart, safeEnd);

        setData(slicedData);
        setPageCount(Math.ceil(totalRows / pagination.pageSize));
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }, [pagination, sorting, columnFilters, globalFilter]);

    return (
      <DataTable
        data={data}
        columns={columns}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        isLoading={isLoading}
      />
    );
  },
};

export const ServerSideUrlState: Story = {
  name: "7. Server Side + URL State",
  parameters: {
    docs: {
      description: {
        story:
          "The table owns no router integration. A pure codec reads and writes its controlled state while preserving Storybook's unrelated URL parameters; the same calls can be used inside nuqs, Next.js, React Router, or TanStack Router setters.",
      },
    },
  },
  render: function Render() {
    const codec = useMemo(
      () =>
        createDataTableUrlCodec({
          columns,
          namespace: "payments",
        }),
      [],
    );
    const [urlState, setUrlState] = useState<DataTableUrlState>(() =>
      codec.parse(new URLSearchParams(window.location.search)),
    );

    useEffect(() => {
      const params = codec.write(
        new URLSearchParams(window.location.search),
        urlState,
      );
      const query = params.toString();
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}`,
      );
    }, [codec, urlState]);

    const filtered = useMemo(() => {
      let result = [...sampleData];
      if (urlState.globalFilter) {
        const search = urlState.globalFilter.toLowerCase();
        result = result.filter(
          payment =>
            payment.email.toLowerCase().includes(search) ||
            payment.status.toLowerCase().includes(search) ||
            payment.priority.toLowerCase().includes(search),
        );
      }
      for (const filter of urlState.columnFilters) {
        const filterValue = filter.value as AdvancedFilterValue;
        const value = filterValue.value;
        result = result.filter(payment => {
          const candidate = payment[filter.id as keyof Payment];
          if (filterValue.operator === "in") {
            return Array.isArray(value) && value.includes(candidate as never);
          }
          if (filterValue.operator === "notIn") {
            return Array.isArray(value) && !value.includes(candidate as never);
          }
          if (filterValue.operator === "gt") {
            return Number(candidate) > Number(value);
          }
          if (filterValue.operator === "gte") {
            return Number(candidate) >= Number(value);
          }
          if (filterValue.operator === "lt") {
            return Number(candidate) < Number(value);
          }
          if (filterValue.operator === "lte") {
            return Number(candidate) <= Number(value);
          }
          if (filterValue.operator === "eq") {
            return String(candidate) === String(value);
          }
          if (filterValue.operator === "neq") {
            return String(candidate) !== String(value);
          }
          return String(candidate)
            .toLowerCase()
            .includes(String(value).toLowerCase());
        });
      }
      for (const sort of [...urlState.sorting].reverse()) {
        result.sort((left, right) => {
          const a = left[sort.id as keyof Payment];
          const b = right[sort.id as keyof Payment];
          if (a === b) return 0;
          return (a < b ? -1 : 1) * (sort.desc ? -1 : 1);
        });
      }
      return result;
    }, [urlState]);

    const start =
      urlState.pagination.pageIndex * urlState.pagination.pageSize;
    const page = filtered.slice(
      start,
      start + urlState.pagination.pageSize,
    );
    const fullState: DataTableState = {
      ...urlState,
      rowSelection: {},
      expanded: {},
    };

    return (
      <div className="flex flex-col gap-3">
        <DataTable
          data={page}
          columns={columns}
          serverSide
          rowCount={filtered.length}
          state={urlState}
          getRowId={row => row.id}
          onStateChange={updater => {
            const next = functionalUpdate(updater, fullState);
            setUrlState({
              pagination: next.pagination,
              sorting: next.sorting,
              columnFilters: next.columnFilters,
              globalFilter: next.globalFilter,
              columnVisibility: next.columnVisibility,
            });
          }}
          exportOptions={{
            fileName: ({ scope }) => `payments-${scope}`,
            sheetName: "Payments",
            batchSize: 25,
            fetchPage: async ({
              offset,
              limit,
              signal,
              scope,
              selectedRowIds,
            }) => {
              await new Promise<void>((resolve, reject) => {
                const timer = window.setTimeout(resolve, 150);
                signal.addEventListener(
                  "abort",
                  () => {
                    window.clearTimeout(timer);
                    reject(new DOMException("Aborted", "AbortError"));
                  },
                  { once: true },
                );
              });
              const serverLimit = Math.min(limit, 17);
              const exportRows =
                scope === "selected"
                  ? filtered.filter(payment =>
                      selectedRowIds.includes(payment.id),
                    )
                  : scope === "allData"
                    ? sampleData
                    : filtered;
              return {
                rows: exportRows.slice(offset, offset + serverLimit),
                totalRows: exportRows.length,
              };
            },
          }}
        />
        <Typography variant="body-small" className="break-all opacity-70">
          {codec
            .write(new URLSearchParams(), urlState)
            .toString()}
        </Typography>
      </div>
    );
  },
};

// ==========================================
// COLLAPSIBLE ROWS IMPLEMENTATION
// ==========================================

// --- Collapsible Mock Data ---
type HistoryEntry = {
  date: string;
  customerId: string;
  amount: number;
  price: number;
};

type Dessert = {
  id: string;
  name: string;
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
  price: number;
  history: HistoryEntry[];
};

const dessertData: Dessert[] = [
  {
    id: "1",
    name: "Frozen yoghurt",
    calories: 159,
    fat: 6.0,
    carbs: 24,
    protein: 4.0,
    price: 3.99,
    history: [
      { date: "2020-01-05", customerId: "11091700", amount: 3, price: 11.97 },
      { date: "2020-01-02", customerId: "Anonymous", amount: 1, price: 3.99 },
    ],
  },
  {
    id: "2",
    name: "Ice cream sandwich",
    calories: 237,
    fat: 9.0,
    carbs: 37,
    protein: 4.3,
    price: 4.99,
    history: [
      { date: "2020-01-02", customerId: "Anonymous", amount: 1, price: 4.99 },
    ],
  },
  {
    id: "3",
    name: "Eclair",
    calories: 262,
    fat: 16.0,
    carbs: 24,
    protein: 6.0,
    price: 3.79,
    history: [
      { date: "2020-01-02", customerId: "11091700", amount: 2, price: 7.58 },
    ],
  },
];

const dessertColumns: ColumnDef<Dessert>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={row.getToggleExpandedHandler()}
        >
          {row.getIsExpanded() ? (
            <ChevronUp className="h-4 w-4 text-on-surface-variant" />
          ) : (
            <ChevronDown className="h-4 w-4 text-on-surface-variant" />
          )}
        </Button>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Dessert (100g serving)",
  },
  {
    accessorKey: "calories",
    header: () => <div className="text-right">Calories</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("calories")}</div>
    ),
  },
  {
    accessorKey: "fat",
    header: () => <div className="text-right">Fat (g)</div>,
    cell: ({ row }) => <div className="text-right">{row.getValue("fat")}</div>,
  },
  {
    accessorKey: "carbs",
    header: () => <div className="text-right">Carbs (g)</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("carbs")}</div>
    ),
  },
  {
    accessorKey: "protein",
    header: () => <div className="text-right">Protein (g)</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("protein")}</div>
    ),
  },
];

// Sub-Component to render the internal Table utilizing your existing Table component
const HistorySubTable = ({ data }: { data: HistoryEntry[] }) => {
  const columns = useMemo<ColumnDef<HistoryEntry>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
      },
      {
        accessorKey: "customerId",
        header: "Customer",
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => (
          <div className="text-right">{row.getValue("amount")}</div>
        ),
      },
      {
        accessorKey: "price",
        header: () => <div className="text-right">Total price ($)</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("price"));
          return <div className="text-right">{amount.toFixed(2)}</div>;
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full">
      <Table table={table} variant="ghost" density="compact" />
    </div>
  );
};

export const CollapsibleRows: Story = {
  name: "7. Collapsible Rows",
  parameters: {
    docs: {
      description: {
        story: "Replicating the Material-UI collapsible table experience.",
      },
    },
  },
  render: (args) => (
    <DataTable
      data={dessertData}
      columns={dessertColumns}
      density={args.density}
      variant="primary"
      renderExpandedRow={(row) => (
        <div className="bg-surface-container-lowest border-x border-outline-variant/30 mb-2 rounded-lg">
          {/* Replaced raw HTML table with your custom Table component */}
          <HistorySubTable data={row.original.history} />
        </div>
      )}
    />
  ),
};
