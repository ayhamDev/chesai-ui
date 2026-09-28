import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { enGB } from 'date-fns/locale'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DirectionProvider } from '../../context/direction'
import { WeekCalendar } from './index'

const resizeObservers = new Map<Element, () => void>()
beforeEach(() => {
  resizeObservers.clear()
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private callback: () => void) {}
      observe(element: Element) {
        resizeObservers.set(element, this.callback)
      }
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    'PointerEvent',
    class extends MouseEvent {
      pointerId: number
      pointerType: string
      isPrimary: boolean
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init)
        this.pointerId = init.pointerId ?? 1
        this.pointerType = init.pointerType ?? 'mouse'
        this.isPrimary = init.isPrimary ?? true
      }
    },
  )
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
const date = (day: number) => new Date(2026, 8, day)
const dayButton = (day: number) =>
  screen.getByRole('button', { name: new RegExp(`September ${day}(?:st|nd|rd|th), 2026`) }) as HTMLButtonElement
const nextWeek = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Next week' }))
  await waitFor(() => expect(screen.getByRole('grid').hasAttribute('data-scrolling')).toBe(false))
}
const drag = (dx: number, dy = 0, pointerType = 'mouse', cancel = false) => {
  const grid = screen.getByRole('grid')
  Object.assign(grid, { setPointerCapture: vi.fn(), hasPointerCapture: () => true, releasePointerCapture: vi.fn() })
  const pointer = { pointerId: 1, pointerType, isPrimary: true, button: 0 }
  // Start on a date button, as real users do, to cover capture/bubbling through tooltip triggers.
  fireEvent.pointerDown(screen.getAllByRole('gridcell')[0].querySelector('button') as HTMLButtonElement, {
    ...pointer,
    clientX: 180,
    clientY: 60,
  })
  fireEvent.pointerMove(grid, { ...pointer, clientX: 180 + dx, clientY: 60 + dy })
  // JSDOM has no native panning. Model the browser's scroll event separately from pointer handling.
  if (pointerType === 'touch' && !cancel && Math.abs(dx) > Math.abs(dy) && grid.className.includes('overflow-x-auto')) {
    const sign = grid.dir === 'rtl' ? -1 : 1
    const max = Number.parseFloat((grid.firstElementChild as HTMLElement).style.width) - 700
    grid.scrollLeft = sign * Math.max(0, Math.min(sign * (grid.scrollLeft - dx), max))
    fireEvent.scroll(grid)
  }
  if (cancel) fireEvent.pointerCancel(grid, pointer)
  else fireEvent.pointerUp(grid, { ...pointer, clientX: 180 + dx, clientY: 60 + dy })
}

describe('WeekCalendar', () => {
  it('shows an event dot for passed dates without changing day selection', () => {
    render(<WeekCalendar defaultVisibleDate={date(23)} eventDates={[date(22), date(24)]} disableAnimation />)

    expect(dayButton(22)).toHaveAttribute('data-has-event')
    expect(dayButton(24)).toHaveAttribute('data-has-event')
    expect(dayButton(23)).not.toHaveAttribute('data-has-event')
    expect(dayButton(24)).toHaveAccessibleName(/September 24th, 2026, has events/)
    expect(dayButton(24).querySelector('[data-slot="week-calendar-event-indicator"]')).toBeTruthy()
    expect(dayButton(24).closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'false')
  })

  it('supports navigation only without selection or form values', async () => {
    const { container } = render(
      <WeekCalendar mode="none" name="date" defaultVisibleDate={date(23)} disableAnimation />,
    )
    fireEvent.click(dayButton(23))
    expect(dayButton(23).getAttribute('aria-disabled')).toBe('true')
    expect(screen.getAllByRole('gridcell').every(cell => cell.getAttribute('aria-selected') === 'false')).toBe(true)
    act(() => dayButton(23).focus())
    fireEvent.keyDown(dayButton(23), { key: 'ArrowRight' })
    expect(document.activeElement).toBe(dayButton(24))
    await nextWeek()
    expect(dayButton(30)).toBeTruthy()
    expect(screen.getAllByRole('gridcell').every(cell => cell.getAttribute('aria-selected') === 'false')).toBe(true)
    expect(container.querySelector('input[type="hidden"]')).toBeNull()
  })

  it.each(['mouse', 'touch', 'pen'])('settles a %s swipe onto a full week when requested', pointerType => {
    vi.useFakeTimers()
    const onVisibleDateChange = vi.fn()
    render(
      <WeekCalendar
        mode="none"
        defaultVisibleDate={date(23)}
        swipeMode="week"
        onVisibleDateChange={onVisibleDateChange}
        disableAnimation
      />,
    )
    const grid = screen.getByRole('grid')
    const before = grid.scrollLeft
    drag(-430, 0, pointerType)
    expect(grid.scrollLeft - before).toBe(430)
    act(() => vi.advanceTimersByTime(151))
    expect(grid.scrollLeft - before).toBe(700)
    expect(screen.getAllByRole('gridcell')).toHaveLength(7)
    expect(screen.getAllByRole('gridcell')[0].querySelector('button')?.getAttribute('data-date')).toBe('2026-09-27')
    expect(onVisibleDateChange).toHaveBeenLastCalledWith(date(27))
    drag(430, 0, pointerType)
    act(() => vi.advanceTimersByTime(151))
    expect(grid.scrollLeft).toBe(before)
  })

  it('snaps RTL week swipes using the configured week start and respects bounds', () => {
    vi.useFakeTimers()
    render(
      <WeekCalendar
        mode="none"
        dir="rtl"
        weekStartsOn={1}
        defaultVisibleDate={date(23)}
        minDate={date(22)}
        maxDate={new Date(2026, 9, 2)}
        swipeMode="week"
        disableAnimation
      />,
    )
    drag(430)
    act(() => vi.advanceTimersByTime(151))
    expect(screen.getAllByRole('gridcell')[0].querySelector('button')?.getAttribute('data-date')).toBe('2026-09-28')
    drag(2000)
    act(() => vi.advanceTimersByTime(151))
    expect(screen.getAllByRole('gridcell')).toHaveLength(7)
    expect(screen.getAllByRole('gridcell')[0].querySelector('button')?.getAttribute('data-date')).toBe('2026-09-28')
  })

  it.each([-1, 1])('lands on a full calendar week after free scrolling and navigating %s', offset => {
    const onVisibleDateChange = vi.fn()
    const onSelect = vi.fn()
    render(
      <WeekCalendar
        defaultValue={date(23)}
        disableAnimation
        onVisibleDateChange={onVisibleDateChange}
        onSelect={onSelect}
      />,
    )
    drag(-234)
    fireEvent.click(screen.getByRole('button', { name: offset < 0 ? 'Previous week' : 'Next week' }))
    const cells = screen.getAllByRole('gridcell')
    expect(cells).toHaveLength(7)
    expect(cells[0].querySelector('button')?.getAttribute('data-date')).toBe(offset < 0 ? '2026-09-13' : '2026-09-27')
    expect(cells[6].querySelector('button')?.getAttribute('data-date')).toBe(offset < 0 ? '2026-09-19' : '2026-10-03')
    expect(onVisibleDateChange).toHaveBeenLastCalledWith(date(offset < 0 ? 13 : 27))
    expect(onSelect).toHaveBeenLastCalledWith(date(offset < 0 ? 16 : 30))
  })

  it('keeps a complete week when the minimum date falls midweek', () => {
    render(<WeekCalendar defaultValue={date(30)} minDate={date(22)} disableAnimation />)
    fireEvent.click(screen.getByRole('button', { name: 'Previous week' }))
    expect(screen.getAllByRole('gridcell')[0].querySelector('button')?.getAttribute('data-date')).toBe('2026-09-20')
    expect(dayButton(20).getAttribute('aria-disabled')).toBe('true')
    expect(dayButton(23).getAttribute('data-selected')).toBe('true')
  })

  it('uses the configured week start for arrows after free scrolling', () => {
    render(<WeekCalendar defaultValue={date(23)} weekStartsOn={1} disableAnimation />)
    drag(-234)
    fireEvent.click(screen.getByRole('button', { name: 'Next week' }))
    const cells = screen.getAllByRole('gridcell')
    expect(cells[0].querySelector('button')?.getAttribute('data-date')).toBe('2026-09-28')
    expect(cells[6].querySelector('button')?.getAttribute('data-date')).toBe('2026-10-04')
  })

  it('starts with no selection, marks today, and toggles a day off with an empty form value', () => {
    const onSelect = vi.fn()
    const { container } = render(<WeekCalendar name="day" onSelect={onSelect} />)
    expect(screen.getAllByRole('gridcell').every(cell => cell.getAttribute('aria-selected') === 'false')).toBe(true)
    const today = container.querySelector<HTMLButtonElement>('button[aria-current="date"]') as HTMLButtonElement
    expect(today).toBeTruthy()
    fireEvent.click(today)
    expect(today.getAttribute('data-selected')).toBe('true')
    fireEvent.click(today)
    expect(today.hasAttribute('data-selected')).toBe(false)
    expect(today.getAttribute('aria-current')).toBe('date')
    expect(onSelect).toHaveBeenLastCalledWith(null)
    expect(container.querySelector<HTMLInputElement>('input[name="day"]')?.value).toBe('')
  })

  it('carries Wednesday into the next and previous week in controlled mode', async () => {
    function Controlled() {
      const [value, setValue] = React.useState<Date | null>(date(23))
      return <WeekCalendar value={value} onSelect={setValue} />
    }
    render(<Controlled />)
    await nextWeek()
    expect(dayButton(30).getAttribute('data-selected')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Previous week' }))
    await waitFor(() => expect(screen.getByRole('grid').hasAttribute('data-scrolling')).toBe(false))
    expect(dayButton(23).getAttribute('data-selected')).toBe('true')
    fireEvent.click(dayButton(23))
    expect(dayButton(23).hasAttribute('data-selected')).toBe(false)
    await nextWeek()
    expect(screen.getAllByRole('gridcell').every(cell => cell.getAttribute('aria-selected') === 'false')).toBe(true)
  })

  it('keeps selection when the destination weekday is unavailable or following is disabled', () => {
    const onSelect = vi.fn()
    const { rerender } = render(
      <WeekCalendar
        defaultValue={date(23)}
        isDateDisabled={day => day.getDate() === 30}
        onSelect={onSelect}
        disableAnimation
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Next week' }))
    expect(onSelect).not.toHaveBeenCalled()
    rerender(
      <WeekCalendar defaultValue={date(23)} selectionFollowsNavigation={false} onSelect={onSelect} disableAnimation />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Previous week' }))
    expect(dayButton(23).getAttribute('data-selected')).toBe('true')
    expect(onSelect).not.toHaveBeenCalled()
  })

  it.each([
    'ltr',
    'rtl',
  ] as const)('animates repeated week navigation in %s without intermediate callbacks', async dir => {
    const onVisibleDateChange = vi.fn()
    render(<WeekCalendar defaultValue={date(23)} dir={dir} onVisibleDateChange={onVisibleDateChange} />)
    const grid = screen.getByRole('grid')
    const before = grid.scrollLeft
    fireEvent.click(screen.getByRole('button', { name: 'Next week' }))
    expect(grid.getAttribute('data-scrolling')).toBe('true')
    expect(grid.scrollLeft).toBe(before)
    fireEvent.click(screen.getByRole('button', { name: 'Next week' }))
    await waitFor(() => expect(grid.hasAttribute('data-scrolling')).toBe(false))
    expect(grid.scrollLeft - before).toBeCloseTo(dir === 'rtl' ? -1400 : 1400)
    expect(onVisibleDateChange).toHaveBeenCalledTimes(2)
    fireEvent.click(screen.getByRole('button', { name: 'Previous week' }))
    await waitFor(() => expect(grid.hasAttribute('data-scrolling')).toBe(false))
    expect(grid.scrollLeft - before).toBeCloseTo(dir === 'rtl' ? -700 : 700)
    expect(screen.getAllByRole('gridcell')).toHaveLength(7)
  })

  it('moves immediately when animation is disabled', () => {
    render(<WeekCalendar defaultValue={date(23)} disableAnimation />)
    const grid = screen.getByRole('grid')
    const before = grid.scrollLeft
    fireEvent.click(screen.getByRole('button', { name: 'Next week' }))
    expect(grid.scrollLeft - before).toBe(700)
    expect(grid.hasAttribute('data-scrolling')).toBe(false)
  })

  it('navigates back to the unchanged requested date after swiping', () => {
    render(<WeekCalendar defaultVisibleDate={date(20)} disableAnimation />)
    const grid = screen.getByRole('grid')
    const before = grid.scrollLeft
    drag(700)
    fireEvent.click(screen.getByRole('button', { name: 'Next week' }))
    expect(grid.scrollLeft).toBe(before)
    expect(screen.getAllByRole('gridcell')).toHaveLength(7)
  })

  it('selects an uncontrolled local date and carries its weekday when browsing', async () => {
    const onSelect = vi.fn()
    render(<WeekCalendar defaultValue={date(23)} onSelect={onSelect} />)
    expect(screen.getAllByRole('gridcell')).toHaveLength(7)
    fireEvent.click(dayButton(24))
    expect(dayButton(24).getAttribute('data-selected')).toBe('true')
    expect(onSelect).toHaveBeenCalledWith(date(24))
    await nextWeek()
    expect(onSelect).toHaveBeenCalledTimes(2)
    expect(onSelect).toHaveBeenLastCalledWith(new Date(2026, 9, 1))
    expect(dayButton(27)).toBeTruthy()
  })

  it('respects a controlled value, follows external changes, and accepts null to clear', () => {
    const onSelect = vi.fn()
    const { rerender } = render(<WeekCalendar value={date(23)} onSelect={onSelect} />)
    fireEvent.click(dayButton(24))
    expect(dayButton(23).getAttribute('data-selected')).toBe('true')
    expect(dayButton(24).hasAttribute('data-selected')).toBe(false)
    rerender(<WeekCalendar value={date(30)} onSelect={onSelect} />)
    expect(dayButton(30).getAttribute('data-selected')).toBe('true')
    rerender(<WeekCalendar value={null} />)
    expect(screen.getAllByRole('gridcell').every(cell => cell.getAttribute('aria-selected') === 'false')).toBe(true)
  })

  it('keeps the controlled visible week independent of selection', async () => {
    const onVisibleDateChange = vi.fn()
    const { rerender } = render(
      <WeekCalendar value={date(23)} visibleDate={date(1)} onVisibleDateChange={onVisibleDateChange} />,
    )
    await nextWeek()
    expect(onVisibleDateChange).toHaveBeenCalledWith(date(6))
    expect(dayButton(1)).toBeTruthy()
    rerender(<WeekCalendar value={date(23)} visibleDate={date(6)} onVisibleDateChange={onVisibleDateChange} />)
    await waitFor(() => expect(screen.getByRole('grid').hasAttribute('data-scrolling')).toBe(false))
    expect(dayButton(6)).toBeTruthy()
  })

  it('has one tab stop and moves focus across weeks without selecting', () => {
    const onSelect = vi.fn()
    render(<WeekCalendar defaultValue={date(26)} onSelect={onSelect} />)
    expect(
      screen.getAllByRole('button').filter(button => button.getAttribute('data-date') && button.tabIndex === 0),
    ).toHaveLength(1)
    act(() => dayButton(26).focus())
    fireEvent.keyDown(dayButton(26), { key: 'ArrowRight' })
    expect(document.activeElement).toBe(dayButton(27))
    fireEvent.keyDown(dayButton(27), { key: 'End' })
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-10-03')
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'PageUp' })
    expect(document.activeElement).toBe(dayButton(26))
    fireEvent.keyDown(dayButton(26), { key: 'Home' })
    expect(document.activeElement).toBe(dayButton(20))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('uses inherited RTL for spatial arrow keys and touch navigation', () => {
    render(
      <DirectionProvider dir="rtl">
        <WeekCalendar defaultValue={date(23)} />
      </DirectionProvider>,
    )
    act(() => dayButton(23).focus())
    fireEvent.keyDown(dayButton(23), { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(dayButton(24))
    drag(120, 5, 'touch')
    expect(dayButton(27)).toBeTruthy()
  })

  it('honors inclusive bounds with time components and blocks unavailable dates', () => {
    const onSelect = vi.fn()
    render(
      <WeekCalendar
        defaultValue={date(23)}
        minDate={new Date(2026, 8, 22, 18)}
        maxDate={new Date(2026, 8, 25, 8)}
        isDateDisabled={day => day.getDate() === 24}
        onSelect={onSelect}
      />,
    )
    expect((screen.getByRole('button', { name: 'Previous week' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Next week' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(dayButton(21))
    fireEvent.click(dayButton(24))
    expect(onSelect).not.toHaveBeenCalled()
    fireEvent.click(dayButton(22))
    fireEvent.click(dayButton(25))
    expect(onSelect).toHaveBeenCalledTimes(2)
    act(() => dayButton(25).focus())
    fireEvent.keyDown(dayButton(25), { key: 'ArrowRight' })
    expect(document.activeElement).toBe(dayButton(25))
  })

  it('normalizes a reversed range, marks its interior, and restarts after completion', () => {
    const onRangeSelect = vi.fn()
    render(<WeekCalendar mode="range" defaultVisibleDate={date(23)} onRangeSelect={onRangeSelect} />)
    fireEvent.click(dayButton(25))
    fireEvent.click(dayButton(22))
    expect(onRangeSelect).toHaveBeenLastCalledWith({ from: date(22), to: date(25) })
    expect(dayButton(23).getAttribute('data-in-range')).toBe('true')
    expect(screen.getByRole('grid').getAttribute('aria-multiselectable')).toBe('true')
    fireEvent.click(dayButton(24))
    expect(onRangeSelect).toHaveBeenLastCalledWith({ from: date(24) })
  })

  it('supports ranges across weeks and restarts ranges crossing a disabled day', async () => {
    const onRangeSelect = vi.fn()
    render(
      <WeekCalendar
        mode="range"
        defaultValue={{ from: date(23) }}
        isDateDisabled={day => day.getDate() === 24}
        onRangeSelect={onRangeSelect}
      />,
    )
    fireEvent.click(dayButton(25))
    expect(onRangeSelect).toHaveBeenLastCalledWith({ from: date(25) })
    await nextWeek()
    fireEvent.click(dayButton(28))
    expect(onRangeSelect).toHaveBeenLastCalledWith({ from: date(25), to: date(28) })
  })

  it('separates disabled and read only behavior, including entirely unavailable weeks', async () => {
    const onSelect = vi.fn()
    const { rerender } = render(<WeekCalendar defaultValue={date(23)} disabled onSelect={onSelect} />)
    expect(screen.getAllByRole('button').every(button => (button as HTMLButtonElement).disabled)).toBe(true)
    rerender(<WeekCalendar defaultValue={date(23)} readOnly onSelect={onSelect} />)
    fireEvent.click(dayButton(24))
    await nextWeek()
    expect(dayButton(27)).toBeTruthy()
    expect(onSelect).not.toHaveBeenCalled()
    rerender(<WeekCalendar defaultValue={date(23)} isDateDisabled={() => true} onSelect={onSelect} />)
    fireEvent.click(dayButton(27))
    expect(onSelect).not.toHaveBeenCalled()
    expect(
      screen.getAllByRole('button').filter(button => button.hasAttribute('data-date') && button.tabIndex === 0),
    ).toHaveLength(1)
  })

  it('uses the locale week start and an explicit override', () => {
    const { rerender } = render(<WeekCalendar defaultValue={date(23)} locale={enGB} />)
    expect(screen.getAllByRole('gridcell')[0].querySelector('button')?.getAttribute('data-date')).toBe('2026-09-21')
    rerender(<WeekCalendar defaultValue={date(23)} locale={enGB} weekStartsOn={6} labels={{ nextWeek: 'Forward' }} />)
    expect(screen.getAllByRole('gridcell')[0].querySelector('button')?.getAttribute('data-date')).toBe('2026-09-19')
    expect(screen.getByRole('button', { name: 'Forward' })).toBeTruthy()
  })

  it('submits local dates without submitting the form on calendar clicks', async () => {
    const onSubmit = vi.fn(event => event.preventDefault())
    const { container, rerender } = render(
      <form onSubmit={onSubmit}>
        <WeekCalendar name="date" defaultValue={date(23)} selectionFollowsNavigation={false} />
      </form>,
    )
    fireEvent.click(dayButton(24))
    await nextWeek()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(new FormData(container.querySelector('form') as HTMLFormElement).get('date')).toBe('2026-09-24')
    rerender(
      <form>
        <WeekCalendar mode="range" name="period" value={{ from: date(22), to: date(25) }} />
      </form>,
    )
    expect(new FormData(container.querySelector('form') as HTMLFormElement).get('period.from')).toBe('2026-09-22')
    expect(new FormData(container.querySelector('form') as HTMLFormElement).get('period.to')).toBe('2026-09-25')
    rerender(
      <form>
        <WeekCalendar name="date" value={date(23)} disabled />
      </form>,
    )
    expect(new FormData(container.querySelector('form') as HTMLFormElement).has('date')).toBe(false)
  })

  it('ignores vertical gestures and suppresses accidental selection after a swipe', () => {
    const onSelect = vi.fn()
    render(<WeekCalendar defaultValue={date(23)} onSelect={onSelect} />)
    drag(-70, 120, 'touch')
    expect(dayButton(23)).toBeTruthy()
    drag(-120, 5, 'touch')
    fireEvent.click(dayButton(28), { detail: 1 })
    expect(onSelect).not.toHaveBeenCalled()
  })

  it.each(['mouse', 'touch', 'pen'])('navigates with a %s drag without selecting a date', pointerType => {
    const onSelect = vi.fn()
    render(<WeekCalendar defaultValue={date(23)} onSelect={onSelect} />)
    drag(-100, 0, pointerType)
    expect(dayButton(27)).toBeTruthy()
    expect(onSelect).not.toHaveBeenCalled()
    drag(100, 0, pointerType)
    expect(dayButton(23).getAttribute('data-selected')).toBe('true')
  })

  it('ignores cancelled drags, short drags, disabled swiping and date bounds', () => {
    const { rerender } = render(<WeekCalendar defaultValue={date(23)} />)
    drag(-100, 0, 'touch', true)
    drag(-20)
    expect(dayButton(23)).toBeTruthy()
    rerender(<WeekCalendar defaultValue={date(23)} swipeable={false} />)
    drag(-100)
    expect(dayButton(23)).toBeTruthy()
    rerender(<WeekCalendar defaultValue={date(23)} maxDate={date(26)} />)
    drag(-100)
    expect(dayButton(23)).toBeTruthy()
    rerender(<WeekCalendar defaultValue={date(23)} disabled />)
    drag(-100)
    expect(dayButton(23)).toBeTruthy()
  })

  it('keeps keyboard selection available after a drag and supports controlled swipe navigation', () => {
    const onSelect = vi.fn()
    const onVisibleDateChange = vi.fn()
    render(
      <WeekCalendar
        visibleDate={date(23)}
        value={date(23)}
        onSelect={onSelect}
        onVisibleDateChange={onVisibleDateChange}
        disableAnimation
      />,
    )
    drag(-100)
    expect(onVisibleDateChange).toHaveBeenCalledWith(date(21))
    expect(dayButton(23)).toBeTruthy()
    fireEvent.click(dayButton(24), { detail: 0 })
    expect(onSelect).toHaveBeenCalledWith(date(24))
  })

  it('shows library tooltips for navigation and compact localized dates on focus', async () => {
    render(<WeekCalendar defaultValue={date(23)} locale={enGB} />)
    act(() => screen.getByRole('button', { name: 'Previous week' }).focus())
    expect((await screen.findByRole('tooltip')).textContent).toBe('Previous week')
    act(() => screen.getByRole('button', { name: 'Wednesday, 23 September 2026' }).focus())
    expect((await screen.findByRole('tooltip')).textContent).toBe('23 Sep 2026')
  })

  it('keeps arbitrary scroll offsets during interaction and renders dates beyond the original week', () => {
    const onSelect = vi.fn()
    render(<WeekCalendar defaultValue={date(23)} onSelect={onSelect} />)
    const grid = screen.getByRole('grid')
    const before = grid.scrollLeft
    drag(-234.5)
    expect(grid.scrollLeft - before).toBeCloseTo(234.5)
    expect(screen.getAllByRole('gridcell')[0].querySelector('button')?.getAttribute('data-date')).toBe('2026-09-22')
    expect(dayButton(29)).toBeTruthy()
    expect(onSelect).not.toHaveBeenCalled()
    // A subsequent intentional selection must preserve the partial-day offset.
    fireEvent.pointerDown(dayButton(25), { pointerId: 1, isPrimary: true, button: 0 })
    fireEvent.click(dayButton(25), { detail: 1 })
    expect(grid.scrollLeft - before).toBeCloseTo(234.5)
    expect(onSelect).toHaveBeenCalledWith(date(25))
  })

  it('leaves touch movement to native scrolling without capturing or preventing it', () => {
    render(<WeekCalendar defaultValue={date(23)} />)
    const grid = screen.getByRole('grid')
    const capture = vi.fn()
    Object.assign(grid, { setPointerCapture: capture })
    const before = grid.scrollLeft
    fireEvent.pointerDown(dayButton(23), {
      pointerType: 'touch',
      pointerId: 1,
      isPrimary: true,
      button: 0,
      clientX: 180,
      clientY: 60,
    })
    expect(fireEvent.pointerMove(grid, { pointerType: 'touch', pointerId: 1, clientX: 50, clientY: 60 })).toBe(true)
    expect(capture).not.toHaveBeenCalled()
    expect(grid.scrollLeft).toBe(before)
    expect(grid.className).toContain('touch-auto')
    grid.scrollLeft += 163
    fireEvent.scroll(grid)
    expect(grid.scrollLeft - before).toBe(163)
    expect(dayButton(28)).toBeTruthy()
  })

  it('preserves a fractional offset when a controlled parent echoes the leading date', () => {
    function ControlledStrip() {
      const [visible, setVisible] = React.useState(date(23))
      return <WeekCalendar value={date(23)} visibleDate={visible} onVisibleDateChange={setVisible} />
    }
    render(<ControlledStrip />)
    const grid = screen.getByRole('grid')
    const before = grid.scrollLeft
    drag(-853.5)
    expect(grid.scrollLeft - before).toBeCloseTo(853.5)
    expect(dayButton(28)).toBeTruthy()
  })

  it('preserves the visible date and partial-day position when resized', () => {
    render(<WeekCalendar defaultValue={date(23)} />)
    const grid = screen.getByRole('grid')
    drag(-234.5)
    const before = grid.scrollLeft
    Object.defineProperty(grid, 'clientWidth', { configurable: true, value: 1400 })
    act(() => resizeObservers.get(grid)?.())
    expect(grid.scrollLeft).toBeCloseTo(before * 2)
    expect(dayButton(22)).toBeTruthy()
    expect(dayButton(29)).toBeTruthy()
  })

  it.each(['mouse', 'touch', 'pen'])('aligns to the nearest day after a %s scroll settles', pointerType => {
    vi.useFakeTimers()
    render(<WeekCalendar defaultValue={date(23)} disableAnimation />)
    const grid = screen.getByRole('grid')
    const before = grid.scrollLeft
    drag(-263, 0, pointerType)
    expect(grid.scrollLeft - before).toBeCloseTo(263)
    act(() => vi.advanceTimersByTime(151))
    expect(grid.scrollLeft - before).toBeCloseTo(300)
    expect(screen.getAllByRole('gridcell')).toHaveLength(7)
    expect(screen.getAllByRole('gridcell')[0].querySelector('button')?.getAttribute('data-date')).toBe('2026-09-23')
    expect(dayButton(23).getAttribute('data-selected')).toBe('true')
  })

  it('aligns RTL scrolling to the nearest day rather than a week', () => {
    vi.useFakeTimers()
    render(<WeekCalendar defaultValue={date(23)} dir="rtl" disableAnimation />)
    const grid = screen.getByRole('grid')
    const before = grid.scrollLeft
    drag(234)
    act(() => vi.advanceTimersByTime(151))
    expect(grid.scrollLeft - before).toBeCloseTo(-200)
    expect(screen.getAllByRole('gridcell')).toHaveLength(7)
    expect(screen.getAllByRole('gridcell')[0].querySelector('button')?.getAttribute('data-date')).toBe('2026-09-22')
  })

  it('waits for touch release and native momentum before aligning', () => {
    vi.useFakeTimers()
    render(<WeekCalendar defaultValue={date(23)} disableAnimation />)
    const grid = screen.getByRole('grid')
    const before = grid.scrollLeft
    fireEvent.pointerDown(dayButton(23), { pointerType: 'touch', pointerId: 1, isPrimary: true, button: 0 })
    grid.scrollLeft = before + 234
    fireEvent.scroll(grid)
    act(() => vi.advanceTimersByTime(500))
    expect(grid.scrollLeft).toBe(before + 234)
    // Native panning cancels pointer delivery, but momentum continues to emit scroll events.
    fireEvent.pointerCancel(grid, { pointerType: 'touch', pointerId: 1 })
    act(() => vi.advanceTimersByTime(100))
    grid.scrollLeft = before + 378
    fireEvent.scroll(grid)
    act(() => vi.advanceTimersByTime(149))
    expect(grid.scrollLeft).toBe(before + 378)
    act(() => vi.advanceTimersByTime(2))
    expect(grid.scrollLeft).toBe(before + 400)
    expect(screen.getAllByRole('gridcell')).toHaveLength(7)
  })

  it('handles year boundaries and forwards refs, custom content and accessible labels', async () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <WeekCalendar
        ref={ref}
        defaultValue={new Date(2026, 11, 31)}
        aria-label="Appointments"
        getDayLabel={day =>
          `${day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}, appointments available`
        }
        renderDay={day => <span>{day.getDate()} slots</span>}
      />,
    )
    await nextWeek()
    expect(screen.getByRole('button', { name: 'Sunday, January 3, 2027, appointments available' })).toBeTruthy()
    expect(screen.getByRole('grid', { name: 'Appointments' })).toBeTruthy()
    expect(ref.current?.getAttribute('data-slot')).toBe('week-calendar')
    expect(screen.getByText('3 slots')).toBeTruthy()
  })
})
