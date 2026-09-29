/** Project a release briefly in its travel direction, then settle at a detent. */
export function resolveSheetSnap(
  size: number,
  partial: number,
  extent: number,
  velocity: number,
): "closed" | "partial" | "expanded" {
  const projected = Math.max(0, Math.min(extent, size + velocity * 160));
  if (projected < partial / 2) return "closed";
  if (projected > (partial + extent) / 2) return "expanded";
  return "partial";
}

/** Numbers represent a fraction of the viewport; CSS lengths remain responsive. */
export function sheetSizeToCss(size: string | number): string {
  return typeof size === "number"
    ? `${Math.max(0, Math.min(1, size)) * 100}%`
    : size;
}
