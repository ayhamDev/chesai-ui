import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
const motionPreference = vi.hoisted(() => ({ reduced: false }))
vi.mock('framer-motion', async importOriginal => ({
  ...await importOriginal<typeof import('framer-motion')>(),
  useReducedMotion: () => motionPreference.reduced,
}))
import { Timeline, timelineColors } from './index'

beforeEach(() => {
  motionPreference.reduced = false
  vi.stubGlobal('IntersectionObserver', class {
    observe() {} unobserve() {} disconnect() {}
  })
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('Timeline', () => {
  it('applies root, step and component colors with paired foregrounds', () => {
    render(<Timeline color="primary"><Timeline.Item color="tertiary-container"><Timeline.Dot data-testid="dot" /><Timeline.Connector data-testid="line" /><Timeline.Dot color="secondary-fixed" foreground="on-secondary-fixed-variant" data-testid="override" /></Timeline.Item></Timeline>)
    expect(screen.getByTestId('dot').style.backgroundColor).toBe('var(--md-sys-color-tertiary-container)')
    expect(screen.getByTestId('dot').style.color).toBe('var(--md-sys-color-on-tertiary-container)')
    expect(screen.getByTestId('line').style.color).toBe('var(--md-sys-color-tertiary-container)')
    expect(screen.getByTestId('override').style.color).toBe('var(--md-sys-color-on-secondary-fixed-variant)')
  })

  it.each(['ltr', 'rtl'] as const)('adapts horizontal geometry and forward flow to %s', dir => {
    render(<Timeline orientation="horizontal" dir={dir}><Timeline.Item><Timeline.Separator><Timeline.Dot /><Timeline.Connector animated shape="wavy" data-testid="line" /></Timeline.Separator><Timeline.Content>First</Timeline.Content></Timeline.Item><Timeline.Item><Timeline.Content>Second</Timeline.Content></Timeline.Item></Timeline>)
    const line = screen.getByTestId('line')
    expect(line.getAttribute('data-orientation')).toBe('horizontal')
    expect(line.getAttribute('data-flow')).toBe(dir === 'rtl' ? 'reverse' : 'forward')
    expect(line.style.height).toBe('14px')
    expect(line.querySelector('pattern')?.getAttribute('width')).toBe('20')
    expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual(['First', 'Second'])
  })

  it('inherits RTL from an ancestor and flips reverse flow back to the right', () => {
    render(<div dir="rtl"><Timeline orientation="horizontal"><Timeline.Item><Timeline.Connector data-testid="line" flowDirection="reverse" /></Timeline.Item></Timeline></div>)
    expect(screen.getByTestId('line').getAttribute('data-flow')).toBe('forward')
  })

  it('keeps vertical RTL flow downward and allows live orientation changes', () => {
    const { rerender } = render(<Timeline dir="rtl"><Timeline.Connector data-testid="line" /></Timeline>)
    expect(screen.getByTestId('line').getAttribute('data-flow')).toBe('forward')
    rerender(<Timeline dir="rtl" orientation="horizontal"><Timeline.Connector data-testid="line" /></Timeline>)
    expect(screen.getByTestId('line').getAttribute('data-flow')).toBe('reverse')
  })

  it('exposes unique system role names and applies each role without generating class names', () => {
    expect(new Set(timelineColors).size).toBe(timelineColors.length)
    const { container } = render(<>{timelineColors.map(color => <Timeline.Dot key={color} color={color} data-testid={color} />)}</>)
    expect(container.children.length).toBe(timelineColors.length)
    for (const color of timelineColors) expect(screen.getByTestId(color).style.backgroundColor).toBe(`var(--md-sys-color-${color})`)
  })
  it('preserves the existing composition and exposes a current milestone', () => {
    render(<Timeline aria-label="Delivery"><Timeline.Item status="current"><Timeline.Separator><Timeline.Dot /><Timeline.Connector /></Timeline.Separator><Timeline.Content>On the way</Timeline.Content></Timeline.Item></Timeline>)
    expect(screen.getByRole('list', { name: 'Delivery' })).toBeTruthy()
    expect(screen.getByRole('listitem').getAttribute('aria-current')).toBe('step')
    expect(screen.getByText('On the way')).toBeTruthy()
  })

  it.each(['solid', 'dashed', 'dotted'] as const)('renders %s regular and wavy patterns with independent IDs', variant => {
    const { container } = render(<><Timeline.Connector variant={variant} /><Timeline.Connector variant={variant} shape="wavy" /></>)
    const patterns = [...container.querySelectorAll('pattern')]
    expect(patterns).toHaveLength(2)
    expect(patterns[0].id).not.toBe(patterns[1].id)
    expect(patterns[1].querySelector('path')).toBeTruthy()
    expect(patterns[0].querySelector(variant === 'dotted' ? 'circle' : 'rect')).toBeTruthy()
    for (const pattern of patterns) {
      expect(container.querySelector(`rect[fill="url(#${pattern.id})"]`)).toBeTruthy()
    }
  })

  it('keeps connectors decorative and forwards refs and custom styles', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Timeline.Connector ref={ref} data-testid="line" style={{ height: 120 }} />)
    expect(ref.current).toBe(screen.getByTestId('line'))
    expect(ref.current?.getAttribute('aria-hidden')).toBe('true')
    expect(ref.current?.style.height).toBe('120px')
    expect(ref.current?.getAttribute('variant')).toBeNull()
    expect(ref.current?.getAttribute('duration')).toBeNull()
  })

  it('uses status colors while allowing explicit appearance overrides', () => {
    render(<Timeline><Timeline.Item status="error"><Timeline.Dot data-testid="error-dot" /><Timeline.Connector data-testid="error-line" /><Timeline.Connector data-testid="override" color="tertiary" /><Timeline.Dot variant="outline" data-testid="custom-dot" /></Timeline.Item></Timeline>)
    expect(screen.getByTestId('error-dot').className).toContain('bg-error')
    expect(screen.getByTestId('error-line').className).toContain('text-error')
    expect(screen.getByTestId('override').className).toContain('text-tertiary')
    expect(screen.getByTestId('custom-dot').className).not.toContain('bg-error')
  })

  it('disables continuous and entrance motion when reduced motion is preferred', () => {
    motionPreference.reduced = true
    render(<Timeline><Timeline.Item data-testid="item"><Timeline.Dot data-testid="dot" /><Timeline.Connector animated shape="wavy" data-testid="line" /></Timeline.Item></Timeline>)
    expect(screen.getByTestId('line').getAttribute('data-animated')).toBe('false')
    expect(screen.getByTestId('item').style.opacity).not.toBe('0')
    expect(screen.getByTestId('dot').style.opacity).not.toBe('0')
    expect(screen.getByTestId('line').style.transform).not.toContain('scaleY(0)')
  })

  it('can stop a running connector without changing its geometry', () => {
    const { rerender } = render(<Timeline.Connector shape="wavy" animated data-testid="line" />)
    const width = screen.getByTestId('line').style.width
    expect(screen.getByTestId('line').getAttribute('data-animated')).toBe('true')
    rerender(<Timeline.Connector shape="wavy" animated={false} data-testid="line" />)
    expect(screen.getByTestId('line').getAttribute('data-animated')).toBe('false')
    expect(screen.getByTestId('line').style.width).toBe(width)
  })
})
