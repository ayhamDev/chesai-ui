"use client";

import { DirectionProvider as RadixDirectionProvider } from "@radix-ui/react-direction";
import React, { createContext, useContext, useLayoutEffect, useState } from "react";

export type Direction = "ltr" | "rtl";
export const DirectionContext = createContext<Direction | undefined>(undefined);

/** Resolve direction for geometry from an element, or from the nearest direction scope. */
export function useDirection(ref?: React.RefObject<HTMLElement | null>, explicit?: string) {
  const scoped = useContext(DirectionContext);
  const [inherited, setInherited] = useState<Direction>(scoped ?? "ltr");
  useLayoutEffect(() => {
    const element = ref?.current;
    const read = () => {
      const value = getComputedStyle(element ?? document.documentElement).direction || element?.closest("[dir]")?.getAttribute("dir") || scoped;
      setInherited(value === "rtl" ? "rtl" : "ltr");
    };
    read();
    const observer = new MutationObserver(read);
    // Direction is inherited: watch ancestors, not every node in the document.
    for (let node: HTMLElement | null = element ?? document.documentElement; node; node = node.parentElement) {
      observer.observe(node, { attributes: true, attributeFilter: ["dir", "class", "style"] });
    }
    return () => observer.disconnect();
  }, [ref, scoped, explicit]);
  return explicit === "rtl" || explicit === "ltr" ? explicit : ref ? inherited : scoped ?? inherited;
}

/** A nested direction scope that also preserves direction through Radix portals. */
export const DirectionProvider = React.forwardRef<HTMLDivElement, Omit<React.HTMLAttributes<HTMLDivElement>, "dir"> & { dir: Direction }>(
  ({ dir, children, ...props }, forwardedRef) => (
    <DirectionContext.Provider value={dir}>
      <RadixDirectionProvider dir={dir}>
        <div {...props} dir={dir} ref={forwardedRef}>{children}</div>
      </RadixDirectionProvider>
    </DirectionContext.Provider>
  ),
);
DirectionProvider.displayName = "DirectionProvider";
