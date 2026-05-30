import React from "react";
import { Flex } from "../../layout/flex";
import type { RegistryComponent } from "../types";

export const FlexConfig: RegistryComponent = {
  name: "Flex Box",
  category: "Layout",
  acceptsChildren: true,
  render: ({ children, ...props }) => (
    <Flex {...props} className={`w-full min-h-[50px] p-4 border border-dashed border-outline-variant/30 ${props.className || ""}`}>
      {children}
    </Flex>
  ),
  controls: {
    direction: {
      type: "select",
      label: "Direction",
      group: "Layout Properties",
      defaultValue: "row",
      options: [
        { label: "Row (Left to Right)", value: "row" },
        { label: "Column (Top to Bottom)", value: "column" },
        { label: "Row Reverse", value: "row-reverse" },
        { label: "Column Reverse", value: "col-reverse" },
      ],
    },
    justify: {
      type: "select",
      label: "Justify Content (Main Axis)",
      group: "Layout Properties",
      defaultValue: "start",
      options: [
        { label: "Start", value: "start" },
        { label: "Center", value: "center" },
        { label: "End", value: "end" },
        { label: "Space Between", value: "between" },
        { label: "Space Around", value: "around" },
        { label: "Space Evenly", value: "evenly" },
      ],
    },
    align: {
      type: "select",
      label: "Align Items (Cross Axis)",
      group: "Layout Properties",
      defaultValue: "stretch",
      options: [
        { label: "Stretch", value: "stretch" },
        { label: "Start", value: "start" },
        { label: "Center", value: "center" },
        { label: "End", value: "end" },
        { label: "Baseline", value: "baseline" },
      ],
    },
    wrap: {
      type: "select",
      label: "Wrap",
      group: "Layout Properties",
      defaultValue: "nowrap",
      options: [
        { label: "No Wrap", value: "nowrap" },
        { label: "Wrap", value: "wrap" },
        { label: "Wrap Reverse", value: "wrap-reverse" },
      ],
    },
    gap: {
      type: "select",
      label: "Gap",
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
