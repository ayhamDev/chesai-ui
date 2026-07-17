'use client'

import { Slot } from '@radix-ui/react-slot'
import type React from 'react'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { type ChatApi, ChatContext, useChat, useChatAtBottom, useChatController } from './context'
import { CHAT_DEFAULT_OPTIONS, ChatController, type ChatScrollBehavior } from './controller'

export type { ChatScrollBehavior }
export { type ChatApi, useChat, useChatAtBottom }

/* -------------------------------------------------------------------------- */
/* Root                                                                       */
/* -------------------------------------------------------------------------- */

export interface ChatRootProps {
  children: React.ReactNode
  /** Fired when the viewport scrolls into the top threshold and `hasMore` is true. */
  onLoadOlder?: () => void | Promise<void>
  /** Indicates older history is available. @default false */
  hasMore?: boolean
  /** Loading state for older history; while true, load triggers are suppressed. @default false */
  isLoading?: boolean
  /** Distance (px) from the bottom within which auto-scroll stays engaged. @default 100 */
  autoScrollThreshold?: number
  /** Distance (px) from the top that triggers `onLoadOlder`. @default 80 */
  loadThreshold?: number
  /** How the viewport follows streamed content while pinned. @default "instant" */
  behavior?: ChatScrollBehavior
  /** Fired only when the at-bottom state flips. */
  onAtBottomChange?: (atBottom: boolean) => void
}

export type ChatRootRef = ChatApi

/**
 * Headless provider: owns the scroll controller, renders no DOM.
 * All scroll work happens outside React state — descendants only re-render
 * where they explicitly subscribe (`useChatAtBottom`).
 */
export const ChatRoot = forwardRef<ChatRootRef, ChatRootProps>(
  (
    {
      children,
      onLoadOlder,
      hasMore = CHAT_DEFAULT_OPTIONS.hasMore,
      isLoading = CHAT_DEFAULT_OPTIONS.isLoading,
      autoScrollThreshold = CHAT_DEFAULT_OPTIONS.autoScrollThreshold,
      loadThreshold = CHAT_DEFAULT_OPTIONS.loadThreshold,
      behavior = CHAT_DEFAULT_OPTIONS.behavior,
      onAtBottomChange,
    },
    ref,
  ) => {
    const [controller] = useState(() => new ChatController())

    // Sync config before paint so isLoading transitions are seen ahead of the
    // ResizeObserver tick that follows the corresponding DOM mutation.
    useLayoutEffect(() => {
      controller.setOptions({
        onLoadOlder,
        hasMore,
        isLoading,
        autoScrollThreshold,
        loadThreshold,
        behavior,
        onAtBottomChange,
      })
    })

    useEffect(() => () => controller.destroy(), [controller])

    useImperativeHandle(ref, () => controller.api, [controller])

    return <ChatContext.Provider value={controller}>{children}</ChatContext.Provider>
  },
)
ChatRoot.displayName = 'Chat.Root'

/* -------------------------------------------------------------------------- */
/* Viewport                                                                   */
/* -------------------------------------------------------------------------- */

export interface ChatViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Merge behavior onto the child element instead of rendering a div. */
  asChild?: boolean
}

// Functional requirements only — visual styling is entirely yours.
// `overflow-anchor: none` disables native scroll anchoring, which would fight
// the controller's own pinning/anchoring corrections.
const VIEWPORT_STYLE: React.CSSProperties = {
  overflowY: 'auto',
  overflowAnchor: 'none',
}

/**
 * The scroll container. Exposes `data-at-bottom="true" | "false"` (kept up to
 * date via direct attribute writes — no re-renders) for CSS styling hooks.
 */
export const ChatViewport = forwardRef<HTMLDivElement, ChatViewportProps>(
  ({ asChild, style, children, ...props }, forwardedRef) => {
    const controller = useChatController()
    const localRef = useRef<HTMLDivElement | null>(null)

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        localRef.current = node
        controller.setViewport(node)
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [controller, forwardedRef],
    )

    // Reflect at-bottom state as a DOM attribute without re-rendering the
    // (potentially huge) subtree.
    useEffect(() => {
      const sync = () => {
        localRef.current?.setAttribute('data-at-bottom', String(controller.getAtBottom()))
      }
      sync()
      return controller.subscribe(sync)
    }, [controller])

    const Comp = asChild ? Slot : 'div'
    return (
      <Comp ref={setRefs} role="log" data-chat-viewport="" style={{ ...VIEWPORT_STYLE, ...style }} {...props}>
        {children}
      </Comp>
    )
  },
)
ChatViewport.displayName = 'Chat.Viewport'

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

export interface ChatContentProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

/**
 * The resize-observed wrapper directly inside the viewport. Its direct
 * children are treated as the message rows for prepend anchoring.
 */
export const ChatContent = forwardRef<HTMLDivElement, ChatContentProps>(
  ({ asChild, children, ...props }, forwardedRef) => {
    const controller = useChatController()

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        controller.setContent(node)
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [controller, forwardedRef],
    )

    const Comp = asChild ? Slot : 'div'
    return (
      <Comp ref={setRefs} data-chat-content="" {...props}>
        {children}
      </Comp>
    )
  },
)
ChatContent.displayName = 'Chat.Content'

/* -------------------------------------------------------------------------- */
/* ScrollToBottom                                                             */
/* -------------------------------------------------------------------------- */

export interface ChatScrollToBottomProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  /** Scroll behavior for the jump. @default "smooth" */
  behavior?: ChatScrollBehavior
}

/**
 * Headless "jump to latest" button. Carries `data-state="visible" | "hidden"`
 * (hidden while at the bottom) — visibility styling/animation is yours.
 */
export const ChatScrollToBottom = forwardRef<HTMLButtonElement, ChatScrollToBottomProps>(
  ({ asChild, behavior = 'smooth', onClick, ...props }, ref) => {
    const controller = useChatController()
    const atBottom = useChatAtBottom()

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
        if (!e.defaultPrevented) controller.scrollToBottom(behavior)
      },
      [controller, behavior, onClick],
    )

    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : 'button'}
        aria-label="Scroll to bottom"
        data-state={atBottom ? 'hidden' : 'visible'}
        onClick={handleClick}
        {...props}
      />
    )
  },
)
ChatScrollToBottom.displayName = 'Chat.ScrollToBottom'

/* -------------------------------------------------------------------------- */
/* Messages                                                                   */
/* -------------------------------------------------------------------------- */

interface ChatMessageRowProps<T> {
  item: T
  index: number
  render: (item: T, index: number) => React.ReactNode
}

const ChatMessageRow = memo(function ChatMessageRow<T>({ item, index, render }: ChatMessageRowProps<T>) {
  return <>{render(item, index)}</>
}) as <T>(props: ChatMessageRowProps<T>) => React.ReactElement

export interface ChatMessagesProps<T> {
  /** The message list. Use immutable updates so unchanged rows keep their identity. */
  items: readonly T[]
  /** Stable key per message (e.g. message id). */
  getKey: (item: T, index: number) => React.Key
  /**
   * Row renderer. Wrap in `useCallback` — with immutable `items` updates,
   * streaming into the last message then re-renders only that row.
   */
  children: (item: T, index: number) => React.ReactNode
}

/**
 * Optional render helper that memoizes each row. During token streaming only
 * the row whose item reference changed re-renders, instead of the whole
 * transcript.
 */
export function ChatMessages<T>({ items, getKey, children }: ChatMessagesProps<T>): React.ReactElement {
  return (
    <>
      {items.map((item, index) => (
        <ChatMessageRow key={getKey(item, index)} item={item} index={index} render={children} />
      ))}
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Namespace                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Headless chat primitives for AI-agent UIs.
 *
 * ```tsx
 * <Chat.Root hasMore={hasMore} isLoading={isLoading} onLoadOlder={loadOlder} behavior="smooth">
 *   <Chat.Viewport className="h-full">
 *     <Chat.Content>
 *       <Chat.Messages items={messages} getKey={m => m.id}>
 *         {renderMessage}
 *       </Chat.Messages>
 *     </Chat.Content>
 *   </Chat.Viewport>
 *   <Chat.ScrollToBottom />
 * </Chat.Root>
 * ```
 */
export const Chat = {
  Root: ChatRoot,
  Viewport: ChatViewport,
  Content: ChatContent,
  ScrollToBottom: ChatScrollToBottom,
  Messages: ChatMessages,
}
