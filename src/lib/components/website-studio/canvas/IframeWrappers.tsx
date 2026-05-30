// src/lib/components/website-studio/canvas/IframeWrappers.tsx

import React, { useEffect, useRef } from "react";

export const NavigationInterceptor = ({
  children,
  onNavigate,
}: {
  children: React.ReactNode;
  onNavigate: (linkTo: string) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleNav = (e: any) => {
      e.stopPropagation();
      onNavigate(e.detail.linkTo);
    };

    el.addEventListener("studio-navigate", handleNav);
    return () => el.removeEventListener("studio-navigate", handleNav);
  }, [onNavigate]);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-full"
      onClickCapture={(e) => {
        const a = (e.target as HTMLElement).closest("a");
        if (a) {
          const href = a.getAttribute("href");
          if (href && href.startsWith("/")) {
            e.preventDefault();
            e.stopPropagation();
            onNavigate(href);
          }
        }
      }}
    >
      {children}
    </div>
  );
};

export const IframeContentObserver = ({
  children,
  onHeightChange,
}: {
  children: React.ReactNode;
  onHeightChange: (h: number) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId: number;

    const updateHeight = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!el) return;
        const rectHeight = el.getBoundingClientRect().height;
        const scrollHeight = el.scrollHeight;
        onHeightChange(Math.max(rectHeight, scrollHeight));
      });
    };

    const resizeObserver = new ResizeObserver(() => updateHeight());
    resizeObserver.observe(el);

    const mutationObserver = new MutationObserver(() => updateHeight());
    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    updateHeight();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [onHeightChange]);

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col relative overflow-hidden"
    >
      {children}
    </div>
  );
};
