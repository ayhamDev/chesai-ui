"use client";

import { Slot } from "@radix-ui/react-slot";
import React, { forwardRef } from "react";
import { useViewTransition } from "../../hooks/use-view-transition";
export * from "../../hooks/use-view-transition";
export interface TransitionLinkProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The imperative navigation function to execute (e.g., router.push('/about'))
   */
  onNavigate: () => void | Promise<void>;
  /**
   * Set to true to merge props onto a child element instead of rendering a <div>
   */
  asChild?: boolean;
}

export const TransitionLink = forwardRef<HTMLElement, TransitionLinkProps>(
  ({ onNavigate, asChild = false, children, ...props }, ref) => {
    const startTransition = useViewTransition();
    const Comp = asChild ? Slot : "div";

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault(); // Prevent standard browser navigation
      startTransition(() => {
        return onNavigate();
      });
    };

    return (
      <Comp ref={ref} onClick={handleClick} {...props}>
        {children}
      </Comp>
    );
  },
);

TransitionLink.displayName = "TransitionLink";
