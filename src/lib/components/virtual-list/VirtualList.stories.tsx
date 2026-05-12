import type { Meta, StoryObj } from "@storybook/react";
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
      <div className="h-[600px] w-96 mx-auto border border-graphite-border rounded-2xl overflow-hidden bg-graphite-background shadow-xl">
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
    // 1. You can track the virtualizer instance
    const virtualizerRef = useRef<any>(null);
    // 2. You can track the actual DOM element
    const scrollContainerRef = useRef<HTMLElement>(null);

    const handleScrollTo = () => {
      if (virtualizerRef.current) {
        // API exposes all TanStack Virtual commands
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
            itemsWrapper="ul" // <-- Demonstrating inner wrapper
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
