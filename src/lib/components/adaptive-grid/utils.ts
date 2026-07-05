import { GridItemConfig } from "./types";

/** Detects if two grid items overlap */
export const isColliding = (a: GridItemConfig, b: GridItemConfig): boolean => {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
};

/** 
 * Resolves collisions by shifting items downwards.
 * Logic: Sort by Y, check collisions against the active item and previously moved items.
 */
export const resolveCollisions = (
  items: GridItemConfig[],
  activeItem: GridItemConfig
): GridItemConfig[] => {
  // 1. Sort items by Y then X to ensure consistent pushing order
  const sortedItems = [...items].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });

  const resolved: GridItemConfig[] = [];

  for (const item of sortedItems) {
    if (item.id === activeItem.id) {
      resolved.push(activeItem);
      continue;
    }

    let currentItem = { ...item };
    let colliding = true;

    // 2. Keep pushing down until no collisions with any item already in 'resolved'
    while (colliding) {
      colliding = false;
      for (const r of resolved) {
        if (isColliding(currentItem, r)) {
          currentItem.y = r.y + r.h;
          colliding = true;
          break; // Check again against all items from new position
        }
      }
    }
    resolved.push(currentItem);
  }

  return resolved;
};
