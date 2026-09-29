import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../dropdown-menu'
import { Chip, ChipGroup } from './index'

vi.mock('../../hooks/useRipple', () => ({ default: () => [null, vi.fn()] }))
afterEach(cleanup)
const chips = (
  <>
    <Chip value="a">Alpha</Chip>
    <Chip value="b" disabled>
      Beta
    </Chip>
    <Chip value="c">Charlie</Chip>
  </>
)

describe('Chip and ChipGroup', () => {
  it('toggles uncontrolled selection without submitting a form', () => {
    const submit = vi.fn(event => event.preventDefault())
    const change = vi.fn()
    render(
      <form onSubmit={submit}>
        <Chip defaultSelected={false} onSelectedChange={change}>
          Toggle
        </Chip>
      </form>,
    )
    const chip = screen.getByRole('button')
    fireEvent.click(chip)
    expect(chip.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(chip)
    expect(change).toHaveBeenLastCalledWith(false)
    expect(submit).not.toHaveBeenCalled()
  })
  it('leaves controlled state with the caller and honors canceled events', () => {
    const change = vi.fn()
    const { rerender } = render(
      <Chip selected={false} onSelectedChange={change}>
        Toggle
      </Chip>,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(change).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('false')
    change.mockClear()
    rerender(
      <Chip selected={false} onSelectedChange={change} onClick={event => event.preventDefault()}>
        Toggle
      </Chip>,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(change).not.toHaveBeenCalled()
  })
  it('supports ordinary actions with selected styling and no toggle behavior', () => {
    const clicked = vi.fn()
    const change = vi.fn()
    render(
      <Chip behavior="action" selected onClick={clicked} onSelectedChange={change}>
        Action
      </Chip>,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(clicked).toHaveBeenCalledTimes(1)
    expect(change).not.toHaveBeenCalled()
    expect(screen.getByRole('button').getAttribute('data-selected')).toBe('true')
    expect(screen.getByRole('button').hasAttribute('aria-pressed')).toBe(false)
  })
  it('defaults to layout only and leaves independent chip state intact when the gap changes', () => {
    const example = (gap: 'none' | 'md') => (
      <ChipGroup aria-label="Actions" gap={gap}>
        <Chip defaultSelected={false}>Independent</Chip>
        <Chip>Action</Chip>
      </ChipGroup>
    )
    const { rerender } = render(example('none'))
    const independent = screen.getByRole('button', { name: 'Independent' })
    fireEvent.click(independent)
    independent.focus()
    rerender(example('md'))
    expect(screen.getByRole('group').getAttribute('data-gap')).toBe('md')
    expect(screen.getByRole('button', { name: 'Independent' })).toBe(independent)
    expect(independent.getAttribute('aria-pressed')).toBe('true')
    expect(document.activeElement).toBe(independent)
    expect(screen.getByRole('button', { name: 'Action' }).hasAttribute('aria-pressed')).toBe(false)
    expect(screen.queryByRole('radio')).toBeNull()
  })
  it('optionally manages multiple values', () => {
    const change = vi.fn()
    render(
      <ChipGroup type="multiple" defaultValue={['a']} onValueChange={change}>
        {chips}
      </ChipGroup>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Charlie' }))
    expect(change).toHaveBeenLastCalledWith(['a', 'c'])
    fireEvent.click(screen.getByRole('button', { name: 'Alpha' }))
    expect(change).toHaveBeenLastCalledWith(['c'])
  })
  it('supports controlled group values and disables all child actions', () => {
    const change = vi.fn()
    const clicked = vi.fn()
    const { rerender } = render(
      <ChipGroup type="multiple" value={['a']} onValueChange={change}>
        {chips}
      </ChipGroup>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Charlie' }))
    expect(change).toHaveBeenCalledWith(['a', 'c'])
    expect(screen.getByRole('button', { name: 'Charlie' }).getAttribute('aria-pressed')).toBe('false')
    rerender(
      <ChipGroup disabled>
        {chips}
        <Chip behavior="action" onClick={clicked}>
          Action
        </Chip>
      </ChipGroup>,
    )
    expect(screen.getAllByRole('button').every(button => (button as HTMLButtonElement).disabled)).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Action' }))
    expect(clicked).not.toHaveBeenCalled()
  })
  it('moves focus without selecting and lets a single selection toggle off', () => {
    render(
      <ChipGroup type="single" defaultValue="a">
        {chips}
      </ChipGroup>,
    )
    const alpha = screen.getByRole('button', { name: 'Alpha' })
    const charlie = screen.getByRole('button', { name: 'Charlie' })
    fireEvent.keyDown(alpha, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(charlie)
    expect(alpha.getAttribute('aria-pressed')).toBe('true')
    expect(charlie.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(alpha)
    expect(alpha.getAttribute('aria-pressed')).toBe('false')
  })
  it('supports RTL navigation and skips disabled buttons without looping', () => {
    render(
      <ChipGroup dir="rtl" loop={false}>
        {chips}
      </ChipGroup>,
    )
    const alpha = screen.getByRole('button', { name: 'Alpha' })
    fireEvent.keyDown(alpha, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(alpha)
    fireEvent.keyDown(alpha, { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Charlie' }))
    fireEvent.keyDown(document.activeElement!, { key: 'Home' })
    expect(document.activeElement).toBe(alpha)
  })
  it('composes with the existing DropdownMenu via asChild, preserving refs and keyboard behavior', async () => {
    const onSelect = vi.fn()
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <DropdownMenu>
        <ChipGroup aria-label="Menu actions" gap="md">
          <DropdownMenuTrigger asChild>
            <Chip ref={ref} behavior="action" selected>
              Open menu
            </Chip>
          </DropdownMenuTrigger>
          <Chip>Another action</Chip>
        </ChipGroup>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Run action</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const trigger = screen.getByRole('button', { name: 'Open menu' })
    expect(ref.current).toBe(trigger)
    fireEvent.keyDown(trigger, { key: 'Enter' })
    const item = await screen.findByRole('menuitem', { name: 'Run action' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.hasAttribute('aria-pressed')).toBe(false)
    fireEvent.click(item)
    expect(onSelect).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })
})
