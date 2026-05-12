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
  direction?: "vertical" | "horizontal";

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
   * (e.g., initialOffset, scrollMargin, etc.)
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
  const isHorizontal = direction === "horizontal";

  // Expose the DOM container ref to the parent
  useImperativeHandle(ref, () => parentRef.current!);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize + gap, // Add gap to estimation
    overscan,
    horizontal: isHorizontal,
    ...virtualOptions,
  });

  // Allow parent to control/read virtualizer (useful for `scrollToIndex` etc.)
  useImperativeHandle(virtualizerRef, () => virtualizer);

  const { className: containerClassName, ...restContainerProps } =
    containerProps;
  const {
    style: contentStyle,
    className: contentClassName,
    ...restContentProps
  } = contentProps;

  // Pre-map the virtual items to inject into the DOM
  const items = virtualizer.getVirtualItems().map((virtualItem) => (
    <div
      key={virtualItem.key}
      data-index={virtualItem.index}
      ref={virtualizer.measureElement}
      className="absolute top-0 left-0"
      style={{
        width: isHorizontal ? undefined : "100%",
        height: isHorizontal ? "100%" : undefined,
        transform: isHorizontal
          ? `translateX(${virtualItem.start}px)`
          : `translateY(${virtualItem.start}px)`,
        paddingRight: isHorizontal ? `${gap}px` : undefined,
        paddingBottom: !isHorizontal ? `${gap}px` : undefined,
      }}
    >
      {renderItem(data[virtualItem.index], virtualItem.index)}
    </div>
  ));

  return (
    <Component
      ref={parentRef}
      className={clsx(
        "h-full w-full contain-strict scrollbar-thin",
        isHorizontal
          ? "overflow-x-auto overflow-y-hidden"
          : "overflow-y-auto overflow-x-hidden",
        containerClassName,
      )}
      {...restContainerProps}
    >
      <ContentComponent
        style={{
          height: isHorizontal ? "100%" : `${virtualizer.getTotalSize()}px`,
          width: isHorizontal ? `${virtualizer.getTotalSize()}px` : "100%",
          position: "relative",
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
