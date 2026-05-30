import React from "react";
import { VirtualGrid } from "../../layout/virtual-grid";
import { Card } from "../../card";
import { Typography } from "../../typography";
import type { RegistryComponent } from "../types";

const MOCK_DATA = Array.from({ length: 5000 }, (_, i) => ({
  id: i,
  title: `Grid Item ${i + 1}`,
  color: `hsl(${(i * 137.5) % 360}, 70%, 85%)`,
}));

export const VirtualGridConfig: RegistryComponent = {
  name: "Virtual Grid",
  category: "Data Display",
  render: ({ itemHeight, gap, padding, ...props }) => (
    <div className="w-full h-[500px] border border-outline-variant/30 rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm" {...props}>
      <VirtualGrid
        data={MOCK_DATA}
        itemHeight={itemHeight}
        gap={gap}
        padding={padding}
        columns={{ default: 2, md: 3, lg: 4, xl: 5 }}
        renderItem={(item) => (
          <Card
            variant="surface"
            shape="minimal"
            padding="none"
            className="w-full h-full flex items-center justify-center border-none shadow-sm"
            style={{ backgroundColor: item.color }}
          >
            <div className="bg-white/50 dark:bg-black/20 px-3 py-1 rounded backdrop-blur-sm">
              <Typography variant="label-medium" className="font-bold text-black dark:text-white">
                {item.title}
              </Typography>
            </div>
          </Card>
        )}
      />
    </div>
  ),
  controls: {
    itemHeight: {
      type: "number",
      label: "Fixed Row Height (px)",
      group: "Layout",
      defaultValue: 150,
      min: 50,
      max: 500,
    },
    gap: {
      type: "number",
      label: "Grid Gap (px)",
      group: "Layout",
      defaultValue: 16,
    },
    padding: {
      type: "number",
      label: "Container Padding (px)",
      group: "Layout",
      defaultValue: 16,
    },
  },
};
