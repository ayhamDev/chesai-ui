import type { Meta, StoryObj } from "@storybook/react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";
import { Badge } from "../badge";
import { Card } from "../card";
import { Typography } from "../typography";
import { Table, type TableRootProps } from "./index";

const meta: Meta<TableRootProps<Payment>> = {
  title: "Components/Data/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile and responsive data table powered by TanStack Table. It displays data in a standard table on desktop and can transform into a horizontally scrollable table or a fully custom layout on mobile.",
      },
    },
  },
  argTypes: {
    responsiveLayout: {
      control: "select",
      options: ["scroll", "custom"],
      description: "Determines the table's layout on mobile viewports.",
    },
    breakpoint: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "The viewport width at which the layout becomes responsive.",
    },
    stickyCellVariant: {
      control: "select",
      options: ["card", "secondary"],
      description: "Background color for the sticky column in 'scroll' mode.",
    },
    table: { control: false },
    renderMobileRow: { control: false },
  },
};

export default meta;
type Story = StoryObj<TableRootProps<Payment>>;

// --- Sample Data and Columns ---
interface Payment {
  id: string;
  account: string;
  amount: number;
  dueDate: string;
  period: string;
  status: "Paid" | "Pending" | "Overdue";
}

const sampleData: Payment[] = [
  {
    id: "1",
    account: "Visa - 3412",
    amount: 1190,
    dueDate: "04/01/2016",
    period: "03/01/2016 - 03/31/2016",
    status: "Paid",
  },
  {
    id: "2",
    account: "Visa - 6067",
    amount: 2443,
    dueDate: "03/01/2016",
    period: "02/01/2016 - 02/29/2016",
    status: "Paid",
  },
  {
    id: "3",
    account: "Corporate AMEX",
    amount: 1181,
    dueDate: "03/01/2016",
    period: "02/01/2016 - 02/29/2016",
    status: "Overdue",
  },
  {
    id: "4",
    account: "Visa - 3412",
    amount: 842,
    dueDate: "02/01/2016",
    period: "01/01/2016 - 01/31/2016",
    status: "Pending",
  },
];

const basicColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: "account",
    header: "Account",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: (info) => `$${info.getValue<number>().toLocaleString()}`,
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
  },
  {
    accessorKey: "period",
    header: "Period",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => {
      const status = info.getValue<Payment["status"]>();
      const variant = {
        Paid: "primary",
        Pending: "secondary",
        Overdue: "destructive",
      }[status] as "primary" | "secondary" | "destructive";
      return (
        <Badge variant={variant} shape="full">
          {status}
        </Badge>
      );
    },
  },
];

// --- STORIES ---

export const DesktopView: Story = {
  name: "1. Desktop View",
  args: {},
  parameters: {
    viewport: { defaultViewport: "responsive" },
  },
  render: (args) => {
    const table = useReactTable({
      data: sampleData,
      columns: basicColumns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <Card className="w-full max-w-4xl overflow-hidden">
        <Table<Payment> {...args} table={table} />
      </Card>
    );
  },
};

export const ScrollLayout: Story = {
  name: "2. Responsive: Scroll Layout",
  args: {
    responsiveLayout: "scroll",
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: (args) => {
    const table = useReactTable({
      data: sampleData,
      columns: basicColumns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <Card className="w-full">
        <Table<Payment> {...args} table={table} />
      </Card>
    );
  },
};

export const CustomMobileLayout: Story = {
  name: "3. Responsive: Custom Layout",
  args: {
    responsiveLayout: "custom",
    renderMobileRow: (row: Row<Payment>) => (
      <Card
        shape="minimal"
        variant={"primary"}
        isSelected={row.original.status === "Overdue"}
        padding="lg"
        onClick={() => alert(`Clicked on account: ${row.original.account}`)}
        className="cursor-pointer"
      >
        <div className="flex flex-col gap-8">
          {/* Main Info */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <Typography variant="muted" className="!mt-0 !text-xs">
                Account
              </Typography>
              <Typography variant="p" className="!mt-0 font-semibold truncate">
                {row.original.account}
              </Typography>
            </div>
            <div>
              <Typography variant="muted" className="!mt-0 !text-xs text-right">
                Amount
              </Typography>
              <Typography variant="p" className="!mt-0 font-semibold truncate">
                ${row.original.amount.toLocaleString()}
              </Typography>
            </div>
          </div>
          {/* Secondary Info */}
          <div className="flex justify-between items-center gap-8">
            {row.getVisibleCells().map((cell) => {
              // We've already rendered 'account' and 'amount', so we skip them.
              if (["account", "amount"].includes(cell.column.id)) return null;
              return (
                <div key={cell.id}>
                  <Typography variant="muted" className="!mt-0 !text-xs">
                    {cell.column.columnDef.header as React.ReactNode}
                  </Typography>
                  <Typography variant="small" className="!mt-0 font-semibold">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Typography>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    ),
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "Set `responsiveLayout='custom'` and provide a `renderMobileRow` function. This function receives the `row` object, giving you complete control to render it as a card, an accordion, or any other custom component.",
      },
    },
  },
  render: (args) => {
    const table = useReactTable({
      data: sampleData,
      columns: basicColumns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <div className="w-full">
        <Table<Payment> {...args} table={table} />
      </div>
    );
  },
};
