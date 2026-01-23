import { cva } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import useRipple from "use-ripple-hook";

export const iconButtonVariants = cva(
  "font-semibold focus:outline-none min-w-max transition-all duration-300 ease-in-out flex items-center justify-center relative overflow-hidden p-0 z-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary disabled:bg-primary/70 text-on-primary hover:opacity-90 focus:ring-1 focus:ring-offset-2 focus:ring-primary",
        secondary:
          "bg-secondary-container disabled:bg-secondary-container/70 text-on-secondary-container hover:bg-secondary-container/80 focus:ring-1 focus:ring-offset-2 focus:ring-primary",
        destructive:
          "bg-error text-on-error disabled:bg-error/70 hover:bg-error/90 focus:ring-1 focus:ring-offset-2 focus:ring-error",
        ghost:
          "bg-transparent text-on-surface-variant disabled:opacity-70 focus:bg-primary/10 " +
          "after:absolute after:inset-0 after:z-[-1] after:bg-primary/5 after:opacity-0 after:scale-50 after:origin-center after:rounded-[inherit] after:transition-all after:duration-300 after:ease-out " +
          "hover:after:opacity-100 hover:after:scale-100 " +
          "disabled:after:opacity-0",
        link: "bg-transparent text-primary disabled:opacity-70 hover:text-primary hover:underline !p-1 focus:ring-1 focus:ring-offset-2 focus:ring-primary",
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
  },
);

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost" | "link";
  size?: "xs" | "sm" | "md" | "lg";
  shape?: "full" | "minimal" | "sharp";
  isLoading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = "primary",
      size,
      shape,
      children,
      disabled,
      isLoading,
      ...props
    },
    ref,
  ) => {
    const localRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);
    const rippleRef = localRef as React.RefObject<HTMLElement>;

    const rippleColor =
      variant === "primary" || variant === "destructive"
        ? "var(--color-ripple-dark)"
        : "var(--color-ripple-light)";

    const [, event] = useRipple({
      ref: rippleRef,
      color: rippleColor,
      duration: 400,
      disabled: disabled || isLoading,
    });

    const loaderSizeMap = {
      xs: "h-4 w-4",
      sm: "h-5 w-5",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    };

    const [isPressed, setIsPressed] = useState(false);

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
          setIsPressed(true);
        }}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
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
              <Loader2
                className={`animate-spin ${loaderSizeMap[size || "md"]}`}
              />
            </motion.div>
          ) : (
            <motion.span
              key="content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: isPressed ? 0.85 : 1,
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 flex items-center justify-center"
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
