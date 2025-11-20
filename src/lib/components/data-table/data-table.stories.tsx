import type { Meta, StoryObj } from "@storybook/react";
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Timer,
  Copy,
  Trash2,
  Eye,
  Mail,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Badge } from "../badge";
import { Button } from "../button";
import { Card } from "../card";
import { Checkbox } from "../checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { DataTableColumnHeader } from "./column-header";
import { DataTable, advancedFilterFn } from "./index";
import { ContextMenu } from "../context-menu";
import { type AdvancedFilterValue } from "./filter-utils";

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
        (status) => status.value === row.getValue("status")
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

export const Default: Story = {
  name: "1. Default Table",
  render: (args) => (
    <Card className="w-full">
      <DataTable data={sampleData} columns={columns} density={args.density} />
    </Card>
  ),
};

export const WithBulkActions: Story = {
  name: "2. With Bulk Actions",
  render: (args) => (
    <Card className="w-full">
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
    </Card>
  ),
};

export const ServerSideSimulation: Story = {
  name: "3. Server-Side Simulation",
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
              item.status.toLowerCase().includes(lowerFilter)
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
              if (op === "eq") return String(itemValue) == String(val);
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
      <Card className="w-full min-h-[600px]">
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
        />
      </Card>
    );
  },
};
export const ServerSideSimulationWithSkeleton: Story = {
  name: "3. Server-Side Simulation With Skeleton",
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
      // setData([]); // Optional: Clear data to show full skeleton, or keep it for "background refresh" feel.

      const timer = setTimeout(() => {
        let filteredData = [...sampleData];

        // 1. Global Search (Server-side)
        if (globalFilter) {
          const lowerFilter = globalFilter.toLowerCase();
          filteredData = filteredData.filter(
            (item) =>
              item.email.toLowerCase().includes(lowerFilter) ||
              item.status.toLowerCase().includes(lowerFilter)
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
              if (op === "eq") return String(itemValue) == String(val);
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
      }, 1500); // Increased timeout to 1500ms to clearly see the skeleton

      return () => clearTimeout(timer);
    }, [pagination, sorting, columnFilters, globalFilter]);

    return (
      <Card className="w-full min-h-[600px]">
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
          isLoading={isLoading} // <--- Pass the state here
        />
      </Card>
    );
  },
};
