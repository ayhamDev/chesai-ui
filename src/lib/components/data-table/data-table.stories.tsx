import type { Meta, StoryObj } from "@storybook/react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../badge";
import { Button } from "../button";
import { Card } from "../card";
import { Checkbox } from "../checkbox";
import { ContextMenu } from "../context-menu"; // Import ContextMenu
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { DataTableColumnHeader } from "./column-header";
import { type AdvancedFilterValue } from "./filter-utils";
import { DataTable, advancedFilterFn } from "./index";

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
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Amount"
        enableColumnFilter
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
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
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
    <DataTable data={sampleData} columns={columns} density={args.density} />
  ),
};

export const WithBulkActions: Story = {
  name: "2. With Bulk Actions",
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
  name: "3. With Context Menu",
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
      // Provide the content of the menu. The trigger is handled by the Table row.
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
  name: "4. Server-Side Simulation",
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

        // 1. Global Search (Server-side)
        if (globalFilter) {
          const lowerFilter = globalFilter.toLowerCase();
          filteredData = filteredData.filter(
            (item) =>
              item.email.toLowerCase().includes(lowerFilter) ||
              item.status.toLowerCase().includes(lowerFilter),
          );
        }

        // 2. Column Filtering (Server-side)
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

        // 3. Sorting
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

        // 4. Pagination
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
        // Just to demonstrate smooth transitions between states
        isLoading={isLoading && data.length === 0}
      />
    );
  },
};

export const ServerSideSimulationWithSkeleton: Story = {
  name: "5. Server-Side Simulation With Skeleton",
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
      // Forcing empty data briefly to ensure skeleton shows during "fetch"
      setData([]);

      const timer = setTimeout(() => {
        let filteredData = [...sampleData];

        // Logic mirroring backend...
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
              if (op === "eq") return String(itemValue) == String(val);
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
