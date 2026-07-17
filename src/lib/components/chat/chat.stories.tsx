import type { Meta, StoryObj } from '@storybook/react'
import { ArrowDown, Bot, Send, User } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Button } from '../button'
import { IconButton } from '../icon-button'
import { Input } from '../input'
import { LoadingIndicator } from '../loadingIndicator'
import { Typography } from '../typography'
import { Chat, type ChatRootRef, useChatAtBottom } from './index'

const meta: Meta<typeof Chat.Root> = {
  title: 'Components/Data/Chat',
  component: Chat.Root,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Chat.Root>

/* ----------------------------------------------------------------- helpers */

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
}

let idCounter = 0
const nextId = () => `msg-${++idCounter}`

const LOREM =
  'Headless means this component ships behavior, not pixels: pinning to the bottom while tokens stream in, releasing the pin the moment you scroll up, restoring your exact reading position when older history is prepended, and loading more history when you reach the top.'

function makeHistoryPage(page: number, size = 20): Message[] {
  return Array.from({ length: size }, (_, i) => {
    const n = page * size + i
    const role = n % 2 === 0 ? 'assistant' : ('user' as const)
    return {
      id: nextId(),
      role: role as Message['role'],
      text: `(${page * size + i}) ${role === 'user' ? 'Question from earlier in the conversation.' : 'An older assistant answer, part of paged history.'}`,
    }
  })
}

const REPLY_TOKENS = LOREM.split(' ')

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex w-full gap-2 px-4 py-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
          <Bot size={15} />
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-md bg-primary text-on-primary'
            : 'rounded-bl-md bg-surface-container-high text-on-surface'
        }`}
      >
        {message.text || '…'}
      </div>
      {isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
          <User size={15} />
        </div>
      )}
    </div>
  )
}

/** Styled entirely via the headless `data-state` attribute — no JS visibility logic. */
function JumpToLatest() {
  return (
    <Chat.ScrollToBottom className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 rounded-full bg-primary p-2.5 text-on-primary shadow-lg transition-all duration-200 data-[state=hidden]:pointer-events-none data-[state=hidden]:translate-y-2 data-[state=hidden]:opacity-0">
      <ArrowDown size={18} />
    </Chat.ScrollToBottom>
  )
}

/* ----------------------------------------------------------------- stories */

const AiChatDemo = ({ behavior }: { behavior: 'smooth' | 'instant' }) => {
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: nextId(), role: 'assistant', text: 'Hi! Ask me anything — I will stream my answer token by token.' },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const pageRef = useRef(0)

  const loadOlder = useCallback(async () => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    const page = pageRef.current++
    setMessages(prev => [...makeHistoryPage(page), ...prev])
    if (pageRef.current >= 4) setHasMore(false)
    setIsLoading(false)
  }, [])

  const send = useCallback(() => {
    const text = input.trim() || 'What does "headless" mean here?'
    setInput('')
    setIsStreaming(true)
    const assistantId = nextId()
    setMessages(prev => [
      ...prev,
      { id: nextId(), role: 'user', text },
      { id: assistantId, role: 'assistant', text: '' },
    ])
    let i = 0
    const interval = setInterval(() => {
      i += 1 + Math.floor(Math.random() * 3)
      const done = i >= REPLY_TOKENS.length
      const streamed = REPLY_TOKENS.slice(0, i).join(' ')
      // Immutable update: only the streaming row's reference changes, so
      // <Chat.Messages> re-renders exactly one bubble per tick.
      setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, text: streamed } : m)))
      if (done) {
        clearInterval(interval)
        setIsStreaming(false)
      }
    }, 60)
  }, [input])

  const renderMessage = useCallback((message: Message) => <MessageBubble message={message} />, [])

  return (
    <div className="relative flex h-[560px] w-[420px] flex-col overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-xl">
      <div className="flex items-center gap-2 border-b border-outline-variant px-4 py-3">
        <Bot size={18} />
        <Typography variant="h4">Agent</Typography>
        <span className="ml-auto text-xs text-on-surface-variant">
          {isStreaming ? 'streaming…' : hasMore ? 'scroll up for history' : 'full history loaded'}
        </span>
      </div>

      <Chat.Root behavior={behavior} hasMore={hasMore} isLoading={isLoading} onLoadOlder={loadOlder}>
        <Chat.Viewport className="min-h-0 flex-1">
          <Chat.Content className="flex flex-col py-3">
            {isLoading && (
              <div className="flex w-full items-center justify-center py-3">
                <LoadingIndicator variant="material-morph-background" />
              </div>
            )}
            <Chat.Messages items={messages} getKey={m => m.id}>
              {renderMessage}
            </Chat.Messages>
          </Chat.Content>
        </Chat.Viewport>
        <JumpToLatest />
      </Chat.Root>

      <div className="flex items-center gap-2 border-t border-outline-variant p-3">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !isStreaming && send()}
          placeholder="Send a message…"
          className="flex-1"
        />
        <IconButton aria-label="Send" onClick={send} disabled={isStreaming}>
          <Send size={18} />
        </IconButton>
      </div>
    </div>
  )
}

export const StreamingAgent: Story = {
  name: '1. Streaming Agent (smooth follow)',
  render: () => <AiChatDemo behavior="smooth" />,
}

export const InstantFollow: Story = {
  name: '2. Streaming Agent (instant follow)',
  render: () => <AiChatDemo behavior="instant" />,
}

const HistoryOnlyDemo = () => {
  const [messages, setMessages] = useState<Message[]>(() => makeHistoryPage(100, 30))
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const pageRef = useRef(0)
  const rootRef = useRef<ChatRootRef>(null)

  const loadOlder = useCallback(async () => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 800))
    const page = pageRef.current++
    setMessages(prev => [...makeHistoryPage(page), ...prev])
    if (pageRef.current >= 6) setHasMore(false)
    setIsLoading(false)
  }, [])

  const renderMessage = useCallback((message: Message) => <MessageBubble message={message} />, [])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-[520px] w-[400px] overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-xl">
        <Chat.Root ref={rootRef} hasMore={hasMore} isLoading={isLoading} onLoadOlder={loadOlder}>
          <Chat.Viewport className="h-full">
            <Chat.Content className="flex flex-col py-3">
              {isLoading && (
                <div className="flex w-full items-center justify-center py-3">
                  <LoadingIndicator variant="material-morph-background" />
                </div>
              )}
              <Chat.Messages items={messages} getKey={m => m.id}>
                {renderMessage}
              </Chat.Messages>
            </Chat.Content>
          </Chat.Viewport>
          <JumpToLatest />
        </Chat.Root>
      </div>
      <Button variant="secondary" onClick={() => rootRef.current?.scrollToBottom('smooth')}>
        Scroll to bottom (imperative)
      </Button>
    </div>
  )
}

export const ReverseInfiniteHistory: Story = {
  name: '3. Reverse Infinite History',
  render: () => <HistoryOnlyDemo />,
}

const UnreadBadge = ({ count }: { count: number }) => {
  const atBottom = useChatAtBottom()
  if (atBottom || count === 0) return null
  return (
    <div className="absolute bottom-24 right-4 z-10 rounded-full bg-error px-2.5 py-1 text-xs font-semibold text-on-error shadow">
      {count} new
    </div>
  )
}

const BurstDemo = () => {
  const [messages, setMessages] = useState<Message[]>(() => makeHistoryPage(200, 15))
  const unreadRef = useRef(0)
  const rootRef = useRef<ChatRootRef>(null)
  const [, force] = useState(0)
  const renderMessage = useCallback((message: Message) => <MessageBubble message={message} />, [])

  const addBurst = useCallback(() => {
    // 30 appends over ~2s — the viewport must stay glued to the bottom when
    // pinned, and count "unread" via onAtBottomChange-driven state otherwise.
    let n = 0
    const interval = setInterval(() => {
      n++
      if (!rootRef.current?.isAtBottom()) {
        unreadRef.current++
        force(x => x + 1)
      }
      setMessages(prev => [
        ...prev,
        { id: nextId(), role: 'assistant', text: `Burst message #${n} arriving at high frequency.` },
      ])
      if (n >= 30) clearInterval(interval)
    }, 66)
  }, [])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-[520px] w-[400px] overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-xl">
        <Chat.Root
          ref={rootRef}
          behavior="smooth"
          onAtBottomChange={atBottom => {
            if (atBottom) {
              unreadRef.current = 0
              force(x => x + 1)
            }
          }}
        >
          <Chat.Viewport className="h-full">
            <Chat.Content className="flex flex-col py-3">
              <Chat.Messages items={messages} getKey={m => m.id}>
                {renderMessage}
              </Chat.Messages>
            </Chat.Content>
          </Chat.Viewport>
          <JumpToLatest />
          <UnreadBadge count={unreadRef.current} />
        </Chat.Root>
      </div>
      <Button onClick={addBurst}>Send 30-message burst</Button>
    </div>
  )
}

export const HighFrequencyBurst: Story = {
  name: '4. High-Frequency Burst + Unread Badge',
  render: () => <BurstDemo />,
}
