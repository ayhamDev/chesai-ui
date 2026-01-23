"use client";

import React, { useId } from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
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
import { clsx } from "clsx";

export interface ChartProps {
  data: any[];
  categories: string[];
  index: string;
  variant?: "primary" | "secondary" | "ghost";
  colors?: string[];
  height?: number | string;
  className?: string;
  valueFormatter?: (value: number) => string;
}

export const AreaChart = ({
  data,
  categories,
  index,
  variant = "primary",
  colors,
  height = 300,
  className,
  valueFormatter = (value) => `${value}`,
}: ChartProps) => {
  const chartId = useId();
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
        <RechartsAreaChart
          data={data}
          margin={
            isGhost
              ? { top: 0, right: 0, bottom: 0, left: 0 }
              : { top: 10, right: 10, bottom: 0, left: 0 }
          }
        >
          <defs>
            {categories.map((category, i) => {
              const color = colors?.[i] || getColorForIndex(i);
              return (
                <linearGradient
                  key={`${chartId}-${category}`}
                  id={`gradient-${chartId}-${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={color}
                    stopOpacity={isGhost ? 0.2 : 0.4}
                  />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>

          {!isGhost && (
            <CartesianGrid
              {...chartGridConfig}
              vertical={false}
              horizontal={!isSecondary}
            />
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
                stroke: "var(--md-sys-color-outline-variant)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
          )}

          {categories.map((category, i) => {
            const color = colors?.[i] || getColorForIndex(i);
            return (
              <Area
                key={category}
                type="monotone"
                dataKey={category}
                stroke={color}
                fill={`url(#gradient-${chartId}-${i})`}
                strokeWidth={isGhost ? 1 : 2}
                fillOpacity={1}
                animationDuration={1500}
                animationEasing="ease-in-out"
                activeDot={
                  !isGhost
                    ? {
                        r: 4,
                        strokeWidth: 2,
                        stroke: "var(--md-sys-color-surface)",
                        fill: color,
                      }
                    : false
                }
                isAnimationActive={true}
              />
            );
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};
