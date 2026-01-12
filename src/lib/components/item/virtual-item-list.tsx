"use client";

import {
  useVirtualizer,
  type VirtualizerOptions,
} from "@tanstack/react-virtual";
import { clsx } from "clsx";
import React, { useRef, useImperativeHandle } from "react";

// Define what we can pass to the container
type ScrollContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<any>;
};

export interface VirtualItemListProps<T> {
  /** The data to render */
  data: T[];
  /** The render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;

  /**
   * The component used as the scrollable container.
   * Useful for passing ElasticScrollArea.
   * @default "div"
   */
  as?: React.ElementType;

  /** Spacing between items in pixels. @default 8 */
  gap?: number;
  /** Initial estimated size of items. @default 72 */
  estimateSize?: number;
  /** Items to render outside the visible viewport. @default 5 */
  overscan?: number;

  /** Props passed to the scrollable container (the 'as' component) */
  containerProps?: any;
  /** Props passed to the inner relative-positioned div */
  contentProps?: React.HTMLAttributes<HTMLDivElement>;

  /**
   * Access to the raw TanStack Virtual options for advanced logic
   * (e.g., initialOffset, scrollMargin, etc.)
   */
  virtualOptions?: Partial<VirtualizerOptions<any, any>>;

  /** Ref to access the virtualizer instance from parent */
  virtualizerRef?: React.ForwardedRef<any>;
}

export const VirtualItemList = <T,>({
  data,
  renderItem,
  as: Component = "div",
  gap = 8,
  estimateSize = 72,
  overscan = 5,
  containerProps = {},
  contentProps = {},
  virtualOptions = {},
  virtualizerRef,
}: VirtualItemListProps<T>) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize + gap, // Add gap to estimation
    overscan,
    ...virtualOptions,
  });

  // Allow parent to control/read virtualizer (useful for scrollTo index)
  useImperativeHandle(virtualizerRef, () => virtualizer);

  const { className: containerClassName, ...restContainerProps } =
    containerProps;
  const {
    style: contentStyle,
    className: contentClassName,
    ...restContentProps
  } = contentProps;

  return (
    <Component
      ref={parentRef}
      className={clsx(
        "h-full w-full overflow-y-auto contain-strict scrollbar-thin",
        containerClassName
      )}
      {...restContainerProps}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
          ...contentStyle,
        }}
        className={contentClassName}
        {...restContentProps}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            className="absolute top-0 left-0 w-full"
            style={{
              transform: `translateY(${virtualItem.start}px)`,
              // Bottom padding acts as the gap between items
              paddingBottom: `${gap}px`,
            }}
          >
            {renderItem(data[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </Component>
  );
};

VirtualItemList.displayName = "VirtualItemList";
