// src/lib/components/website-studio/ThemeInjector.tsx
import React from "react";
import type { DesignSystemSchema } from "./types";

interface ThemeInjectorProps {
  designSystem: DesignSystemSchema;
  children: React.ReactNode;
}

/**
 * Injects the agnostic design system tokens as CSS Variables into a wrapper div.
 * This guarantees the styling cascades down to all child components.
 */
export const ThemeInjector: React.FC<ThemeInjectorProps> = ({
  designSystem,
  children,
}) => {
  // Convert the tokens Record into a React CSSProperties object
  const cssVariables = Object.entries(designSystem.tokens).reduce(
    (acc, [key, value]) => {
      // Ensure the key starts with '--'
      const varName = key.startsWith("--") ? key : `--${key}`;
      acc[varName] = value;
      return acc;
    },
    {} as Record<string, any>,
  );

  return (
    <div
      className="website-studio-theme-root"
      style={cssVariables as React.CSSProperties}
      data-theme-mode={designSystem.mode} // Hook for Dark/Light mode CSS selectors
    >
      {children}
    </div>
  );
};
