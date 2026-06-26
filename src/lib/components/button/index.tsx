import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import useRipple from "use-ripple-hook";
import { LoadingIndicator } from "../loadingIndicator";

export const buttonVariants = cva(
  // Added 'transition-all duration-300 ease-in-out' to ensure out-of-the-box browser transitions
  "font-button select-none font-semibold cursor-pointer active:scale-95 min-w-max focus-visible:outline-none transition-all duration-300 ease-in-out flex items-center justify-center relative overflow-hidden z-0",
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
        xl: "h-20 px-10 text-xl [&_svg]:size-8",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-2xl",
        sharp: "rounded-none",
      },
      isLoading: {
        true: "cursor-wait !px-0 !min-w-0 !pointer-events-none !opacity-100",
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
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "full" | "minimal" | "sharp";
  isLoading?: boolean;
  isActive?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  asChild?: boolean;
}

const spinnerSizeMap = {
  xs: "w-8",
  sm: "w-10",
  md: "w-12",
  lg: "w-14",
  xl: "w-20",
};

const loadingRadiusMap: Record<NonNullable<ButtonProps["size"]>, string> = {
  xs: "16px",
  sm: "20px",
  md: "24px",
  lg: "28px",
  xl: "40px",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      shape = "full",
      children,
      disabled,
      startIcon,
      endIcon,
      isLoading,
      isActive,
      asChild = false,
      style,
      ...props
    },
    ref,
  ) => {
    const localRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);

    const rippleColor =
      variant === "primary" || variant === "destructive"
        ? "var(--color-ripple-light)"
        : "var(--color-ripple-dark)";

    const rippleRef = localRef as React.RefObject<HTMLElement>;
    const [, event] = useRipple({
      ref: rippleRef,
      color: rippleColor,
      duration: 400,
      disabled: disabled || isLoading,
    });

    const dynamicStyle = {
      ...style,
      ...(isLoading && shape !== "full"
        ? { borderRadius: loadingRadiusMap[size] }
        : {}),
    };

    if (asChild) {
      const SlotComp = Slot as any;
      return (
        <SlotComp
          className={clsx(
            buttonVariants({ variant, size, shape, className, isLoading }),
            disabled || isLoading ? "opacity-70 pointer-events-none" : "",
          )}
          style={dynamicStyle}
          ref={localRef}
          onPointerDown={(e: React.PointerEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            event(e);
          }}
          {...props}
        >
          {children}
        </SlotComp>
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
        style={dynamicStyle}
        ref={localRef}
        onPointerDown={(e: React.PointerEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          event(e);
        }}
        disabled={disabled || isLoading}
        {...props}
      >
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="spinner"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            >
              <LoadingIndicator
                variant="material-morph"
                className={`p-1 ${
                  variant === "primary" || variant === "destructive"
                    ? "text-on-primary"
                    : "text-primary"
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={clsx(
            "pointer-events-none transition-all duration-300 ease-in-out",
            isLoading ? spinnerSizeMap[size] : "w-0",
          )}
        />

        <motion.div
          initial={false}
          animate={{
            width: isLoading ? 0 : "auto",
            opacity: isLoading ? 0 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex items-center justify-center overflow-hidden whitespace-nowrap"
        >
          <div className="flex items-center justify-center">
            {/* Animated Start Icon Container */}
            <AnimatePresence initial={false}>
              {startIcon && (
                <motion.span
                  initial={{ width: 0, opacity: 0, marginRight: 0 }}
                  animate={{ width: "auto", opacity: 1, marginRight: 8 }}
                  exit={{ width: 0, opacity: 0, marginRight: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="flex items-center overflow-hidden whitespace-nowrap"
                >
                  {startIcon}
                </motion.span>
              )}
            </AnimatePresence>

            {children}

            {/* Animated End Icon Container */}
            <AnimatePresence initial={false}>
              {endIcon && (
                <motion.span
                  initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                  animate={{ width: "auto", opacity: 1, marginLeft: 8 }}
                  exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="flex items-center overflow-hidden whitespace-nowrap"
                >
                  {endIcon}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </button>
    );
  },
);

Button.displayName = "Button";
