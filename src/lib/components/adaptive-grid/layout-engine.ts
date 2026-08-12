import type { GridItemConfig } from "./types";

export const hasCollision = (a: GridItemConfig, b: GridItemConfig): boolean => {
  if (a.id === b.id) return false;
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
};

export const compactLayout = (
  layout: GridItemConfig[],
  activeItem?: GridItemConfig,
  gravityEnabled = true
): GridItemConfig[] => {
  const compacted: GridItemConfig[] = [];

  if (activeItem) {
    compacted.push({ ...activeItem });
  }

  const sorted = [...layout]
    .filter((i) => !activeItem || i.id !== activeItem.id)
    .sort((a, b) => a.y - b.y || a.x - b.x);

  for (const item of sorted) {
    let currentY = gravityEnabled ? 0 : item.y;
    let isColliding = true;

    while (isColliding) {
      isColliding = false;
      for (const placed of compacted) {
        if (hasCollision({ ...item, y: currentY }, placed)) {
          isColliding = true;
          currentY = placed.y + placed.h;
        }
      }
    }
    compacted.push({ ...item, y: currentY });
  }

  return compacted;
};

/**
 * Returns the largest number of columns that can fit without making a column
 * narrower than `minColumnWidth`.
 */
export const getResponsiveColumnCount = (
  containerWidth: number,
  maxColumns: number,
  gap: number,
  minColumnWidth: number,
): number => {
  if (containerWidth <= 0) return maxColumns;

  const safeColumns = Math.max(1, Math.floor(maxColumns));
  const safeColumnWidth = Math.max(1, minColumnWidth);
  const availableColumns = Math.floor(
    (containerWidth + gap) / (safeColumnWidth + gap),
  );

  return Math.max(1, Math.min(safeColumns, availableColumns));
};

/**
 * Creates a display-only layout that fits a narrower column count. The source
 * layout is left untouched so it can be restored when the container grows.
 */
export const fitLayoutToColumns = (
  layout: GridItemConfig[],
  columns: number,
  gravityEnabled = true,
): GridItemConfig[] => {
  const safeColumns = Math.max(1, Math.floor(columns));
  const fitted = layout.map((item) => {
    const width = Math.min(item.w, safeColumns);

    return {
      ...item,
      x: Math.max(0, Math.min(item.x, safeColumns - width)),
      w: width,
    };
  });

  return compactLayout(fitted, undefined, gravityEnabled);
};

export const resolveLayout = (
  items: GridItemConfig[],
  activeItem: GridItemConfig,
  _columns: number,
  gravityEnabled = true
): GridItemConfig[] => {
  const layout = [activeItem, ...items.filter((i) => i.id !== activeItem.id)].map(
    (i) => ({ ...i })
  );

  let hasCollisions = true;
  let safetyCounter = 0;

  while (hasCollisions && safetyCounter < 100) {
    hasCollisions = false;
    safetyCounter++;

    for (let i = 0; i < layout.length; i++) {
      const itemA = layout[i];
      for (let j = i + 1; j < layout.length; j++) {
        const itemB = layout[j];

        if (hasCollision(itemA, itemB)) {
          hasCollisions = true;
          if (itemB.id === activeItem.id) {
            itemA.y = itemB.y + itemB.h;
          } else {
            itemB.y = itemA.y + itemA.h;
          }
        }
      }
    }
  }

  return compactLayout(layout, activeItem, gravityEnabled);
};
