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
            "group toast group-[.toaster]:bg-graphite-card group-[.toaster]:text-graphite-foreground group-[.toaster]:border-graphite-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-500",

          // --- Button Styling ---
          actionButton:
            "group-[.toast]:bg-graphite-primary group-[.toast]:text-graphite-primaryForeground",
          cancelButton:
            "group-[.toast]:bg-graphite-secondary group-[.toast]:text-graphite-secondaryForeground",

          // --- Icon Styling for Different States ---
          success:
            "group-[.toast]:!text-green-500 group-[.toast]:[&_[data-icon]]:!text-green-500",
          error:
            "group-[.toast]:!text-red-500 group-[.toast]:[&_[data-icon]]:!text-red-500",
          warning:
            "group-[.toast]:!text-yellow-500 group-[.toast]:[&_[data-icon]]:!text-yellow-500",
          info: "group-[.toast]:!text-blue-500 group-[.toast]:[&_[data-icon]]:!text-blue-500",
        },
      }}
      {...props}
    />
  );
};

// Re-export the toast function from sonner for easy access
export { toast } from "sonner";
export { Toaster };
