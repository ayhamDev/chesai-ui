"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { Check, Copy } from "lucide-react";
import React, { useState, useMemo } from "react";
import { IconButton } from "../icon-button";

const installCommandVariants = cva(
  "relative flex flex-col overflow-hidden border transition-all duration-300 w-full",
  {
    variants: {
      variant: {
        primary: "bg-surface-container-low border-outline-variant",
        secondary: "bg-surface-container-high border-outline-variant",
        surface: "bg-surface border-outline-variant/50",
        ghost: "bg-transparent border-transparent",
      },
      shape: {
        full: "rounded-3xl",
        minimal: "rounded-xl",
        sharp: "rounded-none",
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
      shape: "minimal",
      shadow: "none",
    },
  },
);

export interface InstallCommandProps extends React.HTMLAttributes<HTMLDivElement> {
  packageName: string;
  isDevDependency?: boolean;
  variant?: "primary" | "secondary" | "surface" | "ghost";
  shape?: "full" | "minimal" | "sharp";
  shadow?: "none" | "sm" | "md" | "lg";
}

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export const InstallCommand = React.forwardRef<
  HTMLDivElement,
  InstallCommandProps
>(
  (
    {
      packageName,
      isDevDependency = false,
      variant = "primary",
      shape = "minimal",
      shadow = "none",
      className,
      ...props
    },
    ref,
  ) => {
    const [pm, setPm] = useState<PackageManager>("npm");
    const [copied, setCopied] = useState(false);

    const commandString = useMemo(() => {
      const devFlag = isDevDependency ? " -D" : "";
      switch (pm) {
        case "npm":
          return `npm install ${packageName}${devFlag}`;
        case "pnpm":
          return `pnpm add ${packageName}${devFlag}`;
        case "yarn":
          return `yarn add ${packageName}${devFlag}`;
        case "bun":
          return `bun add ${packageName}${devFlag}`;
        default:
          return `npm install ${packageName}${devFlag}`;
      }
    }, [pm, packageName, isDevDependency]);

    const tokens = useMemo(() => {
      return commandString.split(" ").map((part, index) => {
        if (index === 0) {
          return (
            <span key={index} className="text-primary font-bold">
              {part}
            </span>
          );
        }
        if (part === "install" || part === "add") {
          return (
            <span key={index} className="text-secondary font-medium">
              {part}
            </span>
          );
        }
        if (part.startsWith("-")) {
          return (
            <span key={index} className="text-on-surface-variant/70 italic">
              {part}
            </span>
          );
        }
        return (
          <span
            key={index}
            className="text-on-surface font-semibold tracking-tight"
          >
            {part}
          </span>
        );
      });
    }, [commandString]);

    const handleCopy = () => {
      navigator.clipboard.writeText(commandString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div
        ref={ref}
        className={clsx(
          installCommandVariants({ variant, shape, shadow }),
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between bg-surface-container-highest/40 px-3 py-2 border-b border-outline-variant/20">
          <div className="flex gap-1.5">
            {(["npm", "pnpm", "yarn", "bun"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPm(p)}
                className={clsx(
                  "text-[10px] font-bold font-mono px-2.5 py-1 rounded-md transition-all cursor-pointer uppercase tracking-widest",
                  pm === p
                    ? "bg-primary text-on-primary shadow-md scale-105"
                    : "text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-highest",
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <IconButton
            variant="ghost"
            size="xs"
            onClick={handleCopy}
            className={clsx(
              "transition-all active:scale-90",
              copied
                ? "text-green-500"
                : "text-on-surface-variant opacity-70 hover:opacity-100",
            )}
          >
            {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
          </IconButton>
        </div>

        <div className="p-5 font-mono bg-black/[0.03] dark:bg-white/[0.03] flex items-baseline gap-4 group">
          <span className="text-on-surface-variant/20 select-none text-sm shrink-0">
            1
          </span>
          <code className="text-sm sm:text-base flex items-center whitespace-pre shrink-0">
            <span className="text-primary/40 mr-3 select-none font-bold">
              $
            </span>
            <div className="flex flex-wrap gap-x-2.5">{tokens}</div>
          </code>
        </div>
      </div>
    );
  },
);

InstallCommand.displayName = "InstallCommand";
