"use client";

import React from "react";
import { Toaster } from "../components/toast";
import { TooltipProvider } from "../components/tooltip";
import { ActionSheetProvider } from "./ActionSheetProvider";
import { ThemeProvider } from "./ThemeProvider";
import { LayoutProvider, type Direction } from "./layout-context";

type Theme = "dark" | "light" | "system";
type Contrast = "standard" | "medium" | "high";

export interface ChesaiProviderProps {
  children: React.ReactNode;
  /** Initial theme preference. Defaults to 'system' */
  defaultTheme?: Theme;
  /** Initial contrast preference. Defaults to 'standard' */
  defaultContrast?: Contrast;
  /** Initial layout direction. Defaults to 'ltr' */
  initialDirection?: Direction;
  /** Custom storage key for theme persistence */
  themeStorageKey?: string;
  /** Custom storage key for direction persistence */
  layoutStorageKey?: string;
  /** Props to pass directly to the Sonner Toaster */
  toasterProps?: React.ComponentProps<typeof Toaster>;
}

/**
 * ChesaiProvider
 * The root provider that integrates all design system contexts.
 * Wrap your root layout (Next.js) or App component (Vite/CRA) with this.
 */
export function ChesaiProvider({
  children,
  defaultTheme = "system",
  defaultContrast = "standard",
  initialDirection = "ltr",
  themeStorageKey = "chesai-ui-theme",
  layoutStorageKey = "layout-direction",
  toasterProps,
}: ChesaiProviderProps) {
  return (
    <ThemeProvider
      defaultTheme={defaultTheme}
      defaultContrast={defaultContrast}
      storageKey={themeStorageKey}
    >
      <LayoutProvider
        initialDirection={initialDirection}
        storageKey={layoutStorageKey}
      >
        <TooltipProvider>
          <ActionSheetProvider>
            {/* Added DialogProvider inside ActionSheetProvider */}
            {children}
            <Toaster {...toasterProps} />
          </ActionSheetProvider>
        </TooltipProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
}
