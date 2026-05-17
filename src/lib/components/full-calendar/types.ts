// src/lib/components/full-calendar/types.ts

export type CalendarView = 'day' | 'week' | 'month' | 'year'
export type EventType = 'event' | 'task' | 'appointment'

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  daysOfWeek?: number[] // 0 (Sun) to 6 (Sat)
  endType: 'never' | 'on_date' | 'after_occurrences'
  until?: Date
  count?: number
}

export interface CalendarEvent<T = any> {
  id: string | number
  title: string
  start: Date
  end: Date
  isAllDay?: boolean
  type?: EventType
  description?: string
  location?: string
  guests?: string[]
  meetLink?: string
  colorVariant?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'gray' | 'indigo' | 'teal' | 'pink'
  colorHex?: string
  editable?: boolean
  isDraft?: boolean
  data?: T
  recurrence?: RecurrenceRule
}

export interface PrintSettings {
  rangeStart: Date
  rangeEnd: Date
  view: 'auto' | 'day' | 'week' | 'month'
  fontSize: 'normal' | 'small' | 'smallest'
  orientation: 'auto' | 'portrait' | 'landscape'
  colorStyle: 'full' | 'bw'
  showWeekends: boolean
  showDeclined: boolean
}

export interface FullCalendarProps<T = any> {
  events: CalendarEvent<T>[]
  initialDate?: Date
  initialView?: CalendarView

  onEventCreate?: (event: Omit<CalendarEvent<T>, 'id' | 'isDraft'>) => void | Promise<void>
  onEventUpdate?: (event: CalendarEvent<T>) => void | Promise<void>
  onEventDelete?: (eventId: string | number) => void | Promise<void>

  onViewChange?: (view: CalendarView) => void
  onDateRangeChange?: (start: Date, end: Date) => void

  renderPopoverCustomFields?: (
    eventState: Partial<CalendarEvent<T>>,
    setEventState: (updates: Partial<CalendarEvent<T>>) => void,
  ) => React.ReactNode

  renderEventContent?: (event: CalendarEvent<T>, view: CalendarView) => React.ReactNode

  className?: string
}
