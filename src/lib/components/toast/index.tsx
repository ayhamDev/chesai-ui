"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import React from "react";
import { Toaster as Sonner, toast as sonnerToast } from "sonner";
import { useTheme } from "../../context/ThemeProvider";

// --- VARIANTS ---

const toastVariants = cva(
  // Base Layout & Typography
  // CHANGED: Added 'flex-wrap' to allow items to flow to the next line.
  // CHANGED: Added '[&>[data-button]:first-of-type]:ml-auto' to target the first action button
  // (whichever comes first in DOM) and push it to the right, effectively aligning the button row to the end.
  "group toast group-[.toaster]:flex group-[.toaster]:flex-wrap group-[.toaster]:gap-3 group-[.toaster]:items-start group-[.toaster]:w-full md:group-[.toaster]:w-[356px] group-[.toaster]:p-4 group-[.toaster]:font-manrope group-[.toaster]:text-sm group-[.toaster]:pointer-events-auto group-[.toaster]:transition-all group-[.toaster]:border group-[.toaster]:select-none [&>[data-button]:first-of-type]:ml-auto",
  {
    variants: {
      variant: {
        primary:
          "group-[.toaster]:bg-surface-container-low group-[.toaster]:text-on-surface group-[.toaster]:border-outline-variant/50",
        secondary:
          "group-[.toaster]:bg-surface-container-high group-[.toaster]:text-on-surface group-[.toaster]:border-outline-variant/50",
        tertiary:
          "group-[.toaster]:bg-tertiary-container group-[.toaster]:text-on-tertiary-container group-[.toaster]:border-tertiary-container",
        "high-contrast":
          "group-[.toaster]:bg-inverse-surface group-[.toaster]:text-inverse-on-surface group-[.toaster]:border-inverse-surface",
        ghost:
          "group-[.toaster]:bg-surface-container-low/80 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-on-surface group-[.toaster]:border-outline-variant/30",
        surface:
          "group-[.toaster]:bg-surface group-[.toaster]:text-on-surface group-[.toaster]:border-outline-variant",
      },
      shape: {
        full: "group-[.toaster]:rounded-[28px]", // MD3 Pill
        minimal: "group-[.toaster]:rounded-xl", // Standard
        sharp: "group-[.toaster]:rounded-none", // Industrial
      },
      shadow: {
        none: "group-[.toaster]:shadow-none",
        sm: "group-[.toaster]:shadow-sm",
        md: "group-[.toaster]:shadow-md",
        lg: "group-[.toaster]:shadow-xl",
      },
    },
    defaultVariants: {
      variant: "secondary",
      shape: "minimal",
      shadow: "lg",
    },
  },
);

// --- TYPES ---

type ToasterProps = React.ComponentProps<typeof Sonner> &
  VariantProps<typeof toastVariants>;

// --- COMPONENT ---

const Toaster = ({
  variant = "secondary",
  shape = "minimal",
  shadow = "lg",
  position = "bottom-right",
  ...props
}: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme as "light" | "dark"}
      className="toaster group"
      position={position}
      // ... icons
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: clsx(
            toastVariants({ variant, shape, shadow }),
            "group-data-[type=error]:bg-error-container group-data-[type=error]:text-on-error-container group-data-[type=error]:border-error/20",
            "group-data-[type=warning]:bg-surface-container-high group-data-[type=warning]:border-yellow-500/50",
            "group-data-[type=success]:bg-surface-container-high group-data-[type=success]:border-green-500/50",
          ),
          // CHANGED: Width calculation forces the content to fill the first line, ensuring buttons wrap.
          // 2.5rem = 40px (covers 20px icon + 12px gap + buffer).
          content: "w-[calc(100%-2.5rem)]",
          title: "group-[.toast]:font-bold group-[.toast]:text-base",
          description:
            "group-[.toast]:text-xs group-[.toast]:opacity-90 group-[.toast]:leading-relaxed",

          // --- BUTTONS ---
          // Removed manual alignment classes since parent flex container handles it now.
          actionButton: clsx(
            "group-[.toast]:bg-primary group-[.toast]:text-on-primary",
            "group-[.toast]:font-semibold group-[.toast]:text-xs",
            "group-[.toast]:h-8 group-[.toast]:px-3 group-[.toast]:w-auto",
            "group-[.toast]:rounded-lg",
            "group-[.toast]:shrink-0",
            "group-[.toast]:transition-transform group-[.toast]:active:scale-95",
          ),
          cancelButton: clsx(
            "group-[.toast]:bg-secondary-container group-[.toast]:text-on-secondary-container",
            "group-[.toast]:font-semibold group-[.toast]:text-xs",
            "group-[.toast]:h-8 group-[.toast]:px-3 group-[.toast]:w-auto",
            "group-[.toast]:rounded-lg",
            "group-[.toast]:shrink-0",
            "group-[.toast]:transition-transform group-[.toast]:active:scale-95",
          ),

          // Icon alignment
          icon: "group-data-[type=error]:text-on-error-container group-[.toast]:self-start group-[.toast]:mt-0.5 group-[.toast]:shrink-0",
        },
      }}
      {...props}
    />
  );
};

export { sonnerToast as toast, Toaster };
