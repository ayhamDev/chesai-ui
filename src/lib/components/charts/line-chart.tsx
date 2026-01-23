"use client";

import React from "react";
import {
  Line,
  LineChart as RechartsLineChart,
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

export const LineChart = ({
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
        <RechartsLineChart
          data={data}
          margin={
            isGhost
              ? { top: 5, right: 0, bottom: 5, left: 10 }
              : { top: 10, right: 10, bottom: 0, left: 10 }
          }
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

          {!isGhost && <Tooltip content={<ChartTooltip />} />}

          {categories.map((category, i) => {
            const color = colors?.[i] || getColorForIndex(i);
            return (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                stroke={color}
                strokeWidth={isGhost ? 2 : 2.5}
                dot={
                  !isGhost && !isSecondary
                    ? {
                        r: 3,
                        fill: "var(--md-sys-color-surface)",
                        strokeWidth: 2,
                      }
                    : false
                }
                activeDot={
                  !isGhost ? { r: 5, fill: color, strokeWidth: 0 } : { r: 0 }
                }
                animationDuration={1500}
              />
            );
          })}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};
