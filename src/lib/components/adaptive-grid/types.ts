import { UniqueIdentifier } from "@dnd-kit/core";

export interface GridItemConfig {
  id: UniqueIdentifier;
  x: number; // Grid column start (0-indexed)
  y: number; // Grid row start
  w: number; // Column span
  h: number; // Row span
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export type GridGap = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
export type ResizeDirection = "t" | "b" | "l" | "r" | "tl" | "tr" | "bl" | "br";

export const GAP_MAP: Record<GridGap, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
};
