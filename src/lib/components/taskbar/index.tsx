import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { Copy, Minus, Square, X } from "lucide-react";
import React, { useRef } from "react";
import useRipple from "use-ripple-hook";

// --- CVA Variants ---
const taskbarVariants = cva(
  "flex items-center text-graphite-foreground select-none",
  {
    variants: {
      variant: {
        transparent: "bg-transparent",
        card: "bg-graphite-card",
        secondary: "bg-graphite-secondary",
      },
      bordered: {
        true: "border-b border-graphite-border",
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
  }
);

const windowControlVariants = cva(
  "flex items-center justify-center transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-graphite-ring relative overflow-hidden group ",
  {
    variants: {
      variant: {
        minimize: "hover:bg-black/10",
        maximize: "hover:bg-black/10",
        close: "hover:bg-red-500 hover:text-white",
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
    const rippleColor =
      variant === "close" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.1)";
    const [, event] = useRipple({
      ref: localRef,
      color: rippleColor,
      duration: 300,
    });

    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

    return (
      <button
        ref={localRef}
        data-tauri-drag-region={false}
        onMouseDown={(e) => {
          stopPropagation(e);
          event(e);
        }}
        onClick={(e) => {
          stopPropagation(e);
          onClick?.(e);
        }}
        className={windowControlVariants({ variant, size })}
        {...props}
      >
        {children}
      </button>
    );
  }
);
WindowButton.displayName = "WindowButton";

// --- Component Props ---
export interface TaskbarProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof taskbarVariants> {
  /** Content to render at the start of the taskbar (e.g., app icon, title). */
  startAdornment?: React.ReactNode;
  /** Content to render in the center (e.g., navigation menu). */
  centerAdornment?: React.ReactNode;
  /** Determines if the maximize icon should show the 'restore' state. */
  isMaximized?: boolean;
  /** Callback fired when the minimize button is clicked. */
  onMinimize?: () => void;
  /** Callback fired when the maximize/restore button is clicked. */
  onMaximize?: () => void;
  /** Callback fired when the close button is clicked. */
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
