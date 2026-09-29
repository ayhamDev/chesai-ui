/** Shared blur sizes for page-covering backdrops. */
export type OverlayBlur = "none" | "xs" | "sm" | "md" | "lg" | "xl";

export const overlayBlurClasses: Record<OverlayBlur, string> = {
  none: "chesai-overlay backdrop-blur-none",
  xs: "chesai-overlay backdrop-blur-[2px]",
  sm: "chesai-overlay backdrop-blur-[4px]",
  md: "chesai-overlay backdrop-blur-[8px]",
  lg: "chesai-overlay backdrop-blur-[16px]",
  xl: "chesai-overlay backdrop-blur-[24px]",
};
