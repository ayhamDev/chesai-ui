import React from "react";
import { Grid } from "../../layout/grid";
import type { RegistryComponent } from "../types";

export const GridConfig: RegistryComponent = {
  name: "Grid Box",
  category: "Layout",
  acceptsChildren: true,
  render: ({ children, columns, ...props }) => (
    <Grid
      {...props}
      columns={columns || 1}
      className={`w-full min-h-[50px] p-4 border border-dashed border-outline-variant/30 ${props.className || ""}`}
    >
      {children}
    </Grid>
  ),
  controls: {
    columns: {
      type: "number",
      label: "Number of Columns",
      group: "Layout Properties",
      defaultValue: 2,
      min: 1,
      max: 12,
      step: 1,
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
