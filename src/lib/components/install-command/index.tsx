"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { Check, Copy } from "lucide-react";
import React, { useState } from "react";
import { IconButton } from "../icon-button";

const installCommandVariants = cva(
  "relative flex flex-col overflow-hidden border transition-colors duration-300 w-full",
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

export interface InstallCommandProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof installCommandVariants> {
  /** The name of the npm package */
  packageName: string;
  /** Whether to install as a dev dependency (-D) */
  isDevDependency?: boolean;
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
      variant,
      shape,
      shadow,
      className,
      ...props
    },
    ref,
  ) => {
    const [pm, setPm] = useState<PackageManager>("npm");
    const [copied, setCopied] = useState(false);

    const getCommand = () => {
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
    };

    const handleCopy = () => {
      navigator.clipboard.writeText(getCommand());
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
        {/* Header / Tabs */}
        <div className="flex items-center justify-between bg-surface-container-highest/30 px-3 py-1.5 border-b border-outline-variant/30">
          <div className="flex gap-1 sm:gap-2">
            {(["npm", "pnpm", "yarn", "bun"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPm(p)}
                className={clsx(
                  "text-xs font-mono px-3 py-1.5 rounded-md transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  pm === p
                    ? "bg-secondary-container text-on-secondary-container font-bold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50",
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
              copied
                ? "text-green-600 hover:text-green-700 hover:bg-green-600/10 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-400/10"
                : "text-on-surface-variant hover:text-on-surface",
            )}
            aria-label="Copy command"
          >
            {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
          </IconButton>
        </div>

        {/* Terminal Body */}
        <div className="p-4 sm:p-5 overflow-x-auto flex items-center">
          <code className="text-sm sm:text-base font-mono text-on-surface whitespace-nowrap flex items-center">
            {/* Using the primary brand color for the terminal prompt symbol */}
            <span className="text-primary mr-3 font-bold select-none">$</span>
            {getCommand()}
          </code>
        </div>
      </div>
    );
  },
);

InstallCommand.displayName = "InstallCommand";
