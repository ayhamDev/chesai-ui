// src/lib/components/full-calendar/utils.ts
import {
  addDays,
  differenceInDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  setMonth,
  startOfDay,
  startOfYear,
} from 'date-fns'
import { RRule } from 'rrule'
import type { CSSProperties } from 'react'
import { getCalendarDateRange } from './calendar-range'
import type { CalendarEvent, CalendarVariant } from './types'

type RGB = { r: number; g: number; b: number }

const parseHexColor = (color: string): RGB | null => {
  const hex = color.trim().replace(/^#/, '')
  if (!/^[\da-f]{3,8}$/i.test(hex) || ![3, 4, 6, 8].includes(hex.length)) {
    return null
  }

  const normalized =
    hex.length <= 4
      ? hex
          .slice(0, 3)
          .split('')
          .map(channel => channel + channel)
          .join('')
      : hex.slice(0, 6)

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

const parseRgbColor = (color: string): RGB | null => {
  const match = color
    .trim()
    .match(
      /^rgba?\(\s*([\d.]+)(%)?[,\s]+([\d.]+)(%)?[,\s]+([\d.]+)(%)?(?:\s*[,/]\s*[\d.]+%?)?\s*\)$/i,
    )

  if (!match) return null

  const toChannel = (value: string, isPercentage: boolean) =>
    Math.min(255, Math.max(0, Number(value) * (isPercentage ? 2.55 : 1)))

  return {
    r: toChannel(match[1], Boolean(match[2])),
    g: toChannel(match[3], Boolean(match[4])),
    b: toChannel(match[5], Boolean(match[6])),
  }
}

const getReadableTextColor = (backgroundColor: string) => {
  const rgb = parseHexColor(backgroundColor) ?? parseRgbColor(backgroundColor)

  // CSS variables and other dynamic colors can use textColor for an explicit
  // override. White is the safest fallback for saturated event colors.
  if (!rgb) return '#ffffff'

  const linearize = (channel: number) => {
    const value = channel / 255
    return value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4
  }

  const luminance =
    0.2126 * linearize(rgb.r) +
    0.7152 * linearize(rgb.g) +
    0.0722 * linearize(rgb.b)
  const blackContrast = (luminance + 0.05) / 0.05
  const whiteContrast = 1.05 / (luminance + 0.05)

  return blackContrast >= whiteContrast ? '#000000' : '#ffffff'
}

export const getCalendarEventColor = (event: CalendarEvent) =>
  event.color ?? event.colorHex

export const getCalendarEventColorStyle = (
  event: CalendarEvent,
  options: { legacyTinted?: boolean } = {},
): CSSProperties | undefined => {
  const backgroundColor = event.color ?? event.colorHex
  if (!backgroundColor) return undefined

  if (!event.color) {
    if (options.legacyTinted) {
      return {
        backgroundColor: `${backgroundColor}20`,
        borderColor: backgroundColor,
        color: event.textColor ?? backgroundColor,
      }
    }

    return {
      backgroundColor,
      color: event.textColor,
    }
  }

  return {
    backgroundColor,
    borderColor: backgroundColor,
    color: event.textColor ?? getReadableTextColor(backgroundColor),
  }
}

// --- THEME UTILS ---
export const getCalendarBgClasses = (variant?: CalendarVariant) => {
  switch (variant) {
    case 'primary':
      return 'bg-surface-container-low text-on-surface'
    case 'secondary':
      return 'bg-surface-container-highest text-on-surface'
    case 'tertiary':
      return 'bg-tertiary-container text-on-tertiary-container'
    case 'high-contrast':
      return 'bg-inverse-surface text-inverse-on-surface'
    case 'ghost':
      return 'bg-transparent text-on-surface'
    case 'surface-container-lowest':
      return 'bg-surface-container-lowest text-on-surface'
    case 'surface-container-low':
      return 'bg-surface-container-low text-on-surface'
    case 'surface-container':
      return 'bg-surface-container text-on-surface'
    case 'surface-container-high':
      return 'bg-surface-container-high text-on-surface'
    case 'surface-container-highest':
      return 'bg-surface-container-highest text-on-surface'
    case 'surface':
    default:
      return 'bg-surface text-on-surface'
  }
}

export const getCalendarStickyBgClasses = (variant?: CalendarVariant) => {
  switch (variant) {
    case 'primary':
      return 'bg-surface-container-low text-on-surface'
    case 'secondary':
      return 'bg-surface-container-highest text-on-surface'
    case 'tertiary':
      return 'bg-tertiary-container text-on-tertiary-container'
    case 'high-contrast':
      return 'bg-inverse-surface text-inverse-on-surface'
    case 'ghost':
      return 'bg-surface/80 backdrop-blur-md text-on-surface'
    case 'surface-container-lowest':
      return 'bg-surface-container-lowest text-on-surface'
    case 'surface-container-low':
      return 'bg-surface-container-low text-on-surface'
    case 'surface-container':
      return 'bg-surface-container text-on-surface'
    case 'surface-container-high':
      return 'bg-surface-container-high text-on-surface'
    case 'surface-container-highest':
      return 'bg-surface-container-highest text-on-surface'
    case 'surface':
    default:
      return 'bg-surface text-on-surface'
  }
}

export const getCalendarSidePanelBgClasses = (variant?: CalendarVariant) => {
  switch (variant) {
    case 'ghost':
      return 'bg-transparent'
    case 'surface-container-lowest':
      return 'bg-surface-container-lowest'
    case 'surface-container-low':
      return 'bg-surface-container-low'
    case 'surface-container':
      return 'bg-surface-container-low/30'
    case 'surface-container-high':
      return 'bg-surface-container-low/50'
    case 'surface-container-highest':
      return 'bg-surface-container-low/70'
    case 'high-contrast':
      return 'bg-inverse-surface/5'
    default:
      return 'bg-surface-container-low/30'
  }
}

const freqMap = {
  daily: RRule.DAILY,
  weekly: RRule.WEEKLY,
  monthly: RRule.MONTHLY,
  yearly: RRule.YEARLY,
};

const RRULE_WEEKDAYS = [
  RRule.SU, // 0
  RRule.MO, // 1
  RRule.TU, // 2
  RRule.WE, // 3
  RRule.TH, // 4
  RRule.FR, // 5
  RRule.SA, // 6
];

// --- VIRTUAL RECURRENCE EXPANSION ---
export const expandEvents = (events: CalendarEvent[], viewStart: Date, viewEnd: Date): CalendarEvent[] => {
  const expanded: CalendarEvent[] = []

  events.forEach(event => {
    if (!event.recurrence) {
      if (event.start <= viewEnd && event.end >= viewStart) {
        expanded.push(event)
      }
      return
    }

    try {
      const rule = event.recurrence;
      const freq = freqMap[rule.frequency];

      const rruleOptions: any = {
        freq,
        dtstart: event.start,
        interval: rule.interval || 1,
      };

      if (rule.endType === 'on_date' && rule.until) {
        rruleOptions.until = rule.until;
      } else if (rule.endType === 'after_occurrences' && rule.count) {
        rruleOptions.count = rule.count;
      }

      // 1. Weekly specific filters
      if (rule.frequency === 'weekly' && rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        rruleOptions.byweekday = rule.daysOfWeek.map(d => RRULE_WEEKDAYS[d]);
      }

      // 2. Monthly specific filters
      if (rule.frequency === 'monthly') {
        if (rule.monthDay) {
          rruleOptions.bymonthday = rule.monthDay;
        } else if (rule.nthDayOfWeek) {
          const { dayOfWeek, nth } = rule.nthDayOfWeek;
          rruleOptions.byweekday = RRULE_WEEKDAYS[dayOfWeek].nth(nth);
        }
      }

      // 3. Yearly specific filters
      if (rule.frequency === 'yearly') {
        if (rule.month) {
          rruleOptions.bymonth = rule.month;
        }
        if (rule.monthDay) {
          rruleOptions.bymonthday = rule.monthDay;
        } else if (rule.nthDayOfWeek) {
          const { dayOfWeek, nth } = rule.nthDayOfWeek;
          rruleOptions.byweekday = RRULE_WEEKDAYS[dayOfWeek].nth(nth);
        }
      }

      const rruleInstance = new RRule(rruleOptions);
      const dates = rruleInstance.between(viewStart, viewEnd, true);
      const duration = event.end.getTime() - event.start.getTime();
      const exceptions = new Map(
        (event.recurrenceExceptions ?? []).map(exception => [
          exception.originalStart.getTime(),
          exception,
        ]),
      )
      const processedExceptionStarts = new Set<number>()

      dates.forEach(date => {
        const originalStartMs = date.getTime()
        const exception = exceptions.get(originalStartMs)
        if (exception) processedExceptionStarts.add(originalStartMs)
        if (exception?.cancelled) return

        const occurrence = {
          ...event,
          ...exception?.changes,
          id: `${event.id}-occ-${originalStartMs}`,
          start: date,
          end: new Date(date.getTime() + duration),
          recurrenceOccurrence: {
            seriesId: event.id,
            originalStart: date,
          },
        }
        if (exception?.changes?.start) occurrence.start = exception.changes.start
        if (exception?.changes?.end) occurrence.end = exception.changes.end

        if (occurrence.start <= viewEnd && occurrence.end >= viewStart) {
          expanded.push(occurrence)
        }
      })

      // A moved override can enter the visible range while its original rule
      // occurrence is outside it. Preserved overrides whose original date is no
      // longer generated by the rule are also treated as standalone instances.
      for (const exception of event.recurrenceExceptions ?? []) {
        const originalStartMs = exception.originalStart.getTime()
        if (
          exception.cancelled ||
          processedExceptionStarts.has(originalStartMs)
        ) {
          continue
        }

        const occurrenceStart =
          exception.changes?.start ?? exception.originalStart
        const occurrenceEnd =
          exception.changes?.end ??
          new Date(occurrenceStart.getTime() + duration)

        if (occurrenceStart <= viewEnd && occurrenceEnd >= viewStart) {
          expanded.push({
            ...event,
            ...exception.changes,
            id: `${event.id}-occ-${originalStartMs}`,
            start: occurrenceStart,
            end: occurrenceEnd,
            recurrenceOccurrence: {
              seriesId: event.id,
              originalStart: exception.originalStart,
            },
          })
        }
      }
    } catch (error) {
      console.error('Failed to parse recurrence rule with rrule.js:', error);
      if (event.start <= viewEnd && event.end >= viewStart) {
        expanded.push(event);
      }
    }
  })

  return expanded
}

export const findRecurringSeries = (
  events: CalendarEvent[],
  occurrence: CalendarEvent,
) => {
  const seriesId = occurrence.recurrenceOccurrence?.seriesId
  if (seriesId === undefined) return undefined
  return events.find(event => String(event.id) === String(seriesId))
}

const getExceptionChanges = (event: CalendarEvent) => {
  const {
    id: _id,
    recurrence: _recurrence,
    recurrenceExceptions: _recurrenceExceptions,
    recurrenceOccurrence: _recurrenceOccurrence,
    isDraft: _isDraft,
    ...changes
  } = event
  return changes
}

export const updateSingleOccurrence = (
  series: CalendarEvent,
  occurrence: CalendarEvent,
  cancelled = false,
): CalendarEvent => {
  const originalStart = occurrence.recurrenceOccurrence?.originalStart
  if (!originalStart) return series

  const nextException = {
    originalStart,
    cancelled,
    changes: cancelled ? undefined : getExceptionChanges(occurrence),
  }
  const exceptions = (series.recurrenceExceptions ?? []).filter(
    exception => exception.originalStart.getTime() !== originalStart.getTime(),
  )

  return {
    ...series,
    recurrenceExceptions: [...exceptions, nextException],
  }
}

export const updateRecurringSeries = (
  series: CalendarEvent,
  originalOccurrence: CalendarEvent,
  updatedOccurrence: CalendarEvent,
): CalendarEvent => {
  const startDelta =
    updatedOccurrence.start.getTime() - originalOccurrence.start.getTime()
  const updatedStart = new Date(series.start.getTime() + startDelta)
  const updatedDuration =
    updatedOccurrence.end.getTime() - updatedOccurrence.start.getTime()
  const updatedEnd = new Date(updatedStart.getTime() + updatedDuration)
  const changes = getExceptionChanges(updatedOccurrence)
  let recurrence = updatedOccurrence.recurrence ?? series.recurrence
  const recurrenceWasEdited =
    JSON.stringify(updatedOccurrence.recurrence) !==
    JSON.stringify(originalOccurrence.recurrence)

  if (
    !recurrenceWasEdited &&
    recurrence?.frequency === 'weekly' &&
    recurrence.daysOfWeek?.length
  ) {
    const dayDelta =
      updatedOccurrence.start.getDay() - originalOccurrence.start.getDay()
    recurrence = {
      ...recurrence,
      daysOfWeek: recurrence.daysOfWeek.map(
        day => (day + dayDelta + 7) % 7,
      ),
    }
  } else if (!recurrenceWasEdited && recurrence?.frequency === 'monthly') {
    recurrence = {
      ...recurrence,
      monthDay:
        recurrence.monthDay !== undefined
          ? updatedStart.getDate()
          : recurrence.monthDay,
      nthDayOfWeek: recurrence.nthDayOfWeek
        ? {
            dayOfWeek: updatedStart.getDay(),
            nth:
              recurrence.nthDayOfWeek.nth === -1
                ? -1
                : Math.ceil(updatedStart.getDate() / 7),
          }
        : undefined,
    }
  } else if (!recurrenceWasEdited && recurrence?.frequency === 'yearly') {
    recurrence = {
      ...recurrence,
      month: updatedStart.getMonth() + 1,
      monthDay:
        recurrence.monthDay !== undefined
          ? updatedStart.getDate()
          : recurrence.monthDay,
      nthDayOfWeek: recurrence.nthDayOfWeek
        ? {
            dayOfWeek: updatedStart.getDay(),
            nth:
              recurrence.nthDayOfWeek.nth === -1
                ? -1
                : Math.ceil(updatedStart.getDate() / 7),
          }
        : undefined,
    }
  }

  return {
    ...series,
    ...changes,
    id: series.id,
    start: updatedStart,
    end: updatedEnd,
    recurrence,
    recurrenceExceptions: series.recurrenceExceptions,
  }
}

export const getDaysForMonthView = (currentDate: Date) => {
  const { start, end } = getCalendarDateRange(currentDate, 'month')

  const days: Date[] = []
  let day = start

  while (day < end) {
    days.push(day)
    day = addDays(day, 1)
  }

  return days
}

export const getDaysForWeekView = (currentDate: Date) => {
  const { start, end } = getCalendarDateRange(currentDate, 'week')
  const days: Date[] = []
  let day = start
  while (day < end) {
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
