import React from "react";
import { AreaChart } from "../../charts";
import type { RegistryComponent } from "../types";

const MOCK_CHART_DATA = [
  { name: "Jan", sales: 4000, profit: 2400 },
  { name: "Feb", sales: 3000, profit: 1398 },
  { name: "Mar", sales: 2000, profit: 9800 },
  { name: "Apr", sales: 2780, profit: 3908 },
  { name: "May", sales: 1890, profit: 4800 },
  { name: "Jun", sales: 2390, profit: 3800 },
];

export const AreaChartConfig: RegistryComponent = {
  name: "Area Chart",
  category: "Data Display",
  render: ({ data, categoriesString, index, variant, shape, height, ...props }) => {
    const categories = (categoriesString || "sales, profit")
      .split(",")
      .map((c: string) => c.trim())
      .filter(Boolean);

    const chartData = data && Array.isArray(data) && data.length > 0 ? data : MOCK_CHART_DATA;

    return (
      <div className="w-full" {...props}>
        <AreaChart
          data={chartData}
          categories={categories.length > 0 ? categories : ["sales"]}
          index={index || "name"}
          variant={variant}
          shape={shape}
          height={height || 300}
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
      description: "The object key for the X-axis labels.",
      group: "Data",
    },
    categoriesString: {
      type: "text",
      label: "Y-Axis Categories",
      defaultValue: "sales, profit",
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
    variant: {
      type: "select",
      label: "Visual Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary (Detailed)", value: "primary" },
        { label: "Secondary (Clean)", value: "secondary" },
        { label: "Ghost (Sparkline/Background)", value: "ghost" },
      ],
    },
    shape: {
      type: "select",
      label: "Tooltip/Container Shape",
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
