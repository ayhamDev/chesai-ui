import type { Meta, StoryObj } from "@storybook/react";
import { useRef, useState } from "react";
import { Avatar } from "../avatar";
import { Card } from "../card";
import { ElasticScrollArea } from "../elastic-scroll-area";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../item";
import { Typography } from "../typography";
import { InfiniteScroll } from "./index";

const meta: Meta<typeof InfiniteScroll> = {
  title: "Components/Data/InfiniteScroll",
  component: InfiniteScroll,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A wrapper component that triggers a callback when the user scrolls to the bottom of the content. Uses `IntersectionObserver` for high performance.",
      },
    },
  },
  argTypes: {
    onLoadMore: { action: "load more triggered" },
    hasMore: { control: "boolean" },
    isLoading: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof InfiniteScroll>;

// --- MOCK DATA HELPER ---
const generateData = (start: number, count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: start + i,
    name: `User ${start + i + 1}`,
    email: `user${start + i + 1}@example.com`,
  }));
};

export const WindowScroll: Story = {
  name: "1. Window Scroll (Default)",
  parameters: {
    docs: {
      description: {
        story:
          "By default, the component listens to the window scroll. Scroll down the page to see more items load.",
      },
    },
  },
  render: function Render() {
    const [items, setItems] = useState(() => generateData(0, 15));
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadMore = async () => {
      if (isLoading) return;
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setItems((prev) => [...prev, ...generateData(prev.length, 10)]);
      setIsLoading(false);

      // Stop after 50 items
      if (items.length >= 40) {
        setHasMore(false);
      }
    };

    return (
      <div className="max-w-md mx-auto border border-graphite-border rounded-xl bg-graphite-background">
        <div className="p-4 border-b border-graphite-border bg-graphite-card rounded-t-xl sticky top-0 z-10">
          <Typography variant="title-small">User Directory</Typography>
        </div>
        <InfiniteScroll
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={loadMore}
          endMessage="You have seen it all!"
          className="p-4 gap-3"
        >
          {items.map((item) => (
            <Card
              key={item.id}
              variant="secondary"
              shape="minimal"
              padding="sm"
            >
              <div className="flex items-center gap-3">
                <Avatar fallback={item.name.slice(0, 2)} />
                <div>
                  <Typography variant="body-small" className="font-bold">
                    {item.name}
                  </Typography>
                  <Typography variant="body-small" muted={true}>
                    {item.email}
                  </Typography>
                </div>
              </div>
            </Card>
          ))}
        </InfiniteScroll>
      </div>
    );
  },
};

export const InsideContainer: Story = {
  name: "2. Inside Fixed Container",
  parameters: {
    docs: {
      description: {
        story:
          "To use inside a fixed-height container, pass the container's ref to the `root` prop.",
      },
    },
  },
  render: function Render() {
    const [items, setItems] = useState(() => generateData(0, 10));
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // 1. Create a ref for the scrollable container
    const containerRef = useRef<HTMLDivElement>(null);

    const loadMore = async () => {
      if (isLoading) return;
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setItems((prev) => [...prev, ...generateData(prev.length, 5)]);
      setIsLoading(false);
      if (items.length >= 30) setHasMore(false);
    };

    return (
      <div
        ref={containerRef}
        className="h-[400px] w-80 overflow-y-auto border-2 border-graphite-border rounded-xl bg-white"
      >
        <InfiniteScroll
          // 2. Pass the ref to the component
          root={containerRef.current}
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={loadMore}
          endMessage="End of list"
          className="p-2 gap-2"
        >
          {items.map((item) => (
            <Item key={item.id} variant="ghost" shape="minimal">
              <ItemMedia variant="avatar">
                <Avatar fallback={item.name.slice(0, 1)} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{item.name}</ItemTitle>
                <ItemDescription>ID: {item.id}</ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </InfiniteScroll>
      </div>
    );
  },
};

export const WithElasticScrollArea: Story = {
  name: "3. With ElasticScrollArea",
  parameters: {
    docs: {
      description: {
        story:
          "Integrating with `ElasticScrollArea` requires accessing its internal viewport ref. Since `ElasticScrollArea` forwards its ref to the viewport, you can simply pass that ref to `InfiniteScroll`.",
      },
    },
  },
  render: function Render() {
    const [items, setItems] = useState(() => generateData(0, 10));
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Ref for ElasticScrollArea
    const viewportRef = useRef<HTMLDivElement>(null);

    const loadMore = async () => {
      if (isLoading) return;
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setItems((prev) => [...prev, ...generateData(prev.length, 5)]);
      setIsLoading(false);
      if (items.length >= 25) setHasMore(false);
    };

    return (
      <div className="h-[500px] w-96 border-2 border-graphite-border rounded-xl shadow-lg overflow-hidden bg-graphite-background">
        <ElasticScrollArea
          ref={viewportRef}
          className="h-full"
          viewportClassName="!block" // Important: override default display if needed
        >
          <div className="p-4">
            <Typography variant="title-medium" className="mb-4">
              Infinite Feed
            </Typography>
            <InfiniteScroll
              // Pass the ref. Note: ElasticScrollArea populates this ref with the actual scrollable div
              root={viewportRef.current}
              hasMore={hasMore}
              isLoading={isLoading}
              onLoadMore={loadMore}
              endMessage="No more posts."
              className="gap-4"
            >
              {items.map((item) => (
                <Card key={item.id} variant="primary" shape="minimal">
                  <div className="h-32 bg-graphite-secondary rounded-lg mb-2 flex items-center justify-center text-graphite-foreground/20 font-bold text-4xl">
                    {item.id}
                  </div>
                  <Typography variant="title-small">{item.name}</Typography>
                  <Typography variant="body-medium">
                    This is some sample content for the feed item to make it
                    take up space.
                  </Typography>
                </Card>
              ))}
            </InfiniteScroll>
          </div>
        </ElasticScrollArea>
      </div>
    );
  },
};
