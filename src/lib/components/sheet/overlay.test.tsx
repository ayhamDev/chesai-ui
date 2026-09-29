import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Sheet } from './index'
import { Dialog, DialogContent, DialogTitle } from '../dialog'

vi.mock('@uidotdev/usehooks', () => ({ useMediaQuery: () => true }))
afterEach(cleanup)

describe('overlay blur propagation', () => {
  it('updates a Vaul sheet backdrop while keeping its content and dismissal working', async () => {
    const changed = vi.fn()
    const example = (blur: 'xl' | 'none') => (
      <Sheet open forceSideSheet overlayBlur={blur} onOpenChange={changed}>
        <Sheet.Content aria-describedby={undefined}>
          <Sheet.Title>Details</Sheet.Title>
          <Sheet.Close>Done</Sheet.Close>
        </Sheet.Content>
      </Sheet>
    )
    const { rerender } = render(example('xl'))
    const dialog = await screen.findByRole('dialog')
    expect(document.querySelector('[data-vaul-overlay]')?.className).toContain('backdrop-blur-[24px]')
    rerender(example('none'))
    expect(screen.getByRole('dialog')).toBe(dialog)
    expect(document.querySelector('[data-vaul-overlay]')?.className).toContain('backdrop-blur-none')
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(changed).toHaveBeenCalledWith(false)
  })

  it('applies blur to a basic dialog backdrop while preserving Escape dismissal', async () => {
    const changed = vi.fn()
    render(
      <Dialog open overlayBlur="sm" onOpenChange={changed}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Details</DialogTitle>
        </DialogContent>
      </Dialog>,
    )
    const dialog = await screen.findByRole('dialog')
    expect(document.querySelector('.backdrop-blur-\\[4px\\]')).not.toBeNull()
    fireEvent.keyDown(dialog, { key: 'Escape' })
    await waitFor(() => expect(changed).toHaveBeenCalledWith(false))
  })
})
