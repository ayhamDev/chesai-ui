import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ContextMenu } from './index'

vi.mock('../../hooks/useRipple', () => ({ default: () => [null, vi.fn()] }))
afterEach(cleanup)

it('switches between pointer and keyboard focus styling without closing the context menu', async () => {
  render(
    <ContextMenu>
      <ContextMenu.Trigger>Document</ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item>Rename</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>,
  )
  fireEvent.contextMenu(screen.getByText('Document'), { clientX: 20, clientY: 20 })
  const menu = await screen.findByRole('menu')
  expect(menu.getAttribute('data-menu-keyboard')).toBe('false')
  fireEvent.keyDown(menu, { key: 'ArrowDown' })
  expect(menu.getAttribute('data-menu-keyboard')).toBe('true')
  fireEvent.pointerMove(screen.getByRole('menuitem', { name: 'Rename' }), { pointerType: 'mouse' })
  expect(menu.getAttribute('data-menu-keyboard')).toBe('false')
  expect(screen.getByRole('menu')).toBe(menu)
})
