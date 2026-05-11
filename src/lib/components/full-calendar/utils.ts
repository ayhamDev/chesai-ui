// src/lib/components/full-calendar/utils.ts
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInDays,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  setMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns'
import type { CalendarEvent } from './types'

// --- VIRTUAL RECURRENCE EXPANSION ---
export const expandEvents = (events: CalendarEvent[], viewStart: Date, viewEnd: Date): CalendarEvent[] => {
  const expanded: CalendarEvent[] = []

  events.forEach(event => {
    if (!event.recurrence) {
      // Add standard events if they overlap with the view
      if (event.start <= viewEnd && event.end >= viewStart) {
        expanded.push(event)
      }
      return
    }

    const rule = event.recurrence
    let currentStart = new Date(event.start)
    const duration = event.end.getTime() - event.start.getTime()
    let occurrenceCount = 0

    const maxCount = rule.endType === 'after_occurrences' ? rule.count || 1 : Infinity
    const endDate = rule.endType === 'on_date' && rule.until ? new Date(rule.until) : new Date(8640000000000000) // Far future

    // Failsafe limit for generating virtual events to prevent infinite loops
    const hardLimit = 1500

    if (rule.frequency === 'weekly' && rule.daysOfWeek && rule.daysOfWeek.length > 0) {
      let currentWeekStart = startOfWeek(currentStart)

      while (
        currentWeekStart <= viewEnd &&
        currentWeekStart <= endDate &&
        occurrenceCount < maxCount &&
        occurrenceCount < hardLimit
      ) {
        for (const dayOfWeek of rule.daysOfWeek) {
          const instanceStart = addDays(currentWeekStart, dayOfWeek)
          instanceStart.setHours(
            event.start.getHours(),
            event.start.getMinutes(),
            event.start.getSeconds(),
            event.start.getMilliseconds(),
          )

          // Only count and render if it is on or after the original start date
          if (instanceStart >= event.start && instanceStart <= endDate && occurrenceCount < maxCount) {
            if (instanceStart <= viewEnd && instanceStart.getTime() + duration >= viewStart.getTime()) {
              expanded.push({
                ...event,
                id: `${event.id}-occ-${occurrenceCount}`,
                start: new Date(instanceStart),
                end: new Date(instanceStart.getTime() + duration),
              })
            }
            occurrenceCount++
          }
        }
        currentWeekStart = addWeeks(currentWeekStart, rule.interval || 1)
      }
    } else {
      while (
        currentStart <= viewEnd &&
        currentStart <= endDate &&
        occurrenceCount < maxCount &&
        occurrenceCount < hardLimit
      ) {
        if (currentStart <= viewEnd && currentStart.getTime() + duration >= viewStart.getTime()) {
          expanded.push({
            ...event,
            id: `${event.id}-occ-${occurrenceCount}`,
            start: new Date(currentStart),
            end: new Date(currentStart.getTime() + duration),
          })
        }
        occurrenceCount++

        if (rule.frequency === 'daily') {
          currentStart = addDays(currentStart, rule.interval || 1)
        } else if (rule.frequency === 'weekly') {
          currentStart = addWeeks(currentStart, rule.interval || 1)
        } else if (rule.frequency === 'monthly') {
          currentStart = addMonths(currentStart, rule.interval || 1)
        } else if (rule.frequency === 'yearly') {
          currentStart = addYears(currentStart, rule.interval || 1)
        } else {
          break
        }
      }
    }
  })

  return expanded
}

export const getDaysForMonthView = (currentDate: Date) => {
  const start = startOfWeek(startOfMonth(currentDate))
  const end = endOfWeek(endOfMonth(currentDate))

  const days: Date[] = []
  let day = start

  while (days.length < 42) {
    days.push(day)
    day = addDays(day, 1)
  }

  return days
}

export const getDaysForWeekView = (currentDate: Date) => {
  const start = startOfWeek(currentDate)
  const days: Date[] = []
  let day = start
  for (let i = 0; i < 7; i++) {
    days.push(day)
    day = addDays(day, 1)
  }
  return days
}

export const getMonthsForYear = (currentDate: Date) => {
  const yearStart = startOfYear(currentDate)
  const months: Date[] = []
  for (let i = 0; i < 12; i++) {
    months.push(setMonth(yearStart, i))
  }
  return months
}

export const getEventDaysMap = (events: CalendarEvent[]) => {
  const eventDays = new Set<string>()
  events.forEach(event => {
    let current = startOfDay(event.start)
    const end = startOfDay(event.end)
    while (current <= end) {
      eventDays.add(format(current, 'yyyy-MM-dd'))
      current = addDays(current, 1)
    }
  })
  return eventDays
}

export interface EventSegment<T = any> {
  event: CalendarEvent<T>
  colStart: number
  colSpan: number
  row: number
}

export const getEventSegments = (daysArr: Date[], events: CalendarEvent[]): EventSegment[] => {
  if (daysArr.length === 0) return []
  const viewStart = startOfDay(daysArr[0])
  const viewEnd = startOfDay(daysArr[daysArr.length - 1])

  const viewEvents = events.filter(event => {
    const eventStart = startOfDay(event.start)
    const eventEnd = startOfDay(event.end)
    return isBefore(eventStart, addDays(viewEnd, 1)) && isAfter(addDays(eventEnd, 1), viewStart)
  })

  viewEvents.sort((a, b) => {
    const durationA = differenceInDays(startOfDay(a.end), startOfDay(a.start))
    const durationB = differenceInDays(startOfDay(b.end), startOfDay(b.start))
    if (durationA !== durationB) return durationB - durationA
    return a.start.getTime() - b.start.getTime()
  })

  const segments: EventSegment[] = []
  const occupiedSlots: Record<number, Set<number>> = {}

  for (let i = 0; i < daysArr.length; i++) occupiedSlots[i] = new Set()

  viewEvents.forEach(event => {
    const eventStart = startOfDay(event.start)
    const eventEnd = startOfDay(event.end)

    let startDayIndex = daysArr.findIndex(d => isSameDay(d, eventStart))
    if (startDayIndex === -1) startDayIndex = 0

    let endDayIndex = daysArr.findIndex(d => isSameDay(d, eventEnd))
    if (endDayIndex === -1) endDayIndex = daysArr.length - 1

    const colSpan = endDayIndex - startDayIndex + 1

    let targetRow = 1
    let isRowFree = false

    while (!isRowFree) {
      isRowFree = true
      for (let i = startDayIndex; i <= endDayIndex; i++) {
        if (occupiedSlots[i].has(targetRow)) {
          isRowFree = false
          targetRow++
          break
        }
      }
    }

    for (let i = startDayIndex; i <= endDayIndex; i++) {
      occupiedSlots[i].add(targetRow)
    }

    segments.push({
      event,
      colStart: startDayIndex + 1,
      colSpan,
      row: targetRow,
    })
  })

  return segments
}

export interface TimelineEventPosition<T = any> {
  event: CalendarEvent<T>
  top: number
  height: number
  left: number
  width: number
}

export const getTimelinePositionsForDay = (targetDate: Date, events: CalendarEvent[]): TimelineEventPosition[] => {
  const target = startOfDay(targetDate)

  const dayEvents = events.filter(e => {
    if (e.isAllDay) return false
    const eStart = startOfDay(e.start)
    const eEnd = startOfDay(e.end)
    return target >= eStart && target <= eEnd
  })

  dayEvents.sort((a, b) => {
    const startMinsA = isSameDay(a.start, targetDate) ? a.start.getHours() * 60 + a.start.getMinutes() : 0
    const startMinsB = isSameDay(b.start, targetDate) ? b.start.getHours() * 60 + b.start.getMinutes() : 0
    return startMinsA - startMinsB
  })

  const positions: TimelineEventPosition[] = []
  const clusters: CalendarEvent[][] = []
  let currentCluster: CalendarEvent[] = []
  let clusterEnd = 0

  dayEvents.forEach(event => {
    const isStartDay = isSameDay(event.start, targetDate)
    const isEndDay = isSameDay(event.end, targetDate)

    const startMins = isStartDay ? event.start.getHours() * 60 + event.start.getMinutes() : 0
    const endMins = isEndDay ? event.end.getHours() * 60 + event.end.getMinutes() : 24 * 60

    if (currentCluster.length === 0) {
      currentCluster.push(event)
      clusterEnd = endMins
    } else if (startMins < clusterEnd) {
      currentCluster.push(event)
      clusterEnd = Math.max(clusterEnd, endMins)
    } else {
      clusters.push([...currentCluster])
      currentCluster = [event]
      clusterEnd = endMins
    }
  })

  if (currentCluster.length > 0) {
    clusters.push(currentCluster)
  }

  clusters.forEach(cluster => {
    const columns: CalendarEvent[][] = []

    cluster.forEach(event => {
      const isStartDay = isSameDay(event.start, targetDate)
      const startMins = isStartDay ? event.start.getHours() * 60 + event.start.getMinutes() : 0

      let placed = false
      for (let i = 0; i < columns.length; i++) {
        const lastEvent = columns[i][columns[i].length - 1]
        const lastIsEndDay = isSameDay(lastEvent.end, targetDate)
        const lastEndMins = lastIsEndDay ? lastEvent.end.getHours() * 60 + lastEvent.end.getMinutes() : 24 * 60

        if (startMins >= lastEndMins) {
          columns[i].push(event)
          placed = true
          break
        }
      }
      if (!placed) {
        columns.push([event])
      }
    })

    const numCols = columns.length

    columns.forEach((col, colIndex) => {
      col.forEach(event => {
        const isStartDay = isSameDay(event.start, targetDate)
        const isEndDay = isSameDay(event.end, targetDate)

        const startMins = isStartDay ? event.start.getHours() * 60 + event.start.getMinutes() : 0
        const endMins = isEndDay ? event.end.getHours() * 60 + event.end.getMinutes() : 24 * 60

        const durationMins = Math.max(endMins - startMins, 15)

        positions.push({
          event,
          top: (startMins / (24 * 60)) * 100,
          height: (durationMins / (24 * 60)) * 100,
          left: (colIndex / numCols) * 100,
          width: 100 / numCols,
        })
      })
    })
  })

  return positions
}
