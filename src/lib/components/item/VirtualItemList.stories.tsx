import type { Meta, StoryObj } from "@storybook/react";
import { Mail, RefreshCw } from "lucide-react";
import React from "react";
import { ElasticScrollArea } from "../elastic-scroll-area";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "./index";
import { VirtualItemList } from "./virtual-item-list";
import { toast, Toaster } from "../toast";

const meta: Meta<typeof VirtualItemList> = {
  title: "Components/Data/VirtualItemList",
  component: VirtualItemList,
};

export default meta;

const data = Array.from({ length: 5000 }, (_, i) => ({
  id: i,
  title: `Message #${i + 1}`,
  desc: "This list uses ElasticScrollArea for virtualization.",
}));

export const WithElasticScroll: StoryObj<typeof VirtualItemList> = {
  name: "Integrated with Elastic Scroll",
  render: () => {
    const handleRefresh = async () => {
      await new Promise((res) => setTimeout(res, 2000));
      toast.success("Inbox Updated");
    };

    return (
      <div className="h-[600px] w-96 mx-auto border border-graphite-border rounded-2xl overflow-hidden bg-graphite-background shadow-xl">
        <Toaster position="bottom-center" />
        <VirtualItemList
          data={data}
          // --- THE KEY PROPS ---
          as={ElasticScrollArea}
          containerProps={{
            pullToRefresh: true,
            onRefresh: handleRefresh,
            dampingFactor: 0.2,
            scrollbarVisibility: "hidden",
            className: "bg-transparent", // Override default scroll area bg
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
