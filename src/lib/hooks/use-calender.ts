import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter, // FIX: Import isAfter
  isBefore, // FIX: Import isBefore
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { useMemo } from 'react'
// FIX: Use 'import type' for type-only imports
import type { DateRange } from 'react-day-picker'

export const useCalendar = (cursorDate: Date, value?: Date | DateRange, mode: 'single' | 'range' = 'single') => {
  const firstDayOfMonth = startOfMonth(cursorDate)
  const lastDayOfMonth = endOfMonth(cursorDate)
  const firstDayOfFirstWeek = startOfWeek(firstDayOfMonth)
  const lastDayOfLastWeek = endOfWeek(lastDayOfMonth)

  const daysInMonth = useMemo(
    () =>
      eachDayOfInterval({
        start: firstDayOfFirstWeek,
        end: lastDayOfLastWeek,
      }),
    [firstDayOfFirstWeek, lastDayOfLastWeek],
  )

  const getDayProps = (day: Date) => {
    // FIX: Use type guards to safely check for properties on 'value'
    const isValueDateRange = mode === 'range' && value && 'from' in value

    const isSelected =
      (mode === 'single' && value instanceof Date && isSameDay(day, value)) ||
      (isValueDateRange && ((value.from && isSameDay(day, value.from)) || (value.to && isSameDay(day, value.to))))

    const isRangeStart = isValueDateRange && value.from && isSameDay(day, value.from)

    const isRangeEnd = isValueDateRange && value.to && isSameDay(day, value.to)

    const isInRange = isValueDateRange && value.from && value.to && isAfter(day, value.from) && isBefore(day, value.to)

    return {
      isCurrentMonth: isSameMonth(day, cursorDate),
      isToday: isToday(day),
      isSelected,
      isRangeStart,
      isRangeEnd,
      isInRange,
    }
  }

  return {
    daysInMonth,
    weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    getDayProps,
  }
}
