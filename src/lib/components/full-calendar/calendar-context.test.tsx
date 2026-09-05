import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { LayoutProvider } from '../../context/layout-context'
import { FullCalendarProvider, useFullCalendar } from './calendar-context'
import { getCalendarDateRange } from './calendar-range'
import { FullCalendar } from './index'
import type { CalendarEvent, CalendarView } from './types'

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const date = (year: number, month: number, day: number, hour = 0) => new Date(year, month - 1, day, hour)

const expectRange = (call: Date[], expectedStart: Date, expectedEnd: Date) => {
  expect(call[0]).toEqual(expectedStart)
  expect(call[1]).toEqual(expectedEnd)
}

const Controls = () => {
  const { currentDate, view, events, navigateNext, navigatePrev, navigateToday, setCurrentDate, setView } =
    useFullCalendar()

  return (
    <div>
      <output data-testid="state">
        {currentDate.getFullYear()}-{currentDate.getMonth() + 1}-{currentDate.getDate()}|{view}|
        {events.map(event => event.title).join(',')}
      </output>
      <button type="button" onClick={navigateNext}>
        next
      </button>
      <button type="button" onClick={navigatePrev}>
        previous
      </button>
      <button type="button" onClick={navigateToday}>
        today
      </button>
      <button type="button" onClick={() => setCurrentDate(date(2026, 10, 8))}>
        select date
      </button>
      {(['day', 'week', 'month', 'year'] as CalendarView[]).map(nextView => (
        <button key={nextView} type="button" onClick={() => setView(nextView)}>
          {nextView}
        </button>
      ))}
    </div>
  )
}

const CalendarHarness = ({
  events = [],
  onDateRangeChange,
  initialDate = date(2026, 9, 3),
  initialView = 'week',
}: {
  events?: CalendarEvent[]
  onDateRangeChange?: (start: Date, end: Date) => void
  initialDate?: Date
  initialView?: CalendarView
}) => (
  <FullCalendarProvider
    events={events}
    initialDate={initialDate}
    initialView={initialView}
    onDateRangeChange={onDateRangeChange}
  >
    <Controls />
  </FullCalendarProvider>
)

describe('FullCalendar visible range notifications', () => {
  it('forwards the public FullCalendar callback to the provider', () => {
    const onRange = vi.fn()
    render(
      <LayoutProvider storageKey="calendar-range-test-direction">
        <FullCalendar events={[]} initialDate={date(2026, 9, 3)} initialView="week" onDateRangeChange={onRange}>
          <Controls />
        </FullCalendar>
      </LayoutProvider>,
    )

    expect(onRange).toHaveBeenCalledTimes(1)
    expectRange(onRange.mock.calls[0], date(2026, 8, 30), date(2026, 9, 6))
  })

  it('reports the exact initial seven-day weekly range with an exclusive end', () => {
    const onRange = vi.fn()
    render(<CalendarHarness onDateRangeChange={onRange} />)

    expect(onRange).toHaveBeenCalledTimes(1)
    expectRange(onRange.mock.calls[0], date(2026, 8, 30), date(2026, 9, 6))
  })

  it('reports next and previous ranges exactly once across a month boundary', () => {
    const onRange = vi.fn()
    render(<CalendarHarness initialDate={date(2026, 9, 20)} onDateRangeChange={onRange} />)

    fireEvent.click(screen.getByRole('button', { name: 'next' }))
    expect(onRange).toHaveBeenCalledTimes(2)
    expectRange(onRange.mock.calls[1], date(2026, 9, 27), date(2026, 10, 4))
    expect(date(2026, 10, 1, 6) < onRange.mock.calls[1][1]).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: 'previous' }))
    expect(onRange).toHaveBeenCalledTimes(3)
    expectRange(onRange.mock.calls[2], date(2026, 9, 20), date(2026, 9, 27))
  })

  it("reports today's visible range", () => {
    vi.useFakeTimers()
    vi.setSystemTime(date(2027, 2, 10, 14))
    const onRange = vi.fn()
    render(<CalendarHarness onDateRangeChange={onRange} />)

    fireEvent.click(screen.getByRole('button', { name: 'today' }))

    expect(onRange).toHaveBeenCalledTimes(2)
    expectRange(onRange.mock.calls[1], date(2027, 2, 7), date(2027, 2, 14))
  })

  it('reports ranges for direct date selection and every view', () => {
    const onRange = vi.fn()
    render(<CalendarHarness onDateRangeChange={onRange} />)

    fireEvent.click(screen.getByRole('button', { name: 'select date' }))
    fireEvent.click(screen.getByRole('button', { name: 'day' }))
    fireEvent.click(screen.getByRole('button', { name: 'week' }))
    fireEvent.click(screen.getByRole('button', { name: 'month' }))
    fireEvent.click(screen.getByRole('button', { name: 'year' }))

    expect(onRange).toHaveBeenCalledTimes(6)
    expectRange(onRange.mock.calls[1], date(2026, 10, 4), date(2026, 10, 11))
    expectRange(onRange.mock.calls[2], date(2026, 10, 8), date(2026, 10, 9))
    expectRange(onRange.mock.calls[3], date(2026, 10, 4), date(2026, 10, 11))
    expectRange(onRange.mock.calls[4], date(2026, 9, 27), date(2026, 11, 8))
    expectRange(onRange.mock.calls[5], date(2026, 1, 1), date(2027, 1, 1))
  })

  it('does not notify again when only an inline callback identity changes', () => {
    const firstCallback = vi.fn()
    const secondCallback = vi.fn()
    const { rerender } = render(<CalendarHarness onDateRangeChange={firstCallback} />)

    rerender(<CalendarHarness onDateRangeChange={secondCallback} />)

    expect(firstCallback).toHaveBeenCalledTimes(1)
    expect(secondCallback).not.toHaveBeenCalled()
  })

  it('reacts to event replacement without resetting navigation or notifying again', () => {
    const septemberEvent: CalendarEvent = {
      id: 'sep-29',
      title: 'September 29',
      start: date(2026, 9, 29, 6),
      end: date(2026, 9, 29, 7),
    }
    const octoberEvents: CalendarEvent[] = [1, 6, 8].map(day => ({
      id: `oct-${day}`,
      title: `October ${day}`,
      start: date(2026, 10, day, 6),
      end: date(2026, 10, day, 7),
    }))
    const onRange = vi.fn()
    const { rerender } = render(
      <LayoutProvider storageKey="calendar-events-test-direction">
        <FullCalendar
          events={[septemberEvent]}
          initialDate={date(2026, 9, 20)}
          initialView="week"
          onDateRangeChange={onRange}
        >
          <Controls />
          <FullCalendar.View />
        </FullCalendar>
      </LayoutProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'next' }))

    rerender(
      <LayoutProvider storageKey="calendar-events-test-direction">
        <FullCalendar
          events={[septemberEvent, ...octoberEvents]}
          initialDate={date(2026, 9, 20)}
          initialView="week"
          onDateRangeChange={() => undefined}
        >
          <Controls />
          <FullCalendar.View />
        </FullCalendar>
      </LayoutProvider>,
    )

    expect(screen.getByTestId('state').textContent).toContain('2026-9-27')
    expect(screen.getByText('October 1')).toBeTruthy()
    expect(onRange).toHaveBeenCalledTimes(2)

    fireEvent.click(screen.getByRole('button', { name: 'next' }))
    expect(screen.getByText('October 6')).toBeTruthy()
    expect(screen.getByText('October 8')).toBeTruthy()
  })
})

describe('getCalendarDateRange', () => {
  it('returns chronological ranges independently of visual direction', () => {
    for (const view of ['day', 'week', 'month', 'year'] as CalendarView[]) {
      const range = getCalendarDateRange(date(2026, 9, 3), view)
      expect(range.start < range.end).toBe(true)
    }
  })
})
