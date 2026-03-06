// src/lib/components/fab-menu/index.tsx
"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import useRipple from "use-ripple-hook";

// --- CONTEXT ---
interface FABMenuContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  direction: "up" | "down" | "left" | "right";
  align: "start" | "center" | "end";
}

const FABMenuContext = createContext<FABMenuContextType | null>(null);

export const useFABMenu = () => {
  const ctx = useContext(FABMenuContext);
  if (!ctx) throw new Error("useFABMenu must be used inside <FABMenu>");
  return ctx;
};

// --- ROOT COMPONENT ---
export interface FABMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The direction the menu items expand towards. */
  direction?: "up" | "down" | "left" | "right";
  /** How the menu items align relative to the trigger button. */
  align?: "start" | "center" | "end";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** If true, renders a subtle darkened backdrop behind the menu. */
  overlay?: boolean;
}

const FABMenuRoot = React.forwardRef<HTMLDivElement, FABMenuProps>(
  (
    {
      direction = "up",
      align = "center",
      open,
      onOpenChange,
      overlay = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = open !== undefined ? open : internalOpen;

    const toggle = () => {
      const next = !isOpen;
      setInternalOpen(next);
      onOpenChange?.(next);
    };

    const close = () => {
      setInternalOpen(false);
      onOpenChange?.(false);
    };

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!isOpen) return;
      const handleOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          close();
        }
      };
      document.addEventListener("mousedown", handleOutside);
      return () => document.removeEventListener("mousedown", handleOutside);
    }, [isOpen]);

    return (
      <FABMenuContext.Provider
        value={{ isOpen, toggle, close, direction, align }}
      >
        <div
          ref={ref}
          className={clsx(
            "relative inline-flex items-center justify-center",
            isOpen ? "z-50" : "z-0",
            className,
          )}
          {...props}
        >
          {overlay && (
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-surface/70  -z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    close();
                  }}
                />
              )}
            </AnimatePresence>
          )}
          <div
            ref={containerRef}
            className="relative inline-flex items-center justify-center w-full h-full"
          >
            {children}
          </div>
        </div>
      </FABMenuContext.Provider>
    );
  },
);
FABMenuRoot.displayName = "FABMenu";

// --- TRIGGER COMPONENT ---
const FABMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, asChild, onClick, ...props }, ref) => {
  const { toggle } = useFABMenu();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggle();
    onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      // @ts-ignore
      onClick: handleClick,
      ref,
      ...props,
    });
  }

  return (
    <button onClick={handleClick} ref={ref} {...props}>
      {children}
    </button>
  );
});
FABMenuTrigger.displayName = "FABMenu.Trigger";

// --- LIST COMPONENT ---
const FABMenuList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const { isOpen, direction, align } = useFABMenu();

  let base = "absolute flex gap-3 z-50 ";
  if (direction === "up") base += "bottom-full mb-4 flex-col-reverse ";
  if (direction === "down") base += "top-full mt-4 flex-col ";
  if (direction === "left") base += "right-full mr-4 flex-row-reverse ";
  if (direction === "right") base += "left-full ml-4 flex-row ";

  if (direction === "up" || direction === "down") {
    if (align === "start") base += "left-0 items-start";
    if (align === "center") base += "left-1/2 -translate-x-1/2 items-center";
    if (align === "end") base += "right-0 items-end";
  } else {
    if (align === "start") base += "top-0 items-start";
    if (align === "center") base += "top-1/2 -translate-y-1/2 items-center";
    if (align === "end") base += "bottom-0 items-end";
  }

  return (
    <AnimatePresence>
      {isOpen && (
        // @ts-ignore
        <motion.div
          ref={ref}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={{
            visible: {
              transition: { staggerChildren: 0.05, delayChildren: 0 },
            },
            hidden: {
              transition: { staggerChildren: 0.05, staggerDirection: -1 },
            },
          }}
          className={clsx(base, className)}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
FABMenuList.displayName = "FABMenu.List";

// --- ITEM COMPONENT ---
const fabMenuItemVariants = cva(
  "flex items-center gap-3 rounded-full font-semibold transition-colors shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary whitespace-nowrap cursor-pointer z-0 overflow-hidden",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-container text-on-primary-container hover:bg-primary-container/80",
        secondary:
          "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80",
        tertiary:
          "bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-container/80",
        surface:
          "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
      },
      size: {
        sm: "px-4 py-2 [&>span>svg]:w-4 [&>span>svg]:h-4 text-xs",
        md: "px-5 py-2.5 [&>span>svg]:w-5[&>span>svg]:h-5 text-sm",
        lg: "px-6 py-3[&>span>svg]:w-6 [&>span>svg]:h-6 text-base",
      },
      iconOnly: {
        true: "px-0 aspect-square justify-center",
        false: "",
      },
    },
    compoundVariants: [
      { size: "sm", iconOnly: true, className: "w-9" },
      { size: "md", iconOnly: true, className: "w-11" },
      { size: "lg", iconOnly: true, className: "w-14" },
    ],
    defaultVariants: {
      variant: "secondary",
      size: "md",
      iconOnly: false,
    },
  },
);

export interface FABMenuItemProps
  extends
    Omit<HTMLMotionProps<"button">, "ref">,
    VariantProps<typeof fabMenuItemVariants> {
  icon?: React.ReactNode;
  label?: React.ReactNode;
}

const FABMenuItem = React.forwardRef<HTMLButtonElement, FABMenuItemProps>(
  ({ icon, label, className, variant, size, onClick, ...props }, ref) => {
    const { close, direction } = useFABMenu();
    const localRef = React.useRef<HTMLButtonElement>(null);
    // @ts-ignore
    React.useImperativeHandle(ref, () => localRef.current!);

    const rippleColor = "var(--color-ripple-dark)";
    const [, event] = useRipple({
      // @ts-ignore
      ref: localRef,
      color: rippleColor,
      duration: 400,
    });

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      close();
    };

    // Items slide in from the direction of the parent FAB
    const itemVariants = {
      hidden: {
        opacity: 0,
        scale: 0.8,
        y: direction === "up" ? 15 : direction === "down" ? -15 : 0,
        x: direction === "left" ? 15 : direction === "right" ? -15 : 0,
      },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        x: 0,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      },
    };

    const iconOnly = !label;

    return (
      <motion.button
        ref={localRef}
        // @ts-ignore
        variants={itemVariants}
        onPointerDown={event}
        onClick={handleClick}
        className={clsx(
          fabMenuItemVariants({ variant, size, iconOnly, className }),
        )}
        {...props}
      >
        {icon && (
          <span className="flex items-center justify-center opacity-80 z-10">
            {icon}
          </span>
        )}
        {label && <span className="z-10">{label}</span>}
      </motion.button>
    );
  },
);
FABMenuItem.displayName = "FABMenu.Item";

export const FABMenu = Object.assign(FABMenuRoot, {
  Trigger: FABMenuTrigger,
  List: FABMenuList,
  Item: FABMenuItem,
});
