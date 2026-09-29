import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual'
import type { Table as TanstackTable } from '@tanstack/react-table'
import React from 'react'
import { TableRow } from './index'

export interface TableVirtualizationOptions {
  /** Optional external page scroller. By default, detects a scrollable ancestor or uses the window. */
  getScrollElement?: () => HTMLElement | null
  /** Estimated height until each row (including expanded content) is measured. */
  estimateRowHeight?: number
  overscan?: number
  /** Number of rows before the end at which more data is requested. */
  loadMoreThreshold?: number
}

export function VirtualTableBody<TData extends {}>({
  table,
  scrollElement,
  headerRef,
  options,
  onEndReached,
}: {
  table: TanstackTable<TData>
  scrollElement: HTMLDivElement | null
  headerRef: React.RefObject<HTMLTableSectionElement | null>
  options: TableVirtualizationOptions
  onEndReached?: () => void
}) {
  const rows = table.getRowModel().rows
  const positioned = React.useRef(false)
  const [viewport, setViewport] = React.useState<{ element: HTMLElement | null; margin: number; ready: boolean }>({
    element: null,
    margin: 0,
    ready: false,
  })
  React.useLayoutEffect(() => {
    const header = headerRef.current
    if (!header || !scrollElement) return
    let element: HTMLElement | null = null
    if (options.getScrollElement) element = options.getScrollElement()
    else {
      for (
        let ancestor = scrollElement.parentElement;
        ancestor && ancestor !== document.body;
        ancestor = ancestor.parentElement
      ) {
        if (/(auto|scroll|overlay)/.test(getComputedStyle(ancestor).overflowY)) {
          element = ancestor
          break
        }
      }
    }
    const measure = () => {
      const margin = element
        ? header.getBoundingClientRect().bottom -
          element.getBoundingClientRect().top -
          element.clientTop +
          element.scrollTop
        : header.getBoundingClientRect().bottom + window.scrollY
      setViewport(previous =>
        previous.element === element && previous.margin === margin && previous.ready
          ? previous
          : { element, margin, ready: true },
      )
      return margin
    }
    const margin = measure()
    // Query changes remount this body. Keep the table in view without jumping a page
    // that was above the table; appending rows never resets the page position.
    const offset = element ? element.scrollTop : window.scrollY
    if (!positioned.current && offset > margin)
      (element ?? window).scrollTo({
        top: Math.max(0, margin - header.getBoundingClientRect().height),
        behavior: 'instant',
      })
    positioned.current = true
    measure()
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure)
    observer?.observe(header)
    for (let ancestor = scrollElement.parentElement; ancestor; ancestor = ancestor.parentElement)
      observer?.observe(ancestor)
    const target = element ?? window
    target.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      target.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [headerRef, scrollElement, options.getScrollElement])
  const sharedOptions = {
    count: rows.length,
    estimateSize: () => options.estimateRowHeight ?? 56,
    getItemKey: (index: number) => rows[index].id,
    overscan: options.overscan ?? 8,
    scrollMargin: viewport.margin,
  }
  const pageVirtualizer = useWindowVirtualizer<HTMLTableSectionElement>({
    ...sharedOptions,
    enabled: viewport.ready && !viewport.element,
  })
  const elementVirtualizer = useVirtualizer<HTMLElement, HTMLTableSectionElement>({
    ...sharedOptions,
    getScrollElement: () => viewport.element,
    enabled: viewport.ready && !!viewport.element,
  })
  const virtualizer = viewport.element ? elementVirtualizer : pageVirtualizer
  const items = virtualizer.getVirtualItems()
  const lastIndex = items.at(-1)?.index ?? -1
  React.useEffect(() => {
    if (viewport.ready && (!rows.length || lastIndex >= rows.length - 1 - (options.loadMoreThreshold ?? 5))) {
      onEndReached?.()
    }
  }, [lastIndex, rows.length, options.loadMoreThreshold, onEndReached, viewport.ready])

  const top = Math.max(0, (items[0]?.start ?? viewport.margin) - viewport.margin)
  const bottom = Math.max(0, virtualizer.getTotalSize() - ((items.at(-1)?.end ?? viewport.margin) - viewport.margin))
  const spacer = (height: number) =>
    height > 0 && (
      <tbody aria-hidden="true">
        <tr>
          <td colSpan={table.getVisibleLeafColumns().length} style={{ height, padding: 0, border: 0 }} />
        </tr>
      </tbody>
    )
  return (
    <>
      {spacer(top)}
      {items.map(item => (
        <tbody key={item.key} role="rowgroup" data-index={item.index} ref={virtualizer.measureElement}>
          <TableRow row={rows[item.index]} aria-rowindex={table.getHeaderGroups().length + item.index + 1} />
        </tbody>
      ))}
      {spacer(bottom)}
      {!rows.length && (
        <tbody>
          <tr>
            <td colSpan={table.getVisibleLeafColumns().length} className="h-24 text-center">
              No results.
            </td>
          </tr>
        </tbody>
      )}
    </>
  )
}
