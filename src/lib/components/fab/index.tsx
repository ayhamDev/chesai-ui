import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  type Transition,
} from "framer-motion";
import React from "react";
import useRipple from "use-ripple-hook";
import { BouncyBox } from "../bouncy-box";

const fabVariants = cva(
  // We ensure justify-start is the base, and will conditionally add justify-center
  "font-semibold focus:outline-none flex items-center justify-start relative overflow-hidden group bg-graphite-primary text-graphite-primaryForeground shadow-lg hover:shadow-xl focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
  {
    variants: {
      size: {
        // We only need height here, as width and padding will be animated
        sm: "h-10",
        md: "h-14",
        lg: "h-16",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-2xl",
        sharp: "rounded-none",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "full",
    },
  }
);

export interface FABProps
  extends Omit<HTMLMotionProps<"button">, "children" | "ref">,
    VariantProps<typeof fabVariants> {
  icon: React.ReactNode;
  isExtended?: boolean;
  children?: React.ReactNode;
}

// A more refined spring transition for a smoother feel
const transition = {
  type: "spring",
  stiffness: 500,
  damping: 40,
  mass: 1,
} as Transition;

export const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  (
    { className, size, shape, children, disabled, icon, isExtended, ...props },
    ref
  ) => {
    const localRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);
    const rippleRef = localRef as React.RefObject<HTMLElement>;
    const [, event] = useRipple({
      ref: rippleRef,
      color: "rgba(255, 255, 255, 0.3)",
      duration: 400,
      disabled: disabled,
    });

    const fabSize = fabSizeMap[size || "md"];

    return (
      <BouncyBox scaleAmount={0.95}>
        <motion.button
          // Animate padding to control the container size
          animate={{
            paddingLeft: isExtended ? fabSize / 2 : fabSize / 4, // 24px extended, dynamic when collapsed
            paddingRight: isExtended ? fabSize / 2 : fabSize / 4,
          }}
          transition={transition}
          className={clsx(
            fabVariants({ size, shape, className }),
            // Center the content ONLY when collapsed
            !isExtended && "justify-center"
          )}
          ref={localRef}
          onPointerDown={event}
          disabled={disabled}
          {...props}
        >
          {/* The Icon: Add the magic `layout` prop */}
          <motion.span layout="position" className="flex-shrink-0 z-10">
            {icon}
          </motion.span>

          <AnimatePresence>
            {isExtended && (
              <motion.div
                // Animate width from 0 to auto
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1, marginLeft: "0.75rem" }}
                exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                transition={transition}
                className="whitespace-nowrap overflow-hidden"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </BouncyBox>
    );
  }
);

const fabSizeMap: Record<string, number> = {
  sm: 40,
  md: 56,
  lg: 64,
};

FAB.displayName = "FAB";
