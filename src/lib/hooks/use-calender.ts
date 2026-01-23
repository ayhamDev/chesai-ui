import {
  addDays,
  addMonths,
  addYears,
  endOfMonth,
  endOfWeek,
  format,
  getMonth,
  getYear,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  setMonth,
  setYear,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { useMemo, useState } from 'react'

export type CalendarMode = 'single' | 'range'

export interface DateRange {
  from?: Date
  to?: Date
}

export const useCalendar = (
  initialDate: Date = new Date(),
  value?: Date | DateRange,
  mode: CalendarMode = 'single',
) => {
  const [cursorDate, setCursorDate] = useState(initialDate)

  // Fixed 6-week grid (42 days)
  // Memoized to prevent recalculation on every render unless cursorDate changes
  const daysInMonth = useMemo(() => {
    const startOfTheSelectedMonth = startOfMonth(cursorDate)
    const startOfFirstWeek = startOfWeek(startOfTheSelectedMonth)
    return Array.from({ length: 42 }).map((_, i) => addDays(startOfFirstWeek, i))
  }, [cursorDate])

  // Navigation
  const nextMonth = () => setCursorDate(prev => addMonths(prev, 1))
  const prevMonth = () => setCursorDate(prev => addMonths(prev, -1))
  const nextYear = () => setCursorDate(prev => addYears(prev, 1))
  const prevYear = () => setCursorDate(prev => addYears(prev, -1))

  // Selection
  const selectYear = (year: number) => setCursorDate(prev => setYear(prev, year))
  const selectMonth = (month: number) => setCursorDate(prev => setMonth(prev, month))

  // Helper to calculate props.
  // We keep this cheap so it can run during render without lag.
  const getDayProps = (day: Date) => {
    const isRangeMode = mode === 'range'
    const rangeValue = value as DateRange | undefined
    const singleValue = value as Date | undefined

    const isSelected =
      (!isRangeMode && singleValue && isSameDay(day, singleValue)) ||
      (isRangeMode &&
        rangeValue &&
        ((rangeValue.from && isSameDay(day, rangeValue.from)) || (rangeValue.to && isSameDay(day, rangeValue.to))))

    const isRangeStart = isRangeMode && rangeValue?.from && isSameDay(day, rangeValue.from)
    const isRangeEnd = isRangeMode && rangeValue?.to && isSameDay(day, rangeValue.to)

    const isInRange =
      isRangeMode && rangeValue?.from && rangeValue?.to && isAfter(day, rangeValue.from) && isBefore(day, rangeValue.to)

    return {
      date: day,
      isCurrentMonth: isSameMonth(day, cursorDate),
      isToday: isToday(day),
      isSelected: !!isSelected,
      isRangeStart: !!isRangeStart,
      isRangeEnd: !!isRangeEnd,
      isInRange: !!isInRange,
    }
  }

  return {
    cursorDate,
    setCursorDate,
    daysInMonth,
    weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    getDayProps,
    nextMonth,
    prevMonth,
    nextYear,
    prevYear,
    selectYear,
    selectMonth,
    currentMonthName: format(cursorDate, 'MMMM'),
    currentMonthIndex: getMonth(cursorDate),
    currentYear: getYear(cursorDate),
  }
}
