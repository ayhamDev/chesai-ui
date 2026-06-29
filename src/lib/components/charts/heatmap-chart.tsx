"use client";

import React, { useState, useId } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context";
import { Card } from "../card";
import { Typography } from "../typography";

export interface HeatmapDataPoint {
  x: string; // X-axis coordinate (column identifier)
  y: string; // Y-axis coordinate (row identifier)
  value: number;
  label?: string; // Optional custom label override for tooltips
}

export interface HeatmapChartProps {
  data: HeatmapDataPoint[];
  /** Explicit sequence of columns along the X-axis */
  xLabels: string[];
  /** Explicit sequence of rows along the Y-axis */
  yLabels: string[];
  /** Theme palette coloring (maps to container colors) */
  variant?: "primary" | "secondary" | "tertiary" | "error";
  /** Cell corner rounding */
  shape?: "full" | "minimal" | "sharp";
  height?: number | string;
  className?: string;
  /** Custom formatter function for values displayed inside tooltips */
  valueFormatter?: (value: number) => string;
  /** Color overrides. If empty, dynamically binds to MD3 color theme variables. */
  colorScale?: string[];
  showLabels?: boolean;
}

export const HeatmapChart = ({
  data,
  xLabels,
  yLabels,
  variant = "primary",
  shape = "minimal",
  height = 300,
  className,
  valueFormatter = (val) => `${val}`,
  showLabels = true,
}: HeatmapChartProps) => {
  const { animationStyle } = useTheme();
  const componentId = useId();
  const [hoveredCell, setHoveredCell] = useState<{
    x: string;
    y: string;
    value: number;
    posX: number;
    posY: number;
    label?: string;
  } | null>(null);

  const isExpressive = animationStyle === "expressive";

  // Build coordinate lookup cache
  const dataMap = React.useMemo(() => {
    const map = new Map<string, HeatmapDataPoint>();
    data.forEach((d) => {
      map.set(`${d.x}-${d.y}`, d);
    });
    return map;
  }, [data]);

  // Extract min/max ranges to scale opacity levels dynamically
  const { minVal, maxVal } = React.useMemo(() => {
    if (data.length === 0) return { minVal: 0, maxVal: 100 };
    const values = data.map((d) => d.value);
    return {
      minVal: Math.min(...values),
      maxVal: Math.max(...values),
    };
  }, [data]);

  const getCellRadius = () => {
    if (shape === "sharp") return "rounded-none";
    if (shape === "full") return "rounded-full";
    return "rounded-md"; // Minimal default
  };

  const baseThemeColor = (() => {
    switch (variant) {
      case "secondary":
        return "var(--md-sys-color-secondary, #77574E)";
      case "tertiary":
        return "var(--md-sys-color-tertiary, #6C5D2F)";
      case "error":
        return "var(--md-sys-color-error, #BA1A1A)";
      case "primary":
      default:
        return "var(--md-sys-color-primary, #8F4C38)";
    }
  })();

  const getCellColor = (value: number) => {
    if (value === 0) return "var(--md-sys-color-surface-container, #271D1B)";
    const range = maxVal - minVal;
    if (range === 0) return baseThemeColor;

    // Scale opacity linearly between 15% and 100%
    const normalized = (value - minVal) / range;
    const opacity = 0.15 + normalized * 0.85;

    return `rgb(from ${baseThemeColor} r g b / ${opacity})`;
  };

  // Motion physics configuration aligned with MD3 specifications
  const springTransition = {
    type: "spring",
    stiffness: 180,
    damping: 18,
    mass: 0.8,
  };

  const standardTransition = {
    type: "tween",
    ease: "easeOut",
    duration: 0.35,
  };

  return (
    <div
      className={clsx(
        "relative flex flex-col w-full outline-none select-none",
        className,
      )}
      style={{ height }}
    >
      <div className="flex-1 flex flex-col min-h-0 w-full overflow-auto scrollbar-thin">
        {/* Core Heatmap Matrix Layout */}
        <div
          className="flex-1 grid gap-2 p-2 min-w-[600px] h-full"
          style={{
            gridTemplateRows: `auto repeat(${yLabels.length}, 1fr)`,
          }}
        >
          {/* Header Row: X Labels */}
          <div
            className="grid gap-1 items-center"
            style={{
              gridTemplateColumns: `100px repeat(${xLabels.length}, 1fr)`,
            }}
          >
            <div /> {/* Top-left empty padding space */}
            {xLabels.map((xLabel, idx) => (
              <div key={`header-x-${idx}`} className="text-center">
                <Typography
                  variant="body-small"
                  className="font-bold opacity-70 block truncate px-1"
                >
                  {xLabel}
                </Typography>
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {yLabels.map((yLabel, rowIdx) => (
            <div
              key={`row-${rowIdx}`}
              className="grid gap-1 items-center"
              style={{
                gridTemplateColumns: `100px repeat(${xLabels.length}, 1fr)`,
              }}
            >
              {/* Y Label */}
              <div className="pr-3 text-right">
                <Typography
                  variant="body-small"
                  className="font-bold opacity-70 block truncate"
                >
                  {yLabel}
                </Typography>
              </div>

              {/* Data Cells */}
              {xLabels.map((xLabel, colIdx) => {
                const cellData = dataMap.get(`${xLabel}-${yLabel}`);
                const value = cellData ? cellData.value : 0;
                const cellColor = getCellColor(value);

                return (
                  <div
                    key={`cell-${rowIdx}-${colIdx}`}
                    className="relative w-full h-full min-h-[24px]"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const parentRect =
                        e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
                      setHoveredCell({
                        x: xLabel,
                        y: yLabel,
                        value,
                        posX:
                          rect.left - (parentRect?.left || 0) + rect.width / 2,
                        posY: rect.top - (parentRect?.top || 0) - 8,
                        label: cellData?.label,
                      });
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <motion.div
                      className={clsx(
                        "w-full h-full cursor-pointer border border-transparent hover:border-outline transition-colors duration-150 shadow-sm",
                        getCellRadius(),
                      )}
                      style={{ backgroundColor: cellColor }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        ...(isExpressive
                          ? springTransition
                          : standardTransition),
                        delay: rowIdx * 0.03 + colIdx * 0.015, // Elegant ripple entry effect
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Tooltip Portal Positioning */}
      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
            initial={{ opacity: 0, scale: 0.95, y: hoveredCell.posY + 4 }}
            animate={{ opacity: 1, scale: 1, y: hoveredCell.posY }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ left: hoveredCell.posX }}
          >
            <Card
              variant="primary"
              shape="minimal"
              padding="sm"
              elevation={2}
              className="min-w-[140px] !bg-surface-container-high/95 backdrop-blur-sm border border-outline-variant flex flex-col gap-1 text-center"
            >
              <Typography variant="body-small" className="font-bold opacity-60">
                {hoveredCell.y} • {hoveredCell.x}
              </Typography>
              <Typography
                variant="body-medium"
                className="font-bold text-primary font-mono leading-none"
              >
                {hoveredCell.label
                  ? hoveredCell.label
                  : valueFormatter(hoveredCell.value)}
              </Typography>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
