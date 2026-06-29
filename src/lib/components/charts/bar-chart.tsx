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
  Cell,
  ReferenceLine,
} from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import {
  chartAxisConfig,
  chartGridConfig,
  getColorForIndex,
  EASE_EMPHASIZED,
  EASE_EXPRESSIVE_DEFAULT_SPATIAL,
} from "./chart-utils";
import { ChartProps } from "./area-chart";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useTheme } from "../../context";

// Import custom shapes subsystem paths
import { SHAPE_PATHS, type ShapeType } from "../shape/paths";

export interface BarChartProps extends ChartProps {
  /** The key in your data that flags if a bar should be highlighted (e.g. 'reachedGoal') */
  highlightKey?: string;
  /** Custom color for highlighted bars. Defaults to tertiary green. */
  highlightColor?: string;
  /** Shape to render on top of highlighted bars. Defaults to 'flower'. */
  highlightShape?: ShapeType;
  /** Custom overlay icon centered in the badge. Defaults to a checkmark. */
  highlightIcon?: React.ReactNode;
  /** Show a distinctive baseline reference line at y = 0 */
  showBaseline?: boolean;
}

export const BarChart = ({
  data,
  categories,
  index,
  variant = "primary",
  shape = "minimal",
  colors,
  height = 300,
  className,
  valueFormatter = (value) => `${value}`,
  scrollable = false,
  minWidth = 500,
  highlightKey,
  highlightColor = "var(--md-sys-color-tertiary, #4ADE80)",
  highlightShape = "flower",
  highlightIcon,
  showBaseline = false,
}: BarChartProps) => {
  const isGhost = variant === "ghost";
  const isSecondary = variant === "secondary";
  const { animationStyle } = useTheme();

  // Dynamic animation attributes matching Material 3 specifications
  const isExpressive = animationStyle === "expressive";
  const easingFunction = (isExpressive
    ? EASE_EXPRESSIVE_DEFAULT_SPATIAL
    : EASE_EMPHASIZED) as any;
  const animationDuration = isExpressive ? 1000 : 550;

  const getRadius = () => {
    if (shape === "sharp") return [0, 0, 0, 0];
    if (shape === "full") return [999, 999, 999, 999]; // Pill
    return [4, 4, 4, 4]; // Minimal default
  };

  // Custom label renderer to overlay the decorative shape & inner checkmark at the active top/bottom edge of the bar
  const renderCustomLabel = (props: any) => {
    const { x, y, width, height: barHeight, value, index: barIndex } = props;
    const entry = data[barIndex];
    const isHighlighted = highlightKey ? !!entry[highlightKey] : false;

    if (!isHighlighted || isGhost || barHeight === 0) return null;

    // Responsive badge size relative to bar width
    const badgeSize = Math.min(width * 0.75, 32);
    const bx = x + width / 2 - badgeSize / 2;

    const isNegative = value < 0;

    // Position the badge near the active outer boundary of the bar
    // If positive: near the top (y + 6)
    // If negative: near the bottom (y + barHeight - badgeSize - 6)
    const by = isNegative ? y + barHeight - badgeSize - 6 : y + 6;

    // If the bar is too short to display the badge, skip rendering to prevent overlapping issues
    if (barHeight < badgeSize + 12) return null;

    const shapePath = highlightShape
      ? SHAPE_PATHS[highlightShape]
      : SHAPE_PATHS.flower;

    return (
      <motion.g
        key={`badge-${barIndex}`}
        className="pointer-events-none"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.45,
          ease: [0.34, 1.56, 0.64, 1], // Elegant spring-like elastic ease-out
        }}
        // Ensures the scale animation expands perfectly outward from the center of the badge
        style={{
          transformOrigin: `${x + width / 2}px ${by + badgeSize / 2}px`,
        }}
      >
        <svg
          x={bx}
          y={by}
          width={badgeSize}
          height={badgeSize}
          viewBox="0 0 380 380"
        >
          {/* Decorative Shape Background */}
          <path d={shapePath} fill="rgba(255, 255, 255, 0.6)" />

          {/* Centered Checkmark Icon matching the local 380x380 coordinates */}
          {highlightIcon ? (
            <g transform="translate(95, 95) scale(0.5)">
              <foreignObject width="380" height="380">
                {highlightIcon}
              </foreignObject>
            </g>
          ) : (
            <path
              d="M130 195L170 235L250 155"
              fill="none"
              stroke="currentColor"
              className="text-emerald-950 dark:text-emerald-900"
              strokeWidth={36}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </motion.g>
    );
  };

  return (
    <div
      className={clsx(
        "outline-none [&_.recharts-surface]:outline-none",
        scrollable && "overflow-x-auto scrollbar-thin",
        className,
      )}
      style={{ height }}
    >
      <div
        style={{
          minWidth: scrollable ? minWidth : undefined,
          height: "100%",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={
              isGhost
                ? { top: 0, right: 0, bottom: 0, left: 0 }
                : { top: 20, right: 10, bottom: 5, left: 0 }
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
                width={45}
              />
            )}

            {!isGhost && (
              <Tooltip
                content={<ChartTooltip />}
                cursor={{
                  fill: "var(--md-sys-color-surface-container-highest)",
                  opacity: 0.25,
                }}
              />
            )}

            {/* Render baseline reference line at y=0 if enabled */}
            {showBaseline && !isGhost && (
              <ReferenceLine
                y={0}
                stroke="var(--md-sys-color-outline-variant)"
                strokeWidth={1.5}
                className="opacity-80"
              />
            )}

            {categories.map((category, i) => {
              const baseColor = colors?.[i] || getColorForIndex(i);
              return (
                <Bar
                  key={category}
                  dataKey={category}
                  radius={getRadius() as any}
                  animationDuration={animationDuration}
                  animationEasing={easingFunction}
                  maxBarSize={isGhost ? undefined : 60}
                  label={highlightKey ? renderCustomLabel : undefined}
                >
                  {data.map((entry, entryIdx) => {
                    const isHighlighted = highlightKey
                      ? !!entry[highlightKey]
                      : false;
                    const finalColor = isHighlighted
                      ? highlightColor
                      : baseColor;

                    return (
                      <Cell
                        key={`cell-${entryIdx}`}
                        fill={finalColor}
                        className="transition-colors duration-300"
                      />
                    );
                  })}
                </Bar>
              );
            })}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
