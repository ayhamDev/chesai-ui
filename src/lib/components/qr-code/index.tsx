"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { type Variants, motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Copy,
  Download,
  FileText,
  Link as LinkIcon,
  Share2,
} from "lucide-react";
import QRCodeGen from "qrcode";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Toolbar } from "../toolbar";
import { ShapedImage } from "../shape";
import { Typography } from "../typography";
import type { ShapeType } from "../shape/paths";

// --- TYPES & VARIANTS ---

const qrContainerVariants = cva(
  "relative flex flex-col items-center justify-center rounded-3xl transition-colors duration-300",
  {
    variants: {
      variant: {
        primary: "bg-surface-container-low",
        secondary: "bg-surface-container-high",
        ghost: "bg-transparent",
        white: "bg-white",
      },
      padding: {
        none: "p-0",
        sm: "p-2",
        md: "p-4",
        lg: "p-6",
      },
      shadow: {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      padding: "md",
      shadow: "none",
    },
  },
);

export type DotShape = "square" | "circle" | "rounded" | "diamond";
export type CornerShape = "square" | "rounded" | "extra-rounded" | "circle";

export interface QRCodeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof qrContainerVariants> {
  value: string;
  /** Size in pixels (width & height) */
  size?: number;
  /** Shape of the small data dots */
  dotShape?: DotShape;
  /** Shape of the 3 corner finders */
  cornerShape?: CornerShape;
  /** Color of the data dots (Tailwind class or CSS var) */
  color?: string;
  /** Color of the corner finders */
  cornerColor?: string;
  /** URL for a centered logo */
  logo?: string;
  /** Size of the logo (0-1 relative to QR size) @default 0.2 */
  logoSize?: number;
  /** Background color behind the logo for contrast */
  logoBackgroundColor?: string;
  /** Error Correction Level */
  ecLevel?: "L" | "M" | "Q" | "H";
  /** Whether to show the action toolbar below the QR code */
  showToolbar?: boolean;
  /** Whether to display the value text below the QR code */
  showData?: boolean;
}

// --- HELPERS ---

const mapCornerToToolbarShape = (
  c: CornerShape,
): "sharp" | "minimal" | "full" => {
  switch (c) {
    case "square":
      return "sharp";
    case "rounded":
      return "minimal";
    case "extra-rounded":
      return "minimal";
    case "circle":
      return "full";
    default:
      return "minimal";
  }
};

const mapCornerToLogoShape = (c: CornerShape): ShapeType => {
  switch (c) {
    case "square":
      return "square";
    case "rounded":
      return "cookie4";
    case "extra-rounded":
      return "circle";
    case "circle":
      return "circle";
    default:
      return "circle";
  }
};

const isUrl = (s: string) => {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
};

// --- PATH GENERATORS ---

const getModulePath = (x: number, y: number, shape: DotShape): string => {
  switch (shape) {
    case "circle":
      return `M ${x + 0.5}, ${y + 0.5} m -0.4, 0 a 0.4,0.4 0 1,0 0.8,0 a 0.4,0.4 0 1,0 -0.8,0`;
    case "rounded":
      return `M ${x + 0.1},${y + 0.1} h0.8 a0.1,0.1 0 0 1 0.1,0.1 v0.8 a0.1,0.1 0 0 1 -0.1,0.1 h-0.8 a0.1,0.1 0 0 1 -0.1,-0.1 v-0.8 a0.1,0.1 0 0 1 0.1,-0.1 z`;
    case "diamond":
      return `M ${x + 0.5},${y} L ${x + 1},${y + 0.5} L ${x + 0.5},${y + 1} L ${x},${y + 0.5} Z`;
    case "square":
    default:
      return `M ${x},${y} h1 v1 h-1 z`;
  }
};

const getFinderPath = (x: number, y: number, shape: CornerShape): string => {
  const createRing = () => {
    if (shape === "circle") {
      return `M ${x + 3.5}, ${y} 
               A 3.5,3.5 0 1,0 ${x + 3.5}, ${y + 7} 
               A 3.5,3.5 0 1,0 ${x + 3.5}, ${y} 
               M ${x + 3.5}, ${y + 1} 
               A 2.5,2.5 0 1,1 ${x + 3.5}, ${y + 6} 
               A 2.5,2.5 0 1,1 ${x + 3.5}, ${y + 1} Z`;
    }
    if (shape === "extra-rounded") {
      return `M ${x + 2},${y} h3 a2,2 0 0 1 2,2 v3 a2,2 0 0 1 -2,2 h-3 a2,2 0 0 1 -2,-2 v-3 a2,2 0 0 1 2,-2 Z
                M ${x + 1},${y + 1} h5 v5 h-5 v-5 Z`;
    }
    if (shape === "rounded") {
      return `M ${x + 1},${y} h5 a1,1 0 0 1 1,1 v5 a1,1 0 0 1 -1,1 h-5 a1,1 0 0 1 -1,-1 v-5 a1,1 0 0 1 1,-1 Z
               M ${x + 1},${y + 1} h5 v5 h-5 Z`;
    }
    // Square
    return `M ${x},${y} h7 v7 h-7 Z M ${x + 1},${y + 1} v5 h5 v-5 Z`;
  };

  const ring = createRing();
  let dot = "";
  if (shape === "circle") {
    dot = `M ${x + 3.5}, ${y + 2} A 1.5,1.5 0 1,0 ${x + 3.5}, ${y + 5} A 1.5,1.5 0 1,0 ${x + 3.5}, ${y + 2} Z`;
  } else if (shape === "extra-rounded") {
    dot = `M ${x + 2.75},${y + 2} h1.5 a0.75,0.75 0 0 1 0.75,0.75 v1.5 a0.75,0.75 0 0 1 -0.75,0.75 h-1.5 a0.75,0.75 0 0 1 -0.75,-0.75 v-1.5 a0.75,0.75 0 0 1 0.75,-0.75 Z`;
  } else {
    dot = `M ${x + 2},${y + 2} h3 v3 h-3 Z`;
  }

  return `${ring} ${dot}`;
};

// --- IMAGE GENERATION HELPER ---

const generateQRBlob = (
  svgElement: SVGSVGElement,
  size: number,
  logoSrc?: string,
): Promise<Blob | null> => {
  return new Promise((resolve) => {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const canvas = document.createElement("canvas");
    const scale = 2; // High resolution
    canvas.width = size * scale;
    canvas.height = size * scale;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolve(null);
      return;
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      if (logoSrc) {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.onload = () => {
          const logoW = canvas.width * 0.2;
          const logoH = logoW;
          const dx = (canvas.width - logoW) / 2;
          const dy = (canvas.height - logoH) / 2;
          ctx.drawImage(logoImg, dx, dy, logoW, logoH);
          canvas.toBlob((blob) => resolve(blob));
        };
        logoImg.onerror = () => {
          canvas.toBlob((blob) => resolve(blob));
        };
        logoImg.src = logoSrc;
      } else {
        canvas.toBlob((blob) => resolve(blob));
      }
    };
    img.src = url;
  });
};

// --- COMPONENT ---

export const QRCode = React.forwardRef<HTMLDivElement, QRCodeProps>(
  (
    {
      value,
      size = 200,
      dotShape = "rounded",
      cornerShape = "extra-rounded",
      color = "currentColor",
      cornerColor,
      logo,
      logoSize = 0.2,
      logoBackgroundColor = "var(--md-sys-color-surface-container-low)",
      ecLevel = "M",
      variant,
      padding,
      shadow,
      className,
      showToolbar = false,
      showData = false,
      style,
      ...props
    },
    ref,
  ) => {
    const [matrix, setMatrix] = useState<Uint8Array | number[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "copied" | "downloading">(
      "idle",
    );
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
      try {
        const qr = QRCodeGen.create(value, {
          errorCorrectionLevel: ecLevel,
        });
        setMatrix(qr.modules.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to generate QR");
      }
    }, [value, ecLevel]);

    const qrSize = Math.sqrt(matrix.length);

    const { dotPath, cornerPaths } = useMemo(() => {
      if (matrix.length === 0) return { dotPath: "", cornerPaths: [] };

      const size = Math.sqrt(matrix.length);
      let dPath = "";
      const cPaths: string[] = [];

      const isFinder = (r: number, c: number) => {
        return (
          (r < 7 && c < 7) ||
          (r < 7 && c >= size - 7) ||
          (r >= size - 7 && c < 7)
        );
      };

      const isLogoArea = (r: number, c: number) => {
        if (!logo) return false;
        const center = size / 2;
        const logoModules = size * logoSize;
        const start = Math.floor(center - logoModules / 2);
        const end = Math.ceil(center + logoModules / 2);
        return r >= start && r < end && c >= start && c < end;
      };

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (matrix[r * size + c]) {
            if (!isFinder(r, c) && !isLogoArea(r, c)) {
              dPath += `${getModulePath(c, r, dotShape)} `;
            }
          }
        }
      }

      cPaths.push(getFinderPath(0, 0, cornerShape));
      cPaths.push(getFinderPath(size - 7, 0, cornerShape));
      cPaths.push(getFinderPath(0, size - 7, cornerShape));

      return { dotPath: dPath, cornerPaths: cPaths };
    }, [matrix, dotShape, cornerShape, logo, logoSize]);

    // --- TOOLBAR ACTIONS ---

    const handleDownload = async () => {
      if (!svgRef.current) return;
      setStatus("downloading");
      const blob = await generateQRBlob(svgRef.current, size, logo);
      if (blob) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `qr-code-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setStatus("idle");
    };

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(value);
        setStatus("copied");
        setTimeout(() => setStatus("idle"), 2000);
      } catch (err) {
        console.error("Failed to copy", err);
      }
    };

    const handleShare = async () => {
      if (!svgRef.current || !navigator.share) return;
      try {
        const blob = await generateQRBlob(svgRef.current, size, logo);
        if (blob) {
          const file = new File([blob], "qr-code.png", { type: "image/png" });
          await navigator.share({
            title: "QR Code",
            text: value,
            files: [file],
          });
        }
      } catch (err) {
        console.log("Share cancelled or failed");
      }
    };

    const dotVariants: Variants = {
      hidden: { scale: 0.8, opacity: 0 },
      visible: {
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.5,
          delay: 0.3,
          ease: [0.2, 0, 0, 1] as const,
        },
      },
    };

    const logoVariants: Variants = {
      hidden: { scale: 0, opacity: 0 },
      visible: {
        scale: 1,
        opacity: 1,
        transition: {
          delay: 0.6,
          type: "spring",
          stiffness: 200,
          damping: 15,
        },
      },
    };

    if (error) return <div className="text-error text-sm">{error}</div>;

    const logoPixelSize = size * logoSize;
    const toolbarShape = mapCornerToToolbarShape(
      cornerShape || "extra-rounded",
    );
    const logoShapeType = mapCornerToLogoShape(cornerShape || "extra-rounded");
    const isUrlValue = isUrl(value);

    return (
      <div
        ref={ref}
        className={clsx(
          qrContainerVariants({ variant, padding, shadow }),
          className,
          "group/qr",
        )}
        style={{
          width: "fit-content",
          height: "auto",
          maxWidth: "100%",
          ...style,
        }}
        {...props}
      >
        <div
          style={{ width: size, height: size }}
          className="relative shrink-0"
        >
          {matrix.length > 0 && (
            <motion.svg
              ref={svgRef}
              viewBox={`0 0 ${qrSize} ${qrSize}`}
              className="w-full h-full overflow-visible"
              initial="hidden"
              animate="visible"
            >
              <title>QR Code for {value}</title>
              <motion.path
                d={dotPath}
                fill={color === "currentColor" ? "currentColor" : color}
                className={clsx(color === "currentColor" && "text-on-surface")}
                variants={dotVariants}
                fillRule="evenodd"
              />
              {cornerPaths.map((d, i) => (
                <motion.path
                  key={`corner-${i}`}
                  d={d}
                  fill={
                    cornerColor ||
                    (color === "currentColor" ? "currentColor" : color)
                  }
                  className={clsx(
                    !cornerColor && color === "currentColor" && "text-primary",
                  )}
                  variants={dotVariants}
                  fillRule="evenodd"
                />
              ))}
            </motion.svg>
          )}

          {logo && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{
                width: logoPixelSize,
                height: logoPixelSize,
              }}
              variants={logoVariants}
              initial="hidden"
              animate="visible"
            >
              <div
                className="w-full h-full flex items-center justify-center shadow-sm"
                style={{
                  padding: "4px",
                  backgroundColor: logoBackgroundColor,
                  borderRadius: "inherit",
                }}
              >
                <ShapedImage
                  src={logo}
                  alt="QR Logo"
                  shape={logoShapeType}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* --- DISPLAY DATA --- */}
        <AnimatePresence>
          {showData && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="w-full overflow-hidden"
            >
              <div
                className={clsx(
                  "flex items-center gap-3 rounded-xl border border-outline-variant/30 p-2.5 max-w-full",
                  variant === "secondary"
                    ? "bg-surface-container"
                    : "bg-surface-container-high",
                )}
              >
                <div
                  className={clsx(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    isUrlValue
                      ? "bg-tertiary-container text-on-tertiary-container"
                      : "bg-secondary-container text-on-secondary-container",
                  )}
                >
                  {isUrlValue ? (
                    <LinkIcon className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                </div>
                <Typography
                  variant="label-large"
                  // Added flex-1 and min-w-0 to ensure truncation works in flex container
                  className="truncate font-medium opacity-80 flex-1 min-w-0"
                >
                  {value}
                </Typography>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- TOOLBAR --- */}
        <AnimatePresence>
          {showToolbar && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden w-full flex justify-center"
            >
              <Toolbar
                variant="secondary"
                shape={toolbarShape}
                size="sm"
                className="bg-surface-container-high/80 backdrop-blur-sm border border-outline-variant/50"
              >
                <Toolbar.Button
                  tooltip={status === "copied" ? "Copied!" : "Copy Content"}
                  onClick={handleCopy}
                  disabled={status === "downloading"}
                >
                  {status === "copied" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Toolbar.Button>

                <Toolbar.Separator />

                <Toolbar.Button
                  tooltip="Download PNG"
                  onClick={handleDownload}
                  // @ts-ignore
                  isLoading={status === "downloading"}
                >
                  <Download className="w-4 h-4" />
                </Toolbar.Button>

                {typeof navigator !== "undefined" &&
                  "share" in navigator &&
                  "canShare" in navigator && (
                    <>
                      <Toolbar.Separator />
                      <Toolbar.Button tooltip="Share" onClick={handleShare}>
                        <Share2 className="w-4 h-4" />
                      </Toolbar.Button>
                    </>
                  )}
              </Toolbar>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

QRCode.displayName = "QRCode";
