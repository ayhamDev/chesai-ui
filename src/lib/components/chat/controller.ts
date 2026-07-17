/**
 * Framework-agnostic scroll controller for the headless Chat component.
 *
 * Design goals (and how they differ from `reverse-infinite-scroll`):
 *
 * - Zero React renders per scroll/stream tick. Every piece of positional
 *   bookkeeping lives in plain fields on this class. React only re-renders
 *   where a component explicitly subscribes (via `useSyncExternalStore`) and
 *   only when the subscribed value actually flips.
 * - Native, passive event listeners bound once. No synthetic-event dispatch
 *   through the React tree on every scroll frame, and no listener rebinding
 *   when props change (callbacks are read through a mutable options object).
 * - Prepend anchoring is done by tracking a real anchor *element* captured at
 *   load time, not by diffing `scrollHeight`. Height diffing cannot tell a
 *   prepend from an append, which is the root correctness/perf bug of the old
 *   component (it re-ran a layout effect keyed on `children` every render).
 * - All programmatic scroll writes happen inside ResizeObserver callbacks or
 *   rAF ticks, i.e. before paint, so pinning and anchoring are flicker-free.
 * - User intent (escaping the bottom lock) is detected from input events
 *   (wheel/touch) plus a programmatic-write echo filter, never by comparing
 *   racy React state snapshots.
 */

export type ChatScrollBehavior = 'smooth' | 'instant'

export interface ChatControllerOptions {
  /** Distance (px) from the bottom within which the viewport counts as "at bottom". */
  autoScrollThreshold: number
  /** Distance (px) from the top at which `onLoadOlder` fires. */
  loadThreshold: number
  /** How the viewport follows new content while pinned to the bottom. */
  behavior: ChatScrollBehavior
  /** Whether older history exists. Gates `onLoadOlder`. */
  hasMore: boolean
  /** Parent-owned loading state for older history. */
  isLoading: boolean
  /** Fired when the viewport reaches the top threshold (or needs backfill). */
  onLoadOlder?: () => void | Promise<void>
  /** Fired only when the at-bottom state actually flips. */
  onAtBottomChange?: (atBottom: boolean) => void
}

export const CHAT_DEFAULT_OPTIONS: ChatControllerOptions = {
  autoScrollThreshold: 100,
  loadThreshold: 80,
  behavior: 'instant',
  hasMore: false,
  isLoading: false,
}

/** Grace window (ms) after a load ends during which prepend anchoring stays active. */
const ANCHOR_GRACE_MS = 400
/** Time constant (ms) of the exponential approach used by smooth sticking. */
const SMOOTH_TAU_MS = 90
/** Minimum smooth-scroll speed in px/ms so long distances never crawl. */
const SMOOTH_MIN_SPEED = 0.4

interface AnchorState {
  el: Element
  /** The anchor's top edge relative to the viewport's top edge, to be preserved. */
  top: number
  /** Fallback bookkeeping if the anchor element gets removed (virtualization). */
  scrollHeight: number
  scrollTop: number
}

export class ChatController {
  readonly options: ChatControllerOptions = { ...CHAT_DEFAULT_OPTIONS }

  private viewport: HTMLElement | null = null
  private content: HTMLElement | null = null

  /** True while the viewport should follow appended content. */
  private pinned = true
  /** Reactive mirror of "within autoScrollThreshold of the bottom". */
  private atBottom = true

  private lastScrollTop = 0
  private lastScrollHeight = 0
  /** Last scrollTop written programmatically; used to filter echo scroll events. */
  private lastSetScrollTop: number | null = null

  private loadingOlder = false
  private anchor: AnchorState | null = null
  private anchorExpiry = 0
  /** True when the current load was triggered synchronously with no isLoading signal. */
  private untrackedLoad = false

  private raf: number | null = null
  private lastFrameTime = 0

  private observer: ResizeObserver | null = null
  private touchStartY = 0
  private listeners = new Set<() => void>()
  private detachFns: Array<() => void> = []

  // ---------------------------------------------------------------- reactive

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getAtBottom = (): boolean => this.atBottom

  /** Stable imperative surface handed out through context and refs. */
  readonly api = {
    scrollToBottom: (behavior?: ChatScrollBehavior) => this.scrollToBottom(behavior),
    isAtBottom: () => this.isAtBottom(),
    getViewport: () => this.getViewport(),
  }

  // ------------------------------------------------------------------ public

  setOptions(next: Partial<ChatControllerOptions>): void {
    const wasLoading = this.options.isLoading
    const hadMore = this.options.hasMore
    Object.assign(this.options, next)
    if (wasLoading && !this.options.isLoading) {
      // Parent finished loading older history: keep the anchor alive for a
      // short grace window so the prepend commit (which may land a frame
      // later) is still position-corrected.
      this.loadingOlder = false
      this.anchorExpiry = now() + ANCHOR_GRACE_MS
    }
    if (!wasLoading && this.options.isLoading) {
      // Parent started loading on its own (without our trigger): capture an
      // anchor so the upcoming prepend is corrected too.
      this.loadingOlder = true
      this.untrackedLoad = false
      if (!this.anchor) this.captureAnchor()
    }
    // Only re-check backfill on transitions that can newly enable it. This
    // method runs on every Root render; an unconditional check would force a
    // layout read per streamed token. Content growth is covered by the
    // ResizeObserver path instead.
    if ((!hadMore && this.options.hasMore) || (wasLoading && !this.options.isLoading)) {
      this.checkBackfill()
    }
  }

  setViewport(el: HTMLElement | null): void {
    if (el === this.viewport) return
    this.detach()
    this.viewport = el
    if (el) this.attach(el)
  }

  setContent(el: HTMLElement | null): void {
    if (el === this.content) return
    if (this.observer && this.content) this.observer.unobserve(this.content)
    this.content = el
    if (this.observer && el) this.observer.observe(el)
  }

  getViewport(): HTMLElement | null {
    return this.viewport
  }

  isAtBottom(): boolean {
    return this.atBottom
  }

  scrollToBottom(behavior?: ChatScrollBehavior): void {
    const el = this.viewport
    if (!el) return
    this.pinned = true
    this.anchor = null
    if ((behavior ?? this.options.behavior) === 'smooth') {
      this.startSmoothScroll()
    } else {
      this.writeScrollTop(el.scrollHeight - el.clientHeight)
    }
    this.setAtBottom(true)
  }

  // ----------------------------------------------------------------- attach

  private attach(el: HTMLElement): void {
    const onScroll = () => this.handleScroll()
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0 && this.isScrollable()) this.escapePin()
    }
    const onTouchStart = (e: TouchEvent) => {
      this.touchStartY = e.touches[0]?.clientY ?? 0
    }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? 0
      // Finger moving down drags the content down, i.e. scrolls up.
      if (y > this.touchStartY + 8 && this.isScrollable()) this.escapePin()
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('wheel', onWheel, { passive: true })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    this.detachFns.push(() => {
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
    })

    if (typeof ResizeObserver !== 'undefined') {
      // ResizeObserver callbacks run after layout but before paint, so the
      // scrollTop corrections below are never visible as a flicker.
      this.observer = new ResizeObserver(() => this.handleLayout())
      this.observer.observe(el)
      const content = this.content ?? el.firstElementChild
      if (content instanceof HTMLElement) {
        if (!this.content) this.content = content
        this.observer.observe(content)
      } else if (process.env.NODE_ENV !== 'production' && !this.content) {
        console.warn(
          '[chesai-ui Chat] No content element found inside <Chat.Viewport>. ' +
            'Render <Chat.Content> (or any element) as its child so streaming growth can be observed.',
        )
      }
      this.detachFns.push(() => {
        this.observer?.disconnect()
        this.observer = null
      })
    }

    // Start docked at the bottom, mirroring a freshly opened conversation.
    this.pinned = true
    this.writeScrollTop(el.scrollHeight - el.clientHeight)
    this.lastScrollHeight = el.scrollHeight
    this.setAtBottom(true)
    this.checkBackfill()
  }

  private detach(): void {
    this.cancelSmoothScroll()
    for (const fn of this.detachFns) fn()
    this.detachFns = []
    this.anchor = null
    this.lastSetScrollTop = null
  }

  /** Full teardown (React strict-mode safe: a new attach reinitializes). */
  destroy(): void {
    this.detach()
    this.viewport = null
    this.listeners.clear()
  }

  // ----------------------------------------------------------------- events

  private handleScroll(): void {
    const el = this.viewport
    if (!el) return
    const scrollTop = el.scrollTop
    const distance = el.scrollHeight - el.clientHeight - scrollTop

    const isEcho = this.lastSetScrollTop !== null && Math.abs(scrollTop - this.lastSetScrollTop) <= 1
    if (isEcho) {
      this.lastSetScrollTop = null
    } else if (scrollTop < this.lastScrollTop - 1) {
      // User moved up (scrollbar drag, keyboard, etc.): release the lock.
      this.escapePin()
    } else if (distance <= this.options.autoScrollThreshold) {
      // User moved down into the bottom zone: re-engage the lock.
      this.pinned = true
    }

    this.lastScrollTop = scrollTop
    this.lastScrollHeight = el.scrollHeight
    this.setAtBottom(distance <= this.options.autoScrollThreshold)
    this.maybeLoadOlder(scrollTop)
  }

  /** Content or viewport resized (streaming tokens, images, keyboard, window). */
  private handleLayout(): void {
    const el = this.viewport
    if (!el) return
    const grew = el.scrollHeight !== this.lastScrollHeight
    if (this.pinned) {
      if (this.options.behavior === 'smooth') this.startSmoothScroll()
      else this.writeScrollTop(el.scrollHeight - el.clientHeight)
    } else if (this.anchor && grew) {
      this.applyAnchor()
    }
    // A sync, untracked load has no end signal: close it on its growth tick
    // (also reached while pinned, where anchoring never runs) so backfill and
    // top-threshold loading can fire again.
    if (grew && this.untrackedLoad) this.endLoad()
    this.lastScrollTop = el.scrollTop
    this.lastScrollHeight = el.scrollHeight
    this.setAtBottom(el.scrollHeight - el.clientHeight - el.scrollTop <= this.options.autoScrollThreshold)
    this.checkBackfill()
  }

  private escapePin(): void {
    this.pinned = false
    this.cancelSmoothScroll()
  }

  // ------------------------------------------------------------- load older

  private maybeLoadOlder(scrollTop: number): void {
    if (
      this.isScrollable() &&
      scrollTop <= this.options.loadThreshold &&
      this.options.hasMore &&
      !this.loadingOlder &&
      !this.options.isLoading
    ) {
      this.triggerLoadOlder()
    }
  }

  /**
   * When the list is too short to overflow yet more history exists, the top
   * threshold can never be reached by scrolling — proactively backfill.
   */
  private checkBackfill(): void {
    const el = this.viewport
    if (!el || !this.options.hasMore || this.options.isLoading || this.loadingOlder) return
    if (!this.isScrollable()) this.triggerLoadOlder()
  }

  private triggerLoadOlder(): void {
    this.loadingOlder = true
    this.captureAnchor()
    const result = this.options.onLoadOlder?.()
    if (result && typeof result.then === 'function') {
      this.untrackedLoad = false
      result.then(this.endLoad, this.endLoad)
    } else {
      // Synchronous trigger with no promise: if the parent also never toggles
      // `isLoading`, close the load cycle after the first anchored growth.
      this.untrackedLoad = true
    }
  }

  private endLoad = (): void => {
    if (this.options.isLoading) return // parent will end it via setOptions
    this.loadingOlder = false
    this.untrackedLoad = false
    this.anchorExpiry = now() + ANCHOR_GRACE_MS
    // The freshly loaded page may still leave the viewport unfilled.
    this.checkBackfill()
  }

  // -------------------------------------------------------------- anchoring

  /**
   * Capture the first content child intersecting the viewport's top edge.
   * Children are vertically ordered, so a binary search keeps this to a
   * handful of rect reads even for thousand-message histories.
   */
  private captureAnchor(): void {
    const el = this.viewport
    const content = this.content
    if (!el || !content) return
    const children = content.children
    if (children.length === 0) {
      this.anchor = null
      return
    }
    const viewportTop = el.getBoundingClientRect().top
    let lo = 0
    let hi = children.length - 1
    let found = children.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (children[mid].getBoundingClientRect().bottom > viewportTop) {
        found = mid
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    }
    const anchorEl = children[found]
    this.anchor = {
      el: anchorEl,
      top: anchorEl.getBoundingClientRect().top - viewportTop,
      scrollHeight: el.scrollHeight,
      scrollTop: el.scrollTop,
    }
  }

  /**
   * Restore the anchor element to its captured offset. Because this keys off a
   * real element, growth from a simultaneous streaming append below the
   * viewport does not shift the reader's position (a scrollHeight diff would).
   */
  private applyAnchor(): void {
    const el = this.viewport
    const anchor = this.anchor
    if (!el || !anchor) return

    const active = this.loadingOlder || now() < this.anchorExpiry
    if (!active) {
      this.anchor = null
      return
    }

    if (anchor.el.isConnected) {
      const newTop = anchor.el.getBoundingClientRect().top - el.getBoundingClientRect().top
      const delta = newTop - anchor.top
      if (delta !== 0) this.writeScrollTop(el.scrollTop + delta)
    } else {
      // Anchor was unmounted (e.g. virtualization): fall back to preserving
      // the distance-from-top via the height delta since capture.
      const delta = el.scrollHeight - anchor.scrollHeight
      if (delta > 0) this.writeScrollTop(anchor.scrollTop + delta)
      this.anchor = null
    }
  }

  // -------------------------------------------------------------- scrolling

  private isScrollable(): boolean {
    const el = this.viewport
    return !!el && el.scrollHeight > el.clientHeight
  }

  private writeScrollTop(value: number): void {
    const el = this.viewport
    if (!el) return
    el.scrollTop = value
    // Read back the browser-clamped value so echo detection stays exact.
    this.lastSetScrollTop = el.scrollTop
    this.lastScrollTop = el.scrollTop
  }

  /**
   * rAF-driven exponential approach toward the (continuously re-read) bottom.
   * Native `scrollTo({behavior: "smooth"})` restarts and stutters when the
   * target moves every frame, which is exactly what token streaming does —
   * this loop simply retargets each frame instead.
   */
  private startSmoothScroll(): void {
    if (this.raf !== null || !this.viewport) return
    this.lastFrameTime = now()
    const step = () => {
      this.raf = null
      const el = this.viewport
      if (!el || !this.pinned) return
      const target = el.scrollHeight - el.clientHeight
      const dist = target - el.scrollTop
      if (Math.abs(dist) <= 1) {
        this.writeScrollTop(target)
        return
      }
      const t = now()
      const dt = Math.min(Math.max(t - this.lastFrameTime, 1), 64)
      this.lastFrameTime = t
      const eased = dist * (1 - Math.exp(-dt / SMOOTH_TAU_MS))
      const minStep = Math.sign(dist) * Math.min(Math.abs(dist), SMOOTH_MIN_SPEED * dt)
      const move = Math.abs(eased) > Math.abs(minStep) ? eased : minStep
      this.writeScrollTop(el.scrollTop + move)
      this.raf = requestAnimationFrame(step)
    }
    this.raf = requestAnimationFrame(step)
  }

  private cancelSmoothScroll(): void {
    if (this.raf !== null) {
      cancelAnimationFrame(this.raf)
      this.raf = null
    }
  }

  // ------------------------------------------------------------------ state

  private setAtBottom(next: boolean): void {
    if (this.atBottom === next) return
    this.atBottom = next
    this.options.onAtBottomChange?.(next)
    for (const listener of this.listeners) listener()
  }
}

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}
