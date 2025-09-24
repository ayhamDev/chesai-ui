"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { Plus, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AvatarGroup } from "./AvatarGroup";

const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden align-middle font-semibold uppercase",
  {
    variants: {
      variant: {
        default: "bg-graphite-secondary text-graphite-primary",
        count: "bg-graphite-secondary text-graphite-foreground",
        add: "cursor-pointer bg-graphite-secondary text-graphite-foreground hover:bg-graphite-border",
      },
      size: {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-sm",
        md: "h-10 w-10 text-base",
        lg: "h-14 w-14 text-xl",
        xl: "h-20 w-20 text-2xl",
      },
      // --- THIS IS THE KEY CHANGE ---
      shape: {
        full: "rounded-full",
        minimal: "rounded-md",
        sharp: "rounded-none",
      },
      // --- END OF CHANGE ---
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      // --- THIS IS THE KEY CHANGE ---
      shape: "full", // New default
      // --- END OF CHANGE ---
    },
  }
);

// (The rest of this file remains the same)
export interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  fallback?: string;
  alt?: string;
}

const AvatarRoot = React.forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      className,
      size,
      shape,
      variant,
      src,
      fallback,
      alt = "User Avatar",
      ...props
    },
    ref
  ) => {
    const [imgStatus, setImgStatus] = useState<"loading" | "loaded" | "error">(
      "loading"
    );

    useEffect(() => {
      setImgStatus(src ? "loading" : "error");
    }, [src]);

    const showImage = src && imgStatus === "loaded";
    const showInitials = fallback && fallback.length > 0;
    const initials = fallback?.charAt(0).toUpperCase();

    const renderContent = () => {
      if (variant === "add") {
        return <Plus className="h-[50%] w-[50%]" />;
      }
      if (showInitials) {
        return variant === "count" ? fallback : initials;
      }
      return <User className="h-[60%] w-[60%] text-graphite-primary/70" />;
    };

    return (
      <span
        ref={ref}
        className={clsx(avatarVariants({ size, shape, variant, className }))}
        {...props}
      >
        {src && (
          <img
            src={src}
            alt={alt}
            className={clsx(
              "h-full w-full object-cover object-center transition-opacity duration-200",
              imgStatus === "loaded" ? "opacity-100" : "opacity-0"
            )}
            onError={() => setImgStatus("error")}
            onLoad={() => setImgStatus("loaded")}
          />
        )}
        {!showImage && renderContent()}
      </span>
    );
  }
);
AvatarRoot.displayName = "Avatar";

export const Avatar = Object.assign(AvatarRoot, {
  Group: AvatarGroup,
});
