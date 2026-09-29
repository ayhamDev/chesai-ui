import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Chip } from '../chip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './index'

vi.mock('../../hooks/useRipple', () => ({ default: () => [null, vi.fn()] }))
afterEach(cleanup)
const backdrop = () => document.querySelector('[data-dropdown-menu-overlay]') as HTMLElement | null

function Example({ overlay = false, ...props }: React.ComponentProps<typeof DropdownMenu>) {
  return (
    <DropdownMenu overlay={overlay} {...props}>
      <DropdownMenuTrigger asChild>
        <Chip>Open actions</Chip>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Action</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

async function open() {
  fireEvent.keyDown(screen.getByRole('button', { name: 'Open actions' }), { key: 'Enter' })
  await screen.findByRole('menu')
}

describe('DropdownMenu overlay', () => {
  it('keeps the original asChild trigger interactive and follows its position without remounting it', async () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <DropdownMenu overlay>
        <DropdownMenuTrigger asChild ref={ref} style={{ pointerEvents: 'inherit',
          borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
          borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
          <Chip>Open actions</Chip>
        </DropdownMenuTrigger>
        <DropdownMenuContent><DropdownMenuItem>Action</DropdownMenuItem></DropdownMenuContent>
      </DropdownMenu>,
    )
    const trigger = ref.current!
    let left = 20
    vi.spyOn(trigger, 'getBoundingClientRect').mockImplementation(() => ({
      x: left, y: 40, left, top: 40, right: left + 80, bottom: 80,
      width: 80, height: 40, toJSON() {},
    }))
    await open()
    expect(ref.current).toBe(trigger)
    expect(trigger.style.pointerEvents).toBe('auto')
    await waitFor(() => expect(backdrop()?.style.clipPath).toContain('M 40 40'))
    expect(backdrop()?.style.clipPath).toContain('A 20 20 0 0 1 100 60')
    left = 120
    await waitFor(() => expect(backdrop()?.style.clipPath).toContain('M 140 40'))
    fireEvent.pointerDown(trigger, { button: 0, pointerType: 'mouse', ctrlKey: false })
    await waitFor(() => expect(backdrop()).toBeNull())
    expect(ref.current).toBe(trigger)
    expect(trigger.style.pointerEvents).toBe('inherit')
  })

  it('updates blur without remounting or dismissing the open menu', async () => {
    const { rerender } = render(<Example overlay open overlayBlur="xs" />)
    const menu = await screen.findByRole('menu')
    const action = screen.getByRole('menuitem', { name: 'Action' })
    action.focus()
    for (const [size, css] of [['xs', 'backdrop-blur-[2px]'], ['sm', 'backdrop-blur-[4px]'], ['md', 'backdrop-blur-[8px]'], ['lg', 'backdrop-blur-[16px]'], ['xl', 'backdrop-blur-[24px]'], ['none', 'backdrop-blur-none']] as const) {
      rerender(<Example overlay open overlayBlur={size} />)
      expect(backdrop()?.className).toContain(css)
      expect(screen.getByRole('menu')).toBe(menu)
      expect(document.activeElement).toBe(action)
    }
  })

  it('shows keyboard focus only until pointer navigation resumes', async () => {
    render(<Example overlay />)
    await open()
    const menu = screen.getByRole('menu')
    const action = screen.getByRole('menuitem', { name: 'Action' })
    expect(menu.getAttribute('data-menu-keyboard')).toBe('true')
    fireEvent.pointerMove(action, { pointerType: 'mouse' })
    expect(menu.getAttribute('data-menu-keyboard')).toBe('false')
    expect(screen.getByRole('menu')).toBe(menu)
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(menu.getAttribute('data-menu-keyboard')).toBe('true')
    fireEvent.pointerDown(action, { pointerType: 'touch' })
    expect(menu.getAttribute('data-menu-keyboard')).toBe('false')
  })

  it('is opt-in and keeps the existing menu behavior', async () => {
    render(<Example />)
    await open()
    expect(backdrop()).toBeNull()
    fireEvent.click(screen.getByRole('menuitem', { name: 'Action' }))
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })

  it('supports uncontrolled open, Escape dismissal and focus restoration', async () => {
    const changed = vi.fn()
    render(<Example overlay onOpenChange={changed} />)
    expect(backdrop()).toBeNull()
    await open()
    expect(backdrop()?.getAttribute('aria-hidden')).toBe('true')
    expect(backdrop()?.style.pointerEvents).toBe('auto')
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    await waitFor(() => expect(backdrop()).toBeNull())
    expect(changed).toHaveBeenLastCalledWith(false)
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open actions' })))
  })

  it('dismisses when clicking the overlay, while leaving outside event handlers in control', async () => {
    const changed = vi.fn()
    const outside = vi.fn()
    const { rerender } = render(
      <DropdownMenu overlay defaultOpen onOpenChange={changed}>
        <DropdownMenuTrigger asChild>
          <Chip>Open actions</Chip>
        </DropdownMenuTrigger>
        <DropdownMenuContent onPointerDownOutside={outside}>
          <DropdownMenuItem>Action</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await screen.findByRole('menu')
    // Radix defers the document listener by one macrotask after mounting.
    await new Promise(resolve => setTimeout(resolve, 0))
    fireEvent.pointerDown(backdrop()!, { button: 0, pointerType: 'mouse' })
    await waitFor(() => expect(backdrop()).toBeNull())
    expect(outside).toHaveBeenCalledTimes(1)
    expect(changed).toHaveBeenLastCalledWith(false)
    changed.mockClear()
    rerender(
      <DropdownMenu overlay open onOpenChange={changed}>
        <DropdownMenuTrigger asChild>
          <Chip>Open actions</Chip>
        </DropdownMenuTrigger>
        <DropdownMenuContent onPointerDownOutside={event => event.preventDefault()}>
          <DropdownMenuItem>Action</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await screen.findByRole('menu')
    await new Promise(resolve => setTimeout(resolve, 0))
    fireEvent.pointerDown(backdrop()!, { button: 0, pointerType: 'mouse' })
    expect(backdrop()).not.toBeNull()
    expect(screen.getByRole('menu')).toBeTruthy()
    expect(changed).not.toHaveBeenCalled()
  })

  it('follows controlled open and allows custom backdrop styling', async () => {
    const changed = vi.fn()
    const { rerender } = render(
      <Example overlay open overlayClassName="bg-black/60 backdrop-blur-none" onOpenChange={changed} />,
    )
    await screen.findByRole('menu')
    expect(backdrop()?.className).toContain('bg-black/60')
    expect(backdrop()?.className).not.toContain('bg-black/35')
    expect(backdrop()?.className).not.toContain('backdrop-blur-[2px]')
    fireEvent.click(screen.getByRole('menuitem', { name: 'Action' }))
    expect(changed).toHaveBeenLastCalledWith(false)
    expect(backdrop()).not.toBeNull()
    rerender(<Example overlay open={false} />)
    await waitFor(() => expect(backdrop()).toBeNull())
  })

  it('renders only one backdrop when a submenu opens and keeps it through submenu interaction', async () => {
    render(
      <DropdownMenu overlay defaultOpen>
        <DropdownMenuTrigger asChild>
          <Chip>Open actions</Chip>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Nested action</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    fireEvent.keyDown(await screen.findByRole('menuitem', { name: 'More' }), { key: 'ArrowRight' })
    await screen.findByRole('menuitem', { name: 'Nested action' })
    expect(document.querySelectorAll('[data-dropdown-menu-overlay]')).toHaveLength(1)
    fireEvent.click(screen.getByRole('menuitem', { name: 'Nested action' }))
    await waitFor(() => expect(backdrop()).toBeNull())
  })
})
