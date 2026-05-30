import React from "react";
import { Masonry } from "../../layout/masonry";
import type { RegistryComponent } from "../types";

export const MasonryConfig: RegistryComponent = {
  name: "Masonry Layout",
  category: "Layout",
  acceptsChildren: true,
  render: ({ columns, gap, children, ...props }) => (
    <div className="w-full min-h-[100px] border border-dashed border-outline-variant/30 p-2" {...props}>
      <Masonry columns={columns || 3} gap={gap}>
        {children || (
          <div className="text-sm opacity-50 p-4 text-center w-full">
            Drop cards or images here...
          </div>
        )}
      </Masonry>
    </div>
  ),
  controls: {
    columns: {
      type: "number",
      label: "Number of Columns",
      group: "Layout Properties",
      defaultValue: 3,
      min: 1,
      max: 12,
      step: 1,
    },
    gap: {
      type: "select",
      label: "Gap Size",
      group: "Layout Properties",
      defaultValue: "md",
      options: [
        { label: "None", value: "none" },
        { label: "Extra Small", value: "xs" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
        { label: "Extra Large", value: "xl" },
      ],
    },
  },
};
