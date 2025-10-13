import { cva } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react"; // Import Loader from lucide-react
import React from "react";
import useRipple from "use-ripple-hook";

export const iconButtonVariants = cva(
  "font-semibold focus:outline-none min-w-max transition-all duration-300 ease-in-out flex items-center justify-center relative overflow-hidden p-0",
  {
    variants: {
      variant: {
        primary:
          "bg-graphite-primary disabled:bg-graphite-primary/70 text-graphite-primaryForeground hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
        secondary:
          "bg-graphite-secondary disabled:bg-graphite-secondary/70 text-graphite-secondaryForeground hover:bg-graphite-secondary/80  focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
        destructive:
          "bg-red-500 text-graphite-primaryForeground disabled:bg-red-500/70 hover:bg-red-600/80 focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
        ghost:
          "bg-transparent disabled:opacity-70 text-graphite-foreground hover:bg-graphite-secondary focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
        link: "bg-transparent disabled:opacity-70 text-graphite-primary hover:text-graphite-primary hover:underline !p-1 focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
      },
      size: {
        xs: "h-8 w-8",
        sm: "h-10 w-10",
        md: "h-12 w-12",
        lg: "h-14 w-14",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-lg",
        sharp: "rounded-none",
      },
      isLoading: {
        true: "cursor-wait",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "full",
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost" | "link";
  size?: "xs" | "sm" | "md" | "lg";
  shape?: "full" | "minimal" | "sharp";
  isLoading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      children,
      disabled,
      isLoading,
      ...props
    },
    ref
  ) => {
    const localRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);
    const rippleColor =
      variant === "primary" || variant === "destructive"
        ? "rgba(255, 255, 255, 0.4)"
        : "rgba(0, 0, 0, 0.1)";
    const rippleRef = localRef as React.RefObject<HTMLElement>;
    const [, event] = useRipple({
      ref: rippleRef,
      color: rippleColor,
      duration: 600,
      disabled: disabled || isLoading,
    });

    const loaderSizeMap = {
      xs: "h-4 w-4",
      sm: "h-5 w-5",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    };

    return (
      <button
        className={iconButtonVariants({
          variant,
          size,
          shape,
          className,
          isLoading,
        })}
        ref={localRef}
        onPointerDown={(e) => {
          e.stopPropagation();
          event(e);
        }}
        disabled={disabled || isLoading}
        {...props}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isLoading ? (
            <motion.div
              key="spinner"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              {/* Use lucide-react Loader with animate-spin */}
              <Loader2
                className={`animate-spin ${loaderSizeMap[size || "md"]}`}
              />
            </motion.div>
          ) : (
            <motion.span
              key="content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
