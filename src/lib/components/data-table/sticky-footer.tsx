import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { DataTablePagination } from "./pagination";

export function DataTableStickyFooter({
  scrollContainerRef,
  bottomOffset,
  includePagination = true,
}: {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  bottomOffset: number;
  includePagination?: boolean;
}) {
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    const scrollbar = scrollbarRef.current;
    const track = trackRef.current;
    if (!container || !scrollbar || !track) return;

    const syncFromTable = () => {
      if (scrollbar.scrollLeft !== container.scrollLeft) {
        scrollbar.scrollLeft = container.scrollLeft;
      }
    };
    const syncToTable = () => {
      if (container.scrollLeft !== scrollbar.scrollLeft) {
        container.scrollLeft = scrollbar.scrollLeft;
      }
    };
    const measure = () => {
      // Match direction so native negative RTL scrollLeft values work in both.
      scrollbar.dir = getComputedStyle(container).direction;
      setHasOverflow(container.scrollWidth > container.clientWidth + 1);
      // Account for the table container's border when matching the scroll range.
      track.style.width = `${container.scrollWidth + scrollbar.clientWidth - container.clientWidth}px`;
      syncFromTable();
    };

    measure();
    container.addEventListener("scroll", syncFromTable, { passive: true });
    scrollbar.addEventListener("scroll", syncToTable, { passive: true });
    window.addEventListener("resize", measure);
    const observer = typeof ResizeObserver === "undefined"
      ? undefined
      : new ResizeObserver(measure);
    observer?.observe(container);
    observer?.observe(scrollbar);
    const table = container.querySelector("table");
    if (table) observer?.observe(table);
    // Direction can change on any ancestor without changing its dimensions.
    const directionObserver = new MutationObserver(measure);
    for (let ancestor: HTMLElement | null = container; ancestor; ancestor = ancestor.parentElement) {
      directionObserver.observe(ancestor, {
        attributes: true,
        attributeFilter: ["dir", "class", "style"],
      });
    }

    return () => {
      container.removeEventListener("scroll", syncFromTable);
      scrollbar.removeEventListener("scroll", syncToTable);
      window.removeEventListener("resize", measure);
      observer?.disconnect();
      directionObserver.disconnect();
    };
    // The ref target can change when native sticky-header mode is toggled.
  });

  return (
    <div
      hidden={!hasOverflow && !includePagination}
      className="sticky z-20 border-t border-outline-variant/50 bg-surface-container-low"
      style={{ bottom: bottomOffset }}
    >
      <div
        ref={scrollbarRef}
        hidden={!hasOverflow}
        role="region"
        aria-label="Scroll table horizontally"
        tabIndex={0}
        className="h-3 overflow-x-scroll overflow-y-hidden focus-visible:outline focus-visible:outline-primary"
      >
        <div ref={trackRef} className="h-px" />
      </div>
      {includePagination && <DataTablePagination />}
    </div>
  );
}
