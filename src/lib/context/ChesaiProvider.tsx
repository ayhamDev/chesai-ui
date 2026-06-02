"use client";

import React from "react";
import { Toaster } from "../components/toast";
import { TooltipProvider } from "../components/tooltip";
import { ActionSheetProvider } from "./ActionSheetProvider";
import { ThemeProvider } from "./ThemeProvider";
import { LayoutProvider, type Direction } from "./layout-context";
import { DialogProvider } from "./DialogProvider";

type Theme = "dark" | "light" | "system";
type Contrast = "standard" | "medium" | "high";
type AnimationStyle = "expressive" | "standard";

export interface ChesaiProviderProps {
  children: React.ReactNode;
  /** Initial theme preference. Defaults to 'system' */
  defaultTheme?: Theme;
  /** Initial contrast preference. Defaults to 'standard' */
  defaultContrast?: Contrast;
  /** Initial animation preference. Defaults to 'expressive' */
  defaultAnimationStyle?: AnimationStyle;
  /** Initial layout direction. Defaults to 'ltr' */
  initialDirection?: Direction;
  /** Custom storage key for theme persistence */
  themeStorageKey?: string;
  /** Custom storage key for direction persistence */
  layoutStorageKey?: string;
  /** Props to pass directly to the Sonner Toaster */
  toasterProps?: React.ComponentProps<typeof Toaster>;
}

export function ChesaiProvider({
  children,
  defaultTheme = "system",
  defaultContrast = "standard",
  defaultAnimationStyle = "expressive",
  initialDirection = "ltr",
  themeStorageKey = "chesai-ui-theme",
  layoutStorageKey = "layout-direction",
  toasterProps,
}: ChesaiProviderProps) {
  return (
    <ThemeProvider
      defaultTheme={defaultTheme}
      defaultContrast={defaultContrast}
      defaultAnimationStyle={defaultAnimationStyle}
      storageKey={themeStorageKey}
    >
      <LayoutProvider
        initialDirection={initialDirection}
        storageKey={layoutStorageKey}
      >
        <TooltipProvider>
          <ActionSheetProvider>
            <DialogProvider>
              {children}
              <Toaster {...toasterProps} />
            </DialogProvider>
          </ActionSheetProvider>
        </TooltipProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
}
