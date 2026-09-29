// Shared internal color and connector layout contracts for Timeline and Stepper.
import { createContext } from "react";
export const timelineColors = ["primary", "on-primary", "primary-container", "on-primary-container", "secondary", "on-secondary", "secondary-container", "on-secondary-container", "tertiary", "on-tertiary", "tertiary-container", "on-tertiary-container", "error", "on-error", "error-container", "on-error-container", "background", "on-background", "surface", "on-surface", "surface-variant", "on-surface-variant", "outline", "outline-variant", "shadow", "scrim", "inverse-surface", "inverse-on-surface", "inverse-primary", "primary-fixed", "primary-fixed-dim", "on-primary-fixed", "on-primary-fixed-variant", "secondary-fixed", "secondary-fixed-dim", "on-secondary-fixed", "on-secondary-fixed-variant", "tertiary-fixed", "tertiary-fixed-dim", "on-tertiary-fixed", "on-tertiary-fixed-variant", "surface-dim", "surface-bright", "surface-container-lowest", "surface-container-low", "surface-container", "surface-container-high", "surface-container-highest", "surface-tint"] as const;
export type TimelineColor = typeof timelineColors[number];
export const themeColor = (color: TimelineColor) => `var(--md-sys-color-${color})`;
export const pairedColor = (color: TimelineColor): TimelineColor => {
  if (color.startsWith('on-') && color.endsWith('-fixed-variant')) return color.slice(3).replace('-variant', '') as TimelineColor;
  if (color.startsWith('on-')) return color.slice(3) as TimelineColor;
  if (color === 'inverse-surface') return 'inverse-on-surface';
  if (color === 'inverse-on-surface' || color === 'inverse-primary') return 'inverse-surface';
  if (color.includes('-fixed')) return `on-${color.split('-')[0]}-fixed` as TimelineColor;
  if (['primary', 'secondary', 'tertiary', 'error', 'background', 'primary-container', 'secondary-container', 'tertiary-container', 'error-container'].includes(color)) return `on-${color}` as TimelineColor;
  return 'on-surface';
};
export const TimelineLayoutContext = createContext({ horizontal: false, dir: 'ltr' as 'ltr' | 'rtl' });
