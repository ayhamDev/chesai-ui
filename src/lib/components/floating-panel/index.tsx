"use client";

import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { IconButton } from "../icon-button";

// --- TYPES ---

export type FloatingPanelPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "left-center"
  | "right-center"
  | "center";

export type FloatingPanelVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "surface"
  | "surface-lowest"
  | "ghost";

interface FloatingPanelContextValue {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  triggerVariant: FloatingPanelVariant;
  panelVariant: FloatingPanelVariant;
}

const FloatingPanelContext = createContext<FloatingPanelContextValue | null>(
  null,
);

export const useFloatingPanel = () => {
  const context = useContext(FloatingPanelContext);
  if (!context) {
    throw new Error(
      "FloatingPanel components must be used within a <FloatingPanel>",
    );
  }
  return context;
};

// --- UTILS ---

const variantClasses: Record<FloatingPanelVariant, string> = {
  primary: "bg-primary text-on-primary",
  secondary: "bg-secondary-container text-on-secondary-container",
  tertiary: "bg-tertiary-container text-on-tertiary-container",
  surface: "bg-surface-container-high text-on-surface",
  "surface-lowest": "bg-surface-container-lowest text-on-surface",
  ghost: "bg-transparent text-on-surface shadow-none border-transparent",
};

const getPositionStyles = (position: FloatingPanelPosition, offset: number) => {
  const styles: React.CSSProperties = {};
  const x =
    position.includes("center") &&
    (position.includes("top") ||
      position.includes("bottom") ||
      position === "center")
      ? "-50%"
      : 0;
  const y =
    position.includes("center") &&
    (position.includes("left") ||
      position.includes("right") ||
      position === "center")
      ? "-50%"
      : 0;

  if (position.includes("top")) styles.top = offset;
  if (position.includes("bottom")) styles.bottom = offset;
  if (position.includes("left")) styles.left = offset;
  if (position.includes("right")) styles.right = offset;

  if (position === "center") {
    styles.top = "50%";
    styles.left = "50%";
  } else if (position === "top-center" || position === "bottom-center") {
    styles.left = "50%";
  } else if (position === "left-center" || position === "right-center") {
    styles.top = "50%";
  }

  return { styles, x, y };
};

// --- ROOT COMPONENT ---

export interface FloatingPanelProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
> {
  children: React.ReactNode;
  position?: FloatingPanelPosition;
  offset?: number;
  triggerWidth?: number;
  triggerHeight?: number;
  triggerRadius?: number;
  panelWidth?: number;
  panelHeight?: number;
  panelRadius?: number;
  triggerVariant?: FloatingPanelVariant;
  panelVariant?: FloatingPanelVariant;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const FloatingPanelRoot = React.forwardRef<HTMLDivElement, FloatingPanelProps>(
  (
    {
      children,
      position = "bottom-right",
      offset = 24,
      triggerWidth = 56,
      triggerHeight = 56,
      triggerRadius,
      panelWidth = 320,
      panelHeight = 400,
      panelRadius = 24,
      triggerVariant = "primary",
      panelVariant = "surface",
      open,
      onOpenChange,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = open !== undefined ? open : internalOpen;
    const containerRef = useRef<HTMLDivElement>(null);

    const setIsOpen = (val: boolean) => {
      setInternalOpen(val);
      onOpenChange?.(val);
    };

    // Close on click outside
    useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (
          isOpen &&
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleOutsideClick);
      return () =>
        document.removeEventListener("mousedown", handleOutsideClick);
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) setIsOpen(false);
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    const { styles: posStyles, x, y } = getPositionStyles(position, offset);

    const effectiveTriggerRadius = triggerRadius ?? triggerHeight / 2;

    return (
      <FloatingPanelContext.Provider
        value={{ isOpen, setIsOpen, triggerVariant, panelVariant }}
      >
        <motion.div
          ref={(node) => {
            // @ts-ignore
            containerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          initial={false}
          animate={{
            width: isOpen ? panelWidth : triggerWidth,
            height: isOpen ? panelHeight : triggerHeight,
            borderRadius: isOpen ? panelRadius : effectiveTriggerRadius,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 32,
            mass: 1.2,
          }}
          className={clsx(
            // Added `isolate` to ensure background hover effects on Ghost buttons don't bleed behind the panel
            "fixed z-[1000] overflow-hidden shadow-2xl transition-colors duration-300 border border-transparent origin-center isolate",
            isOpen
              ? variantClasses[panelVariant]
              : variantClasses[triggerVariant],
            isOpen &&
              panelVariant.includes("surface") &&
              "border-outline-variant/30",
            className,
          )}
          style={{
            ...posStyles,
            x,
            y,
            willChange: "width, height, border-radius",
            // FIXED: Using 'white, white' ensures the mask is 100% opaque everywhere.
            // It preserves the Safari clipping fix without causing the visual "bloom" fade-out at the corners.
            WebkitMaskImage: "linear-gradient(white, white)",
            transform: "translateZ(0)",
            ...style,
          }}
          {...props}
        >
          <div className="relative w-full h-full">{children}</div>
        </motion.div>
      </FloatingPanelContext.Provider>
    );
  },
);
FloatingPanelRoot.displayName = "FloatingPanel";

// --- SUBCOMPONENTS ---

const FloatingPanelTrigger = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { isOpen, setIsOpen } = useFloatingPanel();

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          key="trigger"
          type="button"
          onClick={() => setIsOpen(true)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className={clsx(
            "absolute inset-0 flex items-center justify-center w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
            // Disable hover states and hide the button as soon as the panel opens
            isOpen && "pointer-events-none invisible",
            className,
          )}
          style={{
            // Extra guard to prevent any active ripples/hovers during exit animations
            pointerEvents: isOpen ? "none" : "auto",
          }}
        >
          {children}
        </motion.button>
      )}
    </AnimatePresence>
  );
};

FloatingPanelTrigger.displayName = "FloatingPanel.Trigger";

const FloatingPanelContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { isOpen } = useFloatingPanel();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className={clsx(
            "absolute inset-0 w-full h-full flex flex-col",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
FloatingPanelContent.displayName = "FloatingPanel.Content";

const FloatingPanelCloseButton = ({ className }: { className?: string }) => {
  const { setIsOpen } = useFloatingPanel();

  return (
    <IconButton
      variant="ghost"
      size="sm"
      onClick={() => setIsOpen(false)}
      className={clsx("absolute top-3 right-3 z-10", className)}
    >
      <X className="w-4 h-4" />
    </IconButton>
  );
};
FloatingPanelCloseButton.displayName = "FloatingPanel.CloseButton";

export const FloatingPanel = Object.assign(FloatingPanelRoot, {
  Trigger: FloatingPanelTrigger,
  Content: FloatingPanelContent,
  CloseButton: FloatingPanelCloseButton,
});
