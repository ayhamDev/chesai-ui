// 1. Install this dependency first:
// npm install @uidotdev/usehooks

import {
  arrow,
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
// 2. Import the new hooks from the library
import { useLongPress, useMediaQuery } from "@uidotdev/usehooks";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import React, {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// CVA definition remains unchanged
const tooltipVariants = cva("font-semibold relative z-50", {
  variants: {
    variant: {
      primary: "bg-graphite-primary text-graphite-primaryForeground",
      secondary: "bg-graphite-secondary text-graphite-secondaryForeground",
    },
    size: {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1.5 text-sm",
      lg: "px-4 py-2 text-base",
    },
    shape: {
      full: "rounded-full",
      minimal: "rounded-lg",
      sharp: "rounded-none",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    shape: "minimal",
  },
});

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  shape?: "full" | "minimal" | "sharp";
}
// Context type remains unchanged
interface TooltipContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getReferenceProps: (
    userProps?: React.HTMLProps<HTMLElement> | undefined
  ) => Record<string, unknown>;
  getFloatingProps: (
    userProps?: React.HTMLProps<HTMLElement> | undefined
  ) => Record<string, unknown>;
  floatingStyles: React.CSSProperties;
  refs: {
    setReference: (node: HTMLElement | null) => void;
    setFloating: (node: HTMLElement | null) => void;
  };
  middlewareData: ReturnType<typeof useFloating>["middlewareData"];
  placement: ReturnType<typeof useFloating>["placement"];
  arrowRef: React.RefObject<HTMLDivElement>;
}

const TooltipContext = createContext<TooltipContextType | null>(null);

export const useTooltip = (): TooltipContextType => {
  const context = useContext(TooltipContext);
  if (context == null) {
    throw new Error(
      "Tooltip components must be wrapped in <TooltipProvider />"
    );
  }
  return context;
};

// ==================== TooltipProvider (Refactored) ====================

export const TooltipProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef<HTMLDivElement>(null);

  // 3. Use useMediaQuery to detect touch devices reliably
  const isTouchDevice = useMediaQuery("(pointer: coarse)");

  const data = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(10),
      flip(),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
    strategy: "fixed",
    placement: "top",
  });

  const context = data.context;

  // Interactions from @floating-ui/react
  const hover = useHover(context, { enabled: !isTouchDevice, move: false });
  const focus = useFocus(context, { enabled: !isTouchDevice });
  const dismiss = useDismiss(context, { referencePress: !isTouchDevice });
  const role = useRole(context, { role: "tooltip" });

  // 4. Use useLongPress from the library
  // The callback is only passed if it's a touch device, otherwise it's null.
  const longPressEvents = useLongPress(
    isTouchDevice ? () => setIsOpen(true) : null,
    { threshold: 500 } // Long press duration
  );

  // useInteractions only manages the Floating UI native hooks
  const interactions = useInteractions([hover, focus, dismiss, role]);

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      // 5. Manually merge the props from useInteractions and useLongPress
      getReferenceProps: (userProps) => ({
        ...interactions.getReferenceProps(userProps),
        ...(isTouchDevice ? longPressEvents : {}),
      }),
      getFloatingProps: interactions.getFloatingProps,
      floatingStyles: data.floatingStyles,
      refs: data.refs,
      middlewareData: data.middlewareData,
      placement: data.placement,
      arrowRef,
    }),
    [
      isOpen,
      interactions,
      isTouchDevice,
      longPressEvents,
      data.floatingStyles,
      data.refs,
      data.middlewareData,
      data.placement,
    ]
  );

  return (
    <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>
  );
};

// =====================================================================

// TooltipTrigger and mergeRefs remain unchanged
function mergeRefs<T>(
  refs: Array<React.MutableRefObject<T> | React.LegacyRef<T> | null | undefined>
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}
export const TooltipTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLProps<HTMLElement> & { asChild?: boolean }
>(function TooltipTrigger({ children, asChild = true, ...props }, propRef) {
  const context = useTooltip();
  const childrenRef = (children as any)?.ref;
  const ref = useMemo(
    () => mergeRefs([propRef, childrenRef, context.refs.setReference]),
    [propRef, childrenRef, context.refs.setReference]
  );
  if (!isValidElement(children)) {
    console.warn("TooltipTrigger expects a single React element as a child");
    return (
      <span
        ref={ref as any}
        {...context.getReferenceProps(props)}
        data-state={context.isOpen ? "open" : "closed"}
      >
        {children}
      </span>
    );
  }
  const childProps = children.props as Record<string, any>;
  return cloneElement(
    children,
    context.getReferenceProps({
      ref,
      ...props,
      ...childProps,
    })
  );
});

// Tooltip component remains unchanged
export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, variant, size, shape, style, children, ...props }, ref) => {
    const context = useTooltip();
    const [isMounted, setIsMounted] = useState(false);
    const mergedRef = useMemo(
      () => mergeRefs([ref, context.refs.setFloating]),
      [ref, context.refs.setFloating]
    );
    useEffect(() => {
      if (context.isOpen) {
        const timer = setTimeout(() => setIsMounted(true), 10);
        return () => clearTimeout(timer);
      } else {
        setIsMounted(false);
      }
    }, [context.isOpen]);
    if (!context.isOpen) return null;

    const staticSide = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    }[context.placement.split("-")[0]] as string;
    const arrowColorClass = {
      primary: "bg-graphite-primary",
      secondary: "bg-graphite-secondary",
    }[variant || "primary"];

    return (
      <FloatingPortal>
        <div
          ref={mergedRef}
          className={tooltipVariants({ variant, size, shape, className })}
          style={{
            ...context.floatingStyles,
            ...style,
            visibility: context.floatingStyles.transform ? "visible" : "hidden",
            opacity: isMounted ? 1 : 0,
            transition: "opacity 200ms ease-in-out",
          }}
          {...context.getFloatingProps(props)}
        >
          {children}
          <div
            ref={context.arrowRef}
            className={clsx("absolute h-2 w-2 rotate-45", arrowColorClass)}
            style={{
              left: context.middlewareData.arrow?.x ?? "",
              top: context.middlewareData.arrow?.y ?? "",
              [staticSide]: "-4px",
            }}
          />
        </div>
      </FloatingPortal>
    );
  }
);
Tooltip.displayName = "Tooltip";
