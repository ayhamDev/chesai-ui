import React from "react";
import { VirtualFlex } from "../../layout/virtual-flex";
import { Card } from "../../card";
import { Typography } from "../../typography";
import type { RegistryComponent } from "../types";

const MOCK_DATA = Array.from({ length: 2000 }, (_, i) => ({
  id: i,
  label: `Flex Item ${i + 1}`,
}));

export const VirtualFlexConfig: RegistryComponent = {
  name: "Virtual Flex",
  category: "Data Display",
  render: ({ direction, gap, padding, estimateSize, ...props }) => (
    <div className="w-full h-[300px] border border-outline-variant/30 rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm" {...props}>
      <VirtualFlex
        data={MOCK_DATA}
        direction={direction}
        gap={gap}
        padding={padding}
        estimateSize={estimateSize}
        renderItem={(item) => (
          <Card
            variant="surface-container"
            shape="minimal"
            className="flex items-center justify-center border-none shadow-sm"
            style={{
              width: direction === "horizontal" ? estimateSize : "100%",
              height: direction === "vertical" ? estimateSize : "100%"
            }}
          >
            <Typography variant="label-medium" className="font-bold opacity-70">
              {item.label}
            </Typography>
          </Card>
        )}
      />
    </div>
  ),
  controls: {
    direction: {
      type: "select",
      label: "Direction",
      group: "Layout",
      defaultValue: "horizontal",
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Vertical", value: "vertical" },
      ],
    },
    gap: {
      type: "number",
      label: "Gap (px)",
      group: "Layout",
      defaultValue: 16,
    },
    padding: {
      type: "number",
      label: "Padding (px)",
      group: "Layout",
      defaultValue: 16,
    },
    estimateSize: {
      type: "number",
      label: "Estimated Item Size (px)",
      description: "Height for vertical, Width for horizontal.",
      group: "Layout",
      defaultValue: 150,
    },
  },
};
