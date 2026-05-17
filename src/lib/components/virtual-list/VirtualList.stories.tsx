import type { Meta, StoryObj } from "@storybook/react";
import { clsx } from "clsx";
import { Mail } from "lucide-react";
import React, { useRef } from "react";
import { Button } from "../button";
import { ElasticScrollArea } from "../elastic-scroll-area";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../item";
import { toast, Toaster } from "../toast";
import { VirtualList } from "./index";

const meta: Meta<typeof VirtualList> = {
  title: "Components/Data/VirtualList",
  component: VirtualList,
};

export default meta;

const data = Array.from({ length: 5000 }, (_, i) => ({
  id: i,
  title: `Message #${i + 1}`,
  desc: "This list uses ElasticScrollArea for virtualization.",
}));

export const WithElasticScroll: StoryObj<typeof VirtualList> = {
  name: "1. Vertical Integrated with Elastic Scroll",
  render: () => {
    const handleRefresh = async () => {
      await new Promise((res) => setTimeout(res, 2000));
      toast.success("Inbox Updated");
    };

    return (
      <div className="h-[600px] w-96 mx-auto border border-outline-variant rounded-2xl overflow-hidden bg-surface shadow-xl">
        <Toaster position="bottom-center" />
        <VirtualList
          data={data}
          as={ElasticScrollArea}
          containerProps={{
            pullToRefresh: true,
            onRefresh: handleRefresh,
            dampingFactor: 0.2,
            scrollbarVisibility: "hidden",
            className: "bg-transparent",
          }}
          gap={4}
          estimateSize={72}
          renderItem={(item) => (
            <Item variant="secondary" shape="minimal" className="mx-2">
              <ItemMedia variant="icon" shape="full">
                <Mail className="size-4" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{item.title}</ItemTitle>
                <ItemDescription>{item.desc}</ItemDescription>
              </ItemContent>
            </Item>
          )}
        />
      </div>
    );
  },
};

export const HorizontalWithControls: StoryObj<typeof VirtualList> = {
  name: "2. Horizontal with Scroll Controls",
  render: () => {
    const virtualizerRef = useRef<any>(null);
    const scrollContainerRef = useRef<HTMLElement>(null);

    const handleScrollTo = () => {
      if (virtualizerRef.current) {
        virtualizerRef.current.scrollToIndex(2500, {
          align: "center",
          behavior: "smooth",
        });
      }
    };

    return (
      <div className="flex flex-col gap-6 items-center w-full max-w-4xl mx-auto pt-12">
        <Button onClick={handleScrollTo}>
          Programmatically Scroll to Item #2500
        </Button>

        <div className="w-[800px] h-32 border border-outline-variant rounded-xl bg-surface-container-low shadow-md overflow-hidden">
          <VirtualList
            data={data}
            direction="horizontal"
            ref={scrollContainerRef}
            virtualizerRef={virtualizerRef}
            itemsWrapper="ul"
            gap={12}
            estimateSize={250}
            renderItem={(item) => (
              <Item
                variant="secondary"
                shape="minimal"
                className="h-full w-[250px] flex-col justify-center border border-outline-variant/40"
              >
                <ItemContent className="text-center w-full">
                  <ItemTitle className="mx-auto">{item.title}</ItemTitle>
                  <ItemDescription className="text-center">
                    Swipe me!
                  </ItemDescription>
                </ItemContent>
              </Item>
            )}
          />
        </div>
      </div>
    );
  },
};

export const ChatInterface: StoryObj<typeof VirtualList> = {
  name: "3. Chat Interface (Vertical Reverse)",
  render: () => {
    // In a vertical-reverse layout, item index 0 is rendered at the absolute bottom.
    // Make sure your newest message is passed in as data[0] so users start viewing the newest content.
    const chatData = [...data].slice(0, 50).reverse();

    return (
      <div className="h-[600px] w-96 mx-auto border border-outline-variant rounded-2xl overflow-hidden bg-surface-container-low shadow-xl flex flex-col">
        <div className="p-4 bg-surface-container border-b border-outline-variant text-center font-bold z-10 shadow-sm">
          Group Chat
        </div>

        <div className="flex-1 overflow-hidden">
          <VirtualList
            data={chatData}
            direction="vertical-reverse" // Native Flex-based bottom anchoring
            gap={12}
            estimateSize={80}
            containerProps={{
              className: "px-4 pb-4 pt-2",
            }}
            renderItem={(item) => {
              // Mock distinguishing who sent the message
              const isMe = item.id % 2 === 0;

              return (
                <div
                  className={clsx(
                    "flex w-full",
                    isMe ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={clsx(
                      "px-4 py-3 max-w-[80%] text-sm shadow-sm",
                      isMe
                        ? "bg-primary text-on-primary rounded-2xl rounded-br-sm"
                        : "bg-surface text-on-surface border border-outline-variant/30 rounded-2xl rounded-bl-sm",
                    )}
                  >
                    <div className="font-semibold text-[11px] opacity-70 mb-1 uppercase tracking-wider">
                      {isMe ? "You" : `User ${item.id}`}
                    </div>
                    {item.desc} Let's hang out this weekend!
                  </div>
                </div>
              );
            }}
          />
        </div>
      </div>
    );
  },
};
