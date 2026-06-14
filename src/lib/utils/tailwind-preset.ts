import { CSS_MAPPING } from "./theme-generator";

/**
 * An exportable color configuration object matching chesai-ui's design tokens.
 * Can be spread directly into a client's tailwind.config.js theme settings.
 */
export const chesaiColors = Object.entries(CSS_MAPPING).reduce(
  (acc, [, cssKey]) => {
    // Map tailwind color keys directly to CSS variables
    acc[cssKey] = `var(--md-sys-color-${cssKey})`;
    return acc;
  },
  {} as Record<string, string>
);
