"use client";

import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import {
  animate,
  cubicBezier,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import * as React from "react";
import { twMerge } from "tailwind-merge";

// --- Types ---

export type SwipeType = "trigger" | "dismiss" | "reveal";

export interface SwipeAction {
  icon?: React.ReactNode;
  label?: string;
  onClick: () => void | Promise<void>;
  color?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "error"
    | "destructive"
    | (string & {});
  className?: string;
}

export interface SwipeableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  type?: SwipeType;
  threshold?: number;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  leftOffset?: number;
  rightOffset?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  disabled?: boolean;
}

interface SwipeableContextProps {
  x: MotionValue<number>;
  isDismissed: boolean;
  setIsDismissed: React.Dispatch<React.SetStateAction<boolean>>;
  type: SwipeType;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  leftOffset: number;
  rightOffset: number;
  threshold: number;
  disabled: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const SwipeableContext = React.createContext<SwipeableContextProps | null>(
  null,
);

export const useSwipeable = () => React.useContext(SwipeableContext);

// --- Helpers ---

const getActionBgClass = (color?: string) => {
  switch (color) {
    case "primary":
      return "bg-primary text-on-primary";
    case "secondary":
      return "bg-secondary-container text-on-secondary-container";
    case "tertiary":
      return "bg-tertiary-container text-on-tertiary-container";
    case "error":
    case "destructive":
      return "bg-error text-on-error";
    default:
      return color || "bg-secondary-container text-on-secondary-container";
  }
};

// --- Compound Components ---

const SwipeableRoot = React.forwardRef<HTMLDivElement, SwipeableProps>(
  (
    {
      children,
      type = "trigger",
      threshold = 100,
      leftAction,
      rightAction,
      leftOffset = 80,
      rightOffset = 80,
      onSwipeLeft,
      onSwipeRight,
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    const x = useMotionValue(0);
    const [isDismissed, setIsDismissed] = React.useState(false);

    React.useEffect(() => {
      if (disabled) {
        x.set(0);
        setIsDismissed(false);
      }
    }, [disabled, x]);

    const contextValue = React.useMemo(
      () => ({
        x,
        isDismissed,
        setIsDismissed,
        type,
        leftAction,
        rightAction,
        leftOffset,
        rightOffset,
        threshold,
        disabled,
        onSwipeLeft,
        onSwipeRight,
      }),
      [
        x,
        isDismissed,
        type,
        leftAction,
        rightAction,
        leftOffset,
        rightOffset,
        threshold,
        disabled,
        onSwipeLeft,
        onSwipeRight,
      ],
    );

    return (
      <SwipeableContext.Provider value={contextValue}>
        <motion.div
          ref={ref}
          className={twMerge(
            clsx(
              "relative w-full overflow-hidden z-0 bg-transparent transform-gpu will-change-[height,opacity] transition-all duration-200 ease-out",
              className,
            ),
          )}
          animate={
            isDismissed
              ? {
                  height: 0,
                  opacity: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  paddingTop: 0,
                  paddingBottom: 0,
                  border: "none",
                }
              : {}
          }
          transition={{ duration: 0.22, ease: [0.4, 0, 1, 1] }}
          {...(props as any)}
        >
          {children}
        </motion.div>
      </SwipeableContext.Provider>
    );
  },
);
SwipeableRoot.displayName = "Swipeable";

export interface SwipeableContentProps extends React.ComponentPropsWithoutRef<
  typeof motion.div
> {
  asChild?: boolean;
}

const SwipeableContent = React.forwardRef<
  HTMLDivElement,
  SwipeableContentProps
>(({ className, children, asChild, ...props }, ref) => {
  const context = useSwipeable();
  if (!context) return <>{children}</>;

  const {
    x,
    type,
    disabled,
    leftAction,
    rightAction,
    leftOffset,
    rightOffset,
    threshold,
    setIsDismissed,
    onSwipeLeft,
    onSwipeRight,
  } = context;

  const stableConstraints = {
    left: type === "reveal" ? (rightAction ? -rightOffset : 0) : -1000,
    right: type === "reveal" ? (leftAction ? leftOffset : 0) : 1000,
  };

  const handleDragEnd = (e: any, info: any) => {
    if (disabled) return;

    const offsetX = info?.offset?.x ?? 0;
    const currentX = x.get();
    let targetX = 0;

    const tweenAnimationOptions = {
      type: "tween",
      ease: cubicBezier(0.05, 0.7, 0.2, 1),
      duration: 0.28,
    } as const;

    if (type === "dismiss") {
      if (offsetX > threshold && leftAction) {
        targetX = 600;
        animate(x, targetX, { type: "tween", duration: 0.2 }).then(() => {
          setIsDismissed(true);
          leftAction.onClick?.();
          onSwipeRight?.();
        });
        return;
      } else if (offsetX < -threshold && rightAction) {
        targetX = -600;
        animate(x, targetX, { type: "tween", duration: 0.2 }).then(() => {
          setIsDismissed(true);
          rightAction.onClick?.();
          onSwipeLeft?.();
        });
        return;
      }
    } else if (type === "reveal") {
      const thresholdRight = leftOffset / 2;
      const thresholdLeft = rightOffset / 2;

      if (currentX > thresholdRight && leftAction) {
        targetX = leftOffset;
      } else if (currentX < -thresholdLeft && rightAction) {
        targetX = -rightOffset;
      }
    } else {
      if (offsetX > threshold && leftAction) {
        leftAction.onClick?.();
        onSwipeRight?.();
      } else if (offsetX < -threshold && rightAction) {
        rightAction.onClick?.();
        onSwipeLeft?.();
      }
    }

    animate(x, targetX, tweenAnimationOptions);
  };

  const handleItemClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (Math.abs(x.get()) > 5) {
      if (type === "reveal" && Math.abs(x.get()) > 10) {
        e.stopPropagation();
        e.preventDefault();
        animate(x, 0, {
          type: "tween",
          ease: [0.05, 0.7, 0.1, 1],
          duration: 0.25,
        });
      }
      return;
    }
  };

  const Comp = (asChild ? Slot : motion.div) as any;

  return (
    <Comp
      ref={ref}
      style={{ x }}
      drag={disabled ? false : "x"}
      dragDirectionLock
      dragConstraints={stableConstraints}
      dragElastic={type === "reveal" ? 0.2 : 0.3}
      onDragEnd={handleDragEnd}
      onClickCapture={handleItemClickCapture}
      className={twMerge(
        clsx(
          "relative z-10 w-full rounded-[inherit] cursor-pointer transform-gpu will-change-transform select-none touch-pan-y",
          className,
        ),
      )}
      {...props}
    >
      {children}
    </Comp>
  );
});
SwipeableContent.displayName = "Swipeable.Content";

export interface SwipeableActionProps extends React.HTMLAttributes<HTMLDivElement> {
  side: "left" | "right";
  asChild?: boolean;
}

const SwipeableAction = React.forwardRef<HTMLDivElement, SwipeableActionProps>(
  ({ side, className, children, ...props }, ref) => {
    const context = useSwipeable();
    if (!context) return null;

    const { x, leftAction, rightAction } = context;

    const width = useTransform(
      x,
      side === "left" ? [-1000, 0, 1000] : [-1000, 0, 1000],
      side === "left" ? [0, 0, 1000] : [1000, 0, 0],
    );

    const opacity = useTransform(
      x,
      side === "left" ? [0, 50] : [0, -50],
      side === "left" ? [0, 1] : [0, 1],
    );

    const activeAction = side === "left" ? leftAction : rightAction;
    if (!activeAction) return null;

    const bgClass = getActionBgClass(activeAction.color);

    return (
      <motion.div
        ref={ref}
        style={{ width }}
        className={twMerge(
          clsx(
            "absolute inset-y-0 flex items-center justify-center overflow-hidden z-0 transform-gpu will-change-[width,opacity] rounded-[inherit]",
            side === "left" ? "left-0" : "right-0",
            bgClass,
            activeAction.className,
            className,
          ),
        )}
        {...(props as any)}
      >
        <motion.div
          style={{ opacity }}
          className="flex flex-col items-center justify-center gap-1.5 px-6 text-center select-none min-w-max shrink-0 overflow-hidden"
        >
          {children || (
            <>
              {activeAction.icon && (
                <div className="shrink-0">{activeAction.icon}</div>
              )}
              {activeAction.label && (
                <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                  {activeAction.label}
                </span>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    );
  },
);
SwipeableAction.displayName = "Swipeable.Action";

export const Swipeable = Object.assign(SwipeableRoot, {
  Content: SwipeableContent,
  Action: SwipeableAction,
});
