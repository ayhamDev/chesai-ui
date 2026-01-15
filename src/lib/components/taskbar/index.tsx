import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Copy, Minus, Square, X } from "lucide-react";
import React, { useRef, useState } from "react";

// --- CVA Variants ---
const taskbarVariants = cva("flex items-center text-on-surface select-none", {
  variants: {
    variant: {
      transparent: "bg-transparent",
      // Standard App Bar / Taskbar color
      card: "bg-surface-container",
      // Slightly higher elevation/contrast
      secondary: "bg-surface-container-high",
    },
    bordered: {
      true: "border-b border-outline-variant",
      false: "border-b border-transparent",
    },
    size: {
      sm: "h-8",
      md: "h-10",
      lg: "h-12",
    },
  },
  defaultVariants: {
    variant: "transparent",
    bordered: false,
    size: "md",
  },
});

const windowControlVariants = cva(
  "flex items-center justify-center transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary relative overflow-hidden group ",
  {
    variants: {
      variant: {
        // Use on-surface with low opacity for hover states to work in both light/dark
        minimize: "hover:bg-on-surface/10",
        maximize: "hover:bg-on-surface/10",
        close: "hover:bg-error hover:text-on-error",
      },
      size: {
        sm: "h-8 w-10",
        md: "h-10 w-12",
        lg: "h-12 w-14",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

// --- Internal Window Control Button ---
interface WindowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "minimize" | "maximize" | "close";
  size: "sm" | "md" | "lg";
}

const WindowButton = React.forwardRef<HTMLButtonElement, WindowButtonProps>(
  ({ children, variant, size, onClick, ...props }, ref) => {
    const localRef = useRef<HTMLButtonElement>(null);
    const [isPressed, setIsPressed] = useState(false);

    const stopPropagation = (
      e: React.MouseEvent | React.PointerEvent<HTMLButtonElement>
    ) => e.stopPropagation();

    return (
      <button
        ref={localRef}
        data-tauri-drag-region={false}
        onPointerDown={(e) => {
          stopPropagation(e);
          setIsPressed(true);
        }}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
        onClick={(e) => {
          stopPropagation(e);
          onClick?.(e);
        }}
        className={windowControlVariants({ variant, size })}
        {...props}
      >
        <motion.span
          className="flex items-center justify-center"
          animate={{ scale: isPressed ? 0.8 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          {children}
        </motion.span>
      </button>
    );
  }
);
WindowButton.displayName = "WindowButton";

// --- Component Props ---
export interface TaskbarProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "transparent" | "card" | "secondary";
  bordered?: boolean;
  size?: "sm" | "md" | "lg";
  startAdornment?: React.ReactNode;
  centerAdornment?: React.ReactNode;
  isMaximized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

// --- Main Component ---
export const Taskbar = React.forwardRef<HTMLElement, TaskbarProps>(
  (
    {
      className,
      variant,
      bordered,
      size = "md",
      startAdornment,
      centerAdornment,
      isMaximized = false,
      onMinimize,
      onMaximize,
      onClose,
      ...props
    },
    ref
  ) => {
    const iconSizeMap = {
      sm: 14,
      md: 16,
      lg: 18,
    };
    const currentIconSize = iconSizeMap[size];

    return (
      <header
        ref={ref}
        data-tauri-drag-region
        className={clsx(
          taskbarVariants({ variant, bordered, size, className })
        )}
        {...props}
      >
        {/* Start Slot */}
        <div className="flex-shrink-0 px-2">{startAdornment}</div>

        {/* Center Slot (Draggable) */}
        <div
          data-tauri-drag-region
          className="flex-1 flex items-center justify-center h-full min-w-0"
        >
          {centerAdornment}
        </div>

        {/* End Slot (Window Controls) */}
        <div className="flex items-center justify-end flex-shrink-0">
          <WindowButton
            variant="minimize"
            size={size}
            onClick={onMinimize}
            aria-label="Minimize"
          >
            <Minus size={currentIconSize} />
          </WindowButton>
          <WindowButton
            variant="maximize"
            size={size}
            onClick={onMaximize}
            aria-label={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? (
              <Copy size={currentIconSize} />
            ) : (
              <Square size={currentIconSize} />
            )}
          </WindowButton>
          <WindowButton
            variant="close"
            size={size}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={currentIconSize} />
          </WindowButton>
        </div>
      </header>
    );
  }
);

Taskbar.displayName = "Taskbar";
