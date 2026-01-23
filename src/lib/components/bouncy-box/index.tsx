import { clsx } from "clsx";
import { motion, type HTMLMotionProps } from "framer-motion";
import React from "react";

// Define the component's props, extending Framer Motion's div props
export interface BouncyBoxProps extends HTMLMotionProps<"div"> {
  /** The amount to scale down on press. 1 is no scale, 0.9 is 90%. */
  scaleAmount?: number;
}

export const BouncyBox = React.forwardRef<HTMLDivElement, BouncyBoxProps>(
  ({ className, children, scaleAmount = 0.95, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={clsx(
          "cursor-pointer inline-block", // Use inline-flex to wrap content tightly
          className
        )}
        // The magic prop: animates to this state while tapped/clicked
        whileTap={{ scale: scaleAmount }}
        // Configure the spring physics for a nice "bouncy" feel
        transition={{ type: "spring", stiffness: 400, damping: 30, mass: 3 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

BouncyBox.displayName = "BouncyBox";
