"use client";

import React, { useState } from "react";
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
      cornerRadius={cornerRadius}
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

  React.useEffect(() => {
    let animationFrameId: number;
    const startTime = performance.now();
    const startRadius = radius;
    const duration = 250; // ms

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      const current = startRadius + (targetRadius - startRadius) * ease;
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

interface PieChartProps {
  data: any[];
  category: string;
  index: string;
  variant?: "primary" | "secondary" | "ghost";
  shape?: "full" | "minimal" | "sharp";
  colors?: string[];
  height?: number | string;
  className?: string;
  donut?: boolean;
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
  const paddingAngle = isGhost || shape === "sharp" ? 0 : 4;
  const cornerRadiusValue = getCornerRadius();

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
            paddingAngle={paddingAngle}
            dataKey={category}
            nameKey={index}
            stroke="none"
            animationDuration={1200}
            shape={(props: any) => (
              <AnimatedSector
                {...props}
                isActive={props.index === activeIndex}
                cornerRadius={cornerRadiusValue}
              />
            )}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {data.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
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
