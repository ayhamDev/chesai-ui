import { GridItemConfig } from "./types";

/**
 * Checks if two grid items intersect.
 */
export const hasCollision = (a: GridItemConfig, b: GridItemConfig): boolean => {
  if (a.id === b.id) return false;
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
};

/**
 * Strict Gravity Layout Engine.
 * 1. Locks the active item (being dragged/resized) in place.
 * 2. Takes all other items, sorts them in original top-to-bottom order.
 * 3. Lets them "fall" upwards to the highest possible Y coordinate without overlapping.
 */
export const resolveLayout = (
  items: GridItemConfig[],
  activeItem?: GridItemConfig
): GridItemConfig[] => {
  const compacted: GridItemConfig[] = [];

  // Active item has absolute priority and is placed first.
  if (activeItem) {
    compacted.push({ ...activeItem });
  }

  // Sort remaining items top-to-bottom, left-to-right based on their original positions.
  const others = items
    .filter((i) => i.id !== activeItem?.id)
    .sort((a, b) => a.y - b.y || a.x - b.x);

  for (const item of others) {
    let currentY = 0;
    let isColliding = true;

    // Simulate item falling upwards. If it hits something, slide it down just enough to clear it.
    while (isColliding) {
      isColliding = false;
      for (const placed of compacted) {
        if (hasCollision({ ...item, y: currentY }, placed)) {
          isColliding = true;
          // Jump exactly to the bottom of the blocking item to save iterations
          currentY = placed.y + placed.h;
        }
      }
    }

    compacted.push({ ...item, y: currentY });
  }

  return compacted;
};

export const getGridStyles = (
  x: number,
  y: number,
  w: number,
  h: number,
  colWidth: number,
  rowHeight: number,
  gap: number
) => {
  return {
    position: "absolute" as const,
    left: x * (colWidth + gap),
    top: y * (rowHeight + gap),
    width: w * colWidth + (w - 1) * gap,
    height: h * rowHeight + (h - 1) * gap,
  };
};
