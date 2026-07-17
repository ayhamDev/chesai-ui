import { describe, expect, it } from 'vitest'
import { filterDaysWithEvents, getDayDatesInRange, LETTER_PAGE_PIXELS, resolvePrintOrientation } from './print-layout'

describe('calendar print layout', () => {
  it('uses the same landscape layout for auto and explicit landscape', () => {
    expect(resolvePrintOrientation('auto')).toBe('landscape')
    expect(resolvePrintOrientation('landscape')).toBe('landscape')
    expect(LETTER_PAGE_PIXELS[resolvePrintOrientation('auto')]).toEqual({
      width: 1056,
      height: 816,
    })
  })

  it('uses portrait dimensions when portrait is selected', () => {
    expect(resolvePrintOrientation('portrait')).toBe('portrait')
    expect(LETTER_PAGE_PIXELS[resolvePrintOrientation('portrait')]).toEqual({
      width: 816,
      height: 1056,
    })
  })

  it('keeps only dates containing an event', () => {
    const dates = getDayDatesInRange(new Date(2026, 6, 12), new Date(2026, 6, 14))
    const eventDay = new Date(2026, 6, 13)
    const result = filterDaysWithEvents(dates, [
      {
        id: 'event-1',
        title: 'Design sync',
        start: new Date(2026, 6, 13, 10),
        end: new Date(2026, 6, 13, 11),
      },
    ])

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(eventDay)
  })
})
