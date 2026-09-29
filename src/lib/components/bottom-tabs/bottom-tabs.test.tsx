import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { BottomTabs } from './index'
const ripple = vi.hoisted(() => ({ create: vi.fn(), spawn: vi.fn(() => vi.fn()), dispose: vi.fn() }))
vi.mock('../../utils/liquid-ripple', () => ({ createLiquidRipple: (...args: unknown[]) => { ripple.create(...args); return { spawn: ripple.spawn, dispose: ripple.dispose } } }))
vi.mock('../../utils/classic-ripple', () => ({ createClassicRipple: (...args: unknown[]) => { ripple.create(...args); return { spawn: ripple.spawn, dispose: ripple.dispose } } }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
function Example({ pillStyle = 'icon', disableRipple = false }: { pillStyle?: 'icon' | 'full'; disableRipple?: boolean }) {
  return <BottomTabs.Navigator activeTab="chats" onTabPress={() => {}} pillStyle={pillStyle} disableRipple={disableRipple}>
    <BottomTabs.Screen name="chats" label="Chats" icon={() => <span>Icon</span>} />
  </BottomTabs.Navigator>
}
it.each(['icon', 'full'] as const)('places pointer and keyboard ripples inside the %s indicator', pillStyle => {
  render(<Example pillStyle={pillStyle} />)
  const tab = screen.getByRole('tab')
  fireEvent.pointerDown(tab, { button: 0, pointerId: 1, clientX: 10, clientY: 50 })
  const target = pillStyle === 'icon' ? tab.querySelector('[data-tab-indicator]') : tab
  expect(ripple.create.mock.calls[0][0]).toBe(target)
  fireEvent.pointerUp(window, { pointerId: 1 })
  fireEvent.keyDown(tab, { key: 'Enter' })
  expect(ripple.spawn).toHaveBeenCalledTimes(2)
})
it('disables keyboard ripples as well as pointer ripples', () => {
  render(<Example disableRipple />)
  const tab = screen.getByRole('tab')
  fireEvent.pointerDown(tab, { button: 0 })
  fireEvent.keyDown(tab, { key: 'Enter' })
  expect(ripple.create).not.toHaveBeenCalled()
})
