import { addDays, addWeeks, addYears, startOfDay, startOfMonth, startOfWeek, startOfYear } from 'date-fns'
import type { CalendarView } from './types'

export interface CalendarDateRange {
  start: Date
  end: Date
}

/**
 * Returns the range rendered by a calendar view as a half-open interval:
 * `start` is inclusive and `end` is exclusive.
 */
export const getCalendarDateRange = (currentDate: Date, view: CalendarView): CalendarDateRange => {
  if (view === 'day') {
    const start = startOfDay(currentDate)
    return { start, end: addDays(start, 1) }
  }

  if (view === 'week') {
    const start = startOfWeek(currentDate)
    return { start, end: addWeeks(start, 1) }
  }

  if (view === 'month') {
    // MonthView always renders a six-week grid, including adjacent-month days.
    const start = startOfWeek(startOfMonth(currentDate))
    return { start, end: addDays(start, 42) }
  }

  const start = startOfYear(currentDate)
  return { start, end: addYears(start, 1) }
}
