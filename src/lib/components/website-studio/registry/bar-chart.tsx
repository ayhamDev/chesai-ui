import React from "react";
import { BarChart } from "../../charts";
import type { RegistryComponent } from "../types";

const MOCK_CHART_DATA = [
  { name: "Q1", revenue: 12000, expenses: 8000 },
  { name: "Q2", revenue: 15000, expenses: 9500 },
  { name: "Q3", revenue: 18000, expenses: 11000 },
  { name: "Q4", revenue: 22000, expenses: 14000 },
];

export const BarChartConfig: RegistryComponent = {
  name: "Bar Chart",
  category: "Data Display",
  render: ({ data, categoriesString, index, variant, shape, height, scrollable, ...props }) => {
    const categories = (categoriesString || "revenue, expenses")
      .split(",")
      .map((c: string) => c.trim())
      .filter(Boolean);

    const chartData = data && Array.isArray(data) && data.length > 0 ? data : MOCK_CHART_DATA;

    return (
      <div className="w-full" {...props}>
        <BarChart
          data={chartData}
          categories={categories.length > 0 ? categories : ["revenue"]}
          index={index || "name"}
          variant={variant}
          shape={shape}
          height={height || 300}
          scrollable={scrollable}
          minWidth={scrollable ? 600 : undefined}
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
    index: {
      type: "text",
      label: "X-Axis Data Key",
      defaultValue: "name",
      group: "Data",
    },
    categoriesString: {
      type: "text",
      label: "Y-Axis Categories",
      defaultValue: "revenue, expenses",
      description: "Comma separated object keys to plot.",
      group: "Data",
    },
    height: {
      type: "number",
      label: "Height (px)",
      defaultValue: 300,
      min: 100,
      max: 800,
      step: 10,
      group: "Layout",
    },
    scrollable: {
      type: "boolean",
      label: "Enable Horizontal Scroll",
      description: "Useful for datasets with many bars.",
      defaultValue: false,
      group: "Layout",
    },
    variant: {
      type: "select",
      label: "Visual Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary (Detailed)", value: "primary" },
        { label: "Secondary (Clean)", value: "secondary" },
        { label: "Ghost (Sparkline)", value: "ghost" },
      ],
    },
    shape: {
      type: "select",
      label: "Bar Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Pill)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
  },
};
