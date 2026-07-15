// src/lib/components/full-calendar/types.ts
import React from 'react';

export type CalendarView = 'day' | 'week' | 'month' | 'year';
export type EventType = 'event' | 'task' | 'appointment';
export type CalendarVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'high-contrast'
  | 'ghost'
  | 'surface'
  | 'surface-container-lowest'
  | 'surface-container-low'
  | 'surface-container'
  | 'surface-container-high'
  | 'surface-container-highest';

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[]; // 0 (Sun) to 6 (Sat)
  monthDay?: number; // 1 to 31
  nthDayOfWeek?: {
    dayOfWeek: number; // 0 to 6
    nth: number; // 1, 2, 3, 4, or -1 (last)
  };
  month?: number; // 1 to 12
  endType: 'never' | 'on_date' | 'after_occurrences';
  until?: Date;
  count?: number;
}

export interface RecurrenceException<T = any> {
  /** Start of the occurrence produced by the original recurrence rule. */
  originalStart: Date;
  /** Omits this occurrence without deleting the recurring series. */
  cancelled?: boolean;
  /** Field overrides for this occurrence, including a moved start/end. */
  changes?: Partial<CalendarEvent<T>>;
}

export interface RecurrenceOccurrence {
  seriesId: string | number;
  originalStart: Date;
}

export interface CalendarEvent<T = any> {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  isAllDay?: boolean;
  type?: EventType;
  description?: string;
  location?: string;
  guests?: string[];
  meetLink?: string;
  colorVariant?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'gray' | 'indigo' | 'teal' | 'pink';
  /**
   * Native CSS event background color. Hex and rgb colors automatically receive
   * a readable black or white foreground.
   */
  color?: string;
  /** Optional foreground override when automatic contrast is not desired. */
  textColor?: string;
  /** @deprecated Use `color` instead. */
  colorHex?: string;
  editable?: boolean;
  isDraft?: boolean;
  data?: T;
  recurrence?: RecurrenceRule;
  recurrenceExceptions?: RecurrenceException<T>[];
  /** Generated occurrence identity. Consumers should treat this as read-only. */
  recurrenceOccurrence?: RecurrenceOccurrence;
}

export interface PrintSettings {
  rangeStart: Date;
  rangeEnd: Date;
  view: 'auto' | 'day' | 'week' | 'month' | 'year';
  orientation: 'auto' | 'portrait' | 'landscape';
  colorStyle: 'full' | 'bw';
}

export interface FullCalendarProps<T = any> {
  events: CalendarEvent<T>[];
  initialDate?: Date;
  initialView?: CalendarView;
  variant?: CalendarVariant;

  hidePopoverTitle?: boolean;
  hidePopoverTime?: boolean;
  hidePopoverRecurrence?: boolean;

  /** Prevents the built-in create popover after an empty date/time slot is clicked. */
  disableCreatePopover?: boolean;
  /** Prevents the built-in details/edit popover after an existing event is clicked. */
  disableEventPopover?: boolean;
  /** @deprecated Use `disableCreatePopover` instead. */
  disableCreateOnGridClick?: boolean;
  /** @deprecated Use `disableEventPopover` instead. */
  disableEventClick?: boolean;
  disableDragAndDrop?: boolean;

  /** Called after a newly created event is saved from the built-in popover. */
  onEventCreate?: (event: Omit<CalendarEvent<T>, 'id' | 'isDraft'>) => void | Promise<void>;
  onEventUpdate?: (event: CalendarEvent<T>) => void | Promise<void>;
  onEventDelete?: (eventId: string | number) => void | Promise<void>;

  onViewChange?: (view: CalendarView) => void;
  onDateRangeChange?: (start: Date, end: Date) => void;

  renderPopoverHeader?: (
    eventState: Partial<CalendarEvent<T>>,
    setEventState: (updates: Partial<CalendarEvent<T>>) => void,
  ) => React.ReactNode;

  renderPopoverFooter?: (
    eventState: Partial<CalendarEvent<T>>,
    setEventState: (updates: Partial<CalendarEvent<T>>) => void,
  ) => React.ReactNode;

  renderPopoverCustomFields?: (
    eventState: Partial<CalendarEvent<T>>,
    setEventState: (updates: Partial<CalendarEvent<T>>) => void,
  ) => React.ReactNode;

  renderEventContent?: (event: CalendarEvent<T>, view: CalendarView) => React.ReactNode;

  className?: string;

  /** Called when an empty date/time slot is clicked. This is not a saved event. */
  onDateClick?: (date: Date, e?: React.MouseEvent<any>) => void;
  /**
   * Called when an existing event is clicked. The built-in details/edit popover
   * still opens unless `disableEventPopover` is true.
   */
  onEventClick?: (event: CalendarEvent<T>, e?: React.MouseEvent<any>) => void;
  children?: React.ReactNode;
}
