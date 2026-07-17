import type { ColumnDef } from "@tanstack/react-table";
import { describe, expect, it } from "vitest";
import { createDataTableUrlCodec } from "./url-codec";

type Item = {
  amount: number;
  email: string;
  status: string;
};

const columns: ColumnDef<Item>[] = [
  {
    accessorKey: "email",
    meta: { filter: { variant: "text" } },
  },
  {
    accessorKey: "amount",
    meta: { filter: { variant: "number" } },
  },
  {
    accessorKey: "status",
    meta: {
      filter: {
        variant: "multi-select",
        options: [
          { label: "Pending", value: "pending" },
          { label: "Success", value: "success" },
        ],
      },
    },
  },
];

describe("createDataTableUrlCodec", () => {
  it("round-trips typed namespaced state and preserves unrelated params", () => {
    const codec = createDataTableUrlCodec({
      columns,
      namespace: "orders",
    });
    const written = codec.write(new URLSearchParams("dialog=payment"), {
      pagination: { pageIndex: 2, pageSize: 20 },
      sorting: [
        { id: "amount", desc: true },
        { id: "email", desc: false },
      ],
      globalFilter: "alice & bob",
      columnFilters: [
        { id: "amount", value: { operator: "gte", value: 100 } },
        {
          id: "status",
          value: { operator: "in", value: ["pending", "success"] },
        },
      ],
      columnVisibility: { email: false },
    });
    const parsed = codec.parse(written);

    expect(written.get("dialog")).toBe("payment");
    expect(written.get("orders.page")).toBe("3");
    expect(written.getAll("orders.sort")).toEqual([
      "amount:desc",
      "email:asc",
    ]);
    expect(parsed).toEqual({
      pagination: { pageIndex: 2, pageSize: 20 },
      sorting: [
        { id: "amount", desc: true },
        { id: "email", desc: false },
      ],
      globalFilter: "alice & bob",
      columnFilters: [
        { id: "amount", value: { operator: "gte", value: 100 } },
        {
          id: "status",
          value: { operator: "in", value: ["pending", "success"] },
        },
      ],
      columnVisibility: { email: false },
    });
  });

  it("drops invalid values and unknown columns", () => {
    const codec = createDataTableUrlCodec({ columns });
    const parsed = codec.parse(
      new URLSearchParams(
        "table.page=-2&table.pageSize=0&table.sort=missing:asc&" +
          "table.filter.amount.operator=contains&" +
          "table.filter.amount.value=nope&table.hidden=missing",
      ),
    );

    expect(parsed.pagination).toEqual({ pageIndex: 0, pageSize: 10 });
    expect(parsed.sorting).toEqual([]);
    expect(parsed.columnFilters).toEqual([]);
    expect(parsed.columnVisibility).toEqual({});
  });

  it("keeps multiple table namespaces isolated", () => {
    const orders = createDataTableUrlCodec({
      columns,
      namespace: "orders",
    });
    const users = createDataTableUrlCodec({
      columns,
      namespace: "users",
    });
    const params = users.write(new URLSearchParams(), {
      pagination: { pageIndex: 4, pageSize: 10 },
      sorting: [],
      columnFilters: [],
      globalFilter: "",
      columnVisibility: {},
    });
    const updated = orders.write(params, {
      pagination: { pageIndex: 1, pageSize: 10 },
      sorting: [],
      columnFilters: [],
      globalFilter: "",
      columnVisibility: {},
    });

    expect(updated.get("users.page")).toBe("5");
    expect(updated.get("orders.page")).toBe("2");
  });
});
