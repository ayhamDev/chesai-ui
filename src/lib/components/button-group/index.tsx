"use client";
import { clsx } from "clsx";
import React from "react";
import { useReducedMotion } from "framer-motion";

type ButtonShape = "full" | "minimal" | "sharp";
type ButtonGap = "none" | "xs" | "sm" | "md" | "lg";

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLFieldSetElement> {
  children: React.ReactNode;
  shape?: ButtonShape;
  gap?: ButtonGap;
  activeShape?: ButtonShape;
  /** Expand the pressed button by borrowing space from its immediate neighbors. */
  expressive?: boolean;
  /** Fraction of the pressed width requested from neighbors (clamped to 0–0.3). */
  expansion?: number;
}

const gapClasses: Record<ButtonGap, string> = {
  none: "gap-0",
  xs: "gap-px",
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-2",
};

const getButtonShapeClasses = (
  index: number,
  total: number,
  shape: ButtonShape,
  hasGap: boolean,
  isActive?: boolean,
  activeShape?: ButtonShape,
) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const isOnly = total === 1;

  if (shape === "sharp") return "!rounded-none";

  // If the button is active, apply a finite capsule rounding override
  if (isActive && activeShape) {
    if (activeShape === "full") return "!rounded-[30px]"; // Finite value to prevent animation overshoot
    if (activeShape === "minimal") return "!rounded-xl";
    if (activeShape === "sharp") return "!rounded-none";
  }

  if (isOnly) {
    if (shape === "full") return "!rounded-[30px]"; // Finite value
    if (shape === "minimal") return "!rounded-xl";
  }

  if (hasGap) {
    if (shape === "full") {
      if (isFirst) return "!rounded-s-[30px] !rounded-e-md";
      if (isLast) return "!rounded-s-md !rounded-e-[30px]";
      return "!rounded-md";
    }

    if (shape === "minimal") {
      if (isFirst) return "!rounded-s-xl !rounded-e-md";
      if (isLast) return "!rounded-s-md !rounded-e-xl";
      return "!rounded-md";
    }
  } else {
    // Seamless layout using finite radius values for smooth transitions
    if (shape === "full") {
      if (isFirst) return "!rounded-s-[30px] !rounded-e-none";
      if (isLast) return "!rounded-s-none !rounded-e-[30px]";
      return "!rounded-none";
    }

    if (shape === "minimal") {
      if (isFirst) return "!rounded-s-xl !rounded-e-none";
      if (isLast) return "!rounded-s-none !rounded-e-xl";
      return "!rounded-none";
    }
  }
  return "";
};

export const ButtonGroup = ({
  children,
  className,
  shape = "full",
  gap = "none",
  activeShape = "full",
  expressive = true,
  expansion = 0.15,
  onPointerDownCapture,
  onKeyDownCapture,
  onBlurCapture,
  ...props
}: ButtonGroupProps) => {
  const groupRef = React.useRef<HTMLFieldSetElement>(null);
  const reducedMotion = useReducedMotion();
  const releaseRef = React.useRef<(() => void) | null>(null);
  const resetRef = React.useRef<(() => void) | null>(null);
  React.useEffect(() => {
    const release = () => releaseRef.current?.();
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('blur', release);
    window.addEventListener('resize', release);
    const keyup = (event: KeyboardEvent) => { if (event.key === ' ' || event.key === 'Enter') release(); };
    window.addEventListener('keyup', keyup);
    return () => {
      resetRef.current?.();
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      window.removeEventListener('blur', release);
      window.removeEventListener('resize', release);
      window.removeEventListener('keyup', keyup);
    };
  }, []);
  const press = (target: EventTarget | null) => {
    if (!expressive || reducedMotion || releaseRef.current || !(target instanceof Element)) return;
    const elements = Array.from(groupRef.current?.children ?? []).filter((el): el is HTMLElement => el instanceof HTMLElement);
    const index = elements.findIndex(el => el.contains(target));
    if (index < 0 || target.closest(':disabled, [aria-disabled="true"]') || elements.length < 2) return;
    resetRef.current?.();
    const widths = elements.map(el => el.offsetWidth);
    const neighbors = [index - 1, index + 1].filter(i => i >= 0 && i < elements.length);
    const amount = widths[index] * (Number.isFinite(expansion) ? Math.min(0.3, Math.max(0, expansion)) : 0.15);
    const targets = [...widths];
    for (const i of neighbors) {
      const borrowed = Math.min(amount / neighbors.length, widths[i] * 0.2);
      targets[i] -= borrowed; targets[index] += borrowed;
    }
    const originals = elements.map(el => ({ width: el.style.width, minWidth: el.style.minWidth, flex: el.style.flex }));
    const animations: Animation[] = [];
    let reset = false;
    const restore = () => {
      if (reset) return;
      reset = true;
      animations.forEach(animation => animation.cancel());
      elements.forEach((el, i) => Object.assign(el.style, originals[i]));
      releaseRef.current = null;
      resetRef.current = null;
    };
    resetRef.current = restore;
    const move = (to: number[], duration: number) => elements.map((el, i) => {
      const from = el.offsetWidth;
      el.style.flex = '0 0 auto'; el.style.minWidth = '0'; el.style.width = `${to[i]}px`;
      if (!el.animate) return Promise.resolve();
      const animation = el.animate([{ width: `${from}px` }, { width: `${to[i]}px` }], { duration, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
      animations.push(animation);
      return animation.finished.catch(() => {});
    });
    move(targets, 180);
    releaseRef.current = () => {
      releaseRef.current = null;
      Promise.all(move(widths, 240)).then(restore);
    };
  };
  const childArray = React.Children.toArray(children).filter(
    React.isValidElement,
  );
  const hasGap = gap !== "none";

  return (
    <fieldset
      ref={groupRef}
      className={clsx(
        "inline-flex items-center border-none p-0 m-0",
        gapClasses[gap],
        className,
      )}
      {...props}
      onPointerDownCapture={event => { onPointerDownCapture?.(event); if (!event.defaultPrevented && event.button === 0) press(event.target); }}
      onKeyDownCapture={event => { onKeyDownCapture?.(event); if (!event.defaultPrevented && !event.repeat && (event.key === ' ' || event.key === 'Enter')) press(event.target); }}
      onBlurCapture={event => { onBlurCapture?.(event); releaseRef.current?.(); }}
    >
      {childArray.map((child, index) => {
        const isFirst = index === 0;
        const childProps = (child as React.ReactElement<any>).props;
        const isActive = childProps.isActive;

        const shapeClass = getButtonShapeClasses(
          index,
          childArray.length,
          shape,
          hasGap,
          isActive,
          activeShape,
        );

        const newClassName = clsx(
          childProps.className,
          shapeClass,
          !isFirst && !hasGap && "-ms-px",
          "focus:z-10",
          expressive && "active:!scale-100",
        );

        // We override the button's internal shape prop to 'sharp' (rounded-none)
        // to prevent base 'rounded-full' (9999px) from conflicting with smooth CSS transitions.
        return React.cloneElement(child as React.ReactElement<any>, {
          className: newClassName,
          shape: "sharp",
        });
      })}
    </fieldset>
  );
};

ButtonGroup.displayName = "ButtonGroup";
