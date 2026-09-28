'use client'

import { addDays, type Day, format, isSameDay, isToday, type Locale, startOfDay, startOfWeek } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { MotionConfig, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import useRipple from 'use-ripple-hook'
import { useDirection } from '../../context/direction'
import type { DateRange } from '../../hooks/use-calender'
import { IconButton } from '../icon-button'
import { Tooltip, TooltipProvider, TooltipTrigger } from '../tooltip'
import {
  weekCalendarColors,
  weekCalendarDayVariants,
  weekCalendarNavigationSizes,
  weekCalendarRowHeights,
  weekCalendarVariants,
} from './styles'
import { useDateStrip } from './use-date-strip'

export { weekCalendarDayVariants, weekCalendarVariants } from './styles'

export interface WeekCalendarDayState {
  isSelected: boolean
  isToday: boolean
  isDisabled: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
  isInRange: boolean
}

export interface WeekCalendarLabels {
  calendar: string
  previousWeek: string
  nextWeek: string
}

export type WeekCalendarSlot = 'header' | 'navigation' | 'grid' | 'day' | 'weekday' | 'dayNumber' | 'eventIndicator'

interface WeekCalendarBaseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onSelect' | 'children' | 'color'> {
  variant?: 'default' | 'outlined' | 'embedded'
  color?: keyof typeof weekCalendarColors
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'full' | 'minimal' | 'sharp'
  itemShape?: 'full' | 'minimal' | 'sharp'
  /** Initially reveals the containing week. Later changes scroll to the date; scroll callbacks report the leading date. */
  visibleDate?: Date
  defaultVisibleDate?: Date
  onVisibleDateChange?: (weekStart: Date) => void
  /** date-fns locale; its week start is used unless weekStartsOn is supplied. */
  locale?: Locale
  weekStartsOn?: Day
  weekdayFormat?: 'narrow' | 'short' | 'long'
  labels?: Partial<WeekCalendarLabels>
  /** Inclusive local calendar dates; times of day are ignored. */
  minDate?: Date
  maxDate?: Date
  isDateDisabled?: (date: Date) => boolean
  disabled?: boolean
  readOnly?: boolean
  isInvalid?: boolean
  showHeader?: boolean
  /** Mouse, touch, and pen dragging can be disabled independently of the arrow buttons. */
  swipeable?: boolean
  /** Settle direct scrolling on individual days or complete calendar weeks. */
  swipeMode?: 'day' | 'week'
  disableAnimation?: boolean
  /** Carry the selected weekday into the interval reached by the previous/next buttons. */
  selectionFollowsNavigation?: boolean
  classNames?: Partial<Record<WeekCalendarSlot, string>>
  /** Local dates that display a dot to indicate one or more events. Times of day are ignored. */
  eventDates?: readonly Date[]
  /** Non-interactive content inside the accessible day button. */
  renderDay?: (date: Date, state: WeekCalendarDayState) => React.ReactNode
  /** Include event/availability details in the accessible date label when customizing day content. */
  getDayLabel?: (date: Date, state: WeekCalendarDayState) => string
  /** Optional local yyyy-MM-dd form value. Range mode submits name.from and name.to. */
  name?: string
  form?: string
}

export type WeekCalendarProps = WeekCalendarBaseProps &
  (
    | {
        mode?: 'single'
        value?: Date | null
        defaultValue?: Date | null
        onSelect?: (date: Date | null) => void
        onRangeSelect?: never
      }
    | {
        mode: 'range'
        value?: DateRange | null
        defaultValue?: DateRange | null
        onRangeSelect?: (range: DateRange) => void
        onSelect?: never
      }
    | {
        mode: 'none'
        value?: never
        defaultValue?: never
        onSelect?: never
        onRangeSelect?: never
      }
  )

const dayKey = (date: Date) => format(date, 'yyyy-MM-dd')
const selectionStart = (value: Date | DateRange | null | undefined) => (value instanceof Date ? value : value?.from)

const DayButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { animate: boolean; selected: boolean }
>(({ animate, selected, onPointerDown, ...props }, forwardedRef) => {
  const ref = useRef<HTMLButtonElement>(null)
  React.useImperativeHandle(forwardedRef, () => ref.current as HTMLButtonElement)
  const [, ripple] = useRipple({
    ref: ref as React.RefObject<HTMLElement>,
    color: selected ? 'var(--color-ripple-light)' : 'var(--color-ripple-dark)',
    duration: 400,
    disabled: !animate || !!props.disabled || !!props['aria-disabled'],
  })
  return (
    <button
      {...props}
      ref={ref}
      type="button"
      onPointerDown={event => {
        onPointerDown?.(event)
        if (!event.defaultPrevented) ripple(event)
      }}
    />
  )
})
DayButton.displayName = 'WeekCalendarDayButton'

/** A compact, local-date calendar with one visible week and independent selection/navigation. */
export const WeekCalendar = React.forwardRef<HTMLDivElement, WeekCalendarProps>((props, forwardedRef) => {
  const {
    mode = 'single',
    value,
    defaultValue,
    onSelect,
    onRangeSelect,
    visibleDate,
    defaultVisibleDate,
    onVisibleDateChange,
    locale = enUS,
    weekStartsOn = locale.options?.weekStartsOn ?? 0,
    weekdayFormat = 'short',
    minDate,
    maxDate,
    isDateDisabled,
    disabled = false,
    readOnly = false,
    isInvalid = false,
    variant = 'embedded',
    color = 'primary',
    size = 'md',
    shape = 'full',
    itemShape = shape,
    showHeader = false,
    swipeable = true,
    swipeMode = 'day',
    disableAnimation = false,
    selectionFollowsNavigation = true,
    labels,
    classNames,
    eventDates,
    renderDay,
    getDayLabel,
    name,
    form,
    className,
    dir,
    onPointerDownCapture,
    onClickCapture,
    ...rootProps
  } = props
  const rootRef = useRef<HTMLDivElement>(null)
  React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement)
  const direction = useDirection(rootRef, dir)
  const reducedMotion = useReducedMotion()
  const animate = !disableAnimation && !reducedMotion
  const id = useId()
  const text = { calendar: 'Choose a date', previousWeek: 'Previous week', nextWeek: 'Next week', ...labels }
  const [internalValue, setInternalValue] = useState<Date | DateRange | null>(defaultValue ?? null)
  const selection = mode === 'none' ? null : value !== undefined ? value : internalValue
  const selectedDate = selectionStart(selection)
  const clamp = (date: Date) => {
    const day = startOfDay(date)
    if (minDate && day < startOfDay(minDate)) return startOfDay(minDate)
    if (maxDate && day > startOfDay(maxDate)) return startOfDay(maxDate)
    return day
  }
  const [internalVisibleDate, setInternalVisibleDate] = useState(
    () => defaultVisibleDate ?? clamp(selectedDate ?? new Date()),
  )
  const selectedKey = selectedDate ? dayKey(selectedDate) : undefined
  const eventDateKeys = new Set(eventDates?.map(dayKey))
  const lastSelectedKey = useRef(selectedKey)
  // External selection changes reveal the new date; browsing alone never changes selection.
  useEffect(() => {
    if (lastSelectedKey.current !== selectedKey) {
      lastSelectedKey.current = selectedKey
      if (selectedDate && visibleDate === undefined) setInternalVisibleDate(selectedDate)
    }
  }, [selectedKey, selectedDate, visibleDate])
  const strip = useDateStrip({
    reducedMotion: !animate,
    swipeMode,
    date: visibleDate ?? internalVisibleDate,
    weekStartsOn,
    minDate,
    maxDate,
    rtl: direction === 'rtl',
    enabled: swipeable && !disabled,
    onVisibleDateChange,
  })
  const days = strip.items.filter(item => item.visible).map(item => item.date)
  const weekEnd = days[days.length - 1] ?? addDays(strip.firstDate, 6)
  const range = mode === 'range' && !(selection instanceof Date) ? selection : null
  const unavailable = (day: Date) =>
    disabled ||
    !!(minDate && day < startOfDay(minDate)) ||
    !!(maxDate && day > startOfDay(maxDate)) ||
    !!isDateDisabled?.(day)
  const stateFor = (day: Date): WeekCalendarDayState => {
    const isRangeStart = !!range?.from && isSameDay(day, range.from)
    const isRangeEnd = !!range?.to && isSameDay(day, range.to)
    const isInRange = !!range?.from && !!range.to && day > startOfDay(range.from) && day < startOfDay(range.to)
    return {
      isSelected:
        mode === 'single'
          ? selection instanceof Date && isSameDay(day, selection)
          : isRangeStart || isRangeEnd || isInRange,
      isToday: isToday(day),
      isDisabled: unavailable(day),
      isRangeStart,
      isRangeEnd,
      isInRange,
    }
  }
  const [focusedKey, setFocusedKey] = useState(selectedKey)
  const pendingFocus = useRef<string | null>(null)
  const tabDay =
    days.find(day => dayKey(day) === focusedKey) ??
    days.find(day => stateFor(day).isSelected && !unavailable(day)) ??
    days.find(day => isToday(day) && !unavailable(day)) ??
    days.find(day => !unavailable(day)) ??
    days[0]

  useLayoutEffect(() => {
    if (!pendingFocus.current) return
    const button = rootRef.current?.querySelector<HTMLButtonElement>(`button[data-date="${pendingFocus.current}"]`)
    if (button) {
      button.focus({ preventScroll: true })
      pendingFocus.current = null
    }
  })

  const changeWeek = (date: Date) => {
    const next = startOfWeek(clamp(date), { weekStartsOn })
    if (isSameDay(next, strip.navigationDate())) return
    strip.prepareNavigation(next)
    if (visibleDate === undefined) setInternalVisibleDate(next)
    onVisibleDateChange?.(next)
  }
  const previousDisabled = disabled || !!(minDate && strip.firstDate <= startOfDay(minDate))
  const nextDisabled = disabled || !!(maxDate && weekEnd >= startOfDay(maxDate))
  const navigate = (offset: number) => {
    if (offset < 0 ? previousDisabled : nextDisabled) return
    const currentWeek = startOfWeek(strip.navigationDate(), { weekStartsOn })
    const next = startOfWeek(clamp(addDays(currentWeek, offset * 7)), { weekStartsOn })
    changeWeek(next)
    if (mode === 'single' && selection instanceof Date && selectionFollowsNavigation && !readOnly) {
      const target = addDays(next, (selection.getDay() - next.getDay() + 7) % 7)
      if (!unavailable(target)) {
        lastSelectedKey.current = dayKey(target)
        if (value === undefined) setInternalValue(target)
        onSelect?.(target)
      }
    }
  }
  const select = (day: Date) => {
    if (mode === 'none' || readOnly || unavailable(day)) return
    // Selecting a visible date must not realign a freely scrolled strip to a week boundary.
    if (mode === 'single') {
      const next = selection instanceof Date && isSameDay(day, selection) ? null : day
      lastSelectedKey.current = next ? dayKey(next) : undefined
      if (value === undefined) setInternalValue(next)
      onSelect?.(next)
      return
    }
    let next: DateRange = { from: day }
    if (range?.from && !range.to) {
      const from = startOfDay(day < range.from ? day : range.from)
      const to = startOfDay(day < range.from ? range.from : day)
      // A blocked day restarts the range at the clicked date instead of selecting unavailable dates.
      let blocked = false
      for (let cursor = from; cursor <= to; cursor = addDays(cursor, 1)) {
        if (unavailable(cursor)) {
          blocked = true
          break
        }
      }
      if (!blocked) next = { from, to }
    }
    lastSelectedKey.current = next.from ? dayKey(next.from) : undefined
    if (value === undefined) setInternalValue(next)
    onRangeSelect?.(next)
  }
  const onDayKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, day: Date) => {
    if (disabled || event.altKey || event.ctrlKey || event.metaKey) return
    let target: Date
    switch (event.key) {
      case 'ArrowRight':
        target = addDays(day, direction === 'rtl' ? -1 : 1)
        break
      case 'ArrowLeft':
        target = addDays(day, direction === 'rtl' ? 1 : -1)
        break
      case 'ArrowDown':
      case 'PageDown':
        target = addDays(day, 7)
        break
      case 'ArrowUp':
      case 'PageUp':
        target = addDays(day, -7)
        break
      case 'Home':
        target = startOfWeek(day, { weekStartsOn })
        break
      case 'End':
        target = addDays(startOfWeek(day, { weekStartsOn }), 6)
        break
      default:
        return
    }
    event.preventDefault()
    target = clamp(target)
    pendingFocus.current = dayKey(target)
    setFocusedKey(dayKey(target))
    strip.reveal(target)
  }
  const weekLabel = `${format(strip.firstDate, 'PPP', { locale })} – ${format(weekEnd, 'PPP', { locale })}`

  return (
    <MotionConfig reducedMotion={disableAnimation ? 'always' : 'user'}>
      <div
        {...rootProps}
        ref={rootRef}
        dir={dir}
        data-slot="week-calendar"
        data-disabled={disabled || undefined}
        data-invalid={isInvalid || undefined}
        className={twMerge(weekCalendarVariants({ variant, shape }), isInvalid && 'ring-1 ring-error', className)}
        onPointerDownCapture={event => {
          // A fresh press (including on navigation) is intentional, not the synthetic click after a drag.
          strip.suppressClickUntil.current = 0
          onPointerDownCapture?.(event)
        }}
        onClickCapture={event => {
          onClickCapture?.(event)
          if (event.detail !== 0 && Date.now() < strip.suppressClickUntil.current) {
            event.preventDefault()
            event.stopPropagation()
          }
        }}
      >
        <div
          id={`${id}-week`}
          aria-live="polite"
          aria-atomic="true"
          className={twMerge(
            showHeader ? 'mb-3 text-sm font-medium text-on-surface-variant' : 'sr-only',
            classNames?.header,
          )}
        >
          {weekLabel}
        </div>
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <TooltipProvider>
            <TooltipTrigger asChild>
              <IconButton
                type="button"
                variant="ghost"
                size={size}
                shape={itemShape}
                aria-label={text.previousWeek}
                disabled={previousDisabled}
                onClick={() => navigate(-1)}
                className={twMerge(
                  'shrink-0 motion-reduce:transition-none motion-reduce:after:transition-none',
                  weekCalendarNavigationSizes[size],
                  itemShape === 'minimal' && 'rounded-xl!',
                  classNames?.navigation,
                )}
              >
                {direction === 'rtl' ? <ChevronRight aria-hidden="true" /> : <ChevronLeft aria-hidden="true" />}
              </IconButton>
            </TooltipTrigger>
            <Tooltip size="sm" dir={direction}>
              {text.previousWeek}
            </Tooltip>
          </TooltipProvider>
          {/* biome-ignore lint/a11y/useSemanticElements: This is an interactive calendar grid with roving focus, not a data table. */}
          <div
            {...strip.handlers}
            ref={strip.ref}
            dir={direction}
            role="grid"
            aria-label={rootProps['aria-label'] ?? text.calendar}
            aria-labelledby={rootProps['aria-labelledby']}
            aria-describedby={[`${id}-week`, rootProps['aria-describedby']].filter(Boolean).join(' ')}
            aria-multiselectable={mode === 'range' || undefined}
            aria-readonly={mode === 'none' || readOnly || undefined}
            aria-disabled={disabled || undefined}
            aria-invalid={isInvalid || undefined}
            data-scrolling={strip.scrolling || undefined}
            className={twMerge(
              'min-w-0 flex-1 select-none overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              swipeable && !disabled ? 'overflow-x-auto touch-auto' : 'overflow-x-hidden',
              classNames?.grid,
            )}
          >
            {/* biome-ignore lint/a11y/useSemanticElements: Virtual calendar row; child buttons own roving focus. */}
            {/* biome-ignore lint/a11y/useFocusableInteractive: Focus belongs to the day buttons. */}
            <div
              role="row"
              aria-label={weekLabel}
              className="relative"
              style={{ width: strip.totalWidth, height: weekCalendarRowHeights[size] }}
            >
              {strip.items.map(({ date: day, index, visible }) => {
                const state = stateFor(day)
                const key = dayKey(day)
                const hasEvent = eventDateKeys.has(key)
                return (
                  // biome-ignore lint/a11y/useSemanticElements: Calendar grid cell; its button owns keyboard interaction.
                  // biome-ignore lint/a11y/useFocusableInteractive: Focus is managed on the child button, not the cell.
                  <div
                    role="gridcell"
                    aria-selected={state.isSelected}
                    aria-hidden={!visible || undefined}
                    key={key}
                    className="absolute top-1 flex min-w-0 justify-center px-0.5 sm:px-1"
                    style={{ insetInlineStart: index * strip.dayWidth, width: strip.dayWidth }}
                  >
                    <TooltipProvider>
                      <TooltipTrigger asChild>
                        <DayButton
                          animate={animate}
                          selected={
                            state.isSelected &&
                            !state.isInRange &&
                            ['primary', 'secondary', 'tertiary', 'error', 'inverse'].includes(color)
                          }
                          data-date={key}
                          data-selected={state.isSelected || undefined}
                          data-today={state.isToday || undefined}
                          data-range-start={state.isRangeStart || undefined}
                          data-range-end={state.isRangeEnd || undefined}
                          data-in-range={state.isInRange || undefined}
                          data-has-event={hasEvent || undefined}
                          disabled={disabled}
                          aria-disabled={state.isDisabled || readOnly || mode === 'none' || undefined}
                          aria-label={
                            getDayLabel?.(day, state) ??
                            `${format(day, 'PPPP', { locale })}${hasEvent ? ', has events' : ''}`
                          }
                          aria-current={state.isToday ? 'date' : undefined}
                          tabIndex={!disabled && isSameDay(day, tabDay) ? 0 : -1}
                          onFocus={() => setFocusedKey(key)}
                          onKeyDown={event => onDayKeyDown(event, day)}
                          onClick={() => select(day)}
                          className={twMerge(
                            weekCalendarDayVariants({ size, shape: itemShape }),
                            state.isInRange
                              ? weekCalendarColors[color].range
                              : state.isSelected
                                ? weekCalendarColors[color].selected
                                : 'text-on-surface',
                            state.isToday && !state.isSelected && 'ring-1 ring-inset ring-outline',
                            (readOnly || mode === 'none') &&
                              !state.isDisabled &&
                              'aria-disabled:opacity-100 aria-disabled:cursor-default',
                            !animate && 'transition-none after:transition-none',
                            strip.scrolling && 'after:opacity-0!',
                            classNames?.day,
                          )}
                        >
                          {renderDay ? (
                            renderDay(day, state)
                          ) : (
                            <>
                              <span
                                aria-hidden="true"
                                className={twMerge(
                                  'max-w-full truncate text-[0.65rem] font-medium uppercase leading-tight sm:text-xs',
                                  classNames?.weekday,
                                )}
                              >
                                {format(
                                  day,
                                  weekdayFormat === 'narrow' ? 'EEEEE' : weekdayFormat === 'long' ? 'EEEE' : 'EEE',
                                  { locale },
                                )}
                              </span>
                              <span
                                aria-hidden="true"
                                className={twMerge('font-semibold leading-tight tabular-nums', classNames?.dayNumber)}
                              >
                                {format(day, 'd', { locale })}
                              </span>
                            </>
                          )}
                          {hasEvent && (
                            <span
                              aria-hidden="true"
                              data-slot="week-calendar-event-indicator"
                              className={twMerge(
                                'pointer-events-none absolute bottom-1 size-1 rounded-full bg-current',
                                classNames?.eventIndicator,
                              )}
                            />
                          )}
                        </DayButton>
                      </TooltipTrigger>
                      {!strip.scrolling && visible && (
                        <Tooltip size="sm" dir={direction}>
                          {format(day, 'PP', { locale })}
                        </Tooltip>
                      )}
                    </TooltipProvider>
                  </div>
                )
              })}
            </div>
          </div>
          <TooltipProvider>
            <TooltipTrigger asChild>
              <IconButton
                type="button"
                variant="ghost"
                size={size}
                shape={itemShape}
                aria-label={text.nextWeek}
                disabled={nextDisabled}
                onClick={() => navigate(1)}
                className={twMerge(
                  'shrink-0 motion-reduce:transition-none motion-reduce:after:transition-none',
                  weekCalendarNavigationSizes[size],
                  itemShape === 'minimal' && 'rounded-xl!',
                  classNames?.navigation,
                )}
              >
                {direction === 'rtl' ? <ChevronLeft aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
              </IconButton>
            </TooltipTrigger>
            <Tooltip size="sm" dir={direction}>
              {text.nextWeek}
            </Tooltip>
          </TooltipProvider>
        </div>
        {name &&
          mode !== 'none' &&
          (mode === 'single' ? (
            <input
              type="hidden"
              name={name}
              form={form}
              disabled={disabled}
              value={selection instanceof Date ? dayKey(selection) : ''}
            />
          ) : (
            <>
              <input
                type="hidden"
                name={`${name}.from`}
                form={form}
                disabled={disabled}
                value={range?.from ? dayKey(range.from) : ''}
              />
              <input
                type="hidden"
                name={`${name}.to`}
                form={form}
                disabled={disabled}
                value={range?.to ? dayKey(range.to) : ''}
              />
            </>
          ))}
      </div>
    </MotionConfig>
  )
})
WeekCalendar.displayName = 'WeekCalendar'
