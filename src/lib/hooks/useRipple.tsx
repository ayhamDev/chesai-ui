import { useRef, useCallback, useEffect, useMemo, useInsertionEffect } from "react";

/**
 * useRipple — a faithful recreation of the native Android 16 / Material 3
 * Expressive ripple (state-layer + press-ripple) for any React component.
 *
 * What it matches, and why:
 *
 * 1. TWO LAYERS, NOT ONE.
 *    Android's ripple is actually two visual systems stacked together:
 *      - A "state layer": a flat, full-surface wash of color whose opacity
 *        depends on interaction state (hover/focus/press/drag). This is
 *        M3's RippleAlpha token set: hovered 0.08, focused 0.10,
 *        pressed 0.10, dragged 0.16.
 *      - A "press ripple": a circle that grows from the touch point out to
 *        cover the surface, on top of the state layer, then fades on release.
 *    Most web "ripple" implementations only do the second part. This hook
 *    does both, which is what actually makes it read as "Android" rather
 *    than "material-ish CSS effect."
 *
 * 2. PHYSICS, NOT EASING CURVES.
 *    M3 Expressive replaced fixed-duration/easing-curve motion with a
 *    spring model (stiffness + damping, no fixed duration). We reproduce
 *    that with a real damped-spring integrator (semi-implicit Euler) run
 *    on a rAF loop, rather than a CSS transition with a bezier. This is
 *    what gives the ripple its slight "settle" characteristic instead of
 *    a mechanical ease-out.
 *      - Expansion uses a "spatial" spring (radius is a position): default
 *        stiffness/damping tuned to resolve in ~350–450ms with no overshoot
 *        (Android's ripple does not bounce past full size).
 *      - Fade-out uses an "effects" spring (opacity): critically damped,
 *        slightly faster, since M3 defines effects springs as strictly
 *        non-overshooting.
 *
 * 3. RADIUS MATH MATCHES THE PLATFORM FORMULA.
 *    Android's RippleDrawable sizes the ripple to comfortably cover the
 *    farthest corner from the touch point (with a minimum so tiny targets
 *    still get a visible ripple), not just "big enough for the box."
 *
 * 4. UNBOUNDED VS BOUNDED.
 *    Bounded (default): clipped to the element, corner radius inherited —
 *    used for buttons, cards, list rows.
 *    Unbounded: not clipped, ripple centers on the pointer and is allowed
 *    to spill outside the element bounds — used for icon buttons / chips
 *    with a circular hit target larger than the visible icon.
 *
 * 5. RIGHT-CLICK / MULTI-TOUCH: Android tracks each pointer's ripple
 *    independently and only the primary press drives the state layer.
 *    This hook keeps a map of live ripples keyed by pointerId so fast
 *    repeated taps (or multi-touch) each get their own circle, exactly
 *    like RippleDrawable's layered PatternedShader ripples.
 *
 * Usage:
 *   const { rippleProps, RippleContainer } = useRipple();
 *   return <button {...rippleProps}>{RippleContainer}Click me</button>;
 *
 * Or the lower-level form if you want to place the container yourself:
 *   const ripple = useRipple({ unbounded: true, color: 'currentColor' });
 *   <div {...ripple.rippleProps} style={{ position: 'relative' }}>
 *     {ripple.RippleContainer}
 *   </div>
 */

// ---------------------------------------------------------------------------
// Tunables — sourced from Material 3 / Compose ripple + M3 Expressive motion
// physics tokens. Kept as named constants so you can retune per-brand
// without hunting through the integrator.
// ---------------------------------------------------------------------------

/** RippleAlpha state-layer opacities (androidx.compose.material3 StateTokens). */
export const RIPPLE_STATE_ALPHA = {
  hovered: 0.08,
  focused: 0.1,
  pressed: 0.1,
  dragged: 0.16,
} as const;

/** Spatial spring (radius growth) — default M3 Expressive "default" speed, no overshoot. */
const EXPAND_SPRING = {
  stiffness: 180, // N/m-equivalent; higher = resolves faster
  damping: 26, // critically-damped-ish; Android ripple expansion doesn't bounce
  mass: 1,
};

/** Effects spring (opacity fade) — faster & fully critically damped, per M3 "effects" spec. */
const FADE_SPRING = {
  stiffness: 260,
  damping: 30,
  mass: 1,
};

/** Minimum ripple end-radius in px so small touch targets still show a clear ripple. */
const MIN_RADIUS = 24;

/** How much padding beyond the exact bounding radius, matching RippleDrawable's generous coverage. */
const RADIUS_PAD = 10;

/** Rest threshold: below this combined velocity+distance-to-target, treat spring as settled. */
const REST_EPSILON = 0.001;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseRippleOptions {
  /** Ripple/state-layer color. Any valid CSS color. Defaults to currentColor. */
  color?: string;
  /**
   * Unbounded ripples aren't clipped to the element and center on the
   * pointer without being constrained by the element's border radius.
   * Use for icon buttons / circular touch targets. Default: false.
   */
  unbounded?: boolean;
  /** Disable all interaction feedback (mirrors Android's disabled state — no ripple, no state layer). */
  disabled?: boolean;
  /**
   * Corner radius to clip bounded ripples to. If omitted, the hook reads
   * the element's computed border-radius so it always matches your CSS.
   */
  borderRadius?: string;
  /** Multiplier applied to the natural end-radius. 1 = exact platform sizing. */
  radiusScale?: number;
}

interface LiveRipple {
  id: number;
  x: number;
  y: number;
  targetRadius: number;
  // spring state for radius
  radius: number;
  radiusVelocity: number;
  // spring state for opacity (fade out only starts once triggered)
  opacity: number;
  opacityVelocity: number;
  fadeTarget: number;
  fading: boolean;
  pointerId: number | null;
}

// ---------------------------------------------------------------------------
// Spring integrator — semi-implicit Euler damped spring, matches the feel of
// Android's physics-based motion tokens far better than a CSS cubic-bezier.
// ---------------------------------------------------------------------------

function stepSpring(
  value: number,
  velocity: number,
  target: number,
  spring: { stiffness: number; damping: number; mass: number },
  dt: number
): [number, number] {
  const { stiffness, damping, mass } = spring;
  const displacement = value - target;
  const springForce = -stiffness * displacement;
  const dampingForce = -damping * velocity;
  const acceleration = (springForce + dampingForce) / mass;
  const newVelocity = velocity + acceleration * dt;
  const newValue = value + newVelocity * dt;
  return [newValue, newVelocity];
}

function isSettled(value: number, velocity: number, target: number): boolean {
  return Math.abs(value - target) < REST_EPSILON && Math.abs(velocity) < REST_EPSILON;
}

// ---------------------------------------------------------------------------
// The hook
// ---------------------------------------------------------------------------

let rippleIdCounter = 0;

export function useRipple(options: UseRippleOptions = {}) {
  const {
    color = "currentColor",
    unbounded = false,
    disabled = false,
    borderRadius,
    radiusScale = 1,
  } = options;

  const hostRef = useRef<HTMLElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const stateLayerRef = useRef<HTMLDivElement | null>(null);

  const ripples = useRef<Map<number, LiveRipple>>(new Map());
  const rafRef = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);

  // Interaction state drives the flat state-layer opacity, independent of
  // any individual ripple circle's own fade animation.
  const interaction = useRef({
    hovered: false,
    focused: false,
    pressed: false,
    dragged: false,
  });
  const stateLayerOpacityCurrent = useRef(0);
  const stateLayerOpacityVelocity = useRef(0);

  const setHostNode = useCallback((node: HTMLElement | null) => {
    hostRef.current = node;
  }, []);

  // -------------------------------------------------------------------
  // Compute target state-layer opacity from current interaction flags.
  // Android sums layered states but caps sensibly; we take the max, which
  // matches how RippleDrawable's single state-layer view actually behaves
  // (states are mutually reinforcing, not additive, in practice).
  // -------------------------------------------------------------------
  const targetStateOpacity = useCallback(() => {
    const s = interaction.current;
    if (disabled) return 0;
    let max = 0;
    if (s.dragged) max = Math.max(max, RIPPLE_STATE_ALPHA.dragged);
    if (s.pressed) max = Math.max(max, RIPPLE_STATE_ALPHA.pressed);
    if (s.focused) max = Math.max(max, RIPPLE_STATE_ALPHA.focused);
    if (s.hovered) max = Math.max(max, RIPPLE_STATE_ALPHA.hovered);
    return max;
  }, [disabled]);

  // -------------------------------------------------------------------
  // rAF loop: advances every live ripple's radius/opacity springs plus
  // the shared state-layer opacity spring, then paints. Loop tears itself
  // down when everything has settled, rather than running forever.
  // -------------------------------------------------------------------
  const tick = useCallback(
    (time: number) => {
      const dtRaw = lastFrameTime.current ? (time - lastFrameTime.current) / 1000 : 1 / 60;
      lastFrameTime.current = time;
      // Clamp dt so a background tab / jank spike doesn't blow up the spring.
      const dt = Math.min(dtRaw, 1 / 30);

      let anyActive = false;

      // Advance state layer opacity spring.
      const target = targetStateOpacity();
      const [so, sv] = stepSpring(
        stateLayerOpacityCurrent.current,
        stateLayerOpacityVelocity.current,
        target,
        FADE_SPRING,
        dt
      );
      stateLayerOpacityCurrent.current = so;
      stateLayerOpacityVelocity.current = sv;
      if (!isSettled(so, sv, target)) anyActive = true;
      if (stateLayerRef.current) {
        stateLayerRef.current.style.opacity = String(Math.max(0, Math.min(1, so)));
      }

      // Advance every live ripple.
      const toRemove: number[] = [];
      ripples.current.forEach((r) => {
        const [nr, nrv] = stepSpring(r.radius, r.radiusVelocity, r.targetRadius, EXPAND_SPRING, dt);
        r.radius = nr;
        r.radiusVelocity = nrv;
        const radiusSettled = isSettled(nr, nrv, r.targetRadius);

        let opacitySettled = true;
        if (r.fading) {
          const [no, nov] = stepSpring(r.opacity, r.opacityVelocity, r.fadeTarget, FADE_SPRING, dt);
          r.opacity = no;
          r.opacityVelocity = nov;
          opacitySettled = isSettled(no, nov, r.fadeTarget);
          if (opacitySettled && r.fadeTarget === 0) {
            toRemove.push(r.id);
          }
        }

        if (!radiusSettled || !opacitySettled) anyActive = true;
      });

      toRemove.forEach((id) => ripples.current.delete(id));

      paint();

      if (anyActive || ripples.current.size > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        lastFrameTime.current = 0;
      }
    },
    [targetStateOpacity]
  );

  const ensureLoopRunning = useCallback(() => {
    if (rafRef.current == null) {
      lastFrameTime.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  // -------------------------------------------------------------------
  // Paint: writes <circle> elements into the SVG layer. Using SVG rather
  // than N absolutely-positioned divs keeps clipping, blending, and
  // radius math simple and avoids layout thrash (only attribute writes,
  // no reflow).
  // -------------------------------------------------------------------
  const paint = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const liveIds = new Set<number>();
    ripples.current.forEach((r) => {
      liveIds.add(r.id);
      let circle = svg.querySelector<SVGCircleElement>(`circle[data-ripple-id="${r.id}"]`);
      if (!circle) {
        circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("data-ripple-id", String(r.id));
        circle.style.pointerEvents = "none";
        svg.appendChild(circle);
      }
      circle.setAttribute("cx", String(r.x));
      circle.setAttribute("cy", String(r.y));
      circle.setAttribute("r", String(Math.max(0, r.radius)));
      circle.setAttribute("fill", color);
      circle.style.opacity = String(Math.max(0, Math.min(1, r.opacity)));
    });

    // Remove circles for ripples that no longer exist.
    svg.querySelectorAll<SVGCircleElement>("circle[data-ripple-id]").forEach((el) => {
      const id = Number(el.getAttribute("data-ripple-id"));
      if (!liveIds.has(id)) el.remove();
    });
  }, [color]);

  // -------------------------------------------------------------------
  // Spawn a new ripple circle at (x, y) relative to the host element.
  // Radius target follows RippleDrawable's "cover the farthest corner"
  // formula with a sensible minimum for small targets.
  // -------------------------------------------------------------------
  const spawnRipple = useCallback(
    (clientX: number, clientY: number, pointerId: number | null) => {
      const host = hostRef.current;
      if (!host || disabled) return;
      const rect = host.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const corners = [
        Math.hypot(x, y),
        Math.hypot(rect.width - x, y),
        Math.hypot(x, rect.height - y),
        Math.hypot(rect.width - x, rect.height - y),
      ];
      const targetRadius = Math.max(Math.max(...corners) + RADIUS_PAD, MIN_RADIUS) * radiusScale;

      const id = ++rippleIdCounter;
      const ripple: LiveRipple = {
        id,
        x,
        y,
        targetRadius,
        radius: targetRadius * 0.35, // start partway out — Android ripples don't spawn from a literal zero-radius point, they "pop" in slightly
        radiusVelocity: 0,
        opacity: 0.9,
        opacityVelocity: 0,
        fadeTarget: 0.9,
        fading: false,
        pointerId,
      };
      ripples.current.set(id, ripple);
      ensureLoopRunning();
      return id;
    },
    [disabled, radiusScale, ensureLoopRunning]
  );

  /** Begin the fade-out for a specific ripple (or all, if id omitted). */
  const releaseRipple = useCallback(
    (id?: number) => {
      if (id != null) {
        const r = ripples.current.get(id);
        if (r) {
          r.fading = true;
          r.fadeTarget = 0;
        }
      } else {
        ripples.current.forEach((r) => {
          r.fading = true;
          r.fadeTarget = 0;
        });
      }
      ensureLoopRunning();
    },
    [ensureLoopRunning]
  );

  // Track which ripple id belongs to which live pointer, so pointer-up
  // releases the right one even with multi-touch.
  const pointerRippleMap = useRef<Map<number, number>>(new Map());

  // -------------------------------------------------------------------
  // Event handlers
  // -------------------------------------------------------------------
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      // Only left click / primary touch / pen drives ripple + press state.
      if (e.pointerType === "mouse" && e.button !== 0) return;

      interaction.current.pressed = true;
      const id = spawnRipple(e.clientX, e.clientY, e.pointerId);
      if (id != null) pointerRippleMap.current.set(e.pointerId, id);
      ensureLoopRunning();
    },
    [disabled, spawnRipple, ensureLoopRunning]
  );

  const endPress = useCallback(
    (e: React.PointerEvent) => {
      interaction.current.pressed = false;
      const id = pointerRippleMap.current.get(e.pointerId);
      if (id != null) {
        releaseRipple(id);
        pointerRippleMap.current.delete(e.pointerId);
      }
    },
    [releaseRipple]
  );

  const onPointerEnter = useCallback(() => {
    if (disabled) return;
    interaction.current.hovered = true;
    ensureLoopRunning();
  }, [disabled, ensureLoopRunning]);

  const onPointerLeave = useCallback(
    (e: React.PointerEvent) => {
      interaction.current.hovered = false;
      // If the pointer leaves mid-press (drag-off), still release its ripple —
      // matches Android cancelling the ripple when the touch exits bounds.
      endPress(e);
      ensureLoopRunning();
    },
    [endPress, ensureLoopRunning]
  );

  const onFocus = useCallback(() => {
    if (disabled) return;
    interaction.current.focused = true;
    ensureLoopRunning();
  }, [disabled, ensureLoopRunning]);

  const onBlur = useCallback(() => {
    interaction.current.focused = false;
    ensureLoopRunning();
  }, [ensureLoopRunning]);

  // Keyboard activation (Enter/Space on a focused button) should also
  // ripple from the center, matching TalkBack/keyboard-driven activation
  // on Android, which centers the ripple rather than using a stale pointer.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      if (e.repeat) return;
      const host = hostRef.current;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      interaction.current.pressed = true;
      const id = spawnRipple(rect.left + rect.width / 2, rect.top + rect.height / 2, -1);
      if (id != null) pointerRippleMap.current.set(-1, id);
      ensureLoopRunning();
    },
    [disabled, spawnRipple, ensureLoopRunning]
  );

  const onKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      interaction.current.pressed = false;
      const id = pointerRippleMap.current.get(-1);
      if (id != null) {
        releaseRipple(id);
        pointerRippleMap.current.delete(-1);
      }
    },
    [releaseRipple]
  );

  // Cancel on context menu / pointer cancel (e.g. scroll interrupts touch),
  // matching Android's ripple cancellation on gesture cancel.
  const onPointerCancel = useCallback(
    (e: React.PointerEvent) => {
      interaction.current.pressed = false;
      const id = pointerRippleMap.current.get(e.pointerId);
      if (id != null) {
        releaseRipple(id);
        pointerRippleMap.current.delete(e.pointerId);
      }
    },
    [releaseRipple]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Resolve border radius once per render from options or the live element,
  // so bounded ripples always clip to match your actual CSS shape.
  const resolvedRadius = useRef<string | undefined>(borderRadius);
  useInsertionEffect(() => {
    resolvedRadius.current = borderRadius;
  }, [borderRadius]);

  const containerStyle = useMemo<React.CSSProperties>(
    () => ({
      position: "absolute",
      inset: unbounded ? "-9999% -9999%" : 0,
      overflow: unbounded ? "visible" : "hidden",
      borderRadius: unbounded ? undefined : borderRadius ?? "inherit",
      pointerEvents: "none",
    }),
    [unbounded, borderRadius]
  );

  const stateLayerStyle = useMemo<React.CSSProperties>(
    () => ({
      position: "absolute",
      inset: 0,
      backgroundColor: color,
      opacity: 0,
      pointerEvents: "none",
    }),
    [color]
  );

  const RippleContainer = useMemo(
    () => (
      <span style={containerStyle} aria-hidden="true">
        <div ref={stateLayerRef} style={stateLayerStyle} />
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        />
      </span>
    ),
    [containerStyle, stateLayerStyle]
  );

  const rippleProps = useMemo(
    () => ({
      ref: setHostNode,
      onPointerDown,
      onPointerUp: endPress,
      onPointerLeave,
      onPointerEnter,
      onPointerCancel,
      onFocus,
      onBlur,
      onKeyDown,
      onKeyUp,
      style: { position: "relative" as const, overflow: unbounded ? "visible" : ("hidden" as const) },
    }),
    [setHostNode, onPointerDown, endPress, onPointerLeave, onPointerEnter, onPointerCancel, onFocus, onBlur, onKeyDown, onKeyUp, unbounded]
  );

  return { rippleProps, RippleContainer, hostRef };
}

export default useRipple;
