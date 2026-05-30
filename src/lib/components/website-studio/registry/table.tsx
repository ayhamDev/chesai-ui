import React from "react";
import { Table } from "../../table";
import { Badge } from "../../badge";
import type { RegistryComponent } from "../types";

export const TableConfig: RegistryComponent = {
  name: "Standard Table",
  category: "Data Display",
  render: ({ variant, density, ...props }) => (
    <div className="w-full" {...props}>
      <Table variant={variant} density={density}>
        <thead>
          <tr>
            <Table.Head>Invoice</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Method</Table.Head>
            <Table.Head className="text-right">Amount</Table.Head>
          </tr>
        </thead>
        <tbody>
          <Table.Row>
            <Table.Cell className="font-medium">INV001</Table.Cell>
            <Table.Cell><Badge variant="primary" shape="minimal">Paid</Badge></Table.Cell>
            <Table.Cell>Credit Card</Table.Cell>
            <Table.Cell className="text-right font-mono">$250.00</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell className="font-medium">INV002</Table.Cell>
            <Table.Cell><Badge variant="secondary" shape="minimal">Pending</Badge></Table.Cell>
            <Table.Cell>PayPal</Table.Cell>
            <Table.Cell className="text-right font-mono">$150.00</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell className="font-medium">INV003</Table.Cell>
            <Table.Cell><Badge variant="destructive" shape="minimal">Unpaid</Badge></Table.Cell>
            <Table.Cell>Bank Transfer</Table.Cell>
            <Table.Cell className="text-right font-mono">$350.00</Table.Cell>
          </Table.Row>
        </tbody>
      </Table>
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
        { label: "Ghost (Header Background Only)", value: "ghost" },
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
  },
};
