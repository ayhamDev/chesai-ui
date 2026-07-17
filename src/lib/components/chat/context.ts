'use client'

import { createContext, useContext, useSyncExternalStore } from 'react'
import type { ChatController, ChatScrollBehavior } from './controller'

const ChatContext = createContext<ChatController | null>(null)

export { ChatContext }

/** Internal: the controller instance is stable, so this context never re-renders consumers. */
export function useChatController(): ChatController {
  const controller = useContext(ChatContext)
  if (!controller) {
    throw new Error('Chat components must be rendered inside <Chat.Root>')
  }
  return controller
}

export interface ChatApi {
  /** Scroll (and re-pin) the viewport to the bottom. */
  scrollToBottom: (behavior?: ChatScrollBehavior) => void
  /** Non-reactive read of the current at-bottom state. */
  isAtBottom: () => boolean
  /** The raw scroll container element, if mounted. */
  getViewport: () => HTMLElement | null
}

/**
 * Imperative chat API. Stable identity — never causes re-renders.
 * For reactive at-bottom state use `useChatAtBottom`.
 */
export function useChat(): ChatApi {
  const controller = useChatController()
  return controller.api
}

const getServerAtBottom = () => true

/**
 * Reactive "is the viewport at the bottom" flag. Subscribes via
 * `useSyncExternalStore`, so only the calling component re-renders, and only
 * when the value actually flips — never per scroll tick.
 */
export function useChatAtBottom(): boolean {
  const controller = useChatController()
  return useSyncExternalStore(controller.subscribe, controller.getAtBottom, getServerAtBottom)
}
