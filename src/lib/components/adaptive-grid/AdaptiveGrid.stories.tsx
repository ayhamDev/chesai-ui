"use client";

import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, useRef } from "react";
import { AdaptiveGrid, AdaptiveGridHandle } from "./AdaptiveGrid";
import { GridItemConfig } from "./types";
import { Card } from "../card";
import { Button } from "../button";
import { Typography } from "../typography";
import { AreaChart } from "../charts/area-chart";
import { BarChart } from "../charts/bar-chart";
import { Badge } from "../badge";
import { ChesaiProvider } from "../../context/ChesaiProvider";
import { Sparkles, DollarSign, Users, Activity, BarChart3, Undo2 } from "lucide-react";

const meta: Meta<typeof AdaptiveGrid> = {
  title: "Components/Layout/AdaptiveGrid",
  component: AdaptiveGrid,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <ChesaiProvider>
        <div className="min-h-screen bg-surface-container-lowest p-8 flex flex-col items-center">
          <div className="w-full max-w-[1400px]">
            <Story />
          </div>
        </div>
      </ChesaiProvider>
    ),
  ],
};

export default meta;

const performanceData = [
  { month: "Jan", sales: 2400 },
  { month: "Feb", sales: 1398 },
  { month: "Mar", sales: 9800 },
  { month: "Apr", sales: 3908 },
  { month: "May", sales: 4800 },
  { month: "Jun", sales: 3800 },
];

interface DemoItem extends GridItemConfig {
  type: "revenue" | "users" | "chart-line" | "chart-bar";
  title: string;
}

const INITIAL_LAYOUT: DemoItem[] = [
  {
    id: "revenue-card",
    type: "revenue",
    title: "Financial Yield",
    x: 0, y: 0, w: 6, h: 3,
    minW: 4, maxW: 10, minH: 3, maxH: 5
  },
  {
    id: "users-card",
    type: "users",
    title: "Audience Engagement",
    x: 6, y: 0, w: 6, h: 3,
    minW: 4, maxW: 10, minH: 3, maxH: 5
  },
  {
    id: "revenue-chart",
    type: "chart-line",
    title: "Quarterly Inflow Details",
    x: 0, y: 3, w: 12, h: 6,
    minW: 6, minH: 5
  },
  {
    id: "bar-graph",
    type: "chart-bar",
    title: "Operational Velocities",
    x: 12, y: 0, w: 12, h: 9,
    minW: 8, minH: 6
  },
];

export const ImperativeWorkspace: StoryObj = {
  render: () => {
    const [items, setItems] = useState<DemoItem[]>(INITIAL_LAYOUT);
    const gridRef = useRef<AdaptiveGridHandle>(null);

    const handleAutoSort = () => {
      gridRef.current?.compact();
    };

    const handleReset = () => {
      gridRef.current?.reset();
    };

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
          <div>
            <Typography variant="title-medium" className="font-bold">
              Material Operation Center
            </Typography>
            <Typography variant="body-small" muted>
              Interactive dashboard workspace featuring constraint boundaries.
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              startIcon={<Undo2 size={16} />}
            >
              Reset Layout
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAutoSort}
              startIcon={<Sparkles size={16} />}
            >
              Auto-Compact Spacing
            </Button>
          </div>
        </div>

        <AdaptiveGrid
          ref={gridRef}
          items={items}
          columns={24}
          rowHeight={40}
          gap="md"
          onChange={(newLayout) => setItems(newItems => newLayout as DemoItem[])}
          renderItem={(item, isInteracting) => {
            const layoutItem = item as DemoItem;
            return (
              <Card
                variant={isInteracting ? "surface-container-high" : "surface"}
                padding="none"
                className={`w-full h-full border border-outline-variant/50 overflow-hidden flex flex-col transition-all duration-300 ${
                  isInteracting ? "shadow-xl ring-2 ring-primary/20 scale-[0.99]" : "shadow-sm"
                }`}
              >
                <div className="px-4 py-2.5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/40">
                  <div className="flex items-center gap-2">
                    {layoutItem.type === "revenue" && <DollarSign size={16} className="text-primary" />}
                    {layoutItem.type === "users" && <Users size={16} className="text-primary" />}
                    {layoutItem.type === "chart-line" && <Activity size={16} className="text-primary" />}
                    {layoutItem.type === "chart-bar" && <BarChart3 size={16} className="text-primary" />}
                    <Typography variant="label-small" className="font-bold uppercase tracking-wider opacity-75">
                      {layoutItem.title}
                    </Typography>
                  </div>
                  <Badge variant="secondary" className="text-[9px] scale-90 opacity-50 px-1.5 py-0">
                    min-w: {layoutItem.minW || 1}
                  </Badge>
                </div>

                <div className="flex-1 min-h-0 p-4">
                  {layoutItem.type === "revenue" && (
                    <div className="h-full flex flex-col justify-center">
                      <Typography variant="headline-medium" className="font-black">$42,500</Typography>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-none font-bold">+12%</Badge>
                        <Typography variant="body-small" muted>growth yield</Typography>
                      </div>
                    </div>
                  )}

                  {layoutItem.type === "users" && (
                    <div className="h-full flex flex-col justify-center">
                      <Typography variant="headline-medium" className="font-black">1,284</Typography>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">Stable</Badge>
                        <Typography variant="body-small" muted>concurrent actions</Typography>
                      </div>
                    </div>
                  )}

                  {layoutItem.type === "chart-line" && (
                    <AreaChart
                      data={performanceData}
                      categories={["sales"]}
                      index="month"
                      variant="ghost"
                      height="100%"
                    />
                  )}

                  {layoutItem.type === "chart-bar" && (
                    <BarChart
                      data={performanceData}
                      categories={["sales"]}
                      index="month"
                      variant="ghost"
                      height="100%"
                    />
                  )}
                </div>
              </Card>
            );
          }}
        />
      </div>
    );
  },
};
