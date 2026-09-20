import { useLayoutEffect, useRef } from "react";

/** Native vertical sticking; only column sizing and horizontal scroll need JS. */
export function useStickyHeader(enabled: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);
  const stickyViewportRef = useRef<HTMLDivElement>(null);
  const stickyTableRef = useRef<HTMLTableElement>(null);

  // Column visibility/order or content can change without changing total width.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const header = headerRef.current;
    const viewport = stickyViewportRef.current;
    const stickyTable = stickyTableRef.current;
    const table = header?.closest("table");
    if (!enabled || !container || !header || !viewport || !stickyTable || !table) return;

    const syncHorizontalScroll = () => {
      if (viewport.scrollLeft !== container.scrollLeft) {
        viewport.scrollLeft = container.scrollLeft;
      }
    };
    const syncFromHeader = () => {
      if (container.scrollLeft !== viewport.scrollLeft) {
        container.scrollLeft = viewport.scrollLeft;
      }
    };
    const measure = () => {
      const width = table.getBoundingClientRect().width;
      const height = header.getBoundingClientRect().height;
      const containerStyle = getComputedStyle(container);
      viewport.dir = containerStyle.direction;
      viewport.style.height = `${height}px`;
      viewport.style.borderInlineStartWidth = containerStyle.borderInlineStartWidth;
      viewport.style.borderInlineEndWidth = containerStyle.borderInlineEndWidth;
      stickyTable.style.width = `${width}px`;
      stickyTable.style.minWidth = `${width}px`;
      stickyTable.style.maxWidth = `${width}px`;
      const sizingCells = header.rows[header.rows.length - 1]?.cells;
      const cols = stickyTable.querySelectorAll("col");
      cols.forEach((col, index) => {
        col.style.width = `${sizingCells?.[index]?.getBoundingClientRect().width ?? 0}px`;
      });
      syncHorizontalScroll();
    };

    measure();
    // No listener on the page/outer vertical scroller and no Y transform.
    container.addEventListener("scroll", syncHorizontalScroll, { passive: true });
    viewport.addEventListener("scroll", syncFromHeader, { passive: true });
    const observer = typeof ResizeObserver === "undefined"
      ? undefined
      : new ResizeObserver(measure);
    observer?.observe(table);
    observer?.observe(header);
    window.addEventListener("resize", measure);
    return () => {
      container.removeEventListener("scroll", syncHorizontalScroll);
      viewport.removeEventListener("scroll", syncFromHeader);
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  });

  return { containerRef, headerRef, stickyViewportRef, stickyTableRef };
}
