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

// 1. Create an Animated Sector Component
// We wrap the Recharts Sector in a component that handles the animation state
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
  // We want to animate the outerRadius.
  // When active: base radius + 6px. When inactive: base radius.
  const targetOuterRadius = isActive ? outerRadius + 6 : outerRadius;

  return (
    // We cannot animate the <Sector> directly because it is a functional component.
    // Instead, we use a motion component (like a group) to drive state,
    // OR simply use the "initial/animate" props on a standard HTML element
    // and a custom hook, but Framer Motion has a cleaner way via `motion.create`
    // or simply animating a generic object.

    // Simplest approach: Use <Sector> with a React Key to force update? No.
    // Use an animated value generator.
    <MotionSector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius} // Pass base for initial
      targetRadius={targetOuterRadius} // Pass target for animation
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      cornerRadius={cornerRadius}
    />
  );
};

// Helper to bridge Framer Motion and Recharts Sector
const MotionSector = ({ targetRadius, ...props }: any) => {
  return (
    <motion.g>
      {/* We create a "virtual" animation of a value "r" */}
      <motion.circle
        r={targetRadius}
        initial={{ r: props.outerRadius }}
        animate={{ r: targetRadius }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ display: "none" }} // Invisible, just used to drive the value
        onUpdate={(latest) => {
          // This is a bit hacky for SVG.
          // Better approach below:
        }}
      />
      {/* 
         ACTUALLY, the cleanest way in Recharts + Framer Motion 
         without complex render props is to just render the Sector 
         and let React handle the frame updates if we use a hook.
      */}
      <TweenedSector {...props} targetRadius={targetRadius} />
    </motion.g>
  );
};

// Pure React State Animation (Dependency Free / Cleanest Logic)
// You can use this Hook without installing Framer Motion too.
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
  colors,
  height = 300,
  className,
  donut = false,
}: PieChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>();
  const isGhost = variant === "ghost";

  const innerRadius = donut ? "60%" : "0%";
  const outerRadius = isGhost ? "80%" : "90%";
  const paddingAngle = isGhost ? 0 : 4;
  const cornerRadius = isGhost ? 0 : 6;

  const onPieEnter = (_: any, idx: number) => {
    if (!isGhost) setActiveIndex(idx);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  return (
    <div
      className={clsx(
        "outline-none [&_.recharts-surface]:outline-none",
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
            // 2. IMPORTANT: Remove 'activeShape' and use 'shape'
            // We pass the selection state into the shape renderer manually
            shape={(props: any) => (
              <AnimatedSector
                {...props}
                isActive={props.index === activeIndex}
                cornerRadius={cornerRadius}
              />
            )}
            activeIndex={activeIndex}
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
