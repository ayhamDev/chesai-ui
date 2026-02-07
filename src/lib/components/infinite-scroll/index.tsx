"use client";

import { clsx } from "clsx";
import React, { useEffect, useRef } from "react";
import { LoadingIndicator } from "../loadingIndicator";
import { Typography } from "../typography";

export interface InfiniteScrollProps {
  /** The content to be rendered (list items, grid items, etc.). */
  children: React.ReactNode;
  /** Function to call when the bottom of the list is reached. */
  onLoadMore: () => void | Promise<void>;
  /** Whether there are more items to load. */
  hasMore: boolean;
  /** Whether a fetch request is currently in progress. */
  isLoading: boolean;
  /** Custom loader component to display while loading. */
  loader?: React.ReactNode;
  /** Message to display when there are no more items to load. */
  endMessage?: React.ReactNode;
  /**
   * The root element to use as the viewport for checking visibility.
   * If null, defaults to the browser viewport.
   * Pass a ref.current here if using a custom scroll container.
   */
  root?: HTMLElement | null;
  /** Margin around the root. Can be used to trigger load before reaching the exact bottom. */
  rootMargin?: string;
  className?: string;
}

export const InfiniteScroll = ({
  children,
  onLoadMore,
  hasMore,
  isLoading,
  loader,
  endMessage,
  root = null,
  rootMargin = "100px",
  className,
}: InfiniteScrollProps) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    // Do not observe if we are already loading or if there is no more data
    // However, we must keep the hook order consistent, so the logic is inside the callback or effect dependency
    if (isLoading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root,
        rootMargin,
        threshold: 0.1,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, onLoadMore, root, rootMargin]);

  return (
    <div className={clsx("flex flex-col", className)}>
      {children}

      {/* Sentry Element - Hidden div to detect scroll position */}
      <div ref={observerTarget} className="h-px w-full bg-transparent" />

      {/* Loading State */}
      {isLoading && (
        <div className="flex w-full justify-center p-4">
          {loader || <LoadingIndicator variant="material-morph-background" />}
        </div>
      )}

      {/* End Message */}
      {!hasMore && endMessage && (
        <div className="flex w-full justify-center p-4 text-center">
          {typeof endMessage === "string" ? (
            // Changed variant="muted" to "body-small"
            <Typography
              variant="body-small"
              className="text-on-surface-variant"
            >
              {endMessage}
            </Typography>
          ) : (
            endMessage
          )}
        </div>
      )}
    </div>
  );
};

InfiniteScroll.displayName = "InfiniteScroll";
