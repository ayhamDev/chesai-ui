import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './index'
import { Sheet } from '../sheet'
import { Dialog, DialogContent, DialogTitle } from '../dialog'
vi.mock('@uidotdev/usehooks', () => ({ useMediaQuery: () => true }))
afterEach(cleanup)
function Handoff({ kind }: { kind: 'sheet' | 'dialog' }) {
  const [open, setOpen] = React.useState(false)
  return <>
    <DropdownMenu overlay>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent><DropdownMenuItem onSelect={() => setOpen(true)}>Details</DropdownMenuItem></DropdownMenuContent>
    </DropdownMenu>
    {kind === 'sheet' ? <Sheet open={open} onOpenChange={setOpen} forceSideSheet>
      <Sheet.Content aria-describedby={undefined}><Sheet.Title>Details panel</Sheet.Title><Sheet.Close>Close panel</Sheet.Close></Sheet.Content>
    </Sheet> : <Dialog open={open} onOpenChange={setOpen}><DialogContent aria-describedby={undefined}><DialogTitle>Details panel</DialogTitle><button onClick={() => setOpen(false)}>Close panel</button></DialogContent></Dialog>}
  </>
}
it.each(['sheet', 'dialog'] as const)('releases pointer locks after repeated menu to %s handoffs', async kind => {
  const original = document.body.style.pointerEvents
  render(<Handoff kind={kind} />)
  for (let round = 0; round < 2; round++) {
    fireEvent.keyDown(screen.getByRole('button', { name: 'Actions' }), { key: 'Enter' })
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Details' }))
    await screen.findByRole('dialog')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    fireEvent.click(screen.getByRole('button', { name: 'Close panel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(document.body.style.pointerEvents).not.toBe('none'))
  }
  // Vaul may explicitly restore `auto`; both allow normal page input.
  expect(['', 'auto', original]).toContain(document.body.style.pointerEvents)
})
