// useMaterialRipple.ts
import { useRef, useCallback } from "react";

type RippleOptions = {
  color?: string;
  enterDuration?: number; // radius growth — keep SHORT, not medium
  exitDuration?: number;  // fade-out — should feel like a snap
  opacity?: number;
  disabled?: boolean;
};

// Tightened to Material's "short" motion range + emphasized curves —
// this is the actual source of the "fast/dynamic" feel.
const ENTER_EASING = "cubic-bezier(0.05, 0.7, 0.1, 1)";   // emphasized decelerate
const EXIT_EASING = "cubic-bezier(0.3, 0, 0.8, 0.15)";    // emphasized accelerate
const OPACITY_IN_DURATION = 80; // fixed, NOT scaled with enterDuration

export function useMaterialRipple({
  color = "currentColor",
  enterDuration = 200,   // was 450 — too slow, this is the main fix
  exitDuration = 140,    // was 300 — should snap, not fade gently
  opacity = 0.16,
  disabled = false,
}: RippleOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rectCache = useRef<DOMRect | null>(null);

  const fire = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (disabled || !containerRef.current) return;
      const target = containerRef.current;

      // cache the rect read so repeated taps don't force layout each time
      const rect = (rectCache.current ??= target.getBoundingClientRect());

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const radius = Math.hypot(
        Math.max(x, rect.width - x),
        Math.max(y, rect.height - y),
      );

      const span = document.createElement("span");
      Object.assign(span.style, {
        position: "absolute",
        left: `${x - radius}px`,
        top: `${y - radius}px`,
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        borderRadius: "50%",
        pointerEvents: "none",
        background: `radial-gradient(circle, ${color} 0%, ${color} 65%, transparent 80%)`,
        willChange: "transform, opacity",
      });
      target.appendChild(span);

      const growth = span.animate(
        [{ transform: "scale(0)" }, { transform: "scale(1)" }],
        { duration: enterDuration, easing: ENTER_EASING, fill: "forwards" },
      );

      // pops in fast and flat — independent of how long the radius takes
      span.animate(
        [{ opacity: 0 }, { opacity }],
        { duration: OPACITY_IN_DURATION, easing: "ease-out", fill: "forwards" },
      );

      const release = () => {
        target.removeEventListener("pointerup", release);
        target.removeEventListener("pointerleave", release);

        const startFade = () => {
          const fadeOut = span.animate(
            [{ opacity }, { opacity: 0 }],
            { duration: exitDuration, easing: EXIT_EASING, fill: "forwards" },
          );
          fadeOut.onfinish = () => span.remove();
        };

        if (growth.playState === "running") {
          growth.onfinish = startFade;
        } else {
          startFade();
        }
      };

      target.addEventListener("pointerup", release);
      target.addEventListener("pointerleave", release);
    },
    [color, enterDuration, exitDuration, opacity, disabled],
  );

  // bust the rect cache on resize so it doesn't go stale
  const bindResizeObserver = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const ro = new ResizeObserver(() => (rectCache.current = null));
    ro.observe(el);
  }, []);

  return { containerRef, onPointerDown: fire, bindResizeObserver };
}
