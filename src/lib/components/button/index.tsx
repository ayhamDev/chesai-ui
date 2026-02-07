import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import React from "react";
import useRipple from "use-ripple-hook";

export const buttonVariants = cva(
  "font-semibold cursor-pointer min-w-max focus-visible:outline-none transition-all duration-300 ease-in-out flex items-center justify-center relative overflow-hidden z-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary hover:shadow-md disabled:bg-primary/70 disabled:text-on-primary/70 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
        secondary:
          "bg-secondary-container text-on-secondary-container disabled:bg-secondary-container/70 disabled:text-on-secondary-container/70 hover:bg-secondary-container/80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
        tertiary:
          "bg-tertiary-container text-on-tertiary-container disabled:bg-tertiary-container/70 disabled:text-on-tertiary-container/70 hover:bg-tertiary-container/80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-tertiary",
        outline:
          "bg-transparent border border-outline text-primary disabled:opacity-50 disabled:border-outline/50 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
        destructive:
          "bg-error text-on-error disabled:bg-error/70 hover:bg-error/90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-error",
        ghost:
          "bg-transparent text-primary disabled:opacity-70 focus-visible:bg-primary/10 " +
          "after:absolute after:inset-0 after:z-[-1] after:bg-primary/10 after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] after:transition-all after:duration-200 after:ease-out " +
          "hover:after:opacity-100 hover:after:scale-100 " +
          "disabled:after:opacity-0",
        link: "bg-transparent text-primary disabled:opacity-70 hover:underline !p-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
      },
      size: {
        xs: "h-8 px-2 text-xs",
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-8 text-lg",
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

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "outline"
    | "destructive"
    | "ghost"
    | "link";
  size?: "xs" | "sm" | "md" | "lg";
  shape?: "full" | "minimal" | "sharp";
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size,
      shape,
      children,
      disabled,
      startIcon,
      endIcon,
      isLoading,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const localRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);

    // MD3 State Layer Logic:
    // Dark backgrounds (Primary, Destructive) -> White ripple (approx 10-12%)
    // Light/Transparent backgrounds (Secondary, Tertiary, Outline, Ghost) -> Black/Primary ripple (approx 10-12%)
    const rippleColor =
      variant === "primary" || variant === "destructive"
        ? "var(--color-ripple-dark)" // Defined in theme.css as rgba(255,255,255, 0.1)
        : "var(--color-ripple-light)"; // Defined in theme.css as rgba(0,0,0, 0.1)

    const rippleRef = localRef as React.RefObject<HTMLElement>;
    const [, event] = useRipple({
      ref: rippleRef,
      color: rippleColor,
      duration: 400,
      disabled: disabled || isLoading,
    });

    const loaderSizeMap = {
      xs: "h-4 w-4",
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };

    if (asChild) {
      return (
        <Slot
          className={clsx(
            buttonVariants({
              variant,
              size,
              shape,
              className,
              isLoading,
            }),
            disabled || isLoading ? "opacity-70 pointer-events-none" : "",
          )}
          ref={localRef}
          onPointerDown={(e: React.PointerEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            event(e);
          }}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={buttonVariants({
          variant,
          size,
          shape,
          className,
          isLoading,
        })}
        ref={localRef}
        onPointerDown={(e: React.PointerEvent<HTMLButtonElement>) => {
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
              <Loader2
                className={`animate-spin ease-[cubic-bezier(0.95,0.05,0.795,0.035)] ${
                  loaderSizeMap[size || "md"]
                }`}
              />
            </motion.div>
          ) : (
            <motion.span
              key="content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 flex items-center justify-center"
            >
              {startIcon && (
                <span className="mr-2 flex items-center">{startIcon}</span>
              )}
              {children}
              {endIcon && (
                <span className="ml-2 flex items-center">{endIcon}</span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    );
  },
);

Button.displayName = "Button";
