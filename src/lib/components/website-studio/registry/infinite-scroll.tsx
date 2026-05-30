import React, { useState, useEffect } from "react";
import { InfiniteScroll } from "../../infinite-scroll";
import { Item, ItemContent, ItemTitle, ItemDescription, ItemMedia } from "../../item";
import { Avatar } from "../../avatar";
import type { RegistryComponent } from "../types";

export const InfiniteScrollConfig: RegistryComponent = {
  name: "Infinite Scroll Feed",
  category: "Layout",
  render: ({ endMessage, ...props }) => {
    const [items, setItems] = useState<number[]>([1, 2, 3, 4, 5]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadMore = () => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);

      setTimeout(() => {
        setItems((prev) => {
          const next = [...prev, prev.length + 1, prev.length + 2, prev.length + 3];
          if (next.length >= 14) setHasMore(false);
          return next;
        });
        setIsLoading(false);
      }, 1500);
    };

    return (
      <div className="w-full max-w-md h-[400px] border border-outline-variant/50 rounded-2xl bg-surface-container overflow-y-auto" {...props}>
        <InfiniteScroll
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={loadMore}
          endMessage={endMessage}
          className="p-4 gap-3 flex flex-col"
        >
          {items.map((i) => (
            <Item key={i} variant="secondary" shape="minimal" padding="sm" className="shadow-sm">
              <ItemMedia variant="avatar"><Avatar fallback={`U${i}`} /></ItemMedia>
              <ItemContent>
                <ItemTitle>Generated User {i}</ItemTitle>
                <ItemDescription>Auto-loaded from infinite scroll feed.</ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </InfiniteScroll>
      </div>
    );
  },
  controls: {
    endMessage: {
      type: "text",
      label: "End of Feed Message",
      defaultValue: "You have seen all the items!",
      group: "Content",
      supportsCMS: true,
    },
  },
};
