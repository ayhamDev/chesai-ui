import { addDays, type Day, differenceInCalendarDays, endOfWeek, startOfDay, startOfWeek } from 'date-fns'
import { animate } from 'framer-motion'
import { type PointerEvent, useCallback, useLayoutEffect, useRef, useState } from 'react'

const BUFFER_DAYS = 36525
const OVERSCAN = 7

/** Native touch/trackpad scrolling, with mouse/pen dragging layered on the same scroll offset. */
export function useDateStrip({
  date,
  daysToShow = 7,
  weekStartsOn,
  minDate,
  maxDate,
  rtl,
  enabled,
  reducedMotion = false,
  swipeMode = 'day',
  onVisibleDateChange,
}: {
  daysToShow?: number
  date: Date
  weekStartsOn: Day
  minDate?: Date
  maxDate?: Date
  rtl: boolean
  enabled: boolean
  reducedMotion?: boolean
  swipeMode?: 'day' | 'week'
  onVisibleDateChange?: (date: Date) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const initialDate = daysToShow === 7 ? startOfWeek(date, { weekStartsOn }) : startOfDay(date)
  const pageAnchor = useRef(initialDate.getTime())
  const lastDaysToShow = useRef(daysToShow)
  const [origin, setOrigin] = useState(() => addDays(initialDate, -BUFFER_DAYS).getTime())
  const start = minDate
    ? daysToShow === 7
      ? startOfWeek(minDate, { weekStartsOn })
      : startOfDay(minDate)
    : new Date(origin)
  const startTime = start.getTime()
  const hasMin = !!minDate
  const hasMax = !!maxDate
  const end = maxDate
    ? daysToShow === 7
      ? endOfWeek(maxDate, { weekStartsOn })
      : startOfDay(maxDate)
    : addDays(new Date(origin), BUFFER_DAYS * 2 + daysToShow - 1)
  const count = Math.max(daysToShow, differenceInCalendarDays(end, start) + 1)
  const [position, setPosition] = useState(() => ({ day: initialDate.getTime(), fraction: 0, width: 700 }))
  const positionRef = useRef(position)
  const [scrolling, setScrolling] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const alignment = useRef<{ stop: () => void } | null>(null)
  const navigationTarget = useRef<number | null>(null)
  const [navigationRequest, setNavigationRequest] = useState(0)
  const touchDown = useRef(false)
  const gesture = useRef<{ id: number; x: number; y: number; offset: number; horizontal: boolean } | null>(null)
  const stopAlignment = useCallback(() => {
    clearTimeout(timer.current)
    alignment.current?.stop()
    alignment.current = null
    navigationTarget.current = null
  }, [])
  const suppressClickUntil = useRef(0)
  const lastReported = useRef<number | undefined>(initialDate.getTime())
  const report = useRef(onVisibleDateChange)
  report.current = onVisibleDateChange
  const lastWeekStart = useRef(weekStartsOn)
  const requested = date.getTime()
  const lastRequested = useRef(requested)
  const dayWidth = position.width / daysToShow
  const firstIndex = Math.max(0, differenceInCalendarDays(new Date(position.day), start))
  const readOffset = useCallback(() => (rtl ? -1 : 1) * (ref.current?.scrollLeft ?? 0), [rtl])
  const writeOffset = useCallback(
    (offset: number) => {
      if (ref.current) ref.current.scrollLeft = (rtl ? -1 : 1) * offset
    },
    [rtl],
  )
  const updatePosition = useCallback(
    (notify = true) => {
      const width = positionRef.current.width
      const cellWidth = width / daysToShow
      const offset = Math.max(0, Math.min(readOffset(), (count - daysToShow) * cellWidth))
      const rawIndex = offset / cellWidth
      const nearest = Math.round(rawIndex)
      // Browsers round large scroll offsets to subpixels; don't expose a phantom extra day at rest.
      const logicalIndex = Math.abs(rawIndex - nearest) * cellWidth < 0.5 ? nearest : rawIndex
      const index = Math.floor(logicalIndex)
      const day = addDays(new Date(startTime), index).getTime()
      const next = { day, fraction: Math.max(0, logicalIndex - index), width }
      positionRef.current = next
      // Native scrolling moves pixels without React work. Re-render only when the visible set changes.
      setPosition(previous =>
        previous.day === day && previous.width === width && previous.fraction > 0.001 === next.fraction > 0.001
          ? previous
          : next,
      )
      if (notify && lastReported.current !== day) {
        lastReported.current = day
        report.current?.(new Date(day))
      }
      // Rebase only near the ends of the large virtual buffer, preserving the exact visible date and fraction.
      if ((!hasMin && index < 30) || (!hasMax && count - index < 40)) {
        setOrigin(addDays(new Date(day), -BUFFER_DAYS).getTime())
      }
    },
    [count, daysToShow, readOffset, startTime, hasMin, hasMax],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: Explicit navigation must run even when returning to the unchanged date prop after a swipe.
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const applyPosition = () => {
      const width = element.clientWidth || positionRef.current.width
      if (width !== position.width) {
        stopAlignment()
        // Commit the new track width before assigning scrollLeft; otherwise the old scroll extent can clamp it.
        const resized = { ...positionRef.current, width }
        positionRef.current = resized
        setPosition(resized)
        return
      }
      const cellWidth = width / daysToShow
      let current = positionRef.current
      const animateNavigation = navigationTarget.current === requested
      if (requested !== lastRequested.current || animateNavigation) {
        lastRequested.current = requested
        // Parent echoes of scroll notifications must not round off a partially scrolled day.
        if (requested !== lastReported.current || animateNavigation) {
          stopAlignment()
          current = { ...current, day: startOfDay(new Date(requested)).getTime(), fraction: 0 }
          lastReported.current = current.day
        }
      }
      if (lastDaysToShow.current !== daysToShow) {
        lastDaysToShow.current = daysToShow
        stopAlignment()
        gesture.current = null
        touchDown.current = false
        setScrolling(false)
        const requestedDay = startOfDay(new Date(requested))
        const offset = differenceInCalendarDays(requestedDay, new Date(current.day))
        current = { ...current, fraction: 0 }
        if (daysToShow === 7) current.day = startOfWeek(requestedDay, { weekStartsOn }).getTime()
        else if (offset < 0 || offset >= daysToShow) current.day = requestedDay.getTime()
        pageAnchor.current = current.day
      }
      if (lastWeekStart.current !== weekStartsOn) {
        lastWeekStart.current = weekStartsOn
        current = {
          ...current,
          day: (daysToShow === 7
            ? startOfWeek(new Date(requested), { weekStartsOn })
            : startOfDay(new Date(requested))
          ).getTime(),
          fraction: 0,
        }
      }
      if (
        (!hasMin && current.day < startTime) ||
        (!hasMax && differenceInCalendarDays(new Date(current.day), new Date(startTime)) > count - daysToShow)
      ) {
        positionRef.current = current
        setOrigin(addDays(new Date(current.day), -BUFFER_DAYS).getTime())
        return
      }
      const index = differenceInCalendarDays(new Date(current.day), new Date(startTime)) + current.fraction
      const target = Math.max(0, Math.min(index, count - daysToShow)) * cellWidth
      if (animateNavigation && !reducedMotion) {
        navigationTarget.current = requested
        setScrolling(true)
        alignment.current = animate(readOffset(), target, {
          duration: 0.3,
          ease: [0.2, 0, 0, 1],
          onUpdate: offset => {
            writeOffset(offset)
            updatePosition(false)
          },
          onComplete: () => {
            alignment.current = null
            navigationTarget.current = null
            updatePosition(false)
            setScrolling(false)
          },
        })
        return
      }
      writeOffset(target)
      updatePosition(false)
    }
    applyPosition()
    const observer = new ResizeObserver(applyPosition)
    observer.observe(element)
    return () => observer.disconnect()
    // Preserve sub-day offsets on resizing, RTL changes, or buffer expansion; never reset during a gesture.
  }, [
    requested,
    daysToShow,
    startTime,
    count,
    weekStartsOn,
    writeOffset,
    updatePosition,
    hasMin,
    hasMax,
    position.width,
    stopAlignment,
    reducedMotion,
    readOffset,
    navigationRequest,
  ])

  useLayoutEffect(() => stopAlignment, [stopAlignment])

  const settle = () => {
    if (gesture.current || touchDown.current || alignment.current) return
    const cellWidth = positionRef.current.width / daysToShow
    const from = readOffset()
    const index = from / cellWidth
    const weekAnchor = differenceInCalendarDays(
      daysToShow === 7 ? startOfWeek(new Date(startTime), { weekStartsOn }) : new Date(pageAnchor.current),
      new Date(startTime),
    )
    const snappedIndex =
      swipeMode === 'week' ? weekAnchor + Math.round((index - weekAnchor) / daysToShow) * daysToShow : Math.round(index)
    const target = Math.max(0, Math.min(snappedIndex, count - daysToShow)) * cellWidth
    const complete = () => {
      alignment.current = null
      updatePosition()
      setScrolling(false)
    }
    if (reducedMotion || Math.abs(target - from) < 0.5) {
      writeOffset(target)
      complete()
      return
    }
    alignment.current = animate(from, target, {
      duration: 0.18,
      ease: [0.2, 0, 0, 1],
      onUpdate: offset => {
        writeOffset(offset)
        updatePosition()
      },
      onComplete: complete,
    })
  }
  const scheduleSettle = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(settle, 150)
  }

  const scroll = () => {
    updatePosition(navigationTarget.current === null)
    suppressClickUntil.current = Date.now() + 400
    setScrolling(true)
    if (!alignment.current) scheduleSettle()
  }
  const reveal = (day: Date) => {
    stopAlignment()
    const index = differenceInCalendarDays(day, start)
    const current = readOffset() / dayWidth
    if (index < current) writeOffset(index * dayWidth)
    else if (index + 1 > current + daysToShow) writeOffset((index - daysToShow + 1) * dayWidth)
    updatePosition(false)
  }
  const finish = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') {
      touchDown.current = false
      scheduleSettle()
      return
    }
    if (gesture.current?.id !== event.pointerId) return
    if (gesture.current.horizontal) suppressClickUntil.current = Date.now() + 400
    gesture.current = null
    scheduleSettle()
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return {
    ref,
    scrolling,
    suppressClickUntil,
    reveal,
    navigationDate: () => new Date(navigationTarget.current ?? positionRef.current.day),
    prepareNavigation: (day: Date) => {
      navigationTarget.current = day.getTime()
      setNavigationRequest(previous => previous + 1)
    },
    firstDate: new Date(position.day),
    // A partially visible trailing day stays accessible, while overscan cells stay out of the accessibility tree.
    items: Array.from(
      { length: Math.min(count, firstIndex + daysToShow + 1 + OVERSCAN) - Math.max(0, firstIndex - OVERSCAN) },
      (_, i) => {
        const index = Math.max(0, firstIndex - OVERSCAN) + i
        return {
          date: addDays(start, index),
          index,
          visible: index >= firstIndex && index < firstIndex + (daysToShow + (position.fraction > 0.001 ? 1 : 0)),
        }
      },
    ),
    dayWidth,
    totalWidth: count * dayWidth,
    handlers: {
      onScroll: scroll,
      onWheelCapture() {
        stopAlignment()
        scheduleSettle()
      },
      onPointerDownCapture(event: PointerEvent<HTMLDivElement>) {
        stopAlignment()
        suppressClickUntil.current = 0
        // Touch belongs entirely to the browser: native pan, momentum, vertical page scrolling, and pinch zoom.
        if (event.pointerType === 'touch') {
          touchDown.current = true
          return
        }
        if (!enabled || event.defaultPrevented || !event.isPrimary || event.button !== 0) return
        gesture.current = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          offset: readOffset(),
          horizontal: false,
        }
      },
      onPointerMove(event: PointerEvent<HTMLDivElement>) {
        const startGesture = gesture.current
        if (!enabled || !startGesture || startGesture.id !== event.pointerId) return
        const dx = event.clientX - startGesture.x
        const dy = event.clientY - startGesture.y
        if (!startGesture.horizontal) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 5) return
          if (Math.abs(dy) >= Math.abs(dx)) {
            gesture.current = null
            return
          }
          startGesture.horizontal = true
          event.currentTarget.setPointerCapture(event.pointerId)
        }
        event.preventDefault()
        writeOffset(Math.max(0, Math.min(startGesture.offset + dx * (rtl ? 1 : -1), (count - daysToShow) * dayWidth)))
        scroll()
      },
      onPointerUp: finish,
      onPointerCancel: finish,
      onLostPointerCapture() {
        gesture.current = null
        scheduleSettle()
      },
    },
  }
}
