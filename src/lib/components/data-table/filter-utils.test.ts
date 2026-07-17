import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  advancedFilterFn,
  advancedGlobalFilterFn,
  type AdvancedFilterValue,
} from "./filter-utils";

type Item = {
  amount: number;
  createdAt: string;
  status: { value: string; label: string };
};

const item: Item = {
  amount: 10,
  createdAt: "2026-07-17",
  status: { value: "success", label: "Successful" },
};

function createRow(
  column: ColumnDef<Item>,
  data: Item = item,
) {
  const { result } = renderHook(() =>
    useReactTable({
      data: [data],
      columns: [column],
      getCoreRowModel: getCoreRowModel(),
    }),
  );
  return result.current.getRowModel().rows[0];
}

describe("advancedFilterFn", () => {
  it.each([
    ["gt", 9, true],
    ["gte", 10, true],
    ["lt", 10, false],
    ["lte", 10, true],
    ["neq", 11, true],
  ] satisfies [AdvancedFilterValue["operator"], number, boolean][])(
    "supports the %s number operator",
    (operator, value, expected) => {
      const row = createRow({
        accessorKey: "amount",
        meta: { filter: { variant: "number" } },
      });
      expect(
        advancedFilterFn(row, "amount", { operator, value }, () => {}),
      ).toBe(expected);
    },
  );

  it("compares dates by timestamp", () => {
    const row = createRow({
      accessorKey: "createdAt",
      meta: { filter: { variant: "date" } },
    });
    expect(
      advancedFilterFn(
        row,
        "createdAt",
        { operator: "gte", value: "2026-07-01" },
        () => {},
      ),
    ).toBe(true);
  });

  it("supports multi-select membership", () => {
    const row = createRow({
      id: "status",
      accessorFn: row => row.status.value,
      meta: { filter: { variant: "multi-select" } },
    });
    expect(
      advancedFilterFn(
        row,
        "status",
        { operator: "in", value: ["pending", "success"] },
        () => {},
      ),
    ).toBe(true);
  });

  it("uses the configured raw value instead of rendered JSX", () => {
    const row = createRow({
      id: "status",
      accessorFn: row => row.status,
      cell: () => "Badge",
      meta: {
        filter: {
          variant: "select",
          getValue: row => row.status.value,
        },
      },
    });
    expect(
      advancedFilterFn(
        row,
        "status",
        { operator: "eq", value: "success" },
        () => {},
      ),
    ).toBe(true);
    expect(
      advancedGlobalFilterFn(row, "status", "succ", () => {}),
    ).toBe(true);
  });

  it("accepts legacy primitive and array values", () => {
    const row = createRow({
      accessorKey: "amount",
      meta: { filter: { variant: "number" } },
    });
    expect(advancedFilterFn(row, "amount", 10, () => {})).toBe(true);
    expect(advancedFilterFn(row, "amount", [10, 20], () => {})).toBe(true);
  });
});
