import { describe, expect, it } from "vitest";
import {
  fitLayoutToColumns,
  getResponsiveColumnCount,
} from "./layout-engine";
import type { GridItemConfig } from "./types";

describe("getResponsiveColumnCount", () => {
  it("reduces columns when the configured minimum width would be exceeded", () => {
    expect(getResponsiveColumnCount(1400, 24, 12, 40)).toBe(24);
    expect(getResponsiveColumnCount(1000, 24, 12, 40)).toBe(19);
    expect(getResponsiveColumnCount(700, 24, 12, 40)).toBe(13);
  });

  it("always keeps at least one column", () => {
    expect(getResponsiveColumnCount(20, 12, 12, 40)).toBe(1);
  });
});

describe("fitLayoutToColumns", () => {
  it("clamps overflowing items and resolves the resulting collisions", () => {
    const layout: GridItemConfig[] = [
      { id: "left", x: 0, y: 0, w: 6, h: 3 },
      { id: "right", x: 18, y: 0, w: 6, h: 3 },
      { id: "wide", x: 12, y: 3, w: 12, h: 3 },
    ];

    const fitted = fitLayoutToColumns(layout, 12);

    expect(fitted.find((item) => item.id === "right")).toMatchObject({
      x: 6,
      y: 0,
      w: 6,
    });
    expect(fitted.find((item) => item.id === "wide")).toMatchObject({
      x: 0,
      y: 3,
      w: 12,
    });
    expect(layout[1]).toMatchObject({ x: 18, y: 0, w: 6 });
  });

  it("makes an item full width when its span exceeds the available columns", () => {
    const [item] = fitLayoutToColumns(
      [{ id: "wide", x: 4, y: 0, w: 12, h: 2 }],
      8,
    );

    expect(item).toMatchObject({ x: 0, w: 8 });
  });
});
