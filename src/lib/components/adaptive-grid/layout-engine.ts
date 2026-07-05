import { GridItemConfig } from "./types";

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
  activeItem?: GridItemConfig
): GridItemConfig[] => {
  const compacted: GridItemConfig[] = [];

  if (activeItem) {
    compacted.push({ ...activeItem });
  }

  const sorted = [...layout]
    .filter((i) => !activeItem || i.id !== activeItem.id)
    .sort((a, b) => a.y - b.y || a.x - b.x);

  for (const item of sorted) {
    let currentY = 0;
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

export const resolveLayout = (
  items: GridItemConfig[],
  activeItem: GridItemConfig,
  columns: number
): GridItemConfig[] => {
  let layout = [activeItem, ...items.filter((i) => i.id !== activeItem.id)].map(
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

          let target = itemB.id === activeItem.id ? itemA : itemB;
          let blocker = itemB.id === activeItem.id ? itemB : itemA;

          if (blocker.x + blocker.w + target.w <= columns) {
            target.x = blocker.x + blocker.w;
          } else {
            target.y = blocker.y + blocker.h;
          }
        }
      }
    }
  }

  return compactLayout(layout, activeItem);
};
