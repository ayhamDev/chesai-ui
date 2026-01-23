"use client";

import React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import {
  chartAxisConfig,
  chartGridConfig,
  getColorForIndex,
} from "./chart-utils";
import { ChartProps } from "./area-chart";
import { clsx } from "clsx";

export const BarChart = ({
  data,
  categories,
  index,
  variant = "primary",
  colors,
  height = 300,
  className,
  valueFormatter = (value) => `${value}`,
}: ChartProps) => {
  const isGhost = variant === "ghost";
  const isSecondary = variant === "secondary";

  return (
    <div
      className={clsx(
        "outline-none [&_.recharts-surface]:outline-none",
        className,
      )}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={
            isGhost
              ? { top: 0, right: 0, bottom: 0, left: 0 }
              : { top: 10, right: 10, bottom: 0, left: 0 }
          }
          barGap={2}
        >
          {!isGhost && (
            <CartesianGrid {...chartGridConfig} horizontal={!isSecondary} />
          )}

          {!isGhost && <XAxis dataKey={index} {...chartAxisConfig} />}

          {!isGhost && (
            <YAxis
              {...chartAxisConfig}
              tickFormatter={valueFormatter}
              hide={isSecondary}
              width={45} // Explicit width ensures labels aren't cut off
            />
          )}

          {!isGhost && (
            <Tooltip
              content={<ChartTooltip />}
              cursor={{
                fill: "var(--md-sys-color-surface-container-highest)",
                opacity: 0.4,
              }}
            />
          )}

          {categories.map((category, i) => {
            const color = colors?.[i] || getColorForIndex(i);
            return (
              <Bar
                key={category}
                dataKey={category}
                fill={color}
                // Updated radius: [TopLeft, TopRight, BottomRight, BottomLeft]
                // Now rounding all corners to 4px for non-ghost variants.
                radius={isGhost ? [4, 4, 4, 4] : [4, 4, 4, 4]}
                animationDuration={1500}
                animationEasing="ease-out"
                maxBarSize={isGhost ? undefined : 60}
              />
            );
          })}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
