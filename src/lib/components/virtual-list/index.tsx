"use client";

import {
  useVirtualizer,
  type VirtualizerOptions,
  type Virtualizer,
} from "@tanstack/react-virtual";
import { clsx } from "clsx";
import React, { useRef, useImperativeHandle } from "react";

export interface VirtualListProps<T> {
  /** The data to render */
  data: T[];
  /** The render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;

  /** Scroll direction of the virtual list. @default "vertical" */
  direction?:
    | "vertical"
    | "horizontal"
    | "vertical-reverse"
    | "horizontal-reverse";

  /**
   * The component used as the outer scrollable container viewport.
   * Useful for passing ElasticScrollArea or customizing tags.
   * @default "div"
   */
  as?: React.ElementType;

  /**
   * The component used as the sizer (defines total scroll width/height).
   * @default "div"
   */
  contentAs?: React.ElementType;

  /**
   * An optional wrapper component directly around the array of absolute items.
   * Extremely useful if you need to wrap the items in a <ul/>, <ol/>, or an <AnimatePresence/>.
   */
  itemsWrapper?: React.ElementType | React.FC<any>;

  /** Spacing between items in pixels. @default 8 */
  gap?: number;
  /** Initial estimated size of items. @default 72 */
  estimateSize?: number;
  /** Items to render outside the visible viewport. @default 5 */
  overscan?: number;

  /** Props passed to the outer scrollable container */
  containerProps?: any;
  /** Props passed to the inner sizer div */
  contentProps?: React.HTMLAttributes<HTMLDivElement> & Record<string, any>;

  /**
   * Access to the raw TanStack Virtual options for advanced logic
   */
  virtualOptions?: Partial<VirtualizerOptions<any, any>>;

  /** Ref to access the virtualizer instance from parent (for scroll controls) */
  virtualizerRef?: React.Ref<Virtualizer<any, any>>;
}

// Internal function to allow generic type inference along with forwardRef
function VirtualListInner<T>(
  {
    data,
    renderItem,
    direction = "vertical",
    as: Component = "div",
    contentAs: ContentComponent = "div",
    itemsWrapper: ItemsWrapper,
    gap = 8,
    estimateSize = 72,
    overscan = 5,
    containerProps = {},
    contentProps = {},
    virtualOptions = {},
    virtualizerRef,
  }: VirtualListProps<T>,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const parentRef = useRef<HTMLElement>(null);

  const isHorizontal = direction.includes("horizontal");
  const isReverse = direction.includes("reverse");

  // Expose the DOM container ref to the parent
  useImperativeHandle(ref, () => parentRef.current!);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize + gap, // Add gap to estimation
    overscan,
    horizontal: isHorizontal,

    // Conditionally spread overrides so we don't pass undefined and break TanStack defaults
    ...(isReverse
      ? {
          // Intercept scroll tracking for reverse layouts because browsers track
          // reverse-flex scroll coordinates using negative numbers.
          observeElementOffset: (instance, cb) => {
            const element = instance.scrollElement;
            if (!element) return;

            let timeoutId: ReturnType<typeof setTimeout> | null = null;
            const handler = () => {
              const offset = isHorizontal
                ? element.scrollLeft
                : element.scrollTop;
              cb(Math.abs(offset), true);

              if (timeoutId) clearTimeout(timeoutId);
              timeoutId = setTimeout(() => {
                cb(Math.abs(offset), false);
              }, 150);
            };

            element.addEventListener("scroll", handler, { passive: true });
            handler(); // Trigger immediately for initial offset
            return () => {
              element.removeEventListener("scroll", handler);
              if (timeoutId) clearTimeout(timeoutId);
            };
          },

          // Intercept programmatic scrolling for negative coordinates
          scrollToFn: (offset, canSmooth, instance) => {
            const element = instance.scrollElement;
            if (!element) return;

            const finalOffset = -offset;
            if (canSmooth) {
              element.scrollTo({
                [isHorizontal ? "left" : "top"]: finalOffset,
                behavior: "smooth",
              });
            } else {
              element[isHorizontal ? "scrollLeft" : "scrollTop"] = finalOffset;
            }
          },
        }
      : {}),

    ...virtualOptions,
  });

  // Allow parent to control/read virtualizer
  useImperativeHandle(virtualizerRef, () => virtualizer);

  const { className: containerClassName, ...restContainerProps } =
    containerProps;
  const {
    style: contentStyle,
    className: contentClassName,
    ...restContentProps
  } = contentProps;

  // Pre-map the virtual items to inject into the DOM
  const items = virtualizer.getVirtualItems().map((virtualItem) => {
    // Determine Native Flex reverse positioning
    const positionClass =
      direction === "vertical"
        ? "top-0 left-0"
        : direction === "vertical-reverse"
          ? "bottom-0 left-0"
          : direction === "horizontal"
            ? "top-0 left-0"
            : "top-0 right-0"; // horizontal-reverse

    let transform = "";
    if (direction === "vertical") {
      transform = `translateY(${virtualItem.start}px)`;
    } else if (direction === "vertical-reverse") {
      transform = `translateY(-${virtualItem.start}px)`;
    } else if (direction === "horizontal") {
      transform = `translateX(${virtualItem.start}px)`;
    } else if (direction === "horizontal-reverse") {
      transform = `translateX(-${virtualItem.start}px)`;
    }

    // Keep spacing consistent visually within the item box
    const paddingBottom = direction === "vertical" ? `${gap}px` : undefined;
    const paddingTop =
      direction === "vertical-reverse" ? `${gap}px` : undefined;
    const paddingRight = direction === "horizontal" ? `${gap}px` : undefined;
    const paddingLeft =
      direction === "horizontal-reverse" ? `${gap}px` : undefined;

    return (
      <div
        key={virtualItem.key}
        data-index={virtualItem.index}
        ref={virtualizer.measureElement}
        className={clsx("absolute", positionClass)}
        style={{
          width: isHorizontal ? undefined : "100%",
          height: isHorizontal ? "100%" : undefined,
          transform,
          paddingTop,
          paddingBottom,
          paddingLeft,
          paddingRight,
        }}
      >
        {renderItem(data[virtualItem.index], virtualItem.index)}
      </div>
    );
  });

  return (
    <Component
      ref={parentRef}
      className={clsx(
        "h-full w-full contain-strict scrollbar-thin",
        // Using flex-col-reverse forces native bottom anchoring while preserving trackpad & wheel axes
        direction === "vertical" && "overflow-y-auto overflow-x-hidden",
        direction === "horizontal" && "overflow-x-auto overflow-y-hidden",
        direction === "vertical-reverse" &&
          "overflow-y-auto overflow-x-hidden flex flex-col-reverse",
        direction === "horizontal-reverse" &&
          "overflow-x-auto overflow-y-hidden flex flex-row-reverse",
        containerClassName,
      )}
      {...restContainerProps}
    >
      <ContentComponent
        style={{
          height: isHorizontal ? "100%" : `${virtualizer.getTotalSize()}px`,
          width: isHorizontal ? `${virtualizer.getTotalSize()}px` : "100%",
          position: "relative",
          flexShrink: 0, // Guarantees the sizer component doesn't get squashed by flex wrappers
          ...contentStyle,
        }}
        className={contentClassName}
        {...restContentProps}
      >
        {ItemsWrapper ? <ItemsWrapper>{items}</ItemsWrapper> : items}
      </ContentComponent>
    </Component>
  );
}

// Cast to preserve generic type `<T>` on forwardRef component
export const VirtualList = React.forwardRef(VirtualListInner) as <T>(
  props: VirtualListProps<T> & { ref?: React.ForwardedRef<HTMLElement> },
) => ReturnType<typeof VirtualListInner>;

(VirtualList as any).displayName = "VirtualList";
