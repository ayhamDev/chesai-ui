import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import React from "react";
import useRipple from "use-ripple-hook";
import clsx from "clsx";
export const buttonVariants = cva(
  "font-semibold cursor-pointer  min-w-max focus:outline-none transition-all duration-300 ease-in-out flex items-center justify-center relative overflow-hidden",
  {
    variants: {
      variant: {
        primary:
          "bg-graphite-primary hover:shadow-md disabled:bg-graphite-primary/70  text-graphite-primaryForeground hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring ",
        secondary:
          "bg-graphite-secondary text-graphite-secondaryForeground disabled:bg-graphite-secondary/70 hover:bg-graphite-secondary/80  focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
        destructive:
          "bg-red-500 text-graphite-primaryForeground disabled:bg-red-500/70 hover:bg-red-600/80 focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
        ghost:
          "bg-transparent text-graphite-foreground disabled:opacity-70 hover:bg-graphite-secondary focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
        link: "bg-transparent text-graphite-primary disabled:opacity-70 hover:text-graphite-primary hover:underline !p-1 focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
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
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  isLoading?: boolean;
  /** If true, the button will render as a `Slot.Root` and merge its props onto the immediate child. */
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
            disabled || isLoading ? "opacity-70 pointer-events-none" : ""
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
  }
);

Button.displayName = "Button";
