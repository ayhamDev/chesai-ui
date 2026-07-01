"use client";

import React, {
  useEffect,
  useRef,
  useState,
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

    // Tracking internal dimensions & states inside refs to avoid re-rendering
    const scrollStateRef = useRef({
      previousScrollHeight: 0,
      previousScrollTop: 0,
      isAtBottom: true,
      isLoadingOlder: false,
    });

    const [isAtBottomState, setIsAtBottomState] = useState(true);

    // Sync loading state inside ref for callback processing
    useEffect(() => {
      scrollStateRef.current.isLoadingOlder = isLoading;
    }, [isLoading]);

    // Check if container is scrolled within the bottom threshold
    const checkIsAtBottom = (el: HTMLDivElement): boolean => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      return scrollHeight - clientHeight - scrollTop <= autoScrollThreshold;
    };

    const scrollToBottom = (forcedBehavior?: "smooth" | "instant") => {
      const el = containerRef.current;
      if (!el) return;

      const targetScrollTop = el.scrollHeight - el.clientHeight;
      el.scrollTo({
        top: targetScrollTop,
        behavior: forcedBehavior || behavior,
      });

      scrollStateRef.current.isAtBottom = true;
      updateAtBottomState(true);
    };

    const updateAtBottomState = (newStatus: boolean) => {
      if (scrollStateRef.current.isAtBottom !== newStatus) {
        scrollStateRef.current.isAtBottom = newStatus;
        setIsAtBottomState(newStatus);
        onAtBottomChange?.(newStatus);
      }
    };

    // Expose api methods programmatically to parent components
    useImperativeHandle(ref, () => ({
      scrollToBottom: (customBehavior) => scrollToBottom(customBehavior),
      getHTMLElement: () => containerRef.current,
      isAtBottom: () => scrollStateRef.current.isAtBottom,
    }));

    // Scroll Observer: monitors bounds without causing full component re-renders
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const { scrollTop, scrollHeight } = el;

      // Update current positional states to prevent stale calculations
      scrollStateRef.current.previousScrollTop = scrollTop;
      scrollStateRef.current.previousScrollHeight = scrollHeight;

      const currentAtBottom = checkIsAtBottom(el);
      updateAtBottomState(currentAtBottom);

      // Trigger infinite loading when hitting top threshold
      if (
        scrollTop <= loadThreshold &&
        hasMore &&
        !scrollStateRef.current.isLoadingOlder
      ) {
        // Prevent multiple calls
        scrollStateRef.current.isLoadingOlder = true;
        onLoadOlder();
      }
    };

    // 1. Capture scroll heights immediately prior to DOM updates
    useLayoutEffect(() => {
      const container = containerRef.current;
      if (container) {
        scrollStateRef.current.previousScrollHeight = container.scrollHeight;
        scrollStateRef.current.previousScrollTop = container.scrollTop;
      }
    });

    // 2. Adjust scroll offsets following child changes (Prepends/Appends)
    useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const { previousScrollHeight, previousScrollTop, isAtBottom } =
        scrollStateRef.current;

      const currentScrollHeight = container.scrollHeight;
      const heightDifference = currentScrollHeight - previousScrollHeight;

      if (heightDifference > 0) {
        // SCENARIO A: Items were loaded and prepended at the top
        if (previousScrollTop <= loadThreshold + 10) {
          container.scrollTop = previousScrollTop + heightDifference;
        }
        // SCENARIO B: A new message arrived at the bottom
        else if (isAtBottom) {
          container.scrollTop = currentScrollHeight - container.clientHeight;
        }
      } else if (isAtBottom) {
        // Automatically pin to bottom if layout shrank but user is docked
        container.scrollTop = currentScrollHeight - container.clientHeight;
      }
    }, [children]);

    // Handle dynamically resized nodes (e.g. streaming tokens, nested images loading inside cards)
    useEffect(() => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;

      const observer = new ResizeObserver(() => {
        const { previousScrollHeight, previousScrollTop, isAtBottom } =
          scrollStateRef.current;

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
          scrollStateRef.current.previousScrollHeight = container.scrollHeight;
          scrollStateRef.current.previousScrollTop = newScrollTop;
          scrollStateRef.current.isAtBottom = true;
          setIsAtBottomState(true);
        }
      });

      observer.observe(content);
      return () => observer.disconnect();
    }, [autoScrollThreshold]);

    // Initial positioning on mount
    useEffect(() => {
      scrollToBottom("instant");
    }, []);

    return (
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={clsx(
          "flex flex-col overflow-y-auto h-full w-full outline-none",
          viewportClassName,
        )}
        style={{
          overflowAnchor: "none", // Override browser anchoring to allow custom precision offsets
        }}
        {...props}
      >
        <div
          ref={contentRef}
          className={clsx("flex flex-col w-full", className)}
        >
          {/* Header/Loader Area */}
          {hasMore && (
            <div className="flex w-full items-center justify-center py-4 min-h-[48px]">
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
