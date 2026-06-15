/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import { cva } from "class-variance-authority";
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
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Toolbar } from "../toolbar";
import { ShapedImage } from "../shape";
import { Typography } from "../typography";
import type { ShapeType } from "../shape/paths";

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

export type DotShape = "square" | "circle" | "rounded" | "diamond" | "classy";
export type CornerFrameShape =
  | "square"
  | "circle"
  | "rounded"
  | "extra-rounded"
  | "leaf";
export type CornerDotShape = "square" | "circle" | "rounded" | "diamond";

interface QRCodeContextValue {
  value: string;
  matrix: Uint8Array | number[];
  size: number;
  color: string;
  cornerColor?: string;
  dotShape: DotShape;
  cornerFrameShape: CornerFrameShape;
  cornerDotShape: CornerDotShape;
  logo?: string;
  logoSize: number;
  logoBackgroundColor: string;
  svgRef: React.RefObject<SVGSVGElement | null>;
  variant?: "primary" | "secondary" | "ghost" | "white" | null;
}

const QRCodeContext = createContext<QRCodeContextValue | null>(null);

const useQRCode = () => {
  const context = useContext(QRCodeContext);
  if (!context) {
    throw new Error("QRCode subcomponents must be used within <QRCode>");
  }
  return context;
};

export interface QRCodeRootProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "ghost" | "white" | null;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
  value: string;
  size?: number;
  dotShape?: DotShape;
  cornerFrameShape?: CornerFrameShape;
  cornerDotShape?: CornerDotShape;
  cornerShape?: CornerFrameShape;
  color?: string;
  cornerColor?: string;
  logo?: string;
  logoSize?: number;
  logoBackgroundColor?: string;
  ecLevel?: "L" | "M" | "Q" | "H";
  showToolbar?: boolean;
  showData?: boolean;
}

const mapCornerToToolbarShape = (
  c: CornerFrameShape,
): "sharp" | "minimal" | "full" => {
  switch (c) {
    case "square":
      return "sharp";
    case "rounded":
    case "leaf":
      return "minimal";
    case "extra-rounded":
    case "circle":
      return "full";
    default:
      return "minimal";
  }
};

const mapCornerToLogoShape = (c: CornerFrameShape): ShapeType => {
  switch (c) {
    case "square":
      return "square";
    case "rounded":
    case "leaf":
      return "cookie4";
    case "extra-rounded":
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

const getModulePath = (x: number, y: number, shape: DotShape): string => {
  switch (shape) {
    case "circle":
      return `M ${x + 0.5}, ${y + 0.5} m -0.4, 0 a 0.4,0.4 0 1,0 0.8,0 a 0.4,0.4 0 1,0 -0.8,0`;
    case "rounded":
      return `M ${x + 0.1},${y + 0.1} h0.8 a0.1,0.1 0 0 1 0.1,0.1 v0.8 a0.1,0.1 0 0 1 -0.1,0.1 h-0.8 a0.1,0.1 0 0 1 -0.1,-0.1 v-0.8 a0.1,0.1 0 0 1 0.1,-0.1 z`;
    case "diamond":
      return `M ${x + 0.5},${y} L ${x + 1},${y + 0.5} L ${x + 0.5},${y + 1} L ${x},${y + 0.5} Z`;
    case "classy":
      return `M ${x + 0.5}, ${y} 
              L ${x + 1}, ${y} 
              Q ${x + 1}, ${y + 1} ${x + 0.5}, ${y + 1} 
              Q ${x}, ${y + 1} ${x}, ${y + 0.5} 
              Q ${x}, ${y} ${x + 0.5}, ${y} Z`;
    case "square":
    default:
      return `M ${x},${y} h1 v1 h-1 z`;
  }
};

const getCornerPath = (
  x: number,
  y: number,
  frameShape: CornerFrameShape,
  dotShape: CornerDotShape,
): string => {
  const getFrame = () => {
    switch (frameShape) {
      case "circle":
        return `M ${x + 3.5}, ${y} 
                A 3.5,3.5 0 1,0 ${x + 3.5}, ${y + 7} 
                A 3.5,3.5 0 1,0 ${x + 3.5}, ${y} 
                M ${x + 3.5}, ${y + 1} 
                A 2.5,2.5 0 1,1 ${x + 3.5}, ${y + 6} 
                A 2.5,2.5 0 1,1 ${x + 3.5}, ${y + 1} Z`;
      case "extra-rounded":
        return `M ${x + 3.5},${y} h0 a3.5,3.5 0 0 1 3.5,3.5 v0 a3.5,3.5 0 0 1 -3.5,3.5 h0 a3.5,3.5 0 0 1 -3.5,-3.5 v0 a3.5,3.5 0 0 1 3.5,-3.5 Z 
                M ${x + 3.5},${y + 1} h0 a2.5,2.5 0 0 1 2.5,2.5 v0 a2.5,2.5 0 0 1 -2.5,2.5 h0 a2.5,2.5 0 0 1 -2.5,-2.5 v0 a2.5,2.5 0 0 1 2.5,-2.5 Z`;
      case "rounded":
        return `M ${x + 1},${y} h5 a1,1 0 0 1 1,1 v5 a1,1 0 0 1 -1,1 h-5 a1,1 0 0 1 -1,-1 v-5 a1,1 0 0 1 1,-1 Z
                M ${x + 1},${y + 1} h5 v5 h-5 Z`;
      case "leaf":
        return `M ${x + 3.5},${y} 
                h2.5 a1,1 0 0 1 1,1 v5 a1,1 0 0 1 -1,1 h-2.5 
                a3.5,3.5 0 0 1 -3.5,-3.5 v0 a3.5,3.5 0 0 1 3.5,-3.5 Z
                M ${x + 1},${y + 1} h5 v5 h-5 Z`;
      case "square":
      default:
        return `M ${x},${y} h7 v7 h-7 Z M ${x + 1},${y + 1} v5 h5 v-5 Z`;
    }
  };

  const getDot = () => {
    switch (dotShape) {
      case "circle":
        return `M ${x + 3.5}, ${y + 2} A 1.5,1.5 0 1,0 ${x + 3.5}, ${y + 5} A 1.5,1.5 0 1,0 ${x + 3.5}, ${y + 2} Z`;
      case "rounded":
        return `M ${x + 2.5},${y + 2} h2 a0.5,0.5 0 0 1 0.5,0.5 v2 a0.5,0.5 0 0 1 -0.5,0.5 h-2 a0.5,0.5 0 0 1 -0.5,-0.5 v-2 a0.5,0.5 0 0 1 0.5,-0.5 Z`;
      case "diamond":
        return `M ${x + 3.5},${y + 2} L ${x + 5},${y + 3.5} L ${x + 3.5},${y + 5} L ${x + 2},${y + 3.5} Z`;
      case "square":
      default:
        return `M ${x + 2},${y + 2} h3 v3 h-3 Z`;
    }
  };

  return `${getFrame()} ${getDot()}`;
};

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
    const scale = 2;
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

export const QRCodeCanvas = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(({ className, style, ...props }, forwardedRef) => {
  const {
    matrix,
    size,
    color,
    cornerColor,
    dotShape,
    cornerFrameShape,
    cornerDotShape,
    logo,
    logoSize,
    logoBackgroundColor,
    svgRef,
  } = useQRCode();

  React.useImperativeHandle(forwardedRef, () => svgRef.current!);

  const qrSize = Math.sqrt(matrix.length);

  const { dotPath, cornerPaths } = useMemo(() => {
    if (matrix.length === 0) return { dotPath: "", cornerPaths: [] };

    const matrixSize = Math.sqrt(matrix.length);
    let dPath = "";
    const cPaths: string[] = [];

    const isFinder = (r: number, c: number) => {
      return (
        (r < 7 && c < 7) ||
        (r < 7 && c >= matrixSize - 7) ||
        (r >= matrixSize - 7 && c < 7)
      );
    };

    const isLogoArea = (r: number, c: number) => {
      if (!logo) return false;
      const center = matrixSize / 2;
      const logoModules = matrixSize * logoSize;
      const start = Math.floor(center - logoModules / 2);
      const end = Math.ceil(center + logoModules / 2);
      return r >= start && r < end && c >= start && c < end;
    };

    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (matrix[r * matrixSize + c]) {
          if (!isFinder(r, c) && !isLogoArea(r, c)) {
            dPath += `${getModulePath(c, r, dotShape)} `;
          }
        }
      }
    }

    cPaths.push(getCornerPath(0, 0, cornerFrameShape, cornerDotShape));
    cPaths.push(
      getCornerPath(matrixSize - 7, 0, cornerFrameShape, cornerDotShape),
    );
    cPaths.push(
      getCornerPath(0, matrixSize - 7, cornerFrameShape, cornerDotShape),
    );

    return { dotPath: dPath, cornerPaths: cPaths };
  }, [matrix, dotShape, cornerFrameShape, cornerDotShape, logo, logoSize]);

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

  const logoPixelSize = size * logoSize;
  const logoShapeType = mapCornerToLogoShape(cornerFrameShape);

  if (matrix.length === 0) return null;

  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      <motion.svg
        ref={svgRef}
        viewBox={`0 0 ${qrSize} ${qrSize}`}
        className={clsx("w-full h-full overflow-visible", className)}
        initial="hidden"
        animate="visible"
      >
        <title>QR Code</title>
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
              cornerColor || (color === "currentColor" ? "currentColor" : color)
            }
            className={clsx(
              !cornerColor && color === "currentColor" && "text-primary",
            )}
            variants={dotVariants}
            fillRule="evenodd"
          />
        ))}
      </motion.svg>

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
  );
});
QRCodeCanvas.displayName = "QRCode.Canvas";

export const QRCodeContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { value, variant } = useQRCode();
  const isUrlValue = isUrl(value);

  return (
    <motion.div
      ref={ref}
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
          className,
        )}
        {...props}
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
          className="truncate font-medium opacity-80 flex-1 min-w-0"
        >
          {value}
        </Typography>
      </div>
    </motion.div>
  );
});
QRCodeContent.displayName = "QRCode.Content";

export const QRCodeToolbar = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, 'dir'>
>(({ className, ...props }, ref) => {
  const { value, svgRef, size, logo, cornerFrameShape } = useQRCode();
  const [status, setStatus] = useState<"idle" | "copied" | "downloading">(
    "idle",
  );

  const toolbarShape = mapCornerToToolbarShape(
    cornerFrameShape || "extra-rounded",
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

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

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      className="overflow-hidden w-full flex justify-center"
    >
      <Toolbar
        variant="secondary"
        shape={toolbarShape}
        size="sm"
        className={clsx(
          "bg-surface-container-high/80 backdrop-blur-sm border border-outline-variant/50",
          className,
        )}
        {...props}
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
  );
});
QRCodeToolbar.displayName = "QRCode.Toolbar";

const QRCodeRoot = React.forwardRef<HTMLDivElement, QRCodeRootProps>(
  (
    {
      value,
      size = 200,
      dotShape = "rounded",
      cornerFrameShape = "extra-rounded",
      cornerDotShape = "circle",
      cornerShape,
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
      children,
      ...props
    },
    ref,
  ) => {
    const [matrix, setMatrix] = useState<Uint8Array | number[]>([]);
    const [error, setError] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const effectiveCornerFrame = cornerShape || cornerFrameShape;

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

    const contextValue: QRCodeContextValue = {
      value,
      matrix,
      size,
      color,
      cornerColor,
      dotShape,
      cornerFrameShape: effectiveCornerFrame,
      cornerDotShape,
      logo,
      logoSize,
      logoBackgroundColor,
      svgRef,
      variant,
    };

    if (error) return <div className="text-error text-sm">{error}</div>;

    const hasChildren = React.Children.count(children) > 0;

    return (
      <QRCodeContext.Provider value={contextValue}>
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
          {hasChildren ? (
            children
          ) : (
            <>
              <QRCodeCanvas />
              <AnimatePresence>{showData && <QRCodeContent />}</AnimatePresence>
              <AnimatePresence>
                {showToolbar && <QRCodeToolbar />}
              </AnimatePresence>
            </>
          )}
        </div>
      </QRCodeContext.Provider>
    );
  },
);
QRCodeRoot.displayName = "QRCode";

export const QRCode = Object.assign(QRCodeRoot, {
  Canvas: QRCodeCanvas,
  Content: QRCodeContent,
  Toolbar: QRCodeToolbar,
});
