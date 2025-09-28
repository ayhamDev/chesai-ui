"use client";

import * as RadixAvatar from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { User } from "lucide-react";
import React, { useState } from "react";

// --- CVA VARIANTS ---
// This CVA is now used by ALL avatar types for the root container.
const avatarVariants = cva(
  "relative flex shrink-0 select-none items-center justify-center overflow-hidden align-middle font-medium",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-sm",
        md: "h-12 w-12 text-base",
        lg: "h-16 w-16 text-2xl",
        xl: "h-24 w-24 text-4xl",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-lg",
        sharp: "rounded-none",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "full",
    },
  }
);

// --- HELPER FUNCTION ---
const getInitials = (name: string) => {
  const words = name.split(" ").filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// --- PROP DEFINITION ---
export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof RadixAvatar.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  fallback?: string;
  variant?: "default" | "count";
}

// --- COMPONENT IMPLEMENTATION ---
export const Avatar = React.forwardRef<
  React.ElementRef<typeof RadixAvatar.Root>,
  AvatarProps
>(
  (
    {
      className,
      size = "md",
      shape = "full",
      src,
      fallback,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const [loadingStatus, setLoadingStatus] = useState<
      "idle" | "loading" | "loaded" | "error"
    >("idle");

    const showSkeleton = src && loadingStatus === "loading";

    // ============================ THIS IS THE FIX ============================
    // The "count" variant now uses the same Radix primitives for consistency.
    // It renders a Root container and a Fallback, ensuring styles are applied correctly.
    if (variant === "count") {
      return (
        <RadixAvatar.Root
          ref={ref}
          className={clsx(avatarVariants({ size, shape, className }))}
          {...props}
        >
          <RadixAvatar.Fallback
            className="flex h-full w-full items-center justify-center bg-graphite-secondary text-graphite-secondaryForeground"
            delayMs={0}
          >
            {fallback}
          </RadixAvatar.Fallback>
        </RadixAvatar.Root>
      );
    }
    // ========================== END OF FIX ===================================

    // Default variant logic remains the same
    const fallbackContent = fallback ? (
      getInitials(fallback)
    ) : (
      <User className="h-1/2 w-1/2" />
    );

    return (
      <RadixAvatar.Root
        ref={ref}
        className={clsx(avatarVariants({ size, shape, className }), "relative")}
        {...props}
      >
        {showSkeleton && (
          <div className="absolute inset-0 z-10 animate-pulse bg-graphite-secondary" />
        )}

        <RadixAvatar.Image
          src={src}
          alt={fallback || "User avatar"}
          className="h-full w-full object-cover"
          onLoadingStatusChange={(status) => {
            if (loadingStatus === "idle" && status === "loading") {
              setLoadingStatus(status);
            } else if (status === "loaded" || status === "error") {
              setLoadingStatus(status);
            }
          }}
        />
        <RadixAvatar.Fallback
          className="flex h-full w-full items-center justify-center bg-graphite-secondary text-graphite-secondaryForeground"
          delayMs={0}
        >
          {fallbackContent}
        </RadixAvatar.Fallback>
      </RadixAvatar.Root>
    );
  }
);
Avatar.displayName = "Avatar";
