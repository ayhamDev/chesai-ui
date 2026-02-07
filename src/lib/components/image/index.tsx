"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ImageOff, X } from "lucide-react";
import React, { useState, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { Skeleton } from "../skeleton";
import { Typography } from "../typography";

// --- VARIANTS ---

const containerVariants = cva(
  "relative overflow-hidden bg-surface-container-highest transition-all duration-300 isolate",
  {
    variants: {
      shape: {
        none: "rounded-none",
        sm: "rounded-md",
        md: "rounded-xl",
        lg: "rounded-2xl",
        full: "rounded-full",
      },
      variant: {
        default: "border border-transparent",
        bordered: "border border-outline-variant",
        elevated: "shadow-md border-transparent",
      },
      aspectRatio: {
        auto: "h-auto",
        square: "aspect-square",
        video: "aspect-video",
        portrait: "aspect-[3/4]",
        wide: "aspect-[2/1]",
      },
      isInteractive: {
        true: "group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        false: "",
      },
    },
    defaultVariants: {
      shape: "md",
      variant: "default",
      aspectRatio: "auto",
      isInteractive: false,
    },
  },
);

const imgVariants = cva(
  "block w-full h-full object-cover transition-transform duration-500 will-change-transform",
  {
    variants: {
      zoomOnHover: {
        true: "group-hover:scale-105 group-focus:scale-105",
        false: "",
      },
    },
    defaultVariants: {
      zoomOnHover: false,
    },
  },
);

// --- PROPS ---

export type ImageEffect = "inspect" | "zoom";

export interface ImageProps
  extends
    React.ImgHTMLAttributes<HTMLImageElement>,
    VariantProps<typeof containerVariants>,
    VariantProps<typeof imgVariants> {
  src: string;
  placeholderSrc?: string;
  alt: string;
  showSkeleton?: boolean;
  fallback?: React.ReactNode;
  /**
   * Enabled visual effects:
   * - `inspect`: 2x zoom that follows the mouse cursor on hover.
   * - `zoom`: Click to expand (Medium-style lightbox) using layout transitions.
   */
  effects?: ImageEffect[];
}

export const Image = React.forwardRef<HTMLDivElement, ImageProps>(
  (
    {
      src,
      placeholderSrc,
      alt,
      className,
      shape,
      variant,
      aspectRatio,
      zoomOnHover,
      width,
      height,
      showSkeleton = true,
      fallback,
      style,
      onClick,
      effects = [],
      ...props
    },
    ref,
  ) => {
    const [status, setStatus] = useState<"loading" | "loaded" | "error">(
      "loading",
    );
    const [isZoomed, setIsZoomed] = useState(false);
    const uniqueId = useId();

    const hasInspect = effects.includes("inspect");
    const hasZoom = effects.includes("zoom");

    // -- INSPECT MODE STATE --
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const maskX = useSpring(mouseX, { stiffness: 200, damping: 25 });
    const maskY = useSpring(mouseY, { stiffness: 200, damping: 25 });
    const transformOrigin = useMotionTemplate`${maskX}% ${maskY}%`;
    const [isHovering, setIsHovering] = useState(false);

    // Reset status when src changes
    useEffect(() => {
      setStatus("loading");
    }, [src]);

    // Scroll Lock when Zoomed
    useEffect(() => {
      if (isZoomed) {
        document.body.style.overflow = "hidden";
        const handleEsc = (e: KeyboardEvent) => {
          if (e.key === "Escape") setIsZoomed(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => {
          document.body.style.overflow = "";
          window.removeEventListener("keydown", handleEsc);
        };
      }
    }, [isZoomed]);

    const handleLoad = () => setStatus("loaded");
    const handleError = () => setStatus("error");

    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (hasZoom && status === "loaded") {
        setIsZoomed(true);
      }
      onClick?.(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hasInspect) return;
      const { left, top, width, height } =
        e.currentTarget.getBoundingClientRect();
      const xPercent = ((e.clientX - left) / width) * 100;
      const yPercent = ((e.clientY - top) / height) * 100;
      mouseX.set(xPercent);
      mouseY.set(yPercent);
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      if (!hasInspect) return;
      setIsHovering(false);
      mouseX.set(50);
      mouseY.set(50);
    };

    const isInteractive = !!onClick || zoomOnHover || hasZoom;
    const shouldRenderSkeleton =
      showSkeleton && status === "loading" && !placeholderSrc;

    // -- RENDERERS --

    // Shared image element for both inline and modal views
    const renderMainImage = (isModal = false) => (
      <motion.img
        // Only apply layoutId if zoom effect is enabled
        layoutId={hasZoom ? `image-${uniqueId}` : undefined}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0 }}
        animate={{
          opacity: status === "loaded" ? 1 : 0,
          // Apply inspect scale only if not in modal
          scale: hasInspect && isHovering && !isModal ? 2 : 1,
        }}
        style={{
          transformOrigin:
            hasInspect && !isModal ? transformOrigin : "center center",
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={clsx(
          imgVariants({ zoomOnHover: !isModal && zoomOnHover }),
          "relative z-10",
          // In modal, we constrain size but keep object-contain to prevent cropping
          isModal && "max-h-[90vh] max-w-[90vw] object-contain cursor-default",
        )}
        {...props}
      />
    );

    return (
      <>
        {/* --- INLINE CONTAINER --- */}
        <div
          ref={ref}
          className={clsx(
            containerVariants({ shape, variant, aspectRatio, isInteractive }),
            hasInspect && "cursor-crosshair",
            hasZoom && "cursor-zoom-in",
            className,
            // When zoomed, hide the inline container contents to avoid duplication artifacts
            // but keep the container taking up space
            isZoomed && "invisible",
          )}
          style={{ width, height, ...style }}
          onClick={handleContainerClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          tabIndex={isInteractive ? 0 : undefined}
          onKeyDown={(e) => {
            if (isInteractive && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              handleContainerClick(e as any);
            }
          }}
        >
          {/* SKELETON */}
          <AnimatePresence>
            {shouldRenderSkeleton && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-10 pointer-events-none"
              >
                <Skeleton className="w-full h-full rounded-none" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ERROR STATE */}
          {status === "error" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface-container-highest text-on-surface-variant/50 p-4 text-center">
              {fallback || (
                <>
                  <ImageOff className="h-8 w-8 mb-2 opacity-50" />
                  <span className="text-xs font-medium">Failed to load</span>
                </>
              )}
            </div>
          )}

          {/* BLUR-UP PLACEHOLDER */}
          {placeholderSrc && status !== "error" && (
            <img
              src={placeholderSrc}
              alt=""
              aria-hidden="true"
              className={clsx(
                imgVariants({ zoomOnHover }),
                "absolute inset-0 z-0 blur-xl scale-110",
                status === "loaded" ? "opacity-0" : "opacity-100",
              )}
              style={{ transition: "opacity 0.5s ease-out" }}
            />
          )}

          {/* MAIN IMAGE (INLINE) */}
          {status !== "error" && renderMainImage(false)}
        </div>

        {/* --- ZOOM MODAL (PORTAL) --- */}
        {hasZoom && (
          <AnimatePresence>
            {isZoomed && (
              <Portal>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-zoom-out"
                  onClick={() => setIsZoomed(false)}
                >
                  <button
                    className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsZoomed(false);
                    }}
                  >
                    <X size={24} />
                  </button>

                  <div
                    className="relative w-full h-full flex items-center justify-center p-4 md:p-12"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderMainImage(true)}
                  </div>
                </motion.div>
              </Portal>
            )}
          </AnimatePresence>
        )}
      </>
    );
  },
);

Image.displayName = "Image";

// --- PORTAL HELPER ---
const Portal = ({ children }: { children: React.ReactNode }) => {
  if (typeof window === "undefined") return null;
  return createPortal(children, document.body);
};
