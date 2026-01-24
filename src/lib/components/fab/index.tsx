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
  "font-semibold focus:outline-none flex transition-shadow duration-200 items-center justify-start relative overflow-hidden group shadow-lg hover:shadow-xl focus:ring-2 focus:ring-offset-2 focus:ring-primary",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-container text-on-primary-container hover:bg-primary-container/90",
        secondary: "bg-secondary text-on-secondary hover:bg-secondary/90",
        tertiary:
          "bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-container/90",
        outline:
          "bg-surface text-primary border border-outline hover:bg-primary/5 shadow-sm hover:shadow-md",
      },
      size: {
        sm: "h-10",
        md: "h-14",
        lg: "h-16",
        xl: "h-24 text-2xl [&_svg]:size-8", // Extra large size for major actions
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-2xl",
        sharp: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "full",
    },
  },
);

export interface FABProps extends Omit<
  HTMLMotionProps<"button">,
  "children" | "ref"
> {
  variant?: "primary" | "secondary" | "tertiary" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
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
      variant = "primary",
      size,
      shape,
      children,
      disabled,
      icon,
      isExtended,
      style,
      ...props
    },
    ref,
  ) => {
    const localRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);
    const rippleRef = localRef as React.RefObject<HTMLElement>;

    // Outline and Secondary use the dark ripple for better contrast on lighter backgrounds.
    const rippleColor =
      variant === "secondary" || variant === "outline"
        ? "var(--color-ripple-dark)"
        : "var(--color-ripple-light)";

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
          // Original padding math restored for perfect centering
          paddingLeft: isExtended ? fabSize / 2 : fabSize / 4,
          paddingRight: isExtended ? fabSize / 2 : fabSize / 4,
        }}
        transition={transition}
        className={clsx(
          fabVariants({ variant, size, shape, className }),
          // Restored original justification logic
          !isExtended && "justify-center",
        )}
        style={{
          willChange: "transform, opacity",
          ...style,
        }}
        ref={localRef}
        onPointerDown={event}
        disabled={disabled}
        {...props}
      >
        {/* Restored layout="position" to fix the icon jumping/sliding during transition */}
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
  },
);

const fabSizeMap: Record<string, number> = {
  sm: 40,
  md: 56,
  lg: 64,
  xl: 96, // Value for XL
};

FAB.displayName = "FAB";
