"use client";

import React, {
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useLayoutEffect,
} from "react";
import { clsx } from "clsx";
import { LoadingIndicator } from "../loadingIndicator";

export interface ReverseInfiniteScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Triggered when the scroll hits the top boundary and hasMore is true */
  onLoadOlder: () => void | Promise<void>;
  /** Indicates if older history is available */
  hasMore: boolean;
  /** Loading state for historical messages */
  isLoading: boolean;
  /** Custom loader element displayed at the top */
  loader?: React.ReactNode;
  /** Distance threshold (px) from bottom to determine if auto-scroll should activate */
  autoScrollThreshold?: number;
  /** Distance threshold (px) from top to trigger the load older event */
  loadThreshold?: number;
  /** Callback triggered when user crosses the bottom boundary (true = at bottom, false = scrolled up) */
  onAtBottomChange?: (isAtBottom: boolean) => void;
  /** Scroll behavior when jumping to bottom */
  behavior?: "smooth" | "instant";
  /** Optional class for the scrollable container viewport */
  viewportClassName?: string;
}

export interface ReverseInfiniteScrollRef {
  /** Programmatically force scroll container to the absolute bottom */
  scrollToBottom: (behavior?: "smooth" | "instant") => void;
  /** Programmatically retrieve the current raw HTML Element */
  getHTMLElement: () => HTMLDivElement | null;
  /** Direct query if the viewport is currently scrolled to the bottom */
  isAtBottom: () => boolean;
}

// Hoisted so the container doesn't allocate a fresh style object every render.
// Overrides browser scroll anchoring so we can apply our own precise offsets.
const VIEWPORT_STYLE: React.CSSProperties = { overflowAnchor: "none" };

export const ReverseInfiniteScroll = forwardRef<
  ReverseInfiniteScrollRef,
  ReverseInfiniteScrollProps
>(
  (
    {
      children,
      onLoadOlder,
      hasMore,
      isLoading,
      loader,
      autoScrollThreshold = 120,
      loadThreshold = 50,
      onAtBottomChange,
      behavior = "instant",
      className,
      viewportClassName,
      ...props
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // All positional/loading bookkeeping lives in a ref: none of it is rendered,
    // so keeping it out of React state avoids re-rendering the (potentially large)
    // children list on every scroll tick.
    const scrollStateRef = useRef({
      previousScrollHeight: 0,
      previousScrollTop: 0,
      isAtBottom: true,
      isLoadingOlder: false,
    });

    // Sync loading state inside ref for callback processing
    useEffect(() => {
      scrollStateRef.current.isLoadingOlder = isLoading;
    }, [isLoading]);

    // Notify the parent only when the bottom-boundary status actually flips.
    const updateAtBottomState = useCallback(
      (newStatus: boolean) => {
        const state = scrollStateRef.current;
        if (state.isAtBottom !== newStatus) {
          state.isAtBottom = newStatus;
          onAtBottomChange?.(newStatus);
        }
      },
      [onAtBottomChange],
    );

    const scrollToBottom = useCallback(
      (forcedBehavior?: "smooth" | "instant") => {
        const el = containerRef.current;
        if (!el) return;

        // Clamp: when content is shorter than the viewport this is negative,
        // which would otherwise poison the prepend/append anchoring math.
        const targetScrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
        el.scrollTo({
          top: targetScrollTop,
          behavior: forcedBehavior || behavior,
        });

        const state = scrollStateRef.current;
        // Order matches the original: mark docked *before* the boundary check so
        // updateAtBottomState short-circuits here and lets the follow-up scroll
        // events drive the onAtBottomChange notification.
        state.isAtBottom = true;
        state.previousScrollTop = targetScrollTop;
        state.previousScrollHeight = el.scrollHeight;
        updateAtBottomState(true);
      },
      [behavior, updateAtBottomState],
    );

    // Expose api methods programmatically to parent components
    useImperativeHandle(
      ref,
      () => ({
        scrollToBottom: (customBehavior) => scrollToBottom(customBehavior),
        getHTMLElement: () => containerRef.current,
        isAtBottom: () => scrollStateRef.current.isAtBottom,
      }),
      [scrollToBottom],
    );

    // Scroll Observer: monitors bounds without causing full component re-renders.
    // Reads are synchronous (cheap during a scroll frame) and, crucially, capture
    // the pre-mutation snapshot the anchoring layout effect depends on.
    const handleScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const { scrollTop, scrollHeight, clientHeight } = el;
        const state = scrollStateRef.current;

        // Update current positional states to prevent stale calculations
        state.previousScrollTop = scrollTop;
        state.previousScrollHeight = scrollHeight;

        const currentAtBottom =
          scrollHeight - clientHeight - scrollTop <= autoScrollThreshold;
        updateAtBottomState(currentAtBottom);

        // Trigger infinite loading only when the user genuinely scrolled up to
        // the top of an *overflowing* list. When content is shorter than the
        // viewport, scrollTop stays pinned at 0 (top === bottom), so without this
        // guard any programmatic bottom-pin would spuriously fire onLoadOlder.
        const isScrollable = scrollHeight > clientHeight;
        if (
          isScrollable &&
          scrollTop <= loadThreshold &&
          hasMore &&
          !state.isLoadingOlder
        ) {
          // Prevent multiple calls
          state.isLoadingOlder = true;
          onLoadOlder();
        }
      },
      [autoScrollThreshold, loadThreshold, hasMore, onLoadOlder, updateAtBottomState],
    );

    // Adjust scroll offsets following child changes (Prepends/Appends).
    // Uses the snapshot captured synchronously by handleScroll (the last scroll
    // position *before* this DOM mutation), then re-syncs it to the post-mutation
    // layout so the ResizeObserver/next scroll tick compares against fresh values.
    useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const state = scrollStateRef.current;
      const { previousScrollHeight, previousScrollTop, isAtBottom } = state;

      const currentScrollHeight = container.scrollHeight;
      const heightDifference = currentScrollHeight - previousScrollHeight;

      if (heightDifference > 0) {
        // SCENARIO B (checked first): user is docked at the bottom, so a new
        // message (append) — or growth in a not-yet-overflowing list — pins to
        // the bottom. Taking this first prevents a short list, where the user is
        // simultaneously at the top and the bottom, from being treated as a prepend.
        if (isAtBottom) {
          container.scrollTop = currentScrollHeight - container.clientHeight;
        }
        // SCENARIO A: items were prepended at the top while scrolled up — hold
        // the viewer's position by offsetting for the newly inserted height.
        else if (previousScrollTop <= loadThreshold + 10) {
          container.scrollTop = previousScrollTop + heightDifference;
        }
      } else if (isAtBottom) {
        // Automatically pin to bottom if layout shrank but user is docked
        container.scrollTop = currentScrollHeight - container.clientHeight;
      }

      // Keep the snapshot aligned with the committed layout.
      state.previousScrollHeight = container.scrollHeight;
      state.previousScrollTop = container.scrollTop;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [children]);

    // Handle dynamically resized nodes (e.g. streaming tokens, nested images loading inside cards)
    useEffect(() => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;

      const observer = new ResizeObserver(() => {
        const state = scrollStateRef.current;
        const { previousScrollHeight, previousScrollTop, isAtBottom } = state;

        // MATHEMATICAL ANCHORING:
        // Calculate if we were docked at the bottom of the container *prior* to this resizing tick.
        // This prevents race-conditions with asynchronous scroll events that lag behind rapid DOM height expansions.
        const wasNearBottom =
          previousScrollHeight - container.clientHeight - previousScrollTop <=
          autoScrollThreshold;

        if (isAtBottom || wasNearBottom) {
          const newScrollTop = container.scrollHeight - container.clientHeight;
          container.scrollTop = newScrollTop;

          // Sync refs immediately to ensure the next observation tick has updated context
          state.previousScrollHeight = container.scrollHeight;
          state.previousScrollTop = newScrollTop;
          state.isAtBottom = true;
        }
      });

      observer.observe(content);
      return () => observer.disconnect();
    }, [autoScrollThreshold]);

    // Backfill headroom: when the list is too short to overflow the viewport
    // yet more history exists, proactively load older pages. Without this the
    // user has no room to scroll up, so the top-threshold trigger in
    // handleScroll can never fire. This runs after each settle (children /
    // hasMore / isLoading change) until the viewport fills or hasMore is false.
    // It is the disjoint counterpart to handleScroll, which only loads once the
    // list is actually scrollable.
    useEffect(() => {
      const container = containerRef.current;
      if (!container || !hasMore || isLoading) return;
      if (scrollStateRef.current.isLoadingOlder) return;

      const isOverflowing = container.scrollHeight > container.clientHeight;
      if (!isOverflowing) {
        scrollStateRef.current.isLoadingOlder = true;
        onLoadOlder();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [children, hasMore, isLoading]);

    // Initial positioning on mount
    useEffect(() => {
      scrollToBottom("instant");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={clsx(
          "flex flex-col overflow-y-auto h-full w-full outline-none",
          viewportClassName,
        )}
        style={VIEWPORT_STYLE}
        {...props}
      >
        <div
          ref={contentRef}
          className={clsx("flex flex-col w-full", className)}
        >
          {/* Header/Loader Area */}
          {hasMore && (
            <div className="flex w-full items-center justify-center py-4 min-h-12">
              {isLoading ? (
                loader || (
                  <LoadingIndicator variant="material-morph-background" />
                )
              ) : (
                <div className="h-px bg-transparent w-full" />
              )}
            </div>
          )}

          {/* Main Message Flow Area */}
          {children}
        </div>
      </div>
    );
  },
);

ReverseInfiniteScroll.displayName = "ReverseInfiniteScroll";
