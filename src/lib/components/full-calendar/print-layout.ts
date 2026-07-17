import { addDays, startOfDay } from 'date-fns'
import type { CalendarEvent } from './types'
import { expandEvents } from './utils'

export type PrintOrientation = 'auto' | 'portrait' | 'landscape'

export const LETTER_PAGE_PIXELS = {
  portrait: { width: 816, height: 1056 },
  landscape: { width: 1056, height: 816 },
} as const

export const resolvePrintOrientation = (orientation: PrintOrientation): 'portrait' | 'landscape' =>
  orientation === 'portrait' ? 'portrait' : 'landscape'

export const getDayDatesInRange = (rangeStart: Date, rangeEnd: Date): Date[] => {
  const start = startOfDay(rangeStart)
  const end = startOfDay(rangeEnd)
  const dates: Date[] = []

  for (let date = start; date <= end; date = addDays(date, 1)) {
    dates.push(date)
  }

  return dates
}

export const filterDaysWithEvents = (dates: Date[], events: CalendarEvent[]): Date[] =>
  dates.filter(date => {
    const dayStart = startOfDay(date)
    const dayEnd = addDays(dayStart, 1)

    return expandEvents(events, dayStart, dayEnd).some(event => event.start < dayEnd && event.end > dayStart)
  })
