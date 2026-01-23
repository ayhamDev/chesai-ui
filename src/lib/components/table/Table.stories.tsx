import type { Meta, StoryObj } from "@storybook/react";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Badge } from "../badge";
import { Card } from "../card";
import { Table, type TableRootProps } from "./index";

const meta: Meta<TableRootProps<any>> = {
  title: "Components/Data/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost"],
      description: "Visual style of the table",
    },
    density: {
      control: "select",
      options: ["default", "compact"],
    },
  },
};

export default meta;
type Story = StoryObj<TableRootProps<any>>;

interface Invoice {
  invoice: string;
  status: string;
  method: string;
  amount: string;
}

const invoices: Invoice[] = [
  {
    invoice: "INV001",
    status: "Paid",
    method: "Credit Card",
    amount: "$250.00",
  },
  { invoice: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
  {
    invoice: "INV003",
    status: "Unpaid",
    method: "Bank Transfer",
    amount: "$350.00",
  },
  {
    invoice: "INV004",
    status: "Paid",
    method: "Credit Card",
    amount: "$450.00",
  },
  { invoice: "INV005", status: "Paid", method: "PayPal", amount: "$550.00" },
];

const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoice",
    header: "Invoice",
    cell: (info) => (
      <span className="font-medium">{info.getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => {
      const status = info.getValue<string>();
      const variant =
        status === "Paid"
          ? "primary"
          : status === "Pending"
            ? "secondary"
            : "destructive";
      return (
        <Badge variant={variant} shape="minimal">
          {status}
        </Badge>
      );
    },
  },
  { accessorKey: "method", header: "Method" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: (info) => (
      <span className="text-right block font-medium">
        {info.getValue<string>()}
      </span>
    ),
  },
];

const TableTemplate = (args: any) => {
  const table = useReactTable({
    data: invoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <Table {...args} table={table} />;
};

export const Primary: Story = {
  args: { variant: "primary" },
  render: TableTemplate,
};

export const Secondary: Story = {
  name: "Secondary (Minimal)",
  args: { variant: "secondary" },
  render: (args) => (
    <Card variant="secondary" className="p-6">
      <TableTemplate {...args} />
    </Card>
  ),
};

export const Ghost: Story = {
  name: "3. Ghost (Header Only BG)",
  args: { variant: "ghost" },
  parameters: {
    docs: {
      description: {
        story:
          "The `ghost` variant features a transparent body with minimal row borders, but retains a solid background for the header to maintain structural hierarchy.",
      },
    },
  },
  render: TableTemplate,
};
