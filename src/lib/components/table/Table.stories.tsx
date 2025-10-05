import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../badge";
import { Button } from "../button";
import { Card } from "../card";
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
          "A versatile and responsive data table, now powered by TanStack Table. It displays data in a standard tabular format on desktop and transforms into a specified layout (cards, accordion, or scrollable) on mobile viewports.",
      },
    },
  },
  argTypes: {
    responsiveLayout: {
      control: "select",
      options: ["card", "accordion", "scroll"],
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
    table: { control: false }, // The table instance is now the main prop
    rowProps: { control: false },
    accordionDetailsProps: { control: false },
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
    meta: {
      isAccordionHeader: true,
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: (info) => `$${info.getValue<number>().toLocaleString()}`,
    meta: {
      isAccordionHeader: true,
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
  },
  {
    accessorKey: "period",
    header: "Period",
  },
];

// --- STORIES ---

export const DesktopView: Story = {
  name: "1. Desktop View",
  args: {},
  parameters: {
    viewport: { defaultViewport: "responsive" },
    docs: {
      description: {
        story:
          "This is the default table layout on viewports wider than the specified `breakpoint` (md by default).",
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
      <Card className="w-full overflow-hidden">
        <Table<Payment> {...args} table={table} />
      </Card>
    );
  },
};

export const CardLayout: Story = {
  name: "2. Responsive: Card Layout",
  args: {
    responsiveLayout: "card",
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "Set `responsiveLayout='card'`. On mobile viewports, each row transforms into a distinct `Card`.",
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
      <Card>
        <Table<Payment> {...args} table={table} />
      </Card>
    );
  },
};

export const AccordionLayout: Story = {
  name: "3. Responsive: Accordion Layout",
  args: {
    responsiveLayout: "accordion",
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "Set `responsiveLayout='accordion'`. Each row becomes a collapsible item. Columns with `meta: { isAccordionHeader: true }` will be visible in the collapsed state.",
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
      <Card>
        <Table<Payment> {...args} table={table} />
      </Card>
    );
  },
};

export const ScrollLayout: Story = {
  name: "4. Responsive: Scroll Layout (Default)",
  args: {
    responsiveLayout: "scroll",
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "Set `responsiveLayout='scroll'`. The table container becomes horizontally scrollable, with the first column remaining sticky for context.",
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
      <Card>
        <Table<Payment> {...args} table={table} />
      </Card>
    );
  },
};

const columnsWithCustomCells: ColumnDef<Payment>[] = [
  {
    accessorKey: "account",
    header: "Account",
    meta: {
      isAccordionHeader: true,
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: (info) => `$${info.getValue<number>().toLocaleString()}`,
    meta: {
      isAccordionHeader: true,
    },
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
  {
    id: "actions",
    header: "Actions",
    cell: () => (
      <Button size="xs" variant="ghost" shape="minimal">
        View Details
      </Button>
    ),
  },
];

export const CustomCells: Story = {
  name: "5. With Custom Cells",
  args: {
    responsiveLayout: "accordion",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `cell` property in the `columns` definition allows you to render custom components, like Badges or Buttons, within a cell.",
      },
    },
  },
  render: (args) => {
    const table = useReactTable({
      data: sampleData,
      columns: columnsWithCustomCells,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <Card>
        <Table<Payment> {...args} table={table} />
      </Card>
    );
  },
};

export const CustomizedRow: Story = {
  name: "6. Customized Row",
  args: {
    responsiveLayout: "card",
    rowProps: (row) => ({
      variant: row.original.status === "Overdue" ? "selected" : "secondary",
      onClick: () => alert(`Clicked on account: ${row.original.account}`),
      className: "cursor-pointer",
    }),
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "You can pass `Card` props to each row using the `rowProps` function. This allows for conditional styling, click handlers, and more.",
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
      <Card>
        <Table<Payment> {...args} table={table} />
      </Card>
    );
  },
};

export const AdvancedCustomization: Story = {
  name: "7. Advanced Customization",
  args: {
    responsiveLayout: "accordion",
    stickyCellVariant: "secondary",
    accordionDetailsProps: {
      className: "bg-graphite-background",
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use `stickyCellVariant` to change the sticky column's background in scroll mode. Use `accordionDetailsProps` to style the expanded content area in accordion mode.",
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
      <Card>
        <Table<Payment> {...args} table={table} />
      </Card>
    );
  },
};
