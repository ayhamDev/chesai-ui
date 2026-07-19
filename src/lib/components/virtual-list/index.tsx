/** biome-ignore-all lint/correctness/useHookAtTopLevel: VirtualListInner is a generic React.forwardRef render component. */
'use client'

import { useVirtualizer, type Virtualizer, type VirtualizerOptions } from '@tanstack/react-virtual'
import { clsx } from 'clsx'
import React, { useCallback, useImperativeHandle, useRef } from 'react'

type VirtualListVirtualizer = Virtualizer<HTMLElement, HTMLDivElement>
type VirtualListVirtualizerOptions = VirtualizerOptions<HTMLElement, HTMLDivElement>

export interface VirtualListProps<T> {
  /** The data to render */
  data: T[]
  /** The render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode

  /** Scroll direction of the virtual list. @default "vertical" */
  direction?: 'vertical' | 'horizontal' | 'vertical-reverse' | 'horizontal-reverse'

  /**
   * The component used as the outer scrollable container viewport.
   * Useful for passing ElasticScrollArea or customizing tags.
   * @default "div"
   */
  as?: React.ElementType

  /**
   * The component used as the sizer (defines total scroll width/height).
   * @default "div"
   */
  contentAs?: React.ElementType

  /**
   * An optional wrapper component directly around the array of absolute items.
   * Extremely useful if you need to wrap the items in a <ul/>, <ol/>, or an <AnimatePresence/>.
   */
  itemsWrapper?: React.ElementType

  /** Spacing between items in pixels. @default 8 */
  gap?: number
  /** Initial estimated size of items. @default 72 */
  estimateSize?: number
  /** Items to render outside the visible viewport. @default 5 */
  overscan?: number
  /**
   * Measure mounted items with ResizeObserver.
   * Disable this when every item has a fixed size to avoid measurement and
   * scroll-correction work. `estimateSize` must then match the fixed item size.
   * @default true
   */
  measureItems?: boolean
  /**
   * Stable identity for an item. Strongly recommended when data can be
   * inserted, removed, filtered, or reordered.
   * @default The item index
   */
  getItemKey?: (item: T, index: number) => React.Key

  /** Props passed to the outer scrollable container */
  containerProps?: React.HTMLAttributes<HTMLElement> & Record<string, unknown>
  /** Props passed to the inner sizer div */
  contentProps?: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>

  /**
   * Access to the raw TanStack Virtual options for advanced logic
   */
  virtualOptions?: Partial<VirtualListVirtualizerOptions>

  /** Ref to access the virtualizer instance from parent (for scroll controls) */
  virtualizerRef?: React.Ref<VirtualListVirtualizer>
}

interface VirtualListRowProps<T> {
  item: T
  index: number
  start: number
  direction: NonNullable<VirtualListProps<T>['direction']>
  gap: number
  renderItem: VirtualListProps<T>['renderItem']
  measureElement?: (node: HTMLDivElement | null) => void
}

function VirtualListRowInner<T>({
  item,
  index,
  start,
  direction,
  gap,
  renderItem,
  measureElement,
}: VirtualListRowProps<T>) {
  const isHorizontal = direction.includes('horizontal')
  const positionClass =
    direction === 'vertical'
      ? 'top-0 left-0'
      : direction === 'vertical-reverse'
        ? 'bottom-0 left-0'
        : direction === 'horizontal'
          ? 'top-0 left-0'
          : 'top-0 right-0'

  const transform =
    direction === 'vertical'
      ? `translateY(${start}px)`
      : direction === 'vertical-reverse'
        ? `translateY(-${start}px)`
        : direction === 'horizontal'
          ? `translateX(${start}px)`
          : `translateX(-${start}px)`

  return (
    <div
      data-index={index}
      ref={measureElement}
      className={clsx('absolute', positionClass)}
      style={{
        width: isHorizontal ? undefined : '100%',
        height: isHorizontal ? '100%' : undefined,
        transform,
        paddingTop: direction === 'vertical-reverse' ? `${gap}px` : undefined,
        paddingBottom: direction === 'vertical' ? `${gap}px` : undefined,
        paddingLeft: direction === 'horizontal-reverse' ? `${gap}px` : undefined,
        paddingRight: direction === 'horizontal' ? `${gap}px` : undefined,
      }}
    >
      {renderItem(item, index)}
    </div>
  )
}

// Existing rows retain the same primitive positioning props while the virtual
// range moves, so memoization prevents expensive item subtrees from rerendering.
const VirtualListRow = React.memo(VirtualListRowInner) as typeof VirtualListRowInner

// Internal function to allow generic type inference along with forwardRef
function VirtualListInner<T>(
  {
    data,
    renderItem,
    direction = 'vertical',
    as: Component = 'div',
    contentAs: ContentComponent = 'div',
    itemsWrapper: ItemsWrapper,
    gap = 8,
    estimateSize = 72,
    overscan = 5,
    measureItems = true,
    getItemKey,
    containerProps = {},
    contentProps = {},
    virtualOptions = {},
    virtualizerRef,
  }: VirtualListProps<T>,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const parentRef = useRef<HTMLElement>(null)

  const isHorizontal = direction.includes('horizontal')
  const isReverse = direction.includes('reverse')

  const setParentRef = useCallback(
    (node: HTMLElement | null) => {
      parentRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    },
    [ref],
  )

  const resolveItemKey = useCallback(
    (index: number) => (getItemKey ? getItemKey(data[index], index) : index),
    [data, getItemKey],
  )

  const virtualizer = useVirtualizer<HTMLElement, HTMLDivElement>({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize + gap, // Add gap to estimation
    overscan,
    horizontal: isHorizontal,
    useAnimationFrameWithResizeObserver: measureItems,
    getItemKey: resolveItemKey,

    // Conditionally spread overrides so we don't pass undefined and break TanStack defaults
    ...(isReverse
      ? {
          // Intercept scroll tracking for reverse layouts because browsers track
          // reverse-flex scroll coordinates using negative numbers.
          observeElementOffset: (instance, cb) => {
            const element = instance.scrollElement
            if (!element) return

            let timeoutId: ReturnType<typeof setTimeout> | null = null
            const handler = () => {
              const offset = isHorizontal ? element.scrollLeft : element.scrollTop
              cb(Math.abs(offset), true)

              if (timeoutId) clearTimeout(timeoutId)
              timeoutId = setTimeout(() => {
                cb(Math.abs(offset), false)
              }, 150)
            }

            element.addEventListener('scroll', handler, { passive: true })
            handler() // Trigger immediately for initial offset
            return () => {
              element.removeEventListener('scroll', handler)
              if (timeoutId) clearTimeout(timeoutId)
            }
          },

          // Intercept programmatic scrolling for negative coordinates
          scrollToFn: (offset, canSmooth, instance) => {
            const element = instance.scrollElement
            if (!element) return

            const finalOffset = -offset
            if (canSmooth) {
              element.scrollTo({
                [isHorizontal ? 'left' : 'top']: finalOffset,
                behavior: 'smooth',
              })
            } else {
              element[isHorizontal ? 'scrollLeft' : 'scrollTop'] = finalOffset
            }
          },
        }
      : {}),

    ...virtualOptions,
  })

  // Allow parent to control/read virtualizer
  useImperativeHandle(virtualizerRef, () => virtualizer)

  const { className: containerClassName, ...restContainerProps } = containerProps
  const { style: contentStyle, className: contentClassName, ...restContentProps } = contentProps

  // Pre-map the virtual items to inject into the DOM
  const items = virtualizer
    .getVirtualItems()
    .map(virtualItem => (
      <VirtualListRow
        key={virtualItem.key}
        item={data[virtualItem.index]}
        index={virtualItem.index}
        start={virtualItem.start}
        direction={direction}
        gap={gap}
        renderItem={renderItem}
        measureElement={measureItems ? virtualizer.measureElement : undefined}
      />
    ))

  return (
    <Component
      ref={setParentRef}
      className={clsx(
        'h-full w-full contain-strict scrollbar-thin',
        // Using flex-col-reverse forces native bottom anchoring while preserving trackpad & wheel axes
        direction === 'vertical' && 'overflow-y-auto overflow-x-hidden',
        direction === 'horizontal' && 'overflow-x-auto overflow-y-hidden',
        direction === 'vertical-reverse' && 'overflow-y-auto overflow-x-hidden flex flex-col-reverse',
        direction === 'horizontal-reverse' && 'overflow-x-auto overflow-y-hidden flex flex-row-reverse',
        containerClassName,
      )}
      {...restContainerProps}
    >
      <ContentComponent
        style={{
          height: isHorizontal ? '100%' : `${virtualizer.getTotalSize()}px`,
          width: isHorizontal ? `${virtualizer.getTotalSize()}px` : '100%',
          position: 'relative',
          flexShrink: 0, // Guarantees the sizer component doesn't get squashed by flex wrappers
          ...contentStyle,
        }}
        className={contentClassName}
        {...restContentProps}
      >
        {ItemsWrapper ? <ItemsWrapper>{items}</ItemsWrapper> : items}
      </ContentComponent>
    </Component>
  )
}

// Cast to preserve generic type `<T>` on forwardRef component
type VirtualListComponent = {
  <T>(
    props: VirtualListProps<T> & {
      ref?: React.ForwardedRef<HTMLElement>
    },
  ): ReturnType<typeof VirtualListInner>
  displayName?: string
}

export const VirtualList = React.forwardRef(VirtualListInner) as VirtualListComponent

VirtualList.displayName = 'VirtualList'
