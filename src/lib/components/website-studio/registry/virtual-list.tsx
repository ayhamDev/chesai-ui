import React from "react";
import { VirtualList } from "../../virtual-list";
import { Item, ItemContent, ItemTitle } from "../../item";
import type { RegistryComponent } from "../types";

const MOCK_DATA = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  label: `Virtual List Item #${i + 1}`,
}));

export const VirtualListConfig: RegistryComponent = {
  name: "Virtual List",
  category: "Data Display",
  render: ({ direction, gap, estimateSize, ...props }) => (
    <div className="w-full h-[400px] border border-outline-variant/30 rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm" {...props}>
      <VirtualList
        data={MOCK_DATA}
        direction={direction}
        gap={gap}
        estimateSize={estimateSize}
        containerProps={{ className: "p-4" }}
        renderItem={(item) => (
          <Item variant="secondary" shape="minimal" className="h-full w-full shadow-sm">
            <ItemContent>
              <ItemTitle className="text-sm">{item.label}</ItemTitle>
            </ItemContent>
          </Item>
        )}
      />
    </div>
  ),
  controls: {
    direction: {
      type: "select",
      label: "Scroll Direction",
      group: "Layout",
      defaultValue: "vertical",
      options: [
        { label: "Vertical", value: "vertical" },
        { label: "Horizontal", value: "horizontal" },
        { label: "Vertical Reverse", value: "vertical-reverse" },
        { label: "Horizontal Reverse", value: "horizontal-reverse" },
      ],
    },
    gap: {
      type: "number",
      label: "Gap (px)",
      group: "Layout",
      defaultValue: 8,
    },
    estimateSize: {
      type: "number",
      label: "Estimated Item Size (px)",
      description: "Crucial for layout calculations before rendering.",
      group: "Layout",
      defaultValue: 50,
    },
  },
};
