import React from "react";
import { DataTable, DataTableColumnHeader } from "../../data-table";
import { Badge } from "../../badge";
import type { RegistryComponent } from "../types";

const MOCK_COLUMNS = [
  {
    accessorKey: "id",
    header: ({ column }: any) => <DataTableColumnHeader column={column} title="ID" />,
  },
  {
    accessorKey: "status",
    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }: any) => {
      const status = row.getValue("status");
      return (
        <Badge variant={status === "Paid" ? "primary" : status === "Pending" ? "secondary" : "destructive"} shape="minimal">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "client",
    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Client" />,
  },
  {
    accessorKey: "amount",
    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }: any) => <div className="font-mono font-medium">{row.getValue("amount")}</div>,
  },
];

const MOCK_DATA = [
  { id: "INV-001", status: "Paid", client: "Acme Corp", amount: "$1,250.00" },
  { id: "INV-002", status: "Pending", client: "Globex Inc", amount: "$850.00" },
  { id: "INV-003", status: "Overdue", client: "Initech", amount: "$4,500.00" },
  { id: "INV-004", status: "Paid", client: "Soylent Corp", amount: "$230.00" },
  { id: "INV-005", status: "Pending", client: "Umbrella Corp", amount: "$3,100.00" },
];

export const DataTableConfig: RegistryComponent = {
  name: "Data Table",
  category: "Data Display",
  render: ({ variant, density, isLoading, ...props }) => (
    <div className="w-full" {...props}>
      <DataTable
        data={MOCK_DATA}
        columns={MOCK_COLUMNS}
        variant={variant}
        density={density}
        isLoading={isLoading}
      />
    </div>
  ),
  controls: {
    variant: {
      type: "select",
      label: "Visual Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary (Surfaced Box)", value: "primary" },
        { label: "Secondary (Transparent/Minimal)", value: "secondary" },
      ],
    },
    density: {
      type: "select",
      label: "Row Density",
      group: "Layout",
      defaultValue: "default",
      options: [
        { label: "Default (Spacious)", value: "default" },
        { label: "Compact (Dense)", value: "compact" },
      ],
    },
    isLoading: {
      type: "boolean",
      label: "Loading State (Skeleton)",
      group: "State",
      defaultValue: false,
    },
  },
};
