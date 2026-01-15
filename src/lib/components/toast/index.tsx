"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * A toaster component that displays notifications. It is a styled wrapper
 * around the `sonner` library, configured to match the chesai-ui theme.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      // The chesai-ui theme is light, so we set the sonner theme accordingly.
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          // --- General Toast Styling ---
          toast:
            "group toast group-[.toaster]:bg-surface-container group-[.toaster]:text-on-surface group-[.toaster]:border-outline-variant group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-on-surface-variant",

          // --- Button Styling ---
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-on-primary",
          cancelButton:
            "group-[.toast]:bg-secondary-container group-[.toast]:text-on-secondary-container",

          // --- Icon Styling for Different States ---
          // Using standard colors since 'success' etc aren't in our core palette yet,
          // or mapping error to our error token.
          success:
            "group-[.toast]:!text-green-600 group-[.toast]:[&_[data-icon]]:!text-green-600",
          error:
            "group-[.toast]:!text-error group-[.toast]:[&_[data-icon]]:!text-error",
          warning:
            "group-[.toast]:!text-yellow-600 group-[.toast]:[&_[data-icon]]:!text-yellow-600",
          info: "group-[.toast]:!text-primary group-[.toast]:[&_[data-icon]]:!text-primary",
        },
      }}
      {...props}
    />
  );
};

// Re-export the toast function from sonner for easy access
export { toast } from "sonner";
export { Toaster };
