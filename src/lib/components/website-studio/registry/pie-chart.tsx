import React from "react";
import { PieChart } from "../../charts";
import type { RegistryComponent } from "../types";

const MOCK_CHART_DATA = [
  { name: "Desktop", value: 400 },
  { name: "Mobile", value: 300 },
  { name: "Tablet", value: 200 },
  { name: "Other", value: 100 },
];

export const PieChartConfig: RegistryComponent = {
  name: "Pie Chart",
  category: "Data Display",
  render: ({ data, categoryKey, indexKey, variant, shape, height, donut, ...props }) => {
    const chartData = data && Array.isArray(data) && data.length > 0 ? data : MOCK_CHART_DATA;

    return (
      <div className="w-full" {...props}>
        <PieChart
          data={chartData}
          category={categoryKey || "value"}
          index={indexKey || "name"}
          variant={variant}
          shape={shape}
          height={height || 300}
          donut={donut}
        />
      </div>
    );
  },
  controls: {
    data: {
      type: "custom",
      label: "Data Source (Bind to CMS)",
      group: "Data",
      supportsCMS: true,
      render: () => <span className="text-xs text-gray-500 italic">Bind this property to a CMS array.</span>
    },
    indexKey: {
      type: "text",
      label: "Label Key",
      defaultValue: "name",
      description: "The object key containing the slice name.",
      group: "Data",
    },
    categoryKey: {
      type: "text",
      label: "Value Key",
      defaultValue: "value",
      description: "The object key containing the numerical value.",
      group: "Data",
    },
    donut: {
      type: "boolean",
      label: "Render as Donut",
      defaultValue: true,
      group: "Layout",
    },
    height: {
      type: "number",
      label: "Height (px)",
      defaultValue: 300,
      group: "Layout",
    },
    variant: {
      type: "select",
      label: "Visual Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Ghost (Clean/No Legend)", value: "ghost" },
      ],
    },
    shape: {
      type: "select",
      label: "Slice Corners",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Round)", value: "full" },
        { label: "Minimal", value: "minimal" },
        { label: "Sharp", value: "sharp" },
      ],
    },
  },
};
