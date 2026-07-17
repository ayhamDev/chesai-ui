# Chat (headless)

Headless chat primitives for AI-agent UIs — the scroll behavior of a great chat app (assistant-ui-style), with zero styling opinions. You bring the markup and CSS; `Chat` brings:

- **Stick-to-bottom** while tokens stream in (`instant` or `smooth` rAF-driven follow).
- **Escape on intent**: the pin releases the instant the user scrolls/wheels/drags up, and re-engages when they return to the bottom zone.
- **Reverse infinite scroll**: `onLoadOlder` fires at the top threshold, with automatic **backfill** while the list is too short to scroll.
- **Prepend anchoring**: when older history lands, the reading position is held exactly — even if a reply is simultaneously streaming in below.
- **Zero-re-render architecture**: scrolling, streaming growth, and pinning never set React state. UI that must react (a "jump to latest" button) subscribes via `useSyncExternalStore` and re-renders only on real flips.

## Anatomy

```tsx
import { Chat } from 'chesai-ui'

<Chat.Root
  behavior="smooth"          // how the viewport follows streamed content
  hasMore={hasMore}
  isLoading={isLoading}
  onLoadOlder={loadOlder}    // prepend a page (async supported)
>
  <Chat.Viewport className="h-full">      {/* the scroll container */}
    <Chat.Content className="flex flex-col">
      {isLoading && <YourSpinner />}
      <Chat.Messages items={messages} getKey={m => m.id}>
        {renderMessage /* wrap in useCallback */}
      </Chat.Messages>
    </Chat.Content>
  </Chat.Viewport>
  <Chat.ScrollToBottom className="...">
    <ArrowDown />
  </Chat.ScrollToBottom>
</Chat.Root>
```

`Chat.Root` renders no DOM. `Chat.Viewport` and `Chat.Content` render plain `div`s (or your own element via `asChild`) with only the styles the behavior needs (`overflow-y: auto; overflow-anchor: none` on the viewport).

## Components

### `Chat.Root`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `onLoadOlder` | `() => void \| Promise<void>` | — | Fired when the viewport reaches the top threshold (or needs backfill). Prepend the older page in it. |
| `hasMore` | `boolean` | `false` | Whether older history exists. |
| `isLoading` | `boolean` | `false` | Parent-owned loading state; suppresses duplicate triggers and scopes prepend anchoring. |
| `autoScrollThreshold` | `number` | `100` | Distance (px) from the bottom within which auto-scroll stays engaged. |
| `loadThreshold` | `number` | `80` | Distance (px) from the top that triggers `onLoadOlder`. |
| `behavior` | `'instant' \| 'smooth'` | `'instant'` | How the viewport follows appended/streamed content while pinned. |
| `onAtBottomChange` | `(atBottom: boolean) => void` | — | Fired only when the at-bottom state flips. |

Ref (`ChatRootRef`): `scrollToBottom(behavior?)`, `isAtBottom()`, `getViewport()`.

### `Chat.Viewport`

The scroll container. Accepts all `div` props plus `asChild`. Defaults `role="log"`. Carries `data-chat-viewport` and a live `data-at-bottom="true" | "false"` attribute (updated by direct DOM writes — no re-renders) for pure-CSS styling:

```css
[data-chat-viewport][data-at-bottom='false'] { /* e.g. show a top shadow */ }
```

### `Chat.Content`

The resize-observed wrapper directly inside the viewport; streaming growth is detected here. Its direct children are treated as message rows for prepend anchoring — render your rows (or `Chat.Messages`) directly inside it. If you skip it, the viewport's first element child is used automatically.

### `Chat.ScrollToBottom`

A headless `<button>` (or `asChild`) that jumps to the latest message. Carries `data-state="visible" | "hidden"` (hidden while at the bottom) — animate/hide it with CSS:

```tsx
<Chat.ScrollToBottom className="transition-opacity data-[state=hidden]:pointer-events-none data-[state=hidden]:opacity-0" />
```

### `Chat.Messages`

Optional render helper with per-row memoization:

```tsx
const renderMessage = useCallback((m: Message) => <Bubble message={m} />, [])

<Chat.Messages items={messages} getKey={m => m.id}>{renderMessage}</Chat.Messages>
```

With immutable `items` updates (only the streaming message gets a new reference), each token tick re-renders **one** row instead of the whole transcript. Keep the child function referentially stable (`useCallback`) or rows will re-render anyway.

## Hooks

- `useChatAtBottom(): boolean` — reactive at-bottom flag; re-renders only the calling component, only on flips.
- `useChat(): ChatApi` — stable imperative API (`scrollToBottom`, `isAtBottom`, `getViewport`); never causes re-renders. Must be used inside `Chat.Root`.

## Streaming pattern

```tsx
const [messages, setMessages] = useState<Message[]>([])

// per token / chunk:
setMessages(prev => prev.map(m => (m.id === streamingId ? { ...m, text: m.text + chunk } : m)))
```

The `ResizeObserver` on `Chat.Content` picks up the growth and re-pins before paint — no flicker, no scroll event feedback loops, and with `behavior="smooth"` a frame-retargeting animation that keeps up with continuously growing content (native `scrollTo({ behavior: 'smooth' })` restarts and stutters in that scenario).

## Why it's fast (vs. `ReverseInfiniteScroll`)

| Concern | `ReverseInfiniteScroll` | `Chat` |
| --- | --- | --- |
| Scroll events | React synthetic handler; snapshot races with layout effects | One native passive listener, plain-field bookkeeping |
| Anchoring | `useLayoutEffect` keyed on `children` diffs `scrollHeight` (cannot tell prepend from append) | Real anchor **element** captured at load time; binary-searched, restored before paint |
| At-bottom state | Callback + internal flags mutated from three competing effects | Single source of truth; `useSyncExternalStore` subscription, notified only on flips |
| Streaming growth | ResizeObserver writes `scrollTop` racing the scroll handler | ResizeObserver is the only growth authority; programmatic writes are echo-filtered out of intent detection |
| Re-renders | Any consumer re-renders on prop churn | Zero renders per scroll/stream tick anywhere in the tree |

## Migration from `ReverseInfiniteScroll`

```tsx
// before
<ReverseInfiniteScroll onLoadOlder={f} hasMore={hasMore} isLoading={isLoading}>{rows}</ReverseInfiniteScroll>

// after
<Chat.Root onLoadOlder={f} hasMore={hasMore} isLoading={isLoading}>
  <Chat.Viewport className="h-full w-full">
    <Chat.Content className="flex w-full flex-col">
      {isLoading && <YourLoader />} {/* the loader is yours now (headless) */}
      {rows}
    </Chat.Content>
  </Chat.Viewport>
</Chat.Root>
```

Prop names (`onLoadOlder`, `hasMore`, `isLoading`, `autoScrollThreshold`, `loadThreshold`, `behavior`, `onAtBottomChange`) and the ref surface (`scrollToBottom`, `isAtBottom`) are unchanged; `getHTMLElement()` is now `getViewport()`.
