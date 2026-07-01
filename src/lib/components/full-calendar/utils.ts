// src/lib/components/full-calendar/utils.ts
import {
  addDays,
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
import { RRule } from 'rrule'
import type { CalendarEvent, CalendarVariant } from './types'

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

      dates.forEach((date, index) => {
        expanded.push({
          ...event,
          id: `${event.id}-occ-${index}`,
          start: date,
          end: new Date(date.getTime() + duration),
        });
      });
    } catch (error) {
      console.error('Failed to parse recurrence rule with rrule.js:', error);
      if (event.start <= viewEnd && event.end >= viewStart) {
        expanded.push(event);
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
