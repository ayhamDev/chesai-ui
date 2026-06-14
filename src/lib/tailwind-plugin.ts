// @ts-ignore - Bypasses .d.mts resolution warning under traditional "node" resolution
import plugin from "tailwindcss/plugin";
import { CSS_MAPPING } from "./utils/theme-generator";
interface TailwindPluginAPI {
  addUtilities: (utilities: Record<string, Record<string, string | number>>, options?: any) => void;
}

/**
 * Official chesai-ui Tailwind CSS Plugin.
 * Compatible with Tailwind CSS v4 (@plugin) and Tailwind CSS v3 (plugins array).
 * Adds design tokens, typography utility classes, keyframes, and animations to the compiler.
 */
export const chesaiTailwindPlugin = plugin(
  function ({ addUtilities }: TailwindPluginAPI) {
    // 1. Inject Typography Utilities for complete IntelliSense
    addUtilities({
      ".label-small": {
        fontFamily: "var(--md-sys-typescale-label-small-font)",
        fontWeight: "var(--md-sys-typescale-label-small-weight)",
        fontSize: "var(--md-sys-typescale-label-small-size)",
        fontStyle: "var(--md-sys-typescale-label-small-font-style)",
        letterSpacing: "var(--md-sys-typescale-label-small-tracking)",
        lineHeight: "var(--md-sys-typescale-label-small-line-height)",
        textTransform: "var(--md-sys-typescale-label-small-text-transform)",
        textDecoration: "var(--md-sys-typescale-label-small-text-decoration)",
      },
      ".label-medium": {
        fontFamily: "var(--md-sys-typescale-label-medium-font)",
        fontWeight: "var(--md-sys-typescale-label-medium-weight)",
        fontSize: "var(--md-sys-typescale-label-medium-size)",
        fontStyle: "var(--md-sys-typescale-label-medium-font-style)",
        letterSpacing: "var(--md-sys-typescale-label-medium-tracking)",
        lineHeight: "var(--md-sys-typescale-label-medium-line-height)",
        textTransform: "var(--md-sys-typescale-label-medium-text-transform)",
        textDecoration: "var(--md-sys-typescale-label-medium-text-decoration)",
      },
      ".label-large": {
        fontFamily: "var(--md-sys-typescale-label-large-font)",
        fontWeight: "var(--md-sys-typescale-label-large-weight)",
        fontSize: "var(--md-sys-typescale-label-large-size)",
        fontStyle: "var(--md-sys-typescale-label-large-font-style)",
        letterSpacing: "var(--md-sys-typescale-label-large-tracking)",
        lineHeight: "var(--md-sys-typescale-label-large-line-height)",
        textTransform: "var(--md-sys-typescale-label-large-text-transform)",
        textDecoration: "var(--md-sys-typescale-label-large-text-decoration)",
      },
      ".body-small": {
        fontFamily: "var(--md-sys-typescale-body-small-font)",
        fontWeight: "var(--md-sys-typescale-body-small-weight)",
        fontSize: "var(--md-sys-typescale-body-small-size)",
        fontStyle: "var(--md-sys-typescale-body-small-font-style)",
        letterSpacing: "var(--md-sys-typescale-body-small-tracking)",
        lineHeight: "var(--md-sys-typescale-body-small-line-height)",
        textTransform: "var(--md-sys-typescale-body-small-text-transform)",
        textDecoration: "var(--md-sys-typescale-body-small-text-decoration)",
      },
      ".body-medium": {
        fontFamily: "var(--md-sys-typescale-body-medium-font)",
        fontWeight: "var(--md-sys-typescale-body-medium-weight)",
        fontSize: "var(--md-sys-typescale-body-medium-size)",
        fontStyle: "var(--md-sys-typescale-body-medium-font-style)",
        letterSpacing: "var(--md-sys-typescale-body-medium-tracking)",
        lineHeight: "var(--md-sys-typescale-body-medium-line-height)",
        textTransform: "var(--md-sys-typescale-body-medium-text-transform)",
        textDecoration: "var(--md-sys-typescale-body-medium-text-decoration)",
      },
      ".body-large": {
        fontFamily: "var(--md-sys-typescale-body-large-font)",
        fontWeight: "var(--md-sys-typescale-body-large-weight)",
        fontSize: "var(--md-sys-typescale-body-large-size)",
        fontStyle: "var(--md-sys-typescale-body-large-font-style)",
        letterSpacing: "var(--md-sys-typescale-body-large-tracking)",
        lineHeight: "var(--md-sys-typescale-body-large-line-height)",
        textTransform: "var(--md-sys-typescale-body-large-text-transform)",
        textDecoration: "var(--md-sys-typescale-body-large-text-decoration)",
      },
      ".title-small": {
        fontFamily: "var(--md-sys-typescale-title-small-font)",
        fontWeight: "var(--md-sys-typescale-title-small-weight)",
        fontSize: "var(--md-sys-typescale-title-small-size)",
        fontStyle: "var(--md-sys-typescale-title-small-font-style)",
        letterSpacing: "var(--md-sys-typescale-title-small-tracking)",
        lineHeight: "var(--md-sys-typescale-title-small-line-height)",
        textTransform: "var(--md-sys-typescale-title-small-text-transform)",
        textDecoration: "var(--md-sys-typescale-title-small-text-decoration)",
      },
      ".title-medium": {
        fontFamily: "var(--md-sys-typescale-title-medium-font)",
        fontWeight: "var(--md-sys-typescale-title-medium-weight)",
        fontSize: "var(--md-sys-typescale-title-medium-size)",
        fontStyle: "var(--md-sys-typescale-title-medium-font-style)",
        letterSpacing: "var(--md-sys-typescale-title-medium-tracking)",
        lineHeight: "var(--md-sys-typescale-title-medium-line-height)",
        textTransform: "var(--md-sys-typescale-title-medium-text-transform)",
        textDecoration: "var(--md-sys-typescale-title-medium-text-decoration)",
      },
      ".title-large": {
        fontFamily: "var(--md-sys-typescale-title-large-font)",
        fontWeight: "var(--md-sys-typescale-title-large-weight)",
        fontSize: "var(--md-sys-typescale-title-large-size)",
        fontStyle: "var(--md-sys-typescale-title-large-font-style)",
        letterSpacing: "var(--md-sys-typescale-title-large-tracking)",
        lineHeight: "var(--md-sys-typescale-title-large-line-height)",
        textTransform: "var(--md-sys-typescale-title-large-text-transform)",
        textDecoration: "var(--md-sys-typescale-title-large-text-decoration)",
      },
      ".headline-small": {
        fontFamily: "var(--md-sys-typescale-headline-small-font)",
        fontWeight: "var(--md-sys-typescale-headline-small-weight)",
        fontSize: "var(--md-sys-typescale-headline-small-size)",
        fontStyle: "var(--md-sys-typescale-headline-small-font-style)",
        letterSpacing: "var(--md-sys-typescale-headline-small-tracking)",
        lineHeight: "var(--md-sys-typescale-headline-small-line-height)",
        textTransform: "var(--md-sys-typescale-headline-small-text-transform)",
        textDecoration: "var(--md-sys-typescale-headline-small-text-decoration)",
      },
      ".headline-medium": {
        fontFamily: "var(--md-sys-typescale-headline-medium-font)",
        fontWeight: "var(--md-sys-typescale-headline-medium-weight)",
        fontSize: "var(--md-sys-typescale-headline-medium-size)",
        fontStyle: "var(--md-sys-typescale-headline-medium-font-style)",
        letterSpacing: "var(--md-sys-typescale-headline-medium-tracking)",
        lineHeight: "var(--md-sys-typescale-headline-medium-line-height)",
        textTransform: "var(--md-sys-typescale-headline-medium-text-transform)",
        textDecoration: "var(--md-sys-typescale-headline-medium-text-decoration)",
      },
      ".headline-large": {
        fontFamily: "var(--md-sys-typescale-headline-large-font)",
        fontWeight: "var(--md-sys-typescale-headline-large-weight)",
        fontSize: "var(--md-sys-typescale-headline-large-size)",
        fontStyle: "var(--md-sys-typescale-headline-large-font-style)",
        letterSpacing: "var(--md-sys-typescale-headline-large-tracking)",
        lineHeight: "var(--md-sys-typescale-headline-large-line-height)",
        textTransform: "var(--md-sys-typescale-headline-large-text-transform)",
        textDecoration: "var(--md-sys-typescale-headline-large-text-decoration)",
      },
      ".display-small": {
        fontFamily: "var(--md-sys-typescale-display-small-font)",
        fontWeight: "var(--md-sys-typescale-display-small-weight)",
        fontSize: "var(--md-sys-typescale-display-small-size)",
        fontStyle: "var(--md-sys-typescale-display-small-font-style)",
        letterSpacing: "var(--md-sys-typescale-display-small-tracking)",
        lineHeight: "var(--md-sys-typescale-display-small-line-height)",
        textTransform: "var(--md-sys-typescale-display-small-text-transform)",
        textDecoration: "var(--md-sys-typescale-display-small-text-decoration)",
      },
      ".display-medium": {
        fontFamily: "var(--md-sys-typescale-display-medium-font)",
        fontWeight: "var(--md-sys-typescale-display-medium-weight)",
        fontSize: "var(--md-sys-typescale-display-medium-size)",
        fontStyle: "var(--md-sys-typescale-display-medium-font-style)",
        letterSpacing: "var(--md-sys-typescale-display-medium-tracking)",
        lineHeight: "var(--md-sys-typescale-display-medium-line-height)",
        textTransform: "var(--md-sys-typescale-display-medium-text-transform)",
        textDecoration: "var(--md-sys-typescale-display-medium-text-decoration)",
      },
      ".display-large": {
        fontFamily: "var(--md-sys-typescale-display-large-font)",
        fontWeight: "var(--md-sys-typescale-display-large-weight)",
        fontSize: "var(--md-sys-typescale-display-large-size)",
        fontStyle: "var(--md-sys-typescale-display-large-font-style)",
        letterSpacing: "var(--md-sys-typescale-display-large-tracking)",
        lineHeight: "var(--md-sys-typescale-display-large-line-height)",
        textTransform: "var(--md-sys-typescale-display-large-text-transform)",
        textDecoration: "var(--md-sys-typescale-display-large-text-decoration)",
      },
    });
  },
  {
    theme: {
      extend: {
        // Automatically inject MD3 Color mappings
        colors: Object.entries(CSS_MAPPING).reduce((acc, [, cssKey]) => {
          acc[cssKey] = `var(--md-sys-color-${cssKey})`;
          return acc;
        }, {} as Record<string, string>),
        
        // Inject keyframes and animations for autocomplete
        animation: {
          "loading-linear": "loading-linear-move 1.5s infinite ease-in-out",
          "loading-wavy": "loading-wavy-move 1.6s linear infinite",
          "loading-wave-flow": "loading-wave-translate 1s linear infinite",
          "loading-circular-wavy-crawl": "circular-wavy-crawl 2s linear infinite",
          "loading-circular": "loading-circular-rotate 1.4s linear infinite",
          "loading-circular-slow": "loading-circular-rotate 4s linear infinite",
          "progress-indeterminate-1": "progress-indeterminate-1 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite",
          "progress-indeterminate-2": "progress-indeterminate-2 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite 1.15s",
          "progress-circular-indeterminate": "progress-circular-indeterminate 1.4s ease-in-out infinite",
          "accordion-down": "accordion-down 200ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
          "accordion-up": "accordion-up 200ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
          "caret-blink": "caret-blink 1.25s ease-out infinite",
        },
        keyframes: {
          "loading-linear-move": { "0%": { left: "-40%" }, "100%": { left: "100%" } },
          "loading-wavy-move": { from: { strokeDashoffset: "0" }, to: { strokeDashoffset: "-240" } },
          "loading-wave-translate": { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-40px)" } },
          "circular-wavy-crawl": { from: { strokeDashoffset: "0" }, to: { strokeDashoffset: "-133" } },
          "loading-circular-rotate": { "100%": { transform: "rotate(360deg)" } },
          "progress-indeterminate-1": { "0%": { left: "-35%", width: "35%" }, "60%, 100%": { left: "100%", width: "10%" } },
          "progress-indeterminate-2": { "0%": { left: "-200%", width: "10%" }, "60%": { left: "107%", width: "20%" }, "100%": { left: "107%", width: "10%" } },
          "progress-circular-indeterminate": { "0%": { strokeDasharray: "1px, 200px", strokeDashoffset: "0" }, "50%": { strokeDasharray: "100px, 200px", strokeDashoffset: "-15px" }, "100%": { strokeDasharray: "100px, 200px", strokeDashoffset: "-125px" } },
          "accordion-down": { from: { height: "0", opacity: "0" }, to: { height: "var(--radix-accordion-content-height)", opacity: "1" } },
          "accordion-up": { from: { height: "var(--radix-accordion-content-height)", opacity: "1" }, to: { height: "0", opacity: "0" } },
          "caret-blink": { "0%, 70%, 100%": { opacity: "1" }, "20%, 50%": { opacity: "0" } },
        },
      },
    },
  }
);
