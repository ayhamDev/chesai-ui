"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * A styled wrapper around the `sonner` library, configured to match the
 * Material Design 3 theme tokens defined in chesai-ui.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  // Optional: Hook into your theme provider if you need to force a specific mode
  // const { theme = "system" } = useTheme();

  return (
    <Sonner
      // We rely on CSS variables, so 'system' usually works best,
      // but you can pass the active theme string here if needed.
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames: {
          // --- Main Container ---
          // MD3 uses Surface Container High for Toasts/Snackbars to separate from body content
          toast:
            "group toast group-[.toaster]:bg-surface-container-high group-[.toaster]:text-on-surface " +
            "group-[.toaster]:border-outline-variant/50 group-[.toaster]:border " +
            "group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl " +
            "group-[.toaster]:p-4 group-[.toaster]:gap-3 " +
            "font-manrope",

          // --- Typography ---
          title:
            "group-[.toast]:font-bold group-[.toast]:text-sm group-[.toast]:text-on-surface",
          description:
            "group-[.toast]:text-on-surface-variant group-[.toast]:text-xs group-[.toast]:leading-relaxed",

          // --- Buttons ---
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-on-primary group-[.toast]:font-semibold group-[.toast]:rounded-lg group-[.toast]:text-xs group-[.toast]:h-8 group-[.toast]:px-3",
          cancelButton:
            "group-[.toast]:bg-surface-container-highest group-[.toast]:text-on-surface group-[.toast]:hover:bg-surface-container group-[.toast]:font-medium group-[.toast]:rounded-lg group-[.toast]:text-xs group-[.toast]:h-8 group-[.toast]:px-3",

          // --- State Colors (Icons & Titles) ---
          // Success: No strict MD3 token, so we fallback to standard green but style it like the system
          success:
            "group-[.toast]:text-green-600 dark:group-[.toast]:text-green-400 [&_svg]:!text-green-600 dark:[&_svg]:!text-green-400",

          // Error: Uses your --md-sys-color-error
          error: "group-[.toast]:text-error [&_svg]:!text-error",

          // Info: Uses your --md-sys-color-primary
          info: "group-[.toast]:text-primary [&_svg]:!text-primary",

          // Warning: Uses your --md-sys-color-tertiary
          warning: "group-[.toast]:text-tertiary [&_svg]:!text-tertiary",

          // --- Loader ---
          loader: "group-[.toast]:text-on-surface-variant",
        },
      }}
      {...props}
    />
  );
};

// Re-export the toast function from sonner for easy access
export { toast } from "sonner";
export { Toaster };
