"use client";

import React, { useRef, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  Sector,
} from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import { getColorForIndex } from "./chart-utils";
import { clsx } from "clsx";
import { motion } from "framer-motion";

const AnimatedSector = ({
  cx,
  cy,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
  isActive,
  cornerRadius = 6,
}: any) => {
  const targetOuterRadius = isActive ? outerRadius + 6 : outerRadius;
  const sliceAngle = (Math.abs(endAngle - startAngle) * Math.PI) / 180;
  const halfAngleSine = Math.sin(sliceAngle / 2);
  const maxRadiusForAngle =
    halfAngleSine > 0
      ? (outerRadius * halfAngleSine) / (1 + halfAngleSine)
      : 0;
  const maxRadiusForThickness = (outerRadius - innerRadius) / 2;
  const safeCornerRadius = Math.max(
    0,
    Math.min(
      cornerRadius,
      maxRadiusForThickness,
      // Keep narrow slices visibly wedge-shaped instead of letting their
      // rounded ends meet and collapse into a detached circle.
      maxRadiusForAngle * 0.45,
    ),
  );

  return (
    <MotionSector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      targetRadius={targetOuterRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      cornerRadius={safeCornerRadius}
    />
  );
};

const MotionSector = ({ targetRadius, ...props }: any) => {
  return (
    <motion.g>
      <motion.circle
        r={targetRadius}
        initial={{ r: props.outerRadius }}
        animate={{ r: targetRadius }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ display: "none" }}
        onUpdate={() => {}}
      />
      <TweenedSector {...props} targetRadius={targetRadius} />
    </motion.g>
  );
};

const TweenedSector = ({ targetRadius, ...props }: any) => {
  const [radius, setRadius] = useState(props.outerRadius);
  const radiusRef = useRef(props.outerRadius);

  React.useEffect(() => {
    let animationFrameId: number;
    const startTime = performance.now();
    const startRadius = radiusRef.current;
    const duration = 250; // ms

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const ease = 1 - (1 - progress) ** 3;

      const current = startRadius + (targetRadius - startRadius) * ease;
      radiusRef.current = current;
      setRadius(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetRadius]);

  return <Sector {...props} outerRadius={radius} />;
};

// --- Main Component ---

export interface PieChartProps {
  data: any[];
  category: string;
  index: string;
  variant?: "primary" | "secondary" | "ghost";
  shape?: "full" | "minimal" | "sharp";
  colors?: string[];
  height?: number | string;
  className?: string;
  donut?: boolean;
  /** Angular spacing between slices. Use 0 for a continuous pie or donut. */
  paddingAngle?: number;
  /** Slice corner radius in pixels. Use 0 for square slice edges. */
  cornerRadius?: number;
}

export const PieChart = ({
  data,
  category,
  index,
  variant = "primary",
  shape = "minimal",
  colors,
  height = 300,
  className,
  donut = false,
  paddingAngle,
  cornerRadius,
}: PieChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>();
  const isGhost = variant === "ghost";

  const getCornerRadius = () => {
    if (isGhost || shape === "sharp") return 0;
    if (shape === "full") return 999;
    return 6; // Minimal
  };

  const innerRadius = donut ? "60%" : "0%";
  const outerRadius = isGhost ? "80%" : "90%";
  const resolvedPaddingAngle =
    paddingAngle ?? (isGhost || shape === "sharp" ? 0 : 4);
  const resolvedCornerRadius = cornerRadius ?? getCornerRadius();

  const onPieEnter = (_: any, idx: number) => {
    if (!isGhost) setActiveIndex(idx);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  return (
    <div
      className={clsx(
        "outline-none[&_.recharts-surface]:outline-none",
        className,
      )}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={resolvedPaddingAngle}
            dataKey={category}
            nameKey={index}
            stroke="none"
            animationDuration={1200}
            shape={(props: any) => (
              <AnimatedSector
                {...props}
                isActive={props.index === activeIndex}
                cornerRadius={resolvedCornerRadius}
              />
            )}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {data.map((entry, i) => (
              <Cell
                key={String(entry[index])}
                fill={colors?.[i] || getColorForIndex(i)}
                stroke="none"
              />
            ))}
          </Pie>
          {!isGhost && <Tooltip content={<ChartTooltip />} />}
          {!isGhost && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ paddingTop: "8px" }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
