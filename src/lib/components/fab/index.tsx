import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  type Transition,
} from "framer-motion";
import React from "react";
import useRipple from "use-ripple-hook";

const fabVariants = cva(
  // Base styles: Removed specific color classes
  "font-semibold focus:outline-none flex transition-shadow duration-200  items-center justify-start relative overflow-hidden group shadow-lg hover:shadow-xl focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
  {
    variants: {
      // --- NEW: Variant property for color schemes ---
      variant: {
        primary: "bg-graphite-primary text-graphite-primaryForeground",
        secondary: "bg-graphite-secondary text-graphite-secondaryForeground",
      },
      size: {
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
      variant: "primary", // Default to the primary style
      size: "md",
      shape: "full",
    },
  }
);

export interface FABProps
  extends Omit<HTMLMotionProps<"button">, "children" | "ref"> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  shape?: "full" | "minimal" | "sharp";
  icon: React.ReactNode;
  isExtended?: boolean;
  children?: React.ReactNode;
}

const transition = {
  type: "spring",
  stiffness: 500,
  damping: 40,
  mass: 1,
} as Transition;

export const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  (
    {
      className,
      variant, // Destructure the new variant prop
      size,
      shape,
      children,
      disabled,
      icon,
      isExtended,
      ...props
    },
    ref
  ) => {
    const localRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);
    const rippleRef = localRef as React.RefObject<HTMLElement>;

    // Adjust ripple color based on variant
    const rippleColor =
      variant === "primary" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.1)";

    const [, event] = useRipple({
      ref: rippleRef,
      color: rippleColor,
      duration: 400,
      disabled: disabled,
    });

    const fabSize = fabSizeMap[size || "md"];

    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          paddingLeft: isExtended ? fabSize / 2 : fabSize / 4,
          paddingRight: isExtended ? fabSize / 2 : fabSize / 4,
        }}
        transition={transition}
        className={clsx(
          fabVariants({ variant, size, shape, className }), // Pass variant to CVA
          !isExtended && "justify-center"
        )}
        ref={localRef}
        onPointerDown={event}
        disabled={disabled}
        {...props}
      >
        <motion.span layout="position" className="flex-shrink-0 z-10">
          {icon}
        </motion.span>

        <AnimatePresence>
          {isExtended && (
            <motion.div
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
    );
  }
);

const fabSizeMap: Record<string, number> = {
  sm: 40,
  md: 56,
  lg: 64,
};

FAB.displayName = "FAB";
