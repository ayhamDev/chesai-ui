import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Stepper } from './index'
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} })
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
// Root children are steps, not a fragment, matching the existing Stepper contract.
const first = <Stepper.Step><Stepper.Indicator /><Stepper.Separator data-testid="line" /><Stepper.Content>First</Stepper.Content></Stepper.Step>
const last = <Stepper.Step><Stepper.Indicator /><Stepper.Separator data-testid="last-line" /><Stepper.Content>Second</Stepper.Content></Stepper.Step>
describe('Stepper progress and styling', () => {
  it('retains index-based progress and omits the final separator', () => {
    const { rerender } = render(<Stepper currentStep={0}>{first}{last}</Stepper>)
    expect(screen.getAllByRole('listitem')[0].getAttribute('aria-current')).toBe('step')
    expect(screen.queryByTestId('last-line')).toBeNull()
    rerender(<Stepper currentStep={1}>{first}{last}</Stepper>)
    expect(screen.getAllByRole('listitem')[0].getAttribute('data-status')).toBe('complete')
    expect(screen.getAllByRole('listitem')[1].getAttribute('aria-current')).toBe('step')
  })
  it('applies step overrides and paired indicator foregrounds', () => {
    render(<Stepper currentStep={0} color="primary"><Stepper.Step color="tertiary-container" status="error"><Stepper.Indicator data-testid="dot" /><Stepper.Separator color="error" data-testid="line" /></Stepper.Step>{last}</Stepper>)
    expect(screen.getByTestId('dot').style.backgroundColor).toBe('var(--md-sys-color-tertiary-container)')
    expect(screen.getByTestId('dot').style.color).toBe('var(--md-sys-color-on-tertiary-container)')
    expect(screen.getByTestId('line').style.color).toBe('var(--md-sys-color-error)')
    expect(screen.getAllByRole('listitem')[0].getAttribute('data-status')).toBe('error')
  })
  it('inherits RTL and changes axis without changing event order', () => {
    const { rerender } = render(<div dir="rtl"><Stepper currentStep={0}>{first}{last}</Stepper></div>)
    expect(screen.getByTestId('line').getAttribute('data-flow')).toBe('reverse')
    rerender(<div dir="rtl"><Stepper currentStep={0} orientation="vertical">{first}{last}</Stepper></div>)
    expect(screen.getByTestId('line').getAttribute('data-flow')).toBe('forward')
    expect(screen.getAllByRole('listitem')[0].textContent).toContain('First')
  })
  it('anchors connectors to the configured indicator size', () => {
    render(<Stepper currentStep={0}><Stepper.Step><Stepper.Indicator size="lg" /><Stepper.Separator /></Stepper.Step>{last}</Stepper>)
    expect(screen.getAllByRole('listitem')[0].style.getPropertyValue('--stepper-indicator-size')).toBe('40px')
  })
  it('supports patterned animated connectors and custom completed icons', () => {
    render(<Stepper currentStep={1}><Stepper.Step><Stepper.Indicator completedIcon={<span>Done</span>} /><Stepper.Separator variant="dotted" shape="wavy" animated data-testid="line" /></Stepper.Step>{last}</Stepper>)
    expect(screen.getByText('Done')).toBeTruthy()
    expect(screen.getByTestId('line').getAttribute('data-shape')).toBe('wavy')
    expect(screen.getByTestId('line').getAttribute('data-variant')).toBe('dotted')
  })
})
