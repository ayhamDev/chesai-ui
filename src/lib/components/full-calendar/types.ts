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
  /** Is it an all-day event or spans multiple days without specific times? */
  isAllDay?: boolean
  /** Type of event for the built-in popover tabs */
  type?: EventType
  description?: string
  location?: string
  guests?: string[]
  meetLink?: string
  /** Link to a specific variant color from your theme */
  colorVariant?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'gray' | 'indigo' | 'teal' | 'pink'
  /** Hex or RGB override if a specific color is needed */
  colorHex?: string
  /** Can this event be dragged or resized? Default: true */
  editable?: boolean
  /** Used internally to render the preview event while creating/editing */
  isDraft?: boolean
  /** Developer's custom payload for custom fields */
  data?: T
  /** Recurrence logic rules */
  recurrence?: RecurrenceRule
}

export interface FullCalendarProps<T = any> {
  events: CalendarEvent<T>[]
  initialDate?: Date
  initialView?: CalendarView

  // Callbacks for the developer to handle mutations
  onEventCreate?: (event: Omit<CalendarEvent<T>, 'id' | 'isDraft'>) => void | Promise<void>
  onEventUpdate?: (event: CalendarEvent<T>) => void | Promise<void>
  onEventDelete?: (eventId: string | number) => void | Promise<void>

  // Navigation Callbacks
  onViewChange?: (view: CalendarView) => void
  onDateRangeChange?: (start: Date, end: Date) => void

  // Custom Rendering Injectors for the built-in Popover
  renderPopoverCustomFields?: (
    eventState: Partial<CalendarEvent<T>>,
    setEventState: (updates: Partial<CalendarEvent<T>>) => void,
  ) => React.ReactNode

  // Custom Rendering for the grid items
  renderEventContent?: (event: CalendarEvent<T>, view: CalendarView) => React.ReactNode

  className?: string
}
