"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { Activity, DollarSign, MoreVertical, Users } from "lucide-react";
import React, { useState } from "react";
import { ChesaiProvider } from "../../context/ChesaiProvider";
import { Badge } from "../badge";
import { Card } from "../card";
import { AreaChart } from "../charts/area-chart";
import { BarChart } from "../charts/bar-chart";
import { HeatmapChart } from "../charts/heatmap-chart";
import { IconButton } from "../icon-button";
import { Typography } from "../typography";
import { AdaptiveGrid } from "./AdaptiveGrid";
import { GridItemConfig } from "./types";

const meta: Meta<typeof AdaptiveGrid> = {
  title: "Components/Layout/AdaptiveGrid",
  component: AdaptiveGrid,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <ChesaiProvider>
        <div className="min-h-screen bg-surface-container-lowest p-8">
          <Story />
        </div>
      </ChesaiProvider>
    ),
  ],
};

export default meta;

// --- Mock Data ---

const salesData = [
  { month: "Jan", sales: 4000, profit: 2400 },
  { month: "Feb", sales: 3000, profit: 1398 },
  { month: "Mar", sales: 2000, profit: 9800 },
  { month: "Apr", sales: 2780, profit: 3908 },
  { month: "May", sales: 1890, profit: 4800 },
  { month: "Jun", sales: 2390, profit: 3800 },
];

const heatmapData = [
  { x: "12 PM", y: "Mon", value: 45 },
  { x: "4 PM", y: "Mon", value: 85 },
  { x: "12 PM", y: "Tue", value: 30 },
  { x: "4 PM", y: "Tue", value: 95 },
  { x: "12 PM", y: "Wed", value: 55 },
  { x: "4 PM", y: "Wed", value: 20 },
];

interface DashboardItem extends GridItemConfig {
  type: "stat" | "chart-area" | "chart-bar" | "chart-heatmap";
  title: string;
  value?: string;
  trend?: string;
  icon?: React.ReactNode;
}

const INITIAL_DASHBOARD: DashboardItem[] = [
  {
    id: "stat-revenue",
    type: "stat",
    title: "Total Revenue",
    value: "$42,500",
    trend: "+12.5%",
    icon: <DollarSign size={20} />,
    x: 0,
    y: 0,
    w: 6,
    h: 3,
  },
  {
    id: "stat-users",
    type: "stat",
    title: "Active Users",
    value: "1,284",
    trend: "+3.2%",
    icon: <Users size={20} />,
    x: 6,
    y: 0,
    w: 6,
    h: 3,
  },
  {
    id: "chart-revenue",
    type: "chart-area",
    title: "Revenue Forecast",
    x: 0,
    y: 3,
    w: 12,
    h: 8,
  },
  {
    id: "chart-performance",
    type: "chart-bar",
    title: "Monthly Performance",
    x: 12,
    y: 0,
    w: 12,
    h: 11,
  },
  {
    id: "chart-server",
    type: "chart-heatmap",
    title: "Server Load Distribution",
    x: 0,
    y: 11,
    w: 24,
    h: 8,
  },
];

export const AnalyticsDashboard: StoryObj = {
  render: () => {
    const [items, setItems] = useState<DashboardItem[]>(INITIAL_DASHBOARD);

    const renderWidget = (item: DashboardItem, isDragging: boolean) => {
      return (
        <Card
          variant="surface"
          padding="none"
          className={`w-full h-full border border-outline-variant/50 overflow-hidden flex flex-col transition-shadow duration-300 ${
            isDragging
              ? "shadow-2xl ring-2 ring-primary/20"
              : "shadow-sm hover:shadow-md"
          }`}
        >
          {/* Widget Header */}
          <div className="px-4 py-3 border-b border-outline-variant/30 flex items-center justify-between shrink-0 bg-surface-container-low/50">
            <div className="flex items-center gap-2">
              <span className="text-primary opacity-70">
                {item.icon || <Activity size={18} />}
              </span>
              <Typography
                variant="label-large"
                className="font-bold opacity-80 uppercase tracking-wider"
              >
                {item.title}
              </Typography>
            </div>
            <IconButton variant="ghost" size="sm">
              <MoreVertical size={16} />
            </IconButton>
          </div>

          {/* Widget Content */}
          <div className="flex-1 min-h-0 p-4">
            {item.type === "stat" && (
              <div className="h-full flex flex-col justify-center">
                <Typography variant="headline-medium" className="font-black">
                  {item.value}
                </Typography>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className="bg-green-500/10 text-green-600 border-none font-bold"
                  >
                    {item.trend}
                  </Badge>
                  <Typography variant="body-small" muted>
                    vs last month
                  </Typography>
                </div>
              </div>
            )}

            {item.type === "chart-area" && (
              <AreaChart
                data={salesData}
                index="month"
                categories={["sales"]}
                height="100%"
                variant="primary"
              />
            )}

            {item.type === "chart-bar" && (
              <BarChart
                data={salesData}
                index="month"
                categories={["profit"]}
                height="100%"
                shape="full"
              />
            )}

            {item.type === "chart-heatmap" && (
              <HeatmapChart
                data={heatmapData}
                xLabels={["12 PM", "4 PM"]}
                yLabels={["Mon", "Tue", "Wed"]}
                height="100%"
                variant="tertiary"
              />
            )}
          </div>
        </Card>
      );
    };

    return (
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-8 flex flex-col gap-1">
          <Typography
            variant="display-small"
            className="font-black tracking-tight"
          >
            Fluid Operations Center
          </Typography>
          <Typography variant="body-medium" muted>
            Drag and resize widgets to customize your workflow. Layout
            automatically snaps to the blueprint.
          </Typography>
        </header>

        <AdaptiveGrid
          items={items}
          columns={24} // Fine-grained control
          rowHeight={40}
          gap="md"
          onChange={(newItems) => setItems(newItems as DashboardItem[])}
          renderItem={(item, isDragging) =>
            renderWidget(item as DashboardItem, isDragging)
          }
        />
      </div>
    );
  },
};
