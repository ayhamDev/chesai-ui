import React from "react";
import { LineChart } from "../../charts";
import type { RegistryComponent } from "../types";

const MOCK_CHART_DATA = [
  { day: "Mon", users: 120, sessions: 150 },
  { day: "Tue", users: 200, sessions: 280 },
  { day: "Wed", users: 150, sessions: 190 },
  { day: "Thu", users: 300, sessions: 400 },
  { day: "Fri", users: 280, sessions: 350 },
  { day: "Sat", users: 400, sessions: 520 },
  { day: "Sun", users: 380, sessions: 480 },
];

export const LineChartConfig: RegistryComponent = {
  name: "Line Chart",
  category: "Data Display",
  render: ({ data, categoriesString, index, variant, height, ...props }) => {
    const categories = (categoriesString || "users, sessions")
      .split(",")
      .map((c: string) => c.trim())
      .filter(Boolean);

    const chartData = data && Array.isArray(data) && data.length > 0 ? data : MOCK_CHART_DATA;

    return (
      <div className="w-full" {...props}>
        <LineChart
          data={chartData}
          categories={categories.length > 0 ? categories : ["users"]}
          index={index || "day"}
          variant={variant}
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
      defaultValue: "day",
      group: "Data",
    },
    categoriesString: {
      type: "text",
      label: "Y-Axis Categories",
      defaultValue: "users, sessions",
      group: "Data",
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
        { label: "Primary (Detailed)", value: "primary" },
        { label: "Secondary (Clean)", value: "secondary" },
        { label: "Ghost (Sparkline)", value: "ghost" },
      ],
    },
  },
};
